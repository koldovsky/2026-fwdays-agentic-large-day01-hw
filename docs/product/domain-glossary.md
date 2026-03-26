# Domain Glossary

Terms are listed in dependency order: primitives first, then higher-level concepts that build on them.

---

## ExcalidrawElement

**Definition**
The fundamental unit of content in the editor. A plain, JSON-serializable, immutable-by-convention object that describes one drawable entity on the canvas. Defined as a TypeScript discriminated union in `packages/element/src/types.ts`.

Every element shares a common base (`_ExcalidrawElementBase`) with fields: `id`, `x`, `y`, `width`, `height`, `angle`, `strokeColor`, `backgroundColor`, `fillStyle`, `roughness`, `opacity`, `version`, `versionNonce`, `updated`, `isDeleted`, `groupIds`, `frameId`, `boundElements`, `locked`, `index`. Additional fields not listed here include `seed`, `strokeWidth`, `strokeStyle`, `roundness`, `link`, and `customData`; see the full definition at `_ExcalidrawElementBase` in `packages/element/src/types.ts:40`.

Concrete subtypes: `rectangle`, `diamond`, `ellipse`, `text`, `arrow`, `line`, `freedraw`, `image`, `frame`, `magicframe`, `iframe`, `embeddable`.

**Key files**
- `packages/element/src/types.ts` — full type definitions
- `packages/element/src/newElement.ts` — factory functions
- `packages/element/src/mutateElement.ts` — only valid mutation path

**Do NOT confuse with**
A generic "element" (DOM element, HTML element). In this codebase, "element" without qualification always means an `ExcalidrawElement` — a data object, not a DOM node.

---

## Scene

**Definition**
The in-memory registry that owns all `ExcalidrawElement` objects during a session. A singleton `Scene` class instance held on `App` as `this.scene`. Maintains four always-in-sync data structures: `elements[]` (array including deleted), `elementsMap` (Map including deleted), `nonDeletedElements[]`, and `nonDeletedElementsMap`. Fires registered callbacks on every update via `scene.onUpdate(callback)` — the bridge back to React re-renders.

**Key files**
- `packages/element/src/Scene.ts` — full implementation
- `packages/excalidraw/components/App.tsx` — `this.scene = new Scene()` in constructor

**Do NOT confuse with**
- A "scene" in 3D graphics (a scene graph with spatial hierarchy). The Excalidraw `Scene` is a flat ordered list — no parent-child transform inheritance.
- `SceneData` — a plain data transfer type (`{ elements, appState, collaborators, captureUpdate }`) used by the `updateScene` API. `SceneData` is not a `Scene`.

---

## AppState

**Definition**
The React state (`this.state`) of the `App` class component. Typed as `interface AppState` in `packages/excalidraw/types.ts`. Contains all UI and editor state that is NOT element data: viewport (`scrollX`, `scrollY`, `zoom`), active tool, selection IDs, open dialogs, current drawing properties (`currentItemStrokeColor`, `currentItemFontSize`, …), collaboration state, export settings, and mode flags.

Persistence per field is controlled by `APP_STATE_STORAGE_CONF` in `appState.ts`, which maps each field to three boolean dimensions: `browser` (localStorage), `export` (file), `server` (collaboration).

**Key files**
- `packages/excalidraw/types.ts` — `interface AppState` (~60 fields)
- `packages/excalidraw/appState.ts` — `getDefaultAppState()`, `APP_STATE_STORAGE_CONF`
- `packages/excalidraw/components/App.tsx` — `this.state`, `this.setState(...)`

**Do NOT confuse with**
- Element data — elements live in `Scene`, not in `AppState`.
- `ObservedAppState` — a strict subset of `AppState` fields that the `Store` tracks for diffing (`{ name, viewBackgroundColor, editingGroupId, selectedElementIds, selectedGroupIds, selectedLinearElement, croppingElementId, lockedMultiSelections, activeLockedId }`). Only these fields affect undo/redo history.
- `StaticCanvasAppState` / `InteractiveCanvasAppState` — sliced subsets of `AppState` passed to canvas components; defined in `types.ts`.

---

## Tool / ActiveTool

