# Domain Glossary

A reference of terms as they are used in the `excalidraw-monorepo` codebase. Each entry gives the exact name from the TypeScript sources, a project-specific definition, the files where the term is most relevant, and a note on how it differs from its general-language meaning.

---

## ExcalidrawElement

**Definition in this project**
The serializable data record for a single drawn object on the canvas. Every shape, line, arrow, text label, image, frame, and selection marquee is represented as an `ExcalidrawElement`. All concrete types extend the common base `_ExcalidrawElementBase` (with fields `id`, `x`, `y`, `width`, `height`, `angle`, `strokeColor`, `fillStyle`, `version`, `versionNonce`, `index`, `groupIds`, `frameId`, `boundElements`, `isDeleted`, etc.) and are discriminated by a `type` literal (`"rectangle"`, `"text"`, `"arrow"`, `"frame"`, `"image"`, …). The object is intended to be JSON-serializable and to contain no ephemeral local state.

**Key files**
- `packages/element/src/types.ts` — full type hierarchy (`_ExcalidrawElementBase`, concrete element types, union `ExcalidrawElement`)
- `packages/excalidraw/components/App.tsx` — reads and mutates elements through `Scene` and actions
- `packages/excalidraw/actions/` — every action works with `ExcalidrawElement[]`

**Not to be confused with**
In general DOM terminology an "element" means an HTML node. Here, `ExcalidrawElement` is an entirely separate plain-data record describing a drawn shape stored in the `Scene`, unrelated to the React or DOM tree.

---

## Element

**Definition in this project**
Informal shorthand for `ExcalidrawElement` used throughout comments, documentation, and variable names (`elements`, `newElement`, `selectedElements`). When code or docs say "element" without qualification they mean an instance of `ExcalidrawElement`.

**Key files**
- Same as `ExcalidrawElement` above.

**Not to be confused with**
HTML element, React element (`React.ReactElement`), or the generic programming concept of an item in a collection. The project-specific meaning is always a drawn canvas object.

---

## Scene

**Definition in this project**
A class (`packages/element/src/Scene.ts`) that owns and manages the complete ordered list of elements on the canvas. It maintains:
- `elements: OrderedExcalidrawElement[]` — the full list including soft-deleted entries
- `elementsMap` / `nonDeletedElementsMap` — keyed lookup structures
- Frame-like element caches
- A selection cache
- `sceneNonce` — a random integer bumped on every change, used for render-cache invalidation

Mutations go through `replaceAllElements`, which re-indexes fractional indices and notifies subscribers via `triggerUpdate`. The `App` class constructs a single `Scene` instance and stores it as `this.scene`.

**Key files**
- `packages/element/src/Scene.ts` — class definition
- `packages/excalidraw/components/App.tsx` — `this.scene = new Scene()`, `syncActionResult`
- `packages/excalidraw/scene/Renderer.ts` — reads non-deleted elements from the scene

**Not to be confused with**
In graphics engines "scene" often refers to a 3-D scene graph. Here `Scene` is a flat ordered list with an index and subscription system — it is not a React component, not React state, and contains no UI logic.

---

## AppState

**Definition in this project**
The interface (`packages/excalidraw/types.ts`) that describes all React state held on the `App` class component (`class App extends React.Component<AppProps, AppState>`). It aggregates:
- Editor/UI mode: `viewModeEnabled`, `zenModeEnabled`, `gridModeEnabled`, dialogs, sidebars, toasts
- Active tool: `activeTool`, `penMode`, laser flags
- Transient drawing/editing: `newElement`, `resizingElement`, `multiElement`, `editingTextElement`, `editingGroupId`, `editingFrame`, `selectedLinearElement`
- Viewport: `scrollX`, `scrollY`, `zoom`, `width`, `height`
- Selection: `selectedElementIds`, `hoveredElementIds`, `selectedGroupIds`
- Collaboration: `collaborators` (`Map<SocketId, Collaborator>`), `userToFollow`, `followedBy`
- Export: `exportBackground`, `exportScale`, `exportWithDarkMode`, `fileHandle`
- Binding: `isBindingEnabled`, `startBoundElement`, `suggestedBinding`, `bindMode`
- Frames: `frameRendering`, `frameToHighlight`, `elementsToHighlight`

