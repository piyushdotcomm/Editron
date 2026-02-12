"use client";

import { TemplateOption } from "@/lib/constants/templates";
import {
    Code,
    Server,
    Globe,
    Terminal,
    Star,
    ArrowRight,
    Check
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface TemplateCardProps {
    template: TemplateOption;
    featured?: boolean;
}

export function TemplateCard({ template, featured = false }: TemplateCardProps) {
    const Icon = template.category === "frontend" ? Code :
        template.category === "backend" ? Server :
            template.category === "fullstack" ? Globe :
                Terminal;

    const categoryColor = template.category === "frontend" ? "text-blue-500" :
        template.category === "backend" ? "text-green-500" :
            template.category === "fullstack" ? "text-purple-500" :
                "text-orange-500";

    return (
        <div className={cn(
            "group relative flex flex-col p-6 rounded-2xl border bg-card hover:shadow-lg transition-all duration-300",
            featured ? "border-primary/20 bg-primary/5" : "border-border"
        )}>
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div
                    className="relative w-12 h-12 flex items-center justify-center rounded-xl transition-transform group-hover:scale-110"
                    style={{ backgroundColor: `${template.color}15` }}
                >
                    <Image
                        src={template.icon}
                        alt={template.name}
                        width={28}
                        height={28}
                        className="object-contain"
                    />
                </div>
                <div className="flex gap-1">
                    {Array(template.popularity).fill(0).map((_, i) => (
                        <Star key={i} size={12} className="fill-yellow-400 text-yellow-400" />
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-bold text-lg">{template.name}</h3>
                    <Icon size={14} className={categoryColor} />
                </div>

                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {template.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                    {template.tags.slice(0, 3).map(tag => (
                        <Badge key={tag} variant="secondary" className="text-[10px] h-5 px-2">
                            {tag}
                        </Badge>
                    ))}
                </div>
            </div>

            {/* Footer */}
            <div className="mt-auto pt-4 flex items-center justify-between border-t border-dashed">
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                    {template.category}
                </span>

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
