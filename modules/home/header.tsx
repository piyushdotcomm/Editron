"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

import { ThemeToggle } from "@/components/ui/toggle-theme";
import UserButton from "../auth/components/user-button";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "../auth/hooks/use-current-user";
import ShortcutModal from "@/components/ShortcutModal";

import { Menu } from "lucide-react";

import {
    Sheet,
    SheetContent,
    SheetTrigger,
} from "@/components/ui/sheet";

export function Header() {
    const user = useCurrentUser();

    // ✅ States
    const [shortcutOpen, setShortcutOpen] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <>
            <header className="fixed top-0 inset-x-0 z-50 h-16 border-b border-border/40 bg-background/80 backdrop-blur-xl">
                <div className="container h-full mx-auto px-4 md:px-6 flex items-center justify-between">

                    {/* Logo */}
                    <div className="flex items-center gap-6">
                        <Link href="/" className="flex items-center gap-2">
                            <Image src="/logo.svg" alt="logo" width={32} height={32} />
                            <span className="font-bold text-lg">Editron</span>
                        </Link>

                        {/* Desktop Nav */}
                        <nav className="hidden md:flex gap-2">
                            <NavLink href="/docs">Docs</NavLink>
                            <NavLink href="/#features">Features</NavLink>
                            <NavLink href="/templates">Templates</NavLink>
                        </nav>
                    </div>

                    {/* Right Side */}
                    <div className="flex items-center gap-2">

                        <ThemeToggle />

                        {/* Shortcut Button */}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShortcutOpen(true)}
                        >
                            Shortcuts
                        </Button>

                        {!user ? (
                            <>
                                <Link href="/auth/sign-in">
                                    <Button variant="ghost" size="sm">
                                        Sign In
                                    </Button>
                                </Link>

                                <Link href="/dashboard">
                                    <Button size="sm">
                                        Get Started
                                    </Button>
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link href="/dashboard">
                                    <Button size="sm" variant="outline">
                                        Dashboard
                                    </Button>
                                </Link>
                                <UserButton />
                            </>
                        )}

                        {/* Mobile Menu */}
                        <div className="md:hidden">
                            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
                                <SheetTrigger asChild>
                                    <Button size="icon" aria-label="Open menu">
                                        <Menu />
                                    </Button>
                                </SheetTrigger>

                                <SheetContent side="right">
                                    <div className="flex flex-col gap-4 mt-4">

                                        <Link href="/docs">Docs</Link>
                                        <Link href="/#features">Features</Link>
                                        <Link href="/templates">Templates</Link>

                                        {!user ? (
                                            <>
                                                <Link href="/auth/sign-in">
                                                    Sign In
                                                </Link>
                                <SheetContent
                                    side="right"
                                    className="w-[85%] max-w-[320px] border-l border-border/50 bg-background/95 backdrop-blur-xl p-0 transition-all duration-300"
                                >
                                    <div className="flex flex-col h-full">

                                        {/* Top Section */}
                                        <div className="flex items-center gap-3 border-b border-border/50 px-6 py-5">
                                            <Image
                                                src="/logo.svg"
                                                alt="Editron Logo"
                                                width={28}
                                                height={28}
                                            />

                                            <span className="font-bold text-lg">
                                                Editron
                                            </span>
                                        </div>

                                        {/* Navigation Links */}
                                        <div className="flex flex-col px-4 py-6 gap-2">

                                            <Link
                                                href="/docs"
                                                onClick={() => setOpen(false)}
                                                className="rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground hover:text-red-500 hover:bg-red-500/5 hover:translate-x-1 border border-transparent hover:border-red-500/20 transition-all duration-300"
                                            >
                                                Documentation
                                            </Link>

                                            <Link
                                                href="/#features"
                                                onClick={() => setOpen(false)}
                                                className="rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground hover:text-red-500 hover:bg-red-500/5 hover:translate-x-1 border border-transparent hover:border-red-500/20 transition-all duration-300"
                                            >
                                                Features
                                            </Link>

                                            <Link
                                                href="/templates"
                                                onClick={() => setOpen(false)}
                                                className="rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground hover:text-red-500 hover:bg-red-500/5 hover:translate-x-1 border border-transparent hover:border-red-500/20 transition-all duration-300"
                                            >
                                                Templates
                                            </Link>
                                        </div>

                                        {/* Bottom Buttons */}
                                        <div className="mt-auto border-t border-border/50 p-4 flex flex-col gap-3">

                                            {!user ? (
                                                <>
                                                    <Link href="/auth/sign-in">
                                                        <Button
                                                            variant="outline"
                                                            onClick={() => setOpen(false)}
                                                            className="w-full rounded-xl"
                                                        >
                                                            Sign In
                                                        </Button>
                                                    </Link>

                                                    <Link href="/dashboard">
                                                        <Button className="w-full rounded-xl bg-red-600 hover:bg-red-700" onClick={() => setOpen(false)}>
                                                            Get Started
                                                        </Button>
                                                    </Link>
                                                </>
                                            ) : (
                                                <Link href="/dashboard">
                                                    Get Started
                                                </Link>
                                            </>
                                        ) : (
                                            <Link href="/dashboard">
                                                Dashboard
                                            </Link>
                                        )}
                                    </div>
                                </SheetContent>
                            </Sheet>
                        </div>

                    </div>
                </div>
            </header>

            {/* ✅ FIXED Shortcut Modal */}
            <ShortcutModal
                open={shortcutOpen}
                onOpenChange={setShortcutOpen}
            />
        </>
    );
}

function NavLink({ href, children }: any) {
    return (
        <Link href={href} className="px-3 py-2 text-sm">
        <Link
            href={href}
            className="
                relative
                px-3
                py-2
                text-sm
                font-medium
                text-muted-foreground
                hover:text-red-500
                rounded-md
                transition-all
                duration-300

                after:content-['']
                after:absolute
                after:left-1/2
                after:bottom-1
                after:h-[2px]
                after:w-[70%]
                after:-translate-x-1/2
                after:scale-x-0
                after:origin-center
                after:rounded-full
                after:bg-gradient-to-r
                after:from-red-900
                after:via-red-600
                after:to-red-400
                after:transition-transform
                after:duration-300

                hover:after:scale-x-100
                "
        >
            {children}
        </Link>
    );
}