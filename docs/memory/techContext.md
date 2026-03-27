# Tech context

Verified against root `package.json`, `excalidraw-app/package.json`, workspace `packages/*/package.json`, `tsconfig.json`, `vitest.config.mts`, and `excalidraw-app/vite.config.mts`.

## Runtime requirements

- **Node.js**: `>=18.0.0` (`engines` in root and `excalidraw-app`).
- **Package manager**: **Yarn 1** — `packageManager`: `yarn@1.22.22` (classic workspaces).

## Monorepo layout

- **Workspaces** (root `package.json`): `excalidraw-app`, `packages/*`, `examples/*`.
- **Published-style packages** (version `0.18.0` unless noted): `@excalidraw/common`, `@excalidraw/math`, `@excalidraw/element`, `@excalidraw/excalidraw`; `@excalidraw/utils` is `0.1.2`.

## Core stack

| Layer | Technology | Notes (from repo) |
|-------|------------|-------------------|
| UI | **React 19** (`react` / `react-dom` `19.0.0` in app) | Library peer range in `packages/excalidraw/package.json`: `^17 \|\| ^18 \|\| ^19`. |
| Language | **TypeScript** `5.9.3` | Root devDependency; `strict` in `tsconfig.json`. |
| App bundler | **Vite** `5.0.12` | `excalidraw-app` dev/build; `outDir`: `build`. |
| Tests | **Vitest** `3.0.6` | `vitest.config.mts` at repo root; `environment: "jsdom"`. |
| Lint / format | **ESLint**, **Prettier** | Scripts `test:code`, `test:other`; shared `@excalidraw/eslint-config` / `@excalidraw/prettier-config`. |

## Library package builds

- **`@excalidraw/excalidraw`**: `build:esm` runs `scripts/buildPackage.js` (uses **esbuild** `0.19.10` + **esbuild-sass-plugin**) then `gen:types`.
- **`common`**, **`element`**, **`math`**: `build:esm` via `scripts/buildBase.js` (per package scripts).
- **`utils`**: `build:esm` via `scripts/buildUtils.js`.

## excalidraw-app–specific dependencies

From `excalidraw-app/package.json`:

- **State**: `jotai` `2.11.0`
- **Realtime collab client**: `socket.io-client` `4.7.2`
- **Backend SDK**: `firebase` `11.3.1`
- **Errors**: `@sentry/browser` `9.0.1`
- **Storage**: `idb-keyval` `6.0.3`
- **i18n detection**: `i18next-browser-languagedetector` `6.1.4`

## Vite plugins (app)

From `excalidraw-app/vite.config.mts` imports: `@vitejs/plugin-react`, `vite-plugin-svgr`, `vite-plugin-ejs`, `vite-plugin-pwa`, `vite-plugin-checker`, `vite-plugin-html`, `vite-plugin-sitemap`, plus repo `scripts/woff2/woff2-vite-plugins`.

## Path aliases

`tsconfig.json` and `vitest.config.mts` (and Vite in `excalidraw-app`) map:

- `@excalidraw/common` → `packages/common/src`
- `@excalidraw/math` → `packages/math/src`
- `@excalidraw/element` → `packages/element/src`
- `@excalidraw/utils` → `packages/utils/src`
- `@excalidraw/excalidraw` → `packages/excalidraw` (entry `index.tsx`)

## Common commands (root `scripts`)

| Command | Purpose |
|---------|---------|
| `yarn install` | Install all workspaces. |
| `yarn start` | Dev server: `yarn --cwd ./excalidraw-app start` (Vite). |
| `yarn build` | App production build under `excalidraw-app`. |
| `yarn build:packages` | `build:common` → `build:math` → `build:element` → `build:excalidraw`. |
| `yarn test` / `yarn test:app` | Vitest (default watch behavior per Vitest). |
| `yarn test:all` | typecheck + eslint + prettier + `test:app --watch=false`. |
| `yarn test:typecheck` | `tsc` (project references paths above). |
| `yarn test:code` | ESLint on `.js,.ts,.tsx`. |
| `yarn fix` | Prettier write + ESLint fix. |
| `yarn start:example` | Build packages then Vite example in `examples/with-script-in-browser`. |
| `yarn clean-install` | Remove `node_modules` trees and reinstall. |
| `yarn rm:build` | Rimraf app and package build outputs. |

## Environment / ports

- Vite server port: from `VITE_APP_PORT` or default **3000** (`excalidraw-app/vite.config.mts`).
- `envDir` for Vite is the **repository parent** (`../` from config file) so env files live at monorepo root.

## CI / tooling (pointer)

- `.github/workflows/` includes jobs such as `size-limit.yml`, `sentry-production.yml` (verify locally as needed).
