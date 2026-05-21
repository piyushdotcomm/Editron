"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { TemplateSummary } from "@/lib/templates/types";
import { TemplateCard } from "@/components/marketing/template-card";

interface TemplateGridProps {
    templates: TemplateSummary[];
}

export function TemplateGrid({ templates }: TemplateGridProps) {
    const [searchQuery, setSearchQuery] = useState("");

    const filteredTemplates = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();

        if (!query) {
            return templates;
        }

        return templates.filter((template) => {
            const searchableText = [
                template.name,
                template.description,
                ...(template.tags ?? []),
                template.category ?? "",
            ]
                .join(" ")
                .toLowerCase();

            return searchableText.includes(query);
        });
    }, [searchQuery, templates]);

    return (
        <>
            <div className="max-w-7xl mx-auto px-4 mb-12 space-y-6">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                        <Input
                            placeholder="Search frameworks, languages, tags..."
                            className="pl-10 h-12 bg-background/50 backdrop-blur-sm"
                            value={searchQuery}
                            onChange={(event) => setSearchQuery(event.target.value)}
                        />
                    </div>
                </div>
            </div>

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
                        <p className="text-muted-foreground mt-2">Try adjusting your search query.</p>
                        <Button
                            variant="link"
                            onClick={() => {
                                setSearchQuery("");
                            }}
                            className="mt-4"
                        >
                            Clear all filters
                        </Button>
                    </div>
                )}
            </div>
        </>
    );
}
