# Dev Setup

## Goal

- Get the monorepo running locally for app development, package changes, and validation.

## Prerequisites

- Node.js `>=18.0.0`
- Yarn Classic `1.22.22`
- A modern browser supported by the declared `browserslist`

## Repo Layout

- Root workspace package: `excalidraw-monorepo`
- Workspaces:
  - `excalidraw-app`
  - `packages/*`
  - `examples/*`
- Main local package aliases:
  - `@excalidraw/common`
  - `@excalidraw/element`
  - `@excalidraw/math`
  - `@excalidraw/utils`
  - `@excalidraw/excalidraw`

## First-Time Setup

1. Install dependencies from repo root:
   - `yarn install`
2. Start the hosted app:
   - `yarn start`
3. Open the dev server:
   - port comes from `VITE_APP_PORT`
   - `.env.development` sets it to `3001`
   - Vite falls back to `3000`

## Core Commands

### Development

- `yarn start`
- `yarn start:production`
- `yarn start:example`

### Build

- `yarn build`
- `yarn build:app`
- `yarn build:preview`
- `yarn build:packages`

### Validation

- `yarn test`
- `yarn test:all`
- `yarn test:typecheck`
- `yarn test:code`
- `yarn test:other`

## How Local Resolution Works

- Root `tsconfig.json` maps `@excalidraw/*` imports directly to package source files.
- `excalidraw-app/vite.config.mts` mirrors those aliases for runtime bundling.
- Result:
  - editing files in `packages/*` immediately affects the running app

## Environment Model

- App env files live at repo root, not inside `excalidraw-app`.
- `excalidraw-app/vite.config.mts` uses `envDir: "../"` and `loadEnv(mode, "../")`.
- Important env vars verified in code:
  - `VITE_APP_PORT`
  - `VITE_APP_BACKEND_V2_GET_URL`
  - `VITE_APP_BACKEND_V2_POST_URL`
  - `VITE_APP_LIBRARY_URL`
  - `VITE_APP_LIBRARY_BACKEND`
  - `VITE_APP_WS_SERVER_URL`
  - `VITE_APP_AI_BACKEND`
  - `VITE_APP_FIREBASE_CONFIG`
  - `VITE_APP_ENABLE_ESLINT`
  - `VITE_APP_ENABLE_PWA`

## External Services Used By The App

- collaboration websocket server via `VITE_APP_WS_SERVER_URL`
- backend scene import/export endpoints
- library backend
- AI backend for text-to-diagram
- Firebase-backed file/storage integration

## Docker Option

- `Dockerfile` builds the app with `node:18`, then serves `excalidraw-app/build` with `nginx:1.27-alpine`.
- `docker-compose.yml` exposes the app on `3000:80`.

## Contributor Notes

- There is no root `README.md`; rely on manifests and `docs/technical/architecture.md` for orientation.
- The app workspace `start` script runs `yarn && vite`, so first boot may re-check workspace dependencies.
- Production and development env files differ for backend URLs, tracking flags, and collab/AI endpoints.

## Sources

- `package.json`
- `excalidraw-app/package.json`
- `packages/excalidraw/package.json`
- `tsconfig.json`
- `excalidraw-app/vite.config.mts`
- `.env.development`
- `.env.production`
- `Dockerfile`
- `docker-compose.yml`
