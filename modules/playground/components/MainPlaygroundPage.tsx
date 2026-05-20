"use client";
import { usePlaygroundActions } from "@/modules/playground/hooks/usePlaygroundActions";
import { Button } from "@/components/ui/button";
import { ErrorBoundary } from "@/components/error-boundary";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import {
  SidebarInset,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  TooltipProvider,
} from "@/components/ui/tooltip";
import PlaygroundSkeleton from "@/modules/playground/components/loader";
import dynamic from "next/dynamic";

const PlaygroundEditor = dynamic(
  () => import("@/modules/playground/components/playground-editor"),
  { ssr: false }
);

import {
  AlertCircle,
  FolderOpen,
} from "lucide-react";
import { CollaborationAvatars } from "@/modules/playground/components/collaboration-avatars";
import { TemplateFileTree } from "@/modules/playground/components/playground-explorer";
import { usePlayground } from "@/modules/playground/hooks/usePlayground";
import { useAI } from "@/modules/playground/hooks/useAI";
import AIChatPanel from "@/modules/playground/components/ai-chat-panel";
import AISettingsDialog from "@/modules/playground/components/ai-settings-dialog";
import { useParams } from "next/navigation";
import WebContainerPreview from "@/modules/webcontainers/components/webcontainer-preview";
import { useWebContainer } from "@/modules/webcontainers/hooks/useWebContainer";
import { useFileExplorer } from "@/modules/playground/hooks/useFileExplorer";

import {
  TemplateFile,
  TemplateFolder,
} from "@/modules/playground/lib/path-to-json";
import {
  useCallback,
  useEffect,
  useState,
} from "react";


// New components
import { StatusBar } from "@/modules/playground/components/status-bar";
import { WelcomeScreen } from "@/modules/playground/components/welcome-screen";
import { Breadcrumbs } from "@/modules/playground/components/breadcrumbs";
import { CommandPalette } from "@/modules/playground/components/command-palette";
import { DeployDialog } from "@/modules/playground/components/deploy-dialog";
import { PlaygroundHeader } from "@/modules/playground/components/playground-header";
import { PlaygroundTabBar } from "@/modules/playground/components/playground-tab-bar";
import { PlaygroundSidebar } from "@/modules/playground/components/playground-sidebar";


interface MainPlaygroundPageProps {
  initialData: any;
  id: string;
}

const MainPlaygroundPage = ({ initialData, id }: MainPlaygroundPageProps) => {
  const playgroundData = initialData;
  const rawContent = initialData?.templateFiles?.[0]?.content;
  const parsedTemplate = rawContent
    ? typeof rawContent === "string"
      ? JSON.parse(rawContent)
      : rawContent
    : null;

  const [templateData, setTemplateDataState] = useState(parsedTemplate);
  const [error] = useState<string | null>(null);
  const { saveTemplateData } = usePlayground(id);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
const [showAISettings, setShowAISettings] = useState(false);
const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
const [isDeployDialogOpen, setIsDeployDialogOpen] = useState(false);
const [cursorPosition, setCursorPosition] = useState({ line: 1, col: 1 });
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

 const {
  handleSave,
  handleSaveAll,
  handleDownloadZip,
} = usePlaygroundActions({
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
});
  // Derive container status
  const containerStatus: "idle" | "building" | "running" | "error" = containerError
    ? "error"
    : serverUrl
        ? "running"
        : "idle";
 
if (!playgroundData && !templateData && !error) {
  return <PlaygroundSkeleton />;
}
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

  // No template data
 


  return (
    <TooltipProvider>
      <>
        {/* We add PlaygroundSidebar which encapsulates the FileTree, PackageManager, and EnvManager */}
        <PlaygroundSidebar
          templateData={templateData}
          instance={instance}
          writeFileSync={writeFileSync}
          activeFile={activeFile}
          handleFileSelect={handleFileSelect}
          wrappedHandleAddFile={wrappedHandleAddFile}
          wrappedHandleAddFolder={wrappedHandleAddFolder}
          wrappedHandleDeleteFile={wrappedHandleDeleteFile}
          wrappedHandleDeleteFolder={wrappedHandleDeleteFolder}
          wrappedHandleRenameFile={wrappedHandleRenameFile}
          wrappedHandleRenameFolder={wrappedHandleRenameFolder}
        />

        <SidebarInset
          data-state={sidebar.state}
          className="flex-1 w-auto min-w-0 transition-all ease-linear duration-300 relative bg-background"
        >
          {/* ==== HEADER ==== */}
          <PlaygroundHeader
            id={id as string}
            playgroundData={playgroundData}
            openFilesLength={openFiles.length}
            hasUnsavedChanges={hasUnsavedChanges}
            activeFile={activeFile}
            isPreviewVisible={isPreviewVisible}
            setIsPreviewVisible={setIsPreviewVisible}
            handleSave={() => handleSave()}
            handleSaveAll={handleSaveAll}
            setIsDeployDialogOpen={setIsDeployDialogOpen}
            handleDownloadZip={handleDownloadZip}
            setShowAISettings={setShowAISettings}
            closeAllFiles={closeAllFiles}
            toggleAIChat={() => useAI.getState().toggleChat()}
          />

          {/* ==== CONTENT ==== */}
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
                  {templateData && (
  <Breadcrumbs
    activeFile={activeFile}
    templateData={templateData}
  />
)}

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