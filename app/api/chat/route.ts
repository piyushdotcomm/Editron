import { streamText, tool as createTool } from "ai";
import { z } from "zod";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createGroq } from "@ai-sdk/groq";
import { createMistral } from "@ai-sdk/mistral";
import { NextRequest } from "next/server";

const SYSTEM_PROMPT = `You are an expert coding assistant embedded in a code editor called Editron.

CRITICAL RULES - follow these strictly:
1. You MUST use the edit_file tool to create or modify files. NEVER just describe code changes in text - actually call the tool.
2. Before editing, use read_file to understand the current file contents.
3. When using edit_file, provide the COMPLETE file content - no partial snippets, no placeholders.
4. After making changes, briefly explain what you did in 1-2 sentences.

WORKFLOW for every request that involves code:
1. Call read_file to see the current state
2. Call edit_file with the complete new file content
3. Explain what changed

If the user asks you to create a new file, call edit_file with the full content immediately. Do NOT tell the user what code to write - write it yourself using the tool.`;

const tools = {
    read_file: createTool({
        description: "Read the contents of a file in the project. Use this to understand existing code before making changes.",
        parameters: z.object({
            path: z.string().describe("The file path relative to the project root, e.g. src/App.tsx or package.json"),
        }),
    }),
    edit_file: createTool({
        description: "Replace the entire content of a file. Provide the COMPLETE new file content.",
        parameters: z.object({
            path: z.string().describe("The file path relative to the project root"),
            content: z.string().describe("The complete new file content"),
        }),
    }),
    delete_file: createTool({
        description: "Delete a file from the project.",
        parameters: z.object({
            path: z.string().describe("The file path relative to the project root"),
        }),
    }),
};

const RequestBodySchema = z.object({
    messages: z.array(z.any()),
    provider: z.enum(["gemini", "groq", "mistral"]).optional().default("gemini"),
    fileTree: z.string().optional(),
    userApiKey: z.string().optional(),
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const result = RequestBodySchema.safeParse(body);

        if (!result.success) {
            return new Response(JSON.stringify({ error: result.error.issues }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        const { messages, provider, fileTree, userApiKey } = result.data;

        const systemInstruction = fileTree
            ? `${SYSTEM_PROMPT}\n\nProject file tree:\n${fileTree}`
            : SYSTEM_PROMPT;

        let model;

        if (provider === "gemini") {
            const apiKey = userApiKey || process.env.GEMINI_API_KEY;
            if (!apiKey) {
                return new Response(
                    JSON.stringify({ error: "Gemini API key not configured. Add your key in AI settings." }),
                    { status: 400, headers: { "Content-Type": "application/json" } }
                );
            }
            const google = createGoogleGenerativeAI({ apiKey });
            model = google("gemini-2.0-flash");
        } else if (provider === "groq") {
            const apiKey = userApiKey || process.env.GROQ_API_KEY;
            if (!apiKey) {
                return new Response(
                    JSON.stringify({ error: "Groq API key not configured. Add your key in AI settings." }),
                    { status: 400, headers: { "Content-Type": "application/json" } }
                );
            }
            const groq = createGroq({ apiKey });
            model = groq("llama-3.3-70b-versatile");
        } else if (provider === "mistral") {
            const apiKey = userApiKey || process.env.MISTRAL_API_KEY;
            if (!apiKey) {
                return new Response(
                    JSON.stringify({ error: "Mistral API key not configured. Add your key in AI settings." }),
                    { status: 400, headers: { "Content-Type": "application/json" } }
                );
            }
            const mistral = createMistral({ apiKey });
            model = mistral("mistral-small-latest");
        } else {
            return new Response(JSON.stringify({ error: "Invalid provider" }), { status: 400 });
        }

        const resultStream = streamText({
            model,
            messages,
            system: systemInstruction,
            tools,
            maxSteps: 10,
        });

        return resultStream.toDataStreamResponse();
    } catch (error: any) {
        console.error("Chat API error:", error);
        return new Response(
            JSON.stringify({ error: error.message || "Internal server error" }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
}
