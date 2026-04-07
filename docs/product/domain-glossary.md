# Excalidraw Domain Glossary

> **Related docs:** [Architecture](../technical/architecture.md) · [PRD](./PRD.md) · [System Patterns](../memory/systemPatterns.md) · [Decision Log](../memory/decisionLog.md)

Terms used throughout the Excalidraw codebase. Each entry lists the in-code name (as used in TypeScript), a project-specific definition, key files, and common confusions.

---

## Action

**Definition:** A named, self-contained command that can be triggered from the keyboard, a toolbar button, the context menu, or the API. An Action receives the current elements and `AppState`, performs its logic, and returns an `ActionResult`. Actions are registered with `ActionManager` and discovered by name or key test.

**Where used:**
- [packages/excalidraw/actions/types.ts](packages/excalidraw/actions/types.ts) — `Action` interface, `ActionName` union, `ActionResult` type
- [packages/excalidraw/actions/manager.ts](packages/excalidraw/actions/manager.ts) — `ActionManager` registration and dispatch
- [packages/excalidraw/actions/](packages/excalidraw/actions/) — individual action implementations (e.g. `actionCopyAsSvg`, `actionZoomIn`)

**Do NOT confuse with:** The generic word "action" (a user gesture or Redux action). In Excalidraw, an `Action` is a specific registered object with a `name`, optional `keyTest`, `trackEvent`, and `perform` function.

---

## ActionManager

**Definition:** The orchestrator that maps UI events and keyboard shortcuts to `Action` objects. It exposes `executeAction(action, source)` and `handleKeyDown(event)`. After an Action completes it calls `App.syncActionResult`, which is the single funnel for all state mutations.

**Where used:**
- [packages/excalidraw/actions/manager.ts](packages/excalidraw/actions/manager.ts)
- [packages/excalidraw/components/App.tsx](packages/excalidraw/components/App.tsx) — `this.actionManager`

**Do NOT confuse with:** Redux middleware or event buses. `ActionManager` is not a pub/sub system; it is a synchronous lookup table of registered `Action` objects.

---

## ActionResult

**Definition:** The return value of an `Action.perform` call. It is a plain object `{ elements?, appState?, files?, captureUpdate }` or `false` (to abort). `App.syncActionResult` reads it to update `Scene`, call `setState`, and tell `Store` how to record the change.

**Where used:**
- [packages/excalidraw/actions/types.ts](packages/excalidraw/actions/types.ts)
- [packages/excalidraw/components/App.tsx](packages/excalidraw/components/App.tsx) — `syncActionResult` at line ~2735

**Do NOT confuse with:** A network response or a Promise result. `ActionResult` is always synchronous state data, though the `perform` function itself may be `async`.

---

## AppState

**Definition:** The ~200-property React class state of the `App` component. It covers everything that is not an element: viewport (`scrollX`, `scrollY`, `zoom`), active tool, selection maps, open dialogs, collaboration metadata, export settings, theme, and transient UI flags.

**Where used:**
- [packages/excalidraw/types.ts](packages/excalidraw/types.ts) — `AppState` interface at line 272
- [packages/excalidraw/appState.ts](packages/excalidraw/appState.ts) — `getDefaultAppState()` and `APP_STATE_STORAGE_CONF`
- [packages/excalidraw/components/App.tsx](packages/excalidraw/components/App.tsx) — `this.state`

**Do NOT confuse with:** The application state in a Redux/Zustand sense (Excalidraw does not use a global store for elements). `AppState` is React component state; elements live in `Scene`.

---

## BinaryFiles

**Definition:** A `Record<elementId, BinaryFileData>` map holding images and other binary assets that are referenced by `ExcalidrawImageElement.fileId`. Binary files are stored separately from the scene JSON — in Firebase Storage when collaborating, or in `localStorage` / `IndexedDB` locally. They are never embedded in the scene JSON itself.

**Where used:**
- [packages/excalidraw/types.ts](packages/excalidraw/types.ts) — `BinaryFiles`, `BinaryFileData`, `FileId`
- [excalidraw-app/data/FileManager.ts](excalidraw-app/data/FileManager.ts) — upload/download lifecycle
- [excalidraw-app/data/firebase.ts](excalidraw-app/data/firebase.ts) — `saveFilesToFirebase`, `loadFilesFromFirebase`

**Do NOT confuse with:** Scene JSON (which is text and does not contain raw image bytes). `BinaryFiles` is the out-of-band blob store referenced by IDs that appear inside `ExcalidrawImageElement`.

