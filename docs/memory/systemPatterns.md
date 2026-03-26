# System patterns — architecture and conventions

## Monorepo and package layers

- **Workspaces** tie the app, libraries, and examples into one dependency tree (root `package.json`).
- **Internal packages** (version `0.18.0` in manifests, except `utils` at `0.1.2`):
  - `@excalidraw/common` — shared constants and utilities
  - `@excalidraw/math` — math / geometry (for geometric code, prefer types from `packages/math` per `.github/copilot-instructions.md`)
  - `@excalidraw/element` — scene element model
  - `@excalidraw/utils` — helper functions
  - `@excalidraw/excalidraw` — React editor, public embed API

## Two ways package code is built/consumed

1. **App development (`excalidraw-app`):** Vite resolves `@excalidraw/*` **straight to sources** (`excalidraw-app/vite.config.mts` — `resolve.alias` to `packages/.../src` or `packages/excalidraw/index.tsx`).
2. **Publishing / examples without live aliases:** `scripts/buildPackage.js` (esbuild) outputs `dist/dev` and `dist/prod`; package `package.json` files declare **conditional exports** `development` / `production` (e.g. `@excalidraw/excalidraw`).

## Product app entry

- `excalidraw-app/index.tsx`: `createRoot`, `StrictMode`, **`registerSW()`** (PWA), render `<ExcalidrawApp />`.
- `App.tsx`:
  - **`TopErrorBoundary`** — error shell
  - **`Provider store={appJotaiStore}`** — global Jotai store (`excalidraw-app/app-jotai.ts`: `createStore()` from `jotai`)
  - **`ExcalidrawAPIProvider`** — imperative API context from `packages/excalidraw/index.tsx` (enables `useExcalidrawAPI()` outside the `<Excalidraw>` tree)
  - **`ExcalidrawWrapper`** — theme, language, collab, library (IndexedDB), analytics, etc.

## State: editor vs app shell

- **App:** centralized `appJotaiStore` + atoms/helpers in `app-jotai.ts` (e.g. `useAtomWithInitialValue` for one-shot init).
- **`excalidraw` package:** separate editor state layer (`editor-jotai`, hooks like `useAppStateValue` in `index.tsx`) — keeps editor UI decoupled from `excalidraw-app` shell.

## Bundle optimization (Vite)

- In `vite.config.mts`: **`manualChunks`** splits locales (except `en.json` / `percentages.json` for first load and offline), plus separate chunks for mermaid and codemirror/lezer.
- Fonts: custom asset naming for `.woff2`, `assetsInlineLimit: 0`.

## Testing

- **Vitest** with the same **path aliases** as Vite (`vitest.config.mts`) so `@excalidraw/*` imports match the app.
- **jsdom** + `setupTests.ts` (including `vitest-canvas-mock` for canvas in tests).
- Coverage thresholds in `vitest.config.mts` (`coverage.thresholds`).

## Infrastructure as code

- **GitHub Actions** under `.github/workflows/`: lint, test, coverage, docker, releases, etc.
- **Docker:** production static files via nginx after `yarn build:app:docker` (`Dockerfile`).

## Code style (repo conventions)

- From `.github/copilot-instructions.md`: TypeScript, functional components and hooks, **CSS modules** for component styles, naming PascalCase / camelCase / ALL_CAPS.

## Sources in code

- `excalidraw-app/vite.config.mts` — aliases, chunks, build
- `excalidraw-app/App.tsx`, `excalidraw-app/index.tsx`, `excalidraw-app/app-jotai.ts`
- `packages/excalidraw/index.tsx` — `ExcalidrawAPIProvider`, component export
- `vitest.config.mts`, `scripts/buildPackage.js`
- `packages/tsconfig.base.json` — package paths
