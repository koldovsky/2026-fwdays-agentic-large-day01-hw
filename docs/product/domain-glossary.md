# Domain Glossary — Excalidraw

A glossary of key domain terms used across the Excalidraw codebase. For each
term you will find: a project-specific definition, the key files where it lives,
and a "not to be confused with" note clarifying how the term differs from its
general meaning.

---

## Element (`ExcalidrawElement`)

**Definition.** A discriminated union type representing any object on the canvas
— rectangle, arrow, text, image, etc. Every element is a JSON-serializable
record with fields such as `id`, `type`, coordinates (`x`, `y`), dimensions,
styles, and versioning (`version`, `versionNonce`).

**Key files.**

| File | Contents |
|------|----------|
| `packages/element/src/types.ts` | Base type `_ExcalidrawElementBase`, all variants (`ExcalidrawRectangleElement`, `ExcalidrawArrowElement`, …), and the final union `ExcalidrawElement` |
| `packages/element/src/typeChecks.ts` | Runtime type guards: `isLinearElement`, `isArrowElement`, `isBindableElement`, … |
| `packages/element/src/newElement.ts` | Factory functions for creating new elements |
| `packages/element/src/index.ts` | Aggregated exports, `getNonDeletedElements` |

**Element type strings (`type`):**
`selection`, `rectangle`, `diamond`, `ellipse`, `text`, `line`, `arrow`,
`freedraw`, `image`, `frame`, `magicframe`, `iframe`, `embeddable`.

**Not to be confused with.** In React/DOM context "element" means a React or DOM
element. Here `ExcalidrawElement` is a **domain model of a shape on the
canvas** with no direct relation to the React tree.

---

## Scene

**Definition.** A class that serves as the in-memory store for all canvas
elements. It holds an ordered list of elements (including soft-deleted ones),
lookup maps by `id`, frame lists, and a selection cache. It generates a
`sceneNonce` on every change to trigger re-renders.

**Key files.**

| File | Contents |
|------|----------|
| `packages/element/src/Scene.ts` | `Scene` class with methods `replaceAllElements`, `insertElement`, `getSelectedElements`, `mutateElement`, `onUpdate`, etc. |
| `packages/excalidraw/components/App.tsx` | `App` creates a `Scene` in its constructor and holds it as `public scene` |

**Not to be confused with.** In Three.js or game engines a "scene" is a 3D
space with cameras and lights. Here `Scene` is a **flat 2D element store** with
observer-pattern subscriptions.

---

## AppState

**Definition.** A type that describes the full editor UI state: active tool,
selected elements, viewport (scroll/zoom), open menus and panels, theme,
bindings, default styles, and dozens of other fields. It serves as the React
state of the `App` component.

**Key files.**

| File | Contents |
|------|----------|
| `packages/excalidraw/types.ts` | Interface `AppState` (~line 272), `UIAppState`, `StaticCanvasAppState`, `InteractiveCanvasAppState` |
| `packages/excalidraw/components/App.tsx` | `App extends React.Component<AppProps, AppState>` |
| `packages/element/src/store.ts` | `ObservedAppState` — the subset tracked by Store |

**Derived types:**
- `UIAppState` — `AppState` minus `startBoundElement`, `cursorButton`, `scrollX`, `scrollY` (for UI components).
- `StaticCanvasAppState` / `InteractiveCanvasAppState` — slices for the respective canvases.

**Not to be confused with.** Generic "application state" can mean any global
state. Here `AppState` is a specific TypeScript interface with ~100 fields that
governs exclusively the **drawing editor state**.

---

## Tool (`ToolType` / `ActiveTool`)

**Definition.** The currently selected drawing instrument. `ToolType` is a string
union (`"selection"`, `"rectangle"`, `"arrow"`, `"text"`, `"freedraw"`,
`"hand"`, `"eraser"`, `"laser"`, etc.). `ActiveTool` is an object that can be
either a standard tool (`{ type: ToolType }`) or a custom one
(`{ type: "custom", customType: string }`).

**Key files.**

