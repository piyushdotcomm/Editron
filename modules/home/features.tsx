"use client";

import {
    Lock,
    Palette,
    SunMoon,
    LayoutTemplate,
    FolderTree,
    Code2,
    BrainCircuit,
    Server,
    Terminal,
    MessageSquareText
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
        title: "OAuth Login",
        description: "Google & GitHub login support with NextAuth for secure authentication.",
        icon: Lock,
        area: "md:[grid-area:1/1/2/7] xl:[grid-area:1/1/2/5]"
    },
    {
        title: "Modern UI",
        description: "Built with TailwindCSS & ShadCN UI for a clean, accessible interface.",
        icon: Palette,
        area: "md:[grid-area:1/7/2/13] xl:[grid-area:1/5/2/9]"
    },
    {
        title: "Dark/Light Mode",
        description: "Seamlessly toggle between themes to reduce eye strain.",
        icon: SunMoon,
        area: "md:[grid-area:2/1/3/7] xl:[grid-area:1/9/2/13]"
    },
    {
        title: "Project Templates",
        description: "Start quickly with React, Next.js, Express, Hono, Vue, or Angular.",
        icon: LayoutTemplate,
        area: "md:[grid-area:2/7/3/13] xl:[grid-area:2/1/3/5]"
    },
    {
        title: "File Explorer",
        description: "Create, rename, delete, and manage files/folders effortlessly.",
        icon: FolderTree,
        area: "md:[grid-area:3/1/4/7] xl:[grid-area:2/5/3/9]"
    },
    {
        title: "Monaco Editor",
        description: "Syntax highlighting, formatting, keybindings, and AI autocomplete.",
        icon: Code2,
        area: "md:[grid-area:3/7/4/13] xl:[grid-area:2/9/3/13]"
    },
    {
        title: "AI Suggestions",
        description: "Local models via Ollama provide smart code completion.",
        icon: BrainCircuit,
        area: "md:[grid-area:4/1/5/7] xl:[grid-area:3/1/4/5]"
    },
    {
        title: "WebContainers",
        description: "Run frontend/backend apps instantly in your browser.",
        icon: Server,
        area: "md:[grid-area:4/7/5/13] xl:[grid-area:3/5/4/9]"
    },
    {
        title: "Terminal",
        description: "Fully interactive embedded terminal powered by xterm.js.",
        icon: Terminal,
        area: "md:[grid-area:5/1/6/7] xl:[grid-area:3/9/4/13]"
    },
    {
        title: "AI Chat Assistant",
        description: "Get help, refactors, or explanations by chatting with AI.",
        icon: MessageSquareText,
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
