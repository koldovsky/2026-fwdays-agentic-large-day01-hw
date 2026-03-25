# Excalidraw Domain Glossary

A reference of project-specific terms as they appear in the source code.
Each entry includes: definition in the context of this project, key files, and
disambiguation from the general meaning where relevant.

---

## ExcalidrawElement

**Definition.**
The fundamental data unit on the canvas. A readonly, serialisable plain object
that describes a single shape, text block, image, or structural container.
Defined as a discriminated union over `type`.

**Key files.**
- `packages/element/src/types.ts` — base type `_ExcalidrawElementBase` and union
  `ExcalidrawElement`.
- `packages/element/src/newElement.ts` — factory functions.
- `packages/element/src/mutateElement.ts` — immutable update helpers.

**Important fields.**
`id`, `type`, `x`, `y`, `width`, `height`, `angle`, `version`, `versionNonce`,
`index` (FractionalIndex), `isDeleted`, `groupIds`, `frameId`, `boundElements`,
`seed`, `roughness`, `customData`.

**Union members.**
`ExcalidrawGenericElement` (rectangle, diamond, ellipse, selection),
`ExcalidrawTextElement`, `ExcalidrawLinearElement` (line, arrow),
`ExcalidrawFreeDrawElement`, `ExcalidrawImageElement`,
`ExcalidrawFrameElement`, `ExcalidrawMagicFrameElement`,
`ExcalidrawIframeElement`, `ExcalidrawEmbeddableElement`.

**Not to be confused with.**
DOM `Element`. ExcalidrawElement is never a DOM node; it is a data object that
gets rendered to an HTML Canvas or SVG. Elements are **immutable** value
objects — mutations produce a new object via `newElementWith()` and increment
`version`.

---

## Scene

**Definition.**
A container class that aggregates all `ExcalidrawElement` instances on the
canvas into four parallel data structures for efficient access.

**Key files.**
- `packages/element/src/Scene.ts` — class definition.

**Internal data structures.**

| Field | Type | Content |
|-------|------|---------|
| `elements` | `OrderedExcalidrawElement[]` | All elements including soft-deleted |
| `elementsMap` | `SceneElementsMap` | Map by ID, including deleted |
| `nonDeletedElements` | `NonDeletedExcalidrawElement[]` | Visible elements only |
| `nonDeletedElementsMap` | `NonDeletedSceneElementsMap` | Map by ID, non-deleted |

**Key methods.**
`replaceAllElements()`, `getSelectedElements()`, `mapElements()`,
`insertElement()`, `onUpdate(callback)`.

**Not to be confused with.**
A React concept. Scene is a framework-agnostic data structure owned by the
`App` class instance. It has no React lifecycle; React components consume it
through context providers.

---

## AppState

**Definition.**
A ~100-field interface that holds all **non-element** application state:
viewport position, active tool, selection, styling defaults, dialog/sidebar
visibility, collaboration info, and feature toggles.

**Key files.**
- `packages/excalidraw/types.ts` — `AppState` interface.
- `packages/excalidraw/appState.ts` — `getDefaultAppState()`.

**Property groups.**

| Group | Examples |
|-------|---------|
| Viewport | `scrollX`, `scrollY`, `zoom`, `width`, `height` |
| Tool | `activeTool`, `penMode`, `penDetected` |
| Selection | `selectedElementIds`, `selectedGroupIds`, `hoveredElementIds` |
| Editing | `editingTextElement`, `editingGroupId`, `croppingElementId` |
| In-progress | `newElement`, `resizingElement`, `multiElement`, `isRotating` |
| Styling defaults | `currentItemStrokeColor`, `currentItemFontSize`, … |
| Collaboration | `collaborators` (Map), `userToFollow`, `followedBy` |
| UI | `openDialog`, `openMenu`, `openSidebar`, `contextMenu` |
| Feature flags | `zenModeEnabled`, `gridModeEnabled`, `objectsSnapModeEnabled` |

**Not to be confused with.**
React component `state`. AppState is managed as `this.state` of the class
component `App`, but it is a project-specific domain type — not arbitrary React
state. Parts of AppState are persisted (viewport, styling), while others are
transient (in-progress creation, open dialogs).

---

## ActiveTool

