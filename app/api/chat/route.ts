import { streamText, tool as createTool, convertToModelMessages, jsonSchema } from "ai";
import { z } from "zod";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createGroq } from "@ai-sdk/groq";
import { createMistral } from "@ai-sdk/mistral";
import { NextRequest, NextResponse } from "next/server";
import { rateLimit, handleApiError, getClientIp } from "@/lib/api-utils";
import { auth } from "@/auth";

const SYSTEM_PROMPT = `You are an expert coding assistant embedded in a code editor called Editron.

CRITICAL RULES - follow these strictly:
1. You MUST use the edit_file or edit_multiple_files tools to create or modify files. NEVER just describe code changes in text - actually call the tool.
2. Before editing existing code, use read_file to understand the current file contents.
3. When using edit_file or edit_multiple_files, provide the COMPLETE file content - no partial snippets, no placeholders.
4. After making changes, briefly explain what you did in 1-2 sentences.
5. If you need to scaffold, refactor, or build multiple files at once, ALWAYS use the edit_multiple_files tool to perform the changes in a single batch.

WORKFLOW for every request that involves code:
1. Call read_file to see the current state
2. Call edit_file or edit_multiple_files with the complete new file content
3. Explain what changed

If the user asks you to create a new file, call the edit tool with the full content immediately. Do NOT tell the user what code to write - write it yourself using the tool.`;



// DOS protection: limit prevents AI from hallucinating extremely large payloads
const MAX_FILE_CONTENT_CHARS = 100_000;
// Cap batch file changes to prevent aggregate payload attacks
const MAX_BATCH_CHANGES = 50;
// UTF-8 worst-case ~4 bytes per char
/**
 * Record a payload size violation for a user and emit structured warnings.
 * Prevents logging raw payloads; logs metadata only.
 * @param userId - user identifier or null for anonymous
 * @param tool - tool name where violation occurred
 * @param param - parameter name (e.g., 'content')
 * @param actualSize - observed payload size in characters/bytes
 * @param maxSize - configured maximum allowed size
 */
// Note: We intentionally do NOT track violations in-memory here to avoid
// introducing dead code or stateful behavior in the request handler.
// If needed, a telemetry/metrics service should be used instead.

/**
 * Tool definitions exposed to the AI model. Each tool includes a Zod
 * input schema to validate parameters at the system boundary.
 */
export const tools = {
    read_file: createTool({
        description: "Read the contents of a file in the project. Use this to understand existing code before making changes.",
        inputSchema: z.object({
            path: z.string().describe("The file path relative to the project root, e.g. src/App.tsx or package.json"),
        }),
    }),
    edit_file: createTool({
        description: "Replace the entire content of a single file. Provide the COMPLETE new file content.",
        inputSchema: z.object({
            path: z.string().describe("The file path relative to the project root"),
            // Prevent overly large content (character limit)
            content: z.string()
                .max(MAX_FILE_CONTENT_CHARS, { message: `content exceeds max characters (${MAX_FILE_CONTENT_CHARS})` }),
        }),
    }),
    edit_multiple_files: createTool({
        description: "Create or replace the content of MULTIPLE files at once.",
        inputSchema: z.object({
            changes: z.array(z.object({
                path: z.string().describe("The file path relative to the project root"),
                // Same protections for batch changes
                content: z.string()
                    .max(MAX_FILE_CONTENT_CHARS, { message: `content exceeds max characters (${MAX_FILE_CONTENT_CHARS})` }),
            })).max(MAX_BATCH_CHANGES, { message: `changes array exceeds max batch size (${MAX_BATCH_CHANGES})` }).describe("An array of file modifications to execute as a batch"),
        }),
    }),
    delete_file: createTool({
        description: "Delete a file from the project.",
        inputSchema: z.object({
            path: z.string().describe("The file path relative to the project root"),
        }),
    }),
};

const RequestBodySchema = z.object({
    messages: z.array(z.any()).max(100),
    provider: z.enum(["gemini", "groq", "mistral"]).optional().default("gemini"),
    fileTree: z.string().max(50_000).optional(),
    userApiKey: z.string().max(256).optional(),
});

