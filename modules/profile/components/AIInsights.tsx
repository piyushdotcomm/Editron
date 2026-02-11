"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from "recharts";
import { Sparkles, ArrowRight, MessageSquare, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AIInsights() {
    const data = [
        { name: 'Refactoring', value: 45, color: '#8884d8' },
        { name: 'New Features', value: 30, color: '#82ca9d' },
        { name: 'Debugging', value: 15, color: '#ffc658' },
        { name: 'Documentation', value: 10, color: '#ff8042' },
    ];

    return (
        <Card className="bg-card border-border/50 h-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Sparkles className="text-purple-500" size={18} />
                    AI Insights
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <MessageSquare size={14} /> Total Sessions
                    </div>
                    <span className="font-bold text-lg">1,243</span>
                </div>

                <div className="h-[180px] w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={50}
                                outerRadius={70}
                                paddingAngle={5}
                                dataKey="value"
                                stroke="none"
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <RechartsTooltip
                                contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                                itemStyle={{ color: 'hsl(var(--foreground))' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                        <span className="text-2xl font-bold block leading-none">87%</span>
                        <span className="text-[10px] uppercase text-muted-foreground tracking-widest block mt-1">Acceptance</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                    {data.map((item) => (
                        <div key={item.name} className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                            <span className="text-muted-foreground flex-1 truncate">{item.name}</span>
                            <span className="font-medium">{item.value}%</span>
                        </div>
                    ))}
                </div>

                <div className="pt-4 border-t border-border/50">
                    <h4 className="text-sm font-semibold mb-2">Recommendation</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed flex items-start gap-2">
                        <CheckCircle size={14} className="text-emerald-500 mt-0.5 shrink-0" />
                        Try using longer context prompts for complex refactoring tasks to improve accuracy by ~15%.
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
