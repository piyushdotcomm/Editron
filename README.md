# Editron

**A browser-based code editor with AI assistance, 40+ framework templates, and live preview — powered by WebContainers.**

Editron turns your browser into a full development environment. Pick a template (React, Next.js, Vue, Angular, Svelte, and dozens more), write code in Monaco Editor, run it in an integrated terminal, and preview the result — all without installing anything locally. An AI assistant (Gemini, Groq, or Mistral) can read, edit, and create files in your project on the fly.

[![Built with Next.js](https://img.shields.io/badge/Next.js-15.5-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![WebContainer API](https://img.shields.io/badge/WebContainer-API-1389FD?logo=stackblitz)](https://webcontainers.io/)

---

## Features

### Code Playground
- **Monaco Editor** with syntax highlighting, IntelliSense, and multi-file support
- **Integrated terminal** (xterm.js) with full command execution inside WebContainer
- **Live preview** — see your app running in a side panel as you code
- **Resizable panels** — drag to resize editor, terminal, and preview panes
- **Virtual file system** — create, rename, and delete files and folders

### 40+ Starter Templates

| Frontend | Backend | Full-Stack | Tooling |
|----------|---------|------------|---------|
| React, React TS | Express | Next.js | Slidev |
| Vue | Hono | SvelteKit | TutorialKit |
| Angular | Koa | Quasar | RxJS |
| Svelte | Egg | Astro + shadcn | GSAP (React, Vue, Svelte, Next, Nuxt) |
| Bootstrap 5 | GraphQL | Next.js + shadcn | JSON Server |
| Static HTML/CSS/JS | Node, Nodemon | Vite + shadcn | Bolt (Qwik, Remotion, Expo) |
| TypeScript | JSON GraphQL Server | Tres (Three.js + Vue) | Blank |

Or **import from GitHub** — paste a repo URL and Editron fetches the code, with monorepo sub-directory selection.

### AI Assistant
Chat with an AI that can **read, edit, and create files** directly in your project:
- **Gemini 2.0 Flash** — Google's fast multimodal model
- **Groq** (Llama) — ultra-low-latency inference
- **Mistral** — open-weight European model

Bring your own API key. The AI sees your file tree for context-aware edits.

### Authentication & Persistence
- Sign in with **GitHub** or **Google** via NextAuth.js v5
- **Save playgrounds** to MongoDB — come back to them anytime
- **Star** your favorite playgrounds for quick access
- **User roles**: Admin, User, Premium User

### Modern UI
- **Dark / Light mode** with next-themes
- **shadcn/ui** + Radix UI component primitives
- **Framer Motion** animations
- Monochrome, distraction-free aesthetic

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | Next.js 15 (App Router, Turbopack) |
| **Language** | TypeScript 5 |
| **UI** | React 19, Tailwind CSS v4, shadcn/ui, Radix UI, Framer Motion |
| **Editor** | Monaco Editor (`@monaco-editor/react`) |
| **Terminal** | xterm.js with fit, search, and web-links addons |
| **Runtime** | WebContainer API (browser-based Node.js) |
| **Database** | MongoDB via Prisma ORM |
| **Auth** | NextAuth.js v5 (JWT strategy, Prisma adapter) |
| **State** | Zustand |
| **Forms** | React Hook Form + Zod validation |
| **Notifications** | Sonner toasts |

---

## Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9 (or yarn / pnpm / bun)
- **MongoDB** instance (local or [MongoDB Atlas](https://www.mongodb.com/atlas))
- **OAuth apps** for [GitHub](https://github.com/settings/developers) and [Google](https://console.cloud.google.com/apis/credentials)

---

## Getting Started

### 1. Clone & Install

```bash
git clone https://github.com/piyushdotcomm/Editron.git
cd Editron
npm install
```

### 2. Configure Environment

Create a `.env` file in the project root:

```env
# Database
DATABASE_URL="mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<db>?retryWrites=true&w=majority"

# NextAuth
AUTH_SECRET="<generate with: openssl rand -base64 32>"

# GitHub OAuth
AUTH_GITHUB_ID="<your-github-client-id>"
AUTH_GITHUB_SECRET="<your-github-client-secret>"

# Google OAuth
AUTH_GOOGLE_ID="<your-google-client-id>"
AUTH_GOOGLE_SECRET="<your-google-client-secret>"
```

> **Note:** The `.env` file is git-ignored. Never commit secrets to version control.

### 3. Set Up the Database

```bash
npx prisma generate
npx prisma db push
```

### 4. Start the Dev Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). That's it.

---

## Project Structure

```
Editron/
├── app/                          # Next.js App Router
│   ├── (root)/                   # Landing page (public)
│   ├── (auth)/                   # Login / register pages
│   ├── api/
│   │   ├── chat/                 # AI chat endpoint (Gemini, Groq, Mistral)
│   │   ├── completion/           # Code completion endpoint
│   │   ├── github/               # GitHub repo import
│   │   ├── projects/             # CRUD for playgrounds
│   │   ├── template/             # Template file scanning
│   │   └── upload-zip/           # ZIP file upload
│   ├── dashboard/                # User dashboard
│   ├── playground/               # Code playground UI
│   └── preview/                  # Live preview iframe
│
├── modules/                      # Feature modules
│   ├── auth/                     # Auth forms, guards, providers
│   ├── dashboard/                # Dashboard cards, stats, GitHub import dialog
│   ├── home/                     # Landing page sections
│   ├── playground/               # Editor, explorer, AI chat, dialogs, hooks
│   ├── profile/                  # User profile management
│   └── webcontainers/            # WebContainer boot, preview, terminal hooks
│
├── components/ui/                # shadcn/ui primitives (40+ components)
├── lib/                          # Utilities, Prisma client, template paths
├── prisma/schema.prisma          # MongoDB schema
├── editron-starters/             # 40+ starter template directories
├── auth.ts                       # NextAuth configuration
├── middleware.ts                  # Route protection
└── routes.ts                     # Route definitions
```

---

## Available Scripts

```bash
npm run dev          # Start dev server (Turbopack)
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint

npx prisma generate  # Regenerate Prisma client
npx prisma db push   # Push schema changes to MongoDB
npx prisma studio    # Open database GUI
```

---

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import into [Vercel](https://vercel.com)
3. Add all `.env` variables in the Vercel dashboard
4. Deploy

Make sure these environment variables are set in production:

- `DATABASE_URL`
- `AUTH_SECRET`
- `AUTH_GITHUB_ID` / `AUTH_GITHUB_SECRET`
- `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET`

---

## Known Limitations

- **One WebContainer per page** — the WebContainer API restricts a single instance per browser tab
- **COEP headers** — set to `require-corp` for WebContainer compatibility, which may block some third-party resources in previews
- **Starter templates** — the `editron-starters/` directory must be present and populated for template selection to work

---

## Contributing

Contributions are welcome. Here's the flow:

1. Fork the repository
2. Create a feature branch — `git checkout -b feature/your-idea`
3. Commit your changes — `git commit -m "Add your idea"`
4. Push — `git push origin feature/your-idea`
5. Open a Pull Request

---

## Acknowledgments

- [Next.js](https://nextjs.org/) — React framework
- [WebContainer API](https://webcontainers.io/) — browser-based Node.js runtime by StackBlitz
- [Monaco Editor](https://microsoft.github.io/monaco-editor/) — VS Code's editor component
- [Prisma](https://www.prisma.io/) — type-safe ORM
- [shadcn/ui](https://ui.shadcn.com/) — component library
- [Radix UI](https://www.radix-ui.com/) — accessible primitives

---

## License

This project is private and proprietary. All rights reserved.

---

**Built by [Piyush](https://github.com/piyushdotcomm)**
