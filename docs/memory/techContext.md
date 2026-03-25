# Tech Context

## Runtime Requirements

| Requirement | Version |
|-------------|---------|
| Node.js | ≥ 18.0.0 |
| Yarn (classic) | 1.22.22 |
| TypeScript | 5.9.3 |

## Package Versions (core)

| Package | Version | Role |
|---------|---------|------|
| `react` / `react-dom` | 19.0.0 | UI framework |
| `@excalidraw/excalidraw` | 0.18.0 | Public component package |
| `vite` | 5.0.12 | Bundler / dev server |
| `vitest` | 3.0.6 | Unit/integration test runner |
| `jotai` | 2.11.0 | Atom-based state management |
| `firebase` | 11.3.1 | Firestore & Storage (collab persistence) |
| `socket.io-client` | 4.7.2 | Real-time WebSocket collaboration |
| `idb-keyval` | 6.0.3 | IndexedDB (local file/image storage) |
| `@sentry/browser` | 9.0.1 | Error monitoring |
| `lodash.throttle` | (latest) | RAF/time throttling |
| `clsx` | (latest) | Conditional className utility |

## Dev Tooling

| Tool | Version | Purpose |
|------|---------|---------|
| `@vitejs/plugin-react` | 3.1.0 | Vite React plugin |
| `vite-plugin-pwa` | 0.21.1 | PWA / service worker |
| `vite-plugin-svgr` | 4.2.0 | SVG as React components |
| `vite-plugin-checker` | 0.7.2 | Type-check in dev server |
| `vite-plugin-ejs` | 1.7.0 | EJS templating in index.html |
| `vite-plugin-sitemap` | 0.7.1 | Sitemap generation |
| `eslint-config-react-app` | 7.0.1 | ESLint base config |
| `prettier` | 2.6.2 | Code formatting |
| `husky` + `lint-staged` | 7.0.4 / 12.3.7 | Pre-commit hooks |
| `jsdom` | 22.1.0 | DOM environment for tests |

## Workspace Layout (Yarn workspaces)

```
workspaces:
  - excalidraw-app
  - packages/*
  - examples/*
```

## Key Scripts (root `package.json`)

```bash
# Development
yarn --cwd excalidraw-app start          # Start dev server (default port 3000)

# Build
yarn build:packages                      # Build common → math → element → excalidraw (ESM)
yarn build:app                           # Production build of the web app

# Testing
yarn test:app                            # Run Vitest tests

# Packages build pipeline (order matters)
yarn build:common && yarn build:math && yarn build:element && yarn build:excalidraw
```

## App Scripts (`excalidraw-app/package.json`)

```bash
yarn start             # yarn + vite   (dev, port from VITE_APP_PORT / default 3000)
yarn build:app         # Production vite build (sets VITE_APP_ENABLE_TRACKING=true)
yarn build:app:docker  # Docker build (disables Sentry)
yarn serve             # Serve built output on localhost:5001
yarn build:preview     # Build + vite preview on port 5000
```

## Vite Aliases (dev & test)

Path aliases resolve internal packages directly from source (avoiding pre-build):

| Import | Resolved to |
|--------|------------|
| `@excalidraw/common` | `packages/common/src/index.ts` |
| `@excalidraw/element` | `packages/element/src/index.ts` |
| `@excalidraw/excalidraw` | `packages/excalidraw/index.tsx` |
| `@excalidraw/math` | `packages/math/src/index.ts` |
| `@excalidraw/utils` | `packages/utils/src/index.ts` |

## Environment Variables

- `VITE_APP_PORT` — dev server port (default `3000`)
- `VITE_APP_GIT_SHA` / `VERCEL_GIT_COMMIT_SHA` — build version tracking
- `VITE_APP_ENABLE_TRACKING` — enables analytics (production builds)
- `VITE_APP_DISABLE_SENTRY` — disables Sentry (Docker builds)

## Deployment

- **Vercel** — `vercel.json` present at root and in `excalidraw-app/`
- **Docker** — `Dockerfile` + `docker-compose.yml` at root
- **Firebase** — `firebase-project/` for Firestore rules and indexes

## Details
For detailed architecture → see `docs/technical/architecture.md`
For domain glossary → see `docs/product/domain-glossary.md`
