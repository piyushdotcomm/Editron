import { streamText } from "ai";
import { z } from "zod";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createGroq } from "@ai-sdk/groq";
import { createMistral } from "@ai-sdk/mistral";
import { NextRequest, NextResponse } from "next/server";
import { rateLimit, handleApiError, getClientIp } from "@/lib/api-utils";
import { auth } from "@/auth";

const README_SYSTEM_PROMPT = `You are a technical writer specializing in open-source README files.
Your only task is to generate a complete, professional README.md in valid GitHub Flavored Markdown.

RULES:
- Output ONLY raw Markdown. No code fences, no triple backticks wrapping the whole output.
- Do not include any preamble or explanation before the content.
- Derive the project name from package.json "name" if provided, otherwise infer from the file tree.
- If a template is specified, follow its structure exactly.
- For the "folder structure" section, use the provided file tree and render it as a Markdown code block.
- Only include sections that make sense for the detected project. Omit sections that would be pure filler.
- Keep language concise, specific, and developer-facing.`;

const RequestBodySchema = z.object({
    fileTree: z.string().max(20_000),
    packageJson: z.string().max(10_000).optional(),
    template: z.enum(["minimal", "standard", "professional", "open-source"]).default("standard"),
    provider: z.enum(["gemini", "groq", "mistral"]).optional().default("gemini"),
    userApiKey: z.string().max(256).optional(),
});

/**
 * POST /api/readme
 * Accepts a serialized file tree and optional package.json content,
 * then streams a generated README.md back to the client.
 */
export async function POST(request: NextRequest) {
    try {
        const ip = getClientIp(request);
        // Stricter limit than chat: README generation is more expensive.
        const { allowed, remaining } = await rateLimit(ip, 5, 60_000);

        if (!allowed) {
            return NextResponse.json(
                { success: false, error: "Rate limit exceeded. Please wait before generating again." },
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

        const { fileTree, packageJson, template, provider, userApiKey } = result.data;

        if (!session?.user?.id && (!userApiKey || userApiKey.trim() === "")) {
            return NextResponse.json(
                { success: false, error: "Unauthorized: Please log in or provide your own API key in settings." },
                { status: 401 }
            );
        }

        const templateInstructions: Record<string, string> = {
            minimal: "Use a minimal structure: Title, Description, Installation, Usage.",
            standard: "Use a standard structure: Title, Description, Features, Installation, Usage, Tech Stack, Folder Structure, License.",
            professional: "Use a professional structure: Badges, Title, Description, Demo, Features, Installation, Environment Variables, Usage, Tech Stack, Folder Structure, Contributing, License.",
            "open-source": "Use an open-source structure: Title, Description, Features, Installation, Usage, Tech Stack, Folder Structure, Contributing, Code of Conduct, License.",
        };

        const contextParts = [
            `File tree:\n${fileTree}`,
            packageJson ? `package.json contents:\n${packageJson}` : null,
            `README template style: ${template}. ${templateInstructions[template]}`,
        ].filter(Boolean).join("\n\n---\n\n");

        let model;

        if (provider === "gemini") {
            const apiKey = userApiKey || (isAuthenticated ? process.env.GEMINI_API_KEY : undefined);
            if (!apiKey) {
                return NextResponse.json(
                    { success: false, error: isAuthenticated ? "Gemini API key not configured." : "Unauthorized" },
                    { status: isAuthenticated ? 400 : 401 }
                );
            }
            const google = createGoogleGenerativeAI({ apiKey });
            model = google("gemini-2.0-flash");
        } else if (provider === "groq") {
            const apiKey = userApiKey || (isAuthenticated ? process.env.GROQ_API_KEY : undefined);
            if (!apiKey) {
                return NextResponse.json(
                    { success: false, error: isAuthenticated ? "Groq API key not configured." : "Unauthorized" },
                    { status: isAuthenticated ? 400 : 401 }
                );
            }
            const groq = createGroq({ apiKey });
            model = groq("llama-3.1-70b-versatile");
        } else {
            const apiKey = userApiKey || (isAuthenticated ? process.env.MISTRAL_API_KEY : undefined);
            if (!apiKey) {
                return NextResponse.json(
                    { success: false, error: isAuthenticated ? "Mistral API key not configured." : "Unauthorized" },
                    { status: isAuthenticated ? 400 : 401 }
                );
            }
            const mistral = createMistral({ apiKey });
            model = mistral("mistral-small-latest");
        }

        const resultStream = streamText({
            model,
            system: README_SYSTEM_PROMPT,
            prompt: contextParts,
        });

        return resultStream.toTextStreamResponse();
    } catch (error: unknown) {
        return handleApiError(error, "POST /api/readme");
    }
}
