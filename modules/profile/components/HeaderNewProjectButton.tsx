"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createPlayground } from "@/modules/dashboard/actions";
import TemplateSelectingModal from "@/modules/dashboard/components/template-selecting-modal";
import { Button } from "@/components/ui/button";
import type { TemplateKey } from "@/lib/template";

export default function HeaderNewProjectButton() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const router = useRouter();

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

    return (
        <>
            <Button
                onClick={() => setIsModalOpen(true)}
                variant="default"
                size="sm"
                className="bg-[#171717] text-white hover:bg-[#2a2a2a] dark:bg-white dark:text-[#171717] dark:hover:bg-white/90"
            >
                New Project
            </Button>

            <TemplateSelectingModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleCreateProject}
            />
        </>
    );
}
