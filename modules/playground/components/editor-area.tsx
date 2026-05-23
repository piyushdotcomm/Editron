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

const PlaygroundEditor = dynamic(
  () => import("@/modules/playground/components/playground-editor"),
  { ssr: false }
);

interface EditorAreaProps {
  handleDownloadZip: () => void;
}

/**
 * Encapsulates the full editor content area:
 * - Tab bar
 * - Breadcrumbs
 * - Monaco editor + resizable preview panel
 * - Welcome screen (when no files are open)
 * - Status bar
 *
 * Consumes `useFileExplorer`, `usePlaygroundUI`, and `PlaygroundContext`
 * directly — no prop-drilling from the parent page.
 */
export const EditorArea: React.FC<EditorAreaProps> = ({
  handleDownloadZip,
}) => {
  const {
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
  } = useFileExplorer();

  const {
    isPreviewVisible,
    setIsPreviewVisible,
    cursorPosition,
    setCursorPosition,
    setIsCommandPaletteOpen,
  } = usePlaygroundUI();

  const activeFile = openFiles.find((file) => file.id === activeFileId);

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

  // Derive container status
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
            {/* Tab bar */}
            <PlaygroundTabBar
              openFiles={openFiles}
              activeFileId={activeFileId}
              setActiveFileId={setActiveFileId}
              closeFile={closeFile}
            />

            {/* Breadcrumbs */}
            <Breadcrumbs activeFile={activeFile} templateData={templateData} />

            {/* Editor + Preview */}
            <div className="flex-1 min-h-0" role="tabpanel">
              <ResizablePanelGroup
                direction="horizontal"
                className="h-full"
              >
                <ResizablePanel
                  defaultSize={isPreviewVisible ? 50 : 100}
                >
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
                    <PlaygroundEditor
                      activeFile={activeFile}
                      content={activeFile?.content || ""}
                      onContentChange={(value) =>
                        activeFileId &&
                        updateFileContent(activeFileId, value)
                      }
                      onCursorChange={(line, col) =>
                        setCursorPosition({ line, col })
                      }
                    />
                  </ErrorBoundary>
                </ResizablePanel>
                {isPreviewVisible && (
                  <>
                    <ResizableHandle />
                    <ResizablePanel defaultSize={50}>
                      {templateData && serverUrl ? (
                        <WebContainerPreview
                          templateData={templateData}
                          instance={instance}
                          writeFileSync={writeFileSync || (async () => {})}

                          error={containerError}
                          serverUrl={serverUrl}
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

      {/* Status Bar */}
      <StatusBar
        activeFile={activeFile}
        cursorPosition={cursorPosition}
        containerStatus={containerStatus}
        collaboratorCount={0}
        openFileCount={openFiles.length}
      />
    </div>
  );
};
