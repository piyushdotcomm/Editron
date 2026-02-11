"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createPlayground } from "@/modules/dashboard/actions";
import TemplateSelectingModal from "@/modules/dashboard/components/template-selecting-modal";
import {
    Plus,
    Search,
    Github,
    Upload,
    Copy,
    Play
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
        template: "REACT" | "NEXTJS" | "EXPRESS" | "VUE" | "ANGULAR" | "HONO";
        description?: string;
    }) => {
        try {
            const res = await createPlayground(data);
            toast.success("Project created successfully");
            setIsModalOpen(false);
            if (res?.id) {
                router.push(`/playground/${res.id}`);
            }
        } catch (error) {
            toast.error("Failed to create project");
        }
    };

    const actions = [
        { icon: Plus, label: "New Project", color: "text-foreground", action: handleNewProject },
        { icon: Copy, label: "From Template", color: "text-blue-500", action: handleNewProject }, // Reuse new project for template
        { icon: Github, label: "Import GitHub", color: "text-purple-500", action: () => toast.info("Import from GitHub coming soon!") },
        { icon: Upload, label: "Upload ZIP", color: "text-green-500", action: () => toast.info("Upload ZIP coming soon!") },
        { icon: Search, label: "Clone Repo", color: "text-orange-500", action: () => toast.info("Clone Repo coming soon!") },
        { icon: Play, label: "Resume Last", color: "text-red-500", action: () => toast.info("Resume Last coming soon!") },
    ];

    return (
        <>
            <Card className="bg-card border-border/50">
                <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-3 px-3 pb-3">
                    {actions.map((action) => (
                        <Button
                            key={action.label}
                            variant="outline"
                            onClick={action.action}
                            className="w-full justify-start gap-2 h-auto py-3 px-4 hover:border-primary/50 transition-colors group"
                        >
                            <action.icon size={16} className={`${action.color} group-hover:scale-110 transition-transform`} />
                            <span className="text-xs font-medium truncate">{action.label}</span>
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
