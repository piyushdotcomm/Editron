"use client";

import React, { useState, useEffect } from "react";
import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
} from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GitBranch, Plus, Minus, Check, RefreshCw, Upload, Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { initGitRepo, getGitStatus, stageGitFile, unstageGitFile, commitGitRepo, pushGitRepo, pullGitRepo } from "@/modules/playground/lib/git-utils";

export function SourceControl({
    templateData,
    instance,
}: {
    templateData: any;
    instance: any;
}) {
    const [status, setStatus] = useState<any[]>([]);
    const [commitMessage, setCommitMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);

    // Initialize repo and get status on mount or when templateData changes
    useEffect(() => {
        if (!instance) return;

        const setupGit = async () => {
            try {
                await initGitRepo(instance, "/");
                setIsInitialized(true);
                refreshStatus();
            } catch (err) {
                console.error("Failed to init git repo:", err);
            }
        };

        setupGit();
    }, [instance, templateData]);

    const refreshStatus = async () => {
        if (!instance || !isInitialized) return;
        setIsLoading(true);
        try {
            const gitStatus = await getGitStatus(instance, "/");
            setStatus(gitStatus);
        } catch (err) {
            console.error("Failed to get git status:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleStageFile = async (filepath: string) => {
        if (!instance) return;
        setIsLoading(true);
        try {
            await stageGitFile(instance, "/", filepath);
            await refreshStatus();
        } catch (err) {
            console.error(err);
            toast.error(`Failed to stage ${filepath}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUnstageFile = async (filepath: string) => {
        if (!instance) return;
        setIsLoading(true);
        try {
            await unstageGitFile(instance, "/", filepath);
            await refreshStatus();
        } catch (err) {
            console.error(err);
            toast.error(`Failed to unstage ${filepath}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCommit = async () => {
        if (!instance || !commitMessage.trim()) return;

        const stagedFiles = status.filter(s => s.status.includes("staged"));
        if (stagedFiles.length === 0) {
            toast.error("No files staged for commit");
            return;
        }

        setIsLoading(true);
        try {
            // In a real app we'd get these from the auth session
            const name = "Editron User";
            const email = "user@editron.io";

            const sha = await commitGitRepo(instance, "/", commitMessage, name, email);
            toast.success(`Committed successfully (${sha.substring(0, 7)})`);
            setCommitMessage("");
            await refreshStatus();
        } catch (err: any) {
            console.error(err);
            toast.error(`Commit failed: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePush = async () => {
        if (!instance) return;
        const repoUrl = prompt("Enter Repository URL (e.g. https://github.com/username/repo):");
        if (!repoUrl) return;
        const token = prompt("Enter GitHub Personal Access Token (Requires 'repo' scope):");
        if (!token) return;

        setIsLoading(true);
        const toastId = toast.loading("Pushing to GitHub...");
        try {
            await pushGitRepo(instance, "/", {
                githubToken: token,
                repoUrl: repoUrl
            });
            toast.success("Successfully pushed to GitHub", { id: toastId });
            await refreshStatus();
        } catch (err: any) {
            console.error(err);
            toast.error(`Push failed: ${err.message}`, { id: toastId });
        } finally {
            setIsLoading(false);
        }
    };

    const handlePull = async () => {
        if (!instance) return;
        const repoUrl = prompt("Enter Repository URL (e.g. https://github.com/username/repo):");
        if (!repoUrl) return;
        const token = prompt("Enter GitHub Personal Access Token (Requires 'repo' scope):");
        if (!token) return;

        setIsLoading(true);
        const toastId = toast.loading("Pulling from GitHub...");
        try {
            await pullGitRepo(instance, "/", {
                githubToken: token,
                repoUrl: repoUrl
            });
            toast.success("Successfully pulled from GitHub", { id: toastId });
            await refreshStatus();
        } catch (err: any) {
            console.error(err);
            toast.error(`Pull failed: ${err.message}`, { id: toastId });
        } finally {
            setIsLoading(false);
        }
    };

    const stagedChanges = status.filter(s => s.status.includes("staged"));
    const unstagedChanges = status.filter(s => !s.status.includes("staged") && s.status !== "unmodified");

    return (
        <SidebarGroup className="mt-4 border-t pt-4">
            <SidebarGroupLabel className="flex justify-between items-center text-xs uppercase text-muted-foreground font-semibold px-2 py-1.5 h-8">
                <div className="flex items-center gap-2">
                    <GitBranch className="h-3.5 w-3.5" />
                    Source Control
                </div>
                <div className="flex gap-1">
                    <Button size="icon" variant="ghost" className="h-5 w-5" onClick={refreshStatus} title="Refresh" disabled={isLoading}>
                        <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-5 w-5" onClick={handlePush} title="Push" disabled={isLoading}>
                        <Upload className="h-3 w-3" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-5 w-5" onClick={handlePull} title="Pull" disabled={isLoading}>
                        <Download className="h-3 w-3" />
                    </Button>
                </div>
            </SidebarGroupLabel>

            <SidebarGroupContent className="p-2 space-y-4">
                {/* Commit Input */}
                <div className="space-y-2">
                    <Input
                        placeholder="Message (Cmd+Enter to commit)"
                        value={commitMessage}
                        onChange={(e) => setCommitMessage(e.target.value)}
                        className="h-8 text-xs bg-muted/50"
                        disabled={isLoading}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                                handleCommit();
                            }
                        }}
                    />
                    <Button
                        className="w-full h-8 text-xs"
                        size="sm"
                        onClick={handleCommit}
                        disabled={isLoading || !commitMessage.trim() || stagedChanges.length === 0}
                    >
                        <Check className="h-3.5 w-3.5 mr-2" />
                        Commit
                    </Button>
                </div>

                {/* Staged Changes */}
                <div className="space-y-1">
                    <div className="flex justify-between items-center px-1">
                        <span className="text-[10px] font-semibold uppercase text-muted-foreground">Staged Changes</span>
                        <span className="text-[10px] bg-muted px-1.5 rounded">{stagedChanges.length}</span>
                    </div>

                    {stagedChanges.length === 0 ? (
                        <p className="text-[11px] text-muted-foreground/50 italic px-1">No staged changes</p>
                    ) : (
                        <div className="space-y-0.5">
                            {stagedChanges.map(file => (
                                <div key={file.filepath} className="group flex items-center justify-between px-2 py-1 rounded-sm hover:bg-muted/50 cursor-pointer text-xs">
                                    <span className="truncate">{file.filepath}</span>
                                    <Button size="icon" variant="ghost" className="h-4 w-4 opacity-0 group-hover:opacity-100" onClick={() => handleUnstageFile(file.filepath)}>
                                        <Minus className="h-3 w-3" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Unstaged Changes */}
                <div className="space-y-1">
                    <div className="flex justify-between items-center px-1">
                        <span className="text-[10px] font-semibold uppercase text-muted-foreground">Changes</span>
                        <span className="text-[10px] bg-muted px-1.5 rounded">{unstagedChanges.length}</span>
                    </div>

                    {unstagedChanges.length === 0 ? (
                        <p className="text-[11px] text-muted-foreground/50 italic px-1">No changes</p>
                    ) : (
                        <div className="space-y-0.5">
                            {unstagedChanges.map(file => (
                                <div key={file.filepath} className="group flex items-center justify-between px-2 py-1.5 rounded-sm hover:bg-muted/50 cursor-pointer text-xs">
                                    <span className="truncate font-medium text-amber-500/80">{file.filepath}</span>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                                        <Button size="icon" variant="ghost" className="h-5 w-5" onClick={() => handleStageFile(file.filepath)}>
                                            <Plus className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </SidebarGroupContent>
        </SidebarGroup>
    );
}
