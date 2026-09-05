"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/modules/home/header";

export default function HomeLayout({
    children
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname();
    const isLandingPage = pathname === "/";

    if (isLandingPage) {
        return (
            <div className="min-h-screen bg-black text-white hide-scrollbar overflow-x-hidden">
                {children}
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-background hide-scrollbar">
            <Header />
            <main className="flex-1 w-full pt-16 hide-scrollbar">{children}</main>
        </div>
    );
}