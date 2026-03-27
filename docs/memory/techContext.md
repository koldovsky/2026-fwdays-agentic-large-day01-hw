# Tech context

## Related documentation

- **Product:** [PRD](../product/PRD.md), [Domain glossary](../product/domain-glossary.md)
- **Technical:** [Architecture](../technical/architecture.md), [Dev setup](../technical/dev-setup.md), [Code vs documentation](../technical/code-vs-documentation.md)

## Languages & runtime

- **TypeScript** — root `devDependencies`: `typescript` **5.9.3** (`package.json`).
- **JavaScript** — build scripts under `scripts/` (Node).
- **Node.js** — `engines.node`: `>=18.0.0` (root and `excalidraw-app/package.json`).
- **JSX** — `jsx`: `react-jsx` (`tsconfig.json`).

## Package manager & workspaces

- **Yarn Classic** — `packageManager`: `yarn@1.22.22` (`package.json`).
- **Workspaces**: `excalidraw-app`, `packages/`*, `examples/*` (`package.json`).
- **Lockfile**: `yarn.lock` (present at repo root).
- **npm config**: `.npmrc` sets `save-exact=true`, `legacy-peer-deps=true`.

## Core frameworks & libraries (verified versions)


| Concern                           | Source                             | Version / note                                                                                       |
| --------------------------------- | ---------------------------------- | ---------------------------------------------------------------------------------------------------- |
| React (app)                       | `excalidraw-app/package.json`      | `react`, `react-dom` **19.0.0**                                                                      |
| Vite (tooling)                    | root `package.json`                | `vite` **5.0.12**                                                                                    |
| Vitest                            | root `package.json`                | `vitest` **3.0.6**; `@vitest/coverage-v8` **3.0.7**                                                  |
| ESLint / Prettier                 | root `package.json`                | `@excalidraw/eslint-config` **1.0.3**, `@excalidraw/prettier-config` **1.0.2**, `prettier` **2.6.2** |
| App: Firebase                     | `excalidraw-app/package.json`      | `firebase` **11.3.1**                                                                                |
| App: Sentry                       | `excalidraw-app/package.json`      | `@sentry/browser` **9.0.1**                                                                          |
| App: realtime                     | `excalidraw-app/package.json`      | `socket.io-client` **4.7.2**                                                                         |
| App: state                        | `excalidraw-app/package.json`      | `jotai` **2.11.0**                                                                                   |
| Library: `@excalidraw/excalidraw` | `packages/excalidraw/package.json` | package version **0.18.0**; many deps (e.g. `roughjs`, `jotai`, `radix-ui`, CodeMirror packages)     |


## Build commands (root `package.json` `scripts`)


| Command                 | What it runs                                                                   |
| ----------------------- | ------------------------------------------------------------------------------ |
| `yarn start`            | `yarn --cwd ./excalidraw-app start` (Vite dev; app script runs `yarn && vite`) |
| `yarn build`            | `yarn --cwd ./excalidraw-app build` (`build:app` + `build:version` in app)     |
| `yarn build:packages`   | Sequential `build:common`, `build:math`, `build:element`, `build:excalidraw`   |
| `yarn build:preview`    | App preview build                                                              |
| `yarn start:production` | App production serve after build                                               |
| `yarn start:example`    | `build:packages` then `examples/with-script-in-browser` `start`                |


## Test / lint / format (root `package.json`)


| Command                       | Purpose                                                                  |
| ----------------------------- | ------------------------------------------------------------------------ |
| `yarn test` / `yarn test:app` | `vitest`                                                                 |
| `yarn test:all`               | `test:typecheck` + `test:code` + `test:other` + `test:app --watch=false` |
| `yarn test:typecheck`         | `tsc` (project references root `tsconfig.json`)                          |
| `yarn test:code`              | `eslint --max-warnings=0 --ext .js,.ts,.tsx .`                           |
| `yarn test:other`             | `prettier --list-different` on patterns in `prettier` script             |
| `yarn test:coverage`          | `vitest --coverage`                                                      |
| `yarn fix`                    | `prettier --write` then `eslint --fix`                                   |


## Vitest

- Config: `vitest.config.mts` — `environment: "jsdom"`, `setupFiles: ["./setupTests.ts"]`, `globals: true`, path aliases aligned with `packages/`* sources.

## Lint / git hooks

- ESLint extends `@excalidraw/eslint-config` and `react-app` (`.eslintrc.json`).
- **lint-staged** (`.lintstagedrc.js`): ESLint on `*.{js,ts,tsx}`, Prettier on `*.{css,scss,json,md,html,yml}`.
- **Husky**: `prepare` runs `husky install` (`package.json`); `.husky/pre-commit` runs lint-staged.

## Environment & config (app)

- Vite loads env from **parent** directory: `envDir: "../"` in `excalidraw-app/vite.config.mts` (relative to `excalidraw-app`).
- Example variables in `.env.development`: `VITE_APP_PORT` (default dev port documented as **3001** there), backend URLs, `VITE_APP_WS_SERVER_URL`, `VITE_APP_FIREBASE_CONFIG`, feature flags (`VITE_APP_`*). **Do not copy secrets into docs**; treat `.env.`* as the source of truth locally.

## Docker

- `Dockerfile`: multi-stage **node:18** build, `yarn build:app:docker`, then **nginx:1.27-alpine** serving `excalidraw-app/build`.
- `docker-compose.yml`: service `excalidraw`, port **3000:80**, bind-mounts repo (with anonymous volume for `node_modules`).

## CI (`.github/workflows`)

- **test.yml** (push to `master`): `yarn install`, `yarn test:app`.
- **lint.yml** (pull_request): `yarn install`, `yarn test:other`, `yarn test:code`, `yarn test:typecheck`.
- Other workflows exist (e.g. `size-limit.yml`, `build-docker.yml`, `publish-docker.yml`, `locales-coverage.yml`) — see `.github/workflows/` for exact triggers.

## Deployment config

- `vercel.json`: `outputDirectory`: `excalidraw-app/build`, `installCommand`: `yarn install`.

