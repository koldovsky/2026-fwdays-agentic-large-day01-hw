# Domain Glossary

Vocabulary of Excalidraw-specific terms as they are used inside this codebase.
General programming meanings are noted only where they would be confused with
the project-specific one.

---

## Element

**Definition**  
A single drawable object on the canvas. Every element is a plain
JSON-serialisable record that extends `_ExcalidrawElementBase`. The union type
`ExcalidrawElement` covers all concrete shapes.

**Key fields (on every element)**

| Field                       | Meaning                                                                  |
| --------------------------- | ------------------------------------------------------------------------ |
| `id`                        | nanoid-generated stable identifier                                       |
| `type`                      | shape discriminator (see _Element Type_)                                 |
| `x`, `y`, `width`, `height` | geometry in scene coordinates                                            |
| `index`                     | fractional-index string for z-order (see _Fractional Index_)             |
| `groupIds`                  | ordered stack of group memberships (see _Group_)                         |
| `frameId`                   | id of the containing frame, or `null` (see _Frame_)                      |
| `boundElements`             | inverse binding list (arrows / text attached to this element)            |
| `isDeleted`                 | soft-delete flag — deleted elements stay in scene for collaboration diff |
| `version` / `versionNonce`  | monotonic counter + random tiebreaker for conflict resolution            |
| `locked`                    | element cannot be moved or resized by the user                           |

**Usage** — `packages/element/src/types.ts`, every renderer, `Scene`, `Store`,
actions.

> **Do not confuse** with a React element or a DOM element. "Element" in
> Excalidraw always means a shape on the whiteboard.

---

## Element Type

**Definition**  
The `type` string discriminator on each `ExcalidrawElement`. Determines which
subtype interface applies and how the element is rendered.

| Type string    | Element interface             | Notes                                                |
| -------------- | ----------------------------- | ---------------------------------------------------- |
| `"selection"`  | `ExcalidrawSelectionElement`  | Ephemeral rubber-band selection box; never persisted |
| `"rectangle"`  | `ExcalidrawRectangleElement`  | Basic rect shape                                     |
| `"diamond"`    | `ExcalidrawDiamondElement`    | Rotated square                                       |
| `"ellipse"`    | `ExcalidrawEllipseElement`    | Oval / circle                                        |
| `"arrow"`      | `ExcalidrawArrowElement`      | Directed connector; can bind to shapes               |
| `"line"`       | `ExcalidrawLineElement`       | Undirected polyline / polygon                        |
| `"freedraw"`   | `ExcalidrawFreeDrawElement`   | Freehand stroke                                      |
| `"text"`       | `ExcalidrawTextElement`       | Standalone or container-bound label                  |
| `"image"`      | `ExcalidrawImageElement`      | Raster image (linked via `fileId`)                   |
| `"frame"`      | `ExcalidrawFrameElement`      | Named viewport clip region                           |
| `"magicframe"` | `ExcalidrawMagicFrameElement` | AI-generation frame                                  |
| `"embeddable"` | `ExcalidrawEmbeddableElement` | Embedded URL (website preview)                       |
| `"iframe"`     | `ExcalidrawIframeElement`     | Raw iframe; used by AI generation flows              |

**Usage** — `packages/element/src/types.ts`; switch/match in renderer, action
predicates, hit-testing.

---

## Scene

**Definition**  
The canonical, ordered collection of all `ExcalidrawElement` objects for the
current drawing. `Scene` is a class (`packages/element/src/Scene.ts`) that owns
the element graph, keeps typed maps for fast lookup, maintains the _scene nonce_
for cache invalidation, and fires listeners when elements change.

**Key API**

| Method                                      | Purpose                                              |
| ------------------------------------------- | ---------------------------------------------------- |
| `getNonDeletedElements()`                   | Array used by renderers and actions                  |
| `getNonDeletedElementsMap()`                | Keyed map for O(1) lookup                            |
| `replaceAllElements(elements)`              | Authoritative mutation — replaces the entire graph   |
| `insertElement(el)` / `insertElements(els)` | Add new elements with fractional-index assignment    |
| `mutateElement(el, updates)`                | Targeted in-place mutation; bumps version            |
| `getSelectedElements(opts)`                 | Intersection of element ids and `selectedElementIds` |
| `triggerUpdate()`                           | Bumps scene nonce → canvas effect re-runs            |

