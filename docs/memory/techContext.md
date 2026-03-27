# Tech Context

## Runtime Requirements

- **Node.js**: `>=18.0.0` (enforced in root and `excalidraw-app/package.json`)
- **Package manager**: Yarn 1 classic (`yarn@1.22.22`, declared in root `packageManager`)

## Core Stack

| Layer | Library | Version |
|---|---|---|
| UI framework | React | 19.0.0 (app), peer `^17 \|\| ^18 \|\| ^19` (package) |
| Language | TypeScript | 5.9.3 |
| Build tool | Vite | 5.0.12 |
| State (atoms) | Jotai + jotai-scope | 2.11.0 + 0.7.2 |
| Styling | SCSS (sass) | 1.51.0 |
| UI primitives | radix-ui | 1.4.3 |
| Canvas drawing | rough.js | 4.6.4 |
| Freehand strokes | perfect-freehand | 1.2.0 |
| Collaboration | socket.io-client | 4.7.2 |
| Error tracking | @sentry/browser | 9.0.1 |
| Firebase (sharing) | firebase | 11.3.1 |
| Testing | Vitest + jsdom | 3.0.6 / 22.1.0 |
| Linting | ESLint + Prettier | (workspace config) |

## Workspace Packages

All workspace packages use `"type": "module"` and export both `development` and `production` condition builds:

| Package | Version | Build script |
|---|---|---|
| `@excalidraw/common` | 0.18.0 | `scripts/buildBase.js` |
| `@excalidraw/math` | 0.18.0 | `scripts/buildBase.js` |
| `@excalidraw/element` | 0.18.0 | `scripts/buildBase.js` |
| `@excalidraw/excalidraw` | 0.18.0 | `scripts/buildPackage.js` |
| `@excalidraw/utils` | 0.1.2 | `scripts/buildUtils.js` |

## Vite Configuration

- **Dev server port**: `VITE_APP_PORT` env var; checked-in `.env.development` sets it to `3001`, and `vite.config.mts` falls back to `3000` when the env var is absent
- **Env dir**: parent of `excalidraw-app/` (root `.env`)
- **Build output**: `excalidraw-app/build/`
- **Path aliases**: all `@excalidraw/*` packages are aliased to their `src/` directories, enabling hot reload across workspace packages without building
- **Chunk strategy**: locale files get individual chunks (`locales/<lang>.js`); `en.json` and `percentages.json` are bundled with the main chunk for offline-first; Mermaid and CodeMirror get dedicated chunks
- **PWA**: `vite-plugin-pwa` with `autoUpdate` strategy; fonts cached 90 days (`CacheFirst`), locales 30 days, chunks 90 days

## Env Variables

Two `vite-env.d.ts` files declare `ImportMetaEnv` — one per build target:

**`excalidraw-app/vite-env.d.ts`** — used by the standalone app:

| Variable | Purpose |
|---|---|
| `VITE_APP_PORT` | Dev server port |
| `VITE_APP_BACKEND_V2_GET_URL` / `_POST_URL` | Scene save/load backend |
| `VITE_APP_WS_SERVER_URL` | Collaboration WebSocket |
| `VITE_APP_PORTAL_URL` | Collaboration portal (excalidraw.com workflow only) |
| `VITE_APP_AI_BACKEND` | AI diagram generation backend |
| `VITE_APP_FIREBASE_CONFIG` | Firebase JSON config |
| `VITE_APP_DEV_DISABLE_LIVE_RELOAD` | Disable HMR (for Service Worker debugging) |
| `VITE_APP_DISABLE_SENTRY` | Disable error tracking |
| `VITE_APP_COLLAPSE_OVERLAY` | Collapse Vite error overlay by default |
| `VITE_APP_ENABLE_ESLINT` | Enable ESLint in dev server |
| `VITE_APP_ENABLE_PWA` | Enable PWA in dev server |
| `VITE_APP_PLUS_LP` / `VITE_APP_PLUS_APP` | Excalidraw+ landing/app URLs |
| `VITE_APP_GIT_SHA` | Injected at build time via `VERCEL_GIT_COMMIT_SHA` |
| `MODE` / `DEV` / `PROD` | Vite built-ins |

**`packages/excalidraw/vite-env.d.ts`** — used by the package build; extends the app list with package-specific vars: `VITE_APP_LIBRARY_URL`, `VITE_APP_LIBRARY_BACKEND`, `VITE_APP_MATOMO_URL`, `VITE_APP_CDN_MATOMO_TRACKER_URL`, `VITE_APP_MATOMO_SITE_ID`, `VITE_APP_ENABLE_TRACKING`, `VITE_APP_DEBUG_ENABLE_TEXT_CONTAINER_BOUNDING_BOX`, `FAST_REFRESH`, `PKG_NAME`, `PKG_VERSION`, `VITE_WORKER_ID`.

## Key Commands

```bash
# Dev server (excalidraw-app)
yarn start

# Production build (app)
yarn build

# Build the core package chain used by the app
yarn build:packages          # common → math → element → excalidraw (in order)
yarn build:common
yarn build:math
yarn build:element
yarn build:excalidraw
yarn --cwd ./packages/utils build:esm

# Tests
yarn test                    # vitest (watch mode)
yarn test:app --watch=false  # vitest (CI mode)
yarn test:typecheck          # tsc
yarn test:code               # eslint --max-warnings=0
yarn test:other              # prettier --list-different
yarn test:all                # all of the above
yarn test:coverage           # vitest --coverage (thresholds: 60% lines, 70% branches)

# Fix
yarn fix                     # prettier write + eslint fix

# Release (npm)
yarn release:latest
yarn release:next
yarn release:test

# Clean
yarn rm:build
yarn rm:node_modules
yarn clean-install
```

## Test Configuration

- **Runner**: Vitest 3.0.6 with `globals: true`, `environment: jsdom`
- **Setup file**: `setupTests.ts` (root)
- **Coverage thresholds**: lines 60%, branches 70%, functions 63%, statements 60%
- **Hooks**: run in parallel (`sequence.hooks: "parallel"`)
- **Canvas mocking**: `vitest-canvas-mock`
- **IndexedDB mocking**: `fake-indexeddb`

## Build Targets (Browser)

Production: `>0.2%`, not dead, not IE≤11, not Safari<12, not Edge<79, not Chrome<70.
Development: last 1 version of Chrome, Firefox, Safari.

## Font Pipeline

Fonts live in `packages/excalidraw/fonts/` (237 woff2 files).
The `scripts/woff2/` pipeline (using `harfbuzzjs` + `fonteditor-core`) subsets TTF source files in `scripts/woff2/assets/` into woff2 at build time via `woff2BrowserPlugin()` and `woff2EsbuildPlugin()`.

## Details

For detailed architecture → see [docs/technical/architecture.md](../technical/architecture.md)
For domain glossary → see [docs/product/domain-glossary.md](../product/domain-glossary.md)
