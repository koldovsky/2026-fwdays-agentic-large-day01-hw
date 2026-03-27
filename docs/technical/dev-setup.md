# Developer Setup

Grounded in: `package.json` (root + `excalidraw-app`), `excalidraw-app/vite.config.mts`, `vitest.config.mts`, `tsconfig.json`, `.env.development`, `.env.production`, `.github/workflows/`, `.husky/`.

---

## 1. Prerequisites

| Tool | Required version | Source |
|---|---|---|
| **Node.js** | `>=18.0.0` (CI uses `20.x`) | `package.json` `engines`, `.github/workflows/lint.yml` |
| **Yarn** | `1.22.22` (Yarn Classic) | `package.json` `packageManager` |
| Git | any | for `husky` pre-commit hooks |

No `.nvmrc` or `.node-version` file exists. Use your system Node manager (e.g., `nvm install 20`) to match the CI version.

**Do not use npm or pnpm** — the workspace is configured for Yarn 1 workspaces. Running `npm install` will produce incorrect lock files.

---

## 2. Initial Setup

```bash
# Clone the repository
git clone https://github.com/excalidraw/excalidraw.git
cd excalidraw

# Install all workspace dependencies (root + all packages + excalidraw-app)
yarn install
```

`yarn install` at the root installs dependencies for all workspaces:
- `excalidraw-app/`
- `packages/common`, `packages/element`, `packages/excalidraw`, `packages/math`, `packages/utils`
- `examples/with-nextjs`, `examples/with-script-in-browser`

It also runs `husky install` via the `prepare` lifecycle hook, setting up the pre-commit hook at `.husky/pre-commit` (runs `yarn lint-staged`).

---

## 3. Running the Development Server

```bash
# Start the excalidraw-app dev server (Vite)
yarn start
```

This runs `vite` inside `excalidraw-app/`. The dev server:
- Reads env vars from `.env.development` at the **repository root** (not inside `excalidraw-app/`) — `envDir: "../"` in `vite.config.mts`
- Defaults to port **3001** (`VITE_APP_PORT=3001` in `.env.development`)
- Opens the browser automatically (`open: true`)
- Uses **path aliases** that point directly to TypeScript source in `packages/*/src/` — package builds are **not** required for the dev server

```bash
# Production preview (builds first, then serves)
yarn start:production
```

---

## 4. Environment / Config Files

### Location

All `.env.*` files live at the **repository root** (not inside `excalidraw-app/`). Vite is configured with `envDir: "../"` to read them from there.

| File | Purpose | Committed |
|---|---|---|
| `.env.development` | Dev defaults (local Firebase project, `localhost` backends) | Yes |
| `.env.production` | Production URLs (excalidraw.com Firebase, deployed backends) | Yes |
| `.env.development.local` | Personal overrides for development — not committed | No (.gitignore) |
| `.env.production.local` | Personal overrides for production builds — not committed | No |
| `.env.local` | Overrides for all modes — not committed | No |
| `.env.test.local` | Overrides for test mode — not committed | No |

### Key variables in `.env.development`

| Variable | Default value | Purpose |
|---|---|---|
| `VITE_APP_PORT` | `3001` | Dev server port |
| `VITE_APP_BACKEND_V2_GET_URL` | `https://json-dev.excalidraw.com/api/v2/` | Scene load endpoint |
| `VITE_APP_BACKEND_V2_POST_URL` | `https://json-dev.excalidraw.com/api/v2/post/` | Scene save endpoint |
| `VITE_APP_WS_SERVER_URL` | `http://localhost:3002` | Collaboration WebSocket |
| `VITE_APP_AI_BACKEND` | `http://localhost:3016` | AI diagram generation |
| `VITE_APP_FIREBASE_CONFIG` | OSS dev Firebase project JSON | Firebase config |
| `VITE_APP_ENABLE_ESLINT` | `true` | ESLint in Vite checker plugin |
| `VITE_APP_COLLAPSE_OVERLAY` | `true` | Vite error overlay starts collapsed |
| `VITE_APP_ENABLE_PWA` | `false` | PWA service worker disabled in dev |
| `VITE_APP_DEV_DISABLE_LIVE_RELOAD` | (empty) | Set to `true` to disable HMR for Service Worker debugging |
| `FAST_REFRESH` | `false` | React Fast Refresh |

