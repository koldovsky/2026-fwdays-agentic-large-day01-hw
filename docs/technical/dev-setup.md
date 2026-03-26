# Developer Setup Guide

From repo clone to first merged PR.

---

## Prerequisites

| Tool | Minimum version | Notes |
|------|----------------|-------|
| Node.js | 18.0.0 | 20.x used in CI |
| Yarn | 1.22.x | Classic (v1) — do **not** use Yarn v2/Berry |
| Git | any recent | — |
| Docker | any recent | Optional — only for container workflow |

Check your versions:

```bash
node -v    # must be >= 18
yarn -v    # must be 1.x
```

---

## 1. Clone and Install

```bash
git clone https://github.com/excalidraw/excalidraw.git
cd excalidraw
yarn install
```

`yarn install` bootstraps all Yarn workspace packages in one pass:
- `packages/common`
- `packages/math`
- `packages/element`
- `packages/excalidraw`
- `packages/utils`
- `excalidraw-app`

No additional per-package installs are needed.

---

## 2. Start the Dev Server

```bash
yarn start
```

Opens the app at **http://localhost:3001** with HMR enabled.

The dev server is configured in `excalidraw-app/vite.config.mts`. Port and other settings come from `.env.development` (already committed — no local copy required for basic development).

### What `.env.development` configures

| Variable | Value | Purpose |
|----------|-------|---------|
| `VITE_APP_PORT` | `3001` | Dev server port |
| `VITE_APP_WS_SERVER_URL` | `http://localhost:3002` | Local collaboration WebSocket server |
| `VITE_APP_FIREBASE_CONFIG` | OSS dev Firebase project | Room persistence (dev project, safe to commit) |
| `VITE_APP_ENABLE_ESLINT` | `true` | ESLint runs inside Vite dev server |
| `VITE_APP_ENABLE_PWA` | `false` | PWA / Service Worker disabled in dev |

### Optional local overrides

Create `.env.development.local` (git-ignored) to override specific values without touching the committed file:

```bash
# Disable the "unsaved changes" browser dialog during development
VITE_APP_DISABLE_PREVENT_UNLOAD=true

# Disable HMR when debugging Service Workers
VITE_APP_DEV_DISABLE_LIVE_RELOAD=true
```

---

## 3. Run the Tests

```bash
yarn test          # Vitest — run once
yarn test:app      # same as above (alias used in CI)
```

To run in watch mode during development:

```bash
yarn test --watch
```

To generate a coverage report:

```bash
yarn test:coverage
```

### Coverage thresholds (enforced in CI)

| Metric | Threshold |
|--------|-----------|
| Lines | 60% |
| Branches | 70% |
| Functions | 63% |
| Statements | 60% |

Tests use **Vitest** + **jsdom** + **@testing-library/react**. Canvas is mocked via `vitest-canvas-mock`. Setup file: `setupTests.ts`.

---

## 4. Lint, Format, and Type Check

Run all checks at once (matches CI on PRs):

```bash
yarn test:all
```

Or individually:

```bash
yarn test:typecheck   # TypeScript strict-mode type check
yarn test:code        # ESLint (max-warnings=0)
yarn test:other       # Prettier format check
```

Auto-fix formatting and lint issues:

```bash
yarn fix              # runs both fix:other and fix:code
yarn fix:other        # Prettier auto-format
yarn fix:code         # ESLint auto-fix
```

### Pre-commit hooks

Husky + lint-staged run automatically on `git commit`. Staged files are checked by:
- **ESLint** (`.js`, `.ts`, `.tsx`) — `--max-warnings=0 --fix`
- **Prettier** (`.css`, `.scss`, `.json`, `.md`, `.html`, `.yml`) — `--write`

If a pre-commit hook blocks your commit, run `yarn fix` and re-stage.

---

## 5. Build

```bash
yarn build            # full pipeline: packages + app
yarn build:packages   # packages only (common, math, element, excalidraw, utils)
yarn build:app        # web app only (with Sentry)
yarn build:app:docker # web app without Sentry (for Docker image)
```

