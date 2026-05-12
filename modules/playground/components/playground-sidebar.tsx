import React, { useState } from "react";
import { FolderOpen, Package, Server } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import { TemplateFileTree } from "./playground-explorer";
import { PackageManager } from "./package-manager";
import { EnvManager } from "./env-manager";

interface PlaygroundSidebarProps {
    templateData: any;
    instance: any;
    writeFileSync: any;
    activeFile: any;
    handleFileSelect: any;
    wrappedHandleAddFile: any;
    wrappedHandleAddFolder: any;
    wrappedHandleDeleteFile: any;
    wrappedHandleDeleteFolder: any;
    wrappedHandleRenameFile: any;
    wrappedHandleRenameFolder: any;
}

export const PlaygroundSidebar = ({
    templateData,
    instance,
    writeFileSync,
    activeFile,
    handleFileSelect,
    wrappedHandleAddFile,
    wrappedHandleAddFolder,
    wrappedHandleDeleteFile,
    wrappedHandleDeleteFolder,
    wrappedHandleRenameFile,
    wrappedHandleRenameFolder
}: PlaygroundSidebarProps) => {
    const [activeTab, setActiveTab] = useState<"explorer" | "packages" | "env">("explorer");
    const { state } = useSidebar();

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
            </div>

            {/* Primary Sidebar Content */}
            <div className="flex-1 flex flex-col pt-3 min-w-0 bg-transparent">
                <div className="px-4 pb-2 mb-2 border-b border-border/50">
                    <h2 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                        {activeTab === "explorer" && "Explorer"}
                        {activeTab === "packages" && "Dependencies"}
                        {activeTab === "env" && "Environment Variables"}
                    </h2>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar px-2 pb-8">
                    {activeTab === "explorer" && (
                        <div className="-mx-2 mt-[-8px]">
                            <TemplateFileTree
                                data={templateData}
                                onFileSelect={handleFileSelect}
                                selectedFile={activeFile}
                                title=""
                                onAddFile={wrappedHandleAddFile}
                                onAddFolder={wrappedHandleAddFolder}
                                onDeleteFile={wrappedHandleDeleteFile}
                                onDeleteFolder={wrappedHandleDeleteFolder}
                                onRenameFile={wrappedHandleRenameFile}
                                onRenameFolder={wrappedHandleRenameFolder}
                            />
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
                            templateData={templateData}
                            instance={instance}
                            writeFileSync={writeFileSync}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};
