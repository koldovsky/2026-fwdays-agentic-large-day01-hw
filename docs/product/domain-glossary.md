# Domain glossary (implementation-based)

Terms are defined as they appear in **this** codebase. Capitalization matches exported symbols.

---

## Core domain terms

## `ExcalidrawElement`

- **Definition**
  - Discriminated union of all drawable / model shapes on the canvas (rectangle, text, arrow, image, frame, embeddable, etc.). Each instance carries geometry, style, versioning fields (`version`, `versionNonce`), ordering (`index` as fractional index string or `null`), grouping (`groupIds`), optional `frameId`, `boundElements`, `isDeleted`, and other type-specific fields. Intended to be **JSON-serializable** peer-shareable data without peer-local state (see comment on the type).
- **Where it is used**
  - `packages/element/src/types.ts`
  - `packages/excalidraw/components/App.tsx` (scene + actions)
  - `packages/excalidraw/data/types.ts` (`ImportedDataState`, `ExportedDataState`)
- **Do not confuse with**
  - **DOM Element** — here “element” is always the whiteboard model object, not HTML.
  - **`ToolType`** — tools are editor modes; elements are persisted scene objects.
- **Evidence**
  - `packages/element/src/types.ts`: `export type ExcalidrawElement = | ExcalidrawGenericElement | ...` (~206–216) and preceding comment (~201–205)
  - `packages/element/src/types.ts`: `_ExcalidrawElementBase` fields (~40–81)

## `OrderedExcalidrawElement` / `Ordered`

- **Definition**
  - `ExcalidrawElement` constrained so `index` is a non-null **`FractionalIndex`** (branded string for stable ordering). Scene arrays use ordered elements for z-order and reconciliation with `syncMovedIndices` / `syncInvalidIndices` (referenced on `index` in `_ExcalidrawElementBase`).
- **Where it is used**
  - `packages/element/src/types.ts`
  - `packages/element/src/Scene.ts` (`elements` storage)
  - `packages/excalidraw/actions/types.ts` (`ActionFn` takes `OrderedExcalidrawElement[]`)
- **Do not confuse with**
  - **Array order alone** — `index` is the canonical ordering key for multiplayer/reconcile; array position is kept in sync but `Ordered` enforces typed index presence.
- **Evidence**
  - `packages/element/src/types.ts`: `export type Ordered<TElement extends ExcalidrawElement> = TElement & { index: FractionalIndex }` (~223–225)
  - `packages/element/src/types.ts`: `export type OrderedExcalidrawElement = Ordered<ExcalidrawElement>` (~227)

## `Scene`

- **Definition**
  - Class holding the **authoritative ordered list** of scene elements (including deleted), maps for lookup, derived non-deleted views, frame lists, selection caches, and a **`sceneNonce`** used as a render cache-invalidation nonce (not the same as per-element `version`). Mutations go through `replaceAllElements`, selection queries, etc.
- **Where it is used**
  - `packages/element/src/Scene.ts`
  - `packages/excalidraw/components/App.tsx` (`this.scene = new Scene()`)
- **Do not confuse with**
  - **React “scene”** — not a React term; it is the element graph owned by the editor.
  - **`AppState`** — viewport, tool, and UI flags live in React `AppState`, not in `Scene`.
- **Evidence**
  - `packages/element/src/Scene.ts`: `export class Scene` (~108), `private elements: readonly OrderedExcalidrawElement[]` (~121), `sceneNonce` comment (~135–141)
  - `packages/excalidraw/components/App.tsx`: `this.scene = new Scene()` (~825–826)

## `FileId`

- **Definition**
  - Branded **`string`** identifying a **binary asset** (e.g. image bytes) referenced from elements such as `ExcalidrawImageElement.fileId`, distinct from element `id`.
- **Where it is used**
  - `packages/element/src/types.ts`
  - `packages/excalidraw/types.ts` (`BinaryFileData.id`)
  - `excalidraw-app/data/FileManager.ts`, `excalidraw-app/data/firebase.ts` (file load/save by id)
- **Do not confuse with**
  - **Element `id`** — both are strings; `FileId` is branded and tied to `BinaryFileData`, not shape geometry.
- **Evidence**
  - `packages/element/src/types.ts`: `export type FileId = string & { _brand: "FileId" }` (~395)
  - `packages/excalidraw/types.ts`: `BinaryFileData` uses `id: FileId` (~113–118)

