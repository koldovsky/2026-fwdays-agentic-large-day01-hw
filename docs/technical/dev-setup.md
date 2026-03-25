# Dev Setup & Onboarding

From `git clone` to your first merged PR.

---

## Prerequisites

| Tool | Required version | Check |
|------|-----------------|-------|
| Node.js | ≥ 18.0.0 | `node -v` |
| Yarn (classic) | 1.22.x | `yarn -v` |
| Git | any recent | `git --version` |

> **Yarn version matters.** The repo uses `"packageManager": "yarn@1.22.22"`. Do not use Yarn 2/3/4 (Berry). If `yarn -v` returns `4.x`, run `corepack use yarn@1.22.22` or install via `npm i -g yarn@1.22.22`.

---

## 1. Fork & Clone

```bash
# 1. Fork on GitHub first (top-right "Fork" button)

# 2. Clone your fork
git clone https://github.com/<YOUR_USERNAME>/excalidraw.git
cd excalidraw

# 3. Add upstream remote
git remote add upstream https://github.com/excalidraw/excalidraw.git
```

---

## 2. Install Dependencies

```bash
# from repo root — installs all workspaces in one shot
yarn
```

Yarn workspaces resolve all packages in a single `node_modules` at the root. This covers:
- `excalidraw-app`
- `packages/common`, `packages/math`, `packages/element`, `packages/excalidraw`, `packages/utils`
- `examples/*`

---

## 3. Environment Variables

The dev server reads `.env.development` which is already committed with safe defaults (OSS dev Firebase project, public dev backend).

For local-only overrides create `.env.local` in the repo root (git-ignored):

```bash
# .env.local  — override only what you need
VITE_APP_PORT=3001                          # default dev port
VITE_APP_WS_SERVER_URL=http://localhost:3002 # local collab server (optional)
VITE_APP_DEV_DISABLE_LIVE_RELOAD=           # set `true` to debug Service Workers
```

**Key env vars (from `.env.development`):**

| Variable | Dev default | Purpose |
|----------|-------------|---------|
| `VITE_APP_PORT` | `3001` | Dev server port |
| `VITE_APP_WS_SERVER_URL` | `http://localhost:3002` | Collab WebSocket (optional) |
| `VITE_APP_FIREBASE_CONFIG` | OSS dev project JSON | Persistence / collab |
| `VITE_APP_BACKEND_V2_GET_URL` | `https://json-dev.excalidraw.com/…` | Scene sharing GET |
| `VITE_APP_BACKEND_V2_POST_URL` | `https://json-dev.excalidraw.com/…` | Scene sharing POST |
| `VITE_APP_AI_BACKEND` | `http://localhost:3016` | AI features (optional) |

If you don't need collaboration or AI features, no `.env.local` is required.

---

## 4. Start the Dev Server

```bash
# from repo root
yarn start
# or equivalently:
yarn --cwd excalidraw-app start
```

Opens at `http://localhost:3001` (or the port in `VITE_APP_PORT`).

Vite resolves all `@excalidraw/*` imports directly from source via aliases — **no pre-build of packages is needed** for the dev server.

---

## 5. Run Tests

```bash
# Run all Vitest tests (watch mode by default)
yarn test:app

# Run once (CI mode)
yarn test:app --watch=false

# Type-check everything
yarn test:typecheck

# Lint (ESLint, max 0 warnings)
yarn test:code

# Format check (Prettier)
yarn test:other

# All checks combined (CI)
yarn test:all
```

Tests use **jsdom** + **vitest-canvas-mock**. Canvas and WebGL calls are mocked; no real browser is needed.

---

## 6. Build Packages (only needed for publishing / examples)

The dev server doesn't require this, but integration tests and examples do:

```bash
# Build order is fixed — do not skip steps
yarn build:common   # packages/common  → dist/
yarn build:math     # packages/math    → dist/
yarn build:element  # packages/element → dist/
yarn build:excalidraw # packages/excalidraw → dist/

# Or all at once:
yarn build:packages
```

Then build the app:

```bash
yarn build:app
# preview the production build locally:
yarn --cwd excalidraw-app serve  # http://localhost:5001
```

---

## 7. Code Style & Linting

| Rule | Tool | Config |
|------|------|--------|
| Formatting | Prettier 2.6.2 | `@excalidraw/prettier-config` |
| Linting | ESLint | `.eslintrc.json` + `packages/eslintrc.base.json` |
| Editor indentation | EditorConfig | `.editorconfig` (2 spaces, LF, UTF-8) |

Fix all auto-fixable issues in one shot:

```bash
yarn fix          # prettier --write + eslint --fix
yarn fix:code     # eslint --fix only
yarn fix:other    # prettier --write only
```

**Pre-commit hook** (Husky + lint-staged) automatically runs ESLint `--fix` on staged `*.{js,ts,tsx}` files and Prettier on `*.{css,scss,json,md,html,yml}`. The hook is installed automatically after `yarn`.

---

## 8. TypeScript Conventions

