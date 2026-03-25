# Domain glossary (Excalidraw monorepo)

Terms are named as they appear in **TypeScript / source identifiers**. Definitions reflect **this codebase**, not generic English or other products.

---

## ExcalidrawElement

**Definition (this project)**  
A **discriminated union** of all drawable record types on the canvas (rectangle, ellipse, arrow, text, image, frame, embeddable, etc.). Each variant shares a common base (`id`, `x`, `y`, `width`, `height`, `strokeColor`, `version`, `versionNonce`, `index`, `isDeleted`, `groupIds`, `frameId`, `boundElements`, …) defined in `packages/element/src/types.ts`, then narrows on **`type`**.

**Where it is used**  
- Type system: `packages/element/src/types.ts` (`export type ExcalidrawElement = …`).  
- Editor props and APIs: `packages/excalidraw/types.ts` (`onChange`, `ExcalidrawImperativeAPI`, actions).  
- Actions: `packages/excalidraw/actions/types.ts` (`ActionResult.elements`).

**Do not confuse with**  
- **DOM Element** — browser `Element` / JSX; unrelated.  
- **“Element” in UI libraries** — e.g. Radix “element”; here it always means **scene data**.

---

## Element (informal) / NonDeleted / Ordered

**Definition (this project)**  
Code often says **“element”** in comments and variable names when the type is **`ExcalidrawElement`** or a **`NonDeleted<T>`** / **`Ordered<T>`** refinement:

- **`NonDeleted<T>`** — `T` with `isDeleted` false (`packages/element/src/types.ts`).  
- **`Ordered<T>`** — `T` plus ordering metadata for the scene array (`OrderedExcalidrawElement` is the usual list element type).  
- **`NonDeletedExcalidrawElement`**, **`OrderedExcalidrawElement`** — common aliases in APIs and `Scene` accessors.

**Where it is used**  
- `packages/element/src/Scene.ts` (`getNonDeletedElements`, `getElementsIncludingDeleted`).  
- `packages/excalidraw/components/App.tsx` (scene getters, selection).

**Do not confuse with**  
- **React component** — “element” in React docs means VDOM; here it is **persisted scene shape data**.

---

## Scene

**Definition (this project)**  
A **`class Scene`** in `packages/element/src/Scene.ts` that **owns the ordered list of elements** and element maps (`elements`, `elementsMap`, `nonDeletedElements`, `nonDeletedElementsMap`), supports **`replaceAllElements`**, **`mutateElement`**, and emits update callbacks. It also tracks a **`sceneNonce`** used as a **renderer cache-invalidation nonce** (see comment in `Scene.ts`: not the same as per-element `version`).

**Where it is used**  
- Instantiated on the editor: `this.scene = new Scene()` in `packages/excalidraw/components/App.tsx`.  
- Exported from `@excalidraw/element` via `packages/element/src/index.ts` (`export * from "./Scene"`).

**Do not confuse with**  
- **“Scene” in 3D engines** — meshes, lights; here it is **2D vector document state**.  
- **Browser “scene” / accessibility** — unrelated.

---

## AppState

**Definition (this project)**  
The **`interface AppState`** in `packages/excalidraw/types.ts`: a large **readonly React state object** on the `App` class holding **everything UI and interaction** for the editor: viewport (`scrollX`, `scrollY`, `zoom`, `width`, `height`, `offsetLeft`, `offsetTop`), `activeTool`, selection (`selectedElementIds`, `selectedGroupIds`), transient creation (`newElement`, `selectionElement`, `multiElement`), dialogs (`openDialog`, `contextMenu`), theme, grid, collaborators map, stats panel flags, etc. Defaults come from **`getDefaultAppState()`** in `packages/excalidraw/appState.ts`.

**Where it is used**  
- `packages/excalidraw/components/App.tsx` (`this.state`), `setState`, `setAppState`.  
- Canvas props: `StaticCanvasAppState`, `InteractiveCanvasAppState` are **subsets** of `AppState` for `renderStaticScene` / `renderInteractiveScene` (`packages/excalidraw/types.ts`).

**Do not confuse with**  
- **Redux/URL “app state”** — not a global store; this is **React component state** for the Excalidraw `App` instance.  
- **`ObservedAppState`** — a **smaller** shape used with `Store` snapshots (`packages/excalidraw/types.ts`).

