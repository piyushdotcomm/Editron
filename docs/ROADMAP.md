# Editron Roadmap

This roadmap is intended for contributors and maintainers. It shows where effort is most useful, which areas are stable enough for outside contributions, and which areas need maintainer discussion before large changes are started.

> [!NOTE]
> This is a planning document, not a release contract. Priorities may move based on bugs, contributor availability, and production issues.

## Current Priorities

### 1. Repository health and contributor onboarding

Goal:

- reduce friction for first-time contributors
- keep the repository mergeable under protected-branch rules

Focus areas:

- improve docs and local setup
- add more smoke and integration tests
- reduce lint warnings in core application code
- improve issue labeling and triage

Good contribution types:

- docs fixes
- CI improvements
- small lint cleanups
- test additions

### 2. Playground stability

Goal:

- make the editor, preview, file explorer, and template flows more reliable

Focus areas:

- file rename and delete stability
- preview refresh consistency
- package installation and terminal behavior
- better save and restore behavior for playground state

Good contribution types:

- targeted bug fixes
- manual regression tests
- error-state improvements

### 3. AI workflow hardening

Goal:

- make AI-assisted editing safer, more predictable, and easier to debug

Focus areas:

- request validation
- tool-call safety
- better model/provider error messages
- rate-limit and fallback behavior

Good contribution types:

- API route validation
- error handling improvements
- test coverage for AI route helpers

### 4. Collaboration improvements

Goal:

- make real-time collaboration easier to operate and easier to contribute to

Focus areas:

- connection reliability
- persistence behavior
- clearer deployment guidance for the collab server
- debugging and local verification flows

Good contribution types:

- collaboration troubleshooting docs
- small server hardening fixes
- connection and reconnection behavior fixes

## Medium-Term Work

### UI and accessibility polish

Areas:

- keyboard accessibility
- icon-button labeling
- motion and reduced-motion support
- dashboard polish
- mobile responsiveness in editor-adjacent layouts

### Test coverage expansion

Areas:

- API route tests
- dashboard action tests
- playground behavior tests
- collaboration smoke tests

### Performance improvements

Areas:

- large component splitting
- reducing heavy client bundles
- preview and editor startup improvements
- template-loading optimizations

## Longer-Term Ideas

### Better project import and export workflows

- stronger GitHub import support
- improved archive handling
- safer repo parsing and validation

### More robust starter-template lifecycle

- starter-template validation checks
- contributor guidance for adding templates
- consistency rules across template metadata and paths

### Operational maturity

- code scanning
- broader CI matrix
- deployment-health checks
- stricter lint and test enforcement after backlog reduction

## Contribution Scope Guidance

### Usually safe for contributors

- documentation
- tests
- dashboard UX fixes
- small API route fixes
- editor-side bug fixes with clear reproduction
- isolated starter-template corrections

### Needs maintainer discussion first

- Prisma schema redesign
- auth architecture changes
- major AI route refactors
- broad changes across many starter templates
- collaboration protocol changes
- major build-system changes

## Suggested Milestone Structure

Maintainers can use these milestone themes in GitHub:

- `Onboarding and Docs`
- `Playground Stability`
- `AI Reliability`
- `Collaboration`
- `Testing and CI`
- `Accessibility and UX`

## Definition Of A Good Community Contribution

A useful PR usually does at least one of these clearly:

- fixes one reproducible bug
- adds or improves one focused test path
- improves contributor setup or maintainership docs
- improves safety or validation without changing unrelated behavior

The best contributions are narrowly scoped, well explained, and easy to verify.
