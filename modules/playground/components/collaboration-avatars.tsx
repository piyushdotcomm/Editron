"use client";
import { useEffect, useState } from "react";
import { getOrCreateYDoc } from "@/lib/yjs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function CollaborationAvatars({ playgroundId }: { playgroundId: string }) {
    const [users, setUsers] = useState<any[]>([]);

    useEffect(() => {
        if (!playgroundId) return;
        const { provider } = getOrCreateYDoc(playgroundId);

        const updateUsers = () => {
            const states = Array.from(provider.awareness.getStates().values());
            const activeUsers = states.filter(s => s.user).map(s => s.user);

            // Deduplicate by name just in case a user has multiple tabs
            const uniqueUsers = Array.from(new Map(activeUsers.map(u => [u.name, u])).values());
            setUsers(uniqueUsers);
        };

        provider.awareness.on("change", updateUsers);
        updateUsers();

        return () => {
            provider.awareness.off("change", updateUsers);
        };
    }, [playgroundId]);

    if (users.length <= 1) return null; // Don't show avatars if you are the only one

    return (
        <div className="flex items-center -space-x-2 mr-2">
            {users.slice(0, 4).map((u, i) => (
                <TooltipProvider key={i}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div
                                className="w-8 h-8 rounded-full border-2 border-background flex items-center justify-center text-xs font-bold text-white shadow-sm cursor-default"
                                style={{ backgroundColor: u.color }}
                            >
                                {u.name.charAt(0).toUpperCase()}
                            </div>
                        </TooltipTrigger>
                        <TooltipContent>{u.name}</TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            ))}
            {users.length > 4 && (
                <div className="w-8 h-8 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs font-bold shadow-sm">
                    +{users.length - 4}
                </div>
            )}
        </div>
    );
}
