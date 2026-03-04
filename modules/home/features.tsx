"use client";

import {
    Lock,
    Palette,
    LayoutTemplate,
    FolderTree,
    Code2,
    BrainCircuit,
    Server,
    Terminal,
    Users,
    Command
} from "lucide-react";
import { cn } from "@/lib/utils";
import { GlowingEffect } from "@/components/ui/glowing-effect";

interface Feature {
    title: string;
    description: string;
    icon: React.ElementType;
    area: string;
}

const features: Feature[] = [
    {
        title: "Real-Time Collaboration",
        description: "Live cursors and instant keystroke syncing via Yjs and WebSockets.",
        icon: Users,
        area: "md:[grid-area:1/1/2/7] xl:[grid-area:1/1/2/5]"
    },
    {
        title: "Vercel AI SDK",
        description: "Smart code completions and agentic file editing powered by leading AI models.",
        icon: BrainCircuit,
        area: "md:[grid-area:1/7/2/13] xl:[grid-area:1/5/2/9]"
    },
    {
        title: "Cloud Environments",
        description: "Run Node.js, React, and full-stack apps instantly in the browser via WebContainers.",
        icon: Server,
        area: "md:[grid-area:2/1/3/7] xl:[grid-area:1/9/2/13]"
    },
    {
        title: "Monaco Editor",
        description: "VS Code capabilities, syntax highlighting, and Prettier formatting built-in.",
        icon: Code2,
        area: "md:[grid-area:2/7/3/13] xl:[grid-area:2/1/3/5]"
    },
    {
        title: "Command Palette",
        description: "Lightning-fast Cmd+K navigation and shortcuts across the entire application.",
        icon: Command,
        area: "md:[grid-area:3/1/4/7] xl:[grid-area:2/5/3/9]"
    },
    {
        title: "Project Templates",
        description: "Start instantly with Next.js, React, Vue, Express, Angular, and 40+ frameworks.",
        icon: LayoutTemplate,
        area: "md:[grid-area:3/7/4/13] xl:[grid-area:2/9/3/13]"
    },
    {
        title: "OAuth Security",
        description: "Robust Git integration and secure authentication backed by NextAuth.",
        icon: Lock,
        area: "md:[grid-area:4/1/5/7] xl:[grid-area:3/1/4/5]"
    },
    {
        title: "Interactive Terminal",
        description: "Fully featured command-line interface powered by xterm.js.",
        icon: Terminal,
        area: "md:[grid-area:4/7/5/13] xl:[grid-area:3/5/4/9]"
    },
    {
        title: "Virtual File System",
        description: "Advanced explorer to seamlessly create, rename, and manage project structures.",
        icon: FolderTree,
        area: "md:[grid-area:5/1/6/7] xl:[grid-area:3/9/4/13]"
    },
    {
        title: "Premium Design",
        description: "Crafted with shadcn/ui, dynamic theming, and immersive 3D interface animations.",
        icon: Palette,
        area: "md:[grid-area:5/7/6/13] xl:[grid-area:4/1/5/13]"
    },
];

export function Features() {
    return (
        <ul className="grid grid-cols-1 grid-rows-none gap-4 md:grid-cols-12 md:grid-rows-5 xl:grid-rows-4 xl:gap-6">
            {features.map((feature, index) => (
                <GridItem
                    key={index}
                    area={feature.area}
                    icon={<feature.icon className="h-6 w-6 text-red-600 dark:text-red-500" />}
                    title={feature.title}
                    description={feature.description}
                />
            ))}
        </ul>
    );
}

interface GridItemProps {
    area: string;
    icon: React.ReactNode;
    title: string;
    description: React.ReactNode;
}

const GridItem = ({ area, icon, title, description }: GridItemProps) => {
    return (
        <li className={cn("min-h-[14rem] list-none", area)}>
            <div className="relative h-full rounded-[1.25rem] border-[0.75px] border-border p-2 md:rounded-[1.5rem] md:p-3">
                <GlowingEffect
                    spread={40}
                    glow={true}
                    disabled={false}
                    proximity={64}
                    inactiveZone={0.01}
                    borderWidth={3}
                />
                <div className="relative flex h-full flex-col justify-between gap-6 overflow-hidden rounded-xl border-[0.75px] bg-background/50 backdrop-blur-sm p-6 shadow-sm dark:shadow-[0px_0px_27px_0px_rgba(45,45,45,0.3)] md:p-6">
                    <div className="relative flex flex-1 flex-col justify-between gap-3">
                        <div className="w-fit rounded-lg border-[0.75px] border-red-500/20 p-2 bg-red-500/10">
                            {icon}
                        </div>
                        <div className="space-y-3">
                            <h3 className="pt-0.5 text-xl leading-[1.375rem] font-semibold font-sans tracking-tight md:text-2xl md:leading-[1.875rem] text-foreground">
                                {title}
                            </h3>
                            <h2 className="font-sans text-sm leading-[1.125rem] md:text-base md:leading-[1.375rem] text-muted-foreground">
                                {description}
                            </h2>
                        </div>
                    </div>
                </div>
            </div>
        </li>
    );
};
