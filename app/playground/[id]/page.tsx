"use client";

import React, { Suspense, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { AlertCircle, FolderOpen } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SidebarInset, useSidebar } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";

import PlaygroundSkeleton from "@/modules/playground/components/loader";
import { PlaygroundProvider } from "@/modules/playground/contexts/playground-context";
import { usePlayground } from "@/modules/playground/hooks/usePlayground";
import { useWebContainer } from "@/modules/webcontainers/hooks/useWebContainer";
import { useFileExplorer } from "@/modules/playground/hooks/useFileExplorer";
import { usePlaygroundActions } from "@/modules/playground/hooks/usePlaygroundActions";
import { usePlaygroundUI } from "@/modules/playground/hooks/usePlaygroundUI";

// New modular UI components
import { PlaygroundSidebar } from "@/modules/playground/components/playground-sidebar";
import { PlaygroundHeader } from "@/modules/playground/components/playground-header";
import { EditorArea } from "@/modules/playground/components/editor-area";
import { PlaygroundModals } from "@/modules/playground/components/playground-modals";

const PlaygroundPageContent = () => {
  const { id } = useParams<{ id: string }>();
  const sidebar = useSidebar();

  // 1. Fetch data
  const {
    playgroundData,
    templateData,
    isLoading,
    isSuccess,
    error,
    saveTemplateData,
  } = usePlayground(id);

  // 2. Initialize stores and hooks
  const { setTemplateData, setPlaygroundId, openFiles, activeFileId, closeFile, setOpenFiles } = useFileExplorer();
  const setIsPreviewVisible = usePlaygroundUI((s) => s.setIsPreviewVisible);
  const setIsCommandPaletteOpen = usePlaygroundUI((s) => s.setIsCommandPaletteOpen);
  const resetUI = usePlaygroundUI((s) => s.resetUI);

  useEffect(() => {
    if (isSuccess && templateData) {
      toast.success("Playground loaded successfully");
    }
  }, [isSuccess, templateData]);

  const hasHydrated = useRef(false);

  useEffect(() => {
    resetUI();
    setPlaygroundId(id);
    hasHydrated.current = false;
  }, [id, setPlaygroundId, resetUI]);

  useEffect(() => {
    if (templateData && !hasHydrated.current) {
      setTemplateData(templateData);
      hasHydrated.current = true;
    }
  }, [templateData, setTemplateData]);

  // 3. Initialize WebContainer
  const {
    serverUrl,
    isLoading: containerLoading,
    error: containerError,
    instance,
    writeFileSync,
  } = useWebContainer({ templateData });

  // 4. Initialize Playground Actions (saves, downloads, etc)
  const { handleSave, handleSaveAll, handleDownloadZip } = usePlaygroundActions(
    {
      id,
      templateData,
      playgroundData,
      saveTemplateData,
      writeFileSync,
      activeFileId,
      openFiles,
      setTemplateData,
      setOpenFiles,
      closeFile,
      setIsPreviewVisible,
      setIsCommandPaletteOpen,
    }
  );

  // Error States
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

  // Loading state
  if (isLoading) {
    return <PlaygroundSkeleton />;
  }

  // Empty state
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
    <PlaygroundProvider
      id={id}
      templateData={templateData}
      playgroundData={playgroundData}
      saveTemplateData={saveTemplateData}
      instance={instance}
      writeFileSync={writeFileSync || null}
      serverUrl={serverUrl || null}
      containerLoading={containerLoading}
      containerError={containerError || null}
    >
      <TooltipProvider>
        <>
          <PlaygroundSidebar />

          <SidebarInset
            data-state={sidebar.state}
            className="flex-1 w-auto min-w-0 transition-all ease-linear duration-300 relative bg-background"
          >
            <PlaygroundHeader
              handleSave={handleSave}
              handleSaveAll={handleSaveAll}
              handleDownloadZip={handleDownloadZip}
            />
            
            <EditorArea handleDownloadZip={handleDownloadZip} />
          </SidebarInset>

          <PlaygroundModals
            handleSave={handleSave}
            handleSaveAll={handleSaveAll}
            handleDownloadZip={handleDownloadZip}
          />
        </>
      </TooltipProvider>
    </PlaygroundProvider>
  );
};

const MainPlaygroundPage = () => {
  return (
    <Suspense fallback={<PlaygroundSkeleton />}>
      <PlaygroundPageContent />
    </Suspense>
  );
};

export default MainPlaygroundPage;
