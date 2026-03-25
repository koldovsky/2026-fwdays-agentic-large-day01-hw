# Architecture (fact-based, from source)

This document describes the monorepo architecture and runtime flows **strictly** based on the source code in this repository. Terminology: `appState` = the editor’s React state (`packages/excalidraw/components/App.tsx`), `elements` = the scene elements (`packages/element/src/Scene.ts`), `actionManager` = the actions registry/dispatcher (`packages/excalidraw/actions/manager.tsx`).

---

## High-level Architecture

This repository is a **Yarn workspaces monorepo** (`package.json`: `workspaces: ["excalidraw-app","packages/*","examples/*"]`). The core editor lives in `packages/excalidraw`, while domain logic is split into separate packages (`packages/common`, `packages/math`, `packages/element`, `packages/utils`).

Key runtime components of the editor (based on imports and instances created in `App`):

- `App` (a React class component) creates and holds:
  - `Scene` (from `@excalidraw/element`) for storing elements and maintaining a nonce for cache invalidation.
  - `Renderer` (from `packages/excalidraw/scene/Renderer.ts`) to compute `elementsMap` and `visibleElements`.
  - `ActionManager` (from `packages/excalidraw/actions/manager.tsx`) to register/execute Actions.
  - `canvas` + `rc` (a roughjs canvas wrapper) used by `StaticCanvas` / `NewElementCanvas`.

Mermaid diagram (runtime module structure of the editor):

```mermaid
flowchart TD
  Host[Host app / excalidraw-app / examples] -->|renders React component| ExcalidrawPkg[@excalidraw/excalidraw]

  subgraph ExcalidrawPkgGroup
    App[App (packages/excalidraw/components/App.tsx)]
    AM[ActionManager (packages/excalidraw/actions/manager.tsx)]
    Scene[Scene (packages/element/src/Scene.ts)]
    Rend[Renderer (packages/excalidraw/scene/Renderer.ts)]
    StaticC[StaticCanvas (packages/excalidraw/components/...)]
    NewElC[NewElementCanvas (packages/excalidraw/components/canvases/NewElementCanvas.tsx)]
    InterC[InteractiveCanvas (packages/excalidraw/components/canvases/InteractiveCanvas.tsx)]
  end

  App --> AM
  App --> Scene
  App --> Rend
  Rend -->|getRenderableElements| App

  App -->|props/state/refs| StaticC
  App -->|when appState.newElement| NewElC
  App -->|interactive input canvas| InterC

  InterC -->|renderInteractiveScene| InterRender[renderer/interactiveScene.ts]
  StaticC -->|renderStaticScene| StaticRender[renderer/staticScene.ts]
  NewElC -->|renderNewElementScene| NewElRender[renderer/renderNewElementScene.ts]

  NewElRender -->|renderElement(...)| ElementRender[@excalidraw/element renderElement]
  StaticRender -->|renderElement(...)| ElementRender
  InterRender -->|element-level rendering helpers| ElementRender
```

---

## Data Flow: how data moves through the system

Below is the concrete data flow between the main parts as implemented in code.

### 1) Inputs from the host

The host passes data into `@excalidraw/excalidraw` via `ExcalidrawProps` / `AppProps` (`packages/excalidraw/types.ts`):

- `initialData` (can be a function or a promise) for initial scene state.
- `onChange(elements, appState, files)` callback for outbound notifications.
- `onIncrement(event)` callback for incremental updates (conditional subscription; see `componentDidMount`).
- UI options (`UIOptions.canvasActions`, and other UI params) that affect Action availability.

### 2) `appState` is initialized in `App` via `getDefaultAppState`

In the constructor, `App` takes the default `appState` from `getDefaultAppState()` (`packages/excalidraw/appState.ts`) and merges it with props:

- `viewModeEnabled`, `zenModeEnabled`, `gridModeEnabled`, `objectsSnapModeEnabled`, `theme`, `name`
- `width/height` are taken from `window.innerWidth/innerHeight`
- offsets come from `this.getCanvasOffsets()`

### 3) `elements` live in `Scene`, not in React state

Scene elements are stored in `Scene` (`packages/element/src/Scene.ts`):

- `elements` (including deleted) and `elementsMap`
- `nonDeletedElements` and `nonDeletedElementsMap`
- `sceneNonce` — a nonce for cache invalidation (`getSceneNonce()`), regenerated on scene updates

