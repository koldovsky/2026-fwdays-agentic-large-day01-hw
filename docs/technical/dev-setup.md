# Developer setup (onboarding)

How to run and verify the **excalidraw-monorepo** locally. For versions and stack details, see `docs/memory/techContext.md`.

## Prerequisites

- **Node.js** `>= 18.0.0` (see root `package.json` → `engines`).
- **Yarn Classic** `1.22.22` (declared as `packageManager` in root `package.json`). Install globally or via Corepack if you use it.

## Clone and install

```bash
git clone <repository-url>
cd 2026-fwdays-agentic-large-day01-hw
yarn install
```

The monorepo uses **workspaces** (`excalidraw-app`, `packages/*`, `examples/*`); a single `yarn install` at the root installs everything.

## Environment variables

- Vite loads env from the **repository root** (`excalidraw-app/vite.config.mts` sets `envDir` to `../`).
- Place `.env`, `.env.local`, or mode-specific files (e.g. `.env.development`) **next to the root `package.json`**, not only inside `excalidraw-app/`.
- App-specific variables are typically prefixed with `VITE_` (e.g. `VITE_APP_PORT` defaults dev server port; default `3000` if unset).

Consult `excalidraw-app` and `firebase-project` for any feature flags or backend URLs required for full collab/cloud flows.

## Run the product app

```bash
yarn start
```

Runs the Vite dev server for `excalidraw-app` (opens browser per Vite config when possible).

Other useful scripts from the root:

| Script | Purpose |
|--------|---------|
| `yarn build` | Production build of the SPA into `excalidraw-app/build` |
| `yarn build:packages` | Build internal `@excalidraw/*` packages (order: common → math → element → excalidraw) |
| `yarn start:example` | Build packages + start `examples/with-script-in-browser` |
| `yarn test` | Vitest (app + packages per config) |
| `yarn test:all` | Typecheck + ESLint + Prettier check + tests (non-watch) |
| `yarn clean-install` | Remove workspace `node_modules` and reinstall |

## Run tests and lint

```bash
yarn test
yarn test:typecheck
yarn test:code
yarn test:coverage
```

Vitest uses the same `@excalidraw/*` path aliases as Vite (`vitest.config.mts`).

## Docker (optional)

```bash
docker compose up --build
```

Maps container port `80` to host `3000` (see `docker-compose.yml`). The image builds static assets via `yarn build:app:docker`.

## IDE tips

- TypeScript: root `tsconfig.json` and `packages/tsconfig.base.json` drive paths and strictness.
- When editing **only** the app, package sources are resolved via Vite aliases — you usually **do not** need `yarn build:packages` for `yarn start`.
- When consuming packages from **outside** the monorepo or running examples that expect `dist/`, run `yarn build:packages` first.

## Where to read next

- Architecture: `docs/technical/architecture.md`, `docs/memory/systemPatterns.md`
- Product terms: `docs/product/domain-glossary.md`
- Commands cheat sheet: `docs/memory/techContext.md`
