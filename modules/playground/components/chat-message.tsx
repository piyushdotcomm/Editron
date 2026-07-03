/**
 * @fileoverview Chat message rendering component for AI conversations.
 * @module components/chat-message
 * @description Renders individual chat messages with support for:
 * - User messages with avatar
 * - AI assistant messages with bot avatar
 * - Tool invocation display with status indicators
 * - Loading states for streaming responses
 * - Message parts (text, tool-invocation) from AI SDK v3
 * @param {ChatMessageProps} props - Message data and loading state
 * @returns {JSX.Element} Rendered message bubble with appropriate styling
 */

"use client";

import React from "react";
import { Bot, User, Wrench, Loader2 } from "lucide-react";

interface MessagePart {
    type?: string;
    text?: string;
    toolCallId?: string;
    toolName?: string;
    state?: string;
    input?: Record<string, unknown>;
    args?: Record<string, unknown>;
    [key: string]: unknown;
}

interface ExtendedMessage {
    parts?: MessagePart[];
    content?: string;
    role?: string;
    id?: string;
}

interface ChatMessageProps {
    message: ExtendedMessage & { role?: string; id?: string };
    isLoading?: boolean;
}

export function ChatMessage({ message, isLoading }: ChatMessageProps) {
    const rawParts: MessagePart[] = message.parts ?? [];

    // AI SDK v3 stores user text in parts[].type=="text"
    const textParts = rawParts.filter((p) => (p.type ?? "") === "text");
    const textContent: string = (
        textParts.map((p) => p.text ?? "").join("") ||
        message.content ||
        ""
    );

    // v3 tool parts have type starting with "tool-" (e.g. "tool-read_file")
    const toolParts: MessagePart[] = rawParts.filter(
        (p) => (p.type ?? "").startsWith("tool-")
    );

    // Skip SDK-injected synthetic messages (no real text parts, no tool parts)
    const isGenuineUser = message.role === "user" && textParts.length > 0;

    return (
        <div className="animate-in slide-in-from-bottom-2 fade-in duration-300">
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
            {message.role === "assistant" && (
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
                        {toolParts.map((ti, idx) => {
                            const tiName = (ti.toolName as string | undefined) ?? 
                                          (ti.type as string)?.split("-").slice(1).join("-") ?? "tool";
                            const tiPath = (ti.input as Record<string, unknown> | undefined)?.path as string | undefined;
                            const tiDone = ti.state === "output-available" || ti.state === "result";
                            // Add index fallback for undefined toolCallId to fix React key issue
                            const key = ti.toolCallId ?? `tool-${idx}`;
                            return (
                                <div key={key} className="flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground border rounded-xl bg-muted/30 shadow-sm max-w-[90%]">
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
            {/* REMOVED: Duplicate "Thinking..." indicator - AIChatPanel handles this at list level */}
        </div>
    );
}