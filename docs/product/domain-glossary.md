# Domain Glossary

> Source-verified glossary of project-specific terms for the Excalidraw monorepo. All definitions are grounded in source code, type definitions, and tests. Where a definition is derived rather than explicitly stated in a comment, the entry is marked **Inference from source**.

---

## Action

**Definition in this project** A registered unit of user intent that reads the current `elements` and `appState`, optionally produces a new `elements` array and/or partial `appState`, and declares how the change should be captured in the undo history via `captureUpdate`. Actions are the primary mechanism through which the UI, keyboard shortcuts, context menu, and API mutate editor state in a uniform way.

**Where it is used**

- Type definition: `packages/excalidraw/actions/types.ts:162` (`interface Action`)
- Registered and dispatched via `ActionManager`
- Over 100 named actions enumerated in `ActionName` union at `packages/excalidraw/actions/types.ts:45–147`
- Source values: `"ui" | "keyboard" | "contextMenu" | "api" | "commandPalette"` (`ActionSource`, line 17)

**Do not confuse with**

- A JavaScript `async` action or Redux action — this is Excalidraw-specific
- `CaptureUpdateAction`, which is a flag on how/whether the action is recorded in history, not the action itself

---

## AppState

**Definition in this project** The complete editor state that is **not** part of the element data. Includes active tool, scroll position, zoom level, selection, UI visibility flags (`zenModeEnabled`, `gridModeEnabled`, `viewModeEnabled`), current item style defaults, collaboration state references, and transient interaction state (e.g., `newElement`, `resizingElement`, `multiElement`). `AppState` is held in `App.state` and passed through action functions and render props.

**Where it is used**

- Type definition: `packages/excalidraw/types.ts:272` (`export interface AppState`)
- Passed to every `Action.perform` function and to `reconcileElements`
- Exposed via `ExcalidrawImperativeAPI.getAppState()`
- A subset `UIAppState` (also in `types.ts`) is exposed to rendering components that do not need all fields

**Do not confuse with**

- `ExcalidrawElement` state — visual properties of drawn objects live on elements, not in `AppState`
- React component state in general — `AppState` is an Excalidraw-specific shape, not just `this.state`

---

## BinaryFileData / BinaryFiles

**Definition in this project** `BinaryFileData` is the record for a single embedded file (e.g., a pasted or inserted image). It carries a `dataURL`, a MIME type, a `FileId`, a `created` epoch timestamp, and an optional `lastRetrieved` timestamp used to prune files no longer referenced by any scene element. `BinaryFiles` is a `Record<FileId, BinaryFileData>` map — the complete file store for a session.

**Where it is used**

- Type definitions: `packages/excalidraw/types.ts:113–141`
- Passed as the third argument to `onChange`, `onExportToBackend`, and `renderCustomUI` callbacks
- Stored in `App.files` and exposed via `ExcalidrawImperativeAPI.getFiles()`
- `ExcalidrawImageElement.fileId` is the foreign key linking an element to its `BinaryFileData`

**Do not confuse with**

- `ExcalidrawImageElement` — the element describes position and geometry; `BinaryFileData` is the pixel content
- `FileId` — the branded string key (`string & { _brand: "FileId" }`), not the raw file data

---

## Collaboration

**Definition in this project** Real-time multi-user editing via Socket.IO and Firebase Firestore. Each session has a **room** identified by a URL hash that also carries the AES-GCM symmetric encryption key (key never sent to the server). Participants exchange serialized element arrays as `SCENE_INIT` (full scene on join) and `SCENE_UPDATE` (delta updates) WebSocket messages. Cursor positions are broadcast as `MOUSE_LOCATION` messages with a `CURSOR_SYNC_TIMEOUT` of 33 ms (~30 fps). Reconciliation of concurrent edits is performed client-side by `reconcileElements`.

**Where it is used**

- Collab layer: `excalidraw-app/collab/Collab.tsx`, `excalidraw-app/collab/Portal.tsx`
- Socket message types: `excalidraw-app/app_constants.ts` (`WS_SUBTYPES`)
- Encryption: `packages/excalidraw/data/encryption.ts` (AES-GCM, 128-bit key)
- `ExcalidrawProps.isCollaborating` prop signals the collab state to the editor UI

