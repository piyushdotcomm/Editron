"use client";

import { Marquee } from "@/components/ui/marquee";
import { NumberTicker } from "@/components/ui/number-ticker";

const frameworks = [
  "React",
  "Next.js",
  "Vue",
  "Angular",
  "SvelteKit",
  "Astro",
  "Vite + React",
  "Express",
  "Hono",
  "Qwik",
  "Quasar",
  "Expo",
  "Remotion",
  "GraphQL",
  "Koa",
  "Slidev",
  "TresJS",
  "TutorialKit",
];

function FrameworkPill({ name }: { name: string }) {
  return (
    <span className="mx-2 inline-flex items-center rounded-full border border-border/60 bg-secondary/40 px-4 py-1.5 font-mono text-sm text-muted-foreground">
      {name}
    </span>
  );
}

const stats = [
  { value: 40, suffix: "+", label: "starter templates" },
  { value: 37, suffix: "", label: "open-source contributors" },
  { value: 0, prefix: "$", suffix: "", label: "free, forever (MIT)" },
];

export function TrustStrip() {
  return (
    <section className="relative z-10 w-full space-y-8 pt-20 md:pt-24">
      <p className="text-center font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground/70">
        Every stack, one workspace
      </p>

      <div className="relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
        <Marquee pauseOnHover className="[--duration:38s]">
          {frameworks.map((name) => (
            <FrameworkPill key={name} name={name} />
          ))}
        </Marquee>
      </div>

      <div className="grid grid-cols-3 gap-6 max-w-3xl mx-auto text-center pt-4">
        {stats.map((stat) => (
          <div key={stat.label} className="flex flex-col items-center gap-1">
            <span className="text-3xl md:text-4xl font-black tracking-tight text-foreground">
              {"prefix" in stat && stat.prefix}
              <NumberTicker value={stat.value} className="text-foreground" />
              {stat.suffix}
            </span>
            <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              {stat.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
