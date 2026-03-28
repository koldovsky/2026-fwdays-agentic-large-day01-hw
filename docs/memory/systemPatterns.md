# System Patterns

## Architecture at repository level

- Monorepo with Yarn workspaces:
  - `excalidraw-app` — standalone web application;
  - `packages/excalidraw` — public React library;
  - `packages/common|element|math|utils` — internal modules.
- Pattern: `app` is built on top of library packages via aliases, not via built dist artifacts during development.

## Modularity and dependency pattern

- Logical decomposition:
  - `common`: shared constants/utilities;
  - `math`: geometric calculations;
  - `element`: scene element domain;
  - `excalidraw`: UI, editor, component API.
- Dependency direction is mostly from higher level to lower:
  - `excalidraw` -> `element/common/math`;
  - `element` -> `common/math`;
  - `math` -> `common`.

## UI composition pattern in the app

- Entry point:
  - `index.tsx` registers SW and renders `ExcalidrawApp`.
- The `App.tsx` component performs orchestration:
  - providers (`Provider`, `ExcalidrawAPIProvider`, error boundary);
  - scene initialization;
  - collaboration connection;
  - menu/palette/dialog/AI component integration.
- "Library + host app" pattern:
  - `@excalidraw/excalidraw` provides the editor core;
  - `excalidraw-app` adds product behavior and integrations.

## State and persistence pattern

- Local state:
  - Jotai atoms for global UI/collab signals.
- Local persistence:
  - scene and appState in `localStorage`;
  - files and library in IndexedDB.
- Consistency control:
  - debounce/throttle for save/sync;
  - version keys (`version-dataState`, `version-files`) for tab synchronization;
  - pause/resume save lock during collaboration.

## Realtime collaboration pattern

- `Collab` (controller) + `Portal` (transport-adapter) + data-layer (`data/*`).
- WebSocket channel via `socket.io-client`.
- Payloads are encrypted (encrypt/decrypt) before transmission.
- Sync strategy:
  - incremental element updates;
  - periodic full scene sync;
  - separate stream for cursor/idle/visible bounds statuses.
- Media/images:
  - files are stored/read via Firebase storage;
  - file statuses are managed by a dedicated `FileStatusStore`.

## Import/export pattern

- Share-link backend:
  - scene data is compressed + encrypted;
  - encryption key remains in the URL hash fragment (`#json=id,key`).
- Multiple initialization sources are supported:
  - local state;
  - `#json` backend snapshot;
  - `#url` external file;
  - `#room` live collaboration.

## Build and environment pattern

- Vite for the app with alias resolution to workspace source.
- Esbuild scripts for packages (`buildBase.js`, `buildPackage.js`, `buildUtils.js`) generate dev/prod ESM.
- Env-driven integration: separate `.env` for dev/prod endpoints.
- PWA/runtime caching and manual chunking for locales/CodeMirror/mermaid.

## Key technical decisions

- **Provider-first integration**: the editor API is available via context and hooks.
- **Edge-safe persistence**: flush on blur/unload + warning about unsaved data.
- **Bandwidth-aware collab**: syncable elements are transmitted, versions are tracked.
- **Separation of concerns**: UI orchestration in app, editor core in library package.

## Verified against source code

- Monorepo, workspaces, dependency boundaries: `package.json`, `packages/*/package.json`.
- React component and API/hooks export: `packages/excalidraw/index.tsx`, `packages/excalidraw/README.md`.
- App orchestration and scene initialization: `excalidraw-app/App.tsx`, `excalidraw-app/index.tsx`.
- Collaboration, transport, encryption, sync: `excalidraw-app/collab/Collab.tsx`, `excalidraw-app/collab/Portal.tsx`, `excalidraw-app/data/index.ts`.
- Local persistence and tab sync: `excalidraw-app/data/LocalData.ts`, `excalidraw-app/app_constants.ts`.
- Build/pwa/chunking/aliases: `excalidraw-app/vite.config.mts`, `scripts/buildPackage.js`.
