import { streamText, convertToModelMessages, type UIMessage } from "ai";
import { z } from "zod";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createGroq } from "@ai-sdk/groq";
import { createMistral } from "@ai-sdk/mistral";
import { NextRequest, NextResponse } from "next/server";
import { rateLimit, handleApiError, getClientIp } from "@/lib/api-utils";
import { auth } from "@/auth";
import { tools } from "./tools";

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

//Size Limits Configuration
const SIZE_LIMITS = {
  MAX_MESSAGE_CONTENT: 100_000,
  MAX_PART_TEXT: 50_000,   
  MAX_TOTAL_PAYLOAD: 1_000_000,
  MAX_MESSAGE_COUNT: 100,
};

//Zod Schemas for Validation
const MessagePartSchema = z.object({
  type: z.string().max(20),
  text: z.string().max(SIZE_LIMITS.MAX_PART_TEXT)
    .refine(text => text.trim().length > 0, "Part text cannot be empty"),
}).strict();

const MessageSchema = z.object({
  role: z.enum(["system", "user", "assistant", "data", "tool"]),
  content: z.string().max(SIZE_LIMITS.MAX_MESSAGE_CONTENT).optional(),
  parts: z.array(MessagePartSchema).optional(),
}).refine(
  msg => msg.content || (msg.parts && msg.parts.length > 0),
  "Message must have either content or parts"
);

const RequestBodySchema = z.object({
  messages: z.array(MessageSchema).max(SIZE_LIMITS.MAX_MESSAGE_COUNT),
  provider: z.enum(["gemini", "groq", "mistral"]).optional().default("gemini"),
  fileTree: z.string().max(50_000).optional(),
  userApiKey: z.string().max(256).optional(),
}).refine(
  body => {
    // Calculate total payload size to prevent DoS attacks
    const totalSize = JSON.stringify(body).length;
    return totalSize <= SIZE_LIMITS.MAX_TOTAL_PAYLOAD;
  },
  { message: `Total payload exceeds maximum allowed size (${SIZE_LIMITS.MAX_TOTAL_PAYLOAD} bytes)` }
);

/**
 * HTTP POST handler for the AI chat endpoint. Validates request body,
 * enforces rate limits, selects model provider, and streams model output.
 */
export async function POST(request: NextRequest) {
    try {        

        const session = await auth();
        const isAuthenticated = !!session?.user;
        
        // Rate limiting: 20 requests per minute per user (if logged in) or per IP
        const ip = getClientIp(request);
        const identifier = session?.user?.id ? `chat_user:${session.user.id}` : `chat_ip:${ip}`;
        const { allowed, remaining } = await rateLimit(identifier, 20, 60_000);

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

        // Fail fast before parsing JSON to prevent DoS attacks
        const contentLength = request.headers.get("content-length");
        if (contentLength) {
            const length = parseInt(contentLength, 10);
            if (length > SIZE_LIMITS.MAX_TOTAL_PAYLOAD) {
                return NextResponse.json(
                    { 
                        success: false, 
                        error: `Request payload exceeds maximum size (${SIZE_LIMITS.MAX_TOTAL_PAYLOAD} bytes)` 
                    },
                    { status: 413 }
                );
            }
        }

        const session = await auth();
        const isAuthenticated = !!session?.user;
        
        // Parse and validate request body
        let body: unknown;
        try {
            body = await request.json();
        } catch (error) {
            return NextResponse.json(
                { success: false, error: "Invalid JSON in request body" },
                { status: 400 }
            );
        }

        const result = RequestBodySchema.safeParse(body);

        if (!result.success) {
            // Check if validation error is about total payload size
            const isSizeError = result.error.issues.some(issue => 
                issue.message.includes("Total payload exceeds")
            );
            
            const statusCode = isSizeError ? 413 : 400;
            return NextResponse.json(
                { success: false, error: "Invalid request", details: result.error.issues },
                { status: statusCode }
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

        // Transform validated messages into UIMessage format
        const sanitizedMessages = messages.map((msg) => ({
            role: msg.role,
            parts: msg.parts || (msg.content ? [{ type: "text" as const, text: msg.content }] : []),
        })) as Omit<UIMessage, 'id'>[];

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

// Export schemas for testing and external validation
export const schemas = {
    MessagePartSchema,
    MessageSchema,
    RequestBodySchema,
};
