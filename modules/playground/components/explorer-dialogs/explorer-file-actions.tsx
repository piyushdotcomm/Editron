"use client";

import * as React from "react";

import RenameFileDialog from "../dialogs/rename-file-dialog";
import { DeleteDialog } from "../dialogs/delete-dialog";

interface TemplateFile {
  filename: string;
  fileExtension: string;
  content: string;
}

interface ExplorerFileActionsProps {
  file: TemplateFile;
  path: string;

  onDeleteFile?: (file: TemplateFile, parentPath: string) => void;

  onRenameFile?: (
    file: TemplateFile,
    newFilename: string,
    newExtension: string,
    parentPath: string,
  ) => void;

  children: (actions: {
    openRenameDialog: () => void;
    openDeleteDialog: () => void;
  }) => React.ReactNode;
}

export function ExplorerFileActions({
  file,
  path,
  onDeleteFile,
  onRenameFile,
  children,
}: ExplorerFileActionsProps) {
  const [isRenameDialogOpen, setIsRenameDialogOpen] = React.useState(false);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);

  const fileName = `${file.filename}.${file.fileExtension}`;

  const handleRenameSubmit = (newFilename: string, newExtension: string) => {
    onRenameFile?.(file, newFilename, newExtension, path);

    setIsRenameDialogOpen(false);
  };

  const handleDeleteConfirm = () => {
    onDeleteFile?.(file, path);

    setIsDeleteDialogOpen(false);
  };

  return (
    <>
      {children({
        openRenameDialog: () => setIsRenameDialogOpen(true),

        openDeleteDialog: () => setIsDeleteDialogOpen(true),
      })}

      <RenameFileDialog
        isOpen={isRenameDialogOpen}
        onClose={() => setIsRenameDialogOpen(false)}
        onRename={handleRenameSubmit}
        currentFilename={file.filename}
        currentExtension={file.fileExtension}
      />

      <DeleteDialog
        isOpen={isDeleteDialogOpen}
        setIsOpen={setIsDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        title="Delete File"
        description={`Are you sure you want to delete "${fileName}"? This action cannot be undone.`}
        itemName={fileName}
        confirmLabel="Delete"
        cancelLabel="Cancel"
      />
    </>
  );
}
