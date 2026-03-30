# Domain Glossary

Project-specific meanings for core terms in this Excalidraw monorepo. Definitions are taken from types, classes, and comments in source code only.

## ExcalidrawElement

**Definition (project-specific):**

- Union type for all drawable / scene-owned records (shapes, text, lines, arrows, images, frames, embeddables, etc.).
- Intended to be JSON-serializable and free of peer-local computed state; the full list is what gets shared between peers and persisted.
- Carries geometry, style, grouping (`groupIds`), optional `frameId`, `boundElements`, versioning fields (`version`, `versionNonce`, `index`), and soft-delete via `isDeleted`.

**Used in:**

- `packages/element/src/types.ts`
- `packages/excalidraw/types.ts`
- `packages/excalidraw/actions/types.ts`

**Not to be confused with:**

- A DOM node or React component: here it is pure data describing canvas content.
- A generic “UI element”: the code name is always `ExcalidrawElement` (or a narrowed variant).

## OrderedExcalidrawElement

**Definition (project-specific):**

- An `ExcalidrawElement` whose fractional `index` is non-null (assigned in scene order).
- Used where ordering in the scene array / reconciliation is guaranteed.

**Used in:**

- `packages/element/src/types.ts`
- `packages/excalidraw/actions/types.ts` (e.g. action `perform` receives `OrderedExcalidrawElement[]`)

**Not to be confused with:**

- Any sorted list: `Ordered` refers specifically to the branded `index` field on the element type, not “sorted for display” in general.

## Scene

**Definition (project-specific):**

- Class that holds the authoritative ordered element list (including deleted), derived non-deleted views, maps, frame lists, and selection caches.
- Registers update callbacks (`onUpdate`) so the editor can re-render when scene data changes; exposes `replaceAllElements`, `mutateElement`, getters for maps and non-deleted elements, etc.

**Used in:**

- `packages/element/src/Scene.ts`
- `packages/excalidraw/components/App.tsx` (scene ownership and updates; see architecture wiring)

**Not to be confused with:**

- “Scene” as a video/film term: here it is the in-memory graph of canvas elements plus caches for the editor.

## AppState

**Definition (project-specific):**

- Large interface describing UI/editor state that is not the element list itself: active tool, selection maps, scroll/zoom, dialogs, collaboration maps, snap lines, export settings, grid, theme, transient editing targets (`newElement`, `multiElement`, `editingTextElement`), and more.
- Default shape is built by `getDefaultAppState` (partial without layout fields that depend on the container).

**Used in:**

- `packages/excalidraw/types.ts` (`export interface AppState`)
- `packages/excalidraw/appState.ts` (`getDefaultAppState`)

**Not to be confused with:**

- Server or routing “application state” in general: this type is the Excalidraw editor’s React-owned UI/scene-interaction state.

## ToolType

**Definition (project-specific):**

- String union naming built-in editor tools: `selection`, `lasso`, shape tools, `arrow`, `line`, `freedraw`, `text`, `image`, `eraser`, `hand`, `frame`, `magicframe`, `embeddable`, `laser`.

**Used in:**

- `packages/excalidraw/types.ts`

**Not to be confused with:**

- Third-party “tools” or CLI tools: these values drive pointer behavior and toolbar modes inside the canvas.

## ActiveTool

**Definition (project-specific):**

- Either `{ type: ToolType; customType: null }` or `{ type: "custom"; customType: string }` for extensible tools.
- In `AppState`, `activeTool` augments this with `lastActiveTool`, `locked`, and `fromSelection` for temporary tool switches (e.g. eraser/hand).

**Used in:**

- `packages/excalidraw/types.ts`
- `packages/excalidraw/appState.ts` (default `activeTool`)

**Not to be confused with:**

- The React `active` attribute or focus management: this is only the drawing/interaction mode.

## Action

**Definition (project-specific):**

- Interface for a named editor command (`ActionName`) with `perform(elements, appState, formData, app)` returning `ActionResult`, optional keyboard tests, predicates, panel UI, and analytics metadata.
- Registered and executed through `ActionManager`.

**Used in:**

- `packages/excalidraw/actions/types.ts` (`export interface Action`)
- `packages/excalidraw/actions/manager.tsx` (`ActionManager`)

**Not to be confused with:**

- Redux/Flux “actions”: here an `Action` is a typed command object in the Excalidraw action system, not necessarily a plain serializable event.

