"use client";
import { Button } from "@/components/ui/button";
import { ErrorBoundary } from "@/components/error-boundary";
import JSZip from "jszip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import PlaygroundSkeleton from "@/modules/playground/components/loader";
import dynamic from "next/dynamic";

const PlaygroundEditor = dynamic(
  () => import("@/modules/playground/components/playground-editor"),
  { ssr: false }
);

import {
  AlertCircle,
  ArrowLeft,
  Bot,
  Download,
  Eye,
  EyeOff,
  FolderOpen,
  MoreHorizontal,
  Save,
  Settings,
  Users,
  X,
  XCircle,
} from "lucide-react";
import { CollaborationAvatars } from "@/modules/playground/components/collaboration-avatars";
import { TemplateFileTree } from "@/modules/playground/components/playground-explorer";
import { usePlayground } from "@/modules/playground/hooks/usePlayground";
import { useAI } from "@/modules/playground/hooks/useAI";
import AIChatPanel from "@/modules/playground/components/ai-chat-panel";
import AISettingsDialog from "@/modules/playground/components/ai-settings-dialog";
import { ThemeSelector } from "@/modules/playground/components/theme-selector";
import { useParams } from "next/navigation";
import WebContainerPreview from "@/modules/webcontainers/components/webcontainer-preview";
import { useWebContainer } from "@/modules/webcontainers/hooks/useWebContainer";
import { useFileExplorer } from "@/modules/playground/hooks/useFileExplorer";
import { findFilePath } from "@/modules/playground/lib";
import {
  TemplateFile,
  TemplateFolder,
} from "@/modules/playground/lib/path-to-json";
import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";

// New components
import { FileIcon } from "@/modules/playground/components/file-icon";
import { StatusBar } from "@/modules/playground/components/status-bar";
import { WelcomeScreen } from "@/modules/playground/components/welcome-screen";
import { Breadcrumbs } from "@/modules/playground/components/breadcrumbs";
import { CommandPalette } from "@/modules/playground/components/command-palette";
import { PackageManager } from "@/modules/playground/components/package-manager";
import { EnvManager } from "@/modules/playground/components/env-manager";
import { DeployDialog } from "@/modules/playground/components/deploy-dialog";
import { Rocket } from "lucide-react";

