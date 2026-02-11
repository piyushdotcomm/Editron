"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, FolderOpen, ArrowLeft } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const GithubImportDialog = ({ children }: { children: React.ReactNode }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [repoUrl, setRepoUrl] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [subdirs, setSubdirs] = useState<string[]>([]);
    const [selectedSubdir, setSelectedSubdir] = useState("");
    const [step, setStep] = useState<"url" | "pick-subdir">("url");
    const router = useRouter();

    const resetState = () => {
        setRepoUrl("");
        setSubdirs([]);
        setSelectedSubdir("");
        setStep("url");
        setIsLoading(false);
    };

    const handleImport = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!repoUrl) {
            toast.error("Please enter a GitHub repository URL");
            return;
        }

        if (!repoUrl.includes("github.com")) {
            toast.error("Please enter a valid GitHub URL");
            return;
        }

        setIsLoading(true);

        try {
            const body: { repoUrl: string; subdir?: string } = { repoUrl };
            if (step === "pick-subdir" && selectedSubdir) {
                body.subdir = selectedSubdir;
            }

            const response = await fetch("/api/github/import", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to import repository");
            }

            // Check if the API detected a monorepo
            if (data.needsSubdir) {
                setSubdirs(data.subdirs);
                setSelectedSubdir(data.subdirs[0] || "");
                setStep("pick-subdir");
                setIsLoading(false);
                return;
            }

            toast.success("Repository imported successfully!");
            setIsOpen(false);
            resetState();

            // Redirect to the new playground
            router.push(`/playground/${data.playgroundId}`);
        } catch (error) {
            console.error("Import error:", error);
            toast.error(error instanceof Error ? error.message : "Failed to import repository");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            setIsOpen(open);
            if (!open) resetState();
        }}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Import from GitHub</DialogTitle>
                    <DialogDescription>
                        {step === "url"
                            ? "Enter the public GitHub repository URL you want to import."
                            : "This repository has multiple projects. Select which one to import."
                        }
                    </DialogDescription>
                </DialogHeader>

                {step === "url" && (
                    <form onSubmit={handleImport} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="repo-url">Repository URL</Label>
                            <Input
                                id="repo-url"
                                placeholder="https://github.com/username/repo"
                                value={repoUrl}
                                onChange={(e) => setRepoUrl(e.target.value)}
                                disabled={isLoading}
                                required
                            />
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsOpen(false)}
                                disabled={isLoading}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Checking...
                                    </>
                                ) : (
                                    "Import Repository"
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                )}

                {step === "pick-subdir" && (
                    <form onSubmit={handleImport} className="space-y-4">
                        <div className="space-y-3">
                            <Label>Select a project</Label>
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                                {subdirs.map((dir) => (
                                    <label
                                        key={dir}
                                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${selectedSubdir === dir
                                                ? "border-primary bg-primary/5"
                                                : "border-border hover:border-primary/50"
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name="subdir"
                                            value={dir}
                                            checked={selectedSubdir === dir}
                                            onChange={(e) => setSelectedSubdir(e.target.value)}
                                            className="sr-only"
                                        />
                                        <FolderOpen className={`h-5 w-5 shrink-0 ${selectedSubdir === dir ? "text-primary" : "text-muted-foreground"
                                            }`} />
                                        <div className="flex flex-col">
                                            <span className="font-medium text-sm">{dir}/</span>
                                            <span className="text-xs text-muted-foreground">Contains package.json</span>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setStep("url");
                                    setSubdirs([]);
                                    setSelectedSubdir("");
                                }}
                                disabled={isLoading}
                            >
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back
                            </Button>
                            <Button type="submit" disabled={isLoading || !selectedSubdir}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Importing...
                                    </>
                                ) : (
                                    `Import ${selectedSubdir}/`
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default GithubImportDialog;