- All new code in **TypeScript** — no plain `.js` in `packages/` or `excalidraw-app/`
- `moduleResolution: "bundler"` — required, set in `tsconfig.json`
- Prefer `const` / `readonly` — elements are immutable by design
- Use `?.` and `??` over explicit null checks
- For coordinate math always use `Point` from `packages/math/src/types.ts` — never `{ x, y }` inline
- React: **functional components + hooks** everywhere except `App.tsx` (legacy class component — do not convert)

---

## 9. Project Structure Quick Reference

```
repo root
├── excalidraw-app/          ← Vite SPA (the hosted app at excalidraw.com)
│   ├── App.tsx              ← Root class component (React 19, do not convert)
│   ├── collab/              ← Socket.io collaboration layer
│   ├── data/                ← Firebase, localStorage, IndexedDB persistence
│   └── components/          ← App-level UI (menu, sidebar, AI)
│
├── packages/
│   ├── common/src/          ← Constants, utils, Emitter, colors (no deps)
│   ├── math/src/            ← Point, Vector, Segment, Curve geometry
│   ├── element/src/         ← Element types, Scene, Store, Delta, bindings
│   ├── excalidraw/          ← Public React component, renderer, actions, i18n
│   └── utils/src/           ← Export helpers (SVG, PNG, JSON)
│
├── docs/
│   ├── memory/              ← Memory Bank (project context for AI agents)
│   ├── technical/           ← Architecture, dev setup (this file)
│   └── product/             ← Domain glossary, PRD
│
├── .env.development         ← Committed dev defaults (safe to use as-is)
├── .env.production          ← Production env (do not modify locally)
├── vitest.config.mts        ← Test config with @excalidraw/* source aliases
└── package.json             ← Root monorepo scripts
```

**Import dependency rule (hard constraint):**
```
math → common → element → excalidraw → excalidraw-app
```
No reverse imports. `packages/math` must not import from `packages/element`.

---

## 10. Making a Change

### Branch from `master`

```bash
git checkout master
git pull upstream master
git checkout -b feat/my-feature   # or fix/issue-123
```

### Naming conventions

| Category | Branch prefix | Example |
|----------|--------------|---------|
| Feature | `feat/` | `feat/lasso-multi-select` |
| Bug fix | `fix/` | `fix/arrow-binding-crash` |
| Refactor | `refactor/` | `refactor/store-schedule-api` |
| Docs | `docs/` | `docs/dev-setup` |
| Tests | `test/` | `test/fractional-index` |

### Element mutation — always use `mutateElement`

```typescript
// ✅ correct — goes through Store, bumps version, triggers re-render
import { mutateElement } from "@excalidraw/element";
mutateElement(element, { x: 100, y: 200 });

// ❌ wrong — bypasses Store/snapshot, silent undo/redo corruption
(element as any).x = 100;
```

### Undo history — schedule via Store

```typescript
// ✅ after mutating elements that should be undoable
app.store.scheduleCapture();

// ✅ for ephemeral updates (pointer move, preview) — no undo entry
// store will default to CaptureUpdateAction.EVENTUALLY automatically
```

See [Undocumented Behavior #2 in techContext.md](../memory/techContext.md) for the `scheduleCapture` pitfall.

---

## 11. Before Committing

```bash
# 1. Run all checks
yarn test:all

# 2. Fix anything that fails
yarn fix

# 3. Type-check
yarn test:typecheck

# 4. Run tests
yarn test:app --watch=false
```

The pre-commit hook runs lint-staged automatically on `git commit`, but running `yarn test:all` beforehand avoids surprises.

---

## 12. Opening a Pull Request

1. Push your branch to your fork:
   ```bash
   git push origin feat/my-feature
   ```

2. Open a PR against `excalidraw/excalidraw` → `master` on GitHub.

3. Fill in the PR template checklist (`.github/PULL_REQUEST_TEMPLATE.md`):
   - Describe what changed and why
   - Link related issues (`Fixes #1234`)
   - Add screenshots / recordings for UI changes

4. Ensure all CI checks pass:
   - `test` — Vitest
   - `lint` — ESLint
   - `typecheck` — `tsc --noEmit`
   - `size-limit` — bundle size regression check

5. Review cycle: address comments with new commits (do **not** force-push after review starts unless asked).

---

## 13. Useful Commands Cheatsheet

```bash
yarn start                        # dev server (localhost:3001)
yarn test:app                     # vitest watch
yarn test:app --watch=false       # vitest CI
yarn test:typecheck               # tsc
yarn test:code                    # eslint
yarn fix                          # prettier + eslint --fix
yarn build:packages               # build all packages (ESM)
yarn build:app                    # production app build
yarn --cwd excalidraw-app serve   # preview production build
```

---

## 14. References

- Architecture overview: [docs/technical/architecture.md](architecture.md)
- Tech stack & undocumented behaviors: [docs/memory/techContext.md](../memory/techContext.md)
- Domain glossary: [docs/product/domain-glossary.md](../product/domain-glossary.md)
- Decision log (ADRs): [docs/memory/decisionLog.md](../memory/decisionLog.md)
