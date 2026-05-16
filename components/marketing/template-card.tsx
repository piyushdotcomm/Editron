"use client";

import type { TemplateSummary } from "@/lib/constants/templates";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TemplateCardProps {
    template: TemplateSummary;
    featured?: boolean;
}

export function TemplateCard({ template, featured = false }: TemplateCardProps) {
    return (
        <div className={cn(
            "group relative flex flex-col p-6 rounded-2xl border bg-card hover:shadow-lg transition-all duration-300",
            featured ? "border-primary/20 bg-primary/5" : "border-border"
        )}>
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div
                    className="relative w-12 h-12 flex items-center justify-center rounded-xl transition-transform group-hover:scale-110"
                    style={{ backgroundColor: "rgba(233, 63, 63, 0.08)" }}
                >
                    <Image
                        src={template.icon}
                        alt={template.name}
                        width={28}
                        height={28}
                        className="object-contain"
                    />
                </div>
            </div>

            {/* Content */}
            <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-bold text-lg">{template.name}</h3>
                </div>

                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {template.description}
                </p>
            </div>

            {/* Footer */}
            <div className="mt-auto pt-4 flex items-center justify-between border-t border-dashed">
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