Defaults come from `getDefaultAppState()` in `packages/excalidraw/appState.ts`. Each key is annotated in `APP_STATE_STORAGE_CONF` to indicate whether it should be persisted to the browser, to export files, or to the server.

**Key files**
- `packages/excalidraw/types.ts` — interface definition
- `packages/excalidraw/appState.ts` — defaults and storage config
- `packages/excalidraw/components/App.tsx` — `this.state`, `this.setState`

**Not to be confused with**
Generic "application state" or a Redux/Zustand store. `AppState` is the React `setState` state of a single class component; canvas element data lives separately in `Scene`, not in `AppState`.

---

## UIAppState

**Definition in this project**
A derived type defined as `Omit<AppState, "startBoundElement" | "cursorButton" | "scrollX" | "scrollY">`. It strips fields that are internal canvas concerns (active binding preview, pointer button state, scroll position) and is used as the prop/context type for UI components that should not depend on those values. Exposed through `useUIAppState()` from `packages/excalidraw/context/ui-appState.ts`.

**Key files**
- `packages/excalidraw/types.ts` — type declaration
- `packages/excalidraw/context/ui-appState.ts` — React context and hook
- `packages/excalidraw/components/LayerUI.tsx`, command palette, publish dialogs

**Not to be confused with**
A separate state manager. `UIAppState` is the same data structure as `AppState` with a few fields removed — a TypeScript-level narrowing for cleaner component APIs.

---

## ActiveTool

**Definition in this project**
A type (`packages/excalidraw/types.ts`) that records the currently selected drawing tool:
```
type ActiveTool =
  | { type: ToolType; customType: null }
  | { type: "custom"; customType: string };
```
`ToolType` is a union of string literals: `"selection"`, `"rectangle"`, `"ellipse"`, `"diamond"`, `"arrow"`, `"line"`, `"freedraw"`, `"text"`, `"image"`, `"eraser"`, `"hand"`, `"frame"`, `"magicframe"`, `"embeddable"`, `"laser"`. Stored as `AppState.activeTool`. The `App` class exposes `setActiveTool` to change it.

**Key files**
- `packages/excalidraw/types.ts` — `ToolType`, `ActiveTool` declarations
- `packages/excalidraw/components/App.tsx` — `setActiveTool`, pointer event handling
- `packages/excalidraw/components/` toolbar components

**Not to be confused with**
A plugin, capability, or feature flag. "Tool" here is a mode that controls which kind of element the next pointer interaction will create or modify. `lastActiveTool` is a companion field that remembers the previous tool for temporary switches (e.g. hand/eraser).

---

## Action

**Definition in this project**
An object conforming to the `Action` interface (`packages/excalidraw/actions/types.ts`). Each action has:
- `name: ActionName` — unique identifier
- `perform(elements, appState, value, app): ActionResult | Promise<ActionResult>` — pure-ish computation returning patches
- Optional `keyTest`, `predicate`, `PanelComponent`, `trackEvent`

All registered actions live in `packages/excalidraw/actions/`. `ActionManager.executeAction` calls `perform` and funnels the result through `App.syncActionResult`.

**Key files**
- `packages/excalidraw/actions/types.ts` — `Action`, `ActionResult`, `ActionName` interfaces
- `packages/excalidraw/actions/manager.tsx` — registration, execution
- `packages/excalidraw/actions/` — individual action files (delete, align, distribute, export, …)

**Not to be confused with**
Redux actions (plain objects with a `type` field). Here `Action` is an object with behaviour (`perform`). The return value `ActionResult` carries the proposed state changes, not the action name.

