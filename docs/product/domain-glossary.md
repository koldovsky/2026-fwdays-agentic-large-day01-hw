# Domain Glossary

Dictionary of project-specific terminology as it appears in the Excalidraw codebase.

---

## Action

- **Definition**: A discrete, named operation that can be performed on elements or app state.
  Declared as an object with a `name`, a `perform()` function, and optional keyboard shortcut, context-menu label, and panel UI component.
- **Key files**:
  - `packages/excalidraw/actions/types.ts` — `Action`, `ActionName`, `ActionResult`, `ActionSource`, `ActionFn`
  - `packages/excalidraw/actions/manager.tsx` — `ActionManager` class that registers and dispatches actions
  - `packages/excalidraw/actions/` — one file per action (e.g. `actionDeleteSelected.tsx`, `actionDuplicateSelection.tsx`)
- **Do NOT confuse with**: a general user interaction or UI event. An `Action` in this project is a registered, named command with a specific `ActionName` enum value; generic pointer/keyboard events are handled directly in `App.tsx` before optionally being funnelled to an action.

---

## ActionResult

- **Definition**: The return value of `Action.perform()`. Describes the side-effects the editor should apply: updated elements, updated app state, file changes, and a `captureUpdate` directive for the undo system. May be `false` to indicate a no-op.
- **Key files**:
  - `packages/excalidraw/actions/types.ts` — type declaration
- **Do NOT confuse with**: a React event result or a network response. `ActionResult` is entirely synchronous-typed data handed back to `ActionManager` for processing.

---

## AppState

- **Definition**: The single React class-component state object owned by `App`. It contains all mutable, non-element editor state: active tool, scroll position, zoom, selection, current item styling properties, open dialogs, collaboration cursors, etc. (50+ fields).
  Divided into sub-types: `StaticCanvasAppState`, `InteractiveCanvasAppState`, `UIAppState`, `ObservedAppState` (the subset tracked by the `Store` for undo).
- **Key files**:
  - `packages/excalidraw/types.ts` — `AppState` type declaration
  - `packages/excalidraw/appState.ts` — `getDefaultAppState()` factory
  - `packages/excalidraw/components/App.tsx` — owns and mutates it via `this.setState()`
- **Do NOT confuse with**: element data (stored separately in `Scene`) or atom-based UI state (stored in Jotai stores). `AppState` is React class state; Jotai atoms are stored in `editorJotaiStore` / `appJotaiStore`.

---

## BinaryFiles

- **Definition**: A flat record mapping an element's `id` to its binary file data (image, audio, etc.). Stored separately from the element array because binary data must not be serialised inline with the scene JSON.
- **Key files**:
  - `packages/excalidraw/types.ts` — `type BinaryFiles = Record<ExcalidrawElement["id"], BinaryFileData>`
  - `excalidraw-app/data/FileManager.ts` — manages upload, download, and caching of binary files
  - `excalidraw-app/data/LocalData.ts` — persists files to IndexedDB via `idb-keyval`
- **Do NOT confuse with**: `ExcalidrawElement` objects. Elements hold only a `fileId` reference; actual binary content is looked up from `BinaryFiles`.

---

## Binding / BoundElement

- **Definition**: An association between a linear element (arrow / line) and a shape element at one or both endpoints. When bound, moving the shape also moves the arrow endpoint. Stored as `boundElements: BoundElement[]` on the container shape, and resolved bi-directionally.
- **Key files**:
  - `packages/element/src/types.ts` — `BoundElement` type (`{ id, type: "arrow" | "text" }`)
  - `packages/element/src/binding.ts` — `bindOrUnbindBindingElements`, `updateBoundElements`
  - `packages/element/src/elbowArrow.ts` — smart routing when an elbow arrow is bound
- **Do NOT confuse with**: CSS `binding` or data-binding frameworks. In this project, binding is a spatial relationship between canvas elements.

---

## CaptureUpdateAction

- **Definition**: An enum that controls whether a scene update is recorded on the undo stack. Three values:
  - `IMMEDIATELY` — pushed to undo stack right away (most user edits).
  - `EVENTUALLY` — batched into the next `IMMEDIATELY` capture (async multi-step operations).
  - `NEVER` — never recorded (remote sync, scene init, collab reconciliation).
- **Key files**:
  - `packages/element/src/store.ts` — declaration
  - `packages/excalidraw/actions/types.ts` — `ActionResult.captureUpdate` field
  - `packages/excalidraw/types.ts` — used in `updateScene` API
- **Do NOT confuse with**: `commitToHistory` (deprecated boolean from before 0.18.0; replaced by this enum).

---

## Collaborator

