"use client";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface HeatmapData {
    date: string;
    count: number;
}

const intensityClasses = [
    "bg-[#f5f5f5] border-[#ebebeb] dark:bg-muted/30 dark:border-border",
    "bg-red-50 border-red-100 dark:bg-red-950/30 dark:border-red-900/40",
    "bg-red-100 border-red-200 dark:bg-red-900/40 dark:border-red-800/60",
    "bg-red-300 border-red-400 dark:bg-red-700/60 dark:border-red-600",
    "bg-red-500 border-red-500 dark:bg-red-400 dark:border-red-300",
];

export default function ContributionHeatmap({ data }: { data: HeatmapData[] }) {
    const totalContributions = data?.reduce((acc, curr) => acc + curr.count, 0) || 0;
    const maxCount = Math.max(...(data?.map((d) => d.count) || [0]), 1);

    const getIntensity = (count: number) => {
        if (count === 0) return 0;
        if (count >= maxCount) return 4;
        if (count >= maxCount * 0.75) return 3;
        if (count >= maxCount * 0.5) return 2;
        return 1;
    };

    const generateFullYearData = () => {
        const today = new Date();
        const fullData = [];
        const dataMap = new Map(data?.map((d) => [d.date, d.count]) || []);

        for (let i = 364; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split("T")[0];
            fullData.push({
                date: dateStr,
                count: dataMap.get(dateStr) || 0,
            });
        }
        return fullData;
    };

    const displayData = generateFullYearData();
    const weeks = [];
    const daysInWeek = 7;

    for (let i = 0; i < displayData.length; i += daysInWeek) {
        weeks.push(displayData.slice(i, i + daysInWeek));
    }

    return (
        <Card className="rounded-lg border-[#ebebeb] bg-white shadow-[0_1px_1px_rgba(0,0,0,0.02),0_2px_2px_rgba(0,0,0,0.04)] dark:border-border dark:bg-card">
            <CardHeader className="gap-2 border-b border-[#ebebeb] p-5 dark:border-border">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-1">
                        <p className="font-mono text-[11px] uppercase tracking-normal text-[#888888] dark:text-muted-foreground">
                            Activity map
                        </p>
                        <CardTitle className="text-xl font-semibold tracking-normal text-[#171717] dark:text-foreground">
                            Contribution activity
                        </CardTitle>
                        <p className="text-sm text-[#4d4d4d] dark:text-muted-foreground">
                            {totalContributions} project events recorded across the last year.
                        </p>
                    </div>

                    <div className="flex items-center gap-1 text-xs text-[#888888] dark:text-muted-foreground">
                        <span>Less</span>
                        {intensityClasses.map((className, index) => (
                            <span
                                key={index}
                                className={cn("h-3 w-3 rounded-[3px] border", className)}
                                aria-hidden="true"
                            />
                        ))}
                        <span>More</span>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-5">
                <p className="sr-only">
                    Activity heatmap with {totalContributions} total contributions. Each day can be focused to read the date and count.
                </p>
                <div className="w-full overflow-x-auto pb-2">
                    <div className="flex min-w-max gap-1">
                        {weeks.map((week, wIndex) => (
                            <div key={wIndex} className="flex flex-col gap-1">
                                {week.map((day, dIndex) => {
                                    const label = `${new Date(day.date).toDateString()}: ${day.count} contributions`;

                                    return (
                                        <TooltipProvider key={`${wIndex}-${dIndex}`}>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <button
                                                        type="button"
                                                        aria-label={label}
                                                        className={cn(
                                                            "h-3.5 w-3.5 rounded-[3px] border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 dark:focus-visible:ring-red-300",
                                                            intensityClasses[getIntensity(day.count)],
                                                        )}
                                                    />
                                                </TooltipTrigger>
                                                <TooltipContent className="rounded-md border-[#ebebeb] bg-white p-3 text-[#171717] shadow-[0_8px_16px_-4px_rgba(0,0,0,0.08)] dark:border-border dark:bg-popover dark:text-popover-foreground">
                                                    <div className="text-xs font-semibold">{new Date(day.date).toDateString()}</div>
                                                    <div className="text-xs text-[#888888] dark:text-muted-foreground">
                                                        {day.count} contributions
                                                    </div>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