| File | Contents |
|------|----------|
| `packages/excalidraw/types.ts` | `ToolType`, `ActiveTool`, `ElementOrToolType` |
| `packages/common/src/constants.ts` | `TOOL_TYPE` — runtime tool constants |
| `packages/excalidraw/components/App.tsx` | `setActiveTool` — switching method |
| `packages/excalidraw/components/toolbar/` | UI buttons for tool selection |

**Not to be confused with.** In CLI/DevOps "tool" means any utility. Here it is
a **specific canvas interaction mode** (pen, shape, eraser, etc.) that
determines how clicks and gestures are interpreted.

---

## Action (`Action` / `ActionManager`)

**Definition.** An encapsulated operation on the editor: style change, alignment,
copy, undo/redo, z-order change, export, etc. Each `Action` is an object with a
`name`, a `perform` function (returns an `ActionResult` with new `elements` /
`appState`), optional `keyTest` for hotkeys, and a `PanelComponent` for UI.
`ActionManager` is the dispatcher that registers all actions, handles keyboard
events, and renders panels.

**Key files.**

| File | Contents |
|------|----------|
| `packages/excalidraw/actions/types.ts` | Interfaces `Action`, `ActionResult`, `ActionName`, `ActionFn` |
| `packages/excalidraw/actions/manager.tsx` | Class `ActionManager`: `registerAction`, `executeAction`, `handleKeyDown`, `renderAction` |
| `packages/excalidraw/actions/action*.ts(x)` | Concrete actions (`actionDeleteSelected`, `actionAlign`, `actionExport`, …) |
| `packages/excalidraw/actions/register.ts` | `register()` — pushes into the global `actions` array |

**Not to be confused with.** Redux actions or GitHub Actions. Here `Action` is a
**command pattern** for editor operations with built-in hotkey support, UI
panels, and undo integration.

---

## Store (`Store` / `CaptureUpdateAction`)

**Definition.** The change-tracking mechanism for elements and state. `Store`
compares "before" and "after" snapshots of each operation and emits increments
(`DurableIncrement`, `EphemeralIncrement`) for undo/redo and collaboration sync.
`CaptureUpdateAction` is an enum indicating whether a change is undoable:
`IMMEDIATELY`, `EVENTUALLY`, or `NEVER`.

**Key files.**

| File | Contents |
|------|----------|
| `packages/element/src/store.ts` | Classes `Store`, `StoreSnapshot`, `StoreChange`, `StoreDelta`; enum `CaptureUpdateAction` |
| `packages/excalidraw/history.ts` | `History` and `HistoryDelta` — consumers of Store increments |
| `packages/excalidraw/components/App.tsx` | `App` creates `Store` and calls `commit` on every change |

**Not to be confused with.** Redux store or Jotai store. Here `Store` is a
**specialized snapshot comparator** for generating deltas, not a general state
container. General UI state lives in `AppState` (React state); atom state lives
in Jotai.

---

## History (`History` / `HistoryDelta`)

**Definition.** The undo/redo stack built on top of `Store`. `History`
accumulates `HistoryDelta` objects (subclass of `StoreDelta`) — each delta can
be applied forward or backward to the current state. Works with
`SceneElementsMap` and `AppState`, deliberately skipping `version`/
`versionNonce` so that each undo operation appears as a new user action to
collaborators.

**Key files.**

| File | Contents |
|------|----------|
| `packages/excalidraw/history.ts` | Classes `History`, `HistoryDelta` |
| `packages/excalidraw/actions/actionHistory.tsx` | Actions `actionUndo`, `actionRedo` |
| `packages/excalidraw/components/App.tsx` | `App` initializes `History` and subscribes it to `Store` |

**Not to be confused with.** Browser History API. Here `History` is an
**editor operation stack** for undoing and redoing user actions on the canvas.

---

## Collaboration (`Collab` / `Portal`)

**Definition.** The real-time module that allows multiple users to edit the same
canvas simultaneously. `Collab` is a React component that orchestrates a
session: room creation, change synchronization, cursor tracking. `Portal` is a
wrapper around the Socket.IO client that encrypts payloads before sending (E2E
encryption with the key stored in the URL hash, never sent to the server).

**Key files.**

