# Excalidraw Architecture

This document is based only on repository source code and build configuration.

## High-level Architecture

### System boundaries

The project is a monorepo with a host app and internal packages.

- Root `package.json` defines workspaces: `excalidraw-app`, `packages/*`, `examples/*`.
- `excalidraw-app` is the product shell and web entrypoint.
- `@excalidraw/excalidraw` is the public React editor package.
- `@excalidraw/element`, `@excalidraw/common`, `@excalidraw/math`, `@excalidraw/utils` provide lower-level logic.

### Runtime entrypoints

Host entrypoint:

- `excalidraw-app/index.tsx` uses `createRoot(...)`.
- `excalidraw-app/index.tsx` calls `registerSW()`.
- `excalidraw-app/index.tsx` renders `<ExcalidrawApp />` in `StrictMode`.

Host composition:

- `excalidraw-app/App.tsx` defines `ExcalidrawApp`.
- `ExcalidrawApp` wraps tree in `TopErrorBoundary`.
- It uses Jotai `Provider` with `appJotaiStore`.
- It wraps content with `ExcalidrawAPIProvider`.
- Main editor host component is `ExcalidrawWrapper`.

Library composition:

- `packages/excalidraw/index.tsx` calls `polyfill()`.
- It defines `ExcalidrawAPIProvider`.
- It defines `ExcalidrawBase`.
- `ExcalidrawBase` wraps runtime with `EditorJotaiProvider` and `InitializeApp`.
- `ExcalidrawBase` renders internal `App` from `packages/excalidraw/components/App.tsx`.

### Core runtime objects in editor `App`

`packages/excalidraw/components/App.tsx` constructor initializes:

- `ActionManager` (`this.actionManager = new ActionManager(...)`).
- `Scene` (`this.scene = new Scene()`).
- `Renderer` (`this.renderer = new Renderer(this.scene)`).
- `Store` (`this.store = new Store(this)`).
- `History` (`this.history = new History(this.store)`).
- Canvas primitives (`this.canvas`, `this.rc = rough.canvas(this.canvas)`).

Action setup in constructor:

- `this.actionManager.registerAll(actions)`.
- `this.actionManager.registerAction(createUndoAction(this.history))`.
- `this.actionManager.registerAction(createRedoAction(this.history))`.

### High-level Architecture diagram

```mermaid
flowchart LR
  user[UserInput] --> appHost[excalidraw-app]
  appHost --> pkg[packages/excalidraw]
  pkg --> appClass[components/App.tsx]

  appClass --> actionMgr[ActionManager]
  actionMgr --> appClass

  appClass --> scene[Scene]
  appClass --> renderer[Renderer]
  renderer --> staticScene[renderStaticScene]
  renderer --> interactiveScene[renderInteractiveScene]

  appClass --> store[Store]
  store --> history[History]

  pkg --> common[@excalidraw/common]
  pkg --> element[@excalidraw/element]
  pkg --> math[@excalidraw/math]
  pkg --> utils[@excalidraw/utils]
```

## Data Flow: як дані рухаються через систему

### Input -> action -> state

Primary runtime flow is implemented by `ActionManager` + `App.syncActionResult`.

1. User input is captured by canvas/UI handlers and action triggers.
2. `ActionManager` executes action `perform(...)` from:
   - `handleKeyDown(...)`
   - `executeAction(...)`
   - `renderAction(...).updateData(...)`
3. Action returns `ActionResult` (`packages/excalidraw/actions/types.ts`).
4. `App.syncActionResult(...)` applies output:
   - `this.store.scheduleAction(actionResult.captureUpdate)`
   - `this.scene.replaceAllElements(actionResult.elements)` when provided
   - `this.setState(...)` merge for `actionResult.appState`
   - file merge via `this.addMissingFiles(...)`
5. React update completes, then `componentDidUpdate(...)` calls:
   - `this.store.commit(elementsMap, this.state)`
   - `this.props.onChange?.(elements, this.state, this.files)`

### Store -> history path

In `App.componentDidMount(...)`:

- `this.store.onDurableIncrementEmitter.on((increment) => this.history.record(increment.delta))`

This creates event flow:

- Store captures updates into deltas/increments.
- Durable increments are forwarded to history.
- Undo/redo stacks are maintained in `packages/excalidraw/history.ts`.

Undo/redo action execution:

- `packages/excalidraw/actions/actionHistory.tsx` creates actions with `history.undo(...)` and `history.redo(...)`.
- Those actions return `ActionResult` and re-enter normal apply path.

### Host API update path

`App.updateScene(...)` supports host-driven updates.

- Input contains `elements`, `appState`, `collaborators`, optional `captureUpdate`.
- If `captureUpdate` exists, `store.scheduleMicroAction(...)` is called with observed app-state subset.
- Then `setState` and `scene.replaceAllElements(...)` apply the payload.

