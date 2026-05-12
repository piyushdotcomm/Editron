import React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileIcon } from "./file-icon";
import { _Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface PlaygroundTabBarProps {
    openFiles: any[];
    activeFileId: string | null;
    setActiveFileId: (id: string) => void;
    closeFile: (id: string) => void;
}

export const PlaygroundTabBar = ({
    openFiles,
    activeFileId,
    setActiveFileId,
    closeFile,
}: PlaygroundTabBarProps) => {
    if (openFiles.length === 0) return null;

    return (
        <div className="border-b bg-muted/20">
            <Tabs value={activeFileId || ""} onValueChange={setActiveFileId}>
                <div className="flex items-center px-1 pt-1">
                    <div className="overflow-x-auto scrollbar-hide flex-1">
                        <TabsList className="h-9 bg-transparent p-0 inline-flex" role="tablist">
                            {openFiles.map((file) => {
                                const isActive = file.id === activeFileId;
                                return (
                                    <TabsTrigger
                                        key={file.id}
                                        value={file.id}
                                        role="tab"
                                        className={`
                      relative h-9 px-4 text-[13px] border-r border-t rounded-t-lg rounded-b-none 
                      group transition-all duration-200 ease-in-out min-w-[120px] justify-start
                      ${isActive
                                                ? "bg-background shadow-sm border-t-primary text-primary font-medium z-10 before:absolute before:inset-x-0 before:-top-px before:h-[2px] before:bg-primary before:rounded-t-lg"
                                                : "bg-muted/30 border-transparent text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                                            }
                    `}
                                    >
                                        <div className="flex items-center gap-2 w-full">
                                            <FileIcon extension={file.fileExtension} className={`h-3.5 w-3.5 shrink-0 ${isActive ? "opacity-100" : "opacity-70 group-hover:opacity-100"}`} />
                                            <span className="truncate flex-1 text-left">
                                                {file.filename}.{file.fileExtension}
                                            </span>

                                            {/* Status/Close Indicator */}
                                            <div className="flex items-center justify-end w-4 shrink-0 -mr-1">
                                                {file.hasUnsavedChanges ? (
                                                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500 group-hover:hidden transition-all" />
                                                ) : null}

                                                <span
                                                    className={`
                            h-4 w-4 rounded-sm flex items-center justify-center transition-all cursor-pointer
                            hover:bg-destructive/10 hover:text-destructive
                            ${file.hasUnsavedChanges ? "hidden group-hover:flex" : "opacity-0 group-hover:opacity-100"}
                          `}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        closeFile(file.id);
                                                    }}
                                                    role="button"
                                                    aria-label={`Close ${file.filename}.${file.fileExtension}`}
                                                >
                                                    <X className="h-3 w-3" />
                                                </span>
                                            </div>
                                        </div>
                                    </TabsTrigger>
                                );
                            })}
                        </TabsList>
                    </div>
                </div>
            </Tabs>
        </div>
    );
};
