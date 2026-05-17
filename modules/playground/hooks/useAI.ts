"use client";

import { create } from "zustand";
import { TemplateFile, TemplateFolder } from "../lib/path-to-json";

export type FileSystemItem = TemplateFile | TemplateFolder;

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
    editorTheme: string;

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
    setEditorTheme: (theme: string) => void;
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
        editorTheme: typeof window !== "undefined" ? localStorage.getItem("editron_editor_theme") || "vs-dark" : "vs-dark",
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

        setEditorTheme: (theme: string) => {
            try { localStorage.setItem("editron_editor_theme", theme); } catch { }
            set({ editorTheme: theme });
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
/**
 * Recursively collects all file paths from a nested folder structure.
 * 
 * @param items - Array of template files and folders.
 * @param prefix - Optional prefix for the current path level.
 * @returns Array of relative file and folder paths.
 */
export function collectFilePaths(items: FileSystemItem[], prefix = ""): string[] {
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

/**
 * Finds a file within the nested template structure by its full path.
 * 
 * @param items - Array of template files and folders.
 * @param targetPath - The full path of the file to find.
 * @param prefix - Optional prefix for the current path level.
 * @returns The found file object or null if not found.
 */
export function findFileByPath(items: FileSystemItem[], targetPath: string, prefix = ""): FileSystemItem | null {
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

/**
 * Returns a new array with the specified file removed from the structure.
 * 
 * @param items - Array of template files and folders.
 * @param targetPath - The full path of the file to delete.
 * @param prefix - Optional prefix for the current path level.
 * @returns A new items array with the file removed.
 */
export function deleteFileByPath(items: FileSystemItem[], targetPath: string, prefix = ""): FileSystemItem[] {
    return items.reduce<FileSystemItem[]>((acc, item) => {
        if ("folderName" in item) {
            const currentPath = prefix ? `${prefix}/${item.folderName}` : item.folderName;
            acc.push({ ...item, items: deleteFileByPath(item.items as FileSystemItem[], targetPath, currentPath) });
        } else {
            const ext = item.fileExtension ? `.${item.fileExtension}` : "";
            const currentPath = prefix ? `${prefix}/${item.filename}${ext}` : `${item.filename}${ext}`;
            if (currentPath !== targetPath) acc.push(item);
        }
        return acc;
    }, []);
}

/**
 * Recursively updates an existing file or creates it along with missing intermediate folders.
 * 
 * @param items - Array of template files and folders.
 * @param targetPath - The full path of the file to update or create.
 * @param newContent - The content to write to the file.
 * @param prefix - Optional prefix for the current path level.
 * @returns A new items array containing the updated or created file.
 */
export function addOrUpdateFile(items: FileSystemItem[], targetPath: string, newContent: string, prefix = ""): FileSystemItem[] {
    // 1. Try to find and update existing file

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
                    return { ...item, items: addOrUpdateFile(item.items as FileSystemItem[], targetPath, newContent, fp) };
                }
                return item;
            } else {
                const ext = item.fileExtension ? `.${item.fileExtension}` : "";
                const filePath = prefix ? `${prefix}/${item.filename}${ext}` : `${item.filename}${ext}`;
                if (filePath === targetPath) return { ...item, content: newContent };
                return item;
            }
        }) as FileSystemItem[];
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
        const folder = newItems[folderIndex] as TemplateFolder;
        const fp = prefix ? `${prefix}/${folder.folderName}` : folder.folderName;
        newItems[folderIndex] = {
            ...folder,
            items: addOrUpdateFile(folder.items as FileSystemItem[], targetPath, newContent, fp)
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


