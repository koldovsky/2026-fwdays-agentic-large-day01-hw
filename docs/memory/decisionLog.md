# Decision log (architectural and design decisions)

All rationale/trade-offs below are inferred only from code structure and inline comments (e.g. TODO/FIXME, PERF notes), not from unstated product intentions.

## Key Decisions

- Decision: **Use a single central editor controller class (`class App`) that owns both React UI state and the editor “model”**
  - Context: main editor engine (canvas + UI + imperative API)
  - Evidence:
    - `packages/excalidraw/components/App.tsx`: `class App extends React.Component<AppProps, AppState>`
    - `App` constructor wires `this.state`, `this.scene = new Scene()`, `this.store = new Store(this)`, `this.history = new History(this.store)`, `this.actionManager = new ActionManager(...)`, and `this.renderer = new Renderer(this.scene)`
    - `createExcalidrawAPI()` exports imperative methods and subscriptions (`updateScene`, `onChange`, `onStateChange`, `onPointerDown`, etc.)
  - Rationale (code-evidenced):
    - Centralizes integration points for hosts via a typed imperative API and event emitters (`onChangeEmitter`, `onScrollChangeEmitter`, etc.).
    - Keeps model/view synchronization inside one lifecycle, e.g. `componentDidUpdate` flushes `appStateObserver` and commits the store (`this.store.commit(elementsMap, this.state)` is present in the componentDidUpdate flow).

- Decision: **Split “document elements” into `Scene` + `Store` + `History`**
  - Context: element storage, update capture, and undo/redo
  - Evidence:
    - `packages/element/src/Scene.ts`: `class Scene` stores both arrays and maps (e.g. `elements`, `elementsMap`, `nonDeletedElementsMap`) and maintains `sceneNonce` as a renderer cache invalidation nonce.
    - `packages/element/src/store.ts`: `class Store` owns scheduled macro/micro actions, snapshots, emits increments, and exposes `onStoreIncrementEmitter`.
    - `packages/excalidraw/history.ts`: `History` is layered on `StoreDelta` for undo/redo.
  - Rationale (code-evidenced):
    - Enables explicit capture semantics via `CaptureUpdateAction` and scheduled processing (`scheduleMicroAction` vs scheduled macro actions).
    - Keeps undo/redo behavior separate from instantaneous/ephemeral changes by design (docstring in `store.ts` + `History` using `StoreDelta`).

- Decision: **Update pipeline is action-driven (`ActionManager` → `ActionResult` → `App.syncActionResult` → `Store` scheduling + React `setState`)**
  - Context: user actions, keyboard shortcuts, menu actions, and API-driven updates
  - Evidence:
    - `packages/excalidraw/components/App.tsx`: `syncActionResult` schedules `this.store.scheduleAction(actionResult.captureUpdate)` and updates `scene` via `scene.replaceAllElements(actionResult.elements)` and merges `actionResult.appState` into React state.
    - `packages/excalidraw/actions/action*` follow `ActionResult` + `captureUpdate` patterns (common imports from `@excalidraw/element`).
    - `packages/excalidraw/components/App.tsx`: `updateScene(...captureUpdate)` uses `store.scheduleMicroAction` with `getObservedAppState(...)`.
  - Rationale (code-evidenced):
    - Explicit `captureUpdate` controls what reaches undo/redo stack (documented in `updateScene`’s JSDoc and `CaptureUpdateAction` in `store.ts`).
    - Central entry point for applying results reduces drift between UI actions and API integration.

- Decision: **Render the editor using a multi-layer canvas strategy (static vs interactive)**
  - Context: canvas drawing and interactivity
  - Evidence:
    - `packages/excalidraw/components/canvases/StaticCanvas.tsx` calls `renderStaticScene(...)` with `isRenderThrottlingEnabled()` and uses `sceneNonce`/`visibleElements` memoization (`areEqual` checks `sceneNonce`, `scale`, `elementsMap`, `visibleElements`).
    - `packages/excalidraw/components/canvases/NewElementCanvas.tsx` renders with `renderNewElementScene(...)`.
    - `packages/excalidraw/components/canvases/InteractiveCanvas.tsx` uses `renderInteractiveScene(...)` and constructs collaboration render params from `props.appState.collaborators`.
    - `packages/excalidraw/components/App.tsx`: constructs `this.canvas = document.createElement("canvas")`, `this.rc = rough.canvas(this.canvas)`, and passes `rc` into both static and new-element renderers.
  - Rationale (code-evidenced):
    - Static rendering is throttled and memoized; interactive overlays are animated separately (via `AnimationController` usage in `InteractiveCanvas`).
    - Separating static and interactive work reduces UI latency while manipulating selection handles and cursors.

