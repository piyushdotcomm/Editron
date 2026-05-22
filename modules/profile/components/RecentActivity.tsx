"use client";

import {
    FileCode,
    Clock3,
    Star,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ActivityItem {
    id: string;
    type: "create" | "update" | "star";
    description: string;
    date: Date;
    projectName: string;
}

export default function RecentActivity({ activities }: { activities: ActivityItem[] }) {
    const getIcon = (type: string) => {
        switch (type) {
            case 'create': return <FileCode size={14} className="text-red-500" />;
            case 'update': return <Clock3 size={14} className="text-red-500" />;
            case 'star': return <Star size={14} className="text-amber-500" />;
            default: return <FileCode size={14} />;
        }
    };

    // Limit to 5 most recent activities
    const recentActivities = activities.slice(0, 5);

    return (
        <Card className="rounded-lg border-[#ebebeb] bg-white shadow-[0_1px_1px_rgba(0,0,0,0.02),0_2px_2px_rgba(0,0,0,0.04)] dark:border-border dark:bg-card">
            <CardHeader className="gap-1 border-b border-[#ebebeb] p-5 dark:border-border">
                <p className="font-mono text-[11px] uppercase tracking-normal text-[#888888] dark:text-muted-foreground">
                    Timeline
                </p>
                <CardTitle className="text-xl font-semibold tracking-normal text-[#171717] dark:text-foreground">
                    Recently updated
                </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
                <div className="relative ml-2 space-y-5 border-l border-[#ebebeb] dark:border-border">
                    {recentActivities.length === 0 ? (
                        <div className="ml-5 text-sm text-[#888888] dark:text-muted-foreground">No updated projects yet.</div>
                    ) : (
                        recentActivities.map((activity) => (
                            <div key={activity.id} className="ml-5 relative group">
                                <span className="absolute -left-[26px] top-0.5 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-[#ebebeb] bg-white transition group-hover:border-[#171717] dark:border-border dark:bg-card dark:group-hover:border-foreground">
                                    {getIcon(activity.type)}
                                </span>

                                <div className="flex flex-col gap-0.5">
                                    <div className="flex items-baseline justify-between gap-2">
                                        <h4 className="line-clamp-1 text-sm font-medium text-[#171717] dark:text-foreground">
                                            {activity.description}
                                        </h4>
                                        <span className="flex-shrink-0 whitespace-nowrap font-mono text-[10px] text-[#888888] dark:text-muted-foreground">
                                            {formatDistanceToNow(new Date(activity.date), { addSuffix: true })}
                                        </span>
                                    </div>

                                    {activity.projectName && (
                                        <p className="flex items-center gap-1 text-[11px] text-[#888888] dark:text-muted-foreground">
                                            in <span className="rounded border border-[#ebebeb] bg-[#fafafa] px-1.5 py-0.5 font-mono text-[10px] text-[#4d4d4d] dark:border-border dark:bg-muted/30 dark:text-muted-foreground">{activity.projectName}</span>
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {activities.length > 5 && (
                    <div className="mt-4 text-center">
                        <Button variant="ghost" size="sm" className="h-8 text-xs">
                            View all {activities.length} activities
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