**Do not confuse with**

- `Collaborator` (see below) — the per-user data object, not the subsystem
- The `@excalidraw/excalidraw` library itself, which has no built-in collab server; the collab layer lives entirely in `excalidraw-app`

---

## Collaborator

**Definition in this project** A value object representing a single remote user in a shared session. Contains the user's cursor position (`pointer`), pointer button state, selected element IDs, username, idle state, avatar URL, and display color. The presence map `Map<SocketId, Collaborator>` is held in `AppState.collaborators`.

**Where it is used**

- Type definition: `packages/excalidraw/types.ts:70–90` (`export type Collaborator`)
- `SocketId` is a branded string: `packages/excalidraw/types.ts:68`
- Updated via `SceneData.collaborators` when calling `updateScene`
- Rendered as cursor overlays in the canvas

**Do not confuse with**

- A Socket.IO connection object — `Collaborator` is a plain data record, not a live socket
- A Firebase Firestore user — `Collaborator` is ephemeral, not persisted to the database

---

## DurableIncrement / EphemeralIncrement

**Definition in this project** `DurableIncrement` represents a captured change to the `Store` that carries both a `StoreChange` (what changed) and a `StoreDelta` (the reversible diff). It is pushed onto the undo stack and emitted to `onIncrement` subscribers. `EphemeralIncrement` carries only a `StoreChange` with no delta; it is emitted for transient interactions (pointer move, drag in progress) that should not create undo entries.

**Where it is used**

- Class definitions: `packages/element/src/store.ts:476` (`DurableIncrement`), `packages/element/src/store.ts:488` (`EphemeralIncrement`)
- Emitted by `Store.emitDurableIncrement` and `Store.emitEphemeralIncrement`
- Consumed by `History` (durable only) and by `ExcalidrawProps.onIncrement` / `ExcalidrawImperativeAPI.onIncrement` (both types)

**Do not confuse with**

- `HistoryDelta` — the history-layer wrapper that applies a `StoreDelta` during undo/redo
- A network message — increments are local, in-process events; collaboration uses separate WebSocket messages

---

## Element

**Definition in this project** The atomic drawable unit of an Excalidraw scene. Every shape, text, image, arrow, frame, or embedded content is an element. The abstract base is `_ExcalidrawElementBase` (internal, not exported); the public union type is `ExcalidrawElement`. All elements are plain JSON-serializable objects; no methods are attached. Elements are **immutable** by convention — mutations go through `mutateElement` which also updates `version` and `versionNonce`.

**Where it is used**

- Base type: `packages/element/src/types.ts:40` (`_ExcalidrawElementBase`)
- Union: `packages/element/src/types.ts:206` (`ExcalidrawElement`)
- Concrete subtypes: `ExcalidrawRectangleElement`, `ExcalidrawLinearElement`, `ExcalidrawTextElement`, `ExcalidrawImageElement`, `ExcalidrawFrameElement`, `ExcalidrawMagicFrameElement`, `ExcalidrawEmbeddableElement`, `ExcalidrawFreeDrawElement`

**Do not confuse with**

- A DOM element — these are canvas-drawn data objects with no DOM representation
- `ExcalidrawElement` (the full type) vs `ExcalidrawGenericElement` (the subset without linear/text/image specializations)

---

## ExcalidrawElement

**Definition in this project** The top-level exported union of all drawable element types. It is the canonical type used throughout the public API. All fields from `_ExcalidrawElementBase` are present on every subtype, including `id`, `x`, `y`, `width`, `height`, `angle`, `version`, `versionNonce`, `index`, `isDeleted`, `groupIds`, `frameId`, `boundElements`, `updated`, `seed`, `roughness`, `fillStyle`, `strokeColor`, `backgroundColor`, `opacity`, and `locked`.

```ts
ExcalidrawElement =
  | ExcalidrawGenericElement
  | ExcalidrawTextElement
  | ExcalidrawLinearElement
  | ExcalidrawFreeDrawElement
  | ExcalidrawImageElement
  | ExcalidrawFrameElement
  | ExcalidrawMagicFrameElement
  | ExcalidrawEmbeddableElement
```

**Where it is used**

