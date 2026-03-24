# Technology context

## Runtime and tooling

| Item | Source of truth |
|------|----------------|
| **Node.js** | `engines.node`: `>=18.0.0` in root `package.json` and `excalidraw-app/package.json`. |
| **Package manager** | `packageManager`: `yarn@1.22.22` (root `package.json`). |
| **Monorepo** | Yarn **workspaces**: `excalidraw-app`, `packages/*`, `examples/*` (root `package.json`). |

## Core versions (verified from `package.json` files)

| Technology | Version / constraint | Where |
|------------|----------------------|--------|
| **TypeScript** | `5.9.3` | Root `devDependencies`. |
| **Vite** | `5.0.12` | Root `devDependencies` (tooling for app / dev). |
| **React** | `19.0.0` | `excalidraw-app` `dependencies`. |
| **React DOM** | `19.0.0` | `excalidraw-app` `dependencies`. |
| **Vitest** | `3.0.6` | Root `devDependencies` (`test:app`). |
| **@vitejs/plugin-react** | `3.1.0` | Root `devDependencies`. |
| **ESLint** stack | e.g. `eslint-config-react-app` `7.0.1`, `@excalidraw/eslint-config` `1.0.3` | Root `devDependencies`. |
| **Prettier** | `2.6.2` + `@excalidraw/prettier-config` `1.0.2` | Root `devDependencies`. |
| **Husky** | `7.0.4` | Root `devDependencies`; `prepare` runs `husky install`. |

## Library package versions (workspace)

- **`@excalidraw/excalidraw`**, **`@excalidraw/common`**, **`@excalidraw/element`**, **`@excalidraw/math`**: **`0.18.0`** — each package’s `version` in the corresponding `packages/*/package.json`.
- **`@excalidraw/utils`**: **`0.1.2`** — `packages/utils/package.json`.

## Notable app-only dependencies (`excalidraw-app/package.json`)

- **Firebase** `11.3.1`, **Socket.IO client** `4.7.2`, **Sentry** `@sentry/browser` `9.0.1`, **Jotai** `2.11.0`, **idb-keyval** `6.0.3`, **i18next-browser-languagedetector** `6.1.4`, etc.

## Notable editor-package dependencies (`packages/excalidraw/package.json`)

- **Jotai** `2.11.0`, **jotai-scope** `0.7.2`, **Rough.js** `roughjs` `4.6.4`, **CodeMirror 6** (`@codemirror/*`), **Radix UI** `radix-ui` `1.4.3`, **tunnel-rat** `0.1.2`, workspace deps on `@excalidraw/common`, `@excalidraw/element`, `@excalidraw/math` at `0.18.0`.

## Commands (root `package.json` `scripts`)

### Development

- **`yarn start`** — `yarn --cwd ./excalidraw-app start` (Vite dev server for the app).
- **`yarn start:example`** — `yarn build:packages` then `examples/with-script-in-browser` `start`.
- **`yarn start:production`** — `excalidraw-app` `start:production` (build + static serve).

### Build

- **`yarn build`** — `excalidraw-app` full `build` (`build:app` + `build:version`).
- **`yarn build:packages`** — `build:common` → `build:math` → `build:element` → `build:excalidraw`.
- **`yarn build:app`** / **`yarn build:app:docker`** — delegate to `excalidraw-app` scripts.
- **`yarn rm:build`** / **`yarn rm:node_modules`** — clean artifacts or dependencies (see script bodies in root `package.json`).

### Quality

- **`yarn test`** / **`yarn test:app`** — `vitest`.
- **`yarn test:all`** — typecheck + eslint + prettier check + vitest non-watch.
- **`yarn test:typecheck`** — `tsc`.
- **`yarn test:code`** — ESLint on `.js,.ts,.tsx`.
- **`yarn test:other`** — Prettier `--list-different` on configured globs.
- **`yarn fix`** — Prettier write + ESLint fix.

### Other

- **`yarn release`** / **`yarn release:*`** — `scripts/release.js` with tag options.
- **`yarn locales-coverage`** — `scripts/build-locales-coverage.js`.

## Details

- For detailed architecture → see [docs/technical/architecture.md](../technical/architecture.md)
- For domain glossary → see [docs/product/domain-glossary.md](../product/domain-glossary.md)