| File | Contents |
|------|----------|
| `excalidraw-app/collab/Collab.tsx` | Class `Collab`, `CollabAPI`, session orchestration |
| `excalidraw-app/collab/Portal.tsx` | Class `Portal`: socket connection, `roomId`, `roomKey`, encryption |
| `excalidraw-app/app_constants.ts` | `WS_EVENTS` (`server-broadcast`, `server-volatile-broadcast`, …), `WS_SUBTYPES` (`INIT`, `UPDATE`, `MOUSE_LOCATION`, `IDLE_STATUS`, …) |
| `packages/excalidraw/data/reconcile.ts` | `reconcileElements` — merging remote changes with local state |

**Not to be confused with.** The generic concept of "collaboration." Here it is
a **concrete module at the `excalidraw-app` level** (not in the library) with a
WebSocket protocol, E2E encryption, and a reconciliation algorithm. The
`@excalidraw/excalidraw` library **does not include** collaboration.

---

## Library (`Library` / `LibraryItem`)

**Definition.** A collection of reusable element groups. Each `LibraryItem` (v2)
has an `id`, `status` (`"published"` | `"unpublished"`), an `elements` array,
and a `created` timestamp. `Library` is the class that manages the collection:
loading, updating, and syncing with a Jotai atom (`libraryItemsAtom`).

**Key files.**

| File | Contents |
|------|----------|
| `packages/excalidraw/types.ts` | Types `LibraryItem`, `LibraryItems`, `LibraryItem_v1` |
| `packages/excalidraw/data/library.ts` | Class `Library`, `libraryItemsAtom`, methods `setLibrary`, `updateLibrary`, `resetLibrary` |
| `packages/excalidraw/components/LibraryMenu*.tsx` | Library UI |

**Not to be confused with.** An npm library or a component library. Here
`Library` is a **palette of saved templates** (groups of elements) that can be
dragged onto the canvas and reused.

---

## ExcalidrawImperativeAPI

**Definition.** An interface for programmatic control of the editor from the
outside (from the host application). Provides methods such as `updateScene`,
`getSceneElements`, `scrollToContent`, `setActiveTool`, `addFiles`,
subscriptions (`onChange`, `onPointerDown`, `onStateChange`, …), and more.
Created via `createExcalidrawAPI()` in `App.tsx` and exposed through React
Context.

**Key files.**

| File | Contents |
|------|----------|
| `packages/excalidraw/types.ts` | Interface `ExcalidrawImperativeAPI` (~line 917) |
| `packages/excalidraw/components/App.tsx` | `createExcalidrawAPI()` — implementation |
| `packages/excalidraw/index.tsx` | `ExcalidrawAPIContext`, `useExcalidrawAPI()` |

**Not to be confused with.** React refs or the DOM API. Here it is a
**high-level API facade** for controlling the entire editor: elements, tools,
subscriptions, viewport.

---

## Renderer

**Definition.** The canvas rendering system. It consists of two layers:

- **StaticCanvas** — draws the background, grid, and all scene elements (roughjs
  for hand-drawn aesthetics, perfect-freehand for freehand strokes).
- **InteractiveCanvas** — draws interactive overlays: selection handles,
  collaborator cursors, snap lines, binding UI.

The `Renderer` class in `App` computes which elements are visible in the
viewport (frustum culling) to avoid redrawing off-screen content.

**Key files.**

| File | Contents |
|------|----------|
| `packages/excalidraw/scene/Renderer.ts` | `Renderer` class — visibility culling, memoization |
| `packages/excalidraw/renderer/staticScene.ts` | `renderStaticScene` — primary render pass |
| `packages/excalidraw/renderer/interactiveScene.ts` | `renderInteractiveScene` — interactive layer |
| `packages/excalidraw/components/canvases/StaticCanvas.tsx` | React wrapper for the static Canvas |
| `packages/excalidraw/components/canvases/InteractiveCanvas.tsx` | React wrapper for the interactive Canvas |

**Not to be confused with.** React renderer or Three.js renderer. Here it is a
**two-layer 2D Canvas renderer** with a deliberate split between static and
interactive passes for redraw optimization.

---

## FractionalIndex

**Definition.** The z-ordering (stacking order) mechanism for elements. Every
element has an `index` field of type `FractionalIndex` (a branded string). This
allows inserting elements between others without renumbering the entire list —
critical for collaboration and undo/redo.