- `packages/element/src/types.ts:206`
- Passed to every `Action.perform`, `onChange`, `reconcileElements`, and export function
- Elements are stored in `Scene` as `OrderedExcalidrawElement[]` (i.e., with a non-null `index` field)

**Do not confuse with**

- `NonDeletedExcalidrawElement` — the same union narrowed to `isDeleted: false`; used for rendering
- `OrderedExcalidrawElement` — the same union narrowed to `index: FractionalIndex` (non-null); used internally after ordering

---

## EXCALIDRAW_ASSET_PATH

**Definition in this project** A global `window`-level variable (`string | string[] | undefined`) that overrides the base URL(s) from which font files and other static assets are loaded. When set to an array, each URL is tried in order, enabling multi-CDN fallback. When not set, assets are resolved relative to the hosting page.

**Where it is used**

- Type declaration: `packages/excalidraw/global.d.ts:4`
- Array-fallback logic: `packages/excalidraw/fonts/ExcalidrawFontFace.ts:153–163`

**Do not confuse with**

- A Vite/Webpack `publicPath` build-time config — `EXCALIDRAW_ASSET_PATH` is a runtime override
- Environment variables like `VITE_APP_*` — those are build-time; this is read from `window` at font-load time

---

## FillStyle

**Definition in this project** An element property controlling how the interior of closed shapes is rendered by roughjs. The four valid values are `"hachure"` (diagonal hatching), `"cross-hatch"` (crossing hatching), `"solid"` (flat fill), and `"zigzag"` (zigzag lines).

**Where it is used**

- Type definition: `packages/element/src/types.ts:19`
- Field on `_ExcalidrawElementBase.fillStyle`
- Controlled via `currentItemFillStyle` in `AppState`

**Do not confuse with**

- CSS `fill` or SVG `fill-rule` — FillStyle describes which pattern roughjs draws, not a CSS property
- `strokeStyle` — that controls line dash pattern (`"solid"`, `"dashed"`, `"dotted"`), not fill

---

## FractionalIndex

**Definition in this project** A branded string (`string & { _brand: "franctionalIndex" }`) implementing the fractional indexing algorithm from the `fractional-indexing` npm package. Used as the `index` field on every ordered element to determine z-order (render stack). Fractional indices allow inserting elements between two existing elements without renumbering the entire array — critical for correct undo/redo and conflict-free concurrent ordering in collaboration. Indices are kept in sync with the array's physical order by `syncMovedIndices` and `syncInvalidIndices`.

**Where it is used**

- Type definition: `packages/element/src/types.ts:33`
- Field: `_ExcalidrawElementBase.index` (`packages/element/src/types.ts:69`)
- Ordering functions: `packages/element/src/fractionalIndex.ts`
- Validated in dev/test by `validateFractionalIndices` (called from `Scene.ts:67–79` and `reconcile.ts:46`)

**Do not confuse with**

- Array index (`number`) — fractional indices are strings like `"a0"`, `"a1"`, `"a0V"`
- z-index CSS property — z-order is determined purely by array position, which is reflected by fractional index sort order

---

## Frame / MagicFrame

**Definition in this project** `ExcalidrawFrameElement` (`type: "frame"`) is a named container element that visually groups and clips a set of child elements. Children reference the frame via their `frameId` field. `ExcalidrawMagicFrameElement` (`type: "magicframe"`) is a variant that triggers AI-powered "text-to-diagram" generation for its contents. Together they form the `ExcalidrawFrameLikeElement` union.

**Where it is used**

- Type definitions: `packages/element/src/types.ts:163–175`
- `_ExcalidrawElementBase.frameId` — every element can declare membership in a frame
- Frame rendering controlled via `AppState.frameRendering` (enabled, name, outline, clip flags)
- `ExcalidrawImperativeAPI.updateFrameRendering` for programmatic control

**Do not confuse with**

- HTML `<iframe>` — frames in Excalidraw are canvas shapes; `ExcalidrawIframeElement` (type `"iframe"`) is a separate element for embedded web content
- `ExcalidrawEmbeddableElement` — a user-insertable embed; `iframe` elements are internally generated by magic frame AI

---

## GroupId / groupIds

