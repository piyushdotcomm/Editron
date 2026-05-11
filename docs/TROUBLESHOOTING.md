# Troubleshooting

This guide covers the most common local setup and contribution problems in Editron.

## Quick Checks

Before debugging deeper:

- confirm you are using a supported Node.js version
- confirm `npm install` completed successfully
- confirm your `.env` values are present
- confirm MongoDB is reachable
- confirm you ran:

```bash
npx prisma generate
npx prisma db push
npm run dev
```

## Local Setup Issues

### `npm install` fails

Check:

- Node.js version
- npm version
- registry connectivity
- lockfile consistency

Recommended:

```bash
node -v
npm -v
```

If dependencies are corrupted locally:

- delete `node_modules`
- run `npm install` again

### Prisma client errors

Symptoms:

- Prisma client import failures
- schema/client mismatch

Fix:

```bash
npx prisma generate
```

If the database schema also needs syncing:

```bash
npx prisma db push
```

### MongoDB connection issues

Symptoms:

- auth errors
- timeout on startup
- route failures that touch Prisma

Check:

- `DATABASE_URL` exists
- your MongoDB instance is running or reachable
- the connection string user has permissions

## Auth And OAuth Issues

### Sign-in does not work

Check these variables:

- `AUTH_SECRET`
- `AUTH_URL`
- `AUTH_GITHUB_ID`
- `AUTH_GITHUB_SECRET`
- `AUTH_GOOGLE_ID`
- `AUTH_GOOGLE_SECRET`

For local development:

- `AUTH_URL` is usually `http://localhost:3000`
- your OAuth app callback URLs must match the local URL exactly

### Redirect or host-trust issues

If auth behaves differently behind proxies or hosted environments, check:

- `AUTH_TRUST_HOST`
- `AUTH_URL`

## AI Provider Issues

### AI chat returns key/configuration errors

Check:

- `GEMINI_API_KEY`
- `GROQ_API_KEY`
- `MISTRAL_API_KEY`

Remember:

- users can provide keys inside the UI
- the server can also use fallback environment keys

If you are debugging route behavior locally, make sure at least one provider has a valid key configured.

### AI route works locally but fails in PR review

Likely causes:

- missing env vars
- provider-specific quota or auth issues
- request validation errors

When contributing:

- document which provider you tested
- include route error details in the PR if relevant

## Collaboration Server Issues

### Collaboration does not connect

Check:

- the collab server actually started from `npm run dev`
- `NEXT_PUBLIC_COLLAB_SERVER_URL` is correct if you are overriding the default
- no firewall or proxy is blocking WebSocket traffic

The local app also proxies collaboration traffic through the Next.js app using the `/api/collab/:path*` rewrite.

### Hosted collaboration works differently from local

Check:

- `NEXT_PUBLIC_COLLAB_SERVER_URL`
- `render.yaml`
- `Dockerfile.collab`

If local is fine but hosted fails, compare the collaboration host URL and database connectivity for the collab service.

## WebContainer And Preview Issues

### Preview does not refresh

Check:

- the relevant file actually saved
- the terminal shows the dev server running inside the WebContainer
- there are no package install failures in the terminal

### Terminal or package install behaves strangely

Likely causes:

- broken package metadata in the starter template
- network/package resolution issues inside the WebContainer
- project-specific runtime errors

When reporting:

- mention the exact starter template used
- include terminal output

### Browser limitations

WebContainer-based workflows may behave differently depending on:

- browser
- tab memory pressure
- cross-origin embedding behavior

If something feels environment-specific, always include:

- browser name and version
- operating system
- whether this is local or deployed

## Build And CI Issues

### `npm run lint` fails

The current repository still has warning debt, but core lint failures should be fixed before merge.

If your change introduces new lint failures:

- fix them instead of suppressing them by default
- keep changes scoped to the area you touched

### `npm test` fails

Current tests are baseline smoke tests. Failures usually mean:

- contributor docs or repository structure assumptions changed
- a file used by the smoke tests moved or disappeared

If you intentionally change repository structure, update the tests in the same PR.

### `npm run build` fails

Check:

- env variable presence
- route imports
- server-only code leaking into client code
- issues around external providers or metadata

If a build only fails in CI:

- compare your local env against `.github/workflows/ci.yml`
- check whether your change depends on secrets or local-only setup

## Starter Template Issues

### New project starts from the wrong files

Check:

- `lib/template.ts`
- `lib/constants/templates.ts`
- the corresponding directory under `editron-starters/`

The template key, metadata entry, and directory path must stay aligned.

### Template-specific runtime issues

When filing or fixing template issues, always include:

- template name
- exact commands run
- terminal output
- whether the issue is local-only or reproducible in deployed Editron

## When To Ask For Maintainer Help

Ask before proceeding if your fix involves:

- auth architecture
- Prisma schema changes
- broad AI route changes
- collaboration-server protocol changes
- cross-cutting starter-template refactors

That usually saves time for everyone.
