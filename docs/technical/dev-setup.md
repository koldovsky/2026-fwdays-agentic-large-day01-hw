# Developer Setup (Onboarding Guide)

This repository is a **Yarn v1 (Classic) workspace monorepo** with:

- `excalidraw-app/`: the main Vite-powered web app
- `packages/*`: libraries published under `@excalidraw/*`
- `examples/*`: example integrations

This guide walks from clone → running locally → validation → first PR.

## 1) Prerequisites

### Required

- **Node.js**: `>=18.0.0` (repo `engines.node`)
  - **CI uses Node `20.x`**, so using Node 20 locally is recommended for parity.
- **Yarn (Classic)**: `1.22.22`
  - Verified in root `package.json` `packageManager: "yarn@1.22.22"`.

### Optional / situational

- **Docker** (optional): `Dockerfile` + `docker-compose.yml` exist for container runs.

## 2) Installation

### Clone

```bash
git clone <your-fork-url>
cd 2026-fwdays-agentic-large-day01-hw
```

### Install dependencies (workspace root)

```bash
yarn install
```

Notes:

- The repo is configured as a workspace (`workspaces: ["excalidraw-app", "packages/*", "examples/*"]`).
- `.npmrc` includes `save-exact=true` and `legacy-peer-deps=true`.

### Environment setup

This repo ships **committed** environment files at the repo root:

- `.env.development`
- `.env.production`

The Vite app config (`excalidraw-app/vite.config.mts`) is set up to **load env from the repo root**:

- `envDir: "../"`
- `loadEnv(mode, "../")`

#### Local overrides (recommended)

Use one of the following (these are ignored by `.gitignore`):

- `.env.local`
- `.env.development.local`
- `.env.production.local`
- `.env.test.local`

For example, to override development-only values:

```bash
cp .env.development .env.development.local
```

Then edit `.env.development.local` as needed.

Common overrides from `.env.development`:

- `VITE_APP_PORT` (dev server port)
- `VITE_APP_ENABLE_ESLINT` (Vite checker overlay)
- `VITE_APP_WS_SERVER_URL` (collaboration websocket)

## 3) Running the project

### Dev server (main app)

From the repo root:

```bash
yarn start
```

### Build (main app)

From the repo root:

```bash
yarn build
```

### Preview a production build

From the repo root:

```bash
yarn build:preview
```

### Serve the production build (static http-server)

From the repo root:

```bash
yarn start:production
```

### Build packages (libraries)

From the repo root:

```bash
yarn build:packages
```

## 4) Project structure overview

Top-level:

- **`excalidraw-app/`**: Vite app workspace (app code + app tests)
- **`packages/`**: libraries (`@excalidraw/*`)
- **`examples/`**: example projects
- **`scripts/`**: build/release utilities
- **`public/`**: static assets used by the app build
- **`firebase-project/`**: firebase-related assets/config
- **`.github/workflows/`**: CI workflows (lint, tests, coverage, size-limit, PR title)
- **`docs/`**: documentation

## 5) Development workflow

### Make changes

- Most app changes happen under `excalidraw-app/`.
- Shared logic and core libraries live under `packages/*`.
- The app aliases `@excalidraw/*` imports to local sources (see `excalidraw-app/vite.config.mts`).

### Lint / format / type-check / tests

Run from the repo root:

- **Lint (ESLint)**:

```bash
yarn test:code
```

- **Format check (Prettier, no write)**:

```bash
yarn test:other
```

- **Type-check (tsc)**:

```bash
yarn test:typecheck
```

- **Unit/integration tests (Vitest)**:

```bash
yarn test:app
```

- **All validations (recommended before pushing)**:

```bash
yarn test:all
```

Auto-fix helpers:

```bash
yarn fix        # prettier --write + eslint --fix
yarn fix:code   # eslint --fix
yarn fix:other  # prettier --write
```

### Git hooks (Husky / lint-staged)

- The repo installs Husky on `yarn install` (`"prepare": "husky install"`).
- `lint-staged` is present and configured in `.lintstagedrc.js`.
- However, the current `.husky/pre-commit` script is effectively a **no-op** (it only contains a commented line), so staged-file checks may not run locally unless you wire them up.

### Commit / PR conventions

- CI enforces **semantic pull request titles** via `amannn/action-semantic-pull-request`.
  - Practically, your PR title should follow **Conventional Commits-style** prefixes (e.g. `feat: ...`, `fix: ...`, `chore: ...`).

## 6) First PR flow

### Create a branch

Start from an updated `master`:

```bash
git checkout master
git pull
git checkout -b <your-branch-name>
```

### Make changes and validate locally

Recommended local checks (match CI):

```bash
yarn test:other
yarn test:code
yarn test:typecheck
yarn test:app --watch=false
```

### Open the PR

- Push your branch to your fork and open a PR targeting `master`.
- Ensure the **PR title is semantic** (see above), otherwise the PR will get a failing check.

### CI expectations (detectable from workflows)

On PRs, GitHub Actions includes:

- **Lint workflow**: `yarn test:other`, `yarn test:code`, `yarn test:typecheck`
- **Coverage workflow**: `yarn test:coverage` (+ report comment)
- **Size limit workflow** (on `master` PRs): runs a bundle size check for `packages/excalidraw` using its `build:esm` script

On pushes to `master`:

- **Tests workflow** runs `yarn test:app`

All of the above run using **Node 20.x** in CI.

## 7) Troubleshooting

### “Your Node version is unsupported” / build or tooling failures

- The repo declares `node >= 18`, but CI runs Node `20.x`.
- If you see dependency/tooling issues, switch to Node 20 and reinstall:

```bash
yarn clean-install
```

### Dev server not starting or port already in use

- The dev server port is driven by `VITE_APP_PORT` (Vite config `server.port`).
- Override in `.env.development.local`:

```bash
echo 'VITE_APP_PORT=3100' >> .env.development.local
```

Then:

```bash
yarn start
```

### ESLint overlay noise or performance issues in dev

The Vite config conditionally enables the ESLint checker based on `VITE_APP_ENABLE_ESLINT`:

- Set to `"false"` to disable the ESLint checker overlay in dev:

```bash
echo 'VITE_APP_ENABLE_ESLINT=false' >> .env.development.local
```

### Collaboration / websocket connection errors in dev

`.env.development` points `VITE_APP_WS_SERVER_URL` to `http://localhost:3002`.

- If you’re not running a collaboration server locally, you may see connection errors; override `VITE_APP_WS_SERVER_URL` in `.env.development.local` if needed.

### CI failures: prettier / eslint / typecheck

CI runs:

- `yarn test:other` (prettier check) → `yarn fix:other`
- `yarn test:code` (eslint, `--max-warnings=0`) → `yarn fix:code`
- `yarn test:typecheck` (tsc) → `yarn test:typecheck`

### Docker build/run issues (optional path)

- `Dockerfile` builds using Node 18 and serves via `nginx`; `docker-compose.yml` maps `3000:80`.

