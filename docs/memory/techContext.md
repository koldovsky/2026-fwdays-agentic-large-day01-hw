# Technical context — Excalidraw monorepo

## Stack (verified from repository manifests)

- **Language**: TypeScript (workspace `typescript` **5.9.3** in root `package.json`).
- **UI**: React **19.0.0** / React DOM **19.0.0** (`excalidraw-app/package.json`).
- **App bundling / dev server**: **Vite** **5.0.12** (root devDependencies); the web app uses Vite scripts under `excalidraw-app/`.
- **Package manager**: **Yarn Classic** **1.22.22** (`packageManager` field in root `package.json`).
- **Tests / lint**: **Vitest** **3.0.6**, ESLint, Prettier (root `package.json` scripts).
- **State (app)**: **Jotai** **2.11.0** is a direct dependency of `excalidraw-app` and `@excalidraw/excalidraw`.

## Monorepo layout (`workspaces` in root `package.json`)

- **`excalidraw-app/`** — Vite-based web application entrypoint (`yarn start` runs `vite` here).
- **`packages/common/`**, **`packages/element/`**, **`packages/math/`**, **`packages/excalidraw/`**, **`packages/utils/`** — shared libraries; the published-style package is **`@excalidraw/excalidraw`** (see `packages/excalidraw/package.json`, version **0.18.0** in this tree).
- **`examples/*`** — integration examples (e.g. Next.js, script tag).

## Key dependency versions (library package)

From `packages/excalidraw/package.json` (non-exhaustive but representative):

- `@excalidraw/common`, `@excalidraw/element`, `@excalidraw/math`: **0.18.0** (aligned with the package version).
- **roughjs** **4.6.4** — stroke/fill rendering style.
- **jotai** **2.11.0**, **jotai-scope** **0.7.2**.

## Commands (use **yarn** — not npm/pnpm — for this repo)

Run from the **repository root** unless noted:

| Task | Command |
|------|---------|
| Install | `yarn` |
| Dev server (app) | `yarn start` → `yarn --cwd ./excalidraw-app vite` |
| Production build (app) | `yarn build` |
| Build all internal packages (ESM) | `yarn build:packages` |
| Unit tests | `yarn test` or `yarn test:app` |
| Typecheck | `yarn test:typecheck` |
| Lint | `yarn test:code` |
| Full CI-like suite | `yarn test:all` |

## Runtime requirements

- **Node**: `>=18.0.0` (root and `excalidraw-app` `engines`).

## Build artifacts (typical)

- App output under `excalidraw-app/build` / dist-style folders; packages emit under each package’s `dist/` via `build:esm` scripts—see individual `packages/*/package.json`.
