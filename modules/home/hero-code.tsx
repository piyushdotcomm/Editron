"use client";

import { motion } from "motion/react";
import { Terminal, Copy, Check, Circle } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const codeSnippet = `import { Editron } from '@editron/core';

// Initialize the intelligent environment
const editor = new Editron({
  mode: 'pro',
  ai: {
    enabled: true,
    model: 'claude-3-opus'
  },
  theme: 'midnight-monochrome'
});

export default function startCoding() {
  console.log("Ready to build something amazing.");
  return editor.launch();
}`;

export function HeroCodeDemo() {
    const [copied, setCopied] = useState(false);

    const onCopy = () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="relative w-full max-w-4xl mx-auto">
            {/* Glow Effect behind the card */}
            {/* Glow Effect behind the card */}
            <div className="absolute -inset-1 bg-gradient-to-r from-red-500/30 to-rose-500/30 rounded-2xl blur-2xl opacity-50 dark:opacity-30" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative rounded-xl border border-border bg-card/80 backdrop-blur-xl shadow-2xl overflow-hidden"
            >
                {/* Window Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-muted/30">
                    <div className="flex items-center gap-2">
                        <div className="flex gap-1.5">
                            <Circle className="w-3 h-3 fill-red-500/80 text-red-500/80" />
                            <Circle className="w-3 h-3 fill-yellow-500/80 text-yellow-500/80" />
                            <Circle className="w-3 h-3 fill-green-500/80 text-green-500/80" />
                        </div>
                        <div className="ml-4 flex items-center gap-2 px-3 py-1 rounded-md bg-background/50 border border-border/50 text-xs font-mono text-muted-foreground">
                            <Terminal className="w-3 h-3" />
                            <span>demo.tsx</span>
                        </div>
                    </div>
                    <button
                        onClick={onCopy}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                </div>

                {/* Code Content */}
                <div className="p-6 overflow-x-auto">
                    <pre className="font-mono text-sm md:text-base leading-relaxed">
                        <code className="block">
                            {codeSnippet.split('\n').map((line, i) => (
                                <div key={i} className="table-row">
                                    <span className="table-cell select-none text-right pr-4 text-muted-foreground/30 text-xs w-8">
                                        {i + 1}
                                    </span>
                                    <span className="table-cell">
                                        {/* Basic syntax highlighting simulation */}
                                        <span dangerouslySetInnerHTML={{
                                            __html: line
                                                .replace(/import|from|export|default|return|const|new/g, '<span class="text-red-500 dark:text-red-400 font-semibold">$&</span>')
                                                .replace(/'[^']*'/g, '<span class="text-amber-600 dark:text-amber-400">$&</span>')
                                                .replace(/"[^"]*"/g, '<span class="text-amber-600 dark:text-amber-400">$&</span>')
                                                .replace(/\/\/.*/g, '<span class="text-slate-500 italic">$&</span>')
                                                .replace(/Editron|console|editor/g, '<span class="text-rose-600 dark:text-rose-400">$&</span>')
                                        }} />
                                    </span>
                                </div>
                            ))}
                        </code>
                    </pre>
                </div>

                {/* Status Bar */}
                <div className="flex items-center justify-between px-4 py-1.5 border-t border-border/50 bg-muted/30 text-[10px] uppercase font-medium tracking-wider text-muted-foreground">
                    <div className="flex gap-4">
                        <span>TypeScript React</span>
                        <span>UTF-8</span>
                    </div>
                    <div className="flex gap-2 items-center">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span>AI Online</span>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
