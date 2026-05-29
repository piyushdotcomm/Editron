"use client";

import React, { useEffect } from "react";
import dynamic from "next/dynamic";
import { ErrorBoundary } from "@/components/error-boundary";
import { Button } from "@/components/ui/button";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { PlaygroundTabBar } from "@/modules/playground/components/playground-tab-bar";
import { Breadcrumbs } from "@/modules/playground/components/breadcrumbs";
import { StatusBar } from "@/modules/playground/components/status-bar";
import { WelcomeScreen } from "@/modules/playground/components/welcome-screen";
import WebContainerPreview from "@/modules/webcontainers/components/webcontainer-preview";
import { usePlaygroundContext } from "@/modules/playground/contexts/playground-context";
import { usePlaygroundUI } from "@/modules/playground/hooks/usePlaygroundUI";
import { useFileExplorer } from "@/modules/playground/hooks/useFileExplorer";
import { useAI } from "@/modules/playground/hooks/useAI";
import type {
  TemplateFile,
  TemplateFolder,
} from "@/modules/playground/lib/path-to-json";
import { useCollaboratorCount } from "@/modules/playground/hooks/useCollaboratorCount";
import { useYjsWebContainerSync } from "@/modules/playground/hooks/useYjsWebContainerSync";

const PlaygroundEditor = dynamic(
  () => import("@/modules/playground/components/playground-editor"),
  { ssr: false }
);

interface EditorAreaProps {
  handleDownloadZip: () => void;
}