---

## Binding / BoundElement

**Definition:** The attachment of a linear element (arrow) or a text label to a "bindable" shape. A `FixedPointBinding` records the target element id and a normalized (0–1) fixed point on its surface. `BoundElement` is the reverse reference stored on the shape listing which arrows/texts are attached to it. Binding keeps arrows connected when shapes are moved.

**Where used:**
- [packages/element/src/types.ts](packages/element/src/types.ts) — `FixedPointBinding`, `BoundElement`, `ExcalidrawBindableElement`, `BindMode`
- [packages/element/src/binding.ts](packages/element/src/binding.ts) — bind/unbind logic
- [packages/excalidraw/types.ts](packages/excalidraw/types.ts) — `AppState.isBindingEnabled`, `suggestedBinding`

**Do NOT confuse with:** CSS data binding or React state binding. In Excalidraw, "binding" means a spatial attachment between two canvas elements.

---

## Collaboration (Collab)

**Definition:** The real-time multiplayer feature of the deployed `excalidraw-app`. Scene updates are AES-GCM encrypted (key in URL `#hash`, never sent to server) and broadcast over a Socket.io room. Firebase Firestore stores the latest scene snapshot; Firebase Storage holds `BinaryFiles`. The `Collab` class owns the full lifecycle: encryption, reconciliation, cursor broadcasting, and user-to-follow.

**Where used:**
- [excalidraw-app/collab/Collab.tsx](excalidraw-app/collab/Collab.tsx) — main orchestrator
- [excalidraw-app/collab/Portal.tsx](excalidraw-app/collab/Portal.tsx) — Socket.io room wrapper
- [excalidraw-app/data/firebase.ts](excalidraw-app/data/firebase.ts) — Firestore persistence

**Do NOT confuse with:** The `Collaborator` type in `AppState` (which is just the per-user cursor/pointer record displayed in the canvas). `Collab` is the full system; `Collaborator` is one user's visible presence.

---

## CaptureUpdateAction

**Definition:** An enum that controls whether a state mutation is recorded in `History`. Values: `NEVER` (remote/init updates — skip history), `IMMEDIATELY` (record right now), `EVENTUALLY` (batch until the next `store.commit()` cycle). Every `ActionResult` must set this field; it is read by `Store.scheduleAction`.

**Where used:**
- [packages/element/src/store.ts](packages/element/src/store.ts) — enum definition and `scheduleAction`
- [packages/excalidraw/actions/types.ts](packages/excalidraw/actions/types.ts) — `CaptureUpdateActionType` import

**Do NOT confuse with:** Redux action types or event names. `CaptureUpdateAction` is only about whether the resulting diff ends up on the undo stack — it has nothing to do with network or bus dispatch.

---

## ExcalidrawElement

**Definition:** The base frozen plain object that represents a single drawable item on the canvas. Every element has `id`, `type`, position (`x`/`y`), dimensions, style properties, `version`, `versionNonce`, `isDeleted`, `groupIds`, and `frameId`. Specializations include `ExcalidrawRectangleElement`, `ExcalidrawArrowElement`, `ExcalidrawTextElement`, etc. Elements are immutable after creation; all mutations go through `mutateElement()`.

**Where used:**
- [packages/element/src/types.ts](packages/element/src/types.ts) — `_ExcalidrawElementBase` and all subtypes
- [packages/element/src/Scene.ts](packages/element/src/Scene.ts) — stored in `Map<id, ExcalidrawElement>`
- [packages/excalidraw/components/App.tsx](packages/excalidraw/components/App.tsx) — passed everywhere as `elements`

**Do NOT confuse with:** A DOM element or a React element. `ExcalidrawElement` is a serializable JSON-compatible data record; it has no methods and no DOM reference.

---

## Frame

**Definition:** A named rectangular container element (`type: "frame"`) that visually groups and clips the elements placed inside it. Frames render a label at the top and an outline. Elements can belong to at most one frame (`frameId` property). Frames are exported as a unit and can be individually navigated via the Frames panel.

**Where used:**
- [packages/element/src/types.ts](packages/element/src/types.ts) — `ExcalidrawFrameElement`
- [packages/element/src/frame.ts](packages/element/src/frame.ts) — frame membership and culling helpers
- [packages/excalidraw/types.ts](packages/excalidraw/types.ts) — `AppState.frameRendering`, `editingFrame`

