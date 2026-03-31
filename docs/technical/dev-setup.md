# Developer Setup - From Clone to First PR

This guide describes the practical local workflow for this repository, from first clone to opening a pull request.

Scope note:

- This document was prepared from repository files that are not excluded by `.cursorignore`.
- Generated artifacts, local IDE settings, caches, lockfile copies excluded by `.cursorignore`, and compressed repo dump files were intentionally ignored.

## What This Repository Is

This workspace is a Yarn 1 monorepo with three main areas:

- `excalidraw-app` - the main Vite-based web application.
- `packages/*` - internal packages such as `common`, `element`, `math`, `excalidraw`, and `utils`.
- `examples/*` - example integrations, including browser-script and Next.js setups.

Root-level scripts orchestrate most day-to-day work and delegate into `excalidraw-app` or package workspaces where needed.

## Prerequisites

Use these versions unless you have a good reason not to:

- Git
- Node.js 20 LTS recommended
- Node.js 18+ minimum supported by the repo
- Yarn 1.22.22 (`packageManager` in the root manifest)
- Docker Desktop optional, only if you want the containerized workflow

Recommended version setup on macOS:

```bash
brew install nvm
mkdir -p ~/.nvm
export NVM_DIR="$HOME/.nvm"
. "$(brew --prefix nvm)/nvm.sh"
nvm install 20
nvm use 20
corepack enable
corepack prepare yarn@1.22.22 --activate
```

If you already manage Node another way, the important part is ending up on a compatible Node version with Yarn Classic 1.22.22.

Verify your toolchain:

```bash
node -v
yarn -v
git --version
```

## Clone And Install

Clone the repository and install dependencies at the workspace root:

```bash
git clone <your-fork-or-origin-url>
cd 2026-fwdays-agentic-large-day01-hw
yarn install
```

Useful recovery command if dependencies become inconsistent:

```bash
yarn clean-install
```

What that does:

- removes all workspace `node_modules`
- reinstalls the monorepo from scratch

## First Local Run

Start the main app from the repository root:

```bash
yarn start
```

What happens under the hood:

- the root script delegates to `excalidraw-app`
- `excalidraw-app/start` runs `yarn && vite`
- Vite serves the app using the development environment from the repo root

Default local URL:

```text
http://localhost:3001
```

The port comes from the committed `.env.development` file via `VITE_APP_PORT=3001`.

## Environment Model

The app loads environment variables from the repository root, not from inside `excalidraw-app`.

Committed defaults:

- `.env.development`
- `.env.production`

That means a basic local boot should work without creating any extra env file.

### Local Overrides

Use one of these for machine-specific changes:

- `.env.local`
- `.env.development.local`
- `.env.production.local`

Those files are ignored by `.cursorignore` and are the right place for local-only overrides.

### Important Development Variables

The most relevant variables for local work are:

- `VITE_APP_PORT` - dev server port, default `3001`
- `VITE_APP_ENABLE_ESLINT` - enables eslint overlay/checker in dev, default `true`
- `VITE_APP_ENABLE_PWA` - enables PWA behavior in dev, default `false`
- `VITE_APP_DEV_DISABLE_LIVE_RELOAD` - useful when debugging service workers
- `VITE_APP_DISABLE_PREVENT_UNLOAD` - disables unload protection dialogs

### Optional Services And Feature Flags

The committed development env points some features at local companion services:

- `VITE_APP_WS_SERVER_URL=http://localhost:3002`
- `VITE_APP_AI_BACKEND=http://localhost:3016`

Those services are not provisioned by this repository. The result is:

- the core editor app can still run locally
- collaboration features may not work unless you run a compatible collab server
- AI-related flows may not work unless you run a compatible AI backend

If your task does not touch those areas, you can usually ignore them.

## Repository Layout For Daily Work

Use this mental model when navigating the monorepo:

- `excalidraw-app` - product shell, app-level UI, persistence, export/share, collaboration wiring
- `packages/excalidraw` - reusable editor package and most editor runtime logic
- `packages/element` - scene and element model logic
- `packages/math` - geometry and numeric helpers
- `packages/common` - shared constants and utility functions
- `packages/utils` - additional helper exports
- `examples/with-script-in-browser` - script-tag/browser integration example
- `examples/with-nextjs` - Next.js integration example
- `scripts` - build, release, docs, and packaging utilities
- `firebase-project` - Firebase config and rules, not the whole backend runtime

TypeScript path aliases are configured in the root `tsconfig.json`, so imports such as `@excalidraw/math` resolve to workspace source rather than published packages.

## Core Commands

Run all of these from the repository root unless noted otherwise.

### Development

```bash
yarn start
yarn build
yarn build:preview
yarn build:packages
```

What they are for:

- `yarn start` - runs the main app in development mode
- `yarn build` - builds the production app bundle
- `yarn build:preview` - builds and serves a preview build
- `yarn build:packages` - rebuilds the internal packages if your work touches package outputs or examples

