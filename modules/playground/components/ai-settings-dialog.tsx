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
import { Eye, EyeOff } from "lucide-react";
import { useAI, type AIProvider } from "@/modules/playground/hooks/useAI";

interface AISettingsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function AISettingsDialog({ open, onOpenChange }: AISettingsDialogProps) {
    const {
        inlineSuggestionsEnabled,
        toggleInlineSuggestions,
        userGeminiKey,
        userGroqKey,
        userMistralKey,
        setUserApiKey,
    } = useAI();

    const [visibleKeys, setVisibleKeys] = useState<Record<string, boolean>>({});

    const keyConfigs = [
        { provider: "gemini" as AIProvider, label: "Gemini", value: userGeminiKey },
        { provider: "groq" as AIProvider, label: "Groq", value: userGroqKey },
        { provider: "mistral" as AIProvider, label: "Mistral", value: userMistralKey },
    ];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>AI Settings</DialogTitle>
                    <DialogDescription>
                        Configure API keys and inline suggestion preferences.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    {/* Inline Suggestions Toggle */}
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium">Inline Suggestions</p>
                            <p className="text-xs text-muted-foreground">Ghost-text completions while typing</p>
                        </div>
                        <button
                            onClick={toggleInlineSuggestions}
                            className={`relative w-10 h-5 rounded-full transition-colors ${inlineSuggestionsEnabled ? "bg-primary" : "bg-muted-foreground/30"
                                }`}
                        >
                            <span
                                className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white transition-transform ${inlineSuggestionsEnabled ? "translate-x-5" : "translate-x-0"
                                    }`}
                            />
                        </button>
                    </div>

                    {/* API Keys */}
                    <div className="border-t pt-4">
                        <p className="text-sm font-medium mb-1">API Keys</p>
                        <p className="text-xs text-muted-foreground mb-3">
                            Override built-in keys with your own. Stored in your browser only.
                        </p>
                        {keyConfigs.map((kc) => (
                            <div key={kc.provider} className="mb-3 space-y-1">
                                <label className="text-xs font-medium text-muted-foreground">{kc.label} API Key</label>
                                <div className="flex gap-1">
                                    <input
                                        type={visibleKeys[kc.provider] ? "text" : "password"}
                                        className="flex-1 text-xs bg-muted border rounded-md px-2 py-1.5 font-mono outline-none focus:ring-1 focus:ring-primary"
                                        placeholder={`Enter your ${kc.label} API key`}
                                        value={kc.value}
                                        onChange={(e) => setUserApiKey(kc.provider, e.target.value)}
                                    />
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-7 w-7 shrink-0"
                                        onClick={() => setVisibleKeys((v) => ({ ...v, [kc.provider]: !v[kc.provider] }))}
                                    >
                                        {visibleKeys[kc.provider] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