- **Definition**: A remote participant in a live collaboration session. Represented as `Readonly<{ pointer, button, selectedElementIds, username, userState, color, avatarUrl, socketId, … }>`. Stored in `AppState.collaborators` as a `Map<SocketId, Collaborator>`.
- **Key files**:
  - `packages/excalidraw/types.ts` — `Collaborator`, `CollaboratorPointer` types
  - `excalidraw-app/collab/Collab.tsx` — populates and updates collaborator map on incoming WebSocket messages
  - `packages/excalidraw/renderer/interactiveScene.ts` — renders collaborator cursors and laser trails
- **Do NOT confuse with**: a user account. Excalidraw has no authentication; a `Collaborator` entry exists only for the duration of the WebSocket session and is identified by `SocketId`.

---

## Delta / StoreDelta

- **Definition**: A property-level diff that records what changed between two scene snapshots. Composed of `ElementsDelta` (per-element property changes) and `AppStateDelta` (changes to `ObservedAppState`). Each delta stores both a forward direction (redo) and an inverse direction (undo).
- **Key files**:
  - `packages/element/src/delta.ts` — `ElementsDelta`, `AppStateDelta`
  - `packages/element/src/store.ts` — `StoreDelta`, produced by `Store.captureIncrement()`
  - `packages/excalidraw/history.ts` — `HistoryDelta extends StoreDelta`
- **Do NOT confuse with**: a full scene snapshot. A `StoreDelta` records only what changed, not the full state; this is the key property that makes multiplayer undo correct.

---

## Element

- **Definition** (Excalidraw-specific): A drawable object on the canvas. Every element is an immutable, JSON-serialisable TypeScript object extending `_ExcalidrawElementBase`. It has a unique `id`, a `type`, position (`x`, `y`), dimensions (`width`, `height`), a `version` integer, and an `index` (fractional) for z-order.
  Element types: `rectangle`, `diamond`, `ellipse`, `arrow`, `line`, `freedraw`, `text`, `image`, `frame`, `magicframe`, `embeddable`, `iframe`.
- **Key files**:
  - `packages/element/src/types.ts` — `ExcalidrawElement` union type and all subtypes
  - `packages/element/src/mutateElement.ts` — `mutateElement()`, `newElementWith()` (the only mutation points)
  - `packages/element/src/newElement.ts` — factory functions for each element type
- **Do NOT confuse with**: a DOM element or React element. An `ExcalidrawElement` is a plain-data record; it is rendered to a `<canvas>` by `renderElement()`, not to the DOM.

---

## ExcalidrawElement (type)

- **Definition**: The top-level TypeScript union type covering all drawable element subtypes:
  `ExcalidrawGenericElement | ExcalidrawTextElement | ExcalidrawLinearElement | ExcalidrawArrowElement | ExcalidrawFreeDrawElement | ExcalidrawImageElement | ExcalidrawFrameElement | ExcalidrawMagicFrameElement | ExcalidrawIframeElement | ExcalidrawEmbeddableElement`.
  The base `_ExcalidrawElementBase` is `Readonly<{…}>` — intentionally immutable.
- **Key files**:
  - `packages/element/src/types.ts` lines 200–220
- **Do NOT confuse with**: `Element` (the DOM interface) or the general Excalidraw usage of "element" as a concept. `ExcalidrawElement` is specifically the TypeScript type; the DOM's `Element` type is never used in element rendering code.

---

## Frame

- **Definition**: A named rectangular container element (`ExcalidrawFrameElement`, type `"frame"`). Elements assigned to a frame (`element.frameId !== null`) are clipped to the frame boundary during export and optionally during rendering. `MagicFrameElement` (`"magicframe"`) is a variant used by the AI diagram feature.
- **Key files**:
  - `packages/element/src/types.ts` — `ExcalidrawFrameElement`, `ExcalidrawFrameLikeElement`
  - `packages/element/src/frame.ts` — `getFrameChildren()`, `addElementsToFrame()`, `removeElementsFromFrames()`
  - `packages/excalidraw/actions/actionFrame.ts` — frame creation/deletion actions
- **Do NOT confuse with**: a browser frame or iframe. An `ExcalidrawFrameElement` is a visual grouping box on the canvas; `ExcalidrawIframeElement` / `ExcalidrawEmbeddableElement` are separate types that embed web content.

---

## FractionalIndex

