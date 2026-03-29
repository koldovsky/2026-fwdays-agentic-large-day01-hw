# Domain glossary

Project-specific meanings for names that appear in the Excalidraw monorepo (`excalidraw-app`, `@excalidraw/excalidraw`, `@excalidraw/element`, and related packages). Each main entry is titled with the **code identifier** (TypeScript type, class, or field name) where one exists.

For each term, aim for:

1. **Code identifier** — English name exactly as in source (heading + inline backticks).
2. **Project definition** — what it means in this codebase, not a dictionary gloss.
3. **Where it lives** — **Key files** with representative paths.
4. **Disambiguation** — **Not to be confused with** general English or other nearby identifiers.

Informal words (e.g. “element” on the canvas) are called out explicitly when there is no matching export.

---

## `Action`

- **Definition:** A registered command object (keyboard shortcut, menu item, or API hook) that the `ActionManager` can `perform`. It receives the current ordered elements, `AppState`, optional form data, and the `App` instance, and returns an `ActionResult` (or `false` to block the action).
- **Key files:** `packages/excalidraw/actions/types.ts` (`Action`, `ActionResult`, `ActionName`), `packages/excalidraw/actions/manager.tsx` (`ActionManager`), `packages/excalidraw/components/App.tsx` (registration and `syncActionResult`).
- **Not to be confused with:** Redux/Flux “actions” as plain event objects—here an `Action` is a full command with `perform`, predicates, and UI metadata. Also not the same as `CaptureUpdateAction` (undo scheduling), though every `ActionResult` carries a `captureUpdate` field of that type.

---

## `ActionManager`

- **Definition:** Central registry and executor for editor `Action`s. Resolves shortcuts, runs `perform`, normalizes async results, and forwards `ActionResult` objects to the app’s updater (`syncActionResult` on `App`).
- **Key files:** `packages/excalidraw/actions/manager.tsx`, `packages/excalidraw/components/App.tsx` (construction and `updater` wiring).
- **Not to be confused with:** A global event bus; it is specifically the action/command layer for the editor, tightly coupled to `App` and `ActionResult`.

---

## `ActionResult`

- **Definition:** The structured outcome of running an `Action`: optional new `elements`, `appState`, `files`, `replaceFiles`, plus a required `captureUpdate` (`CaptureUpdateActionType`) telling the `Store` how to treat the change for undo/history.
- **Key files:** `packages/excalidraw/actions/types.ts`, `packages/excalidraw/components/App.tsx` (`syncActionResult`).
- **Not to be confused with:** A generic RPC result or HTTP response shape; it is the contract between actions and `App`/`Store`/`Scene` updates.

---

## `App`

- **Definition:** The main class component that hosts the editor: owns React `AppState`, a `Scene`, `Store`, `History`, `ActionManager`, `Renderer`, canvases, and file maps. Implements `updateScene`, pointer handling, and rendering orchestration.
- **Key files:** `packages/excalidraw/components/App.tsx`.
- **Not to be confused with:** `excalidraw-app` (the hosted web application workspace) or a generic “application” concept—the class name `App` is the editor core inside the package.

---

## `AppState`

- **Definition:** The large React state object on `App` for UI and session concerns: active tool, selection, viewport (zoom, scroll), theme, open dialogs, collaboration-related fields, export options, ephemeral editor state (e.g. element in progress), and layout offsets. It is merged via `setState`, not stored inside `Scene`.
- **Key files:** `packages/excalidraw/types.ts` (`AppState`, related types), `packages/excalidraw/appState.ts` (`getDefaultAppState`), `packages/excalidraw/components/App.tsx`.
- **Not to be confused with:** The drawable document model. Canvas shapes live as `ExcalidrawElement`s in `Scene`, not in `AppState` (except references like selected IDs or pointers into editing state). Also distinct from `UIAppState`, which is a subset exposed to UI context (`packages/excalidraw/context/ui-appState.ts`).

---

## `BinaryFiles` / `BinaryFileData` / `FileId`

