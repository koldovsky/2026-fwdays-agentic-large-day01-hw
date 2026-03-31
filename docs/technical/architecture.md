# Architecture

## Scope

This file documents the current architecture visible in source code and configuration only. It covers workspace structure, runtime layers, data flow, state ownership, rendering, and inter-package relationships.

## High-level Architecture

The repository root is a Yarn workspace monorepo. `package.json` declares three workspace groups: `excalidraw-app`, `packages/*`, and `examples/*`. The browser entrypoint for the hosted app is `excalidraw-app/index.tsx`, which creates the React root, registers the service worker, and mounts `<ExcalidrawApp />` inside `StrictMode`.

`ExcalidrawApp` chooses between two top-level modes:

- `ExcalidrawPlusIframeExport` when `window.location.pathname === "/excalidraw-plus-export"`
- the normal app shell otherwise

The normal app shell wraps `ExcalidrawWrapper` in:

- `TopErrorBoundary`
- Jotai `Provider` backed by `appJotaiStore`
- `ExcalidrawAPIProvider`

`ExcalidrawWrapper` embeds the reusable `<Excalidraw />` component from `@excalidraw/excalidraw` and adds product-specific UI such as `AppMainMenu`, `AppWelcomeScreen`, `ShareDialog`, `AppSidebar`, `Collab`, `AIComponents`, and command-palette items.

The reusable editor runtime is centered around `packages/excalidraw/components/App.tsx`. Its constructor creates the main editor subsystems:

- `Library`
- `ActionManager`
- `Scene`
- `Renderer`
- `Store`
- `History`
- `Fonts`

The hosted app adds persistence and collaboration around that editor core:

- local persistence through `excalidraw-app/data/LocalData.ts`
- backend/share-link import-export through `excalidraw-app/data/index.ts`
- real-time collaboration through `excalidraw-app/collab/Collab.tsx` and `excalidraw-app/collab/Portal.tsx`

### Mermaid diagram

```mermaid
flowchart TD
  Root[Root workspace\npackage.json workspaces]

  Root --> AppShell[excalidraw-app\nhosted app shell]
  Root --> ExcalidrawPkg[@excalidraw/excalidraw\nReact editor package]
  Root --> ElementPkg[@excalidraw/element]
  Root --> MathPkg[@excalidraw/math]
  Root --> CommonPkg[@excalidraw/common]
  Root --> UtilsPkg[@excalidraw/utils]

  AppShell --> Entry[index.tsx]
  Entry --> ExcalidrawApp[ExcalidrawApp]
  ExcalidrawApp --> Wrapper[ExcalidrawWrapper]
  Wrapper --> ExcalidrawComponent[<Excalidraw />]
  Wrapper --> LocalData[LocalData]
  Wrapper --> ShareData[data/index.ts]
  Wrapper --> Collab[Collab]

  ExcalidrawComponent --> EditorApp[packages/excalidraw/components/App.tsx]
  EditorApp --> Scene[Scene]
  EditorApp --> Renderer[Renderer]
  EditorApp --> Store[Store]
  EditorApp --> History[History]
  EditorApp --> ActionManager[ActionManager]
  EditorApp --> StaticCanvas[StaticCanvas]
  EditorApp --> InteractiveCanvas[InteractiveCanvas]

  Renderer --> StaticScene[renderer/staticScene.ts]
  Renderer --> InteractiveScene[renderer/interactiveScene.ts]

  Collab --> Portal[Portal]
  Portal --> SocketIO[Socket transport]
  Collab --> Firebase[Firebase persistence/files]
  LocalData --> LocalStorage[localStorage]
  LocalData --> IndexedDB[IndexedDB via idb-keyval]

  ExcalidrawPkg --> ElementPkg
  ExcalidrawPkg --> MathPkg
  ExcalidrawPkg --> CommonPkg
  ExcalidrawPkg --> UtilsPkg
  ElementPkg --> MathPkg
  ElementPkg --> CommonPkg
  MathPkg --> CommonPkg
```

## Data Flow

### Bootstrap and initial scene loading

