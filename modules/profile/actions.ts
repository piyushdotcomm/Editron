"use server";

import { currentUser } from "@/modules/auth/actions";
import { db } from "@/lib/db";
import { Playground, Templates } from "@prisma/client";

export interface ProfileStats {
    totalProjects: number;
    starredProjects: number;
    currentStreak: number;
    techStackDistribution: { name: string; count: number; percentage: number; color: string }[];
    recentActivity: {
        id: string;
        type: "create" | "update" | "star";
        description: string;
        date: Date;
        projectName: string;
    }[];
    heatmapData: { date: string; count: number }[];
    playgrounds: any[];
}

export async function getUserProfileStats(userId?: string): Promise<ProfileStats | null> {
    let id = userId;
    if (!id) {
        const user = await currentUser();
        if (!user?.id) return null;
        id = user.id;
    }

    const playgrounds = await db.playground.findMany({
        where: { userId: id },
        include: {
            Starmark: true,
            // Removed redundant fetching of 'user' for every playground
        },
        orderBy: { updatedAt: 'desc' }
    });

    const starMarks = await db.starMark.findMany({
        where: { userId: id, isMarked: true }
    });

    // Calculate Tech Stack Distribution
    const totalProjects = playgrounds.length;
    const techCounts: Record<string, number> = {};

    playgrounds.forEach(p => {
        techCounts[p.template] = (techCounts[p.template] || 0) + 1;
    });

    const techStackDistribution = Object.entries(techCounts).map(([key, count]) => ({
        name: key,
        count,
        percentage: totalProjects > 0 ? Math.round((count / totalProjects) * 100) : 0,
        color: getTemplateColor(key as Templates)
    }));

    // Generate Activity Log (simplified from project dates)
    const recentActivity = playgrounds.slice(0, 10).map(p => ({
        id: p.id,
        type: "create" as const, // For now, we mainly track existence. We could crudely distinguish if created == updated
        description: `Worked on ${p.title}`,
        date: p.updatedAt,
        projectName: p.title
    }));

    // Generate Heatmap Data
    const heatmapMap = new Map<string, number>();
    playgrounds.forEach(p => {
        const dateKey = p.createdAt.toISOString().split('T')[0];
        heatmapMap.set(dateKey, (heatmapMap.get(dateKey) || 0) + 1);

        // Also count updates if distinct day? (Optional, kept simple for now)
        const updateKey = p.updatedAt.toISOString().split('T')[0];
        if (updateKey !== dateKey) {
            heatmapMap.set(updateKey, (heatmapMap.get(updateKey) || 0) + 1);
        }
    });

    const heatmapData = Array.from(heatmapMap.entries()).map(([date, count]) => ({
        date,
        count
    }));

    return {
        totalProjects,
        starredProjects: starMarks.length,
        currentStreak: 1, // Default to 1 for now
        techStackDistribution,
        recentActivity,
        heatmapData,
        playgrounds
    };
}

function getTemplateColor(template: Templates): string {
    switch (template) {
        case 'REACT': return '#61DAFB';
        case 'NEXTJS': return '#000000';
        case 'VUE': return '#42b883';
        case 'ANGULAR': return '#dd1b16';
        case 'HONO': return '#E36002';
        case 'EXPRESS': return '#000000';
        default: return '#888888';
    }
}
