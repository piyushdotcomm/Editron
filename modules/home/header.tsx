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

    // ✅ Separate states
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

                        {/* ✅ Shortcut Button */}
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
                                    <Button size="icon" aria-label="Open menu" title="Open menu">
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

            {/* ✅ Shortcut Modal */}
            <ShortcutModal
                isOpen={shortcutOpen}
                onClose={() => setShortcutOpen(false)}
            />
        </>
    );
}

function NavLink({ href, children }: any) {
    return (
        <Link href={href} className="px-3 py-2 text-sm">
            {children}
        </Link>
    );
}