import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { z } from "zod";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createGroq } from "@ai-sdk/groq";
import { createMistral } from "@ai-sdk/mistral";
import { rateLimit, handleApiError, getClientIp } from "@/lib/api-utils";

const COMPLETION_SYSTEM_PROMPT =
    "You are an inline code completion engine. Given the code context below, provide ONLY the next few tokens/lines that naturally continue the code. Do NOT include explanations, markdown, or the existing code. Output ONLY the completion text.";

const RequestBodySchema = z.object({
    prompt: z.string().max(50_000),
    language: z.string().max(50).optional(),
    provider: z.enum(["gemini", "groq", "mistral"]).optional().default("gemini"),
    userApiKey: z.string().max(256).optional(),
});

export async function POST(request: NextRequest) {
    try {
        // Rate limiting: 60 requests per minute per IP (autocomplete fires rapidly)
        const ip = getClientIp(request);
        const { allowed, remaining } = rateLimit(`completion:${ip}`, 60, 60_000);

        if (!allowed) {
            return NextResponse.json(
                { success: false, error: "Rate limit exceeded" },
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

        const { prompt, language, provider, userApiKey } = result.data;

        const contextPrompt = language
            ? `Language: ${language}\n\n${prompt}`
            : prompt;

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
            model = groq("llama-3.3-70b-versatile");
        } else if (provider === "mistral") {
            const apiKey = userApiKey || process.env.MISTRAL_API_KEY;
            if (!apiKey) {
                return NextResponse.json(
                    { success: false, error: "Mistral API key not configured. Add your key in AI settings." },
                    { status: 400 }
                );
            }
            const mistral = createMistral({ apiKey });
            model = mistral("codestral-latest");
        } else {
            return NextResponse.json(
                { success: false, error: "Invalid provider" },
                { status: 400 }
            );
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
    } catch (error: unknown) {
        return handleApiError(error, "POST /api/completion");
    }
}
