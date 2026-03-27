# Domain Glossary

Terms are listed alphabetically. Each entry uses the name exactly as it appears in the source code.

---

## Action

**Definition**  
A discrete, named editor command that can be triggered from UI, keyboard, context menu, or the imperative API. Each `Action` object carries a `perform` function that receives the current elements and `AppState`, and returns an `ActionResult` describing what should change.

**Structure** (`packages/excalidraw/actions/types.ts`)
```ts
type Action = {
  name: ActionName;
  perform: (elements, appState, formData, app) => ActionResult | Promise<ActionResult>;
  PanelComponent?: React.FC<PanelComponentProps>;  // optional properties panel UI
  predicate?: (...) => boolean;                     // whether the action applies
  trackEvent?: { category: string; action?: string };
};

type ActionResult = {
  elements?: readonly ExcalidrawElement[] | null;
  appState?: Partial<AppState> | null;
  files?: BinaryFiles | null;
  captureUpdate: CaptureUpdateActionType;  // controls undo recording
} | false;
```

**Key files**
- `packages/excalidraw/actions/types.ts` — type definitions
- `packages/excalidraw/actions/manager.tsx` — `ActionManager` class, `executeAction`
- `packages/excalidraw/actions/register.ts` — `register` function for declaring actions
- `packages/excalidraw/actions/index.ts` — all built-in action exports
- `packages/excalidraw/components/Actions.tsx` — renders actions in the UI via `renderAction(name)`

**Not to be confused with**  
General programming "action" (Redux, event handler). Here an `Action` is a specific structural type with `name`, `perform`, and optional `PanelComponent` — it is both a command and potentially a UI widget.

---

## ActionManager

**Definition**  
The central command bus of the editor. Holds a registry of all `Action` objects keyed by `ActionName`, dispatches them, and applies their `ActionResult` back to `App.syncActionResult`. All built-in actions are registered in `App`'s constructor via `registerAll(actions)`.

**Key files**
- `packages/excalidraw/actions/manager.tsx` — class definition
- `packages/excalidraw/components/App.tsx` line 819 — construction and registration

**Not to be confused with**  
A Redux dispatcher or event bus. `ActionManager` is synchronous and tightly coupled to the `App` class; it receives `getAppState` and `getElementsIncludingDeleted` callbacks at construction time.

---

## AppState

**Definition**  
The full React state of the `App` class component. It is the primary source of truth for all editor UI state. Contains tool selection, viewport parameters, selection, dialog state, theme, drawing defaults, and collaboration data. Initialized from `getDefaultAppState()` in `appState.ts`.

**Key fields** (`packages/excalidraw/types.ts`, `AppState` interface)
- `activeTool` — current `ActiveTool` including `type`, `locked`, `lastActiveTool`
- `selectedElementIds` — `Record<id, true>` map of selected element IDs
- `scrollX`, `scrollY`, `zoom` — viewport position and scale
- `editingTextElement` — the text element currently open in the WYSIWYG editor
- `newElement` — the element being drawn but not yet committed
- `openPopup`, `openMenu`, `openDialog` — mutually exclusive UI panel state
- `currentItemStrokeColor`, `currentItemFontSize`, etc. — style defaults for new elements
- `collaborators` — `Map<SocketId, Collaborator>` of remote users

**Key files**
- `packages/excalidraw/types.ts` — `AppState` interface definition
- `packages/excalidraw/appState.ts` — `getDefaultAppState()`
- `packages/excalidraw/components/App.tsx` — owns and mutates via `setState`

**Not to be confused with**  
`UIAppState` — a derived type `Omit<AppState, "startBoundElement" | "cursorButton" | "scrollX" | "scrollY">` used in UI components to hide internal-only fields. `StaticCanvasAppState` and `InteractiveCanvasAppState` are further subsets passed to the canvas layers.

---

## BinaryFiles

**Definition**  
A flat record of file attachments stored on `App`. Used primarily for image elements: the element stores only a `fileId`, while the actual pixel data lives in `BinaryFiles`. Each `BinaryFileData` carries its own branded `FileId` in the `id` field. Files are passed to `onChange` and serialized alongside the scene.

**Structure** (`packages/excalidraw/types.ts`)
```ts
type BinaryFileData = {
  mimeType: ImageMimeType | typeof MIME_TYPES.binary;
  id: FileId;
  dataURL: DataURL;
  created: number;      // epoch ms
  lastRetrieved?: number;
  version?: number;
};
type BinaryFiles = Record<ExcalidrawElement["id"], BinaryFileData>;
```