**Usage** — constructed once in `App`; passed to `ActionManager`, `Store`,
renderers.

> **Do not confuse** with the exported `SceneData` payload (the props bag used
> to load a scene into the component) or with a film-making "scene". Here
> "Scene" is the live in-memory graph of elements.

---

## Scene Nonce

**Definition**  
A random integer that is incremented every time `scene.triggerUpdate()` is
called. It is the cache-invalidation key for `Renderer.getRenderableElements()`
— when the nonce changes, the memoised visible-elements subset is recomputed.

**Usage** — `Scene.ts` (`getSceneNonce()`), `Renderer.ts` (cache key),
`StaticCanvas` effect dependency.

> **Do not confuse** with `versionNonce` on individual elements, which is a
> per-element conflict-resolution tiebreaker for collaborative sync.

---

## AppState

**Definition**  
The single large React state object held by the `App` class component. It covers
everything that is not part of the persistent element graph: active tool, scroll
position, zoom level, selection, theme, open dialogs, collaboration cursors,
export settings, and ~80 other fields.

Updated exclusively via `this.setState()` (for UI-only changes) or
`syncActionResult()` (for action results that may also touch elements).

**Notable slices**

| Field(s)                | What they track                                       |
| ----------------------- | ----------------------------------------------------- |
| `activeTool`            | Currently selected tool (see _Tool_)                  |
| `scrollX`, `scrollY`    | Canvas scroll offset in scene coordinates             |
| `zoom`                  | Current zoom factor (see _Zoom_)                      |
| `selectedElementIds`    | Set of selected element ids                           |
| `editingGroupId`        | Group being drilled into                              |
| `selectedLinearElement` | `LinearElementEditor` state when editing a line/arrow |
| `collaborators`         | Map of `SocketId → Collaborator` (remote users)       |
| `theme`                 | `"light"` or `"dark"`                                 |
| `viewBackgroundColor`   | Canvas background fill colour                         |
| `currentItem*`          | Style defaults for newly created elements             |
| `frameRendering`        | Whether frames show name / outline / clipping         |

**Usage** — `packages/excalidraw/types.ts`; read by every action, every renderer
slice, every toolbar component.

> **Narrowed sub-types** `StaticCanvasAppState` and `InteractiveCanvasAppState`
> are smaller picks of `AppState` passed to individual canvas renderers to
> prevent unnecessary re-renders.

---

## Tool

**Definition**  
The interaction mode the user is currently in. Stored as `AppState.activeTool`
with shape `{ type: ToolType, locked: boolean, ... }`. Selecting a tool
determines which pointer handlers run and which element type gets created on
drag.

**`ToolType` values**

| Value                               | Behaviour                                             |
| ----------------------------------- | ----------------------------------------------------- |
| `selection`                         | Click / drag to select; default tool                  |
| `lasso`                             | Free-form selection by drawing a lasso                |
| `hand`                              | Pan the canvas without selecting                      |
| `rectangle` / `diamond` / `ellipse` | Draw the corresponding closed shape                   |
| `arrow`                             | Draw a directed connector (can bind to shapes)        |
| `line`                              | Draw an undirected polyline / polygon                 |
| `freedraw`                          | Freehand pencil stroke                                |
| `text`                              | Place a text element                                  |
| `image`                             | Insert an image from disk or clipboard                |
| `frame`                             | Draw a named clip frame                               |
| `magicframe`                        | Draw an AI-generation frame                           |
| `embeddable`                        | Insert an embeddable URL widget                       |
| `eraser`                            | Delete elements by swiping over them                  |
| `laser`                             | Presentation laser pointer (ephemeral, not persisted) |

`locked: true` means the tool stays active after placing one element (no return
to _selection_). Custom tools use `type: "custom"` with a `customType` string.

**Usage** — `packages/excalidraw/types.ts` (`ToolType`, `ActiveTool`); toolbar
actions, pointer handlers.

---

## Action

**Definition**  
A declarative, named command registered with `ActionManager`. Each action
encapsulates a `perform` function that computes an `ActionResult`, optional
keyboard shortcut binding (`keyTest`), and an optional React panel component
(`PanelComponent`) that renders the toolbar/property UI for that action.

