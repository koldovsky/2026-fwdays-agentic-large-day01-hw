# Developer Setup Guide

From clone to first PR. All steps verified against repository sources.

---

## 1. Overview

Yarn 1 workspace monorepo. One `yarn install` at the root covers the primary workspaces: `excalidraw-app` and `packages/*`. Example sub-folders (e.g., `examples/with-nextjs`) are declared as workspaces in the root `package.json` but ship their own `yarn.lock` and require a separate `yarn install` inside the sub-folder for standalone use. There is no `CONTRIBUTING.md` or `CODEOWNERS` file in this repository.

---

## 2. Prerequisites

| Tool | Required version | Source |
| --- | --- | --- |
| **Node.js** | `>=18.0.0` (CI uses 20.x) | `package.json` `engines`; all CI workflows: `node-version: 20.x` |
| **Yarn** | `1.22.22` (classic) | `package.json` `packageManager` field |

No other global installs required. Vite, TypeScript, ESLint, and Vitest are local devDependencies.

---

## 3. Clone and Install

```bash
git clone <repo-url>
cd <repo-dir>
yarn install
```

`prepare` lifecycle runs `husky install`, wiring up `.husky/pre-commit`.

> **Warning:** `.husky/pre-commit` contains only `# yarn lint-staged` (commented out). The pre-commit hook is **not active**. Run validation manually before pushing (see Section 6).

---

## 4. Environment Configuration

Two `.env` files are committed at the repo root. Vite reads them from there (`envDir: "../"` in `excalidraw-app/vite.config.mts`). No manual setup is needed to start.

| File | Used when |
| --- | --- |
| `.env.development` | `yarn start` — pre-wired with a dev Firebase project; `VITE_APP_WS_SERVER_URL=http://localhost:3002` |
| `.env.production` | `yarn build` — production Firebase and public collab server |

To override values locally, create `.env.local` at the **repo root** (listed in `.gitignore`):

```bash
# .env.local — not committed
VITE_APP_DISABLE_PREVENT_UNLOAD=true   # skip "unsaved changes" dialog
VITE_APP_PORT=3002                     # if port 3001 is already in use
```

Key defaults from `.env.development`:

- `VITE_APP_PORT=3001` — dev server port
- `VITE_APP_ENABLE_PWA=false` — service worker disabled in dev
- `VITE_APP_WS_SERVER_URL=http://localhost:3002` — collab (no local server = collab fails silently)

---

## 5. Local Development

### Main app

```bash
yarn start     # Vite dev server → http://localhost:3001
```

HMR is active. TypeScript/ESLint errors appear as a browser overlay (collapsed by default).

### Vanilla embed example

```bash
yarn start:example   # builds packages first, then starts with-script-in-browser via Vite
```

Opens at `http://localhost:3000` (Vite default for that workspace).

### Next.js example — no root-level script in package.json

```bash
cd examples/with-nextjs
yarn install   # separate node_modules — excluded from root tsconfig
yarn dev       # http://localhost:3000
```

### Collaboration

Real-time collab requires a running `excalidraw-room` socket server (separate project). Without it, the app works normally for all non-collab features.

---

## 6. Validation Commands

These align with CI checks. Run before every push.

```bash
# Tests
yarn test:app --watch=false   # Vitest single run (CI: test.yml)
yarn test:coverage            # with coverage report

# Lint, format, types (CI: lint.yml — runs all three)
yarn test:code                # eslint --max-warnings=0
yarn test:other               # prettier --list-different (css/scss/json/md/html/yml)
yarn test:typecheck           # tsc --noEmit (strict)

# Auto-fix
yarn fix                      # runs prettier + eslint --fix

# Full suite (runs all of the above in sequence)
yarn test:all
```

Coverage thresholds (fail CI if not met): **lines 60%, branches 70%, functions 63%, statements 60%**.

### Build

```bash
yarn build:packages    # common → math → element → excalidraw (in dependency order)
yarn build             # builds the web app for production
```

During development, packages do **not** need to be built — `tsconfig.json` path aliases resolve `@excalidraw/*` directly to source files.

---

## 7. Repository Map

