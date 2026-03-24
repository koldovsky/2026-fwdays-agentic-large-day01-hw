# Architecture

## High-Level Modules
- Entry/API: `packages/excalidraw/index.tsx`
- Orchestrator: `packages/excalidraw/components/App.tsx`
- UI Layer: `packages/excalidraw/components/LayerUI.tsx` + feature components
- Commands: `packages/excalidraw/actions/*`
- Persistence/import/export: `packages/excalidraw/data/*`
- Scene and viewport logic: `packages/excalidraw/scene/*`
- Rendering: `packages/excalidraw/renderer/*`
- History: `packages/excalidraw/history.ts`

## Core Runtime Flow
1. User input / shortcut / API triggers an Action.
2. Action returns `{elements, appState, files, captureUpdate}`.
3. `syncActionResult()` applies updates.
4. Store schedules capture according to `captureUpdate`.
5. Durable increments are recorded in `History` for undo/redo.
6. Canvases and UI rerender from updated state/scene.

## State Ownership
- `AppState` (React state): editor UI and interaction state.
- `Scene`: non-deleted/deleted elements, maps, selection helpers.
- `Store`: increment and delta lifecycle.
- `History`: undo/redo stacks derived from store deltas.

## Side Effects Surface (orchestrator: `components/App.tsx`)
- Global/document/window listeners: keyboard (optional document-level), wheel, pointer, copy/paste/cut, resize, blur/unload/focus, fullscreen, font loading, scroll container; subset depends on **view mode** vs edit mode (listeners are rebound when `viewModeEnabled` flips).
- `ResizeObserver` on the editor container.
- Iframe `postMessage` (e.g. Vimeo/YouTube), fullscreen API for embeddables, optional Web Share Target / launch queue.
- `AnimationFrameHandler` and pointer trails (laser, eraser, lasso).
- Temporary `document.documentElement` style toggles (`overscroll-behavior-x` while pointer inside editor).

## `App.tsx` lifecycle (summary)
1. **Constructor** — `AppState`, `Scene`, `Store`, `History`, `ActionManager`, `Library`, canvas/renderer/fonts, imperative `api`.
2. **Mount** — store→history subscription, scene update → render, DOM listeners, optional `ResizeObserver`, scene init / share restore, lifecycle callbacks.
3. **Update** — `AppStateObserver.flush`; `store.commit(sceneElementsMap, appState)`; emit `onChange` only when `!isLoading`; sync props (theme, zen, view mode, language).
4. **Unmount** — invalidate `api`, destroy renderer/scene resources, remove listeners, clear caches and emitters.

Canonical detail: `docs/memory/techContext.md` (State Management, Lifecycle, Side Effects sections).
