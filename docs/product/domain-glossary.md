# Domain Glossary

This glossary defines **ubiquitous language** for the Excalidraw monorepo: the browser-based whiteboard editor (`@excalidraw/excalidraw`), its element model (`@excalidraw/element`), and the first-party host app (`excalidraw-app`). Paths are relative to the repository root; there is **no single root `src/`**—library code lives under `packages/*` and the app under `excalidraw-app/`.

---

## Core entities

### Element
- **Definition**: **Element** is the required generic term for **scene-level serializable object data** (shape, text, image, frame, embed, etc.) used as the source of truth for rendering, export, history, and collaboration. Conceptually it is close to `ExcalidrawElement`, but in this glossary **Element** is the umbrella domain term for any scene element data model.
- **Key Files**: `packages/element/src/types.ts`, `packages/element/src/renderElement.ts`, `packages/excalidraw/components/App.tsx`, `packages/element/src/Scene.ts`
- **Do not confuse with**: `Element` in this glossary means **domain scene data**, not a **UI element** (`HTMLElement`) and not a **React element** (`JSX.Element` / virtual node).

### ExcalidrawElement
- **Definition**: A **serializable record** representing one drawable object on the canvas (shape, line, arrow, text, image, frame, embed, etc.). The union is discriminated by `type`. Each instance carries geometry (`x`, `y`, `width`, `height`, `angle`), visual style (`strokeColor`, `fillStyle`, `roughness`, …), identity and collaboration fields (`id`, `version`, `versionNonce`, optional fractional `index`), structure (`groupIds`, `frameId`, `boundElements`), flags (`isDeleted`, `locked`), and optional `link` / `customData`. Elements are intended to be **peer-shareable** without peer-local fields.
- **Key Files**: `packages/element/src/types.ts`, `packages/element/src/renderElement.ts`, `packages/excalidraw/components/App.tsx`
- **Distinction**: Unlike a generic DOM or React “element,” here **Element** always means **scene data**—the authoritative model for what gets drawn, exported, and synced—not a UI component instance.

### OrderedExcalidrawElement / NonDeleted
- **Definition**: **`OrderedExcalidrawElement`** is an `ExcalidrawElement` whose `index` (fractional index string) is **non-null**, consistent with stable ordering in the scene array. **`NonDeleted<T>`** narrows `isDeleted` so the element counts as present for hit-testing, rendering, and most editing operations. **`NonDeletedExcalidrawElement`** is the common working set type for the live canvas.
- **Key Files**: `packages/element/src/types.ts`, `packages/element/src/Scene.ts`, `packages/element/src/index.ts` (re-exports / guards)
- **Distinction**: “Ordered” refers to **fractional indexing for z-order and merge**, not TypeScript’s `Array.sort` outcome alone; “non-deleted” is a **tombstone pattern** (soft delete), not physical removal from history-aware structures.

### Scene
- **Definition**: The **authoritative container** for all scene elements: ordered lists, `SceneElementsMap` / `NonDeletedSceneElementsMap`, selection helpers, and invalidation (`sceneNonce`, `onUpdate` subscribers). `replaceAllElements` reconciles array order with fractional indices and rebuilds maps. The scene is the **source of truth** for “what is on the board,” while transient pointer/tool state lives in `AppState`.
- **Key Files**: `packages/element/src/Scene.ts`, `packages/excalidraw/components/App.tsx`, `packages/excalidraw/scene/Renderer.ts`
- **Distinction**: Unlike a generic “scene graph” in game engines, this **Scene** is tuned for **2D canvas editing**, **soft deletes**, **group/frame membership**, and **collaboration-friendly** element maps.

### SceneElementsMap / NonDeletedSceneElementsMap
- **Definition**: **Branded** `Map` types from element `id` to **ordered** elements. `SceneElementsMap` includes deleted elements; `NonDeletedSceneElementsMap` filters them. They represent the **full** current scene (not arbitrary subsets) when typed as scene-level maps.
- **Key Files**: `packages/element/src/types.ts`, `packages/element/src/Scene.ts`, `packages/excalidraw/history.ts`
- **Distinction**: Unlike a plain `Record<string, Element>`, these maps are **typed guarantees** for algorithms (history, binding, export) that require **complete** id→element lookups.

