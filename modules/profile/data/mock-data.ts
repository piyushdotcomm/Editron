export interface UserProfile {
    name: string;
    email: string;
    avatar: string;
    plan: string;
    joinDate: string;
    location: string;
    website: string;
    bio: string;
    socials: {
        github: string;
        twitter: string;
        linkedin: string;
    };
    stats: {
        totalProjects: number;
        starredProjects: number;
        aiPromptsUsed: number;
        totalRuntimeHours: number;
        totalDeployments: number;
        storageUsed: string; // e.g. "1.2 GB"
        currentStreak: number;
        longestStreak: number;
        productivityScore: number;
    };
}

export interface ContributionDay {
    date: string;
    count: number;
    intensity: 0 | 1 | 2 | 3 | 4;
    details: {
        aiPrompts: number;
        filesEdited: number;
        runtimeMinutes: number;
    }
}

export interface UsageData {
    date: string;
    aiUsage: number;
    runtimeHours: number;
    projectActivity: number;
}

export interface TechStackData {
    name: string;
    usage: number; // percentage
    projectCount: number;
    color: string;
}

export interface Project {
    id: string;
    name: string;
    description: string;
    techStack: string[];
    lastUpdated: string;
    isPublic: boolean;
    isStarred: boolean;
    status: 'active' | 'archived';
}

export interface RuntimeEnvironment {
    id: string;
    projectName: string;
    status: 'running' | 'stopped' | 'building';
    cpuUsage: number; // percentage
    memoryUsage: number; // MB
    port: number;
    uptime: string;
}

export interface ActivityItem {
    id: string;
    type: 'file_edit' | 'ai_prompt' | 'deployment' | 'dependency' | 'project_create' | 'runtime';
    description: string;
    projectName?: string;
    timestamp: string;
}

// Mock Data Implementation

export const mockUser: UserProfile = {
    name: "Alex Developer",
    email: "alex@editron.dev",
    avatar: "/placeholder.svg",
    plan: "Pro",
    joinDate: "September 2023",
    location: "San Francisco, CA",
    website: "https://alex.dev",
    bio: "Full-stack developer passionate about AI and creative coding.",
    socials: {
        github: "alexdev",
        twitter: "alexcodes",
        linkedin: "alex-developer"
    },
    stats: {
        totalProjects: 12,
        starredProjects: 5,
        aiPromptsUsed: 1243,
        totalRuntimeHours: 342,
        totalDeployments: 28,
        storageUsed: "4.2 GB",
        currentStreak: 14,
        longestStreak: 32,
        productivityScore: 87
    }
};

// Generate 365 days of contribution data
export const generateContributionData = (): ContributionDay[] => {
    const data: ContributionDay[] = [];
    const today = new Date();

    for (let i = 365; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);

        // Random activity level logic
        const baseActivity = Math.random();
        let count = 0;
        let intensity: 0 | 1 | 2 | 3 | 4 = 0;

        if (baseActivity > 0.9) { count = Math.floor(Math.random() * 20) + 10; intensity = 4; }
        else if (baseActivity > 0.7) { count = Math.floor(Math.random() * 10) + 5; intensity = 3; }
        else if (baseActivity > 0.5) { count = Math.floor(Math.random() * 5) + 2; intensity = 2; }
        else if (baseActivity > 0.3) { count = Math.floor(Math.random() * 2) + 1; intensity = 1; }

        data.push({
            date: date.toISOString().split('T')[0],
            count,
            intensity,
            details: {
                aiPrompts: Math.floor(count * 0.4),
                filesEdited: Math.floor(count * 0.5),
                runtimeMinutes: count * 15
            }
        });
    }
    return data;
};

export const mockUsageData: UsageData[] = [
    // Last 7 days mock
    { date: 'Mon', aiUsage: 45, runtimeHours: 2.5, projectActivity: 12 },
    { date: 'Tue', aiUsage: 62, runtimeHours: 3.8, projectActivity: 18 },
    { date: 'Wed', aiUsage: 38, runtimeHours: 1.2, projectActivity: 8 },
    { date: 'Thu', aiUsage: 75, runtimeHours: 4.5, projectActivity: 24 },
    { date: 'Fri', aiUsage: 89, runtimeHours: 5.2, projectActivity: 32 },
    { date: 'Sat', aiUsage: 24, runtimeHours: 6.8, projectActivity: 15 },
    { date: 'Sun', aiUsage: 12, runtimeHours: 1.5, projectActivity: 5 },
];

export const mockTechStack: TechStackData[] = [
    { name: 'Node.js', usage: 45, projectCount: 5, color: '#339933' }, // Node green
    { name: 'React', usage: 30, projectCount: 4, color: '#61DAFB' },   // React blue
    { name: 'Next.js', usage: 15, projectCount: 2, color: '#000000' }, // Next black
    { name: 'Express', usage: 10, projectCount: 1, color: '#000000' }, // Express black/gray
];

export const mockProjects: Project[] = [
    { id: '1', name: 'editron-dashboard', description: 'Internal dashboard for Editron analytics', techStack: ['Next.js', 'React', 'Tailwind'], lastUpdated: '2 hours ago', isPublic: false, isStarred: true, status: 'active' },
    { id: '2', name: 'api-gateway', description: 'Main API gateway service', techStack: ['Node.js', 'Express', 'Redis'], lastUpdated: '1 day ago', isPublic: false, isStarred: true, status: 'active' },
    { id: '3', name: 'blog-starter', description: 'Simple markdown blog starter template', techStack: ['Next.js', 'React'], lastUpdated: '3 days ago', isPublic: true, isStarred: false, status: 'active' },
    { id: '4', name: 'utils-lib', description: 'Shared utility functions', techStack: ['TypeScript'], lastUpdated: '1 week ago', isPublic: true, isStarred: false, status: 'archived' },
    { id: '5', name: 'ai-playground', description: 'Testing new AI models', techStack: ['Python', 'FastAPI'], lastUpdated: '2 weeks ago', isPublic: false, isStarred: true, status: 'active' },
];

export const mockRuntimes: RuntimeEnvironment[] = [
    { id: 'env-1', projectName: 'editron-dashboard', status: 'running', cpuUsage: 12, memoryUsage: 256, port: 3000, uptime: '2d 4h' },
    { id: 'env-2', projectName: 'api-gateway', status: 'running', cpuUsage: 8, memoryUsage: 128, port: 8080, uptime: '5d 12h' },
    { id: 'env-3', projectName: 'ai-playground', status: 'stopped', cpuUsage: 0, memoryUsage: 0, port: 8000, uptime: '-' },
];

export const mockActivity: ActivityItem[] = [
    { id: 'act-1', type: 'deployment', description: 'Deployed editron-dashboard to production', projectName: 'editron-dashboard', timestamp: '10 mins ago' },
    { id: 'act-2', type: 'ai_prompt', description: 'Generated new API endpoint for user auth', projectName: 'api-gateway', timestamp: '45 mins ago' },
    { id: 'act-3', type: 'file_edit', description: 'Updated README.md', projectName: 'blog-starter', timestamp: '2 hours ago' },
    { id: 'act-4', type: 'project_create', description: 'Created new project "payment-service"', timestamp: '5 hours ago' },
    { id: 'act-5', type: 'dependency', description: 'Added "zod" dependency', projectName: 'utils-lib', timestamp: '1 day ago' },
];