**Key files.**

| File | Contents |
|------|----------|
| `packages/element/src/types.ts` | Type `FractionalIndex`, `OrderedExcalidrawElement` (element with non-null index) |
| `packages/element/src/fractionalIndex.ts` | `orderByFractionalIndex`, `syncMovedIndices`, `validateFractionalIndices` |
| `packages/element/src/zindex.ts` | Z-order operation helpers (bring to front, send to back, …) |

**Not to be confused with.** CSS `z-index` (an integer). Here the index is a
**string-based fractional value** (via the `fractional-indexing` library) that
allows unlimited insertions between positions.

---

## Binding (`BoundElement`)

**Definition.** The system of connections between elements. Arrows store
`startBinding` / `endBinding` (references to the element their endpoint attaches
to). Bindable elements (rectangles, diamonds, ellipses, text, images, frames)
keep a reverse list `boundElements: BoundElement[]` with pairs
`{ id, type: "arrow" | "text" }`.

**Key files.**

| File | Contents |
|------|----------|
| `packages/element/src/types.ts` | Type `BoundElement`, `boundElements` field on the base element, `ExcalidrawBindableElement` |
| `packages/element/src/binding.ts` | Binding logic: `updateBoundElements`, `unbindAffected`, `rebindAffected` |
| `packages/element/src/typeChecks.ts` | `isBindableElement` — type guard |

**Not to be confused with.** Data binding in UI frameworks (Angular, Vue). Here
"binding" is a **geometric connection** between an arrow and a shape on the
canvas.

---

## Frame (`ExcalidrawFrameElement`)

**Definition.** A container element (`type: "frame"` or `"magicframe"`) that
groups child elements. Children reference the frame via their `frameId` field.
Frames provide visual clipping of their contents during rendering.

**Key files.**

| File | Contents |
|------|----------|
| `packages/element/src/types.ts` | `ExcalidrawFrameElement`, `ExcalidrawMagicFrameElement`, `ExcalidrawFrameLikeElement` |
| `packages/element/src/frame.ts` | Frame-child relationship logic, intersection tests, clipping |
| `packages/element/src/newElement.ts` | `newFrameElement`, `newMagicFrameElement` |

**Not to be confused with.** HTML `<iframe>` or animation frame. Here `Frame`
is a **visual container on the canvas**, analogous to an artboard in Figma.

---

## Embeddable (`ExcalidrawEmbeddableElement`)

**Definition.** A canvas element (`type: "embeddable"`) that displays external
content (YouTube videos, Figma frames, arbitrary URLs). The URL is parsed into
`IframeData`, and the renderer shows either a live iframe or a placeholder.

**Key files.**

| File | Contents |
|------|----------|
| `packages/element/src/types.ts` | `ExcalidrawEmbeddableElement`, `ExcalidrawIframeLikeElement` |
| `packages/element/src/embeddable.ts` | URL parsing, `IframeData` generation |
| `packages/element/src/newElement.ts` | `newEmbeddableElement` |

**Not to be confused with.** The npm package `@excalidraw/excalidraw` as an
"embeddable component." Here `Embeddable` is a **specific element type on the
canvas** for inserting external web content, not the editor component itself.

---

## BinaryFiles (`BinaryFileData` / `BinaryFiles`)

**Definition.** The binary data storage system for images. `BinaryFileData`
contains `id` (FileId), `mimeType`, `dataURL` (base64), and a `created`
timestamp. `BinaryFiles` is `Record<id, BinaryFileData>`, stored on `App`
separately from elements. `ExcalidrawImageElement` references a file via
`fileId`.

**Key files.**

| File | Contents |
|------|----------|
| `packages/excalidraw/types.ts` | Types `BinaryFileData`, `BinaryFiles`, `BinaryFileMetadata` |
| `packages/excalidraw/components/App.tsx` | `public files: BinaryFiles = {}`, `addFiles()` |

**Not to be confused with.** A filesystem or blob storage. Here `BinaryFiles`
is an **in-memory map** of base64 image data that lives alongside the scene and
is synchronized separately from elements.

---

## Reconciliation (`reconcileElements`)

