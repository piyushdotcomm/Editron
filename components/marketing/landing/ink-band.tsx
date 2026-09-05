"use client";

import dynamic from "next/dynamic";

const DataField = dynamic(
  () =>
    import("@designcodeio/threeui/components/DataField").then(
      (m) => m.DataField,
    ),
  { ssr: false },
);

const stats = [
  { value: "40+", label: "starter templates" },
  { value: "37", label: "contributors worldwide" },
  { value: "$0", label: "free forever, MIT" },
];

export function InkBand() {
  return (
    <section className="relative w-full bg-ink text-paper mt-20 md:mt-24 overflow-hidden">
      <div className="relative grid lg:grid-cols-2 items-center min-h-[440px]">
        <div className="relative z-10 px-6 md:px-14 py-16 lg:py-20">
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-cobalt">
            By the numbers
          </p>

          <dl className="mt-10 space-y-8">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="flex items-baseline gap-5 border-b border-white/10 pb-6"
              >
                <dt className="font-display text-5xl md:text-6xl text-paper">
                  {stat.value}
                </dt>
                <dd className="font-mono text-xs uppercase tracking-[0.2em] text-paper/50">
                  {stat.label}
                </dd>
              </div>
            ))}
          </dl>

          <p className="mt-8 max-w-sm text-[15px] leading-relaxed text-paper/60">
            Built in the open by a student-led community — from GSSoC
            contributors to maintainers across four continents.
          </p>
        </div>

        <div className="relative h-[320px] lg:h-full min-h-[320px]">
          <DataField
            mode="dark"
            hue={230}
            saturation={1}
            className="absolute inset-0 w-full h-full"
          />
          <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#16181D] to-transparent pointer-events-none" />
        </div>
      </div>
    </section>
  );
}
