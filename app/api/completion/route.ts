import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { z } from "zod";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createGroq } from "@ai-sdk/groq";
import { createMistral } from "@ai-sdk/mistral";

const COMPLETION_SYSTEM_PROMPT =
    "You are an inline code completion engine. Given the code context below, provide ONLY the next few tokens/lines that naturally continue the code. Do NOT include explanations, markdown, or the existing code. Output ONLY the completion text.";

const RequestBodySchema = z.object({
    prompt: z.string(),
    language: z.string().optional(),
    provider: z.enum(["gemini", "groq", "mistral"]).optional().default("gemini"),
    userApiKey: z.string().optional(),
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const result = RequestBodySchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json({ error: result.error.issues }, { status: 400 });
        }

        const { prompt, language, provider, userApiKey } = result.data;

        const contextPrompt = language
            ? `Language: ${language}\n\n${prompt}`
            : prompt;

        let model;

        if (provider === "gemini") {
            const apiKey = userApiKey || process.env.GEMINI_API_KEY;
            if (!apiKey) {
                return NextResponse.json(
                    { error: "Gemini API key not configured. Add your key in AI settings." },
                    { status: 400 }
                );
            }
            const google = createGoogleGenerativeAI({ apiKey });
            model = google("gemini-2.0-flash");
        } else if (provider === "groq") {
            const apiKey = userApiKey || process.env.GROQ_API_KEY;
            if (!apiKey) {
                return NextResponse.json(
                    { error: "Groq API key not configured. Add your key in AI settings." },
                    { status: 400 }
                );
            }
            const groq = createGroq({ apiKey });
            model = groq("llama-3.3-70b-versatile");
        } else if (provider === "mistral") {
            const apiKey = userApiKey || process.env.MISTRAL_API_KEY;
            if (!apiKey) {
                return NextResponse.json(
                    { error: "Mistral API key not configured. Add your key in AI settings." },
                    { status: 400 }
                );
            }
            const mistral = createMistral({ apiKey });
            model = mistral("codestral-latest");
        } else {
            return NextResponse.json({ error: "Invalid provider" }, { status: 400 });
        }

        const { text } = await generateText({
            model,
            system: COMPLETION_SYSTEM_PROMPT,
            prompt: contextPrompt,
            maxTokens: 256,
            temperature: 0.2,
            topP: 0.8,
        });

        return NextResponse.json({ completion: text.trim() });
    } catch (error: any) {
        console.error("Completion API error:", error);
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}
