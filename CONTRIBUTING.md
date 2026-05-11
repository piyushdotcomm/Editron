# Contributing to Editron

Thank you for contributing to Editron. This document is written for open-source contributors, GSSoC participants, reviewers, and maintainers who need a clear path from issue selection to merge-ready pull request.

## Before You Start

Please read:

- [README.md](./README.md) for project overview and setup
- [SECURITY.md](./SECURITY.md) before reporting sensitive issues
- [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md) for expected community behavior

## Contribution Types

We welcome:

- bug fixes
- UI and UX improvements
- editor and WebContainer improvements
- AI workflow improvements
- performance work
- accessibility fixes
- tests and CI improvements
- documentation improvements
- starter template fixes when clearly scoped

## Development Setup

### 1. Fork and clone

```bash
git clone https://github.com/<your-username>/Editron.git
cd Editron
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy the example file and then fill in the values:

```bash
cp .env.example .env
```

If you are on PowerShell:

```powershell
Copy-Item .env.example .env
```

Use the full variable set below so your local environment matches the supported app configuration:

```env
NEXT_PUBLIC_COLLAB_SERVER_URL=
AUTH_TRUST_HOST=

GEMINI_API_KEY=
GROQ_API_KEY=
MISTRAL_API_KEY=

DATABASE_URL=
AUTH_SECRET=
AUTH_URL=

AUTH_GITHUB_ID=
AUTH_GITHUB_SECRET=

AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=
```

Typical local defaults:

- `DATABASE_URL`: your local or hosted MongoDB connection string
- `AUTH_SECRET`: any strong random secret for local auth
- `AUTH_URL`: usually `http://localhost:3000`
- `AUTH_TRUST_HOST`: often `true` behind proxies, otherwise leave based on your setup
- `NEXT_PUBLIC_COLLAB_SERVER_URL`: leave empty for default local behavior unless you run a separate hosted collaboration server

### 4. Prepare the database

```bash
npx prisma generate
npx prisma db push
```

### 5. Start the app

```bash
npm run dev
```

This starts both:

- the Next.js development server
- the collaboration server used for real-time editing

## Repository Structure

Use this as a practical guide when choosing where to work:

- `app/`: routes, layouts, and API handlers
- `modules/`: feature-domain logic
- `components/`: shared UI building blocks
- `lib/`: reusable server and client helpers
- `server/`: standalone collaboration backend
- `editron-starters/`: starter project library for user-created playgrounds
- `tests/`: repository tests

## How To Pick Work

### For first-time contributors

Start with:

- small UI fixes
- docs improvements
- accessibility issues
- narrow dashboard or profile bugs
- self-contained test additions

Avoid these for a first contribution unless already discussed with a maintainer:

- broad refactors
- auth rewrites
- Prisma schema redesigns
- starter-template mass changes
- large AI or editor architecture changes

### Before implementing

- check for an existing issue
- comment on the issue if you plan to work on it
- ask for clarification if requirements are ambiguous

## Branching

Create a branch from `main`.

Recommended branch naming:

- `fix/<short-description>`
- `feat/<short-description>`
- `docs/<short-description>`
- `test/<short-description>`
- `refactor/<short-description>`

Examples:

- `fix/dashboard-star-toggle`
- `docs/update-contributing-guide`
- `test/add-playground-smoke-check`

## Coding Standards

These repository rules matter during review:

- Keep files under 500 lines where practical.
- Do not commit secrets or credentials.
- Validate input at system boundaries.
- Use typed interfaces for public APIs.
- Avoid unrelated refactors in the same pull request.
- Preserve existing design patterns unless you are intentionally improving them.

### Project-specific expectations

- If you touch API routes, validate request payloads and keep error responses structured.
- If you touch auth or database flows, avoid weakening access checks.
- If you touch `editron-starters/`, keep the change narrow and explain why it belongs in the bundled starter inventory.
- If you touch the playground/editor stack, test the affected flow manually.

## Tests and Verification

Before opening a PR, run the relevant checks:

```bash
npm run lint
npm test
npm run build
```

Notes:

- `lint` is enforced in CI.
- `test` is currently a repository smoke-test baseline and will expand over time.
- `build` must pass before merging into protected branches.

Also do targeted manual verification for the feature you changed. Examples:

- authentication flow
- dashboard interactions
- template creation flow
- AI prompt and response flow
- collaboration connection flow
- file editing and preview flow

## Working With Issues

When fixing an issue:

- reference the issue number in your PR description
- explain the root cause
- explain the fix
- list the checks you ran

If you are unsure whether an issue is still valid, ask before implementing a deep fix.

## Documentation Contributions

Docs improvements are welcome and important.

If you update docs:

- prefer specific, verifiable instructions
- keep environment variable names exact
- mention prerequisites clearly
- avoid promising behavior the current code does not provide

## Pull Request Expectations

Open focused pull requests. Smaller PRs review faster and merge with less risk.

A good PR should include:

- what changed
- why it changed
- screenshots or recordings for UI work
- test and verification notes
- linked issue, if any

Avoid combining:

- docs + refactor + feature + template changes

unless the pieces are tightly coupled and necessary together.

## Review Process

Maintainers may ask for:

- scope reduction
- clearer naming
- additional validation
- tests
- UI screenshots
- follow-up cleanups in a separate PR

An approval does not guarantee immediate merge. Merge timing depends on project priorities, release risk, and branch health.

## Security Reporting

Do not open public issues for vulnerabilities involving:

- secrets
- authentication bypass
- privilege escalation
- injection risks
- insecure file handling
- account/session abuse

Use the process described in [SECURITY.md](./SECURITY.md).

## Good First PR Checklist

Before you submit:

- sync with the latest `main`
- keep the PR focused
- run `npm run lint`
- run `npm test`
- run `npm run build`
- update docs if behavior changed
- include screenshots for UI changes
- avoid committing `.env`, logs, local scratch files, or editor state

## Maintainer Notes For Contributors

Editron is a feature-dense repository. Precision matters more than speed.

The most helpful contributions are the ones that:

- solve one clear problem
- preserve existing behavior outside the fix
- include enough explanation for maintainers to review quickly

If you are unsure, open a draft PR early and ask for feedback.