/**
 * HTTP POST handler for the AI chat endpoint. Validates request body,
 * enforces rate limits, selects model provider, and streams model output.
 */
export async function POST(request: NextRequest) {
    try {        

        // Rate limiting: 20 requests per minute per IP
        const ip = getClientIp(request);
        const { allowed, remaining } = rateLimit(ip, 20, 60_000);

        if (!allowed) {
            return NextResponse.json(
                { success: false, error: "Rate limit exceeded. Please wait before sending more messages." },
                {
                    status: 429,
                    headers: {
                        "Retry-After": "60",
                        "X-RateLimit-Remaining": String(remaining),
                    },
                }
            );
        }

        const session = await auth();
        const isAuthenticated = !!session?.user;
        
        const body = await request.json();
        const result = RequestBodySchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                { success: false, error: "Invalid request", details: result.error.issues },
                { status: 400 }
            );
        }

        const { messages, provider, fileTree, userApiKey } = result.data;

        if (!session?.user?.id && (!userApiKey || userApiKey.trim() === "")) {
            return NextResponse.json(
                { success: false, error: "Unauthorized: Please log in or provide your own API key in settings." },
                { status: 401 }
            );
        }

        const systemInstruction = fileTree
            ? `${SYSTEM_PROMPT}\n\nProject file tree:\n${fileTree}`
            : SYSTEM_PROMPT;

        let model;

        if (provider === "gemini") {
            const apiKey = userApiKey || (isAuthenticated ? process.env.GEMINI_API_KEY : undefined);
            if (!apiKey) {
                return NextResponse.json(
                    { 
                        success: false, 
                        error: isAuthenticated
                            ? "Gemini API key not configured. Add your key in AI settings."
                            : "Unauthorized",
                    },
                    { status: isAuthenticated ? 400 : 401 }
                );
            }
            const google = createGoogleGenerativeAI({ apiKey });
            model = google("gemini-2.0-flash");
        } else if (provider === "groq") {
            const apiKey = userApiKey || (isAuthenticated ? process.env.GROQ_API_KEY : undefined);
            if (!apiKey) {
                return NextResponse.json(
                    { 
                        success: false, 
                        error: isAuthenticated 
                            ? "Groq API key not configured. Add your key in AI settings." 
                            : "Unauthorized" 
                    },
                    { status: isAuthenticated ? 400 : 401 }
                );
            }
            const groq = createGroq({ apiKey });
            model = groq("llama-3.1-70b-versatile");
        } else if (provider === "mistral") {
            const apiKey = userApiKey || (isAuthenticated ? process.env.MISTRAL_API_KEY : undefined);
            if (!apiKey) {
                return NextResponse.json(
                    { 
                        success: false, 
                        error: isAuthenticated
                            ? "Mistral API key not configured. Add your key in AI settings." 
                            : "Unauthorized"
                    },
                    { status: isAuthenticated ? 400 : 401 }
                );
            }
            const mistral = createMistral({ apiKey });
            model = mistral("mistral-small-latest");
        } else {
            return NextResponse.json(
                { success: false, error: "Invalid provider" },
                { status: 400 }
            );
        }

        type MessagePart = { type: string; text: string };
        type ChatMessage = { role: "system" | "user" | "assistant"; content?: string; parts?: MessagePart[] };

        const sanitizedMessages: ChatMessage[] = [];
        for (const raw of messages) {
            if (!raw || typeof raw !== "object") {
                return NextResponse.json(
                    { success: false, error: "Invalid request: each message must be an object" },
                    { status: 400 }
                );
            }
            const m = raw as ChatMessage;
            if (Array.isArray(m.parts)) {
                sanitizedMessages.push(m);
                continue;
            }
            sanitizedMessages.push({
                ...m,
                parts: typeof m.content === "string" && m.content.trim()
                    ? [{ type: "text", text: m.content }]
                    : [] as MessagePart[],
            });
        }

        const resultStream = streamText({
            model,
            messages: await convertToModelMessages(sanitizedMessages, {
                ignoreIncompleteToolCalls: true
            }),
            system: systemInstruction,
            tools,
        });

        return resultStream.toUIMessageStreamResponse();
    } catch (error: unknown) {
        return handleApiError(error, "POST /api/chat");
    }
}
