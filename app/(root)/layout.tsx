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
        // NOTE: no background class here on purpose - the transplanted Dala
        // landing renders its WebGL canvas in a `z-index: -1` layer and any
        // opaque background on this wrapper would paint over it. The black
        // page background comes from the Dala stylesheet (`body{background:#000}`).
        return (
            <div className="min-h-screen text-white hide-scrollbar overflow-x-hidden">
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