`App` accesses `Scene` directly (e.g. `this.scene.getNonDeletedElements()`, `getElementsIncludingDeleted()`).

### 4) User actions: events → handlers → (ActionManager | direct mutations) → updates

Canvases receive DOM events (pointer/mouse/touch/keyboard) via props passed from `App.render()`:

- `InteractiveCanvas` is wired to `App` handlers: `onPointerMove`, `onPointerDown`, `onPointerUp`, `onDoubleClick`, etc.

Then the flow branches:

- **Via `ActionManager`**:

  - `App` constructs `this.actionManager = new ActionManager(...)` and registers actions (`registerAll(actions)` + undo/redo).
  - `ActionManager.handleKeyDown()` selects an action via `keyTest`, respects `UIOptions.canvasActions`, and calls `action.perform(...)`.
  - `ActionManager.executeAction(...)` calls `action.perform(...)` for source `"api"` or others (`"ui"`, `"keyboard"`).
  - Both routes end in `this.updater(...)`, which forwards the `ActionResult` to `App.syncActionResult`.

- **Via direct `App`/`Scene` changes**:
  - `App` calls `this.setState(...)` to update `appState`.
  - `App` calls `Scene` methods (e.g. `insertElements`, `mutateElement`, `replaceAllElements`, `triggerUpdate`) — visible through numerous `this.scene.*` calls in `App.tsx`.

### 5) Outbound notifications: `onChange` and `onIncrement`

Facts from `App.tsx`:

- `componentDidMount` subscribes:
  - `this.store.onDurableIncrementEmitter.on((increment) => { this.history.record(increment.delta); })`
  - if `this.props.onIncrement` exists, then `this.store.onStoreIncrementEmitter.on((increment) => { this.props.onIncrement?.(increment); })`
- `onChange` is called via `this.props.onChange?.(elements, this.state, this.files)` (there’s logic to avoid early `onChange` during init).

### 6) Rendering as a reaction to scene updates

`App.componentDidMount()` calls `this.scene.onUpdate(this.triggerRender)` — the scene signals the editor that it should re-render.

`App.render()`:

- takes `sceneNonce = this.scene.getSceneNonce()`
- computes `{ elementsMap, visibleElements } = this.renderer.getRenderableElements({... sceneNonce, viewport/appState ...})`
- passes `elementsMap`, `visibleElements`, `allElementsMap`, and `appState` into canvases.

---

## State Management: detailed breakdown (`appState`, `elements`, `actionManager`)

This section is intentionally limited to the three entities requested.

### `appState` (the editor’s React state)

Type source:

- `packages/excalidraw/types.ts`: `export interface AppState { ... }`

Initialization and “storage/export stripping”:

- `packages/excalidraw/appState.ts`: `getDefaultAppState()`
- same file: `APP_STATE_STORAGE_CONF` + functions
  - `clearAppStateForLocalStorage(appState)`
  - `cleanAppStateForExport(appState)`
  - `clearAppStateForDatabase(appState)` which keep only keys allowed for the given storage type (`browser`/`export`/`server`).

`appState`’s role in canvas rendering:

- `packages/excalidraw/types.ts` defines subsets:
  - `StaticCanvasAppState`
  - `InteractiveCanvasAppState` and describes which fields are needed for static vs interactive canvas.
- `InteractiveCanvas.tsx` has `getRelevantAppStateProps(appState): InteractiveCanvasAppState` which selects keys from `AppState`.

Fact about the global “setter API”:

- `App` exposes `setAppState` as an alias to `this.setState`:
  - `setAppState: React.Component<any, AppState>["setState"] = (state, callback) => { this.setState(state, callback); }`
  - and passes it via `ExcalidrawSetAppStateContext.Provider` to child components (`LayerUI`, `Hyperlink`, ...).

### `elements` (scene data)

Source of truth:

- `Scene` in `packages/element/src/Scene.ts` holds:
  - `elements` and `elementsMap` (including deleted)
  - `nonDeletedElements` and `nonDeletedElementsMap`

Key facts from `Scene.ts`:

- `sceneNonce` — a “renderer cache-invalidation nonce” (explicitly described in a comment) and accessible via `getSceneNonce()`.
- `getSelectedElements(...)` caches results for the combination of:
  - `selectedElementIds`
  - `includeBoundTextElement`
  - `includeElementsInFrames` (hash is formed by `hashSelectionOpts`, cache is stored in `selectedElementsCache`).

