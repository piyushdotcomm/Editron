"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Features } from "@/modules/home/features";
import { HeroCodeDemo } from "@/modules/home/hero-code";
import { CommitsGrid } from "@/components/ui/commits-grid";
import { cn } from "@/lib/utils";
import { TemplateCard } from "@/components/marketing/template-card";
import type { TemplateSummary } from "@/lib/constants/templates";

function AnimatedShaderBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(233,63,63,0.12),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.10),_transparent_32%)]" />
      <div className="absolute -left-24 top-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl animate-pulse" />
      <div className="absolute right-0 bottom-0 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl animate-pulse [animation-delay:1.2s]" />
    </div>
  );
}

const fetchTemplates = async () => {
  try {
    const res = await fetch('/api/templates');
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
};

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [availableTemplates, setAvailableTemplates] = useState<TemplateSummary[]>([]);

  // Schema Markup for AI SEO (Organization & SoftwareApplication)
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
        url: "https://editron.vercel.app", // Replace with your domain once active
        logo: "https://editron.vercel.app/logo.svg",
      },
    ],
  };

  useEffect(() => {
    // Show loading screen for 2.2 seconds
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3200);
    // fetch templates for popular section
    let mounted = true;
    fetchTemplates().then((data) => {
      if (mounted && Array.isArray(data)) setAvailableTemplates(data);
    });
    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-background selection:bg-primary/20 overflow-hidden font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
      />
      {/* Loading Screen Overlay */}
      <div
        className={cn(
          "fixed inset-0 z-[9999] flex items-center justify-center bg-background transition-opacity duration-700 ease-in-out",
          isLoading ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
      >
        <div className="w-full flex justify-center">
          <CommitsGrid text="EDITRON" />
        </div>
      </div>

      {/* Main Content */}
      <div className="relative">
        {/* Animated Shader Background - Red Aurora Effect */}
        <AnimatedShaderBackground />

        {/* Background Grid Pattern */}
        <div className="absolute inset-0 -z-10 h-full w-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>

        <main className="flex flex-col items-center justify-start pt-20 md:pt-32 px-4 w-full max-w-7xl mx-auto space-y-24 pb-20">
          {/* Hero Section */}
          <section
            className={cn(
              "relative z-10 w-full flex flex-col items-center text-center space-y-8 fill-mode-both",
              isLoading
                ? "opacity-0"
                : "animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out",
            )}
          >
            <div className="inline-flex items-center rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-sm text-red-500 backdrop-blur-md hover:bg-red-500/20 transition-colors cursor-default">
              <span className="flex h-2 w-2 rounded-full bg-red-500 mr-2 animate-pulse"></span>
              <span className="font-medium">
                The Intelligent Cloud IDE for Modern Web Dev
              </span>
            </div>

            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight text-foreground leading-[1.1] max-w-5xl mx-auto">
              Code with <br className="hidden sm:block" />
              <span className="inline-flex overflow-visible bg-clip-text text-transparent bg-gradient-to-r from-red-500 via-rose-500 to-amber-500 italic pr-4 py-1">
                Intelligence & Speed
              </span>
            </h1>

            <p className="max-w-2xl text-lg sm:text-xl text-muted-foreground leading-relaxed mx-auto">
              Editron is the next-generation code editor designed for modern
              development. AI-powered, blazingly fast, and fully customizable.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 w-full sm:w-auto">
              <Link href="/dashboard" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="rounded-full px-8 h-12 text-base font-semibold shadow-lg shadow-red-500/20 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white border-0 w-full sm:w-auto transition-transform hover:scale-105"
                >
                  Start Coding for Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="#features" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-full px-8 h-12 text-base font-medium border-border/60 hover:bg-secondary/50 w-full sm:w-auto"
                >
                  Explore Features
                </Button>
              </Link>
            </div>
          </section>

          {/* Hero Visual / Demo */}
          <section
            className={cn(
              "w-full relative z-10 fill-mode-both",
              isLoading
                ? "opacity-0"
                : "animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200 ease-out",
            )}
          >
            <HeroCodeDemo />
          </section>

          {/* Popular Templates Section */}
          <section
            className={cn(
              "w-full relative z-10 fill-mode-both",
              isLoading
                ? "opacity-0"
                : "animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200 ease-out",
            )}
          >
            <div className="mb-8 flex items-center justify-between">
              <h2 className="text-2xl md:text-3xl font-bold">
                Popular Templates
              </h2>
              <Link
                href="/templates"
                className="text-primary hover:underline flex items-center text-sm font-medium"
              >
                View All Templates <ArrowRight size={14} className="ml-1" />
              </Link>
            </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {availableTemplates.slice(0, 4).map((template) => (
                  <TemplateCard key={template.id} template={template} />
                ))}
              </div>
          </section>

          {/* Features Section */}
          <section
            id="features"
            className={cn(
              "w-full relative fill-mode-both",
              isLoading
                ? "opacity-0"
                : "animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300 ease-out",
            )}
          >
            {/* Section Header */}
            <div className="mb-16 text-center space-y-4">
              <h2 className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-muted-foreground">
                Beyond Just an Editor
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Explore the toolset that makes Editron the choice for thousands
                of developers worldwide.
              </p>
            </div>

            <Features />
          </section>
        </main>
      </div>
    </div>
  );
}
