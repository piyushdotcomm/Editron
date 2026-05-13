import { useCallback, useRef } from 'react';
import { toast } from 'sonner';
import JSZip from 'jszip';
import { useFileExplorer } from './useFileExplorer';
import { TemplateFile, TemplateFolder } from '../lib/path-to-json';
import { findFilePath } from '../lib';

import { usePlaygroundContext } from '../components/playground-context';

export function usePlaygroundActions() {
  const {
    playgroundData,
    templateData,
    saveTemplateData,
    instance,
    writeFileSync,
  } = usePlaygroundContext();
  const {
    openFiles,
    activeFileId,
    setTemplateData,
    setOpenFiles,
    handleAddFile,
    handleAddFolder,
    handleDeleteFile,
    handleDeleteFolder,
    handleRenameFile,
    handleRenameFolder,
  } = useFileExplorer();

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
          toast.error(
            `Could not find path for file: ${fileToSave.filename}.${fileToSave.fileExtension}`
          );
          return;
        }

        const updatedTemplateData = JSON.parse(
          JSON.stringify(latestTemplateData)
        );

        const updateFileContent = (items: any[]): any[] =>
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
        updatedTemplateData.items = updateFileContent(updatedTemplateData.items);

        // Sync with WebContainer
        if (writeFileSync) {
          await writeFileSync(filePath, fileToSave.content);
          lastSyncedContent.current.set(fileToSave.id, fileToSave.content);
          if (instance && instance.fs) {
            await instance.fs.writeFile(filePath, fileToSave.content);
          }
        }

        await saveTemplateData(updatedTemplateData);
        setTemplateData(updatedTemplateData);
        
        const updatedOpenFiles = openFiles.map((f) =>
          f.id === targetFileId
            ? {
                ...f,
                content: fileToSave.content,
                originalContent: fileToSave.content,
                hasUnsavedChanges: false,
              }
            : f
        );
        setOpenFiles(updatedOpenFiles);

        toast.success(`Saved ${fileToSave.filename}.${fileToSave.fileExtension}`);
      } catch (error) {
        console.error("Error saving file:", error);
        toast.error(`Failed to save ${fileToSave.filename}.${fileToSave.fileExtension}`);
        throw error;
      }
    },
    [activeFileId, openFiles, writeFileSync, instance, saveTemplateData, setTemplateData, setOpenFiles]
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

  const wrappedHandleAddFile = useCallback(
    (newFile: TemplateFile, parentPath: string) => {
      return handleAddFile(newFile, parentPath, writeFileSync!, instance, saveTemplateData);
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
    (file: TemplateFile, newFilename: string, newExtension: string, parentPath: string) => {
      return handleRenameFile(file, newFilename, newExtension, parentPath, saveTemplateData);
    },
    [handleRenameFile, saveTemplateData]
  );

  const wrappedHandleRenameFolder = useCallback(
    (folder: TemplateFolder, newFolderName: string, parentPath: string) => {
      return handleRenameFolder(folder, newFolderName, parentPath, saveTemplateData);
    },
    [handleRenameFolder, saveTemplateData]
  );

  return {
    handleSave,
    handleSaveAll,
    handleDownloadZip,
    wrappedHandleAddFile,
    wrappedHandleAddFolder,
    wrappedHandleDeleteFile,
    wrappedHandleDeleteFolder,
    wrappedHandleRenameFile,
    wrappedHandleRenameFolder,
  };
}
