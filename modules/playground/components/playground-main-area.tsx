import React, { useState } from 'react';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { ErrorBoundary } from "@/components/error-boundary";
import { PlaygroundHeader } from './playground-header';
import { PlaygroundTabBar } from './playground-tab-bar';
import { Breadcrumbs } from './breadcrumbs';
import { StatusBar } from './status-bar';
import { WelcomeScreen } from './welcome-screen';
import WebContainerPreview from '@/modules/webcontainers/components/webcontainer-preview';
import dynamic from 'next/dynamic';
import { usePlaygroundContext } from './playground-context';
import { useFileExplorer } from '../hooks/useFileExplorer';
import { useModalStore } from '../hooks/useModalStore';
import { useAI } from '../hooks/useAI';
import { usePlaygroundActions } from '../hooks/usePlaygroundActions';

const PlaygroundEditor = dynamic(
  () => import("@/modules/playground/components/playground-editor"),
  { ssr: false }
);

import { TemplateFile } from '../lib/path-to-json';

export const PlaygroundMainArea = () => {
  const { templateData, instance, writeFileSync, containerLoading, containerError, serverUrl, playgroundData } = usePlaygroundContext();
  const { openFiles, activeFileId, setActiveFileId, closeFile, updateFileContent, openFile } = useFileExplorer();
  const { isPreviewVisible, togglePreview, setIsCommandPaletteOpen } = useModalStore();
  const { handleDownloadZip } = usePlaygroundActions();
  const toggleAIChat = useAI(state => state.toggleChat);
  
  const [cursorPosition, setCursorPosition] = useState({ line: 1, col: 1 });
  const activeFile = openFiles.find(f => f.id === activeFileId);

  React.useEffect(() => {
    if (isPreviewVisible && !activeFileId && templateData) {
      const findDefaultFile = (items: any[]): TemplateFile | null => {
        for (const item of items) {
          if (!("folderName" in item)) {
            if (["App.tsx", "App.jsx", "index.tsx", "index.jsx", "index.js", "main.tsx", "main.js", "index.html"].includes(`${item.filename}.${item.fileExtension}`)) {
              return item as TemplateFile;
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

  const containerStatus: "idle" | "building" | "running" | "error" = containerError
    ? "error"
    : containerLoading
      ? "building"
      : serverUrl
        ? "running"
        : "idle";

  return (
    <>
      <PlaygroundHeader />
      <div className="flex flex-col h-[calc(100vh-3rem)]">
        <div className="flex-1 min-h-0">
          {openFiles.length > 0 ? (
            <div className="h-full flex flex-col">
              <PlaygroundTabBar
                openFiles={openFiles}
                activeFileId={activeFileId}
                setActiveFileId={setActiveFileId}
                closeFile={closeFile}
              />
              <Breadcrumbs activeFile={activeFile} templateData={templateData!} />
              <div className="flex-1 min-h-0" role="tabpanel">
                <ResizablePanelGroup direction="horizontal" className="h-full">
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
              onTogglePreview={togglePreview}
              onOpenAI={toggleAIChat}
              onDownload={handleDownloadZip}
              onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
            />
          )}
        </div>
        <StatusBar
          activeFile={activeFile}
          cursorPosition={cursorPosition}
          containerStatus={containerStatus}
          collaboratorCount={0}
          openFileCount={openFiles.length}
        />
      </div>
    </>
  );
};
