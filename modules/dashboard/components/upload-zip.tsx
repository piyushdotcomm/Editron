"use client";

import { Upload, FileArchive, Loader2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "sonner";

const UploadZip = () => {
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    const handleClick = () => {
        if (!isUploading) {
            fileInputRef.current?.click();
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.name.endsWith(".zip")) {
            toast.error("Please upload a .zip file");
            return;
        }

        if (file.size > 50 * 1024 * 1024) {
            toast.error("File too large (max 50MB)");
            return;
        }

        setIsUploading(true);

        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("title", file.name.replace(/\.zip$/i, ""));

            const res = await fetch("/api/upload-zip", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Upload failed");
            }

            const data = await res.json();
            toast.success("Project uploaded successfully!");
            router.push(`/playground/${data.id}`);
        } catch (error: any) {
            console.error("Upload error:", error);
            toast.error(error.message || "Failed to upload ZIP file");
        } finally {
            setIsUploading(false);
            // Reset input so same file can be re-selected
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    return (
        <div
            onClick={handleClick}
            className={`group relative px-6 py-8 flex flex-row justify-between items-center border border-border/40 rounded-xl bg-background/50 hover:bg-background/80 backdrop-blur-sm cursor-pointer 
        transition-all duration-300 ease-out
        hover:border-orange-500/50 hover:shadow-lg hover:shadow-orange-500/10 hover:-translate-y-1 ${isUploading ? "pointer-events-none opacity-70" : ""
                }`}
        >
            <div className="flex flex-row items-center gap-5">
                <div className="h-12 w-12 rounded-full bg-orange-500/10 flex items-center justify-center border border-orange-500/20 group-hover:bg-orange-500/20 group-hover:border-orange-500/40 transition-all duration-300">
                    {isUploading ? (
                        <Loader2 className="h-6 w-6 text-orange-500 animate-spin" />
                    ) : (
                        <Upload className="h-6 w-6 text-orange-500 transition-transform duration-300 group-hover:-translate-y-0.5" />
                    )}
                </div>
                <div className="flex flex-col space-y-1">
                    <h1 className="text-xl font-bold text-foreground group-hover:text-orange-500 transition-colors">
                        {isUploading ? "Uploading..." : "Upload ZIP"}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        {isUploading
                            ? "Processing your project files..."
                            : "Import a project from a ZIP file"}
                    </p>
                </div>
            </div>

            <div className="relative opacity-80 group-hover:opacity-100 transition-opacity">
                <FileArchive className="h-20 w-20 text-orange-500/20 group-hover:text-orange-500/30 transition-all duration-500 group-hover:scale-110" />
            </div>

            <input
                ref={fileInputRef}
                type="file"
                accept=".zip"
                className="hidden"
                onChange={handleFileChange}
            />
        </div>
    );
};

export default UploadZip;
