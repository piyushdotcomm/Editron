import { Footer } from "@/modules/home/footer";
// import { cn } from "@/lib/utils";
import { Header } from "@/modules/home/header";

export default function HomeLayout({
    children
}: {
    children: React.ReactNode
}) {
    return (
        <>
            <Header />

            <main className="relative w-full pt-0 ">{children}</main>
            <Footer />
        </>
    )
}