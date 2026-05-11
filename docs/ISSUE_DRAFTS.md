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

## 10. Document Starter Template Contribution Rules

Suggested labels:

- `documentation`
- `area: templates`
- `good first issue`

Problem:

- contributors need a clear rule set before modifying or adding starter templates

Expected work:

- document where starter templates live
- document expectations for naming, metadata, and scope
- explain when a starter-template change belongs in a separate PR

Acceptance criteria:

- contributors can understand the starter-template workflow without maintainer back-and-forth