### Testing And Quality

```bash
yarn test:app
yarn test:app --watch=false
yarn test:all
yarn test:typecheck
yarn test:code
yarn test:other
yarn test:coverage
yarn fix
```

What they cover:

- `yarn test:app` - Vitest test runner
- `yarn test:app --watch=false` - non-watch test run, better for CI parity
- `yarn test:all` - typecheck + eslint + prettier check + tests
- `yarn test:typecheck` - root TypeScript check
- `yarn test:code` - ESLint on `.js`, `.ts`, `.tsx`
- `yarn test:other` - Prettier consistency check for markup/config/docs file types
- `yarn test:coverage` - Vitest with coverage reports
- `yarn fix` - runs formatting and lint autofixes where possible

### Examples

```bash
yarn start:example
```

This builds the internal packages and starts the browser-script example.

For the Next.js example, use its own workspace when needed:

```bash
cd examples/with-nextjs
yarn install
yarn dev
```

## Local Git Hooks

The repository installs Husky on `yarn install` through the root `prepare` script.

Current local hook setup:

- `.husky/pre-commit` exists
- lint-staged is configured in `.lintstagedrc.js`

What happens on staged files:

- staged `*.js`, `*.ts`, `*.tsx` files are passed through ESLint with `--fix`
- staged `*.css`, `*.scss`, `*.json`, `*.md`, `*.html`, `*.yml` files are formatted with Prettier

Practical implication: stage only files you actually want auto-fixed before commit.

## Container Workflow

Use Docker only if you specifically want to validate the containerized app path.

Build and run with Compose:

```bash
docker compose up --build
```

What this does:

- builds with Node 18 in a container
- runs `yarn build:app:docker`
- serves the built app from Nginx
- exposes the app on port `3000`

Local Docker URL:

```text
http://localhost:3000
```

This is a production-style served build, not the normal Vite development experience.

## How To Work On Changes

For most tasks, use this loop:

1. Create a branch.
2. Start the dev app with `yarn start`.
3. Make a focused change in the relevant workspace.
4. Run the smallest validating command that matches the change.
5. Run broader checks before opening the PR.

Suggested branch setup:

```bash
git checkout master
git pull --ff-only
git checkout -b docs/dev-setup
```

If your change affects:

- docs only: run `yarn test:other`
- lint-sensitive TypeScript or JavaScript: run `yarn test:code`
- types or imports across packages: run `yarn test:typecheck`
- runtime behavior or tests: run `yarn test:app --watch=false`
- anything non-trivial: run `yarn test:all`

## CI Expectations Before A PR

Repository workflows show these checks matter for contributions:

- lint workflow on pull requests runs `yarn test:other`, `yarn test:code`, and `yarn test:typecheck`
- test workflow runs `yarn test:app`
- semantic PR title workflow validates the pull request title format

For practical CI parity, this is a solid pre-PR command set:

```bash
yarn test:other
yarn test:code
yarn test:typecheck
yarn test:app --watch=false
```

If you want the one-command version:

```bash
yarn test:all
```

## Commit And PR Workflow

Stage and commit your changes normally:

```bash
git status
git add <files>
git commit -m "docs: add developer setup guide"
```

Use a semantic PR title because the repo has a dedicated workflow for it. Good examples:

- `docs: add developer setup guide`
- `fix: correct selection behavior in mobile transform flow`
- `refactor: simplify scene bootstrap logic`

When opening the PR:

1. Push your branch to your fork or remote.
2. Open a pull request against the target branch.
3. Fill out the checklist in `.github/PULL_REQUEST_TEMPLATE.md`.
4. Make sure the PR title stays semantic after edits.

## Suggested First-Day Workflow

If you are new to this repository, this sequence is enough to become productive quickly:

```bash
yarn install
yarn start
yarn test:app --watch=false
yarn test:code
yarn test:typecheck
```

Then:

- open `excalidraw-app` for app-shell changes
- open `packages/excalidraw` for core editor behavior
- inspect `docs/technical/architecture.md` before touching cross-package flows

## Troubleshooting

### `yarn start` fails after switching branches

Run:

```bash
yarn clean-install
```

### The app starts but collaboration or AI features fail

That is expected unless you also run the external services referenced by the local env file. For most UI or editor-core changes, those failures are not blockers.

### The dev server opens on the wrong port

Check your root env overrides:

- `.env.local`
- `.env.development.local`

`excalidraw-app/vite.config.mts` loads env from the repository root and uses `VITE_APP_PORT`.

### Pre-commit changed files unexpectedly

That is likely lint-staged applying ESLint or Prettier fixes to staged files. Review the diff, restage, and recommit.

## Minimal Pre-PR Checklist

- dependencies installed from the root with Yarn 1
- app runs locally with `yarn start`
- relevant checks pass locally
- only intended files are staged
- commit message is semantic
- PR title is semantic
- PR template checklist is updated

This should be enough to get from a clean clone to a reviewable first pull request with minimal surprises.
