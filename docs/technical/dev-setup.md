# Developer Setup Guide

This guide describes a practical onboarding flow for contributors, from cloning the repository to opening your first pull request.

## 1) Prerequisites

Install these tools before starting:

- Git
- Node.js `>=18`
- Yarn `1.22.22` (Yarn Classic)
- Optional: GitHub CLI (`gh`) for creating PRs from terminal

Quick checks:

```bash
node -v
yarn -v
git --version
```

## 2) Clone the repository

If you have direct write access:

```bash
git clone https://github.com/excalidraw/excalidraw.git
cd excalidraw
```

If you plan to contribute via fork (common case):

1. Fork `excalidraw/excalidraw` on GitHub.
2. Clone your fork:

```bash
git clone https://github.com/<your-username>/excalidraw.git
cd excalidraw
```

3. Add upstream remote:

```bash
git remote add upstream https://github.com/excalidraw/excalidraw.git
git remote -v
```

## 3) Install dependencies

From repository root:

```bash
yarn install
```

This repo is a Yarn workspace monorepo, so install from root once.

## 4) Start the app locally

Run the development server:

```bash
yarn start
```

By default this runs the `excalidraw-app` workspace dev server.

## 5) (Optional) Configure environment variables

Some features rely on external services. For basic UI work, defaults are often enough.

Common variables used in this repo:

- `VITE_APP_WS_SERVER_URL`
- `VITE_APP_BACKEND_V2_GET_URL`
- `VITE_APP_BACKEND_V2_POST_URL`
- `VITE_APP_FIREBASE_CONFIG`
- `VITE_APP_AI_BACKEND`
- `VITE_APP_PORT`
- `VITE_APP_ENABLE_PWA`

Set only what your task needs.

## 6) Create your first working branch

Keep `master` clean and create a feature branch:

```bash
git checkout master
git pull --ff-only upstream master
git checkout -b feat/<short-description>
```

If you cloned the main repo (without fork), replace `upstream` with `origin` in the pull command.

## 7) Make changes and run local checks

After coding, run checks from repo root:

```bash
yarn test:code
yarn test:typecheck
yarn test:app --watch=false
```

If you want auto-fixes:

```bash
yarn fix
```

## 8) Commit your changes

Stage and commit:

```bash
git add .
git commit -m "fix: concise description of your change"
```

Use clear, focused commits. If possible, keep one logical change per commit.

## 9) Push your branch

Push to your fork (or origin) and set upstream tracking:

```bash
git push -u origin feat/<short-description>
```

## 10) Open your first pull request

### Option A: GitHub web UI

1. Open your pushed branch on GitHub.
2. Click **Compare & pull request**.
3. Set:
   - base repository: `excalidraw/excalidraw`
   - base branch: `master`
   - compare branch: your feature branch
4. Write a clear title and description (problem, solution, test evidence).
5. Submit the pull request.

### Option B: GitHub CLI

```bash
gh pr create --base master --head feat/<short-description> --fill
```

Then edit the generated PR description before submitting if needed.

## 11) Respond to CI and review feedback

After opening the PR:

1. Monitor CI checks.
2. Address review comments in follow-up commits.
3. Push updates to the same branch; PR updates automatically.

## 12) Keep your branch up to date (if needed)

When `master` moves forward:

```bash
git fetch upstream
git checkout feat/<short-description>
git rebase upstream/master
git push --force-with-lease
```

Use this only when your team workflow allows rebasing pushed branches.
