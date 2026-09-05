"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function FinalCta() {
  return (
    <section className="w-full pt-24 md:pt-32 pb-20 text-center">
      <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-cobalt">
        Ready when you are
      </p>
      <h2 className="font-display text-4xl md:text-6xl text-foreground mt-4 leading-[1.08] max-w-2xl mx-auto">
        Your next project is one browser tab away.
      </h2>
      <p className="text-muted-foreground mt-5 max-w-md mx-auto">
        No installs. No credit card. No toolchain hell. Open a template and
        start typing.
      </p>

      <div className="flex items-center justify-center gap-3 mt-9">
        <Link href="/dashboard">
          <Button size="lg" className="rounded-full px-8 h-12 font-medium">
            Start coding
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
        <Link href="/docs">
          <Button
            variant="ghost"
            size="lg"
            className="rounded-full px-8 h-12 font-medium text-foreground hover:bg-secondary border border-border"
          >
            Read the docs
          </Button>
        </Link>
      </div>
    </section>
  );
}