`ExcalidrawWrapper` creates `initialStatePromiseRef` and passes that promise to `<Excalidraw initialData={...} />`. Once `excalidrawAPI` is available, the wrapper runs `initializeScene({ collabAPI, excalidrawAPI })`. When the initialization promise resolves, the wrapper loads image files for the scene and resolves the `initialData` promise that the editor consumes.

The wrapper also listens for `hashchange`. On URL-hash changes it can stop collaboration, re-run initialization, restore elements via `restoreElements(..., { repairBindings: true })`, restore app state via `restoreAppState(...)`, and push the result back into the editor with `excalidrawAPI.updateScene(...)`.

### Editor-owned update path

Inside `packages/excalidraw/components/App.tsx`, updates converge on the editor runtime through two entry paths:

- action execution through `ActionManager`
- imperative API calls such as `updateScene()` and `applyDeltas()`

For action-driven updates, the flow is:

1. `ActionManager` receives keyboard, UI, context-menu, or API input.
2. The selected `Action` runs `perform(elements, appState, formData, app)`.
3. `perform()` returns `ActionResult` or `false`.
4. `ActionManager` forwards the result to `App.syncActionResult`.
5. `syncActionResult` schedules store capture, updates `Scene`, merges app state, and updates files.
6. `Scene.replaceAllElements()` rebuilds caches and triggers a scene update.
7. `App.render()` recomputes renderable and visible elements.
8. Canvas layers repaint.
9. `store.commit(elementsMap, this.state)` runs near the end of the update cycle.
10. If `isLoading` is false, `onChange` listeners are called.

For imperative updates, `App.updateScene` optionally schedules a store micro action from `captureUpdate`, then applies app state with `setState`, applies elements with `scene.replaceAllElements`, and applies collaborators with another `setState`.

### Hosted-app persistence flow

The hosted app receives editor updates through the `onChange` prop passed to `<Excalidraw />` in `excalidraw-app/App.tsx`.

When collaboration is active:

- `collabAPI.syncElements(elements)` runs
- that broadcasts scene changes and schedules durable room persistence

When local persistence is allowed:

- `LocalData.save(elements, appState, files, onFilesSaved)` runs
- the save is debounced
- elements and filtered app state are written to `localStorage`
- files are written to IndexedDB through `LocalData.fileStorage`

After local file save completes, the wrapper checks image-element statuses and may issue `excalidrawAPI.updateScene({ elements, captureUpdate: CaptureUpdateAction.NEVER })` to flip image status to `"saved"`.

### Browser-tab synchronization flow

The wrapper listens to focus and visibility events. When a tab becomes active again, it compares storage-version keys and may pull:

- scene data from local storage
- library data from IndexedDB
- missing image files from IndexedDB

That path updates the editor via `excalidrawAPI.updateScene(...)`, `excalidrawAPI.updateLibrary(...)`, and `excalidrawAPI.addFiles(...)`.

### Collaboration flow

Collaboration is split between `Collab` and `Portal`.

`Collab` owns higher-level collaboration state and orchestration:

- current username
- active room link
- collaborator map
- remote-scene reconciliation
- Firebase scene persistence
- image-file fetching

`Portal` owns socket session details:

- `socket`, `roomId`, `roomKey`
- socket lifecycle
- encrypted payload emission
- throttled file-upload scheduling
- incremental and full scene broadcast paths

The remote-scene flow is:

1. `Collab.startCollaboration()` establishes or joins a room.
2. `Portal.open()` attaches socket listeners and joins the room.
3. Socket payloads are decrypted in `Collab.decryptPayload()`.
4. Scene payloads are reconciled in `_reconcileElements()`.
5. `handleRemoteSceneUpdate()` applies reconciled elements through `excalidrawAPI.updateScene({ captureUpdate: CaptureUpdateAction.NEVER })`.
6. `loadImageFiles()` fetches referenced images from Firebase.

The collaboration code also broadcasts separate low-latency payloads for pointer position, idle state, and visible-scene bounds.

### Share-link and room-link flow

`excalidraw-app/data/index.ts` implements both collaboration-link and backend-share-link paths.

