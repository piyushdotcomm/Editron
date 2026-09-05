import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";

const contributors = [
  "adityapai05",
  "Rakshi2609",
  "BRUH-on",
  "HemaRamachandran28",
  "latakshsariyapatidar",
  "MaitrayeeK",
  "prathiusharun",
  "sidhacks",
  "ojasdhargave-iiitv",
  "Vishal-Prajapati17",
  "YASHcode-IIITV",
  "xmananrastogi",
];

export function OpenSource() {
  return (
    <section className="w-full pt-20 md:pt-24">
      <div className="grid md:grid-cols-2 gap-12 items-start">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-cobalt">
            04 — Open source
          </p>
          <h2 className="font-display text-4xl md:text-5xl text-foreground mt-3 leading-[1.1]">
            Built by people,
            <br />
            not a company.
          </h2>
          <p className="text-muted-foreground leading-relaxed mt-5 max-w-md">
            Editron is MIT-licensed and maintained by a student-led community —
            mentored through GirlScript Summer of Code. Read the code, open an
            issue, ship a pull request.
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-7">
            <a
              href="https://github.com/piyushdotcomm/Editron"
              target="_blank"
              rel="noreferrer"
            >
              <Button variant="outline" className="rounded-full h-10 border-border">
                View source
                <ArrowUpRight className="ml-1.5 h-3.5 w-3.5 text-cobalt" />
              </Button>
            </a>
            <a
              href="https://matrix.to/#/#editron:matrix.org"
              target="_blank"
              rel="noreferrer"
            >
              <Button
                variant="ghost"
                className="rounded-full h-10 text-muted-foreground hover:text-foreground"
              >
                Join the Element channel
              </Button>
            </a>
          </div>
        </div>

        <div className="md:pt-9">
          <div className="flex flex-wrap gap-2.5">
            {contributors.map((user) => (
              <a
                key={user}
                href={`https://github.com/${user}`}
                target="_blank"
                rel="noreferrer"
                title={user}
                className="h-11 w-11 rounded-full overflow-hidden border border-border bg-secondary hover:ring-2 hover:ring-cobalt/60 hover:-translate-y-0.5 transition-all"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://github.com/${user}.png`}
                  alt={user}
                  width={44}
                  height={44}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </a>
            ))}
            <span className="h-11 w-11 rounded-full border border-dashed border-border flex items-center justify-center font-mono text-[10px] text-muted-foreground">
              +25
            </span>
          </div>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground/70 mt-5">
            37 contributors and growing
          </p>
        </div>
      </div>
    </section>
  );
}