**Shape**

```ts
interface Action {
  name: ActionName;
  perform(elements, appState, formData, app): ActionResult;
  keyTest?(event): boolean;
  PanelComponent?: React.FC<PanelComponentProps>;
  captureUpdate?: CaptureUpdateActionType;
  predicate?(elements, appState, appProps, app): boolean;
}
```

**`ActionResult`** — what `perform` returns:

```ts
type ActionResult =
  | false
  | {
      elements?: readonly ExcalidrawElement[];
      appState?: Partial<AppState>;
      files?: BinaryFiles;
      captureUpdate?: CaptureUpdateActionType;
    };
```

Returning `false` is a no-op. Returning an object causes
`App.syncActionResult()` to apply element and state changes in one batch.

**Usage** — `packages/excalidraw/actions/types.ts`; individual action files
under `actions/action*.ts`; dispatched by keyboard, toolbar clicks,
context-menu, command palette, or the imperative API.

> **Do not confuse** with a Redux action or a user gesture. An Excalidraw Action
> is always a registered, named handler that may produce a declarative diff.

---

## ActionManager

**Definition**  
The central registry and dispatcher for all `Action` objects. Constructed once
in `App` and passed through context. Key responsibilities:

- Stores the array of all registered actions.
- `handleKeyDown(event)` — resolves keyboard shortcuts in priority order.
- `executeAction(action, source, value)` — calls `perform` then pipes the result
  through `syncActionResult`.
- `renderAction(name, opts)` — renders the `PanelComponent` for a given action
  name into the toolbar.

**Usage** — `packages/excalidraw/actions/manager.tsx`; accessed by toolbar,
context menu, command palette via `useExcalidrawActionManager()`.

---

## ActionResult

**Definition**  
The return value of `Action.perform()`. A plain object describing the _desired
next state_ rather than performing mutations directly. `App.syncActionResult()`
applies it atomically.

Fields: `elements` (new element array), `appState` (partial patch), `files`,
`captureUpdate` (undo policy).

**Usage** — `packages/excalidraw/actions/types.ts`.

---

## Store

**Definition**  
Observes changes to the scene and app state after each commit and emits typed
_increments_ used for undo/redo and for the `onIncrement` host callback. Does
not store element data itself — it stores _deltas_ (diffs between snapshots).

**Key concepts**

| Term                  | Meaning                                                                              |
| --------------------- | ------------------------------------------------------------------------------------ |
| `StoreSnapshot`       | Immutable point-in-time: element map + observed AppState                             |
| `StoreDelta`          | Serialisable patch: `ElementsDelta` + `AppStateDelta`; invertible                    |
| `DurableIncrement`    | Increment that includes a `StoreDelta` → enters undo stack                           |
| `EphemeralIncrement`  | Increment with `StoreChange` only (e.g. mid-drag preview) → not undoable             |
| `CaptureUpdateAction` | Policy on whether the next commit is `IMMEDIATELY` / `EVENTUALLY` / `NEVER` undoable |

**Usage** — `packages/element/src/store.ts`; constructed and driven by `App`;
consumed by `History`.

---

## History

**Definition**  
Wraps `Store` to maintain undo and redo stacks of `HistoryDelta` records.
Exposes `undo()` and `redo()` methods consumed by the corresponding actions.
Fires `onHistoryChangedEmitter` so the toolbar can enable/disable undo/redo
buttons reactively.

`HistoryDelta` is a `StoreDelta` that skips `version`/`versionNonce` during
apply so that undo/redo does not create false collaboration conflicts.

**Usage** — `packages/excalidraw/history.ts`.

---

## Delta / StoreDelta

**Definition**  
A serialisable, invertible diff between two states. `StoreDelta` contains:

- `ElementsDelta` — which elements were added, removed, or mutated (field-level
  `{ deleted, inserted }` pairs)
- `AppStateDelta` — which observed AppState fields changed

Deltas can be `calculate`d from two snapshots, `inverse`d (for undo), `applyTo`
a scene, and `squash`ed together (for batching remote operations).

**Usage** — `packages/element/src/delta.ts`, `store.ts`; also used as the unit
sent over the collaboration WebSocket for remote sync.

---

## Fractional Index

