# Tech Context

## Runtime and tools

- Node.js: `>=18.0.0` (engines in root and `excalidraw-app`).
- Yarn: `1.22.22` (via `packageManager` in root).
- TypeScript: `5.9.3`.
- CI environment: Node `20.x` (GitHub Actions).

## Main stack

- **Frontend**: React `19.0.0`, ReactDOM `19.0.0`.
- **Build/dev server**: Vite `5.0.12`, `@vitejs/plugin-react`.
- **Styles**: SCSS/Sass (`sass`, esbuild sass plugin in build scripts).
- **State management**: Jotai (`jotai`, local `app-jotai` store).
- **Realtime**: `socket.io-client` for live collaboration.
- **Storage**:
  - browser `localStorage` for scene/app state;
  - IndexedDB (`idb-keyval`) for files and library.
- **Cloud/storage integration**: Firebase SDK (`firebase`) + custom data adapters.
- **PWA**: `vite-plugin-pwa` + `virtual:pwa-register`.
- **Observability**: `@sentry/browser`.

## Testing and code quality

- **Unit/integration tests**: Vitest (`vitest`, `jsdom`, `setupTests.ts`).
- **Coverage**: V8 coverage (`@vitest/coverage-v8`) + thresholds in `vitest.config.mts`.
- **Lint/format/typecheck**:
  - ESLint (`yarn test:code`);
  - Prettier (`yarn test:other`);
  - TypeScript (`yarn test:typecheck`).

## Key commands (root)

- **Development**: `yarn start` (delegates to `excalidraw-app start`).
- **App build**: `yarn build` or `yarn build:app`.
- **Package build**: `yarn build:packages`.
- **All tests together**: `yarn test:all`.
- **App tests only**: `yarn test:app`.
- **Local autofix**: `yarn fix` (`prettier` + `eslint --fix`).
- **Docker build for app**: `yarn build:app:docker`.

## Important env configs

- `VITE_APP_WS_SERVER_URL` — endpoint for WebSocket collaboration.
- `VITE_APP_BACKEND_V2_GET_URL` / `VITE_APP_BACKEND_V2_POST_URL` — backend for share-link JSON.
- `VITE_APP_FIREBASE_CONFIG` — Firebase config.
- `VITE_APP_AI_BACKEND` — AI backend endpoint.
- `VITE_APP_PORT` — dev server port.
- `VITE_APP_ENABLE_PWA` — enable PWA in dev.

## Deployment/infrastructure

- Docker multi-stage:
  - build stage: `node:18`, runs `yarn build:app:docker`;
  - runtime stage: `nginx:1.27-alpine`, serves static `excalidraw-app/build`.
- `docker-compose.yml` maps port `3000:80` and mounts workspace for the dev scenario.

## Verified against source code

- Runtime/tooling/script versions: `package.json`, `excalidraw-app/package.json`.
- Vite/plugins/PWA/chunking: `excalidraw-app/vite.config.mts`.
- Vitest config and coverage thresholds: `vitest.config.mts`.
- Local SW registration: `excalidraw-app/index.tsx`.
- Realtime/state/storage dependencies: `excalidraw-app/package.json`, `excalidraw-app/data/LocalData.ts`, `excalidraw-app/collab/Collab.tsx`.
- CI Node 20.x + lint/test steps: `.github/workflows/test.yml`, `.github/workflows/lint.yml`.
- Docker runtime: `Dockerfile`, `docker-compose.yml`.
