import type { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
    title: "Docs",
    description: "Read Editron documentation, guides, and developer resources.",
};

export default function DocsLayout({ children }: { children: ReactNode }) {
    return <>{children}</>;
}