import { useCallback, useRef } from "react";
import { toast } from "sonner";
import { findFilePath } from "@/modules/playground/lib";
import {
  TemplateFile,
  TemplateFolder,
} from "@/modules/playground/lib/path-to-json";
import { useFileExplorer } from "@/modules/playground/hooks/useFileExplorer";

interface UseSaveHandlersProps {
  activeFileId: string | null;
  openFiles: (TemplateFile & { id: string; hasUnsavedChanges: boolean; originalContent: string })[];
  writeFileSync: ((path: string, content: string) => Promise<void>) | null;
  instance: any;
  saveTemplateData: (data: any) => Promise<void>;
  setTemplateData: (data: any) => void;
  setOpenFiles: (files: any[]) => void;
}

export function useSaveHandlers({
  activeFileId,
  openFiles,
  writeFileSync,
  instance,
  saveTemplateData,
  setTemplateData,
  setOpenFiles,
}: UseSaveHandlersProps) {
  const lastSyncedContent = useRef<Map<string, string>>(new Map());

  const handleSave = useCallback(
    async (fileId?: string) => {
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

        const updateContentInTree = (
          items: (TemplateFile | TemplateFolder)[]
        ): (TemplateFile | TemplateFolder)[] =>
          items.map((item) => {
            if ("folderName" in item) {
              return { ...item, items: updateContentInTree(item.items) };
            } else if (
              item.filename === fileToSave.filename &&
              item.fileExtension === fileToSave.fileExtension
            ) {
              return { ...item, content: fileToSave.content };
            }
            return item;
          });

        updatedTemplateData.items = updateContentInTree(updatedTemplateData.items);

        let containerSynced = false;
        try {
          if (writeFileSync) {
            await writeFileSync(filePath, fileToSave.content);
            containerSynced = true;
          } else if (instance?.fs) {
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

        if (containerSynced) {
          toast.success(`Saved ${fileToSave.filename}.${fileToSave.fileExtension}`);
        } else {
          toast.warning(`Saved to DB — WebContainer not ready, preview won't reflect changes yet`);
        }
      } catch (error) {
        console.error("Error saving file:", error);
        toast.error(`Failed to save ${fileToSave.filename}.${fileToSave.fileExtension}`);
        throw error;
      }
    },
    [activeFileId, openFiles, writeFileSync, instance, saveTemplateData, setTemplateData, setOpenFiles]
  );

  const handleSaveAll = useCallback(async () => {
    const unsavedFiles = openFiles.filter((f) => f.hasUnsavedChanges);
    if (unsavedFiles.length === 0) {
      toast.info("No unsaved changes");
      return;
    }
    try {
      await Promise.all(unsavedFiles.map((f) => handleSave(f.id)));
      toast.success(`Saved ${unsavedFiles.length} file(s)`);
    } catch {
      toast.error("Failed to save some files");
    }
  }, [openFiles, handleSave]);

  return { handleSave, handleSaveAll, lastSyncedContent };
}
