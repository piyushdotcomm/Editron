"use client";

import {
    FileText,
    FileCode2,
    FileJson,
    FileType,
    Globe,
    Palette,
    Image,
    FileTerminal,
    Settings,
    Lock,
    Database,
    Braces,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FileIconProps {
    extension: string;
    className?: string;
}

const ICON_MAP: Record<string, { icon: React.ElementType; color: string }> = {
    // React / JSX
    tsx: { icon: FileCode2, color: "text-cyan-400" },
    jsx: { icon: FileCode2, color: "text-cyan-400" },
    // TypeScript / JavaScript
    ts: { icon: FileCode2, color: "text-blue-400" },
    js: { icon: FileCode2, color: "text-yellow-400" },
    mjs: { icon: FileCode2, color: "text-yellow-400" },
    cjs: { icon: FileCode2, color: "text-yellow-400" },
    // Styles
    css: { icon: Palette, color: "text-purple-400" },
    scss: { icon: Palette, color: "text-pink-400" },
    sass: { icon: Palette, color: "text-pink-400" },
    less: { icon: Palette, color: "text-indigo-400" },
    // Markup
    html: { icon: Globe, color: "text-orange-400" },
    htm: { icon: Globe, color: "text-orange-400" },
    svg: { icon: Image, color: "text-amber-400" },
    // Data
    json: { icon: FileJson, color: "text-green-400" },
    yaml: { icon: Braces, color: "text-red-400" },
    yml: { icon: Braces, color: "text-red-400" },
    toml: { icon: Braces, color: "text-orange-300" },
    xml: { icon: FileCode2, color: "text-orange-400" },
    // Markdown / Docs
    md: { icon: FileType, color: "text-sky-400" },
    mdx: { icon: FileType, color: "text-sky-400" },
    txt: { icon: FileText, color: "text-gray-400" },
    // Config
    env: { icon: Lock, color: "text-yellow-600" },
    gitignore: { icon: Settings, color: "text-gray-500" },
    eslintrc: { icon: Settings, color: "text-violet-400" },
    prettierrc: { icon: Settings, color: "text-emerald-400" },
    // Shell / Terminal
    sh: { icon: FileTerminal, color: "text-green-500" },
    bash: { icon: FileTerminal, color: "text-green-500" },
    zsh: { icon: FileTerminal, color: "text-green-500" },
    // Database
    sql: { icon: Database, color: "text-blue-300" },
    prisma: { icon: Database, color: "text-teal-400" },
};

export function FileIcon({ extension, className }: FileIconProps) {
    const ext = extension?.toLowerCase().replace(/^\./, "") || "";
    const mapping = ICON_MAP[ext];

    if (mapping) {
        const Icon = mapping.icon;
        return <Icon className={cn("h-3.5 w-3.5 shrink-0", mapping.color, className)} />;
    }

    return <FileText className={cn("h-3.5 w-3.5 shrink-0 text-gray-400", className)} />;
}

export function FolderIcon({ isOpen, className }: { isOpen?: boolean; className?: string }) {
    return (
        <svg
            className={cn("h-3.5 w-3.5 shrink-0", isOpen ? "text-amber-400" : "text-amber-500/70", className)}
            viewBox="0 0 24 24"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
        >
            {isOpen ? (
                <path d="M2 6a2 2 0 012-2h5l2 2h9a2 2 0 012 2v2H10a3 3 0 00-2.83 2L4 20V6z" />
            ) : (
                <path d="M2 6a2 2 0 012-2h5l2 2h9a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
            )}
        </svg>
    );
}
