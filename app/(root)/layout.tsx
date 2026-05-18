import RawFooter from "editron-starters/bolt-qwik/src/components/starter/footer/footer";
// import { cn } from "@/lib/utils";
import { Header } from "@/modules/home/header";

const Footer = RawFooter as unknown as React.FC;

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