---

## Tool / ToolType / ActiveTool

**Definition (this project)**  
- **`ToolType`** — string union of built-in tools: `"selection"`, `"lasso"`, `"rectangle"`, … `"laser"` (`packages/excalidraw/types.ts`).  
- **`ActiveTool`** — either `{ type: ToolType; customType: null }` or `{ type: "custom"; customType: string }` for custom tools.  
- **`AppState.activeTool`** — which tool is active (plus lock / last tool metadata).

**Where it is used**  
- `packages/excalidraw/types.ts` (`AppState`, `AppProps`).  
- `packages/excalidraw/components/App.tsx` (tool switching, pointer routing).  
- **`CollaboratorPointer.tool`** in **`Collaborator`** — `"pointer"` or `"laser"` for **remote cursors**, not the full `ToolType` union (`types.ts`).

**Do not confuse with**  
- **Toolbar “tool” in other apps** — here values are **fixed** and drive hit-testing and creation logic.  
- **“Pointer” tool in UI** — in code, **selection** is often `activeTool.type === "selection"`; remote pointer is a **collaboration overlay**, not `ToolType`.

---

## Action / ActionName / ActionManager

**Definition (this project)**  
- **`Action`** — object with **`name`** (`ActionName`), **`perform`** (pure-ish function returning **`ActionResult`** or a `Promise` of it), optional **`keyTest`**, **`PanelComponent`**, etc. (`packages/excalidraw/actions/types.ts`).  
- **`ActionResult`** — `{ elements?, appState?, files?, captureUpdate, … } | false`; **`captureUpdate`** uses **`CaptureUpdateAction`** from `@excalidraw/element`.  
- **`ActionManager`** — registers actions, dispatches keyboard shortcuts, and forwards results to **`App.syncActionResult`** (`packages/excalidraw/actions/manager.tsx`, `App` constructor).

**Where it is used**  
- `packages/excalidraw/actions/*.tsx` — one file per feature (e.g. `actionDeleteSelected.tsx`).  
- `packages/excalidraw/actions/index.ts` — re-exports.  
- `packages/excalidraw/components/App.tsx` — `registerAll(actions)`, `executeAction`.

**Do not confuse with**  
- **Redux action** — plain `{ type, payload }`; here an **`Action`** is a **command object** with `perform`.  
- **Browser `History` API** — unrelated.

---

## Store / CaptureUpdateAction / History

**Definition (this project)**  
- **`Store`** (`packages/element/src/store.ts`) — owned by **`App`**, captures **observed** changes to elements and app state, emits **`StoreIncrement`** / **`DurableIncrement`** events, **`commit`**s with the scene after updates. **`CaptureUpdateAction`** (`IMMEDIATELY` | `NEVER` | `EVENTUALLY`) controls **undo/redo** recording (see JSDoc in `store.ts` and `App.updateScene` in `App.tsx`).  
- **`History`** (`packages/excalidraw/history.ts`) — builds on **`StoreDelta`** from `@excalidraw/element` for undo/redo.

**Where it is used**  
- `packages/excalidraw/components/App.tsx` — `new Store(this)`, `store.commit`, `syncActionResult` → `store.scheduleAction`.  
- `packages/excalidraw/history.ts` — undo/redo.

**Do not confuse with**  
- **Redux/Zustand store** — different API; this **`Store`** is **Excalidraw-specific** and tied to **`Scene`** + **History**.  
- **IndexedDB “store”** — unrelated unless a persistence adapter uses it.

---

## Collaboration / Collaborator / isCollaborating

**Definition (this project)**  
- **`Collaborator`** (`packages/excalidraw/types.ts`) — read-only object describing **another user** in a session: optional **`pointer`** (`CollaboratorPointer`: `x`, `y`, `tool`: `"pointer"` | `"laser"`, …), **`selectedElementIds`**, **`username`**, **`color`**, **`socketId`**, etc.  
- **`AppState.collaborators`** — **`Map<SocketId, Collaborator>`**.  
- **`ExcalidrawProps.isCollaborating`** — boolean prop for host apps to **signal** collaboration mode (UI / behavior).  
- **`onPointerUpdate`** — host can stream local pointer; **`InteractiveCanvas`** reads **`collaborators`** to draw remote cursors (`renderInteractiveScene` path).

