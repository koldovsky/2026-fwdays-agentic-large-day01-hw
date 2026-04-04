# Developer Setup — From Clone to First PR

> Повний гайд для нового розробника: від клонування репозиторію до відкриття першого Pull Request.

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Clone & Install](#2-clone--install)
3. [Repository Structure](#3-repository-structure)
4. [Environment Variables](#4-environment-variables)
5. [Running the App Locally](#5-running-the-app-locally)
6. [Running with Docker](#6-running-with-docker)
7. [Working with Packages](#7-working-with-packages)
8. [Testing](#8-testing)
9. [Linting & Formatting](#9-linting--formatting)
10. [Git Workflow & Hooks](#10-git-workflow--hooks)
11. [CI/CD Overview](#11-cicd-overview)
12. [Opening Your First PR](#12-opening-your-first-pr)
13. [Troubleshooting](#13-troubleshooting)

---

## 1. Prerequisites

Install the following tools before starting:

| Tool | Required version | Notes |
|------|-----------------|-------|
| **Node.js** | `>= 18.0.0` | Node 20 is used in CI; 18+ is fine locally |
| **Yarn** | `1.22.22` (classic) | Declared in `packageManager` field |
| **Git** | any recent | — |
| **Docker** *(optional)* | 20+ | Only for container-based dev |

### Install Node.js

Use [nvm](https://github.com/nvm-sh/nvm) (Unix) or [nvm-windows](https://github.com/coreybutler/nvm-windows) for version management.
There is no `.nvmrc` in this repo, so pin manually:

```bash
nvm install 20
nvm use 20
node --version   # v20.x.x
```

### Install Yarn Classic

```bash
npm install -g yarn@1.22.22
yarn --version   # 1.22.22
```

---

## 2. Clone & Install

```bash
# 1. Fork the repository on GitHub, then clone your fork
git clone https://github.com/<your-username>/excalidraw.git
cd excalidraw

# 2. Add upstream remote (original repo) so you can sync later
git remote add upstream https://github.com/excalidraw/excalidraw.git

# 3. Install all dependencies for all workspaces
yarn install
```

`yarn install` reads the root `yarn.lock` and populates `node_modules` for the root and every workspace (`excalidraw-app`, `packages/*`, `examples/*`) in one pass.

> **Slow install?** The lockfile is large (monorepo). First install can take 2–5 minutes depending on network speed.

---

## 3. Repository Structure

```
excalidraw-monorepo/
├── excalidraw-app/          # Main Vite host application (deployed to excalidraw.com)
│   ├── src/                 #   Application source (App.tsx, collab, Firebase, i18n…)
│   ├── public/              #   Static public assets
│   └── vite.config.mts      #   Vite config for the app
│
├── packages/                # Published workspace libraries
│   ├── excalidraw/          #   @excalidraw/excalidraw — main embeddable component
│   ├── common/              #   @excalidraw/common — shared utils, constants, types
│   ├── element/             #   @excalidraw/element — element geometry & mutation
│   ├── math/                #   @excalidraw/math — geometry math helpers
│   └── utils/               #   @excalidraw/utils — serialization & export helpers
│
├── examples/                # Integration examples (not published)
│   ├── with-nextjs/         #   Next.js 14 integration (dev on :3005)
│   └── with-script-in-browser/  # Plain browser <script> integration
│
├── scripts/                 # Build, release, and tooling scripts
├── .github/workflows/       # GitHub Actions CI/CD
├── .husky/                  # Git hooks (pre-commit)
├── firebase-project/        # Firebase rules & config
├── docs/                    # Technical, product, and memory docs
│
├── package.json             # Monorepo root (Yarn workspaces)
├── tsconfig.json            # Root TypeScript config + path aliases
├── vitest.config.mts        # Vitest test runner config
├── docker-compose.yml       # Dev container setup
└── Dockerfile               # Multi-stage prod image (Node 18 → nginx)
```

See [architecture.md](./architecture.md) for a detailed breakdown of the component and data flow architecture.

---

## 4. Environment Variables

The app uses [Vite env variables](https://vitejs.dev/guide/env-and-mode) prefixed with `VITE_APP_`.

### Committed env files

| File | Used when |
|------|-----------|
| `.env.development` | `yarn start` (Vite dev mode) |
| `.env.production` | `yarn build` / production builds |

These files are committed and contain non-secret configuration (public Firebase client config, API URLs, etc.).

### Local overrides (not committed)

Create `.env.development.local` for local secrets/overrides — it is in `.gitignore`:

```bash
# .env.development.local  — example values
VITE_APP_WS_SERVER_URL=http://localhost:3002   # local collab server
VITE_APP_DEV_DISABLE_LIVE_RELOAD=true          # disable HMR if needed
```

### Key variables

| Variable | Purpose |
|----------|---------|
| `VITE_APP_BACKEND_V2_GET_URL` | Scene sharing backend (GET) |
| `VITE_APP_BACKEND_V2_POST_URL` | Scene sharing backend (POST) |
| `VITE_APP_WS_SERVER_URL` | Collaboration WebSocket server |
| `VITE_APP_FIREBASE_CONFIG` | Firebase client config (JSON string) |
| `VITE_APP_AI_BACKEND` | AI feature backend URL |
| `VITE_APP_PLUS_APP` | Excalidraw Plus app URL |
| `VITE_APP_PORT` | Vite dev server port (default `3001`) |

---

## 5. Running the App Locally

### Start the development server

```bash
yarn start
```

This runs `vite` inside `excalidraw-app/`. The app will be available at:

```
http://localhost:3001
```

Port is configured via `VITE_APP_PORT` in `.env.development`.

### Production preview

```bash
# Build and serve locally
yarn start:production
# App served at http://localhost:5001
```

### Examples

```bash
# Next.js example (builds packages first, then runs Next on :3005)
cd examples/with-nextjs
yarn dev

# Browser script example (builds packages, then Vite on default port)
yarn start:example
```

---

## 6. Running with Docker

Use Docker if you want an isolated environment matching the production image.

```bash
# Build and start the container (maps container port 80 → host port 3000)
docker-compose up --build

# App available at:
# http://localhost:3000
```

The `docker-compose.yml` mounts the repo into the container with hot-reload volumes, so source changes are reflected without rebuilding the image.

```bash
# Stop the container
docker-compose down

# Rebuild from scratch (e.g., after dependency changes)
docker-compose up --build --force-recreate
```

---

## 7. Working with Packages

The `packages/*` libraries need to be **built before** examples and the app can consume them as ES modules.

### Build all packages

```bash
yarn build:packages
# Runs: build:common → build:math → build:element → build:excalidraw
```

Build order matters because of dependencies:
`common` → `math` → `element` → `excalidraw`

### Build individual packages

```bash
yarn build:common
yarn build:math
yarn build:element
yarn build:excalidraw
```

Each build outputs to `packages/<name>/dist/` (dev and prod variants + type declarations).

### Path aliases (no build needed in app)

Inside `excalidraw-app/` and during type-checking, the root `tsconfig.json` maps `@excalidraw/*` to the package `src/` directories directly:

```jsonc
// tsconfig.json (simplified)
"paths": {
  "@excalidraw/common": ["packages/common/src/index.ts"],
  "@excalidraw/element": ["packages/element/src/index.ts"],
  // ...
}
```

So the dev server uses TypeScript source directly — you only need the build when consuming the packages from outside the monorepo (e.g., examples/with-nextjs).

### Clean build artifacts

```bash
yarn rm:build        # removes dist/ and build/ across all workspaces
yarn rm:node_modules # removes all node_modules
yarn clean-install   # rm:node_modules + fresh yarn install
```

---

## 8. Testing

### Run all tests (watch mode)

```bash
yarn test
# or
yarn test:app
```

### Run once (CI mode)

```bash
yarn test:app --watch=false
```

### Run full CI suite

```bash
yarn test:all
# Runs: test:typecheck, test:code, test:other, test:app
```

| Command | What it checks |
|---------|---------------|
| `yarn test:typecheck` | TypeScript type errors (`tsc --noEmit`) |
| `yarn test:code` | ESLint (zero warnings allowed) |
| `yarn test:other` | Prettier formatting on css/json/md/yml |
| `yarn test:app` | Vitest unit/integration tests |

### Coverage

```bash
yarn test:coverage           # single run with coverage report
yarn test:coverage:watch     # watch mode + coverage
yarn test:ui                 # Vitest UI in browser
```

Coverage thresholds (enforced in CI):

| Metric | Threshold |
|--------|-----------|
| Lines | 60% |
| Branches | 70% |
| Functions | 63% |
| Statements | 60% |

### Update snapshots

```bash
yarn test:update
```

---

## 9. Linting & Formatting

### Auto-fix everything

```bash
yarn fix          # Prettier + ESLint fix
yarn fix:code     # ESLint fix only
yarn fix:other    # Prettier fix only
```

### Check only (no changes)

```bash
yarn test:code    # ESLint check
yarn test:other   # Prettier check
```

### Configuration files

| File | Tool |
|------|------|
| `.eslintrc.json` | ESLint (extends `@excalidraw/eslint-config`, `react-app`) |
| `prettier` field in `package.json` | `@excalidraw/prettier-config` |
| `.lintstagedrc.js` | lint-staged rules for pre-commit |

### lint-staged rules

When committing, lint-staged applies:
- ESLint (with `--fix`) on `*.{js,ts,tsx}` staged files
- Prettier (with `--write`) on `*.{css,scss,json,md,html,yml}` staged files

---

## 10. Git Workflow & Hooks

### Husky pre-commit hook

Husky is installed via `yarn prepare` (runs automatically after `yarn install`).
The pre-commit hook is located at `.husky/pre-commit`.

> **Note:** Currently the pre-commit hook contains commented-out lint-staged invocation. Check the hook file and uncomment / update it as needed for your workflow.

### Conventional Commits

PR titles are validated by the `semantic-pr-title` CI workflow using [`amannn/action-semantic-pull-request`](https://github.com/amannn/action-semantic-pull-request).

Use the format:

```
<type>(<scope>): <description>

Types: feat, fix, chore, docs, refactor, test, perf, ci, build, revert
```

Examples:

```
feat(collab): add cursor presence indicator
fix(element): correct bounding box for rotated text
docs: add dev-setup onboarding guide
```

### Branch naming convention

```
feat/<short-description>
fix/<short-description>
chore/<short-description>
docs/<short-description>
```

---

## 11. CI/CD Overview

All CI runs on GitHub Actions. Here is what triggers on a PR to `master`:

| Workflow | Trigger | What runs |
|----------|---------|-----------|
| `lint.yml` | Pull request | Node 20, `test:other` + `test:code` + `test:typecheck` |
| `test-coverage-pr.yml` | Pull request | `test:coverage`, posts coverage report as PR comment |
| `size-limit.yml` | PR to master | Bundle size check for `@excalidraw/excalidraw` |
| `semantic-pr-title.yml` | PR opened/edited | Validates conventional commit title format |

Additional workflows (triggered on push):

| Workflow | Trigger | What it does |
|----------|---------|-------------|
| `test.yml` | push to `master` | Runs `test:app` |
| `build-docker.yml` | push to `release` | Builds Docker image |
| `publish-docker.yml` | push to `release` | Builds multi-arch image and pushes to Docker Hub |
| `autorelease-excalidraw.yml` | push to `release` | Publishes `@excalidraw/excalidraw` to NPM (`next` tag) |
| `sentry-production.yml` | push to `release` | Builds app, uploads sourcemaps to Sentry |

**All CI must be green before a PR can be merged.**

---

## 12. Opening Your First PR

### Step-by-step

```bash
# 1. Sync your fork with upstream
git fetch upstream
git checkout master
git merge upstream/master

# 2. Create a feature branch
git checkout -b feat/your-feature-name

# 3. Make your changes
# ... edit files ...

# 4. Run the full local check suite before pushing
yarn test:all

# 5. Commit using conventional commit format
git add .
git commit -m "feat(scope): your descriptive message"

# 6. Push to your fork
git push origin feat/your-feature-name

# 7. Open a PR on GitHub from your fork to upstream/master
```

### PR checklist

Before opening the PR, verify:

- [ ] `yarn test:typecheck` passes (no TS errors)
- [ ] `yarn test:code` passes (no ESLint warnings)
- [ ] `yarn test:other` passes (Prettier formatting)
- [ ] `yarn test:app --watch=false` passes (all unit tests)
- [ ] PR title follows [Conventional Commits](#conventional-commits) format
- [ ] Description explains **what** and **why** (not just what files changed)
- [ ] No `.env.*.local` or secrets committed

### CodeRabbit AI review

This repo has `.coderabbit.yaml` configured. CodeRabbit will automatically review your PR and post comments. It is aware of the architecture docs, domain glossary, and memory bank — take its feedback seriously.

---

## 13. Troubleshooting

### `yarn install` fails or hangs

```bash
yarn clean-install
# This removes all node_modules and reinstalls from scratch
```

### Port already in use

Change the port in `.env.development.local`:

```bash
VITE_APP_PORT=3099
```

### TypeScript path aliases not resolving in IDE

Ensure your IDE uses the **workspace TypeScript version** (not the built-in). In VS Code/Cursor:

1. Open any `.ts` / `.tsx` file
2. `Ctrl+Shift+P` → "TypeScript: Select TypeScript Version"
3. Choose "Use Workspace Version"

### `@excalidraw/common` module not found in examples

The examples consume the compiled `dist/` output. Build packages first:

```bash
yarn build:packages
```

### Tests fail with canvas errors

Vitest uses `vitest-canvas-mock` for canvas API mocking. If you see canvas-related errors, make sure `setupTests.ts` is included in your `vitest.config.mts` setup.

### Docker build fails on Windows

Enable WSL2 backend in Docker Desktop settings. Also ensure line endings in shell scripts are LF (not CRLF):

```bash
git config core.autocrlf false
git checkout -- .
```

### Husky hooks not running

Re-run the prepare script:

```bash
yarn prepare
```

---

## Further Reading

- [Architecture Overview](./architecture.md) — Component hierarchy, state management, rendering pipeline
- [Domain Glossary](../product/domain-glossary.md) — Excalidraw-specific terminology
- [Tech Context](../memory/techContext.md) — Stack decisions, package versions, tooling rationale
- [Decision Log](../memory/decisionLog.md) — Past architectural decisions with context
- [packages/excalidraw/README.md](../../packages/excalidraw/README.md) — Embedding `@excalidraw/excalidraw` in your own app
