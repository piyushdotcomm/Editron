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
cp .env.example .env
```

### Environment variables

Create a `.env` file in the repository root.

```env
DATABASE_URL="mongodb://localhost:27017/editron"
AUTH_SECRET="replace-with-a-random-secret"

AUTH_GITHUB_ID=""
AUTH_GITHUB_SECRET=""

AUTH_GOOGLE_ID=""
AUTH_GOOGLE_SECRET=""

GEMINI_API_KEY=""
GROQ_API_KEY=""
MISTRAL_API_KEY=""

NEXT_PUBLIC_COLLAB_SERVER_URL=""
```

### What each variable is for

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | Yes | Prisma MongoDB datasource |
| `AUTH_SECRET` | Yes for auth flows | NextAuth session and token signing |
| `AUTH_GITHUB_ID` / `AUTH_GITHUB_SECRET` | Optional locally | GitHub OAuth login |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | Optional locally | Google OAuth login |
| `GEMINI_API_KEY` | Optional | Server fallback for Gemini |
| `GROQ_API_KEY` | Optional | Server fallback for Groq |
| `MISTRAL_API_KEY` | Optional | Server fallback for Mistral |
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

## 🤝 Contributors

Thanks to everyone who has contributed to Editron!

<div align="center">
<!-- CONTRIBUTORS_START -->
<a href="https://github.com/bhavyaxtech"><img src="https://github.com/bhavyaxtech.png" width="50px" alt="bhavyaxtech" /></a><a href="https://github.com/Rakshi2609"><img src="https://github.com/Rakshi2609.png" width="50px" alt="Rakshi2609" /></a><a href="https://github.com/piyushdotcomm"><img src="https://github.com/piyushdotcomm.png" width="50px" alt="piyushdotcomm" /></a><a href="https://github.com/bitunik"><img src="https://github.com/bitunik.png" width="50px" alt="bitunik" /></a><a href="https://github.com/pranshugarg637"><img src="https://github.com/pranshugarg637.png" width="50px" alt="pranshugarg637" /></a><a href="https://github.com/Vishal-Prajapati17"><img src="https://github.com/Vishal-Prajapati17.png" width="50px" alt="Vishal-Prajapati17" /></a><a href="https://github.com/Niteshagarwal01"><img src="https://github.com/Niteshagarwal01.png" width="50px" alt="Niteshagarwal01" /></a><a href="https://github.com/sidhacks"><img src="https://github.com/sidhacks.png" width="50px" alt="sidhacks" /></a><a href="https://github.com/adityapai05"><img src="https://github.com/adityapai05.png" width="50px" alt="adityapai05" /></a><a href="https://github.com/AbhilashReddy1519"><img src="https://github.com/AbhilashReddy1519.png" width="50px" alt="AbhilashReddy1519" /></a><a href="https://github.com/Luffy-456"><img src="https://github.com/Luffy-456.png" width="50px" alt="Luffy-456" /></a><a href="https://github.com/udaycodespace"><img src="https://github.com/udaycodespace.png" width="50px" alt="udaycodespace" /></a><a href="https://github.com/sanjaynarayanan3010-byte"><img src="https://github.com/sanjaynarayanan3010-byte.png" width="50px" alt="sanjaynarayanan3010-byte" /></a><a href="https://github.com/xmananrastogi"><img src="https://github.com/xmananrastogi.png" width="50px" alt="xmananrastogi" /></a><a href="https://github.com/Harish-SS56"><img src="https://github.com/Harish-SS56.png" width="50px" alt="Harish-SS56" /></a><a href="https://github.com/HemaRamachandran28"><img src="https://github.com/HemaRamachandran28.png" width="50px" alt="HemaRamachandran28" /></a><a href="https://github.com/prathiusharun"><img src="https://github.com/prathiusharun.png" width="50px" alt="prathiusharun" /></a><a href="https://github.com/BRUH-on"><img src="https://github.com/BRUH-on.png" width="50px" alt="BRUH-on" /></a><a href="https://github.com/ojasdhargave-iiitv"><img src="https://github.com/ojasdhargave-iiitv.png" width="50px" alt="ojasdhargave-iiitv" /></a><a href="https://github.com/itsrajarshi"><img src="https://github.com/itsrajarshi.png" width="50px" alt="itsrajarshi" /></a><a href="https://github.com/MaitrayeeK"><img src="https://github.com/MaitrayeeK.png" width="50px" alt="MaitrayeeK" /></a><a href="https://github.com/Rishabhworkspace"><img src="https://github.com/Rishabhworkspace.png" width="50px" alt="Rishabhworkspace" /></a><a href="https://github.com/YASHcode-IIITV"><img src="https://github.com/YASHcode-IIITV.png" width="50px" alt="YASHcode-IIITV" /></a><a href="https://github.com/sanzzzz-g"><img src="https://github.com/sanzzzz-g.png" width="50px" alt="sanzzzz-g" /></a><a href="https://github.com/latakshsariyapatidar"><img src="https://github.com/latakshsariyapatidar.png" width="50px" alt="latakshsariyapatidar" /></a><a href="https://github.com/TrivCodez"><img src="https://github.com/TrivCodez.png" width="50px" alt="TrivCodez" /></a><a href="https://github.com/toby-bridges"><img src="https://github.com/toby-bridges.png" width="50px" alt="toby-bridges" /></a>
<!-- CONTRIBUTORS_END -->
</div>

## 🧑‍🏫 Mentors

Thanks to our amazing mentors for guiding the contributors!

<div align="center">
<!-- GSSOC_MENTORS_START -->
<a href="https://github.com/srinadhtadikonda"><img src="https://github.com/srinadhtadikonda.png" width="50px" alt="srinadhtadikonda" /></a><a href="https://github.com/ritika"><img src="https://github.com/ritika.png" width="50px" alt="ritika" /></a><a href="https://github.com/CoderOggy78"><img src="https://github.com/CoderOggy78.png" width="50px" alt="CoderOggy78" /></a><a href="https://github.com/techRunnerBySJ"><img src="https://github.com/techRunnerBySJ.png" width="50px" alt="techRunnerBySJ" /></a><a href="https://github.com/thakurutkarsh22"><img src="https://github.com/thakurutkarsh22.png" width="50px" alt="thakurutkarsh22" /></a><a href="https://github.com/aanjalii01"><img src="https://github.com/aanjalii01.png" width="50px" alt="aanjalii01" /></a><a href="https://github.com/SyedImtiyaz-1"><img src="https://github.com/SyedImtiyaz-1.png" width="50px" alt="SyedImtiyaz-1" /></a><a href="https://github.com/neilblaze"><img src="https://github.com/neilblaze.png" width="50px" alt="neilblaze" /></a><a href="https://github.com/abhishekraoas"><img src="https://github.com/abhishekraoas.png" width="50px" alt="abhishekraoas" /></a><a href="https://github.com/lovestaco"><img src="https://github.com/lovestaco.png" width="50px" alt="lovestaco" /></a><a href="https://github.com/Anushreebasics"><img src="https://github.com/Anushreebasics.png" width="50px" alt="Anushreebasics" /></a><a href="https://github.com/12fahed"><img src="https://github.com/12fahed.png" width="50px" alt="12fahed" /></a><a href="https://github.com/sabeenaviklar"><img src="https://github.com/sabeenaviklar.png" width="50px" alt="sabeenaviklar" /></a><a href="https://github.com/ayu-yishu13"><img src="https://github.com/ayu-yishu13.png" width="50px" alt="ayu-yishu13" /></a><a href="https://github.com/Precise-Goals"><img src="https://github.com/Precise-Goals.png" width="50px" alt="Precise-Goals" /></a><a href="https://github.com/morningstarxcdcode"><img src="https://github.com/morningstarxcdcode.png" width="50px" alt="morningstarxcdcode" /></a><a href="https://github.com/Haile-12"><img src="https://github.com/Haile-12.png" width="50px" alt="Haile-12" /></a><a href="https://github.com/BandhiyaHardik"><img src="https://github.com/BandhiyaHardik.png" width="50px" alt="BandhiyaHardik" /></a><a href="https://github.com/deepak0x"><img src="https://github.com/deepak0x.png" width="50px" alt="deepak0x" /></a><a href="https://github.com/knoxiboy"><img src="https://github.com/knoxiboy.png" width="50px" alt="knoxiboy" /></a><a href="https://github.com/saurabh24thakur"><img src="https://github.com/saurabh24thakur.png" width="50px" alt="saurabh24thakur" /></a><a href="https://github.com/1754riya"><img src="https://github.com/1754riya.png" width="50px" alt="1754riya" /></a><a href="https://github.com/magic-peach"><img src="https://github.com/magic-peach.png" width="50px" alt="magic-peach" /></a><a href="https://github.com/lourduradjou"><img src="https://github.com/lourduradjou.png" width="50px" alt="lourduradjou" /></a><a href="https://github.com/m4milaad"><img src="https://github.com/m4milaad.png" width="50px" alt="m4milaad" /></a><a href="https://github.com/kunalverma2512"><img src="https://github.com/kunalverma2512.png" width="50px" alt="kunalverma2512" /></a><a href="https://github.com/anubhavxdev"><img src="https://github.com/anubhavxdev.png" width="50px" alt="anubhavxdev" /></a><a href="https://github.com/stealthwhizz"><img src="https://github.com/stealthwhizz.png" width="50px" alt="stealthwhizz" /></a><a href="https://github.com/DevROHIT11"><img src="https://github.com/DevROHIT11.png" width="50px" alt="DevROHIT11" /></a><a href="https://github.com/leonagoel"><img src="https://github.com/leonagoel.png" width="50px" alt="leonagoel" /></a><a href="https://github.com/SaifRasool92"><img src="https://github.com/SaifRasool92.png" width="50px" alt="SaifRasool92" /></a><a href="https://github.com/aryanbhutani26"><img src="https://github.com/aryanbhutani26.png" width="50px" alt="aryanbhutani26" /></a><a href="https://github.com/AnirbansarkarS"><img src="https://github.com/AnirbansarkarS.png" width="50px" alt="AnirbansarkarS" /></a><a href="https://github.com/Sagar-Datkhile"><img src="https://github.com/Sagar-Datkhile.png" width="50px" alt="Sagar-Datkhile" /></a><a href="https://github.com/MUKUL-PRASAD-SIGH"><img src="https://github.com/MUKUL-PRASAD-SIGH.png" width="50px" alt="MUKUL-PRASAD-SIGH" /></a><a href="https://github.com/TarunyaProgrammer"><img src="https://github.com/TarunyaProgrammer.png" width="50px" alt="TarunyaProgrammer" /></a><a href="https://github.com/preetbiswas12"><img src="https://github.com/preetbiswas12.png" width="50px" alt="preetbiswas12" /></a><a href="https://github.com/Shravanthi20"><img src="https://github.com/Shravanthi20.png" width="50px" alt="Shravanthi20" /></a><a href="https://github.com/Balaji91221"><img src="https://github.com/Balaji91221.png" width="50px" alt="Balaji91221" /></a><a href="https://github.com/whyankush07"><img src="https://github.com/whyankush07.png" width="50px" alt="whyankush07" /></a><a href="https://github.com/vanshaggarwal07"><img src="https://github.com/vanshaggarwal07.png" width="50px" alt="vanshaggarwal07" /></a><a href="https://github.com/OmkarKathile007"><img src="https://github.com/OmkarKathile007.png" width="50px" alt="OmkarKathile007" /></a><a href="https://github.com/kallal79"><img src="https://github.com/kallal79.png" width="50px" alt="kallal79" /></a><a href="https://github.com/MAYANKSHARMA01010"><img src="https://github.com/MAYANKSHARMA01010.png" width="50px" alt="MAYANKSHARMA01010" /></a><a href="https://github.com/swastik7805"><img src="https://github.com/swastik7805.png" width="50px" alt="swastik7805" /></a><a href="https://github.com/KUMARNiru007"><img src="https://github.com/KUMARNiru007.png" width="50px" alt="KUMARNiru007" /></a><a href="https://github.com/rounakkraaj-1744"><img src="https://github.com/rounakkraaj-1744.png" width="50px" alt="rounakkraaj-1744" /></a><a href="https://github.com/himanshu007-creator"><img src="https://github.com/himanshu007-creator.png" width="50px" alt="himanshu007-creator" /></a><a href="https://github.com/oasis-parzival"><img src="https://github.com/oasis-parzival.png" width="50px" alt="oasis-parzival" /></a><a href="https://github.com/Maxd646"><img src="https://github.com/Maxd646.png" width="50px" alt="Maxd646" /></a><a href="https://github.com/deepaksinghh12"><img src="https://github.com/deepaksinghh12.png" width="50px" alt="deepaksinghh12" /></a><a href="https://github.com/manan-chawla"><img src="https://github.com/manan-chawla.png" width="50px" alt="manan-chawla" /></a><a href="https://github.com/nishantxscooby"><img src="https://github.com/nishantxscooby.png" width="50px" alt="nishantxscooby" /></a><a href="https://github.com/uddalak2005"><img src="https://github.com/uddalak2005.png" width="50px" alt="uddalak2005" /></a><a href="https://github.com/iarmaanx"><img src="https://github.com/iarmaanx.png" width="50px" alt="iarmaanx" /></a><a href="https://github.com/kota-jagadeesh"><img src="https://github.com/kota-jagadeesh.png" width="50px" alt="kota-jagadeesh" /></a><a href="https://github.com/AnirudhPhophalia"><img src="https://github.com/AnirudhPhophalia.png" width="50px" alt="AnirudhPhophalia" /></a><a href="https://github.com/IkkiOcean"><img src="https://github.com/IkkiOcean.png" width="50px" alt="IkkiOcean" /></a><a href="https://github.com/Eswaramuthu"><img src="https://github.com/Eswaramuthu.png" width="50px" alt="Eswaramuthu" /></a><a href="https://github.com/SparshM8"><img src="https://github.com/SparshM8.png" width="50px" alt="SparshM8" /></a><a href="https://github.com/KaranGupta2005"><img src="https://github.com/KaranGupta2005.png" width="50px" alt="KaranGupta2005" /></a><a href="https://github.com/sparshagarwal0411"><img src="https://github.com/sparshagarwal0411.png" width="50px" alt="sparshagarwal0411" /></a><a href="https://github.com/subratamondalnsec"><img src="https://github.com/subratamondalnsec.png" width="50px" alt="subratamondalnsec" /></a><a href="https://github.com/the-matrixneo"><img src="https://github.com/the-matrixneo.png" width="50px" alt="the-matrixneo" /></a><a href="https://github.com/suvanwita"><img src="https://github.com/suvanwita.png" width="50px" alt="suvanwita" /></a><a href="https://github.com/Harsh-2006-git"><img src="https://github.com/Harsh-2006-git.png" width="50px" alt="Harsh-2006-git" /></a><a href="https://github.com/nihalawasthi"><img src="https://github.com/nihalawasthi.png" width="50px" alt="nihalawasthi" /></a><a href="https://github.com/adithyan-css"><img src="https://github.com/adithyan-css.png" width="50px" alt="adithyan-css" /></a><a href="https://github.com/xthxr"><img src="https://github.com/xthxr.png" width="50px" alt="xthxr" /></a><a href="https://github.com/Devnil434"><img src="https://github.com/Devnil434.png" width="50px" alt="Devnil434" /></a><a href="https://github.com/aayushi1806sharma-afk"><img src="https://github.com/aayushi1806sharma-afk.png" width="50px" alt="aayushi1806sharma-afk" /></a><a href="https://github.com/AditthyaSS"><img src="https://github.com/AditthyaSS.png" width="50px" alt="AditthyaSS" /></a><a href="https://github.com/Satya900"><img src="https://github.com/Satya900.png" width="50px" alt="Satya900" /></a><a href="https://github.com/JoeCelaster"><img src="https://github.com/JoeCelaster.png" width="50px" alt="JoeCelaster" /></a><a href="https://github.com/AshutoshRaj1260"><img src="https://github.com/AshutoshRaj1260.png" width="50px" alt="AshutoshRaj1260" /></a><a href="https://github.com/topshe23"><img src="https://github.com/topshe23.png" width="50px" alt="topshe23" /></a><a href="https://github.com/Ayushh-Sharmaa"><img src="https://github.com/Ayushh-Sharmaa.png" width="50px" alt="Ayushh-Sharmaa" /></a><a href="https://github.com/piyushdotcomm"><img src="https://github.com/piyushdotcomm.png" width="50px" alt="piyushdotcomm" /></a><a href="https://github.com/coder-zs-cse"><img src="https://github.com/coder-zs-cse.png" width="50px" alt="coder-zs-cse" /></a><a href="https://github.com/bishal2623"><img src="https://github.com/bishal2623.png" width="50px" alt="bishal2623" /></a><a href="https://github.com/Ayush-Patel-56"><img src="https://github.com/Ayush-Patel-56.png" width="50px" alt="Ayush-Patel-56" /></a><a href="https://github.com/Mohit-368"><img src="https://github.com/Mohit-368.png" width="50px" alt="Mohit-368" /></a><a href="https://github.com/diksha78dev"><img src="https://github.com/diksha78dev.png" width="50px" alt="diksha78dev" /></a><a href="https://github.com/Mrigakshi-Rathore"><img src="https://github.com/Mrigakshi-Rathore.png" width="50px" alt="Mrigakshi-Rathore" /></a><a href="https://github.com/itsdakshjain"><img src="https://github.com/itsdakshjain.png" width="50px" alt="itsdakshjain" /></a>
<!-- GSSOC_MENTORS_END -->
</div>

## License

This project is licensed under the **MIT License** - see the [LICENSE](./LICENSE) file for details.