**Definition**
The currently selected drawing instrument. `ToolType` is a string union of all valid tool names: `"selection"`, `"lasso"`, `"rectangle"`, `"diamond"`, `"ellipse"`, `"arrow"`, `"line"`, `"freedraw"`, `"text"`, `"image"`, `"eraser"`, `"hand"`, `"frame"`, `"magicframe"`, `"embeddable"`, `"laser"`.

`ActiveTool` is the runtime value stored in `AppState.activeTool`. It is a discriminated union: either `{ type: ToolType; customType: null }` for built-in tools, or `{ type: "custom"; customType: string }` for host-app extensions.

**Key files**
- `packages/excalidraw/types.ts` — `ToolType`, `ActiveTool`
- `packages/common/src/constants.ts` — `TOOL_TYPE` constant object (same values)
- `packages/excalidraw/components/App.tsx` — `setActiveTool()`, tool dispatch in `onPointerDown`

**Do NOT confuse with**
`Action` — an action is a command that can be executed (undo, align, copy styles). A tool is the persistent mode that determines what happens on pointer events. Tools create elements; actions transform existing state.

---

## Action / ActionResult / ActionName

**Definition**
The command pattern used for all state mutations that should be undoable, keyboard-triggered, or toolbar-driven. Each `Action` object has:
- `name: ActionName` — one of ~100 registered names (`"copy"`, `"sendBackward"`, `"changeFontSize"`, …)
- `perform(elements, appState, formData, app) → ActionResult | Promise<ActionResult>` — the mutation function
- `keyTest?(event, appState, elements, app) → boolean` — keyboard shortcut matcher
- `keyPriority?: number` — tiebreaker when multiple actions match the same key

`ActionResult` is what `perform` returns: `{ elements?, appState?, files?, captureUpdate }` or `false` (cancelled). It is passed to `syncActionResult` on `App`, which applies the changes.

`ActionSource` describes what triggered the action: `"ui"`, `"keyboard"`, `"contextMenu"`, `"api"`, `"commandPalette"`.

**Key files**
- `packages/excalidraw/actions/types.ts` — `Action`, `ActionResult`, `ActionName`, `ActionSource`
- `packages/excalidraw/actions/manager.tsx` — `ActionManager` class
- `packages/excalidraw/actions/` — one file per action group (46 files)
- `packages/excalidraw/components/App.tsx` — `syncActionResult`, `this.actionManager`

**Do NOT confuse with**
A Redux "action" (a plain data object dispatched to a reducer). Here an `Action` is an object with a `perform` method — closer to a command object than a Redux action.

---

## Store / StoreSnapshot / StoreDelta / CaptureUpdateAction

**Definition**
The change-capture layer between the live scene/appState and the undo/redo history.

- `Store` — holds a `StoreSnapshot` and is called via `store.commit(elementsMap, appState)` at the end of every `componentDidUpdate`. It diffs the current state against the snapshot and emits either a `DurableIncrement` (undoable) or `EphemeralIncrement` (non-undoable).
- `StoreSnapshot` — a frozen copy of `SceneElementsMap` + `ObservedAppState` used as the baseline for diffing.
- `StoreDelta` — a diff object wrapping `ElementsDelta` and `AppStateDelta`, each holding `{ deleted: Partial<T>, inserted: Partial<T> }` maps.
- `CaptureUpdateAction` — enum controlling what the next commit captures: `IMMEDIATELY` (goes to undo stack now), `EVENTUALLY` (deferred, merged into next IMMEDIATELY), `NEVER` (remote updates, initialization — never recorded).

**Key files**
- `packages/element/src/store.ts` — `Store`, `StoreSnapshot`, `CaptureUpdateAction`
- `packages/element/src/delta.ts` — `Delta`, `ElementsDelta`, `AppStateDelta`, `StoreDelta`
- `packages/excalidraw/components/App.tsx` — `this.store = new Store(this)`, `store.commit(...)` at line 3509

**Do NOT confuse with**
- A data store / Redux store / Zustand store. The Excalidraw `Store` is a narrow, single-purpose diff-and-emit mechanism, not a general state container.
- `editorJotaiStore` — the Jotai atom store, a completely separate concept.

---

## History / Delta

**Definition**
The undo/redo subsystem. `History` holds two stacks of `StoreDelta` objects (`undoStack`, `redoStack`). It is populated by `store.onDurableIncrementEmitter` events wired in `componentDidMount`.

