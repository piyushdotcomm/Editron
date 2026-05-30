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
  { ssr: false },
);

const generateFileId = (file: TemplateFile, root: TemplateFolder): string => {
  const findPath = (
    items: (TemplateFile | TemplateFolder)[],
    currentPath = "",
  ): string | null => {
    for (const item of items) {
      if ("folderName" in item) {
        const result = findPath(
          item.items,
          `${currentPath}/${item.folderName}`,
        );

        if (result) return result;
      } else if (item === file) {
        return `${currentPath}/${item.filename}.${item.fileExtension}`;
      }
    }

    return null;
  };

  return findPath(root.items) || crypto.randomUUID();
};

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
    editorPanes,
    splitDirection,
    activePaneId,
    setActivePaneId,
    setEditorPanes,
  } = usePlaygroundContext();

  const {
    openFiles,
    setActiveFileId: globalSetActiveFileId,
    closeFile: globalCloseFile,
    openFile,
feat/split-view-editor
    updateFileContent: globalUpdateFileContent,
    
    updateFileContent,
    
    // Split View State
    splitLayout,
    setSplitLayout,
    focusedPane,
    setFocusedPane,
    primaryPaneFiles,
    secondaryPaneFiles,
    secondaryActiveFileId,
develop
  } = useFileExplorer();

  const {
    isPreviewVisible,
    setIsPreviewVisible,
    cursorPosition,
    setCursorPosition,
    setIsCommandPaletteOpen,
  } = usePlaygroundUI();

  const collaboratorCount = useCollaboratorCount(id);

  // Pane-aware wrapper functions with immutable updates
  const setActiveFileIdForPane = (paneId: string, fileId: string) => {
    globalSetActiveFileId(fileId);
    setEditorPanes((prev) =>
      prev.map((pane) =>
        pane.id === paneId ? { ...pane, activeFileId: fileId } : pane,
      ),
    );
  };

  const closeFileForPane = (paneId: string, fileId: string) => {
    setEditorPanes((prev) => {
      const primaryPaneId = prev[0]?.id;

      // Closing secondary split pane
      if (paneId !== primaryPaneId) {
        const remainingPanes = prev.filter((pane) => pane.id !== paneId);

        // Always reset active pane to primary
        setActivePaneId(primaryPaneId);

        // Ensure primary pane remains focused
        if (remainingPanes[0]?.activeFileId) {
          globalSetActiveFileId(remainingPanes[0].activeFileId);
        }

        return remainingPanes;
      }

      // Closing main pane file
      const updated = prev.map((pane) =>
        pane.id === paneId && pane.activeFileId === fileId
          ? { ...pane, activeFileId: null }
          : pane,
      );

      // Only globally close file if NO panes still use it
      const stillUsed = updated.some((pane) => pane.activeFileId === fileId);

      if (!stillUsed) {
        globalCloseFile(fileId);
      }

      return updated;
    });
  };

  const updateFileContentForPane = (
    _paneId: string,
    fileId: string,
    value: string,
  ) => {
    globalUpdateFileContent(fileId, value);
  };

  // Auto-open default file when preview is shown if no file is open
  useEffect(() => {
    if (
      isPreviewVisible &&
      editorPanes.every((pane) => !pane.activeFileId) &&
      templateData
    ) {
      const findDefaultFile = (
        items: (TemplateFile | TemplateFolder)[],
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
      if (defaultFile && editorPanes[0]) {
        const defaultFileId = generateFileId(defaultFile, templateData);
        openFile(defaultFile);
        globalSetActiveFileId(defaultFileId);
        setEditorPanes((prev) =>
          prev.map((pane, idx) =>
            idx === 0 ? { ...pane, activeFileId: defaultFileId } : pane,
          ),
        );
        setActivePaneId(editorPanes[0].id);
      }
    }
  }, [
    isPreviewVisible,
    editorPanes,
    templateData,
    openFile,
    globalSetActiveFileId,
    setActivePaneId,
    setEditorPanes,
  ]);

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
            {/* Editor + Preview */}
            <div className="flex-1 min-h-0" role="tabpanel">
              <ResizablePanelGroup
                direction={splitDirection}
                className="h-full"
              >
                {editorPanes.map((pane, index) => (
                  <React.Fragment key={pane.id}>
                    <ResizablePanel defaultSize={100 / editorPanes.length}>
                      <div className="h-full flex flex-col">
                        {/* Tab bar for this pane */}
                        <PlaygroundTabBar
                          paneId={pane.id}
                          openFiles={openFiles}
                          activeFileId={pane.activeFileId || null}
                          setActiveFileId={setActiveFileIdForPane}
                          closeFile={closeFileForPane}
                        />

                        {/* Breadcrumbs for this pane */}
                        <Breadcrumbs
                          activeFile={openFiles.find(
                            (f) => f.id === pane.activeFileId,
                          )}
                          templateData={templateData}
                        />

                        {/* Editor for this pane */}
                        <div className="flex-1 min-h-0 h-full overflow-hidden">
                          <ErrorBoundary
                            name="MonacoEditor"
                            fallback={({ reset }) => (
                              <div className="flex h-full min-h-[200px] items-center justify-center p-6">
                                <div className="max-w-md rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-center">
                                  <h3 className="mb-2 text-lg font-semibold text-destructive">
                                    Editor crashed
                                  </h3>
                                  <p className="mb-4 text-sm text-muted-foreground">
                                    The editor failed, but the rest of the
                                    playground is still available.
                                  </p>
                                  <Button onClick={reset}>Reload Editor</Button>
                                </div>
                              </div>
                            )}
                          >
                            <div
                              className="flex-1 min-h-0 h-full overflow-hidden"
                              onClick={() => setActivePaneId(pane.id)}
                            >
                              <PlaygroundEditor
                                activeFile={openFiles.find(
                                  (f) => f.id === pane.activeFileId,
                                )}
                                content={
                                  openFiles.find(
                                    (f) => f.id === pane.activeFileId,
                                  )?.content || ""
                                }
                                onContentChange={(value) =>
                                  pane.activeFileId &&
                                  updateFileContentForPane(
                                    pane.id,
                                    pane.activeFileId,
                                    value,
                                  )
                                }
                                onCursorChange={(line, col) =>
                                  setCursorPosition({ line, col })
                                }
                              />
                            </div>
                          </ErrorBoundary>
                        </div>
                      </div>
                    </ResizablePanel>
                    {index < editorPanes.length - 1 && <ResizableHandle />}
                  </React.Fragment>
                ))}
                {isPreviewVisible && (
                  <>
                    <ResizableHandle />
                    <ResizablePanel defaultSize={30}>
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
                            <p className="text-destructive text-sm font-medium">
                              Failed to load preview container.
                            </p>
                          ) : (
                            <p className="text-muted-foreground text-sm">
                              Loading preview environment...
                            </p>
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
        activeFile={openFiles.find(
          (f) =>
            f.id ===
            editorPanes.find((p) => p.id === activePaneId)?.activeFileId,
        )}
        cursorPosition={cursorPosition}
        containerStatus={containerStatus}
        collaboratorCount={collaboratorCount}
        openFileCount={openFiles.length}
      />
    </div>
  );
};