## `BinaryFileData` / `BinaryFiles`

- **Definition**
  - **`BinaryFileData`**: metadata + `dataURL` for one file (mime, `id` as `FileId`, timestamps, optional `lastRetrieved` / `version`). **`BinaryFiles`**: `Record` map from an id type to `BinaryFileData` (declared as `Record<ExcalidrawElement["id"], BinaryFileData>` in `types.ts` — keys are file records for embedded images in the editor model).
- **Where it is used**
  - `packages/excalidraw/types.ts`
  - `packages/excalidraw/actions/types.ts` (`ActionResult.files`)
  - `packages/excalidraw/data/types.ts` (`ImportedDataState.files`)
  - `excalidraw-app/data/LocalData.ts`, `excalidraw-app/App.tsx` (`onChange` passes files)
- **Do not confuse with**
  - **Filesystem `File`** — this is in-memory / persisted blob payload for the canvas, not OS file handles (though `AppState` may hold `fileHandle` for FS access separately).
- **Evidence**
  - `packages/excalidraw/types.ts`: `export type BinaryFileData = { ... }`, `export type BinaryFiles = Record<ExcalidrawElement["id"], BinaryFileData>` (~113–141)

---

## State terms

## `AppState`

- **Definition**
  - Large **React state** object on class `App`: UI tool (`activeTool`), selection (`selectedElementIds`, `selectionElement`, …), viewport (`scrollX`, `scrollY`, `zoom`), export settings, dialog flags, **`collaborators`** map, transient drag/edit state (`newElement`, `multiElement`, `editingTextElement`, …), and more. Default factory: `getDefaultAppState()` in `packages/excalidraw/appState.ts`.
- **Where it is used**
  - `packages/excalidraw/types.ts` (`export interface AppState`)
  - `packages/excalidraw/appState.ts` (`getDefaultAppState`)
  - `packages/excalidraw/components/App.tsx` (`this.state`)
- **Do not confuse with**
  - **Elements array** — geometry lives in `Scene`; `AppState` references elements by id and holds editor interaction state.
  - **`ObservedAppState`** — smaller subset used for store/delta observation (`packages/excalidraw/types.ts`).
- **Evidence**
  - `packages/excalidraw/types.ts`: `export interface AppState {` (~272+)
  - `packages/excalidraw/appState.ts`: `export const getDefaultAppState = (): Omit<AppState, ...> => ({` (~22–26)

## `UIAppState`

- **Definition**
  - **`AppState` minus** `startBoundElement`, `cursorButton`, `scrollX`, `scrollY` — used where full scroll/cursor binding state should not leak (e.g. UI context).
- **Where it is used**
  - `packages/excalidraw/types.ts`
  - `packages/excalidraw/context/ui-appState.ts` (consumers use `UIAppState` type)
- **Do not confuse with**
  - **Full `AppState`** — UI layers must not assume scroll/binding fields exist.
- **Evidence**
  - `packages/excalidraw/types.ts`: `export type UIAppState = Omit<AppState, "startBoundElement" | "cursorButton" | "scrollX" | "scrollY">` (~486–489)

## `StaticCanvasAppState` / `InteractiveCanvasAppState`

- **Definition**
  - **Readonly slices** of `AppState` passed to static vs interactive canvas rendering: shared canvas fields (zoom, scroll, dimensions, theme, selection ids for static in part) plus layer-specific fields (e.g. interactive includes `activeTool`, `collaborators`, `snapLines`).
- **Where it is used**
  - `packages/excalidraw/types.ts`
  - `packages/excalidraw/components/canvases/StaticCanvas.tsx`, `InteractiveCanvas.tsx`
  - `packages/excalidraw/renderer/staticScene.ts`, `interactiveScene.ts`
- **Do not confuse with**
  - **`AppState` in full** — render passes only these projections to reduce invalidation and clarify layer responsibilities.
- **Evidence**
  - `packages/excalidraw/types.ts`: `export type StaticCanvasAppState`, `InteractiveCanvasAppState` (~197–248)

---

## Interaction terms (commands)

## `Action`

- **Definition**
  - Registered command object: `name`, `perform(elements, appState, formData, app) → ActionResult | Promise<ActionResult>`, optional `keyTest`, `PanelComponent`, `predicate`, etc. Instances are registered via **`register()`** into a module-level list (`packages/excalidraw/actions/register.ts`); `App` passes that list to `ActionManager.registerAll`.