`Delta<T>` is the base diff type: `{ deleted: Partial<T>, inserted: Partial<T> }`. `inverse()` swaps the two sides to reverse an operation. The history skips empty deltas and iterates until it finds a delta with at least one visible change.

**Key files**
- `packages/excalidraw/history.ts` — `History` class, `HistoryDelta`
- `packages/element/src/delta.ts` — `Delta`, `ElementsDelta`, `AppStateDelta`
- `packages/excalidraw/actions/actionHistory.tsx` — `createUndoAction`, `createRedoAction`

**Do NOT confuse with**
Browser history (`window.history`). Excalidraw `History` is purely in-memory undo/redo with no URL involvement.

---

## Binding / BoundElement

**Definition**
The relationship between an arrow and a shape it is attached to. When an arrow's endpoint is bound, it snaps to the shape's border and updates automatically when the shape moves or resizes.

`BoundElement` (on shapes) is `{ id: string; type: "arrow" | "text" }` — a reference to the arrow or text bound to the shape. `ExcalidrawArrowElement` has `startBinding` and `endBinding` pointing to a `{ elementId, focus, gap }` object.

**Key files**
- `packages/element/src/types.ts` — `BoundElement`, `PointBinding` on arrow types
- `packages/element/src/binding.ts` — `bindOrUnbindBindingElements`, `updateBoundElements`, `getHoveredElementForBinding`
- `packages/excalidraw/components/App.tsx` — binding logic in pointer handlers

**Do NOT confuse with**
CSS `border`, data binding frameworks, or React's controlled/uncontrolled inputs. "Binding" here is purely about arrow-to-shape attachment geometry.

---

## Group / GroupId

**Definition**
A logical cluster of elements that move, resize, and copy together. Groups have no dedicated element type — grouping is expressed via the `groupIds: readonly string[]` array on each element. Elements share a common `GroupId` string to signal membership. Groups can be nested: `groupIds` is ordered deepest-to-shallowest.

**Key files**
- `packages/element/src/types.ts` — `GroupId` type, `groupIds` field on `_ExcalidrawElementBase`
- `packages/element/src/groups.ts` — `getElementsInGroup`, `getSelectedGroupIds`, `selectGroupsForSelectedElements`
- `packages/excalidraw/actions/actionGroup.tsx` — group/ungroup actions

**Do NOT confuse with**
A container element (frame). Groups are invisible logical associations; frames are visible rectangular elements that clip their children.

---

## Frame / MagicFrame

**Definition**
A visible rectangular element (`ExcalidrawFrameElement`, type `"frame"`) that acts as a named container. Elements inside a frame are clipped to its bounds in exports and rendered differently. `ExcalidrawMagicFrameElement` (type `"magicframe"`) is a variant used with AI-powered code generation — it wraps selected elements to submit them to an AI endpoint that returns an iframe with generated HTML.

**Key files**
- `packages/element/src/types.ts` — `ExcalidrawFrameElement`, `ExcalidrawMagicFrameElement`, `ExcalidrawFrameLikeElement`
- `packages/element/src/frame.ts` — frame membership queries, clipping helpers
- `packages/excalidraw/actions/actionFrame.ts` — frame actions

**Do NOT confuse with**
An animation frame (`requestAnimationFrame`). A `Frame` in Excalidraw is a visual grouping element on the canvas.

---

## Library / LibraryItem

**Definition**
A user-curated collection of reusable element groups that can be dragged onto the canvas. `LibraryItem` (v2) is `{ id, status: "published" | "unpublished", elements: NonDeleted<ExcalidrawElement>[], created, name? }`. Multiple items form `LibraryItems`. The library is persisted to IndexedDB and can be shared via `.excalidrawlib` files.

**Key files**
- `packages/excalidraw/types.ts` — `LibraryItem`, `LibraryItems`, `LibraryItemsSource`
- `packages/excalidraw/data/library.ts` — persistence, serialization
- `packages/excalidraw/components/LibraryMenu.tsx` — UI

**Do NOT confuse with**
An npm package/library. `Library` here is the in-app saved shapes panel.

---

## Collaboration / Collaborator

**Definition**
The real-time multi-user editing feature. `Collaborator` is the data type representing one remote user: `{ pointer?, button?, selectedElementIds?, username?, userState?, color?, avatarUrl?, id?, socketId?, isCurrentUser?, isInCall?, isSpeaking?, isMuted? }`.

