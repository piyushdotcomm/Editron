"use client";

import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface UsageAnalyticsProps {
    activityData: { date: string; count: number }[];
    techStack: { name: string; percentage: number; color: string }[];
}

export default function UsageAnalytics({ activityData, techStack }: UsageAnalyticsProps) {
    const totalActivity = activityData.reduce((sum, item) => sum + item.count, 0);
    const topTech = [...techStack].sort((a, b) => b.percentage - a.percentage)[0];

    return (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card className="rounded-lg border-[#ebebeb] bg-white shadow-[0_1px_1px_rgba(0,0,0,0.02),0_2px_2px_rgba(0,0,0,0.04)] dark:border-border dark:bg-card">
                <CardHeader className="gap-1 border-b border-[#ebebeb] p-5 dark:border-border">
                    <p className="font-mono text-[11px] uppercase tracking-normal text-[#888888] dark:text-muted-foreground">
                        Activity
                    </p>
                    <CardTitle className="text-xl font-semibold tracking-normal text-[#171717] dark:text-foreground">
                        Project activity
                    </CardTitle>
                    <p className="text-sm text-[#4d4d4d] dark:text-muted-foreground">
                        {totalActivity > 0
                            ? `${totalActivity} total project events across ${activityData.length} active days.`
                            : "No project activity has been recorded yet."}
                    </p>
                    <p className="sr-only">
                        Activity chart with {activityData.length} data points and {totalActivity} total events.
                    </p>
                </CardHeader>
                <CardContent className="p-5">
                    <div className="h-[280px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={activityData} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorActivity" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.34} />
                                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                                <CartesianGrid vertical={false} stroke="#ebebeb" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px" }}
                                    itemStyle={{ color: "hsl(var(--foreground))" }}
                                />
                                <Area type="monotone" dataKey="count" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorActivity)" name="Events" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            <Card className="rounded-lg border-[#ebebeb] bg-white shadow-[0_1px_1px_rgba(0,0,0,0.02),0_2px_2px_rgba(0,0,0,0.04)] dark:border-border dark:bg-card">
                <CardHeader className="gap-1 border-b border-[#ebebeb] p-5 dark:border-border">
                    <p className="font-mono text-[11px] uppercase tracking-normal text-[#888888] dark:text-muted-foreground">
                        Templates
                    </p>
                    <CardTitle className="text-xl font-semibold tracking-normal text-[#171717] dark:text-foreground">
                        Tech stack usage
                    </CardTitle>
                    <p className="text-sm text-[#4d4d4d] dark:text-muted-foreground">
                        {topTech
                            ? `${topTech.name} leads this workspace at ${topTech.percentage}%.`
                            : "Create projects to see template distribution."}
                    </p>
                    <p className="sr-only">
                        Tech stack chart with {techStack.length} template categories.
                    </p>
                </CardHeader>
                <CardContent className="p-5">
                    <div className="h-[280px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={techStack} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                                <CartesianGrid horizontal={true} vertical={false} stroke="#ebebeb" />
                                <XAxis type="number" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis dataKey="name" type="category" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} width={92} />
                                <Tooltip
                                    cursor={{ fill: "transparent" }}
                                    contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px" }}
                                    itemStyle={{ color: "hsl(var(--foreground))" }}
                                />
                                <Bar dataKey="percentage" fill="#171717" radius={[0, 4, 4, 0]} barSize={28} name="Usage %" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
