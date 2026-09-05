const steps = [
  {
    n: "01",
    title: "Pick a starter",
    body: "Forty production-ready templates — Next.js, SvelteKit, Express, Hono and more. Open one and it boots instantly in your tab.",
  },
  {
    n: "02",
    title: "Build with AI",
    body: "Chat, completions and agentic file editing across Gemini, Groq and Mistral. Bring your own key, or use the shared fallback.",
  },
  {
    n: "03",
    title: "Run, share, export",
    body: "A real terminal and live preview powered by WebContainers. Collaborate over Yjs, then export the whole project as a ZIP.",
  },
];

export function Workflow() {
  return (
    <section className="w-full pt-20 md:pt-24">
      <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-cobalt pb-10">
        02 — Workflow
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
        {steps.map((step) => (
          <div key={step.n} className="border-t border-foreground/20 pt-6">
            <p className="font-mono text-sm text-cobalt">{step.n}</p>
            <h3 className="font-display text-2xl md:text-[1.7rem] text-foreground mt-4 mb-3">
              {step.title}
            </h3>
            <p className="text-[15px] leading-relaxed text-muted-foreground">
              {step.body}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