### Frame / Magic frame
- **Definition**: **`ExcalidrawFrameElement`** (`type: "frame"`) and **`ExcalidrawMagicFrameElement`** (`type: "magicframe"`) are **container-like** shapes with a `name`. Other elements reference a frame via `frameId`. **Frame rendering** options in `AppState` control clipping, labels, and outlines. Magic frames tie into **diagram-generation** flows (e.g. AI-assisted layouts) as a distinct product surface from ordinary frames.
- **Key Files**: `packages/element/src/types.ts`, `packages/excalidraw/actions/actionFrame.ts`, `packages/excalidraw/types.ts` (`frameRendering`, `frameToHighlight`)
- **Distinction**: Here **Frame** is a **first-class spatial container** with export and UI semantics, not a video or animation “frame.”

### ExcalidrawLinearElement (line / arrow)
- **Definition**: Polyline-style elements with `points` in **element-local** coordinates, optional **`startBinding` / `endBinding`** (`FixedPointBinding`), and arrowheads. **`ExcalidrawArrowElement`** adds elbow routing (`elbowed`, `fixedSegments`, …). Lines may be **polygonal** (`polygon` on line subtype). These types drive hit-testing, binding, and path rendering.
- **Key Files**: `packages/element/src/types.ts`, `packages/element/src/linearElementEditor.ts`, `packages/element/src/binding.ts`
- **Distinction**: “Linear” means **polyline geometry managed by the editor**, not “linear” as in linear algebra or linear time complexity.

### LinearElementEditor
- **Definition**: A **rich editor state object** (not a React component) for the currently manipulated linear element: selected point indices, drag state, hover indices, binding focus (`start`/`end`), elbow flags, `isEditing`, etc. Stored on `AppState.selectedLinearElement` and constructed when entering linear edit mode.
- **Key Files**: `packages/element/src/linearElementEditor.ts`, `packages/element/src/selection.ts`, `packages/excalidraw/types.ts` (`AppState.selectedLinearElement`)
- **Distinction**: Despite the name, it is **session state for editing one linear element**, not a general-purpose “editor” class for the whole app.

### Bindable element / Binding / BoundElement
- **Definition**: **`ExcalidrawBindableElement`** is the union of shapes (and select other types) that **arrows may attach to**. **`FixedPointBinding`** stores the target id, a **normalized anchor** (`fixedPoint`), and **`BindMode`** (`inside` | `orbit` | `skip`) controlling how the arrow meets the shape. **`BoundElement`** on a host lists **attached** arrows/text (`type` discriminant). **`suggestedBinding`** in `AppState` previews a candidate bind while drawing.
- **Key Files**: `packages/element/src/types.ts`, `packages/element/src/binding.ts`, `packages/excalidraw/types.ts` (`isBindingEnabled`, `suggestedBinding`)
- **Distinction**: This is **domain-specific arrow attachment**, not data binding in the MVVM/React sense.

### Text element / Text container
- **Definition**: **`ExcalidrawTextElement`** stores `text`, typography, alignment, `lineHeight`, and optional **`containerId`** when text lives inside a **bindable** shape (`ExcalidrawTextContainer`). **Bound text** resizing and position are coordinated with the container and linear hosts via helpers in `textElement.ts` and `LinearElementEditor`.
- **Key Files**: `packages/element/src/types.ts`, `packages/element/src/textElement.ts`, `packages/excalidraw/wysiwyg/textWysiwyg.tsx`
- **Distinction**: “Container” here is a **specific geometric host shape**, not a generic UI container component.

### Image element / FileId / BinaryFiles
- **Definition**: **`ExcalidrawImageElement`** references binary payload via **`FileId`** (branded string), with `status` (`pending` | `saved` | `error`), `scale`, and optional **`crop`**. **`BinaryFiles`** maps ids to **`BinaryFileData`** (`dataURL`, `mimeType`, timestamps, …). The scene holds **references**; heavy bytes live in the files map for lazy loading and persistence.
- **Key Files**: `packages/element/src/types.ts`, `packages/excalidraw/types.ts` (`BinaryFileData`, `BinaryFiles`), `excalidraw-app/data/FileManager.ts`
- **Distinction**: **`FileId`** identifies **embedded image blobs in app state**, not necessarily an OS file path or `FileSystemFileHandle` (which is separate on `AppState.fileHandle`).

