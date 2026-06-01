import { create } from "zustand";
import { toast } from "sonner";

import { TemplateFile, TemplateFolder } from "../lib/path-to-json";
import type { WebContainer } from "@webcontainer/api";

import { generateFileId } from "../lib";

export interface OpenFile extends TemplateFile {
  id: string;
  hasUnsavedChanges: boolean;
  content: string;
  originalContent: string;
}

interface FileExplorerState {
  playgroundId: string;
  templateData: TemplateFolder | null;
  
  // Global file objects
  openFiles: OpenFile[];
  
  // Pane State
  splitLayout: 'none' | 'vertical' | 'horizontal';
  focusedPane: 'primary' | 'secondary';
  
  primaryPaneFiles: string[];
  activeFileId: string | null;
  
  secondaryPaneFiles: string[];
  secondaryActiveFileId: string | null;
  
  editorContent: string; // Used mostly for primary pane backward compat
  secondaryEditorContent: string;

  // Setter Functions
  setPlaygroundId: (id: string) => void;
  setTemplateData: (data: TemplateFolder | null) => void;
  setEditorContent: (content: string) => void;
  setOpenFiles: (files: OpenFile[]) => void;
  setActiveFileId: (fileId: string | null, pane?: 'primary' | 'secondary') => void;
  
  setSplitLayout: (layout: 'none' | 'vertical' | 'horizontal') => void;
  setFocusedPane: (pane: 'primary' | 'secondary') => void;

  // Functions
  openFile: (file: TemplateFile, forcePane?: 'primary' | 'secondary') => void;
  closeFile: (fileId: string, pane?: 'primary' | 'secondary') => void;
  closeAllFiles: () => void;

  // File explorer methods
   handleAddFile: (
    newFile: TemplateFile,
    parentPath: string,
    writeFileSync: (filePath: string, content: string) => Promise<void>,
    instance: WebContainer | null,
    saveTemplateData: (data: TemplateFolder) => Promise<void>
  ) => Promise<void>;

  handleAddFolder: (
    newFolder: TemplateFolder, 
    parentPath: string, 
    instance: WebContainer | null, 
    saveTemplateData: (data: TemplateFolder) => Promise<void>
  ) => Promise<void>;

  handleDeleteFile: (
    file: TemplateFile, 
    parentPath: string, 
    saveTemplateData: (data: TemplateFolder) => Promise<void>
  ) => Promise<void>;
  handleDeleteFolder: (
    folder: TemplateFolder,
    parentPath: string,
    saveTemplateData: (data: TemplateFolder) => Promise<void>
  ) => Promise<void>;
  handleRenameFile: (
    file: TemplateFile,
    newFilename: string,
    newExtension: string,
    parentPath: string,
    saveTemplateData: (data: TemplateFolder) => Promise<void>
  ) => Promise<void>;
  handleRenameFolder: (
    folder: TemplateFolder,
    newFolderName: string,
    parentPath: string,
    saveTemplateData: (data: TemplateFolder) => Promise<void>
  ) => Promise<void>;
  
  updateFileContent: (fileId: string, content: string) => void;
}


