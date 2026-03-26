# Project brief: Excalidraw monorepo

### Overview / purpose
This repository is the **Excalidraw monorepo**:
- **`excalidraw-app/`**: the main web application (a whiteboard/diagram tool with a hand‑drawn look).
- **`packages/excalidraw/`**: **`@excalidraw/excalidraw`** exported as a **React component** that can be embedded into other apps.
- **`examples/`**: reference integrations (e.g. Next.js).

### Core technology stack
- **Runtime / tooling**: Node.js (engines `>=18`), **Yarn classic workspaces** (`yarn@1.22.22`)
- **Language**: **TypeScript**
- **UI**: **React 19**
- **Build/dev server**: **Vite 5** (`@vitejs/plugin-react`)
- **Quality**: ESLint + Prettier, Husky + lint-staged
- **Tests**: Vitest
- **Web app features** (in `excalidraw-app`): PWA (Workbox via `vite-plugin-pwa`), optional Sentry, Firebase, Socket.IO client, Jotai
- **Containerization**: multi-stage **Docker** build, served by **Nginx** (static assets)

### Repository layout (high level)
- **`package.json` (root)**: defines workspaces:
  - `excalidraw-app`
  - `packages/*`
  - `examples/*`
  and provides orchestration scripts (build/test/fix/clean).
- **`excalidraw-app/`**: the deployable SPA.
  - Vite config: `excalidraw-app/vite.config.mts`
  - Entry: `excalidraw-app/index.tsx`, main app: `excalidraw-app/App.tsx`
  - Uses monorepo packages via Vite aliases to `packages/*` sources.
- **`packages/`**: internal libraries used by the app and/or published:
  - `packages/excalidraw` (React component package)
  - `packages/common`, `packages/element`, `packages/math`, `packages/utils`
- **`examples/`**: runnable sample setups (e.g. `examples/with-nextjs`)
- **`scripts/`**: build/release utilities (versioning, release automation, fonts/woff2 tooling, etc.)
- **`public/`**: shared static assets (Vite `publicDir` for the app points here)
- **`Dockerfile` (root)**: builds `excalidraw-app/build` and serves it with Nginx

### How it builds / runs (most relevant scripts)
- **Dev app**: `yarn start` (runs Vite in `excalidraw-app`)
- **Build app**: `yarn build` (builds app + version info)
- **Build for Docker**: `yarn build:app:docker` (produces static output for Nginx image)
- **Tests**: `yarn test` / `yarn test:all`
- **Lint/format**: `yarn test:code`, `yarn prettier`, `yarn fix`