- collaboration links use `#room=<roomId>,<roomKey>`
- `getCollaborationLinkData()` parses that hash and validates key length
- `exportToBackend()` serializes the scene, compresses it, encrypts it, uploads it, then uploads encoded files separately to Firebase
- `importFromBackend()` fetches, decrypts, decompresses, and restores scene data

## State Management

### State layers

State is intentionally split across several layers:

- React component state in `App.state` (`AppState`)
- scene-element storage in `Scene`
- delta capture in `Store`
- undo/redo state in `History`
- action dispatch in `ActionManager`
- host-level Jotai state in `appJotaiStore`
- editor-internal Jotai state in `editorJotaiStore`

### `appState`

`packages/excalidraw/appState.ts` defines `getDefaultAppState()`. The default object includes tool state, viewport state, selection state, editing state, export flags, collaboration state, and render-related flags. Examples initialized there include:

- `activeTool`, `preferredSelectionTool`, `penMode`
- `scrollX`, `scrollY`, `zoom`, `width`, `height`
- `selectedElementIds`, `selectedGroupIds`, `selectionElement`
- `editingTextElement`, `editingGroupId`, `selectedLinearElement`
- `frameRendering`, `viewBackgroundColor`, `shouldCacheIgnoreZoom`
- `collaborators`, `userToFollow`, `followedBy`
- `exportBackground`, `exportScale`, `exportWithDarkMode`

`packages/excalidraw/types.ts` defines `AppState` and also defines two narrower canvas-facing projections:

- `StaticCanvasAppState`
- `InteractiveCanvasAppState`

`StaticCanvas.tsx` and `InteractiveCanvas.tsx` both derive smaller relevant subsets from full `AppState` before memoized comparison.

Persistence rules for `appState` are explicit. `APP_STATE_STORAGE_CONF` marks each key for three storage targets:

- `browser`
- `export`
- `server`

`clearAppStateForLocalStorage`, `cleanAppStateForExport`, and `clearAppStateForDatabase` all use that config to strip keys before serialization.

### Observed app state in the store

The store does not capture full `AppState`. `packages/excalidraw/types.ts` defines `ObservedAppState` as the union of:

- `ObservedStandaloneAppState`: `name`, `viewBackgroundColor`
- `ObservedElementsAppState`: `editingGroupId`, `selectedElementIds`, `selectedGroupIds`, `selectedLinearElement`, `croppingElementId`, `lockedMultiSelections`, `activeLockedId`

`StoreSnapshot.create(...)` converts a full `AppState` to that observed subset when needed. The delta layer therefore tracks all scene elements plus only a bounded subset of app state.

### Elements and `Scene`

`Scene` in `packages/element/src/Scene.ts` owns the scene-element collections. It maintains synchronized views of the same data:

- `elements`: all elements, including deleted ones
- `elementsMap`: all elements keyed by id
- `nonDeletedElements`
- `nonDeletedElementsMap`
- `frames`
- `nonDeletedFramesLikes`

`Scene` also caches selected-element calculations. `getSelectedElements()` keys its cache by the `selectedElementIds` reference, the current elements reference, and a small options hash.

When `replaceAllElements(...)` runs, `Scene` normalizes input, validates or synchronizes indices, rebuilds element maps, rebuilds non-deleted caches, rebuilds frame caches, and finally notifies listeners through `triggerUpdate()`.

`triggerUpdate()` regenerates `sceneNonce` and notifies subscribers. `App` subscribes to that callback and uses it to trigger rendering.

### `Store`

`Store` in `packages/element/src/store.ts` captures editor changes and emits increments. It exposes two emitters:

- `onDurableIncrementEmitter`
- `onStoreIncrementEmitter`

It also separates scheduling into:

- macro actions: `IMMEDIATELY`, `NEVER`, `EVENTUALLY`
- micro actions queued ahead of the next commit

`Store.commit(elements, appState)` flushes micro actions, processes the chosen macro action, emits either a durable or ephemeral increment, and clears scheduled macro actions.

Its main value types are:

- `StoreSnapshot`: current `SceneElementsMap` plus `ObservedAppState`
- `StoreChange`: changed elements plus changed observed app-state keys
- `StoreDelta`: a calculable/applyable delta with `calculate`, `restore`, `load`, `squash`, `inverse`, `applyTo`, and `applyLatestChanges`

