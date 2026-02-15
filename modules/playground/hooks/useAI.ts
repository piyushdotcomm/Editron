"use client";

import { create } from "zustand";

export type AIProvider = "gemini" | "groq" | "mistral";

export interface ChatMessage {
    id: string;
    role: "user" | "assistant" | "tool_activity";
    content: string;
    timestamp: number;
}

interface AIState {
    provider: AIProvider;
    isChatOpen: boolean;
    chatMessages: ChatMessage[];
    isGenerating: boolean;
    inlineSuggestionsEnabled: boolean;

    // User API keys (persisted to localStorage)
    userGeminiKey: string;
    userGroqKey: string;
    userMistralKey: string;

    // Actions
    setProvider: (provider: AIProvider) => void;
    toggleChat: () => void;
    openChat: () => void;
    closeChat: () => void;
    addMessage: (message: Omit<ChatMessage, "id" | "timestamp">) => void;
    clearChat: () => void;
    setIsGenerating: (val: boolean) => void;
    setUserApiKey: (provider: AIProvider, key: string) => void;
    getUserApiKey: (provider?: AIProvider) => string;
    toggleInlineSuggestions: () => void;
}

function loadUserKeys() {
    if (typeof window === "undefined") return { gemini: "", groq: "", mistral: "" };
    try {
        return {
            gemini: localStorage.getItem("editron_gemini_key") || "",
            groq: localStorage.getItem("editron_groq_key") || "",
            mistral: localStorage.getItem("editron_mistral_key") || "",
        };
    } catch {
        return { gemini: "", groq: "", mistral: "" };
    }
}

export const useAI = create<AIState>((set, get) => {
    const keys = loadUserKeys();
    const inlineEnabled = typeof window !== "undefined"
        ? localStorage.getItem("editron_inline_suggestions") !== "false"
        : true;

    return {
        provider: "gemini",
        isChatOpen: false,
        chatMessages: [],
        isGenerating: false,
        inlineSuggestionsEnabled: inlineEnabled,
        userGeminiKey: keys.gemini,
        userGroqKey: keys.groq,
        userMistralKey: keys.mistral,

        setProvider: (provider) => set({ provider }),
        toggleChat: () => set((s) => ({ isChatOpen: !s.isChatOpen })),
        openChat: () => set({ isChatOpen: true }),
        closeChat: () => set({ isChatOpen: false }),

        addMessage: (message) =>
            set((s) => ({
                chatMessages: [
                    ...s.chatMessages,
                    {
                        ...message,
                        id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
                        timestamp: Date.now(),
                    },
                ],
            })),

        clearChat: () => set({ chatMessages: [] }),
        setIsGenerating: (val) => set({ isGenerating: val }),

        toggleInlineSuggestions: () => {
            const next = !get().inlineSuggestionsEnabled;
            try { localStorage.setItem("editron_inline_suggestions", String(next)); } catch { }
            set({ inlineSuggestionsEnabled: next });
        },

        setUserApiKey: (provider, key) => {
            const storageKeys: Record<AIProvider, string> = {
                gemini: "editron_gemini_key",
                groq: "editron_groq_key",
                mistral: "editron_mistral_key",
            };
            try {
                localStorage.setItem(storageKeys[provider], key);
            } catch { }

            const stateKeys: Record<AIProvider, string> = {
                gemini: "userGeminiKey",
                groq: "userGroqKey",
                mistral: "userMistralKey",
            };
            set({ [stateKeys[provider]]: key } as any);
        },

        getUserApiKey: (provider) => {
            const p = provider || get().provider;
            if (p === "gemini") return get().userGeminiKey;
            if (p === "groq") return get().userGroqKey;
            return get().userMistralKey;
        },
    };
});

// --- Helpers ---
export function collectFilePaths(items: any[], prefix = ""): string[] {
    const paths: string[] = [];
    for (const item of items) {
        if ("folderName" in item) {
            const fp = prefix ? `${prefix}/${item.folderName}` : item.folderName;
            paths.push(fp + "/");
            paths.push(...collectFilePaths(item.items, fp));
        } else {
            const ext = item.fileExtension ? `.${item.fileExtension}` : "";
            paths.push(prefix ? `${prefix}/${item.filename}${ext}` : `${item.filename}${ext}`);
        }
    }
    return paths;
}