**Definition in this project** `GroupId` is an opaque string identifier for a logical group of elements. Each element carries a `groupIds: readonly GroupId[]` array ordered from the deepest (innermost) group to the shallowest (outermost), supporting nested groups. Groups have no separate element object; they exist only as shared IDs across the `groupIds` arrays of their member elements. `AppState.editingGroupId` and `AppState.selectedGroupIds` track group interaction state.

**Where it is used**

- Type definition: `packages/element/src/types.ts:24`
- Field: `_ExcalidrawElementBase.groupIds` (`packages/element/src/types.ts:73`)
- `AppState.selectedGroupIds: { [groupId: string]: boolean }` (`packages/excalidraw/types.ts:425`)

**Do not confuse with**

- `frameId` — frames are visible container elements with their own rendering; groups are implicit, with no separate element
- Array index — `groupIds[0]` is the deepest/innermost group, not the first-created

---

## History / HistoryDelta

**Definition in this project** `History` (class in `packages/excalidraw/history.ts:90`) manages two stacks — `undoStack` and `redoStack` — each containing `HistoryDelta` entries. `HistoryDelta` extends `StoreDelta` and applies a reversible diff to `SceneElementsMap` and `AppState`. When undo/redo is performed, `HistoryDelta.applyTo` is called with `version` and `versionNonce` excluded from the applied change (so that each undo/redo is treated as a new user action by the collaboration system).

**Where it is used**

- `packages/excalidraw/history.ts:15` (`class HistoryDelta`), `packages/excalidraw/history.ts:90` (`class History`)
- Populated by `DurableIncrement` events from `Store`
- Exposed via `ExcalidrawImperativeAPI.history.clear()`
- Tests: `packages/excalidraw/tests/history.test.tsx` (5,231 lines, 63 test cases)

**Do not confuse with**

- Browser history (`window.history`) — no relation
- `StoreDelta` — the lower-level diff object; `HistoryDelta` wraps it with additional apply logic

---

## isDeleted

**Definition in this project** A boolean field on every `ExcalidrawElement` that marks the element as soft-deleted. Soft-deleted elements remain in the `Scene` element array and are synced over the wire for a retention window of 24 hours (`DELETED_ELEMENT_TIMEOUT = 86,400,000 ms`) to allow late-joining collaborators to receive deletions. The function `isSyncableElement` in `excalidraw-app` returns `true` for deleted elements only while `element.updated > Date.now() - DELETED_ELEMENT_TIMEOUT`.

**Where it is used**

- Field: `packages/element/src/types.ts:70`
- Retention constant: `excalidraw-app/app_constants.ts:9`
- Retention logic: `excalidraw-app/data/index.ts:46–55` (`isSyncableElement`)
- `getNonDeletedElements()` in `Scene.ts` filters these out for rendering

**Do not confuse with**

- Actual removal from the array — elements are never removed immediately; they are flagged and pruned after 24h
- `locked` — locked elements cannot be selected/edited but are not deleted

---

## Library / LibraryItem

**Definition in this project** The Library is a user-curated collection of reusable element sets. Each `LibraryItem` is a named, timestamped group of `NonDeleted<ExcalidrawElement>[]` with a `status` of `"published"` (shared to the public library) or `"unpublished"` (local only). The `Library` class manages loading, saving (to `localStorage`), and updating the collection. Items are inserted into the scene as duplicated elements with new IDs and seeds.

**Where it is used**

- Type definitions: `packages/excalidraw/types.ts:522–538`
- `ExcalidrawProps.onLibraryChange` callback: `packages/excalidraw/types.ts:640`
- `ExcalidrawImperativeAPI.updateLibrary` for programmatic updates
- Persisted via `idb-keyval` (IndexedDB) in `excalidraw-app`

**Do not confuse with**

- The `@excalidraw/excalidraw` npm package itself (also called "the library") — in domain terms, Library refers specifically to the saved-shapes panel
- `LibraryItems_v1` — the legacy format (`readonly ExcalidrawElement[][]`) still accepted for backwards compatibility

---

## polygon

**Definition in this project** A boolean field on `ExcalidrawLineElement` (`type: "line"`) that, when `true`, causes the line's last point to be connected back to its first point, rendering the element as a closed polygon. The field is set to `true` automatically when a line is closed by the user (first and last points overlap) or when a background color is applied to an open line.

