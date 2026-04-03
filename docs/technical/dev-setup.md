# Developer setup and onboarding

This guide is **specific to this repository** (`excalidraw-monorepo` in `package.json`). It is grounded in manifests, scripts, and CI configs. **“First PR”** here means: clone → install → run the app → run the same checks CI runs on pull requests → open a PR that passes those checks (and satisfies the semantic PR title workflow where applicable).

**Repository shape:** Yarn **workspaces** monorepo (`excalidraw-app`, `packages/*`, `examples/*`) — **not** a single package.

---

## 1. Overview

| Topic | Fact (verified) |
|-------|-------------------|
| What this guide covers | End-to-end local setup, env, dev server, validation commands, CI alignment, contribution artifacts |
| Who it is for | Contributors working in this fork/monorepo |
| Package model | Monorepo: `package.json` `workspaces`: `excalidraw-app`, `packages/*`, `examples/*` |
| Primary app | `excalidraw-app` (Vite + React); root `yarn start` delegates here |
| Lockfile | `yarn.lock`; `packageManager`: `yarn@1.22.22` in root `package.json` |

---

## 2. Repository prerequisites

### Required

| Requirement | Details | Verified in |
|-------------|---------|-------------|
| **Git** | Clone and branch operations | Standard; not version-pinned in repo |
| **Node.js** | `>=18.0.0` | Root `package.json` `engines`; `excalidraw-app/package.json` `engines` |
| **Yarn Classic** | **1.22.22** (Corepack or matching install) | Root `package.json` `"packageManager": "yarn@1.22.22"` |
| **Disk / network** | For `yarn install` and optional Docker build | — |

### CI reference version

GitHub Actions use **Node 20.x** (`.github/workflows/lint.yml`, `test.yml`, `test-coverage-pr.yml`, `size-limit.yml`). Using **Node 18+** locally matches `engines`; **Node 20** aligns with CI.

### Optional

| Tool | Role | Verified in |
|------|------|-------------|
| **Docker** | Alternative run via `docker-compose.yml` / `Dockerfile` | `docker-compose.yml`, `Dockerfile` |
| **nvm / fnm / asdf** | Switch Node versions | **Not verified** — no `.nvmrc` or `.node-version` in repo |

### Not specified in repo

- **pnpm / npm** as primary installer — root explicitly uses **Yarn** workspaces and `yarn.lock`.

---

## 3. Clone and initial setup

1. **Clone** the repository (use your fork URL if contributing via fork).

   ```bash
   git clone <repository-url>
   cd <repo-directory>
   ```

2. **Install dependencies** from the **repository root** (installs all workspaces).

   ```bash
   yarn install
   ```

3. **Git hooks (Husky)** — root `package.json` has `"prepare": "husky install"`, which runs after `yarn install`. The hook script `.husky/pre-commit` currently contains only a **comment** (`# yarn lint-staged`); **lint-staged is not enforced automatically** from that file unless you uncomment or wire it. **Evidence:** `.husky/pre-commit`.

4. **No separate bootstrap script** beyond `yarn install` and `prepare` — **not verified** for additional codegen required before first `yarn start`.

---

## 4. Local environment configuration

### Env file location

- Vite for `excalidraw-app` sets `envDir: "../"` relative to `excalidraw-app` — i.e. **repository root** for `.env*` files. **Evidence:** `excalidraw-app/vite.config.mts` (`envDir`, `loadEnv`).

### Files present in repo

| File | Role |
|------|------|
| `.env.development` | Default development variables (ports, backend URLs, Firebase JSON, feature flags) |
| `.env.production` | Production-oriented defaults |

There is **no** `.env.example` in the repo root (verified by glob). Treat `.env.development` as the reference for local dev naming.

### Ports (from `.env.development`)

| Variable | Example in repo | Purpose (from names/comments) |
|----------|-------------------|-------------------------------|
| `VITE_APP_PORT` | `3001` | Dev server port (comment: “The port the run the dev server”) |
| `VITE_APP_WS_SERVER_URL` | `http://localhost:3002` | Collaboration WebSocket server |
| `VITE_APP_AI_BACKEND` | `http://localhost:3016` | AI backend for diagram features |
| `VITE_APP_PLUS_*` | localhost / production URLs | Excalidraw+ links |

**Vite fallback:** if `VITE_APP_PORT` is unset, `excalidraw-app/vite.config.mts` uses port **3000** (`Number(envVars.VITE_APP_PORT || 3000)`).

### Overrides

- `.env.development` comments mention **`.env.local`** for overrides (“put these in your .env.local”). **Evidence:** `.env.development` (~19–20).

### Secrets

- Do **not** commit real secrets. Firebase config appears in `.env.development` as **committed dev project values** in this upstream-style tree; for your fork, confirm policy with your team. **Not verified:** whether this fork redacts them.

### Mandatory vs optional for “app loads”

- **Minimum to open the editor:** `yarn install` + default `.env.development` at root usually suffices for local UI.
- **Live collaboration:** requires a reachable `VITE_APP_WS_SERVER_URL` (e.g. local excalidraw-room on port **3002** per default) — **not verified** that the server ships in this repo (comment points to external project).

