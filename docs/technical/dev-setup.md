# Dev Setup

## Purpose

This guide describes the practical onboarding flow for this repository from `git clone` to opening a first pull request.
It is based on the current source tree, package scripts, tracked env files, and GitHub workflows.

## What You Are Cloning

This repository is a Yarn workspaces monorepo.
The main application lives in `excalidraw-app`, while reusable packages live under `packages/*`.

Main workspace roots:

- `excalidraw-app` - browser application shell
- `packages/common`
- `packages/math`
- `packages/element`
- `packages/excalidraw`
- `packages/utils`
- `examples/*`

## Prerequisites

Install these first:

- Git
- Node.js `20.x` recommended
- Yarn Classic `1.22.22`

Why Node 20 when `package.json` says `>=18`:

- the repo allows Node 18+
- GitHub Actions currently run Node `20.x` for lint and test workflows
- using Node 20 locally reduces CI drift

Recommended check:

```bash
node -v
yarn -v
git --version
```

Expected Yarn major version is `1`.

## Clone And Install

If you work through a fork, fork first and clone your fork.
Then install dependencies from the repository root.

```bash
git clone <your-repo-url>
cd 2026-fwdays-agentic-large-day01-hw
yarn install
```

Important details:

- the root `packageManager` is `yarn@1.22.22`
- dependency installation at the root bootstraps all workspaces
- `prepare` runs `husky install`
- `.npmrc` enables `save-exact=true` and `legacy-peer-deps=true`

If the install gets into a bad state, use:

```bash
yarn clean-install
```

That command removes all workspace `node_modules` and performs a fresh install.

## Environment Configuration

The repository already contains tracked environment files:

- `.env.development`
- `.env.production`

The Vite app loads env vars from the repository root because `excalidraw-app/vite.config.mts` sets `envDir: "../"`.

For local overrides, use untracked files listed in `.gitignore`, for example:

- `.env.development.local`
- `.env.local`
- `.env.production.local`

Do not put personal or machine-specific values into tracked `.env.*` files.

Key development defaults already present in `.env.development`:

- `VITE_APP_PORT=3001`
- `VITE_APP_WS_SERVER_URL=http://localhost:3002`
- `VITE_APP_AI_BACKEND=http://localhost:3016`
- `VITE_APP_ENABLE_ESLINT=true`
- `VITE_APP_ENABLE_PWA=false`

Implication:

- the local web app runs on `http://localhost:3001` by default
- some optional integrations point to separate local services that are not started by this repo

## Start The App

Run the app from the repository root:

```bash
yarn start
```

What this does:

1. delegates to `yarn --cwd ./excalidraw-app start`
2. runs `yarn` inside `excalidraw-app`
3. starts the Vite dev server
4. opens the browser automatically

Default local URL:

```text
http://localhost:3001
```

Useful variants:

```bash
yarn build
yarn build:preview
yarn start:production
yarn start:example
```

What they are for:

- `yarn build` - production build of the app
- `yarn build:preview` - build plus local preview server
- `yarn start:production` - build and serve the built app locally
- `yarn start:example` - build packages and run the browser example app

## Optional Docker Setup

The repo also contains `Dockerfile` and `docker-compose.yml`.

Compose configuration:

- builds from the repository root
- serves the app on `http://localhost:3000`
- mounts the repo into the container
- uses container name `excalidraw`

Run it with:

```bash
docker compose up --build
```

Use Docker only if you specifically want a containerized local environment.
For normal feature work, the Node/Yarn flow is simpler and closer to the edit-refresh loop used by the repo scripts.

## Where To Work

In most cases, feature work falls into one of these areas:

- `excalidraw-app/` for app shell, collaboration, sharing, persistence, integrations
- `packages/excalidraw/` for the reusable editor React package
- `packages/element/` for element model, scene logic, mutation logic
- `packages/common/` and `packages/math/` for shared primitives and helpers
- `examples/` for integration examples

The Vite config aliases internal package imports to local source files, not built artifacts.
That means app development usually reflects package changes immediately without publishing or separately linking packages.

