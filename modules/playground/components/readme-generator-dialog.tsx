"use client";

import React, { useState, useCallback } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, FileText, CheckCircle2, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import type { TemplateFolder } from "@/modules/playground/lib/path-to-json";
import { collectFilePaths, useAI, type AIProvider, type FileSystemItem } from "@/modules/playground/hooks/useAI";

type ReadmeTemplate = "minimal" | "standard" | "professional" | "open-source";

interface ReadmeGeneratorDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    templateData: TemplateFolder | null;
    onReadmeGenerated: (content: string) => void;
}

const TEMPLATE_DESCRIPTIONS: Record<ReadmeTemplate, string> = {
    minimal: "Title, description, install, usage.",
    standard: "Standard sections + tech stack + folder structure.",
    professional: "Badges, demo link, env vars, full contributor guide.",
    "open-source": "Contributing, code of conduct, license — OSS-ready.",
};

function extractPackageJson(items: FileSystemItem[], prefix = ""): string | null {
    for (const item of items) {
        if ("folderName" in item) {
            const found = extractPackageJson(item.items as FileSystemItem[], `${prefix}${item.folderName}/`);
            if (found) return found;
        } else if (item.filename === "package" && item.fileExtension === "json" && prefix === "") {
            return item.content || null;
        }
    }
    return null;
}

export function ReadmeGeneratorDialog({
    open,
    onOpenChange,
    templateData,
    onReadmeGenerated,
}: ReadmeGeneratorDialogProps) {
    const [template, setTemplate] = useState<ReadmeTemplate>("standard");
    const [isGenerating, setIsGenerating] = useState(false);
    const [isDone, setIsDone] = useState(false);

    const { provider, getUserApiKey } = useAI();

    const handleGenerate = useCallback(async () => {
        if (!templateData) {
            toast.error("No project files found. Open a playground first.");
            return;
        }

        const filePaths = collectFilePaths(templateData.items as FileSystemItem[]);
        if (filePaths.length === 0) {
            toast.error("The project appears to be empty.");
            return;
        }

        const fileTree = filePaths.join("\n");
        const packageJson = extractPackageJson(templateData.items as FileSystemItem[]);

        setIsGenerating(true);
        setIsDone(false);

        try {
            const userApiKey = getUserApiKey(provider as AIProvider);

            const res = await fetch("/api/readme", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    fileTree,
                    packageJson: packageJson ?? undefined,
                    template,
                    provider,
                    userApiKey: userApiKey || undefined,
                }),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({ error: "Unexpected error" }));
                throw new Error(data.error || `Server error: ${res.status}`);
            }

            if (!res.body) {
                throw new Error("No response body received from server.");
            }

            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            let accumulated = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                accumulated += decoder.decode(value, { stream: true });
            }

            const finalContent = accumulated.trim();
            if (!finalContent) {
                throw new Error("Model returned an empty README. Try again.");
            }

            onReadmeGenerated(finalContent);
            setIsDone(true);
            toast.success("README.md generated and opened in editor.");

            // Auto-close after a short delay so the user sees the success state.
            setTimeout(() => {
                onOpenChange(false);
                setIsDone(false);
            }, 1500);
        } catch (error: unknown) {
            console.error("README generation error:", error);
            toast.error(error instanceof Error ? error.message : "Failed to generate README.");
        } finally {
            setIsGenerating(false);
        }
    }, [templateData, template, provider, getUserApiKey, onReadmeGenerated, onOpenChange]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[440px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        Generate README
                    </DialogTitle>
                    <DialogDescription>
                        Analyzes your project structure and dependencies to produce a{" "}
                        <code className="text-xs bg-muted px-1 py-0.5 rounded">README.md</code> at the project root.
                    </DialogDescription>
                </DialogHeader>

                {isDone ? (
                    <div className="flex flex-col items-center justify-center py-8 space-y-3">
                        <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                            <CheckCircle2 className="h-6 w-6 text-green-500" />
                        </div>
                        <p className="font-medium text-sm">README.md created!</p>
                        <p className="text-xs text-muted-foreground text-center">
                            The file is now open in your editor. Review and adjust it to fit your project.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-5 py-2">
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Template style</Label>
                            <Tabs
                                value={template}
                                onValueChange={(v) => setTemplate(v as ReadmeTemplate)}
                            >
                                <TabsList className="grid w-full grid-cols-4">
                                    <TabsTrigger value="minimal" className="text-xs">Minimal</TabsTrigger>
                                    <TabsTrigger value="standard" className="text-xs">Standard</TabsTrigger>
                                    <TabsTrigger value="professional" className="text-xs">Pro</TabsTrigger>
                                    <TabsTrigger value="open-source" className="text-xs">OSS</TabsTrigger>
                                </TabsList>
                            </Tabs>
                            <p className="text-xs text-muted-foreground pl-0.5">
                                {TEMPLATE_DESCRIPTIONS[template]}
                            </p>
                        </div>

                        <div className="rounded-md border bg-muted/30 px-4 py-3 space-y-1.5">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                What gets analyzed
                            </p>
                            <ul className="text-xs text-foreground/80 space-y-1 list-none">
                                <li className="flex items-center gap-1.5">
                                    <ChevronDown className="h-3 w-3 text-muted-foreground shrink-0 -rotate-90" />
                                    Project file tree
                                </li>
                                <li className="flex items-center gap-1.5">
                                    <ChevronDown className="h-3 w-3 text-muted-foreground shrink-0 -rotate-90" />
                                    <code className="font-mono">package.json</code> dependencies &amp; scripts
                                </li>
                                <li className="flex items-center gap-1.5">
                                    <ChevronDown className="h-3 w-3 text-muted-foreground shrink-0 -rotate-90" />
                                    Detected framework &amp; tech stack
                                </li>
                            </ul>
                            <p className="text-[11px] text-muted-foreground pt-1">
                                Using provider:{" "}
                                <span className="font-medium text-foreground">{provider}</span>. Change it in AI
                                Settings.
                            </p>
                        </div>

                        <Button
                            onClick={handleGenerate}
                            disabled={isGenerating || !templateData}
                            className="w-full"
                        >
                            {isGenerating ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Generating README...
                                </>
                            ) : (
                                <>
                                    <FileText className="mr-2 h-4 w-4" />
                                    Generate README.md
                                </>
                            )}
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
