/**
 * @fileoverview AI Chat Panel - Main chat interface component for AI-assisted coding.
 * @module components/ai-chat-panel
 * @description Provides a sheet-based chat interface that allows users to interact with AI assistants
 * (Gemini, Groq, Mistral) for code generation, file editing, and project scaffolding.
 * Features include:
 * - Multi-provider AI support
 * - Real-time chat with streaming responses
 * - File system operations (read, edit, delete, multiple edits)
 * - Project context awareness using file tree
 * - Tool call execution for file operations
 * @requires useAI - AI provider management
 * @requires useFileExplorer - File system state management
 * @requires useAITools - Tool execution logic hook
 * @requires ChatMessage - Message rendering component
 */


"use client";

import { TIMEOUTS } from "@/lib/constants/config";
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
    ChevronDown,
    Zap,
    Code2,
} from "lucide-react";
import {
    useAI,
    type AIProvider,
    collectFilePaths
} from "@/modules/playground/hooks/useAI";
import { useFileExplorer } from "@/modules/playground/hooks/useFileExplorer";
import { toast } from "sonner";
import type { TemplateFolder } from "@/modules/playground/lib/path-to-json";
import { useChat } from "@ai-sdk/react";
import { useAITools } from "@/modules/playground/hooks/useAITools";
import { ChatMessage } from "@/modules/playground/components/chat-message";

interface AIChatPanelProps {
    templateData: TemplateFolder | null;
    saveTemplateData: (data: TemplateFolder) => Promise<void>;
}

const PROVIDERS: { id: AIProvider; label: string; icon: React.ReactNode }[] = [
    { id: "gemini", label: "Gemini", icon: <Sparkles className="h-3.5 w-3.5" /> },
    { id: "groq", label: "Groq", icon: <Zap className="h-3.5 w-3.5" /> },
    { id: "mistral", label: "Mistral", icon: <Code2 className="h-3.5 w-3.5" /> },
];

// Define the FileItem type that matches what useAITools expects
interface FileItem {
    id?: string;
    filename: string;
    fileExtension?: string;
    content?: string;
    originalContent?: string;
    hasUnsavedChanges?: boolean;
}

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
    const [inputValue, setInputValue] = useState("");

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

    // Convert openFiles to the expected type for useAITools
    const openFilesForTools: FileItem[] = useMemo(() => {
        return openFiles.map(f => ({
            id: f.id,
            filename: f.filename,
            fileExtension: f.fileExtension,
            content: f.content,
            originalContent: f.originalContent,
            hasUnsavedChanges: f.hasUnsavedChanges
        }));
    }, [openFiles]);

    // Use the extracted tool logic hook
    const { hasUnresolvedTools } = useAITools({
        messages,
        templateData,
        openFiles: openFilesForTools,
        setTemplateData: (data: TemplateFolder) => setTemplateData(data),
        setOpenFiles: (files: FileItem[]) => {
            // Convert back to the format expected by useFileExplorer
            // Use type assertion to handle the conversion
            setOpenFiles(files as any);
        },
        saveTemplateData,
        addToolResult,
    });

    const sendMessage = useCallback(() => {
        const trimmed = inputValue.trim();
        if (!trimmed || isLoading || hasUnresolvedTools()) return;
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
        if (isChatOpen) setTimeout(() => inputRef.current?.focus(), TIMEOUTS.CHAT_INPUT_FOCUS);
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

                    {messages.map((msg) => (
                        <ChatMessage 
                            key={msg.id} 
                            message={msg as any} 
                            isLoading={isLoading && messages.length > 0 && messages[messages.length - 1].role !== "assistant"}
                        />
                    ))}

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
                            className="flex-1 text-[13px] bg-transparent px-3 py-2.5 resize-none outline-none focus-visible:ring-1 focus-visible:ring-primary min-h-[40px] max-h-[160px] placeholder:text-muted-foreground/70 custom-scrollbar"
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