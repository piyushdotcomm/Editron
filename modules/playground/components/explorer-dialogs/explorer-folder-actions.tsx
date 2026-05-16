"use client";

import * as React from "react";

import NewFileDialog from "../dialogs/new-file-dialog";
import NewFolderDialog from "../dialogs/new-folder-dialog";
import RenameFolderDialog from "../dialogs/rename-folder-dialog";
import { DeleteDialog } from "../dialogs/delete-dialog";
import type { TemplateFile, TemplateFolder } from "./types";

interface ExplorerFolderActionsProps {
  folder: TemplateFolder;
  path: string;
  currentPath: string;

  onAddFile?: (file: TemplateFile, parentPath: string) => void;

  onAddFolder?: (folder: TemplateFolder, parentPath: string) => void;

  onDeleteFolder?: (folder: TemplateFolder, parentPath: string) => void;

  onRenameFolder?: (
    folder: TemplateFolder,
    newFolderName: string,
    parentPath: string,
  ) => void;

  children: (actions: {
    openNewFileDialog: () => void;
    openNewFolderDialog: () => void;
    openRenameDialog: () => void;
    openDeleteDialog: () => void;
  }) => React.ReactNode;
}

export function ExplorerFolderActions({
  folder,
  path,
  currentPath,
  onAddFile,
  onAddFolder,
  onDeleteFolder,
  onRenameFolder,
  children,
}: ExplorerFolderActionsProps) {
  const [isNewFileDialogOpen, setIsNewFileDialogOpen] = React.useState(false);

  const [isNewFolderDialogOpen, setIsNewFolderDialogOpen] =
    React.useState(false);

  const [isRenameDialogOpen, setIsRenameDialogOpen] = React.useState(false);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);

  const handleCreateFile = (filename: string, extension: string) => {
    if (!onAddFile) {
      return;
    }

    const newFile: TemplateFile = {
      filename,
      fileExtension: extension,
      content: "",
    };

    onAddFile(newFile, currentPath);

    setIsNewFileDialogOpen(false);
  };

  const handleCreateFolder = (folderName: string) => {
    if (!onAddFolder) {
      return;
    }

    const newFolder: TemplateFolder = {
      folderName,
      items: [],
    };

    onAddFolder(newFolder, currentPath);

    setIsNewFolderDialogOpen(false);
  };

  const handleRenameSubmit = (newFolderName: string) => {
    onRenameFolder?.(folder, newFolderName, path);

    setIsRenameDialogOpen(false);
  };

  const handleDeleteConfirm = () => {
    onDeleteFolder?.(folder, path);

    setIsDeleteDialogOpen(false);
  };

  return (
    <>
      {children({
        openNewFileDialog: () => setIsNewFileDialogOpen(true),

        openNewFolderDialog: () => setIsNewFolderDialogOpen(true),

        openRenameDialog: () => setIsRenameDialogOpen(true),

        openDeleteDialog: () => setIsDeleteDialogOpen(true),
      })}

      <NewFileDialog
        isOpen={isNewFileDialogOpen}
        onClose={() => setIsNewFileDialogOpen(false)}
        onCreateFile={handleCreateFile}
      />

      <NewFolderDialog
        isOpen={isNewFolderDialogOpen}
        onClose={() => setIsNewFolderDialogOpen(false)}
        onCreateFolder={handleCreateFolder}
      />

      <RenameFolderDialog
        isOpen={isRenameDialogOpen}
        onClose={() => setIsRenameDialogOpen(false)}
        onRename={handleRenameSubmit}
        currentFolderName={folder.folderName}
      />

      <DeleteDialog
        isOpen={isDeleteDialogOpen}
        setIsOpen={setIsDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        title="Delete Folder"
        description={`Are you sure you want to delete "${folder.folderName}" and all its contents? This action cannot be undone.`}
        itemName={folder.folderName}
        confirmLabel="Delete"
        cancelLabel="Cancel"
      />
    </>
  );
}