- Decision: **Treat rendering visibility as a first-class concern via viewport filtering**
  - Context: what gets drawn/updated
  - Evidence:
    - `packages/excalidraw/scene/Renderer.ts` computes “renderable elements” and uses `isElementInViewport(...)` (viewport visibility check).
    - `App` passes `elementsMap` and `visibleElements` into `LayerUI` and `StaticCanvas`.
  - Rationale (code-evidenced):
    - The presence of viewport culling + “visible elements” passed down indicates performance is achieved by reducing draw set size.

- Decision: **Model ordering uses per-element `version`, `versionNonce`, and fractional `index` for reconciliation and collaboration**
  - Context: element reconciliation, multiplayer ordering, undo/redo stability
  - Evidence:
    - `packages/element/src/types.ts`: `_ExcalidrawElementBase` defines:
      - `version` as “sequentially incremented … Used to reconcile elements during collaboration or when saving to server”
      - `versionNonce` as a “random integer … deterministic reconciliation … when versions are identical”
      - `index: FractionalIndex | null` as “Used for ordering in multiplayer scenarios, such as during reconciliation or undo / redo” and kept in sync with array order.
  - Rationale (code-evidenced):
    - These fields exist with explicit comments referencing collaboration/reconciliation and undo/redo ordering; this implies deterministic ordering and conflict handling are designed into the data model.

- Decision: **Manage side effects explicitly through React lifecycle + DOM event listener registry and full teardown**
  - Context: event handling, subscriptions, resource cleanup
  - Evidence:
    - `packages/excalidraw/components/App.tsx`:
      - `componentDidMount` subscribes to `store.onDurableIncrementEmitter` (and `onStoreIncrementEmitter` only if `props.onIncrement` is registered), subscribes `scene.onUpdate(this.triggerRender)`, and calls `addEventListeners()`.
      - `addEventListeners()` registers edit-mode listeners (`if (this.state.viewModeEnabled) return`) and uses an emitter-based remove strategy (`onRemoveEventListenersEmitter.once(...)`).
      - `componentWillUnmount`:
        - disables API methods to throw after unmount,
        - destroys `renderer` and `scene`,
        - clears caches and emitter listeners (`onChangeEmitter.clear()`, `store.onStoreIncrementEmitter.clear()`, etc.),
        - stops trails and disconnects `resizeObserver`.
  - Rationale (code-evidenced):
    - The teardown code is extensive, suggesting the system must avoid leaks/dangling listeners in a complex interactive environment.

- Decision: **Use explicit “init gating” to avoid triggering host callbacks during initialization**
  - Context: ordering of initialization vs state-change subscriptions
  - Evidence:
    - `packages/excalidraw/components/App.tsx` `componentDidUpdate`:
      - emits `editor:initialize` + calls `onInitialize` only once and only when `!this.state.isLoading`.
      - `onChangeEmitter.trigger(...)` is guarded with `if (!this.state.isLoading)`.
  - Rationale (code-evidenced):
    - Inline comment in `App.tsx` notes this prevents overriding persisted state with empty elements during init.

## Trade-offs (visible in code)

- Pros: centralized integration & explicit contracts
  - `createExcalidrawAPI()` + `ExcalidrawProps` callbacks provide host apps with consistent integration points.
- Pros: pragmatic stabilization via targeted fallbacks
  - Lifecycle guards (`isLoading`) prevent host `onChange` from overwriting persisted data (explicitly documented in comments).
  - Explicit UI fallbacks (HACK/FIXME notes) suggest pragmatic stabilization while the underlying architecture evolves.
- Cons: high lifecycle/side-effect density
  - `App.tsx` contains extensive DOM listener registration and teardown; a reordering risk is explicitly documented (`componentDidUpdate` comment about needing order before flushing listeners).
- Cons: hidden behavior and event-order coupling
  - Several behaviors are enforced by “hidden” internal state updates (`contextMenu: null`, mobile transform suppression) that are not expressed as a formal external contract for host apps.
  - Reliance on event ordering (`pointer up` cleanup; initialization gating) increases fragility around integration/testing and event delivery edge cases.
- Complexity risk: update scheduling correctness depends on micro/macro sequencing
  - `packages/element/src/store.ts` has `TODO: Suspicious that this is called so many places. Seems error-prone.` and distinguishes micro vs macro actions in `scheduleMicroAction` / `commit`.
