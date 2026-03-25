# techContext.md

## Details
For detailed architecture → see [docs/technical/architecture.md](../technical/architecture.md)
For full onboarding guide → see [docs/technical/dev-setup.md](../technical/dev-setup.md)
For domain glossary → see [docs/product/domain-glossary.md](../product/domain-glossary.md)

## Runtime & Tooling Versions

| Tool | Version |
|------|---------|
| Node.js | ≥ 18.0.0 |
| Yarn | 1.22.22 (classic, workspaces) |
| TypeScript | 5.9.3 |
| React | 19.0.0 |
| React DOM | 19.0.0 |
| Vite | 5.0.12 |
| Vitest | 3.0.6 |
| ESLint | via `@excalidraw/eslint-config` 1.0.3 |
| Prettier | 2.6.2 (via `@excalidraw/prettier-config`) |

## Key Runtime Dependencies

| Library | Version | Purpose |
|---------|---------|---------|
| `roughjs` | 4.6.4 | Hand-drawn shape rendering on canvas |
| `jotai` | 2.11.0 | Atomic state management |
| `jotai-scope` | 0.7.2 | Isolated Jotai stores per editor instance |
| `perfect-freehand` | 1.2.0 | Smooth freedraw stroke generation |
| `socket.io-client` | 4.7.2 | Real-time collaboration |
| `firebase` | 11.3.1 | Backend storage |
| `@sentry/react` | 9.0.1 | Error tracking |
| `fractional-indexing` | 3.2.0 | Z-order via fractional indices |
| `tunnel-rat` | 0.1.2 | Portal slots (MainMenu, Footer, Sidebar) |
| `nanoid` | 3.3.3 | Element ID generation |
| `pako` | 2.0.3 | Scene data compression |
| `lodash.throttle` | 4.1.1 | Render throttling |
| `lodash.debounce` | 4.0.8 | Scroll/resize debouncing |
| `@excalidraw/mermaid-to-excalidraw` | 2.1.1 | Mermaid diagram import |
| `points-on-curve` | 1.0.1 | Bezier curve point sampling |

## Development Commands

> For full onboarding (prerequisites, environment setup, verification checklist, troubleshooting): see `docs/technical/dev-setup.md`

```bash
# Start dev server (port 3001)
yarn start

# Build the deployed web app
yarn build:app

# Build all packages (required before running app against local packages)
yarn build:packages

# Individual package builds (order matters: common → math → element → excalidraw)
yarn build:common
yarn build:math
yarn build:element
yarn build:excalidraw

# Run tests (watch mode)
yarn test

# Run tests once
yarn test:app

# Full CI check (typecheck + eslint + prettier + vitest)
yarn test:all

# TypeScript type check only
yarn test:typecheck

# ESLint only
yarn test:code

# Prettier check only
yarn test:other

# Run a single test file
yarn test path/to/file.test.ts

# Auto-fix lint and formatting
yarn fix

# Coverage report
yarn test:coverage

# Remove all build artifacts
yarn rm:build

# Fresh install
yarn clean-install
```

## Build System

- **App**: Vite 5 with plugins: `vite-plugin-pwa` (PWA/service worker), `vite-plugin-svgr` (SVG as React components), `vite-plugin-checker` (type errors in overlay), `vite-plugin-ejs`
- **Packages**: Custom ESM build scripts (`scripts/buildPackage.js`, `scripts/buildBase.js`) + `tsc` for type declarations
- **Output**: `excalidraw-app/build/` (app), `packages/*/dist/` (libraries)

## TypeScript Configuration

- Root `tsconfig.json` sets `target: ESNext`, `jsx: react-jsx`, `strict: true`
- Path aliases map `@excalidraw/*` to package source files during development
- Each package has its own `tsconfig.json` extending the root

## ESLint Rules (enforced, non-obvious)

- **No direct `jotai` imports** — must use `editor-jotai` or `app-jotai` wrappers
- **No barrel index imports inside `packages/excalidraw`** — use direct file paths
- **Type-only imports** enforced where possible
- **Path-based circular import prevention** between packages

## Test Infrastructure

- **Runner**: Vitest 3.0.6 with jsdom environment
- **Coverage**: `@vitest/coverage-v8`
- **Thresholds** (`vitest.config.mts`): lines 60%, branches 70%, functions 63%, statements 60%
- **Canvas mock**: `vitest-canvas-mock`
- **Custom matchers**: `packages/utils/src/test-utils.ts` adds `toCloselyEqualPoints`
- **Debug handle**: `window.h` exposes `{ state, setState, app, history, store, fonts }` in dev/test

## Environment Configuration

- `.env.development` — local URLs (JSON server port, library server, WebSocket), Firebase config, feature flags
- `.env.production` — production URLs
- Docker build: `build:app:docker` disables Sentry

## Git Hooks

- Husky is installed (`husky install` runs via the `prepare` script).
- **Current state:** `.husky/pre-commit` contains only a comment and is a **no-op** — lint-staged does NOT run automatically on commit.
- **To activate:** Add `yarn lint-staged` to `.husky/pre-commit` and run `chmod +x .husky/pre-commit`. See `docs/technical/dev-setup.md` — Code quality tools section.
- **Intended behavior when active:** JS/TS: `eslint --max-warnings=0 --fix` / CSS/SCSS/JSON/MD: `prettier --write`

## Deployment

- **Vercel** (`vercel.json`): output dir `excalidraw-app/build`, custom CORS headers
- **Docker**: supported via `build:app:docker` script
