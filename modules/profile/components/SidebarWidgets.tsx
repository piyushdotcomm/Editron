"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createPlayground } from "@/modules/dashboard/actions";
import TemplateSelectingModal from "@/modules/dashboard/components/template-selecting-modal";
import type { TemplateKey } from "@/lib/template";
import {
    Plus,
    Github,
    Upload,
    Copy,
    Play,
    Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function QuickActions() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const router = useRouter();

    const handleNewProject = () => {
        setIsModalOpen(true);
    };

    const handleCreateProject = async (data: {
        title: string;
        template: TemplateKey;
        description?: string;
    }) => {
        try {
            const res = await createPlayground(data);
            if (res?.success) {
                toast.success("Project created successfully");
                setIsModalOpen(false);
                router.push(`/playground/${res.playground.id}`);
            } else {
                toast.error(res?.error ?? "Failed to create project");
            }
        } catch (_error) {
            toast.error("Failed to create project");
        }
    };

    const actions = [
        { icon: Plus, label: "New project", description: "Start from a blank app", action: handleNewProject, active: true },
        { icon: Copy, label: "From template", description: "Choose a starter stack", action: handleNewProject, active: true },
        { icon: Github, label: "Import GitHub", description: "Connect repository", active: false },
        { icon: Upload, label: "Upload ZIP", description: "Bring local files", active: false },
        { icon: Search, label: "Clone repo", description: "Paste a remote URL", active: false },
        { icon: Play, label: "Resume last", description: "Continue recent work", active: false },
    ];

    return (
        <>
            <Card className="rounded-lg border-[#ebebeb] bg-white shadow-[0_1px_1px_rgba(0,0,0,0.02),0_2px_2px_rgba(0,0,0,0.04)] dark:border-border dark:bg-card">
                <CardHeader className="gap-1 border-b border-[#ebebeb] p-5 dark:border-border">
                    <p className="font-mono text-[11px] uppercase tracking-normal text-[#888888] dark:text-muted-foreground">
                        Shortcuts
                    </p>
                    <CardTitle className="text-xl font-semibold tracking-normal text-[#171717] dark:text-foreground">
                        Quick actions
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 p-3">
                    {actions.map((action) => (
                        <Button
                            key={action.label}
                            variant="outline"
                            onClick={action.active ? action.action : undefined}
                            disabled={!action.active}
                            className="h-auto w-full justify-start gap-3 rounded-md border-[#ebebeb] bg-white px-3 py-3 text-left text-[#171717] shadow-none hover:bg-[#fafafa] dark:border-border dark:bg-card dark:text-foreground dark:hover:bg-muted/30 disabled:opacity-100"
                        >
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-[#ebebeb] bg-[#fafafa] text-[#171717] dark:border-border dark:bg-muted/30 dark:text-foreground">
                                <action.icon size={15} aria-hidden="true" />
                            </span>
                            <span className="min-w-0 flex-1">
                                <span className="block truncate text-sm font-medium">{action.label}</span>
                                <span className="block truncate text-xs font-normal text-[#888888] dark:text-muted-foreground">
                                    {action.description}
                                </span>
                            </span>
                            {!action.active && (
                                <span className="rounded-full border border-[#ebebeb] px-2 py-0.5 font-mono text-[10px] uppercase text-[#888888] dark:border-border dark:text-muted-foreground">
                                    Soon
                                </span>
                            )}
                        </Button>
                    ))}
                </CardContent>
            </Card>

            <TemplateSelectingModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleCreateProject}
            />
        </>
    );
}
