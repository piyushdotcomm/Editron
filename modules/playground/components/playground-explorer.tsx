"use client";

import * as React from "react";
import {
  ChevronRight,
  FilePlus,
  FolderPlus,
  MoreHorizontal,
  Trash2,
  Edit3,
  Search,
  X,
} from "lucide-react";
import { FileIcon, FolderIcon } from "./file-icon";
import { Input } from "@/components/ui/input";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

import { Button } from "@/components/ui/button";
import { ExplorerRootActions } from "./explorer-dialogs/explorer-root-actions";
import { ExplorerFileActions } from "./explorer-dialogs/explorer-file-actions";
import { ExplorerFolderActions } from "./explorer-dialogs/explorer-folder-actions";
import type {
  TemplateFile,
  TemplateFolder,
  TemplateItem,
} from "./explorer-dialogs/types";

interface TemplateFileTreeProps {
  data: TemplateItem;
  onFileSelect?: (file: TemplateFile) => void;
  selectedFile?: TemplateFile;
  title?: string;
  onAddFile?: (file: TemplateFile, parentPath: string) => void;
  onAddFolder?: (folder: TemplateFolder, parentPath: string) => void;
  onDeleteFile?: (file: TemplateFile, parentPath: string) => void;
  onDeleteFolder?: (folder: TemplateFolder, parentPath: string) => void;
  onRenameFile?: (
    file: TemplateFile,
    newFilename: string,
    newExtension: string,
    parentPath: string,
  ) => void;
  onRenameFolder?: (
    folder: TemplateFolder,
    newFolderName: string,
    parentPath: string,
  ) => void;
}

export function TemplateFileTree({
  data,
  onFileSelect,
  selectedFile,
  title = "Files Explorer",
  onAddFile,
  onAddFolder,
  onDeleteFile,
  onDeleteFolder,
  onRenameFile,
  onRenameFolder,
}: TemplateFileTreeProps) {
  const isRootFolder = data && typeof data === "object" && "folderName" in data;
  const [searchQuery, setSearchQuery] = React.useState("");

  // Filter items recursively
  const filterItems = (
    items: (TemplateFile | TemplateFolder)[],
    query: string,
  ): (TemplateFile | TemplateFolder)[] => {
    if (!query.trim()) return items;
    const q = query.toLowerCase();
    return items.filter((item) => {
      if ("folderName" in item) {
        // Keep folder if its name matches or any child matches
        if (item.folderName.toLowerCase().includes(q)) return true;
        return filterItems(item.items, query).length > 0;
      }
      const name = `${item.filename}.${item.fileExtension}`;
      return name.toLowerCase().includes(q);
    });
  };

  const filteredItems = isRootFolder
    ? filterItems((data as TemplateFolder).items, searchQuery)
    : [];

  return (
    <ExplorerRootActions onAddFile={onAddFile} onAddFolder={onAddFolder}>
      {({ openNewFileDialog, openNewFolderDialog }) => (
        <div className="flex flex-col w-full h-full">
          <div className="flex-1 overflow-y-auto w-full custom-scrollbar">
            <SidebarGroup>
              <div className="flex items-center justify-between px-2 cursor-default group/root-actions">
                <SidebarGroupLabel className="px-1 font-semibold text-xs tracking-wider text-muted-foreground uppercase">
                  {title}
                </SidebarGroupLabel>

                <div className="flex items-center gap-0.5 opacity-0 group-hover/root-actions:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-md"
                    onClick={openNewFileDialog}
                    title="New File"
                    aria-label="New File"
                  >
                    <FilePlus className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-md"
                    onClick={openNewFolderDialog}
                    title="New Folder"
                    aria-label="New Folder"
                  >
                    <FolderPlus className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              {/* Premium Search filter */}
              <div className="px-3 pb-3 pt-1">
                <div className="relative group/search">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50 transition-colors group-focus-within/search:text-primary" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Find in files..."
                    className="h-8 text-xs pl-9 pr-8 bg-black/5 dark:bg-white/5 border-transparent focus-visible:ring-1 focus-visible:ring-primary/50 focus-visible:bg-background rounded-full transition-all shadow-inner"
                    aria-label="Filter files"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-foreground transition-colors"
                      aria-label="Clear filter"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <SidebarGroupContent>
                <SidebarMenu>
                  {isRootFolder ? (
                    filteredItems.map((child) => (
                      <TemplateNode
                        key={
                          "folderName" in child
                            ? child.folderName
                            : `${child.filename}.${child.fileExtension}`
                        }
                        item={child}
                        onFileSelect={onFileSelect}
                        selectedFile={selectedFile}
                        level={0}
                        path=""
                        onAddFile={onAddFile}
                        onAddFolder={onAddFolder}
                        onDeleteFile={onDeleteFile}
                        onDeleteFolder={onDeleteFolder}
                        onRenameFile={onRenameFile}
                        onRenameFolder={onRenameFolder}
                      />
                    ))
                  ) : (
                    <TemplateNode
                      item={data}
                      onFileSelect={onFileSelect}
                      selectedFile={selectedFile}
                      level={0}
                      path=""
                      onAddFile={onAddFile}
                      onAddFolder={onAddFolder}
                      onDeleteFile={onDeleteFile}
                      onDeleteFolder={onDeleteFolder}
                      onRenameFile={onRenameFile}
                      onRenameFolder={onRenameFolder}
                    />
                  )}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </div>
        </div>
      )}
    </ExplorerRootActions>
  );
}

