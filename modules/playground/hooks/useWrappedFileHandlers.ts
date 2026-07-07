import { useCallback } from "react";
import { useFileExplorer } from "@/modules/playground/hooks/useFileExplorer";
import { TemplateFile, TemplateFolder } from "@/modules/playground/lib/path-to-json";

interface UseWrappedFileHandlersProps {
  instance: any;
  writeFileSync: ((path: string, content: string) => Promise<void>) | null;
  saveTemplateData: (data: any) => Promise<void>;
}

export function useWrappedFileHandlers({
  instance,
  writeFileSync,
  saveTemplateData,
}: UseWrappedFileHandlersProps) {
  const {
    handleAddFile,
    handleAddFolder,
    handleDeleteFile,
    handleDeleteFolder,
    handleRenameFile,
    handleRenameFolder,
  } = useFileExplorer();

  const wrappedHandleAddFile = useCallback(
    (newFile: TemplateFile, parentPath: string) =>
      handleAddFile(newFile, parentPath, writeFileSync!, instance, saveTemplateData),
    [handleAddFile, writeFileSync, instance, saveTemplateData]
  );

  const wrappedHandleAddFolder = useCallback(
    (newFolder: TemplateFolder, parentPath: string) =>
      handleAddFolder(newFolder, parentPath, instance, saveTemplateData),
    [handleAddFolder, instance, saveTemplateData]
  );

  const wrappedHandleDeleteFile = useCallback(
    (file: TemplateFile, parentPath: string) =>
      handleDeleteFile(file, parentPath, saveTemplateData),
    [handleDeleteFile, saveTemplateData]
  );

  const wrappedHandleDeleteFolder = useCallback(
    (folder: TemplateFolder, parentPath: string) =>
      handleDeleteFolder(folder, parentPath, saveTemplateData),
    [handleDeleteFolder, saveTemplateData]
  );

  const wrappedHandleRenameFile = useCallback(
    (file: TemplateFile, newFilename: string, newExtension: string, parentPath: string) =>
      handleRenameFile(file, newFilename, newExtension, parentPath, saveTemplateData),
    [handleRenameFile, saveTemplateData]
  );

  const wrappedHandleRenameFolder = useCallback(
    (folder: TemplateFolder, newFolderName: string, parentPath: string) =>
      handleRenameFolder(folder, newFolderName, parentPath, saveTemplateData),
    [handleRenameFolder, saveTemplateData]
  );

  return {
    wrappedHandleAddFile,
    wrappedHandleAddFolder,
    wrappedHandleDeleteFile,
    wrappedHandleDeleteFolder,
    wrappedHandleRenameFile,
    wrappedHandleRenameFolder,
  };
}
