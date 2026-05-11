# Contributor Issue Drafts

This file contains ready-to-open issue ideas for maintainers. Each item is designed to be specific enough that contributors can start without needing a long clarification thread.

## 1. Add `.env.example` And Setup Consistency Checks

Suggested labels:

- `documentation`
- `area: docs`
- `good first issue`

Problem:

- contributors need a committed example env file and setup docs that stay in sync

Expected work:

- add or update `.env.example`
- align README and CONTRIBUTING setup steps
- verify all documented env vars match current app usage

Acceptance criteria:

- `.env.example` exists
- setup docs reference it clearly
- no real secrets are committed

## 2. Improve Authentication Setup Docs

Suggested labels:

- `documentation`
- `area: auth`
- `help wanted`

Problem:

- contributors often do not know how to configure GitHub and Google OAuth locally

Expected work:

- document callback URLs
- document minimum local auth variables
- add a troubleshooting subsection for common local auth failures

Acceptance criteria:

- a contributor can follow the auth docs without guessing callback URLs

## 3. Add Accessibility Labels To Icon-Only Buttons

Suggested labels:

- `bug`
- `accessibility`
- `area: playground`
- `good first issue`

Problem:

- several icon-only controls in the playground need clearer accessible labeling

Expected work:

- identify icon-only buttons in the playground shell
- add `aria-label` or equivalent accessible names
- manually verify keyboard and screen-reader discoverability

Acceptance criteria:

- affected controls expose descriptive labels

## 4. Add A Smoke Test For README Setup Artifacts

Suggested labels:

- `testing`
- `area: ci`
- `good first issue`

Problem:

- contributor-facing setup docs can drift from actual repository files

Expected work:

- expand the smoke test to assert presence of key contributor files
- keep the test narrow and stable

Acceptance criteria:

- CI fails if a required contributor artifact disappears unintentionally

## 5. Reduce Lint Warnings In `modules/dashboard/`

Suggested labels:

- `maintenance`
- `area: dashboard`
- `help wanted`

Problem:

- dashboard code contains avoidable lint warnings that increase review noise

Expected work:

- fix unused imports and low-risk lint issues in dashboard modules
- avoid behavior changes outside the cleanup

Acceptance criteria:

- warning count in the touched files decreases
- no functionality regression

## 6. Improve Collaboration Troubleshooting Docs

Suggested labels:

- `documentation`
- `area: collaboration`
- `help wanted`

Problem:

- contributors and testers need better guidance when real-time sync fails

Expected work:

- document common local and hosted collaboration failure modes
- document what logs and env vars matter most

Acceptance criteria:

- collaboration troubleshooting section is concrete and actionable

## 7. Add Better Error Messages For Missing AI Provider Keys

Suggested labels:

- `enhancement`
- `area: ai`
- `area: api`

Problem:

- API consumers and contributors need clearer feedback when provider keys are missing

Expected work:

- review `/api/chat` and related AI endpoints
- improve clarity and consistency of missing-key errors

Acceptance criteria:

- provider error responses are consistent and easy to understand

## 8. Verify Template Metadata Consistency

Suggested labels:

- `maintenance`
- `area: templates`
- `help wanted`

Problem:

- starter template keys, metadata, and directory mappings can drift

Expected work:

- compare template definitions in `lib/template.ts` and `lib/constants/templates.ts`
- identify duplicates or mismatches
- fix low-risk metadata inconsistencies

Acceptance criteria:

- no obvious duplicate or missing mappings remain in the touched scope

## 9. Add Dashboard Empty-State Regression Test Coverage

Suggested labels:

- `testing`
- `area: dashboard`
- `help wanted`

Problem:

- dashboard empty states are user-facing and easy to regress

Expected work:

- add a focused test or smoke coverage strategy for dashboard empty-state behavior
- keep scope limited to one clear state

Acceptance criteria:

- test fails if the empty-state contract breaks in the covered scenario