### Import/restore path

Restore functions in `packages/excalidraw/data/restore.ts`:

- `restoreElements(...)`
- `restoreAppState(...)`

They normalize incoming scene/app data before runtime usage.

### Serialization/export path

`packages/excalidraw/data/json.ts` defines `serializeAsJSON(...)`.

- For `"local"` type it uses `cleanAppStateForExport(...)`.
- For `"database"` type it uses `clearAppStateForDatabase(...)`.

`packages/utils/src/export.ts` export pipeline:

- `exportToCanvas(...)` calls `restoreElements(...)` and `restoreAppState(...)`.
- Then it calls lower-level `_exportToCanvas(...)` from `@excalidraw/excalidraw/scene/export`.

### Local storage path in host app

Save:

- `excalidraw-app/data/LocalData.ts` has `saveDataStateToLocalStorage(...)`.
- Elements are persisted as non-deleted (`getNonDeletedElements(...)`).
- App state is filtered via `clearAppStateForLocalStorage(...)`.

Load:

- `excalidraw-app/data/localStorage.ts` has `importFromLocalStorage(...)`.
- It merges `getDefaultAppState()` with filtered persisted app state.

## State Management: appState, elements, actionManager

### appState

#### State types

`packages/excalidraw/types.ts` defines:

- `AppState` (full state contract).
- `ObservedAppState` (subset for store/history observation).
- `ObservedElementsAppState`.

#### Default values

`packages/excalidraw/appState.ts`:

- `getDefaultAppState()` returns baseline app-state object.

`packages/excalidraw/components/App.tsx` constructor:

- initializes `this.state` with `...getDefaultAppState()`.
- overlays props (`viewModeEnabled`, `zenModeEnabled`, `gridModeEnabled`, `theme`, `name`).
- sets dimensions and offsets.

#### Storage policy and filtering

`packages/excalidraw/appState.ts` contains `APP_STATE_STORAGE_CONF`.

Filtering APIs:

- `clearAppStateForLocalStorage(...)`
- `cleanAppStateForExport(...)`
- `clearAppStateForDatabase(...)`

These helper functions define allowed keys per export/storage channel.

#### Update paths

`appState` changes through multiple controlled paths:

- Action results: `syncActionResult(...)`.
- Public scene API: `updateScene(...)`.
- Lifecycle reconciliation in `componentDidUpdate(...)`.
- Observer flush: `this.appStateObserver.flush(prevState)`.

### elements

#### Element model and version metadata

`packages/element/src/types.ts` element base includes versioning fields:

- `version`
- `versionNonce`
- `updated`

These are used by update/reconciliation flows.

#### Element creation

`packages/element/src/newElement.ts`:

- `_newElementBase(...)` initializes common element fields.
- `newElement(...)` and specialized creators build concrete element kinds.

#### Scene ownership

`packages/element/src/Scene.ts` is the canonical container:

- `replaceAllElements(...)`
- `getElementsIncludingDeleted()`
- `getNonDeletedElements()`
- `getNonDeletedElementsMap()`
- `getSelectedElements(...)`

#### Mutation

`packages/element/src/mutateElement.ts`:

- `mutateElement(...)` mutates and bumps `version`, `versionNonce`, `updated`.
- `newElementWith(...)` returns updated copy with bumped version metadata.
- `bumpVersion(...)` increments version metadata directly.

`Scene.mutateElement(...)` uses map lookup and version checks, then triggers scene updates.

### actionManager

#### Manager responsibilities

`packages/excalidraw/actions/manager.tsx`:

- stores action registry.
- validates and dispatches actions from keyboard/UI/API.
- wraps updater to support async `ActionResult`.

Main methods:

- `registerAction(...)`
- `registerAll(...)`
- `handleKeyDown(...)`
- `executeAction(...)`
- `renderAction(...)`
- `isActionEnabled(...)`

#### Integration with state and history

- `ActionManager` updater in `App` is `syncActionResult`.
- `syncActionResult` schedules capture via `store.scheduleAction(...)`.
- `componentDidUpdate` commits snapshots to store.
- Store durable increments are recorded by `History.record(...)`.

This defines the deterministic action -> store -> history chain.

## Rendering Pipeline: від React component до canvas

### Stage 1: compute render inputs in React render

`App.render()` (`packages/excalidraw/components/App.tsx`) computes:

- `selectedElements` from `scene.getSelectedElements(this.state)`.
- `sceneNonce` from `scene.getSceneNonce()`.
- `{ elementsMap, visibleElements }` from `renderer.getRenderableElements(...)`.
- `allElementsMap` from `scene.getNonDeletedElementsMap()`.

Then it mounts layered output:

