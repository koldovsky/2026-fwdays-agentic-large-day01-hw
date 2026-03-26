# Decision log — key decisions

Format: **decision → rationale (as seen in code / config) → where recorded**. These are not official team ADRs; they are architectural choices extracted from the repository.

## Platform and repository

| Decision | Why (observed) | Where |
|----------|----------------|-------|
| **Yarn Classic workspaces** | One lockfile, shared deps for app + packages + examples | Root `package.json` (`workspaces`, `packageManager`) |
| **Node ≥ 18** | Minimum version for build and CI | `engines` in root and `excalidraw-app` |

## Build and development

| Decision | Why (observed) | Where |
|----------|----------------|-------|
| **Vite for `excalidraw-app`** | Fast dev server, React plugins, PWA, EJS/HTML, type checking in dev | `excalidraw-app/vite.config.mts`, root devDependencies |
| **Alias `@excalidraw/*` → source TypeScript** in dev | Instant edits without rebuilding packages while working on the app | `vite.config.mts` (`resolve.alias`) |
| **esbuild for library packages** | Single pipeline for dev/prod bundles + Sass; separate from the Vite app | `scripts/buildPackage.js` |
| **Conditional exports `development` / `production`** | npm consumers get different artifacts by mode | `packages/*/package.json` → `exports` |
| **Split locale chunks** | Cache languages separately from core; `en` + `percentages` kept for first load / offline | `manualChunks` in `vite.config.mts` (comment in file) |

## State and React

| Decision | Why (observed) | Where |
|----------|----------------|-------|
| **Separate Jotai store for app shell** | Global sharing, collab, quota, etc. without mixing into editor internals | `excalidraw-app/app-jotai.ts`, `Provider` in `App.tsx` |
| **`ExcalidrawAPIProvider` outside `<Excalidraw>` tree** | Imperative API from shell (theme, language, library) | `packages/excalidraw/index.tsx` (comment + implementation) |
| **`EditorJotaiProvider` in editor package** | Isolated editor UI state | `packages/excalidraw/index.tsx`, `editor-jotai` |
| **`TopErrorBoundary` around the app** | Catch React errors at the top level | `excalidraw-app/App.tsx` |

## Product and UX safety

| Decision | Why (observed) | Where |
|----------|----------------|-------|
| **Disable collaboration in iframe** | Avoid unwanted or unsafe embed scenarios | `isRunningInIframe()` → `isCollabDisabled` in `excalidraw-app/App.tsx` |
| **Dedicated route / window for Plus export** | Isolated export flow for the cloud product | `ExcalidrawPlusIframeExport`, `pathname` check in `App.tsx` |

## Tests

| Decision | Why (observed) | Where |
|----------|----------------|-------|
| **Same path aliases as Vite** | Identical import resolution in tests and app | `vitest.config.mts` |
| **jsdom + canvas mock** | Editor and export rely on Canvas API | `vitest.config.mts`, `setupTests.ts` |
| **Parallel Vitest hooks** | Monorepo needs hooks run in parallel | `sequence.hooks: parallel` comment in `vitest.config.mts` |

## Code style (agreed rules)

| Decision | Where recorded |
|----------|----------------|
| TypeScript, functional components, CSS modules for styles | `.github/copilot-instructions.md` |

## How to extend this log

Add new table rows or short dated entries when you adopt **new** architectural decisions (not every PR).

## Sources

- `excalidraw-app/vite.config.mts`, `excalidraw-app/App.tsx`, `excalidraw-app/app-jotai.ts`
- `packages/excalidraw/index.tsx`, `scripts/buildPackage.js`
- `vitest.config.mts`, `setupTests.ts`
- Root and package `package.json` files
- `.github/copilot-instructions.md`