---

## 5. Running the project locally

### Main development server (canonical)

From **repository root**:

```bash
yarn start
```

This runs `yarn --cwd ./excalidraw-app start`, which runs `yarn && vite` inside `excalidraw-app` (`excalidraw-app/package.json` `start` script).

- **Browser:** Vite is configured with `open: true` (`excalidraw-app/vite.config.mts`).
- **URL:** `http://localhost:<port>` — default **3001** if using committed `.env.development` (`VITE_APP_PORT`), else **3000** if env not loaded.

### Build packages + example (optional)

```bash
yarn start:example
```

Runs `yarn build:packages` then starts `examples/with-script-in-browser` (`package.json` `start:example`).

### Production-like static serve (optional)

```bash
yarn start:production
```

Runs `yarn build` then `serve` in `excalidraw-app` (http-server on port **5001** per `excalidraw-app/package.json` `serve`).

### Docker (optional)

- **`docker compose`** (file `docker-compose.yml`): builds image, maps host **3000** → container **80**, mounts repo, uses anonymous volume for `node_modules` inside container.
- **`Dockerfile`**: multi-stage build with `yarn build:app:docker`, serves `excalidraw-app/build` via nginx.

**Successful startup:** dev server listens; browser opens (if allowed). **Not verified:** full feature parity without external collab/AI services.

### Multiple processes (when needed)

| Capability | Depends on |
|------------|------------|
| Core editor | Usually **one** dev process (`yarn start`) |
| Collaboration | Separate **WebSocket** server at URL in `VITE_APP_WS_SERVER_URL` (default localhost:3002) — **external to this repo** per comment in `.env.development` |
| AI features | Backend at `VITE_APP_AI_BACKEND` |

---

## 6. Repository structure for new contributors

| Path | Purpose |
|------|---------|
| `excalidraw-app/` | Vite host app: collab, Firebase wiring, menus, env-specific behavior |
| `packages/common/`, `packages/math/`, `packages/element/` | Shared libraries (esbuild-built ESM) |
| `packages/excalidraw/` | Main editor package (React `App`, actions, renderer) |
| `packages/utils/` | Utilities (separate build script) |
| `examples/` | `with-nextjs`, `with-script-in-browser` integration examples |
| `scripts/` | Build scripts (`buildBase.js`, `buildPackage.js`, release, locales, etc.) |
| `packages/excalidraw/**/*.test.ts(x)` | Most Vitest tests |
| `excalidraw-app/tests/` | App-level tests |
| `.github/workflows/` | CI definitions |
| `docs/` | Project docs (memory bank, architecture, this guide) |

**Typical first changes:** `packages/excalidraw` for editor behavior; `excalidraw-app` for host-only features.

---

## 7. Development workflow

- **Package boundaries:** respect workspace dependencies (`packages/*/package.json`). Dev uses **path aliases** to source (`excalidraw-app/vite.config.mts`, root `tsconfig.json`).
- **Hot reload:** Vite dev server (HMR); `VITE_APP_DEV_DISABLE_LIVE_RELOAD` in `.env.development` for Service Worker debugging.
- **Rebuild packages:** If you change published-style package APIs consumed by examples, you may need `yarn build:packages` (root `package.json`). For day-to-day `yarn start`, aliases point at **source** — **not verified** for every edge case.
- **ESLint in dev:** `vite-plugin-checker` can run ESLint when `VITE_APP_ENABLE_ESLINT` is not `false` (see `.env.development`).

---

## 8. Testing and quality checks

### Commands (root `package.json`)

| Command | What it does |
|---------|----------------|
| `yarn test` / `yarn test:app` | Vitest (`vitest.config.mts`, `setupTests.ts`) |
| `yarn test:typecheck` | `tsc` (root `tsconfig.json`; `examples` excluded) |
| `yarn test:code` | ESLint `--max-warnings=0 --ext .js,.ts,.tsx .` |
| `yarn test:other` | Prettier `--list-different` on patterns in `prettier` script |
| `yarn test:all` | Runs typecheck + eslint + prettier + `vitest --watch=false` |
| `yarn test:coverage` | Vitest with coverage (`vitest.config.mts` thresholds) |
| `yarn fix` | Prettier write + ESLint fix |

### CI on **pull requests** (verify locally before PR)

| Workflow | Runs |
|----------|------|
| `lint.yml` | `yarn install` → `yarn test:other` → `yarn test:code` → `yarn test:typecheck` |
| `test-coverage-pr.yml` | `yarn install` → `yarn test:coverage` → coverage report action |
| `size-limit.yml` | `yarn` in `packages/excalidraw` + size-limit action, `build:esm` |
| `semantic-pr-title.yml` | Validates PR title (semantic convention via `amannn/action-semantic-pull-request@v5`) |

**Note:** `test.yml` runs `yarn test:app` on **push to `master`**, not on every PR branch push — for PRs, rely on **test-coverage-pr** + local `yarn test:app`.