- **Definition:** In-memory map of image/binary payloads keyed by element id (`BinaryFiles`) with entries `BinaryFileData` (mime type, `FileId`, `dataURL`, timestamps). Referenced by image elements and merged during `syncActionResult` when `ActionResult.files` is set.
- **Key files:** `packages/excalidraw/types.ts`, `packages/excalidraw/components/App.tsx`, `packages/element/src/types.ts` (`FileId`).
- **Not to be confused with:** The browser `File` API or arbitrary user files on disk; `FileId` is a branded string id for blobs attached to the scene.

---

## `CaptureUpdateAction` / `CaptureUpdateActionType`

- **Definition:** Enum-like constants `IMMEDIATELY`, `NEVER`, and `EVENTUALLY` controlling whether an update is captured into undo/history immediately, excluded (e.g. remote sync), or deferred until a later commit. Used by `Store.scheduleAction` / `scheduleMicroAction` and echoed on `ActionResult.captureUpdate`.
- **Key files:** `packages/element/src/store.ts`, `packages/excalidraw/components/App.tsx` (`updateScene`, `syncActionResult` JSDoc).
- **Not to be confused with:** User-visible “Action” commands; this is purely history/undo policy for store increments.

---

## `Collaboration` (concept) / `Collab`

- **Code identifiers:** There is **no** exported type or symbol named `Collaboration`. The product behavior shows up as **`Collab`** (default-export class component in `Collab.tsx`), **`CollabAPI`**, atoms such as `isCollaboratingAtom` / `collabAPIAtom`, `AppState.collaborators` (map of `Collaborator`), and helpers like `reconcileElements`.
- **Definition:** **Collaboration** (concept): multiple users editing a shared drawing with synced elements and presence. **`Collab`** is the hosted-app collaboration stack: React UI/logic under `excalidraw-app/collab` (`Collab.tsx`, `Portal.tsx`) that uses `reconcileElements`, Firebase (`excalidraw-app/data/firebase`), sockets, and the imperative API—beyond what the embeddable package implements alone.
- **Key files:** `excalidraw-app/collab/Collab.tsx`, `excalidraw-app/collab/Portal.tsx`, `packages/excalidraw/data/reconcile.ts`, `packages/excalidraw/types.ts` (`Collaborator`, `SocketId`).
- **Not to be confused with:** The abstract idea of “real-time apps” in general, or CRDT libraries—this codebase uses versioned elements plus reconciliation rules. Also not the same as a single `Collaborator` object (see below), nor editor `Action`s / `CaptureUpdateAction` history policy.

---

## `Collaborator`

- **Definition:** A read-only description of another participant’s presence: pointer or laser position and tool, optional selection snapshot, username, colors, avatar, idle state, call/audio flags, and `socketId`. Stored in `AppState`-style maps keyed by id for rendering cursors and UI on the interactive canvas.
- **Key files:** `packages/excalidraw/types.ts` (`Collaborator`, `CollaboratorPointer`), `packages/excalidraw/renderer/interactiveScene.ts` (overlays), `excalidraw-app/collab/Collab.tsx` (updates).
- **Not to be confused with:** A database user record or account; it is ephemeral session/presence data for the editor.

---

## `Element` (informal) / canvas element

- **Code identifier:** There is **no** canvas type named `Element`; the drawable record type is **`ExcalidrawElement`** (and ordered/non-deleted variants). Comments and prose may say “element” loosely.
- **Definition:** Informal shorthand in code and docs for an item on the canvas—almost always meaning an `ExcalidrawElement` instance (rectangle, arrow, text, frame, etc.), including deleted ones when the phrase “including deleted” is used.
- **Key files:** Pervasive; model definitions in `packages/element/src/types.ts`, storage in `packages/element/src/Scene.ts`.
- **Not to be confused with:** A DOM `Element`, a React element (`ReactElement`), or SVG/XML “elements.” In this project, prefer `ExcalidrawElement` in types and API surfaces.

---

## `Excalidraw`

- **Definition:** The public React wrapper component exported from `@excalidraw/excalidraw` that mounts `App`, providers (e.g. Jotai), and wires props/callbacks to the imperative API. This is what host apps embed.
- **Key files:** `packages/excalidraw/index.tsx`, `packages/excalidraw/types.ts` (`ExcalidrawProps`).
- **Not to be confused with:** The `App` class (internal implementation) or the `excalidraw-app` product shell.