### Embeddable / Iframe element
- **Definition**: **`ExcalidrawEmbeddableElement`** and **`ExcalidrawIframeElement`** (and **`ExcalidrawIframeLikeElement`**) represent **embedded web content** on canvas, with `IframeData` describing intrinsic size, link vs `srcdoc`, sandbox flags, etc. **`activeEmbeddable`** in `AppState` tracks hover/active interaction for embedding UX.
- **Key Files**: `packages/element/src/types.ts`, `packages/excalidraw/types.ts` (`activeEmbeddable`), `packages/element/src/shape.ts`
- **Distinction**: These are **canvas-first embeds** with export/host constraints, not arbitrary iframe usage in the shell UI.

### Library / LibraryItem
- **Definition**: **`LibraryItem`** (v2) is a reusable **saved bundle** of `NonDeleted` elements with `id`, `status` (`published` | `unpublished`), metadata (`name`, `created`, optional `error`). **`LibraryItems`** is an array of such items. The shape library UI and persistence layers migrate between v1 (flat element arrays) and v2.
- **Key Files**: `packages/excalidraw/types.ts`, `packages/excalidraw/data/library.ts`, `packages/excalidraw/data/types.ts` (`ExportedLibraryData`)
- **Distinction**: This **Library** is a **user’s reusable stencil collection**, not an npm package or code library.

---

## System state and logic

### AppState
- **Definition**: The large **React state** object on the editor `App` class: viewport (`scrollX/Y`, `zoom`, dimensions, offsets), **active tool** and tool preferences, **selection** (`selectedElementIds`, `selectedGroupIds`, `editingGroupId`), **transient creation/edit** (`newElement`, `multiElement`, `selectionElement`, `resizingElement`, `editingTextElement`, `selectedLinearElement`), UI (`openDialog`, `openSidebar`, `contextMenu`, `toast`, `theme`, modes like zen/view/grid), collaboration maps (`collaborators`, `userToFollow`, `followedBy`), snapping, search matches, cropping, and more. It is **merged** from actions and **observed** in part by the `Store` for history.
- **Key Files**: `packages/excalidraw/types.ts`, `packages/excalidraw/appState.ts`, `packages/excalidraw/components/App.tsx`
- **Distinction**: Unlike Redux-style global app config alone, **`AppState` mixes persistent preferences with highly ephemeral interaction state** tied to one editor session.

### UIAppState / Canvas app state slices
- **Definition**: **`UIAppState`** omits a few low-level fields not needed in all child contexts (e.g. some scroll/cursor fields). **`StaticCanvasAppState`** and **`InteractiveCanvasAppState`** are **readonly projections** of `AppState` fields each canvas layer needs, minimizing prop churn and documenting render responsibilities (static drawing vs overlays, handles, collaborators).
- **Key Files**: `packages/excalidraw/types.ts`, `packages/excalidraw/context/ui-appState.ts`, `packages/excalidraw/components/canvases/*.tsx`
- **Distinction**: These are **intentional type slices** for the renderer stack, not separate stores.

### newElement / multiElement / selectionElement
- **Definition**: **`newElement`**: in-progress shape being drawn from pointer down through move/up. **`multiElement`**: polyline/arrow being built by ** successive clicks** (multi-point mode). **`selectionElement`**: transient rubber-band **selection rectangle** when dragging with the selection tool—distinct from `type: "selection"` elements in older flows. All are **`AppState`** fields driving tool controllers in `App`.
- **Key Files**: `packages/excalidraw/types.ts`, `packages/excalidraw/components/App.tsx`, `packages/excalidraw/components/canvases/InteractiveCanvas.tsx`
- **Distinction**: These are **ephemeral construction state**, not committed scene elements until finalized into the `Scene`.

### ActiveTool / ToolType

