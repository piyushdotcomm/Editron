"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
    Bot,
    Send,
    Trash2,
    Loader2,
    Sparkles,
    User,
    Wrench,
    Zap,
    Code2,
    ChevronDown,
} from "lucide-react";
import {
    useAI,
    type AIProvider,
    addOrUpdateFile,
    deleteFileByPath,
    findFileByPath,
    collectFilePaths
} from "@/modules/playground/hooks/useAI";
import { useFileExplorer } from "@/modules/playground/hooks/useFileExplorer";
import { toast } from "sonner";
import type { TemplateFolder } from "@/modules/playground/lib/path-to-json";
import { useChat } from "@ai-sdk/react";

interface AIChatPanelProps {
    templateData: TemplateFolder | null;
    saveTemplateData: (data: TemplateFolder) => Promise<void>;
}

const PROVIDERS: { id: AIProvider; label: string; icon: React.ReactNode }[] = [
    { id: "gemini", label: "Gemini", icon: <Sparkles className="h-3.5 w-3.5" /> },
    { id: "groq", label: "Groq", icon: <Zap className="h-3.5 w-3.5" /> },
    { id: "mistral", label: "Mistral", icon: <Code2 className="h-3.5 w-3.5" /> },
];

export default function AIChatPanel({
    templateData,
    saveTemplateData,
}: AIChatPanelProps) {
    const {
        isChatOpen,
        closeChat,
        provider,
        setProvider,
        getUserApiKey,
    } = useAI();

    const { openFiles, setOpenFiles, setTemplateData } = useFileExplorer();
    const [showProviderPicker, setShowProviderPicker] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const pickerRef = useRef<HTMLDivElement>(null);

    // Memoize the file tree string to avoid re-computing on every render
    const fileTree = useMemo(
        () => templateData ? collectFilePaths(templateData.items).join("\n") : "",
        [templateData]
    );

    const [inputValue, setInputValue] = useState("");

    const {
        messages,
        status,
        setMessages,
        addToolResult,
        sendMessage: chatSendMessage,
    } = useChat({
        onError: (err: Error) => {
            console.error("AI Chat Error:", err);
            toast.error(err.message || "An error occurred");
        }
    });

    // v3 uses status instead of isLoading
    const isLoading = status === "submitted" || status === "streaming";

    // Prevent the user from sending a message if the MOST RECENT tool hasn't finished, 
    // to avoid the SDK "Tool result is missing" crash on the active chat stream.
    // We explicitly only check the last message so older stuck tools don't permanently brick the chat.
    const lastMessage = messages[messages.length - 1];
    const hasUnresolvedTools = lastMessage?.role === "assistant" &&
        ((lastMessage as unknown) as Record<string, unknown>).parts && 
        (((lastMessage as unknown) as { parts: Array<{ type: string; toolInvocation?: { state: string }, state?: string }> }).parts).some(
            p => (p.type === "tool-invocation" || p.type?.startsWith("tool-")) && 
                 (!p.state || (p.state !== "result" && p.state !== "output-available")) &&
                 p.toolInvocation?.state === "call"
        );

    const sendMessage = useCallback(() => {
        const trimmed = inputValue.trim();
        if (!trimmed || isLoading || hasUnresolvedTools) return;
        chatSendMessage(
            { text: trimmed },
            {
                body: {
                    provider,
                    fileTree,
                    userApiKey: getUserApiKey(provider) || undefined,
                },
            }
        );
        setInputValue("");
        if (inputRef.current) {
            inputRef.current.style.height = "auto";
        }
    }, [inputValue, isLoading, hasUnresolvedTools, chatSendMessage, provider, fileTree, getUserApiKey]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(() => {
        if (isChatOpen) setTimeout(() => inputRef.current?.focus(), 300);
    }, [isChatOpen]);

    // Close provider picker on outside click
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
                setShowProviderPicker(false);
            }
        };
        if (showProviderPicker) document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, [showProviderPicker]);

    // Track which tool calls we've already executed to prevent double-execution
    const processedToolCallIds = useRef(new Set<string>());

    // Handle incoming client-side tool calls
    // In AI SDK v3, static tool parts use type: "tool-{toolName}" with:
    //   part.toolCallId, part.toolName, part.input, part.state
    useEffect(() => {
        const lastMessage = messages[messages.length - 1];
        if (lastMessage?.role !== "assistant") return;

        const rawParts: unknown[] = (lastMessage as unknown as { parts?: unknown[] }).parts ?? [];

        // Debug: log all parts to see what v3 sends
        if (rawParts.length > 0) {
            const toolParts = rawParts.filter((p) => typeof (p as Record<string,unknown>).type === "string" && ((p as Record<string,unknown>).type as string).startsWith("tool-"));
            if (toolParts.length > 0) {
                console.log("[AIChatPanel] Tool parts in last message:", JSON.stringify(toolParts, null, 2));
            }
        }

        for (const rawPart of rawParts) {
            const part = rawPart as Record<string, unknown>;
            const partType = part.type as string | undefined;

            // v3 static tool parts: type starts with "tool-" (e.g. "tool-read_file")
            if (!partType?.startsWith("tool-")) continue;

            // Guard against re-execution: skip if already processed
            const toolCallId = part.toolCallId as string | undefined;
            if (!toolCallId) continue;
            if (processedToolCallIds.current.has(toolCallId)) continue;

            // Only execute when input is fully available (not still streaming)
            const state = part.state as string | undefined;
            // Skip if output already provided, or if input is still streaming in
            if (state === "output-available" || state === "output-streaming") continue;
            // Skip if input hasn't arrived yet
            if (state === "input-streaming") continue;
            const toolName = (part.toolName as string | undefined) ?? partType.split("-").slice(1).join("-");
            // In v3, args live in part.input; fall back to part.args for compatibility
            const args = (part.input as Record<string, unknown> | undefined) ?? (part.args as Record<string, unknown> | undefined) ?? {};

            if (!toolCallId || !toolName) continue;

            let result: string;

            try {
                if (toolName === "read_file") {
                    const { path } = args as { path?: string };
                    if (!path || typeof path !== "string") {
                        result = `Error: read_file requires a "path" argument (e.g. "src/App.tsx")`;
                    } else {
                        const file = findFileByPath(templateData?.items || [], path);
                        result = file ? file.content : `Error: File "${path}" not found`;
                    }
                } else if (toolName === "edit_file") {
                    const { path, content } = args as { path?: string; content?: string };
                    if (!path || typeof path !== "string") {
                        result = `Error: edit_file requires a "path" argument (e.g. "README.md")`;
                    } else if (content === undefined || content === null) {
                        result = `Error: edit_file requires a "content" argument with the full file contents`;
                    } else if (!templateData) {
                        result = `Error: Template data not loaded`;
                    } else {
                        const updatedItems = addOrUpdateFile(templateData.items, path, content as string);
                        const updatedTemplate = { ...templateData, items: updatedItems };
                        setTemplateData(updatedTemplate);

                        const updatedOpenFiles = openFiles.map((f) => {
                            const ext = f.fileExtension ? `.${f.fileExtension}` : "";
                            const fullName = `${f.filename}${ext}`;
                            if (path.endsWith(fullName)) {
                                return { ...f, content: content as string, hasUnsavedChanges: true };
                            }
                            return f;
                        });

                        setOpenFiles(updatedOpenFiles);
                        saveTemplateData(updatedTemplate).catch(console.error);
                        toast.success(`AI updated ${path}`);
                        result = `Successfully updated ${path}`;
                    }
                } else if (toolName === "edit_multiple_files") {
                    const { changes } = args as { changes?: { path: string; content: string }[] };
                    if (!changes || !Array.isArray(changes) || changes.length === 0) {
                        result = `Error: edit_multiple_files requires a "changes" array with at least one {path, content} entry`;
                    } else if (!templateData) {
                        result = `Error: Template data not loaded`;
                    } else {
                        let currentItems = templateData.items;
                        let currentOpenFiles = [...openFiles];

                        for (const change of changes) {
                            currentItems = addOrUpdateFile(currentItems, change.path, change.content);
                            currentOpenFiles = currentOpenFiles.map((f) => {
                                const ext = f.fileExtension ? `.${f.fileExtension}` : "";
                                const fullName = `${f.filename}${ext}`;
                                if (change.path.endsWith(fullName)) {
                                    return { ...f, content: change.content, hasUnsavedChanges: true };
                                }
                                return f;
                            });
                        }

                        const updatedTemplate = { ...templateData, items: currentItems };
                        setTemplateData(updatedTemplate);
                        setOpenFiles(currentOpenFiles);
                        saveTemplateData(updatedTemplate).catch(console.error);
                        toast.success(`AI scaffolded ${changes.length} files`);
                        result = `Successfully updated ${changes.length} files`;
                    }
                } else if (toolName === "delete_file") {
                    const { path } = args as { path?: string };
                    if (!path || typeof path !== "string") {
                        result = `Error: delete_file requires a "path" argument`;
                    } else if (!templateData) {
                        result = `Error: Template data not loaded`;
                    } else {
                        const updatedItems = deleteFileByPath(templateData.items, path);
                        const updatedTemplate = { ...templateData, items: updatedItems };
                        setTemplateData(updatedTemplate);

                        const updatedOpenFiles = openFiles.filter((f) => {
                            const ext = f.fileExtension ? `.${f.fileExtension}` : "";
                            const fullName = `${f.filename}${ext}`;
                            return !path.endsWith(fullName);
                        });

                        setOpenFiles(updatedOpenFiles);
                        saveTemplateData(updatedTemplate).catch(console.error);
                        toast.success(`AI deleted ${path}`);
                        result = `Successfully deleted ${path}`;
                    }
                } else {
                    result = `Error: Unknown tool ${toolName}`;
                }
            } catch (err: unknown) {
                result = `Error: ${err instanceof Error ? err.message : String(err)}`;
            }

            // Mark as processed BEFORE calling addToolResult to prevent re-execution on re-render
            processedToolCallIds.current.add(toolCallId);
            console.log(`[AIChatPanel] Executed tool ${toolName} (${toolCallId}), result:`, result.slice(0, 100));

            addToolResult({
                toolCallId,
                tool: toolName,
                output: result,
            } as Parameters<typeof addToolResult>[0]);
        }
    }, [messages, templateData, openFiles, setTemplateData, setOpenFiles, saveTemplateData, addToolResult]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const clearChat = () => setMessages([]);
    const currentProvider = PROVIDERS.find((p) => p.id === provider) || PROVIDERS[0];

    return (
        <Sheet open={isChatOpen} onOpenChange={(open) => !open && closeChat()}>
            <SheetContent side="right" className="w-full sm:max-w-md flex flex-col p-0">
                <SheetHeader className="p-4 pb-3 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
                    <div className="flex items-center justify-between pr-6">
                        <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-sm">
                                <Bot className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <SheetTitle className="text-sm font-semibold tracking-tight">AI Assistant</SheetTitle>
                                <SheetDescription className="text-[11px] font-medium opacity-80">
                                    Project Context Enabled
                                </SheetDescription>
                            </div>
                        </div>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors" onClick={clearChat} title="Clear chat">
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 custom-scrollbar">
                    {messages.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground gap-4 animate-in fade-in duration-700">
                            <div className="h-16 w-16 rounded-3xl bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 flex items-center justify-center border border-primary/10 shadow-sm">
                                <Sparkles className="h-8 w-8 text-purple-500" />
                            </div>
                            <div className="max-w-[80%]">
                                <p className="text-sm font-semibold text-foreground tracking-tight">How can I help you code?</p>
                                <p className="text-xs mt-2 leading-relaxed opacity-80">
                                    I can read your configuration, scaffold new components, or debug existing files.
                                </p>
                            </div>
                        </div>
                    )}

                    {messages.map((msg: any) => {
                        const rawParts: any[] = (msg as any).parts ?? [];

                        // AI SDK v3 stores user text in parts[].type=="text"
                        // Only genuine user messages have text parts
                        const textParts = rawParts.filter((p: any) => p.type === "text");
                        const textContent: string = (
                            textParts.map((p: any) => p.text).join("") ||
                            (msg as any).content ||
                            ""
                        );

                        // v3 tool parts have type starting with "tool-" (e.g. "tool-read_file")
                        const toolParts: any[] = rawParts.filter(
                            (p: any) => typeof p.type === "string" && p.type.startsWith("tool-")
                        );

                        // Skip SDK-injected synthetic messages (no real text parts, no tool parts)
                        const isGenuineUser = msg.role === "user" && textParts.length > 0;

                        return (
                        <div key={msg.id} className="animate-in slide-in-from-bottom-2 fade-in duration-300">
                            {isGenuineUser && (
                                <div className="flex gap-2 justify-end mb-4">
                                    <div className="bg-primary text-primary-foreground rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-[85%] text-[13px] leading-relaxed shadow-sm whitespace-pre-wrap">
                                        {textContent}
                                    </div>
                                    <div className="h-7 w-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                                        <User className="h-3.5 w-3.5 text-primary" />
                                    </div>
                                </div>
                            )}
                            {msg.role === "assistant" && (
                                <div className="flex gap-3 mb-6">
                                    <div className="h-7 w-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                                        <Bot className="h-3.5 w-3.5 text-white" />
                                    </div>
                                    <div className="flex-1 space-y-2 min-w-0">
                                        {textContent && (
                                            <div className="bg-muted/50 border rounded-2xl rounded-tl-sm px-4 py-3 max-w-[95%] text-[13px] leading-relaxed whitespace-pre-wrap break-words text-foreground shadow-sm">
                                                {textContent}
                                            </div>
                                        )}
                                        {toolParts.map((ti: any) => {
                                            // In v3, tool name comes from the type suffix or toolName property
                                            const tiName = (ti.toolName as string | undefined) ?? (ti.type as string)?.split("-").slice(1).join("-") ?? "tool";
                                            // Path arg lives in ti.input.path in v3
                                            const tiPath = (ti.input as Record<string,unknown> | undefined)?.path as string | undefined;
                                            const tiDone = ti.state === "output-available" || ti.state === "result";
                                            return (
                                            <div key={ti.toolCallId} className="flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground border rounded-xl bg-muted/30 shadow-sm max-w-[90%]">
                                                <div className="h-5 w-5 rounded-full bg-background flex items-center justify-center shrink-0 border shadow-sm">
                                                    <Wrench className="h-2.5 w-2.5" />
                                                </div>
                                                <span className="font-mono truncate tracking-tight">
                                                    {tiName}({tiPath ? tiPath.split("/").pop() : ""}) {tiDone ? "✓" : <Loader2 className="h-3 w-3 inline animate-spin ml-1" />}
                                                </span>
                                            </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                        );
                    })}

                    {isLoading && messages.length > 0 && messages[messages.length - 1].role !== "assistant" && (
                        <div className="flex items-center gap-2 px-3 py-1.5 text-xs text-muted-foreground">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            <span>Thinking...</span>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <div className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-3 sticky bottom-0 z-10">
                    <div className="relative flex items-end gap-2 bg-muted/40 border rounded-2xl p-1.5 shadow-sm focus-within:ring-1 focus-within:ring-primary/30 focus-within:border-primary/50 transition-all">
                        <textarea
                            ref={inputRef}
                            className="flex-1 text-[13px] bg-transparent px-3 py-2.5 resize-none rounded-xl outline-none focus-visible:ring-1 focus-visible:ring-primary/50 min-h-[40px] max-h-[160px] placeholder:text-muted-foreground/70 custom-scrollbar"
                            placeholder="Message AI Assistant..."
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            rows={1}
                            disabled={isLoading}
                            onInput={(e) => {
                                const t = e.target as HTMLTextAreaElement;
                                t.style.height = "auto";
                                t.style.height = Math.min(t.scrollHeight, 160) + "px";
                            }}
                        />
                        <div className="flex flex-col justify-end pb-1 pr-1 shrink-0">
                            <Button
                                type="button"
                                size="icon"
                                className={`h-8 w-8 rounded-xl shrink-0 transition-all ${inputValue.trim() && !isLoading
                                        ? "bg-primary text-primary-foreground shadow-md hover:scale-105 active:scale-95"
                                        : "bg-muted text-muted-foreground"
                                    }`}
                                disabled={!inputValue.trim() || isLoading}
                                onClick={sendMessage}
                            >
                                {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                            </Button>
                        </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between px-1 relative" ref={pickerRef}>
                        <button
                            type="button"
                            className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground hover:text-foreground transition-all py-1 px-2 rounded-lg hover:bg-muted/50 border border-transparent hover:border-border"
                            onClick={() => setShowProviderPicker(!showProviderPicker)}
                        >
                            <span className="opacity-70">{currentProvider.icon}</span>
                            <span>{currentProvider.label}</span>
                            <ChevronDown className="h-3 w-3 opacity-50" />
                        </button>

                        <span className="text-[10px] text-muted-foreground/60 mr-2 font-mono tracking-tight">
                            ⏎ to send
                        </span>

                        {showProviderPicker && (
                            <div className="absolute bottom-full left-0 mb-2 bg-background border rounded-xl shadow-lg shadow-black/5 p-1 min-w-[140px] z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
                                {PROVIDERS.map((p) => (
                                    <button
                                        key={p.id}
                                        type="button"
                                        className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs rounded-lg transition-colors ${provider === p.id
                                            ? "bg-primary/10 text-primary font-medium"
                                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                            }`}
                                        onClick={() => {
                                            setProvider(p.id);
                                            setShowProviderPicker(false);
                                        }}
                                    >
                                        <span className={provider === p.id ? "opacity-100" : "opacity-60"}>{p.icon}</span>
                                        {p.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
