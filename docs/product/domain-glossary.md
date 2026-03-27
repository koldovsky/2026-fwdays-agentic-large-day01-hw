# Domain glossary (Excalidraw monorepo)

Definitions below follow **this codebase**. Types are cited from `packages/excalidraw` and `packages/element` unless noted.

---

## Action

**In this project:** A named editor command object with a `perform` function that receives the current **ordered** elements (`readonly OrderedExcalidrawElement[]`), `Readonly<AppState>`, optional `formData` payload, and an `AppClassProperties` reference, and returns an **`ActionResult`** (element/appState patches, file payloads, and a `captureUpdate` flag for undo semantics). Actions are registered on **`ActionManager`** and triggered from UI, keyboard shortcuts, the command palette, or APIs (`packages/excalidraw/actions/types.ts` `Action`, `packages/excalidraw/actions/manager.tsx`).

**Where:** `packages/excalidraw/actions/` (e.g. `register.ts`, individual `action*.ts` files), `packages/excalidraw/actions/manager.tsx`, `packages/excalidraw/components/App.tsx` (constructor registers `actions` + undo/redo).

**Do not confuse with:** Generic “user action” in UX, Redux actions, or browser `Action` APIs — here it is a **typed command object** with `ActionName` and optional `PanelComponent` / `keyTest`.

---

## AppState

**In this project:** The large **React state** interface for the editor shell: tools, selection, viewport (`scrollX`, `scrollY`, `zoom`), theme, dialogs, collaboration maps, transient drawing state (`newElement`, `selectionElement`, …), grid, export settings, layout offsets, and more. Initialized via **`getDefaultAppState()`** and merged in **`App`** (`packages/excalidraw/appState.ts`, `packages/excalidraw/types.ts` `export interface AppState`).

**Where:** `packages/excalidraw/types.ts`, `packages/excalidraw/appState.ts`, `packages/excalidraw/components/App.tsx`.

**Do not confuse with:** The **scene document** (elements) — `AppState` does **not** own the canonical element list; that lives on **`Scene`**. Also not the same as **`ObservedAppState`** / store snapshots used for undo (`packages/excalidraw/types.ts`, `packages/element/src/store.ts`).

---

## BinaryFiles

**In this project:** A record holding **`BinaryFileData`** (image bytes as `dataURL`, `mimeType`, `FileId`, timestamps) for embedded images. The TypeScript definition is `Record<ExcalidrawElement["id"], BinaryFileData>` (key type resolves to `string`), but at runtime the record is **keyed by `FileId`** — multiple image elements can share the same file (`packages/excalidraw/types.ts` `BinaryFiles`, `BinaryFileData`; see `addMissingFiles` in `App.tsx` which indexes by `fileData.id`).

**Where:** `packages/excalidraw/types.ts`; loaded/merged via scene restore and **`syncActionResult`** when `ActionResult.files` is set (`packages/excalidraw/components/App.tsx`).

**Do not confuse with:** OS file handles — though **`AppState.fileHandle`** exists for the File System Access API, **`BinaryFiles`** is in-memory / persisted scene data for images.

---

## Collaboration (live)

**In this project:** Real-time multi-user editing in the **app shell**: remote elements are reconciled (`reconcileElements`, `restoreElements`, version bumps) and **`AppState.collaborators`** holds **`Map<SocketId, Collaborator>`** for cursors, selection, and presence (`packages/excalidraw/types.ts` `AppState.collaborators`, `Collaborator`).

**Where:** `excalidraw-app/collab/Collab.tsx` (imports from `@excalidraw/excalidraw` and element packages); rendering of remote pointers uses **`InteractiveCanvas`** (`packages/excalidraw/components/canvases/InteractiveCanvas.tsx`).

**Do not confuse with:** “Collaborative” in marketing copy only — in code it is **socket-backed presence + merged scene updates**, not comments or Git collaboration.

---

## Collaborator

**In this project:** A **readonly** descriptor for one remote participant: optional **`pointer`** (`CollaboratorPointer` with `x`, `y`, `tool`, laser options), **`selectedElementIds`**, **`username`**, colors, avatar, idle state, call flags (`packages/excalidraw/types.ts` `Collaborator`).

