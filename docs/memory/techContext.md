# Tech context

## Platform & tooling

- **Node.js**: `>=18.0.0` (root and `excalidraw-app` `package.json`, `engines`).
- **Package manager**: Yarn **1.x** — `yarn@1.22.22` (`packageManager` in root `package.json`).
- **Workspaces**: `excalidraw-app`, `packages/*`, `examples/*` (root `package.json`, `workspaces`).

## Language & typing

- **TypeScript** **5.9.3** — root `devDependencies`; also listed in `packages/excalidraw/package.json` `devDependencies`.
- **Root `tsconfig.json`**: `strict`, `noEmit`, `jsx: react-jsx`, path aliases to `packages/*` (e.g. `@excalidraw/excalidraw` → `./packages/excalidraw/index.tsx`).
- **Typecheck**: `yarn test:typecheck` runs `tsc` (root `package.json` `scripts`).

## UI runtime (web app)

- **React** **19.0.0** / **react-dom** **19.0.0** (`excalidraw-app/package.json` `dependencies`).
- **State / UX**: **jotai** `2.11.0` (app and `@excalidraw/excalidraw` `dependencies`).
- **Peer API for embedders** (`@excalidraw/excalidraw`): `react` and `react-dom` peers `^17.0.2 || ^18.2.0 || ^19.0.0` (`packages/excalidraw/package.json`, `peerDependencies`).

## Build & bundling

- **Vite** **5.0.12** — root `devDependencies`; `excalidraw-app` scripts invoke `vite` / `vite build` / `vite preview` (`excalidraw-app/package.json` `scripts`).
- **Vite plugins (root devDependencies)**: `@vitejs/plugin-react` `3.1.0`, `vite-plugin-pwa` `0.21.1`, `vite-plugin-svgr` `4.2.0`, `vite-plugin-checker` `0.7.2`, `vite-plugin-ejs` `1.7.0`, etc.
- **Per-package `build:esm`** (each ends with `yarn gen:types`): `@excalidraw/common`, `math`, and `element` use `scripts/buildBase.js`; `@excalidraw/utils` uses `scripts/buildUtils.js`; **`@excalidraw/excalidraw`** uses `scripts/buildPackage.js` (`packages/*/package.json` `scripts`).
- Root **`build:packages`** runs only common → math → element → excalidraw — **not** `utils` (there is no `build:utils` in root `package.json`).
- **esbuild** **0.19.10** is declared in `@excalidraw/excalidraw` `devDependencies`; the build scripts `require("esbuild")` from the workspace install (same hoisted toolchain for all package builds).
- **App HTML post-step**: `build:version` runs `node ../scripts/build-version.js` after Vite build (`excalidraw-app/package.json`).

## Published package versions (workspace libraries)

| Package | Version (`package.json`) |
|---------|---------------------------|
| `@excalidraw/common` | `0.18.0` (`packages/common/package.json`) |
| `@excalidraw/element` | `0.18.0` (`packages/element/package.json`) |
| `@excalidraw/math` | `0.18.0` (`packages/math/package.json`) |
| `@excalidraw/excalidraw` | `0.18.0` (`packages/excalidraw/package.json`) |
| `@excalidraw/utils` | `0.1.2` (`packages/utils/package.json`) |

## App & services (`excalidraw-app` dependencies)

- **Firebase** `11.3.1`, **socket.io-client** `4.7.2`, **@sentry/browser** `9.0.1`, **idb-keyval** `6.0.3`, **i18next-browser-languagedetector** `6.1.4`, etc. — all from `excalidraw-app/package.json` `dependencies`.

## Drawing / editor stack (library)

- From `@excalidraw/excalidraw` `dependencies` (non-exhaustive): **roughjs** `4.6.4`, **perfect-freehand** `1.2.0`, **@codemirror/*** packages, **radix-ui** `1.4.3`, **sass** `1.51.0`, **pica** `7.1.1`, **browser-fs-access** `0.38.0`.

## Quality, tests, formatting

- **Vitest** **3.0.6**; **@vitest/coverage-v8** `3.0.7`; **vitest-canvas-mock** `0.3.3` — root `devDependencies`.
- **ESLint**: shared config `@excalidraw/eslint-config` `1.0.3`, `eslint-config-react-app` `7.0.1`, plugins — root `devDependencies`. `yarn test:code` runs ESLint on `.js,.ts,.tsx`.
- **Prettier** `2.6.2` with `@excalidraw/prettier-config` `1.0.2`.
- **Husky** `7.0.4` — `prepare` runs `husky install` (root `scripts`).

## Primary commands (root `package.json`)

| Command | Purpose |
|---------|---------|
| `yarn start` | Dev server for `excalidraw-app` (`vite`) |
| `yarn build` | App production build (`excalidraw-app`) |
| `yarn build:packages` | Build `common` → `math` → `element` → `excalidraw` ESM |
| `yarn test` / `yarn test:app` | Vitest |
| `yarn test:all` | `tsc` + eslint + prettier check + vitest once |
| `yarn test:typecheck` | `tsc` |
| `yarn test:code` | ESLint |
| `yarn fix` | Prettier write + ESLint fix |
| `yarn clean-install` | Runs `rm:node_modules` then `yarn install`; `rm:node_modules` clears root, `excalidraw-app`, and `packages/*` only (see glob in root `package.json` — not `examples/*/node_modules`) |

**App-only** (`excalidraw-app/package.json`): `start:production` → build then `http-server` on port 5001; `build:preview` → build then `vite preview` on 5000.

## Details

For detailed architecture and package dependency diagrams → see [`docs/technical/architecture.md`](../technical/architecture.md).
For full onboarding (clone to first PR) → see [`docs/technical/dev-setup.md`](../technical/dev-setup.md).

## Source verification

| Topic | Source files |
|-------|----------------|
| Yarn / Node / workspaces / root scripts | Root `package.json` |
| React, Firebase, Vite entry scripts | `excalidraw-app/package.json` |
| Library version, peers, esbuild, build script | `packages/excalidraw/package.json` |
| `@excalidraw/utils` version | `packages/utils/package.json` |
| TypeScript compiler options | `tsconfig.json` |
