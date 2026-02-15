import { NextRequest } from "next/server";

const GEMINI_ENDPOINT =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";
const MISTRAL_ENDPOINT = "https://api.mistral.ai/v1/chat/completions";

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

const TOOLS_OPENAI = [
    {
        type: "function" as const,
        function: {
            name: "read_file",
            description:
                "Read the contents of a file in the project. Use this to understand existing code before making changes.",
            parameters: {
                type: "object",
                properties: {
                    path: {
                        type: "string",
                        description:
                            'The file path relative to the project root, e.g. "src/App.tsx" or "package.json"',
                    },
                },
                required: ["path"],
            },
        },
    },
    {
        type: "function" as const,
        function: {
            name: "edit_file",
            description:
                "Replace the entire content of a file. Provide the COMPLETE new file content.",
            parameters: {
                type: "object",
                properties: {
                    path: {
                        type: "string",
                        description: "The file path relative to the project root",
                    },
                    content: {
                        type: "string",
                        description: "The complete new file content",
                    },
                },
                required: ["path", "content"],
            },
        },
    },
];

const TOOLS_GEMINI = [
    {
        function_declarations: [
            {
                name: "read_file",
                description:
                    "Read the contents of a file in the project. Use this to understand existing code before making changes.",
                parameters: {
                    type: "OBJECT",
                    properties: {
                        path: {
                            type: "STRING",
                            description:
                                'The file path relative to the project root, e.g. "src/App.tsx"',
                        },
                    },
                    required: ["path"],
                },
            },
            {
                name: "edit_file",
                description:
                    "Replace the entire content of a file. Provide the COMPLETE new file content.",
                parameters: {
                    type: "OBJECT",
                    properties: {
                        path: {
                            type: "STRING",
                            description: "The file path relative to the project root",
                        },
                        content: {
                            type: "STRING",
                            description: "The complete new file content",
                        },
                    },
                    required: ["path", "content"],
                },
            },
        ],
    },
];

interface ChatMessage {
    role: "user" | "assistant" | "system" | "tool";
    content: string;
    tool_call_id?: string;
    tool_calls?: any[];
}

function sseEvent(data: object): string {
    return `data: ${JSON.stringify(data)}\n\n`;
}

// --- Gemini Chat ---
async function callGeminiChat(
    apiKey: string,
    messages: ChatMessage[],
    fileTree?: string
) {
    const contents: any[] = [];

    for (const msg of messages) {
        if (msg.role === "system") continue;
        if (msg.role === "user") {
            contents.push({ role: "user", parts: [{ text: msg.content }] });
        } else if (msg.role === "assistant") {
            if (msg.tool_calls && msg.tool_calls.length > 0) {
                const parts = msg.tool_calls.map((tc: any) => ({
                    functionCall: {
                        name: tc.function.name,
                        args:
                            typeof tc.function.arguments === "string"
                                ? JSON.parse(tc.function.arguments)
                                : tc.function.arguments,
                    },
                }));
                contents.push({ role: "model", parts });
            } else {
                contents.push({ role: "model", parts: [{ text: msg.content }] });
            }
        } else if (msg.role === "tool") {
            contents.push({
                role: "user",
                parts: [
                    {
                        functionResponse: {
                            name: "tool_response",
                            response: { result: msg.content },
                        },
                    },
                ],
            });
        }
    }

    const systemInstruction = fileTree
        ? `${SYSTEM_PROMPT}\n\nProject file tree:\n${fileTree}`
        : SYSTEM_PROMPT;

    const res = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            system_instruction: { parts: [{ text: systemInstruction }] },
            contents,
            tools: TOOLS_GEMINI,
            generationConfig: { temperature: 0.3, maxOutputTokens: 8192 },
        }),
    });

    if (!res.ok) {
        const err = await res.text();
        throw new Error(`Gemini API error: ${res.status} - ${err}`);
    }

    const data = await res.json();
    const candidate = data?.candidates?.[0];
    if (!candidate) throw new Error("No response from Gemini");

    const parts = candidate.content?.parts || [];
    const functionCalls = parts.filter((p: any) => p.functionCall);

    if (functionCalls.length > 0) {
        return {
            type: "tool_calls" as const,
            tool_calls: functionCalls.map((p: any, i: number) => ({
                id: `call_${Date.now()}_${i}`,
                function: {
                    name: p.functionCall.name,
                    arguments: JSON.stringify(p.functionCall.args),
                },
            })),
        };
    }

    const text = parts
        .filter((p: any) => p.text)
        .map((p: any) => p.text)
        .join("");
    return { type: "text" as const, content: text };
}