How `App` gets elements:

- `App.render()` uses `this.scene.getSelectedElements(this.state)` for UI logic.
- `App.render()` passes `this.scene.getNonDeletedElements()` into `ExcalidrawElementsContext.Provider`.
- For actions: `ActionManager` gets elements via the callback `() => this.scene.getElementsIncludingDeleted()`.

### `actionManager` (`ActionManager`)

Definition:

- `packages/excalidraw/actions/manager.tsx`: `export class ActionManager { ... }`

Structural facts:

- `actions: Record<ActionName, Action>` — action registry keyed by name.
- `registerAction(action)` and `registerAll(actions)` — registration.
- `handleKeyDown(event)`:
  - sorts actions by `keyPriority` (desc)
  - filters availability via `UIOptions.canvasActions` (whitelist/flag per-action)
  - checks `action.keyTest(...)`
  - bails if the match is not exactly one, or if `viewModeEnabled` and `action.viewMode !== true`
  - calls `action.perform(elements, appState, value, app)` and forwards the result into `updater`
- `executeAction(action, source, value)`:
  - reads `elements` + `appState` via getters
  - calls `action.perform(...)`

Fact about async `ActionResult`:

- in the `ActionManager` constructor, `updater` is wrapped:
  - if `ActionResult` is promise-like (`isPromiseLike`), it waits for `.then(...)` and then calls the updater.
  - otherwise it calls the updater synchronously.

Fact about UI panel rendering:

- `renderAction(name, data?)` returns a `PanelComponent` if the action has `PanelComponent` and it’s enabled via `UIOptions.canvasActions`.

---

## Rendering Pipeline: from React component to canvas

The pipeline consists of three canvas layers rendered from `App.render()`:

- `StaticCanvas` (main scene)
- `NewElementCanvas` (overlay for `appState.newElement`)
- `InteractiveCanvas` (interactive layer with pointer events)

### 1) React → preparing render inputs

In `App.render()`:

- `sceneNonce = this.scene.getSceneNonce()`
- `this.renderer.getRenderableElements(...)` receives:
  - viewport: `zoom`, `offsetLeft/offsetTop`, `scrollX/scrollY`, `height/width`
  - `editingTextElement` and `newElementId` (to avoid rendering the edited text and the new element twice)
  - `sceneNonce` as a parameter for memoize invalidation

Output:

- `elementsMap: RenderableElementsMap` (map for rendering)
- `visibleElements: NonDeletedExcalidrawElement[]` (viewport subset)

Fact from `Renderer.getRenderableElements()` (`packages/excalidraw/scene/Renderer.ts`):

- builds `elementsMap` from `scene.getNonDeletedElements()`, skipping:
  - `newElementId`
  - the text element currently being edited (`editingTextElement.type === "text"`)
- computes `visibleElements` via `isElementInViewport(...)` (from `@excalidraw/element`)
- returns the result via `memoize(...)` (invalidated via `sceneNonce`)

### 2) `StaticCanvas` (rendering the “main” scene)

`StaticCanvas` receives:

- `canvas={this.canvas}` (created in the constructor as a DOM canvas)
- `rc={this.rc}` (roughjs canvas wrapper: `rough.canvas(this.canvas)`)
- `elementsMap`, `visibleElements`, `allElementsMap`
- `appState` and `renderConfig` (imageCache, grid, theme, pendingFlowchartNodes, …)

The concrete render function for the static layer is `renderStaticScene` / `renderStaticSceneThrottled` (`packages/excalidraw/renderer/staticScene.ts`), which `Renderer.destroy()` cancels.

### 3) `NewElementCanvas` (rendering the “newElement” overlay)

`packages/excalidraw/components/canvases/NewElementCanvas.tsx`:

- has a local `canvasRef`
- calls `renderNewElementScene(config, isRenderThrottlingEnabled())` in `useEffect`
- the config contains:
  - `newElement: props.appState.newElement`
  - `elementsMap`, `allElementsMap`, `rc`, `appState`, `renderConfig`, `scale`

`packages/excalidraw/renderer/renderNewElementScene.ts` (facts):

