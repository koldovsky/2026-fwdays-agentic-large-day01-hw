# Technical context — Excalidraw monorepo

## Stack (from `package.json` manifests in this repo)

| Layer | Technology | Where |
|--------|------------|--------|
| Language | **TypeScript** **5.9.3** | Root `devDependencies` |
| UI | **React** **19.0.0** / **react-dom** **19.0.0** | `excalidraw-app/package.json` |
| Bundler (app) | **Vite** **5.0.12** | Root `devDependencies`; config `excalidraw-app/vite.config.mts` |
| Package manager | **Yarn Classic** **1.22.22** | Root `packageManager` |
| Unit tests | **Vitest** **3.0.6** | Root `devDependencies`, `yarn test:app` |
| Lint / format | ESLint, Prettier | `yarn test:code`, `yarn test:other` |
| Editor state (React) | **Jotai** **2.11.0** (+ **jotai-scope** in library package) | `excalidraw-app` & `packages/excalidraw/package.json` |
| Sketch rendering | **roughjs** **4.6.4** | `packages/excalidraw/package.json` |

## Monorepo layout

Root `workspaces`: `excalidraw-app`, `packages/*`, `examples/*`.

- **`excalidraw-app/`** — Vite app: `yarn start` runs `vite` here; production build output under app-specific `build`/dist dirs (see `vite.config.mts` / scripts).
- **`packages/excalidraw/`** — **`@excalidraw/excalidraw`** **0.18.0** — main editor, actions, renderer, public React API.
- **`packages/element/`**, **`packages/common/`**, **`packages/math/`**, **`packages/utils/`** — shared internals; versions **0.18.0** align with the excalidraw package for internal packages.
- **`examples/with-nextjs`**, **`examples/with-script-in-browser`** — embed patterns (client-only / dynamic import for SSR frameworks).

## App-only dependencies (web shell)

`excalidraw-app/package.json` also includes, among others:

- **socket.io-client** **4.7.2** — collaboration transport (`excalidraw-app/collab/`).
- **firebase** **11.3.1** — storage/sync paths used by collab/file flows where configured.
- **@sentry/browser** **9.0.1** — error reporting; **hostname-gated** in `excalidraw-app/sentry.ts` (see `decisionLog.md` UB-002).

## Commands (always **yarn** from repo root)

| Task | Command |
|------|---------|
| Install | `yarn` |
| Dev server | `yarn start` |
| Production build (app) | `yarn build` |
| Build internal packages (ESM) | `yarn build:packages` |
| Vitest | `yarn test` / `yarn test:app` |
| Vitest once (CI-style) | `yarn test:app --watch=false` |
| Typecheck | `yarn test:typecheck` |
| ESLint | `yarn test:code` |
| Prettier check | `yarn test:other` |
| Full gate | `yarn test:all` |
| Auto-fix | `yarn fix` |

## Runtime & CI

- **Node**: `>=18.0.0` (`engines`); GitHub Actions use **Node 20.x** (e.g. `.github/workflows/lint.yml`).
- **Dev server port**: default **3000** via `VITE_APP_PORT` or Vite default (`excalidraw-app/vite.config.mts`).

## Build artifacts

- **`yarn rm:build`** (root script) removes common `build`/`dist` outputs under `excalidraw-app`, `packages/*`, `examples/*`.
- Library packages emit **`dist/`** via per-package `build:esm` scripts.

## Onboarding

- Step-by-step clone → PR: `docs/technical/dev-setup.md`.