- **Definition**: A branded `string` used to order elements for stable z-indexing in multiplayer scenarios. Based on the [fractional-indexing](https://github.com/rocicorp/fractional-indexing) algorithm. Stored as `element.index`. Always kept in sync with the array order via `syncMovedIndices()` / `syncInvalidIndices()`.
- **Key files**:
  - `packages/element/src/types.ts` — `type FractionalIndex = string & { _brand: "franctionalIndex" }`
  - `packages/element/src/fractionalIndex.ts` — all sync and validation functions
  - `packages/element/src/Scene.ts` — calls `syncMovedIndices` / `syncInvalidIndices` on every mutation
- **Do NOT confuse with**: CSS `z-index` (integer). `FractionalIndex` is a string that can be ordered lexicographically between any two existing indices without renumbering all elements.

---

## Group / GroupId

- **Definition**: A logical grouping of elements. Elements belong to zero or more groups, recorded as `element.groupIds: GroupId[]` ordered from deepest to shallowest. Groups have no separate entity — they exist only via the shared `GroupId` strings on their member elements. Selecting one group member selects all.
- **Key files**:
  - `packages/element/src/types.ts` — `type GroupId = string`
  - `packages/element/src/groups.ts` — `selectGroupsForSelectedElements()`, `getGroupElements()`
  - `packages/excalidraw/actions/actionGroup.tsx` — group / ungroup actions
- **Do NOT confuse with**: `Frame`. A group has no visible bounding box and does not clip content; a frame does.

---

## History / HistoryDelta

- **Definition**: The undo/redo stack. `HistoryDelta extends StoreDelta` and adds replay logic: `applyTo(elements, appState, snapshot) → [nextElements, nextAppState, appliedVisibleChanges]`. Version and versionNonce fields are excluded from replay to avoid spurious version bumps.
  `History` is the stack class; it holds two stacks (`undoStack`, `redoStack`) of `HistoryDelta` objects.
- **Key files**:
  - `packages/excalidraw/history.ts` — `HistoryDelta`, `History`, `HistoryChangedEvent`
- **Do NOT confuse with**: browser history or git history. `History` here is purely in-memory; it is lost on page reload (localStorage autosave is separate).

---

## Library / LibraryItem

- **Definition**: A reusable saved collection of elements. A `LibraryItem` (`v2`) has an `id`, `status` (`"published" | "unpublished"`), `elements: NonDeleted<ExcalidrawElement>[]`, and a `created` timestamp. The full library is `LibraryItems = readonly LibraryItem[]`. Stored in IndexedDB and importable/exportable as `.excalidrawlib` files.
- **Key files**:
  - `packages/excalidraw/types.ts` — `LibraryItem`, `LibraryItems`, `LibraryItemsSource`
  - `packages/excalidraw/data/library.ts` — `ExcalidrawLibrary` class, `parseLibraryTokensFromUrl`
  - `packages/excalidraw/actions/actionAddToLibrary.ts` — add selected elements to library
- **Do NOT confuse with**: an npm library or JavaScript module. In this project, "library" always refers to the user's personal stencil collection on the canvas sidebar.

---

## LinearElement / ExcalidrawLinearElement

- **Definition**: An element type representing a polyline — a sequence of `points: readonly LocalPoint[]` relative to the element's `x,y` origin. Subtypes: `ExcalidrawLineElement` (non-connectable) and `ExcalidrawArrowElement` (connectable, with optional start/end arrowheads and elbow routing).
- **Key files**:
  - `packages/element/src/types.ts` — `ExcalidrawLinearElement`, `ExcalidrawLineElement`, `ExcalidrawArrowElement`
  - `packages/element/src/linearElementEditor.ts` — `LinearElementEditor` — interactive point editing
  - `packages/element/src/elbowArrow.ts` — smart elbow routing
- **Do NOT confuse with**: `freedraw` elements (which also store points but are not connectable and use pressure data). A `LinearElement` has a discrete, editable point set; a `FreeDrawElement` stores a dense pressure-sensitive stroke.

---

## Nonce (sceneNonce / selectionNonce)

- **Definition**: A random integer regenerated on each mutation of the scene or selection. Used as a React dependency to trigger canvas redraws without deep-comparing element arrays. `sceneNonce` is updated by `Scene.replaceAllElements()`; `selectionNonce` is updated when the selection set changes.
- **Key files**:
  - `packages/element/src/Scene.ts` — `private sceneNonce`, updated at line 304 via `randomInteger()`
  - `packages/excalidraw/scene/Renderer.ts` — passes `sceneNonce` to canvas components
  - `packages/excalidraw/components/canvases/StaticCanvas.tsx` — `useEffect([sceneNonce])` triggers redraw
- **Do NOT confuse with**: a cryptographic nonce. The nonce here is only a cache-invalidation signal; it provides no security properties.

---

## ObservedAppState

- **Definition**: A narrower slice of `AppState` that the `Store` actually diffs and records for undo purposes. It excludes transient fields (e.g., `collaborators`, `isLoading`, cursor positions) that should never end up on the undo stack.
- **Key files**:
  - `packages/element/src/delta.ts` — `ObservedAppState` type
  - `packages/element/src/store.ts` — `StoreSnapshot` holds an `ObservedAppState` copy
- **Do NOT confuse with**: `AppState`. `ObservedAppState` is a strict subset; changes to fields outside it are invisible to history.

---

## Portal

- **Definition**: In the collaboration system, `Portal` is the Socket.io wrapper class that manages the WebSocket connection, room membership, and message broadcasting. Not to be confused with a React portal.
- **Key files**:
  - `excalidraw-app/collab/Portal.tsx` — `Portal` class with `open()`, `close()`, `broadcastScene()`, `broadcastMouseLocation()`
- **Do NOT confuse with**: `ReactDOM.createPortal()` (DOM rendering out-of-tree). The `Portal` class here has nothing to do with React rendering.

---

## Scene

- **Definition**: The authoritative in-memory container for all canvas elements. Holds the ordered element array and a parallel `SceneElementsMap` (`Map<id, element>`). Fires `SceneStateCallback` to subscribers (e.g., the renderer) on every mutation via `Scene.replaceAllElements()`.
- **Key files**:
  - `packages/element/src/Scene.ts` — class definition
  - `packages/excalidraw/components/App.tsx` — owns the `Scene` instance
- **Do NOT confuse with**: a theatrical scene, a React component tree, or a "scene" in a game engine. In Excalidraw, `Scene` is purely a data container + event emitter for element state; it has no rendering logic.

---

## ShapeCache

- **Definition**: A cache that maps an `ExcalidrawElement` (keyed by `id` + `version`) to its pre-computed roughjs `Drawable` object. Invalidated whenever `element.version` changes. Prevents regenerating expensive random rough strokes on every frame.
- **Key files**:
  - `packages/element/src/renderElement.ts` — `ShapeCache` usage inside `renderElement()`
  - `packages/element/src/shape.ts` — `generateRoughShape()` produces the `Drawable`
- **Do NOT confuse with**: a browser HTTP cache or image cache. `ShapeCache` is an in-memory JS `Map` scoped to the editor lifetime.

---

## Snapshot (StoreSnapshot)

- **Definition**: An immutable point-in-time copy of `{ elements: SceneElementsMap, appState: ObservedAppState }`, maintained by the `Store`. Used as the baseline for computing the next `StoreDelta`.
- **Key files**:
  - `packages/element/src/store.ts` — `StoreSnapshot` class, `StoreSnapshot.create()`, `StoreSnapshot.empty()`
- **Do NOT confuse with**: a screenshot/image export or a Firebase snapshot. `StoreSnapshot` is a lightweight in-memory clone used only for diff computation.

---

## Store

- **Definition**: The central delta-tracking class that bridges live editing to the undo system. On each `captureIncrement(elements, appState, action)` call it computes a `StoreDelta`, emits a `StoreIncrement`, and (when action is `IMMEDIATELY`) pushes a `HistoryDelta` to the `History` stack.
- **Key files**:
  - `packages/element/src/store.ts` — `Store` class
- **Do NOT confuse with**: a Redux store or Jotai store. `Store` in this project is specifically the scene-change recording mechanism; application-level atom state is in `editorJotaiStore` / `appJotaiStore`.

---

## Tool / ActiveTool

- **Definition**: The currently selected drawing or editing mode. `ToolType` is a string union: `"selection" | "lasso" | "rectangle" | "diamond" | "ellipse" | "arrow" | "line" | "freedraw" | "text" | "image" | "eraser" | "hand" | "frame" | "magicframe" | "embeddable" | "laser"`.
  `ActiveTool` is the object stored in `AppState.activeTool`; it also carries `locked` (keeps tool active after drawing) and `lastActiveTool`.
- **Key files**:
  - `packages/excalidraw/types.ts` — `ToolType`, `ActiveTool`
  - `packages/excalidraw/appState.ts` — default `activeTool` = `{ type: "selection", … }`
  - `packages/common/src/constants.ts` — `TOOL_TYPE` constant map
- **Do NOT confuse with**: an `Action`. A `Tool` determines what happens when the user interacts with the canvas; an `Action` is a discrete command. Clicking the rectangle tool changes `activeTool`; pressing Ctrl+D executes the `duplicateSelection` action.

---

## Version / VersionNonce (element fields)

- **Definition**: Two integer fields on every element used for conflict resolution in collaboration.
  - `version: number` — monotonically increasing integer, incremented on each mutation. Used to determine which copy of an element is newer.
  - `versionNonce: number` — random integer regenerated on each mutation. Used as a tiebreaker when two peers produce the same `version` concurrently.
- **Key files**:
  - `packages/element/src/types.ts` — both fields documented in `_ExcalidrawElementBase`
  - `packages/element/src/mutateElement.ts` — increments `version` and regenerates `versionNonce`
  - `packages/excalidraw/history.ts` — excluded from undo replay to avoid phantom version bumps
- **Do NOT confuse with**: schema or API versioning. These are per-element mutation counters used exclusively for CRDT-style reconciliation.