---

## ActionResult

**Definition in this project**
The return type of `Action.perform`. It is either `false` (no-op / abort) or an object:
```typescript
{
  elements?: readonly ExcalidrawElement[];
  appState?: Partial<AppState>;
  files?: BinaryFiles;
  captureUpdate: CaptureUpdateActionType;  // required
  replaceFiles?: boolean;
}
```
`App.syncActionResult` reads this object: it schedules a history capture via `captureUpdate`, replaces scene elements, merges `appState` into React state, and handles files.

**Key files**
- `packages/excalidraw/actions/types.ts`
- `packages/excalidraw/components/App.tsx` — `syncActionResult`

**Not to be confused with**
An HTTP response or side-effectful result. `ActionResult` is a declarative diff: the action says what should change; the `App` applies it.

---

## ActionManager

**Definition in this project**
A class (`packages/excalidraw/actions/manager.tsx`) that holds a registry of all `Action` objects and routes user input to them. It is constructed in `App`'s constructor and receives:
- `updater` (`this.syncActionResult`) — applies results
- `getAppState` / `getElementsIncludingDeleted` — read current state
- `app` — the `App` instance

Key methods: `registerAction`, `registerAll`, `executeAction`, `handleKeyDown` (keyboard dispatch), `renderAction` (mounts `PanelComponent` for toolbar/panel UI).

**Key files**
- `packages/excalidraw/actions/manager.tsx`
- `packages/excalidraw/components/App.tsx` — construction and context provider

**Not to be confused with**
A router, middleware, or Redux middleware. `ActionManager` is a simple registry and dispatcher specific to this editor's command pattern.

---

## CaptureUpdateAction

**Definition in this project**
A const object with three string-literal values that controls how a mutation is recorded by the `Store`:
- `IMMEDIATELY` — record an undo entry right away
- `NEVER` — do not record (e.g. remote/collaboration changes, initial load)
- `EVENTUALLY` — defer until the next `IMMEDIATELY` capture (batched typing, dragging)

Every `ActionResult` must include one of these values as `captureUpdate`.

**Key files**
- `packages/element/src/store.ts` — declaration and `scheduleAction`/`scheduleMicroAction` logic

**Not to be confused with**
A general "debounce" or "batch" concept. The three values have precise undo-stack semantics: `EVENTUALLY` deferred actions are merged into the next durable snapshot rather than creating their own history entry.

---

## Store

**Definition in this project**
A class (`packages/element/src/store.ts`) that bridges the current scene + app state to the `History` system. It holds a `StoreSnapshot`, schedules macro and micro capture actions via `scheduleAction` / `scheduleMicroAction`, and exposes `commit` (called from `App.componentDidUpdate` after every React update). On commit it emits:
- `DurableIncrement` — when elements or observed app state actually changed (feeds undo history)
- `EphemeralIncrement` — for transient pointer/collaboration changes not recorded in history

**Key files**
- `packages/element/src/store.ts`
- `packages/excalidraw/components/App.tsx` — `this.store = new Store(this)`, `store.commit`, `store.scheduleAction`

**Not to be confused with**
A Redux store, Zustand store, or Jotai store. Excalidraw also uses a Jotai store (`editorJotaiStore`) for atom-based UI state; the `Store` class here is exclusively about undo/history capture.

---

## StoreSnapshot

**Definition in this project**
An immutable-ish value class (`packages/element/src/store.ts`) representing the state of the canvas at a point in time. Holds `SceneElementsMap` + `ObservedAppState` (a narrowed subset of `AppState` relevant to history). Provides `create`, `empty`, `getChangedElements`, and `applyChange`. Used internally by `Store` to compute diffs between commits.

**Key files**
- `packages/element/src/store.ts`

