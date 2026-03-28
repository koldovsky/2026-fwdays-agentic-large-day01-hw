# Developer setup and first pull request

This guide takes you from a fresh clone to a pull request against the upstream Excalidraw repository. It assumes you contribute via a **GitHub fork** and open PRs into **`excalidraw/excalidraw`** on the default branch (**`master`**, as used by this repo’s CI). If upstream renames the default branch, use that name instead.

For system design and package layout, see [architecture.md](./architecture.md). For domain terminology, see [domain-glossary.md](../product/domain-glossary.md).

To tune the repo for **AI-assisted editing** (Cursor, Claude Code, OpenAI Codex) and **Repomix** bundles, see [Agentic development](#agentic-development-repomix-cursor-claude-code-codex) under [Useful extras](#7-useful-extras).

---

## 1. Before you start

### Required tooling

| Tool | Notes |
|------|--------|
| **Git** | Any recent version. [Connecting to GitHub with SSH](https://docs.github.com/en/authentication/connecting-to-github-with-ssh) is optional but convenient. |
| **Node.js** | **>= 18.0.0** (`engines` in root `package.json`). **Node 20.x** is recommended so your environment matches [`.github/workflows/lint.yml`](../../.github/workflows/lint.yml) and [`test-coverage-pr.yml`](../../.github/workflows/test-coverage-pr.yml). |
| **Yarn (classic 1.x)** | The repo pins **`yarn@1.22.22`** via `packageManager` in root `package.json`. Do **not** use Yarn Berry (2+) for this monorepo unless the project explicitly migrates. |

#### Installing Yarn 1.22.22 with Corepack (Node 16.10+)

Corepack ships with Node and can install the pinned Yarn version:

```bash
corepack enable
corepack prepare yarn@1.22.22 --activate
yarn --version   # should print 1.22.22
```

On **Windows** (PowerShell), run the same commands from the repository root or any directory; ensure Node was installed for your user or system PATH.

---

## 2. Fork, clone, and remotes

1. **Fork** [excalidraw/excalidraw](https://github.com/excalidraw/excalidraw) on GitHub (your own copy under your account).

2. **Clone your fork** (replace `YOUR_USER`):

   ```bash
   git clone git@github.com:YOUR_USER/excalidraw.git
   cd excalidraw
   ```

   HTTPS works as well: `https://github.com/YOUR_USER/excalidraw.git`.

3. **Add `upstream`** (the canonical repository):

   ```bash
   git remote add upstream https://github.com/excalidraw/excalidraw.git
   # or: git@github.com:excalidraw/excalidraw.git
   ```

4. **Stay up to date** before you create a branch:

   ```bash
   git fetch upstream
   git checkout master
   git merge upstream/master
   ```

   You may prefer `git rebase upstream/master` if your team uses a rebase workflow; either way, minimize drift from `master` before opening a PR.

---

## 3. Install dependencies

From the **repository root**:

```bash
yarn install
```

This installs all [Yarn workspaces](https://classic.yarnpkg.com/en/docs/workspaces/): `excalidraw-app/`, `packages/*`, and `examples/*` (see root `package.json`).

### Husky and pre-commit

`yarn install` runs the `prepare` script (`husky install`), which wires local Git hooks.

The checked-in [`.husky/pre-commit`](../../.husky/pre-commit) file only contains a **commented** `# yarn lint-staged` line, so **lint-staged does not run on commit** in the default setup. Rely on the commands in [Quality gate before a PR](#6-quality-gate-before-a-pr-match-ci) before you push.

---

## 4. Environment variables

The Vite app sets `envDir` to the **repository root** (`excalidraw-app/vite.config.mts`), so `.env*` files next to the root `package.json` are loaded for the dev server and builds.

- **Typical local dev:** the committed [`.env.development`](../../.env.development) is enough to run the app against shared dev endpoints.
- **Local overrides:** use `.env.local` or `.env.development.local` for machine-specific values. Those filenames are **gitignored** (see root `.gitignore`); do not commit secrets.

**Collaboration:** `.env.development` sets `VITE_APP_WS_SERVER_URL` to `http://localhost:3002`. To exercise live collaboration locally you need a compatible WebSocket server (for example [excalidraw/excalidraw-room](https://github.com/excalidraw/excalidraw-room)) running on that port, or change the URL in a local env file.

---

## 5. Run the app

From the repository root:

```bash
yarn start
```

This runs `yarn --cwd ./excalidraw-app start` (Vite dev server). The listen port comes from `VITE_APP_PORT` in `.env.development` if set (currently **3001** in that file); otherwise Vite falls back to **3000** (`excalidraw-app/vite.config.mts`).

### Optional commands

| Command | Purpose |
|---------|---------|
| `yarn build:preview` | Production build of the app, then `vite preview` (default preview port **5000** per script chain in `excalidraw-app`). |
| `yarn start:example` | Builds packages, then starts `examples/with-script-in-browser`. |
| `yarn start:production` | Build and serve static output (app serves on **5001** per `excalidraw-app/package.json`). |

---

## 6. Quality gate before a PR (match CI)

Run these from the **repository root** after `yarn install`.

### Full local sweep (recommended)

```bash
yarn test:all
```

This runs, in order: `yarn test:typecheck`, `yarn test:code`, `yarn test:other`, and `yarn test:app --watch=false` (Vitest without watch mode).

### What GitHub Actions runs on pull requests

- **Lint** ([`.github/workflows/lint.yml`](../../.github/workflows/lint.yml)): `yarn test:other` (Prettier check), `yarn test:code` (ESLint), `yarn test:typecheck` (`tsc`).
- **Test coverage** ([`.github/workflows/test-coverage-pr.yml`](../../.github/workflows/test-coverage-pr.yml)): `yarn test:coverage` (Vitest with coverage; a report is posted on the PR).
- **Semantic PR title** ([`.github/workflows/semantic-pr-title.yml`](../../.github/workflows/semantic-pr-title.yml)): validates the **PR title** format (see [First pull request](#8-first-pull-request)).
- **Bundle size** ([`.github/workflows/size-limit.yml`](../../.github/workflows/size-limit.yml)): runs on PRs targeting `master`.

Pushes to `master` also run **tests** without coverage ([`.github/workflows/test.yml`](../../.github/workflows/test.yml): `yarn test:app`).

### Auto-fix formatting and lint

```bash
yarn fix
```

Runs Prettier write on supported files, then ESLint with `--fix`. Re-run `yarn test:all` afterward to ensure everything still passes.

### Clean reinstall

If dependencies or installs look corrupted:

```bash
yarn clean-install
```

Removes root and workspace `node_modules`, then runs `yarn install`.

---

## 7. Useful extras

### Agentic development (Repomix, Cursor, Claude Code, Codex)

These files keep **agents and bundlers** focused on source that matters: less noise in context windows, faster indexing, and fewer accidental reads of generated assets or secrets.

#### Repomix

[Repomix](https://github.com/yamadashy/repomix) packs the repository into a **single file** (XML, Markdown, JSON, or plain text) for pasting into chats or external tools. It is already a root **devDependency** (`package.json`).

From the **repository root**, after `yarn install`:

```bash
npx repomix
```

By default this writes **`repomix-output.xml`** in the current directory. Useful options:

| Flag | Purpose |
|------|---------|
| `-o <file>` / `--output <file>` | Choose output path (use `-` for stdout). |
| `--style markdown` | Markdown instead of XML. |
| `--compress` | Tree-sitter–based structural compression (smaller output). |
| `--copy` | Copy the bundle to the clipboard after generation. |
| `--include <globs>` | Limit to specific paths (comma-separated globs). |
| `-i <globs>` / `--ignore <globs>` | Extra exclude patterns beyond ignore files. |

**Ignore rules:** Repomix respects **`.gitignore`** and **`.repomixignore`**. This repo ships [`.repomixignore`](../../.repomixignore) (build outputs, `node_modules`, lockfiles, env files, large/generated paths, and `repomix*.txt`). Keep it aligned with what you do **not** want in a bundle. To customize further, run `npx repomix --init` to create **`repomix.config.json`** (see `npx repomix --help`).

Treat generated bundles as **local artifacts**: add patterns such as `repomix-output.*` to **`.gitignore`** if you regenerate often and do not want to commit them.

#### `.cursorignore` (Cursor)

[Cursor](https://cursor.com) uses **`.cursorignore`** at the repo root (same spirit as `.gitignore`) so **indexing, search, and @-mentions** skip heavy or irrelevant trees. This repository includes [`.cursorignore`](../../.cursorignore) (for example `node_modules`, `build`/`dist`, logs, local env files, and `.claude`). **Do not delete it** without a reason; you may append paths for machine-specific caches if needed. Never store secrets in files that remain unignored.

#### `.claudeignore` (Claude Code)

[Claude Code](https://docs.anthropic.com/en/docs/claude-code) supports **`.claudeignore`** at the repository root with **gitignore-style** patterns so the tool skips bulky or sensitive paths. The repo does **not** commit a `.claudeignore` by default.

If you use Claude Code here, **create `.claudeignore`** and align it with [`.cursorignore`](../../.cursorignore) and [`.repomixignore`](../../.repomixignore) so all assistants skip the same directories (`node_modules`, build outputs, coverage, env files, etc.). A practical starting point:

```bash
# Unix/macOS — copy then edit if Claude Code should see slightly more or less than Cursor
cp .cursorignore .claudeignore
```

On **Windows** (PowerShell), from the repo root:

```powershell
Copy-Item .cursorignore .claudeignore
```

Commit `.claudeignore` only if your team agrees on a shared policy; otherwise keep it **local** and document any team-wide rules in this file or in team docs.

#### OpenAI Codex

[OpenAI Codex](https://developers.openai.com/codex) (CLI, IDE extension, or app) does not use the same single ignore file as Cursor, but you can get equivalent control with the layers below. Official docs emphasize **`AGENTS.md`** and **`.codex/`** configuration rather than a long ignore list alone.

| Mechanism | Role |
|-----------|------|
| **`AGENTS.md`** | Repo-root (or nested) instructions: build/test commands (`yarn test:all`, `yarn start`), conventions, and **where to focus** in this monorepo. Primary lever for steering Codex. See [Custom instructions with AGENTS.md](https://developers.openai.com/codex/guides/agents-md). Use Codex **`/init`** in the project if you want a generated scaffold to edit. |
| **`.codex/config.toml`** | Optional **project-scoped** settings (only loaded when the project is [trusted](https://developers.openai.com/codex/config-basic)); personal defaults live in **`~/.codex/config.toml`**. See [Config basics](https://developers.openai.com/codex/config-basic) and the [configuration reference](https://developers.openai.com/codex/config-reference). |
| **`.gitignore`** | Git-ignored paths are excluded from some Codex flows (for example Handoff). Keep secrets and build artifacts gitignored as usual. |
| **`.codexignore`** | The Codex CLI ecosystem has been moving toward a **repo-root** **`.codexignore`** file with **gitignore-style** patterns (exclude `node_modules`, build outputs, env files, etc.). Behavior can vary by **CLI version**—confirm with `codex --help`, your release notes, or the [Codex changelog](https://developers.openai.com/codex/changelog). When your build supports it, align patterns with [`.cursorignore`](../../.cursorignore) / [`.repomixignore`](../../.repomixignore) (same idea as bootstrapping `.claudeignore` from `.cursorignore`). |

**Practical setup for this repo:** add or extend **`AGENTS.md`** with `yarn test:all`, `yarn start`, and links to [architecture.md](./architecture.md). Optionally add **`.codexignore`** (copy from `.cursorignore` on Unix/macOS or `Copy-Item .cursorignore .codexignore` in PowerShell) if your Codex version honors it.

#### Other assistants

Other AI coding tools may expose **ignore files**, **include globs**, or **project instructions** in their own formats. Follow each product’s documentation and apply the **same principles**: exclude generated trees, dependencies, secrets, and huge binaries from automated context.

### Docker

The repo includes a multi-stage `Dockerfile` and [`docker-compose.yml`](../../docker-compose.yml) (build context: repo root; host port **3000** mapped to container **80** in compose). Use these when you want a containerized static build rather than a local Node workflow.

### Documentation links

- [architecture.md](./architecture.md) — monorepo layout, packages, and data flow.
- [domain-glossary.md](../product/domain-glossary.md) — project vocabulary.

---

## 8. First pull request

### Branch and push

Create a branch from an updated `master`:

```bash
git checkout -b feat/short-description
# or: fix/..., docs/..., chore/...
```

Commit your changes, then push to **your fork**:

```bash
git push -u origin feat/short-description
```

### Open the PR on GitHub

- **Base repository:** `excalidraw/excalidraw`
- **Base branch:** `master` (unless upstream’s default branch has another name)
- **Head repository:** your fork
- **Compare:** your feature branch

### PR title (semantic / Conventional Commits)

The workflow [`.github/workflows/semantic-pr-title.yml`](../../.github/workflows/semantic-pr-title.yml) enforces a [Conventional Commits](https://www.conventionalcommits.org/)-style **title**, for example:

- `feat: add export shortcut to command palette`
- `fix: correct hit testing for rotated frames`
- `docs: improve dev setup instructions`
- `chore: bump dev dependency`

Use a type, optional scope in parentheses, then a concise description after the colon. If the check fails, edit the PR title on GitHub.

### PR description

Include:

- **What** changed and **why**
- **How to test** (commands, manual steps)
- **Screenshots or recordings** for visible UI changes

### What to expect from CI

After you open or update the PR, checks typically include lint (Prettier, ESLint, TypeScript), Vitest coverage, semantic title validation, and bundle size limits. Fix failing jobs locally using the commands in [Quality gate before a PR](#6-quality-gate-before-a-pr-match-ci), then push new commits to the same branch.
