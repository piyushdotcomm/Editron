"use client";

import React, { useEffect } from "react";
import { useParams } from "next/navigation";
import { AlertCircle, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import PlaygroundSkeleton from "@/modules/playground/components/loader";

import { usePlayground } from "@/modules/playground/hooks/usePlayground";
import { useFileExplorer } from "@/modules/playground/hooks/useFileExplorer";
import { useWebContainer } from "@/modules/webcontainers/hooks/useWebContainer";
import { PlaygroundContext } from "@/modules/playground/components/playground-context";

import { PlaygroundLayout } from "@/modules/playground/components/playground-layout";
import { PlaygroundSidebar } from "@/modules/playground/components/playground-sidebar";
import { PlaygroundMainArea } from "@/modules/playground/components/playground-main-area";
import { PlaygroundModalOrchestrator } from "@/modules/playground/components/playground-modal-orchestrator";

export default function MainPlaygroundPage() {
  const { id } = useParams<{ id: string }>();
  
  const { playgroundData, templateData, isLoading, error, saveTemplateData } = usePlayground(id);
  
  const { setTemplateData, setPlaygroundId, openFiles } = useFileExplorer();
  
  const {
    serverUrl,
    isLoading: containerLoading,
    error: containerError,
    instance,
    writeFileSync,
    // @ts-ignore
  } = useWebContainer({ templateData });

  useEffect(() => {
    setPlaygroundId(id);
    if (templateData && !openFiles.length) {
      setTemplateData(templateData);
    }
  }, [id, setPlaygroundId, templateData, setTemplateData, openFiles.length]);

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

  if (isLoading) {
    return <PlaygroundSkeleton />;
  }

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
    <PlaygroundContext.Provider
      value={{
        id: id as string,
        playgroundData,
        templateData,
        saveTemplateData,
        instance,
        writeFileSync,
        serverUrl,
        containerLoading,
        containerError,
      }}
    >
      <PlaygroundLayout sidebar={<PlaygroundSidebar />}>
        <PlaygroundMainArea />
        <PlaygroundModalOrchestrator />
      </PlaygroundLayout>
    </PlaygroundContext.Provider>
  );
}