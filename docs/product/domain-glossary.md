# Domain glossary (Excalidraw monorepo)

Term names match **the code** (TypeScript, class names). Definitions apply to **this repository**, not generic textbooks.

Template for each entry: **Definition** → **Where it is used** → **Do not confuse with**.

---

## ExcalidrawElement

- **Definition:** A **discriminated union** of on-canvas shape types: rectangle, diamond, ellipse, text, line, arrow, freedraw, image, frame, magic frame, iframe, embeddable, etc. Each record holds geometry, style, `version` / `versionNonce`, optional `index` (fractional ordering), `groupIds`, `frameId`, arrow bindings, `isDeleted`. The type comment states the structure must stay **JSON-serializable** and **suitable for peer exchange** (no fields local to a single client).
- **Where it is used:** `packages/element/src/types.ts` (`export type ExcalidrawElement`); then `packages/excalidraw/components/App.tsx`, `data/restore`, `data/reconcile`, `actions/*`, renderers.
- **Do not confuse with:** a DOM node; casual “UI element”; prose “element” without context often means a **scene record** of this type.

---

## Element (informal)

- **Definition:** Informal name for **one** entity of type **`ExcalidrawElement`** or a narrower subtype (e.g. `ExcalidrawTextElement`). Plural **elements** in code means **arrays or maps** of such records (`readonly ExcalidrawElement[]`, `ElementsMap`).
- **Where it is used:** Throughout `packages/element` and `packages/excalidraw` (`elements` parameters, `ActionResult.elements`).
- **Do not confuse with:** a **React element** (`React.ReactElement`); an **HTML element**.

---

## OrderedExcalidrawElement

- **Definition:** An `ExcalidrawElement` that **must** have `index: FractionalIndex` (unbranded `null` is no longer allowed at the type level). Used where z-order is fixed for multiplayer and undo.
- **Where it is used:** `packages/element/src/types.ts`; `Action` / `App` chains; `packages/excalidraw/data/reconcile.ts` (`RemoteExcalidrawElement`, `ReconciledExcalidrawElement`).
- **Do not confuse with:** Draft elements whose `index` is still **`null`** (newly created before sync—see `_ExcalidrawElementBase` in `types.ts`).

---

## Scene

- **Definition:** The **`Scene`** class from `@excalidraw/element` that **owns the canonical element list** for one editor: full list including deleted (`getElementsIncludingDeleted`), id → element map, derived non-deleted structures, frames, selection cache, **`sceneNonce`** (random int after updates to invalidate render cache). Updates via **`replaceAllElements`**, **`mapElements`**, **`triggerUpdate`**, **`onUpdate`** subscriptions.
- **Where it is used:** `packages/element/src/Scene.ts`; `packages/excalidraw/components/App.tsx` (`this.scene = new Scene()`); `packages/excalidraw/scene/Renderer.ts`.
- **Do not confuse with:** a 3D “scene”; only the **viewport-visible** area; a **saved file** or **collaboration room**—those are product layers on top of elements + `AppState`.

---

## AppState

- **Definition:** The **`AppState`** interface is **React state** on the **`App`** class: transient UI and interaction state (`this.state`): active tool, **`selectedElementIds`** and other selection state, open menus/dialogs, scroll/zoom, pointer-driven fields (`newElement`, `resizingElement`, `selectionElement`, …), **`collaborators`**, export settings, theme, etc. **The scene’s shape list does not live here**—it lives in **`Scene`**.
- **Where it is used:** `packages/excalidraw/types.ts` (`export interface AppState`); `packages/excalidraw/appState.ts` (`getDefaultAppState`); `packages/excalidraw/components/App.tsx`; **`ExcalidrawAppStateContext`**, **`ExcalidrawSetAppStateContext`**.
- **Do not confuse with:** **`StaticCanvasAppState`** / **`InteractiveCanvasAppState`**—those are **subsets** for render layers; “app state” in Redux in other projects; similarly named types in other frameworks.

---

## Tool / ActiveTool / ToolType

