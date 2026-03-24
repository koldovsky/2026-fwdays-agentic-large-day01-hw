# Developer Setup Guide

Complete onboarding guide for new team members — from cloning the repo to opening your first PR.

## Prerequisites

| Tool | Version | Check |
|------|---------|-------|
| Node.js | >= 18.0.0 (recommended: 20.x) | `node -v` |
| Yarn | 1.22.x (Classic) | `yarn -v` |
| Git | any recent version | `git -v` |

> **Note:** This project uses **Yarn Classic** (v1), not Yarn Berry. Do not run `yarn set version` or add a `.yarnrc.yml`.

## Step 1: Clone and Install

```bash
git clone <repo-url>
cd 2026-fwdays-agentic-large-day01-hw

# Install all dependencies (root + all workspaces)
yarn
```

This installs dependencies for the entire monorepo via Yarn workspaces: the root, `excalidraw-app/`, all `packages/*`, and `examples/*`.

## Step 2: Environment Configuration

The project ships with two env files:
- `.env.development` — dev defaults (local ports, dev Firebase project, debug flags)
- `.env.production` — production settings

For local overrides, create `.env.development.local` (git-ignored):

```bash
cp .env.development .env.development.local
```

Key variables you may want to customize:

| Variable | Default | Purpose |
|----------|---------|---------|
| `VITE_APP_PORT` | `3001` | Dev server port |
| `VITE_APP_WS_SERVER_URL` | `http://localhost:3002` | Collaboration WebSocket server |
| `VITE_APP_ENABLE_ESLINT` | `true` | ESLint overlay in dev server |
| `VITE_APP_DEV_DISABLE_LIVE_RELOAD` | (empty) | Set to `true` when debugging Service Workers |
| `VITE_APP_DISABLE_PREVENT_UNLOAD` | (empty) | Set to `true` to disable the "unsaved changes" dialog |

## Step 3: Run the Dev Server

```bash
yarn start
```

This launches the Vite dev server for `excalidraw-app/` at `http://localhost:3001`. Hot Module Replacement (HMR) is enabled by default.

## Step 4: Verify the Setup

Open `http://localhost:3001` in a browser. You should see the Excalidraw canvas. Try drawing a shape to confirm everything works.

Run the full validation suite to ensure your environment is healthy:

```bash
# Quick check — run tests once
yarn test:app --watch=false

# Full check — typecheck + lint + prettier + tests
yarn test:all
```

## Monorepo Layout

```
excalidraw-app/          # Hosted web app (entry point for `yarn start`)
packages/
  common/                # @excalidraw/common — shared utils, constants
  math/                  # @excalidraw/math — geometry, vectors, curves
  element/               # @excalidraw/element — element types, Scene, Store
  excalidraw/            # @excalidraw/excalidraw — React component, UI, actions
  utils/                 # @excalidraw/utils — public utility helpers
examples/                # Integration examples
docs/                    # Documentation (memory bank, technical docs)
```

Package build order: `common → math → element → excalidraw`. Path aliases (`@excalidraw/*`) resolve to source during dev and testing, so you rarely need to build packages manually during development.

## Day-to-Day Development Commands

```bash
# Dev server
yarn start                              # Start excalidraw-app dev server

# Testing
yarn test:app                           # Vitest in watch mode
yarn test:app --watch=false             # Single run
vitest run packages/excalidraw/tests/myFile.test.tsx  # Single test file

# Linting & formatting
yarn test:code                          # ESLint check (zero warnings allowed)
yarn test:other                         # Prettier check
yarn test:typecheck                     # TypeScript type check
yarn fix                                # Auto-fix prettier + eslint
yarn fix:code                           # ESLint --fix only

# Building
yarn build                              # Full app build
yarn build:packages                     # Build all packages (for npm publishing)
```

## Code Conventions (Quick Reference)

- **TypeScript** for all new code, strict mode enabled
- **Separate type imports:** `import type { Foo } from "..."`
- **Jotai:** import from `"editor-jotai"` or `"app-jotai"`, never from `"jotai"` directly
- **No barrel imports** inside `packages/excalidraw/` — use direct relative paths
- **Import order** (enforced by ESLint): builtins → external → `@excalidraw/**` → internal → parent → sibling
- **Naming:** PascalCase for components/types, camelCase for variables/functions, ALL_CAPS for constants
- **Point type:** use `Point` from `@excalidraw/math`, not `{ x, y }`
- **Immutability:** prefer `const`, `readonly`, `?.`, `??`

See `CLAUDE.md` at the repo root for the full conventions reference.

## Pre-commit Hooks

The project uses **Husky + lint-staged**. On every commit:
- `*.{js,ts,tsx}` files are auto-fixed with ESLint (`--max-warnings=0`)
- `*.{css,scss,json,md,html,yml}` files are auto-formatted with Prettier

If a commit fails due to lint errors, fix them and re-commit. Run `yarn fix` to auto-fix most issues.

## CI Pipeline

Pull requests trigger these GitHub Actions checks:

| Workflow | Trigger | What it checks |
|----------|---------|----------------|
| **Lint** | PR | Prettier (`test:other`) + ESLint (`test:code`) + TypeScript (`test:typecheck`) |
| **Semantic PR title** | PR open/edit | PR title follows [Conventional Commits](https://www.conventionalcommits.org/) format |
| **Tests** | Push to `master` | Full test suite (`test:app`) |

### PR Title Format

PR titles must follow semantic format (enforced by CI):

```
<type>: <description>

# Examples:
feat: add laser pointer tool
fix: correct text wrapping in containers
refactor: extract binding logic to separate module
docs: update architecture diagram
chore: upgrade Vite to 5.1
```

Common types: `feat`, `fix`, `refactor`, `docs`, `chore`, `test`, `perf`, `style`, `ci`, `build`.

## Creating Your First PR

### 1. Create a feature branch

```bash
git checkout master
git pull origin master
git checkout -b <your-name>/<short-description>
# Example: git checkout -b jdoe/fix-text-wrapping
```

### 2. Make your changes

Edit code, add tests where appropriate.

### 3. Validate locally

```bash
# Run all checks that CI will run
yarn test:typecheck      # Types
yarn test:code           # Lint
yarn test:other          # Formatting
yarn test:app --watch=false  # Tests

# Or run everything at once:
yarn test:all
```

### 4. Commit and push

```bash
git add .
git commit -m "fix: describe your change"
git push -u origin <your-branch-name>
```

Pre-commit hooks will auto-fix lint and formatting. If they modify files, you'll need to `git add` and commit again.

### 5. Open the PR

- Open a PR against `master`
- Use a semantic PR title (e.g., `fix: correct text wrapping in containers`)
- Describe what you changed and why
- Wait for CI checks to pass, then request a review

## Troubleshooting

### `yarn install` fails
```bash
yarn rm:node_modules    # Remove all node_modules
yarn                    # Fresh install
```

### Tests fail with missing modules
Ensure path aliases are working — they're configured in `tsconfig.json` and `vitest.config.mts`. Try:
```bash
yarn rm:build           # Remove build artifacts
yarn                    # Reinstall
```

### ESLint errors on commit
```bash
yarn fix                # Auto-fix all lint + format issues
```

### Port 3001 already in use
Set a different port in `.env.development.local`:
```
VITE_APP_PORT=3005
```

## Further Reading

- [Architecture](./architecture.md) — system design, data flow, rendering pipeline
- [Memory Bank](../memory/) — project context, decisions, current state
- `CLAUDE.md` (repo root) — coding conventions and AI assistant guidance