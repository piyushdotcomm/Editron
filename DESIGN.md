# Design System: Editron

## 1. Visual Theme & Atmosphere

Editron's visual identity is built on a **monochromatic, developer-centric aesthetic** inspired by shadcn/ui's philosophy of restrained elegance. The overall atmosphere is **sleek, dense, and purposeful** — a dark-mode-first interface that channels the focus of a professional IDE while maintaining the polish of a premium SaaS product.

In **light mode**, the interface breathes with crisp, near-white surfaces and subtle warm-gray borders, evoking a clean sheet of paper. In **dark mode**, the experience shifts to a deep, ink-black canvas with whisper-thin luminous borders, creating an immersive coding environment where content commands full attention.

Accent energy comes exclusively from a **combustion-red gradient** (`red-500 → rose-500 → amber-500`) reserved for hero typography, primary CTAs, and feature icon badges — injecting controlled warmth into an otherwise neutral palette.

The landing page introduces atmospheric depth through an **animated WebGL shader background** (aurora effect) and a grid-pattern overlay with a radial fade mask, establishing visual sophistication before the user reads a single word.

## 2. Color Palette & Roles

### Core Neutrals
| Role | Light Mode | Dark Mode | Description |
|------|-----------|-----------|-------------|
| **Background** | `oklch(1 0 0)` — Pure Clean White | `oklch(0.141 0.005 285.823)` — Obsidian Charcoal | Primary canvas surface |
| **Foreground** | `oklch(0.141 0.005 285.823)` — Near-Black Ink | `oklch(0.985 0 0)` — Soft Lunar White | Body text and headings |
| **Card** | `oklch(1 0 0)` — Matching White | `oklch(0.21 0.006 285.885)` — Elevated Dark Slate | Card and container surfaces |
| **Muted** | `oklch(0.967 0.001 286.375)` — Whisper Gray | `oklch(0.274 0.006 286.033)` — Graphite Smoke | Secondary backgrounds |
| **Muted Foreground** | `oklch(0.552 0.016 285.938)` — Dusty Steel | `oklch(0.705 0.015 286.067)` — Silver Mist | Secondary text, captions |
| **Border** | `oklch(0.92 0.004 286.32)` — Gossamer Silver | `oklch(1 0 0 / 10%)` — Frosted Glass Edge | Dividers, card outlines |

### Accent & Action Colors
| Role | Value | Description |
|------|-------|-------------|
| **Primary CTA Gradient** | `from-red-600 to-rose-600` | Hero "Start Coding" button |
| **CTA Shadow** | `shadow-red-500/20` | Soft red glow beneath primary buttons |
| **Destructive** | `oklch(0.577 0.245 27.325)` (light) / `oklch(0.704 0.191 22.216)` (dark) | Ember-Red for danger and deletion states |
| **Hero Gradient Text** | `from-red-500 via-rose-500 to-amber-500` | Warm combustion gradient for headline emphasis |
| **Feature Badge Background** | `bg-red-500/10` with `border-red-500/20` | Subtle tinted icon containers |
| **Feature Icon Color** | `text-red-600` (light) / `text-red-500` (dark) | Lucide icon fill color inside feature cards |
| **Status Pulse** | `bg-red-500 animate-pulse` | Live status indicator dot in hero badge |

### Chart & Data Visualization
| Swatch | Light | Dark |
|--------|-------|------|
| Chart 1 | `oklch(0.646 0.222 41.116)` — Burnt Sienna | `oklch(0.488 0.243 264.376)` — Electric Indigo |
| Chart 2 | `oklch(0.6 0.118 184.704)` — Ocean Teal | `oklch(0.696 0.17 162.48)` — Seafoam Green |
| Chart 3 | `oklch(0.398 0.07 227.392)` — Storm Navy | `oklch(0.769 0.188 70.08)` — Golden Amber |
| Chart 4 | `oklch(0.828 0.189 84.429)` — Sunlit Gold | `oklch(0.627 0.265 303.9)` — Vivid Violet |
| Chart 5 | `oklch(0.769 0.188 70.08)` — Warm Amber | `oklch(0.645 0.246 16.439)` — Coral Flame |

## 3. Typography Rules

| Element | Font | Weight | Character |
|---------|------|--------|-----------|
| **Headings (h1–h6)** | Inter (`--font-inter`) | `font-black` (900) for hero, `font-bold` (700) for sections, `font-semibold` (600) for cards | Tight tracking (`tracking-tight`), cinematic scale on hero (4xl → 8xl responsive) |
| **Body Copy** | Inter (`--font-inter`) | `font-medium` (500) for UI labels, regular (400) for paragraphs | Relaxed leading (`leading-relaxed`), 18–20px sizing |
| **Code & Monospace** | Geist Mono (`--font-geist-mono`) | Regular (400) | Used inside Monaco Editor and terminal panes |
| **Anti-aliasing** | All text | — | Global `antialiased` rendering for sub-pixel smoothness |

## 4. Component Stylings

### Buttons
- **Primary CTA:** Pill-shaped (`rounded-full`), gradient fill (`from-red-600 to-rose-600`), white text, elevated with a warm diffused shadow (`shadow-lg shadow-red-500/20`). Scales up 5% on hover (`hover:scale-105`) for tactile responsiveness.
- **Secondary/Outline:** Pill-shaped (`rounded-full`), transparent background with a faint border (`border-border/60`), fills to `secondary/50` on hover. No shadow.

### Cards & Containers
- **Feature Grid Cards:** Generously rounded outer shell (`rounded-[1.25rem]` / `rounded-[1.5rem]` on desktop) with a hairline border (`border-[0.75px]`). Inner content area has slightly tighter rounding (`rounded-xl`). Background uses `bg-background/50` with `backdrop-blur-sm` for frosted glass depth.
- **GlowingEffect Component:** Each feature card includes a dynamic proximity-based border glow (spread: 40px, proximity: 64px) that illuminates as the cursor approaches, creating a living, reactive interface.
- **Dark mode shadow:** Cards cast a deep, diffused shadow (`0px 0px 27px rgba(45,45,45,0.3)`) for dimensional separation.

### Inputs & Forms
- **Input borders:** Match the system border token (`oklch(0.92 0.004 286.32)` light / `oklch(1 0 0 / 15%)` dark).
- **Focus ring:** Outlined with `ring` token at 50% opacity for accessible focus indication.

### Status Badges
- **Hero Badge:** Pill-shaped (`rounded-full`), translucent red background (`bg-red-500/10`), red border (`border-red-500/20`), includes an animated pulse dot for "live" status.

## 5. Layout Principles

- **Max Content Width:** `max-w-7xl` (80rem / 1280px) centered with `mx-auto`.
- **Vertical Rhythm:** Sections are separated by generous `space-y-24` (6rem) gaps, creating clear visual breathing room between hero, templates, and features.
- **Responsive Grid:** Feature cards use a CSS Grid with 12 named columns and explicit `grid-area` placement. Collapses from 4-column (xl) → 2-column (md) → 1-column (mobile).
- **Entrance Animations:** Content fades in from below (`animate-in fade-in slide-in-from-bottom-8`) with staggered delays (0ms, 200ms, 300ms) for a cinematic reveal sequence, gated behind a 3.2-second loading screen.
- **Scrollbar Policy:** All scrollbars are globally hidden (`scrollbar-width: none`) for a distraction-free, app-like experience.
- **Loading Screen:** A full-viewport overlay with the project name rendered via a `CommitsGrid` component, creating a GitHub-inspired loading animation.