```text
excalidraw-app/       Web app: App.tsx, collab/, data/, share/
packages/common/      @excalidraw/common — constants, colors
packages/math/        @excalidraw/math — 2D geometry primitives
packages/element/     @excalidraw/element — element model, bounds, rendering
packages/excalidraw/  @excalidraw/excalidraw — React editor component, public API
packages/utils/       @excalidraw/utils — file I/O, compression, fonts
examples/             Integration examples (excluded from root tsconfig)
scripts/              Build helpers (buildBase.js, buildPackage.js, release.js)
.env.development      Local dev config (committed, safe)
.env.production       Production config (committed)
vitest.config.mts     Test runner config, coverage thresholds, resolve aliases
tsconfig.json         Root TypeScript config with @excalidraw/* path aliases
.eslintrc.json        Extends @excalidraw/eslint-config + react-app
.lintstagedrc.js      lint-staged config (ESLint + Prettier — not auto-run)
```

---

## 8. First Contribution Workflow

1. Branch from `master`.
2. Make changes; verify with `yarn start`.
3. Add or update tests in `packages/excalidraw/tests/` or `excalidraw-app/tests/`.
4. Run `yarn fix` then `yarn test:all`.
5. Open PR against `master`.

---

## 9. PR Readiness Checklist

All items below are enforced by CI on every PR:

- [ ] `yarn test:other` — no Prettier diffs
- [ ] `yarn test:code` — zero ESLint warnings/errors
- [ ] `yarn test:typecheck` — TypeScript clean
- [ ] `yarn test:app --watch=false` — all tests pass
- [ ] Coverage thresholds not regressed (posted as PR comment by CI)
- [ ] **PR title follows Conventional Commits** (`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, etc.) — enforced by `semantic-pr-title.yml`; invalid title = CI failure
- [ ] Bundle size delta acceptable for `packages/excalidraw` changes (`size-limit.yml` on PRs to `master`)

ESLint rules that commonly trip contributors:

- **Never** `import ... from "jotai"` — use `editor-jotai` or `app-jotai` instead.
- In `packages/excalidraw/`, do not import from the barrel `index.tsx`; use direct relative paths.
- Type-only imports must use `import type` syntax.

---

## 10. Common Pitfalls

| Problem | Cause | Fix |
| --- | --- | --- |
| LSP errors: `Cannot find module '@excalidraw/*'` | Packages not built; LSP reads from `dist/` | Expected. `yarn build:packages` resolves it. Tests and dev server work without building. |
| Port 3001 in use | `.env.development` default | Override: `VITE_APP_PORT=3002` in `.env.local` |
| Pre-commit hook skips lint | Hook is commented out in `.husky/pre-commit` | Run `yarn fix && yarn test:all` manually before pushing |
| Collab fails on connect | No local room server | Expected. Use production collab or skip collab testing locally |
| TypeScript errors on `import.meta.env` | Vite virtual types not resolved by plain `tsc` | Run via `yarn start`/`yarn build` |
| Coverage job fails on PR | New uncovered code | Check `vitest.config.mts` thresholds; add tests for the new code |
| PR rejected immediately | Non-conventional commit title | Rename PR title: `<type>: <short description>` |

---

## 11. Source Evidence

- `package.json` (root) — `engines`, `packageManager`, `workspaces`, all scripts
- `.env.development` / `.env.production` — committed env defaults
- `excalidraw-app/vite.config.mts` — `envDir: "../"`, dev port, PWA flag
- `tsconfig.json` — path aliases, `include`/`exclude`
- `vitest.config.mts` — resolve aliases, coverage thresholds
- `.eslintrc.json` / `.eslintignore` — rules, jotai restriction, `consistent-type-imports`
- `.lintstagedrc.js` — staged-file lint/format rules
- `.husky/pre-commit` — `# yarn lint-staged` (commented out)
- `.github/workflows/lint.yml`, `test.yml`, `test-coverage-pr.yml`, `semantic-pr-title.yml`, `size-limit.yml`
- `examples/with-script-in-browser/package.json` — `build:packages` dependency
- `packages/excalidraw/README.md` — CSS import and container height requirements
