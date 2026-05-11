# Maintainer Label Guide

This file suggests a practical label system for Editron so contributors can find the right issues quickly and maintainers can triage consistently.

## Core Labels

### Issue type

- `bug`: broken behavior or regression
- `enhancement`: improvement to an existing capability
- `feature`: new capability
- `documentation`: docs-only work
- `question`: issue is primarily clarification or discussion
- `maintenance`: cleanup, refactor, or repository upkeep

### Contributor guidance

- `good first issue`: safe and approachable for first-time contributors
- `help wanted`: maintainers want outside contributions
- `needs reproduction`: issue report is incomplete or not yet reproducible
- `needs discussion`: do not implement before maintainer confirmation
- `blocked`: waiting on another issue, decision, or external dependency

### Priority

- `priority: high`
- `priority: medium`
- `priority: low`

### Area labels

- `area: playground`
- `area: editor`
- `area: ai`
- `area: dashboard`
- `area: auth`
- `area: collaboration`
- `area: api`
- `area: templates`
- `area: docs`
- `area: ci`

### Quality labels

- `accessibility`
- `performance`
- `security`
- `testing`
- `ui-ux`

## Label Usage Rules

Use at least:

- one type label
- one area label

Add when useful:

- one contributor-guidance label
- one priority label

Example:

- `bug`
- `area: playground`
- `priority: high`

Example first-contribution issue:

- `documentation`
- `area: docs`
- `good first issue`
- `help wanted`
- `priority: low`

## What Should Count As `good first issue`

A `good first issue` should be:

- narrow in scope
- low risk
- easy to verify
- understandable without deep repo knowledge

Good examples:

- fix a docs inconsistency
- add a missing aria label
- improve one small dashboard interaction
- add a smoke test for a simple scenario

Bad examples:

- refactor the AI system
- redesign auth
- change Prisma schema shape
- modify many starter templates together

## Suggested Initial GitHub Labels To Create

Create these first:

- `bug`
- `enhancement`
- `feature`
- `documentation`
- `maintenance`
- `good first issue`
- `help wanted`
- `needs reproduction`
- `needs discussion`
- `priority: high`
- `priority: medium`
- `priority: low`
- `area: playground`
- `area: editor`
- `area: ai`
- `area: dashboard`
- `area: auth`
- `area: collaboration`
- `area: api`
- `area: templates`
- `area: docs`
- `area: ci`
- `accessibility`
- `performance`
- `security`
- `testing`
- `ui-ux`

## Triage Flow For Maintainers

When a new issue arrives:

1. decide whether it is a bug, enhancement, feature, docs, or question
2. assign one primary area
3. assign a priority
4. mark it `needs reproduction` if the report is incomplete
5. mark it `good first issue` only if it is genuinely approachable

Consistency matters more than having dozens of labels.
