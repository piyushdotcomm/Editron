import { Footer } from "@/modules/home/footer";
import { cn } from "@/lib/utils";
import { Header } from "@/modules/home/header";
import { Metadata } from "next";
export const metadata: Metadata = {
    title: {
        template: "Editron",
        default: "Editron - The Ultimate Online Code Editor",
    },
};
export default function HomeLayout({
    children
}: {
    children: React.ReactNode
}) {
    return (
        <>
            <Header />

            <main className="z-20 relative w-full pt-0 ">{children}</main>
            <Footer />
        </>
    )
}