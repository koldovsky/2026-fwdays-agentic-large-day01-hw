# System Patterns

## Architectural Style

The project is structured as a monorepo with clear separation between:

- the app shell (`excalidraw-app`) for product UX and external integrations;
- the editor library (`packages/excalidraw`) for core editor behavior;
- shared/domain packages (`common`, `element`, `math`, `utils`) for reusable primitives and logic boundaries.

This is not a thin UI wrapper over a library. The app shell actively orchestrates the editor package.

## Main Composition Pattern

`excalidraw-app/App.tsx` imports `Excalidraw` and related API from `@excalidraw/excalidraw`, then layers on top:

- collaboration;
- local persistence;
- app-specific menus, footer, welcome screen, and share dialogs;
- Firebase and file flows;
- language and theme handling.

The reusable editor is the core, while the app shell adds product-specific behavior.

## Package Responsibility Boundaries

### `packages/common`

- constants;
- shared utilities;
- event bus;
- editor interface;
- general helpers.

### `packages/element`

- element model;
- geometry, bounds, and collision logic;
- mutations;
- selection, grouping, and frame logic;
- scene versioning (`getSceneVersion`, `hashElementsVersion`).

### `packages/excalidraw`

- `Excalidraw` React component;
- main editor implementation in `components/App.tsx`;
- public exports for host applications;
- data restore/import/export hooks;
- editor UI components;
- integrations such as charts, Mermaid, fonts, and command palette.

## State Management Patterns

- The app layer uses a dedicated Jotai store in `excalidraw-app/app-jotai.ts`.
- The editor layer uses its own `EditorJotaiProvider` in `packages/excalidraw/index.tsx`.
- Pattern: separate stores for app-shell state and internal editor state.
- The public imperative API is exposed through React context (`ExcalidrawAPIContext`, `ExcalidrawAPISetContext`).

## Public API Pattern

`packages/excalidraw/index.tsx` acts as a facade:

- exports the main component;
- re-exports domain functions from `@excalidraw/element`, `@excalidraw/common`, and `@excalidraw/utils`;
- exports hooks, UI blocks, and data helpers;
- presents a single entry surface over a larger internal structure.

This is a standard facade pattern for an embeddable library.

## Persistence Pattern

Local persistence is implemented in `excalidraw-app/data/LocalData.ts`:

- scene elements and app state are stored in `localStorage`;
- binary files are stored in IndexedDB via `idb-keyval`;
- saves are debounced;
- saving can be paused/resumed via `Locker`;
- obsolete local files are cleaned up.

This is a split persistence model: different data types go to different browser storage layers.

## Collaboration Pattern

Collaboration is isolated into a dedicated layer:

- `Collab.tsx` manages collaboration lifecycle;
- `Portal.tsx` encapsulates socket communication;
- socket payloads are encrypted before sending;
- scenes and files are synchronized separately;
- Firebase is used for persisted scenes and files;
- Socket.IO is used for realtime events and presence.

The important pattern is separation between realtime transport and persistent storage: WebSocket for live sync, Firebase for durable state.

## Reconciliation Pattern

During sync and persistence, the project does not blindly overwrite scene state:

- it uses `reconcileElements(...)` to merge local and remote state;
- it relies on element versioning and `sceneVersion`;
- `Portal` sends only syncable and changed elements to reduce bandwidth.

This is an incremental synchronization model with reconciliation.

## Build And Runtime Pattern

- In development and tests, aliases point directly to `packages/*/src` or `packages/excalidraw/*`.
- The app is built with Vite as a PWA.
- Locales, CodeMirror, and Mermaid are split into separate chunks.
- The service worker is registered in `excalidraw-app/index.tsx`.

The repo is therefore optimized for:

- local monorepo development;
- public web deployment;
- use of the editor package as a library.

## Main Risk Areas For Changes

- `packages/excalidraw/components/App.tsx` is a very large orchestration component.
- `excalidraw-app/App.tsx` concentrates many app-level integrations.
- `collab/` and `data/firebase.ts` are critical for multiplayer and persistence.
- Alias configuration across Vite, Vitest, and TSConfig must remain aligned.

## Related Docs

- Expanded architecture description: `docs/technical/architecture.md`
- Product framing for these patterns: `docs/product/PRD.md`
- Shared domain terms: `docs/product/domain-glossary.md`

## Verified From Source

- `excalidraw-app/App.tsx`
- `excalidraw-app/app-jotai.ts`
- `excalidraw-app/collab/Collab.tsx`
- `excalidraw-app/collab/Portal.tsx`
- `excalidraw-app/data/LocalData.ts`
- `excalidraw-app/data/firebase.ts`
- `excalidraw-app/vite.config.mts`
- `packages/common/src/index.ts`
- `packages/element/src/index.ts`
- `packages/excalidraw/index.tsx`
- `packages/excalidraw/components/App.tsx`
