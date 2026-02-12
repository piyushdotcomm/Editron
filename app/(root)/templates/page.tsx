"use client";

import { useState } from "react";
import { templates, TemplateOption } from "@/lib/constants/templates";
import { TemplateCard } from "@/components/marketing/template-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, Sparkles } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import AnimatedShaderBackground from "@/components/ui/animated-shader-background";

export default function TemplatesPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [category, setCategory] = useState<"all" | "frontend" | "backend" | "fullstack" | "tooling">("all");

    const filteredTemplates = templates.filter((template) => {
        const matchesSearch =
            template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            template.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesCategory = category === "all" || template.category === category;

        return matchesCategory && matchesSearch;
    });

    return (
        <div className="min-h-screen bg-background">
            <AnimatedShaderBackground />

            {/* Header */}
            <div className="relative pt-32 pb-16 px-4 text-center space-y-4">
                <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm text-primary backdrop-blur-md mb-4">
                    <Sparkles size={14} className="mr-2" />
                    <span className="font-medium">35+ Production-Ready Templates</span>
                </div>
                <h1 className="text-4xl md:text-6xl font-black tracking-tight">
                    Start with a <span className="text-primary">Superpower</span>
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    Choose from our curated collection of templates covering everything from simple static sites to full-stack AI applications.
                </p>
            </div>

            {/* Filters */}
            <div className="max-w-7xl mx-auto px-4 mb-12 space-y-6">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                        <Input
                            placeholder="Search frameworks, languages, tags..."
                            className="pl-10 h-12 bg-background/50 backdrop-blur-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <Tabs defaultValue="all" onValueChange={(v) => setCategory(v as any)} className="w-full md:w-auto">
                        <TabsList className="w-full md:w-auto h-12 p-1 bg-background/50 backdrop-blur-sm border">
                            <TabsTrigger value="all" className="px-4">All</TabsTrigger>
                            <TabsTrigger value="frontend" className="px-4">Frontend</TabsTrigger>
                            <TabsTrigger value="backend" className="px-4">Backend</TabsTrigger>
                            <TabsTrigger value="fullstack" className="px-4">Fullstack</TabsTrigger>
                            <TabsTrigger value="tooling" className="px-4">Tooling</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>
            </div>

            {/* Grid */}
            <div className="max-w-7xl mx-auto px-4 pb-24">
                {filteredTemplates.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredTemplates.map((template) => (
                            <TemplateCard key={template.id} template={template} />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                            <Search size={32} className="text-muted-foreground" />
                        </div>
                        <h3 className="text-xl font-bold">No templates found</h3>
                        <p className="text-muted-foreground mt-2">Try adjusting your search or category filter.</p>
                        <Button
                            variant="link"
                            onClick={() => { setSearchQuery(""); setCategory("all"); }}
                            className="mt-4"
                        >
                            Clear all filters
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