- **Definition**: **`ToolType`** enumerates built-in tools (`selection`, `lasso`, shapes, `arrow`, `line`, `freedraw`, `text`, `image`, `eraser`, `hand`, `frame`, `magicframe`, `embeddable`, `laser`, …). **`ActiveTool`** is either `{ type: ToolType, customType: null }` or `{ type: "custom", customType: string }` for extensibility. **`AppState.activeTool`** also tracks `locked`, `lastActiveTool` (e.g. hand/eraser), and `fromSelection` for temporary tool switches.
- **Key Files**: `packages/excalidraw/types.ts`, `packages/excalidraw/actions/*.tsx`, `packages/excalidraw/components/shapes.tsx`
- **Distinction**: Tool type here is **editor modality**, not a generic “toolbar action id” (those are `ActionName`).

### Action

- **Definition**: A **command-shaped** unit registered with **`ActionManager`**: `name` (**`ActionName`**), `perform(elements, appState, formData, app)` returning **`ActionResult`** or `false`, optional keyboard `keyTest`, `predicate`, `PanelComponent`, and analytics `trackEvent`. Actions are how menus, shortcuts, and APIs apply edits uniformly.
- **Key Files**: `packages/excalidraw/actions/types.ts`, `packages/excalidraw/actions/manager.tsx`, `packages/excalidraw/actions/index.ts`
- **Distinction**: Unlike Redux “actions” (plain events), these **`Action` objects encapsulate behavior** and return structured **`ActionResult`** payloads consumed by `App.syncActionResult`.

### ActionResult / syncActionResult

- **Definition**: **`ActionResult`** is either `false` (abort) or an object with optional `elements`, `appState`, `files`, `replaceFiles`, and required **`captureUpdate`** (`CaptureUpdateActionType`). **`syncActionResult`** on `App` applies mutations: schedules store capture, may **`scene.replaceAllElements`**, merges partial **`AppState`** updates, and may trigger renders.
- **Key Files**: `packages/excalidraw/actions/types.ts`, `packages/excalidraw/components/App.tsx`
- **Distinction**: This is the **editor’s transaction boundary** between imperative UI commands and **scene + React state**, not a generic service-layer DTO.

### ActionManager

- **Definition**: Central registry and dispatcher for **`Action`** instances: `executeAction`, `handleKeyDown`, `registerAction` / `registerAll`. Constructed with callbacks to **`syncActionResult`**, current state, and scene element accessors. Bridges toolbar, context menu, command palette, and tests (`ActionSource`).
- **Key Files**: `packages/excalidraw/actions/manager.tsx`, `packages/excalidraw/components/App.tsx`
- **Distinction**: Unlike a global event bus, **`ActionManager` is typed to `ActionName` and coordinates with keyboard priority and predicates**.

### CaptureUpdateAction (IMMEDIATELY / NEVER / EVENTUALLY)

- **Definition**: Enum-like constants controlling **whether and when** a mutation is recorded for **undo/redo** via the `Store`. **IMMEDIATELY**: user edit, should enter history now. **NEVER**: remote sync, initialization, or history application—must not stack undo. **EVENTUALLY**: batched/async multi-step flows that should coalesce with the next durable capture.
- **Key Files**: `packages/element/src/store.ts`, `packages/excalidraw/actions/types.ts` (`ActionResult.captureUpdate`), `packages/excalidraw/components/App.tsx`
- **Distinction**: This is **history capture policy**, not React concurrent “priority.”

### Store / StoreSnapshot / DurableIncrement

- **Definition**: The **`Store`** (in `@excalidraw/element`) diffs **snapshots** of elements + observed `AppState` fields, emitting **`DurableIncrement`** (undoable) and **`EphemeralIncrement`** events. **`Store.commit`** runs after React updates (`App.componentDidUpdate`), flushing micro-actions and computing deltas. It holds a reference to the concrete **`App`** class to read scene/state when building snapshots.
- **Key Files**: `packages/element/src/store.ts`, `packages/excalidraw/components/App.tsx`, `packages/element/src/delta.ts`
- **Distinction**: Unlike Redux store, this **`Store` is change-detection and history instrumentation**, not the primary UI state container.

