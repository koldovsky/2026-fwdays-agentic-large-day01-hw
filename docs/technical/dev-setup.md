# Developer setup and onboarding

End-to-end guide from a fresh clone to opening your first pull request. This repository is a Yarn workspaces monorepo (Excalidraw app + packages + examples).

## Prerequisites

| Requirement | Notes |
| --- | --- |
| **Node.js** | **18 or newer** (`engines` in root `package.json`; CI uses Node **20.x**—matching that version avoids surprises). |
| **Yarn** | **Classic Yarn 1.x**, pinned as **1.22.22** in root `package.json` → `packageManager`. Install globally or via Corepack: `corepack enable && corepack prepare yarn@1.22.22 --activate`. |
| **Git** | Any recent version. Default branch is **`master`**. |

Optional: a modern browser (Chrome, Firefox, or Safari) for local development.

## 1. Clone the repository

Replace the URL with your fork or the upstream remote you use.

```bash
git clone <repository-url>
cd 2026-fwdays-agentic-large-day01-hw
```

## 2. Install dependencies

From the **repository root**:

```bash
yarn install
```

This links all workspaces (`excalidraw-app`, `packages/*`, `examples/*`).

The `prepare` script runs **`husky install`** so Git hooks are registered locally. The bundled `pre-commit` hook is minimal; if you want staged ESLint/Prettier on every commit, wire up `lint-staged` in `.husky/pre-commit` (see `.lintstagedrc.js`).

## 3. Environment variables

Vite loads env from the **parent directory of** `excalidraw-app/vite.config.mts`—that is the **repo root**.

- Committed defaults: **`.env.development`** and **`.env.production`** (tracked in this repo).
- **Local overrides** (never commit): create **`.env.development.local`** or **`.env.local`** in the repo root. These names are gitignored.

Typical knobs:

- **`VITE_APP_PORT`** — dev server port (see current value in `.env.development`; default elsewhere is often `3000`).
- **`VITE_APP_WS_SERVER_URL`** — collaboration WebSocket server (local room or remote).
- **`VITE_APP_FIREBASE_CONFIG`** and other `VITE_*` keys — only change when you know you need a different backend.

If something behaves oddly after pulling, compare your local env files with the latest `.env.development`.

## 4. Run the app locally

```bash
yarn start
```

This runs `yarn --cwd ./excalidraw-app start`, which installs app deps if needed and starts **Vite**. The dev server may open a browser automatically (`open: true` in Vite config).

To exercise packages + the browser script example:

```bash
yarn start:example
```

## 5. Quality checks (run before you push)

These mirror what CI enforces on pull requests (see [Lint workflow](.github/workflows/lint.yml) and [Test Coverage PR](.github/workflows/test-coverage-pr.yml)).

**Fast loop while developing:**

```bash
yarn test              # Vitest (watch mode by default)
yarn test:typecheck    # `tsc` at repo root
yarn test:code         # ESLint
yarn test:other        # Prettier `--list-different`
```

**Full local gate** (no watch; closer to “green CI”):

```bash
yarn test:all
```

**Auto-fix** what ESLint/Prettier can fix:

```bash
yarn fix
```

**Coverage** (also runs on PRs):

```bash
yarn test:coverage
```

## 6. Builds

- **App production build:** `yarn build`
- **Workspace packages only:** `yarn build:packages`
- **Docker-oriented build:** `yarn build:app:docker`

## 7. IDE and TypeScript

Path aliases for `@excalidraw/*` packages are defined in root **`tsconfig.json`**. Open the **repository root** in your editor so resolution and “Go to definition” work across `excalidraw-app` and `packages/*`.

## 8. Git workflow for your first PR

### 8.1 Sync and branch

```bash
git fetch origin
git checkout master
git pull origin master
git checkout -b feat/your-topic-short-description
```

Use a branch name that reflects the change; the important part for automation is the **PR title** (next section).

### 8.2 Commit

Write clear commit messages your reviewers can follow. There is no repo-specific commit hook enforcing format, but **PR titles** must be semantic (see below).

### 8.3 Push and open a PR

```bash
git push -u origin feat/your-topic-short-description
```

On GitHub, open a **pull request** targeting **`master`**.

### 8.4 PR title — semantic format (required)

The workflow [**Semantic PR title**](.github/workflows/semantic-pr-title.yml) uses [Conventional Commits](https://www.conventionalcommits.org/) style prefixes. Examples that work:

- `feat: add export shortcut for SVG`
- `fix: correct pointer capture on tablet`
- `docs: update dev-setup instructions`
- `chore: bump vitest dev dependency`

If the check fails, edit the PR title on GitHub to match one of the allowed types (`feat`, `fix`, `docs`, `chore`, etc.).

### 8.5 What CI runs on your PR

| Workflow | Trigger | Main steps |
| --- | --- | --- |
| **Lint** | `pull_request` | `yarn test:other`, `yarn test:code`, `yarn test:typecheck` |
| **Test Coverage PR** | `pull_request` | `yarn test:coverage` + PR comment report |
| **Bundle Size** | PR to `master` | Size check for `@excalidraw/excalidraw` in `packages/excalidraw` |

Pushes to **`master`** also run [**Tests**](.github/workflows/test.yml) (`yarn test:app`).

Fix any failing jobs locally using the commands in section 5 before pushing updates.

## 9. Docker (optional)

A `Dockerfile` and `docker-compose.yml` exist for containerized builds and serving static output. See **`../memory/techContext.md`** for image notes (`node:18` build, `nginx` serve, port mapping).

## 10. Troubleshooting

| Symptom | What to try |
| --- | --- |
| Stale or broken `node_modules` | `yarn clean-install` (root script removes workspace `node_modules` and reinstalls). |
| Port already in use | Set **`VITE_APP_PORT`** in `.env.development.local` (repo root). |
| Clean build artifacts | `yarn rm:build` |
| Tests/lint pass locally but CI fails | Align **Node** version with CI (**20.x**), run `yarn test:all`, and ensure no formatting drift (`yarn fix`). |

## Quick reference (root scripts)

| Command | Purpose |
| --- | --- |
| `yarn start` | Dev server (Excalidraw app) |
| `yarn test` / `yarn test:app` | Vitest |
| `yarn test:all` | Typecheck + ESLint + Prettier check + Vitest once |
| `yarn fix` | Prettier write + ESLint `--fix` |
| `yarn build` | Production app build |

For architecture and stack details, see [`architecture.md`](architecture.md) and [`../memory/techContext.md`](../memory/techContext.md).
