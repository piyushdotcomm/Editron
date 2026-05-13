"use client";

import React, { useEffect, Suspense } from "react";
import { useParams } from "next/navigation";
import { AlertCircle, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import PlaygroundSkeleton from "@/modules/playground/components/loader";

import { usePlayground } from "@/modules/playground/hooks/usePlayground";
import { useFileExplorer } from "@/modules/playground/hooks/useFileExplorer";
import { findFilePath } from "@/modules/playground/lib";
import {
  TemplateFile,
  TemplateFolder,
} from "@/modules/playground/lib/path-to-json";
import React, {
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";

import { PlaygroundLayout } from "@/modules/playground/components/playground-layout";
import { PlaygroundSidebar } from "@/modules/playground/components/playground-sidebar";
import { PlaygroundMainArea } from "@/modules/playground/components/playground-main-area";
import { PlaygroundModalOrchestrator } from "@/modules/playground/components/playground-modal-orchestrator";

const PlaygroundPageContent = () => {
  const { id } = useParams<{ id: string }>();

  const { playgroundData, templateData, isLoading, error, saveTemplateData } = usePlayground(id);

  const { setTemplateData, setPlaygroundId, openFiles } = useFileExplorer();

  const {
    serverUrl,
    isLoading: containerLoading,
    error: containerError,
    instance,
    writeFileSync,
    
  } = useWebContainer();

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
  const handleSave = useCallback(
    async (fileId?: string) => {
      const targetFileId = fileId || activeFileId;
      if (!targetFileId) return;

      const fileToSave = openFiles.find((f) => f.id === targetFileId);

      if (!fileToSave) return;

      const latestTemplateData = useFileExplorer.getState().templateData;
      if (!latestTemplateData) return

      try {
        const filePath = findFilePath(fileToSave, latestTemplateData);
        if (!filePath) {
          toast.error(
            `Could not find path for file: ${fileToSave.filename}.${fileToSave.fileExtension}`
          );
          return;
        }

        const updatedTemplateData = JSON.parse(
          JSON.stringify(latestTemplateData)
        );

        // @ts-ignore
        const updateFileContent = (items: any[]) =>
          // @ts-ignore
          items.map((item) => {
            if ("folderName" in item) {
              return { ...item, items: updateFileContent(item.items) };
            } else if (
              item.filename === fileToSave.filename &&
              item.fileExtension === fileToSave.fileExtension
            ) {
              return { ...item, content: fileToSave.content };
            }
            return item;
          });
        updatedTemplateData.items = updateFileContent(
          updatedTemplateData.items
        );

        // Sync with WebContainer
        let containerSynced = false;

try {
  if (writeFileSync) {
    await writeFileSync(filePath, fileToSave.content); // handles fs.writeFile internally
    containerSynced = true;
  } else if (instance?.fs) {
    // fallback: writeFileSync not ready yet but instance is booted
    await instance.fs.writeFile(filePath, fileToSave.content);
    containerSynced = true;
  } else {
    console.warn("WebContainer not ready — saving to DB only");
  }
} catch (err) {
  console.error("Failed to sync to WebContainer:", err);
}

if (containerSynced) {
  lastSyncedContent.current.set(fileToSave.id, fileToSave.content);
}

        await saveTemplateData(updatedTemplateData);
        setTemplateData(updatedTemplateData);
        // Update open files
        const updatedOpenFiles = openFiles.map((f) =>
          f.id === targetFileId
            ? {
              ...f,
              content: fileToSave.content,
              originalContent: fileToSave.content,
              hasUnsavedChanges: containerSynced ? false : f.hasUnsavedChanges,
            }
            : f
        );
        setOpenFiles(updatedOpenFiles);

        containerSynced
  ? toast.success(`Saved ${fileToSave.filename}.${fileToSave.fileExtension}`)
  : toast.warning(`Saved to DB — WebContainer not ready, preview won't reflect changes yet`);
      } catch (error) {
        console.error("Error saving file:", error);
        toast.error(
          `Failed to save ${fileToSave.filename}.${fileToSave.fileExtension}`
        );
        throw error;
      }
    },
    [
      activeFileId,
      openFiles,
      writeFileSync,
      instance,
      saveTemplateData,
      setTemplateData,
      setOpenFiles,
    ]
  );

  const handleSaveAll = async () => {
    const unsavedFiles = openFiles.filter((f) => f.hasUnsavedChanges);

    if (unsavedFiles.length === 0) {
      toast.info("No unsaved changes");
      return;
    }

    try {
      await Promise.all(unsavedFiles.map((f) => handleSave(f.id)));
      toast.success(`Saved ${unsavedFiles.length} file(s)`);
    } catch (error) {
      toast.error("Failed to save some files");
    }
  };

  // recursive function to add files to zip
  const addFilesToZip = (folder: TemplateFolder, zipFolder: JSZip) => {
    folder.items.forEach((item) => {
      if ("folderName" in item) {
        const newFolder = zipFolder.folder(item.folderName);
        if (newFolder) {
          addFilesToZip(item, newFolder);
        }
      } else {
        zipFolder.file(item.filename + (item.fileExtension ? `.${item.fileExtension}` : ""), item.content);
      }
    });
  };

  const handleDownloadZip = async () => {
    if (!templateData) return;

    try {
      const zip = new JSZip();
      addFilesToZip(templateData, zip);

      const content = await zip.generateAsync({ type: "blob" });
      const url = window.URL.createObjectURL(content);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${playgroundData?.title || "project"}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Project downloaded successfully");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download project");
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+S — Save
      if (e.ctrlKey && !e.shiftKey && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
      // Ctrl+Shift+S — Save All
      if (e.ctrlKey && e.shiftKey && e.key === "S") {
        e.preventDefault();
        handleSaveAll();
      }
      // Ctrl+K or Ctrl+Shift+P — Command Palette
      if ((e.ctrlKey && e.key === "k") || (e.ctrlKey && e.shiftKey && e.key === "P")) {
        e.preventDefault();
        setIsCommandPaletteOpen(true);
      }
      // Ctrl+B — Toggle Sidebar
      if (e.ctrlKey && !e.shiftKey && e.key === "b") {
        e.preventDefault();
        sidebar.toggleSidebar();
      }
      // Ctrl+\ — Toggle Preview
      if (e.ctrlKey && e.key === "\\") {
        e.preventDefault();
        setIsPreviewVisible((prev) => !prev);
      }
      // Ctrl+Shift+A — Toggle AI Chat
      if (e.ctrlKey && e.shiftKey && e.key === "A") {
        e.preventDefault();
        useAI.getState().toggleChat();
      }
      // Ctrl+W — Close current tab
      if (e.ctrlKey && !e.shiftKey && e.key === "w") {
        e.preventDefault();
        if (activeFileId) {
          closeFile(activeFileId);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSave, handleSaveAll, sidebar, activeFileId, closeFile]);

  // Derive container status
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

const MainPlaygroundPage = () => {
  return (
    <Suspense fallback={<PlaygroundSkeleton />}>
      <PlaygroundPageContent />
    </Suspense>
  );
};

export default MainPlaygroundPage;