`App` calls `this.store.commit(elementsMap, this.state)` after render-state derivation and before external `onChange` notification.

### `History`

`History` subscribes to `Store` durable increments in `App.componentDidMount()`. For each durable increment it records `increment.delta` as an inverse history delta.

The history object owns:

- `undoStack`
- `redoStack`

Undo/redo run through `History.perform(...)`, which pops a history entry, applies it to current elements and app state, schedules an immediate store micro action for synchronization, pushes the inverse entry to the opposite stack, and emits `HistoryChangedEvent`.

### `ActionManager`

`ActionManager` is the editor’s action registry and dispatcher. It stores `actions: Record<ActionName, Action>`.

`Action` is defined in `packages/excalidraw/actions/types.ts`. The contract includes:

- `name`
- `perform(...)`
- optional `PanelComponent`
- optional `keyTest(...)`
- optional `predicate(...)`
- optional `checked(...)`
- `trackEvent`
- optional `viewMode`

`ActionResult` can contain `elements`, `appState`, `files`, `captureUpdate`, and `replaceFiles`, or it can be `false`.

`ActionManager` exposes three main entrypoints:

- `handleKeyDown(...)`
- `executeAction(...)`
- `renderAction(...)`

`handleKeyDown(...)` sorts by `keyPriority`, filters by `keyTest(...)`, respects `canvasActions`, blocks non-view-mode actions in view mode, and runs `perform(...)`. `renderAction(...)` is the UI-panel path; it creates `updateData(formState)` that calls `perform(...)` and forwards the result to the updater.

The updater injected into `ActionManager` is `App.syncActionResult`, so action dispatch is separated from actual scene/app-state mutation.

## Rendering Pipeline

### React tree to render set

`App.render()` starts by computing `selectedElements` through `this.scene.getSelectedElements(this.state)`. It then calls `this.renderer.getRenderableElements(...)`, passing:

- `sceneNonce`
- zoom, offsets, scroll, width, height
- `editingTextElement`
- `newElementId`

That call returns:

- `elementsMap`
- `visibleElements`

### `Renderer`

`packages/excalidraw/scene/Renderer.ts` does two filtering passes.

1. It builds a renderable element map and excludes the current `newElement` plus the text element currently edited in place.
2. It filters those renderable elements through `isElementInViewport(...)` to build `visibleElements`.

The computation is memoized; `sceneNonce` is the main invalidation token for scene changes.

### Layered canvas structure

Near the end of `App.render()`, the drawing layers are mounted as separate components:

- `SVGLayer`
- `StaticCanvas`
- `NewElementCanvas` when `state.newElement` exists
- `InteractiveCanvas`

The editor therefore renders through multiple layered surfaces rather than a single canvas.

### `StaticCanvas` and static renderer

`StaticCanvas.tsx` owns the shared static `canvas` element created in the `App` constructor. It updates CSS and backing-pixel size, mounts the canvas into its wrapper on first render, and calls `renderStaticScene(...)`.

`StaticCanvas` is memoized against:

- `sceneNonce`
- `scale`
- `elementsMap`
- `visibleElements`
- a reduced static-app-state projection
- `renderConfig`

`packages/excalidraw/renderer/staticScene.ts` performs static drawing. `_renderStaticScene(...)` normalizes dimensions, bootstraps the canvas context, applies zoom, optionally draws the grid, iterates visible elements, applies frame clipping when needed, renders non-iframe elements, and renders link icons when needed.

### `InteractiveCanvas` and interactive renderer

`InteractiveCanvas.tsx` owns a separate `<canvas>` for transient UI. On each effect pass it derives collaboration render data:

- remote pointer viewport coordinates
- remote pointer buttons
- remote selected element ids
- remote usernames
- remote idle states
- selection color from CSS

It stores those values in `rendererParams.current` and starts `AnimationController` under the key `animateInteractiveScene` if it is not already running. The animation callback repeatedly invokes `renderInteractiveScene(...)` and carries forward returned animation state.

