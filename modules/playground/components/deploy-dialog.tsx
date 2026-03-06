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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Globe, ArrowRight, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import type { TemplateFolder } from "@/modules/playground/lib/path-to-json";

interface DeployDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    templateData: TemplateFolder | null;
    projectName?: string;
}

export function DeployDialog({ open, onOpenChange, templateData, projectName }: DeployDialogProps) {
    const [provider, setProvider] = useState<"vercel" | "netlify" | "cloudflare">("vercel");
    const [useMasterKey, setUseMasterKey] = useState(true);
    const [userKey, setUserKey] = useState("");
    const [isDeploying, setIsDeploying] = useState(false);
    const [deployedUrl, setDeployedUrl] = useState("");

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

    const handleDeploy = async () => {
        if (!useMasterKey && !userKey) {
            toast.error(`Please enter your ${provider === "vercel" ? "Vercel" : provider === "netlify" ? "Netlify" : "Cloudflare"} API key`);
            return;
        }

        if (!templateData) {
            toast.error("No files to deploy");
            return;
        }

        setIsDeploying(true);
        setDeployedUrl("");

        try {
            const flatFiles = flattenFileTree(templateData);

            // We don't deploy node_modules or big cache folders
            const filteredFiles = flatFiles.filter(f => !f.path.startsWith("node_modules/") && !f.path.startsWith(".next/"));

            const res = await fetch(`/api/deploy/${provider}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    files: filteredFiles,
                    name: projectName,
                    userApiKey: useMasterKey ? undefined : userKey
                })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Deployment failed");
            }

            setDeployedUrl(data.url.startsWith("http") ? data.url : `https://${data.url}`);
            toast.success("Successfully deployed!");

        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Failed to deploy. Check your API key or try again.");
        } finally {
            setIsDeploying(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Globe className="h-5 w-5 text-muted-foreground" />
                        Deploy to Cloud
                    </DialogTitle>
                    <DialogDescription>
                        Publish your current playground files instantly to a live, public URL.
                    </DialogDescription>
                </DialogHeader>

                {deployedUrl ? (
                    <div className="flex flex-col items-center justify-center py-6 space-y-4">
                        <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                            <CheckCircle2 className="h-6 w-6 text-green-500" />
                        </div>
                        <p className="font-medium text-center">Deployment Successful!</p>
                        <a href={deployedUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500 hover:underline break-all text-center px-4">
                            {deployedUrl}
                        </a>
                        <Button className="w-full mt-4" variant="outline" onClick={() => window.open(deployedUrl, '_blank')}>
                            Visit Site <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                    </div>
                ) : (
                    <div className="grid gap-4 py-4">
                        <Tabs value={provider} onValueChange={(v: any) => setProvider(v)}>
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="vercel">Vercel</TabsTrigger>
                                <TabsTrigger value="netlify">Netlify</TabsTrigger>
                                <TabsTrigger value="cloudflare">Cloudflare</TabsTrigger>
                            </TabsList>
                        </Tabs>

                        <div className="rounded-md border p-4 bg-muted/30">
                            <div className="flex items-center justify-between mb-4">
                                <Label className="text-sm font-medium">Authentication Policy</Label>
                            </div>
                            <div className="space-y-4">
                                <div
                                    className={`flex items-start space-x-3 rounded-lg border p-3 cursor-pointer transition-colors ${useMasterKey ? 'bg-background border-primary' : 'hover:bg-muted/50'}`}
                                    onClick={() => setUseMasterKey(true)}
                                >
                                    <div className={`mt-0.5 h-4 w-4 rounded-full border flex items-center justify-center ${useMasterKey ? 'border-primary' : 'border-muted-foreground'}`}>
                                        {useMasterKey && <div className="h-2 w-2 rounded-full bg-primary" />}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">Use Editron Deployment</p>
                                        <p className="text-xs text-muted-foreground">Deploy immediately using our master key. Ideal for quick demos.</p>
                                    </div>
                                </div>

                                <div
                                    className={`flex flex-col space-y-2 rounded-lg border p-3 cursor-pointer transition-colors ${!useMasterKey ? 'bg-background border-primary' : 'hover:bg-muted/50'}`}
                                    onClick={() => setUseMasterKey(false)}
                                >
                                    <div className="flex items-start space-x-3 md:items-center">
                                        <div className={`mt-0.5 md:mt-0 h-4 w-4 rounded-full border flex items-center justify-center shrink-0 ${!useMasterKey ? 'border-primary' : 'border-muted-foreground'}`}>
                                            {!useMasterKey && <div className="h-2 w-2 rounded-full bg-primary" />}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">Bring Your Own Key</p>
                                            <p className="text-xs text-muted-foreground">Deploy to your personal {provider === 'vercel' ? 'Vercel' : provider === 'netlify' ? 'Netlify' : 'Cloudflare'} account.</p>
                                        </div>
                                    </div>

                                    {!useMasterKey && (
                                        <div className="pl-7 pt-2">
                                            <Input
                                                placeholder={`${provider.charAt(0).toUpperCase() + provider.slice(1)} API Token`}
                                                value={userKey}
                                                onChange={(e) => setUserKey(e.target.value)}
                                                type="password"
                                                autoFocus
                                            />
                                            <p className="text-[10px] text-muted-foreground mt-1.5 ml-1">
                                                Tokens are only used for this deployment and never saved.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <Button onClick={handleDeploy} disabled={isDeploying} className="w-full">
                            {isDeploying ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Deploying to {provider === "vercel" ? "Vercel" : provider === "netlify" ? "Netlify" : "Cloudflare"}...
                                </>
                            ) : (
                                `Deploy to ${provider === "vercel" ? "Vercel" : provider === "netlify" ? "Netlify" : "Cloudflare"}`
                            )}
                        </Button>

                        {provider === "cloudflare" && (
                            <p className="text-xs text-amber-500 text-center mt-2">
                                Note: Cloudflare Pages Direct Upload API requires an Account ID in addition to the API Token. We recommend using Vercel or Netlify for quick deploys.
                            </p>
                        )}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