- calls `getNormalizedCanvasDimensions(canvas, scale)` and `bootstrapCanvas(...)`
- `context.scale(appState.zoom.value, appState.zoom.value)` (zoom is applied to the context)
- if `newElement` exists and is not `selection`:
  - if `isInvisiblySmallElement(newElement)` → early return
  - may apply a frame clip (`frameClip(...)`) if:
    - there is a `frameId` (from `newElement.frameId` or `appState.frameToHighlight?.id`)
    - `appState.frameRendering.enabled && appState.frameRendering.clip`
    - `shouldApplyFrameClip(...)` returns true
  - calls `renderElement(newElement, ..., context, renderConfig, appState)`
- otherwise `context.clearRect(...)`

### 4) `InteractiveCanvas` (pointer events + interactive render)

`packages/excalidraw/components/canvases/InteractiveCanvas.tsx`:

- renders `<canvas className="excalidraw__canvas interactive" ... />`
- prepares `rendererParams` in `useEffect`:
  - remote collaborators data (`remotePointerViewportCoords`, `remoteSelectedElementIds`, usernames, states, button)
  - `selectionColor` from CSS variable `--color-selection`
  - `renderConfig` includes `lastViewportPosition: props.app.lastViewportPosition`
- starts an animation loop via `AnimationController.start(...)` with key `INTERACTIVE_SCENE_ANIMATION_KEY`
- inside the loop, calls `renderInteractiveScene({ ...rendererParams.current!, deltaTime, animationState: state })`
  - takes `animationState` from the result and returns it/`undefined` (controls animation continuation)

---

## Package Dependencies: relationships between packages

These are the **actual** dependencies as declared in each package’s `package.json`.

### Workspace packages

- `@excalidraw/common` (`packages/common/package.json`)
  - depends on `tinycolor2`
- `@excalidraw/math` (`packages/math/package.json`)
  - depends on `@excalidraw/common`
- `@excalidraw/element` (`packages/element/package.json`)
  - depends on `@excalidraw/common`, `@excalidraw/math`
- `@excalidraw/utils` (`packages/utils/package.json`)
  - depends on: `@braintree/sanitize-url`, `@excalidraw/laser-pointer`, `browser-fs-access`, `pako`, `perfect-freehand`, `png-*`, `roughjs`, …
- `@excalidraw/excalidraw` (`packages/excalidraw/package.json`)
  - depends on: `@excalidraw/common`, `@excalidraw/math`, `@excalidraw/element`, `@excalidraw/utils`, plus many UI/editor libs (e.g. `jotai`, `roughjs`, `radix-ui`, …)
  - has `peerDependencies`: `react`, `react-dom`
- `excalidraw-app` (`excalidraw-app/package.json`)
  - depends on `react`, `react-dom`, `jotai`, `firebase`, `socket.io-client`, …
  - imports `@excalidraw/excalidraw` in code (there are many files with such imports)

### Mermaid: dependency graph (packages)

```mermaid
flowchart LR
  Common[@excalidraw/common]
  Math[@excalidraw/math]
  Element[@excalidraw/element]
  Utils[@excalidraw/utils]
  Excalidraw[@excalidraw/excalidraw]
  App[excalidraw-app]
  Examples[examples/*]

  Math --> Common
  Element --> Common
  Element --> Math

  Excalidraw --> Common
  Excalidraw --> Math
  Excalidraw --> Element
  Excalidraw --> Utils

  App --> Excalidraw
  Examples --> Excalidraw
```

### Code-level import relationships (examples from code)

- `packages/excalidraw/components/App.tsx`
  - creates `Scene` from `@excalidraw/element` and `Renderer` from `packages/excalidraw/scene/Renderer.ts`
  - creates `ActionManager` from `packages/excalidraw/actions/manager.tsx`
- `packages/excalidraw/renderer/renderNewElementScene.ts`
  - imports `renderElement`, `shouldApplyFrameClip`, `getTargetFrame` from `@excalidraw/element`
  - uses `throttleRAF` from `@excalidraw/common`
- `packages/excalidraw/scene/Renderer.ts`
  - imports `isElementInViewport` from `@excalidraw/element`
  - uses `memoize` from `@excalidraw/common`
- `packages/element/src/renderElement.ts`
  - uses `@excalidraw/common` (constants/utils) and `@excalidraw/math`
  - accepts `StaticCanvasAppState` / `InteractiveCanvasAppState` types from `@excalidraw/excalidraw/types`