**Key files**
- `packages/excalidraw/types.ts` — type definitions
- `packages/excalidraw/components/App.tsx` — `this.files`, `addFiles`, `addMissingFiles`
- `packages/excalidraw/data/blob.ts` — serialization helpers

**Not to be confused with**  
`ExcalidrawImageElement` — the element descriptor that references a file by `fileId`. The file data itself is intentionally decoupled from the element to allow lazy loading and deduplication.

---

## Collaborator

**Definition**  
A remote user present in the same collaboration room. Represented as `Map<SocketId, Collaborator>` in `AppState.collaborators`. The `Collab` class (in `excalidraw-app`) manages the map lifecycle; the editor renders each collaborator's cursor position and username on the `InteractiveCanvas`.

**Structure** (`packages/excalidraw/types.ts`)
```ts
type Collaborator = Readonly<{
  pointer?: CollaboratorPointer;
  button?: "up" | "down";
  selectedElementIds?: AppState["selectedElementIds"];
  username?: string | null;
  userState?: UserIdleState;    // "active" | "away" | "idle"
  color?: { background: string; stroke: string };
  avatarUrl?: string;
  id?: string;
  socketId?: SocketId;
  isCurrentUser?: boolean;
  isInCall?: boolean;
  isSpeaking?: boolean;
  isMuted?: boolean;
}>;
```

**Key files**
- `packages/excalidraw/types.ts` — `Collaborator`, `SocketId`, `CollaboratorPointer`
- `excalidraw-app/collab/Collab.tsx` — `this.collaborators` map, `updateCollaborator`, `setCollaborators`
- `excalidraw-app/collab/Portal.tsx` — Socket.io room and messaging

**Not to be confused with**  
The general concept of "user". A `Collaborator` is a transient, in-memory representation of a remote peer; it is never persisted to the scene file.

---

## ExcalidrawElement

**Definition**  
The base discriminated union for all canvas objects. Every shape, line, text, image, or frame on the canvas is an `ExcalidrawElement`. All elements are **immutable by convention** — mutations must go through `mutateElement()` from `@excalidraw/element`.

**Union members** (`packages/element/src/types.ts`)
```
ExcalidrawElement =
  | ExcalidrawGenericElement    (rectangle, diamond, ellipse)
  | ExcalidrawTextElement
  | ExcalidrawLinearElement     (line, arrow)
  | ExcalidrawArrowElement
  | ExcalidrawFreeDrawElement
  | ExcalidrawImageElement
  | ExcalidrawFrameElement
  | ExcalidrawMagicFrameElement
  | ExcalidrawIframeElement
  | ExcalidrawEmbeddableElement
```

**Shared base fields** (`_ExcalidrawElementBase`)
- `id` — unique string ID
- `x`, `y`, `width`, `height`, `angle` — geometry in scene coordinates
- `version`, `versionNonce` — collaboration reconciliation keys
- `index: FractionalIndex | null` — stable ordering for multiplayer
- `isDeleted` — soft delete flag; deleted elements stay in the array
- `groupIds`, `frameId`, `boundElements` — structural relationships
- `link`, `locked` — metadata

**Key files**
- `packages/element/src/types.ts` — all element type definitions
- `packages/element/src/mutateElement.ts` — the only correct way to modify an element
- `packages/element/src/newElement.ts` — factory functions

**Not to be confused with**  
A DOM element or HTML element. `ExcalidrawElement` is a plain serializable JavaScript object, not a DOM node.

---

## FractionalIndex

**Definition**  
A branded string (`string & { _brand: "franctionalIndex" }`) that encodes an element's z-order position using the [fractional indexing](https://github.com/rocicorp/fractional-indexing) algorithm. Allows inserting elements between existing ones without renumbering the entire array — critical for concurrent multiplayer edits. Stored in `element.index` and kept in sync with the array order by `syncMovedIndices` and `syncInvalidIndices`.

**Key files**
- `packages/element/src/types.ts` — type declaration
- `packages/element/src/fractionalIndex.ts` — `syncMovedIndices`, `syncInvalidIndices`, `orderByFractionalIndex`

**Not to be confused with**  
Array index. The array position and `element.index` are always in sync, but `FractionalIndex` is the authoritative ordering source in multi-user scenarios where two clients may independently insert elements.

