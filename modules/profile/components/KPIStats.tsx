"use client";

import { Folder, Star, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface KPIStatsProps {
    stats: {
        totalProjects: number;
        starredProjects: number;
        currentStreak: number;
    };
}

type StatItem = {
    icon: typeof Folder;
    label: string;
    value: string | number;
    helper: string;
    accent: string;
};

const statAccent = {
    ink: "bg-[#171717] text-white border-[#171717] dark:bg-white dark:text-[#171717] dark:border-white",
    red: "bg-red-50 text-red-700 border-red-100 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900/60",
    amber: "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/60",
};

const StatCard = ({ icon: Icon, label, value, helper, accent }: StatItem) => (
    <Card className="overflow-hidden rounded-lg border-[#ebebeb] bg-white shadow-[0_1px_1px_rgba(0,0,0,0.02),0_2px_2px_rgba(0,0,0,0.04)] dark:border-border dark:bg-card">
        <CardContent className="p-5">
            <div className="mb-6 flex items-start justify-between gap-4">
                <p className="font-mono text-[11px] uppercase tracking-normal text-[#888888] dark:text-muted-foreground">
                    {label}
                </p>
                <span
                    className={cn(
                        "inline-flex h-8 w-8 items-center justify-center rounded-md border",
                        statAccent[accent as keyof typeof statAccent],
                    )}
                >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
            </div>
            <div className="space-y-1">
                <p className="text-3xl font-semibold leading-none tracking-normal text-[#171717] dark:text-foreground">
                    {value}
                </p>
                <p className="text-sm text-[#4d4d4d] dark:text-muted-foreground">{helper}</p>
            </div>
        </CardContent>
    </Card>
);

export default function KPIStats({ stats }: KPIStatsProps) {
    const statItems: StatItem[] = [
        {
            icon: Folder,
            label: "Projects",
            value: stats.totalProjects,
            helper: "Total workspaces created",
            accent: "ink",
        },
        {
            icon: Star,
            label: "Starred",
            value: stats.starredProjects,
            helper: "Pinned for quick access",
            accent: "amber",
        },
        {
            icon: Zap,
            label: "Active streak",
            value: `${stats.currentStreak} ${stats.currentStreak === 1 ? "day" : "days"}`,
            helper: "Consecutive active project days",
            accent: "red",
        },
    ];

    return (
        <dl className="grid w-full grid-cols-1 gap-4 md:grid-cols-3">
            {statItems.map((item) => (
                <div key={item.label}>
                    <StatCard {...item} />
                </div>
            ))}
        </dl>
    );
}