**Not to be confused with**
A full clone of `AppState`. `StoreSnapshot` intentionally excludes most UI fields through `ObservedAppState`; only fields that matter for undo-redo participate in snapshot comparison.

---

## History

**Definition in this project**
A class (`packages/excalidraw/history.ts`) managing the undo/redo stacks. It holds `undoStack` and `redoStack` of `HistoryDelta` entries. `record(delta)` pushes inverse deltas onto the undo stack and clears redo on non-empty element changes. `undo` / `redo` pop deltas and return updated element maps + app state as `ActionResult` with `CaptureUpdateAction.NEVER`. Constructed in `App` as `this.history = new History(this.store)`.

**Key files**
- `packages/excalidraw/history.ts`
- `packages/excalidraw/actions/actionHistory.tsx` — `createUndoAction` / `createRedoAction`

**Not to be confused with**
Browser history (`window.history`) or routing history. This is exclusively the editor's undo/redo stack for canvas changes.

---

## Library / LibraryItem

**Definition in this project**
`LibraryItem` (`packages/excalidraw/types.ts`) is a named group of reusable elements: `{ id, status, elements: NonDeleted<ExcalidrawElement>[], created, name?, error? }`. The `Library` class (`packages/excalidraw/data/library.ts`) manages the current library array, persistence, merge, and update helpers. Items in the library are **not** part of the canvas `Scene`; they become scene elements only when a user drags one onto the canvas.

**Key files**
- `packages/excalidraw/types.ts` — `LibraryItem`, `LibraryItems`
- `packages/excalidraw/data/library.ts` — `Library` class
- `packages/excalidraw/components/LibraryMenu*` — UI

**Not to be confused with**
A JavaScript module library or npm package. "Library" here is the in-app shapes palette — a collection of saved element templates distinct from the active drawing.

---

## Collaboration / Collaborator

**Definition in this project**
`Collaborator` is a type (`packages/excalidraw/types.ts`) describing a remote user: `pointer`, `button`, `selectedElementIds`, `username`, `color`, `avatarUrl`, `socketId`, `isCurrentUser`, call state, etc. `AppState.collaborators` is a `Map<SocketId, Collaborator>` updated by the host application via `updateScene`. The `InteractiveCanvas` uses it to draw remote cursors and selections. The `App` class exposes `isCollaborating` as a boolean prop.

**Key files**
- `packages/excalidraw/types.ts` — `Collaborator`, `SocketId`
- `packages/excalidraw/components/App.tsx` — `updateScene` path for collaborators
- `packages/excalidraw/components/canvases/InteractiveCanvas.tsx` — renders remote pointers
- `packages/excalidraw/components/UserList.tsx` — UI list of collaborators

**Not to be confused with**
WebSocket or network protocol details. The `@excalidraw/excalidraw` library is transport-agnostic; collaboration state is injected by the host (e.g. `excalidraw-app`) through the `ExcalidrawImperativeAPI` / `updateScene` surface. The library itself only renders whatever is in the `collaborators` map.

---

## Frame

**Definition in this project**
A special element type (`ExcalidrawFrameElement`, `type: "frame"`) that groups and visually bounds a subset of other elements. Non-frame elements carry `frameId: string | null` on their base record to indicate membership. `AppState` fields `frameRendering` (controls label/outline/clip), `editingFrame`, and `frameToHighlight` manage frame interaction. `ExcalidrawMagicFrameElement` (`type: "magicframe"`) is a variant intended for AI-assisted generation workflows.

**Key files**
- `packages/element/src/types.ts` — `ExcalidrawFrameElement`, `ExcalidrawMagicFrameElement`, `ExcalidrawFrameLikeElement`, `frameId` on base
- `packages/excalidraw/types.ts` — `AppState` frame fields
- Frame-related actions in `packages/excalidraw/actions/`

**Not to be confused with**
An animation frame (`requestAnimationFrame`) or an `<iframe>`. In Excalidraw a frame is a drawn container element that scopes its member elements visually and for export.