export const useFileExplorer = create<FileExplorerState>((set, get) => ({
  templateData: null,
  playgroundId: "",
  openFiles: [] satisfies OpenFile[],
  
  splitLayout: 'none',
  focusedPane: 'primary',
  
  primaryPaneFiles: [],
  activeFileId: null,
  
  secondaryPaneFiles: [],
  secondaryActiveFileId: null,
  
  editorContent: "",
  secondaryEditorContent: "",

  setTemplateData: (data) => set({ templateData: data }),
  setPlaygroundId(id) {
    set({ playgroundId: id });
  },
  setEditorContent: (content) => set({ editorContent: content }),
  setOpenFiles: (files) => set({ openFiles: files }),
  
  setActiveFileId: (fileId, pane) => {
    const targetPane = pane || get().focusedPane;
    const file = get().openFiles.find(f => f.id === fileId);
    const content = file ? file.content : "";
    
    if (targetPane === 'primary') {
      set({ activeFileId: fileId, editorContent: content, focusedPane: 'primary' });
    } else {
      set({ secondaryActiveFileId: fileId, secondaryEditorContent: content, focusedPane: 'secondary' });
    }
  },
  
  setSplitLayout: (layout) => set({ splitLayout: layout }),
  setFocusedPane: (pane) => set({ focusedPane: pane }),

  openFile: (file, forcePane) => {
    const fileId = generateFileId(file, get().templateData!);
    const state = get();
    const targetPane = forcePane || state.focusedPane;
    const existingFile = state.openFiles.find((f) => f.id === fileId);

    // Ensure the file is globally in openFiles
    let newOpenFiles = state.openFiles;
    if (!existingFile) {
      const newOpenFile: OpenFile = {
        ...file,
        id: fileId,
        hasUnsavedChanges: false,
        content: file.content || "",
        originalContent: file.content || "",
      };
      newOpenFiles = [...state.openFiles, newOpenFile];
    }
    
    const contentToSet = existingFile ? existingFile.content : (file.content || "");

    // Push to pane list if not present, and set active
    if (targetPane === 'primary') {
      const newPaneFiles = state.primaryPaneFiles.includes(fileId) 
        ? state.primaryPaneFiles 
        : [...state.primaryPaneFiles, fileId];
        
      set({ 
        openFiles: newOpenFiles,
        primaryPaneFiles: newPaneFiles,
        activeFileId: fileId,
        editorContent: contentToSet,
        focusedPane: 'primary'
      });
    } else {
      const newPaneFiles = state.secondaryPaneFiles.includes(fileId) 
        ? state.secondaryPaneFiles 
        : [...state.secondaryPaneFiles, fileId];
        
      set({ 
        openFiles: newOpenFiles,
        secondaryPaneFiles: newPaneFiles,
        secondaryActiveFileId: fileId,
        secondaryEditorContent: contentToSet,
        focusedPane: 'secondary'
      });
    }
  },

  closeFile: (fileId, pane) => {
    const state = get();
    const targetPane = pane || state.focusedPane;
    
    let newPrimaryFiles = state.primaryPaneFiles;
    let newSecondaryFiles = state.secondaryPaneFiles;
    let newActiveId = state.activeFileId;
    let newSecondaryActiveId = state.secondaryActiveFileId;
    
    if (targetPane === 'primary') {
      newPrimaryFiles = newPrimaryFiles.filter(id => id !== fileId);
      if (newActiveId === fileId) {
        newActiveId = newPrimaryFiles.length > 0 ? newPrimaryFiles[newPrimaryFiles.length - 1] : null;
      }
    } else {
      newSecondaryFiles = newSecondaryFiles.filter(id => id !== fileId);
      if (newSecondaryActiveId === fileId) {
        newSecondaryActiveId = newSecondaryFiles.length > 0 ? newSecondaryFiles[newSecondaryFiles.length - 1] : null;
      }
    }
    
    // Remove from global openFiles if it's no longer in ANY pane
    const stillOpen = newPrimaryFiles.includes(fileId) || newSecondaryFiles.includes(fileId);
    const newOpenFiles = stillOpen 
      ? state.openFiles 
      : state.openFiles.filter(f => f.id !== fileId);
      
    // Determine content based on new active IDs
    const newEditorContent = newActiveId 
      ? newOpenFiles.find(f => f.id === newActiveId)?.content || "" 
      : "";
    const newSecondaryEditorContent = newSecondaryActiveId 
      ? newOpenFiles.find(f => f.id === newSecondaryActiveId)?.content || "" 
      : "";
      
    set({
      openFiles: newOpenFiles,
      primaryPaneFiles: newPrimaryFiles,
      secondaryPaneFiles: newSecondaryFiles,
      activeFileId: newActiveId,
      secondaryActiveFileId: newSecondaryActiveId,
      editorContent: newEditorContent,
      secondaryEditorContent: newSecondaryEditorContent
    });
  },

  closeAllFiles: () => {
    set({
      openFiles: [],
      primaryPaneFiles: [],
      secondaryPaneFiles: [],
      activeFileId: null,
      secondaryActiveFileId: null,
      editorContent: "",
      secondaryEditorContent: ""
    });
  },

  handleAddFile: async(newFile , parentPath , writeFileSync , instance , saveTemplateData) => {
    const { templateData } = get();
    if (!templateData) return;

    try {
      const updatedTemplateData = JSON.parse(JSON.stringify(templateData)) as TemplateFolder;
      const pathParts = parentPath.split("/");
      let currentFolder = updatedTemplateData;

      for (const part of pathParts) {
        if (part) {
          const nextFolder = currentFolder.items.find(
            (item) => "folderName" in item && item.folderName === part
          ) as TemplateFolder;
          if (nextFolder) currentFolder = nextFolder;
        }
      }

      currentFolder.items.push(newFile);
      set({ templateData: updatedTemplateData });
      toast.success(`Created file: ${newFile.filename}.${newFile.fileExtension}`);

      await saveTemplateData(updatedTemplateData);

      if (writeFileSync) {
        const filePath = parentPath
          ? `${parentPath}/${newFile.filename}.${newFile.fileExtension}`
          : `${newFile.filename}.${newFile.fileExtension}`;
        await writeFileSync(filePath, newFile.content || "");
      }

      get().openFile(newFile);
    } catch (error) {
      console.error("Error adding file:", error);
      toast.error("Failed to create file");
    }
  },

  handleAddFolder: async (newFolder, parentPath, instance, saveTemplateData) => {
    const { templateData } = get();
    if (!templateData) return;

    try {
      const updatedTemplateData = JSON.parse(JSON.stringify(templateData)) as TemplateFolder;
      const pathParts = parentPath.split("/");
      let currentFolder = updatedTemplateData;

      for (const part of pathParts) {
        if (part) {
          const nextFolder = currentFolder.items.find(
            (item) => "folderName" in item && item.folderName === part
          ) as TemplateFolder;
          if (nextFolder) currentFolder = nextFolder;
        }
      }

      currentFolder.items.push(newFolder);
      set({ templateData: updatedTemplateData });
      toast.success(`Created folder: ${newFolder.folderName}`);

      await saveTemplateData(updatedTemplateData);

      if (instance && instance.fs) {
        const folderPath = parentPath
          ? `${parentPath}/${newFolder.folderName}`
          : newFolder.folderName;
        await instance.fs.mkdir(folderPath, { recursive: true });
      }
    } catch (error) {
      console.error("Error adding folder:", error);
      toast.error("Failed to create folder");
    }
  },

  handleDeleteFile: async (file, parentPath, saveTemplateData) => {
    const { templateData } = get();
    if (!templateData) return;

    try {
      const updatedTemplateData = JSON.parse(
        JSON.stringify(templateData)
      ) as TemplateFolder;
      const pathParts = parentPath.split("/");
      let currentFolder = updatedTemplateData;

      for (const part of pathParts) {
        if (part) {
          const nextFolder = currentFolder.items.find(
            (item) => "folderName" in item && item.folderName === part
          ) as TemplateFolder;
          if (nextFolder) currentFolder = nextFolder;
        }
      }

      currentFolder.items = currentFolder.items.filter(
        (item) =>
          !("filename" in item) ||
          item.filename !== file.filename ||
          item.fileExtension !== file.fileExtension
      );

      const fileId = generateFileId(file, templateData);
      
      // Close in both panes to be safe
      get().closeFile(fileId, 'primary');
      get().closeFile(fileId, 'secondary');

      set({ templateData: updatedTemplateData });
      await saveTemplateData(updatedTemplateData);
      toast.success(`Deleted file: ${file.filename}.${file.fileExtension}`);
    } catch (error) {
      console.error("Error deleting file:", error);
      toast.error("Failed to delete file");
    }
  },

  handleDeleteFolder: async (folder, parentPath, saveTemplateData) => {
    const { templateData } = get();
    if (!templateData) return;

    try {
      const updatedTemplateData = JSON.parse(
        JSON.stringify(templateData)
      ) as TemplateFolder;
      const pathParts = parentPath.split("/");
      let currentFolder = updatedTemplateData;

      for (const part of pathParts) {
        if (part) {
          const nextFolder = currentFolder.items.find(
            (item) => "folderName" in item && item.folderName === part
          ) as TemplateFolder;
          if (nextFolder) currentFolder = nextFolder;
        }
      }

      currentFolder.items = currentFolder.items.filter(
        (item) =>
          !("folderName" in item) || item.folderName !== folder.folderName
      );

      const closeFilesInFolder = (folder: TemplateFolder, currentPath: string = "") => {
        folder.items.forEach((item) => {
          if ("filename" in item) {
            const fileId = generateFileId(item, templateData);
            get().closeFile(fileId, 'primary');
            get().closeFile(fileId, 'secondary');
          } else if ("folderName" in item) {
            const newPath = currentPath ? `${currentPath}/${item.folderName}` : item.folderName;
            closeFilesInFolder(item, newPath);
          }
        });
      };
      
      closeFilesInFolder(folder, parentPath ? `${parentPath}/${folder.folderName}` : folder.folderName);

      set({ templateData: updatedTemplateData });
      await saveTemplateData(updatedTemplateData);
      toast.success(`Deleted folder: ${folder.folderName}`);
    } catch (error) {
      console.error("Error deleting folder:", error);
      toast.error("Failed to delete folder");
    }
  },

  handleRenameFile: async (
    file,
    newFilename,
    newExtension,
    parentPath,
    saveTemplateData
  ) => {
    const { templateData, openFiles, primaryPaneFiles, secondaryPaneFiles, activeFileId, secondaryActiveFileId } = get();
    if (!templateData) return;

    const oldFileId = generateFileId(file, templateData);
    const newFile = { ...file, filename: newFilename, fileExtension: newExtension };
    const newFileId = generateFileId(newFile, templateData);

    try {
      const updatedTemplateData = JSON.parse(
        JSON.stringify(templateData)
      ) as TemplateFolder;
      const pathParts = parentPath.split("/");
      let currentFolder = updatedTemplateData;

      for (const part of pathParts) {
        if (part) {
          const nextFolder = currentFolder.items.find(
            (item) => "folderName" in item && item.folderName === part
          ) as TemplateFolder;
          if (nextFolder) currentFolder = nextFolder;
        }
      }

      const fileIndex = currentFolder.items.findIndex(
        (item) =>
          "filename" in item &&
          item.filename === file.filename &&
          item.fileExtension === file.fileExtension
      );

      if (fileIndex !== -1) {
        const updatedFile = {
          ...currentFolder.items[fileIndex],
          filename: newFilename,
          fileExtension: newExtension,
        } as TemplateFile;
        currentFolder.items[fileIndex] = updatedFile;

        const updatedOpenFiles = openFiles.map((f) =>
          f.id === oldFileId
            ? {
                ...f,
                id: newFileId,
                filename: newFilename,
                fileExtension: newExtension,
              }
            : f
        );

        set({
          templateData: updatedTemplateData,
          openFiles: updatedOpenFiles,
          primaryPaneFiles: primaryPaneFiles.map(id => id === oldFileId ? newFileId : id),
          secondaryPaneFiles: secondaryPaneFiles.map(id => id === oldFileId ? newFileId : id),
          activeFileId: activeFileId === oldFileId ? newFileId : activeFileId,
          secondaryActiveFileId: secondaryActiveFileId === oldFileId ? newFileId : secondaryActiveFileId,
        });

        await saveTemplateData(updatedTemplateData);
        toast.success(`Renamed file to: ${newFilename}.${newExtension}`);
      }
    } catch (error) {
      console.error("Error renaming file:", error);
      toast.error("Failed to rename file");
    }
  },
  
  handleRenameFolder: async (folder, newFolderName, parentPath, saveTemplateData) => {
    const { templateData } = get();
    if (!templateData) return;

    try {
      const updatedTemplateData = JSON.parse(
        JSON.stringify(templateData)
      ) as TemplateFolder;
      const pathParts = parentPath.split("/");
      let currentFolder = updatedTemplateData;

      for (const part of pathParts) {
        if (part) {
          const nextFolder = currentFolder.items.find(
            (item) => "folderName" in item && item.folderName === part
          ) as TemplateFolder;
          if (nextFolder) currentFolder = nextFolder;
        }
      }

      const folderIndex = currentFolder.items.findIndex(
        (item) => "folderName" in item && item.folderName === folder.folderName
      );

      if (folderIndex !== -1) {
        const updatedFolder = {
          ...currentFolder.items[folderIndex],
          folderName: newFolderName,
        } as TemplateFolder;
        currentFolder.items[folderIndex] = updatedFolder;

        set({ templateData: updatedTemplateData });
        await saveTemplateData(updatedTemplateData);
        toast.success(`Renamed folder to: ${newFolderName}`);
      }
    } catch (error) {
      console.error("Error renaming folder:", error);
      toast.error("Failed to rename folder");
    }
  },

  updateFileContent: (fileId, content) => {
    set((state) => ({
      openFiles: state.openFiles.map((file) =>
        file.id === fileId
          ? {
              ...file,
              content,
              hasUnsavedChanges: content !== file.originalContent,
            }
          : file
      ),
      editorContent: fileId === state.activeFileId ? content : state.editorContent,
      secondaryEditorContent: fileId === state.secondaryActiveFileId ? content : state.secondaryEditorContent,
    }));
  },

}));