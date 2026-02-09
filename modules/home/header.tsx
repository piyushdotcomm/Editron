"use client";

import Link from "next/link";
import { ThemeToggle } from "@/components/ui/toggle-theme";
import UserButton from "../auth/components/user-button";
import { cn } from "@/lib/utils";
import { Code2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "../auth/hooks/use-current-user";

export function Header() {
    const user = useCurrentUser();

    return (
        <header className="fixed top-0 inset-x-0 z-50 h-16 border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
            <div className="container h-full mx-auto px-4 md:px-6 flex items-center justify-between">

                {/* Logo Area */}
                <div className="flex items-center gap-6">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="relative flex items-center justify-center p-1.5 rounded-lg bg-red-500/10 border border-red-500/20 group-hover:bg-red-500/20 transition-colors">
                            <Code2 className="w-5 h-5 text-red-500" />
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
