"use client";

import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, Copy, Terminal } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";

// Mock data based on editron-starters directory
const templates = [
    {
        id: "react-vite",
        title: "React",
        description: "A JavaScript library for building user interfaces with component-based architecture",
        tags: ["UI", "Frontend", "JavaScript"],
        icon: "R",
        color: "bg-blue-500 text-white",
    },
    {
        id: "nextjs",
        title: "Next.js",
        description: "The React framework for production with server-side rendering and static site generation",
        tags: ["React", "SSR", "Fullstack"],
        icon: "N",
        color: "bg-black text-white dark:bg-white dark:text-black",
    },
    {
        id: "express",
        title: "Express",
        description: "Fast, unopinionated, minimalist web framework for Node.js to build APIs and web applications",
        tags: ["Node.js", "API", "Backend"],
        icon: "E",
        color: "bg-gray-500 text-white",
    },
    {
        id: "vue",
        title: "Vue.js",
        description: "Progressive JavaScript framework for building user interfaces with an approachable learning curve",
        tags: ["UI", "Frontend", "JavaScript"],
        icon: "V",
        color: "bg-emerald-500 text-white",
    },
    {
        id: "hono",
        title: "Hono",
        description: "Fast, lightweight, built on Web Standards. Support for any JavaScript runtime.",
        tags: ["Node.js", "TypeScript", "Backend"],
        icon: "H",
        color: "bg-orange-400 text-white",
    },
    {
        id: "angular",
        title: "Angular",
        description: "Angular is a web framework that empowers developers to build fast, reliable applications.",
        tags: ["Angular", "Fullstack", "JavaScript"],
        icon: "A",
        color: "bg-red-600 text-white",
    },
];

export default function TemplatesPage() {
    const [activeFilter, setActiveFilter] = useState("All");
    const filters = ["All", "React", "Vue", "Svelte", "Backend"];

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
                    <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center text-xl font-bold shadow-sm", template.color)}>
                        {template.icon}
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

                <Link href={`https://github.com/editron/${template.id}`} className="w-full mt-auto">
                    <Button variant="outline" className="w-full group-hover:bg-red-500 group-hover:text-white group-hover:border-red-500 transition-all duration-300">
                        Use Template
                        <ArrowUpRight className="w-4 h-4 ml-2" />
                    </Button>
                </Link>
            </div>
        </motion.div>
    );
}
