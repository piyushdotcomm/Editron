"use client";

import React, { useState, useEffect, useMemo } from "react";
import type { TemplateFolder, TemplateItem } from "@/modules/playground/lib/path-to-json";
import type { WebContainer } from "@webcontainer/api";
import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
} from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, KeyRound, Save } from "lucide-react";
import { toast } from "sonner";

interface EnvVar {
    key: string;
    value: string;
}

export function EnvManager({
    templateData,
    instance,
    writeFileSync,
}: {
    templateData: TemplateFolder | null;
    instance: WebContainer | null;
    writeFileSync?: ((path: string, content: string) => Promise<void>) | null;
}) {
    const [envVars, setEnvVars] = useState<EnvVar[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    // Validate key matching POSIX naming conventions
    const isValidKey = (key: string) => {
        return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(key);
    };

    // Parse existing .env on mount
    useEffect(() => {
        if (!templateData) return;

        const findEnv = (items: TemplateItem[]): TemplateItem | null => {
            for (const item of items) {
                if (!("folderName" in item) && item.filename === "" && item.fileExtension === "env") {
                    return item;
                } else if ("folderName" in item) {
                    const found = findEnv(item.items);
                    if (found) return found;
                }
            }
            return null;
        };

        const envFile = findEnv(templateData.items);
        if (envFile && envFile.content) {
            const lines = envFile.content.split("\n");
            const parsedVars: EnvVar[] = [];
            lines.forEach((line: string) => {
                const trimmed = line.trim();
                if (trimmed && !trimmed.startsWith("#")) {
                    const splitIdx = trimmed.indexOf("=");
                    if (splitIdx > -1) {
                        parsedVars.push({
                            key: trimmed.substring(0, splitIdx).trim(),
                            value: trimmed.substring(splitIdx + 1).trim()
                        });
                    }
                }
            });
            if (parsedVars.length > 0) {
                setEnvVars(parsedVars);
            }
        }
    }, [templateData]);

    const duplicateKeys = useMemo(() => {
        const keys = envVars.map(v => v.key.trim());
        const seen = new Set<string>();
        const dups = new Set<string>();
        keys.forEach(k => {
            if (k) {
                if (seen.has(k)) {
                    dups.add(k);
                }
                seen.add(k);
            }
        });
        return dups;
    }, [envVars]);

    const hasEmptyKey = envVars.some(v => v.key.trim() === "");
    const hasInvalidKey = envVars.some(v => v.key.trim() !== "" && !isValidKey(v.key.trim()));
    const hasDuplicate = duplicateKeys.size > 0;
    const hasErrors = hasEmptyKey || hasInvalidKey || hasDuplicate;

    const handleAddVar = () => {
        setEnvVars([...envVars, { key: "", value: "" }]);
    };

    const handleRemoveVar = (index: number) => {
        const newVars = [...envVars];
        newVars.splice(index, 1);
        setEnvVars(newVars);
    };

    const handleUpdateVar = (index: number, field: "key" | "value", val: string) => {
        const newVars = [...envVars];
        if (field === "key") {
            // Auto-capitalize and replace spaces/hyphens with underscores on-the-fly
            newVars[index][field] = val.toUpperCase().replace(/[\s-]/g, "_");
        } else {
            newVars[index][field] = val;
        }
        setEnvVars(newVars);
    };

    const handleSave = async () => {
        if (!instance || !writeFileSync) {
            toast.error("WebContainer is not ready");
            return;
        }

        if (hasErrors) {
            toast.error("Please fix validation errors before saving");
            return;
        }

        setIsSaving(true);
        try {
            // Build .env string
            const envString = envVars
                .filter(v => v.key.trim() !== "")
                .map(v => `${v.key.trim()}=${v.value}`)
                .join("\n");

            await writeFileSync(".env", envString);

            // We also need to restart the dev server to pick up new env vars in most frameworks
            toast.success("Environment variables saved!", {
                description: "You may need to restart the development server manually to apply changes."
            });
        } catch (error) {
            console.error(error);
            toast.error("Failed to save environment variables");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <SidebarGroup className="mt-4 border-t pt-4">
            <SidebarGroupLabel className="flex justify-between items-center text-xs uppercase text-muted-foreground font-semibold px-2 py-1.5 h-8">
                <div className="flex items-center gap-2">
                    <KeyRound className="h-3.5 w-3.5" />
                    Environment Variables
                </div>
                <Button size="icon" variant="ghost" className="h-5 w-5" onClick={handleAddVar} title="Add Variable">
                    <Plus className="h-3.5 w-3.5" />
                </Button>
            </SidebarGroupLabel>
            <SidebarGroupContent className="p-2 space-y-3">

                {envVars.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">
                        <p className="text-[11px]">No variables defined</p>
                        <Button size="sm" variant="link" className="text-[11px] h-6 px-0" onClick={handleAddVar}>
                            Add your first variable
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {envVars.map((v, idx) => {
                            const keyTrimmed = v.key.trim();
                            const isDup = duplicateKeys.has(keyTrimmed);
                            const isMalformed = keyTrimmed !== "" && !isValidKey(keyTrimmed);
                            const itemHasError = isDup || isMalformed;

                            return (
                                <div
                                    key={idx}
                                    className={`flex items-center gap-1.5 border p-1.5 rounded bg-muted/20 ${
                                        itemHasError ? "border-destructive/40 bg-destructive/5" : "border-border"
                                    }`}
                                >
                                    <div className="flex flex-col flex-1 gap-1">
                                        <Input
                                            value={v.key}
                                            onChange={(e) => handleUpdateVar(idx, "key", e.target.value)}
                                            placeholder="API_KEY"
                                            className={`h-6 text-[10px] font-mono rounded-sm bg-background shadow-none border ${
                                                itemHasError
                                                    ? "border-destructive/60 text-destructive focus-visible:ring-destructive"
                                                    : "border-transparent focus-visible:ring-ring"
                                            }`}
                                        />
                                        {isMalformed && (
                                            <span className="text-[8px] text-destructive leading-tight px-1 font-sans">
                                                A-Z, 0-9, _ only, must start with letter/_
                                            </span>
                                        )}
                                        {isDup && (
                                            <span className="text-[8px] text-destructive leading-tight px-1 font-sans">
                                                Duplicate key name
                                            </span>
                                        )}
                                        <Input
                                            value={v.value}
                                            onChange={(e) => handleUpdateVar(idx, "value", e.target.value)}
                                            placeholder="Value..."
                                            type="password"
                                            className="h-6 text-[10px] font-mono rounded-sm border border-transparent focus-visible:border-input focus-visible:ring-ring bg-background shadow-none"
                                        />
                                    </div>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-8 w-8 text-muted-foreground hover:text-red-500 shrink-0"
                                        onClick={() => handleRemoveVar(idx)}
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            );
                        })}

                        {hasEmptyKey && (
                            <p className="text-[10px] text-yellow-500 font-medium px-1 mt-1 leading-normal">
                                ⚠️ All keys must be filled.
                            </p>
                        )}
                        {hasDuplicate && (
                            <p className="text-[10px] text-destructive font-medium px-1 mt-1 leading-normal">
                                ⚠️ Duplicate keys are not allowed.
                            </p>
                        )}
                        {hasInvalidKey && (
                            <p className="text-[10px] text-destructive font-medium px-1 mt-1 leading-normal">
                                ⚠️ Fix invalid key formats.
                            </p>
                        )}

                        <Button
                            className="w-full text-xs h-7 mt-2"
                            size="sm"
                            onClick={handleSave}
                            disabled={isSaving || envVars.length === 0 || hasErrors}
                        >
                            <Save className="h-3.5 w-3.5 mr-2" />
                            {isSaving ? "Saving..." : "Save to .env"}
                        </Button>
                    </div>
                )}

            </SidebarGroupContent>
        </SidebarGroup>
    );
}
