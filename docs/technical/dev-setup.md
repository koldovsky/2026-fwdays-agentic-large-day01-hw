# Developer setup and first PR

This guide takes you from a fresh clone to a pull request that matches what CI expects. For architecture and package roles, see [architecture.md](./architecture.md). Stack details are summarized in [tech context](../memory/techContext.md).

---

## 1. Prerequisites

| Requirement | Notes |
|-------------|--------|
| **Node.js** | `>= 18.0.0` per `package.json` `engines`. **Use Node 20.x** locally to match GitHub Actions. |
| **Yarn Classic** | **1.22.x** — the repo pins `packageManager` to `yarn@1.22.22` and uses Yarn workspaces. |

**Node version:** Use [nvm](https://github.com/nvm-sh/nvm), [fnm](https://github.com/Schniz/fnm), or another version manager:

```bash
nvm install 20
nvm use 20
```

**Yarn 1.x:** Install the classic line (not Yarn Berry):

```bash
npm install -g yarn@1.22.22
```

Alternatively, enable Corepack and use the pinned version from `package.json` (if your environment supports it for Yarn 1).

---

## 2. Clone the repository

```bash
git clone <your-fork-or-upstream-url> excalidraw-monorepo
cd excalidraw-monorepo
```

The default branch in this repo is **`master`**.

---

## 3. Install dependencies

From the **repository root**:

```bash
yarn install
```

This is a **Yarn workspaces** monorepo (`excalidraw-app`, `packages/*`, `examples/*`). A single install at the root links all workspaces.

The `prepare` script runs **`husky install`**, so Git hooks are set up after install. The bundled `pre-commit` hook does not run `lint-staged` by default (it is commented out), so **you should run the same checks CI runs before pushing** (see [Quality checks](#6-quality-checks-before-you-push)).

---

## 4. Environment variables

- **`.env.development`** — committed defaults for local development (backend URLs, Firebase dev project, ports, feature flags). Vite loads these in dev.
- **`.env.production`** — build-time defaults for production-oriented builds.
- **`.env.local`** — optional overrides. Use this for secrets or machine-specific values; ensure local-only files stay out of commits (follow `.gitignore`).

Collaboration features expect a WebSocket server URL (see comments in `.env.development`). For a minimal editor-only workflow, the defaults are often enough; full collab may require running the [excalidraw-room](https://github.com/excalidraw/excalidraw-room) server or adjusting URLs.

**Dev server port:** `excalidraw-app/vite.config.mts` uses `VITE_APP_PORT` when set; `.env.development` sets `VITE_APP_PORT=3001`. If unset, Vite falls back to port **3000**.

---

## 5. Run the app locally

From the **repository root**:

```bash
yarn start
```

This runs `yarn --cwd ./excalidraw-app start`, which starts the Vite dev server for the main web app.

Other useful commands:

| Command | Purpose |
|---------|---------|
| `yarn build` | Production build of the app (`excalidraw-app`). |
| `yarn build:packages` | Build ESM outputs for workspace packages (`common`, `math`, `element`, `excalidraw`). |
| `yarn start:example` | Build packages, then run the `examples/with-script-in-browser` dev server. |
| `yarn build:preview` | Build app and run Vite preview (port 5000 per `excalidraw-app/package.json`). |

**Docker (optional):** `docker-compose.yml` maps **host port 3000** to the container. Use this if you prefer a containerized nginx-served build instead of `yarn start`.

---

## 6. Quality checks before you push

CI on pull requests runs checks equivalent to the following (Node **20.x**). Running them locally avoids surprise failures.

### Full suite (recommended before a PR)

```bash
yarn test:all
```

This runs, in order: `test:typecheck` → `test:code` → `test:other` → `test:app` (Vitest once, no watch).

### Individual commands

| Script | What it does |
|--------|----------------|
| `yarn test:typecheck` | `tsc` — project-wide typecheck (`noEmit`). |
| `yarn test:code` | ESLint on `.js`, `.ts`, `.tsx` with `--max-warnings=0`. |
| `yarn test:other` | Prettier **check** on `css`, `scss`, `json`, `md`, `html`, `yml` (list-different). |
| `yarn test:app` | Vitest (default: watch mode; CI uses `--watch=false`). |
| `yarn test` | Alias for `yarn test:app`. |

### Auto-fix

```bash
yarn fix
```

Runs Prettier write on formatted file types, then ESLint with `--fix`.

### Coverage

PRs run **`yarn test:coverage`** and upload a report (`test-coverage-pr` workflow). Locally:

```bash
yarn test:coverage
```

Thresholds are defined in `vitest.config.mts` (lines, branches, functions, statements).

---

## 7. Branch, commit, and push

1. **Sync** your fork’s `master` with upstream if you use one.
2. **Create a branch** from `master`:

   ```bash
   git checkout -b feat/your-short-description
   ```

3. **Commit** with clear messages. Many teams use [Conventional Commits](https://www.conventionalcommits.org/); consistency helps reviewers.
4. **Push** to your fork (or a feature branch on the remote you use for PRs):

   ```bash
   git push -u origin feat/your-short-description
   ```

---

## 8. Open your first pull request

### PR title (required by CI)

The **Semantic PR title** workflow (`semantic-pr-title.yml`) uses [amannn/action-semantic-pull-request](https://github.com/amannn/action-semantic-pull-request). The PR title should follow **Conventional Commits** style, for example:

- `feat: add keyboard shortcut for …`
- `fix: correct export bounds when …`
- `docs: update dev setup instructions`
- `chore: bump dev dependency …`

Use a type such as `feat`, `fix`, `docs`, `chore`, `refactor`, `test`, etc., optionally with a scope.

### What runs on your PR

| Workflow | Trigger | Main steps |
|----------|---------|------------|
| **Lint** | `pull_request` | `yarn install` → `yarn test:other` → `yarn test:code` → `yarn test:typecheck` |
| **Test Coverage PR** | `pull_request` | `yarn install` → `yarn test:coverage` → coverage report comment |
| **Bundle Size** | PR to `master` | Size limit for `@excalidraw/excalidraw` (`packages/excalidraw`, `build:esm`) |
| **Semantic PR title** | PR opened/edited/synced | Validates PR title format |

Pushes to **`master`** also run the **Tests** workflow (`yarn test:app`).

### Review checklist

- [ ] `yarn test:all` passes locally.
- [ ] PR title satisfies the semantic PR check.
- [ ] If you changed UI or behavior, you exercised the relevant flows in the dev server.
- [ ] No secrets committed; use `.env.local` for private keys.

---

## 9. Troubleshooting

| Issue | Suggestion |
|-------|------------|
| Wrong Node / Yarn | Align with **Node 20** and **Yarn 1.22.x**. |
| Stale install | `yarn clean-install` (removes workspace `node_modules` and reinstalls). |
| Stale build artifacts | `yarn rm:build` removes common build output dirs. |
| Type errors after package changes | Run `yarn build:packages` if you depend on built outputs from examples or tooling. |

---

## 10. Further reading

- [architecture.md](./architecture.md) — monorepo layout and editor data flow.
- [../memory/techContext.md](../memory/techContext.md) — versions, aliases, CI matrix.
- Root `package.json` — authoritative script list for the workspace.