## Code Style And Repository Conventions

Formatting and editor conventions are defined in source:

- `.editorconfig` enforces UTF-8, LF, 2 spaces, final newline, trimmed trailing whitespace
- ESLint validates `.js`, `.ts`, `.tsx`
- Prettier formats `css`, `scss`, `json`, `md`, `html`, `yml`

Useful commands:

```bash
yarn fix
yarn fix:code
yarn fix:other
```

Current Husky state:

- `yarn install` installs Husky hooks
- `.husky/pre-commit` currently contains only a commented line
- `lint-staged` is configured in `.lintstagedrc.js`, but the pre-commit hook does not currently invoke it

Practical takeaway:

- do not rely on pre-commit hooks to catch issues
- run checks manually before pushing

## Local Validation Before PR

The repository exposes four main quality gates:

```bash
yarn test:app
yarn test:code
yarn test:typecheck
yarn test:other
```

Recommended preflight for a normal change:

```bash
yarn test:all
```

What it runs:

1. TypeScript typecheck
2. ESLint
3. Prettier verification
4. Vitest app test suite without watch mode

Additional useful commands:

```bash
yarn test:coverage
yarn test:update
```

Use them when:

- `yarn test:coverage` - you need coverage locally
- `yarn test:update` - snapshots intentionally changed

## What CI Checks In Pull Requests

Current GitHub workflows enforce these checks:

### On `pull_request`

- `lint.yml` runs:
  - `yarn install`
  - `yarn test:other`
  - `yarn test:code`
  - `yarn test:typecheck`
- `semantic-pr-title.yml` validates that the PR title is semantic

### On push to `master`

- `test.yml` runs:
  - `yarn install`
  - `yarn test:app`

Practical takeaway:

- before opening a PR, you should at least pass formatting, lint, and typecheck locally
- before merging, you should also be confident in `yarn test:app`
- write the PR title in a semantic/conventional style, for example `fix: correct selection bounds`

## First Change Workflow

Recommended end-to-end flow:

```bash
git checkout -b feat/my-change
yarn start
```

Then:

1. make the code change
2. verify the behavior in the browser
3. run the relevant local checks
4. commit with a clear message
5. push the branch
6. open a pull request

Suggested local command sequence before push:

```bash
yarn test:code
yarn test:typecheck
yarn test:other
yarn test:app --watch=false
```

Or just:

```bash
yarn test:all
```

## Open The First PR

When your branch is ready:

```bash
git status
git add <files>
git commit -m "feat: describe your change"
git push -u origin feat/my-change
```

Then open a PR against the repository default integration branch.
In the current repository, the main protected branch used by workflows is `master`.

Use the PR template in `.github/PULL_REQUEST_TEMPLATE.md`.
For this workshop repository, the template contains a Day 1 checklist and explicitly lists `docs/technical/dev-setup.md` as a bonus artifact.

## Troubleshooting

### Wrong port

If you expect port `3000` but the app starts on `3001`, that is normal.
The tracked development env file sets `VITE_APP_PORT=3001`.

### Optional services are missing

If collaboration or AI-related functionality expects local backends, check these env values:

- `VITE_APP_WS_SERVER_URL`
- `VITE_APP_AI_BACKEND`

The UI can start without this repo launching those services for you.

### Install issues after dependency churn

Use:

```bash
yarn clean-install
```

### Formatting differs between editors

Make sure your editor respects `.editorconfig` and uses LF line endings.

## Verified From Source

- `package.json`
- `excalidraw-app/package.json`
- `excalidraw-app/vite.config.mts`
- `.env.development`
- `.env.production`
- `.gitignore`
- `.editorconfig`
- `.npmrc`
- `.husky/pre-commit`
- `.lintstagedrc.js`
- `.github/workflows/lint.yml`
- `.github/workflows/test.yml`
- `.github/workflows/semantic-pr-title.yml`
- `.github/PULL_REQUEST_TEMPLATE.md`
- `Dockerfile`
- `docker-compose.yml`
