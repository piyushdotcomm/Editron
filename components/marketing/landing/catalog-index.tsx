import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

interface CatalogItem {
  id: string;
  name: string;
  category: string;
}

interface CatalogIndexProps {
  templates: CatalogItem[];
}

const CATEGORY_LABELS: Record<string, string> = {
  frontend: "Frontend",
  fullstack: "Full-stack",
  backend: "Backend & APIs",
  tooling: "Tooling & sandbox",
};

export function CatalogIndex({ templates }: CatalogIndexProps) {
  const categories = Object.keys(CATEGORY_LABELS);

  return (
    <section className="w-full pt-20 md:pt-24">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 pb-10">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-cobalt">
            01 — Catalog
          </p>
          <h2 className="font-display text-4xl md:text-5xl text-foreground mt-3">
            Forty starters.
            <br />
            One click each.
          </h2>
        </div>
        <Link
          href="/templates"
          className="group inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-muted-foreground hover:text-cobalt transition-colors"
        >
          Open the full catalog
          <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-10 gap-y-12">
        {categories.map((category) => {
          const items = templates.filter((t) => t.category === category);
          if (items.length === 0) return null;
          return (
            <div key={category}>
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground/70 border-b border-border pb-3 mb-2">
                {CATEGORY_LABELS[category]} · {items.length}
              </p>
              <ul>
                {items.map((item) => (
                  <li key={item.id}>
                    <Link
                      href={`/templates?template=${item.id}`}
                      className="group flex items-center justify-between py-2 border-b border-border/60 text-[15px] text-foreground/90 hover:text-cobalt transition-colors"
                    >
                      <span>{item.name}</span>
                      <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}
