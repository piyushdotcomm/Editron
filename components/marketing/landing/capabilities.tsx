"use client";

import dynamic from "next/dynamic";

const BrandOrbs = dynamic(
  () =>
    import("@designcodeio/threeui/components/BrandOrbs").then(
      (m) => m.BrandOrbs,
    ),
  { ssr: false },
);

const features = [
  {
    name: "Real-time collaboration",
    body: "Live cursors and instant keystroke sync over Yjs and WebSockets. Same document, zero conflicts.",
    orb: null as string | null,
  },
  {
    name: "Multi-provider AI",
    body: "Switch between Gemini, Groq and Mistral per project. Your keys stay yours — stored client-side.",
    orb: "gemini",
  },
  {
    name: "A real runtime, not a simulator",
    body: "WebContainers boot Node.js inside the tab. npm install, dev servers, APIs — all genuinely executing.",
    orb: null,
  },
  {
    name: "VS Code-grade editing",
    body: "Monaco with multi-file trees, syntax highlighting, Prettier on save, and a command palette everywhere.",
    orb: null,
  },
  {
    name: "Own your output",
    body: "Every project exports as a clean ZIP. No lock-in, no proprietary format — it was always your code.",
    orb: "github",
  },
];

export function Capabilities() {
  return (
    <section className="w-full pt-20 md:pt-24">
      <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-cobalt pb-10">
        03 — Capabilities
      </p>

      <ul>
        {features.map((feature) => (
          <li
            key={feature.name}
            className="group grid grid-cols-12 gap-4 items-center border-t border-border py-7 hover:bg-secondary/50 transition-colors px-2 -mx-2"
          >
            <h3 className="col-span-12 md:col-span-4 font-display text-2xl text-foreground">
              {feature.name}
            </h3>
            <p className="col-span-10 md:col-span-7 text-[15px] leading-relaxed text-muted-foreground">
              {feature.body}
            </p>
            <div className="col-span-2 md:col-span-1 flex justify-end">
              {feature.orb ? (
                <div className="h-12 w-12 shrink-0 overflow-hidden">
                  <BrandOrbs
                    variant={feature.orb as "gemini" | "github"}
                    size="small"
                    mode="light"
                    className="h-full w-full"
                  />
                </div>
              ) : (
                <span className="font-mono text-xs text-muted-foreground/50 group-hover:text-cobalt transition-colors">
                  ↗
                </span>
              )}
            </div>
          </li>
        ))}
      </ul>
      <div className="border-t border-border" />
    </section>
  );
}