**Definition.**
A discriminated type that identifies the current drawing/editing mode.

**Key files.**
- `packages/excalidraw/types.ts` — `ToolType` union and `ActiveTool` type.

**Built-in tool types.**
`selection`, `lasso`, `rectangle`, `diamond`, `ellipse`, `arrow`, `line`,
`freedraw`, `text`, `image`, `eraser`, `hand`, `frame`, `magicframe`,
`embeddable`, `laser`.

Extensible via `{ type: "custom"; customType: string }`.

**AppState shape.**
```typescript
activeTool: {
  type: ToolType;
  customType: string | null;
  lastActiveTool: ActiveTool | null; // for eraser / hand revert
  locked: boolean;
  fromSelection: boolean;
};
```

**Not to be confused with.**
An **Action**. A Tool is a persistent mode (e.g. "I am drawing rectangles");
an Action is a one-shot command (e.g. "delete selected elements"). Tools
determine how pointer events are interpreted; actions modify state directly.

---

## Action

**Definition.**
A self-contained command that reads current elements + AppState, performs logic,
and returns an `ActionResult` describing what changed. ~60 built-in actions
cover operations from "select all" to "toggle grid" to "export to SVG".

**Key files.**
- `packages/excalidraw/actions/types.ts` — `Action` interface, `ActionResult`,
  `ActionSource`.
- `packages/excalidraw/actions/manager.tsx` — `ActionManager` class.
- `packages/excalidraw/actions/register.ts` — bulk registration.

**Action interface (simplified).**
```typescript
interface Action {
  name: ActionName;
  label: string | ((…) => string);
  perform: (elements, appState, value, app) => ActionResult;
  keyTest?: (event, appState, elements, app) => boolean;
  predicate?: (…) => boolean;
  PanelComponent?: React.FC;
  trackEvent: false | { category, action? };
}
```

**ActionResult.**
```typescript
type ActionResult =
  | { elements?; appState?; files?; captureUpdate: CaptureUpdateActionType }
  | false;
```

Returning `false` means the action was cancelled.

**ActionSource** — where the action was triggered from:
`"ui"`, `"keyboard"`, `"contextMenu"`, `"api"`, `"commandPalette"`.

**Not to be confused with.**
A Redux action or a React event handler. Excalidraw Actions are a custom
command-pattern implementation dispatched through `ActionManager`, not a
flux/reducer pattern.

---

## ActionManager

**Definition.**
A central command bus that registers, dispatches, and renders actions.

**Key files.**
- `packages/excalidraw/actions/manager.tsx`.

**Key methods.**
- `registerAction(action)` / `registerAll(actions[])` — registration.
- `executeAction(action, source, value?)` — dispatch + state update.
- `handleKeyDown(event)` — keyboard shortcut routing.
- `renderAction(name)` — render the action's panel UI.

**Not to be confused with.**
A state store. ActionManager does not hold state; it routes commands to the
`updater` callback (`syncActionResult` in App) which applies changes to
Scene and AppState.

---

## Store

**Definition.**
An event-driven delta calculator that captures element/AppState mutations,
computes `StoreDelta` diffs, and emits `StoreIncrement` events consumed by
History and collaboration.

**Key files.**
- `packages/element/src/store.ts` — `Store`, `StoreSnapshot`, `StoreDelta`,
  `CaptureUpdateAction`, `DurableIncrement`, `EphemeralIncrement`.

**CaptureUpdateAction values.**

| Value | Undo stack | Use case |
|-------|-----------|----------|
| `IMMEDIATELY` | Recorded at once | Local user edits (typing, drawing, moving) |
| `EVENTUALLY` | Deferred until next IMMEDIATELY | Async multi-step operations |
| `NEVER` | Skipped | Remote collaboration updates, scene initialisation |

**Not to be confused with.**
A Redux store. This Store has no reducers and no global subscription model.
It computes snapshot diffs and emits events; the consumer (History) decides
what to keep.

---

## History / HistoryDelta

**Definition.**
`History` manages two stacks (`undoStack`, `redoStack`) of `HistoryDelta`
entries. Each delta encodes the minimal set of changes required to reverse
or replay a user action.

**Key files.**
- `packages/excalidraw/history.ts` — `History`, `HistoryDelta`.