### History / HistoryDelta

- **Definition**: **`History`** maintains **`undoStack` / `redoStack`** of **`HistoryDelta`** objects (extends **`StoreDelta`**). On durable increments, `App` calls **`history.record`**. **`HistoryDelta.applyTo`** updates maps and `AppState` while **excluding `version` / `versionNonce`** on element application so undo/redo behaves correctly under collaboration versioning semantics.
- **Key Files**: `packages/excalidraw/history.ts`, `packages/excalidraw/actions/actionHistory.tsx`, `packages/element/src/delta.ts`
- **Distinction**: Undo stacks are **fed from Store deltas**, not from raw `ActionManager` calls—actions only opt into capture via **`captureUpdate`**.

### Renderer / RenderableElementsMap

- **Definition**: **`Renderer`** memoizes **which non-deleted elements** should be painted on the static canvas layer given viewport, zoom, `editingTextElement`, and `newElementId` (to avoid double-drawing in-progress or inline-edited text). Output includes **`RenderableElementsMap`** and visibility lists consumed by **`renderStaticScene`**.
- **Key Files**: `packages/excalidraw/scene/Renderer.ts`, `packages/excalidraw/scene/types.ts`, `packages/excalidraw/renderer/staticScene.ts`
- **Distinction**: This **Renderer** is a **scene culling/memo helper**, not the low-level Canvas 2D API wrapper (`renderElement` still does per-element drawing).

### ShapeCache

- **Definition**: Caches **computed geometric representations** (e.g. rough paths, bounds helpers) keyed by element identity/version so **Rough.js** and hit-testing avoid redundant work. Integrates with theme/export considerations in shape generation.
- **Key Files**: `packages/element/src/shape.ts`, `packages/element/src/renderElement.ts`, `packages/excalidraw/scene/types.ts` (`ElementShape`)
- **Distinction**: Unlike HTTP cache, this is **per-session derived geometry cache** invalidated by element mutation/versioning.

### sceneNonce

- **Definition**: A monotonic **invalidation counter** on `Scene` bumped when elements are replaced or the scene is triggered to update. Used so memoized render paths (e.g. **`Renderer.getRenderableElements`**) know when cached visible sets are stale—**distinct from per-element `version`** fields used in collaboration.
- **Key Files**: `packages/element/src/Scene.ts`, `packages/excalidraw/scene/Renderer.ts`, `packages/excalidraw/components/App.tsx`
- **Distinction**: Not a cryptographic nonce; a **cache-bust sequence** for the scene as a whole.

### Fractional index (`index`)

- **Definition**: String **fractional index** (branded `FractionalIndex`) per element for **stable ordering** between array position and collaborative merge/undo. New elements may have `index: null` until synchronized; `Scene` utilities **`syncInvalidIndices` / `syncMovedIndices`** maintain consistency with array order.
- **Key Files**: `packages/element/src/types.ts`, `packages/element/src/Scene.ts`, `packages/element/src/zindex.ts`
- **Distinction**: This **`index` is z-order / reconciliation metadata**, not a database primary key or array numeric index.

### version / versionNonce / seed

- **Definition**: **`version`** increments on each logical element change for **merge ordering**; **`versionNonce`** is a random integer regenerated on change to break ties when versions collide in collaboration. **`seed`** stabilizes **Rough.js** appearance across renders. Together they support **deterministic reconciliation** and visual consistency.
- **Key Files**: `packages/element/src/types.ts`, `packages/excalidraw/history.ts` (exclusions on undo), `excalidraw-app/collab/*.tsx` (remote sync)
- **Distinction**: These are **CRDT-flavored versioning fields**, not semver or build numbers.

### ImportedDataState / ExportedDataState

- **Definition**: **`ImportedDataState`** describes a **payload** to hydrate the editor (`elements`, partial `appState`, `files`, `libraryItems`, `scrollToContent`, …). **`ExportedDataState`** is the **JSON export shape** (`type`, `version`, `source`, cleaned `appState`, `elements`, optional `files`). They underpin load/save, clipboard, and API **`updateScene`** flows.
- **Key Files**: `packages/excalidraw/data/types.ts`, `packages/excalidraw/data/json.ts`, `packages/excalidraw/components/App.tsx`
- **Distinction**: Unlike arbitrary JSON blobs, these types are **schema-versioned persistence contracts** for the whiteboard format.

