# Tech context

## Package manager and monorepo

- **Yarn 1.x (Classic):** `packageManager: yarn@1.22.22` in the root `package.json`.
- **Workspaces:** `excalidraw-app`, `packages/*`, `examples/*` — same file.

## Runtime and language

- **Node.js:** `>=18.0.0` (root and `excalidraw-app`).
- **TypeScript:** `5.9.3` (root `devDependencies`).
- **JSX:** `react-jsx` (`packages/tsconfig.base.json`).

## Frontend stack (versions from manifests)

| Technology | Version (source) |
|------------|------------------|
| React / React DOM | `19.0.0` (`excalidraw-app/package.json`) |
| Vite | `5.0.12` (root `devDependencies`) |
| Vitest | `3.0.6` + `@vitest/coverage-v8` `3.0.7` (root) |
| ESLint / Prettier | `@excalidraw/eslint-config` `1.0.3`, `prettier` `2.6.2` (root) |

## Key `excalidraw-app` dependencies

- **State:** `jotai` `2.11.0`
- **Realtime / backend client:** `socket.io-client` `4.7.2`, `firebase` `11.3.1`
- **Observability / errors:** `@sentry/browser` `9.0.1`
- **Local storage:** `idb-keyval` `6.0.3`
- **HTML in build:** `vite-plugin-html` `3.2.2` (dependency in `excalidraw-app`)

## Library package builds

- `@excalidraw/excalidraw` `build:esm` runs `scripts/buildPackage.js` (esbuild + esbuild-sass-plugin, dev/prod bundles).
- `common`, `math`, `element` use `scripts/buildBase.js`; `utils` uses `scripts/buildUtils.js`. All include type generation.

## Commands (repository root)

| Command | Purpose |
|---------|---------|
| `yarn start` | Vite dev server for `excalidraw-app` |
| `yarn build` | Production build of the app (`excalidraw-app`) |
| `yarn build:packages` | Sequential build `common` → `math` → `element` → `excalidraw` |
| `yarn test` / `yarn test:app` | Vitest |
| `yarn test:all` | typecheck + eslint + prettier + app tests |
| `yarn test:typecheck` | `tsc` |
| `yarn test:code` | ESLint |
| `yarn start:example` | `build:packages` + `with-script-in-browser` example |
| `yarn clean-install` | remove `node_modules` + `yarn install` |

## Docker and Compose

- **`Dockerfile`:** multi-stage `node:18` → `yarn build:app:docker` → static assets on `nginx:1.27-alpine` (container serves via nginx).
- **`docker-compose.yml`:** `excalidraw` service, port `3000:80`, code mounted at `/opt/node_app/app`.

## Test configuration

- `vitest.config.mts`: `environment: jsdom`, `setupFiles: ./setupTests.ts`, `@excalidraw/*` aliases aligned with Vite.
- Root `tsconfig.json`: types `vitest/globals`, `@testing-library/jest-dom`.

## Sources in code

- Root `package.json` (scripts, devDependencies, engines, packageManager).
- `excalidraw-app/package.json` (dependencies, scripts).
- `vitest.config.mts`, `Dockerfile`, `docker-compose.yml`, `scripts/buildPackage.js`.
