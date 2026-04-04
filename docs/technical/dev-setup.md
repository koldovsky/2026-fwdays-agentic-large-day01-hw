# Developer setup and onboarding

This guide takes you from an empty machine to a **first pull request** against this repository. Commands assume a Unix-like shell (macOS or Linux). On Windows, use **Git Bash** or **WSL** for the same flow.

---

## 1. Prerequisites

### 1.1 Required software

| Tool | Notes |
|------|--------|
| **Git** | Any recent version; needed for clone, branches, and PRs. |
| **Node.js** | **18.x or newer** (`engines` in root `package.json`). **Node 20.x** matches GitHub Actions (`.github/workflows/lint.yml`, `test.yml`). |
| **Yarn Classic** | **1.22.x** — the repo declares `"packageManager": "yarn@1.22.22"`. Do **not** use npm or pnpm for installs unless you know exactly how to avoid lockfile drift. |

#### Installing Yarn 1.x (if needed)

- **Corepack** (Node 16.10+): `corepack enable` then `corepack prepare yarn@1.22.22 --activate`.
- Or install [Yarn Classic](https://classic.yarnpkg.com/lang/en/docs/install/) globally and verify: `yarn --version` → `1.22.x`.

### 1.2 Accounts

- **GitHub** account with SSH keys or HTTPS credentials configured (`git push` must work).
- For **fork-based** workflows: permission to fork the target org/user repo (workshop assignments often use a personal fork).

---

## 2. Get the code

### 2.1 Fork (typical for coursework / open source)

1. On GitHub, open the repository page and click **Fork**.
2. Clone **your fork** (replace placeholders):

```bash
git clone git@github.com:<your-username>/<repo-name>.git
cd <repo-name>
```

HTTPS example:

```bash
git clone https://github.com/<your-username>/<repo-name>.git
cd <repo-name>
```

### 2.2 Add upstream (optional, for staying in sync)

If you forked from an upstream repository:

```bash
git remote add upstream git@github.com:<upstream-org>/<repo-name>.git
git fetch upstream
```

Use `upstream` when you need to merge or rebase the latest default branch into your work.

---

## 3. Install dependencies

From the **repository root**:

```bash
yarn install
```

- This installs **all workspaces** (`excalidraw-app`, `packages/*`, `examples/*`).
- First run may take several minutes.
- If `prepare` runs Husky, ensure `.git` exists (clone completed successfully).

---

## 4. Run the app locally

Still at the repo root:

```bash
yarn start
```

- This runs Vite in **`excalidraw-app/`** (see root `package.json` script `start`).
- Open the URL printed in the terminal. The default dev port is **3000** (`excalidraw-app/vite.config.mts` uses `VITE_APP_PORT` or falls back to `3000`).

To build packages then run the script-in-browser example (optional):

```bash
yarn start:example
```

---

## 5. Verify changes before a PR

CI runs a subset of checks on pull requests. Align locally before you push.

### 5.1 Lint + formatting + TypeScript (matches `lint` workflow)

From the repo root:

```bash
yarn install
yarn test:other
yarn test:code
yarn test:typecheck
```

- `test:other` — Prettier check on configured globs.
- `test:code` — ESLint with zero warnings allowed.
- `test:typecheck` — project-wide `tsc`.

### 5.2 Unit tests (matches `test` workflow on `master` pushes)

```bash
yarn test:app
```

For a non-watch CI-like run:

```bash
yarn test:app --watch=false
```

### 5.3 Full local gate (optional but thorough)

```bash
yarn test:all
```

Use this when you touched types, lint-sensitive files, or many packages.

Auto-fix where appropriate:

```bash
yarn fix
```

---

## 6. Branch, commit, push

### 6.1 Create a branch

```bash
git checkout -b day1/your-name-workshop-docs
```

Use a descriptive name (feature, assignment step, or ticket id).

### 6.2 Commit

```bash
git status
git add <files>
git commit -m "Day 1: add workshop documentation and memory bank"
```

Follow team conventions if stricter than this; the workshop template suggests titles like **“Day 1: &lt;participant-name&gt; — Workshop Assignment”**.

### 6.3 Push to your fork

```bash
git push -u origin day1/your-name-workshop-docs
```

---

## 7. Open your first pull request

1. On GitHub, open your fork and use **Compare & pull request** for the branch you pushed, **or** use the CLI:

```bash
gh pr create --fill
```

(`gh` is optional; install [GitHub CLI](https://cli.github.com/) if you want this.)

2. Set **base** to the branch your instructor or upstream expects (usually `master` — see the default branch on GitHub).

3. Fill in the PR description. This repo provides **`.github/PULL_REQUEST_TEMPLATE.md`**: complete the participant field, check off items (`.cursorignore`, Memory Bank files, technical/product docs), and add notes.

4. Wait for **CI** (lint/tests) and any **CodeRabbit** or review comments; push fixes to the same branch.

---

## 8. Troubleshooting

| Issue | What to try |
|--------|-------------|
| `yarn: command not found` | Install Yarn 1.x; ensure Node is on PATH. |
| Wrong Node version | Use `nvm`, `fnm`, or `asdf` to switch to Node 20.x. |
| Stale installs | `yarn clean-install` (see root `package.json`) — removes workspace `node_modules` and reinstalls. |
| Husky / prepare errors | Clone must be a full git repo; run `yarn install` from repo root. |
| Port already in use | Stop the other process or configure Vite port in `excalidraw-app` (see Vite docs). |

---

## 9. Where to read next

- **Memory Bank**: `docs/memory/techContext.md` — commands and stack summary.
- **Architecture**: `docs/technical/architecture.md` (when present in your branch).
- **Product terms**: `docs/product/domain-glossary.md` (when present).
