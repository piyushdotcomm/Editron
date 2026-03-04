# Editron Project Audit Report

> Generated from 6 installed agent skills. Recommendations are prioritized by severity and mapped to specific Editron files.

---

## 🚫 CRITICAL — Must Fix

| # | Category | Issue | File(s) | Skill Source |
|---|----------|-------|---------|-------------|
| 1 | **Security** | AI chat API routes have **no rate limiting** — anyone can spam `/api/chat` and burn through API keys | `app/api/chat/route.ts`, `app/api/completion/route.ts` | Backend Patterns |
| 2 | **Security** | No **input length validation** on `content` field in `edit_file` / `edit_multiple_files` tools — AI could receive unbounded payloads | `app/api/chat/route.ts` | Code Review |
| 3 | **Accessibility** | **No skip-to-content link** on landing page — keyboard users must tab through entire navbar | `app/(root)/page.tsx` | Accessibility |
| 4 | **Accessibility** | **No `prefers-reduced-motion` respect** — hero animations, GlowingEffect, and float keyframes play regardless of user settings | `app/globals.css` | Accessibility |
| 5 | **TypeScript** | Multiple `as any` type assertions across Yjs binding code suppress real type errors | `playground-editor.tsx` | TS React Reviewer |
| 6 | **Performance** | **No Error Boundary** wrapping the Monaco Editor or AI Chat — a crash in either takes down the entire playground page | `app/playground/[id]/page.tsx` | React Best Practices |

---

## ⚠️ HIGH — Should Fix Before Next Release

| # | Category | Issue | File(s) | Skill Source |
|---|----------|-------|---------|-------------|
| 7 | **Backend** | API routes use raw `catch (error: any)` — should use a **centralized error handler** with structured JSON responses | `app/api/chat/route.ts` | Backend Patterns |
| 8 | **Accessibility** | Icon-only buttons in playground toolbar **lack `aria-label`** (e.g., file explorer toggles, theme switches) | Various playground components | Accessibility |
| 9 | **Accessibility** | The AI Chat Sheet panel has no **`aria-live` region** for announcing new AI messages to screen readers | `ai-chat-panel.tsx` | Accessibility |
| 10 | **Performance** | `collectFilePaths()` is called on **every render** inside the `useChat` body config — should be memoized | `ai-chat-panel.tsx` | React Best Practices |
| 11 | **Performance** | Landing page loads **all templates** then filters — should use server-side filtering or pagination | `app/(root)/page.tsx` | Backend Patterns |
| 12 | **TypeScript** | `useChat()` return type is cast with `as any` — loses all type safety on messages, input, etc. | `ai-chat-panel.tsx` | TS React Reviewer |
| 13 | **Testing** | **Zero test files** exist in the project — no unit tests, no E2E, no smoke test | Entire project | Playwright Testing |
| 14 | **Code Quality** | Hidden scrollbars via `scrollbar-width: none` on `*` selector harms users who rely on visible scrollbars | `app/globals.css` | Accessibility |

---

## 📝 MEDIUM — Improve When Possible

| # | Category | Issue | File(s) | Skill Source |
|---|----------|-------|---------|-------------|
| 15 | **Performance** | Feature grid cards create **GlowingEffect** instances per-card — should check if `requestAnimationFrame` listeners are cleaned up | `modules/home/features.tsx` | React Best Practices |
| 16 | **Backend** | No **structured logging** in API routes — errors are `console.error` strings instead of JSON | `app/api/chat/route.ts` | Backend Patterns |
| 17 | **Accessibility** | Landing page `<nav>` may lack `aria-label="Main navigation"` attribute | `app/(root)/page.tsx` | Accessibility |
| 18 | **Code Quality** | `playground-editor.tsx` is likely **300+ lines** — should be split into smaller hooks (`useYjsBinding`, `useMonacoSetup`) | `playground-editor.tsx` | TS React Reviewer |
| 19 | **Performance** | No `next/dynamic` lazy loading on heavy components like Monaco Editor or AI Chat Panel | `app/playground/[id]/page.tsx` | React Best Practices |
| 20 | **TypeScript** | `tsconfig.json` likely missing `noUncheckedIndexedAccess` — array access returns `T` instead of `T | undefined` | `tsconfig.json` | TS React Reviewer |
| 21 | **Security** | WebSocket collab server debug logs may leak auth tokens to stdout in production | `server/collab.ts` | Code Review |
| 22 | **Code Quality** | `useAI.ts` Zustand store mixes UI state (`isChatOpen`) with data state (`chatMessages`) — should separate concerns | `modules/playground/hooks/useAI.ts` | TS React Reviewer |

---

## 💡 LOW — Nice to Have

| # | Category | Issue | File(s) | Skill Source |
|---|----------|-------|---------|-------------|
| 23 | **Testing** | Add `window.__TEST__` seam for E2E testability of the playground | `app/playground/[id]/page.tsx` | Playwright Testing |
| 24 | **Performance** | Use `content-visibility: auto` for the feature grid to skip off-screen rendering | `modules/home/features.tsx` | React Best Practices |
| 25 | **Backend** | Consider **Repository Pattern** for Prisma queries instead of inline `prisma.xxx` calls | Various API routes | Backend Patterns |
| 26 | **Accessibility** | Add `role="alert"` to Sonner toast container for screen reader announcements | `app/layout.tsx` | Accessibility |
| 27 | **Performance** | Use `Promise.all()` for parallel data fetching where multiple independent queries exist | Server components | React Best Practices |

---

## Recommended Implementation Order

> [!TIP]
> Start with **Critical items 1–6** for maximum security and UX impact. Then tackle **High items 7–14** before deploying to production.

### Phase 1: Security Hardening (Items 1, 2, 7, 21)
- Add rate limiter to `/api/chat` and `/api/completion`
- Add input length validation on AI tool payloads
- Create centralized error handler
- Remove debug logs from collab server for production

### Phase 2: Accessibility (Items 3, 4, 8, 9, 14)
- Add skip-to-content link
- Add `prefers-reduced-motion` media query
- Add `aria-label` to icon buttons
- Add `aria-live` to AI chat messages
- Fix scrollbar visibility

### Phase 3: Performance & Stability (Items 6, 10, 11, 19)
- Wrap Monaco Editor in Error Boundary
- Memoize `collectFilePaths`
- Add `next/dynamic` for heavy components
- Server-side filter templates

### Phase 4: Testing Foundation (Items 13, 23)
- Create first smoke test with Playwright
- Add `window.__TEST__` seam

### Phase 5: Code Quality (Items 5, 12, 18, 20, 22)
- Fix `as any` casts
- Split large components
- Enable strict TypeScript flags
- Separate Zustand concerns