**Do NOT confuse with:** A browser `<iframe>`, an animation frame (`requestAnimationFrame`), or `ExcalidrawIframeElement`. `Frame` is a canvas grouping construct; `IframeElement` is an embeddable web content tile.

---

## FractionalIndex

**Definition:** A branded string (format defined by the `fractional-indexing` spec) that encodes the z-order of an element within the scene. Fractional indices allow inserting elements between existing ones without renumbering the entire array, which is important for CRDT-safe ordering during reconciliation and undo/redo.

**Where used:**
- [packages/element/src/types.ts](packages/element/src/types.ts) — `FractionalIndex` type on `_ExcalidrawElementBase.index`
- [packages/element/src/fractionalIndex.ts](packages/element/src/fractionalIndex.ts) — `syncMovedIndices`, `syncInvalidIndices`

**Do NOT confuse with:** Array indices or DOM z-index. `FractionalIndex` is a string like `"a0"` or `"Zz"` that sorts lexicographically to produce a stable order compatible with distributed edits.

---

## History

**Definition:** The undo/redo system. It maintains two stacks (`undoStack`, `redoStack`) of `HistoryDelta` objects. `History.record(delta)` inverts the delta and pushes it onto `undoStack`. `undo()` pops the stack, applies the inverse diff to elements and `AppState`, and moves the forward delta to `redoStack`.

**Where used:**
- [packages/excalidraw/history.ts](packages/excalidraw/history.ts)
- [packages/element/src/store.ts](packages/element/src/store.ts) — `Store` emits `onDurableIncrementEmitter` → `History.record`

**Do NOT confuse with:** Browser history (`window.history`) or git history. Excalidraw `History` tracks canvas mutations only and is reset on `loadScene` / `clearCanvas`.

---

## Library / LibraryItem

**Definition:** A `Library` is a user-maintained collection of reusable element groups that can be dragged onto the canvas. A `LibraryItem` is one entry: an `id`, `status` (published/unpublished), `elements: ExcalidrawElement[]`, and optional `name`/`created` metadata. Libraries are persisted as `.excalidrawlib` JSON files and can be installed from URLs (restricted to trusted hosts).

**Where used:**
- [packages/excalidraw/data/library.ts](packages/excalidraw/data/library.ts) — `Library` class, persistence adapters
- [packages/excalidraw/types.ts](packages/excalidraw/types.ts) — `LibraryItem`, `LibraryItems`, `LibraryItemsSource`
- [packages/excalidraw/components/LibraryMenu.tsx](packages/excalidraw/components/LibraryMenu.tsx) — UI panel

**Do NOT confuse with:** npm packages, shared libraries in a programming sense, or the browser's Web Storage. `Library` is an Excalidraw-specific concept for stencil/symbol collections displayed in the sidebar.

---

## MagicFrame

**Definition:** A specialized `Frame` (`type: "magicframe"`) that acts as an AI code-generation target. When the user invokes "Magic" on a `MagicFrame`, the AI backend receives the enclosed elements as an image and returns an HTML snippet, which is then rendered in an `ExcalidrawIframeElement` placed next to the frame.

**Where used:**
- [packages/element/src/types.ts](packages/element/src/types.ts) — `ExcalidrawMagicFrameElement`
- [excalidraw-app/components/AI.tsx](excalidraw-app/components/AI.tsx) — AI request and result handling
- [packages/excalidraw/types.ts](packages/excalidraw/types.ts) — `ToolType = "magicframe"`

**Do NOT confuse with:** A regular `Frame` (which only clips elements visually) or `ExcalidrawIframeElement` (which displays the HTML output). `MagicFrame` is the input; `IframeElement` is the output.

---

## Portal

**Definition:** The Socket.io room abstraction used by `Collab`. `Portal` wraps the socket instance, manages `open`/`close` lifecycle, and exposes `broadcastScene`, `broadcastMouseLocation`, and `broadcastIdleChange`. It receives inbound messages and forwards them to `Collab` for decryption and reconciliation.

**Where used:**
- [excalidraw-app/collab/Portal.tsx](excalidraw-app/collab/Portal.tsx)
- [excalidraw-app/collab/Collab.tsx](excalidraw-app/collab/Collab.tsx) — `this.portal`

**Do NOT confuse with:** React Portal (`ReactDOM.createPortal`), which renders a subtree outside the parent DOM node. `Portal` here is a WebSocket room connection object.

---

## Renderer