---

## `ExcalidrawElement`

- **Definition:** The discriminated union type of all drawable records: shapes, lines, arrows, text, images, frames, embeddables, etc. Intended to be JSON-serializable and peer-shareable without peer-local computed fields. Carries geometry, style, versioning (`version`, `versionNonce`), z-order (`index` as fractional index when ordered), and `isDeleted` for soft delete.
- **Key files:** `packages/element/src/types.ts`, `packages/element/src/Scene.ts`, serialization in `packages/excalidraw/data/*`.
- **Not to be confused with:** `OrderedExcalidrawElement` (element plus required fractional `index`), or `NonDeletedExcalidrawElement` (`isDeleted: false`). Also not a runtime class instance—elements are plain data objects.

---

## `ExcalidrawImperativeAPI`

- **Definition:** The stable object returned to embedders (`onExcalidrawAPI` / ref) exposing methods such as `updateScene`, `getSceneElements`, `getAppState`, `updateLibrary`, `addFiles`, `onChange`, `onIncrement`, tool/cursor helpers, and `registerAction`. It is the host-facing surface of `App` + `Library`.
- **Key files:** `packages/excalidraw/types.ts` (`ExcalidrawImperativeAPI`), `packages/excalidraw/components/App.tsx` (API construction).
- **Not to be confused with:** Internal `App` class properties or private helpers; the imperative API is the supported integration contract.

---

## `FixedPointBinding` / binding (arrow)

- **Definition:** Data on linear elements (`startBinding` / `endBinding`) tying an arrow endpoint to a **bindable** shape using normalized ratios `fixedPoint` and a `BindMode` (`inside` | `orbit` | `skip`). Keeps arrows attached when shapes move.
- **Key files:** `packages/element/src/types.ts` (`FixedPointBinding`, `ExcalidrawBindableElement`, `ExcalidrawLinearElement`), binding logic under `packages/element/src/*`.
- **Not to be confused with:** Key binding (shortcuts), financial “binding,” or React prop binding. “Arrow binding” in `ActionName` refers to this geometry feature.

---

## `History` / `HistoryDelta`

- **Definition:** **`History`** maintains undo/redo stacks of `HistoryDelta` objects derived from durable `Store` increments. **`HistoryDelta`** extends `StoreDelta` with apply semantics suited to undo/redo (e.g. excluding certain version fields when applying). `Store.onDurableIncrementEmitter` feeds `history.record`.
- **Key files:** `packages/excalidraw/history.ts`, `packages/element/src/store.ts`, `packages/excalidraw/components/App.tsx`.
- **Not to be confused with:** Browser `history` or generic event logs; this is the editor’s structural undo system tied to `Store` snapshots.

---

## `Library` (class) / `LibraryItem` / `LibraryItems`

- **Code identifiers:** **`Library`** is a **default export** from `library.ts` (not a named `export class Library` at declaration site). **`LibraryItem`** and **`LibraryItems`** are exported types in `packages/excalidraw/types.ts`.
- **Definition:** **`Library`** (`packages/excalidraw/data/library.ts`): app-scoped service class managing the user’s shape **library** (import, merge, persistence queue, `libraryItemsAtom`). **`LibraryItem`**: one saved template with `id`, `status` (`published` | `unpublished`), `elements` (non-deleted `ExcalidrawElement`s), timestamps, optional `name`. **`LibraryItems`**: readonly list of items. Distinct from npm/JS “library” or React `library` packages.
- **Key files:** `packages/excalidraw/data/library.ts`, `packages/excalidraw/types.ts` (`LibraryItem`, `LibraryItems`), UI `packages/excalidraw/components/LibraryMenu*.tsx`, `ExcalidrawImperativeAPI.updateLibrary`.
- **Not to be confused with:** The scene’s elements, clip art hosting services in general, or programming-language standard libraries. Also not the same as `loadLibraryFromBlob`’s file format alone—the `Library` class owns lifecycle and atom state.

---

## `newElement` (`AppState`)

