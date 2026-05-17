"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ThemeToggle } from "@/components/ui/toggle-theme";
import UserButton from "../auth/components/user-button";
import { cn as _cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "../auth/hooks/use-current-user";

import { Menu } from "lucide-react";

import {
    Sheet,
    SheetContent,
    SheetTrigger,
} from "@/components/ui/sheet";

export function Header() {
    const user = useCurrentUser();
    const [open, setOpen] = useState(false);

    return (
        <header className="fixed top-0 inset-x-0 z-50 h-16 border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
            <div className="container h-full mx-auto px-4 md:px-6 flex items-center justify-between">

                {/* Logo Area */}
                <div className="flex items-center gap-6">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="relative flex items-center justify-center w-8 h-8 rounded-lg overflow-hidden group-hover:scale-105 transition-transform">
                            <Image
                                src="/logo.svg"
                                alt="Editron Logo"
                                width={32}
                                height={32}
                                className="object-contain"
                                priority
                            />
                        </div>
                        <span className="font-heading font-bold text-lg tracking-tight text-foreground group-hover:text-red-500 transition-colors">
                            Editron
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-1">
                        <NavLink href="/docs">Documentation</NavLink>
                        <NavLink href="/#features">Features</NavLink>
                        <NavLink href="/templates">Templates</NavLink>
                    </nav>
                </div>

                {/* Right Side Actions */}
                <div className="flex items-center gap-3">
                    {/* Social links removed */}

                    <div className="flex items-center gap-2">
                        <ThemeToggle />
                        {/* Mobile Navigation */}

                        {!user ? (
                            <>
                                <Link href="/auth/sign-in">
                                    <Button variant="ghost" size="sm" className="hidden sm:flex text-muted-foreground hover:text-foreground hover:bg-red-500/5">
                                        Sign In
                                    </Button>
                                </Link>
                                <Link href="/dashboard">
                                    <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-500/20 text-xs font-semibold px-4 rounded-full">
                                        Get Started
                                    </Button>
                                </Link>
                            </>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link href="/dashboard">
                                    <Button size="sm" variant="outline" className="hidden sm:flex text-xs font-semibold px-3 h-8 border-red-500/20 text-red-600 hover:bg-red-500/5 mr-1">
                                        Dashboard
                                    </Button>
                                </Link>
                                <UserButton />
                            </div>
                        )}

                        <div className="md:hidden">
                            <Sheet open={open} onOpenChange={setOpen}>
                                <SheetTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        aria-label="Open menu"
                                        className="rounded-full hover:bg-secondary/80 transition-all duration-200"
                                    >
                                        <Menu className="h-5 w-5" />
                                    </Button>
                                </SheetTrigger>

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
                                                className="rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/70 transition-all duration-200"
                                            >
                                                Documentation
                                            </Link>

                                            <Link
                                                href="/#features"
                                                onClick={() => setOpen(false)}
                                                className="rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/70 transition-all duration-200"
                                            >
                                                Features
                                            </Link>

                                            <Link
                                                href="/templates"
                                                onClick={() => setOpen(false)}
                                                className="rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/70 transition-all duration-200"
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
                                                    <Button className="w-full rounded-xl" onClick={() => setOpen(false)}>
                                                        Dashboard
                                                    </Button>
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                </SheetContent>
                            </Sheet>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
    return (
        <Link
            href={href}
            className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-md transition-all duration-200"
        >
            {children}
        </Link>
    );
}
