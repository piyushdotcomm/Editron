
"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import type { TemplateKey } from "@/lib/template";
import {
  ChevronRight,
  Search,
  Star,
  Code,
  Server,
  Globe,
  Zap,
  Clock,
  Check,
  Plus,
  Layers,
  Video,
  Smartphone,
  Presentation,
  Box,
  FileCode,
  Terminal,
  Cpu,
  Paintbrush,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";

// TemplateSelectionModal.tsx
type TemplateSelectionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    template: TemplateKey;
    description?: string;
  }) => void;
};

interface TemplateOption {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  popularity: number;
  tags: string[];
  features: string[];
  category: "frontend" | "backend" | "fullstack" | "tooling";
}

const templates: TemplateOption[] = [
  // ── Frontend ──────────────────────────────────────────
  {
    id: "REACT",
    name: "React",
    description:
      "A JavaScript library for building user interfaces with component-based architecture",
    icon: "/react.svg",
    color: "#61DAFB",
    popularity: 5,
    tags: ["UI", "Frontend", "JavaScript"],
    features: ["Component-Based", "Virtual DOM", "JSX Support"],
    category: "frontend",
  },
  {
    id: "REACT_TS",
    name: "React + TypeScript",
    description:
      "React with TypeScript for type-safe component development and better developer experience",
    icon: "/react.svg",
    color: "#61DAFB",
    popularity: 5,
    tags: ["React", "TypeScript", "Frontend"],
    features: ["Type Safety", "IntelliSense", "Component Types"],
    category: "frontend",
  },
  {
    id: "VUE",
    name: "Vue.js",
    description:
      "Progressive JavaScript framework for building user interfaces with an approachable learning curve",
    icon: "/vuejs-icon.svg",
    color: "#4FC08D",
    popularity: 4,
    tags: ["UI", "Frontend", "JavaScript"],
    features: ["Reactive Data Binding", "Component System", "Virtual DOM"],
    category: "frontend",
  },
  {
    id: "ANGULAR",
    name: "Angular",
    description:
      "Angular is a web framework that empowers developers to build fast, reliable applications",
    icon: "/angular-2.svg",
    color: "#DD0031",
    popularity: 3,
    tags: ["TypeScript", "Frontend", "Enterprise"],
    features: [
      "Dependency Injection",
      "TypeScript Support",
      "Two-way Binding",
    ],
    category: "frontend",
  },
  {
    id: "BOLT_QWIK",
    name: "Qwik",
    description:
      "Resumable framework that delivers instant-loading web apps with zero hydration",
    icon: "/react.svg",
    color: "#18B6F6",
    popularity: 3,
    tags: ["Frontend", "Performance", "Resumable"],
    features: ["Resumability", "Lazy Loading", "Fine-grained Reactivity"],
    category: "frontend",
  },
  {
    id: "QUASAR",
    name: "Quasar",
    description:
      "High-performance Vue.js framework for building responsive websites, PWAs, and mobile apps",
    icon: "/vuejs-icon.svg",
    color: "#1976D2",
    popularity: 3,
    tags: ["Vue", "Frontend", "Cross-platform"],
    features: ["Material Design", "PWA Support", "Multi-platform"],
    category: "frontend",
  },
  {
    id: "TRES",
    name: "TresJS",
    description:
      "Create stunning 3D experiences with Three.js and Vue — declarative and reactive 3D rendering",
    icon: "/vuejs-icon.svg",
    color: "#82DBC5",
    popularity: 2,
    tags: ["Vue", "3D", "WebGL"],
    features: ["Three.js Integration", "Declarative 3D", "Vue Reactivity"],
    category: "frontend",
  },
  {
    id: "BOOTSTRAP_5",
    name: "Bootstrap 5",
    description:
      "The world's most popular CSS framework for building responsive, mobile-first sites",
    icon: "/globe.svg",
    color: "#7952B3",
    popularity: 4,
    tags: ["CSS", "Frontend", "Responsive"],
    features: ["Grid System", "Components", "Utilities"],
    category: "frontend",
  },
  {
    id: "BOLT_EXPO",
    name: "Expo (React Native)",
    description:
      "Build native mobile apps for iOS and Android using React Native with Expo toolchain",
    icon: "/react.svg",
    color: "#000020",
    popularity: 3,
    tags: ["Mobile", "React Native", "Cross-platform"],
    features: ["Native APIs", "OTA Updates", "Cross-platform"],
    category: "frontend",
  },
  {
    id: "BOLT_REMOTION",
    name: "Remotion",
    description:
      "Create videos programmatically using React — render motion graphics and animations in code",
    icon: "/react.svg",
    color: "#0B84F3",
    popularity: 2,
    tags: ["React", "Video", "Animation"],
    features: ["Programmatic Video", "React Components", "MP4 Export"],
    category: "frontend",
  },
  {
    id: "SLIDEV",
    name: "Slidev",
    description:
      "Presentation slides for developers — write slides in Markdown with Vue components",
    icon: "/vuejs-icon.svg",
    color: "#2B90B6",
    popularity: 2,
    tags: ["Vue", "Markdown", "Presentation"],
    features: ["Markdown Slides", "Vue Components", "Code Highlighting"],
    category: "frontend",
  },

  // ── Fullstack ─────────────────────────────────────────
  {
    id: "NEXTJS",
    name: "Next.js",
    description:
      "The React framework for production with server-side rendering and static site generation",
    icon: "/nextjs-icon.svg",
    color: "#000000",
    popularity: 5,
    tags: ["React", "SSR", "Fullstack"],
    features: ["Server Components", "API Routes", "File-based Routing"],
    category: "fullstack",
  },
  {
    id: "NEXTJS_SHADCN",
    name: "Next.js + shadcn/ui",
    description:
      "Next.js with shadcn/ui component library pre-configured for beautiful, accessible UIs",
    icon: "/nextjs-icon.svg",
    color: "#000000",
    popularity: 4,
    tags: ["React", "shadcn", "Fullstack"],
    features: ["Radix Primitives", "Tailwind CSS", "Accessible Components"],
    category: "fullstack",
  },
  {
    id: "BOLT_VITE_REACT_TS",
    name: "Vite + React + TS",
    description:
      "Lightning-fast React development with Vite bundler and TypeScript support",
    icon: "/react.svg",
    color: "#646CFF",
    popularity: 4,
    tags: ["React", "Vite", "TypeScript"],
    features: ["HMR", "Fast Builds", "TypeScript"],
    category: "fullstack",
  },
  {
    id: "VITE_SHADCN",
    name: "Vite + shadcn/ui",
    description:
      "Vite-powered React app with shadcn/ui components for rapid, beautiful UI development",
    icon: "/react.svg",
    color: "#646CFF",
    popularity: 3,
    tags: ["React", "Vite", "shadcn"],
    features: ["Radix Primitives", "Tailwind CSS", "Fast Dev Server"],
    category: "fullstack",
  },
  {
    id: "SVELTEKIT",
    name: "SvelteKit",
    description:
      "Full-stack framework for building Svelte apps with SSR, routing, and server-side logic",
    icon: "/globe.svg",
    color: "#FF3E00",
    popularity: 4,
    tags: ["Svelte", "SSR", "Fullstack"],
    features: ["File-based Routing", "SSR/SSG", "Server Endpoints"],
    category: "fullstack",
  },
  {
    id: "ASTRO_SHADCN",
    name: "Astro + shadcn/ui",
    description:
      "Content-focused framework with island architecture and shadcn/ui components",
    icon: "/globe.svg",
    color: "#BC52EE",
    popularity: 3,
    tags: ["Astro", "Islands", "Content"],
    features: ["Island Architecture", "Multi-framework", "Zero JS Default"],
    category: "fullstack",
  },
  {
    id: "TUTORIALKIT",
    name: "TutorialKit",
    description:
      "Build interactive coding tutorials with embedded editors and live previews",
    icon: "/globe.svg",
    color: "#FF6347",
    popularity: 2,
    tags: ["Education", "Interactive", "Tutorials"],
    features: ["Embedded Editor", "Live Preview", "Step-by-step"],
    category: "fullstack",
  },

  // ── GSAP Animation ────────────────────────────────────
  {
    id: "GSAP_REACT",
    name: "GSAP + React",
    description:
      "Professional-grade animations in React using the GreenSock Animation Platform",
    icon: "/react.svg",
    color: "#88CE02",
    popularity: 3,
    tags: ["React", "Animation", "GSAP"],
    features: ["Timeline Animations", "ScrollTrigger", "React Hooks"],
    category: "frontend",
  },
  {
    id: "GSAP_NEXT",
    name: "GSAP + Next.js",
    description:
      "Server-rendered Next.js apps with powerful GSAP animations and scroll interactions",
    icon: "/nextjs-icon.svg",
    color: "#88CE02",
    popularity: 3,
    tags: ["Next.js", "Animation", "GSAP"],
    features: ["SSR Animations", "ScrollTrigger", "Page Transitions"],
    category: "fullstack",
  },
  {
    id: "GSAP_VUE",
    name: "GSAP + Vue",
    description:
      "Stunning animations in Vue.js applications with GSAP's animation engine",
    icon: "/vuejs-icon.svg",
    color: "#88CE02",
    popularity: 2,
    tags: ["Vue", "Animation", "GSAP"],
    features: ["Directive Animations", "Timeline Control", "Transitions"],
    category: "frontend",
  },
  {
    id: "GSAP_NUXT",
    name: "GSAP + Nuxt",
    description:
      "Nuxt.js with GSAP for server-rendered Vue apps with professional animations",
    icon: "/vuejs-icon.svg",
    color: "#88CE02",
    popularity: 2,
    tags: ["Nuxt", "Animation", "GSAP"],
    features: ["SSR Ready", "Page Transitions", "ScrollTrigger"],
    category: "fullstack",
  },
  {
    id: "GSAP_SVELTE",
    name: "GSAP + Svelte",
    description:
      "Combine Svelte's reactivity with GSAP's animation power for buttery-smooth UIs",
    icon: "/globe.svg",
    color: "#88CE02",
    popularity: 2,
    tags: ["Svelte", "Animation", "GSAP"],
    features: ["Reactive Animations", "Tweens", "ScrollTrigger"],
    category: "frontend",
  },
  {
    id: "GSAP_SVELTEKIT",
    name: "GSAP + SvelteKit",
    description:
      "Full-stack SvelteKit with GSAP animations for immersive web experiences",
    icon: "/globe.svg",
    color: "#88CE02",
    popularity: 2,
    tags: ["SvelteKit", "Animation", "GSAP"],
    features: ["SSR Animations", "Page Transitions", "ScrollTrigger"],
    category: "fullstack",
  },

  // ── Backend ───────────────────────────────────────────
  {
    id: "EXPRESS",
    name: "Express",
    description:
      "Fast, unopinionated, minimalist web framework for Node.js to build APIs and web applications",
    icon: "/expressjs-icon.svg",
    color: "#000000",
    popularity: 4,
    tags: ["Node.js", "API", "Backend"],
    features: ["Middleware", "Routing", "HTTP Utilities"],
    category: "backend",
  },
  {
    id: "HONO",
    name: "Hono",
    description:
      "Fast, lightweight, built on Web Standards. Support for any JavaScript runtime",
    icon: "/hono.svg",
    color: "#e36002",
    popularity: 3,
    tags: ["Node.js", "TypeScript", "Backend"],
    features: ["Web Standards", "Multi-runtime", "Middleware"],
    category: "backend",
  },
  {
    id: "HONO_NODEJS",
    name: "Hono (Node.js)",
    description:
      "Hono framework optimized for Node.js runtime with full server capabilities",
    icon: "/hono.svg",
    color: "#e36002",
    popularity: 3,
    tags: ["Node.js", "TypeScript", "Backend"],
    features: ["Node.js Optimized", "TypeScript", "Middleware"],
    category: "backend",
  },
  {
    id: "KOA",
    name: "Koa",
    description:
      "Next-generation web framework for Node.js by the Express team with async/await support",
    icon: "/expressjs-icon.svg",
    color: "#33333D",
    popularity: 3,
    tags: ["Node.js", "API", "Backend"],
    features: ["Async/Await", "Middleware Cascade", "Lightweight"],
    category: "backend",
  },
  {
    id: "EGG",
    name: "Egg.js",
    description:
      "Born to build better enterprise Node.js frameworks with convention over configuration",
    icon: "/expressjs-icon.svg",
    color: "#D4A05A",
    popularity: 2,
    tags: ["Node.js", "Enterprise", "Backend"],
    features: ["Plugin System", "Multi-process", "Enterprise Ready"],
    category: "backend",
  },
  {
    id: "GRAPHQL",
    name: "GraphQL Server",
    description:
      "GraphQL API server with schema-first approach for flexible and efficient data fetching",
    icon: "/expressjs-icon.svg",
    color: "#E10098",
    popularity: 3,
    tags: ["GraphQL", "API", "Backend"],
    features: ["Schema-first", "Type System", "Resolvers"],
    category: "backend",
  },
  {
    id: "JSON_SERVER",
    name: "JSON Server",
    description:
      "Full fake REST API with zero coding — perfect for prototyping and mocking",
    icon: "/expressjs-icon.svg",
    color: "#1A1A2E",
    popularity: 3,
    tags: ["REST", "Mock API", "Prototyping"],
    features: ["Zero Config", "REST Routes", "JSON Database"],
    category: "backend",
  },
  {
    id: "JSON_GRAPHQL_SERVER",
    name: "JSON GraphQL Server",
    description:
      "Get a full fake GraphQL API from a JSON file — instant GraphQL prototyping",
    icon: "/expressjs-icon.svg",
    color: "#E10098",
    popularity: 2,
    tags: ["GraphQL", "Mock API", "Prototyping"],
    features: ["Zero Config", "GraphQL Schema", "JSON Database"],
    category: "backend",
  },

  // ── Tooling / Vanilla ─────────────────────────────────
  {
    id: "STATIC",
    name: "Static HTML/CSS/JS",
    description:
      "Simple static website with HTML, CSS, and JavaScript — no build tools required",
    icon: "/globe.svg",
    color: "#E44D26",
    popularity: 4,
    tags: ["HTML", "CSS", "Vanilla"],
    features: ["No Build Step", "Pure HTML/CSS", "Lightweight"],
    category: "frontend",
  },
  {
    id: "JS",
    name: "JavaScript",
    description:
      "Vanilla JavaScript sandbox for quick experiments and prototypes",
    icon: "/globe.svg",
    color: "#F7DF1E",
    popularity: 3,
    tags: ["JavaScript", "Vanilla", "Sandbox"],
    features: ["No Framework", "ES Modules", "Quick Start"],
    category: "tooling",
  },
  {
    id: "TYPESCRIPT",
    name: "TypeScript",
    description:
      "TypeScript sandbox with compilation support for type-safe JavaScript development",
    icon: "/globe.svg",
    color: "#3178C6",
    popularity: 3,
    tags: ["TypeScript", "Types", "Sandbox"],
    features: ["Type Checking", "ES Modules", "Compiler"],
    category: "tooling",
  },
  {
    id: "NODE",
    name: "Node.js",
    description:
      "Minimal Node.js project for server-side JavaScript development",
    icon: "/expressjs-icon.svg",
    color: "#339933",
    popularity: 3,
    tags: ["Node.js", "Server", "JavaScript"],
    features: ["CommonJS", "npm Packages", "Server-side"],
    category: "backend",
  },
  {
    id: "NODEMON",
    name: "Nodemon",
    description:
      "Node.js with Nodemon for auto-restart on file changes during development",
    icon: "/expressjs-icon.svg",
    color: "#76D04B",
    popularity: 3,
    tags: ["Node.js", "Dev Tools", "Hot Reload"],
    features: ["Auto-restart", "File Watching", "Dev Server"],
    category: "backend",
  },
  {
    id: "RXJS",
    name: "RxJS",
    description:
      "Reactive Extensions library for composing asynchronous and event-based programs",
    icon: "/globe.svg",
    color: "#B7178C",
    popularity: 2,
    tags: ["Reactive", "Observables", "TypeScript"],
    features: ["Observables", "Operators", "Schedulers"],
    category: "tooling",
  },
  {
    id: "WEB_PLATFORM",
    name: "Web Platform",
    description:
      "Modern web platform APIs playground — explore native browser features and standards",
    icon: "/globe.svg",
    color: "#4285F4",
    popularity: 2,
    tags: ["Web APIs", "Standards", "Browser"],
    features: ["Native APIs", "No Dependencies", "Standards"],
    category: "tooling",
  },
];