**Collaboration WebSocket**: the default `.env.development` points `VITE_APP_WS_SERVER_URL` to `localhost:3002`. To use real-time collaboration locally, run the [excalidraw-room](https://github.com/excalidraw/excalidraw-room) server separately. No setup instructions for this server are present in this repository.

**AI backend**: `localhost:3016` in development. The AI service is not included in this repository; collaboration and AI features will not work without a running backend.

**Firebase**: `.env.development` includes the `excalidraw-oss-dev` Firebase project credentials. This is a shared dev project, so no extra Firebase setup is normally required for read/write of persisted scenes.

---

## 5. Build Commands

### App build

```bash
# Build excalidraw-app for production (output: excalidraw-app/build/)
yarn build:app

# Build for Docker (Sentry disabled)
yarn build:app:docker

# Build app + write version.json
yarn build
```

`build:app` injects `VITE_APP_GIT_SHA=$VERCEL_GIT_COMMIT_SHA` and enables tracking. For a local production build without these env vars, `build:app:docker` is the safer option.

### Package builds (library only)

The dev server does **not** require pre-built packages (aliases point to source). Package builds are only needed before publishing or when testing the package as a consumer would.

```bash
# Build all packages in dependency order
yarn build:packages
# Which expands to:
yarn build:common && yarn build:math && yarn build:element && yarn build:excalidraw
```

Individual package builds:

```bash
yarn build:common       # @excalidraw/common
yarn build:math         # @excalidraw/math
yarn build:element      # @excalidraw/element
yarn build:excalidraw   # @excalidraw/excalidraw (depends on the three above)
```

### Clean

```bash
# Remove all build artifacts
yarn rm:build

# Remove all node_modules
yarn rm:node_modules

# Full clean reinstall
yarn clean-install
```

---

## 6. Testing

All tests run with **Vitest** (`vitest.config.mts` at the repository root). The test environment is `jsdom`. Tests use `vitest-canvas-mock` to stub the Canvas API and `fake-indexeddb/auto` for IndexedDB.

```bash
# Run tests in watch mode (default)
yarn test

# Run tests once (CI mode)
yarn test:app --watch=false

# Run with coverage
yarn test:coverage

# Update snapshots
yarn test:update

# Run tests + Vitest UI (browser-based)
yarn test:ui
```

Coverage thresholds (from `vitest.config.mts`):

| Metric | Threshold |
|---|---|
| Lines | 60% |
| Branches | 70% |
| Functions | 63% |
| Statements | 60% |

### Full CI check suite

```bash
# TypeScript type-check + ESLint + Prettier + Vitest (in that order)
yarn test:all
```

This is what the CI `lint` workflow runs:

```bash
yarn test:other     # Prettier format check
yarn test:code      # ESLint (--max-warnings=0)
yarn test:typecheck # tsc --noEmit
```

---

## 7. Linting and Formatting

```bash
# ESLint check (zero warnings allowed in CI)
yarn test:code

# ESLint auto-fix
yarn fix:code

# Prettier check (CSS, SCSS, JSON, Markdown, HTML, YAML)
yarn test:other

# Prettier auto-fix
yarn fix:other

# Both fixes at once
yarn fix
```

**Pre-commit hook**: `.husky/pre-commit` runs `yarn lint-staged` on staged files before every commit.

TypeScript configuration is at `tsconfig.json` (root). `"strict": true` is enabled. `"moduleResolution": "node"` is used for the dev/test environment — **note**: the published package requires `"bundler"` or `"node16"` in consuming projects (see `CHANGELOG.md` 0.18.0 breaking changes).

---

## 8. WASM Assets (font subsetting)

Font subsetting for SVG export uses two WASM modules (`fonteditor-core/woff2.wasm` and `harfbuzzjs/hb-subset.wasm`). These are pre-converted to base64-encoded TypeScript files by `scripts/buildWasm.js`:

```
packages/excalidraw/fonts/wasm/woff2-wasm.ts
packages/excalidraw/fonts/wasm/hb-subset-wasm.ts
```

These files are committed to the repository. **You do not need to run `buildWasm.js` manually** unless you are updating the WASM dependencies. There is no `package.json` script for it — you would run `node scripts/buildWasm.js` directly if needed.

---

## 9. Examples

```bash
# Run the browser script example (builds packages first, then starts a static server)
yarn start:example
```

Examples are in `examples/with-script-in-browser` and `examples/with-nextjs`. The Next.js example has its own README.

---

## 10. Known Caveats and Gaps

- **No `.nvmrc`**: Node version is not pinned in a file. Refer to CI workflows (`node-version: 20.x`) as the reference.
- **Collaboration requires a separate server**: `VITE_APP_WS_SERVER_URL=localhost:3002` in dev, but `excalidraw-room` setup is not documented here.
- **AI features require a separate backend**: `VITE_APP_AI_BACKEND=localhost:3016` in dev; no setup instructions in this repo.
- **No Docker Compose for local dependencies**: Firebase credentials are included in `.env.development` for the shared OSS dev project; local Firebase emulator setup is not documented.
- **Package build order is required**: `@excalidraw/excalidraw` depends on `common`, `math`, and `element`. Running `build:excalidraw` before the others will fail; always use `yarn build:packages`.
- **ESLint runs in the Vite dev server**: Set `VITE_APP_ENABLE_ESLINT=false` in `.env.development.local` to disable it if it slows down development.
- **Unload dialog in dev**: Set `VITE_APP_DISABLE_PREVENT_UNLOAD=true` in `.env.development.local` to suppress the "leave page?" browser dialog during development.

---

## Details

For technology versions and stack → see [docs/memory/techContext.md](../memory/techContext.md)
For architecture → see [docs/technical/architecture.md](architecture.md)
