# Active Context — Excalidraw Monorepo

## Current Focus

**Building the Memory Bank documentation layer** to enable AI-assisted
development on the Excalidraw codebase.

No feature development or bug-fix work is in progress. The current effort is
purely about establishing context files that allow AI agents to orient
themselves quickly across sessions.

## Recent Changes

| Item | Status | Notes |
|------|--------|-------|
| `docs/memory/projectbrief.md` | Created | Monorepo structure, key capabilities, deployment targets |
| `docs/memory/techContext.md` | Created | Dependencies, build tooling, scripts, env vars, TS config |
| `docs/memory/systemPatterns.md` | Created | Architecture, state management, rendering, testing patterns |
| `docs/memory/productContext.md` | Created | Target users, UX philosophy, key workflows |
| `docs/memory/progress.md` | Created | Feature completion status, in-progress work, known debt |
| `docs/memory/decisionLog.md` | Created | Key architectural decisions with rationale |
| `docs/memory/activeContext.md` | Created | This file — current work snapshot |
| `docs/product/PRD.md` | Created | Reverse-engineered PRD: goals, audience, features, limitations, competitive positioning |
| `docs/technical/dev-setup.md` | Created | Developer setup guide: local dev, building, testing, deployment |

## Next Steps

1. **Review Memory Bank completeness** — read through all seven files and
   cross-check against the actual codebase for accuracy gaps.
2. **Runtime verification** — run `yarn test:all` and `yarn build` to confirm
   that documented scripts and configs behave as described.
3. **Identify improvement areas** — with the codebase fully documented, surface
   candidates for feature work, refactoring, or quality improvements.
4. **Begin development work** — pick a first task (e.g., address known technical
   debt, add E2E tests, improve coverage, accessibility audit).

## Active Blockers / Risks

| Risk | Severity | Notes |
|------|----------|-------|
| Memory Bank built from static analysis only | Low | No runtime verification yet — scripts, build outputs, and test results have not been confirmed by execution |
| No feature branch or PR context | Info | The Memory Bank is being created on the default branch; no feature work is in flight |

## Key Context for Next Session

- **Seven Memory Bank files** now exist in `docs/memory/`. Start by reading them
  to get oriented.
- The codebase is a **Yarn 1 monorepo** — run `yarn install` at the root before
  any dev commands.
- The **app** is in `excalidraw-app/`; the **library** is in
  `packages/excalidraw/`. They have different build tools (Vite vs esbuild).
- State management uses **Jotai** with two isolated stores (`editor-jotai` and
  `app-jotai`). Direct `jotai` imports are ESLint-forbidden.
- No E2E test suite is visible in the repo — only unit/integration tests via
  Vitest.
