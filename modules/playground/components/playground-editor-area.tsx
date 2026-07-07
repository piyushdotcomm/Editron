import { useState } from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ErrorBoundary } from "@/components/error-boundary";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";
import { TemplateFile, TemplateFolder } from "@/modules/playground/lib/path-to-json";
import WebContainerPreview from "@/modules/webcontainers/components/webcontainer-preview";
import { Breadcrumbs } from "@/modules/playground/components/breadcrumbs";
import { PlaygroundTabBar } from "@/modules/playground/components/playground-tab-bar";
import { WelcomeScreen } from "@/modules/playground/components/welcome-screen";
import { useFileExplorer } from "@/modules/playground/hooks/useFileExplorer";
import { useAI } from "@/modules/playground/hooks/useAI";

const PlaygroundEditor = dynamic(
  () => import("@/modules/playground/components/playground-editor"),
  { ssr: false }
);

interface PlaygroundEditorAreaProps {
  openFiles: any[];
  activeFileId: string | null;
  activeFile: TemplateFile | undefined;
  templateData: TemplateFolder;
  isPreviewVisible: boolean;
  containerLoading: boolean;
  containerError: string | null;
  serverUrl: string | null;
  instance: any;
  writeFileSync: ((path: string, content: string) => Promise<void>) | null;
  projectTitle?: string;
  onCursorChange: (line: number, col: number) => void;
  onTogglePreview: () => void;
  onOpenAI: () => void;
  onDownload: () => void;
  onOpenCommandPalette: () => void;
}

export function PlaygroundEditorArea({
  openFiles,
  activeFileId,
  activeFile,
  templateData,
  isPreviewVisible,
  containerLoading,
  containerError,
  serverUrl,
  instance,
  writeFileSync,
  projectTitle,
  onCursorChange,
  onTogglePreview,
  onOpenAI,
  onDownload,
  onOpenCommandPalette,
}: PlaygroundEditorAreaProps) {
  const { setActiveFileId, closeFile, updateFileContent } = useFileExplorer();

  if (openFiles.length === 0) {
    return (
      <WelcomeScreen
        projectTitle={projectTitle}
        onTogglePreview={onTogglePreview}
        onOpenAI={onOpenAI}
        onDownload={onDownload}
        onOpenCommandPalette={onOpenCommandPalette}
      />
    );
  }

  return (
    <div className="h-full flex flex-col">
      <PlaygroundTabBar
        openFiles={openFiles}
        activeFileId={activeFileId}
        setActiveFileId={setActiveFileId}
        closeFile={closeFile}
      />

      <Breadcrumbs activeFile={activeFile} templateData={templateData} />

      <div className="flex-1 min-h-0" role="tabpanel">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          <ResizablePanel defaultSize={isPreviewVisible ? 50 : 100}>
            <ErrorBoundary
              name="MonacoEditor"
              fallback={({ reset }) => (
                <div className="flex h-full min-h-[200px] items-center justify-center p-6">
                  <div className="max-w-md rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-center">
                    <h3 className="mb-2 text-lg font-semibold text-destructive">Editor crashed</h3>
                    <p className="mb-4 text-sm text-muted-foreground">
                      The editor failed, but the rest of the playground is still available.
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
                  activeFileId && updateFileContent(activeFileId, value)
                }
                onCursorChange={(line, col) => onCursorChange(line, col)}
              />
            </ErrorBoundary>
          </ResizablePanel>

          {isPreviewVisible && (
            <>
              <ResizableHandle />
              <ResizablePanel defaultSize={50}>
                <WebContainerPreview
                  templateData={templateData}
                  instance={instance}
                  writeFileSync={writeFileSync}
                  isLoading={containerLoading}
                  error={containerError}
                  serverUrl={serverUrl ?? ""}
                  forceResetup={false}
                />
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
