# Progress — project status

## What “progress” means here

Below is **what exists in the current codebase** (not a roadmap or external backlog status). For release milestones or course deadlines, add a separate subsection manually.

## Implemented in the repository (high level)

- **Monorepo** with app and packages (`yarn workspaces` — root `package.json`).
- **SPA product** `excalidraw-app`: Vite, React 19, production build in `build/`, preview / static serve.
- **`@excalidraw/excalidraw` library:** React editor component, conditional dev/prod exports, build via `scripts/buildPackage.js`.
- **Dependency packages:** `@excalidraw/common`, `math`, `element`, `utils` with ESM builds and types.
- **Editor:** canvas, tools, UI layers, welcome screen, zen / view modes (state and props in `packages/excalidraw`).
- **Collaboration and sharing** in the app: `collab/`, `share/`, wired through `Collab.tsx` / `ShareDialog.tsx`.
- **Local data:** IndexedDB (`idb-keyval`), library adapters in shell `App.tsx`.
- **PWA:** service worker registration in `excalidraw-app/index.tsx`.
- **Error monitoring:** Sentry in app dependencies, init via `excalidraw-app/sentry`.
- **Integration examples:** `examples/with-nextjs`, `examples/with-script-in-browser`.
- **Docker:** nginx image for static assets (`Dockerfile`).
- **Quality:** ESLint, Prettier, TypeScript `strict`, Vitest + coverage thresholds (`vitest.config.mts`), GitHub Actions.

## Test coverage (as configured)

- Coverage thresholds: lines 60%, branches 70%, functions 63%, statements 60% (`vitest.config.mts`).
- Tests live under `packages/*` and root `setupTests.ts`.

## Often “in flight” on forks

- Syncing with upstream Excalidraw (if this is a fork).
- Course- or product-specific changes not tracked in this file.

## Manual update section

- **Last stable release / tag:** _…_
- **Current WIP:** _…_

## Sources in code

- Root `package.json` — scripts and workspace layout.
- `excalidraw-app/package.json` — app dependencies.
- `packages/excalidraw/package.json` — public editor package.
- `vitest.config.mts` — tests and coverage.
- `.github/workflows/` — CI automation.
