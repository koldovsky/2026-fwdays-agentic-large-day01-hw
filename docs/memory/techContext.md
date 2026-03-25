# Tech context

## Related documentation

**Technical** (`docs/technical/`)

- **Architecture:** [`architecture.md`](../technical/architecture.md)
- **Dev setup:** [`dev-setup.md`](../technical/dev-setup.md)
- **Technical decision log** (implicit fragile behavior, engineer markers in code): [`decisionLog.md`](../technical/decisionLog.md)

**Product** (`docs/product/`)

- **Domain glossary:** [`domain-glossary.md`](../product/domain-glossary.md)
- **PRD:** [`PRD.md`](../product/PRD.md)

## Runtime and tooling

| Item | Value | Source |
| --- | --- | --- |
| **Node** | `>=18.0.0` | Root and `excalidraw-app` `package.json` → `engines` |
| **Package manager** | Yarn **1.22.22** (classic) | Root `package.json` → `packageManager` |
| **TypeScript** | **5.9.3** | Root `devDependencies` |
| **Bundler (app)** | Vite **5.0.12** | Root `devDependencies` |
| **Test runner** | Vitest **3.0.6** | Root `devDependencies` |
| **React (app)** | **19.0.0** | `excalidraw-app` `dependencies` |
| **Library peer React** | `^17 \|\| ^18 \|\| ^19` | `packages/excalidraw` `peerDependencies` |

## Monorepo workspaces

From root `package.json` → `workspaces`:

- `excalidraw-app` — Vite-hosted SPA, product shell.
- `packages/*` — `@excalidraw/common`, `@excalidraw/element`, `@excalidraw/math`, `@excalidraw/excalidraw`, `@excalidraw/utils`, etc.
- `examples/*` — integration demos.

## Published package versions (internal alignment)

- **`@excalidraw/excalidraw`:** `0.18.0` (`packages/excalidraw/package.json`).
- **`@excalidraw/common`, `@excalidraw/element`, `@excalidraw/math`:** `0.18.0` (each package’s `package.json`).

## Key application dependencies (`excalidraw-app`)

- **State:** `jotai@2.11.0`
- **Realtime:** `socket.io-client@4.7.2`
- **Backend SDK:** `firebase@11.3.1`
- **Monitoring:** `@sentry/browser@9.0.1`
- **Storage helper:** `idb-keyval@6.0.3`
- **i18n detection:** `i18next-browser-languagedetector@6.1.4`

_Source:_ `excalidraw-app/package.json` → `dependencies`.

## Docker

- **Build image:** `node:18` — install deps with Yarn, run `yarn build:app:docker`.
- **Runtime image:** `nginx:1.27-alpine` — serves `excalidraw-app/build` as static HTML.
- **docker-compose:** maps host `3000` → container `80`, optional bind mounts for live tree + anonymous volume for `node_modules`.

_Sources:_ `Dockerfile`; `docker-compose.yml`.

## Commands (from root `package.json`)

### Development

- **`yarn start`** — `yarn --cwd ./excalidraw-app start` → runs `vite` (app also runs `yarn` first in that package).
- **`yarn start:example`** — builds packages then starts `examples/with-script-in-browser`.
- **Default Vite port:** `3000` unless `VITE_APP_PORT` overrides (`excalidraw-app/vite.config.mts` reads env from repo parent dir).

### Builds

- **`yarn build`** — full app build in `excalidraw-app` (`vite build` + version script).
- **`yarn build:packages`** — `build:common` → `build:math` → `build:element` → `build:excalidraw` (each `build:esm` via package scripts).
- **`yarn build:app:docker`** — `cross-env VITE_APP_DISABLE_SENTRY=true vite build` in app.

### Quality

- **`yarn test`** / **`yarn test:app`** — Vitest.
- **`yarn test:all`** — typecheck (`tsc`), ESLint, Prettier `--list-different`, Vitest `--watch=false`.
- **`yarn test:typecheck`**, **`yarn test:code`**, **`yarn test:other`** — individual gates.

### Cleanup

- **`yarn rm:build`**, **`yarn rm:node_modules`**, **`yarn clean-install`**

## TypeScript path aliases (IDE / `tsc`)

Root `tsconfig.json` maps `@excalidraw/common`, `@excalidraw/element`, `@excalidraw/excalidraw`, `@excalidraw/math`, `@excalidraw/utils` to `packages/*/src` (or `index.tsx` for excalidraw).

_Source:_ `tsconfig.json` → `compilerOptions.paths`.

## CI note

GitHub Actions include **`build-docker.yml`** for container builds.

_Source:_ `.github/workflows/build-docker.yml`.