**Where it is used**  
- `packages/excalidraw/types.ts` (`Collaborator`, `AppState`, `ExcalidrawProps`).  
- `packages/excalidraw/components/canvases/InteractiveCanvas.tsx`.  
- `excalidraw-app/` — collab wiring (e.g. `Collab` modules) on top of the API.

**Do not confuse with**  
- **Git collaboration** — here **real-time multi-user** session state.  
- **“Collaboration” as product name** — the type is **`Collaborator`**, not a separate class.

---

## Library / LibraryItem / LibraryItems

**Definition (this project)**  
- **`LibraryItem`** (`packages/excalidraw/types.ts`) — `{ id, status: "published" | "unpublished", elements: readonly NonDeleted<ExcalidrawElement>[], created, name?, error? }` (v2 format).  
- **`LibraryItems`** — `readonly LibraryItem[]`.  
- **`Library`** class — `packages/excalidraw/data/library.ts`: loads/saves, persists, **`updateLibrary`**; used by **`ExcalidrawImperativeAPI.updateLibrary`**.

**Where it is used**  
- `packages/excalidraw/components/LibraryMenu*.tsx`, `data/library.ts`.  
- `packages/excalidraw/types.ts` (`onLibraryChange`, `initialData.libraryItems`).  
- `packages/excalidraw/index.tsx` / `App.tsx` — `this.library`.

**Do not confuse with**  
- **npm package “library”** — here **user’s saved shapes / templates** inside the editor.  
- **Code “library”** (shared modules) — unrelated.

---

## Binding / boundElements

**Definition (this project)**  
- **`BoundElement`** (`packages/element/src/types.ts`) — `{ id, type: "arrow" | "text" }` on an element’s **`boundElements`** list — **arrow or text** attached to shapes.  
- **`AppState.isBindingEnabled`**, **`suggestedBinding`**, **`startBoundElement`** — arrow **endpoint snapping** to shapes while editing.  
- “Binding” in code often means **arrow ↔ shape** relationships, not data binding in MVVM.

**Where it is used**  
- `packages/element/src/binding.ts`, `packages/excalidraw/types.ts` (`AppState`).  
- `packages/excalidraw/components/App.tsx` (pointer handlers).

**Do not confuse with**  
- **One-way/two-way UI binding** in frameworks — here **geometric attachment** of arrows.  
- **OAuth / SSL binding** — unrelated.

---

## App (editor class)

**Definition (this project)**  
**`class App`** in `packages/excalidraw/components/App.tsx` — the main **React class component** that owns **`Scene`**, **`Store`**, **`History`**, **`ActionManager`**, **`Renderer`**, **`Library`**, **`ExcalidrawImperativeAPI`**, and canvas refs. It is **not** the same as `excalidraw-app/App.tsx` (the host SPA shell).

**Where it is used**  
- `packages/excalidraw/index.tsx` renders `<App … />`.  
- `packages/excalidraw/types.ts` (`export type App` from `./components/App`).

**Do not confuse with**  
- **“App” in `excalidraw-app`** — that file is the **product shell**; **`packages/excalidraw/components/App.tsx`** is the **editor engine**.

---

## ExcalidrawImperativeAPI

**Definition (this project)**  
The **`interface ExcalidrawImperativeAPI`** in `packages/excalidraw/types.ts`: **imperative methods** exposed to parent/embedded apps (`updateScene`, `getAppState`, `getSceneElements`, `resetScene`, `onChange`, `onStateChange`, `mutateElement`, `registerAction`, …). Built in **`App.createExcalidrawAPI()`** (`packages/excalidraw/components/App.tsx`).

**Where it is used**  
- `packages/excalidraw/types.ts` (interface).  
- `packages/excalidraw/index.tsx` (`ExcalidrawAPIContext`, `onExcalidrawAPI`).  
- `excalidraw-app/App.tsx` — `useExcalidrawAPI()` and collab.

**Do not confuse with**  
- **React `useImperativeHandle` without types** — the surface is **fully typed** as **`ExcalidrawImperativeAPI`**.

---

## BinaryFiles / FileId