**Flow.**
1. User action → Store emits `DurableIncrement` with `StoreDelta`.
2. `History.record()` converts delta to `HistoryDelta` and pushes to
   `undoStack`; clears `redoStack`.
3. Ctrl+Z → `History.undo()` pops from undo stack, applies inverse delta,
   pushes to redo stack.
4. Ctrl+Shift+Z → `History.redo()` — symmetric reverse.

**Not to be confused with.**
Browser `window.history`. This is an in-memory undo/redo system for canvas
operations, not URL navigation.

---

## DurableIncrement / EphemeralIncrement

**Definition.**
Subclasses of `StoreIncrement` that distinguish between undo-able and
transient changes.

**Key files.**
- `packages/element/src/store.ts`.

| Aspect | DurableIncrement | EphemeralIncrement |
|--------|-----------------|-------------------|
| Contains `StoreDelta` | Yes | No |
| Pushed to undo stack | Yes | No |
| Trigger | `CaptureUpdateAction.IMMEDIATELY` | `.NEVER` / `.EVENTUALLY` |
| Typical source | Local user edits | Remote collab updates, drag-in-progress |

---

## Scene (rendering context)

See the Scene class entry above. In the renderer directory, "scene" also refers
to the visual output. Two rendering functions exist:

- `renderStaticScene()` — draws shapes, grid, background to the static canvas
  layer.
- `renderInteractiveScene()` — draws selection handles, cursors, guides to the
  interactive canvas layer.

**Key files.**
- `packages/excalidraw/renderer/staticScene.ts`
- `packages/excalidraw/renderer/interactiveScene.ts`

---

## ShapeCache

**Definition.**
A static class that caches rough.js `Drawable` objects per element using a
`WeakMap`. Prevents expensive shape regeneration on every render frame.

**Key files.**
- `packages/element/src/shape.ts` — `ShapeCache`, `generateRoughOptions()`,
  `_generateElementShape()`.

**Cache key:** element reference (WeakMap).  
**Cache value:** `{ shape: ElementShape; theme: AppState["theme"] }`.

Invalidated when the element is garbage-collected or when the theme changes.
Always regenerated during export.

**Not to be confused with.**
A generic LRU cache. ShapeCache is a WeakMap keyed by element identity,
automatically releasing memory when elements are discarded.

---

## RoughCanvas / Drawable

**Definition.**
`RoughCanvas` is a rough.js wrapper around an HTML Canvas that produces
hand-drawn-style strokes. `Drawable` is rough.js's intermediate shape
representation — an abstract description that gets rendered through
`rc.draw(drawable)`.

**Key files.**
- `packages/excalidraw/components/App.tsx` — `this.rc = rough.canvas(this.canvas)`.
- `packages/element/src/renderElement.ts` — `drawElementOnCanvas()` calls
  `rc.draw()`.
- `packages/element/src/shape.ts` — `ShapeCache.generateElementShape()` returns
  `Drawable`.

**How `roughness` affects output.**
The element property `roughness` (0–2 scale in the UI) controls the irregularity
of strokes. `generateRoughOptions()` passes it to rough.js which varies
stroke wobble proportionally.

**Not to be confused with.**
Native Canvas 2D API calls. Rough.js adds a randomised sketch aesthetic on top
of standard path drawing.

---

## Library / LibraryItem

**Definition.**
A persistent collection of reusable element templates. Users can save groups of
elements to the library and later stamp them onto the canvas.

**Key files.**
- `packages/excalidraw/types.ts` — `LibraryItem` type.
- `packages/excalidraw/data/library.ts` — `Library` class,
  `LibraryPersistenceAdapter` interface.

**LibraryItem.**
```typescript
type LibraryItem = {
  id: string;
  status: "published" | "unpublished";
  elements: readonly NonDeleted<ExcalidrawElement>[];
  created: number;
  name?: string;
};
```

**Storage.** Pluggable via `LibraryPersistenceAdapter`; default backends are
localStorage and IndexedDB (`LibraryIndexedDBAdapter` in excalidraw-app).

**Not to be confused with.**
Elements on the canvas. Library items are **templates** with
published/unpublished status; canvas elements are active scene objects with a
`FractionalIndex` and live participation in rendering, selection, and
collaboration.

