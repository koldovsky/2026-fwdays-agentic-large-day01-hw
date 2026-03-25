# Active Context

## Current Development State

**As of:** 2026-03-25
**Branch:** `master`
**Version:** 0.18.0 (all packages)
**Last commits:** `4451b1e updates`, `da795d2 check-instructions`, `5247322 initial`

## Recent Activity
The repository appears to be a recent clone / homework project (`2026-fwdays-agentic-large-day01-hw`) based on the Excalidraw open-source codebase. Only 4 commits exist, suggesting this is either a fork for educational purposes or early-stage development.

## Active Focus Areas

### Nothing explicitly in-progress
No feature branches, no open PRs, no TODO markers found in the codebase at initialization time.

## Key Files to Know When Making Changes

| Change Type | Key Files |
|-------------|-----------|
| New canvas element type | `packages/element/src/`, `packages/excalidraw/actions/` |
| UI component | `packages/excalidraw/components/` |
| Collaboration behavior | `excalidraw-app/collab/Collab.tsx` |
| State atom | `excalidraw-app/app-jotai.ts` or `packages/excalidraw/editor-jotai.ts` |
| Persistence logic | `excalidraw-app/data/` |
| Translations | `packages/excalidraw/locales/` |
| Build config | `excalidraw-app/vite.config.mts` |
| Test setup | `setupTests.ts`, `vitest.config.mts` |

## Known Constraints
- Canvas rendering is **not SSR-compatible** — always use client-side only
- Jotai must be accessed through local wrappers (ESLint enforced)
- File upload limit: **4 MiB**
- PWA max cached file size: **2.3 MB**
- Node ≥ 18 required