**Definition**  
A lexicographically sortable string stored as `element.index`. Elements in a
scene are ordered by this string, which allows inserting an element between two
others without renumbering the rest.

`null` index means the element has not yet been assigned a position
(transitional state during construction). All elements in `SceneElementsMap` are
`Ordered` (non-null index).

**Usage** — `packages/element/src/fractionalIndex.ts`; maintained by
`Scene.insertElement*` and repaired by `syncInvalidIndices`.

> **Do not confuse** with `version` (conflict counter) or array position. The
> fractional index is the z-order, not the creation order.

---

## Linear Element

**Definition**  
An element whose geometry is defined by an array of `points` rather than a
bounding box. Covers `"line"` (undirected polyline that can close into a
polygon) and `"arrow"` (directed connector with optional arrowheads).

The `LinearElementEditor` class in `packages/element/src/linearElementEditor.ts`
manages the interactive point-editing state stored in
`AppState.selectedLinearElement`.

**Sub-types**

| Interface                     | `type`                         | Extra fields                                                              |
| ----------------------------- | ------------------------------ | ------------------------------------------------------------------------- |
| `ExcalidrawLineElement`       | `"line"`                       | —                                                                         |
| `ExcalidrawArrowElement`      | `"arrow"`                      | `startBinding`, `endBinding`, `startArrowhead`, `endArrowhead`, `elbowed` |
| `ExcalidrawElbowArrowElement` | `"arrow"` with `elbowed: true` | `fixedSegments`, `startIsSpecial`, `endIsSpecial`                         |

**Usage** — `packages/element/src/types.ts`, `binding.ts`, `elbowArrow.ts`,
`linearElementEditor.ts`.

---

## Binding

**Definition**  
The mechanism that attaches the endpoint of an arrow to a shape (the _bindable
element_). When bound, moving the shape causes the arrow endpoint to follow it.

**Key types**

| Term                        | Meaning                                                                                                            |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------ | --------- |
| `FixedPointBinding`         | `{ elementId, fixedPoint: [0–1, 0–1], focus, gap }` — attachment on the target shape's normalised coordinate space |
| `BindMode`                  | `"inside"` — endpoint inside shape; `"orbit"` — endpoint orbits outline; `"skip"` — no bind                        |
| `BoundElement`              | Entry in a shape's `boundElements` array: `{ id, type: "arrow"                                                     | "text" }` |
| `ExcalidrawBindableElement` | Union of element types that can receive arrow bindings                                                             |
| `suggestedBinding`          | Hover-preview binding before the user releases the mouse                                                           |

**Usage** — `packages/element/src/binding.ts`, `packages/element/src/types.ts`.

---

## Group

**Definition**  
A logical grouping of elements sharing a `GroupId` string. Elements can belong
to multiple nested groups; `groupIds` is an ordered array from innermost to
outermost group.

Selecting any element in a group selects all members. Double-clicking enters the
group (`editingGroupId` is set in AppState), allowing individual element
interaction without ungrouping.

Groups are not their own elements — they exist only as ids in the `groupIds`
array.

**Usage** — `packages/element/src/types.ts`, `packages/element/src/groups.ts`.

> **Do not confuse** with a Frame. A group has no visual boundary and no clip
> region; a frame is a visible, named rectangle that clips its children on
> export.

---

## Frame

**Definition**  
A named clip region represented by an `ExcalidrawFrameElement` (type `"frame"`)
or `ExcalidrawMagicFrameElement` (type `"magicframe"`). Elements whose `frameId`
matches the frame's `id` are considered _inside_ the frame and are clipped to it
during export.

`frameRendering` in `AppState` controls whether frames show their name label,
outline border, and whether clipping is applied.

**Usage** — `packages/element/src/types.ts`, `packages/element/src/frame.ts`,
static renderer.

> **Do not confuse** with a Group. A frame is a visible element with geometry; a
> group is an invisible logical association.

---

## Viewport

**Definition**  
The visible rectangular area of the canvas as seen through the browser window,
determined by `scrollX`, `scrollY`, and `zoom`. Renderer culling uses the
viewport to skip drawing off-screen elements.

**Scene vs. screen coordinates**

- _Scene coordinates_ — the absolute position of an element in the infinite
  canvas (element `x`, `y`).
