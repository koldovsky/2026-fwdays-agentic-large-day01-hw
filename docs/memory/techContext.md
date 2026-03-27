# Tech Context

## Stack

| Layer | Technology |
|-------|-----------|
| Language | TypeScript (strict mode) |
| UI | React 19, functional components + hooks |
| Build | Vite (app), esbuild (packages) |
| Tests | Vitest 3 + Testing Library, jsdom environment |
| State | Jotai 2.11 (via `app-jotai`/`editor-jotai` wrappers) |
| Drawing | RoughJS 4.6 (sketchy shapes), Perfect Freehand 1.2 (pencil) |
| Collaboration | Socket.io-client 4.7 |
| Backend | Firebase 11 (image storage, optional) |
| Styling | SCSS + CSS Modules, Radix UI primitives |
| Package manager | Yarn 1.22.22 |
| Node | ≥ 18.0.0 |

## Commands

```bash
# Dev
yarn start                  # Dev server → http://localhost:3001
yarn build                  # Production build (app + packages)
yarn build:packages         # Build all packages only

# Test
yarn test                   # Vitest unit tests
yarn test:all               # typecheck + eslint + prettier + tests
yarn test:app               # Unit tests only
yarn test:typecheck         # tsc --noEmit
yarn test:code              # ESLint
yarn test:other             # Prettier check
yarn test:coverage          # Tests with coverage report

# Fix
yarn fix                    # eslint + prettier fixes
yarn fix:code               # eslint --fix
yarn fix:other              # prettier --write
```

## Ports

| Service | Port |
|---------|------|
| Dev server (Vite) | 3001 |
| Collaboration WebSocket | 3002 |

## Monorepo Packages

| Package | Role |
|---------|------|
| `packages/common` | Shared constants, theme tokens, and type definitions used across all packages |
| `packages/math` | 2D geometry primitives (`Point`, `Vector`, intersection, transformation) |
| `packages/element` | Element tree, Scene, Store, History, mutation logic (`mutateElement`) |
| `packages/excalidraw` | The embeddable `<Excalidraw />` React component published to npm |
| `packages/utils` | Standalone export helpers (SVG, PNG, Blob) for consumers |

## Key Config Files

| File | Purpose |
|------|---------|
| `tsconfig.json` | TypeScript, path aliases for all packages |
| `vitest.config.mts` | Test runner (coverage thresholds: lines 60%, branches 70%) |
| `.eslintrc.json` | Import grouping, type-only imports, jotai restrictions |
| `excalidraw-app/vite.config.mts` | App dev server, PWA plugin, build config |
| `.env.development` | Local env vars (ports, Firebase config, feature flags) |

## Deployment

- **Production**: Vercel (see `vercel.json`)
- **Docker**: Multi-stage build → Nginx (`Dockerfile`, `docker-compose.yml`)
- **CDN**: Fonts served from `esm.run` by default; configurable via `window.EXCALIDRAW_ASSET_PATH`