---

## Binding / BoundElement

**Definition.**
The mechanism by which arrows and text labels attach to shapes. When an arrow's
start or end point is bound to a rectangle, the arrow endpoint tracks the
shape as it moves.

**Key files.**
- `packages/element/src/types.ts` — `BoundElement`, `FixedPointBinding`,
  `BindMode`.
- `packages/element/src/binding.ts` — binding logic, `BindingStrategy`.

**Types.**
```typescript
type BoundElement = { id: string; type: "arrow" | "text" };

type FixedPointBinding = {
  elementId: string;
  fixedPoint: [number, number]; // normalised 0–1 ratio on target shape
  mode: "inside" | "orbit" | "skip";
};
```

Arrows store `startBinding` and `endBinding` (both `FixedPointBinding | null`).
Target shapes list their dependents in `boundElements: BoundElement[]`.

**Not to be confused with.**
Element grouping or generic linking. Binding is specifically arrow-to-shape (or
text-to-container) attachment with collision-point tracking.

---

## Collaborator

**Definition.**
Runtime representation of a remote user in a live collaboration session.

**Key files.**
- `packages/excalidraw/types.ts` — `Collaborator` type.

**Fields.**
`pointer` (cursor position), `button` (`"up"` | `"down"`),
`selectedElementIds`, `username`, `userState` (active/idle), `color`
(background + stroke), `avatarUrl`, `socketId`, `isCurrentUser`.

Stored as `AppState.collaborators: Map<SocketId, Collaborator>`.

**Not to be confused with.**
A persistent user account. Collaborator data is ephemeral and session-scoped;
it disappears when the user disconnects.

---

## Portal

**Definition.**
A class that encapsulates the socket.io WebSocket connection used for real-time
collaboration. Manages room lifecycle, encrypted scene broadcasting, pointer
location streaming, and file upload queuing.

**Key files.**
- `excalidraw-app/collab/Portal.tsx`.

**Key methods.**
`open(socket, id, key)`, `broadcastScene(type, elements, syncAll)`,
`broadcastMouseLocation()`, `queueFileUpload()`.

**Not to be confused with.**
React `createPortal()`. Excalidraw's Portal is a networking abstraction, not a
DOM rendering mechanism.

---

## CollabAPI

**Definition.**
Public interface exposed by the `Collab` component to the rest of excalidraw-app
for controlling collaboration sessions.

**Key files.**
- `excalidraw-app/collab/Collab.tsx` — `CollabAPI` interface and
  `collabAPIAtom` (Jotai).

**Methods.**
`startCollaboration()`, `stopCollaboration()`, `isCollaborating()`,
`syncElements()`, `fetchImageFilesFromFirebase()`, `setUsername()`,
`getUsername()`, `getActiveRoomLink()`, `onPointerUpdate()`.

---

## Frame / FrameLikeElement

**Definition.**
A container element that visually clips and organises child elements on the
canvas. Useful for grouping a region for export or presentation.

**Key files.**
- `packages/element/src/types.ts` — `ExcalidrawFrameElement`,
  `ExcalidrawMagicFrameElement`, `ExcalidrawFrameLikeElement`.
- `packages/excalidraw/types.ts` — `AppState.frameRendering`.

**AppState.frameRendering.**
```typescript
{ enabled: boolean; name: boolean; outline: boolean; clip: boolean }
```

**Not to be confused with.**
An HTML `<iframe>` or a layer system. Frames are drawing-level containers, not
browser embedding or Photoshop-style layers.

---

## FractionalIndex

**Definition.**
A branded string type (`string & { _brand: "franctionalIndex" }`) used for
conflict-free element ordering. Powered by the `fractional-indexing` library.

**Key files.**
- `packages/element/src/types.ts` — type definition.
- `packages/element/src/fractionalIndex.ts` — `generateNKeysBetween()`,
  `validateFractionalIndices()`, `syncMovedIndices()`.

**Why not integer indices.**
Fractional indices allow inserting between any two elements without renumbering
the rest. This is critical for concurrent collaborative edits where two users
may insert at the same position simultaneously — each gets a unique index
without conflict.