`packages/excalidraw/renderer/interactiveScene.ts` draws the overlay layer. `_renderInteractiveScene(...)` bootstraps the canvas, applies zoom, then renders editing handles, selection element, text-box UI, binding highlights, frame and element highlights, selection borders, transform handles, crop handles, search highlights, snap lines, remote cursors, and scrollbars.

The exported `renderInteractiveScene(...)` function also invokes a callback with `atLeastOneVisibleElement`, `elementsMap`, and `scrollBars`.

### React/canvas boundary

The React layer decides which canvases exist, which props are passed into them, and which callbacks mutate editor state. The renderer layer owns viewport culling, context setup, drawing order, and overlay painting. `Scene` is the shared source of truth between those layers.

## Package Dependencies

### Workspace and source-resolution layer

The repository resolves `@excalidraw/*` imports to local source files in three places:

- root `tsconfig.json`
- root `vitest.config.mts`
- `excalidraw-app/vite.config.mts`

Those mappings cover:

- `@excalidraw/common`
- `@excalidraw/excalidraw`
- `@excalidraw/element`
- `@excalidraw/math`
- `@excalidraw/utils`

### Manifest-level relationships

Package manifests define these direct internal dependencies:

- `@excalidraw/math` → `@excalidraw/common`
- `@excalidraw/element` → `@excalidraw/common`, `@excalidraw/math`
- `@excalidraw/excalidraw` → `@excalidraw/common`, `@excalidraw/element`, `@excalidraw/math`

`@excalidraw/common` has external dependency `tinycolor2`. `@excalidraw/utils` has its own package manifest, build scripts, and external utility dependencies.

### Source-level relationships visible in code

The source tree shows additional internal coupling:

- `packages/excalidraw/components/App.tsx` imports editor logic from `@excalidraw/element`
- `packages/excalidraw/types.ts` imports `GlobalPoint` from `@excalidraw/math`
- `packages/excalidraw/index.tsx` re-exports canvas/blob/svg/clipboard export helpers from `@excalidraw/utils/export`
- `packages/excalidraw/index.tsx` re-exports bounding-box helpers from `@excalidraw/utils/withinBounds`
- `packages/utils/src/index.ts` re-exports `getCommonBounds` from `@excalidraw/element`

### Package roles in the current codebase

- `@excalidraw/common`: shared constants, helpers, emitters, editor-interface utilities
- `@excalidraw/math`: geometry utilities and point/vector types
- `@excalidraw/element`: scene structure, element mutation, bounds, rendering primitives, delta/store support
- `@excalidraw/utils`: export helpers plus geometry/bounds helpers
- `@excalidraw/excalidraw`: React editor package that composes the lower-level packages into the runtime editor and public API

## Source files used

`package.json`, `tsconfig.json`, `vitest.config.mts`, `excalidraw-app/vite.config.mts`, `excalidraw-app/index.tsx`, `excalidraw-app/App.tsx`, `excalidraw-app/app-jotai.ts`, `excalidraw-app/data/LocalData.ts`, `excalidraw-app/data/index.ts`, `excalidraw-app/collab/Collab.tsx`, `excalidraw-app/collab/Portal.tsx`, `packages/common/package.json`, `packages/common/src/index.ts`, `packages/math/package.json`, `packages/math/src/index.ts`, `packages/element/package.json`, `packages/element/src/index.ts`, `packages/element/src/Scene.ts`, `packages/element/src/store.ts`, `packages/utils/package.json`, `packages/utils/src/index.ts`, `packages/excalidraw/package.json`, `packages/excalidraw/index.tsx`, `packages/excalidraw/appState.ts`, `packages/excalidraw/types.ts`, `packages/excalidraw/history.ts`, `packages/excalidraw/actions/types.ts`, `packages/excalidraw/actions/manager.tsx`, `packages/excalidraw/components/App.tsx`, `packages/excalidraw/components/canvases/StaticCanvas.tsx`, `packages/excalidraw/scene/Renderer.ts`, `packages/excalidraw/scene/types.ts`, `packages/excalidraw/renderer/staticScene.ts`, `packages/excalidraw/renderer/interactiveScene.ts`.

