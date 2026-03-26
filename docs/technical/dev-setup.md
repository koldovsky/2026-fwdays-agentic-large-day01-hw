# Development Setup and First PR Guide

This guide describes the full onboarding cycle for this repository: from cloning to opening your first Pull Request.

## 1) Prerequisites

### Required tools

- Git
- Node.js `>=18.0.0` (from root `package.json` engines)
- Corepack (recommended to run repo-pinned Yarn)

### Repo package manager

- The repository is pinned to `yarn@1.22.22` via `packageManager` in root `package.json`.

## 2) Clone repository to local machine

```bash
git clone <your-fork-or-repo-url>
cd 2026-fwdays-agentic-large-day01-hw
```

Optional remote setup if you work from a fork:

```bash
git remote add upstream <original-repo-url>
git fetch upstream
```

## 3) Verify runtime tooling

```bash
node -v
corepack --version
```

If `yarn` is not globally available, use `corepack yarn ...` in all commands.

## 4) Install dependencies

From repository root:

```bash
corepack yarn install
```

Notes from codebase:

- Root is a Yarn workspace monorepo (`excalidraw-app`, `packages/*`, `examples/*`).
- `prepare` script runs `husky install`, so git hooks are installed during setup.

## 5) Understand key working scripts

From root `package.json`:

- Start app: `corepack yarn start`
- Build app: `corepack yarn build`
- Preview production build: `corepack yarn build:preview`
- Build core packages: `corepack yarn build:packages`
- Run full checks: `corepack yarn test:all`
- Run app tests only: `corepack yarn test`
- Lint: `corepack yarn test:code`
- Typecheck: `corepack yarn test:typecheck`
- Format/lint autofix: `corepack yarn fix`

## 6) Run project locally (development)

```bash
corepack yarn start
```

What this does:

- Delegates to `excalidraw-app` (`yarn --cwd ./excalidraw-app start`)
- Runs Vite development server from that workspace.

Keep this terminal running while developing.

## 7) Build and validate locally

Before you prepare a PR, run:

```bash
corepack yarn build
corepack yarn test:all
```

If formatting/lint issues appear:

```bash
corepack yarn fix
```

Then re-run validation:

```bash
corepack yarn test:all
```

## 8) Create your feature branch

From your local main branch:

```bash
git checkout main
git pull
git checkout -b feature/<short-description>
```

## 9) Implement and verify changes

Typical cycle:

1. Make code changes.
2. Run app (`corepack yarn start`) and verify behavior manually.
3. Run `corepack yarn test:all`.
4. Repeat until all checks pass.

## 10) Commit changes

Check what changed:

```bash
git status
git diff
```

Commit:

```bash
git add .
git commit -m "Describe why this change is needed"
```

Hook behavior from repo:

- `.husky/pre-commit` exists.
- `.lintstagedrc.js` is configured for staged files:
  - `*.{js,ts,tsx}` -> eslint `--fix`
  - `*.{css,scss,json,md,html,yml}` -> prettier `--write`

If hook rewrites files, stage and commit again.

## 11) Push branch

```bash
git push -u origin feature/<short-description>
```

## 12) Open first Pull Request

Option A: via GitHub UI

1. Open your pushed branch on GitHub.
2. Click **Compare & pull request**.
3. Fill title/description with:
   - what changed,
   - why it changed,
   - how it was tested.

Option B: via GitHub CLI (`gh`) if installed/authenticated

```bash
gh pr create --title "<title>" --body "<summary and test plan>"
```

## 13) Suggested PR checklist

- [ ] Branch rebased/updated from latest `main` (if required by team workflow)
- [ ] `corepack yarn build` passes
- [ ] `corepack yarn test:all` passes
- [ ] No unintended files changed
- [ ] PR description includes validation steps

## 14) Useful recovery commands

If local workspace gets inconsistent:

```bash
corepack yarn clean-install
```

If only build artifacts should be cleaned:

```bash
corepack yarn rm:build
```