- `<StaticCanvas ... />`
- `<NewElementCanvas ... />` when `newElement` exists
- `<InteractiveCanvas ... />`
- DOM embeddables via `renderEmbeddables()`

### Stage 2: build renderable/visible subsets

`packages/excalidraw/scene/Renderer.ts`:

- filters non-renderable runtime cases:
  - active `newElementId` is skipped from base map
  - actively edited text element is skipped from static map
- computes viewport visibility via `isElementInViewport(...)`.
- memoizes `getRenderableElements(...)` output.

### Stage 3: static scene draw

`packages/excalidraw/components/canvases/StaticCanvas.tsx`:

- sizes backing canvas to app dimensions and device scale.
- calls `renderStaticScene(...)`.

`packages/excalidraw/renderer/staticScene.ts`:

- `_renderStaticScene(...)` prepares context with `bootstrapCanvas(...)`.
- applies zoom transform.
- optionally draws grid via `strokeGrid(...)`.
- iterates `visibleElements`.
- draws each element via `renderElement(...)` from `@excalidraw/element`.
- supports RAF throttling with `renderStaticSceneThrottled`.

### Stage 4: in-progress element draw

`packages/excalidraw/components/canvases/NewElementCanvas.tsx`:

- calls `renderNewElementScene(...)` for current in-progress element layer.

### Stage 5: interactive overlay draw

`packages/excalidraw/components/canvases/InteractiveCanvas.tsx`:

- assembles remote cursor/selection render config from collaborators.
- starts animation loop using `AnimationController.start(...)`.
- calls `renderInteractiveScene(...)` each animation tick.

`packages/excalidraw/renderer/interactiveScene.ts`:

- `renderInteractiveScene(...)` wraps `_renderInteractiveScene(...)`.
- It invokes `renderConfig.callback(ret)` after rendering.

`App.renderInteractiveSceneCallback(...)` consumes callback payload and updates UI flags (e.g., `scrolledOutside`).

### Render lifecycle hooks

- `scene.onUpdate(this.triggerRender)` links scene changes to React rerender.
- `Renderer.destroy()` cancels static-scene throttled work and clears memoized renderer state.

## Package Dependencies: взаємозв'язки між packages

### Declared workspace dependencies

From package manifests:

- `packages/math/package.json`: depends on `@excalidraw/common`.
- `packages/element/package.json`: depends on `@excalidraw/common`, `@excalidraw/math`.
- `packages/excalidraw/package.json`: depends on `@excalidraw/common`, `@excalidraw/element`, `@excalidraw/math`.

### Source-level coupling

`packages/excalidraw/index.tsx` re-exports APIs from:

- `@excalidraw/element`
- `@excalidraw/common`
- `@excalidraw/utils/export`
- `@excalidraw/utils/withinBounds`

`packages/utils/src/export.ts` imports from:

- `@excalidraw/common`
- `@excalidraw/excalidraw/appState`
- `@excalidraw/excalidraw/clipboard`
- `@excalidraw/excalidraw/data/*`
- `@excalidraw/excalidraw/scene/export`
- `@excalidraw/element/types`

So `@excalidraw/utils` has direct source-level dependencies on both `@excalidraw/excalidraw` internals and element/common types.

### Alias mapping in dev/test

`tsconfig.json` path aliases map `@excalidraw/*` names to local source trees:

- common -> `packages/common/src`
- excalidraw -> `packages/excalidraw`
- element -> `packages/element/src`
- math -> `packages/math/src`
- utils -> `packages/utils/src`

`excalidraw-app/vite.config.mts` defines equivalent regex aliases for the same package names.

### Build-time dependency handling

`scripts/buildPackage.js` (`@excalidraw/excalidraw` build):

- aliases `@excalidraw/utils` to local source.
- marks `@excalidraw/common`, `@excalidraw/element`, `@excalidraw/math` as `external`.

`scripts/buildUtils.js` (`@excalidraw/utils` build):

- aliases common/element/excalidraw/math/utils to local package sources.

### Package dependency diagrams

```mermaid
flowchart LR
  common[@excalidraw/common]
  math[@excalidraw/math]
  element[@excalidraw/element]
  excalidraw[@excalidraw/excalidraw]
  host[excalidraw-app]

  math --> common
  element --> common
  element --> math
  excalidraw --> common
  excalidraw --> element
  excalidraw --> math
  host --> excalidraw
```

Manifest diagram above reflects declared `dependencies` in package manifests plus host-app import direction.

```mermaid
flowchart LR
  common[@excalidraw/common]
  element[@excalidraw/element]
  excalidraw[@excalidraw/excalidraw]
  utils[@excalidraw/utils]

  excalidraw --> utils
  utils --> excalidraw
  utils --> common
  utils --> element
```

Source-level coupling diagram above reflects import/re-export edges from `packages/excalidraw/index.tsx` and `packages/utils/src/export.ts`.
