
"use client";

import { Button } from "@/components/ui/button"
// import { createPlayground } from "@/features/playground/actions";
import { Plus } from 'lucide-react'
import Image from "next/image"
import { useRouter } from "next/navigation";
import { use, useState } from "react"
import { toast } from "sonner";
import TemplateSelectingModal from "./template-selecting-modal";
import { createPlayground } from "../actions";

const AddNewButton = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<{
    title: string;
    template: "REACT" | "NEXTJS" | "EXPRESS" | "VUE" | "ANGULAR" | "HONO";
    description?: string;

  } | null>(null)
  const router = useRouter()

  const handleSubmit = async (data: {
    title: string;
    template: "REACT" | "NEXTJS" | "EXPRESS" | "VUE" | "ANGULAR" | "HONO";
    description?: string;
  }) => {
    setSelectedTemplate(data)
    const res = await createPlayground(data);
    toast.success("Playground Created successfully")
    setIsModalOpen(false)
    router.push(`/playground/${res?.id}`)
  }

  return (
    <>
      <div
        onClick={() => setIsModalOpen(true)}
        className="group relative px-6 py-8 flex flex-row justify-between items-center border border-border/40 rounded-xl bg-background/50 hover:bg-background/80 backdrop-blur-sm cursor-pointer 
        transition-all duration-300 ease-out
        hover:border-red-500/50 hover:shadow-lg hover:shadow-red-500/10 hover:-translate-y-1"
      >
        <div className="flex flex-row items-center gap-5">
          <div className="h-12 w-12 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20 group-hover:bg-red-500/20 group-hover:border-red-500/40 transition-all duration-300">
            <Plus className="h-6 w-6 text-red-500 transition-transform duration-300 group-hover:rotate-90" />
          </div>
          <div className="flex flex-col space-y-1">
            <h1 className="text-xl font-bold text-foreground group-hover:text-red-500 transition-colors">New Playground</h1>
            <p className="text-sm text-muted-foreground">Create a new project from template</p>
          </div>
        </div>

        <div className="relative opacity-80 group-hover:opacity-100 transition-opacity">
          <Image
            src={"/add-new.svg"}
            alt="Create new playground"
            width={120}
            height={120}
            className="transition-transform duration-500 group-hover:scale-110 drop-shadow-lg"
          />
        </div>
      </div>
      <TemplateSelectingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}


      />

    </>
  )
}

export default AddNewButton