- _Screen (client) coordinates_ — pixels on the display; derived by applying
  zoom and scroll offset.

Helper functions `sceneCoordsToViewportCoords` / `viewportCoordsToSceneCoords`
convert between them.

**Usage** — `packages/excalidraw/viewportGeometry.ts`, renderers, pointer
handlers.

---

## Zoom

**Definition**  
A typed wrapper `{ value: NormalizedZoomValue }` where `NormalizedZoomValue` is
a branded number clamped to `[MIN_ZOOM, MAX_ZOOM]`. Stored in `AppState.zoom`.

Raw zoom multiplication is always applied through helpers (e.g.
`getNormalizedZoom`) to ensure the value stays within safe bounds.

**Usage** — `packages/excalidraw/types.ts`, `packages/excalidraw/zoom.ts`,
scroll/zoom event handlers.

---

## Collaborator

**Definition**  
A remote user currently connected to the same whiteboard session. Stored in
`AppState.collaborators` as a `Map<SocketId, Collaborator>`.

**Shape**

| Field                            | Meaning                                                      |
| -------------------------------- | ------------------------------------------------------------ |
| `pointer`                        | `CollaboratorPointer` — `{ x, y, tool }` in scene coords     |
| `button`                         | `"down"` / `"up"` — whether remote mouse is pressed          |
| `selectedElementIds`             | Remote user's current selection (shown as coloured handles)  |
| `username`, `color`, `avatarUrl` | Display identity                                             |
| `isCurrentUser`                  | `true` for the local user's own entry (used for follow-mode) |
| `userState`                      | `"active"` / `"idle"`                                        |

**Usage** — `packages/excalidraw/types.ts`; rendered by `InteractiveCanvas` as
remote cursors and coloured selection overlays. Only populated when using the
collaboration WebSocket (`excalidraw-app`).

---

## Socket ID

**Definition**  
A branded string (`SocketId`) that uniquely identifies a WebSocket connection in
a collaboration session. Used as the key in the `collaborators` map and in
follow-mode (`UserToFollow.socketId`).

**Usage** — `packages/excalidraw/types.ts`, `excalidraw-app/src/` collaboration
layer.

---

## Library / Library Item

**Definition**  
A user-curated collection of reusable element groups. A `LibraryItem` (v2) is:

```ts
{
  id: string;
  status: "published" | "unpublished";
  elements: readonly ExcalidrawElement[];
  created: number;   // timestamp
  name?: string;
}
```

`LibraryItems` is an array of `LibraryItem`. The `Library` class
(`packages/excalidraw/data/library.ts`) manages persistence (IndexedDB or
host-supplied adapter) and exposes update events.

Dragging an item from the Library panel onto the canvas places an editable
_copy_ of the elements.

**Usage** — `packages/excalidraw/types.ts`,
`packages/excalidraw/data/library.ts`, `LibraryMenuItems` component.

> **Do not confuse** with the npm `@excalidraw/excalidraw` library (the
> publishable package). "Library" in UI contexts means the sidebar panel of
> saved element sets.

---

## Static Canvas

**Definition**  
The bottom canvas layer (`StaticCanvas` component, `renderer/staticScene.ts`)
that draws everything that does not change at pointer-move frequency: the
background fill, the grid, and all committed elements. Re-renders only when the
scene nonce or relevant AppState fields change.

Corresponds to a `<canvas>` element positioned underneath the _Interactive
Canvas_.

**Usage** — `packages/excalidraw/components/canvases/StaticCanvas.tsx`,
`packages/excalidraw/renderer/staticScene.ts`.

---

## Interactive Canvas

**Definition**  
The top canvas layer (`InteractiveCanvas` component,
`renderer/interactiveScene.ts`) that draws everything that changes at high
frequency: selection boxes, resize/rotation handles, snap lines, remote
collaborator cursors, binding highlights, and scrollbars. Receives all pointer
and keyboard events.

**Usage** — `packages/excalidraw/components/canvases/InteractiveCanvas.tsx`,
`packages/excalidraw/renderer/interactiveScene.ts`.

---

## New Element Canvas

**Definition**  
A thin third canvas layer (`NewElementCanvas`) that renders only the element
currently being drawn (before the user releases the pointer). Isolating
in-progress creation avoids triggering a full static redraw on every
pointer-move.

