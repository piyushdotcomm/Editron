import { Button } from "@/components/ui/button";
import { ArrowRight, Terminal } from "lucide-react";
import Link from "next/link";
import { Features } from "@/modules/home/features";
import { HeroCodeDemo } from "@/modules/home/hero-code";
import AnimatedShaderBackground from "@/components/ui/animated-shader-background";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-background selection:bg-primary/20 overflow-hidden font-sans">

      {/* Animated Shader Background - Red Aurora Effect */}
      <AnimatedShaderBackground />

      {/* Background Grid Pattern */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>

      <main className="flex flex-col items-center justify-start pt-20 md:pt-32 px-4 w-full max-w-7xl mx-auto space-y-24 pb-20">

        {/* Hero Section */}
        <section className="relative z-10 w-full flex flex-col items-center text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 fill-mode-both">

          <div className="inline-flex items-center rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-sm text-red-500 backdrop-blur-md hover:bg-red-500/20 transition-colors cursor-default">
            <span className="flex h-2 w-2 rounded-full bg-red-500 mr-2 animate-pulse"></span>
            <span className="font-medium">Experience Intelligent Coding</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight text-foreground leading-[1.1] max-w-5xl mx-auto">
            Code with <br className="hidden sm:block" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-500 via-rose-500 to-amber-500 italic pr-2">Intelligence & Speed</span>
          </h1>

          <p className="max-w-2xl text-lg sm:text-xl text-muted-foreground leading-relaxed mx-auto">
            Editron is the next-generation code editor designed for modern development.
            AI-powered, blazingly fast, and fully customizable.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 w-full sm:w-auto">
            <Link href="/dashboard" className="w-full sm:w-auto">
              <Button size="lg" className="rounded-full px-8 h-12 text-base font-semibold shadow-lg shadow-red-500/20 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white border-0 w-full sm:w-auto transition-transform hover:scale-105">
                Start Coding
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="#features" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="rounded-full px-8 h-12 text-base font-medium border-border/60 hover:bg-secondary/50 w-full sm:w-auto">
                Explore Features
              </Button>
            </Link>
          </div>

        </section>

        {/* Hero Visual / Demo */}
        <section className="w-full relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300 fill-mode-both">
          <HeroCodeDemo />
        </section>

        {/* Features Section */}
        <section id="features" className="w-full relative">
          {/* Section Header */}
          <div className="mb-16 text-center space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-muted-foreground">
              Beyond Just an Editor
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Explore the toolset that makes Editron the choice for thousands of developers worldwide.
            </p>
          </div>

          <Features />
        </section>

      </main>
    </div>
  );
}
