# Developer Setup

This document is a source-grounded onboarding guide for this repository.
It covers the path from clone to opening the first pull request.

Scope:
- repository bootstrap
- local run and verification
- branch/commit/PR flow
- mapping local checks to configured GitHub Actions checks

If you need architecture details, see:
- `docs/technical/architecture.md`
- `docs/technical/packages-architecture.md`

## 1. Prerequisites

### 1.1 Required runtime versions

From source:
- Root `package.json`:
  - `packageManager: yarn@1.22.22`
  - `engines.node: >=18.0.0`
- `excalidraw-app/package.json`:
  - `engines.node: >=18.0.0`
- GitHub Actions (`.github/workflows/*.yml`) mostly run on Node `20.x`.

Practical recommendation:
- Use Node `20.x` locally to match CI behavior.
- Use Yarn `1.22.22`.

### 1.2 Required tools

- `git`
- `node` (>=18, recommended 20.x)
- `yarn` (1.22.22)
- Optional:
  - `docker` + `docker compose` (for containerized run)
  - GitHub CLI (`gh`) for PR creation from terminal

## 2. Clone and Bootstrap

### 2.1 Clone repository

Repository URL in package metadata points to:

```bash
git clone https://github.com/excalidraw/excalidraw.git
cd <repo-dir>
```

If you are working from a fork, clone your fork URL instead.

### 2.2 Configure remotes (fork workflow)

If `origin` is your fork, add upstream remote:

```bash
git remote add upstream https://github.com/excalidraw/excalidraw.git
git fetch upstream
```

Verify remotes:

```bash
git remote -v
```

### 2.3 Install dependencies

Install at repository root:

```bash
yarn install
```

Notes from source:
- Root uses Yarn workspaces (`excalidraw-app`, `packages/*`, `examples/*`).
- Root scripts assume workspace layout and Yarn commands.

## 3. Run the Project Locally

### 3.1 Run the standalone app (default dev flow)

```bash
yarn start
```

What this does:
- Root script delegates to `excalidraw-app/start`.
- `excalidraw-app/start` runs `yarn && vite`.
- `excalidraw-app/vite.config.mts`:
  - loads env vars from repository root (`envDir: "../"`)
  - uses `VITE_APP_PORT` (fallback `3000`)
  - sets `server.open: true` (opens browser on start).

Current `.env.development` includes:
- `VITE_APP_PORT=3001`

So default dev URL is typically:
- `http://localhost:3001`

### 3.2 Run production preview locally

```bash
yarn build
yarn start:production
```

Alternative preview:

```bash
yarn build:preview
```

### 3.3 Run examples

Script-in-browser example:

```bash
yarn start:example
```

Next.js example has its own README and app-level commands under:
- `examples/with-nextjs/README.md`

### 3.4 Optional Docker run

```bash
docker compose up --build
```

From `docker-compose.yml`:
- service `excalidraw` exposes `3000:80`.

## 4. Environment Configuration

### 4.1 Baseline env files already in repo

Repository contains:
- `.env.development`
- `.env.production`

This means basic startup does not require creating a new `.env` file first.

### 4.2 Key env groups used by the app

Declared in code (`excalidraw-app/vite-env.d.ts`, app source):
- backend API:
  - `VITE_APP_BACKEND_V2_GET_URL`
  - `VITE_APP_BACKEND_V2_POST_URL`
- collaboration:
  - `VITE_APP_WS_SERVER_URL`
  - `VITE_APP_PORTAL_URL` (declared, optional by workflow)
- Firebase:
  - `VITE_APP_FIREBASE_CONFIG`
- AI:
  - `VITE_APP_AI_BACKEND`
- Plus/external integrations:
  - `VITE_APP_PLUS_LP`
  - `VITE_APP_PLUS_APP`
  - `VITE_APP_PLUS_EXPORT_PUBLIC_KEY`
- build/runtime flags:
  - `VITE_APP_GIT_SHA`
  - `VITE_APP_ENABLE_TRACKING`
  - `VITE_APP_DISABLE_SENTRY`
  - `VITE_APP_DISABLE_PREVENT_UNLOAD`
  - `VITE_APP_ENABLE_ESLINT`
  - `VITE_APP_ENABLE_PWA`
  - `VITE_APP_COLLAPSE_OVERLAY`