- **Definition:** **`ToolType`** is a string union of editor modes: `selection`, `lasso`, shapes, `arrow`, `line`, `freedraw`, `text`, `image`, `eraser`, `hand`, `frame`, `magicframe`, `embeddable`, `laser`, etc. **`ActiveTool`** is either `{ type: ToolType; customType: null }` or custom `{ type: "custom"; customType: string }`. **`AppState.activeTool`** adds `lastActiveTool`, `locked`, `fromSelection`. **`ExcalidrawElementType`** is the **`type`** field on a **stored element**; names overlap with some tools but **semantics differ** (user tool vs persisted shape type).
- **Where it is used:** `packages/excalidraw/types.ts`; toolbar and input handling in `App.tsx`.
- **Do not confuse with:** DevTools; build “tooling”; **`ExcalidrawElement["type"]`** alone without the **active tool** role.

---

## Action

- **Definition:** An **`Action`** object registered with **`ActionManager`**: **`name`** from the **`ActionName`** union, **`perform(elements, appState, formData, app)`** returns **`ActionResult`** (or `Promise`), optionally **`keyTest`**, **`PanelComponent`**, **`predicate`**, **`viewMode`**, **`trackEvent`**. Base actions are accumulated by **`register()`** in `actions/register.ts`; **`App`** calls **`registerAll(actions)`** in the constructor and wires undo/redo.
- **Where it is used:** `packages/excalidraw/actions/types.ts`, `manager.tsx`, `packages/excalidraw/actions/*.tsx`; **`App.syncActionResult`** is passed as `updater`.
- **Do not confuse with:** a Redux action; an HTTP “action”; an OS action—here it is an **editor command** (command pattern).

---

## ActionResult

- **Definition:** The result of **`perform`**: either **`false`**, or an object with optional **`elements`**, **`appState`**, **`files`**, required **`captureUpdate`** (type **`CaptureUpdateAction`** from `@excalidraw/element`: `IMMEDIATELY` | `NEVER` | `EVENTUALLY`), optional **`replaceFiles`**. Then handled by **`App.syncActionResult`**.
- **Where it is used:** `packages/excalidraw/actions/types.ts`; `packages/excalidraw/components/App.tsx`.
- **Do not confuse with:** an HTTP response “result”; some unrelated `actionResult` variable elsewhere.

---

## ActionManager

- **Definition:** Class with **`actions`**, **`executeAction`**, **`handleKeyDown`**, **`renderAction`**. Forwards **`perform`** results to **`updater`** (in **`App`**, **`syncActionResult`**). Logs a warning when multiple shortcuts match.
- **Where it is used:** `packages/excalidraw/actions/manager.tsx`; constructed in the `App` constructor.
- **Do not confuse with:** a React Context “manager”; an HTTP router.

---

## Store (element package)

- **Definition:** **`Store`** class in `@excalidraw/element`, tied to an **`App`** instance: schedules macro/micro capture actions, builds **`StoreChange`** / **`StoreSnapshot`**, on **`commit`** emits increments for **`History`**. **`CaptureUpdateAction`** semantics are documented in `store.ts` (what enters undo immediately, never, or later).
- **Where it is used:** `packages/element/src/store.ts`; `App.tsx` (`new Store(this)`); **`componentDidUpdate`** → **`this.store.commit(...)`**.
- **Do not confuse with:** Redux store; Jotai **`createStore`** in `excalidraw-app/app-jotai.ts` or `editor-jotai.ts`.

---

## History / HistoryDelta

- **Definition:** **`History`** holds undo/redo stacks of **`HistoryDelta`** objects (subclass of **`StoreDelta`**). Applying a delta updates both the element map and **`AppState`**; **`HistoryDelta.applyTo`** disables updating **`version`** / **`versionNonce`** when replaying for history so collaboration is not broken.
- **Where it is used:** `packages/excalidraw/history.ts`; `App.tsx` (`new History(this.store)`).
- **Do not confuse with:** the browser History API; Git commit history.

---

## Library / LibraryItem / LibraryItems

