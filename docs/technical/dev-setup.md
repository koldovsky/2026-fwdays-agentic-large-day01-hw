# Developer setup

Onboarding for the **excalidraw-monorepo** workspace: install dependencies, run the main app, run tests, and build. Deeper stack notes and command tables live in [`docs/memory/techContext.md`](../memory/techContext.md).

## Prerequisites

- **Node.js**: `>=18.0.0` (`engines` in root `package.json` and `excalidraw-app/package.json`).
- **Yarn**: **1.x** classic, pinned as `yarn@1.22.22` via the root `packageManager` field (`package.json`). This repo uses **Yarn workspaces**; `package-lock.json` is ignored (`.gitignore`)—use Yarn, not npm install at the root.
- **CI reference**: GitHub Actions use **Node 20.x** for tests and lint (`.github/workflows/test.yml`, `.github/workflows/lint.yml`). Using Node 18+ locally matches `engines`; 20.x aligns with CI.

## Monorepo layout

| Path | Role |
|------|------|
| `excalidraw-app/` | Vite-hosted web app (what `yarn start` runs). |
| `packages/*` | Library packages (`common`, `math`, `element`, `excalidraw`, `utils`) and shared code. |
| `examples/*` | Sample integrations (`with-script-in-browser`, `with-nextjs`). |

Workspaces are declared in root `package.json`: `excalidraw-app`, `packages/*`, `examples/*`.

## Clone and install

From the repository root:

```bash
yarn install
```

This installs all workspaces. Husky runs on `prepare` (`husky install` in root `package.json`).

### Quick path: install, run app, run tests

```bash
yarn install
yarn start
# In another terminal, from the same repo root:
yarn test --watch=false
```

(`yarn test` is an alias for `yarn test:app` → `vitest`; Vitest may watch by default—pass `--watch=false` for a single run like CI.)

## Run the main app

From the **repository root**:

```bash
yarn start
```

This runs `yarn --cwd ./excalidraw-app start` (root `package.json`). The app script (`excalidraw-app/package.json`) is `yarn && vite`, so it refreshes dependencies in that workspace then starts Vite.

### Dev server port and env files

- **Port**: `excalidraw-app/vite.config.mts` sets `server.port` to `Number(envVars.VITE_APP_PORT || 3000)` after loading env from the monorepo root.
- **Env directory**: `envDir: "../"` in `excalidraw-app/vite.config.mts` — Vite loads `.env`, `.env.local`, `.env.[mode]`, etc. from the **repository root** (parent of `excalidraw-app/`), not from `excalidraw-app/` alone.

Configure values **per your environment**. Names that appear in repo config/scripts include (non-exhaustive):

- `VITE_APP_PORT` — dev server port override (`excalidraw-app/vite.config.mts`).
- `VITE_APP_GIT_SHA`, `VITE_APP_ENABLE_TRACKING` — production build (`excalidraw-app/package.json` `build:app`).
- `VITE_APP_DISABLE_SENTRY` — Docker-oriented build script (`build:app:docker` in same file).

Additional `VITE_*` and backend URLs are referenced from application code (e.g. `excalidraw-app/data/index.ts`); set them locally as needed for full product features—exact values are not committed here.

## Examples

### From root (script-in-browser example)

```bash
yarn start:example
```

Runs `yarn build:packages` then `yarn --cwd ./examples/with-script-in-browser start` (root `package.json`). That example's Vite dev server uses port **3001** (`examples/with-script-in-browser/vite.config.mts`); `yarn preview` in that package uses port **5002** (`examples/with-script-in-browser/package.json`).

### Per-example commands

- **`examples/with-script-in-browser`**: `start`, `build`, `preview` (see `examples/with-script-in-browser/package.json`). It also has `build:packages` pointing at the repo root `build:packages`.
- **`examples/with-nextjs`**: `dev` runs `next dev -p 3005` after `build:workspace` (builds packages and copies fonts via `cp` in `copy:assets`—Unix-style; see `examples/with-nextjs/package.json`). From the repo root:

  ```bash
  yarn --cwd ./examples/with-nextjs dev
  ```

## Tests and code quality

All commands below are from the **root** `package.json` `scripts` section.

| Script | What it runs |
|--------|----------------|
| `yarn test` | `vitest` (same as `test:app`). |
| `yarn test:app` | `vitest`. |
| `yarn test:all` | `test:typecheck` + `test:code` + `test:other` + `test:app --watch=false`. |
| `yarn test:typecheck` | `tsc`. |
| `yarn test:code` | ESLint on `.js,.ts,.tsx`. |
| `yarn test:other` | Prettier `--list-different` (via `yarn prettier …`). |
| `yarn test:coverage` | `vitest --coverage`. |
| `yarn test:update` | `vitest` with snapshot update, `--watch=false`. |
| `yarn fix` | `fix:other` then `fix:code`. |
| `yarn fix:other` | Prettier `--write`. |
| `yarn fix:code` | ESLint with `--fix`. |

Vitest configuration: `vitest.config.mts` at repo root.

## Builds

| Script | Purpose |
|--------|---------|
| `yarn build` | Full app build under `excalidraw-app` (`yarn --cwd ./excalidraw-app build`). |
| `yarn build:app` | `excalidraw-app` production Vite build only. |
| `yarn build:packages` | Builds `common` → `math` → `element` → `excalidraw` ESM bundles. |
| `yarn build:common` / `build:math` / `build:element` / `yarn build:excalidraw` | Individual package builds. |
| `yarn build:preview` | App build then Vite preview (`excalidraw-app`). |
| `yarn build:app:docker` | Docker-oriented app build script at root (delegates to `excalidraw-app`). |
| `yarn rm:build` | Removes app and package build output trees (`rimraf` globs in root `package.json`). |
| `yarn clean-install` | `yarn rm:node_modules && yarn install`. |

Production static preview in `excalidraw-app`: after `yarn build`, `yarn --cwd ./excalidraw-app serve` serves `build` on **localhost:5001** (`excalidraw-app/package.json` `serve` script).

## CI parity (optional)

What runs in GitHub Actions (no secrets described here):

- **Push to `master`**: `.github/workflows/test.yml` — `yarn install`, `yarn test:app`.
- **Pull requests**: `.github/workflows/lint.yml` — `yarn install`, `yarn test:other`, `yarn test:code`, `yarn test:typecheck`.

Other workflows exist under `.github/workflows/` (coverage PR, size limit, Docker, etc.); open those files for exact triggers and steps.

## Related documentation

- [`docs/memory/techContext.md`](../memory/techContext.md) — versions, aliases, and command reference.
- [`docs/memory/activeContext.md`](../memory/activeContext.md) — CI expectations and suggested first files when debugging.
