# Onboarding / Dev Setup Guide

## Prerequisites

- **Node.js** ≥ 18.0.0 (see `package.json` → `engines.node`)
- **Yarn** 1.22.22 (classic, not Berry — see `package.json` → `packageManager`)
- **Git**

## Clone & Install

```bash
git clone <repository-url>
cd 2026-fwdays-agentic-large-day01-hw
yarn install
```

Yarn workspaces will install dependencies for all packages, `excalidraw-app`, and `examples`.

## Environment Variables

Create a `.env` file in the **root** directory (env files are loaded from `../` relative to `excalidraw-app`, see `excalidraw-app/vite.config.mts` → `envDir: "../"`):

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_APP_FIREBASE_CONFIG` | For collab | JSON string of Firebase config object |
| `VITE_APP_WS_SERVER_URL` | For collab | WebSocket server URL for real-time collaboration (default in `.env.development`: `http://localhost:3002`) |
| `VITE_APP_BACKEND_V2_GET_URL` | Optional | Backend API GET endpoint for shared scenes |
| `VITE_APP_BACKEND_V2_POST_URL` | Optional | Backend API POST endpoint for shared scenes |
| `VITE_APP_AI_BACKEND` | Optional | AI backend URL for text-to-diagram feature |
| `VITE_APP_PLUS_LP` / `VITE_APP_PLUS_APP` | Optional | Excalidraw+ landing page and app URLs |
| `VITE_APP_DISABLE_SENTRY` | Optional | Set to `"true"` to disable Sentry |
| `VITE_APP_GIT_SHA` | Optional | Git SHA for Sentry release tracking |
| `VITE_APP_ENABLE_TRACKING` | Optional | Enable analytics tracking |
| `VITE_APP_ENABLE_PWA` | Optional | Set to `"true"` to enable PWA in dev |
| `VITE_APP_ENABLE_ESLINT` | Optional | Set to `"false"` to disable ESLint checker plugin in dev |
| `VITE_APP_PORT` | Optional | Dev server port (set to `3001` in `.env.development`; `vite.config.mts` falls back to `3000` if unset) |

> **Note**: This table is not exhaustive. See `excalidraw-app/vite-env.d.ts` and `packages/excalidraw/vite-env.d.ts` for the full list of typed env vars.

The app works without Firebase config — collaboration features will be disabled.

## Run Dev Server

```bash
yarn start
```

This runs `yarn --cwd ./excalidraw-app start`, which starts Vite dev server on port 3001 (per `.env.development`; `vite.config.mts` falls back to 3000 if `VITE_APP_PORT` is unset).

## Run Tests

```bash
# Run all tests in watch mode
yarn test:app

# Run tests once (CI mode)
yarn test:app --watch=false

# Run full test suite (typecheck + lint + prettier + unit tests)
yarn test:all

# Run with coverage
yarn test:coverage

# Run with Vitest UI
yarn test:ui
```

Test environment: jsdom with vitest-canvas-mock. Setup file: `setupTests.ts`.

## Build for Production

```bash
# Build the app
yarn build:app

# Build all packages (required before using as library)
yarn build:packages

# Build everything
yarn build
```

Output goes to `excalidraw-app/build/`.

## Docker

```bash
# Build and run with Docker Compose
docker-compose up --build

# Access at http://localhost:3000
```

Uses multi-stage build: Node 18 for building, Nginx 1.27-alpine for serving (see `Dockerfile`).

## Project Structure Orientation

```
├── excalidraw-app/          # The hosted web application
│   ├── App.tsx              # Main app component
│   ├── index.tsx            # Entry point (React root, PWA registration)
│   ├── collab/              # Collaboration (Collab, Portal, Socket.IO)
│   ├── data/                # Firebase, localStorage, encryption, file management
│   ├── share/               # Share dialog, QR code
│   ├── components/          # App-specific UI (menus, welcome screen, footer)
│   ├── app-language/        # i18n detection and state
│   └── tests/               # App-level tests
├── packages/
│   ├── common/              # Shared utilities, constants, types
│   ├── math/                # 2D geometry: points, vectors, curves, polygons
│   ├── element/             # Element types, Scene, mutation, binding, Store/Delta
│   ├── excalidraw/          # React component library (THE npm package)
│   │   ├── components/      # React components (App, dialogs, panels)
│   │   ├── actions/         # Action system (copy, paste, align, etc.)
│   │   ├── renderer/        # Canvas rendering (static, interactive)
│   │   ├── data/            # Import/export, library, reconcile
│   │   ├── fonts/           # Font loading and subsetting
│   │   ├── locales/         # Translation files (40+ languages)
│   │   └── tests/           # Unit tests
│   └── utils/               # Public utilities (export, bounds)
├── examples/                # Example integrations
│   ├── with-nextjs/         # Next.js embedding example
│   └── with-script-in-browser/  # Vanilla/Vite embedding example
├── scripts/                 # Build scripts (esbuild, version, release)
├── docs/                    # Documentation (memory bank)
└── public/                  # Static assets (service worker, robots.txt)
```

## Common Tasks Cheat Sheet

| Task | Command |
|------|---------|
| Start dev server | `yarn start` |
| Run unit tests | `yarn test:app` |
| Run linter | `yarn test:code` |
| Fix lint issues | `yarn fix:code` |
| Format check | `yarn test:other` |
| Format fix | `yarn fix:other` |
| Type check | `yarn test:typecheck` |
| Build app | `yarn build:app` |
| Build all packages | `yarn build:packages` |
| Clean build artifacts | `yarn rm:build` |
| Clean node_modules | `yarn rm:node_modules` |
| Fresh install | `yarn clean-install` |
| Run example app | `yarn start:example` |
| Run single test file | `yarn test:app -- path/to/file.test.ts` |
| Update test snapshots | `yarn test:update` |
| Generate test coverage | `yarn test:coverage` |
| Build for Docker | `yarn build:app:docker` |
| Release package | `yarn release` |
| Check locale coverage | `yarn locales-coverage` |

## Linting & Formatting

- **ESLint**: `yarn test:code` (max 0 warnings)
- **Prettier**: `yarn test:other` (checks formatting)
- **Pre-commit**: Husky + lint-staged run on commit
- Config: `@excalidraw/eslint-config`, `@excalidraw/prettier-config`

## Cross-References

- For tech stack → see [`docs/memory/techContext.md`](../memory/techContext.md)
- For architecture → see [`docs/technical/architecture.md`](architecture.md)
- For project progress → see [`docs/memory/progress.md`](../memory/progress.md)
- For active context → see [`docs/memory/activeContext.md`](../memory/activeContext.md)