### Minimal path before a small PR

Reasonable minimum: `yarn test:code && yarn test:typecheck && yarn test:app` (or `yarn test:all` for full parity with `lint.yml` + tests).

---

## 9. Common development commands

| Category | Command |
|----------|---------|
| Install | `yarn install` |
| Dev app | `yarn start` |
| Build all (app script) | `yarn build` |
| Build workspace packages | `yarn build:packages` |
| Clean artifacts | `yarn rm:build` |
| Clean deps | `yarn rm:node_modules` / `yarn clean-install` |
| Test | `yarn test`, `yarn test:all`, `yarn test:coverage` |
| Lint / format | `yarn test:code`, `yarn test:other`, `yarn fix` |
| Typecheck | `yarn test:typecheck` |
| Example | `yarn start:example` |
| Locales (maintenance) | `yarn locales-coverage` |

---

## 10. Git and contribution workflow

### Branching

- **Not verified:** default branch name — upstream-style repos often use `master` (CI `test.yml` triggers on `push` to `master`).

### Pull request template

- `.github/PULL_REQUEST_TEMPLATE.md` exists. In **this** checkout it is a **workshop assignment** checklist (Ukrainian), including optional items such as memory-bank files. **Adapt** if your team uses a different process.

### PR title (automated check)

- `semantic-pr-title.yml` runs on PR **opened / edited / synchronize** and uses **semantic PR title** validation. Use a **Conventional Commits–style PR title** (e.g. `feat: ...`, `fix: ...`) so the check passes. **Evidence:** `.github/workflows/semantic-pr-title.yml`.

### Commit message policy

- **Not verified** in repo: no `commitlint.config` found in quick scan; enforcement is primarily **PR title** via CI above.

### Required checks (inferred)

- From workflows: lint (prettier list + eslint + tsc), coverage on PRs, size limit on PRs to `master`, semantic title.

### Code review / ownership

- **Not verified** from repo alone (team policy).

---

## 11. From first change to first PR

1. `git fetch` / sync your clone with the target remote.
2. Create a branch: `git checkout -b <branch-name>` (**branch naming:** not enforced in repo — **not verified**).
3. Make a small, scoped change under `packages/excalidraw`, `excalidraw-app`, or `packages/*` as appropriate.
4. Run **`yarn test:code`** and **`yarn test:typecheck`** (matches `lint.yml`).
5. Run **`yarn test:app`** (or `yarn test:all` for full suite).
6. If you touch `@excalidraw/excalidraw` bundle size, be aware of **`size-limit.yml`** on PRs to `master`.
7. **`yarn fix`** if formatting/lint auto-fixes are needed.
8. `git add` / `git commit` with a clear message.
9. `git push` to your fork/remote branch.
10. Open a **Pull Request** with a **semantic-style title** (see §10).
11. Confirm CI: Lint workflow, coverage workflow, size-limit (if applicable), semantic title.

---

## 12. Troubleshooting and caveats

| Caveat | Evidence |
|--------|----------|
| **Yarn 1.x** required for lockfile/workspace behavior | `packageManager` in root `package.json` |
| **`excalidraw-app` `start` runs `yarn`** | May reinstall/link; expect network if deps change — `excalidraw-app/package.json` `start` |
| **Env at repo root** | Vite `envDir: "../"` — wrong cwd can drop env → wrong port (3000 vs 3001) |
| **`examples` excluded** from root `tsc` | `tsconfig.json` `exclude` includes `examples` |
| **Docker volume** hides host `node_modules` | `docker-compose.yml` anonymous volume for `node_modules` |
| **Husky pre-commit** may not run lint-staged | `.husky/pre-commit` is effectively comment-only |
| **Collaboration / AI** | Full features need extra backends; defaults point to localhost or remote URLs in `.env.development` |

---

## 13. Evidence sources

| Purpose | Paths |
|---------|--------|
| Runtime / package manager | Root `package.json`, `excalidraw-app/package.json`, `yarn.lock` |
| Workspaces | Root `package.json` `workspaces` |
| Install / scripts | Root `package.json` `scripts`, `prepare` |
| Dev server / env | `excalidraw-app/vite.config.mts`, `.env.development`, `.env.production` |
| Tests / quality | `vitest.config.mts`, `setupTests.ts`, `tsconfig.json`, `.eslintrc.json`, `.lintstagedrc.js` |
| CI | `.github/workflows/lint.yml`, `test.yml`, `test-coverage-pr.yml`, `size-limit.yml`, `semantic-pr-title.yml` |
| Git hooks | `.husky/pre-commit`, `package.json` `prepare` |
| Docker | `Dockerfile`, `docker-compose.yml` |
| PR template | `.github/PULL_REQUEST_TEMPLATE.md` |

---

**Note:** This file lives at `docs/technical/dev-setup.md`. If another checklist in the repo references `docs/technical/dev-setup.md`, align paths in that checklist — **path discrepancy** between templates and this guide is **not verified** as intentional.
