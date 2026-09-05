"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const WireframeForms = dynamic(
  () =>
    import("@designcodeio/threeui/components/WireframeForms").then(
      (m) => m.WireframeForms,
    ),
  { ssr: false },
);

export function Hero() {
  return (
    <section className="relative w-full grid lg:grid-cols-12 gap-10 lg:gap-6 items-center pt-14 md:pt-20 pb-16">
      <div className="lg:col-span-7 flex flex-col items-start space-y-7 pr-4">
        <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-cobalt">
          Browser-native development
        </p>

        <h1 className="font-display text-5xl sm:text-6xl md:text-7xl leading-[1.02] tracking-[-0.01em] text-foreground max-w-xl">
          The IDE that lives
          <br />
          where you <em className="italic text-cobalt">already</em> work.
        </h1>

        <p className="text-lg text-muted-foreground leading-relaxed max-w-lg">
          Editron runs real Node.js projects inside your browser tab — editor,
          terminal, preview and AI assistance. Nothing to install, nothing to
          configure.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3 pt-1 w-full sm:w-auto">
          <Link href="/dashboard" className="w-full sm:w-auto">
            <Button
              size="lg"
              className="rounded-full px-7 h-11 w-full sm:w-auto font-medium"
            >
              Start coding
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/templates" className="w-full sm:w-auto">
            <Button
              variant="ghost"
              size="lg"
              className="rounded-full px-7 h-11 w-full sm:w-auto font-medium text-foreground hover:bg-secondary border border-border"
            >
              Browse the catalog
              <ArrowUpRight className="ml-2 h-4 w-4 text-cobalt" />
            </Button>
          </Link>
        </div>

        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground/70 pt-3">
          Open source · MIT · Free forever
        </p>
      </div>

      <div className="lg:col-span-5 relative">
        <div className="relative rounded-2xl border border-border overflow-hidden bg-secondary/50 dark:bg-card/60 shadow-sm">
          <div className="relative h-[300px] md:h-[340px] rounded-t-2xl overflow-hidden">
            <WireframeForms
              variant="sphere"
              mode="auto"
              hue={232}
              saturation={1}
              className="absolute inset-0 w-full h-full rounded-t-2xl"
            />
          </div>

          <div className="border-t border-border bg-[#16181D]">
            <div className="flex items-center gap-1.5 border-b border-white/10 px-4 py-2.5">
              <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
              <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
              <span className="h-2.5 w-2.5 rounded-full bg-cobalt/80" />
              <span className="ml-3 font-mono text-[10px] uppercase tracking-wider text-white/40">
                playground — zsh
              </span>
            </div>
            <pre className="p-4 font-mono text-[12px] leading-relaxed text-white/80 overflow-x-auto">
              <code>
                <span className="text-cobalt">$</span> npx create-editron
                nextjs-shadcn{"\n"}
                <span className="text-emerald-400">✓</span> scaffolded in 1.2s
                {"\n"}
                <span className="text-cobalt">$</span> npm run dev{"\n"}
                <span className="text-white">▲</span> ready in 312ms
              </code>
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
}
