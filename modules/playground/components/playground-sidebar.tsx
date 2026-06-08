import React, { useState } from "react";
import { FolderOpen, Package, Server } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import { TemplateFileTree } from "./playground-explorer";
import { PackageManager } from "./package-manager";
import { EnvManager } from "./env-manager";
import { usePlaygroundContext } from "@/modules/playground/contexts/playground-context";
import { useWrappedFileOperations } from "@/modules/playground/hooks/useWrappedFileOperations";
import { useFileExplorer } from "@/modules/playground/hooks/useFileExplorer";
import { TemplateFile } from "../lib/path-to-json";
import { GitBranch } from "lucide-react";
import { GitSourceControl } from "./git-source-control";
import { GitDiffViewer } from "./git-diff-viewer";

export const PlaygroundSidebar = () => {
    const [activeTab, setActiveTab] = useState<"explorer" | "packages" | "env" | "git">("explorer");
    const [diffFile, setDiffFile] = useState<string | null>(null);
    const { state } = useSidebar();
    const { templateData, instance, writeFileSync } = usePlaygroundContext();
    const { openFiles, activeFileId, secondaryActiveFileId, focusedPane, openFile } = useFileExplorer();
    const currentActiveId = focusedPane === 'primary' ? activeFileId : secondaryActiveFileId;
    const activeFile = openFiles.find((file) => file.id === currentActiveId) || null;

    const {
        wrappedHandleAddFile,
        wrappedHandleAddFolder,
        wrappedHandleDeleteFile,
        wrappedHandleDeleteFolder,
        wrappedHandleRenameFile,
        wrappedHandleRenameFolder
    } = useWrappedFileOperations();

    const handleFileSelect = (file: TemplateFile) => {
        openFile(file);
    };

    return (
        <div
            data-state={state}
            className="w-[18rem] shrink-0 flex h-screen border-r bg-sidebar z-10
                       data-[state=collapsed]:w-0 data-[state=collapsed]:overflow-hidden
                       transition-[width] duration-300 ease-linear"
        >
            {/* Activity Bar (VS Code style) */}
            <div className="w-12 border-r flex flex-col items-center py-4 gap-4 bg-background">
                <button
                    onClick={() => setActiveTab("explorer")}
                    className={`p-2 rounded-lg transition-colors ${activeTab === "explorer" ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground"}`}
                    title="Explorer"
                >
                    <FolderOpen className="h-5 w-5" />
                </button>
                <button
                    onClick={() => setActiveTab("packages")}
                    className={`p-2 rounded-lg transition-colors ${activeTab === "packages" ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground"}`}
                    title="Dependencies"
                >
                    <Package className="h-5 w-5" />
                </button>
                <button
                    onClick={() => setActiveTab("env")}
                    className={`p-2 rounded-lg transition-colors ${activeTab === "env" ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground"}`}
                    title="Environment"
                >
                    <Server className="h-5 w-5" />
                </button>
                <button
                    onClick={() => setActiveTab("git")}
                    className={`p-2 rounded-lg transition-colors ${activeTab === "git" ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground"}`}
                    title="Source Control"
                >
                    <GitBranch className="h-5 w-5" />
                </button>
            </div>

            {/* Primary Sidebar Content */}
            <div className="flex-1 flex flex-col pt-3 min-w-0 bg-transparent">
                <div className="px-4 pb-2 mb-2 border-b border-border/50">
                    <h2 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                        {activeTab === "explorer" && "Explorer"}
                        {activeTab === "packages" && "Dependencies"}
                        {activeTab === "env" && "Environment Variables"}
                        {activeTab === "git" && "Source Control"}
                    </h2>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar px-2 pb-8">
                    {activeTab === "explorer" && (
                        <div className="-mx-2 mt-[-8px]">
                            {templateData ? (
                                <TemplateFileTree
                                    data={templateData}
                                    onFileSelect={handleFileSelect}
                                    selectedFile={activeFile || undefined}
                                    title=""
                                    onAddFile={wrappedHandleAddFile}
                                    onAddFolder={wrappedHandleAddFolder}
                                    onDeleteFile={wrappedHandleDeleteFile}
                                    onDeleteFolder={wrappedHandleDeleteFolder}
                                    onRenameFile={wrappedHandleRenameFile}
                                    onRenameFolder={wrappedHandleRenameFolder}
                                />
                            ) : (
                                <div className="p-4 text-sm text-muted-foreground">Loading...</div>
                            )}
                        </div>
                    )}

                    {activeTab === "packages" && (
                        <PackageManager
                            templateData={templateData}
                            instance={instance}
                        />
                    )}

                    {activeTab === "env" && (
                        <EnvManager
                            instance={instance}
                        />
                    )}

                    {activeTab === "git" && (
                        <GitSourceControl onOpenFileDiff={(filepath) => setDiffFile(filepath)} />
                    )}
                </div>
            </div>

            <GitDiffViewer 
                filepath={diffFile} 
                onClose={() => setDiffFile(null)} 
            />
        </div>
    );
};
