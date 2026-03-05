"use client";

import { ChevronRight } from "lucide-react";
import { FileIcon } from "./file-icon";
import type { TemplateFile, TemplateFolder } from "@/modules/playground/lib/path-to-json";

interface BreadcrumbsProps {
    activeFile?: TemplateFile;
    templateData: TemplateFolder;
}

function findPathSegments(
    items: (TemplateFile | TemplateFolder)[],
    targetFile: TemplateFile,
    currentPath: string[] = []
): string[] | null {
    for (const item of items) {
        if ("folderName" in item) {
            const result = findPathSegments(
                item.items,
                targetFile,
                [...currentPath, item.folderName]
            );
            if (result) return result;
        } else {
            if (
                item.filename === targetFile.filename &&
                item.fileExtension === targetFile.fileExtension
            ) {
                return [...currentPath, `${item.filename}.${item.fileExtension}`];
            }
        }
    }
    return null;
}

export function Breadcrumbs({ activeFile, templateData }: BreadcrumbsProps) {
    if (!activeFile) return null;

    const segments = findPathSegments(templateData.items, activeFile);
    if (!segments || segments.length === 0) return null;

    return (
        <nav
            aria-label="File path"
            className="flex items-center gap-1 px-4 py-1.5 border-b bg-muted/20 text-xs text-muted-foreground overflow-x-auto scrollbar-hide"
        >
            {segments.map((segment, index) => {
                const isLast = index === segments.length - 1;
                const ext = isLast ? activeFile.fileExtension : undefined;

                return (
                    <span key={index} className="flex items-center gap-1 shrink-0">
                        {index > 0 && (
                            <ChevronRight className="h-3 w-3 text-muted-foreground/40" />
                        )}
                        {isLast && ext && (
                            <FileIcon extension={ext} className="h-3 w-3" />
                        )}
                        <span
                            className={
                                isLast
                                    ? "text-foreground font-medium"
                                    : "hover:text-foreground cursor-default transition-colors"
                            }
                        >
                            {segment}
                        </span>
                    </span>
                );
            })}
        </nav>
    );
}
