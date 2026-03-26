# Tech context

Toolchain, versions, and commands verified against [`package.json`](../../package.json), [`excalidraw-app/package.json`](../../excalidraw-app/package.json), [`Dockerfile`](../../Dockerfile), and workspace packages under [`packages/`](../../packages/).

## Details

For detailed architecture → see [`docs/technical/architecture.md`](../technical/architecture.md).

For high-level repo purpose (library vs app) → see [`projectbrief.md`](./projectbrief.md).

For product requirements → see [`docs/product/PRD.md`](../product/PRD.md).

For domain glossary → see [`docs/product/domain-glossary.md`](../product/domain-glossary.md).

For step-by-step onboarding → see [`docs/technical/dev-setup.md`](../technical/dev-setup.md).

---

## Runtime and package manager

| Item | Source | Value |
|------|--------|--------|
| Node (minimum) | `engines.node` in root and `excalidraw-app` | `>=18.0.0` |
| Node (Docker build) | [`Dockerfile`](../../Dockerfile) stage `build` | `node:22` |
| Package manager | root `packageManager` | **Yarn 1** `1.22.22` |
| Workspaces | root `workspaces` | `excalidraw-app`, `packages/*`, `examples/*` |

---

## Core tooling versions (root)

From root [`package.json`](../../package.json) `devDependencies` (representative):

| Tool | Version |
|------|---------|
| TypeScript | `5.9.3` |
| Vite | `5.0.12` |
| Vitest | `3.0.6` |
| ESLint / Prettier / Husky | See root `devDependencies` |
| `@vitejs/plugin-react` | `3.1.0` |

Tests run via **Vitest** with config at [`vitest.config.mts`](../../vitest.config.mts) (`yarn test` / `yarn test:app`).

---

## Application stack (`excalidraw-app`)

From [`excalidraw-app/package.json`](../../excalidraw-app/package.json):

| Area | Choice |
|------|--------|
| UI | **React** `19.0.0`, **react-dom** `19.0.0` |
| Build / dev | **Vite** (scripts: `vite`, `vite build`) |
| State (app) | **jotai** `2.11.0` |
| Realtime / backend client | **socket.io-client** `4.7.2`, **Firebase** `11.3.1` |
| Storage | **idb-keyval** `6.0.3` |
| Observability | **@sentry/browser** `9.0.1` |
| i18n helper | **i18next-browser-languagedetector** `6.1.4` |

PWA and other Vite plugins are declared at the **monorepo root** (e.g. `vite-plugin-pwa` in root `devDependencies`).

---

## Workspace packages (`packages/*`)

| Package | Version (manifest) | Build script (typical) |
|---------|--------------------|-------------------------|
| `@excalidraw/common` | `0.18.0` | `build:esm` → esbuild + `gen:types` |
| `@excalidraw/math` | `0.18.0` | same pattern |
| `@excalidraw/element` | `0.18.0` | same pattern |
| `@excalidraw/excalidraw` | `0.18.0` | same pattern |
| `@excalidraw/utils` | `0.1.2` | `build:esm` → [`scripts/buildUtils.js`](../../scripts/buildUtils.js); **no** `build:utils` in root `scripts` |

Library bundles use **esbuild** (and sass where applicable): [`scripts/buildPackage.js`](../../scripts/buildPackage.js) for common/math/element/excalidraw; **`buildUtils.js`** for `utils`. Not Vite. Outputs use **dev** / **prod** entry points under each package’s `exports`.

---

## Root scripts (build, run, quality)

From root [`package.json`](../../package.json) `scripts`:

| Script | Effect |
|--------|--------|
| `yarn start` | Dev server: `yarn --cwd ./excalidraw-app start` (Vite) |
| `yarn build` | App production build: `yarn --cwd ./excalidraw-app build` |
| `yarn build:app` | App-only Vite build variant |
| `yarn build:packages` | `build:common` → `build:math` → `build:element` → `build:excalidraw` |
| `yarn build:preview` | App build + Vite preview |
| `yarn start:production` | App build + local static serve |
| `yarn start:example` | `build:packages` then `examples/with-script-in-browser` start |
| `yarn test` / `yarn test:app` | Vitest |
| `yarn test:all` | typecheck + eslint + prettier + app tests (non-watch) |
| `yarn test:typecheck` | `tsc` |
| `yarn test:code` | ESLint |
| `yarn test:other` | Prettier check |
| `yarn test:coverage` | Vitest with coverage |
| `yarn fix` / `fix:code` / `fix:other` | Prettier write + ESLint fix |
| `yarn rm:build` / `rm:node_modules` | Rimraf clean helpers |
| `yarn clean-install` | Remove node_modules + reinstall |
| `yarn build:app:docker` | Delegates to app’s Docker-oriented Vite build |

---

## Docker

[`Dockerfile`](../../Dockerfile):

1. **Build stage:** `FROM node:22` — `yarn install`, then `yarn build:app:docker` (disables Sentry for that build per app script).
2. **Runtime stage:** `FROM nginx:1.27-alpine` — copies `excalidraw-app/build` → `/usr/share/nginx/html`.
3. **Healthcheck:** `wget` against localhost.

Local Node may be 18+; the image intentionally uses **Node 22** for CI-like builds.

---

## Notable assets

Font subsetting uses **WASM** (HarfBuzz / WOFF2) under [`packages/excalidraw/subset/`](../../packages/excalidraw/subset/) with tooling in [`scripts/wasm/`](../../scripts/wasm/) (see [`docs/findings/project-overview.md`](../findings/project-overview.md)).

---

## Further reading

- Deep package notes: [`docs/findings/`](../findings/)
- Architecture patterns: [`systemPatterns.md`](./systemPatterns.md)
