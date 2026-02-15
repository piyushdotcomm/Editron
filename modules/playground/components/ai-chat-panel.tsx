"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
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
    runAgenticChat,
    updateFileByPath,
} from "@/modules/playground/hooks/useAI";
import { useFileExplorer } from "@/modules/playground/hooks/useFileExplorer";
import { toast } from "sonner";
import type { TemplateFolder } from "@/modules/playground/lib/path-to-json";

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
        chatMessages,
        addMessage,
        clearChat,
        isGenerating,
        setIsGenerating,
        getUserApiKey,
    } = useAI();

    const { openFiles, setOpenFiles, setTemplateData } = useFileExplorer();

    const [input, setInput] = useState("");
    const [showProviderPicker, setShowProviderPicker] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const pickerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chatMessages]);

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

    const handleSend = useCallback(async () => {
        const trimmed = input.trim();
        if (!trimmed || isGenerating) return;

        setInput("");
        addMessage({ role: "user", content: trimmed });
        setIsGenerating(true);

        try {
            const userApiKey = getUserApiKey();
            await runAgenticChat(
                trimmed,
                templateData,
                provider,
                userApiKey,
                (text) => addMessage({ role: "assistant", content: text }),
                (activity) => addMessage({ role: "tool_activity", content: activity }),
                (path, content) => {
                    if (!templateData) return;
                    const updatedItems = updateFileByPath(templateData.items, path, content);
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
                },
                chatMessages
                    .filter((m) => m.role === "user" || m.role === "assistant")
                    .map((m) => ({ role: m.role, content: m.content }))
            );
        } catch (error: any) {
            console.error("AI chat error:", error);
            addMessage({ role: "assistant", content: `❌ Error: ${error.message}` });
            toast.error(error.message || "AI request failed");
        } finally {
            setIsGenerating(false);
        }
    }, [input, isGenerating, provider, templateData, chatMessages, openFiles, addMessage, setIsGenerating, getUserApiKey, setTemplateData, setOpenFiles, saveTemplateData]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const currentProvider = PROVIDERS.find((p) => p.id === provider) || PROVIDERS[0];

    return (
        <Sheet open={isChatOpen} onOpenChange={(open) => !open && closeChat()}>
            <SheetContent side="right" className="w-full sm:max-w-md flex flex-col p-0">
                {/* Header — minimal */}
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

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
                    {chatMessages.length === 0 && (
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

                    {chatMessages.map((msg) => (
                        <div key={msg.id}>
                            {msg.role === "user" && (
                                <div className="flex gap-2 justify-end">
                                    <div className="bg-primary text-primary-foreground rounded-2xl rounded-tr-sm px-3 py-2 max-w-[85%] text-sm">
                                        {msg.content}
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
                                    <div className="bg-muted rounded-2xl rounded-tl-sm px-3 py-2 max-w-[85%] text-sm whitespace-pre-wrap break-words">
                                        {msg.content}
                                    </div>
                                </div>
                            )}
                            {msg.role === "tool_activity" && (
                                <div className="flex items-center gap-2 px-3 py-1.5 text-xs text-muted-foreground">
                                    <Wrench className="h-3 w-3 shrink-0" />
                                    <span className="font-mono">{msg.content}</span>
                                </div>
                            )}
                        </div>
                    ))}

                    {isGenerating && (
                        <div className="flex items-center gap-2 px-3 py-1.5 text-xs text-muted-foreground">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            <span>Thinking...</span>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Bottom: provider selector + input */}
                <div className="border-t bg-background">
                    {/* Input area */}
                    <div className="p-3 pb-2">
                        <div className="flex gap-2 items-end">
                            <textarea
                                ref={inputRef}
                                className="flex-1 text-sm bg-muted rounded-xl px-3 py-2.5 resize-none outline-none min-h-[40px] max-h-[120px] placeholder:text-muted-foreground"
                                placeholder="Ask AI to edit your code..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                rows={1}
                                disabled={isGenerating}
                                onInput={(e) => {
                                    const t = e.target as HTMLTextAreaElement;
                                    t.style.height = "auto";
                                    t.style.height = Math.min(t.scrollHeight, 120) + "px";
                                }}
                            />
                            <Button
                                size="icon"
                                className="h-10 w-10 rounded-xl shrink-0"
                                onClick={handleSend}
                                disabled={!input.trim() || isGenerating}
                            >
                                {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                            </Button>
                        </div>
                    </div>

                    {/* Provider selector row — at the very bottom */}
                    <div className="px-3 pb-3 relative" ref={pickerRef}>
                        <button
                            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors py-1 px-2 rounded-md hover:bg-muted"
                            onClick={() => setShowProviderPicker(!showProviderPicker)}
                        >
                            {currentProvider.icon}
                            <span className="font-medium">{currentProvider.label}</span>
                            <ChevronDown className="h-3 w-3" />
                        </button>

                        {/* Provider picker popover */}
                        {showProviderPicker && (
                            <div className="absolute bottom-full left-3 mb-1 bg-popover border rounded-lg shadow-lg p-1 min-w-[140px] z-50">
                                {PROVIDERS.map((p) => (
                                    <button
                                        key={p.id}
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