**Definition:** The class responsible for computing which elements are visible in the current viewport (`getRenderableElements`) and passing them to the canvas paint functions. It memoizes the result on `sceneNonce` + viewport parameters so element culling does not re-run on unrelated `setState` calls.

**Where used:**
- [packages/excalidraw/scene/Renderer.ts](packages/excalidraw/scene/Renderer.ts)
- [packages/excalidraw/components/App.tsx](packages/excalidraw/components/App.tsx) — `this.renderer`
- [packages/excalidraw/renderer/staticScene.ts](packages/excalidraw/renderer/staticScene.ts), [interactiveScene.ts](packages/excalidraw/renderer/interactiveScene.ts) — downstream paint functions

**Do NOT confuse with:** A React renderer (`react-dom`) or Three.js renderer. `Renderer` in Excalidraw is a viewport-culling helper, not a full rendering engine; the actual canvas painting is done by `renderElement` in `@excalidraw/element`.

---

## Scene

**Definition:** The single source of truth for all canvas elements. Internally it holds a `Map<id, ExcalidrawElement>` (including soft-deleted elements with `isDeleted: true`). It exposes query methods (`getNonDeletedElements`, `getElementsMapIncludingDeleted`) and mutation methods (`replaceAllElements`, `mutateElement`). Any mutation increments `sceneNonce`, triggering re-render via registered callbacks.

**Where used:**
- [packages/element/src/Scene.ts](packages/element/src/Scene.ts)
- [packages/excalidraw/components/App.tsx](packages/excalidraw/components/App.tsx) — `this.scene`

**Do NOT confuse with:** A theatrical scene or a Three.js scene graph. In Excalidraw, `Scene` is purely a keyed element container with update notifications — there is no tree hierarchy or transform inheritance.

---

## Store

**Definition:** Maintains a frozen snapshot of `{elements: Map, appState}` and computes structural diffs (`StoreDelta`) between successive snapshots on each `commit()` call. Emits `onDurableIncrementEmitter` (consumed by `History`) and `onStoreIncrementEmitter` (exposed as `props.onIncrement` to host apps). `scheduleAction(CaptureUpdateAction)` queues the recording mode before the next commit.

**Where used:**
- [packages/element/src/store.ts](packages/element/src/store.ts)
- [packages/excalidraw/components/App.tsx](packages/excalidraw/components/App.tsx) — `this.store`, called every `componentDidUpdate`

**Do NOT confuse with:** A Redux store or Jotai store. `Store` in Excalidraw is specifically the diffing and history-feed component; it does not hold live mutable state (that is `Scene` + `AppState`).

---

## StoreDelta

**Definition:** A composable diff object that encodes what changed between two Store snapshots: added/removed/mutated element entries and changed `AppState` keys. Applying a `StoreDelta` (or its inverse) to an existing snapshot reconstructs the before or after state without replacing everything — this is what makes undo/redo efficient.

**Where used:**
- [packages/element/src/store.ts](packages/element/src/store.ts) — computed in `commit()`
- [packages/excalidraw/history.ts](packages/excalidraw/history.ts) — stored as `HistoryDelta`, applied in `undo`/`redo`

**Do NOT confuse with:** A network patch or a JSON Patch (RFC 6902). `StoreDelta` is an internal in-memory structure; it is not serialized over the wire. The wire format for collaboration is the full encrypted element array, reconciled via `reconcileElements`.

---

## Tool / ActiveTool

**Definition:** The currently selected drawing or interaction mode. `ToolType` is a string union (`"selection"`, `"rectangle"`, `"arrow"`, `"text"`, `"eraser"`, `"hand"`, `"laser"`, etc.). `ActiveTool` is the runtime object stored in `AppState.activeTool`; it adds `locked` (tool stays active after placing an element) and `lastActiveTool` (for transient tool switches from selection mode).

**Where used:**
- [packages/excalidraw/types.ts](packages/excalidraw/types.ts) — `ToolType`, `ActiveTool`
- [packages/excalidraw/components/App.tsx](packages/excalidraw/components/App.tsx) — `setActiveTool`, pointer-down dispatch
- [packages/excalidraw/components/ToolBar.tsx](packages/excalidraw/components/ToolBar.tsx) — toolbar buttons

**Do NOT confuse with:** An HTML `<tool>` element (none exists) or a general software tool. In Excalidraw, `Tool` refers specifically to the canvas interaction mode that determines what happens when the user clicks or drags on the canvas.
