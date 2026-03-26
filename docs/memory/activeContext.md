# Active context

## Current project state

- Monorepo is configured and active with workspaces:
  - `excalidraw-app`
  - `packages/*`
  - `examples/*`
- Current implementation center is the React editor package (`packages/excalidraw`) and its integration in `excalidraw-app`.
- App boot flow is stable and explicit:
  - `createRoot` + `StrictMode` + `registerSW` in `excalidraw-app/index.tsx`.

## Active modules in focus

- **Editor orchestrator:** `packages/excalidraw/components/App.tsx`
  - lifecycle, event binding, API creation, state/update commit loop.
- **Public API surface:** `packages/excalidraw/index.tsx`
  - component wrapper, provider/hook exports, data/helper exports.
- **Action execution path:** `packages/excalidraw/actions/manager.tsx`
  - keyboard/UI/API actions -> `ActionResult` updater path.
- **Store/history path:**
  - `packages/element/src/store.ts`
  - `packages/excalidraw/history.ts`
- **Rendering layers:**
  - `packages/excalidraw/components/canvases/StaticCanvas.tsx`
  - `packages/excalidraw/components/canvases/InteractiveCanvas.tsx`
- **App-level collaboration/data integrations:**
  - `excalidraw-app/collab/Collab.tsx`
  - `excalidraw-app/data/*`

## Components/services currently most operationally important

- `App` class component (`packages/excalidraw/components/App.tsx`) as single orchestrator.
- `ExcalidrawImperativeAPI` creation/usage (`createExcalidrawAPI`, host hooks).
- `Store.commit(...)` and increment emitters (`packages/element/src/store.ts`).
- `History.record/undo/redo` (`packages/excalidraw/history.ts`).
- `Library` state and update notifications (`packages/excalidraw/data/library.ts`).

## Current WIP / active risk signals (from source comments)

- **Pointer/touch input unification still incomplete**
  - TODO/HACK in `packages/excalidraw/components/App.tsx` notes mixed native/manual double-click handling.
- **Potential missing-pointer-up cleanup complexity**
  - comment in `App.tsx` plus TODO in `packages/excalidraw/tests/selection.test.tsx` about leak risk if `pointerUp` is missed.
- **Restore and sync/versioning edge behavior**
  - TODO in `packages/excalidraw/data/restore.ts` marks a known risk around `deleteInvisibleElements`.
- **Library store scoping across editor instances**
  - TODO in `packages/excalidraw/data/library.ts` references non-scoped jotai reset path.
- **UI options normalization at wrapper level**
  - FIXME in `packages/excalidraw/index.tsx` around memo comparison and defaults.

## Feature areas currently visible in app shell

- Collaboration entrypoints and room lifecycle (`Collab.tsx`).
- Share/import/export paths in `excalidraw-app/App.tsx` (backend/firebase/local data).
- Command palette, dialogs, sidebars, and app-level wrappers around core package.

## Details

For detailed architecture -> `docs/technical/architecture.md`  
For domain glossary -> `docs/product/domain-glossary.md`
