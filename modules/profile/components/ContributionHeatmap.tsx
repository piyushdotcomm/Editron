"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface HeatmapData {
    date: string;
    count: number;
}

export default function ContributionHeatmap({ data }: { data: HeatmapData[] }) {
    const [view, setView] = useState<"year" | "month">("year");

    // Calculate intensity 0-4
    const maxCount = Math.max(...(data?.map(d => d.count) || [0]), 1);

    const getIntensity = (count: number) => {
        if (count === 0) return 0;
        if (count >= maxCount) return 4;
        if (count >= maxCount * 0.75) return 3;
        if (count >= maxCount * 0.5) return 2;
        return 1;
    };

    const getIntensityColor = (intensity: number) => {
        switch (intensity) {
            case 0: return "bg-secondary";
            case 1: return "bg-red-900/40 border border-red-900/50";
            case 2: return "bg-red-700/60 border border-red-700/70";
            case 3: return "bg-red-500/80 border border-red-500/90";
            case 4: return "bg-red-400 border border-red-300 shadow-[0_0_8px_rgba(239,68,68,0.5)]";
            default: return "bg-secondary";
        }
    };

    // Create a full year grid filling in missing dates
    const generateFullYearData = () => {
        const today = new Date();
        const fullData = [];
        const dataMap = new Map(data?.map(d => [d.date, d.count]) || []);

        for (let i = 364; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            fullData.push({
                date: dateStr,
                count: dataMap.get(dateStr) || 0
            });
        }
        return fullData;
    };

    const displayData = generateFullYearData();

    const weeks = [];
    const daysInWeek = 7;

    // Group into weeks (vertical columns)
    for (let i = 0; i < displayData.length; i += daysInWeek) {
        weeks.push(displayData.slice(i, i + daysInWeek));
    }

    return (
        <Card className="border-border/50">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-lg">Contribution Activity</CardTitle>
                        <CardDescription>
                            {data?.reduce((acc, curr) => acc + curr.count, 0) || 0} contributions in the last year
                        </CardDescription>
                    </div>

                    <div className="flex gap-2">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <span>Less</span>
                            <div className="w-3 h-3 rounded-sm bg-secondary"></div>
                            <div className="w-3 h-3 rounded-sm bg-red-900/40"></div>
                            <div className="w-3 h-3 rounded-sm bg-red-700/60"></div>
                            <div className="w-3 h-3 rounded-sm bg-red-500/80"></div>
                            <div className="w-3 h-3 rounded-sm bg-red-400"></div>
                            <span>More</span>
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="w-full overflow-x-auto pb-2">
                    <div className="flex gap-1 min-w-max">
                        {weeks.map((week, wIndex) => (
                            <div key={wIndex} className="flex flex-col gap-1">
                                {week.map((day, dIndex) => (
                                    <TooltipProvider key={`${wIndex}-${dIndex}`}>
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <motion.div
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    transition={{ delay: (wIndex * 0.01) + (dIndex * 0.005) }}
                                                    className={`w-3.5 h-3.5 rounded-sm ${getIntensityColor(getIntensity(day.count))} hover:ring-2 ring-red-500/50 transition-all cursor-pointer`}
                                                />
                                            </TooltipTrigger>
                                            <TooltipContent className="bg-popover border-border p-3 rounded-lg shadow-xl">
                                                <div className="text-xs font-semibold mb-1">{new Date(day.date).toDateString()}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    {day.count} contributions
                                                </div>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
