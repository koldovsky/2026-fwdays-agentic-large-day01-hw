# Dev setup / onboarding (from clone to first PR)

This guide describes the **actual** developer path for this repository: from `git clone` to opening the first Pull Request.

---

## Repository overview

- **Monorepo** using **Yarn workspaces** (root `package.json` → `workspaces: ["excalidraw-app","packages/*","examples/*"]`).
- **Package manager**: `yarn@1.22.22` (root `package.json` → `packageManager`).
- **Node.js requirement**: `>=18.0.0` (root `package.json` → `engines.node`, also `excalidraw-app/package.json`).
- **CI Node version**: `20.x` (GitHub Actions workflows `test.yml`, `lint.yml`).
- **Default branch**: `master` (workflow `test.yml` runs on `push` to `master`).

---

## 0) Prerequisites

Minimum requirements implied by the repo/CI:

- Node.js **18+** (recommended: **20.x**, because CI is configured that way).
- Yarn **1.22.22** (root `package.json` pins `packageManager`).
- Git.

---

## 1) Clone

```bash
git clone <your-fork-or-upstream-url>
cd 2026-fwdays-agentic-large-day01-hw
```

Verify you’re at the monorepo root:

```bash
ls package.json excalidraw-app packages
```

---

## 2) Install dependencies (workspace)

From the repository root:

```bash
yarn install
```

Facts about install/hooks:

- Root `package.json` contains `prepare: "husky install"`, so during dependency installation Husky may set up git hooks.

If things get stuck/broken after changing Node/Yarn, the simplest “reset” (based on existing scripts) is:

```bash
yarn clean-install
```

(`clean-install` in root `package.json` = `yarn rm:node_modules && yarn install`)

---

## 3) Run the app locally (dev)

### Option A (recommended): from the repo root

Root `package.json` has:

- `start`: `yarn --cwd ./excalidraw-app start`

So run:

```bash
yarn start
```

### Option B: directly from `excalidraw-app/`

`excalidraw-app/package.json` has `start: "yarn && vite"`, so:

```bash
cd excalidraw-app
yarn start
```

---

## 4) Build (optional)

Root scripts (see `package.json`):

- **Build app**:

```bash
yarn build
```

- **Build all packages**:

```bash
yarn build:packages
```

Also useful:

- `yarn build:app` / `yarn build:app:docker` delegate to `excalidraw-app`.

---

## 5) Tests / quality checks (as in CI)

CI runs the following:

- **Unit/integration tests**: workflow `test.yml` runs:

```bash
yarn test:app
```

- **Lint + formatting + typecheck**: workflow `lint.yml` runs:

```bash
yarn test:other
yarn test:code
yarn test:typecheck
```

Recommended local “all-in-one” (root `package.json`):

```bash
yarn test:all
```

### Auto-fix

Root `package.json` provides:

- `fix:other` → prettier write
- `fix:code` → eslint --fix
- `fix` → both

```bash
yarn fix
```

---

## 6) Create a feature branch

Since the base branch referenced in CI is `master`, a typical flow is:

```bash
git checkout master
git pull
git checkout -b <your-name>/<short-topic>
```

---

## 7) Make changes & verify locally

Recommended minimum before opening a PR:

```bash
yarn test:all
```

If you only touched formatting/styles:

```bash
yarn test:other
yarn test:code
```

---

## 8) Commit

Make sure you’re not accidentally committing local env files:

- `.gitignore` ignores `.env.local`, `.env.*.local`, and other local files.

Standard flow:

```bash
git status
git add -A
git commit -m "<message>"
```

---

## 9) Push branch

```bash
git push -u origin HEAD
```

---

## 10) Open Pull Request

This repo has a PR template `.github/PULL_REQUEST_TEMPLATE.md` which expects a checklist (including `docs/technical/dev-setup.md` as a bonus item).

It also enables the GitHub Actions workflow `Semantic PR title` (`.github/workflows/semantic-pr-title.yml`) via `amannn/action-semantic-pull-request@v5`.

Practical implication:

- **Your PR title must be “semantic”** (conventional style), e.g. `feat: ...`, `fix: ...`, `docs: ...`, `chore: ...`.

Minimal PR description plan (following the template):

- **Summary**: what changes and why
- **Test plan**: what commands/steps you ran (`yarn test:all`, or whatever is relevant)

---

## Troubleshooting (based on existing scripts)

### Clean builds / artifacts

Root `package.json`:

```bash
yarn rm:build
```

### Reinstall `node_modules` across all workspaces

```bash
yarn clean-install
```

### Tests/lint don’t match CI

CI uses Node `20.x` (workflows `test.yml`, `lint.yml`). If you’re on Node 18/19 and see strange differences, verify whether it reproduces on Node 20.
