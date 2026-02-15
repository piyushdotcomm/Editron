import { NextRequest, NextResponse } from "next/server";

const GEMINI_ENDPOINT =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";
const MISTRAL_ENDPOINT = "https://api.mistral.ai/v1/chat/completions";

const COMPLETION_SYSTEM_PROMPT =
    "You are an inline code completion engine. Given the code context below, provide ONLY the next few tokens/lines that naturally continue the code. Do NOT include explanations, markdown, or the existing code. Output ONLY the completion text.";

async function callGemini(apiKey: string, prompt: string): Promise<string> {
    const res = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            contents: [
                {
                    parts: [{ text: `${COMPLETION_SYSTEM_PROMPT}\n\n${prompt}` }],
                },
            ],
            generationConfig: {
                temperature: 0.2,
                maxOutputTokens: 256,
                topP: 0.8,
            },
        }),
    });

    if (!res.ok) {
        const err = await res.text();
        throw new Error(`Gemini API error: ${res.status} — ${err}`);
    }

    const data = await res.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
}

async function callOpenAICompatible(
    endpoint: string,
    apiKey: string,
    model: string,
    prompt: string
): Promise<string> {
    const res = await fetch(endpoint, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model,
            messages: [
                { role: "system", content: COMPLETION_SYSTEM_PROMPT },
                { role: "user", content: prompt },
            ],
            temperature: 0.2,
            max_tokens: 256,
        }),
    });

    if (!res.ok) {
        const err = await res.text();
        throw new Error(`API error: ${res.status} — ${err}`);
    }

    const data = await res.json();
    return data?.choices?.[0]?.message?.content?.trim() || "";
}

function getProviderConfig(provider: string) {
    switch (provider) {
        case "groq":
            return {
                endpoint: GROQ_ENDPOINT,
                model: "llama-3.3-70b-versatile",
                envKey: "GROQ_API_KEY",
                label: "Groq",
            };
        case "mistral":
            return {
                endpoint: MISTRAL_ENDPOINT,
                model: "codestral-latest",
                envKey: "MISTRAL_API_KEY",
                label: "Mistral",
            };
        default:
            return {
                endpoint: "",
                model: "",
                envKey: "GEMINI_API_KEY",
                label: "Gemini",
            };
    }
}

export async function POST(request: NextRequest) {
    try {
        const { prompt, language, provider, userApiKey } = await request.json();

        if (!prompt) {
            return NextResponse.json({ error: "prompt is required" }, { status: 400 });
        }

        const selectedProvider = provider || "gemini";
        const contextPrompt = language
            ? `Language: ${language}\n\n${prompt}`
            : prompt;

        let completion = "";

        if (selectedProvider === "gemini") {
            const key = userApiKey || process.env.GEMINI_API_KEY;
            if (!key) {
                return NextResponse.json(
                    { error: "Gemini API key not configured. Add your key in AI settings." },
                    { status: 400 }
                );
            }
            completion = await callGemini(key, contextPrompt);
        } else {
            const config = getProviderConfig(selectedProvider);
            const key = userApiKey || process.env[config.envKey];
            if (!key) {
                return NextResponse.json(
                    { error: `${config.label} API key not configured. Add your key in AI settings.` },
                    { status: 400 }
                );
            }
            completion = await callOpenAICompatible(
                config.endpoint,
                key,
                config.model,
                contextPrompt
            );
        }

        return NextResponse.json({ completion });
    } catch (error: any) {
        console.error("Completion API error:", error);
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}
