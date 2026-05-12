<p align="center">
  <img src="./public/logo.svg" alt="Editron logo" width="140" />
</p>

# Editron

Editron is a browser-based development environment built with Next.js, WebContainers, Monaco Editor, and an integrated AI assistant. It lets users start from curated starter templates, edit code in the browser, run projects in an in-browser terminal, and preview the result without installing a local toolchain for each project.

[![CI](https://github.com/piyushdotcomm/Editron/actions/workflows/ci.yml/badge.svg)](https://github.com/piyushdotcomm/Editron/actions/workflows/ci.yml)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-149eca?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-MongoDB-2d3748?logo=prisma)](https://www.prisma.io/)

> [!NOTE]
> Editron is being maintained as an open-source project. Contributor-friendly docs, issue templates, PR templates, and repository checks are included so first-time and returning contributors can work with a predictable workflow.

## What Editron Does

- Runs full-stack starter projects in the browser with the WebContainer API.
- Supports a large starter catalog across frontend, backend, full-stack, and tooling-focused templates.
- Provides Monaco-based file editing, terminal access, live preview, theme switching, and resizable workspace panels.
- Includes an AI chat/completion layer with provider switching for Gemini, Groq, and Mistral.
- Supports authentication with NextAuth and persistence through Prisma with MongoDB.
- Ships a standalone Yjs collaboration server for real-time collaborative editing.

## Core Features

### Browser IDE Experience

- Monaco editor with multiple files, syntax highlighting, and theme support.
- Live preview through a dedicated preview route.
- xterm.js terminal running inside WebContainers.
- File explorer and project-scoped editing controls.
- Collaborative editing primitives powered by Yjs.

### Starter Template System

The `editron-starters/` directory contains the project templates that power new playground creation. The current catalog includes:

- Frontend: React, React TS, Vue, Angular, Qwik, Quasar, TresJS, Bootstrap, Expo, Remotion, Slidev
- Full-stack: Next.js, Next.js + shadcn/ui, Vite + React + TS, Vite + shadcn/ui, SvelteKit, Astro + shadcn/ui, TutorialKit
- Backend and APIs: Express, Hono, Hono Node.js, Koa, Egg, GraphQL, JSON Server, JSON GraphQL Server
- Tooling and sandbox projects: Static HTML/CSS/JS, JavaScript, TypeScript, Node, Nodemon, RxJS, Web Platform, Blank

### AI Workflows

- `/api/chat` streams AI coding assistance and tool calls.
- `/api/completion` is used for code completion workflows.
- Providers can be selected between Gemini, Groq, and Mistral.
- User-provided API keys are supported in-app, with optional server fallback keys from environment variables.

## Architecture At A Glance

### Main application areas

- `app/`: Next.js App Router routes, API endpoints, layouts, and user-facing pages
- `modules/`: feature modules grouped by domain such as auth, dashboard, playground, profile, and WebContainers
- `components/`: shared UI primitives and cross-feature components
- `lib/`: template mapping, database access, auth helpers, API utilities, and collaboration token helpers
- `server/`: standalone collaboration server for Yjs/WebSocket sync
- `editron-starters/`: starter project inventory used when creating playgrounds
- `prisma/`: MongoDB Prisma schema and generated client configuration
- `tests/`: repository-level smoke tests and future automated checks

### Data model

The current Prisma schema centers around:

- `User`: authenticated account with role and profile metadata
- `Account`: OAuth provider linkage for NextAuth
- `Playground`: saved project metadata and selected starter template
- `TemplateFile`: persisted serialized project file content
- `StarMark`: user-to-playground favorite state

### Collaboration flow

- The Next.js app proxies `/api/collab/:path*` to a standalone collaboration server.
- The collaboration server runs from `server/collab.ts`.
- Yjs document sync is handled between the editor layer and the WebSocket server.

## Local Development

### Prerequisites

- Node.js 20 or newer recommended
- npm 9 or newer
- MongoDB instance, local or hosted
- OAuth applications for GitHub and Google if you want full sign-in support

### Install

```bash
git clone https://github.com/piyushdotcomm/Editron.git
cd Editron
npm install
```

### Environment variables

Copy the example environment file, then replace placeholder values with local
or provider-specific credentials.

```bash
cp .env.example .env
```

### What each variable is for

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | Yes | Prisma MongoDB datasource |
| `AUTH_SECRET` | Yes for auth flows | NextAuth session and token signing |
| `AUTH_URL` | Recommended locally | Canonical app URL for auth callbacks |
| `AUTH_TRUST_HOST` | Recommended for hosted deployments | Allows Auth.js to trust the deployment host header |
| `AUTH_GITHUB_ID` / `AUTH_GITHUB_SECRET` | Optional locally | GitHub OAuth login |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | Optional locally | Google OAuth login |
| `GEMINI_API_KEY` | Optional | Server fallback for Gemini |
| `GROQ_API_KEY` | Optional | Server fallback for Groq |
| `MISTRAL_API_KEY` | Optional | Server fallback for Mistral |
| `VERCEL_MASTER_TOKEN` | Optional | Server fallback token for Vercel deployment requests |
| `NETLIFY_MASTER_TOKEN` | Optional | Server fallback token for Netlify deployment requests |
| `COLLAB_PORT` | Optional | Port for the standalone collaboration server; defaults to `1234` |
| `NEXT_PUBLIC_COLLAB_SERVER_URL` | Optional | Explicit collaboration server URL override |

> [!IMPORTANT]
> Do not commit `.env` files, secrets, access tokens, or provider credentials. Use GitHub repository secrets for CI or deployment environments.

### Start the app

```bash
npx prisma generate
npx prisma db push
npm run dev
```

This starts:

- the Next.js app
- the standalone collaboration server via `npm run start:collab`

Open `http://localhost:3000` after startup.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Starts Next.js in development and the collab server in parallel |
| `npm run build` | Creates a production build |
| `npm run start` | Starts production mode and the collab server |
| `npm run start:collab` | Runs the standalone Yjs collaboration server |
| `npm run lint` | Runs repository ESLint checks |
| `npm test` | Runs repository smoke tests |
| `npx prisma generate` | Generates the Prisma client |
| `npx prisma db push` | Pushes schema changes to MongoDB |

## Quality Gates

GitHub Actions currently runs three baseline checks:

- `lint`
- `test`
- `build`

The current lint configuration is intentionally practical rather than perfect:

- application code is linted
- vendored starter templates under `editron-starters/` are excluded from maintainer CI
- legacy lint debt still exists and appears as warnings in several areas

This keeps the repository enforceable for contributions while still leaving space for incremental cleanup.

## Deployment Notes

### Main app

The main application is designed for platforms that support Next.js App Router deployments, such as Vercel.

### Collaboration server

Two deployment-oriented files already exist for the standalone collaboration service:

- `render.yaml`
- `Dockerfile.collab`

If you deploy collaboration separately from the web app, make sure:

- the collab server can reach the same MongoDB instance if persistence is enabled
- `NEXT_PUBLIC_COLLAB_SERVER_URL` points to the public collaboration endpoint

## Known Project Realities

- TypeScript and ESLint are not fully clean across the whole codebase yet.
- Several advanced editor and AI flows are still evolving.
- Starter templates are treated as bundled assets for user projects, not as first-class application source modules.
- The repository contains both the main app and a sizable starter template catalog, so scope discipline matters during contributions.

## Where New Contributors Usually Start

Good first areas to understand:

- `app/playground/[id]/page.tsx` for the editor shell
- `modules/playground/` for file editing, AI, and workspace logic
- `modules/webcontainers/` for browser runtime behavior
- `app/api/chat/route.ts` for AI orchestration
- `lib/template.ts` and `lib/constants/templates.ts` for starter-template mapping

For contributor workflow, standards, and pull request expectations, read [CONTRIBUTING.md](./CONTRIBUTING.md). For security reporting, read [SECURITY.md](./SECURITY.md).

## Community & Contact

We use **Element (Matrix)** for real-time communication and contributor support.

- **Join our Element Channel:** [Click here to join](https://matrix.to/#/#editron:matrix.org)
- **GitHub Discussions:** For non-urgent questions and architectural ideas.
- **Issues:** For bug reports and feature requests.

## License

This project is licensed under the **MIT License** - see the [LICENSE](./LICENSE) file for details.