const MainPlaygroundPage = () => {
  const { id } = useParams<{ id: string }>();
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [showAISettings, setShowAISettings] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isDeployDialogOpen, setIsDeployDialogOpen] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ line: 1, col: 1 });
  const { playgroundData, templateData, isLoading, error, saveTemplateData } =
    usePlayground(id);
  const sidebar = useSidebar();

  const {
    setTemplateData,
    setActiveFileId,
    setPlaygroundId,
    setOpenFiles,
    activeFileId,
    closeAllFiles,
    closeFile,
    openFile,
    openFiles,
    handleAddFile,
    handleAddFolder,
    handleDeleteFile,
    handleDeleteFolder,
    handleRenameFile,
    handleRenameFolder,
    updateFileContent
  } = useFileExplorer();
  const {
    serverUrl,
    isLoading: containerLoading,
    error: containerError,
    instance,
    writeFileSync,
    // @ts-ignore
  } = useWebContainer({ templateData });

  const lastSyncedContent = useRef<Map<string, string>>(new Map());
  useEffect(() => {
    setPlaygroundId(id);
    if (templateData && !openFiles.length) {
      setTemplateData(templateData);
    }
  }, [id, setPlaygroundId, templateData, setTemplateData, openFiles.length]);

  // Auto-open default file when preview is shown if no file is open
  useEffect(() => {
    if (isPreviewVisible && !activeFileId && templateData) {
      const findDefaultFile = (items: any[]): TemplateFile | null => {
        for (const item of items) {
          if (!("folderName" in item)) {
            if (["App.tsx", "App.jsx", "index.tsx", "index.jsx", "index.js", "main.tsx", "main.js", "index.html"].includes(`${item.filename}.${item.fileExtension}`)) {
              return item;
            }
          } else {
            const found = findDefaultFile(item.items);
            if (found) return found;
          }
        }
        return null;
      };

      const defaultFile = findDefaultFile(templateData.items);
      if (defaultFile) {
        openFile(defaultFile);
      }
    }
  }, [isPreviewVisible, activeFileId, templateData, openFile]);

  // Create wrapper functions that pass saveTemplateData
  const wrappedHandleAddFile = useCallback(
    (newFile: TemplateFile, parentPath: string) => {
      return handleAddFile(
        newFile,
        parentPath,
        writeFileSync!,
        instance,
        saveTemplateData
      );
    },
    [handleAddFile, writeFileSync, instance, saveTemplateData]
  );

  const wrappedHandleAddFolder = useCallback(
    (newFolder: TemplateFolder, parentPath: string) => {
      return handleAddFolder(newFolder, parentPath, instance, saveTemplateData);
    },
    [handleAddFolder, instance, saveTemplateData]
  );

  const wrappedHandleDeleteFile = useCallback(
    (file: TemplateFile, parentPath: string) => {
      return handleDeleteFile(file, parentPath, saveTemplateData);
    },
    [handleDeleteFile, saveTemplateData]
  );

  const wrappedHandleDeleteFolder = useCallback(
    (folder: TemplateFolder, parentPath: string) => {
      return handleDeleteFolder(folder, parentPath, saveTemplateData);
    },
    [handleDeleteFolder, saveTemplateData]
  );

  const wrappedHandleRenameFile = useCallback(
    (
      file: TemplateFile,
      newFilename: string,
      newExtension: string,
      parentPath: string
    ) => {
      return handleRenameFile(
        file,
        newFilename,
        newExtension,
        parentPath,
        saveTemplateData
      );
    },
    [handleRenameFile, saveTemplateData]
  );

  const wrappedHandleRenameFolder = useCallback(
    (folder: TemplateFolder, newFolderName: string, parentPath: string) => {
      return handleRenameFolder(
        folder,
        newFolderName,
        parentPath,
        saveTemplateData
      );
    },
    [handleRenameFolder, saveTemplateData]
  );

  const activeFile = openFiles.find((file) => file.id === activeFileId);
  const hasUnsavedChanges = openFiles.some((file) => file.hasUnsavedChanges);

  const handleFileSelect = (file: TemplateFile) => {
    openFile(file);
  };
  const handleSave = useCallback(
    async (fileId?: string) => {
      const targetFileId = fileId || activeFileId;
      if (!targetFileId) return;

      const fileToSave = openFiles.find((f) => f.id === targetFileId);

      if (!fileToSave) return;

      const latestTemplateData = useFileExplorer.getState().templateData;
      if (!latestTemplateData) return

      try {
        const filePath = findFilePath(fileToSave, latestTemplateData);
        if (!filePath) {
          toast.error(
            `Could not find path for file: ${fileToSave.filename}.${fileToSave.fileExtension}`
          );
          return;
        }

        const updatedTemplateData = JSON.parse(
          JSON.stringify(latestTemplateData)
        );

        // @ts-ignore
        const updateFileContent = (items: any[]) =>
          // @ts-ignore
          items.map((item) => {
            if ("folderName" in item) {
              return { ...item, items: updateFileContent(item.items) };
            } else if (
              item.filename === fileToSave.filename &&
              item.fileExtension === fileToSave.fileExtension
            ) {
              return { ...item, content: fileToSave.content };
            }
            return item;
          });
        updatedTemplateData.items = updateFileContent(
          updatedTemplateData.items
        );

        // Sync with WebContainer
        if (writeFileSync) {
          await writeFileSync(filePath, fileToSave.content);
          lastSyncedContent.current.set(fileToSave.id, fileToSave.content);
          if (instance && instance.fs) {
            await instance.fs.writeFile(filePath, fileToSave.content);
          }
        }

        await saveTemplateData(updatedTemplateData);
        setTemplateData(updatedTemplateData);
        // Update open files
        const updatedOpenFiles = openFiles.map((f) =>
          f.id === targetFileId
            ? {
              ...f,
              content: fileToSave.content,
              originalContent: fileToSave.content,
              hasUnsavedChanges: false,
            }
            : f
        );
        setOpenFiles(updatedOpenFiles);

        toast.success(
          `Saved ${fileToSave.filename}.${fileToSave.fileExtension}`
        );
      } catch (error) {
        console.error("Error saving file:", error);
        toast.error(
          `Failed to save ${fileToSave.filename}.${fileToSave.fileExtension}`
        );
        throw error;
      }
    },
    [
      activeFileId,
      openFiles,
      writeFileSync,
      instance,
      saveTemplateData,
      setTemplateData,
      setOpenFiles,
    ]
  );

  const handleSaveAll = async () => {
    const unsavedFiles = openFiles.filter((f) => f.hasUnsavedChanges);

    if (unsavedFiles.length === 0) {
      toast.info("No unsaved changes");
      return;
    }

    try {
      await Promise.all(unsavedFiles.map((f) => handleSave(f.id)));
      toast.success(`Saved ${unsavedFiles.length} file(s)`);
    } catch (error) {
      toast.error("Failed to save some files");
    }
  };

  // recursive function to add files to zip
  const addFilesToZip = (folder: TemplateFolder, zipFolder: JSZip) => {
    folder.items.forEach((item) => {
      if ("folderName" in item) {
        const newFolder = zipFolder.folder(item.folderName);
        if (newFolder) {
          addFilesToZip(item, newFolder);
        }
      } else {
        zipFolder.file(item.filename + (item.fileExtension ? `.${item.fileExtension}` : ""), item.content);
      }
    });
  };

  const handleDownloadZip = async () => {
    if (!templateData) return;

    try {
      const zip = new JSZip();
      addFilesToZip(templateData, zip);

      const content = await zip.generateAsync({ type: "blob" });
      const url = window.URL.createObjectURL(content);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${playgroundData?.title || "project"}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Project downloaded successfully");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download project");
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+S — Save
      if (e.ctrlKey && !e.shiftKey && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
      // Ctrl+Shift+S — Save All
      if (e.ctrlKey && e.shiftKey && e.key === "S") {
        e.preventDefault();
        handleSaveAll();
      }
      // Ctrl+K or Ctrl+Shift+P — Command Palette
      if ((e.ctrlKey && e.key === "k") || (e.ctrlKey && e.shiftKey && e.key === "P")) {
        e.preventDefault();
        setIsCommandPaletteOpen(true);
      }
      // Ctrl+B — Toggle Sidebar
      if (e.ctrlKey && !e.shiftKey && e.key === "b") {
        e.preventDefault();
        sidebar.toggleSidebar();
      }
      // Ctrl+\ — Toggle Preview
      if (e.ctrlKey && e.key === "\\") {
        e.preventDefault();
        setIsPreviewVisible((prev) => !prev);
      }
      // Ctrl+Shift+A — Toggle AI Chat
      if (e.ctrlKey && e.shiftKey && e.key === "A") {
        e.preventDefault();
        useAI.getState().toggleChat();
      }
      // Ctrl+W — Close current tab
      if (e.ctrlKey && !e.shiftKey && e.key === "w") {
        e.preventDefault();
        if (activeFileId) {
          closeFile(activeFileId);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSave, handleSaveAll, sidebar, activeFileId, closeFile]);

  // Derive container status
  const containerStatus: "idle" | "building" | "running" | "error" = containerError
    ? "error"
    : containerLoading
      ? "building"
      : serverUrl
        ? "running"
        : "idle";

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] p-4">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold text-red-600 mb-2">
          Something went wrong
        </h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()} variant="destructive">
          Try Again
        </Button>
      </div>
    );
  }

  // Loading state — skeleton
  if (isLoading) {
    return <PlaygroundSkeleton />;
  }

  // No template data
  if (!templateData) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] p-4">
        <FolderOpen className="h-12 w-12 text-amber-500 mb-4" />
        <h2 className="text-xl font-semibold text-amber-600 mb-2">
          No template data available
        </h2>
        <Button onClick={() => window.location.reload()} variant="outline">
          Reload Template
        </Button>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <>
        <TemplateFileTree
          data={templateData!}
          onFileSelect={handleFileSelect}
          selectedFile={activeFile}
          title="File Explorer"
          onAddFile={wrappedHandleAddFile}
          onAddFolder={wrappedHandleAddFolder}
          onDeleteFile={wrappedHandleDeleteFile}
          onDeleteFolder={wrappedHandleDeleteFolder}
          onRenameFile={wrappedHandleRenameFile}
          onRenameFolder={wrappedHandleRenameFolder}
        />
        {/* We add PackageManager, and EnvManager below the FileTree in the sidebar */}
        <div className="absolute top-[50%] bottom-0 w-[var(--sidebar-width)] flex flex-col border-t bg-sidebar group-data-[state=collapsed]:hidden z-10 transition-all duration-300">
          <div className="flex-1 overflow-y-auto custom-scrollbar pb-8">
            <PackageManager
              templateData={templateData}
              instance={instance}
            />
            <EnvManager
              templateData={templateData}
              instance={instance}
              writeFileSync={writeFileSync!}
            />
          </div>
        </div>
        <SidebarInset>
          {/* ==== HEADER ==== */}
          <header className="flex h-12 shrink-0 items-center gap-2 border-b px-3">
            <SidebarTrigger className="-ml-1" aria-label="Toggle file explorer" />
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7"
                  onClick={() => window.location.href = '/dashboard'}
                  aria-label="Back to Dashboard"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Back to Dashboard</TooltipContent>
            </Tooltip>
            <Separator orientation="vertical" className="mr-1 h-4" />

            {/* Title */}
            <div className="flex flex-col flex-1 min-w-0">
              <h1 className="text-sm font-medium truncate">
                {playgroundData?.title || "Code Playground"}
              </h1>
              <p className="text-[11px] text-muted-foreground">
                {openFiles.length} file{openFiles.length !== 1 ? "s" : ""} open
                {hasUnsavedChanges && " • Unsaved changes"}
              </p>
            </div>

            {/* Right toolbar */}
            <div className="flex items-center gap-1">
              {/* Primary: Save + Preview */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant={activeFile?.hasUnsavedChanges ? "default" : "outline"}
                    onClick={() => handleSave()}
                    disabled={!activeFile || !activeFile.hasUnsavedChanges}
                    className="h-7 px-2.5 text-xs"
                    aria-label="Save file (Ctrl+S)"
                  >
                    <Save className="h-3.5 w-3.5 mr-1" />
                    Save
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Save (Ctrl+S)</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant={isPreviewVisible ? "default" : "outline"}
                    onClick={() => setIsPreviewVisible(!isPreviewVisible)}
                    className="h-7 px-2.5 text-xs"
                    aria-label={`${isPreviewVisible ? "Hide" : "Show"} Preview (Ctrl+\\)`}
                  >
                    {isPreviewVisible ? <EyeOff className="h-3.5 w-3.5 mr-1" /> : <Eye className="h-3.5 w-3.5 mr-1" />}
                    Preview
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{isPreviewVisible ? "Hide" : "Show"} Preview (Ctrl+\)</TooltipContent>
              </Tooltip>

              <div className="mx-1 h-4 w-px bg-border" />

              {/* Deploy */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="default"
                    className="h-7 px-2.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white"
                    onClick={() => setIsDeployDialogOpen(true)}
                    aria-label="Deploy to Cloud"
                  >
                    <Rocket className="h-3.5 w-3.5 mr-1" />
                    Deploy
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Deploy to Vercel/Netlify</TooltipContent>
              </Tooltip>

              <div className="mx-1 h-4 w-px bg-border" />

              <div className="mx-1 h-4 w-px bg-border" />

              {/* Collaboration */}
              <CollaborationAvatars playgroundId={id as string} />

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 px-2.5 text-xs"
                    onClick={() => {
                      const url = `${window.location.origin}/playground/${id}?collab=true`;
                      navigator.clipboard.writeText(url);
                      toast.success("Collaboration link copied to clipboard!");
                    }}
                    aria-label="Share collaboration link"
                  >
                    <Users className="h-3.5 w-3.5 mr-1" />
                    Share
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Invite collaborators</TooltipContent>
              </Tooltip>

              <div className="mx-1 h-4 w-px bg-border" />

              {/* Theme + AI */}
              <ThemeSelector />

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="default"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => useAI.getState().toggleChat()}
                    aria-label="Toggle AI Chat (Ctrl+Shift+A)"
                  >
                    <Bot className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>AI Chat (Ctrl+Shift+A)</TooltipContent>
              </Tooltip>

              {/* Overflow menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                    aria-label="More actions"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleSaveAll} disabled={!hasUnsavedChanges}>
                    <Save className="h-4 w-4 mr-2" />
                    Save All
                    <span className="ml-auto text-xs text-muted-foreground">Ctrl+Shift+S</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDownloadZip}>
                    <Download className="h-4 w-4 mr-2" />
                    Download Project
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setShowAISettings(true)}>
                    <Settings className="h-4 w-4 mr-2" />
                    AI Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={closeAllFiles} disabled={openFiles.length === 0}>
                    <XCircle className="h-4 w-4 mr-2" />
                    Close All Files
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          {/* ==== CONTENT ==== */}
          <div className="flex flex-col h-[calc(100vh-3rem)]">
            <div className="flex-1 min-h-0">
              {openFiles.length > 0 ? (
                <div className="h-full flex flex-col">
                  {/* Tab bar */}
                  <div className="border-b bg-muted/30">
                    <Tabs
                      value={activeFileId || ""}
                      onValueChange={setActiveFileId}
                    >
                      <div className="flex items-center justify-between px-2 py-1">
                        <div className="overflow-x-auto scrollbar-hide flex-1">
                          <TabsList className="h-8 bg-transparent p-0 inline-flex" role="tablist">
                            {openFiles.map((file) => (
                              <TabsTrigger
                                key={file.id}
                                value={file.id}
                                role="tab"
                                className="relative h-7 px-3 text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm group transition-all duration-150"
                              >
                                <div className="flex items-center gap-1.5">
                                  <FileIcon extension={file.fileExtension} className="h-3 w-3" />
                                  <span>
                                    {file.filename}.{file.fileExtension}
                                  </span>
                                  {file.hasUnsavedChanges && (
                                    <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                                  )}
                                  <span
                                    className="ml-1 h-4 w-4 hover:bg-destructive hover:text-destructive-foreground rounded-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      closeFile(file.id);
                                    }}
                                    role="button"
                                    aria-label={`Close ${file.filename}.${file.fileExtension}`}
                                  >
                                    <X className="h-3 w-3" />
                                  </span>
                                </div>
                              </TabsTrigger>
                            ))}
                          </TabsList>
                        </div>

                        {openFiles.length > 1 && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={closeAllFiles}
                            className="h-6 px-2 text-[10px] shrink-0 ml-1"
                            aria-label="Close all files"
                          >
                            Close All
                          </Button>
                        )}
                      </div>
                    </Tabs>
                  </div>

                  {/* Breadcrumbs */}
                  <Breadcrumbs activeFile={activeFile} templateData={templateData} />

                  {/* Editor + Preview */}
                  <div className="flex-1 min-h-0" role="tabpanel">
                    <ResizablePanelGroup
                      direction="horizontal"
                      className="h-full"
                    >
                      <ResizablePanel defaultSize={isPreviewVisible ? 50 : 100}>
                        <ErrorBoundary name="MonacoEditor">
                          <PlaygroundEditor
                            activeFile={activeFile}
                            content={activeFile?.content || ""}
                            onContentChange={(value) =>
                              activeFileId && updateFileContent(activeFileId, value)
                            }
                            onCursorChange={(line, col) => setCursorPosition({ line, col })}
                          />
                        </ErrorBoundary>
                      </ResizablePanel>
                      {isPreviewVisible && (
                        <>
                          <ResizableHandle />
                          <ResizablePanel defaultSize={50}>
                            <WebContainerPreview
                              templateData={templateData!}
                              instance={instance}
                              writeFileSync={writeFileSync}
                              isLoading={containerLoading}
                              error={containerError}
                              serverUrl={serverUrl!}
                              forceResetup={false}
                            />
                          </ResizablePanel>
                        </>
                      )}
                    </ResizablePanelGroup>
                  </div>
                </div>
              ) : (
                <WelcomeScreen
                  projectTitle={playgroundData?.title}
                  onTogglePreview={() => setIsPreviewVisible(true)}
                  onOpenAI={() => useAI.getState().toggleChat()}
                  onDownload={handleDownloadZip}
                  onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
                />
              )}
            </div>

            {/* Status Bar */}
            <StatusBar
              activeFile={activeFile}
              cursorPosition={cursorPosition}
              containerStatus={containerStatus}
              collaboratorCount={0}
              openFileCount={openFiles.length}
            />
          </div>
        </SidebarInset>

        {/* AI Chat Panel */}
        <AIChatPanel
          templateData={templateData}
          saveTemplateData={saveTemplateData}
        />
        <AISettingsDialog open={showAISettings} onOpenChange={setShowAISettings} />

        {/* Command Palette */}
        <CommandPalette
          open={isCommandPaletteOpen}
          // ... existing props
          onOpenChange={setIsCommandPaletteOpen}
          templateData={templateData}
          onFileSelect={handleFileSelect}
          onSave={() => handleSave()}
          onSaveAll={handleSaveAll}
          onDownload={handleDownloadZip}
          onTogglePreview={() => setIsPreviewVisible((prev) => !prev)}
          onToggleAI={() => useAI.getState().toggleChat()}
          onToggleSidebar={() => sidebar.toggleSidebar()}
          onOpenSettings={() => setShowAISettings(true)}
          onCloseAllFiles={closeAllFiles}
          isPreviewVisible={isPreviewVisible}
        />

        <DeployDialog
          open={isDeployDialogOpen}
          onOpenChange={setIsDeployDialogOpen}
          templateData={templateData}
          projectName={playgroundData?.title}
        />
      </>
    </TooltipProvider>
  );
};

export default MainPlaygroundPage;