- **Where it is used**
  - `packages/excalidraw/actions/types.ts` (`export interface Action`)
  - `packages/excalidraw/actions/action*.tsx` (each `register({ ... })`)
  - `packages/excalidraw/actions/manager.tsx` (`executeAction`, `handleKeyDown`)
- **Do not confuse with**
  - **Browser “action” attribute** — always the editor command abstraction.
  - **Redux “action”** — not a flux action; it is a synchronous command object with `perform`.
- **Evidence**
  - `packages/excalidraw/actions/types.ts`: `export interface Action<TData = any>` (~162–218), `ActionFn` (~35–40)
  - `packages/excalidraw/actions/register.ts`: `export const register = ...` (~5–14)

## `ActionResult`

- **Definition**
  - Result of an `Action.perform`: either **`false`** (abort) or an object with optional **`elements`**, **`appState`**, **`files`**, **`captureUpdate`** (`CaptureUpdateAction` enum from `@excalidraw/element`), `replaceFiles`. Consumed by `App.syncActionResult` to update `Scene`, React state, and files.
- **Where it is used**
  - `packages/excalidraw/actions/types.ts`
  - `packages/excalidraw/components/App.tsx` (`syncActionResult`)
- **Do not confuse with**
  - **HTTP response** — unrelated; this is in-process editor mutation result.
- **Evidence**
  - `packages/excalidraw/actions/types.ts`: `export type ActionResult =` (~25–33)
  - `packages/excalidraw/components/App.tsx`: `public syncActionResult = withBatchedUpdates((actionResult: ActionResult) => {` (~2735+)

## `ActionManager`

- **Definition**
  - Per-editor instance registry mapping **`ActionName` → `Action`**. Dispatches **`executeAction`**, resolves keyboard shortcuts via **`handleKeyDown`**, renders **`PanelComponent`** via **`renderAction`**, and forwards results to the `UpdaterFn` passed at construction (wired to `App.syncActionResult`).
- **Where it is used**
  - `packages/excalidraw/actions/manager.tsx` (`export class ActionManager`)
  - `packages/excalidraw/components/App.tsx` (`this.actionManager = new ActionManager(...)`)
- **Do not confuse with**
  - **Single `Action`** — the manager is the multiplexer; actions are the units.
- **Evidence**
  - `packages/excalidraw/actions/manager.tsx`: `export class ActionManager` (~52–79), `executeAction` (~132–143)
  - `packages/excalidraw/components/App.tsx`: `new ActionManager(this.syncActionResult, () => this.state, () => this.scene.getElementsIncludingDeleted(), this)` (~819–824)

## `ToolType` / `ActiveTool`

- **Definition**
  - **`ToolType`**: string union of built-in tools (`selection`, `lasso`, `rectangle`, `arrow`, `hand`, `laser`, …). **`ActiveTool`**: either `{ type: ToolType; customType: null }` or `{ type: "custom"; customType: string }` for the current tool, nested under `AppState.activeTool` together with `locked`, `fromSelection`, `lastActiveTool`.
- **Where it is used**
  - `packages/excalidraw/types.ts`
  - `packages/excalidraw/appState.ts` (default `activeTool`)
  - `packages/excalidraw/components/App.tsx` (tool handling)
- **Do not confuse with**
  - **`ExcalidrawElement["type"]`** — element type describes shape data; tool describes what the user is drawing/selecting with.
- **Evidence**
  - `packages/excalidraw/types.ts`: `export type ToolType = | "selection" | ...` (~143–159), `export type ActiveTool =` (~163–171)
  - `packages/excalidraw/appState.ts`: `activeTool: { type: "selection", ... }` (~50–56)

## `CaptureUpdateAction`

- **Definition**
  - Enum-like object (`IMMEDIATELY` | `NEVER` | `EVENTUALLY`) controlling whether a scene change is **captured** into the **`Store`** for undo/redo: immediate capture, never (remote/init), or deferred batching. Used in `ActionResult.captureUpdate` and `App.updateScene` scheduling.
- **Where it is used**
  - `packages/element/src/store.ts` (`export const CaptureUpdateAction`, `scheduleAction`, `scheduleMicroAction`)
  - `packages/excalidraw/components/App.tsx` (`updateScene`, `syncActionResult`)
