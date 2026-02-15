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
        provider: "mistral",
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

export function deleteFileByPath(items: any[], targetPath: string, prefix = ""): any[] {
    return items.filter((item) => {
        if ("folderName" in item) {
            const fp = prefix ? `${prefix}/${item.folderName}` : item.folderName;
            item.items = deleteFileByPath(item.items, targetPath, fp);
            return true;
        } else {
            const ext = item.fileExtension ? `.${item.fileExtension}` : "";
            const filePath = prefix ? `${prefix}/${item.filename}${ext}` : `${item.filename}${ext}`;
            return filePath !== targetPath;
        }
    });
}

export function addOrUpdateFile(items: any[], targetPath: string, newContent: string, prefix = ""): any[] {
    // 1. Try to find and update existing file
    let found = false;
    const updated = items.map((item) => {
        if ("folderName" in item) {
            const fp = prefix ? `${prefix}/${item.folderName}` : item.folderName;
            // Only recurse if the target path starts with this folder's path
            if (targetPath.startsWith(fp + "/")) {
                const newItems = addOrUpdateFile(item.items, targetPath, newContent, fp);
                // If the recursive call returned something different (or we know we found it inside),
                // we assume it handled it. But we need to know if it was *found*.
                // A simpler check: if the recursive call results in a change, use it.
                // Actually, let's just use the result.
                return { ...item, items: newItems };
            }
            return item;
        } else {
            const ext = item.fileExtension ? `.${item.fileExtension}` : "";
            const filePath = prefix ? `${prefix}/${item.filename}${ext}` : `${item.filename}${ext}`;
            if (filePath === targetPath) {
                found = true;
                return { ...item, content: newContent };
            }
            return item;
        }
    });

    // If we found and updated the file (or it was handled in recursion which we can't easily detect with just map),
    // we need a better strategy. passing 'found' back up is hard with just return value.

    // BETTER STRATEGY:
    // Check if file exists using findFileByPath.
    // If yes, use the map logic to update.
    // If no, we need to CREATE it.

    // Let's rewrite this function to be cleaner.
    // We can use a separate "create" path if "update" fails? 
    // No, recursive creation is best done in one go.

    // For now, let's stick to the existing update logic BUT use a helper to detect if it exists first.
    const existing = findFileByPath(items, targetPath, prefix);
    if (existing) {
        return items.map((item) => {
            if ("folderName" in item) {
                const fp = prefix ? `${prefix}/${item.folderName}` : item.folderName;
                if (targetPath.startsWith(fp + "/")) {
                    return { ...item, items: addOrUpdateFile(item.items, targetPath, newContent, fp) };
                }
                return item;
            } else {
                const ext = item.fileExtension ? `.${item.fileExtension}` : "";
                const filePath = prefix ? `${prefix}/${item.filename}${ext}` : `${item.filename}${ext}`;
                if (filePath === targetPath) return { ...item, content: newContent };
                return item;
            }
        });
    }

    // 2. If not found, we need to create it.
    // Split path to find where to insert.
    // e.g. "foo/bar/baz.txt" -> at root, look for "foo".
    const relativePath = prefix ? targetPath.slice(prefix.length + 1) : targetPath;
    const parts = relativePath.split("/");
    const nextPart = parts[0];

    // If this is the last part, it's the file to create
    if (parts.length === 1) {
        const fileName = nextPart;
        const lastDot = fileName.lastIndexOf(".");
        const name = lastDot > -1 ? fileName.slice(0, lastDot) : fileName;
        const ext = lastDot > -1 ? fileName.slice(lastDot + 1) : "";
        return [...items, { filename: name, fileExtension: ext, content: newContent }];
    }

    // Otherwise, we need to find or create the folder 'nextPart'
    const folderIndex = items.findIndex((item) => "folderName" in item && item.folderName === nextPart);

    if (folderIndex > -1) {
        // Folder exists, recurse into it
        const newItems = [...items];
        const folder = newItems[folderIndex];
        const fp = prefix ? `${prefix}/${folder.folderName}` : folder.folderName;
        newItems[folderIndex] = {
            ...folder,
            items: addOrUpdateFile(folder.items, targetPath, newContent, fp)
        };
        return newItems;
    } else {
        // Folder doesn't exist, create it and recurse
        const fp = prefix ? `${prefix}/${nextPart}` : nextPart;
        // Construct the new folder structure recursively
        // A shortcut: we can just call addOrUpdateFile on an empty array for the rest of path
        // but we need to pass the correct prefix.

        // Actually, we can just create the folder item with the rest of the path resolved.
        const newFolder = {
            folderName: nextPart,
            items: addOrUpdateFile([], targetPath, newContent, fp)
        };
        return [...items, newFolder];
    }
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
    onFileDelete: (path: string) => void,
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
                        } else if (tc.name === "delete_file") {
                            onToolActivity(`🗑️ Deleting \`${tc.arguments.path}\`...`);
                            onFileDelete(tc.arguments.path);

                            apiMessages.push({
                                role: "assistant",
                                content: null,
                                tool_calls: [{ id: tc.id, type: "function", function: { name: tc.name, arguments: JSON.stringify(tc.arguments) } }],
                            });
                            apiMessages.push({ role: "tool", content: `Successfully deleted ${tc.arguments.path}`, tool_call_id: tc.id });
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
