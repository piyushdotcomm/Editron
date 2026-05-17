import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
    title: "Templates",
    description:
        "Browse ready-to-use project templates in Editron for faster development workflows.",
};

interface TemplatesLayoutProps {
    children: ReactNode;
}

export default function TemplatesLayout({
    children,
}: TemplatesLayoutProps) {
    return children;
}