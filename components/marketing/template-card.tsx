"use client";

import type { CSSProperties } from "react";
import type { TemplateSummary } from "@/lib/templates/types";
import { ArrowRight, Code2, Globe2 } from "lucide-react";
import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ICON_PLACEHOLDER =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='28' viewBox='0 0 28 28'%3E%3C/svg%3E";

interface TemplateCardProps {
    template: TemplateSummary;
    featured?: boolean;
}

export function TemplateCard({ template, featured = false }: TemplateCardProps) {
    const iconTileStyle = useMemo<CSSProperties>(
        () => ({
            backgroundColor: getIconTileColor(template.color),
        }),
        [template.color]
    );

    return (
        <div className={cn(
            "group relative flex flex-col p-6 rounded-2xl border bg-card hover:shadow-lg transition-all duration-300",
            featured ? "border-primary/20 bg-primary/5" : "border-border"
        )}>
            {/* Header */}
            <div className="flex items-start justify-between mb-7">
                <div
                    className="relative w-12 h-12 flex items-center justify-center rounded-xl transition-transform group-hover:scale-110"
                    style={iconTileStyle}
                >
                    <IconWithFallback src={template.icon} alt={template.name} />
                </div>

                <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => {
                        const active = template.popularity && i < template.popularity;
                        return (
                            <span key={i} className={`${active ? "text-yellow-400" : "text-muted-foreground"} text-sm`}>
                                {active ? "★" : "☆"}
                            </span>
                        );
                    })}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-bold text-lg">{template.name}</h3>
                    <TemplateTypeIcon template={template} />
                </div>

                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {template.description}
                </p>

                <div className="flex flex-wrap gap-2 mb-4">
                    {template.tags?.slice(0, 3).map((tag) => (
                        <span key={tag} className="text-xs px-2 py-1 bg-muted/20 rounded-full text-muted-foreground">{tag}</span>
                    ))}
                </div>
            </div>

            {/* Footer */}
            <div className="mt-auto pt-4 flex items-center justify-between border-t border-dashed">
                <div className="text-xs text-muted-foreground">{(template.category || "").toUpperCase()}</div>
                <Link href="/dashboard">
                    <Button size="sm" variant="ghost" className="h-8 px-2 text-primary hover:text-primary hover:bg-primary/10 group/btn">
                        Use Template
                        <ArrowRight size={14} className="ml-1 transition-transform group-hover/btn:translate-x-1" />
                    </Button>
                </Link>
            </div>

            {/* Hover Gradient Border */}
            <div
                className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-primary/10 pointer-events-none transition-colors"
                aria-hidden="true"
            />
        </div>
    );
}

function TemplateTypeIcon({ template }: { template: TemplateSummary }) {
    if (template.category === "fullstack") {
        return <Globe2 size={16} className="text-purple-500" aria-hidden="true" />;
    }

    return <Code2 size={16} className="text-blue-500" aria-hidden="true" />;
}

function IconWithFallback({ src, alt }: { src?: string; alt?: string }) {
    const [current, setCurrent] = useState(src || ICON_PLACEHOLDER);

    const tryFallback = () => {
        setCurrent(ICON_PLACEHOLDER);
    };

    return (
        <Image
            src={current}
            alt={alt ?? ""}
            width={28}
            height={28}
            className="object-contain"
            unoptimized
            onError={tryFallback}
        />
    );
}

function getIconTileColor(color?: string) {
    if (!color) {
        return "rgba(233, 63, 63, 0.08)";
    }

    if (/^#[0-9a-f]{6}$/i.test(color)) {
        const red = parseInt(color.slice(1, 3), 16);
        const green = parseInt(color.slice(3, 5), 16);
        const blue = parseInt(color.slice(5, 7), 16);

        return `rgba(${red}, ${green}, ${blue}, 0.12)`;
    }

    return color;
}
