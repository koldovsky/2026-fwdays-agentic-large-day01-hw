# Product context

## Product overview

- **Product:** Excalidraw editor ecosystem in a monorepo (`excalidraw-monorepo`).
- **Core deliverables:**
  - Reusable React editor package: `@excalidraw/excalidraw`.
  - Product web app shell: `excalidraw-app`.
  - Integration examples: `examples/*`.
- **Runtime entrypoint (app):** `excalidraw-app/index.tsx` renders `<ExcalidrawApp />` in `StrictMode`, registers PWA service worker.

## Primary goal

- Provide a whiteboard/diagram editor with hand-drawn style that can be:
  - embedded as a React component (`packages/excalidraw/index.tsx`),
  - used as a standalone web app (`excalidraw-app/App.tsx`).

## Key product capabilities (verified by code)

- **Canvas editing primitives:** tools, element creation/editing, selection, viewport controls (`packages/excalidraw/components/App.tsx`, `packages/excalidraw/types.ts`).
- **Data import/export:** blob/json restore/export helpers (`packages/excalidraw/data/*`, re-exports in `packages/excalidraw/index.tsx`).
- **Collaboration mode:** collab integration in app shell (`excalidraw-app/collab/Collab.tsx`, `LiveCollaborationTrigger` usage in app).
- **Library of reusable items:** library atoms, merge/update, persistence adapter contracts (`packages/excalidraw/data/library.ts`).
- **Undo/redo and incremental updates:** `Store` + `History` (`packages/element/src/store.ts`, `packages/excalidraw/history.ts`).
- **PWA behavior in product app:** service worker registration and Vite PWA plugin usage (`excalidraw-app/index.tsx`, `excalidraw-app/vite.config.mts`).

## Key modules and boundaries

- **Foundation packages:**
  - `@excalidraw/common`: constants/utilities.
  - `@excalidraw/math`: geometry.
  - `@excalidraw/element`: element model + store/deltas.
  - `@excalidraw/utils`: export/helper utilities.
- **Composition package:** `@excalidraw/excalidraw` (UI, state orchestration, rendering pipeline, API surface).
- **Application layer:** `excalidraw-app` (collab/data integrations, app-level UI and orchestration).

## Main stakeholders/users (from code roles)

- **Host app developers:** consume `<Excalidraw />`, `ExcalidrawAPIProvider`, API hooks (`packages/excalidraw/index.tsx`).
- **End users of web app:** interact with canvas editor in `excalidraw-app/App.tsx`.
- **Collaborative users:** room/file synchronization and collaborator presence (`excalidraw-app/collab/Collab.tsx`).
- **Maintainers/contributors:** work across monorepo packages and app shell (`package.json` workspaces and scripts).

## Source-backed notes

- Root workspace structure and scripts are defined in `package.json` (root).
- Excalidraw package exports and API entry are in `packages/excalidraw/index.tsx`.
- App shell wiring and feature composition are in `excalidraw-app/App.tsx`.

## Details

For detailed architecture -> `docs/technical/architecture.md`  
For domain glossary -> `docs/product/domain-glossary.md`