`App.state.collaborators` is `Map<SocketId, Collaborator>` — the live map of all other users. `SocketId` is a branded string. The collaboration layer (in `excalidraw-app/`) pushes updates into the editor via `api.updateScene({ collaborators, captureUpdate: CaptureUpdateAction.NEVER })`.

`UserIdleState` enum (`"active"`, `"away"`, `"idle"`) tracks presence. Follow mode (`userToFollow: UserToFollow | null`) lets one user mirror another user's viewport.

**Key files**
- `packages/excalidraw/types.ts` — `Collaborator`, `SocketId`, `CollaboratorPointer`, `UserToFollow`
- `packages/common/src/constants.ts` — `UserIdleState`, `IDLE_THRESHOLD`, `ACTIVE_THRESHOLD`
- `excalidraw-app/collab/` — Socket.io wiring (outside the library package)

**Do NOT confuse with**
The `collaborators` prop being a React state setter. The library itself has no Socket.io dependency — collaboration is handled by the host app which pushes data in via `updateScene`.

---

## BinaryFiles / BinaryFileData

**Definition**
The store for binary assets referenced by `ExcalidrawImageElement`. `BinaryFileData` is `{ mimeType, id: FileId, dataURL: DataURL, created, lastRetrieved?, version? }`. `BinaryFiles` is `Record<ExcalidrawElement["id"], BinaryFileData>` — a plain object keyed by element id.

Elements reference files by `fileId: FileId | null`. The actual pixel data is decoupled from the element to keep elements JSON-serializable and small. `App.files` is the runtime file store; it is passed alongside elements in `onChange` callbacks.

**Key files**
- `packages/excalidraw/types.ts` — `BinaryFileData`, `BinaryFiles`, `FileId`
- `packages/excalidraw/data/blob.ts` — loading and compression
- `packages/excalidraw/components/App.tsx` — `this.files`, `addFiles()`, `imageCache`

**Do NOT confuse with**
Element data itself. `BinaryFiles` is a parallel store, not embedded inside elements.

---

## ShapeCache

**Definition**
A cache from element id → RoughJS `Drawable` object. Generating a `Drawable` (the hand-drawn stroke path) via RoughJS is expensive and seeded by `element.seed`, so it must not be recomputed on every render frame. `ShapeCache` stores the result after first generation and invalidates it whenever `mutateElement` changes a geometry field (`width`, `height`, `points`, `fileId`).

**Key files**
- `packages/element/src/shape.ts` — `ShapeCache` class
- `packages/element/src/mutateElement.ts` — `ShapeCache.delete(element)` on geometry change
- `packages/element/src/renderElement.ts` — reads from `ShapeCache` during canvas draw

**Do NOT confuse with**
Browser HTTP caching, or any React memoization. `ShapeCache` is purely a session-level in-memory cache for canvas drawing operations.

---

## FractionalIndex

**Definition**
A string in fractional-indexing format (e.g., `"a0"`, `"a1V"`) stored as `element.index`. Used to determine z-order (paint order) in multiplayer scenarios where integer indices would cause conflicts. All elements in the scene are kept sorted by `index`. `syncMovedIndices` and `syncInvalidIndices` keep the array order and fractional index values always consistent.

**Key files**
- `packages/element/src/types.ts` — `FractionalIndex` branded type, `index` field on `_ExcalidrawElementBase`
- `packages/element/src/fractionalIndex.ts` — `syncMovedIndices`, `syncInvalidIndices`, `validateFractionalIndices`
- `packages/element/src/zindex.ts` — bring-to-front / send-to-back using fractional indices

**Do NOT confuse with**
A numeric array index. `FractionalIndex` is a string that lexicographically sorts between any two adjacent values, enabling insertion without renumbering.

---

## Renderer

**Definition**
The `Renderer` class (`packages/excalidraw/scene/Renderer.ts`) acts as a memoized view-culling layer between `Scene` and the canvas draw calls. Its single public method `getRenderableElements({ zoom, scrollX, scrollY, width, height, editingTextElement, newElementId, sceneNonce })` returns `{ elementsMap: RenderableElementsMap, visibleElements }`. The result is memoized — the cache key includes `sceneNonce`, so it is invalidated on every scene update.