To preview the production build locally:

```bash
yarn build:preview
```

### Package build order

Packages must be built in dependency order before the app:

```text
common → math → element → excalidraw → app
```

`yarn build:packages` handles ordering automatically.

---

## 6. Docker (Optional)

Build and run the production image locally:

```bash
docker-compose up --build
```

The app is served by nginx on **http://localhost:3000**.

The `docker-compose.yml` mounts the source directory into the container. `node_modules` is kept in a named volume (`notused`) to avoid host/container conflicts.

To build just the Docker image:

```bash
yarn build:app:docker
```

Sentry error tracking is disabled in Docker builds.

---

## 7. Codebase Orientation

### Key files to read first

| File | Why |
|------|-----|
| `packages/excalidraw/components/App.tsx` | Core editor: all event handlers, state machine |
| `packages/element/src/types.ts` | Every drawable element type defined here |
| `packages/excalidraw/appState.ts` | All editor UI state defaults |
| `packages/excalidraw/actions/types.ts` | Action interface, ActionResult, CaptureUpdateActionType |
| `packages/excalidraw/data/reconcile.ts` | Collaboration merge logic |

### Package dependency chain

```text
excalidraw-app
  └── @excalidraw/excalidraw
        └── @excalidraw/element
              ├── @excalidraw/math
              └── @excalidraw/common

@excalidraw/utils  (standalone — no internal deps)
```

**Rule:** packages must not import from `excalidraw-app`. App-only concerns (Firebase, Socket.io) live in `excalidraw-app/`.

### Coding standards

- TypeScript for all new code; strict mode
- Functional React components with hooks
- CSS modules for component styling
- `PascalCase` for components / interfaces / types; `camelCase` for vars / fns; `ALL_CAPS` for constants
- Never mutate `ExcalidrawElement` directly — always use `newElementWith(element, { ...changes })`
- Math code: import `Point` from `packages/math/src/types.ts` instead of `{ x, y }`
- Do NOT add Firebase or Socket.io imports to `packages/` — app-layer only
- Do NOT use top-level `window` or `document` in packages (breaks SSR)

---

## 8. Making a Change

### Workflow

1. Create a branch from `master`:
   ```bash
   git checkout -b feat/my-change
   ```

2. Make changes. If touching element logic, run the full test suite early:
   ```bash
   yarn test:app
   ```

3. Fix any lint or type errors:
   ```bash
   yarn fix
   yarn test:typecheck
   ```

4. Commit. Pre-commit hooks run automatically.

5. Push and open a PR against `master`.

### PR checklist (from `.github/PULL_REQUEST_TEMPLATE.md`)

- [ ] `.cursorignore` — created in repo root (if applicable)
- [ ] Relevant `docs/` files updated if behavior changed
- [ ] Tests pass: `yarn test:app`
- [ ] Lint passes: `yarn test:code`
- [ ] Types pass: `yarn test:typecheck`
- [ ] Format passes: `yarn test:other`

### CI checks that run on PRs

| Check | Workflow |
|-------|----------|
| ESLint (max-warnings=0) | `lint.yml` |
| Prettier format | `lint.yml` |
| TypeScript typecheck | `lint.yml` |
| Vitest test suite | `test.yml` (runs on push to `master`) |
| Bundle size diff | `size-limit.yml` |
| Semantic PR title | `semantic-pr-title.yml` |

---

## 9. Localization

The app ships 40+ language JSON files in `packages/excalidraw/locales/`. English (`en.json`) is the source of truth; all other locales are code-split at build time.

To check which keys are missing translations:

```bash
yarn locales-coverage
```

Do not add user-facing strings as raw literals — always add a key to `en.json` first and reference it via `t("key")`.

---

## 10. Cleanup

```bash
yarn rm:build          # remove build artifacts (dist/, build/)
yarn rm:node_modules   # remove all node_modules directories
yarn clean-install     # rm:node_modules + fresh yarn install
```