## ActionResult

**Definition (project-specific):**

- Either `false` (block the action) or an object that can carry partial `elements`, `appState`, `files`, `replaceFiles`, and a required `captureUpdate` (`CaptureUpdateActionType`) describing how the change interacts with history.
- Produced by `Action.perform` and consumed by the app’s update pipeline.

**Used in:**

- `packages/excalidraw/actions/types.ts`

**Not to be confused with:**

- HTTP “result” or Promise resolution types in general: this shape is specific to merging editor updates.

## ActionManager

**Definition (project-specific):**

- Class holding a map of all `Action`s by `ActionName`, routing key events and executing `perform` with the current `AppState` and elements, then forwarding `ActionResult` to an updater (with Promise support).

**Used in:**

- `packages/excalidraw/actions/manager.tsx`

**Not to be confused with:**

- A generic command bus from other frameworks: this manager is specific to Excalidraw’s registered `Action` set.

## CaptureUpdateActionType

**Definition (project-specific):**

- Values from `CaptureUpdateAction` (`IMMEDIATELY`, `NEVER`, `EVENTUALLY`) indicating whether a change should enter local undo/redo immediately, never, or on a later commit.
- Used on `ActionResult` and throughout `Store` scheduling.

**Used in:**

- `packages/element/src/store.ts` (`CaptureUpdateAction`, `CaptureUpdateActionType`)
- `packages/excalidraw/actions/types.ts` (`ActionResult`)

**Not to be confused with:**

- Database “CAP” or distributed consistency: “capture” here means capturing into history/undo stacks.

## Store

**Definition (project-specific):**

- Class that observes element and app-state changes and emits `DurableIncrement` / `EphemeralIncrement` events for history and `onIncrement` subscribers; schedules macro/micro actions and tracks a `StoreSnapshot`.
- Constructed with the editor `App` instance.

**Used in:**

- `packages/element/src/store.ts` (`export class Store`)

**Not to be confused with:**

- Redux store or a generic key-value store: this `Store` is the change-capture/history integration layer.

## LibraryItem

**Definition (project-specific):**

- v2 library record: `{ id, status: "published" | "unpublished", elements: NonDeleted<ExcalidrawElement>[], created, optional name/error }`.
- Legacy v1 items are `LibraryItem_v1` (deprecated): a plain array of elements.

**Used in:**

- `packages/excalidraw/types.ts`
- `packages/excalidraw/data/types.ts` (`ImportedDataState`, `ExportedLibraryData`)

**Not to be confused with:**

- A source code or npm “library”: here it is one storable template entry made of canvas elements.

## LibraryItems

**Definition (project-specific):**

- Readonly array type: `readonly LibraryItem[]`; primary shape for the user’s shape library and `onLibraryChange` callbacks.

**Used in:**

- `packages/excalidraw/types.ts`
- `packages/excalidraw/data/library.ts` (`Library` holds `currLibraryItems: LibraryItems`)

**Not to be confused with:**

- A list of book/media items: only the name overlaps; semantics are Excalidraw template entries.

## Library

**Definition (project-specific):**

- Default-export class managing current `LibraryItems`, update queuing, notification to `onLibraryChange`, Jotai-backed library state, and persistence hooks (`LibraryPersistenceAdapter` / migration adapters in the same module).
- Exposed to embedders indirectly via `ExcalidrawImperativeAPI.updateLibrary`.

**Used in:**

- `packages/excalidraw/data/library.ts` (`class Library`, `export default Library`)
- `packages/excalidraw/types.ts` (API references `InstanceType<typeof Library>`)

**Not to be confused with:**

- Public documentation or dependency libraries: this is an internal service class for the shape library feature.

## CollabAPI

**Definition (project-specific):**

- Interface implemented by the `Collab` React class in the app shell: `isCollaborating`, pointer sync (`onPointerUpdate`), `startCollaboration`, `stopCollaboration`, `syncElements`, Firebase-related `fetchImageFilesFromFirebase`, username accessors, room link, and error surfacing (`setCollabError`).
- This is the host-facing control surface for live collaboration in `excalidraw-app`.

**Used in:**

- `excalidraw-app/collab/Collab.tsx` (`export interface CollabAPI`)
- `excalidraw-app/share/ShareDialog.tsx`

**Not to be confused with:**