---

## Frame

**Definition**  
A special container element (`ExcalidrawFrameElement`, type `"frame"`) that groups and visually clips a set of child elements. Elements inside a frame have `frameId` set to the frame's `id`. A `MagicFrame` (`ExcalidrawMagicFrameElement`, type `"magicframe"`) is a variant that triggers AI diagram-to-code generation.

**Structure** (`packages/element/src/types.ts`)
```ts
type ExcalidrawFrameElement = _ExcalidrawElementBase & {
  type: "frame";
  name: string | null;
};
type ExcalidrawMagicFrameElement = _ExcalidrawElementBase & {
  type: "magicframe";
  name: string | null;
};
```

**Key files**
- `packages/element/src/types.ts` — type definitions
- `packages/element/src/frame.ts` — `getTargetFrame`, `elementOverlapsWithFrame`, `shouldApplyFrameClip`
- `packages/excalidraw/actions/actionFrame.ts` — frame-related actions

**Not to be confused with**  
A browser `<iframe>` (that is `ExcalidrawIframeElement`, type `"embeddable"`) or a React component render frame.

---

## Group

**Definition**  
A logical grouping of elements that are treated as a unit for selection, dragging, and transformations. Implemented via shared `groupIds: readonly GroupId[]` arrays on each element — there is no separate group object. Elements belong to multiple groups simultaneously (nested groups), ordered deepest-first in the array.

**Key files**
- `packages/element/src/types.ts` — `GroupId` type, `groupIds` field on `_ExcalidrawElementBase`
- `packages/element/src/groups.ts` — `getElementsInGroup`, `selectGroupsForSelectedElements`
- `packages/excalidraw/actions/actionGroup.tsx` — group/ungroup actions

**Not to be confused with**  
`Frame`. A group has no visual representation of its own; a frame has a visible border and clips its children. Grouped elements can span the whole canvas; framed elements are contained within the frame's bounds.

---

## History

**Definition**  
The undo/redo system. `History` (`packages/excalidraw/history.ts`) maintains two stacks of `HistoryDelta` entries. Each `HistoryDelta` is the **inverse** of the observed `StoreDelta` — applying it restores the previous state. `History.record(delta)` is called automatically via `Store.onDurableIncrementEmitter`.

**Key types**
- `HistoryDelta extends StoreDelta` — holds `ElementsDelta` + `AppStateDelta`
- `CaptureUpdateAction.IMMEDIATELY` — delta is recorded
- `CaptureUpdateAction.EVENTUALLY` — debounced (e.g. slider drag)
- `CaptureUpdateAction.NEVER` — not recorded (e.g. viewport pan, collab sync)

**Key files**
- `packages/excalidraw/history.ts` — `History`, `HistoryDelta` classes
- `packages/element/src/store.ts` — `StoreDelta`, `Store.onDurableIncrementEmitter`
- `packages/element/src/delta.ts` — `ElementsDelta`, `AppStateDelta`

**Not to be confused with**  
Browser history (`window.history`) or the version field on elements. `History` here is a pure in-memory undo/redo stack that is cleared on scene reset.

---

## Library

**Definition**  
A user-curated collection of reusable element groups, persisted in `IndexedDB` and optionally synced with a remote library backend. Each item is a `LibraryItem` — a named, versioned bundle of `ExcalidrawElement[]`. The Library sidebar allows inserting items onto the canvas.

**Structure** (`packages/excalidraw/types.ts`)
```ts
type LibraryItem = {
  id: string;
  status: "published" | "unpublished";
  elements: readonly NonDeleted<ExcalidrawElement>[];
  created: number;
  name?: string;
};
type LibraryItems = readonly LibraryItem[];
```

**Key files**
- `packages/excalidraw/data/library.ts` — `Library` class, `updateLibrary`, persistence
- `packages/excalidraw/types.ts` — `LibraryItem`, `LibraryItems`
- `packages/excalidraw/components/LibraryMenu.tsx` — UI panel

**Not to be confused with**  
A JavaScript library/package. In Excalidraw, "Library" always refers to the user's saved shape library. The Excalidraw library endpoint (`VITE_APP_LIBRARY_URL`) is the remote source for community-published items.

---

## Reconciliation

