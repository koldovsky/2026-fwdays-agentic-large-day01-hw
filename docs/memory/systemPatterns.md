# System Patterns

## Architecture Overview

The project is a **Yarn monorepo** with a strict package dependency hierarchy. The web app (`excalidraw-app`) is an isolated SPA; the embeddable SDK (`packages/excalidraw`) is the public API boundary.

```
excalidraw-app
    └── @excalidraw/excalidraw   (packages/excalidraw)
             ├── @excalidraw/element   (packages/element)
             ├── @excalidraw/math      (packages/math)
             └── @excalidraw/common    (packages/common)
```

Lower-layer packages have no knowledge of higher-layer packages. `packages/utils` provides optional helpers, shared across any layer.

---

## Package Responsibilities

| Package | Responsibility |
|---------|----------------|
| `packages/math` | Pure geometry: `Point`, `Vector`, `Segment`, `Curve`, `Polygon`, `Ellipse`, `Rectangle`. No DOM/React. |
| `packages/common` | App-wide constants, utilities, `Emitter`, `AppEventBus`, colors, font metadata, typed utilities. |
| `packages/element` | `ExcalidrawElement` type definitions, mutation (`mutateElement`, `newElementWith`), binding, layout, scene (`Scene.ts`), store/snapshot/delta model. |
| `packages/excalidraw` | React component, rendering pipeline, history, actions, i18n, data import/export, hooks, collaborative reconciliation. |
| `excalidraw-app` | Hosted app: Firebase collab, Socket.io portal, local persistence, PWA, UI chrome. |

---

## Key Design Patterns

### 1. Branded Primitive Types (packages/math)

All geometric primitives use **branded number types** to prevent accidental type mixing:

```ts
type GlobalPoint = [x: number, y: number] & { _brand: "excalimath__globalpoint" };
type LocalPoint  = [x: number, y: number] & { _brand: "excalimath__localpoint" };
type Radians     = number & { _brand: "excalimath__radian" };
```

Always use these types (not plain `{x, y}`) for coordinate values. See `packages/math/src/types.ts`.

### 2. Immutable Element Mutation

`ExcalidrawElement` objects are **never mutated in-place** outside designated helpers:
- `mutateElement(element, { …props })` — single-element shallow update.
- `newElementWith(element, { …props })` — returns a new element (version bump).

This enables efficient structural sharing and delta-based history.

### 3. Store / Snapshot / Delta

`packages/element` implements a CRDT-like change-tracking model:
- **`Store`** — holds the authoritative `StoreSnapshot` (elements + appState).
- **`StoreDelta`** — captures element-level and appState-level diffs.
- **`HistoryDelta`** (in `packages/excalidraw`) extends `StoreDelta` for undo/redo, with `excludedProperties` for `version`/`versionNonce` so undo always produces a new version.

### 4. Jotai Atom-Based State

Global state is managed with **Jotai** in two separate stores:
- `packages/excalidraw/editor-jotai.ts` — `editorJotaiStore` for in-canvas editor state.
- `excalidraw-app/app-jotai.ts` — `appJotaiStore` for app-level state (collab, local data, etc.).

Components read/write atoms directly; no Redux-style reducers or context prop-drilling.

### 5. Real-Time Collaboration (excalidraw-app)

```
Client ──socket.io──▶ Server
         (encrypted WebSocket events)
         WS_EVENTS.SERVER_VOLATILE  — cursor/mouse (ephemeral)
         WS_EVENTS.SERVER           — scene updates (persistent)

Firebase Firestore — scene snapshots for late-joining peers
Firebase Storage  — binary file uploads (images, etc.)
```

- **`Portal`** (`collab/Portal.tsx`) — wraps the Socket.io socket, handles room join/leave, throttled broadcasts.
- **`Collab`** (`collab/Collab.tsx`) — React `PureComponent` that orchestrates sync: reconciles remote elements via `reconcileElements()`, manages idle state, follow-user mode.
- All scene data is **end-to-end encrypted** (`encryptData` / `decryptData`) using a room key embedded in the URL hash (never sent to the server).

### 6. Dual-Canvas Renderer

Two separate canvas layers are composited at runtime:
- **`staticScene`** — renders non-interactive, finalized elements (cached for perf).
- **`interactiveScene`** — renders selection handles, in-progress drawing, cursor highlights.

`renderer/` also includes `animation.ts` for animated effects and `renderNewElementScene.ts` for live drawing feedback.

### 7. Action System

All user-triggerable operations are registered as **actions** (`packages/excalidraw/actions/`). Each action declares:
- `name` — unique key.
- `perform(elements, appState, …)` — pure function returning `{ elements, appState, captureUpdate }`.
- `contextItemLabel`, `keyTest`, `PanelComponent` — optional UI bindings.

The `CaptureUpdateAction` enum controls whether the action is captured in undo history.

### 8. Local Persistence (excalidraw-app)

| Storage | What is stored |
|---------|---------------|
| `localStorage` | App state flags, collab username, current scene (small) |
| IndexedDB (`idb-keyval`) | Binary files / images (large blobs, `files-db/files-store`) |
| `idb-keyval` | Library items |

`LocalData.ts` coordinates all local I/O with debounced auto-save (`SAVE_TO_LOCAL_STORAGE_TIMEOUT = 300ms`).

### 9. i18n

Translations live in `packages/excalidraw/locales/`. The `t()` helper wraps `i18next`. Language detection uses `i18next-browser-languagedetector`. Locale coverage is tracked by `scripts/build-locales-coverage.js`.

### 10. Component Composition Pattern

The public `<Excalidraw>` component exposes **slot components** for customization:
- `<Excalidraw.MainMenu>`, `<Excalidraw.WelcomeScreen>`, `<Excalidraw.Footer>`
- `<LiveCollaborationTrigger>`, `<TTDDialogTrigger>`

The imperative API is accessed via `useExcalidrawAPI()` hook (context-based) or the `ref` prop.

## Details
For detailed architecture → see `docs/technical/architecture.md`
For domain glossary → see `docs/product/domain-glossary.md`