**Where:** `packages/excalidraw/types.ts`; consumed when building **`InteractiveSceneRenderConfig`** in `InteractiveCanvas` (`packages/excalidraw/components/canvases/InteractiveCanvas.tsx`).

**Do not confuse with:** A database user row — it is **ephemeral session state** keyed by **`SocketId`**.

---

## Element (Excalidraw domain)

**In this project:** Usually means **`ExcalidrawElement`** — one drawable or structural item on the canvas (rectangle, text, arrow, image, frame, …). The base shape includes `id`, geometry, style, **`version`** / **`versionNonce`** for sync, **`index`** (fractional ordering), **`isDeleted`**, `groupIds`, `frameId`, bindings, etc. (`packages/element/src/types.ts` `_ExcalidrawElementBase`, `ExcalidrawElement`).

**Where:** `packages/element/src/types.ts`, `packages/element/src/*.ts` (mutations, hit-testing), `packages/excalidraw/components/App.tsx`.

**Do not confuse with:** A DOM element or React element — in docs, “element” without qualification in editor code refers to **canvas elements**.

---

## ExcalidrawElement

**In this project:** The **discriminated union** of all on-canvas entity types (generic shapes, text, linear elements, arrows, freedraw, image, frame, magic frame, iframe, embeddable). Documented as **JSON-serializable** and intended to be **shareable between peers** without peer-local state (`packages/element/src/types.ts` comment on `ExcalidrawElement`).

**Where:** `packages/element/src/types.ts` `export type ExcalidrawElement = ...`.

**Do not confuse with:** **`ExcalidrawElementType`** — that name refers to the **`type` field** discriminator string union (`packages/element/src/types.ts` `ExcalidrawElementType`).

---

## FileId

**In this project:** A **branded string** identifying binary image data linked to **image elements** (`packages/element/src/types.ts` `FileId`).

**Where:** `ExcalidrawImageElement.fileId`, `BinaryFileData.id`, `packages/element/src/types.ts`.

**Do not confuse with:** Node `fileId` in other ecosystems — here it is **scene/binary-store identity** for raster data.

---

## Library (shape library)

**In this project:** A **persisted collection of reusable drawings**: **`LibraryItems`** is a readonly list of **`LibraryItem`**, each with `id`, `status` (`published` | `unpublished`), `elements` (non-deleted `ExcalidrawElement`s), `created`, optional `name` / `error` (`packages/excalidraw/types.ts`). Legacy v1 shape is deprecated (`LibraryItem_v1`). The **`Library`** class handles load/save, adapters, and change events (`packages/excalidraw/data/library.ts`).

**Where:** `packages/excalidraw/types.ts` (`LibraryItem`, `LibraryItems`), `packages/excalidraw/data/library.ts`, UI hooks like `packages/excalidraw/hooks/useLibraryItemSvg.ts`.

**Do not confuse with:** npm package **library**, code “standard library,” or the **toolbar shape library** as a UI panel name only — the type **`LibraryItem`** is the **data model** for one stencil group.

---

## Scene

**In this project:** The **`Scene`** class holds the **ordered list of elements**, maps (`elementsMap`, `nonDeletedElementsMap`), frame lists, selection caches, and **`sceneNonce`** for render invalidation. Updates go through **`replaceAllElements`** → **`triggerUpdate()`** (`packages/element/src/Scene.ts`).

**Where:** `packages/element/src/Scene.ts`; `packages/excalidraw/components/App.tsx` (`this.scene = new Scene()`).

**Do not confuse with:** “Scene” in 3D engines or a single **frame** element — here **`Scene` is the whole document model** for the editor.

---

## SocketId

**In this project:** A **branded string** identifying a realtime connection / collaborator slot (`packages/excalidraw/types.ts` `SocketId`).

**Where:** Keys in `AppState.collaborators` (`Map<SocketId, Collaborator>`).

**Do not confuse with:** TCP socket handles — it is an **application-level id** for collab clients.

---

## Tool / ToolType / ActiveTool

