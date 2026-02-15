import { TemplateKey } from "@/lib/template";

export interface TemplateOption {
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

export const templates: TemplateOption[] = [
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
        icon: "/vue.svg",
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
        icon: "/angular.svg",
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
        icon: "/qwik.svg",
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
        icon: "/quasar.svg",
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
        icon: "/tres.svg",
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
        icon: "/bootstrap.svg",
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
        icon: "/expo.svg",
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
        icon: "/remotion.svg",
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
        icon: "/slidev.svg",
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
        icon: "/next.svg",
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
        icon: "/next.svg",
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
        icon: "/vite.svg",
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
        icon: "/vite.svg",
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
        icon: "/svelte.svg",
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
        icon: "/astro.svg",
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
        icon: "/tutorialkit.svg",
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
        icon: "/gsap.svg",
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
        icon: "/gsap.svg",
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
        icon: "/gsap.svg",
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
        icon: "/gsap.svg",
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
        icon: "/gsap.svg",
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
        icon: "/gsap.svg",
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
        icon: "/express.svg",
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
        icon: "/koa.svg",
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
        icon: "/egg.svg",
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
        icon: "/graphql.svg",
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
        icon: "/json.svg",
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
        icon: "/json.svg",
        color: "#E10098",
        popularity: 2,
        tags: ["GraphQL", "Mock API", "Prototyping"],
        features: ["Zero Config", "GraphQL Schema", "JSON Database"],
        category: "backend",
    },

    // ── Tooling / Vanilla ─────────────────────────────────
    {
        id: "BLANK",
        name: "Blank Canvas",
        description:
            "A completely empty project with just an index.html - start from absolute zero",
        icon: "/file.svg", // Using a generic file icon or similar if available
        color: "#888888",
        popularity: 5,
        tags: ["HTML", "Blank", "Clean"],
        features: ["Clean Slate", "No Dependencies", "Pure HTML"],
        category: "frontend",
    },
    {
        id: "STATIC",
        name: "Static HTML/CSS/JS",
        description:
            "Simple static website with HTML, CSS, and JavaScript — no build tools required",
        icon: "/html.svg",
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
        icon: "/javascript.svg",
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
        icon: "/typescript.svg",
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
        icon: "/node.svg",
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
        icon: "/nodemon.svg",
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
        icon: "/rxjs.svg",
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
        icon: "/html.svg",
        color: "#4285F4",
        popularity: 2,
        tags: ["Web APIs", "Standards", "Browser"],
        features: ["Native APIs", "No Dependencies", "Standards"],
        category: "tooling",
    },
];
