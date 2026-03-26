# Developer Setup Guide

## Purpose

- This guide helps a new developer run the project locally and submit the first Pull Request.
- All commands and assumptions below are verified from repository scripts and config files.

## Project type and scope

- Monorepo: `excalidraw-monorepo` (Yarn workspaces).
- Main runnable app: `excalidraw-app` (React + Vite).
- Core reusable packages: `packages/common`, `packages/math`, `packages/element`, `packages/excalidraw`, `packages/utils`.

## Prerequisites

- `git` installed.
- `node >= 18.0.0` (required by root `package.json` and `excalidraw-app/package.json`).
- `yarn 1.22.22` (declared in root `package.json` as `packageManager: yarn@1.22.22`).

## 1) Clone and open the repository

- Clone:
  - `git clone <your-fork-or-repo-url>`
- Enter folder:
  - `cd 2026-fwdays-agentic-large-day01-hw_fork`
- Verify tools:
  - `node -v`
  - `yarn -v`

## 2) Install dependencies

- Install all workspace dependencies from repository root:
  - `yarn install`
- Optional clean reinstall if dependencies are broken:
  - `yarn clean-install`

## 3) Environment setup (`.env`, config)

### What exists in repo

- Root env files are present:
  - `.env.development`
  - `.env.production`
- `excalidraw-app/vite.config.mts` sets `envDir: "../"` and loads env from repo root.

### Recommended local override

- Create local overrides in `.env.local` at repo root (not committed):
  - Example:
    - `cp .env.development .env.local`
- Then edit only values you need locally (for example):
  - `VITE_APP_PORT`
  - `VITE_APP_WS_SERVER_URL`
  - `VITE_APP_AI_BACKEND`
  - `VITE_APP_DISABLE_PREVENT_UNLOAD`
  - `VITE_APP_ENABLE_PWA`

### Important notes

- The app reads many `VITE_APP_*` variables (see `excalidraw-app/vite-env.d.ts` and usage in `excalidraw-app/*`).
- Collaboration websocket in development defaults to `http://localhost:3002` in `.env.development`.
- If you do not run local collab service, set a reachable websocket URL in `.env.local` for collab features.

## 4) Run locally (frontend)

- Start the app from repository root:
  - `yarn start`
- This runs the `excalidraw-app` dev server (Vite).
- Default port comes from `VITE_APP_PORT` (fallback in config is `3000`; `.env.development` sets `3001`).

## 5) Backend and database expectations

- This repository does **not** include a traditional backend service (Laravel/Symfony/Node API), `composer.json`, or DB migration workflow.
- There are no repo scripts for SQL migrations (Prisma/TypeORM/Sequelize/etc.).
- App integrates with remote/external services via env vars (JSON backend, Firebase, websocket/collab, AI backend).

## 6) Build packages and app

- Build core packages:
  - `yarn build:packages`
- Build app:
  - `yarn build`
- Preview production build:
  - `yarn build:preview`

## 7) Tests (unit/integration) and quality checks

### Main test commands (from root `package.json`)

- Run app tests:
  - `yarn test`
- Run full validation pipeline:
  - `yarn test:all`
- TypeScript type check:
  - `yarn test:typecheck`
- Lint:
  - `yarn test:code`
- Prettier check:
  - `yarn test:other`
- Coverage:
  - `yarn test:coverage`

### Fix formatting/linting

- Auto-format and lint fixes:
  - `yarn fix`
- Only lint fixes:
  - `yarn fix:code`
- Only prettier write:
  - `yarn fix:other`

## 8) Git workflow (branch -> commit -> push -> PR)

### Create branch

- Sync default branch and create feature branch:
  - `git checkout main`
  - `git pull`
  - `git checkout -b feat/<short-description>`

### Implement and validate

- Make changes.
- Run checks before commit:
  - `yarn test:typecheck`
  - `yarn test:code`
  - `yarn test`

### Commit

- Stage files:
  - `git add <paths>`
- Commit with clear message:
  - `git commit -m "feat: <what changed and why>"`

### Push

- Push branch:
  - `git push -u origin feat/<short-description>`

### Create Pull Request

- Option A (GitHub UI): open your fork/branch and create PR into target branch.
- Option B (`gh` CLI):
  - `gh pr create --title "feat: <title>" --body "<summary and test plan>"`

## 9) First Pull Request checklist

- Branch is focused and small enough for review.
- Tests and checks pass locally (`yarn test:all` recommended for final verification).
- No secrets in committed files (`.env.local` must stay uncommitted).
- PR description includes:
  - problem/context,
  - change summary,
  - test plan,
  - screenshots/GIF for UI changes.

## 10) Code review recommendations

- Keep PRs scoped to one concern (feature/fix/refactor).
- Prefer explicit reasoning in PR description (why, risks, rollback path).
- Verify backward compatibility for:
  - `@excalidraw/excalidraw` public exports (`packages/excalidraw/index.tsx`),
  - app-level env behavior (`excalidraw-app/vite.config.mts`, `.env*`),
  - state/update pipeline in `packages/excalidraw/components/App.tsx`.
- For reviewer comments:
  - reply with intent,
  - push incremental commits,
  - rerun checks before resolving threads.

## 11) Troubleshooting quick notes

- Port conflict:
  - change `VITE_APP_PORT` in `.env.local`.
- Collab not working:
  - verify `VITE_APP_WS_SERVER_URL` points to a reachable websocket server.
- Build/test inconsistencies:
  - run `yarn clean-install`, then rerun checks.

## Reference commands (copy-paste)

- Install: `yarn install`
- Dev server: `yarn start`
- Full checks: `yarn test:all`
- Fix style/lint: `yarn fix`
- Build app: `yarn build`
- Build packages: `yarn build:packages`
