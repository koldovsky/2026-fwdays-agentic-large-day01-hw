# Technical context

Verified against repository sources (root `package.json`, `tsconfig.json`, `vitest.config.mts`, `excalidraw-app/package.json`, `excalidraw-app/vite.config.mts`, `Dockerfile`, `docker-compose.yml`, `vercel.json`, `.github/workflows/*`).

## Project shape

- **Monorepo name**: `excalidraw-monorepo` (private).
- **Package manager**: Yarn **1.22.22** (`packageManager` in root `package.json`).
- **Workspaces**: `excalidraw-app`, `packages/*`, `examples/*`.
- **Runtime requirement**: Node **>= 18.0.0** (`engines` in root and `excalidraw-app/package.json`). CI uses Node **20.x**.

## Core stack

- **Language**: TypeScript **5.9.3** (`strict`, `jsx: react-jsx`, `module`/`target` ESNext; root `tsconfig.json`).
- **UI**: React **19.0.0** + React DOM **19.0.0** (`excalidraw-app/package.json`).
- **App bundler / dev server**: Vite **5.0.12** with `@vitejs/plugin-react` (`excalidraw-app/vite.config.mts`).
- **State**: Jotai **2.11.0** in the web app; additional Jotai usage inside `@excalidraw/excalidraw` (`packages/excalidraw/package.json`).
- **Styling / UI libs (library package)**: Sass, Radix UI, CodeMirror 6, RoughJS, and others as declared in `packages/excalidraw/package.json`.

## Internal packages

Published-style workspace libraries under `packages/` (path aliases in root `tsconfig.json`):

- `@excalidraw/common`, `@excalidraw/element`, `@excalidraw/math`, `@excalidraw/utils`, `@excalidraw/excalidraw`.

Library builds use scripts like `build:esm` (e.g. `rimraf dist && node ../../scripts/buildPackage.js` plus type generation for `@excalidraw/excalidraw`).

## Web app integrations

From `excalidraw-app/package.json` and config:

- **Error reporting**: `@sentry/browser` (docker build disables Sentry via `VITE_APP_DISABLE_SENTRY=true`).
- **Backend / sync**: Firebase **11.3.1**, `socket.io-client` **4.7.2**.
- **Storage / i18n helpers**: `idb-keyval`, `i18next-browser-languagedetector`.
- **Vite plugins (app)**: SVGR, EJS, PWA (`vite-plugin-pwa`), `vite-plugin-checker`, `vite-plugin-html`, sitemap plugin, custom woff2 handling (`scripts/woff2/woff2-vite-plugins`).
- **Dev server port**: `VITE_APP_PORT` or default **3000** (`excalidraw-app/vite.config.mts`); **`.env` files are loaded from the repo root** (`envDir: "../"`).
- **Production build output**: `excalidraw-app/build` (`build.outDir` in Vite config; matches `vercel.json` `outputDirectory`).

## Testing and quality

- **Unit / integration tests**: Vitest **3.0.6** with **`vitest.config.mts`** at repo root.
- **Test environment**: `jsdom`; **`setupTests.ts`**; Vitest **globals** enabled; path aliases mirror `tsconfig` (`@excalidraw/*` → `packages/...`).
- **Coverage**: `@vitest/coverage-v8`; reporters and thresholds defined in `vitest.config.mts` (e.g. lines/branches/functions/statements thresholds).
- **Lint**: ESLint with `eslint --max-warnings=0 --ext .js,.ts,.tsx .` (`test:code` script).
- **Format**: Prettier via shared `@excalidraw/prettier-config`; `prettier` script covers `**/*.{css,scss,json,md,html,yml}` with `.eslintignore` as ignore path.
- **Git hooks**: `husky` (`prepare`: `husky install`); `lint-staged` present for staged workflows.

## Tooling (dev / repo maintenance)

- **Repomix** for codebase bundling (`repomix` in root devDependencies).
- **Crowdin**: `crowdin.yml` at repo root (localization workflow).
- **Firebase project assets**: `firebase-project/firebase.json` (Firestore, Storage rules/indexes paths).

## Deployment and containers

- **Vercel**: `vercel.json` sets `outputDirectory` to `excalidraw-app/build`, `installCommand` `yarn install`, plus headers/redirects.
- **Docker**: multi-stage image — **Node 18** build stage runs `yarn` then `yarn build:app:docker`; final stage **nginx:1.27-alpine** serves `excalidraw-app/build` (`Dockerfile`).
- **Docker Compose**: service `excalidraw` builds from `.`, maps host **3000** → container **80**, bind-mounts repo with a named volume for `node_modules` (`docker-compose.yml`).

## CI (GitHub Actions)

Representative workflows under `.github/workflows/`:

- **Tests** (`test.yml`, push to `master`): `yarn install`, `yarn test:app`.
- **Lint** (`lint.yml`, PRs): `yarn install`, `yarn test:other`, `yarn test:code`, `yarn test:typecheck`.
- Additional workflows exist for coverage, size limits, Docker builds, locales, Sentry, release automation, etc. (see same directory).

---

## Commands reference (Yarn scripts)

Run from **repository root** unless noted.

### Install and cleanup

- `yarn install` — install workspace dependencies.
- `yarn clean-install` — remove root and workspace `node_modules`, then install.
- `yarn rm:build` — remove common build output dirs (`excalidraw-app/build|dist|dev-dist`, `packages/*/dist|build`, `examples/*/build|dist`).
- `yarn rm:node_modules` — remove root and workspace `node_modules`.

### Develop and run

- `yarn start` — `yarn --cwd ./excalidraw-app start` (installs in app workspace, then `vite`).
- `yarn start:production` — app `build` then `serve` (static server on localhost **5001** per `excalidraw-app/package.json`).
- `yarn start:example` — `yarn build:packages` then start `examples/with-script-in-browser`.
- `yarn build:preview` — app production build then `vite preview` on port **5000**.

### Build

- `yarn build` — full app build in `excalidraw-app` (`build:app` + `build:version`).
- `yarn build:app` — production Vite build with tracking env vars set for Vercel.
- `yarn build:app:docker` — Vite build with Sentry disabled (used in `Dockerfile`).
- `yarn build:packages` — `build:common`, `build:math`, `build:element`, `build:excalidraw` in order.
- `yarn build-node` — `node ./scripts/build-node.js` (root; mirrored in app).

### Test and fix

- `yarn test` / `yarn test:app` — Vitest (root config).
- `yarn test:all` — typecheck + eslint + prettier check + `test:app --watch=false`.
- `yarn test:typecheck` — `tsc` (root `tsconfig.json`).
- `yarn test:code` — ESLint.
- `yarn test:other` — Prettier `--list-different`.
- `yarn test:coverage` / `yarn test:coverage:watch` — Vitest with coverage.
- `yarn test:ui` — Vitest UI with coverage enabled.
- `yarn test:update` — update snapshots, no watch.
- `yarn fix` — Prettier write + ESLint fix.
- `yarn fix:code` / `yarn fix:other` — ESLint fix / Prettier write only.

### Locales and release

- `yarn locales-coverage` — `node scripts/build-locales-coverage.js`.
- `yarn locales-coverage:description` — `node scripts/locales-coverage-description.js`.
- `yarn release` / `yarn release:test` / `yarn release:next` / `yarn release:latest` — `node scripts/release.js` with optional `--tag`.

### Docker (direct)

- `docker build -t excalidraw .` — as used in `build-docker.yml` (build context: repo root).
