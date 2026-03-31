# Tech Context

## Runtime та workspace

- Package manager: `yarn@1.22.22`
- Workspace layout:
  - `excalidraw-app`
  - `packages/*`
  - `examples/*`
- Minimum Node version: `>=18.0.0`
- Root TypeScript: `5.9.3`
- Root Vite: `5.0.12`
- Root Vitest: `3.0.6`

## Core frontend stack

- TypeScript (`tsconfig.json`, strict mode enabled)
- React 19 (`react@19.0.0`, `react-dom@19.0.0` in app)
- Vite for dev/build
- Vitest + jsdom for tests
- Jotai for app/editor state stores
- Sass/SCSS for styling

## Main app dependencies

- `firebase@11.3.1` — remote persistence/files
- `socket.io-client@4.7.2` — live collaboration transport
- `@sentry/browser@9.0.1` — error reporting
- `idb-keyval@6.0.3` — IndexedDB persistence
- `i18next-browser-languagedetector@6.1.4` — language detection
- `uqr@0.1.2` — QR support in share dialog

## Build/test tooling

- `@vitejs/plugin-react`
- `vite-plugin-checker`
- `vite-plugin-ejs`
- `vite-plugin-pwa`
- `vite-plugin-svgr`
- `vite-plugin-sitemap`
- `@vitest/coverage-v8`
- `jsdom`

## Package versions inside monorepo

- `@excalidraw/excalidraw`: `0.18.0`
- `@excalidraw/common`: `0.18.0`
- `@excalidraw/element`: `0.18.0`
- `@excalidraw/math`: `0.18.0`
- `@excalidraw/utils`: `0.1.2`

## TS / module settings

- `target`: `ESNext`
- `module`: `ESNext`
- `moduleResolution`: `node`
- `jsx`: `react-jsx`
- `strict: true`
- Path aliases map workspace packages directly to source files during dev/test.

## Vite app behavior

- Dev server port defaults to `VITE_APP_PORT` or `3000`.
- Build output for app: `excalidraw-app/build`
- Sourcemaps enabled.
- PWA enabled through `VitePWA` plugin.
- Locales and some heavy modules are split into manual chunks.

## Test setup

- Test environment: `jsdom`
- Global test APIs enabled
- Setup file: `setupTests.ts`
- Coverage reporters:
  - `text`
  - `json-summary`
  - `json`
  - `html`
  - `lcovonly`
- Coverage thresholds:
  - lines `60`
  - branches `70`
  - functions `63`
  - statements `60`

## Verified commands

### Root commands

```powershell
cd "C:\Users\MTsybulskyi\IdeaProjects\2026-fwdays-agentic-large-day01-hw"
yarn start
yarn build
yarn build:packages
yarn test:app
yarn test:all
yarn test:typecheck
yarn test:code
yarn test:coverage
```

### App-level commands

```powershell
cd "C:\Users\MTsybulskyi\IdeaProjects\2026-fwdays-agentic-large-day01-hw\excalidraw-app"
yarn start
yarn build
yarn start:production
yarn build:preview
```

### Example command

```powershell
cd "C:\Users\MTsybulskyi\IdeaProjects\2026-fwdays-agentic-large-day01-hw"
yarn start:example
```

## Docker / deployment context

- `Dockerfile` builds with `node:18`, then serves static output from `nginx:1.27-alpine`.
- `docker-compose.yml` maps host port `3000` to container port `80`.
- `firebase-project/firebase.json` includes Firestore and Storage rules.
- Repo also contains Docker and Firebase deployment-related config alongside the web app.

## Observability / production infra

- Sentry initializes only for matching online hostnames unless explicitly disabled.
- Release tag for Sentry uses `VITE_APP_GIT_SHA`.
- Service worker registration happens from app entrypoint.

## Useful verified notes

- App `start` script runs `yarn && vite`, so first launch installs workspace deps if needed.
- Production preview serves built static assets from `build/`.
- Tests and local dev use source aliases instead of consuming built package artifacts.

## Details
For detailed architecture → see docs/technical/architecture.md
For domain glossary → see docs/product/domain-glossary.md