### Collaborator / SocketId

- **Definition**: **`Collaborator`** describes a **remote participant**: pointer or laser position, optional selection snapshot, username, avatar, idle state, call/audio flags, colors, **`socketId`**. **`SocketId`** is a branded string keying `AppState.collaborators` map. **`UserToFollow`** captures follow-cam targeting in collab.
- **Key Files**: `packages/excalidraw/types.ts`, `excalidraw-app/collab/Collab.tsx`, `packages/excalidraw/renderer/interactiveScene.ts`
- **Distinction**: Here **collaborator** means **live session presence**, not RBAC “collaborator” on a document product.

### TTD (“Text to diagram”) / Mermaid tab

- **Definition**: **`AppState.openDialog`** may be `{ name: "ttd", tab: "text-to-diagram" | "mermaid" }`—the **TTD dialog** for generating diagrams from natural language or **Mermaid** syntax, using `@excalidraw/mermaid-to-excalidraw` and related UI under `components/TTDDialog/`. Jotai atoms in `TTDContext` hold chat/preview/error for that surface.
- **Key Files**: `packages/excalidraw/types.ts`, `packages/excalidraw/components/TTDDialog/`, `packages/excalidraw/mermaid.ts`
- **Distinction**: **TTD** is a **product feature name** in this repo, not “time to delivery.”

### SnapLine / objects snap mode

- **Definition**: **`SnapLine`** structures represent **alignment guides** during drag/resize. **`objectsSnapModeEnabled`** toggles snapping behavior vs grid-only workflows. Rendered in the interactive canvas layer alongside selection UI.
- **Key Files**: `packages/excalidraw/snapping.ts`, `packages/excalidraw/types.ts`, `packages/excalidraw/renderer/interactiveScene.ts`
- **Distinction**: These are **2D editor alignment aids**, not distributed systems “snapshots.”

### updateScene (API)

- **Definition**: Imperative **`App` method** (also exposed on embed APIs) to patch **`elements`**, **`appState`**, **`files`**, library data, and to control **`captureUpdate`** behavior—primary integration point for hosts embedding `<Excalidraw />`.
- **Key Files**: `packages/excalidraw/components/App.tsx`, `packages/excalidraw/index.tsx`, `packages/excalidraw/tests/packages/events.test.tsx`
- **Distinction**: Despite the name, it updates **both scene and editor state**, not only geometric “scene” in the cinematography sense.

### ExcalidrawProps

- **Definition**: The React **props contract** for the public editor: initial data, callbacks (`onChange`, `onCollabButtonClick`, …), feature flags, UI customization, **`viewModeEnabled`**, theme, dimensions, and collaboration hooks. Drives how **`App`** initializes and what is forwarded to children.
- **Key Files**: `packages/excalidraw/types.ts`, `packages/excalidraw/index.tsx`, `examples/with-nextjs/`, `examples/with-script-in-browser/`
- **Distinction**: This is the **embeddable whiteboard configuration surface**, not generic React `ComponentProps`.

### AppClassProperties

- **Definition**: The **type of `this`** passed into `Action.perform` and many internal helpers: the subset of **`App`** instance methods and fields the action system and panels are allowed to call (imperative API surface). Bridges typed actions with class-based editor internals.
- **Key Files**: `packages/excalidraw/types.ts` (declaration), `packages/excalidraw/components/App.tsx` (implementation), `packages/excalidraw/actions/types.ts`
- **Distinction**: Unlike a public SDK interface alone, **`AppClassProperties` leaks deliberate editor internals** to first-party actions while keeping embed consumers on **`ExcalidrawImperativeAPI`**.

### mutateElement / newElementWith / ElementUpdate