**Where it is used**

- Field: `packages/element/src/types.ts:346`
- Restore logic in `packages/excalidraw/data/restore.ts:457–458`

**Do not confuse with**

- SVG `<polygon>` element — this is a flag on Excalidraw's line element type, not an SVG concept
- `ExcalidrawArrowElement` — arrows cannot be polygons; `polygon` is only on `ExcalidrawLineElement`

---

## roughness

**Definition in this project** A numeric property on every `ExcalidrawElement` controlling how "sketchy" the rendered shape appears (passed to roughjs as `roughness`). The stored value is the user-set preference. At render time, `adjustRoughness()` silently scales the value down for small elements: divided by 3 if `maxSize < 10 px`, divided by 2 for other small shapes, capped at 2.5. The element's stored `.roughness` is never mutated by this adjustment.

**Where it is used**

- Field: `packages/element/src/types.ts:50`
- Render-time adjustment: `packages/element/src/shape.ts:170–191` (`adjustRoughness()`)
- Controlled via `currentItemRoughness` in `AppState`

**Do not confuse with**

- The stored value vs. the rendered value — they differ for small elements; see `adjustRoughness`
- `seed` — seed controls which specific rough strokes are drawn; roughness controls their amplitude

---

## Scene

**Definition in this project** The `Scene` class is the in-memory container for all `ExcalidrawElement` objects for a single editor instance. It maintains both the full element array (including deleted elements) and a filtered `nonDeletedElements` list for rendering, as well as `Map`-based lookups by element ID. It emits a `sceneNonce` (random integer) on each update for renderer cache invalidation. A single `Scene` instance lives inside `App` for the lifetime of the editor.

**Where it is used**

- Class definition: `packages/element/src/Scene.ts:108`
- Key methods: `getElementsIncludingDeleted()`, `getNonDeletedElements()`, `getNonDeletedElementsMap()`, `getFramesIncludingDeleted()`
- Exported from `packages/element/src/index.ts`

**Do not confuse with**

- `SceneData` — a plain data transfer object (`{ elements?, appState?, collaborators?, captureUpdate? }`) used as the argument to `updateScene`; it is not the `Scene` class
- The word "scene" in general drawing/3D contexts — here it refers specifically to the `Scene` class instance managing the element store

---

## SceneData

**Definition in this project** A plain data object used as the argument to `App.updateScene` and `ExcalidrawImperativeAPI.updateScene`. It carries optional fields: `elements` (new element array), `appState` (partial AppState override), `collaborators` (updated collaborator map), and `captureUpdate` (undo-history capture flag). It is a one-way data transfer object, not a persistent entity.

**Where it is used**

- Type definition: `packages/excalidraw/types.ts:702`
- Passed to `updateScene` in `App.tsx` and via `ExcalidrawImperativeAPI`
- Used by the collab layer to apply incoming remote changes

**Do not confuse with**

- `Scene` (the class) — `SceneData` is an input DTO, not the live scene container
- `ExcalidrawInitialDataState` — the shape used for `initialData` prop on first load

---

## seed

**Definition in this project** A random integer stored on every `ExcalidrawElement` that is passed to roughjs as the shape-generation seed. It ensures a specific element's sketchy strokes remain visually stable across re-renders. When an element is duplicated via `Ctrl+V` (plain paste), `randomizeSeed` assigns a new `seed` so the copy has different jitter. When duplicated via `Ctrl+Shift+V`, the seed is preserved and the copy is visually identical.

**Where it is used**

- Field: `packages/element/src/types.ts:57` (with JSDoc: "Random integer used to seed shape generation so that the roughjs shape doesn't differ across renders")
- Randomization: `packages/element/src/duplicate.ts:65–76`
- Module-level flag controlling seed behavior: `packages/excalidraw/components/App.tsx:605` (`IS_PLAIN_PASTE`)

**Do not confuse with**

- `versionNonce` — also a random integer, but used for collaboration conflict resolution, not rendering
- `roughness` — roughness controls stroke amplitude; seed controls which specific strokes are drawn

---

## Tool / ToolType