## 11. Clean Up `package.json` Dependencies

Suggested labels:

- `maintenance`
- `good first issue`

Problem:

- `prettier` and `@types/prettier` are listed in `dependencies` but should be in `devDependencies`.
- There are duplicate or redundant xterm-related packages (`xterm` vs `@xterm/xterm`).

Expected work:

- Move `prettier` and its types to `devDependencies`.
- Consolidate xterm dependencies if possible (ensure `@xterm/xterm` is used if migrating to v6).

Acceptance criteria:

- `package.json` reflects proper dependency categories.
- App still builds and terminal still functions correctly.

## 12. Add `aria-label` To Icon-Only Buttons In Playground Header

Suggested labels:

- `accessibility`
- `area: playground`
- `good first issue`

Problem:

- Several buttons in `modules/playground/components/playground-header.tsx` only contain icons and lack descriptive `aria-label` attributes for screen readers.

Expected work:

- Add `aria-label` to the "Back to Dashboard", "Copy Collab Link", and "AI Assistant" buttons.
- Ensure the labels match the intent (e.g., "Back to Dashboard").

Acceptance criteria:

- Buttons are accessible to screen readers with clear descriptive names.

## 13. Fix Unused Imports In `app/playground/[id]/page.tsx`

Suggested labels:

- `maintenance`
- `area: playground`
- `good first issue`

Problem:

- `app/playground/[id]/page.tsx` has numerous unused imports (e.g., `DropdownMenu`, `ArrowLeft`, `Separator`) that were likely moved to sub-components.

Expected work:

- Remove unused imports and variables identified by the linter.
- Verify the page still compiles and functions.

Acceptance criteria:

- Lint warnings for this file are significantly reduced.

## 14. Standardize `aria-label` in File Explorer Actions

Suggested labels:

- `accessibility`
- `area: playground`
- `good first issue`

Problem:

- "More actions" buttons in `modules/playground/components/playground-explorer.tsx` lack `aria-label`.

Expected work:

- Add `aria-label="More actions"` to the `MoreHorizontal` dropdown triggers in the file explorer.

Acceptance criteria:

- Each file/folder action menu is accessible via screen reader.

## 15. Refactor `usePlayground.tsx` to use `@tanstack/react-query`

Suggested labels:

- `performance`
- `area: playground`
- `technical debt`

Problem:

- The core `usePlayground` hook manually fetches data inside a `useEffect` and manages its own loading/error state. This creates a client-side waterfall and adds unnecessary complexity. The project already has `@tanstack/react-query` installed.

Expected work:

- Refactor `loadPlayground` in `modules/playground/hooks/usePlayground.tsx` to use the `useQuery` hook from React Query.
- Remove manual `isLoading` and `error` state variables from the hook.

Acceptance criteria:

- The playground loads data successfully using `useQuery`.
- State management inside `usePlayground.tsx` is simplified.

## 16. Implement React `<Suspense>` Boundaries for Playground Loading

Suggested labels:

- `performance`
- `area: playground`

Problem:

- The main playground page (`app/playground/[id]/page.tsx`) relies on a manual `if (isLoading)` block to render the `PlaygroundSkeleton`. Next.js and React 18+ recommend using `<Suspense>` boundaries for better streaming and rendering performance.

Expected work:

- Remove the manual `isLoading` check in `MainPlaygroundPage`.
- Wrap the async/heavy components inside a `<Suspense fallback={<PlaygroundSkeleton />}>` boundary.
- Or, utilize Next.js `loading.tsx` file for the route.

Acceptance criteria:

- The UI gracefully shows the skeleton loader via Suspense or `loading.tsx`.
- The `isLoading` state is no longer manually threaded through the main page component.

## 17. Fix `outline-none` Accessibility Violations

Suggested labels:

- `accessibility`
- `area: ui`
- `good first issue`

Problem:

- According to the Web Interface Guidelines, `outline-none` should never be used without a visible `focus-visible` replacement to ensure keyboard accessibility. 
- Several components (e.g., `components/ui/tabs.tsx`, `components/ui/input-group.tsx`, `modules/dashboard/components/template-selecting-modal.tsx`) use `outline-none` without providing focus styles.

Expected work:

- Search the codebase for `outline-none(?!.*focus-visible)` (using regex).
- Add `focus-visible:ring-1 focus-visible:ring-primary` (or similar appropriate styles) alongside the `outline-none` classes.

Acceptance criteria:

- Keyboard navigation (Tab key) clearly shows focus rings on all interactive elements previously hiding them.

## 18. Secure Unauthenticated AI and Deployment API Routes

Suggested labels:

- `security`
- `area: api`
- `area: ai`
- `priority: high`

Problem:

- According to Vercel React Best Practices (`server-auth-actions`), server actions and API routes must verify user authentication before performing privileged operations.
- Currently, endpoints like `app/api/chat/route.ts`, `app/api/completion/route.ts`, and `app/api/deploy/vercel/route.ts` rely solely on IP-based rate limiting. If a user does not provide a custom `userApiKey`, the server blindly falls back to environment variables like `process.env.GEMINI_API_KEY` or `process.env.VERCEL_MASTER_TOKEN`.
- This leaves the maintainer's paid API limits completely exposed to the public internet.

Expected work:

- Import `auth` from `auth.ts` inside these API routes.
- Add an authentication check (e.g., `const session = await auth(); if (!session) return new NextResponse(...)`) before allowing the fallback to `process.env` tokens.
- Ensure legitimate unauthenticated users (if intended) are strictly limited to using their own provided `userApiKey`.

Acceptance criteria:

- The API routes throw a `401 Unauthorized` if a user without a valid session attempts to use the server's fallback API keys.
- Rate limiting is still maintained as a secondary defense.

## 19. Optimize Bundle Size by Decoupling `templates.ts` Metadata

Suggested labels:

- `performance`
- `area: templates`
- `technical debt`

Problem:

- The `lib/constants/templates.ts` file contains a massive static array of project templates, including long descriptions, IDs, and metadata.
- This file is directly imported into client components and server components across the landing page (`app/(root)/page.tsx`) and the dashboard. According to Vercel React Best Practices (`bundle-dynamic-imports` and `server-serialization`), bundling large static data structures directly into page components heavily bloats the initial JavaScript bundle.

Expected work:

- Refactor how template metadata is consumed. Instead of directly importing the massive array everywhere, load the templates using a Server Component fetch or a targeted Server Action.
- Ensure the client only receives the exact data it needs (e.g., stripping out unnecessary metadata if only the ID and name are required).

Acceptance criteria:

- `templates.ts` is removed from direct client bundle imports.
- Next.js build analyzer shows a reduction in the initial chunk size for the root and templates pages.

## 20. Centralize WebContainer Boot State with Zustand

Suggested labels:

- `architecture`
- `area: webcontainers`
- `help wanted`

Problem:

- The `modules/webcontainers/hooks/useWebContainer.ts` file manages the WebContainer initialization using a module-level singleton (`let webContainerInstance: WebContainer | null = null;`) and complex internal hook state.
- As defined in advanced React patterns (`advanced-init-once`), managing global initialization state inside a localized hook can lead to race conditions, hydration issues during hot-reloads, and makes it very difficult for other disparate components (like the terminal and the preview window) to predictably listen to boot status without prop drilling.

Expected work:

- The project already has `zustand` installed. Create a global Zustand store (e.g., `useWebContainerStore`) to manage the booting status, the instance itself, and the error state.
- Refactor `useWebContainer.ts` to sync with and read from this global store.

Acceptance criteria:

- WebContainer boot logic and instance storage are handled safely in a global Zustand store.
- Components consuming the WebContainer avoid race conditions during simultaneous mounts.
