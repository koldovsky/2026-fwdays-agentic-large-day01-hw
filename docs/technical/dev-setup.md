# Developer Setup

## Purpose

This guide describes a practical setup flow for a new developer joining the team and working in this repository.
It covers:

- cloning the repository
- installing the toolchain
- running the app locally
- running validation commands
- preparing a branch
- opening a pull request on GitHub

All commands and requirements below are based on files checked into this repository.

## Repository Overview

This is a Yarn workspaces monorepo defined in the root `package.json`.
The workspace groups are:

- `excalidraw-app`
- `packages/*`
- `examples/*`

The main local development entrypoint is the standalone app in `excalidraw-app`.
The root `start` script delegates to that workspace.

## Prerequisites

## Required versions

From the root `package.json`:

- Node.js: `>=18.0.0`
- package manager: `yarn@1.22.22`

From GitHub Actions workflows:

- CI runs on Node `20.x`

For team consistency, using Node 20 locally is the safest choice because:

- it satisfies the repo engine requirement
- it matches the CI workflows in `.github/workflows/lint.yml` and `.github/workflows/test.yml`

## Required tools

Install these before starting:

- Git
- Node.js
- Yarn Classic `1.22.22`

Optional but useful:

- GitHub account with access to the repository or your fork
- GitHub CLI (`gh`) if you prefer creating PRs from the terminal

## Clone The Repository

## Option 1: Direct clone

If you have write access to the main repository:

```bash
git clone <repo-url>
cd 2026-fwdays-agentic-large-day01-hw
```

## Option 2: Fork workflow

If your team uses forks:

1. Fork the repository on GitHub.
2. Clone your fork:

```bash
git clone <your-fork-url>
cd 2026-fwdays-agentic-large-day01-hw
```

3. Add the main repository as `upstream`:

```bash
git remote add upstream <main-repo-url>
```

You can verify remotes with:

```bash
git remote -v
```

## Install Dependencies

Run installation from the repository root:

```bash
yarn install
```

The root `prepare` script runs `husky install`, so Git hooks are expected to be set up during install.

If you need to reset dependencies completely, the root `package.json` includes:

```bash
yarn clean-install
```

That script removes `node_modules` and reinstalls everything.

## Environment Files

The repository contains:

- `.env.development`
- `.env.production`

The app Vite config in `excalidraw-app/vite.config.mts` loads environment variables from the repository root via `envDir: "../"`.

Use the checked-in environment files as the starting point.
If your team uses local overrides, follow team convention before editing them.

## Start The App Locally

From the repository root, start the main app with:

```bash
yarn start
```

This runs the root script:

- `yarn --cwd ./excalidraw-app start`

Inside `excalidraw-app/package.json`, that resolves to:

- `yarn && vite`

By default, the Vite dev server port comes from `VITE_APP_PORT` or falls back to `3000`.

## Other Useful Local Commands

Build the main app:

```bash
yarn build
```

Build only the internal packages:

```bash
yarn build:packages
```

Run the browser example after building packages:

```bash
yarn start:example
```

Run production preview:

```bash
yarn build:preview
```

## Recommended First-Day Validation

After install, run these commands from the root:

```bash
yarn test:typecheck
yarn test:code
yarn test:other
yarn test:app --watch=false
```

Or run the combined check:

```bash
yarn test:all
```

These commands are defined in the root `package.json`.

## What The Validation Commands Do

- `yarn test:typecheck`
  Runs `tsc`

- `yarn test:code`
  Runs ESLint on `.js`, `.ts`, and `.tsx`

- `yarn test:other`
  Runs Prettier in `--list-different` mode

- `yarn test:app`
  Runs Vitest

- `yarn test:all`
  Runs typecheck, lint, formatting, and tests in sequence

## Formatting And Git Hooks

The repository uses:

- Husky
- lint-staged
- ESLint
- Prettier

From `.lintstagedrc.js`:

- `*.{js,ts,tsx}` files are auto-fixed with ESLint
- `*.{css,scss,json,md,html,yml}` files are formatted with Prettier

That means a normal `git commit` may trigger formatting and lint fixes on staged files.

Helpful fix commands from the root:

```bash
yarn fix
```

Or run them separately:

```bash
yarn fix:code
yarn fix:other
```