**Definition in this project** The currently active interaction mode of the editor. Controlled by `AppState.activeTool`. `ToolType` is the union of all 16 valid tool names; `TOOL_TYPE` is the corresponding constant object. Each tool determines how pointer events are interpreted on the canvas. The `activeTool` also tracks `lastActiveTool` (for reverting from eraser/hand), a `locked` flag (tool stays selected after drawing), and a `fromSelection` flag (tool was temporarily switched from the selection tool).

**Where it is used**

- `ToolType` union: `packages/excalidraw/types.ts:143–160`
- `TOOL_TYPE` constant: `packages/common/src/constants.ts:447–464` (16 entries: `selection`, `lasso`, `rectangle`, `diamond`, `ellipse`, `arrow`, `line`, `freedraw`, `text`, `image`, `eraser`, `hand`, `frame`, `magicframe`, `embeddable`, `laser`)
- `AppState.activeTool` shape: `packages/excalidraw/types.ts:332–341`

**Do not confuse with**

- `Action` — a tool is a persistent mode; an action is a discrete command. Selecting a tool sets `activeTool`; actions do not
- `selection` tool vs. `lasso` tool — both are selection modes; `preferredSelectionTool` in `AppState` tracks user preference between them

---

## version

**Definition in this project** A sequentially incrementing integer on every `ExcalidrawElement`. Incremented by `mutateElement` on each change. Used during collaboration reconciliation as the primary signal that a remote change is newer: if `remote.version > local.version`, the remote element takes precedence. When versions are equal, `versionNonce` is the tiebreaker.

**Where it is used**

- Field: `packages/element/src/types.ts:60` (with JSDoc)
- Reconciliation: `packages/excalidraw/data/reconcile.ts:35`
- History explicitly excludes `version` and `versionNonce` when applying undo/redo deltas so that each undo is treated as a new user action: `packages/excalidraw/history.ts:32–33`

**Do not confuse with**

- Package/semver version numbers (e.g., `0.18.0`)
- `versionNonce` — the tiebreaker; `version` is the primary ordering key

---

## versionNonce

**Definition in this project** A random integer regenerated on every change to an `ExcalidrawElement`. When two collaborators produce edits that result in identical `version` numbers, `versionNonce` provides a deterministic tiebreak: the element with the **lower** nonce is kept (i.e., `shouldDiscardRemoteElement` returns `true` when `local.versionNonce <= remote.versionNonce`). Since nonces are random, neither client has a systematic advantage.

**Where it is used**

- Field: `packages/element/src/types.ts:64` (with JSDoc)
- Tiebreak logic: `packages/excalidraw/data/reconcile.ts:37–39`

**Do not confuse with**

- `sceneNonce` in `Scene` — the scene nonce is a renderer cache-invalidation signal, not an element property
- `seed` — seed is for roughjs rendering; versionNonce is for collaboration conflict resolution
- Higher = wins — the **lower** nonce wins; the code keeps the local element when `local.versionNonce <= remote.versionNonce`

---

## viewModeEnabled

**Definition in this project** A boolean in both `AppState` and `ExcalidrawProps` that puts the editor into a read-only presentation mode. In view mode, elements cannot be created or edited, and most toolbar actions are hidden or disabled. The `Action.viewMode` field (defaults to `false`) explicitly opts individual actions into being available in view mode.

**Where it is used**

- `AppState.viewModeEnabled`: `packages/excalidraw/types.ts:422`
- Prop: `ExcalidrawProps.viewModeEnabled` (`packages/excalidraw/types.ts:625`)
- `Action.viewMode` opt-in: `packages/excalidraw/actions/types.ts:217`
- Intended to be used with `ExcalidrawImperativeAPI.updateFrameRendering` to disable frames in read-only embeds

**Do not confuse with**

- `zenModeEnabled` — zen mode hides UI chrome but still allows editing
- `gridModeEnabled` — grid snapping; unrelated to edit permissions

---

## Source Evidence

All definitions above are based on the following files, read directly during this session:

| Claim | Source |
| --- | --- |
| `ExcalidrawElement` union definition | `packages/element/src/types.ts:206` |
| `_ExcalidrawElementBase` fields | `packages/element/src/types.ts:40–82` |
| `ExcalidrawLineElement.polygon` | `packages/element/src/types.ts:346` |
| `ExcalidrawFrameElement`, `ExcalidrawMagicFrameElement` | `packages/element/src/types.ts:163–175` |
| `ExcalidrawBindableElement` union | `packages/element/src/types.ts:259–268` |
| `FillStyle` values | `packages/element/src/types.ts:19` |
| `FractionalIndex` brand type | `packages/element/src/types.ts:33` |
| `index` field with JSDoc | `packages/element/src/types.ts:65–69` |
| `seed` field with JSDoc | `packages/element/src/types.ts:55–57` |
| `version` field with JSDoc | `packages/element/src/types.ts:58–60` |
| `versionNonce` field with JSDoc | `packages/element/src/types.ts:61–64` |
| `isDeleted` field | `packages/element/src/types.ts:70` |
| `groupIds` field | `packages/element/src/types.ts:71–73` |
| `AppState` interface | `packages/excalidraw/types.ts:272` |
| `AppState.activeTool` shape | `packages/excalidraw/types.ts:332–341` |
| `AppState.zenModeEnabled`, `gridModeEnabled`, `viewModeEnabled` | `packages/excalidraw/types.ts:416–422` |
| `AppState.selectedGroupIds`, `editingGroupId` | `packages/excalidraw/types.ts:425–428` |
| `ToolType` union | `packages/excalidraw/types.ts:143–160` |
| `TOOL_TYPE` constant (16 entries) | `packages/common/src/constants.ts:447–464` |
| `SceneData` type | `packages/excalidraw/types.ts:702–707` |
| `Collaborator` type | `packages/excalidraw/types.ts:70–90` |
| `SocketId` brand type | `packages/excalidraw/types.ts:68` |
| `BinaryFileData`, `BinaryFiles` types | `packages/excalidraw/types.ts:113–141` |
| `LibraryItem`, `LibraryItems` types | `packages/excalidraw/types.ts:522–538` |
| `ExcalidrawProps` interface | `packages/excalidraw/types.ts:560–639` |
| `ExcalidrawProps.viewModeEnabled` | `packages/excalidraw/types.ts:625` |
| `ExcalidrawImperativeAPI` interface | `packages/excalidraw/types.ts:917–966` |
| `Action` interface | `packages/excalidraw/actions/types.ts:162` |
| `ActionName` union | `packages/excalidraw/actions/types.ts:45–147` |
| `ActionSource` type | `packages/excalidraw/actions/types.ts:17–22` |
| `Action.viewMode` opt-in | `packages/excalidraw/actions/types.ts:217` |
| `Scene` class | `packages/element/src/Scene.ts:108` |
| `Scene.sceneNonce` with JSDoc | `packages/element/src/Scene.ts:135–141` |
| `shouldDiscardRemoteElement` + versionNonce tiebreak | `packages/excalidraw/data/reconcile.ts:23–44` |
| `DurableIncrement`, `EphemeralIncrement` classes | `packages/element/src/store.ts:476–492` |
| `Store.onDurableIncrementEmitter` | `packages/element/src/store.ts:80–84` |
| `HistoryDelta` class + version exclusion | `packages/excalidraw/history.ts:15–46` |
| `History` class | `packages/excalidraw/history.ts:90` |
| `adjustRoughness()` thresholds | `packages/element/src/shape.ts:170–191` |
| `IS_PLAIN_PASTE` module variable | `packages/excalidraw/components/App.tsx:605` |
| `randomizeSeed` in `duplicate.ts` | `packages/element/src/duplicate.ts:65–76` |
| `DELETED_ELEMENT_TIMEOUT` constant | `excalidraw-app/app_constants.ts:9` |
| `isSyncableElement` retention logic | `excalidraw-app/data/index.ts:46–55` |
| `EXCALIDRAW_ASSET_PATH` type declaration | `packages/excalidraw/global.d.ts:4` |
| `EXCALIDRAW_ASSET_PATH` array handling | `packages/excalidraw/fonts/ExcalidrawFontFace.ts:153–163` |
| AES-GCM encryption functions | `packages/excalidraw/data/encryption.ts:12–90` |
| `autoFocus = false` default | `packages/excalidraw/index.tsx:87` |
