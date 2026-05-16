"use client";

import * as React from "react";

import NewFileDialog from "../dialogs/new-file-dialog";
import NewFolderDialog from "../dialogs/new-folder-dialog";

interface TemplateFile {
  filename: string;
  fileExtension: string;
  content: string;
}

interface TemplateFolder {
  folderName: string;
  items: (TemplateFile | TemplateFolder)[];
}

interface ExplorerRootActionsProps {
  onAddFile?: (file: TemplateFile, parentPath: string) => void;
  onAddFolder?: (folder: TemplateFolder, parentPath: string) => void;
  children: (actions: {
    openNewFileDialog: () => void;
    openNewFolderDialog: () => void;
  }) => React.ReactNode;
}

export function ExplorerRootActions({
  onAddFile,
  onAddFolder,
  children,
}: ExplorerRootActionsProps) {
  const [isNewFileDialogOpen, setIsNewFileDialogOpen] = React.useState(false);

  const [isNewFolderDialogOpen, setIsNewFolderDialogOpen] =
    React.useState(false);

  const handleCreateFile = (filename: string, extension: string) => {
    if (!onAddFile) {
      return;
    }

    const newFile: TemplateFile = {
      filename,
      fileExtension: extension,
      content: "",
    };

    onAddFile(newFile, "");

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

    onAddFolder(newFolder, "");

    setIsNewFolderDialogOpen(false);
  };

  return (
    <>
      {children({
        openNewFileDialog: () => setIsNewFileDialogOpen(true),

        openNewFolderDialog: () => setIsNewFolderDialogOpen(true),
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
    </>
  );
}
