"use client";
import { useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";
import JSZip from "jszip";
import { useFileExplorer } from "@/modules/playground/hooks/useFileExplorer";
import { findFilePath } from "@/modules/playground/lib";
import { TemplateFile, TemplateFolder } from "@/modules/playground/lib/path-to-json";
import { useAI } from "@/modules/playground/hooks/useAI";
import { useSidebar } from "@/components/ui/sidebar";

interface UsePlaygroundActionsProps {
  id: string;
  templateData: TemplateFolder | null;
  playgroundData: any;
  saveTemplateData: (data: TemplateFolder) => Promise<void>;
  writeFileSync?: ((path: string, content: string) => Promise<void>) | null;
  activeFileId: string | null;
  openFiles: any[];
  setTemplateData: (data: TemplateFolder) => void;
  setOpenFiles: (files: any[]) => void;
  closeFile: (id: string) => void;
  setIsPreviewVisible: (v: (prev: boolean) => boolean) => void;
  setIsCommandPaletteOpen: (v: boolean) => void;
}

export function usePlaygroundActions({
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
}: UsePlaygroundActionsProps) {
  const lastSyncedContent = useRef<Map<string, string>>(new Map());
  const sidebar = useSidebar();

  const handleSave = useCallback(
    async (fileId?: string, silent = false) => {
      const targetFileId = fileId || activeFileId;
      if (!targetFileId) return;

      const fileToSave = openFiles.find((f) => f.id === targetFileId);
      if (!fileToSave) return;

      const latestTemplateData = useFileExplorer.getState().templateData;
      if (!latestTemplateData) return;

      try {
        const filePath = findFilePath(fileToSave, latestTemplateData);
        if (!filePath) {
          toast.error(`Could not find path for file: ${fileToSave.filename}.${fileToSave.fileExtension}`);
          return;
        }

        const updatedTemplateData = JSON.parse(JSON.stringify(latestTemplateData));

        const updateItemContent = (items: any[]): any[] =>
          items.map((item) => {
            if ("folderName" in item) {
              return { ...item, items: updateItemContent(item.items) };
            } else if (
              item.filename === fileToSave.filename &&
              item.fileExtension === fileToSave.fileExtension
            ) {
              return { ...item, content: fileToSave.content };
            }
            return item;
          });

        updatedTemplateData.items = updateItemContent(updatedTemplateData.items);

        if (writeFileSync) {
          await writeFileSync(filePath, fileToSave.content);
          lastSyncedContent.current.set(fileToSave.id, fileToSave.content);
        }

        await saveTemplateData(updatedTemplateData);
        setTemplateData(updatedTemplateData);

        setOpenFiles(
          openFiles.map((f) =>
            f.id === targetFileId
              ? { ...f, content: fileToSave.content, originalContent: fileToSave.content, hasUnsavedChanges: false }
              : f
          )
        );

        if (!silent) {
          toast.success(`Saved ${fileToSave.filename}.${fileToSave.fileExtension}`);
        }
      } catch (error) {
        console.error("Error saving file:", error);
        toast.error(`Failed to save ${fileToSave.filename}.${fileToSave.fileExtension}`);
        throw error;
      }
    },
    [activeFileId, openFiles, writeFileSync, saveTemplateData, setTemplateData, setOpenFiles]
  );

  const handleSaveAll = useCallback(async () => {
    const unsavedFiles = openFiles.filter((f) => f.hasUnsavedChanges);
    if (unsavedFiles.length === 0) {
      toast.info("No unsaved changes");
      return;
    }
    try {
      for (const f of unsavedFiles) {
        await handleSave(f.id, true);
      }
      toast.success(`Saved ${unsavedFiles.length} file(s)`);
    } catch (error) {
      toast.error("Failed to save some files");
    }
  }, [openFiles, handleSave]);

  const addFilesToZip = (folder: TemplateFolder, zipFolder: JSZip) => {
    folder.items.forEach((item) => {
      if ("folderName" in item) {
        const newFolder = zipFolder.folder(item.folderName);
        if (newFolder) addFilesToZip(item, newFolder);
      } else {
        zipFolder.file(
          item.filename + (item.fileExtension ? `.${item.fileExtension}` : ""),
          item.content
        );
      }
    });
  };

  const handleDownloadZip = useCallback(async () => {
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
  }, [templateData, playgroundData]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && !e.shiftKey && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
      if (e.ctrlKey && e.shiftKey && e.key === "S") {
        e.preventDefault();
        handleSaveAll();
      }
      if ((e.ctrlKey && e.key === "k") || (e.ctrlKey && e.shiftKey && e.key === "P")) {
        e.preventDefault();
        setIsCommandPaletteOpen(true);
      }
      if (e.ctrlKey && !e.shiftKey && e.key === "b") {
        e.preventDefault();
        sidebar.toggleSidebar();
      }
      if (e.ctrlKey && e.key === "\\") {
        e.preventDefault();
        setIsPreviewVisible((prev) => !prev);
      }
      if (e.ctrlKey && e.shiftKey && e.key === "A") {
        e.preventDefault();
        useAI.getState().toggleChat();
      }
      if (e.ctrlKey && !e.shiftKey && e.key === "w") {
        e.preventDefault();
        if (activeFileId) closeFile(activeFileId);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSave, handleSaveAll, sidebar, activeFileId, closeFile, setIsCommandPaletteOpen, setIsPreviewVisible]);

  return { handleSave, handleSaveAll, handleDownloadZip };
}