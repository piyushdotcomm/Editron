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
            <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:rounded-md focus:bg-background focus:text-foreground focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
                Skip to main content
            </a>
            <Header />

            <main id="main-content" className="relative w-full pt-0 ">{children}</main>
            <Footer />
        </>
    )
}