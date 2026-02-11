"use client";

import { motion } from "framer-motion";
import { ExternalLink, Star, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

interface ProjectCardProps {
    project: {
        id: string;
        title: string;
        description?: string;
        template: string;
        updatedAt: Date;
        Starmark?: Array<{ isMarked: boolean }>;
    };
}

export default function ProjectCard({ project }: ProjectCardProps) {
    const isStarred = project.Starmark?.[0]?.isMarked || false;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            className="group relative"
        >
            <Link href={`/playground/${project.id}`}>
                <div className="relative overflow-hidden rounded-xl border border-border/50 bg-card p-6 transition-all duration-300 hover:border-red-500/50 hover:shadow-lg hover:shadow-red-500/10">
                    {/* Starred indicator */}
                    {isStarred && (
                        <div className="absolute top-4 right-4">
                            <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                        </div>
                    )}

                    {/* Template badge */}
                    <div className="mb-3">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-red-500/10 text-red-500 border border-red-500/20">
                            {project.template}
                        </span>
                    </div>

                    {/* Project title */}
                    <h3 className="text-lg font-bold text-foreground mb-2 line-clamp-1 group-hover:text-red-500 transition-colors">
                        {project.title}
                    </h3>

                    {/* Project description */}
                    {project.description && (
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                            {project.description}
                        </p>
                    )}

                    {/* Footer with timestamp */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true })}</span>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>

                    {/* Hover gradient effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-red-500/0 via-red-500/0 to-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-xl" />
                </div>
            </Link>
        </motion.div>
    );
}