// --- OpenAI-compatible Chat (Groq, Mistral) ---
async function callOpenAIChat(
    endpoint: string,
    apiKey: string,
    model: string,
    messages: ChatMessage[],
    fileTree?: string
) {
    const systemMsg = fileTree
        ? `${SYSTEM_PROMPT}\n\nProject file tree:\n${fileTree}`
        : SYSTEM_PROMPT;

    const apiMessages = [
        { role: "system", content: systemMsg },
        ...messages.map((m) => {
            if (m.role === "tool") {
                return {
                    role: "tool" as const,
                    content: m.content,
                    tool_call_id: m.tool_call_id,
                };
            }
            if (m.role === "assistant" && m.tool_calls) {
                return {
                    role: "assistant" as const,
                    content: m.content || null,
                    tool_calls: m.tool_calls,
                };
            }
            return { role: m.role, content: m.content };
        }),
    ];

    let res: Response | null = null;
    const maxRetries = 3;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        res = await fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model,
                messages: apiMessages,
                tools: TOOLS_OPENAI,
                tool_choice: "auto",
                parallel_tool_calls: false,
                temperature: 0.3,
                max_tokens: 4096,
            }),
        });

        if (res.status === 429 && attempt < maxRetries - 1) {
            const retryAfter = parseFloat(res.headers.get("retry-after") || "5");
            const waitMs = Math.ceil((isNaN(retryAfter) ? 5 : retryAfter) * 1000);
            await new Promise((r) => setTimeout(r, waitMs));
            continue;
        }
        break;
    }

    if (!res || !res.ok) {
        const err = res ? await res.text() : "No response";
        throw new Error(`${model} API error: ${res?.status} - ${err}`);
    }

    const data = await res.json();
    const choice = data?.choices?.[0];
    if (!choice) throw new Error("No response");

    if (choice.message?.tool_calls && choice.message.tool_calls.length > 0) {
        return {
            type: "tool_calls" as const,
            tool_calls: choice.message.tool_calls.map((tc: any) => ({
                id: tc.id,
                function: {
                    name: tc.function.name,
                    arguments: tc.function.arguments,
                },
            })),
        };
    }

    return { type: "text" as const, content: choice.message?.content || "" };
}

// --- Provider config ---
function getProviderConfig(provider: string) {
    switch (provider) {
        case "groq":
            return {
                endpoint: GROQ_ENDPOINT,
                model: "openai/gpt-oss-120b",
                envKey: "GROQ_API_KEY",
                label: "Groq",
            };
        case "mistral":
            return {
                endpoint: MISTRAL_ENDPOINT,
                model: "mistral-small-latest",
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
        const { messages, provider, fileTree, userApiKey } = await request.json();

        if (!messages || !Array.isArray(messages)) {
            return new Response(
                JSON.stringify({ error: "messages array is required" }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        const selectedProvider = provider || "gemini";
        const config = getProviderConfig(selectedProvider);
        let apiKey: string;

        if (selectedProvider === "gemini") {
            apiKey = userApiKey || process.env.GEMINI_API_KEY || "";
        } else {
            apiKey = userApiKey || process.env[config.envKey] || "";
        }

        if (!apiKey) {
            return new Response(
                JSON.stringify({
                    error: `${config.label} API key not configured. Add your key in AI settings.`,
                }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        const stream = new ReadableStream({
            async start(controller) {
                try {
                    let result;

                    if (selectedProvider === "gemini") {
                        result = await callGeminiChat(apiKey, messages, fileTree);
                    } else {
                        result = await callOpenAIChat(
                            config.endpoint,
                            apiKey,
                            config.model,
                            messages,
                            fileTree
                        );
                    }

                    if (result.type === "tool_calls") {
                        for (const tc of result.tool_calls) {
                            const args =
                                typeof tc.function.arguments === "string"
                                    ? JSON.parse(tc.function.arguments)
                                    : tc.function.arguments;

                            controller.enqueue(
                                new TextEncoder().encode(
                                    sseEvent({
                                        type: "tool_call",
                                        tool_call: {
                                            id: tc.id,
                                            name: tc.function.name,
                                            arguments: args,
                                        },
                                    })
                                )
                            );
                        }
                    } else {
                        controller.enqueue(
                            new TextEncoder().encode(
                                sseEvent({ type: "text", content: result.content })
                            )
                        );
                    }

                    controller.enqueue(
                        new TextEncoder().encode(sseEvent({ type: "done" }))
                    );
                    controller.close();
                } catch (error: any) {
                    controller.enqueue(
                        new TextEncoder().encode(
                            sseEvent({ type: "error", content: error.message })
                        )
                    );
                    controller.close();
                }
            },
        });

        return new Response(stream, {
            headers: {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
                Connection: "keep-alive",
            },
        });
    } catch (error: any) {
        console.error("Chat API error:", error);
        return new Response(
            JSON.stringify({ error: error.message || "Internal server error" }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
}