- **Do not confuse with**
  - **React `capture` phase** — unrelated naming; this is history/store capture policy.
- **Evidence**
  - `packages/element/src/store.ts`: `export const CaptureUpdateAction = { IMMEDIATELY: ..., NEVER: ..., EVENTUALLY: ... }` (~38–69)
  - `packages/excalidraw/actions/types.ts`: `captureUpdate: CaptureUpdateActionType` on `ActionResult` (~30)

---

## History and store

## `Store` (element package)

- **Definition**
  - **`Store`** class (in `@excalidraw/element`, constructed with `App`) maintains **`StoreSnapshot`**, schedules macro/micro actions for **delta** computation, and emits increments for **`History`** / undo. Not the same as React state or Jotai store.
- **Where it is used**
  - `packages/element/src/store.ts` (`export class Store`)
  - `packages/excalidraw/components/App.tsx` (`this.store = new Store(this)`)
- **Do not confuse with**
  - **`editorJotaiStore` / `appJotaiStore`** — Jotai stores for UI atoms; `Store` is the editor undo/redo snapshot pipeline.
- **Evidence**
  - `packages/element/src/store.ts`: `export class Store` (~78–99), constructor `constructor(private readonly app: App)` (~99)
  - `packages/excalidraw/components/App.tsx`: `this.store = new Store(this)` (~832–833)

## `History`

- **Definition**
  - **`packages/excalidraw/history.ts`** defines `History` / `HistoryDelta` extending store deltas; applies undo/redo by applying **`StoreDelta`** to elements + `AppState` with special handling (e.g. exclude `version` / `versionNonce` on history apply per `HistoryDelta.applyTo` comment).
- **Where it is used**
  - `packages/excalidraw/history.ts`
  - `packages/excalidraw/components/App.tsx` (`this.history = new History(this.store)`)
  - `packages/excalidraw/actions/actionHistory.ts` (`createUndoAction`, `createRedoAction`)
- **Do not confuse with**
  - **Browser history API** — this is editor-local undo stacks.
- **Evidence**
  - `packages/excalidraw/history.ts`: `export class HistoryDelta extends StoreDelta` (~15–46)
  - `packages/excalidraw/components/App.tsx`: `this.history = new History(this.store)` (~833–834)

---

## Library and serialization

## `LibraryItem` / `LibraryItems`

- **Definition**
  - **`LibraryItem`** (v2): `{ id, status: "published" | "unpublished", elements: readonly NonDeleted<ExcalidrawElement>[], created, name?, error? }`. **`LibraryItems`**: readonly array of items. Legacy **`LibraryItem_v1`** was a flat **array of elements** per item (deprecated).
- **Where it is used**
  - `packages/excalidraw/types.ts`
  - `packages/excalidraw/data/library.ts` (`Library` class, persistence adapters, `LibraryPersistedData`)
- **Do not confuse with**
  - **npm / code “library”** — here it is the **sidebar stencil library** of reusable shapes.
  - **`LibraryItem_v1`** — old shape; migration paths use `LibraryItems_anyVersion`.
- **Evidence**
  - `packages/excalidraw/types.ts`: `export type LibraryItem = { id: string; ... }` (~522–530), `LibraryItems` (~531)
  - `packages/excalidraw/data/library.ts`: `export type LibraryPersistedData = { libraryItems: LibraryItems }` (~70)

## `ImportedDataState` / `ExportedDataState`

- **Definition**
  - **`ImportedDataState`**: payload for loading a scene — optional `elements`, `appState`, `files`, `libraryItems`, `scrollToContent`, version metadata. **`ExportedDataState`**: serialized export with `type`, `version`, `source`, `elements`, `appState` (cleaned), `files`.
- **Where it is used**
  - `packages/excalidraw/data/types.ts`
  - `packages/excalidraw/data/restore.ts`, `json` export paths
  - `excalidraw-app/App.tsx` (`initialData` promise)
- **Do not confuse with**
  - **Raw `AppState` alone** — import/export bundles elements + app state + files as a package.
- **Evidence**
  - `packages/excalidraw/data/types.ts`: `export interface ImportedDataState` (~35–50), `export interface ExportedDataState` (~14–21)

---

## Collaboration (host app)

## `roomId` / `roomKey`