## Create Your Working Branch

Start from the latest default branch state.
If you cloned the main repository directly:

```bash
git checkout master
git pull
git checkout -b <your-branch-name>
```

If you are using a fork:

```bash
git checkout master
git fetch upstream
git merge upstream/master
git checkout -b <your-branch-name>
```

Choose a branch name that matches your team convention.
If your team has no convention, use a short descriptive branch such as:

- `docs/dev-setup`
- `fix/collab-sync`
- `feat/library-import`

## Make And Verify Your Changes

After making changes:

1. Run focused checks first if you know the impacted area.
2. Run the full repo checks before opening a PR.

Suggested final local verification:

```bash
yarn test:all
```

If your change touches package integration behavior, also verify the app starts:

```bash
yarn start
```

## Commit Your Changes

Stage your work:

```bash
git add .
```

Create a commit:

```bash
git commit -m "docs: add developer setup guide"
```

Because Husky and lint-staged are configured, expect commit-time checks and auto-formatting on staged files.
If hooks modify files, review them and commit again if needed.

## Push Your Branch

If you cloned the main repository and have push access:

```bash
git push -u origin <your-branch-name>
```

If you are using a fork:

```bash
git push -u origin <your-branch-name>
```

In a fork flow, `origin` is your fork and `upstream` is the main repository.

## Open Your First Pull Request

## PR target branch

The repository snapshot shows the default active branch as `master`.
Open your pull request against `master` unless your team instructs otherwise.

## PR title requirements

The workflow `.github/workflows/semantic-pr-title.yml` enforces semantic PR titles.
Use a semantic title format such as:

- `docs: add developer setup guide`
- `fix: correct scene restore edge case`
- `feat: add new library import flow`

## PR content

The repository has a PR template in `.github/PULL_REQUEST_TEMPLATE.md`.
At minimum, expect to fill in:

- participant name
- checklist items
- notes

The current template is workshop-oriented and includes doc checklist items such as:

- `docs/memory/projectbrief.md`
- `docs/memory/techContext.md`
- `docs/memory/systemPatterns.md`
- `docs/technical/architecture.md`
- `docs/product/domain-glossary.md`
- `docs/technical/dev-setup.md`

## Open PR on GitHub Web

After pushing the branch:

1. Open the repository on GitHub.
2. GitHub usually shows a "Compare & pull request" prompt for the pushed branch.
3. Set the base branch to `master`.
4. Use a semantic PR title.
5. Fill in the PR template.
6. Submit the pull request.

## Open PR with GitHub CLI

If your team uses `gh`, the workflow is:

```bash
gh pr create --base master --fill
```

If `--fill` is not enough, provide the title manually:

```bash
gh pr create --base master --title "docs: add developer setup guide"
```

## What CI Will Check

From `.github/workflows/lint.yml`, pull requests run:

- `yarn install`
- `yarn test:other`
- `yarn test:code`
- `yarn test:typecheck`

From `.github/workflows/test.yml`, pushes to `master` run:

- `yarn install`
- `yarn test:app`

Before opening a PR, your local checks should match those as closely as possible.

## Recommended Team Workflow Summary

For a normal change, this is the shortest safe path:

```bash
git clone <repo-url>
cd 2026-fwdays-agentic-large-day01-hw
yarn install
yarn start
git checkout -b <your-branch-name>
# make changes
yarn test:all
git add .
git commit -m "type: short description"
git push -u origin <your-branch-name>
```

Then open a pull request to `master` with a semantic title.

## Troubleshooting

## Wrong Node version

Symptoms:

- install errors
- inconsistent behavior with CI

Fix:

- switch to Node 20 if possible
- rerun `yarn install`

## Broken dependency tree

Fix:

```bash
yarn clean-install
```

## App does not start

Check:

- you ran commands from the repository root
- dependencies are installed
- the Vite dev server is not blocked by a port conflict
- root environment files are present

## Pre-commit hook changes files

This is expected because `lint-staged` runs ESLint and Prettier on staged files.
Review the modifications, stage them again, and recommit if necessary.

## Final Checklist Before PR

- `yarn install` completed successfully
- `yarn start` runs locally
- `yarn test:all` passes
- your branch is pushed to GitHub
- the PR title is semantic
- the PR template is filled in
