# Product Context

## Product Summary

- `excalidraw-monorepo` is a Yarn workspace monorepo for Excalidraw.
- The repo serves two product forms:
  - hosted web app in `excalidraw-app`
  - reusable React package `@excalidraw/excalidraw`
- The package description defines the library position directly: `Excalidraw as a React component`.

## UX Goals

- Let users start sketching quickly:
  - `excalidraw-app/index.tsx` boots directly into the app shell.
  - the reusable package renders the editor through `<Excalidraw />`.
- Keep editing interactive and low-friction:
  - the package exposes callbacks and an imperative API for scene and history control.
- Support both standalone and embedded usage:
  - the hosted app adds sharing, collaboration, AI, onboarding UI, and export flows.
  - the library exposes a configurable editor component for integrators.
- Preserve a whiteboard-like experience while remaining production-ready:
  - PWA registration, local persistence, and backend-integrated flows are part of the app.

## Primary User Scenarios

### 1. Standalone drawing session

- A user opens the web app and starts drawing on the canvas immediately.
- `excalidraw-app/App.tsx` composes the editor with welcome UI, sidebar, dialogs, and sharing flows.

### 2. Embedded editor in another product

- A developer imports `@excalidraw/excalidraw` and renders `<Excalidraw />`.
- `packages/excalidraw/index.tsx` wires providers, editor initialization, props, and API callbacks around the core app.

### 3. Real-time collaboration

- The hosted app exposes `LiveCollaborationTrigger` and collaboration state.
- `Collab` manages room-level orchestration and uses `Portal` as transport.

### 4. AI-assisted text-to-diagram

- The hosted app renders `AIComponents` and `TTDDialogTrigger`.
- `AI.tsx` connects `TTDDialog` to `TTDStreamFetch` and `TTDIndexedDBAdapter`.

### 5. Persistence and sharing

- The app can load/save local state, open share dialogs, and connect to backend URLs defined by env vars.
- `LocalData` and related adapters handle local persistence concerns separately from collaboration.

## UX Constraints Visible In Code

- App behavior depends on env-configured backend, collaboration, AI, and Firebase endpoints.
- The browser target is modern only; both the app and package declare a modern `browserslist`.
- The app shell is intentionally richer than the reusable package surface; product-specific UI lives mostly in `excalidraw-app`.

## Sources

- `package.json`
- `excalidraw-app/package.json`
- `packages/excalidraw/package.json`
- `excalidraw-app/index.tsx`
- `excalidraw-app/App.tsx`
- `packages/excalidraw/index.tsx`
- `excalidraw-app/collab/Collab.tsx`
- `excalidraw-app/collab/Portal.tsx`
- `excalidraw-app/components/AI.tsx`
- `excalidraw-app/data/LocalData.ts`
