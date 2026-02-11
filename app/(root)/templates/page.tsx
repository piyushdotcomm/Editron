"use client";

import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, Copy, Terminal, Check } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

// Mock data based on editron-starters directory
const templates = [
    {
        id: "react-vite",
        title: "React",
        description: "A JavaScript library for building user interfaces with component-based architecture",
        tags: ["UI", "Frontend", "JavaScript"],
        icon: "/react.svg",
        color: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    },
    {
        id: "nextjs",
        title: "Next.js",
        description: "The React framework for production with server-side rendering and static site generation",
        tags: ["React", "SSR", "Fullstack"],
        icon: "/nextjs-icon.svg",
        color: "bg-black/10 text-black dark:bg-white/10 dark:text-white border-black/20 dark:border-white/20",
    },
    {
        id: "express",
        title: "Express",
        description: "Fast, unopinionated, minimalist web framework for Node.js to build APIs and web applications",
        tags: ["Node.js", "API", "Backend"],
        icon: "/expressjs-icon.svg",
        color: "bg-gray-500/10 text-gray-500 border-gray-500/20",
    },
    {
        id: "vue",
        title: "Vue.js",
        description: "Progressive JavaScript framework for building user interfaces with an approachable learning curve",
        tags: ["UI", "Frontend", "JavaScript"],
        icon: "/vuejs-icon.svg",
        color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    },
    {
        id: "hono",
        title: "Hono",
        description: "Fast, lightweight, built on Web Standards. Support for any JavaScript runtime.",
        tags: ["Node.js", "TypeScript", "Backend"],
        icon: "/hono.svg",
        color: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    },
    {
        id: "angular",
        title: "Angular",
        description: "Angular is a web framework that empowers developers to build fast, reliable applications.",
        tags: ["Angular", "Fullstack", "JavaScript"],
        icon: "/angular-2.svg",
        color: "bg-red-600/10 text-red-600 border-red-600/20",
    },
];

export default function TemplatesPage() {
    const [activeFilter, setActiveFilter] = useState("All");
    const filters = ["All", "React", "Vue", "Backend"];

    const filteredTemplates = activeFilter === "All"
        ? templates
        : templates.filter(t => t.tags.some(tag => tag.includes(activeFilter) || (activeFilter === "Backend" && ["Node.js", "Hono", "Express"].some(b => t.tags.includes(b)))));

    return (
        <div className="relative min-h-screen bg-background selection:bg-red-500/20 pt-24 pb-20 font-sans">
            {/* Background Grid Pattern */}
            <div className="absolute inset-0 -z-10 h-full w-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>

            <div className="container mx-auto px-4 md:px-6 max-w-7xl">

                {/* Header */}
                <div className="flex flex-col items-center text-center space-y-6 mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-sm text-red-500 mb-4"
                    >
                        <Terminal className="w-3 h-3 mr-2" />
                        <span>Instant Development Environments</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-6xl font-black tracking-tight text-foreground max-w-4xl"
                    >
                        Start with a <span className="text-red-500">Template</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-lg text-muted-foreground max-w-2xl mx-auto"
                    >
                        Launch a fully configured development environment in seconds.
                        Choose from popular frameworks and start building instantly.
                    </motion.p>
                </div>

                {/* Filters */}
                <div className="flex justify-center gap-2 mb-12 flex-wrap">
                    {filters.map((filter) => (
                        <button
                            key={filter}
                            onClick={() => setActiveFilter(filter)}
                            className={cn(
                                "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border",
                                activeFilter === filter
                                    ? "bg-red-500 text-white border-red-500 shadow-lg shadow-red-500/25"
                                    : "bg-secondary/50 text-muted-foreground border-transparent hover:bg-secondary hover:text-foreground"
                            )}
                        >
                            {filter}
                        </button>
                    ))}
                </div>

                {/* Templates Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTemplates.map((template, index) => (
                        <TemplateCard key={template.id} template={template} index={index} />
                    ))}
                </div>

                {/* Empty State */}
                {filteredTemplates.length === 0 && (
                    <div className="text-center py-20">
                        <p className="text-muted-foreground">No templates found for this filter.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function TemplateCard({ template, index }: { template: any, index: number }) {
    const [copied, setCopied] = useState(false);
    const command = `npx editron init ${template.id}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(command);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 + 0.3 }}
            className="group relative h-full"
        >
            <div className="absolute -inset-0.5 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500" />
            <div className="relative h-full flex flex-col p-6 bg-card border border-border/50 rounded-xl hover:border-red-500/30 transition-colors duration-300">

                <div className="flex justify-between items-start mb-4">
                    <div className={cn("w-14 h-14 rounded-xl flex items-center justify-center border shadow-sm p-3 bg-secondary/50", template.color)}>
                        <Image src={template.icon} alt={template.title} width={40} height={40} className="w-full h-full object-contain" />
                    </div>
                </div>

                <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-red-500 transition-colors">
                    {template.title}
                </h3>

                <p className="text-muted-foreground text-sm mb-6 flex-grow leading-relaxed">
                    {template.description}
                </p>

                <div className="flex flex-wrap gap-2 mb-6">
                    {template.tags.map((tag: string) => (
                        <span key={tag} className="text-xs px-2 py-1 bg-secondary rounded-md text-secondary-foreground font-medium">
                            {tag}
                        </span>
                    ))}
                </div>

                <div className="mt-auto w-full pt-4 border-t border-border/50">
                    <p className="text-xs text-muted-foreground mb-2 font-medium ml-1 uppercase tracking-wider">Installation</p>
                    <div
                        onClick={handleCopy}
                        className="relative flex items-center justify-between px-3 py-2.5 bg-secondary/40 hover:bg-secondary/60 border border-border/50 rounded-lg cursor-pointer group/cmd transition-all active:scale-[0.98]"
                    >
                        <code className="text-xs font-mono text-foreground/80 group-hover/cmd:text-red-500 transition-colors truncate mr-2">
                            {command}
                        </code>
                        <div className="text-muted-foreground/70 group-hover/cmd:text-foreground transition-colors shrink-0">
                            {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