export const EditorArea: React.FC<EditorAreaProps> = ({
  handleDownloadZip,
}) => {
  const {
    id,
    templateData,
    playgroundData,
    instance,
    writeFileSync,
    serverUrl,
    containerLoading,
    containerError,
  } = usePlaygroundContext();

  const {
    openFiles,
    activeFileId,
    setActiveFileId,
    closeFile,
    openFile,
    updateFileContent,
    
    // Split View State
    splitLayout,
    setSplitLayout,
    focusedPane,
    setFocusedPane,
    primaryPaneFiles,
    secondaryPaneFiles,
    secondaryActiveFileId,
  } = useFileExplorer();

  const {
    isPreviewVisible,
    setIsPreviewVisible,
    cursorPosition,
    setCursorPosition,
    setIsCommandPaletteOpen,
  } = usePlaygroundUI();

  const activeFile = openFiles.find((file) => file.id === activeFileId);
  const secondaryActiveFile = openFiles.find((file) => file.id === secondaryActiveFileId);
  const collaboratorCount = useCollaboratorCount(id);

  // Sync Yjs remote changes directly to WebContainer for live preview
  useYjsWebContainerSync(id, templateData, writeFileSync);

  // Auto-open default file when preview is shown if no file is open
  useEffect(() => {
    if (isPreviewVisible && !activeFileId && templateData) {
      const findDefaultFile = (
        items: (TemplateFile | TemplateFolder)[]
      ): TemplateFile | null => {
        for (const item of items) {
          if (!("folderName" in item)) {
            if (
              [
                "App.tsx",
                "App.jsx",
                "index.tsx",
                "index.jsx",
                "index.js",
                "main.tsx",
                "main.js",
                "index.html",
              ].includes(`${item.filename}.${item.fileExtension}`)
            ) {
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

  const containerStatus: "idle" | "building" | "running" | "error" =
    containerError
      ? "error"
      : containerLoading
        ? "building"
        : serverUrl
          ? "running"
          : "idle";

  const primaryTabs = openFiles.filter(f => primaryPaneFiles.includes(f.id));
  const secondaryTabs = openFiles.filter(f => secondaryPaneFiles.includes(f.id));

  const toggleSplitLayout = () => {
    setSplitLayout(splitLayout === 'none' ? 'horizontal' : splitLayout === 'horizontal' ? 'vertical' : 'none');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-3rem)]">
      <div className="flex-1 min-h-0">
        {openFiles.length > 0 ? (
          <div className="h-full flex flex-col">
            <div className="flex-1 min-h-0" role="tabpanel">
              <ResizablePanelGroup direction="horizontal" className="h-full">
                {/* Editors Area */}
                <ResizablePanel defaultSize={isPreviewVisible ? 50 : 100} className="flex flex-col h-full bg-background min-w-0">
                  <ResizablePanelGroup direction={splitLayout === 'vertical' ? 'vertical' : 'horizontal'} className="h-full">
                    
                    {/* Primary Pane */}
                    <ResizablePanel defaultSize={splitLayout !== 'none' ? 50 : 100} className="flex flex-col h-full min-w-[200px] min-h-[100px]">
                      <PlaygroundTabBar
                        openFiles={primaryTabs}
                        activeFileId={activeFileId}
                        setActiveFileId={(id) => setActiveFileId(id, 'primary')}
                        closeFile={(id) => closeFile(id, 'primary')}
                        onSplit={toggleSplitLayout}
                        splitLayout={splitLayout}
                        isFocused={focusedPane === 'primary'}
                        onFocus={() => setFocusedPane('primary')}
                      />
                      <Breadcrumbs activeFile={activeFile} templateData={templateData} />
                      <div className="flex-1 min-h-0 relative" onClickCapture={() => setFocusedPane('primary')}>
                        {activeFileId && primaryTabs.length > 0 ? (
                          <ErrorBoundary
                            name="MonacoEditor-Primary"
                            fallback={({ reset }) => (
                              <div className="flex h-full items-center justify-center p-6"><Button onClick={reset}>Reload Editor</Button></div>
                            )}
                          >
                            <PlaygroundEditor
                              activeFile={activeFile}
                              content={activeFile?.content || ""}
                              onContentChange={(value) => activeFileId && updateFileContent(activeFileId, value)}
                              onCursorChange={(line, col) => setCursorPosition({ line, col })}
                            />
                          </ErrorBoundary>
                        ) : (
                          <div className="flex h-full items-center justify-center text-muted-foreground/50 text-sm">
                            <span className="font-mono">Open a file in Primary Pane</span>
                          </div>
                        )}
                      </div>
                    </ResizablePanel>

                    {/* Secondary Pane */}
                    {splitLayout !== 'none' && (
                      <>
                        <ResizableHandle withHandle />
                        <ResizablePanel defaultSize={50} className="flex flex-col h-full min-w-[200px] min-h-[100px]">
                          <PlaygroundTabBar
                            openFiles={secondaryTabs}
                            activeFileId={secondaryActiveFileId}
                            setActiveFileId={(id) => setActiveFileId(id, 'secondary')}
                            closeFile={(id) => closeFile(id, 'secondary')}
                            onSplit={toggleSplitLayout}
                            splitLayout={splitLayout}
                            isFocused={focusedPane === 'secondary'}
                            onFocus={() => setFocusedPane('secondary')}
                          />
                          <Breadcrumbs activeFile={secondaryActiveFile} templateData={templateData} />
                          <div className="flex-1 min-h-0 relative" onClickCapture={() => setFocusedPane('secondary')}>
                            {secondaryActiveFileId && secondaryTabs.length > 0 ? (
                              <ErrorBoundary
                                name="MonacoEditor-Secondary"
                                fallback={({ reset }) => (
                                  <div className="flex h-full items-center justify-center p-6"><Button onClick={reset}>Reload Editor</Button></div>
                                )}
                              >
                                <PlaygroundEditor
                                  activeFile={secondaryActiveFile}
                                  content={secondaryActiveFile?.content || ""}
                                  onContentChange={(value) => secondaryActiveFileId && updateFileContent(secondaryActiveFileId, value)}
                                  onCursorChange={(line, col) => setCursorPosition({ line, col })}
                                />
                              </ErrorBoundary>
                            ) : (
                              <div className="flex h-full items-center justify-center text-muted-foreground/50 text-sm">
                                <span className="font-mono">Open a file in Secondary Pane</span>
                              </div>
                            )}
                          </div>
                        </ResizablePanel>
                      </>
                    )}
                  </ResizablePanelGroup>
                </ResizablePanel>

                {/* Preview Area */}
                {isPreviewVisible && (
                  <>
                    <ResizableHandle withHandle />
                    <ResizablePanel defaultSize={50} className="min-w-[300px]">
                      {templateData ? (
                        <WebContainerPreview
                          templateData={templateData}
                          instance={instance}
                          writeFileSync={writeFileSync || (async () => {})}
                          error={containerError}
                          serverUrl={serverUrl || ""}
                          forceResetup={false}
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center p-6 bg-muted/10">
                          {containerError ? (
                            <p className="text-destructive text-sm font-medium">Failed to load preview container.</p>
                          ) : (
                            <p className="text-muted-foreground text-sm">Loading preview environment...</p>
                          )}
                        </div>
                      )}
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

      <StatusBar
        activeFile={focusedPane === 'primary' ? activeFile : secondaryActiveFile}
        cursorPosition={cursorPosition}
        containerStatus={containerStatus}
        collaboratorCount={collaboratorCount}
        openFileCount={openFiles.length}
      />
    </div>
  );
};