- The abstract concept of collaboration: `CollabAPI` is the concrete TypeScript contract for this app’s collab module, not the wire protocol itself.

## Collaborator

**Definition (project-specific):**

- Readonly record keyed by `SocketId` in `AppState.collaborators`: optional pointer position, button state, remote selection ids, username, idle state, colors, avatar, call state flags, etc.
- Used for rendering remote cursors and awareness in the interactive canvas (`InteractiveCanvasAppState` includes `collaborators`).

**Used in:**

- `packages/excalidraw/types.ts` (`export type Collaborator`)
- `excalidraw-app/collab/Collab.tsx` (internal `collaborators` map typed with `SocketId` / `Collaborator`)

**Not to be confused with:**

- A user account or file-sharing collaborator in the product sense: this type is only the live presence payload for the editor.

## SocketId

**Definition (project-specific):**

- Branded `string` type identifying a collaboration session participant for maps like `AppState.collaborators` and `followedBy`.

**Used in:**

- `packages/excalidraw/types.ts` (`export type SocketId`)

**Not to be confused with:**

- A raw WebSocket object or URL: this is only an opaque participant id string in editor state.

## ImportedDataState

**Definition (project-specific):**

- Payload for loading a scene: optional `type`, `version`, `source`, `elements`, partial `appState`, `scrollToContent`, `libraryItems`, and `files` (`BinaryFiles`).
- Consumed by restore/import paths and extended by `ExcalidrawInitialDataState` for initial mount.

**Used in:**

- `packages/excalidraw/data/types.ts` (`export interface ImportedDataState`)
- `packages/excalidraw/types.ts` (`ExcalidrawInitialDataState`)

**Not to be confused with:**

- Any imported ES module: this is serialized editor/scene data for hydration.

## BinaryFileData

**Definition (project-specific):**

- Metadata plus `dataURL` for an embedded binary (images, etc.): `mimeType`, branded `FileId`, `created`, optional `lastRetrieved` / `version`.

**Used in:**

- `packages/excalidraw/types.ts`

**Not to be confused with:**

- Node `Buffer` or opaque blobs in memory only: this structure is tied to `FileId` and export/import (`dataURL`).

## BinaryFiles

**Definition (project-specific):**

- `Record<ExcalidrawElement["id"], BinaryFileData>` in the type definition (map keyed by element id to file payloads); passed alongside elements in `onChange` and export types.

**Used in:**

- `packages/excalidraw/types.ts`
- `packages/excalidraw/data/types.ts` (`ImportedDataState`, `ExportedDataState`)

**Not to be confused with:**

- A folder of files on disk: this is the in-editor map associating elements with embedded file data.

## ExcalidrawImperativeAPI

**Definition (project-specific):**

- Ref handle returned to host apps: `updateScene`, `applyDeltas`, `mutateElement`, `updateLibrary`, selection of getters, `setActiveTool`, file APIs, event subscription helpers (`onChange`, `onIncrement`, pointer/scroll/user-follow), `registerAction`, and lifecycle flags (`isDestroyed`).

**Used in:**

- `packages/excalidraw/types.ts` (`export interface ExcalidrawImperativeAPI`)

**Not to be confused with:**

- Public REST “API”: this is the in-process TypeScript interface for controlling the embedded editor instance.

## Renderer

**Definition (project-specific):**

- Class constructed with a `Scene`; exposes `getRenderableElements`, which filters `NonDeletedExcalidrawElement`s to those in the viewport (using zoom, scroll, offsets, dimensions) for canvas drawing.

**Used in:**

- `packages/excalidraw/scene/Renderer.ts` (`export class Renderer`)

**Not to be confused with:**

- React’s renderer or a generic graphics API: this class is a small scene→visible-elements helper for the canvas pipeline.

## mutateElement

**Definition (project-specific):**

- Function that applies `ElementUpdate` patches to a mutable `ExcalidrawElement`, updates versioning/timestamps for collaboration reconciliation, and coordinates with binding/elbow-arrow logic; does not by itself trigger React re-render—comments direct callers to `scene.mutateElement` or `ExcalidrawImperativeAPI.mutateElement` when a UI refresh is needed.

**Used in:**

- `packages/element/src/mutateElement.ts` (`export const mutateElement`)

**Not to be confused with:**

- Immutable “copy-on-write” helpers like `newElementWith` in the same package: `mutateElement` mutates the instance in place under the element store’s expectations.
