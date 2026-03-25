# Active context

## Details

For detailed architecture → see [docs/technical/architecture.md](../technical/architecture.md)  
For domain glossary → see [docs/product/domain-glossary.md](../product/domain-glossary.md)

## Current snapshot (this workspace)

- **Branch**: `master` (from `git rev-parse --abbrev-ref HEAD`).
- **Latest commit**: `4451b1e updates` (from `git log -1 --oneline`).
- **Untracked changes** (from `git status --porcelain`):
  - `.cursorignore`
  - `docs/` (Memory Bank files live under `docs/memory/`).

## What’s “active” in the codebase (high-signal areas)

- **Product app**: `excalidraw-app/`
  - Vite SPA + PWA behavior and caching strategies configured in `excalidraw-app/vite.config.mts`.
  - App shell composes collaboration + sharing flows (see `excalidraw-app/App.tsx` imports/usages like `Collab`, `ShareDialog`, `collabAPIAtom`).
- **Embeddable library**: `packages/excalidraw/`
  - Public integration path is `<Excalidraw />` + CSS import (see `packages/excalidraw/README.md`).
  - Distribution shape is controlled by `exports` map + ESM packaging (see `packages/excalidraw/package.json`).

## How to run / validate locally (repo-root scripts)

- **Install**: `yarn`
- **Start dev app**: `yarn start` (delegates to `excalidraw-app`).
- **Build app**: `yarn build`
- **Build all packages**: `yarn build:packages`
- **Full checks**: `yarn test:all` (typecheck + eslint + prettier + vitest)

## Operational/deployment context

- **Docker build** produces static app served by nginx (see root `Dockerfile`).
- **docker-compose** maps port `3000` to nginx `80` for the `excalidraw` service (see `docker-compose.yml`).

## Memory Bank status

- **Exists**: `docs/memory/`
- **Files present**:
  - `projectbrief.md`
  - `productContext.md`
  - `techContext.md`
  - `systemPatterns.md`
