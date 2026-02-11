"use client";

import {
    FileCode,
    Terminal,
    UploadCloud,
    Package,
    PlusCircle,
    Monitor,
    Star
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
            case 'create': return <PlusCircle size={14} className="text-blue-500" />;
            case 'update': return <FileCode size={14} className="text-purple-500" />;
            case 'star': return <Star size={14} className="text-amber-500" />;
            default: return <FileCode size={14} />;
        }
    };

    // Limit to 5 most recent activities
    const recentActivities = activities.slice(0, 5);

    return (
        <Card className="border-border/50">
            <CardHeader>
                <CardTitle className="text-lg">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5">
                <div className="relative border-l border-border/50 ml-2 space-y-4">
                    {recentActivities.length === 0 ? (
                        <div className="text-sm text-muted-foreground ml-5">No recent activity found.</div>
                    ) : (
                        recentActivities.map((activity) => (
                            <div key={activity.id} className="ml-5 relative group">
                                <span className="absolute -left-[26px] top-0.5 flex items-center justify-center w-6 h-6 rounded-full bg-background border border-border group-hover:border-primary/50 group-hover:scale-110 transition-all duration-300 z-10">
                                    {getIcon(activity.type)}
                                </span>

                                <div className="flex flex-col gap-0.5">
                                    <div className="flex items-baseline justify-between gap-2">
                                        <h4 className="text-sm font-medium text-foreground line-clamp-1">
                                            {activity.description}
                                        </h4>
                                        <span className="text-[10px] text-muted-foreground whitespace-nowrap flex-shrink-0">
                                            {formatDistanceToNow(new Date(activity.date), { addSuffix: true })}
                                        </span>
                                    </div>

                                    {activity.projectName && (
                                        <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                                            in <span className="font-mono text-[10px] bg-secondary px-1.5 py-0.5 rounded text-secondary-foreground">{activity.projectName}</span>
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {activities.length > 5 && (
                    <div className="mt-4 text-center">
                        <Button variant="ghost" size="sm" className="text-xs h-8">
                            View all {activities.length} activities
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
