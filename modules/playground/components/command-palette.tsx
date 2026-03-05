"use client";

import * as React from "react";
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/ui/command";
import {
    Save,
    Download,
    Eye,
    EyeOff,
    Bot,
    Settings,
    XCircle,
    PanelLeftClose,
    Palette,
} from "lucide-react";
import { FileIcon } from "./file-icon";
import type {
    TemplateFile,
    TemplateFolder,
} from "@/modules/playground/lib/path-to-json";

interface CommandPaletteProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    templateData: TemplateFolder | null;
    onFileSelect: (file: TemplateFile) => void;
    onSave: () => void;
    onSaveAll: () => void;
    onDownload: () => void;
    onTogglePreview: () => void;
    onToggleAI: () => void;
    onToggleSidebar: () => void;
    onOpenSettings: () => void;
    onCloseAllFiles: () => void;
    isPreviewVisible: boolean;
}

function collectFiles(
    items: (TemplateFile | TemplateFolder)[],
    parentPath: string = ""
): { file: TemplateFile; path: string }[] {
    const result: { file: TemplateFile; path: string }[] = [];
    for (const item of items) {
        if ("folderName" in item) {
            const folderPath = parentPath
                ? `${parentPath}/${item.folderName}`
                : item.folderName;
            result.push(...collectFiles(item.items, folderPath));
        } else {
            const filePath = parentPath
                ? `${parentPath}/${item.filename}.${item.fileExtension}`
                : `${item.filename}.${item.fileExtension}`;
            result.push({ file: item, path: filePath });
        }
    }
    return result;
}

export function CommandPalette({
    open,
    onOpenChange,
    templateData,
    onFileSelect,
    onSave,
    onSaveAll,
    onDownload,
    onTogglePreview,
    onToggleAI,
    onToggleSidebar,
    onOpenSettings,
    onCloseAllFiles,
    isPreviewVisible,
}: CommandPaletteProps) {
    const files = React.useMemo(
        () => (templateData ? collectFiles(templateData.items) : []),
        [templateData]
    );

    const runAction = (action: () => void) => {
        onOpenChange(false);
        action();
    };

    return (
        <CommandDialog open={open} onOpenChange={onOpenChange}>
            <CommandInput placeholder="Search files and actions..." />
            <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>

                {/* Files */}
                <CommandGroup heading="Files">
                    {files.map(({ file, path }) => (
                        <CommandItem
                            key={path}
                            value={path}
                            onSelect={() => runAction(() => onFileSelect(file))}
                        >
                            <FileIcon extension={file.fileExtension} className="mr-2" />
                            <span className="flex-1">{file.filename}.{file.fileExtension}</span>
                            <span className="text-[10px] text-muted-foreground/60 font-mono">
                                {path}
                            </span>
                        </CommandItem>
                    ))}
                </CommandGroup>

                <CommandSeparator />

                {/* Actions */}
                <CommandGroup heading="Actions">
                    <CommandItem onSelect={() => runAction(onSave)}>
                        <Save className="mr-2 h-4 w-4" />
                        <span className="flex-1">Save</span>
                        <kbd className="text-[10px] px-1.5 py-0.5 rounded border bg-muted font-mono">
                            Ctrl+S
                        </kbd>
                    </CommandItem>
                    <CommandItem onSelect={() => runAction(onSaveAll)}>
                        <Save className="mr-2 h-4 w-4" />
                        <span className="flex-1">Save All</span>
                        <kbd className="text-[10px] px-1.5 py-0.5 rounded border bg-muted font-mono">
                            Ctrl+Shift+S
                        </kbd>
                    </CommandItem>
                    <CommandItem onSelect={() => runAction(onTogglePreview)}>
                        {isPreviewVisible ? (
                            <EyeOff className="mr-2 h-4 w-4" />
                        ) : (
                            <Eye className="mr-2 h-4 w-4" />
                        )}
                        <span className="flex-1">
                            {isPreviewVisible ? "Hide" : "Show"} Preview
                        </span>
                        <kbd className="text-[10px] px-1.5 py-0.5 rounded border bg-muted font-mono">
                            Ctrl+\
                        </kbd>
                    </CommandItem>
                    <CommandItem onSelect={() => runAction(onToggleAI)}>
                        <Bot className="mr-2 h-4 w-4" />
                        <span className="flex-1">Toggle AI Chat</span>
                        <kbd className="text-[10px] px-1.5 py-0.5 rounded border bg-muted font-mono">
                            Ctrl+Shift+A
                        </kbd>
                    </CommandItem>
                    <CommandItem onSelect={() => runAction(onToggleSidebar)}>
                        <PanelLeftClose className="mr-2 h-4 w-4" />
                        <span className="flex-1">Toggle Sidebar</span>
                        <kbd className="text-[10px] px-1.5 py-0.5 rounded border bg-muted font-mono">
                            Ctrl+B
                        </kbd>
                    </CommandItem>
                    <CommandItem onSelect={() => runAction(onDownload)}>
                        <Download className="mr-2 h-4 w-4" />
                        <span className="flex-1">Download Project</span>
                    </CommandItem>
                    <CommandItem onSelect={() => runAction(onCloseAllFiles)}>
                        <XCircle className="mr-2 h-4 w-4" />
                        <span className="flex-1">Close All Files</span>
                    </CommandItem>
                </CommandGroup>

                <CommandSeparator />

                {/* Settings */}
                <CommandGroup heading="Settings">
                    <CommandItem onSelect={() => runAction(onOpenSettings)}>
                        <Settings className="mr-2 h-4 w-4" />
                        <span>AI Settings</span>
                    </CommandItem>
                </CommandGroup>
            </CommandList>
        </CommandDialog>
    );
}
