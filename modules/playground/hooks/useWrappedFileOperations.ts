"use client";

import { useCallback } from "react";
import { useFileExplorer } from "@/modules/playground/hooks/useFileExplorer";
import { usePlaygroundContext } from "@/modules/playground/contexts/playground-context";
import type {
  TemplateFile,
  TemplateFolder,
} from "@/modules/playground/lib/path-to-json";

/**
 * Returns wrapped file-operation callbacks that automatically bind
 * `saveTemplateData`, `instance`, and `writeFileSync` from PlaygroundContext
 * to the raw operations exposed by the `useFileExplorer` Zustand store.
 *
 * This replaces the 6 inline `wrappedHandle*` callbacks that previously
 * lived in the page component.
 */
export function useWrappedFileOperations() {
  const {
    handleAddFile,
    handleAddFolder,
    handleDeleteFile,
    handleDeleteFolder,
    handleRenameFile,
    handleRenameFolder,
  } = useFileExplorer();

  const { saveTemplateData, instance, writeFileSync } =
    usePlaygroundContext();

  const wrappedHandleAddFile = useCallback(
    (newFile: TemplateFile, parentPath: string) => {
      if (!writeFileSync) {
        console.warn("writeFileSync is not available yet");
        return;
      }
      return handleAddFile(newFile, parentPath, writeFileSync, instance, saveTemplateData);
    },
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
    (
      file: TemplateFile,
      newFilename: string,
      newExtension: string,
      parentPath: string
    ) =>
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
