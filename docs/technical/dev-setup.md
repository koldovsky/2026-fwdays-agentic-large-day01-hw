# Developer onboarding — local setup to pull request

This guide helps new contributors get from **clone** to **opening a PR**, with paths for different experience levels. Commands match the root `package.json` in this repository.

---

## Who this is for

| Level | Goal |
|-------|------|
| **Beginner** | Run the app locally and run tests once; understand where to change UI. |
| **Intermediate** | Work in `packages/excalidraw`, use package builds and the full quality gate. |
| **Advanced** | Understand the monorepo graph, release/build scripts, and keep PRs CI-clean. |

Background reading (optional): [architecture](./architecture.md), [memory bank](../memory/).

---

## Prerequisites

- **Git** — clone and branches.
- **Node.js** — `>=18.0.0` (see `engines` in root `package.json`).
- **Yarn Classic (v1)** — repo declares `packageManager: "yarn@1.22.22"`. Install [Yarn 1](https://classic.yarnpkg.com/) or enable via Corepack: `corepack enable` then use the version from `package.json`.

**Note:** `npm install` may work in some environments, but **workspace scripts use `yarn --cwd …`**. Prefer Yarn for a setup that matches CI and maintainers.

---

## 1. Clone the repository

```bash
git clone <your-fork-or-upstream-url> 2026-fwdays-agentic-large-day01-hw
cd 2026-fwdays-agentic-large-day01-hw
```

- Use your **fork URL** if you will open PRs from your account.
- Add `upstream` if you forked (replace with the course/upstream repo URL):

```bash
git remote add upstream <upstream-repo-url>
git fetch upstream
```

---

## 2. Install dependencies

From the **repository root**:

```bash
yarn install
```

- This runs the `prepare` script (`husky install`) so Git hooks are wired (see `.husky/`).
- Workspaces install: `excalidraw-app`, `packages/*`, `examples/*` (see `workspaces` in root `package.json`).

**If install fails:** try `yarn clean-install` (removes `node_modules` per `rm:node_modules` script, then reinstall).

---

## 3. Run the main application

From the **repository root**:

```bash
yarn start
```

This runs `yarn --cwd ./excalidraw-app start` (Vite dev server for the product app).

**Beginner sanity check:** the app loads in the browser without errors.

---

## 4. Run tests and checks

Run from the **repository root** unless noted.

| Command | What it does |
|---------|----------------|
| `yarn test` | Vitest (default test runner). |
| `yarn test:all` | Typecheck + ESLint + Prettier check + Vitest (non-watch). **Strong pre-PR check.** |
| `yarn test:typecheck` | `tsc` |
| `yarn test:code` | ESLint, zero warnings |
| `yarn test:other` | Prettier `--list-different` |
| `yarn test:coverage` | Vitest with coverage |

Auto-fix (when appropriate):

```bash
yarn fix
```

---

## 5. Package and example workflows (intermediate+)

### Build workspace packages (needed for some examples / consumers)

```bash
yarn build:packages
```

Order: `common` → `math` → `element` → `excalidraw` (see root scripts).

### Run the browser-script example

```bash
yarn start:example
```

This runs `build:packages` then starts `examples/with-script-in-browser`.

### Full production-style build (slower)

```bash
yarn build
```

Builds via `excalidraw-app` (see root `build` script).

---

## 6. Git hooks and pre-commit

- **Husky** is installed on `yarn install` via `prepare`.
- `.husky/pre-commit` in this repo may have **`yarn lint-staged` commented out**. If you want staged files linted/format on every commit, uncomment that line.
- Staging rules live in **`.lintstagedrc.js`**: ESLint with `--fix` on `*.{js,ts,tsx}`, Prettier on `*.{css,scss,json,md,html,yml}`.

---

## 7. Make a change and open a PR

### 7.1 Sync your default branch (optional)

```bash
git checkout master
git pull upstream master   # or: git pull origin master
```

(Use the branch name your remote uses, e.g. `main`, if different.)

### 7.2 Create a feature branch

Use a short, descriptive name:

```bash
git checkout -b feat/short-description
# or fix/..., docs/..., chore/...
```

### 7.3 Develop and verify

- Edit code under `packages/excalidraw`, `excalidraw-app`, etc.
- Run **`yarn start`** while iterating.
- Before pushing, run **`yarn test:all`** (or at minimum `yarn test` + `yarn test:code` if you are tight on time).

### 7.4 Commit

```bash
git add -p   # review hunks
git commit -m "feat: clear imperative summary of the change"
```

Write commits in clear English; follow any conventions your course or team requires.

### 7.5 Push and open the PR

```bash
git push -u origin feat/short-description
```

On GitHub (or your host): **Compare & pull request** → target branch is usually **`master`** (or as instructed by maintainers).

**PR description should include:**

- What changed and why.
- How to test (e.g. “`yarn start` → …”).
- Screenshots if UI changed.

---

## 8. Troubleshooting

| Symptom | Things to try |
|---------|----------------|
| Wrong Node version | `node -v` → use 18, 20, or 22 LTS if tools warn (some deps skip Node 21). |
| `yarn` not found | Install Yarn 1 or enable Corepack and use `packageManager` version. |
| Hooks not running | Re-run `yarn install`; check `.husky/pre-commit` is executable on Unix. |
| Blank canvas in embed | See `packages/excalidraw/README.md`: import CSS and give the container height. |
| Stale build artifacts | `yarn rm:build` then rebuild. |

---

## 9. Source verification (repo files)

- Root **`package.json`**: `engines`, `workspaces`, `scripts`, `prepare`, `packageManager`.
- **`excalidraw-app/package.json`**: `start`, `build` scripts.
- **`.husky/pre-commit`**, **`.lintstagedrc.js`**: hook and staged lint/format behavior.