---

## Binding

**Definition in this project**
The mechanism that attaches the endpoint of a linear element (arrow or line) to a target element. `ExcalidrawLinearElement.startBinding` and `.endBinding` each hold a `FixedPointBinding | null`: `{ elementId, fixedPoint: [number, number], mode: BindMode }`. The target element carries a `boundElements` array listing attached arrows/text. `BindMode` can be `"inside"`, `"orbit"`, or `"skip"`. `AppState` adds interaction fields: `isBindingEnabled`, `bindingPreference`, `startBoundElement`, `suggestedBinding`, `bindMode`.

**Key files**
- `packages/element/src/types.ts` — `FixedPointBinding`, `BoundElement`, `boundElements`, `startBinding`/`endBinding`
- `packages/excalidraw/types.ts` — `AppState` binding fields
- `packages/element/src/binding.ts` — binding logic

**Not to be confused with**
React data binding, two-way binding in frameworks, or JavaScript event binding. Here "binding" always means a structural link between a linear element's endpoint and a shape element on the canvas.

---

## OrderedExcalidrawElement

**Definition in this project**
`Ordered<ExcalidrawElement>` — an `ExcalidrawElement` that has been assigned a `FractionalIndex` (a branded string using rocicorp-style fractional indexing). `Scene` stores `readonly OrderedExcalidrawElement[]` so all elements in the scene have a stable, sortable `index` that supports concurrent ordering across multiple clients. New elements may have `index: null` before they are synced through `syncInvalidIndices` in `Scene.replaceAllElements`.

**Key files**
- `packages/element/src/types.ts` — `Ordered<T>`, `OrderedExcalidrawElement`, `FractionalIndex`
- `packages/element/src/Scene.ts` — stores and rebuilds ordered list

**Not to be confused with**
Array index (a plain integer position). `FractionalIndex` is a string that sorts lexicographically and can be inserted between any two existing values without renumbering the rest.

---

## Renderer / RenderableElementsMap

**Definition in this project**
`Renderer` is a class (`packages/excalidraw/scene/Renderer.ts`) responsible for computing which elements should actually be drawn on a given frame. Its `getRenderableElements` method memoizes: it reads non-deleted elements from `Scene`, excludes the element being edited as text and the in-progress `newElementId`, builds a `RenderableElementsMap` (a branded `NonDeletedElementsMap`), and then filters to `visibleElements` using viewport parameters from `AppState`. The memo is invalidated by `sceneNonce`.

**Key files**
- `packages/excalidraw/scene/Renderer.ts`
- `packages/excalidraw/scene/types.ts` — `RenderableElementsMap` brand type
- `packages/excalidraw/components/App.tsx` — `this.renderer = new Renderer(this.scene)`

**Not to be confused with**
React's renderer (`react-dom`) or a 3-D rendering engine. `Renderer` here is a pure filtering/memoization layer that decides which elements to hand to the canvas drawing functions.

---

## StaticCanvas / InteractiveCanvas

**Definition in this project**
Two separate React components that each wrap a `<canvas>` DOM element:
- `StaticCanvas` (`packages/excalidraw/components/canvases/StaticCanvas.tsx`) — draws the scene background and all visible elements using `renderStaticScene`. Memoized; redraws only when `sceneNonce`, scale, or relevant `AppState` fields change.
- `InteractiveCanvas` (`packages/excalidraw/components/canvases/InteractiveCanvas.tsx`) — draws selection handles, collaboration cursors, snap lines, and other editor chrome using `renderInteractiveScene`. Wires pointer event handlers to `App` methods.

**Key files**
- `packages/excalidraw/components/canvases/StaticCanvas.tsx`
- `packages/excalidraw/components/canvases/InteractiveCanvas.tsx`
- `packages/excalidraw/renderer/staticScene.ts`, `interactiveScene.ts`