### 4.3 Service dependency reality

From source and current docs:
- Some features depend on external services (backend API, websocket, Firebase, AI).
- Core editor run works without standing up all services locally.
- Collaboration/AI/backend-share flows depend on those endpoints.

## 5. Verify Local Setup

Run baseline checks at root:

```bash
yarn test:code
yarn test:typecheck
yarn test:other
yarn test:app --watch=false
```

Or full predefined aggregate:

```bash
yarn test:all
```

Coverage check used in PR workflow:

```bash
yarn test:coverage
```

Package build sanity:

```bash
yarn build:packages
```

App build sanity:

```bash
yarn build
```

## 6. Make Your First Change

### 6.1 Create a feature branch

```bash
git checkout -b <short-branch-name>
```

### 6.2 Implement and validate

Recommended minimum before first PR:

```bash
yarn test:other
yarn test:code
yarn test:typecheck
```

If your change affects runtime/editor behavior, also run:

```bash
yarn test:app --watch=false
```

If your change touches package size-sensitive editor bundle:

```bash
yarn --cwd packages/excalidraw build:esm
```

Rationale:
- `size-limit` GitHub Action runs against `packages/excalidraw` on PRs to `master`.

## 7. Commit Workflow

### 7.1 Stage and commit

```bash
git add -A
git commit -m "<message>"
```

### 7.2 Important hook fact

Source state:
- `.husky/pre-commit` currently contains only a commented line:
  - `# yarn lint-staged`

Implication:
- lint-staged rules exist in `.lintstagedrc.js`, but pre-commit does not invoke them by default.
- Run lint/typecheck/format checks manually before pushing.

## 8. Open the First PR

### 8.1 Push branch

```bash
git push -u origin <short-branch-name>
```

### 8.2 Create PR

Use GitHub UI or GitHub CLI:

```bash
gh pr create --base master --head <your-github-user>:<short-branch-name>
```

If using UI:
1. Open your branch on GitHub.
2. Create a pull request.
3. Fill `.github/PULL_REQUEST_TEMPLATE.md`.

### 8.3 PR title requirement

Workflow `.github/workflows/semantic-pr-title.yml` runs on PR open/edit/sync using:
- `amannn/action-semantic-pull-request@v5`

Use a semantic-style PR title compatible with this check.

### 8.4 Target branch

From workflows:
- several PR workflows run on any `pull_request`
- `size-limit` explicitly runs for PRs targeting `master`
- `test.yml` runs on pushes to `master`.

For normal contribution flow, open PR to `master` unless your task specifies otherwise.

## 9. CI-to-Local Check Mapping

### 9.1 Lint workflow (`.github/workflows/lint.yml`)

CI runs:
- `yarn install`
- `yarn test:other`
- `yarn test:code`
- `yarn test:typecheck`

Local equivalent:

```bash
yarn test:other && yarn test:code && yarn test:typecheck
```

### 9.2 Coverage PR workflow (`.github/workflows/test-coverage-pr.yml`)

CI runs:
- `yarn install`
- `yarn test:coverage`

Local equivalent:

```bash
yarn test:coverage
```

### 9.3 Semantic PR title workflow

CI validates PR title format.
Local pre-check is manual (set a semantic PR title before/while opening PR).

### 9.4 Bundle size workflow (`.github/workflows/size-limit.yml`)

CI behavior:
- runs on PR to `master`
- installs deps in `packages/excalidraw`
- runs size-limit build using `build:esm`.

Local approximation:

```bash
yarn --cwd packages/excalidraw
yarn --cwd packages/excalidraw build:esm
```

## 10. Known Gaps and Conventions

From repository state:
- No root `CONTRIBUTING.md` file is present.
- PR template is workshop-oriented (`Day 1: Workshop Assignment`) and includes checklists.
- Memory Bank is maintained under `docs/memory-bank/`.

For this repository, practical onboarding source of truth is:
- root/workspace scripts in `package.json`
- app scripts in `excalidraw-app/package.json`
- GitHub workflows in `.github/workflows/`
- technical docs in `docs/technical/`
