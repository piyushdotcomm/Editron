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