- **Definition:** Transient state on `App` holding the element currently being created or modified by the active drawing gesture (before finalization). When set, rendering may use `NewElementCanvas` and the renderer excludes that id from the static map via `newElementId` to avoid double-drawing.
- **Key files:** `packages/excalidraw/components/App.tsx`, `packages/excalidraw/components/canvases/NewElementCanvas.tsx`, `packages/excalidraw/scene/Renderer.ts`.
- **Not to be confused with:** The `newElement` / `newElementWith` **functions** from `@excalidraw/element` that construct or clone element objects—same word, different layer (factory vs. React state field).

---

## `OrderedExcalidrawElement`

- **Definition:** An `ExcalidrawElement` augmented with a required fractional `index` string used for stable ordering and reconciliation. Scene maps are typed as `Ordered` elements; `replaceAllElements` normalizes indices.
- **Key files:** `packages/element/src/types.ts`, `packages/element/src/Scene.ts`.
- **Not to be confused with:** Visual “order” in the UI only, or array position without fractional indices—z-order is encoded in the `index` field.

---

## `reconcileElements`

- **Definition:** Merges local ordered elements with remote ordered elements for collaboration: walks remote updates, optionally keeps local copies when the user is actively editing or local version wins per `version` / `versionNonce` rules (`shouldDiscardRemoteElement`). Produces `ReconciledExcalidrawElement[]`.
- **Key files:** `packages/excalidraw/data/reconcile.ts`, `excalidraw-app/collab/Collab.tsx`.
- **Not to be confused with:** Generic JSON merge or React reconciliation; this is domain-specific conflict handling for `ExcalidrawElement` versions.

---

## `Renderer`

- **Definition:** Memoized helper owned by `App` that, given current scene data and `AppState` slices, computes `visibleElements` and a `RenderableElementsMap` for canvas drawing, using viewport culling (`isElementInViewport`). Uses `sceneNonce` as part of the cache key when the `Scene` signals updates.
- **Key files:** `packages/excalidraw/scene/Renderer.ts`, `packages/excalidraw/components/App.tsx`.
- **Not to be confused with:** `renderStaticScene` / `renderInteractiveScene` functions (lower-level drawing) or React’s renderer; this class is visibility + map preparation.

---

## `Scene`

- **Definition:** Class that owns the authoritative ordered list and maps of `ExcalidrawElement`s (`elements`, `elementsMap`, non-deleted projections, frame caches). Mutations notify subscribers via `triggerUpdate` and bump `sceneNonce` for render invalidation. `App` delegates element access and `replaceAllElements` to a `Scene` instance.
- **Key files:** `packages/element/src/Scene.ts`, `packages/excalidraw/components/App.tsx`.
- **Not to be confused with:** A saved file or “scene graph” in game engines. Here it is the in-memory element container for one editor instance. Also not `AppState` (viewport/tools live separately).

---

## `sceneNonce`

- **Definition:** Integer regenerated on each `Scene` update; used as a cache-busting key for `Renderer` memoization. Explicitly documented as unrelated to per-element `version` fields.
- **Key files:** `packages/element/src/Scene.ts`, `packages/excalidraw/scene/Renderer.ts`, `packages/excalidraw/components/App.tsx`.
- **Not to be confused with:** Cryptographic nonces or element `versionNonce`; it only drives coarsely invalidating derived render caches.

---

## `StaticCanvas` / `InteractiveCanvas` / `NewElementCanvas`

- **Definition:** React wrappers that own or receive `HTMLCanvasElement` nodes and invoke drawing routines in effects. **StaticCanvas** paints the document (via `renderStaticScene`). **InteractiveCanvas** paints overlays—selection handles, scrollbars, collaboration pointers, etc. (`renderInteractiveScene`). **NewElementCanvas** draws the in-progress `newElement` when present.
- **Key files:** `packages/excalidraw/components/canvases/StaticCanvas.tsx`, `InteractiveCanvas.tsx`, `NewElementCanvas.tsx`, `packages/excalidraw/renderer/staticScene.ts`, `interactiveScene.ts`.
- **Not to be confused with:** A “scene” in the data model (`Scene` class)—these are view layers. Also not every visual: some UI (e.g. frame names, embeds) is DOM/SVG above the canvases.

---

## `Store` (`@excalidraw/element`)

