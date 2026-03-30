# Developer Setup Guide

## 1. Prerequisites

- **Node.js:** `>=18.0.0` (`engines` in `package.json`, `excalidraw-app/package.json`).
- **Package manager:** Yarn **1.22.22** (`packageManager` in `package.json`). Install [Yarn Classic](https://classic.yarnpkg.com/) matching that major version.
- **Git:** Required for clone and PR workflow (not version-pinned in repo).
- **Docker / Docker Compose (optional):** `Dockerfile` and `docker-compose.yml` exist at repo root for containerized run/build.
- **README with setup instructions at repo root:** Not found in code.

## 2. Clone Repository

```bash
git clone <repo-url>
cd <project-folder>
```

- A `repository` URL appears in `packages/excalidraw/package.json` as `https://github.com/excalidraw/excalidraw`. Use your actual remote (fork or course repo) in place of `<repo-url>`.

## 3. Install Dependencies

From the **repository root** (where the root `package.json` and `yarn.lock` live):

```bash
yarn install
```

- Workspaces: `excalidraw-app`, `packages/*`, `examples/*` (`package.json`).
- Yarn settings: `.npmrc` (`save-exact=true`, `legacy-peer-deps=true`).

## 4. Environment Setup

- **Vite env directory:** `excalidraw-app/vite.config.mts` sets `envDir: "../"`, so env files are loaded from the **repository root** (parent of `excalidraw-app/`).
- **Committed examples:** `.env.development` and `.env.production` exist at the repo root (see `.gitignore` for optional overrides like `.env.local`, `.env.development.local`).
- **Typed variable list:** `excalidraw-app/vite-env.d.ts` declares `ImportMetaEnv` keys (e.g. `VITE_APP_PORT`, `VITE_APP_BACKEND_V2_GET_URL`, `VITE_APP_WS_SERVER_URL`, `VITE_APP_FIREBASE_CONFIG`, `VITE_APP_DISABLE_SENTRY`, `VITE_APP_ENABLE_ESLINT`, `VITE_APP_ENABLE_PWA`, `VITE_APP_GIT_SHA`, and others).
- **Runtime usage examples:** `excalidraw-app/data/index.ts`, `excalidraw-app/data/firebase.ts`, `excalidraw-app/sentry.ts`, `excalidraw-app/index.tsx` read `import.meta.env.*`.
- **`.env.example`:** Not found in code.

**Optional local overrides**

- `.gitignore` lists `.env.local`, `.env.development.local`, etc., for local-only values (see comments in `.env.development`).

## 5. Running the Project

### Root `package.json` scripts

| Script | Command (from repo root) | What it runs (from `package.json`) |
|--------|---------------------------|-------------------------------------|
| Main dev server | `yarn start` | `yarn --cwd ./excalidraw-app start` |
| Production-like local | `yarn start:production` | `yarn --cwd ./excalidraw-app start:production` |
| Browser example | `yarn start:example` | `yarn build:packages && yarn --cwd ./examples/with-script-in-browser start` |
| Build app | `yarn build` | `yarn --cwd ./excalidraw-app build` |
| Build + preview | `yarn build:preview` | `yarn --cwd ./excalidraw-app build:preview` |
| Build packages only | `yarn build:packages` | `build:common`, `build:math`, `build:element`, `build:excalidraw` |

### `excalidraw-app/package.json` scripts

| Script | Command (from `excalidraw-app`) | Notes from `package.json` / config |
|--------|----------------------------------|-------------------------------------|
| Dev | `yarn start` | Runs `yarn && vite` (installs deps in app workspace, then Vite). |
| Production serve | `yarn start:production` | `yarn build && yarn serve` |
| Serve static build | `yarn serve` | `npx http-server build -a localhost -p 5001 -o` |
| Build | `yarn build` | `yarn build:app && yarn build:version` |
| Preview | `yarn build:preview` | `yarn build && vite preview --port 5000` |
| Docker-oriented build | `yarn build:app:docker` | `cross-env VITE_APP_DISABLE_SENTRY=true vite build` |

### Dev server port

- `excalidraw-app/vite.config.mts`: `server.port` is `Number(envVars.VITE_APP_PORT || 3000)`.
- Root `.env.development` sets `VITE_APP_PORT=3001` (adjust locally if needed).

### Examples (separate workspaces)

- `examples/with-script-in-browser/package.json`: `yarn start` → `vite`; `yarn preview` → `vite preview --port 5002`.
- `examples/with-nextjs/package.json`: `yarn dev` → `yarn build:workspace && next dev -p 3005`; `yarn start` → `next start -p 3006`.

**Note:** There is no root script named `dev`; use `yarn start` for the main app.

## 6. Project Structure Overview (Short)

- **`excalidraw-app/`** — Vite host app, collaboration, Firebase, wrappers around the editor (`excalidraw-app/App.tsx`, `excalidraw-app/vite.config.mts`).
- **`packages/excalidraw/`** — Core React editor (`packages/excalidraw/components/App.tsx`, `packages/excalidraw/index.tsx`).
- **`packages/element/`**, **`packages/math/`**, **`packages/common/`**, **`packages/utils/`** — Shared libraries consumed by the editor.
- **`examples/`** — Embed demos (`with-script-in-browser`, `with-nextjs`).
- **`public/`** — Static assets; Vite `publicDir` points here from `excalidraw-app/vite.config.mts` (`publicDir: "../public"`).
- **`scripts/`** — Build/release and tooling scripts referenced by root `package.json`.

## 7. Development Workflow

- **Branch creation / naming / Git flow:** Not found in code (no `CONTRIBUTING.md` in repo).
- **PR title check:** `.github/workflows/semantic-pr-title.yml` runs `amannn/action-semantic-pull-request@v5` on pull requests (exact title rules come from that action; not duplicated in this repo).
- **CI checks relevant to local workflow:**
  - **Lint workflow** (`.github/workflows/lint.yml`, on `pull_request`): `yarn install`, `yarn test:other`, `yarn test:code`, `yarn test:typecheck`.
  - **Tests workflow** (`.github/workflows/test.yml`, on push to `master`): `yarn install`, `yarn test:app`.
- **Pre-commit hook:** `.husky/pre-commit` exists; its body is a commented `# yarn lint-staged` only — **no active command** unless you uncomment or extend it.
- **Lint-staged config:** `.lintstagedrc.js` defines ESLint/Prettier on staged files (used if you run `lint-staged` manually or wire husky).

## 8. Making Changes

- **Editor / UI logic:** `packages/excalidraw/` (components, actions, renderer).
- **App-specific integrations (collab, export, hosting):** `excalidraw-app/`.
- **Shared element/math utilities:** `packages/element/`, `packages/math/`, `packages/common/`, `packages/utils/`.
- **Verify locally:**
  - Run the app: `yarn start` from repo root (or `yarn start` inside `excalidraw-app/`).
  - Run tests: `yarn test` or `yarn test:app` from root (`vitest.config.mts`, `setupTests.ts`).
  - Match CI: `yarn test:other && yarn test:code && yarn test:typecheck` (see `.github/workflows/lint.yml`).

## 9. Running Tests

From **repository root** (`package.json`):

```bash
yarn test
```

```bash
yarn test:app
```

```bash
yarn test:all
```

```bash
yarn test:typecheck
```

```bash
yarn test:code
```

```bash
yarn test:other
```

```bash
yarn test:update
```

```bash
yarn test:coverage
```

```bash
yarn test:coverage:watch
```

```bash
yarn test:ui
```

- **Vitest config:** `vitest.config.mts` (aliases, `setupFiles: ["./setupTests.ts"]`, `environment: "jsdom"`).
- **Tests not found in code:** N/A — Vitest is configured and scripts exist.

## 10. Linting & Formatting

```bash
yarn test:code
```

```bash
yarn fix:code
```

```bash
yarn test:other
```

*(Runs `yarn prettier --list-different` per root `package.json`.)*

- **ESLint:** Root `.eslintrc.json` extends `@excalidraw/eslint-config` and `react-app`; package-level `.eslintrc.json` in `packages/common/` and `packages/element/`. Ignore rules: `.eslintignore`.
- **Prettier:** `package.json` field `"prettier": "@excalidraw/prettier-config"`; CLI via `yarn prettier` script in root `package.json` (file glob and `--ignore-path=.eslintignore`).
- **Dev overlay ESLint:** `excalidraw-app/vite.config.mts` — `vite-plugin-checker` runs ESLint unless `VITE_APP_ENABLE_ESLINT === "false"`.

```bash
yarn fix:other
```

```bash
yarn fix
```

## 11. Build & Production

### Main app build (root)

```bash
yarn build
```

- Delegates to `excalidraw-app`: `yarn build` → `yarn build:app && yarn build:version` (`excalidraw-app/package.json`).
- **Output directory:** `excalidraw-app/vite.config.mts` sets `build.outDir: "build"` → artifact at `excalidraw-app/build/`.

### Package libraries

```bash
yarn build:packages
```

- Produces outputs under each package’s build output as defined in their `package.json` `build:esm` scripts (e.g. `packages/excalidraw`, `packages/element`).

### Docker

```bash
docker build -t excalidraw .
```

- **Dockerfile:** Node `18` build stage, `yarn build:app:docker`, copies `excalidraw-app/build` to nginx image.
- **Compose:** `docker-compose.yml` builds the same image and maps port `3000:80`.

### Clean artifacts

```bash
yarn rm:build
```

```bash
yarn clean-install
```

## 12. Creating a Pull Request

1. **Commit** your changes with Git (message conventions: not defined in repo beyond semantic PR title workflow).
2. **Push** your branch to your remote.
3. **Open a PR** on GitHub; the repository may populate `.github/PULL_REQUEST_TEMPLATE.md` (current template content is workshop-specific — see file).
4. **Automated checks** (from `.github/workflows/`): e.g. `lint.yml` on `pull_request`, `semantic-pr-title.yml` on PR events. Exact list of all workflows: see `.github/workflows/` directory.

**Detailed “how to open a PR” policy beyond the above:** Not found in code.

## 13. Troubleshooting

- **Node version:** Use Node `>=18` per `package.json` / `excalidraw-app/package.json` `engines`.
- **Env file location:** If Vite does not pick up variables, confirm files are at **repo root** (`envDir: "../"` in `excalidraw-app/vite.config.mts`).
- **Firebase config parse errors:** `excalidraw-app/data/firebase.ts` wraps `JSON.parse(import.meta.env.VITE_APP_FIREBASE_CONFIG)` in try/catch and falls back to `{}` with a console warning if invalid.
- **Collaboration / WebSocket:** `.env.development` points `VITE_APP_WS_SERVER_URL` to `http://localhost:3002` with a comment referencing `excalidraw-room` — ensure a compatible server is running if you need collab locally.
- **Husky / pre-commit:** `.husky/pre-commit` does not run `lint-staged` until uncommented or replaced.
- **Cross-platform env in builds:** `excalidraw-app` build scripts use `cross-env` (available via workspace dependencies such as `packages/excalidraw/package.json`).

**Curated FAQ beyond these file-backed notes:** Not found in code.