**Definition.** The algorithm for merging remote changes with local state during
collaboration. It compares `version` and `versionNonce` of each element, skips
elements being edited locally, and deterministically resolves conflicts (the
element with the lower `versionNonce` wins).

**Key files.**

| File | Contents |
|------|----------|
| `packages/excalidraw/data/reconcile.ts` | `reconcileElements`, `shouldDiscardRemoteElement`, types `ReconciledExcalidrawElement`, `RemoteExcalidrawElement` |
| `excalidraw-app/collab/Collab.tsx` | Reconciliation invoked on `SCENE_UPDATE` receipt |

**Not to be confused with.** React reconciliation (virtual DOM diffing). Here it
is a **CRDT-like merge** of canvas elements from different users.

---

## AppEventBus

**Definition.** A typed pub/sub system for decoupled cross-module communication
within the editor. Built on a lightweight `Emitter`, it supports cardinality
(`"once"` / `"many"`), replay (`"none"` / `"last"`), and promisification of
one-shot events. Used for lifecycle events (`editor:mount`,
`editor:initialize`, `editor:unmount`).

**Key files.**

| File | Contents |
|------|----------|
| `packages/common/src/appEventBus.ts` | Class `AppEventBus`, types `AppEventPayloadMap`, `AppEventBehavior` |
| `packages/common/src/emitter.ts` | Base `Emitter` class |
| `packages/excalidraw/components/App.tsx` | Event bus creation and usage |

**Not to be confused with.** DOM `EventTarget` or Node.js `EventEmitter`. Here
it is an **internal typed event bus** with replay and cardinality constraints,
designed for editor lifecycle events.

---

## Jotai Stores (`editor-jotai` / `app-jotai`)

**Definition.** Two isolated Jotai stores that prevent atom leakage between
layers:

- **`editor-jotai`** — atoms for the editor internals (tools, selection, zoom).
  Isolated via `jotai-scope`.
- **`app-jotai`** — atoms for the host application (collaboration state, UI
  preferences).

ESLint forbids direct `import { ... } from "jotai"` — all code must import from
`editor-jotai` or `app-jotai`.

**Key files.**

| File | Contents |
|------|----------|
| `packages/excalidraw/editor-jotai.ts` | Store and hooks for editor atoms |
| `excalidraw-app/app-jotai.ts` | Store and hooks for app atoms |
| `.eslintrc.json` | `no-restricted-imports` rule for jotai |

**Not to be confused with.** Redux store or React Context. Here Jotai is used as
an **atomic state manager** with a physical split into two scopes to enforce the
library/app boundary.

---

## SceneElementsMap

**Definition.** `Map<ExcalidrawElement["id"], OrderedExcalidrawElement>` — the
primary data structure for storing elements in `Scene` and `StoreSnapshot`.
Provides O(1) lookup by `id` and preserves insertion order (matching z-order).

**Key files.**

| File | Contents |
|------|----------|
| `packages/element/src/types.ts` | Type definition `SceneElementsMap` |
| `packages/element/src/Scene.ts` | `getElementsMapIncludingDeleted()`, `getNonDeletedElementsMap()` |
| `packages/element/src/store.ts` | Snapshot stores `elements: SceneElementsMap` |

**Not to be confused with.** A plain JavaScript `Map` or array. Here it is a
**branded Map** guaranteeing all values are `OrderedExcalidrawElement` (non-null
`FractionalIndex`).

---

## ExcalidrawInitialDataState

**Definition.** The input data type for initializing the editor. Contains
optional `elements`, `appState`, `files`, `scrollToContent`, and
`libraryItems`. Passed as the `initialData` prop to `<Excalidraw />`.

**Key files.**

| File | Contents |
|------|----------|
| `packages/excalidraw/types.ts` | Type `ExcalidrawInitialDataState` |
| `packages/excalidraw/data/types.ts` | Base `ImportedDataState` |
| `packages/excalidraw/index.tsx` | `initialData` prop |
| `packages/excalidraw/components/App.tsx` | Loading and restoring initial data |

**Not to be confused with.** React `defaultProps` or `useState` initial state.
Here it is a **full serialized scene snapshot** (elements + state + files) that
can come from a file, a server, or a URL.