- **Definition**: **`mutateElement`** applies a partial **`ElementUpdate`** (typed omit of `id`/`updated`) to a **mutable** element in place: bumps **`version` / `versionNonce`**, updates **`updated`**, invalidates **`ShapeCache`**, and may adjust bindings (e.g. elbow arrows). **`Scene.mutateElement`** wraps this to **notify** subscribers. **`newElementWith`** creates a **copied** element with patches (immutable-style updates). Docs in code warn that bare **`mutateElement` does not trigger React re-render**—hosts must go through scene/API paths when needed.
- **Key Files**: `packages/element/src/mutateElement.ts` (`mutateElement`, `newElementWith`), `packages/element/src/Scene.ts`, `packages/element/src/newElement.ts` (element factories)
- **Distinction**: This is **domain-aware in-place mutation** with collaboration fields, not a generic `Object.assign`.

### GroupId / Grouping

- **Definition**: **`GroupId`** is a string label stored in each member’s **`groupIds`** array (**deepest → shallowest** nesting). **`selectedGroupIds`** tracks top-level selected groups; **`editingGroupId`** means “drill into group” editing. Group/ungroup actions maintain consistent **`groupIds`** across members.
- **Key Files**: `packages/element/src/types.ts`, `packages/excalidraw/types.ts`, `packages/excalidraw/actions/actionGroup.tsx`, `packages/element/src/groups.ts`
- **Distinction**: Groups are **logical multi-selection units** persisted on elements, not Photoshop-style layers with separate timeline semantics.

### ClipboardData

- **Definition**: Structured **paste/payload** for excalidraw-native clipboard operations: elements, files, optional partial app state, and metadata used when copying from/to the canvas or external integrations.
- **Key Files**: `packages/excalidraw/clipboard.ts`, `packages/excalidraw/types.ts` (imports), `packages/excalidraw/actions/actionClipboard.tsx`
- **Distinction**: Not the browser **`ClipboardEvent.clipboardData`** API type alone—this is the **editor’s normalized interchange model**.

### ChartType / Spreadsheet (charts dialog)

- **Definition**: **`ChartType`** (`bar` | `line` | `radar`) selects which generator runs on a parsed **`Spreadsheet`** (tabular series data). **`openDialog: { name: "charts", data, rawText }`** opens the charts UI; helpers validate dimensions per chart type (`isSpreadsheetValidForChartType`).
- **Key Files**: `packages/element/src/types.ts` (`ChartType`), `packages/excalidraw/charts/charts.types.ts`, `packages/excalidraw/charts/charts.helpers.ts`, `packages/excalidraw/types.ts` (`openDialog` charts variant)
- **Distinction**: **Spreadsheet** here is **in-memory table data for chart generation**, not Excel file integration by default.

### viewModeEnabled / zenModeEnabled / gridModeEnabled

- **Definition**: **`viewModeEnabled`**: read-only canvas—limited actions may still run if marked `viewMode` on the **`Action`**. **`zenModeEnabled`**: minimal chrome for focus. **`gridModeEnabled`** + **`gridSize` / `gridStep`**: background grid snapping and display. Each is part of **`AppState`** and may be persisted per **`APP_STATE_STORAGE_CONF`**.
- **Key Files**: `packages/excalidraw/types.ts`, `packages/excalidraw/appState.ts`, `packages/excalidraw/actions/types.ts` (`viewMode` flag on actions)
- **Distinction**: **View mode** is **editor capability gating**, not HTTP 304 “view” caching.

### SearchMatch / search menu

- **Definition**: **`SearchMatch`** describes one found text hit: element id, focus flag, and **`matchedLines`** rectangles (offsets + whether to show on canvas). **`AppState.searchMatches`** holds the focused id and all matches for the in-canvas search UI.
- **Key Files**: `packages/excalidraw/types.ts`, `packages/excalidraw/components/SearchMenu.tsx`, `packages/excalidraw/actions/actionToggleSearchMenu.ts`
- **Distinction**: This is **diagram text search**, not workspace-wide code search.

### APP_STATE_STORAGE_CONF

- **Definition**: Configuration map marking which **`AppState` keys** participate in **browser persistence**, **export**, and/or **server** payloads—so sensitive or session-only keys are stripped appropriately when saving or syncing.
- **Key Files**: `packages/excalidraw/appState.ts`, `packages/excalidraw/data/types.ts` (`cleanAppStateForExport` consumer)
- **Distinction**: Unlike ad-hoc `JSON.stringify` filters, this is a **central allowlist/denylist** for storage shapes.

