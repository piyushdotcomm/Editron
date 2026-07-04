/**
 * @fileoverview Custom hook for handling AI tool execution logic.
 * @module hooks/useAITools
 * @description Extracts and manages all client-side tool execution logic from AI chat interactions.
 * Handles four main tool types:
 * - read_file: Reads file content from template data
 * - edit_file: Updates a single file with new content
 * - edit_multiple_files: Batch updates multiple files
 * - delete_file: Removes a file from the project
 * @feature Prevents duplicate tool execution using processedToolCallIds ref
 * @feature Checks for unresolved tools to block message sending
 * @param {UseAIToolsProps} props - Configuration and state dependencies
 * @returns {Object} hasUnresolvedTools - Function to check pending tool calls
 */

"use client";

import { useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";
import type { TemplateFolder } from "@/modules/playground/lib/path-to-json";
import {
    addOrUpdateFile,
    deleteFileByPath,
    findFileByPath,
} from "@/modules/playground/hooks/useAI";

interface MessagePart {
    type?: string;
    text?: string;
    toolCallId?: string;
    toolName?: string;
    state?: string;
    input?: Record<string, unknown>;
    toolInvocation?: Record<string, unknown>;
    args?: Record<string, unknown>;
    [key: string]: unknown;
}

interface ExtendedMessage {
    parts?: MessagePart[];
    content?: string;
    role?: string;
    id?: string;
}

interface UseAIToolsProps {
    messages: unknown[];
    templateData: TemplateFolder | null;
    openFiles: Array<{
        id?: string;
        filename: string;
        fileExtension?: string;
        content?: string;
        originalContent?: string;
        hasUnsavedChanges?: boolean;
    }>;
    setTemplateData: (data: TemplateFolder) => void;
    setOpenFiles: (files: Array<{
        id?: string;
        filename: string;
        fileExtension?: string;
        content?: string;
        originalContent?: string;
        hasUnsavedChanges?: boolean;
    }>) => void;
    saveTemplateData: (data: TemplateFolder) => Promise<void>;
    addToolResult: (result: { toolCallId: string; tool: string; output: string }) => void;
}

/**
 * Helper function to normalize and compare file paths
 * Ensures accurate path matching across different directory structures
 */
function normalizePath(path: string): string {
    return path.replace(/\\/g, "/").replace(/^\/+/, "").toLowerCase();
}

function isPathMatch(path1: string, path2: string): boolean {
    const normalized1 = normalizePath(path1);
    const normalized2 = normalizePath(path2);
    return normalized1 === normalized2;
}

export function useAITools({
    messages,
    templateData,
    openFiles,
    setTemplateData,
    setOpenFiles,
    saveTemplateData,
    addToolResult,
}: UseAIToolsProps) {
    // Track which tool calls we've already executed to prevent double-execution
    const processedToolCallIds = useRef(new Set<string>());

    // Check if the most recent tool hasn't finished to prevent sending messages
    const hasUnresolvedTools = useCallback(() => {
        const lastMessage = messages[messages.length - 1] as ExtendedMessage | undefined;
        if (lastMessage?.role !== "assistant") return false;

        const parts = (lastMessage as unknown as { parts?: unknown[] })?.parts ?? [];
        return Array.isArray(parts) && parts.some((rawP: unknown) => {
            if (!rawP || typeof rawP !== "object") return false;
            const p = rawP as MessagePart;
            const isTool = p.type === "tool-invocation" || 
                          (typeof p.type === "string" && p.type.startsWith("tool-"));
            const isUnresolved = !p.state || 
                                (p.state !== "result" && p.state !== "output-available");
            const hasCall = p.toolInvocation && 
                           typeof p.toolInvocation === "object" && 
                           (p.toolInvocation as Record<string, unknown>).state === "call";
            return isTool && isUnresolved && hasCall;
        });
    }, [messages]);

    // Handle incoming client-side tool calls
    useEffect(() => {
        const lastMessage = messages[messages.length - 1] as ExtendedMessage | undefined;
        if (lastMessage?.role !== "assistant") return;

        const rawParts: unknown[] = (lastMessage as unknown as { parts?: unknown[] }).parts ?? [];

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
            if (state === "output-available" || state === "output-streaming") continue;
            if (state === "input-streaming") continue;

            const toolName = (part.toolName as string | undefined) ?? 
                            partType.split("-").slice(1).join("-");
            const args = (part.input as Record<string, unknown> | undefined) ?? 
                        (part.args as Record<string, unknown> | undefined) ?? {};

            if (!toolCallId || !toolName) continue;

            let result: string;

            // Use an IIFE (Immediately Invoked Function Expression) to handle async operations
            (async () => {
                try {
                    if (toolName === "read_file") {
                        const { path } = args as { path?: string };
                        if (!path || typeof path !== "string") {
                            result = `Error: read_file requires a "path" argument (e.g. "src/App.tsx")`;
                        } else {
                            const file = findFileByPath(templateData?.items || [], path);
                            result = (file && "content" in file && file.content !== undefined) 
                                ? file.content 
                                : `Error: File "${path}" not found`;
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
                            try {
                                const updatedItems = addOrUpdateFile(templateData.items, path, content as string);
                                const updatedTemplate = { ...templateData, items: updatedItems };
                                setTemplateData(updatedTemplate);

                                // Use normalized path comparison instead of endsWith
                                const normalizedEditPath = normalizePath(path);
                                const updatedOpenFiles = openFiles.map((f) => {
                                    const ext = f.fileExtension ? `.${f.fileExtension}` : "";
                                    const fullName = `${f.filename}${ext}`;
                                    const normalizedFullName = normalizePath(fullName);
                                    if (isPathMatch(normalizedEditPath, normalizedFullName)) {
                                        return { 
                                            ...f, 
                                            content: content as string, 
                                            hasUnsavedChanges: true 
                                        };
                                    }
                                    return f;
                                });

                                setOpenFiles(updatedOpenFiles);
                                await saveTemplateData(updatedTemplate);
                                toast.success(`AI updated ${path}`);
                                result = `Successfully updated ${path}`;
                            } catch (saveError) {
                                console.error("Failed to save template data:", saveError);
                                toast.error(`Failed to save changes to ${path}`);
                                result = `Error: Failed to save changes to ${path}`;
                            }
                        }
                    } else if (toolName === "edit_multiple_files") {
                        const { changes } = args as { changes?: { path: string; content: string }[] };
                        if (!changes || !Array.isArray(changes) || changes.length === 0) {
                            result = `Error: edit_multiple_files requires a "changes" array with at least one {path, content} entry`;
                        } else if (!templateData) {
                            result = `Error: Template data not loaded`;
                        } else {
                            try {
                                let currentItems = templateData.items;
                                let currentOpenFiles = [...openFiles];

                                // Build a map of normalized paths for efficient comparison
                                const normalizedChanges = changes.map(change => ({
                                    ...change,
                                    normalizedPath: normalizePath(change.path)
                                }));

                                for (const change of normalizedChanges) {
                                    currentItems = addOrUpdateFile(currentItems, change.path, change.content);
                                    currentOpenFiles = currentOpenFiles.map((f) => {
                                        const ext = f.fileExtension ? `.${f.fileExtension}` : "";
                                        const fullName = `${f.filename}${ext}`;
                                        const normalizedFullName = normalizePath(fullName);
                                        if (isPathMatch(change.normalizedPath, normalizedFullName)) {
                                            return { ...f, content: change.content, hasUnsavedChanges: true };
                                        }
                                        return f;
                                    });
                                }

                                const updatedTemplate = { ...templateData, items: currentItems };
                                setTemplateData(updatedTemplate);
                                setOpenFiles(currentOpenFiles);
                                await saveTemplateData(updatedTemplate);
                                toast.success(`AI scaffolded ${changes.length} files`);
                                result = `Successfully updated ${changes.length} files`;
                            } catch (saveError) {
                                console.error("Failed to save template data:", saveError);
                                toast.error(`Failed to save changes`);
                                result = `Error: Failed to save changes`;
                            }
                        }
                    } else if (toolName === "delete_file") {
                        const { path } = args as { path?: string };
                        if (!path || typeof path !== "string") {
                            result = `Error: delete_file requires a "path" argument`;
                        } else if (!templateData) {
                            result = `Error: Template data not loaded`;
                        } else {
                            try {
                                const updatedItems = deleteFileByPath(templateData.items, path);
                                const updatedTemplate = { ...templateData, items: updatedItems };
                                setTemplateData(updatedTemplate);

                                // Use normalized path comparison for deletion
                                const normalizedDeletePath = normalizePath(path);
                                const updatedOpenFiles = openFiles.filter((f) => {
                                    const ext = f.fileExtension ? `.${f.fileExtension}` : "";
                                    const fullName = `${f.filename}${ext}`;
                                    const normalizedFullName = normalizePath(fullName);
                                    return !isPathMatch(normalizedDeletePath, normalizedFullName);
                                });

                                setOpenFiles(updatedOpenFiles);
                                await saveTemplateData(updatedTemplate);
                                toast.success(`AI deleted ${path}`);
                                result = `Successfully deleted ${path}`;
                            } catch (saveError) {
                                console.error("Failed to save template data:", saveError);
                                toast.error(`Failed to delete ${path}`);
                                result = `Error: Failed to delete ${path}`;
                            }
                        }
                    } else {
                        result = `Error: Unknown tool ${toolName}`;
                    }
                } catch (err: unknown) {
                    result = `Error: ${err instanceof Error ? err.message : String(err)}`;
                }

                // Mark as processed BEFORE calling addToolResult to prevent re-execution on re-render
                processedToolCallIds.current.add(toolCallId);

                addToolResult({
                    toolCallId,
                    tool: toolName,
                    output: result,
                });
            })();
        }
    }, [messages, templateData, openFiles, setTemplateData, setOpenFiles, saveTemplateData, addToolResult]);

    return { hasUnresolvedTools };
}