**Definition**  
The process of merging remote element arrays received over the collaboration WebSocket with the local scene, resolving conflicts deterministically. Implemented in `reconcileElements(localElements, remoteElements, appState)`. Conflict resolution uses `version`, `versionNonce`, and editing state to decide which copy of an element wins.

**Key files**
- `packages/excalidraw/data/reconcile.ts` — `reconcileElements`, `shouldDiscardRemoteElement`
- `excalidraw-app/collab/Collab.tsx` — `_reconcileElements`, calls `api.updateScene`

**Not to be confused with**  
React reconciliation (the virtual DOM diffing algorithm). Excalidraw reconciliation operates on plain element arrays, not React component trees.

---

## Scene

**Definition**  
The canonical in-memory store for the element list. `Scene` is a class in `@excalidraw/element` that owns the ordered array of `OrderedExcalidrawElement[]` and derived maps. It is instantiated inside `App` and referenced by `Renderer`, `Fonts`, and `ActionManager`. All element writes go through `Scene.replaceAllElements()` or `Scene.addElement()`.

**Key API** (`packages/element/src/Scene.ts`)
- `getNonDeletedElements()` — ordered array used in renders
- `getNonDeletedElementsMap()` — `Map<id, element>` for O(1) lookup
- `getElementsIncludingDeleted()` — full array including soft-deleted elements
- `replaceAllElements(elements)` — replace entire element list; bumps `sceneNonce`
- `getSceneNonce()` — random integer incremented on every mutation; used as memoization cache key in `Renderer`
- `onUpdate(callback)` — subscribe to scene mutations

**Key files**
- `packages/element/src/Scene.ts` — class definition
- `packages/excalidraw/components/App.tsx` line 825 — `this.scene = new Scene()`

**Not to be confused with**  
A "scene" in a game engine (a level or world). Here `Scene` is specifically the ordered collection of elements on the infinite canvas, with no concept of layers or cameras beyond the viewport managed by `AppState`.

---

## Store

**Definition**  
Change-tracking layer that sits between `Scene`/`AppState` and `History`. `Store.commit(elementsMap, appState)` computes structural deltas since the last snapshot and emits two event streams:
- `onDurableIncrementEmitter` — when `CaptureUpdateAction.IMMEDIATELY` was scheduled; consumed by `History` to create undo entries
- `onStoreIncrementEmitter` — fires on every commit; consumed by `props.onIncrement` for collaboration broadcasting

**Key files**
- `packages/element/src/store.ts` — `Store`, `CaptureUpdateAction`, `DurableIncrement`, `EphemeralIncrement`
- `packages/excalidraw/components/App.tsx` line 832 — `this.store = new Store(this)`, line 3509 — `store.commit(...)`

**Not to be confused with**  
A Redux/Zustand store or a Jotai store. Excalidraw's `Store` is not a state container — it is a diffing and event-emission system built on top of React state and `Scene`.

---

## Tool

**Definition**  
The currently active drawing mode. Represented by `activeTool: ActiveTool` in `AppState`. The `type` field is one of `ToolType`'s string literals. Tools that create elements (rectangle, arrow, text, etc.) produce an `ExcalidrawElement` of the matching type; utility tools (selection, eraser, hand, laser) do not.

**ToolType values** (`packages/excalidraw/types.ts`)
```
"selection" | "lasso" | "rectangle" | "diamond" | "ellipse" |
"arrow" | "line" | "freedraw" | "text" | "image" |
"eraser" | "hand" | "frame" | "magicframe" | "embeddable" | "laser"
```

**`ActiveTool` structure**
```ts
type ActiveTool =
  | { type: ToolType; customType: null }
  | { type: "custom"; customType: string };   // for host-app-defined tools
```

**Additional `activeTool` fields in `AppState`**
- `locked: boolean` — whether the tool stays active after placing an element
- `lastActiveTool` — previous tool, used to revert after eraser/hand
- `fromSelection` — true when the tool was temporarily switched from selection

**Key files**
- `packages/excalidraw/types.ts` — `ToolType`, `ActiveTool`
- `packages/excalidraw/components/shapes.tsx` — toolbar tool definitions (`getToolbarTools`)
- `packages/excalidraw/components/Actions.tsx` — `ShapesSwitcher` component

**Not to be confused with**  
`ExcalidrawElementType`. Most (but not all) tool types correspond 1:1 to an element type. `selection`, `lasso`, `eraser`, `hand`, and `laser` have no matching element type.