- Test/state robustness needs attention
  - TODOs in tests mention leaks (e.g. selection `pointer up`), and TODOs in delta/history mention possible undo/redo edge cases under certain conditions.

## Undocumented Behavior

### Undocumented Behavior #1 — selection `pointerUp` cleanup (TODO in tests)

- **File:** `packages/excalidraw/tests/selection.test.tsx`
- **What happens:** Selection element lifecycle appears to rely on a `pointerUp` event to finalize cleanup; if `pointer up` is not triggered, a TODO notes a memory leak.
- **Where documented:** partial — only as a TODO comment in the test file.
- **Evidence:** test creates a selection on `pointerDown`, resizes on `pointerMove`, and then calls `pointerUp`; alongside it is a TODO: `There is a memory leak if pointer up is not triggered`.
- **Risk:** missing `pointerUp` handling could leak resources/listeners in real usage and make state cleanup inconsistent (also creates fragile automation in tests).

### Undocumented Behavior #2 — `contextMenu: null` on `syncActionResult` (NOTE)

- **File:** `packages/excalidraw/components/App.tsx`
- **What happens:** When an action applies `appState` (or editingTextElement/contextMenu changes) through `syncActionResult`, the editor forcibly sets `contextMenu: null`, which can prevent context menu opening when triggered via an action or host programmatically.
- **Where documented:** partial — in-code `NOTE` comment; not surfaced as an external/host-facing contract.
- **Evidence:** in `syncActionResult`, `this.setState` merges `actionAppState` but unconditionally sets:
  - `// NOTE this will prevent opening context menu using an action or programmatically from the host...`
  - `contextMenu: null,`
- **Risk:** host integrations (including AI or programmatic flows) may attempt to open a context menu and will silently fail, leading to confusing UX/regressions.

### Undocumented Behavior #3 — `onChange` gated by `isLoading` (lifecycle ordering)

- **File:** `packages/excalidraw/components/App.tsx`
- **What happens:** Host `onChange` callbacks are suppressed during initialization (`!this.state.isLoading` guard) to avoid notifying with empty elements; the component also documents an ordering dependency in `componentDidUpdate`.
- **Where documented:** partial — inline comments in lifecycle methods.
- **Evidence:**
  - `componentDidUpdate` comment: `// must be updated *before* state change listeners are triggered below`
  - `onChangeEmitter.trigger(...)` + `props.onChange(...)` guarded by:
    - `// Do not notify consumers if we're still loading the scene...`
    - `if (!this.state.isLoading) { ... }`
- **Risk:** changing initialization/lifecycle ordering or removing the `isLoading` guard can trigger `onChange` with empty elements, which would overwrite persisted state in host apps (comment explicitly references localStorage).

### Undocumented Behavior #4 — WYSIWYG theme styling (FIXME / `onChangeEmitter`)

- **File:** `packages/excalidraw/wysiwyg/textWysiwyg.tsx`
- **What happens:** The WYSIWYG text editor style update mechanism depends on the editor’s `app.onChangeEmitter` behavior for `appState.theme`; the code contains a FIXME indicating this is a workaround until Store emits theme updates.
- **Where documented:** FIXME comment inside the WYSIWYG module.
- **Evidence:**
  - `// FIXME after we start emitting updates from Store for appState.theme`
  - Subscribes to `app.onChangeEmitter.on((elements) => { if (app.state.theme !== LAST_THEME) updateWysiwygStyle(); })`
- **Risk:** theme-related text appearance may be stale or updated inconsistently if the Store emission semantics change, leading to visual regressions and hard-to-debug state sync bugs.

### Undocumented Behavior #5 — mobile linear-element transform handles (HACK)

- **File:** `packages/excalidraw/components/App.tsx`
- **What happens:** On mobile, transform/resize handles for linear elements can be disabled via a HACK condition, changing interaction affordances compared to other devices.
- **Where documented:** in-code `HACK` comment/conditional branch.
- **Evidence:**
  - `// HACK: Disable transform handles for linear elements on mobile...`
  - Conditional gating on `this.editorInterface.userAgent.isMobileDevice` and `selectedElements[0].points.length === 2`.
- **Risk:** linear element editing may be less discoverable or impossible on mobile until the condition is revisited, causing UX inconsistency and feature gaps.

## Cross-doc Links

- For detailed architecture → see [docs/technical/architecture.md](../technical/architecture.md)
- For developer setup → see [docs/technical/dev-setup.md](../technical/dev-setup.md)
- For domain glossary → see [docs/product/domain-glossary.md](../product/domain-glossary.md)
- For product requirements (PRD) → see [docs/product/PRD.md](../product/PRD.md)

