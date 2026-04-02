# Tech context

## Runtime and tooling

- **Node.js:** `>=18.0.0` (root and `excalidraw-app` `package.json` `engines`).
- **Package manager:** **Yarn classic** — `packageManager`: `yarn@1.22.22` (root `package.json`).
- **Monorepo:** Yarn **workspaces** — `excalidraw-app`, `packages/*`, `examples/*`.

## Languages and frameworks

- **TypeScript:** `5.9.3` (root `devDependencies`; aligned in several packages).
- **React:** `19.0.0` / `react-dom` `19.0.0` (`excalidraw-app` dependencies). `@excalidraw/excalidraw` declares **peer** `react` / `react-dom`: `^17.0.2 || ^18.2.0 || ^19.0.0`.
- **JSX:** `react-jsx` (`tsconfig.json`).

## Build and dev servers

- **Application (`excalidraw-app`):** **Vite** `5.0.12` (root devDependency). Config: `excalidraw-app/vite.config.mts` (React plugin, SVGR, EJS, PWA, checker, HTML, sitemap, custom woff2 plugin from `scripts/woff2/`). Dev server port from `VITE_APP_PORT` or default **3000** (`loadEnv` + `server.port`).
- **Library packages:** **esbuild** (e.g. `0.19.10` in `packages/excalidraw` devDependencies) via `scripts/buildBase.js` (common/math/element) and `scripts/buildPackage.js` (excalidraw bundle with sass plugin); **utils** via `scripts/buildUtils.js`.
- **Outputs:** App build dir **`excalidraw-app/build`** (`vite.config.mts` `build.outDir`). Packages emit **`dist/dev`**, **`dist/prod`**, and type stubs under `dist/types/...` (see `packages/*/package.json` `exports`).

## Testing and quality

- **Unit / component tests:** **Vitest** `3.0.6` with **`@vitest/coverage-v8`**, UI addon, **`vitest-canvas-mock`**, **`jsdom`** (root devDependencies). Config: `vitest.config.mts` — path aliases for `@excalidraw/*`, `environment: "jsdom"`, `setupFiles: ["./setupTests.ts"]`, `globals: true`.
- **Lint / format:** **ESLint** (extends `@excalidraw/eslint-config`, `eslint-config-react-app`, Prettier integration), **Prettier** `2.6.2` with `@excalidraw/prettier-config`.
- **Typecheck:** `tsc` at repo root with `noEmit: true` (`tsconfig.json`).

## Key application dependencies (`excalidraw-app`)

Verified in `excalidraw-app/package.json`:

- **State:** `jotai` `2.11.0`
- **Realtime collab:** `socket.io-client` `4.7.2`
- **Backend / auth storage patterns:** `firebase` `11.3.1`
- **Error reporting:** `@sentry/browser` `9.0.1`
- **i18n detection:** `i18next-browser-languagedetector` `6.1.4`
- **Local storage abstraction:** `idb-keyval` `6.0.3`

## Representative library versions (`@excalidraw/excalidraw`)

- Package version: **`0.18.0`** (`packages/excalidraw/package.json`).
- Notable runtime deps (sample): `roughjs`, `perfect-freehand`, `jotai`, `jotai-scope`, CodeMirror 6 packages, `radix-ui`, `sass`, Mermaid bridge `@excalidraw/mermaid-to-excalidraw`, internal workspace packages `@excalidraw/common`, `@excalidraw/element`, `@excalidraw/math` at `0.18.0`.

## Common commands (from root `package.json` `scripts`)

| Command | Purpose |
|---------|---------|
| `yarn` / `yarn install` | Install all workspaces. |
| `yarn start` | Dev server: `yarn --cwd ./excalidraw-app start` → Vite. |
| `yarn build` | App production build: `excalidraw-app` `build` script chain. |
| `yarn build:packages` | `build:common` → `build:math` → `build:element` → `build:excalidraw`. |
| `yarn test` | `vitest` (default watch behavior per Vitest). |
| `yarn test:all` | typecheck + eslint + prettier check + `test:app --watch=false`. |
| `yarn test:typecheck` | `tsc` |
| `yarn test:code` | ESLint on `.js,.ts,.tsx` |
| `yarn test:coverage` | `vitest --coverage` |
| `yarn fix` | Prettier write + ESLint fix. |
| `yarn rm:build` / `yarn rm:node_modules` | Clean artifacts / nested `node_modules`. |
| `yarn start:example` | Build packages then start `examples/with-script-in-browser`. |

## Path resolution (dev / test)

- **TypeScript paths:** `tsconfig.json` maps `@excalidraw/common`, `element`, `math`, `utils`, `excalidraw` to `packages/...` sources.
- **Vite & Vitest:** Same logical aliases in `excalidraw-app/vite.config.mts` and `vitest.config.mts` so the app and tests resolve workspace sources consistently.

## Git hooks

- **husky** `7.0.4` with `prepare`: `husky install` (root `package.json`).