**Usage** — `packages/excalidraw/components/canvases/NewElementCanvas.tsx`.

---

## Renderer

**Definition**  
Code responsible for painting scene data onto an HTML `<canvas>`. In Excalidraw
there are two main render paths:

1. **`renderStaticScene`** (`renderer/staticScene.ts`) — rasterises all
   committed elements using `roughjs` for hand-drawn strokes.
2. **`renderInteractiveScene`** (`renderer/interactiveScene.ts`) — draws
   interactive overlays.

The `Renderer` class (`scene/Renderer.ts`) owns a `Scene` reference and exposes
`getRenderableElements()`, a memoised function (keyed on scene nonce + viewport
params) that filters and culls elements before passing them to the render
functions.

There is also `staticSvgScene.ts` for SVG export (a separate render path that
outputs SVG nodes instead of canvas pixels).

**Usage** — `packages/excalidraw/renderer/`,
`packages/excalidraw/scene/Renderer.ts`.

---

## Rough.js / Roughness

**Definition**  
`roughjs` is the third-party library that generates the hand-drawn stroke
appearance. Each element has a `roughness` property (0 = perfectly smooth,
higher = more wobbly). Roughness is the intentional imperfection that makes
drawings look sketched by hand.

`roughCanvas.draw(shape, { roughness, ... })` is called per-element during
static rendering.

**Usage** — `packages/element/src/renderElement.ts`,
`packages/element/src/shape.ts`.

---

## ExcalidrawImperativeAPI

**Definition**  
The stable facade object returned to embedding host applications via the
`onExcalidrawAPI` prop callback. Exposes methods like `updateScene`,
`getSceneElements`, `exportToBlob`, `setActiveTool`, `resetScene`, etc. that let
the host manipulate the editor without React prop drilling.

On unmount the API is replaced by a destroyed stub that throws on all calls,
preventing stale reference bugs.

**Usage** — `packages/excalidraw/types.ts` (`ExcalidrawImperativeAPI`); built in
`App` via `createExcalidrawAPI()`.

> **Do not confuse** with `ExcalidrawProps` (the React props). The imperative
> API is a post-mount handle for programmatic control; props are the declarative
> configuration.

---

## InitialData / SceneData

**Definition**  
`InitialData` is the prop bag passed to the `<Excalidraw>` component to
pre-populate the canvas: `{ elements, appState, files, libraryItems }`. It is
consumed once at mount time.

`SceneData` is the argument type for `ExcalidrawImperativeAPI.updateScene()`:
same shape but used for live updates after mount. Both trigger
`Scene.replaceAllElements` + `setState` internally.

**Usage** — `packages/excalidraw/types.ts`.

---

## Snap / Snap Line

**Definition**  
Visual guides that appear while dragging elements. When an element's edge or
centre aligns with another element (or the grid), a `SnapLine` is drawn on the
Interactive Canvas and the element position is nudged to the exact alignment.

`SnapLine` objects are stored temporarily in `AppState.snapLines` during a drag
and cleared on pointer up.

**Usage** — `packages/excalidraw/snapping.ts`,
`packages/excalidraw/renderer/renderSnaps.ts`.

---

## Elbow Arrow

**Definition**  
A subtype of arrow (`ExcalidrawElbowArrowElement`) where the connector path
consists of axis-aligned segments that route automatically around shapes.
Identified by `elbowed: true` on the element. Has additional geometry
(`fixedSegments`, `startIsSpecial`, `endIsSpecial`) that locks specific segments
in place when the user adjusts them manually.

**Usage** — `packages/element/src/types.ts`,
`packages/element/src/elbowArrow.ts`.

---

## Arrowhead

**Definition**  
The decoration at the start or end of an arrow element. Stored as
`startArrowhead` and `endArrowhead` on `ExcalidrawArrowElement`. `null` means no
decoration.

Named variants include: `"arrow"`, `"bar"`, `"circle"`, `"circle_outline"`,
`"triangle"`, `"triangle_outline"`, `"diamond"`, `"diamond_outline"`, and
ER-diagram cardinality heads (`CardinalityArrowhead`).

**Usage** — `packages/element/src/types.ts`; rendered in `renderElement.ts`; set
via style panel actions.

---