export function findFileByPath(items: any[], targetPath: string, prefix = ""): any | null {
    for (const item of items) {
        if ("folderName" in item) {
            const fp = prefix ? `${prefix}/${item.folderName}` : item.folderName;
            const found = findFileByPath(item.items, targetPath, fp);
            if (found) return found;
        } else {
            const ext = item.fileExtension ? `.${item.fileExtension}` : "";
            const filePath = prefix ? `${prefix}/${item.filename}${ext}` : `${item.filename}${ext}`;
            if (filePath === targetPath) return item;
        }
    }
    return null;
}

export function updateFileByPath(items: any[], targetPath: string, newContent: string, prefix = ""): any[] {
    return items.map((item) => {
        if ("folderName" in item) {
            const fp = prefix ? `${prefix}/${item.folderName}` : item.folderName;
            return { ...item, items: updateFileByPath(item.items, targetPath, newContent, fp) };
        } else {
            const ext = item.fileExtension ? `.${item.fileExtension}` : "";
            const filePath = prefix ? `${prefix}/${item.filename}${ext}` : `${item.filename}${ext}`;
            if (filePath === targetPath) return { ...item, content: newContent };
            return item;
        }
    });
}

// --- Agentic loop ---
export async function runAgenticChat(
    userMessage: string,
    templateData: any,
    provider: AIProvider,
    userApiKey: string,
    onText: (text: string) => void,
    onToolActivity: (activity: string) => void,
    onFileEdit: (path: string, content: string) => void,
    existingMessages: { role: string; content: string }[] = []
) {
    const fileTree = templateData
        ? collectFilePaths(templateData.items).join("\n")
        : "";

    const apiMessages: any[] = [
        ...existingMessages
            .filter((m) => m.role === "user" || m.role === "assistant")
            .map((m) => ({ role: m.role, content: m.content })),
        { role: "user", content: userMessage },
    ];

    let loopCount = 0;
    const MAX_LOOPS = 10;

    while (loopCount < MAX_LOOPS) {
        loopCount++;

        const res = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                messages: apiMessages,
                provider,
                fileTree,
                userApiKey: userApiKey || undefined,
            }),
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({ error: "Request failed" }));
            throw new Error(err.error || `HTTP ${res.status}`);
        }

        const reader = res.body?.getReader();
        if (!reader) throw new Error("No response body");

        const decoder = new TextDecoder();
        let buffer = "";
        let gotToolCall = false;

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
                const cleaned = line.replace(/^data: /, "").trim();
                if (!cleaned) continue;

                try {
                    const event = JSON.parse(cleaned);

                    if (event.type === "text") {
                        onText(event.content);
                        apiMessages.push({ role: "assistant", content: event.content });
                    } else if (event.type === "tool_call") {
                        gotToolCall = true;
                        const tc = event.tool_call;

                        if (tc.name === "read_file") {
                            onToolActivity(`📖 Reading \`${tc.arguments.path}\`...`);
                            const file = findFileByPath(templateData?.items || [], tc.arguments.path);
                            const fileContent = file ? file.content : `Error: File "${tc.arguments.path}" not found`;

                            apiMessages.push({
                                role: "assistant",
                                content: null,
                                tool_calls: [{ id: tc.id, type: "function", function: { name: tc.name, arguments: JSON.stringify(tc.arguments) } }],
                            });
                            apiMessages.push({ role: "tool", content: fileContent, tool_call_id: tc.id });
                        } else if (tc.name === "edit_file") {
                            onToolActivity(`✏️ Editing \`${tc.arguments.path}\`...`);
                            onFileEdit(tc.arguments.path, tc.arguments.content);

                            apiMessages.push({
                                role: "assistant",
                                content: null,
                                tool_calls: [{ id: tc.id, type: "function", function: { name: tc.name, arguments: JSON.stringify(tc.arguments) } }],
                            });
                            apiMessages.push({ role: "tool", content: `Successfully updated ${tc.arguments.path}`, tool_call_id: tc.id });
                        }
                    } else if (event.type === "error") {
                        throw new Error(event.content);
                    }
                } catch (e: any) {
                    if (e.message && !e.message.includes("JSON")) throw e;
                }
            }
        }

        if (!gotToolCall) break;
    }
}