**In this project:** **`ToolType`** is the string union of editor tools: `selection`, `lasso`, `rectangle`, `diamond`, `ellipse`, `arrow`, `line`, `freedraw`, `text`, `image`, `eraser`, `hand`, `frame`, `magicframe`, `embeddable`, `laser` (complete list). **`ActiveTool`** is either `{ type: ToolType; customType: null }` or `{ type: "custom"; customType: string }` (`packages/excalidraw/types.ts`). In `AppState`, `activeTool` extends `ActiveTool` with `lastActiveTool`, `locked`, and `fromSelection` fields.

**Where:** `packages/excalidraw/types.ts`; pointer routing in `packages/excalidraw/components/App.tsx`.

**Do not confuse with:** OS “tools” or build tools — here **tool = drawing mode** only.

---

## ActionManager

**In this project:** Class that **registers** `Action` instances, runs **`perform`**, routes **keyboard** shortcuts (`handleKeyDown`), renders **`PanelComponent`** for toolbar UI (`renderAction`), and calls the **`updater`** (`syncActionResult`) with **`ActionResult`** (`packages/excalidraw/actions/manager.tsx`).

**Where:** `packages/excalidraw/actions/manager.tsx`, `packages/excalidraw/components/App.tsx` (construction and `registerAll`).

**Do not confuse with:** Redux middleware or browser extension managers — it is **Excalidraw’s command bus**.

---

## ActionResult

**In this project:** The return type of **`action.perform`**: either **`false`** (abort) or an object with optional **`elements`**, **`appState`**, **`files`**, **`replaceFiles`**, and required **`captureUpdate`** (typed as **`CaptureUpdateActionType`** — `ValueOf<typeof CaptureUpdateAction>` from `packages/element/src/store.ts`) (`packages/excalidraw/actions/types.ts`).

**Where:** `packages/excalidraw/actions/types.ts`; consumed in `packages/excalidraw/components/App.tsx` `syncActionResult`.

**Do not confuse with:** Promise result or HTTP response — it is **structured editor patch metadata**.

---

## Store (editor Store)

**In this project:** **`Store`** captures **observed** app + element changes, schedules **macro/micro** capture actions, emits **`onStoreIncrementEmitter`**, and feeds **`History`** for undo/redo (`packages/element/src/store.ts`).

**Where:** `packages/element/src/store.ts`, `packages/excalidraw/components/App.tsx` (`new Store(this)`), `packages/excalidraw/history.ts`.

**Do not confuse with:** Redux/Zustand store — the class is named **`Store`** in this repo and is **paired with `History`**.

---

## Renderer

**In this project:** **`Renderer`** wraps a **`Scene`** and exposes **`getRenderableElements`**, which combines viewport visibility and **renderable** element maps (e.g. skipping text currently being edited) for canvas passes (`packages/excalidraw/scene/Renderer.ts`).

**Where:** `packages/excalidraw/scene/Renderer.ts`, `packages/excalidraw/components/App.tsx` (`this.renderer = new Renderer(this.scene)`).

**Do not confuse with:** React reconciler — this **`Renderer`** is **canvas pre-pass logic** for the static/interactive layers.

---

## Frame (element)

**In this project:** **`ExcalidrawFrameElement`** / **`ExcalidrawMagicFrameElement`** (`type: "frame"` | `"magicframe"`) — container elements with optional name, used for grouping and clipping (`packages/element/src/types.ts`). **`ExcalidrawFrameLikeElement`** is the union of those.

**Where:** `packages/element/src/types.ts`, frame helpers under `packages/element/src/frame.ts` (imported from `@excalidraw/element`).

**Do not confuse with:** A single animation **frame** or **stack frame** — here it is a **canvas container element**.

---

## Reconciliation

**In this project:** Merging **remote** element updates with local state using version / nonce rules (`reconcileElements` exported from `@excalidraw/excalidraw` and used from collab code). Related types include **`RemoteExcalidrawElement`** / **`ReconciledExcalidrawElement`** in `packages/excalidraw/data/reconcile` (see imports in `excalidraw-app/collab/Collab.tsx`).

**Where:** `excalidraw-app/collab/Collab.tsx`, `packages/excalidraw/data/reconcile.ts` (as referenced by imports).

**Do not confuse with:** React reconciliation — this is **CRDT-style element merge** for collaboration.

---

*Terms and file paths reflect the repository layout at authoring time; use Go to Definition in the IDE for the latest symbols.*
