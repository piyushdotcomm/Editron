"use client";

import { ErrorBoundary } from "@/components/error-boundary";
import { SidebarInset, useSidebar } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import PlaygroundSkeleton from "@/modules/playground/components/loader";
import { AlertCircle, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePlayground } from "@/modules/playground/hooks/usePlayground";
import { useAI } from "@/modules/playground/hooks/useAI";
import AIChatPanel from "@/modules/playground/components/ai-chat-panel";
import { useParams } from "next/navigation";
import { useWebContainer } from "@/modules/webcontainers/hooks/useWebContainer";
import { useFileExplorer } from "@/modules/playground/hooks/useFileExplorer";
import { TemplateFile, TemplateFolder } from "@/modules/playground/lib/path-to-json";
import React, { Suspense, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

// Extracted hooks
import { useSaveHandlers } from "@/modules/playground/hooks/useSaveHandlers";
import { useDownload } from "@/modules/playground/hooks/useDownload";
import { usePlaygroundDialogs } from "@/modules/playground/hooks/usePlaygroundDialogs";
import { useKeyboardShortcuts } from "@/modules/playground/hooks/useKeyboardShortcuts";
import { useWrappedFileHandlers } from "@/modules/playground/hooks/useWrappedFileHandlers";

// Extracted components
import { StatusBar } from "@/modules/playground/components/status-bar";
import { PlaygroundHeader } from "@/modules/playground/components/playground-header";
import { PlaygroundSidebar } from "@/modules/playground/components/playground-sidebar";
import { PlaygroundModals } from "@/modules/playground/components/playground-modals";
import { PlaygroundEditorArea } from "@/modules/playground/components/playground-editor-area";

const PlaygroundPageContent = () => {
  const { id } = useParams<{ id: string }>();
  const [cursorPosition, setCursorPosition] = useState({ line: 1, col: 1 });

  const sidebar = useSidebar();
  const dialogs = usePlaygroundDialogs();
  const prevPreviewVisible = useRef(false);

  const { playgroundData, templateData, isLoading, isSuccess, error, saveTemplateData } =
    usePlayground(id);

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
  } = useFileExplorer();

  const {
    serverUrl,
    isLoading: containerLoading,
    error: containerError,
    instance,
    writeFileSync,
  } = useWebContainer({ templateData });

  // Bootstrap
  useEffect(() => {
    resetUI();
    setPlaygroundId(id);
    if (templateData && !openFiles.length) setTemplateData(templateData);
  }, [id, setPlaygroundId, templateData, setTemplateData, openFiles.length]);

  useEffect(() => {
    if (isSuccess && templateData) toast.success("Playground loaded successfully");
  }, [isSuccess, templateData]);

  // Auto-open default file when preview is shown
  useEffect(() => {
  const previewJustOpened =
    dialogs.isPreviewVisible && !prevPreviewVisible.current;

  prevPreviewVisible.current = dialogs.isPreviewVisible;

  if (!previewJustOpened || activeFileId || !templateData) return;

  const defaultNames = [
    "App.tsx",
    "App.jsx",
    "index.tsx",
    "index.jsx",
    "index.js",
    "main.tsx",
    "main.js",
    "index.html",
  ];

  const findDefaultFile = (
    items: (TemplateFile | TemplateFolder)[]
  ): TemplateFile | null => {
    for (const item of items) {
      if ("folderName" in item) {
        const found = findDefaultFile(item.items);
        if (found) return found;
      } else if (
        defaultNames.includes(
          `${item.filename}.${item.fileExtension}`
        )
      ) {
        return item;
      }
    }

    return null;
  };

  const defaultFile = findDefaultFile(templateData.items);

  if (defaultFile) openFile(defaultFile);
}, [
  dialogs.isPreviewVisible,
  activeFileId,
  templateData,
  openFile,
]);

  const { handleSave, handleSaveAll } = useSaveHandlers({
    activeFileId,
    openFiles,
    writeFileSync,
    instance,
    saveTemplateData,
    setTemplateData,
    setOpenFiles,
  });

  const { handleDownloadZip } = useDownload({
    templateData,
    projectTitle: playgroundData?.title,
  });

  const wrappedHandlers = useWrappedFileHandlers({
    instance,
    writeFileSync,
    saveTemplateData,
  });

  useKeyboardShortcuts({
    handleSave,
    handleSaveAll,
    activeFileId,
    closeFile,
    setIsPreviewVisible: dialogs.setIsPreviewVisible,
    setIsCommandPaletteOpen: dialogs.setIsCommandPaletteOpen,
  });

  const activeFile = openFiles.find((f) => f.id === activeFileId);
  const hasUnsavedChanges = openFiles.some((f) => f.hasUnsavedChanges);

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
        <h2 className="text-xl font-semibold text-red-600 mb-2">Something went wrong</h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()} variant="destructive">Try Again</Button>
      </div>
    );
  }

  if (isLoading) return <PlaygroundSkeleton />;

  if (!templateData) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] p-4">
        <FolderOpen className="h-12 w-12 text-amber-500 mb-4" />
        <h2 className="text-xl font-semibold text-amber-600 mb-2">No template data available</h2>
        <Button onClick={() => window.location.reload()} variant="outline">Reload Template</Button>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <>
        <PlaygroundSidebar
          templateData={templateData}
          instance={instance}
          writeFileSync={writeFileSync}
          activeFile={activeFile}
          handleFileSelect={openFile}
          {...wrappedHandlers}
        />

        <SidebarInset
          data-state={sidebar.state}
          className="flex-1 w-auto min-w-0 transition-all ease-linear duration-300 relative bg-background"
        >
          <PlaygroundHeader
            id={id}
            playgroundData={playgroundData}
            openFilesLength={openFiles.length}
            hasUnsavedChanges={hasUnsavedChanges}
            activeFile={activeFile}
            isPreviewVisible={dialogs.isPreviewVisible}
            setIsPreviewVisible={dialogs.setIsPreviewVisible}
            handleSave={() => handleSave()}
            handleSaveAll={handleSaveAll}
            setIsDeployDialogOpen={dialogs.setIsDeployDialogOpen}
            handleDownloadZip={handleDownloadZip}
            setShowAISettings={dialogs.setShowAISettings}
            closeAllFiles={closeAllFiles}
            toggleAIChat={() => useAI.getState().toggleChat()}
          />

          <div className="flex flex-col h-[calc(100vh-3rem)]">
            <div className="flex-1 min-h-0">
              <PlaygroundEditorArea
                openFiles={openFiles}
                activeFileId={activeFileId}
                activeFile={activeFile}
                templateData={templateData}
                isPreviewVisible={dialogs.isPreviewVisible}
                containerLoading={containerLoading}
                containerError={containerError}
                serverUrl={serverUrl}
                instance={instance}
                writeFileSync={writeFileSync}
                projectTitle={playgroundData?.title}
                onCursorChange={(line, col) => setCursorPosition({ line, col })}
                onTogglePreview={() => dialogs.setIsPreviewVisible(true)}
                onOpenAI={() => useAI.getState().toggleChat()}
                onDownload={handleDownloadZip}
                onOpenCommandPalette={() => dialogs.setIsCommandPaletteOpen(true)}
              />
            </div>

            <StatusBar
              activeFile={activeFile}
              cursorPosition={cursorPosition}
              containerStatus={containerStatus}
              collaboratorCount={0}
              openFileCount={openFiles.length}
            />
          </div>
        </SidebarInset>

        <ErrorBoundary name="AIChatPanel">
          <AIChatPanel templateData={templateData} saveTemplateData={saveTemplateData} />
        </ErrorBoundary>

        <PlaygroundModals
          {...dialogs}
          templateData={templateData}
          onFileSelect={openFile}
          onSave={() => handleSave()}
          onSaveAll={handleSaveAll}
          onCloseAllFiles={closeAllFiles}
          onDownload={handleDownloadZip}
          projectName={playgroundData?.title}
        />
      </>
    </TooltipProvider>
  );
};

const MainPlaygroundPage = () => (
  <Suspense fallback={<PlaygroundSkeleton />}>
    <PlaygroundPageContent />
  </Suspense>
);

export default MainPlaygroundPage;