- **Definition:** **`Library`** class in `data/library.ts` (**`LibraryPersistenceAdapter`**, update emitters, allowlist domains for loading libraries). **`LibraryItem`** (v2): `{ id, status: "published"|"unpublished", elements: readonly NonDeleted<ExcalidrawElement>[], created, name?, error? }`. **`LibraryItems`** is a readonly array of those. Legacy **v1** is a flat element array (**`LibraryItem_v1`**, migrations only). **`LibraryPersistedData`** holds `libraryItems`.
- **Where it is used:** `packages/excalidraw/types.ts`; `packages/excalidraw/data/library.ts`; `App.tsx`—**`new Library(this)`**; **`onLibraryChange`** prop.
- **Do not confuse with:** an npm “library”; a folder on disk; only the UI tab—the types are still **`LibraryItem`**.

---

## Collaboration / Collaborator / Collab

- **Definition:** **`Collaborator`** in `types.ts` is metadata for a **remote participant**: pointer, button, **`selectedElementIds`**, name, idle state, colors, avatar, **`socketId`**, audio state, etc. **`AppState.collaborators`** is a **`Map`** of these. **`Collab`** in the product is the React module in **`excalidraw-app/collab/Collab.tsx`** (sockets, scene merge), not a synonym for the **`Collaborator`** type.
- **Where it is used:** `packages/excalidraw/types.ts`; `excalidraw-app/collab/Collab.tsx`; `data/reconcile.ts` (`reconcileElements`, `RemoteExcalidrawElement`).
- **Do not confuse with:** abstract “OT” without **`version` / `versionNonce` / fractional index**; casual “collab” vs the **`Collab`** component identifier.

---

## reconcile / ReconciledExcalidrawElement

- **Definition:** Merging **local** and **remote** ordered elements; **`shouldDiscardRemoteElement`** drops remote updates when local edit/resize/create is in progress, or local version is newer / on equal **`version`** the smaller **`versionNonce`** wins. **`RemoteExcalidrawElement`** and **`ReconciledExcalidrawElement`** are branded types produced by this logic.
- **Where it is used:** `packages/excalidraw/data/reconcile.ts`; imports from **`excalidraw-app`** collab and **`App`**.
- **Do not confuse with:** database or accounting reconciliation.

---

## BinaryFiles / FileId

- **Definition:** **`FileId`** is a branded string id for a binary resource (usually an image). **`BinaryFileData`**: `mimeType`, `id`, `dataURL`, `created`, optional `lastRetrieved`, `version`. In **`types.ts`**, **`BinaryFiles`** is **`Record<ExcalidrawElement["id"], BinaryFileData>`**—keys are tied to **element id** at the type level. **`ExcalidrawImageElement`** references a file via **`fileId`**.
- **Where it is used:** `packages/excalidraw/types.ts`; `App.tsx`—**`public files: BinaryFiles`**; `ActionResult.files`; `data/blob` and related modules.
- **Do not confuse with:** **`File`** objects from the File API stuffed directly into scene JSON; here **ids + metadata** live in a separate structure.

---

## App (editor class)

- **Definition:** **`class App`** is a large **React class component** for the editor: owns **`scene`**, **`store`**, **`history`**, **`actionManager`**, **`renderer`**, canvas layers, **`syncActionResult`**, lifecycle and input handlers. Exported from **`App.tsx`**, wrapped by **`Excalidraw`** in **`index.tsx`**.
- **Where it is used:** `packages/excalidraw/components/App.tsx`; **`Store`** constructor types a reference to `@excalidraw/excalidraw/components/App`.
- **Do not confuse with:** **`excalidraw-app/App.tsx`** (product shell); the functional **`Excalidraw`** wrapper; “app” meaning a mobile application.

---

## ExcalidrawImperativeAPI

- **Definition:** Imperative API for embedders: update scene, files, scroll, selection, etc. Created in **`App`** via **`createExcalidrawAPI`**, exposed through **`ExcalidrawAPIProvider`** / **`useExcalidrawAPI`**.
- **Where it is used:** `packages/excalidraw/types.ts`; `App.tsx`; `packages/excalidraw/index.tsx`.
- **Do not confuse with:** a REST API; **fetch** as “network API”.

---

## Renderer (scene package)

