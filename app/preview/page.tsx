"use client";

import { useSearchParams } from "next/navigation";
import { Copy, ExternalLink, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useRef } from "react";
import { toast } from "sonner";

export default function PreviewPage() {
    const searchParams = useSearchParams();
    const url = searchParams.get("url"); // Gets the 'url' query parameter
    const [iframeKey, setIframeKey] = useState(0); // For forcing iframe reload

    const handleCopyUrl = () => {
        if (url) {
            navigator.clipboard.writeText(url);
            toast.success("URL copied to clipboard");
        }
    };

    const handleRefresh = () => {
        setIframeKey(prev => prev + 1);
    };

    const handleOpenOriginal = () => {
        if (url) {
            window.open(url, '_blank');
        }
    }


    if (!url) {
        return (
            <div className="flex items-center justify-center h-screen bg-neutral-950 text-neutral-400">
                <p>No URL provided for preview.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-neutral-950">
            {/* Navbar / Address Bar */}
            <div className="flex items-center gap-2 px-4 py-2 bg-neutral-900 border-b border-neutral-800">
                <Button variant="ghost" size="icon" onClick={handleRefresh} title="Refresh">
                    <RefreshCw size={16} />
                </Button>

                <div className="flex-1 max-w-3xl relative">
                    <Input
                        value={url}
                        readOnly
                        className="w-full h-8 pl-3 pr-8 bg-neutral-800 border-neutral-700 text-neutral-300 text-sm focus-visible:ring-1 focus-visible:ring-neutral-600"
                    />
                </div>

                <Button variant="ghost" size="icon" onClick={handleCopyUrl} title="Copy URL">
                    <Copy size={16} />
                </Button>
                <Button variant="ghost" size="icon" onClick={handleOpenOriginal} title="Open directly">
                    <ExternalLink size={16} />
                </Button>
            </div>

            {/* Preview Iframe */}
            <div className="flex-1 relative bg-white">
                <iframe
                    key={iframeKey}
                    src={url}
                    className="absolute inset-0 w-full h-full border-none"
                    title="Full Screen Preview"
                    sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
                    allow="accelerometer; camera; encrypted-media; geolocation; gyroscope; microphone; midi; clipboard-read; clipboard-write;"
                />
            </div>
        </div>
    );
}
