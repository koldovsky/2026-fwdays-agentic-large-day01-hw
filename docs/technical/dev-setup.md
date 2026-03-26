# Developer Setup & Onboarding

This guide reflects the **excalidraw-monorepo** layout at the repository root: Yarn workspaces (`excalidraw-app`, `packages/*`, `examples/*`), Vite for the main app, and Vitest for tests.

## Prerequisites

- **Node.js**: `>=18.0.0` (declared in root `package.json` under `engines`). GitHub Actions uses **Node.js 20.x** for tests and lint; using **20.x** locally avoids “works on my machine” drift.
- **Package manager**: **Yarn Classic 1.x** — the repo pins **`yarn@1.22.22`** via the root `package.json` `packageManager` field. Enable via [Corepack](https://nodejs.org/api/corepack.html) (`corepack enable`) or install Yarn 1.x globally.
- **Git**: Required for clone, hooks, and PR workflow.
- **Optional — Docker**: **Docker Desktop** (or compatible engine) if you run the stack with `docker-compose.yml` (nginx-served build on port **3000**). The root `Dockerfile` uses **Node 18** for the build stage.

There is **no** `.nvmrc` or `.node-version` in this repository; use `engines.node` and CI as your source of truth.

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/4asof4ik/2026-fwdays-agentic-large-day01-hw.git
cd 2026-fwdays-agentic-large-day01-hw
```

(Replace the URL with your fork or upstream remote if different.)

### 2. Install dependencies

From the **repository root**:

```bash
yarn install
```

This installs all workspace dependencies. The `prepare` script runs `husky install` so Git hooks are registered when Husky is present.

### 3. Environment variables

There is **no** `.env.example` or `.env.template` in this repo. Defaults for Vite are committed as:

| File | Role |
|------|------|
| `.env.development` | Loaded for local development (`MODE=development`). |
| `.env.production` | Used for production-oriented builds. |

**Local overrides (not committed):** per `.gitignore`, use `.env.development.local`, `.env.local`, or `.env.production.local` for machine-specific or secret values. Vite merges these with the committed env files.

**Variables you should understand** (see `.env.development` for full list and values):

- **`VITE_APP_PORT`**: Dev server port (default in committed file: **3001**).
- **`VITE_APP_BACKEND_V2_GET_URL` / `VITE_APP_BACKEND_V2_POST_URL`**: JSON storage API endpoints.
- **`VITE_APP_WS_SERVER_URL`**: Collaboration WebSocket server (development points to `http://localhost:3002`; run [excalidraw-room](https://github.com/excalidraw/excalidraw-room) locally if you need live collab).
- **`VITE_APP_AI_BACKEND`**: AI backend URL (development default targets `http://localhost:3016`).
- **`VITE_APP_FIREBASE_CONFIG`**: Firebase web client configuration (JSON string).
- **`VITE_APP_LIBRARY_URL` / `VITE_APP_LIBRARY_BACKEND`**: Library CDN and backend.
- **Feature / debug toggles**: e.g. `VITE_APP_ENABLE_TRACKING`, `VITE_APP_ENABLE_ESLINT`, `VITE_APP_ENABLE_PWA`, `VITE_APP_DEV_DISABLE_LIVE_RELOAD`, etc.

Do **not** commit secrets; keep them in `*.local` env files.

### 4. Run the development server

From the **repository root**:

```bash
yarn start
```

This runs `yarn --cwd ./excalidraw-app start`, which installs workspace deps for the app if needed and starts **Vite** with hot module replacement. Open the URL printed in the terminal (typically **`http://localhost:3001`** if using the committed `.env.development` port).

### 5. (Optional) Run via Docker Compose

```bash
docker compose up --build
```

The service maps **host port 3000** to the container (see `docker-compose.yml`). This path is for containerized runs, not the default local HMR workflow.

## Available Scripts

All commands below are defined in the **root** `package.json` `scripts` section (verified).

| Command | Description |
|---------|-------------|
| `yarn start` | Starts the Excalidraw app dev server (Vite, HMR) via `excalidraw-app`. |
| `yarn build` | Production build: `yarn --cwd ./excalidraw-app build` (`build:app` + `build:version`). |
| `yarn build:preview` | Build then `vite preview` on port **5000** (see `excalidraw-app` script). |
| `yarn build:packages` | Builds workspace packages: `common`, `math`, `element`, `excalidraw` (ESM). |
| `yarn test` | Runs **`vitest`** (`test:app`). |
| `yarn test:app` | Same as default test entry: **`vitest`**. |
| `yarn test:all` | Full gate: `test:typecheck` + `test:code` + `test:other` + `test:app --watch=false`. |
| `yarn test:typecheck` | **`tsc`** (TypeScript project check). |
| `yarn test:code` | **ESLint** with `--max-warnings=0` on `.js`, `.ts`, `.tsx`. |
| `yarn test:other` | **Prettier** check (`--list-different`) on configured globs. |
| `yarn test:coverage` | **`vitest --coverage`**. |
| `yarn test:ui` | Vitest UI with coverage enabled. |
| `yarn fix` | **`yarn fix:other && yarn fix:code`** — Prettier write + ESLint `--fix`. |
| `yarn fix:code` | ESLint with `--fix`. |
| `yarn fix:other` | Prettier `--write` on configured globs. |
| `yarn start:example` | Builds packages then starts `examples/with-script-in-browser`. |
| `yarn start:production` | Build + static serve on **localhost:5001** (`excalidraw-app`). |
| `yarn clean-install` | Removes `node_modules` trees and runs `yarn install`. |
| `yarn rm:build` | Deletes common build/dist output paths. |

**Note:** There is no script literally named `lint`; use `yarn test:code` and `yarn test:other` (or `yarn test:all`) for the same checks CI runs on pull requests.

### Git hooks (Husky / lint-staged)

- **`yarn prepare`** → `husky install` (runs after install when lifecycle scripts run).
- `.lintstagedrc.js` configures **lint-staged** (ESLint on staged `*.{js,ts,tsx}`, Prettier on staged `*.{css,scss,json,md,html,yml}`).
- The `.husky/pre-commit` hook currently has **`yarn lint-staged` commented out**. To enforce auto-fix on commit, uncomment that line in `.husky/pre-commit`.

## Golden path (install → dev → test → build)

1. **`yarn install`**
2. **`yarn start`** — local app with HMR
3. **`yarn test:all`** — typecheck, ESLint, Prettier, Vitest (non-watch)
4. **`yarn build`** — production build

For a quicker loop during feature work, **`yarn test`** (Vitest only) is acceptable; before opening a PR, prefer **`yarn test:all`** to mirror CI coverage.

## Pull Request Workflow

### Branching

Use short-lived branches with clear prefixes, for example:

- **`feat/`** — new features
- **`fix/`** — bug fixes
- **`refactor/`** — behavior-preserving structural changes

Match your team’s naming rules if they differ; consistency matters more than the exact prefix list.

### Commits and PR titles

- **Commits:** Follow **[Conventional Commits](https://www.conventionalcommits.org/)** (e.g. `feat:`, `fix:`, `chore:`, `docs:`) so history and tooling stay consistent.
- **Pull request titles:** CI runs **Semantic PR title** (`.github/workflows/semantic-pr-title.yml`) using [`amannn/action-semantic-pull-request`](https://github.com/amannn/action-semantic-pull-request). PR titles should satisfy the same conventional format (e.g. `feat: add export dialog`) or the check will fail.

### Pre-flight checks (before push)

Run locally what CI enforces:

```bash
yarn test:all
```

This is stricter than the **Tests** workflow alone (push to `master` runs `yarn install` and `yarn test:app`). The **Lint** workflow on pull requests runs:

```bash
yarn install
yarn test:other
yarn test:code
yarn test:typecheck
```

So at minimum before pushing a PR, ensure **`yarn test:other`**, **`yarn test:code`**, **`yarn test:typecheck`**, and **`yarn test:app`** (or the single **`yarn test:all`**) succeed.

### Review and CI

- Pull requests may require **at least one maintainer approval** depending on branch protection or organization policies (see your team's GitHub branch protection/contribution policy).
- Required checks include **Lint** (format + ESLint + TypeScript) and repository-specific workflows (e.g. tests, size limits, coverage PRs) as configured on the GitHub repository.

---

**Last updated:** 2026-03-26  

**Verified against project config:** Yes — root `package.json` scripts, `engines`, `packageManager`, `yarn.lock`, `.env.development` / `.env.production`, `.github/workflows/lint.yml`, `.github/workflows/test.yml`, and `.github/workflows/semantic-pr-title.yml`.
