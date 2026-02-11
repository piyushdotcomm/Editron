"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createPlayground } from "@/modules/dashboard/actions";
import TemplateSelectingModal from "@/modules/dashboard/components/template-selecting-modal";
import { Button } from "@/components/ui/button";

export default function HeaderNewProjectButton() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const router = useRouter();

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

    return (
        <>
            <Button
                onClick={() => setIsModalOpen(true)}
                variant="default"
                size="sm"
                className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-md shadow-red-500/20"
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