- **Definition:** **`Renderer`** class in `scene/Renderer.ts`: memoizes which elements **participate in rendering** and are **visible in the viewport** (`isElementInViewport`), builds **`RenderableElementsMap`**; may skip ids for **in-progress** new elements and text in **edit mode**.
- **Where it is used:** `packages/excalidraw/scene/Renderer.ts`; `App.tsx` (`new Renderer(this.scene)`).
- **Do not confuse with:** the React reconciler; generic browser “rendering”.

---

## renderStaticScene / renderInteractiveScene / renderNewElementScene

- **Definition:** Functions that **paint** on **`HTMLCanvasElement`**: static layer (grid + most shapes via **`renderElement`** from `@excalidraw/element`), interactive layer (selection chrome, remote cursors, etc.), separate path for an **incomplete** element during a gesture. Called from **`StaticCanvas`**, **`InteractiveCanvas`**, **`NewElementCanvas`**.
- **Where it is used:** `packages/excalidraw/renderer/staticScene.ts`, `interactiveScene.ts`, `renderNewElementScene.ts`; `packages/excalidraw/components/canvases/*.tsx`.
- **Do not confuse with:** **SVG** export (`staticSvgScene`, etc.); React **SSR**.

---

## sceneNonce

- **Definition:** Random integer on **`Scene`**, updated in **`triggerUpdate`**. The comment in **`Scene`** states it is **not** tied to element **`version`**, only **render cache invalidation**.
- **Where it is used:** `packages/element/src/Scene.ts`; **`sceneNonce`** prop on `StaticCanvas.tsx` and similar.
- **Do not confuse with:** a cryptographic nonce; element **`versionNonce`**.

---

## BoundElement

- **Definition:** A **lightweight reference record** stored in every `_ExcalidrawElementBase.boundElements` array: `Readonly<{ id: ExcalidrawLinearElement["id"]; type: "arrow" | "text" }>`. It points **from a shape to an attached arrow or text label** — not the other way around. The arrow or text element holds a mirrored back-reference (`startBinding` / `endBinding` for arrows; `containerId` for bound text). The field is `null` when nothing is attached.
- **Where it is used:** `packages/element/src/types.ts` (lines 35–38, 76); `packages/element/src/binding.ts` (reads/writes `boundElements` when arrows are attached or detached); `packages/element/src/textElement.ts` (manages bound text labels).
- **Do not confuse with:** `ExcalidrawLinearElement` itself (the full arrow element); `FixedPointBinding` (the reverse binding stored *on* the arrow's `startBinding` / `endBinding`); a generic "bound" in a mathematical sense.

---

## LinearElement / ExcalidrawLinearElement

- **Definition:** The **base type for multi-point shapes**: `ExcalidrawLinearElement = _ExcalidrawElementBase & { type: "line" | "arrow"; points: readonly LocalPoint[]; startBinding: FixedPointBinding | null; endBinding: FixedPointBinding | null; startArrowhead: Arrowhead | null; endArrowhead: Arrowhead | null }`. Direct subtypes are **`ExcalidrawLineElement`** (`type: "line"`, adds `polygon: boolean`) and **`ExcalidrawArrowElement`** (`type: "arrow"`, adds `elbowed: boolean`), the latter further narrowed to **`ExcalidrawElbowArrowElement`** for routed arrows. Point coordinates are `LocalPoint[]` in element-local space. Point editing is handled by **`LinearElementEditor`** (`packages/element/src/linearElementEditor.ts`).
- **Where it is used:** `packages/element/src/types.ts` (lines 333–385); `packages/element/src/linearElementEditor.ts`; `packages/element/src/binding.ts`; `packages/element/src/elbowArrow.ts`; `packages/excalidraw/components/App.tsx` (drag, resize, binding logic).
- **Do not confuse with:** **`ExcalidrawFreeDrawElement`** — also multi-point but not a `LinearElement` (separate type, no bindings, stores pressure data); **`ExcalidrawLineElement`** — the `"line"` *subtype* only; the informal term "line" in the UI which may refer to either.

---

_Aligned with `packages/element/src/types.ts`, `packages/excalidraw/types.ts`, `packages/excalidraw/components/App.tsx`, `packages/element/src/Scene.ts`, `packages/element/src/store.ts`; re-check these files after large refactors._