const TemplateSelectionModal = ({
  isOpen,
  onClose,
  onSubmit,
}: TemplateSelectionModalProps) => {
  const [step, setStep] = useState<"select" | "configure">("select");
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState<
    "all" | "frontend" | "backend" | "fullstack" | "tooling"
  >("all");
  const [projectName, setProjectName] = useState("");

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesCategory = category === "all" || template.category === category;

    return matchesCategory && matchesSearch;

  })


  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplate(templateId);
  };

  const handleContinue = () => {
    if (selectedTemplate) {
      setStep("configure");
    }
  };

  const handleCreateProject = () => {
    if (selectedTemplate) {
      const template = templates.find((t) => t.id === selectedTemplate);
      onSubmit({
        title: projectName || `New ${template?.name} Project`,
        template: selectedTemplate as TemplateKey,
        description: template?.description
      })

      onClose();
      // Reset state for next time
      setStep("select");
      setSelectedTemplate(null);
      setProjectName("");
    }
  };

  const handleBack = () => {
    setStep("select");
  };

  const renderStars = (count: number) => {
    return Array(5)
      .fill(0)
      .map((_, i) => (
        <Star
          key={i}
          size={14}
          className={
            i < count ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
          }
        />
      ));
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
          // Reset state when closing
          setStep("select");
          setSelectedTemplate(null);
          setProjectName("");
        }
      }}
    >
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        {step === "select" ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-[#e93f3f] flex items-center gap-2">
                <Plus size={24} className="text-[#e93f3f]" />
                Select a Template
              </DialogTitle>
              <DialogDescription>
                Choose a template to create your new playground
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-6 py-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 outline-none"
                    size={18}
                  />
                  <Input
                    placeholder="Search templates..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Tabs
                  defaultValue="all"
                  className="w-full sm:w-auto"
                  onValueChange={(value) => setCategory(value as any)}
                >
                  <TabsList className="grid grid-cols-5 w-full sm:w-[500px]">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="frontend">Frontend</TabsTrigger>
                    <TabsTrigger value="backend">Backend</TabsTrigger>
                    <TabsTrigger value="fullstack">Fullstack</TabsTrigger>
                    <TabsTrigger value="tooling">Tooling</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              <RadioGroup
                value={selectedTemplate || ""}
                onValueChange={handleSelectTemplate}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredTemplates.length > 0 ? (
                    filteredTemplates.map((template) => (
                      <div
                        key={template.id}
                        className={`relative flex p-6 border rounded-lg cursor-pointer transition-all duration-300 hover:scale-[1.02]
                        ${selectedTemplate === template.id
                            ? "border-[#E93F3F] shadow-[0_0_0_1px_#E93F3F,0_8px_20px_rgba(233,63,63,0.15)]"
                            : "hover:border-[#E93F3F] shadow-[0_2px_8px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.1)]"
                          }
                    `}
                        onClick={() => handleSelectTemplate(template.id)}
                      >
                        <div className="absolute top-4 right-4 flex gap-1">
                          {renderStars(template.popularity)}
                        </div>

                        {selectedTemplate === template.id && (
                          <div className="absolute top-2 left-2 bg-[#E93F3F] text-white rounded-full p-1">
                            <Check size={14} />
                          </div>
                        )}

                        <div className="flex gap-4">
                          <div
                            className="relative w-16 h-16 flex-shrink-0 flex items-center justify-center rounded-full"
                            style={{ backgroundColor: `${template.color}15` }}
                          >
                            <Image
                              src={template.icon || "/placeholder.svg"}
                              alt={`${template.name} icon`}
                              width={40}
                              height={40}
                              className="object-contain"
                            />
                          </div>

                          <div className="flex flex-col">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-lg font-semibold">
                                {template.name}
                              </h3>
                              <div className="flex gap-1">
                                {template.category === "frontend" && (
                                  <Code size={14} className="text-blue-500" />
                                )}
                                {template.category === "backend" && (
                                  <Server
                                    size={14}
                                    className="text-green-500"
                                  />
                                )}
                                {template.category === "fullstack" && (
                                  <Globe
                                    size={14}
                                    className="text-purple-500"
                                  />
                                )}
                                {template.category === "tooling" && (
                                  <Terminal
                                    size={14}
                                    className="text-orange-500"
                                  />
                                )}
                              </div>
                            </div>

                            <p className="text-sm text-muted-foreground mb-3">
                              {template.description}
                            </p>

                            <div className="flex flex-wrap gap-2 mt-auto">
                              {template.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="text-xs px-2 py-1 border rounded-2xl"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        <RadioGroupItem
                          value={template.id}
                          id={template.id}
                          className="sr-only"
                        />
                      </div>
                    ))
                  ) : (
                    <div className="col-span-2 flex flex-col items-center justify-center p-8 text-center">
                      <Search size={48} className="text-gray-300 mb-4" />
                      <h3 className="text-lg font-medium">
                        No templates found
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Try adjusting your search or filters
                      </p>
                    </div>
                  )}
                </div>
              </RadioGroup>
            </div>

            <div className="flex justify-between gap-3 mt-4 pt-4 border-t">
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock size={14} className="mr-1" />
                <span>
                  Estimated setup time:{" "}
                  {selectedTemplate ? "2-5 minutes" : "Select a template"}
                </span>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  className="bg-[#E93F3F] hover:bg-[#d03636] text-white"
                  disabled={!selectedTemplate}
                  onClick={handleContinue}
                >
                  Continue <ChevronRight size={16} className="ml-1" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-[#e93f3f]">
                Configure Your Project
              </DialogTitle>
              <DialogDescription>
                {templates.find((t) => t.id === selectedTemplate)?.name} project
                configuration
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-6 py-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="project-name">Project Name</Label>
                <Input
                  id="project-name"
                  placeholder="my-awesome-project"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                />
              </div>

              <div className="p-4 shadow-[0_0_0_1px_#E93F3F,0_8px_20px_rgba(233,63,63,0.15)] rounded-lg border">
                <h3 className="font-medium mb-2">Selected Template Features</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {templates
                    .find((t) => t.id === selectedTemplate)
                    ?.features.map((feature) => (
                      <div key={feature} className="flex items-center gap-2">
                        <Zap size={14} className="text-[#E93F3F]" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            <div className="flex justify-between gap-3 mt-4 pt-4 border-t">
              <Button variant="outline" onClick={handleBack}>
                Back
              </Button>
              <Button
                className="bg-[#E93F3F] hover:bg-[#d03636] text-white"
                onClick={handleCreateProject}
              >
                Create Project
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TemplateSelectionModal;