**Not to be confused with**
HTML5 Canvas in general, or React's virtual DOM canvas. These components layer two actual canvas elements: a bottom static layer for content and a top interactive layer for editor state.

---

## ExcalidrawImperativeAPI

**Definition in this project**
The TypeScript interface (`packages/excalidraw/types.ts`) that represents the control surface the host application receives via the `onExcalidrawAPI` prop or `ref`. Commonly referred to in documentation as "the Excalidraw API". Provides methods: `updateScene`, `getSceneElements`, `getSceneElementsIncludingDeleted`, `getAppState`, `mutateElement`, `scrollToContent`, `setActiveTool`, `updateLibrary`, `history.clear`, and event subscriptions (`onChange`, `onIncrement`, `onPointerDown`, `onPointerUp`, `onScrollChange`, `onUserFollow`, `onStateChange`). Implemented in `App.createExcalidrawAPI()`.

**Key files**
- `packages/excalidraw/types.ts` — interface
- `packages/excalidraw/components/App.tsx` — `createExcalidrawAPI()` implementation
- `packages/excalidraw/index.tsx` — exposed via `ExcalidrawAPIContext`

**Not to be confused with**
A REST API or browser Web API. `ExcalidrawImperativeAPI` is an in-process JavaScript interface for embedding hosts to programmatically control the editor after mount.

---

## ExcalidrawBase / App

**Definition in this project**
Two related classes/components forming the editor root:
- `ExcalidrawBase` — the functional React component exported from `packages/excalidraw/index.tsx`. It wraps `App` inside `EditorJotaiProvider` (`editorJotaiStore`) and `InitializeApp`. This is the public API surface that embedders mount.
- `App` — the internal class component (`packages/excalidraw/components/App.tsx`, `class App extends React.Component<AppProps, AppState>`) that owns all editor state, the `Scene`, `ActionManager`, `Store`, `History`, `Library`, `Renderer`, and `Fonts` instances. Not exported publicly.

**Key files**
- `packages/excalidraw/index.tsx` — `ExcalidrawBase` (public)
- `packages/excalidraw/components/App.tsx` — `App` (internal)

**Not to be confused with**
`excalidraw-app` (the product shell SPA in `excalidraw-app/`). `excalidraw-app` is the full website; `ExcalidrawBase`/`App` is the embeddable React component that the website uses.

---

## editorJotaiStore

**Definition in this project**
A Jotai store instance (`packages/excalidraw/editor-jotai.ts`) created with `createStore()` and provided to the editor component tree via `EditorJotaiProvider`. Used for atom-based reactive state that individual components subscribe to directly, bypassing the class-based `App` state system for specific concerns (e.g. font loading, sidebar atoms). Not the same as the undo/history `Store`.

**Key files**
- `packages/excalidraw/editor-jotai.ts`
- `packages/excalidraw/index.tsx` — `EditorJotaiProvider`

**Not to be confused with**
The undo/history `Store` class (which is a different object, constructed in `App` as `this.store`). Jotai is used for reactive atom subscriptions; the `Store` class is for undo capture and emitting increments.

---

## GroupId / Group

**Definition in this project**
Elements carry `groupIds: readonly string[]` on their base record. When multiple elements share the same `groupId` string they are treated as a logical group: selection, move, and deletion operate on all members together. `AppState.selectedGroupIds: Record<GroupId, boolean>` tracks which groups are selected. Groups have no dedicated element type — grouping is encoded entirely in the `groupIds` arrays.

**Key files**
- `packages/element/src/types.ts` — `groupIds` on `_ExcalidrawElementBase`
- `packages/excalidraw/types.ts` — `selectedGroupIds`, `editingGroupId` in `AppState`
- `packages/element/src/groups.ts` — group helper utilities

**Not to be confused with**
`Frame` (which is a visible element with `type: "frame"` that clips/labels its children). Groups are invisible logical units encoded in element metadata; frames are first-class canvas elements.
