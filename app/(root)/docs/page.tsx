"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { ChevronRight, FileText, Settings, Code, Zap, HelpCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const sections = [
    {
        id: "getting-started",
        title: "Getting Started",
        icon: FileText,
        items: [
            { id: "introduction", title: "Introduction" },
            { id: "quick-start", title: "Quick Start" },
            { id: "installation", title: "Installation" },
        ]
    },
    {
        id: "core-features",
        title: "Core Features",
        icon: Zap,
        items: [
            { id: "monaco-editor", title: "Monaco Editor" },
            { id: "web-containers", title: "WebContainers" },
            { id: "authentication", title: "Authentication" },
        ]
    },
    {
        id: "customization",
        title: "Customization",
        icon: Settings,
        items: [
            { id: "themes", title: "Themes" },
            { id: "settings", title: "Settings" },
        ]
    },
    {
        id: "shortcuts",
        title: "Shortcuts",
        icon: Code,
        items: [
            { id: "keybindings", title: "Keybindings" },
            { id: "commands", title: "Command Palette" },
        ]
    }
];

export default function DocsPage() {
    const [activeSection, setActiveSection] = useState("introduction");

    // Handle scroll spy
    useEffect(() => {
        const handleScroll = () => {
            // Simple scroll spy logic
            const sections = document.querySelectorAll("section[id]");
            sections.forEach((section) => {
                const top = section.getBoundingClientRect().top;
                if (top >= 0 && top < 300) {
                    setActiveSection(section.id);
                }
            });
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const scrollTo = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: "smooth" });
            setActiveSection(id);
        }
    };

    return (
        <div className="relative min-h-screen bg-background text-foreground font-sans">
            {/* Background Dots */}
            <div className="fixed inset-0 -z-10 h-full w-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] dark:bg-[radial-gradient(#262626_1px,transparent_1px)]"></div>

            <div className="container mx-auto px-4 md:px-6 max-w-7xl pt-24 pb-20">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                    {/* Sidebar Navigation */}
                    <div className="hidden lg:block lg:col-span-3">
                        <div className="sticky top-24 space-y-8">
                            <div className="flex items-center space-x-2 mb-6">
                                <div className="h-8 w-1 bg-red-500 rounded-full"></div>
                                <h2 className="text-xl font-bold tracking-tight">Documentation</h2>
                            </div>

                            <nav className="space-y-6">
                                {sections.map((section) => (
                                    <div key={section.id}>
                                        <div className="flex items-center gap-2 mb-2 text-sm font-semibold text-foreground/80 uppercase tracking-wider">
                                            <section.icon className="w-4 h-4 text-red-500" />
                                            {section.title}
                                        </div>
                                        <ul className="space-y-1 border-l border-border/50 ml-2 pl-4">
                                            {section.items.map((item) => (
                                                <li key={item.id}>
                                                    <button
                                                        onClick={() => scrollTo(item.id)}
                                                        className={cn(
                                                            "text-sm py-1 transition-colors duration-200 block text-left hover:text-red-500",
                                                            activeSection === item.id
                                                                ? "text-red-500 font-medium translate-x-1"
                                                                : "text-muted-foreground"
                                                        )}
                                                    >
                                                        {item.title}
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </nav>

                            <div className="pt-6 border-t border-border/50">
                                <h3 className="text-sm font-semibold mb-2">Need help?</h3>
                                <Link href="https://github.com/editron/issues">
                                    <Button variant="outline" size="sm" className="w-full justify-start text-muted-foreground hover:text-red-500 hover:border-red-500/50">
                                        <HelpCircle className="w-4 h-4 mr-2" />
                                        Report an Issue
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <main className="lg:col-span-9 space-y-16">

                        {/* Header */}
                        <div className="space-y-4 border-b border-border/50 pb-10">
                            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">
                                The Editron Manual
                            </h1>
                            <p className="text-xl text-muted-foreground max-w-3xl leading-relaxed">
                                Everything you need to know about building, deploying, and scaling your applications with Editron's intelligent environment.
                            </p>
                        </div>

                        {/* Content Sections */}
                        <div className="space-y-24">

                            {/* Getting Started */}
                            <div className="space-y-12">
                                <section id="introduction" className="space-y-4">
                                    <h2 className="text-3xl font-bold flex items-center gap-3">
                                        <span className="p-2 bg-red-500/10 rounded-lg text-red-500"><FileText className="w-6 h-6" /></span>
                                        Introduction
                                    </h2>
                                    <p className="text-lg leading-relaxed text-muted-foreground">
                                        Editron is a browser-based integrated development environment (IDE) that brings the power of local development to the cloud.
                                        It combines the speed of a local editor with the flexibility of cloud computing, allowing you to code from anywhere, on any device.
                                    </p>
                                </section>

                                <section id="quick-start" className="space-y-4">
                                    <h3 className="text-2xl font-semibold">Quick Start</h3>
                                    <p className="leading-relaxed text-muted-foreground">
                                        Get up and running in seconds. Just navigate to the <Link href="/templates" className="text-red-500 underline underline-offset-4">Templates</Link> page,
                                        select your preferred framework, and click "Use Template". Editron will instantly provision a containerized environment for you.
                                    </p>
                                    <div className="p-4 bg-muted/30 rounded-lg border border-border/50 font-mono text-sm text-muted-foreground">
                                        <span className="text-red-500">$</span> npx create-editron-app my-new-project
                                    </div>
                                </section>

                                <section id="installation" className="space-y-4">
                                    <h3 className="text-2xl font-semibold">Installation</h3>
                                    <p className="leading-relaxed text-muted-foreground">
                                        Editron runs entirely in your browser, so there's nothing to install! However, you can install it as a PWA (Progressive Web App)
                                        for a native-like experience on your desktop or tablet.
                                    </p>
                                </section>
                            </div>

                            {/* Core Features */}
                            <div className="space-y-12">
                                <div className="border-t border-border/50 pt-10">
                                    <h2 className="text-3xl font-bold flex items-center gap-3 mb-8">
                                        <span className="p-2 bg-amber-500/10 rounded-lg text-amber-500"><Zap className="w-6 h-6" /></span>
                                        Core Features
                                    </h2>

                                    <section id="monaco-editor" className="space-y-4 mb-10">
                                        <h3 className="text-2xl font-semibold">Monaco Editor</h3>
                                        <p className="leading-relaxed text-muted-foreground">
                                            Powered by the same engine as VS Code, Editron offers a familiar editing experience with syntax highlighting,
                                            IntelliSense, and code navigation for over 40 languages.
                                        </p>
                                    </section>

                                    <section id="web-containers" className="space-y-4 mb-10">
                                        <h3 className="text-2xl font-semibold">WebContainers</h3>
                                        <p className="leading-relaxed text-muted-foreground">
                                            Editron uses WebContainers to run Node.js directly in your browser. This means you can run servers,
                                            install packages with npm, and execute commands just like you would on your local machine, but with zero latency.
                                        </p>
                                    </section>

                                    <section id="authentication" className="space-y-4">
                                        <h3 className="text-2xl font-semibold">Authentication</h3>
                                        <p className="leading-relaxed text-muted-foreground">
                                            Secure your projects with flexible authentication options. Editron supports GitHub and Google OAuth providers
                                            out of the box, ensuring your code remains private and secure.
                                        </p>
                                    </section>
                                </div>
                            </div>

                            {/* Customization */}
                            <div className="space-y-12">
                                <div className="border-t border-border/50 pt-10">
                                    <section id="themes" className="space-y-4">
                                        <h2 className="text-3xl font-bold flex items-center gap-3 mb-6">
                                            <span className="p-2 bg-blue-500/10 rounded-lg text-blue-500"><Settings className="w-6 h-6" /></span>
                                            Customization
                                        </h2>
                                        <h3 className="text-2xl font-semibold">Themes</h3>
                                        <p className="leading-relaxed text-muted-foreground">
                                            Editron comes with built-in support for light and dark modes, fully customizable via the settings panel.
                                            The UI is built with Shadcn and Tailwind CSS, making it easy to adapt to your brand.
                                        </p>
                                    </section>
                                </div>
                            </div>

                            {/* Shortcuts */}
                            <div className="space-y-12">
                                <div className="border-t border-border/50 pt-10 pb-20">
                                    <section id="keybindings" className="space-y-4">
                                        <h2 className="text-3xl font-bold flex items-center gap-3 mb-6">
                                            <span className="p-2 bg-green-500/10 rounded-lg text-green-500"><Code className="w-6 h-6" /></span>
                                            Shortcuts
                                        </h2>
                                        <h3 className="text-2xl font-semibold">Keybindings</h3>
                                        <p className="leading-relaxed text-muted-foreground mb-6">
                                            Boost your productivity with these essential shortcuts:
                                        </p>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <ShortcutItem keys={["Ctrl", "P"]} description="Quick Open File" />
                                            <ShortcutItem keys={["Ctrl", "Shift", "F"]} description="Global Search" />
                                            <ShortcutItem keys={["Ctrl", "B"]} description="Toggle Sidebar" />
                                            <ShortcutItem keys={["Ctrl", "`"]} description="Toggle Terminal" />
                                            <ShortcutItem keys={["Alt", "Up/Down"]} description="Move Line" />
                                            <ShortcutItem keys={["Ctrl", "/"]} description="Toggle Comment" />
                                        </div>
                                    </section>
                                </div>
                            </div>

                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}

function ShortcutItem({ keys, description }: { keys: string[], description: string }) {
    return (
        <div className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-background hover:border-red-500/30 transition-colors">
            <span className="text-sm font-medium text-muted-foreground">{description}</span>
            <div className="flex gap-1">
                {keys.map((k) => (
                    <kbd key={k} className="px-2 py-1 text-xs font-semibold text-foreground bg-muted border border-border rounded shadow-sm">
                        {k}
                    </kbd>
                ))}
            </div>
        </div>
    );
}
