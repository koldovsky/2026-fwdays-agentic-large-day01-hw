# Developer Setup Guide

> Full onboarding from clone to first PR for Excalidraw.

## Prerequisites

| Tool | Version | Check |
|------|---------|-------|
| Node.js | ≥18.0.0 | `node -v` |
| Yarn | 1.22.22 | `yarn -v` |

## 1. Clone & Install

```bash
git clone <repo-url>
cd excalidraw
yarn install
```

`yarn install` automatically runs `husky install` (post-install hook) to set up pre-commit hooks.

## 2. Environment Setup

Environment files are already provided — no manual `.env` creation needed:

| File | Purpose |
|------|---------|
| `.env.development` | Local dev defaults (port 3001, dev Firebase, tracking ON) |
| `.env.production` | Production config (tracking OFF, PWA ON) |
| `.env.development.local` | **Optional** — personal overrides (gitignored) |

### Key Environment Variables

| Variable | Default (dev) | Description |
|----------|---------------|-------------|
| `VITE_APP_PORT` | `3001` | Dev server port |
| `VITE_APP_WS_SERVER_URL` | `http://localhost:3002` | Collaboration WebSocket server |
| `VITE_APP_ENABLE_ESLINT` | `true` | ESLint in dev (disable for speed) |
| `VITE_APP_ENABLE_PWA` | `false` | PWA service worker (disable in dev) |
| `VITE_APP_DEV_DISABLE_LIVE_RELOAD` | — | Set `true` for Service Worker debugging |

## 3. Build Packages (Required First!)

⚠️ Monorepo packages must be built before the app:

```bash
yarn build:packages    # builds common → math → element → excalidraw
```

Build order matters: `common` and `math` → `element` → `excalidraw`.

## 4. Start Dev Server

```bash
yarn start             # starts Vite dev server on :3001, auto-opens browser
```

Hot Module Replacement (HMR) is enabled by default.

## 5. Common Commands

### Development
```bash
yarn start              # dev server (:3001)
yarn build              # full production build (packages + app)
yarn build:preview      # build + preview on :5000
```

### Testing
```bash
yarn test               # vitest in watch mode
yarn test:app           # run tests once
yarn test:all           # typecheck + lint + prettier + tests
yarn test:coverage      # with coverage report (thresholds: 60% lines, 70% branches)
yarn test:ui            # vitest UI dashboard
```

### Linting & Formatting
```bash
yarn fix                # auto-fix ESLint + Prettier
yarn fix:code           # ESLint --fix only
yarn fix:other          # Prettier --write only
yarn test:code          # ESLint check (max-warnings=0)
yarn test:other         # Prettier check
yarn test:typecheck     # TypeScript type check
```

## 6. Pre-commit Hooks

Husky runs `lint-staged` on every commit:

| File pattern | Action |
|-------------|--------|
| `*.{js,ts,tsx}` | ESLint with auto-fix |
| `*.{css,scss,json,md,html,yml}` | Prettier |

If a hook fails → fix the issues → commit again.

## 7. Making Your First PR

1. **Create a branch**: `git checkout -b feature/your-feature`
2. **Make changes** and ensure they pass:
   ```bash
   yarn test:all          # must pass
   ```
3. **Commit** (pre-commit hooks run automatically)
4. **Push** and open a PR
5. **Fill in the PR template** (`.github/PULL_REQUEST_TEMPLATE.md`)
6. **CI checks** will run: lint, typecheck, tests, bundle size

### CI Pipeline (GitHub Actions)
- **On PR**: `yarn test:other` → `yarn test:code` → `yarn test:typecheck`
- **On push to master**: full test suite (`yarn test:app`)
- **Node.js version in CI**: 20.x

## 8. Monorepo: Working with Packages

### Package Map
| Package | Path | Purpose |
|---------|------|---------|
| `@excalidraw/common` | `packages/common/` | Shared constants, types, utilities |
| `@excalidraw/math` | `packages/math/` | Geometry & math |
| `@excalidraw/element` | `packages/element/` | Element types & operations |
| `@excalidraw/excalidraw` | `packages/excalidraw/` | Core React component |
| `@excalidraw/utils` | `packages/utils/` | Helper functions |

### Import Rules
- ✅ Use path aliases: `import { something } from "@excalidraw/common"`
- ✅ Use direct imports: `import { X } from "../module"`
- ❌ Never import directly from `jotai` — use `editor-jotai` or `app-jotai`
- ❌ Avoid barrel imports from `@excalidraw/excalidraw` index

### Building Individual Packages
```bash
yarn build:common
yarn build:math
yarn build:element
yarn build:excalidraw
```

## 9. Common Gotchas

| Problem | Solution |
|---------|----------|
| App won't start / import errors | Run `yarn build:packages` first |
| ESLint slows down dev server | Set `VITE_APP_ENABLE_ESLINT=false` in `.env.development.local` |
| Port 3001 in use | Change `VITE_APP_PORT` in `.env.development.local` |
| Collaboration not working | Needs local WebSocket server on `:3002` |
| HMR breaks with Service Worker | Set `VITE_APP_DEV_DISABLE_LIVE_RELOAD=true` |
| Jotai import lint error | Import from `editor-jotai`, not `jotai` directly |
| Pre-commit hook fails | Run `yarn fix` then commit again |

## Related Docs
- [Architecture](./architecture.md) — system design and patterns
- [System Patterns](../../memory-bank/systemPatterns.md) — state management, rendering, collaboration
- [Tech Context](../../memory-bank/techContext.md) — full dependency list and versions
