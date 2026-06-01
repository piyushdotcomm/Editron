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
                    <div className="space-y-2 mt-2">
                        {secrets.map((secret) => (
                            <div key={secret.id || secret.key} className="flex flex-col gap-1 bg-muted/40 p-2 rounded-md border text-sm group">
                                <div className="flex items-center justify-between">
                                    <span className="font-mono text-[10px] font-semibold truncate text-primary">{secret.key}</span>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            type="button"
                                            className="h-5 w-5 hover:bg-muted"
                                            onClick={() => toggleShowValue(secret.key)}
                                        >
                                            {showValues[secret.key] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            type="button"
                                            className="h-5 w-5 text-destructive hover:bg-destructive/10"
                                            onClick={() => handleDeleteSecret(secret.key)}
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    </div>
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
