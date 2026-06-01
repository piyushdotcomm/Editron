"use client";

import React, { useEffect } from "react";
import dynamic from "next/dynamic";
import { toast } from "sonner";
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
import { CodeTimeTravel } from "@/frontend/src/components/CodeTimeTravel";
import { usePlaygroundContext } from "@/modules/playground/contexts/playground-context";
import { usePlaygroundUI } from "@/modules/playground/hooks/usePlaygroundUI";
import { useFileExplorer } from "@/modules/playground/hooks/useFileExplorer";
import { useGitHistory } from "@/modules/playground/hooks/useGitHistory";
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
    updateFileContent: globalUpdateFileContent,
  } = useFileExplorer();

  const {
    isPreviewVisible,
    setIsPreviewVisible,
    isTimeTravelOpen,
    cursorPosition,
    setCursorPosition,
    setIsCommandPaletteOpen,
  } = usePlaygroundUI();

  const {
    commits,
    isLoading: gitLoading,
    currentCommitHash,
    checkoutCommit,
    fetchCommits,
  } = useGitHistory(instance);

  const { openChat } = useAI();

  const activeFile = openFiles.find((file) => file.id === activePaneId);
  const collaboratorCount = useCollaboratorCount(id);

  // Handle time travel
  const handleTravelBack = async (commitId: string) => {
    const commit = commits.find((c) => c.id === commitId);
    if (!commit) return;

    try {
      toast.loading("Traveling back in time...", { id: "time-travel" });
      const success = await checkoutCommit(commit.hash);

      if (success) {
        toast.success(`Traveled to: ${commit.message}`, { id: "time-travel" });
      } else {
        toast.error("Failed to travel back", { id: "time-travel" });
      }
    } catch (err) {
      console.error("Time travel error:", err);
      toast.error("Time travel failed", { id: "time-travel" });
    }
  };

  const handleExplainWithAI = (commitId: string) => {
    const commit = commits.find((c) => c.id === commitId);
    if (!commit) return;

    openChat();
    setTimeout(() => {
      const aiState = useAI.getState();
      aiState.addMessage({
        role: "user",
        content: `Explain this git commit:\n\nCommit: ${commit.hash}\nAuthor: ${commit.author}\nDate: ${commit.date.toLocaleString()}\nMessage: ${commit.message}`,
      });
    }, 100);
  };

  useYjsWebContainerSync(id, templateData, writeFileSync);

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
      const updated = prev.map((pane) =>
        pane.id === paneId && pane.activeFileId === fileId
          ? { ...pane, activeFileId: null }
          : pane,
      );
      return updated;
    });
    globalCloseFile(fileId);
  };

  const updateFileContentForPane = (
    _paneId: string,
    fileId: string,
    value: string,
  ) => {
    globalUpdateFileContent(fileId, value);
  };

  const containerStatus: "idle" | "building" | "running" | "error" =
    containerError
      ? "error"
      : containerLoading
        ? "building"
        : serverUrl
          ? "running"
          : "idle";

  return (
    <div className="flex flex-col h-[calc(100vh-3rem)]">
      <div className="flex-1 min-h-0">
        {openFiles.length > 0 ? (
          <div className="h-full flex flex-col">
            <div className="flex-1 min-h-0" role="tabpanel">
              {/* ==================== CORRECT LAYOUT ==================== */}
              <ResizablePanelGroup direction="horizontal" className="h-full">
                
                {/* LEFT: Editors */}
                <ResizablePanel defaultSize={60} minSize={40}>
                  <ResizablePanelGroup direction={splitDirection} className="h-full">
                    {editorPanes.map((pane, index) => (
                      <React.Fragment key={pane.id}>
                        <ResizablePanel defaultSize={100 / editorPanes.length}>
                          <div className="h-full flex flex-col">
                            <PlaygroundTabBar
                              paneId={pane.id}
                              openFiles={openFiles}
                              activeFileId={pane.activeFileId || null}
                              setActiveFileId={setActiveFileIdForPane}
                              closeFile={closeFileForPane}
                            />
                            <Breadcrumbs
                              activeFile={openFiles.find(
                                (f) => f.id === pane.activeFileId,
                              )}
                              templateData={templateData}
                            />
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
                                  className="h-full"
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
                  </ResizablePanelGroup>
                </ResizablePanel>

                {/* RIGHT: Preview + Time Travel */}
                {(isPreviewVisible || isTimeTravelOpen) && (
                  <ResizablePanel defaultSize={40} minSize={25}>
                    <div className="flex flex-col h-full">
                      {isPreviewVisible && (
                        <div className="flex-1 min-h-0">
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
                              <p className="text-muted-foreground text-sm">
                                Loading preview environment...
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {isTimeTravelOpen && (
                        <div className="flex-1 min-h-0 border-t">
                          <CodeTimeTravel
                            commits={commits.map((c) => ({
                              id: c.id,
                              message: c.message,
                              date: c.date,
                              author: c.author,
                              hash: c.hash,
                            }))}
                            onTravelBack={handleTravelBack}
                            onExplainWithAI={handleExplainWithAI}
                            isLoading={gitLoading}
                            activeCommitId={
                              commits.find((c) => c.hash === currentCommitHash)?.id
                            }
                          />
                        </div>
                      )}
                    </div>
                  </ResizablePanel>
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
        activeFile={activeFile}
        cursorPosition={cursorPosition}
        containerStatus={containerStatus}
        collaboratorCount={collaboratorCount}
        openFileCount={openFiles.length}
      />
    </div>
  );
};