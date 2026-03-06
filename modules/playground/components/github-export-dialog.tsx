"use client";

import React, { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Loader2, Github, CheckCircle2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import type { TemplateFolder } from "@/modules/playground/lib/path-to-json";

interface GithubExportDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    templateData: TemplateFolder | null;
    defaultRepoName?: string;
}

export function GithubExportDialog({ open, onOpenChange, templateData, defaultRepoName }: GithubExportDialogProps) {
    const [repoName, setRepoName] = useState(defaultRepoName ? defaultRepoName.toLowerCase().replace(/[^a-z0-9-]/g, '-') : "editron-export");
    const [description, setDescription] = useState("Exported from Editron Playground");
    const [isPrivate, setIsPrivate] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [exportedUrl, setExportedUrl] = useState("");

    const flattenFileTree = (data: any, parentPath = ""): { path: string; content: string }[] => {
        let files: { path: string; content: string }[] = [];
        if (!data) return files;

        const items = data.items || [];
        for (const item of items) {
            if ("folderName" in item) {
                files = [...files, ...flattenFileTree(item, `${parentPath}${item.folderName}/`)];
            } else {
                const extension = item.fileExtension ? `.${item.fileExtension}` : "";
                files.push({
                    path: `${parentPath}${item.filename}${extension}`,
                    content: item.content
                });
            }
        }
        return files;
    };

    const handleExport = async () => {
        if (!repoName.trim()) {
            toast.error("Repository name is required");
            return;
        }

        if (!templateData) {
            toast.error("No files to export");
            return;
        }

        setIsExporting(true);
        setExportedUrl("");

        try {
            const flatFiles = flattenFileTree(templateData);

            // We do not commit node_modules
            const filteredFiles = flatFiles.filter(f => !f.path.startsWith("node_modules/") && !f.path.startsWith(".next/"));

            const res = await fetch("/api/github/export", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    repoName: repoName.trim(),
                    description: description.trim(),
                    isPrivate,
                    files: filteredFiles
                })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to export to GitHub");
            }

            setExportedUrl(data.url);
            toast.success("Successfully exported to GitHub!");

        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "An error occurred during export.");
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Github className="h-5 w-5" />
                        Export to GitHub
                    </DialogTitle>
                    <DialogDescription>
                        Create a new GitHub repository or push a new commit to an existing one.
                    </DialogDescription>
                </DialogHeader>

                {exportedUrl ? (
                    <div className="flex flex-col items-center justify-center py-6 space-y-4">
                        <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                            <CheckCircle2 className="h-6 w-6 text-green-500" />
                        </div>
                        <p className="font-medium">Export Successful!</p>
                        <Button className="w-full mt-4" variant="outline" onClick={() => window.open(exportedUrl, '_blank')}>
                            View on GitHub <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                    </div>
                ) : (
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="repoName">Repository Name</Label>
                            <Input
                                id="repoName"
                                value={repoName}
                                onChange={(e) => setRepoName(e.target.value)}
                                placeholder="my-awesome-project"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="description">Description (Optional)</Label>
                            <Textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="What is this project about?"
                                rows={2}
                                className="resize-none"
                            />
                        </div>

                        <div className="flex items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                                <Label>Private Repository</Label>
                                <DialogDescription className="text-xs">
                                    Only you can see this repository.
                                </DialogDescription>
                            </div>
                            <Switch checked={isPrivate} onCheckedChange={setIsPrivate} />
                        </div>

                        <Button onClick={handleExport} disabled={isExporting} className="w-full mt-2">
                            {isExporting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Exporting...
                                </>
                            ) : (
                                "Export to GitHub"
                            )}
                        </Button>
                        <p className="text-[10px] text-muted-foreground text-center mt-1">
                            Requires GitHub account linked with 'repo' scope.
                        </p>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
