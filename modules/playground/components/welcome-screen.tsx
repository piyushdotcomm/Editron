"use client";

import { Bot, Download, Eye, FileSearch, Command } from "lucide-react";

interface WelcomeScreenProps {
    projectTitle?: string;
    onTogglePreview: () => void;
    onOpenAI: () => void;
    onDownload: () => void;
    onOpenCommandPalette: () => void;
}

export function WelcomeScreen({
    projectTitle,
    onTogglePreview,
    onOpenAI,
    onDownload,
    onOpenCommandPalette,
}: WelcomeScreenProps) {
    return (
        <div className="flex flex-col h-full items-center justify-center text-muted-foreground p-8">
            <div
                className="max-w-lg w-full space-y-8"
                style={{ animation: "fadeInUp 0.5s ease-out" }}
            >
                {/* Logo / Title */}
                <div className="text-center space-y-2">
                    <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/10 flex items-center justify-center mb-4">
                        <Command className="h-7 w-7 text-primary/70" />
                    </div>
                    <h2 className="text-lg font-semibold text-foreground">
                        {projectTitle || "Code Playground"}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Select a file from the sidebar or use a quick action below
                    </p>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-3">
                    <QuickAction
                        icon={<FileSearch className="h-4 w-4" />}
                        label="Open File"
                        description="Browse your project files"
                        onClick={onOpenCommandPalette}
                        delay="0.1s"
                    />
                    <QuickAction
                        icon={<Eye className="h-4 w-4" />}
                        label="Run Preview"
                        description="Launch live preview"
                        onClick={onTogglePreview}
                        delay="0.15s"
                    />
                    <QuickAction
                        icon={<Bot className="h-4 w-4" />}
                        label="Ask AI"
                        description="AI-powered code editing"
                        onClick={onOpenAI}
                        delay="0.2s"
                    />
                    <QuickAction
                        icon={<Download className="h-4 w-4" />}
                        label="Download"
                        description="Export as ZIP file"
                        onClick={onDownload}
                        delay="0.25s"
                    />
                </div>
            </div>
        </div>
    );
}

function QuickAction({
    icon,
    label,
    description,
    onClick,
    delay,
}: {
    icon: React.ReactNode;
    label: string;
    description: string;
    onClick: () => void;
    delay: string;
}) {
    return (
        <button
            onClick={onClick}
            className="group flex items-start gap-3 rounded-xl border border-border/50 bg-card/50 p-4 text-left transition-all duration-200 hover:border-primary/30 hover:bg-primary/5 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            style={{ animation: `fadeInUp 0.4s ease-out ${delay} both` }}
        >
            <div className="mt-0.5 rounded-lg bg-muted p-2 text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                {icon}
            </div>
            <div>
                <div className="text-sm font-medium text-foreground">{label}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{description}</div>
            </div>
        </button>
    );
}