### ExcalidrawFreeDrawElement

- **Definition**: **`type: "freedraw"`** element storing **`points`**, **`pressures`**, and **`simulatePressure`** for **perfect-freehand**-style strokes. Shares polyline machinery with linear elements for some helpers but is visually and semantically a **freeform pen** stroke.
- **Key Files**: `packages/element/src/types.ts`, `packages/element/src/shape.ts` (`getFreedrawShape`), `packages/excalidraw/components/App.tsx` (tool handling)
- **Distinction**: Not the same as **`line`** / **`arrow`**—no arrowheads or bindings in the linear-element sense.

### Gesture (multi-touch)

- **Definition**: **`AppState`**-adjacent structure (see `types.ts`) tracking **multiple pointers**, last center, and pinch metadata (`initialDistance`, `initialScale`) for **trackpad/touch zoom and pan** choreography on the canvas.
- **Key Files**: `packages/excalidraw/types.ts`, `packages/excalidraw/components/App.tsx` (pointer/gesture handlers)
- **Distinction**: This **`Gesture` type** is **editor input state**, not the browser’s **`GestureEvent`** interface (though related concepts exist alongside).

### Laser tool / trails

- **Definition**: **`ToolType` “laser”** and **`CollaboratorPointer.tool: "laser"`** drive **ephemeral laser pointer** visuals. **`SVGLayer`** renders **`laserTrails`** (and lasso/eraser trails) as vector overlays without mutating **`ExcalidrawElement`** lists.
- **Key Files**: `packages/excalidraw/types.ts`, `packages/excalidraw/components/App.tsx` (`SVGLayer`), `packages/excalidraw/renderer/interactiveScene.ts`
- **Distinction**: Laser strokes are **presentation/collab overlays**, not persisted drawing unless converted elsewhere.

---

## Visual and style domain (canvas-specific)

### Roughness / FillStyle / StrokeStyle

- **Definition**: **`roughness`** controls hand-drawn wobble amplitude for **Rough.js**. **`FillStyle`** (`hachure`, `cross-hatch`, `solid`, `zigzag`) and **`StrokeStyle`** (`solid`, `dashed`, `dotted`) are enumerated visual styles stored on each element and mirrored in **`AppState.currentItem*`** defaults for new drawings.
- **Key Files**: `packages/element/src/types.ts`, `packages/excalidraw/appState.ts`, `packages/common` (constants like `DEFAULT_ELEMENT_PROPS`)
- **Distinction**: “Roughness” is **aesthetic sketch parameter**, not image processing noise reduction.

### Arrowhead / elbow arrow

- **Definition**: **`Arrowhead`** enumerates terminal decorations (and ER diagram cardinality variants). **Elbow** arrows use segmented orthogonal paths with **`fixedSegments`** and special flags (`startIsSpecial`, `endIsSpecial`) to preserve geometry when rebinding across sides.
- **Key Files**: `packages/element/src/types.ts`, `packages/excalidraw/actions/actionProperties.tsx`, `packages/element/src/linearElementEditor.ts`
- **Distinction**: Arrowheads here are **vector diagram semantics**, not HTTP response headers.

---

## Layering (rendering)

### StaticCanvas / InteractiveCanvas / NewElementCanvas

- **Definition**: Three **HTML canvas** layers: **Static** draws the main scene (grid + visible elements); **NewElement** draws the in-progress `newElement` when present; **Interactive** draws selection chrome, linear handles, collaborator cursors, scrollbars, trails, etc. **`SVGLayer`** adds vector overlays (lasso, laser, eraser trails) above canvases.
- **Key Files**: `packages/excalidraw/components/canvases/StaticCanvas.tsx`, `InteractiveCanvas.tsx`, `NewElementCanvas.tsx`, `packages/excalidraw/components/App.tsx`
- **Distinction**: This split optimizes **repaint cost and z-ordering**, not “static” in the Next.js SSG sense.

---

*Last Updated: 2026-03-26*  
*Verified against source: Yes*
