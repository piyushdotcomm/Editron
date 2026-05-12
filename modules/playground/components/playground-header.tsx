import React from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuShortcut } from "@/components/ui/dropdown-menu";
import { ThemeSelector } from "./theme-selector";
import { CollaborationAvatars } from "./collaboration-avatars";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
    ArrowLeft,
    Save,
    Eye,
    EyeOff,
    Rocket,
    Users,
    Bot,
    _MoreHorizontal,
    _Download,
    Settings,
    XCircle,
    FolderDown,
    Menu
} from "lucide-react";

interface PlaygroundHeaderProps {
    id: string;
    playgroundData: any;
    openFilesLength: number;
    hasUnsavedChanges: boolean;
    activeFile: any;
    isPreviewVisible: boolean;
    setIsPreviewVisible: (v: boolean) => void;
    handleSave: () => void;
    handleSaveAll: () => void;
    setIsDeployDialogOpen: (v: boolean) => void;
    handleDownloadZip: () => void;
    setShowAISettings: (v: boolean) => void;
    closeAllFiles: () => void;
    toggleAIChat: () => void;
}

export const PlaygroundHeader = ({
    id,
    playgroundData,
    openFilesLength,
    hasUnsavedChanges,
    activeFile,
    isPreviewVisible,
    setIsPreviewVisible,
    handleSave,
    handleSaveAll,
    setIsDeployDialogOpen,
    handleDownloadZip,
    setShowAISettings,
    closeAllFiles,
    toggleAIChat
}: PlaygroundHeaderProps) => {
    return (
        <header className="flex h-12 shrink-0 items-center justify-between gap-2 border-b px-3 bg-background/80 backdrop-blur-md sticky top-0 z-20">
            <div className="flex items-center gap-2 flex-1 min-w-0">
                <SidebarTrigger className="-ml-1" aria-label="Toggle file explorer" />

                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-muted-foreground hover:text-foreground"
                            onClick={() => window.location.href = '/dashboard'}
                            aria-label="Back to Dashboard"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Back to Dashboard</TooltipContent>
                </Tooltip>

                <Separator orientation="vertical" className="mr-1 h-4" />

                {/* Project Title & Status */}
                <div className="flex flex-col flex-1 min-w-0">
                    <h1 className="text-sm font-semibold truncate tracking-tight">
                        {playgroundData?.title || "Code Playground"}
                    </h1>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                            {openFilesLength} file{openFilesLength !== 1 ? "s" : ""} open
                        </span>
                        {hasUnsavedChanges && (
                            <>
                                <span className="w-1 h-1 rounded-full bg-amber-500" />
                                <span className="text-[10px] text-amber-500/80 font-medium tracking-wide">Unsaved</span>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Right Toolbar */}
            <div className="flex items-center gap-1.5 shrink-0">

                {/* Core Actions */}
                <div className="flex items-center gap-1 bg-muted/40 p-0.5 rounded-lg border">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                size="sm"
                                variant={activeFile?.hasUnsavedChanges ? "default" : "ghost"}
                                onClick={() => handleSave()}
                                disabled={!activeFile || !activeFile.hasUnsavedChanges}
                                className={`h-7 px-2.5 text-xs rounded-md transition-all ${activeFile?.hasUnsavedChanges ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                            >
                                <Save className="h-3.5 w-3.5 mr-1" />
                                Save
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Save Active File (Ctrl+S)</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                size="sm"
                                variant={isPreviewVisible ? "secondary" : "ghost"}
                                onClick={() => setIsPreviewVisible(!isPreviewVisible)}
                                className={`h-7 px-2.5 text-xs rounded-md ${isPreviewVisible ? "bg-secondary/80 shadow-sm font-medium" : "text-muted-foreground hover:text-foreground"}`}
                            >
                                {isPreviewVisible ? <EyeOff className="h-3.5 w-3.5 mr-1" /> : <Eye className="h-3.5 w-3.5 mr-1" />}
                                {isPreviewVisible ? "Hide Preview" : "Show Preview"}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Toggle Preview (Ctrl+\)</TooltipContent>
                    </Tooltip>
                </div>

                {/* Deploy */}
                <Button
                    size="sm"
                    onClick={() => setIsDeployDialogOpen(true)}
                    className="h-8 px-3 text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm ml-1"
                >
                    <Rocket className="h-3.5 w-3.5 mr-1.5" />
                    Deploy
                </Button>

                <Separator orientation="vertical" className="h-4 mx-1" />

                {/* Utilities: Collab, Theme, AI, Menu */}
                <CollaborationAvatars playgroundId={id} />

                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted"
                            onClick={() => {
                                const url = `${window.location.origin}/playground/${id}?collab=true`;
                                navigator.clipboard.writeText(url);
                            }}
                            aria-label="Copy Collaboration Link"
                        >
                            <Users className="h-4 w-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Copy Collab Link</TooltipContent>
                </Tooltip>

                <ThemeSelector />

                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-violet-500 hover:text-violet-600 hover:bg-violet-500/10"
                            onClick={toggleAIChat}
                            aria-label="AI Assistant"
                        >
                            <Bot className="h-4 w-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>AI Assistant (Ctrl+Shift+A)</TooltipContent>
                </Tooltip>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            size="icon"
                            variant="outline"
                            className="h-8 w-8 shadow-sm"
                            aria-label="More options"
                        >
                            <Menu className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={handleSaveAll} disabled={!hasUnsavedChanges} className="gap-2">
                            <Save className="h-4 w-4 text-muted-foreground" />
                            <span>Save All</span>
                            <DropdownMenuShortcut>⇧⌘S</DropdownMenuShortcut>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleDownloadZip} className="gap-2">
                            <FolderDown className="h-4 w-4 text-muted-foreground" />
                            <span>Download ZIP</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => setShowAISettings(true)} className="gap-2">
                            <Settings className="h-4 w-4 text-muted-foreground" />
                            <span>AI Settings</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={closeAllFiles} disabled={openFilesLength === 0} className="gap-2 text-red-500 focus:text-red-500">
                            <XCircle className="h-4 w-4" />
                            <span>Close All Tabs</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

            </div>
        </header>
    );
};