## Theme

**Definition**  
`"light"` or `"dark"` mode for the editor UI and canvas rendering. Stored as
`AppState.theme` and propagated to renderers and Sass stylesheets via CSS
variables. Not the same as element fill colour.

The `THEME` constant in `@excalidraw/common` defines the permitted values.
`viewBackgroundColor` is a separate concern (user-chosen canvas background).

**Usage** — `packages/element/src/types.ts` (re-exported),
`packages/excalidraw/types.ts`, renderers.

---

## LayerUI

**Definition**  
The React component tree that renders all editor chrome _above_ the canvas: top
toolbar, properties panel, footer, sidebar, dialogs, and context menu. It reads
from AppState and dispatches actions but never touches the canvas elements
directly.

Positioned as an absolute overlay over the canvas stack.

**Usage** — `packages/excalidraw/components/LayerUI.tsx`.

---

## Sidebar

**Definition**  
The collapsible panel docked to the right of the canvas. By default it hosts the
Library panel. Host applications can inject custom tabs via the
`<Excalidraw.Sidebar>` slot.

Sidebar open/closed state is managed through a Jotai atom (not `AppState`) to
keep it isolated from the canvas render cycle.

**Usage** — `packages/excalidraw/components/Sidebar/`.

---

## Command Palette

**Definition**  
A keyboard-searchable overlay (opened with `Ctrl+/` or `⌘+/`) that lists all
registered actions and recently used items. Dispatches actions via
`ActionManager.executeAction` with `source: "commandPalette"`.

**Usage** — `packages/excalidraw/components/CommandPalette/`.

---

## Follow Mode

**Definition**  
A collaboration feature where one user (the "presenter") broadcasts their
viewport to others. Users who follow receive viewport changes (`scrollX`,
`scrollY`, `zoom`) in real time so their canvas stays synchronised with the
presenter's view.

Stored in `AppState.userToFollow` (who the local user is following) and
`AppState.followedBy` (who is following the local user).

**Usage** — `packages/excalidraw/types.ts` (`UserToFollow`);
`excalidraw-app/src/` collaboration layer; interactive renderer.

---

## `.excalidraw` File Format

**Definition**  
A JSON file (MIME: `application/json`, extension: `.excalidraw`) that serialises
the full scene:
`{ type: "excalidraw", version, source, elements, appState, files }`. This is
the native import/export format. SVG exports can optionally embed the same JSON
in a `<metadata>` block, enabling lossless round-trip editing.

**Usage** — `packages/excalidraw/data/`, export/import actions.

---

## TTD (Text-to-Diagram)

**Definition**  
"Text-to-Diagram" — the feature that converts a textual description (Mermaid
syntax or an AI prompt) into Excalidraw elements. The dialog (`TTDDialog`)
accepts Mermaid markup, parses it, and inserts the resulting elements into the
scene. The AI path sends the prompt to a generation endpoint and inserts the
returned elements into a _magic frame_.

**Usage** — `packages/excalidraw/components/TTDDialog/`.

---

## Magic Frame

**Definition**  
An `ExcalidrawMagicFrameElement` (type `"magicframe"`) that acts as a
placeholder for AI-generated content. When the user triggers generation, the
elements returned by the AI backend replace the magic frame's children. Distinct
from a regular Frame in that its content is replaced, not authored, by the user.

**Usage** — `packages/element/src/types.ts`; `excalidraw-app` AI integration.

---

## Monorepo Packages

**Definition**  
The repository is a Yarn-classic monorepo with five publishable packages plus
the hosted app:

| Package                  | Role                                                        |
| ------------------------ | ----------------------------------------------------------- |
| `@excalidraw/math`       | Geometry primitives (no React)                              |
| `@excalidraw/common`     | Shared constants, utilities, types                          |
| `@excalidraw/element`    | Element types, Scene, Store, rendering primitives           |
| `@excalidraw/excalidraw` | React component, ActionManager, renderers (the npm package) |
| `@excalidraw/utils`      | Standalone utility functions (leaf, no upward deps)         |
| `excalidraw-app`         | Hosted application (Firebase, collab, PWA)                  |

Dependencies are strictly one-way (bottom to top); circular imports are
forbidden.

**Usage** — root `package.json`, `packages/*/package.json`.
