"use client";

import React, { useState, useEffect } from "react";
import type { WebContainer } from "@webcontainer/api";
import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
} from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, KeyRound, Eye, EyeOff, Save, Lock } from "lucide-react";
import { toast } from "sonner";
import { usePlaygroundContext } from "@/modules/playground/contexts/playground-context";

interface Secret {
    id?: string;
    key: string;
    value: string;
}

export function EnvManager({
    instance,
}: {
    instance: WebContainer | null;
}) {
    const { id } = usePlaygroundContext();
    const [secrets, setSecrets] = useState<Secret[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showValues, setShowValues] = useState<Record<string, boolean>>({});
    const [newKey, setNewKey] = useState("");
    const [newValue, setNewValue] = useState("");

    // Fetch secrets from backend
    useEffect(() => {
        if (!id) return;
        const fetchSecrets = async () => {
            setIsLoading(true);
            try {
                const res = await fetch(`/api/playgrounds/${id}/secrets`);
                if (res.ok) {
                    const data = await res.json();
                    setSecrets(data);
                }
            } catch (error) {
                console.error("Failed to fetch secrets", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchSecrets();
    }, [id]);

    // Inject secrets into WebContainer as a hidden .env file
    useEffect(() => {
        if (instance && secrets.length > 0) {
            const envContent = secrets.map((s) => `${s.key}=${s.value}`).join("\n");
            // Write natively into WebContainer, bypassing React state so it stays hidden from UI
            instance.fs.writeFile(".env", envContent).catch(console.error);
        } else if (instance && secrets.length === 0) {
            // Remove .env if there are no secrets
            instance.fs.rm(".env", { force: true }).catch(() => {});
        }
    }, [secrets, instance]);

    const handleAddSecret = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedKey = newKey.trim();
        if (!trimmedKey || !newValue.trim()) return;

        try {
            const res = await fetch(`/api/playgrounds/${id}/secrets`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ key: trimmedKey, value: newValue }),
            });

            if (res.ok) {
                const savedSecret = await res.json();
                setSecrets((prev) => {
                    const filtered = prev.filter((s) => s.key !== savedSecret.key);
                    return [...filtered, savedSecret];
                });
                setNewKey("");
                setNewValue("");
                toast.success("Secret saved securely");
            } else {
                toast.error("Failed to save secret");
            }
        } catch (error) {
            toast.error("An error occurred");
        }
    };

    const handleDeleteSecret = async (key: string) => {
        try {
            const res = await fetch(`/api/playgrounds/${id}/secrets?key=${encodeURIComponent(key)}`, {
                method: "DELETE",
            });

            if (res.ok || res.status === 204) {
                setSecrets((prev) => prev.filter((s) => s.key !== key));
                toast.success("Secret deleted");
            } else {
                toast.error("Failed to delete secret");
            }
        } catch (error) {
            toast.error("An error occurred");
        }
    };

    const toggleShowValue = (key: string) => {
        setShowValues((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <SidebarGroup className="mt-4 border-t pt-4">
            <SidebarGroupLabel className="flex justify-between items-center text-xs uppercase text-muted-foreground font-semibold px-2 py-1.5 h-8">
                <div className="flex items-center gap-2">
                    <Lock className="h-3.5 w-3.5 text-primary" />
                    Secrets Manager
                </div>
                <Button size="icon" variant="ghost" className="h-5 w-5" onClick={handleAddVar} title="Add Variable" aria-label="Add environment variable">
                    <Plus className="h-3.5 w-3.5" />
                </Button>
            </SidebarGroupLabel>
            
            <SidebarGroupContent className="p-2 space-y-3">
                <div className="text-[10px] text-muted-foreground bg-muted/30 p-2 rounded border leading-tight">
                    Secrets are encrypted and injected securely into the runtime. They are hidden from the file explorer.
                </div>

                <form onSubmit={handleAddSecret} className="space-y-2 border p-2 rounded bg-muted/10">
                    <Input
                        placeholder="Key (e.g. API_KEY)"
                        value={newKey}
                        onChange={(e) => setNewKey(e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, ''))}
                        className="h-7 text-[10px] font-mono"
                    />
                    <Input
                        type="password"
                        placeholder="Value"
                        value={newValue}
                        onChange={(e) => setNewValue(e.target.value)}
                        className="h-7 text-[10px] font-mono"
                    />
                    <Button type="submit" size="sm" className="w-full h-7 text-[10px]" disabled={!newKey || !newValue}>
                        <Plus className="h-3.5 w-3.5 mr-1" />
                        Add Secret
                    </Button>
                </form>

                {isLoading ? (
                    <div className="text-center py-4 text-muted-foreground text-[11px] animate-pulse">
                        Loading secrets...
                    </div>
                ) : secrets.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground text-[11px] italic">
                        No secrets found
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
                                    className={`flex items-center gap-1.5 border p-1.5 rounded bg-muted/20 ${itemHasError ? "border-destructive/40 bg-destructive/5" : "border-border"
                                        }`}
                                >
                                    <div className="flex flex-col flex-1 gap-1">
                                        <Input
                                            value={v.key}
                                            onChange={(e) => handleUpdateVar(idx, "key", e.target.value)}
                                            placeholder="API_KEY"
                                            className={`h-6 text-[10px] font-mono rounded-sm bg-background shadow-none border ${itemHasError
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
                                        aria-label="Delete environment variable"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                                <div className="font-mono text-[10px] text-muted-foreground truncate bg-background p-1 rounded border">
                                    {showValues[secret.key] ? secret.value : "••••••••••••••••"}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </SidebarGroupContent>
        </SidebarGroup>
    );
}
