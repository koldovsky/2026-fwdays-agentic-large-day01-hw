## Architecture type
- **Monorepo** using Yarn workspaces (package.json)
- **Client-side web app** built with Vite + React (excalidraw-app/vite.config.mts, excalidraw-app/index.tsx)
- **Embeddable React component library** (`@excalidraw/excalidraw`) (packages/excalidraw/package.json, packages/excalidraw/index.tsx)

## Component structure patterns
- **App composition**:
  - Web app composes the exported package component(s) and utilities (excalidraw-app/App.tsx imports from `@excalidraw/excalidraw/*`)
- **Provider pattern**:
  - `ExcalidrawAPIProvider` provides API context outside `<Excalidraw />` tree (packages/excalidraw/index.tsx)
- **Feature modules**:
  - Collaboration: `excalidraw-app/collab/*` (excalidraw-app/collab/Collab.tsx)
  - Data layer: `excalidraw-app/data/*` (excalidraw-app/data/index.ts, excalidraw-app/data/firebase.ts)

## State management patterns
- **Jotai stores**:
  - App-level: custom wrapper exporting `Provider`, hooks, and a store instance `appJotaiStore` (excalidraw-app/app-jotai.ts)
  - Editor-level isolation: `editor-jotai` used throughout package code (packages/excalidraw/editor-jotai.ts referenced across packages/excalidraw/*)
- **Store/delta pattern for scene changes**:
  - Element store captures changes and emits increments, with undo/redo semantics (packages/element/src/store.ts)
  - Capture semantics include durable vs ephemeral increments (`CaptureUpdateAction`) (packages/element/src/store.ts)

## Data flow (high-level)
- **UI events → editor state/store → persistence/collab exports**
  - Collab sync filters “syncable” elements (excalidraw-app/data/index.ts `getSyncableElements`)
  - Collab uses room id/key + socket + Firebase for elements/files (excalidraw-app/collab/Collab.tsx, excalidraw-app/data/firebase.ts)
  - Share links exported by compressing + encrypting, then POSTing to backend and storing key in URL hash (excalidraw-app/data/index.ts)

## API layer organization
- **Backend API wrapper**:
  - `importFromBackend()` and `exportToBackend()` in `excalidraw-app/data/index.ts`
  - Uses `fetch()` and env-configured endpoints (excalidraw-app/data/index.ts)
- **Firebase layer**:
  - Firebase initialization + Firestore/Storage operations in `excalidraw-app/data/firebase.ts`

## Routing approach
- **Hash-based routing/links** (no React Router found):
  - Collaboration links: `#room=<roomId>,<roomKey>` (excalidraw-app/data/index.ts)
  - Share link data stored as hash (e.g. `#json=<id>,<key>`) to avoid sending key to server (excalidraw-app/data/index.ts)
  - App reads `window.location.hash` in `excalidraw-app/App.tsx` (grep results)

## Separation of concerns
- **Package boundaries**:
  - `packages/excalidraw`: editor UI + embed API surface (packages/excalidraw/index.tsx)
  - `packages/element`: element manipulation, rendering, store/delta (packages/element/src/store.ts)
  - `packages/common`: shared constants/events/utilities (packages/common/src/constants.ts referenced by other modules)
  - `excalidraw-app`: product app features (collab, sharing, firebase persistence) (excalidraw-app/*)

## Error handling patterns
- **User-facing alerts** for invalid links / backend failures (excalidraw-app/data/index.ts)
- **Error dialog component** used in app and collab layers (excalidraw-app/App.tsx, excalidraw-app/collab/Collab.tsx)
- **Console logging** for diagnostic errors (excalidraw-app/data/index.ts, excalidraw-app/data/firebase.ts)

## Documentation references

**Product**

- [PRD](../product/PRD.md)
- [Domain glossary](../product/domain-glossary.md)

**Technical**

- [Architecture](../technical/architecture.md)
- [Developer setup](../technical/dev-setup.md)
- [Technical decision log](../technical/decisionlog.md)
