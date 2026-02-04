import { SidebarProvider } from "@/components/ui/sidebar";
import React from "react";

export default function PlaygroundLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <SidebarProvider>
            {children}
        </SidebarProvider>
    );
}