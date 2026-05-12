import { streamText, tool as createTool, convertToModelMessages, jsonSchema } from "ai";
import { z } from "zod";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createGroq } from "@ai-sdk/groq";
import { createMistral } from "@ai-sdk/mistral";
import { NextRequest, NextResponse } from "next/server";
import { rateLimit, handleApiError, getClientIp } from "@/lib/api-utils";

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



const tools = {
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
            content: z.string().describe("The complete new file content"),
        }),
    }),
    edit_multiple_files: createTool({
        description: "Create or replace the content of MULTIPLE files at once.",
        inputSchema: z.object({
            changes: z.array(z.object({
                path: z.string().describe("The file path relative to the project root"),
                content: z.string().describe("The complete new file content"),
            })).describe("An array of file modifications to execute as a batch"),
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

        const body = await request.json();
        const result = RequestBodySchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                { success: false, error: "Invalid request", details: result.error.issues },
                { status: 400 }
            );
        }

        const { messages, provider, fileTree, userApiKey } = result.data;

        const systemInstruction = fileTree
            ? `${SYSTEM_PROMPT}\n\nProject file tree:\n${fileTree}`
            : SYSTEM_PROMPT;

        let model;

        if (provider === "gemini") {
            const apiKey = userApiKey || process.env.GEMINI_API_KEY;
            if (!apiKey) {
                return NextResponse.json(
                    { success: false, error: "Gemini API key not configured. Add your key in AI settings." },
                    { status: 400 }
                );
            }
            const google = createGoogleGenerativeAI({ apiKey });
            model = google("gemini-2.0-flash");
        } else if (provider === "groq") {
            const apiKey = userApiKey || process.env.GROQ_API_KEY;
            if (!apiKey) {
                return NextResponse.json(
                    { success: false, error: "Groq API key not configured. Add your key in AI settings." },
                    { status: 400 }
                );
            }
            const groq = createGroq({ apiKey });
            model = groq("llama-3.1-70b-versatile");
        } else if (provider === "mistral") {
            const apiKey = userApiKey || process.env.MISTRAL_API_KEY;
            if (!apiKey) {
                return NextResponse.json(
                    { success: false, error: "Mistral API key not configured. Add your key in AI settings." },
                    { status: 400 }
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

        const sanitizedMessages = messages.map((msg: { role: "system" | "user" | "assistant"; content?: string; parts: any[] }) => {
            if (msg.parts) return msg;
            return {
                ...msg,
                parts: typeof msg.content === "string" && msg.content 
                    ? [{ type: "text", text: msg.content }] 
                    : []
            };
        });

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
