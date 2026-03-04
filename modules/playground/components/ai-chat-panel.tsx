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

    const {
        messages,
        input,
        handleInputChange,
        handleSubmit,
        isLoading,
        setMessages,
        addToolResult,
    } = useChat({
        api: "/api/chat",
        body: {
            provider,
            fileTree,
            userApiKey: getUserApiKey(provider) || undefined,
        },
        onError: (err: Error) => {
            console.error("AI Chat Error:", err);
            toast.error(err.message || "An error occurred");
        }
    } as any) as any;

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

    // Handle incoming client-side tool calls
    useEffect(() => {
        const lastMessage = messages[messages.length - 1];
        if (lastMessage?.role !== "assistant" || !(lastMessage as any).toolInvocations) return;

        for (const toolInvocation of (lastMessage as any).toolInvocations) {
            if (toolInvocation.state === "call") {
                const { toolName, args, toolCallId } = toolInvocation;

                let result: any = null;

                try {
                    if (toolName === "read_file") {
                        const { path } = args as { path: string };
                        const file = findFileByPath(templateData?.items || [], path);
                        result = file ? file.content : `Error: File "${path}" not found`;
                    } else if (toolName === "edit_file") {
                        const { path, content } = args as { path: string; content: string };
                        if (!templateData) throw new Error("Template data not loaded");

                        const updatedItems = addOrUpdateFile(templateData.items, path, content);
                        const updatedTemplate = { ...templateData, items: updatedItems };
                        setTemplateData(updatedTemplate);

                        const updatedOpenFiles = openFiles.map((f) => {
                            const ext = f.fileExtension ? `.${f.fileExtension}` : "";
                            const fullName = `${f.filename}${ext}`;
                            if (path.endsWith(fullName)) {
                                return { ...f, content, hasUnsavedChanges: true };
                            }
                            return f;
                        });

                        setOpenFiles(updatedOpenFiles);
                        saveTemplateData(updatedTemplate).catch(console.error);
                        toast.success(`AI updated ${path}`);
                        result = `Successfully updated ${path}`;
                    } else if (toolName === "edit_multiple_files") {
                        const { changes } = args as { changes: { path: string; content: string }[] };
                        if (!templateData) throw new Error("Template data not loaded");

                        let currentItems = templateData.items;
                        let currentOpenFiles = [...openFiles];

                        // Process all file changes in the batch transaction
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

                        toast.success(`AI rapidly scaffolded ${changes.length} files`);
                        result = `Successfully updated ${changes.length} files`;
                    } else if (toolName === "delete_file") {
                        const { path } = args as { path: string };
                        if (!templateData) throw new Error("Template data not loaded");

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
                    } else {
                        result = `Error: Unknown tool ${toolName}`;
                    }
                } catch (err: any) {
                    result = `Error: ${err.message}`;
                }

                // Append the result back to the chat stream
                addToolResult({ toolCallId, result: result as any });
            }
        }
    }, [messages, templateData, openFiles, setTemplateData, setOpenFiles, saveTemplateData, addToolResult]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (input.trim() && !isLoading) {
                handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>);
            }
        }
    };

    const clearChat = () => setMessages([]);
    const currentProvider = PROVIDERS.find((p) => p.id === provider) || PROVIDERS[0];

    return (
        <Sheet open={isChatOpen} onOpenChange={(open) => !open && closeChat()}>
            <SheetContent side="right" className="w-full sm:max-w-md flex flex-col p-0">
                <SheetHeader className="p-4 pb-3 border-b">
                    <div className="flex items-center justify-between pr-6">
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center">
                                <Bot className="h-4 w-4 text-white" />
                            </div>
                            <div>
                                <SheetTitle className="text-sm">AI Agent</SheetTitle>
                                <SheetDescription className="text-xs">
                                    Can read & edit your files
                                </SheetDescription>
                            </div>
                        </div>
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={clearChat} title="Clear chat">
                            <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
                    {messages.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground gap-3">
                            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-violet-500/20 to-blue-600/20 flex items-center justify-center">
                                <Bot className="h-6 w-6 text-violet-500" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-foreground">AI Agent</p>
                                <p className="text-xs mt-1 leading-relaxed">
                                    I can read and edit files in your project.
                                    <br />
                                    Try: &quot;Create a login page&quot;
                                </p>
                            </div>
                        </div>
                    )}

                    {messages.map((msg: any) => (
                        <div key={msg.id}>
                            {msg.role === "user" && (
                                <div className="flex gap-2 justify-end">
                                    <div className="bg-primary text-primary-foreground rounded-2xl rounded-tr-sm px-3 py-2 max-w-[85%] text-sm whitespace-pre-wrap">
                                        {(msg as any).content}
                                    </div>
                                    <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center shrink-0 mt-1">
                                        <User className="h-3 w-3" />
                                    </div>
                                </div>
                            )}
                            {msg.role === "assistant" && (
                                <div className="flex gap-2">
                                    <div className="h-6 w-6 rounded-full bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center shrink-0 mt-1">
                                        <Bot className="h-3 w-3 text-white" />
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        {(msg as any).content && (
                                            <div className="bg-muted rounded-2xl rounded-tl-sm px-3 py-2 max-w-[100%] text-sm whitespace-pre-wrap break-words">
                                                {(msg as any).content}
                                            </div>
                                        )}
                                        {/* @ts-ignore - Vercel AI SDK types sometimes conflict on toolInvocations */}
                                        {(msg as any).toolInvocations?.map((ti: any) => (
                                            <div key={ti.toolCallId} className="flex items-center gap-2 px-3 py-1.5 text-xs text-muted-foreground border rounded-lg bg-muted/30">
                                                <Wrench className="h-3 w-3 shrink-0" />
                                                <span className="font-mono truncate">
                                                    {ti.toolName}({ti.args && (ti.args as any).path ? (ti.args as any).path : ''}) {ti.state === 'result' ? '✓' : '...'}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}

                    {isLoading && messages.length > 0 && messages[messages.length - 1].role !== "assistant" && (
                        <div className="flex items-center gap-2 px-3 py-1.5 text-xs text-muted-foreground">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            <span>Thinking...</span>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <div className="border-t bg-background">
                    <form className="p-3 pb-2" onSubmit={(e) => { e.preventDefault(); if (input.trim() && !isLoading) handleSubmit(e); }}>
                        <div className="flex gap-2 items-end">
                            <textarea
                                ref={inputRef}
                                className="flex-1 text-sm bg-muted rounded-xl px-3 py-2.5 resize-none outline-none min-h-[40px] max-h-[120px] placeholder:text-muted-foreground"
                                placeholder="Ask AI to edit your code..."
                                value={input}
                                onChange={handleInputChange}
                                onKeyDown={handleKeyDown}
                                rows={1}
                                disabled={isLoading}
                                onInput={(e) => {
                                    const t = e.target as HTMLTextAreaElement;
                                    t.style.height = "auto";
                                    t.style.height = Math.min(t.scrollHeight, 120) + "px";
                                }}
                            />
                            <Button
                                type="submit"
                                size="icon"
                                className="h-10 w-10 rounded-xl shrink-0"
                                disabled={!(input ?? "").trim() || isLoading}
                            >
                                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                            </Button>
                        </div>
                    </form>

                    <div className="px-3 pb-3 relative" ref={pickerRef}>
                        <button
                            type="button"
                            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors py-1 px-2 rounded-md hover:bg-muted"
                            onClick={() => setShowProviderPicker(!showProviderPicker)}
                        >
                            {currentProvider.icon}
                            <span className="font-medium">{currentProvider.label}</span>
                            <ChevronDown className="h-3 w-3" />
                        </button>

                        {showProviderPicker && (
                            <div className="absolute bottom-full left-3 mb-1 bg-popover border rounded-lg shadow-lg p-1 min-w-[140px] z-50">
                                {PROVIDERS.map((p) => (
                                    <button
                                        key={p.id}
                                        type="button"
                                        className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs rounded-md transition-colors ${provider === p.id
                                            ? "bg-accent text-accent-foreground font-medium"
                                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                            }`}
                                        onClick={() => {
                                            setProvider(p.id);
                                            setShowProviderPicker(false);
                                        }}
                                    >
                                        {p.icon}
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