interface TemplateNodeProps {
  item: TemplateItem;
  onFileSelect?: (file: TemplateFile) => void;
  selectedFile?: TemplateFile;
  level: number;
  path?: string;
  onAddFile?: (file: TemplateFile, parentPath: string) => void;
  onAddFolder?: (folder: TemplateFolder, parentPath: string) => void;
  onDeleteFile?: (file: TemplateFile, parentPath: string) => void;
  onDeleteFolder?: (folder: TemplateFolder, parentPath: string) => void;
  onRenameFile?: (
    file: TemplateFile,
    newFilename: string,
    newExtension: string,
    parentPath: string,
  ) => void;
  onRenameFolder?: (
    folder: TemplateFolder,
    newFolderName: string,
    parentPath: string,
  ) => void;
}

function TemplateNode({
  item,
  onFileSelect,
  selectedFile,
  level,
  path = "",
  onAddFile,
  onAddFolder,
  onDeleteFile,
  onDeleteFolder,
  onRenameFile,
  onRenameFolder,
}: TemplateNodeProps) {
  const isValidItem = item && typeof item === "object";
  const isFolder = isValidItem && "folderName" in item;
  const [isOpen, setIsOpen] = React.useState(false);

  if (!isValidItem) return null;

  if (!isFolder) {
    const file = item as TemplateFile;
    const fileName = `${file.filename}.${file.fileExtension}`;

    const isSelected =
      selectedFile &&
      selectedFile.filename === file.filename &&
      selectedFile.fileExtension === file.fileExtension;

    return (
      <ExplorerFileActions
        file={file}
        path={path}
        onDeleteFile={onDeleteFile}
        onRenameFile={onRenameFile}
      >
        {({ openRenameDialog, openDeleteDialog }) => (
          <SidebarMenuItem>
            <div
              className="flex items-center group relative w-full h-8"
              style={{ paddingLeft: `${level * 12}px` }}
            >
              {/* Tree Indentation Guide */}
              {level > 0 && (
                <div
                  className="absolute left-[10px] top-0 bottom-0 w-px bg-border/40"
                  style={{ left: `${level * 12 - 8}px` }}
                />
              )}

              {/* Active File Line Indicator */}
              {isSelected && (
                <div className="absolute left-1 top-1.5 bottom-1.5 w-[3px] rounded-full bg-primary z-10" />
              )}

              <SidebarMenuButton
                isActive={isSelected}
                onClick={() => onFileSelect?.(file)}
                className={`flex-1 ${isSelected ? "bg-primary/10 text-primary font-medium" : ""}`}
              >
                <FileIcon
                  extension={file.fileExtension}
                  className="h-4 w-4 mr-2"
                />
                <span>{fileName}</span>
              </SidebarMenuButton>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label={`More actions for ${fileName}`}
                  >
                    <MoreHorizontal className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={openRenameDialog}>
                    <Edit3 className="h-4 w-4 mr-2" />
                    Rename
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={openDeleteDialog}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </SidebarMenuItem>
        )}
      </ExplorerFileActions>
    );
  } else {
    const folder = item as TemplateFolder;
    const folderName = folder.folderName;
    const currentPath = path ? `${path}/${folderName}` : folderName;

    return (
      <ExplorerFolderActions
        folder={folder}
        path={path}
        currentPath={currentPath}
        onAddFile={onAddFile}
        onAddFolder={onAddFolder}
        onDeleteFolder={onDeleteFolder}
        onRenameFolder={onRenameFolder}
      >
        {({
          openNewFileDialog,
          openNewFolderDialog,
          openRenameDialog,
          openDeleteDialog,
        }) => (
          <SidebarMenuItem>
            <Collapsible
              open={isOpen}
              onOpenChange={setIsOpen}
              className="group/collapsible [&[data-state=open]>div>button>svg:first-child]:rotate-90"
            >
              <div
                className="flex items-center group/folder-actions relative w-full"
                style={{ paddingLeft: `${level * 12}px` }}
              >
                {/* Tree Indentation Guide */}
                {level > 0 && (
                  <div
                    className="absolute left-[10px] top-0 bottom-0 w-px bg-border/40"
                    style={{ left: `${level * 12 - 8}px` }}
                  />
                )}

                <CollapsibleTrigger asChild>
                  <SidebarMenuButton className="flex-1 pr-16 group-data-[state=open]/collapsible:text-foreground">
                    <ChevronRight className="transition-transform h-4 w-4 -ml-1 text-muted-foreground/60" />
                    <FolderIcon isOpen={isOpen} className="h-4 w-4 mr-1.5" />
                    <span className="truncate">{folderName}</span>
                  </SidebarMenuButton>
                </CollapsibleTrigger>

                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5 opacity-0 group-hover/folder-actions:opacity-100 transition-opacity bg-background/50 backdrop-blur-sm px-1 rounded-md">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-md"
                    onClick={(e) => {
                      e.stopPropagation();
                      openNewFileDialog();
                    }}
                    title="New File"
                    aria-label="New File"
                  >
                    <FilePlus className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-md"
                    onClick={(e) => {
                      e.stopPropagation();
                      openNewFolderDialog();
                    }}
                    title="New Folder"
                    aria-label="New Folder"
                  >
                    <FolderPlus className="h-3.5 w-3.5" />
                  </Button>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label={`More actions for ${folderName}`}
                    >
                      <MoreHorizontal className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={openNewFileDialog}>
                      <FilePlus className="h-4 w-4 mr-2" />
                      New File
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={openNewFolderDialog}>
                      <FolderPlus className="h-4 w-4 mr-2" />
                      New Folder
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={openRenameDialog}>
                      <Edit3 className="h-4 w-4 mr-2" />
                      Rename
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={openDeleteDialog}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <CollapsibleContent>
                <SidebarMenuSub>
                  {folder.items.map((childItem) => (
                    <TemplateNode
                      key={
                        "folderName" in childItem
                          ? `${currentPath}/${childItem.folderName}`
                          : `${currentPath}/${childItem.filename}.${childItem.fileExtension}`
                      }
                      item={childItem}
                      onFileSelect={onFileSelect}
                      selectedFile={selectedFile}
                      level={level + 1}
                      path={currentPath}
                      onAddFile={onAddFile}
                      onAddFolder={onAddFolder}
                      onDeleteFile={onDeleteFile}
                      onDeleteFolder={onDeleteFolder}
                      onRenameFile={onRenameFile}
                      onRenameFolder={onRenameFolder}
                    />
                  ))}
                </SidebarMenuSub>
              </CollapsibleContent>
            </Collapsible>
          </SidebarMenuItem>
        )}
      </ExplorerFolderActions>
    );
  }
}