**Definition (this project)**  
- **`BinaryFileData`** (`packages/excalidraw/types.ts`) — metadata for **image/binary data** (`id: FileId`, `mimeType`, `dataURL`, timestamps, etc.).  
- **`BinaryFiles`** — `Record<ExcalidrawElement["id"], BinaryFileData>` in `types.ts` (each **`BinaryFileData`** carries its own **`id: FileId`** used by image elements).  
- **`ExcalidrawImageElement`** references **`fileId`** when the image is loaded.

**Where it is used**  
- `packages/excalidraw/components/App.tsx` (`this.files`, `addFiles`).  
- `onChange` callback passes **`files`** alongside elements and `AppState`.

**Do not confuse with**  
- **Browser `File` / `Blob` only** — Excalidraw keeps **normalized** `BinaryFileData` in the **`files`** map.  
- **Filesystem paths** — **`FileId`** is an **internal identifier**, not an OS path.

---

## Frame / frameId

**Definition (this project)**  
- **`ExcalidrawFrameLikeElement`** / **`ExcalidrawFrameElement`** / **`ExcalidrawMagicFrameElement`** — element types that **group and clip** content (`packages/element/src/types.ts`).  
- **`frameId`** on base element — **which frame contains** this element, or `null`.  
- **`AppState.frameRendering`** (with **`updateFrameRendering`** API) — affects **how frames are drawn** (see JSDoc on `ExcalidrawImperativeAPI`).

**Where it is used**  
- `packages/element/src/frame.ts`, `packages/excalidraw/renderer/staticScene.ts` (clipping).  
- `packages/excalidraw/types.ts` (`AppState`).

**Do not confuse with**  
- **DOM `<iframe>`** — **`ExcalidrawIframeElement`** is a **separate** embed type; **frames** here are **vector containers**.

---

## Renderer (excalidraw package)

**Definition (this project)**  
**`class Renderer`** in `packages/excalidraw/scene/Renderer.ts` — **computes which elements are visible** in the viewport for canvas drawing (uses `isElementInViewport` from `@excalidraw/element`, `renderStaticSceneThrottled`). **Not** the same as **`renderElement`** in `@excalidraw/element` (which draws **one** element).

**Where it is used**  
- `packages/excalidraw/components/App.tsx` (`this.renderer.getRenderableElements`).

**Do not confuse with**  
- **`Scene`** — owns the element list; **`Renderer`** **filters** for view.  
- **React reconciler** — unrelated.

---

## Reconcile / restore (data)

**Definition (this project)**  
**`restoreElements`**, **`restoreAppState`** (`packages/excalidraw/data/restore.ts`) — **normalize** persisted JSON into valid `ExcalidrawElement[]` / `AppState`. **`reconcileElements`** (exported from `@excalidraw/excalidraw`) — **merge concurrent updates** using `version` / `versionNonce` (see comments on those fields in `packages/element/src/types.ts`).

**Where it is used**  
- Load flows: `packages/excalidraw/components/App.tsx` (`initializeScene`), `excalidraw-app/App.tsx` (collab).  
- `packages/excalidraw/data/reconcile.ts` (types like `RemoteExcalidrawElement`).

**Do not confuse with**  
- **React reconciliation** — here **data merge** for collaboration / persistence.

---

## Summary table

| Term | Primary definition location |
|------|-----------------------------|
| `ExcalidrawElement`, `NonDeleted*`, `Ordered*` | `packages/element/src/types.ts` |
| `Scene` | `packages/element/src/Scene.ts` |
| `AppState`, `Collaborator`, `ToolType`, `LibraryItem`, `ExcalidrawImperativeAPI` | `packages/excalidraw/types.ts` |
| `Action`, `ActionResult` | `packages/excalidraw/actions/types.ts` |
| `Store`, `CaptureUpdateAction` | `packages/element/src/store.ts` |
| `ActionManager` | `packages/excalidraw/actions/manager.tsx` |
| `Library` class | `packages/excalidraw/data/library.ts` |
| `App` class | `packages/excalidraw/components/App.tsx` |
| `Renderer` (viewport culling) | `packages/excalidraw/scene/Renderer.ts` |

*Last aligned with source layout in this repository; prefer jumping to the cited files when names drift.*