**Key files**
- `packages/excalidraw/scene/Renderer.ts` — `Renderer` class
- `packages/excalidraw/renderer/staticScene.ts` — `renderStaticScene`, `renderStaticSceneThrottled`
- `packages/excalidraw/renderer/interactiveScene.ts` — selection, handles, cursors
- `packages/excalidraw/components/canvases/StaticCanvas.tsx` — consumer

**Do NOT confuse with**
React's renderer (`react-dom`). The Excalidraw `Renderer` is a canvas-drawing orchestrator, not a React concept.

---

## ViewMode / ZenMode / GridMode

**Definition**
Three independent boolean mode flags stored in `AppState`:

- **`viewModeEnabled`** — read-only mode. Elements cannot be selected, created, or modified. Only pan/zoom is allowed. Event listeners for editing are removed when this is active. Also exposed as `props.viewModeEnabled`.
- **`zenModeEnabled`** — hides the toolbar and UI chrome, leaving only the canvas. Useful for presentations. Does not restrict editing.
- **`gridModeEnabled`** — snaps new elements and moves to a grid defined by `AppState.gridSize` and `AppState.gridStep`.

**Key files**
- `packages/excalidraw/types.ts` — `AppState` fields `viewModeEnabled`, `zenModeEnabled`, `gridModeEnabled`
- `packages/excalidraw/components/App.tsx` — `addEventListeners()` checks `viewModeEnabled`
- `packages/excalidraw/appState.ts` — default values

**Do NOT confuse with**
Each other — they are orthogonal. View mode restricts interaction; zen mode hides UI; grid mode changes snapping behavior.

---

## EditorInterface

**Definition**
A derived descriptor of the current runtime environment: `{ formFactor: "phone" | "tablet" | "desktop", desktopUIMode: "compact" | "full", userAgent: { isMobileDevice, platform }, isTouchScreen, canFitSidebar, isLandscape }`. Recomputed by `refreshEditorInterface()` whenever the container resizes. Determines responsive layout decisions: which UI panels are shown, whether the sidebar fits, and what `StylesPanelMode` to use.

**Key files**
- `packages/common/src/editorInterface.ts` — `EditorInterface` type, `getFormFactor()`, `deriveStylesPanelMode()`
- `packages/excalidraw/components/App.tsx` — `this.editorInterface`, `this.refreshEditorInterface()`

**Do NOT confuse with**
The `ExcalidrawImperativeAPI` (the external API object). `EditorInterface` is about the physical rendering environment; `ExcalidrawImperativeAPI` is the programmatic control surface.

---

## ExcalidrawImperativeAPI

**Definition**
The object returned to host applications via the `onExcalidrawAPI` or `ref` prop. Exposes: `updateScene`, `applyDeltas`, `mutateElement`, `resetScene`, `getSceneElements`, `getAppState`, `getFiles`, `scrollToContent`, `addFiles`, `setActiveTool`, `toggleSidebar`, `onChange`, `onIncrement`, `onPointerDown`, `onPointerUp`, `onScrollChange`, `onStateChange`, `onEvent`, and more. All `get*` methods throw after `isDestroyed === true` (post-unmount).

**Key files**
- `packages/excalidraw/types.ts` — `ExcalidrawImperativeAPI` interface
- `packages/excalidraw/components/App.tsx` — `createExcalidrawAPI()`, `componentWillUnmount` destruction

**Do NOT confuse with**
React refs in general. The API object is explicitly constructed by `App` and its shape is a stable contract for host-app integration.

---

## Tunnel (Portal Slot)

**Definition**
A named render slot implemented with `tunnel-rat`. Allows host-app components (`<Excalidraw.MainMenu>`, `<Excalidraw.Footer>`, `<Excalidraw.Sidebar>`) to inject JSX into specific positions within the editor's DOM tree without prop-drilling. `context/tunnels.ts` creates tunnel instances for: `MainMenuTunnel`, `FooterCenterTunnel`, `DefaultSidebarTriggerTunnel`, `OverwriteConfirmDialogTunnel`, and others.

**Key files**
- `packages/excalidraw/context/tunnels.ts` — tunnel definitions
- `packages/excalidraw/components/LayerUI.tsx` — tunnel outlets
- `packages/excalidraw/index.tsx` — exported slot components

**Do NOT confuse with**
A network tunnel. In Excalidraw, a tunnel is a UI composition mechanism (similar to React portals) for slot-based component injection.
