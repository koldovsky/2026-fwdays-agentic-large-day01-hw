# Decision Log

Key architectural decisions made in the Excalidraw project, verified against source code.

---

## D1 — Monorepo with Strict One-Way Package Dependencies

**Decision**: Split the codebase into layered packages with a strict unidirectional dependency graph for library code: 
`common → math → element → excalidraw`

Application layer (`excalidraw-app`) consumes the library and sits above package graph concerns.

**Rationale**:
- Prevents circular imports that would break tree-shaking and bundling
- Allows publishing `@excalidraw/excalidraw` as a standalone npm library
- Enables downstream consumers to import only the layers they need

**Evidence**:
- `packages/{common,math,element,excalidraw,utils}` directory structure
- `@excalidraw/utils` is a leaf (no upward deps) — used by embedders, not by the library internally
- ESLint config at `packages/excalidraw/eslintrc.base.json` enforces no-circular-deps rule

---

## D2 — Class Component for Core App State

**Decision**: `App` (`packages/excalidraw/components/App.tsx`) is a **React class component**
holding `state: AppState`, not a functional component with hooks.

**Rationale**:
- `AppState` has 80+ fields — class component lifecycle gives predictable batching control
- `withBatchedUpdates` wraps `unstable_batchedUpdates` around hot paths to coalesce renders
- Imperative API (`ExcalidrawImperativeAPI`) is easier to expose via stable method references
  bound to the class instance

**Evidence**:
- `packages/excalidraw/components/App.tsx` — class component
- `packages/excalidraw/appState.ts` — `getDefaultAppState()` returns the 80+ field defaults
- `withBatchedUpdates` / `withBatchedUpdatesThrottled` wrappers used throughout App

---

## D3 — Jotai Only for Cross-Cutting UI Atoms (Not Core State)

**Decision**: Use Jotai (`jotai-scope`) for sidebar, library panel, search, i18n — but **not**
for the canvas element graph or editor AppState.

**Rationale**:
- Canvas state mutates at 60 fps during drawing — React class state + batched updates is faster
  than Jotai atom subscriptions for this use case
- Jotai-scope provides per-instance isolation, preventing state leakage between multiple
  embedded `<Excalidraw />` components on the same page

**Evidence**:
- `packages/excalidraw/editor-jotai.ts` — isolated Jotai store setup
- Tech context confirms: "Core canvas/element state is plain React class component state"

---

## D4 — Two-Canvas Rendering Architecture

**Decision**: Use three stacked `<canvas>` layers (static, new-element, interactive) rather than
a single canvas or SVG rendering.

**Rationale**:
- Avoids full redraw of all committed elements on every pointer move
- Static canvas only re-renders when the document model changes (scene nonce bump)
- Interactive canvas (selection handles, snap lines, cursors) can update at pointer rate
  without touching the expensive static layer

**Evidence**:
- `packages/excalidraw/renderer/staticScene.ts` — handles background + committed elements
- `packages/excalidraw/renderer/interactiveScene.ts` — handles selection, handles, cursors
- `packages/excalidraw/renderer/renderNewElementScene.ts` — in-progress element while drawing

---

## D5 — Declarative Actions System (Plugin Registry)

**Decision**: All editor commands (align, copy style, export, undo, shortcuts) are registered
as action objects rather than hardcoded imperative handlers.

**Rationale**:
- Actions are self-describing: they declare their keyboard shortcut (`keyTest`), UI component
  (`PanelComponent`), and undo policy (`captureUpdate`) in one place
- New actions can be added without modifying `App` or the toolbar directly
- Third-party host apps can register custom actions via the public API

**Evidence**:
- `packages/excalidraw/actions/` — 15+ action files (e.g., `actionAlign.tsx`,
  `actionExport.tsx`, `actionSelectAll.ts`, `actionElementLock.ts`)
- `actions/register.ts` — module-level `actions` array, `register()` function
- `actions/manager.tsx` — `ActionManager` wires actions to keyboard and toolbar

---

## D6 — Immutable Element Updates via `mutateElement`

**Decision**: All element mutations go through `mutateElement()` in
`packages/element/src/mutateElement.ts` rather than direct object assignment.

**Rationale**:
- `mutateElement` bumps `element.version` and `element.versionNonce` on every change
- Version stamps are used by the collaboration layer to detect and merge concurrent edits
- Centralizes the mutation pathway — makes it easy to add audit logging or invariant checks

**Evidence**:
- `packages/element/src/mutateElement.ts` exists as a dedicated module
- Used throughout `packages/excalidraw/` and `packages/element/` source

---

## D7 — esbuild for Library, Vite for App

**Decision**: Build the npm library (`@excalidraw/excalidraw`) with **esbuild** via a custom
script; build the web app (`excalidraw-app`) with **Vite**.

**Rationale**:
- esbuild produces smaller, faster output for pure library bundles (no HMR overhead)
- Vite provides HMR, PWA plugin, SVGR, type-check-in-dev — features needed only for the app
- Separating build tools avoids app-only plugins leaking into library output

**Evidence**:
- `scripts/buildPackage.js` — esbuild entry point for library build
- `vite.config.mts` (root) — Vite config for the app
- `techContext.md`: "scripts/buildPackage.js (esbuild) → dist/dev/ + dist/prod/"

---

## D8 — Firebase + Socket.io Only in `excalidraw-app` (Not Library)

**Decision**: Real-time collaboration (Socket.io) and cloud persistence (Firebase) live
exclusively in `excalidraw-app`, not in the `@excalidraw/excalidraw` library.

**Rationale**:
- Keeps the library dependency-free from backend services — embedders bring their own
  persistence via `initialData` + `onChange` props
- Prevents accidental Firebase SDK inclusion in bundles of apps that don't need collaboration
- Collaboration is an "app-level concern", not a "canvas-level concern"

**Evidence**:
- `firebase` v11.3.1 and `socket.io-client` v4.7.2 in `excalidraw-app/package.json`, not in
  `packages/excalidraw/package.json`
- `productContext.md` Scenario 3: embedder uses only `initialData` / `onChange` / `exportToBlob`

---

## D9 — IndexedDB for Local Persistence (No Service Worker Required)

**Decision**: Local autosave uses **IndexedDB** (via `idb-keyval`) as primary storage, with
a separate PWA service worker for offline shell caching.

**Rationale**:
- IndexedDB survives page refresh and browser restarts — suitable for autosave
- Decouples drawing persistence from network caching (service worker handles app shell only)
- `idb-keyval` is a thin wrapper — minimal bundle cost

**Evidence**:
- `idb-keyval` v6.0.3 in dependencies (`techContext.md`)
- `vite-plugin-pwa` v0.21.1 for service worker (separate concern)
- `productContext.md` Scenario 5: "changes persist to IndexedDB every few seconds"