**Not to be confused with.**
CSS `z-index` (integer, requires renumbering on insert) or element `id`
(identity, not ordering).

---

## BinaryFiles / FileId

**Definition.**
`BinaryFiles` is a map (`Record<string, BinaryFileData>`) for image assets
referenced by `ExcalidrawImageElement.fileId`. Images are stored separately from
scene elements to keep the element array lightweight.

**Key files.**
- `packages/excalidraw/types.ts` — `BinaryFileData`, `BinaryFiles`, `FileId`.
- `excalidraw-app/data/firebase.ts` — Firebase Storage upload/download.
- `excalidraw-app/data/LocalData.ts` — IndexedDB persistence.

**BinaryFileData fields.**
`id` (FileId), `mimeType`, `dataURL`, `created`, `lastRetrieved`, `version`.

**Not to be confused with.**
Scene elements. Elements hold a `fileId` reference; the actual binary payload
lives in `BinaryFiles` and is persisted/synced independently (IndexedDB locally,
Firebase Storage for collaboration).

---

## Zoom / NormalizedZoomValue

**Definition.**
`NormalizedZoomValue` is a branded number (`number & { _brand: "normalizedZoom" }`)
guaranteed to be clamped between `MIN_ZOOM` and `MAX_ZOOM` and rounded to 6
decimal places.

**Key files.**
- `packages/excalidraw/types.ts` — `Zoom`, `NormalizedZoomValue`.
- `packages/excalidraw/scene/normalize.ts` — `getNormalizedZoom()`.

**Not to be confused with.**
A raw floating-point number. The branding prevents accidentally passing an
un-clamped zoom value into viewport calculations.

---

## ExcalidrawImperativeAPI

**Definition.**
The public programmatic interface returned by the `<Excalidraw />` component
via a React ref. Provides controlled access to scene manipulation, state
queries, library management, and event subscriptions.

**Key files.**
- `packages/excalidraw/types.ts` — interface definition.

**Method categories.**
- Scene: `updateScene()`, `resetScene()`, `getSceneElements()`,
  `mutateElement()`.
- State: `getAppState()`, `getFiles()`.
- UI: `setActiveTool()`, `setCursor()`, `toggleSidebar()`.
- Events: `onChange()`, `onPointerDown()`, `onPointerUp()`,
  `onScrollChange()`, `onIncrement()`.
- History: `history.clear()`.

**Not to be confused with.**
Internal `App` class methods. The imperative API is a stable public surface;
internal implementation may change freely behind it.

---

## EditorInterface

**Definition.**
A readonly descriptor of the runtime editor environment: form factor, device
platform, touch support, and sidebar availability.

**Key files.**
- `packages/common/src/editorInterface.ts` — type definition.
- `packages/excalidraw/components/App.tsx` — React context provider.

**Fields.**
`formFactor` (`"phone"` | `"tablet"` | `"desktop"`), `desktopUIMode`
(`"compact"` | `"full"`), `userAgent` (platform, isMobileDevice),
`isTouchScreen`, `canFitSidebar`, `isLandscape`.

**Not to be confused with.**
AppState UI fields. EditorInterface describes the **host environment**
(device, screen); AppState holds the **user's choices** (open dialogs, active
tool).

---

## Fonts (FONT_FAMILY)

**Definition.**
A numeric enum mapping font names to stable IDs used in element serialisation.

**Key files.**
- `packages/common/src/constants.ts` — `FONT_FAMILY` constant.
- `packages/excalidraw/fonts/` — per-font metadata and face definitions.

**Built-in fonts.**

| ID | Name | Style |
|----|------|-------|
| 1 | Virgil | Hand-drawn (default) |
| 2 | Helvetica | Sans-serif |
| 3 | Cascadia | Monospace / code |
| 5 | Excalifont | Custom with CJK support |
| 6 | Nunito | Rounded sans-serif |
| 7 | Lilita One | Display |
| 8 | Comic Shanns | Comic-style |
| 9 | Liberation Sans | Open-source sans-serif |

Fonts are lazy-loaded; the `Fonts` class manages registration and fallback
chains.

**Not to be confused with.**
CSS `font-family` strings. Excalidraw elements store a numeric font ID, not a
font name. The mapping is resolved at render time.
