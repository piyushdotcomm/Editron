"use client";

import { motion } from "framer-motion";
import {
    Folder,
    Star,
    Zap,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface KPIStatsProps {
    stats: {
        totalProjects: number;
        starredProjects: number;
        currentStreak: number;
    };
}

const StatCard = ({ icon: Icon, label, value, color, delay }: any) => (
    <motion.div
        className="min-w-0 w-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay }}
    >
        <Card className="relative min-w-0 w-full overflow-hidden border-border/50 hover:border-border transition-all duration-300 group hover:shadow-lg dark:hover:shadow-primary/5">
            <CardContent className="min-w-0 p-4 sm:p-6">
                {/* Background Icon */}
                <div className={`absolute -right-4 -top-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-300 text-${color}-500 transform rotate-12`}>
                    <Icon size={120} />
                </div>

                {/* Content */}
                <div className="relative z-10 flex min-w-0 flex-col justify-between h-full">
                    <div className="flex items-center justify-between mb-4">
                        <div className={`p-2.5 rounded-xl bg-${color}-500/10 text-${color}-500 ring-1 ring-${color}-500/20`}>
                            <Icon size={20} />
                        </div>
                    </div>

                    <div>
                        <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground whitespace-normal break-words group-hover:scale-105 transition-transform origin-left duration-300">
                            {value}
                        </h3>
                        <p className="text-sm font-medium text-muted-foreground mt-1">{label}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    </motion.div>
);

export default function KPIStats({ stats }: KPIStatsProps) {
    const statItems = [
        { icon: Folder, label: "Total Projects", value: stats.totalProjects, color: "blue" },
        { icon: Star, label: "Starred", value: stats.starredProjects, color: "amber" },
        { icon: Zap, label: "Active Days Streak", value: `${stats.currentStreak} Days`, color: "orange" },
    ];

    return (
        <div className="grid w-full grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
            {statItems.map((item, index) => (
                <StatCard key={index} {...item} delay={index * 0.1} />
            ))}
        </div>
    );
}