- **Definition:** Change-tracking layer constructed with the `App` instance: schedules capture modes, computes snapshot diffs on `commit`, emits `DurableIncrement` / `EphemeralIncrement` events, and connects to `History` for undo. Bridges React render commits and logical undo boundaries.
- **Key files:** `packages/element/src/store.ts`, `packages/excalidraw/components/App.tsx` (`componentDidUpdate` → `store.commit`).
- **Not to be confused with:** Redux/Jotai stores (though Jotai is used elsewhere for editor atoms), or browser storage. This `Store` is undo/history-oriented element+state differencing.

---

## `Tool` (concept) / `activeTool` / `ToolType` / `ActiveTool`

- **Code identifiers:** Runtime state is **`AppState.activeTool`**, typed as **`ActiveTool`**. Built-in mode names are the string union **`ToolType`**. There is no separate exported type or class named `Tool`; see also **`ElementOrToolType`** (`ExcalidrawElementType | ToolType | "custom"`) when code mixes shape kinds and tool names.
- **Definition:** **Tool** (informal): the editor interaction mode (what the user is doing: selecting, drawing a shape, panning, etc.). **`ToolType`** lists built-in modes: `selection`, `lasso`, `rectangle`, `diamond`, `ellipse`, `arrow`, `line`, `freedraw`, `text`, `image`, `eraser`, `hand`, `frame`, `magicframe`, `embeddable`, `laser`. **`ActiveTool`** is either `{ type: ToolType; customType: null }` or `{ type: "custom"; customType: string }` for plugin/custom tools.
- **Key files:** `packages/excalidraw/types.ts` (`ToolType`, `ActiveTool`, `ElementOrToolType`, `AppState.activeTool`), `packages/excalidraw/components/App.tsx`, `packages/excalidraw/actions/*`, pointer/toolbar code.
- **Not to be confused with:** An `ExcalidrawElement`’s `type` (e.g. `"rectangle"`)—**tool** mode drives input handling; **element** `type` is persisted geometry/category. Also not the same as editor **`Action`** commands (menus/shortcuts/API hooks). Custom tools use `ActiveTool.type === "custom"`.

---

## `restore` / `restoreElements`

- **Code identifiers:** Main exports include **`restoreElements`**, **`restoreElement`**, **`restoreAppState`**, **`restoreLibraryItems`**, and helpers used from blob/load paths—all from **`packages/excalidraw/data/restore.ts`** unless re-exported elsewhere.
- **Definition:** Pipeline that takes imported or stored JSON and returns valid in-memory elements (and related data) with defaults applied, schema fixes, and versioning adjusted—used when loading files or parsing pasted data. Works with `ImportedDataState` and library restore helpers.
- **Key files:** `packages/excalidraw/data/restore.ts`, `packages/excalidraw/data/blob.ts` (call sites), tests in `packages/excalidraw/tests/data/restore.test.ts`.
- **Not to be confused with:** `reconcileElements` (merging local vs remote during sync). Restore is ingestion/normalization; reconcile is live collaboration merge.

---

## Related types (quick pointers)

Abbreviated rows—no substitute for a full entry when the term is central to your work.

| Name | Role | Key location | Do not confuse with |
|------|------|----------------|---------------------|
| `ElementsMap` / `SceneElementsMap` | Id-keyed maps of elements; `SceneElementsMap` is the full ordered scene map brand | `packages/element/src/types.ts` | Plain `Record<id, ExcalidrawElement>` without scene invariants |
| `ExcalidrawFrameLikeElement` | Frame or magic-frame shapes used for grouping/clipping | `packages/element/src/types.ts` | Generic UI “frames” or HTML `<iframe>` embeds only |
| `RemoteExcalidrawElement` / `ReconciledExcalidrawElement` | Branded ordered elements in collaboration merge | `packages/excalidraw/data/reconcile.ts` | Local-only `OrderedExcalidrawElement` before merge |
| `SocketId` | Branded string id for a collaboration socket/session participant | `packages/excalidraw/types.ts` | `Collaborator` object or database primary keys |

---

*Glossary aligned with sources under this repository as of the documented architecture in `docs/technical/architecture.md`.*
