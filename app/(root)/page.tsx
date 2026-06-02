import { getPopularTemplateSummaries } from "@/lib/templates/actions";
import { HomePageClient } from "@/components/marketing/home-page-client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Features } from "@/modules/home/features";
import { HeroCodeDemo } from "@/modules/home/hero-code";
import dynamic from "next/dynamic";


import { CommitsGrid } from "@/components/ui/commits-grid";
import { cn } from "@/lib/utils";
import { templates } from "@/lib/constants/templates";
import { TemplateCard } from "@/components/marketing/template-card";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
export default async function Home() {
  const popularTemplates = await getPopularTemplateSummaries(4);

  const schemaMarkup = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: "Editron",
        applicationCategory: "DeveloperApplication",
        operatingSystem: "Browser",
        description:
          "A browser-based code editor with AI assistance, WebContainers, and 40+ framework templates.",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
      },
      {
        "@type": "Organization",
        name: "Editron",
        url: "https://editron.vercel.app",
        logo: "https://editron.vercel.app/logo.svg",
      },
    ],
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
      />

      {/* Loading */}
      <div
        className={cn(
          "fixed inset-0 z-[9999] flex items-center justify-center bg-background transition-opacity",
          isLoading ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      >
        <CommitsGrid text="EDITRON" />
      </div>

      

      <main className="pt-20 px-4 max-w-7xl mx-auto space-y-20">
        
        {/* HERO */}
        <section className="text-center space-y-6">
          <h1 className="text-5xl font-bold">
            Code with Intelligence & Speed
          </h1>

          {/* ✅ FIXED BUTTON */}
          <Button asChild size="lg">
            <Link href="/dashboard">
              Start Coding for Free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>

          {/* ✅ FIXED BUTTON */}
          <Button asChild variant="outline" size="lg">
            <Link href="#features">
              Explore Features
            </Link>
          </Button>
        </section>

        {/* DEMO */}
        <HeroCodeDemo />

        {/* TEMPLATES */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Popular Templates</h2>
          <div className="grid grid-cols-2 gap-4">
            {templates.slice(0, 4).map((t) => (
              <TemplateCard key={t.id} template={t} />
            ))}
          </div>
        </section>

        {/* FEATURES */}
        <section id="features">
          <Features />
        </section>

      </main>
    </div>
  );
}
      <HomePageClient popularTemplates={popularTemplates} />
        </div>
   );
}