- **Definition**
  - Pair parsed from URL hash **`#room=<roomId>,<roomKey>`** for live collaboration: **`roomId`** identifies the socket room; **`roomKey`** is the encryption key for payloads (length validated in `getCollaborationLinkData`). Generated together by `generateCollaborationLinkData` in the host data layer.
- **Where it is used**
  - `excalidraw-app/data/index.ts` (`RE_COLLAB_LINK`, `getCollaborationLinkData`, `generateCollaborationLinkData`, `getCollaborationLink`)
  - `excalidraw-app/collab/Collab.tsx`, `excalidraw-app/collab/Portal.tsx` (socket + encrypt)
- **Do not confuse with**
  - **React “key” prop** — `roomKey` is cryptographic material for the session, not a list key.
  - **Share link `#json=id,key`** — different hash format for static JSON backend links (`exportToBackend` in same file).
- **Evidence**
  - `excalidraw-app/data/index.ts`: `const RE_COLLAB_LINK = /^#room=.../` (~131), `getCollaborationLinkData` (~138–146)

## `Collaborator`

- **Definition**
  - **`Readonly`** descriptor for a remote participant: optional `pointer`, `selectedElementIds`, `username`, `userState`, `color`, `socketId` as `SocketId`, avatars, call flags, etc. Stored in **`AppState.collaborators`** as a **`Map`** keyed by `SocketId`.
- **Where it is used**
  - `packages/excalidraw/types.ts` (`export type Collaborator`)
  - `packages/excalidraw/appState.ts` (`collaborators: new Map()` in defaults)
  - `excalidraw-app/collab/Collab.tsx` (updates collaborator state)
- **Do not confuse with**
  - **OS user account** — ephemeral session presence for the canvas.
- **Evidence**
  - `packages/excalidraw/types.ts`: `export type Collaborator = Readonly<{ ... }>` (~70–90)
  - `packages/excalidraw/appState.ts`: `collaborators: new Map()` (~29)

## `SocketId`

- **Definition**
  - Branded **`string`** identifying a connection in a collaboration session (used for `Collaborator` keys and `UserToFollow`).
- **Where it is used**
  - `packages/excalidraw/types.ts`
  - `packages/excalidraw/components/UserList.tsx` (`socketId` in types)
  - `excalidraw-app/collab/Collab.tsx` (socket.io client)
- **Do not confuse with**
  - **Element `id`** — unrelated identifier space.
- **Evidence**
  - `packages/excalidraw/types.ts`: `export type SocketId = string & { _brand: "SocketId" }` (~68)

---

# Glossary coverage notes

- **Main source areas inspected**
  - `packages/element/src/types.ts`, `packages/element/src/Scene.ts`, `packages/element/src/store.ts`
  - `packages/excalidraw/types.ts`, `packages/excalidraw/appState.ts`, `packages/excalidraw/actions/types.ts`, `packages/excalidraw/actions/manager.tsx`, `packages/excalidraw/actions/register.ts`
  - `packages/excalidraw/data/types.ts`, `packages/excalidraw/data/library.ts`
  - `packages/excalidraw/history.ts`
  - `packages/excalidraw/components/App.tsx` (construction of scene, store, action manager, sync)
  - `excalidraw-app/data/index.ts` (collaboration URL parsing)

- **Terms intentionally excluded**
  - **Generic identifiers** (`id`, `name`) without a distinct type.
  - **`RemoteExcalidrawElement`** and other reconcile types — important but used mainly in deep collaboration/reconcile paths; omitted to keep glossary bounded.
  - **`ExcalidrawImperativeAPI`** — public API surface; large; would duplicate many `App` methods; can be added later from `packages/excalidraw/types.ts` + `App.createExcalidrawAPI`.

- **Ambiguous / partially verified**
  - **`BinaryFiles` key type** — `types.ts` declares `Record<ExcalidrawElement["id"], BinaryFileData>` while semantically keys are **`FileId`**-backed file records; treat as implementation detail and trust runtime usage in `onChange` / storage.
  - **“Not verified”** whether every consumer distinguishes **`ToolType`** vs **`ExcalidrawElement["type"]`** at compile time — types are separate; runtime mistakes are possible but not documented here.


## Details
For detailed architecture → see `docs/technical/architecture.md`
For domain glossary → `see docs/product/domain-glossary.md`