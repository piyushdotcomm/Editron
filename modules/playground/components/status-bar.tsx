"use client";

import { cn } from "@/lib/utils";
import { FileIcon } from "./file-icon";

interface StatusBarProps {
    activeFile?: {
        filename: string;
        fileExtension: string;
    };
    cursorPosition: { line: number; col: number };
    containerStatus: "idle" | "building" | "running" | "error";
    collaboratorCount: number;
    openFileCount: number;
}

const LANGUAGE_MAP: Record<string, string> = {
    tsx: "TypeScript React",
    jsx: "JavaScript React",
    ts: "TypeScript",
    js: "JavaScript",
    css: "CSS",
    scss: "SCSS",
    html: "HTML",
    json: "JSON",
    md: "Markdown",
    mdx: "MDX",
    svg: "SVG",
    yaml: "YAML",
    yml: "YAML",
    xml: "XML",
    sh: "Shell",
    sql: "SQL",
    prisma: "Prisma",
    env: "Environment",
    txt: "Plain Text",
};

const STATUS_CONFIG = {
    idle: { color: "bg-gray-400", label: "Idle" },
    building: { color: "bg-amber-400 animate-pulse", label: "Building" },
    running: { color: "bg-green-500", label: "Running" },
    error: { color: "bg-red-500", label: "Error" },
};

export function StatusBar({
    activeFile,
    cursorPosition,
    containerStatus,
    collaboratorCount,
    openFileCount,
}: StatusBarProps) {
    const ext = activeFile?.fileExtension?.toLowerCase() || "";
    const language = LANGUAGE_MAP[ext] || "Plain Text";
    const statusCfg = STATUS_CONFIG[containerStatus];

    return (
        <footer
            role="status"
            aria-live="polite"
            className="flex items-center justify-between h-6 px-3 border-t bg-muted/50 text-[11px] font-medium text-muted-foreground select-none shrink-0"
        >
            {/* Left section */}
            <div className="flex items-center gap-3">
                {activeFile && (
                    <>
                        <div className="flex items-center gap-1.5">
                            <FileIcon extension={ext} className="h-3 w-3" />
                            <span>{language}</span>
                        </div>
                        <span className="opacity-30">│</span>
                        <span>
                            Ln {cursorPosition.line}, Col {cursorPosition.col}
                        </span>
                    </>
                )}
                {!activeFile && (
                    <span className="text-muted-foreground/60">No file selected</span>
                )}
            </div>

            {/* Center section */}
            <div className="flex items-center gap-2">
                <div className={cn("w-1.5 h-1.5 rounded-full", statusCfg.color)} />
                <span>{statusCfg.label}</span>
            </div>

            {/* Right section */}
            <div className="flex items-center gap-3">
                {collaboratorCount > 1 && (
                    <span className="flex items-center gap-1">
                        <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <path d="M22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
                        </svg>
                        {collaboratorCount}
                    </span>
                )}
                <span>Spaces: 2</span>
                <span>UTF-8</span>
                <span>{openFileCount} file{openFileCount !== 1 ? "s" : ""}</span>
            </div>
        </footer>
    );
}
