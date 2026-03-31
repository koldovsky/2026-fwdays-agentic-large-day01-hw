# Domain glossary

## Summary
- Practical glossary for Excalidraw domain terms used in this repository.
- Definitions map to concrete types, classes, and modules in source code.

## Current State

Onboarding reference for **Excalidraw editor** terminology in this repository. Definitions follow **actual types and classes** in the source; generic English meanings are noted only where they differ.

### Element

- **Name:** Element (canvas element)
- **Definition:** Informal name for one drawable **shape or object on the canvas**—the runtime value described by the **`ExcalidrawElement`** type union. Code and comments use variables like `element` / `elements` for these records. Each has an `id`, geometry, style fields, `version` / `versionNonce` / `index` for ordering and sync, `isDeleted` for soft delete, optional `groupIds`, `frameId`, etc.
- **Where it is used:** Throughout `packages/element/src/*` (mutations, bounds, groups), `packages/excalidraw/components/App.tsx`, actions, renderer code; authoritative shape definitions in `packages/element/src/types.ts`.
- **Do not confuse with:** A **DOM Element**, a **React element**, or the **`selection`** **ExcalidrawElement** subtype (a transient rubber-band object during drag-select, not a user-authored shape). Prefer **`ExcalidrawElement`** when referring to the type.

### Bound Element

- **Name:** Bound Element
- **Definition:** A `BoundElement` reference record (`{ id, type: "arrow" | "text" }`) that points to another element bound to the current element.
- **Where it is used:** `packages/element/src/types.ts` (`BoundElement`) as the element type inside `boundElements: readonly BoundElement[] | null` on elements.
- **Do not confuse with:** The owning/container element that holds `boundElements`; this is only the lightweight binding reference.

### Linear Element

- **Name:** Linear Element
- **Definition:** An `ExcalidrawLinearElement` whose `type` is `"line"` or `"arrow"`. Linear elements are defined by a `points` array and can optionally attach to other elements via `startBinding` / `endBinding` (and include arrowhead metadata for arrows).
- **Where it is used:** `packages/element/src/types.ts` (`ExcalidrawLinearElement`, `ExcalidrawLineElement`, `ExcalidrawArrowElement`) and the editor UI/editor logic that edits linear points (e.g. `LinearElementEditor`).
- **Do not confuse with:** Generic geometry “line segments”; a linear element is the serialized element model with bindings + arrowhead state.

### Scene

- **Name:** Scene
- **Definition:** The **`Scene`** class that holds the editor’s **element graph** for one instance: ordered element arrays, maps (including non-deleted subsets), frame lists, selection caches, and subscribers. It reconciles **fractional indices** for ordering, exposes **`getSceneNonce()`** for render cache invalidation, and is the object **`Renderer`** reads. **`SceneData`** in `types.ts` is a **payload shape** for importing/updating (`elements`, optional `appState`, optional `collaborators`, optional `captureUpdate`)—related but not the class itself.
- **Where it is used:** `packages/element/src/Scene.ts` (`export class Scene`), `packages/excalidraw/components/App.tsx` (`this.scene = new Scene()`), `packages/excalidraw/scene/Renderer.ts`, `packages/excalidraw/types.ts` (`SceneData`).
- **Do not confuse with:** A **movie/storyboard “scene”**, a **Three.js** scene, or **`exportEmbedScene`** (boolean: whether exported PNG embeds JSON **scene data**). **`Scene`** = in-memory **model + indexes** for canvas elements on this editor.

### AppState

- **Name:** AppState
- **Definition:** The TypeScript interface for the **editor UI and session state** held in React state on the main `App` component: zoom, scroll, selection maps, active tool, open dialogs/sidebars, theme, collaborators map, export options, transient pointers (e.g. element being drawn), and more. It does **not** own the authoritative list of canvas shapes; that lives on **`Scene`** / **`Store`** and flows through actions and APIs.
- **Where it is used:** `packages/excalidraw/types.ts` (`AppState`, `UIAppState`), `packages/excalidraw/appState.ts` (`getDefaultAppState`), `packages/excalidraw/components/App.tsx` (`this.state`), contexts such as `ExcalidrawAppStateContext`.
- **Do not confuse with:** The word “application state” for an entire app stack. **`AppState`** is this project’s **specific** editor slice. Do not treat it as the same as the **element model** (see **Scene**, **ExcalidrawElement**).

### ExcalidrawElement

- **Name:** ExcalidrawElement
- **Definition:** The **union type** of all serializable canvas element variants (`rectangle`, `diamond`, `ellipse`, `arrow`, `line`, `text`, `freedraw`, `image`, `frame`, `magicframe`, `iframe`, `embeddable`, `selection`, etc.). Intended to be **JSON-serializable** and **peer-shareable** without peer-local fields. Branded helpers include **`NonDeletedExcalidrawElement`**, **`OrderedExcalidrawElement`** (non-null fractional `index`).
- **Where it is used:** `packages/element/src/types.ts` (definition and subtypes), re-exported through `@excalidraw/element/types`; consumed by `Scene`, `Store`, `Action` signatures, export/restore, collaboration payloads.
- **Do not confuse with:** **`AppState`** (transient editor UI), **`LibraryItem`** (a library entry wrapping multiple elements), or **`ToolType`** (which tool is active—not a stored shape).

### Tool

- **Name:** Tool (`ToolType`, `ActiveTool`, `appState.activeTool`)
- **Definition:** The **current drawing or navigation mode**: e.g. `selection`, `lasso`, `rectangle`, `arrow`, `text`, `hand`, `eraser`, `frame`, `laser`, etc. (`ToolType` in `types.ts`). **`ActiveTool`** is either a built-in `ToolType` or `type: "custom"` with `customType: string`. **`AppState.activeTool`** extends **`ActiveTool`** with `locked`, `fromSelection`, and `lastActiveTool` (e.g. returning from eraser/hand to the prior tool).
- **Where it is used:** `packages/excalidraw/types.ts` (`ToolType`, `ActiveTool`, `AppState["activeTool"]`), toolbar and pointer handling in `packages/excalidraw/components/App.tsx` and related UI components.
- **Do not confuse with:** An **Action** (discrete command such as undo or align). **Tools** are **modes** that change how pointer input creates or manipulates **elements**; **Actions** **perform** updates given current state.

### Action

- **Name:** Action
- **Definition:** A named editor command object with a `perform` function that receives the current ordered elements, `AppState`, optional form data, and the `App` instance, and returns an `ActionResult` (partial `AppState` and/or element list and/or files, plus a `captureUpdate` flag for history) or `false` to block the operation. Actions are registered on `ActionManager` and can define shortcuts (`keyTest`), menu UI, and analytics.
- **Where it is used:** `packages/excalidraw/actions/types.ts` (`Action`, `ActionResult`, `ActionName`), `packages/excalidraw/actions/manager.tsx` (`ActionManager`), `packages/excalidraw/actions/action*.ts`, `packages/excalidraw/components/App.tsx` (`actionManager`, `syncActionResult`).
- **Do not confuse with:** Redux or Flux “actions” (plain events). Here an **Action** is a full command object tied to the editor’s typed `ActionName` union and integrated with undo/redo via `captureUpdate`. Also distinct from **`CaptureUpdateAction`** in `@excalidraw/element` (`IMMEDIATELY` / `NEVER` / `EVENTUALLY`), which classifies how updates enter history—not the user-facing command itself.

### Collaboration

- **Name:** Collaboration (live collaboration)
- **Definition:** Real-time multi-user editing support: each peer’s presence is represented in **`AppState.collaborators`** as a `Map<SocketId, Collaborator>` (`Collaborator` holds pointer position, optional selection, username, colors, etc.). The hosted app layer syncs scenes over sockets (rooms, broadcasts). The core package renders collaborator UI from that map.
- **Where it is used:** `packages/excalidraw/types.ts` (`Collaborator`, `SocketId`, `AppState["collaborators"]`), `excalidraw-app/collab/Portal.tsx`, `excalidraw-app/collab/*`, `packages/excalidraw/components/live-collaboration/*`.
- **Do not confuse with:** Generic “working together” or async sharing (e.g. export-only). Here it implies **live** presence and, in the hosted app, **socket-backed** room sync—not merely the **Library** or file export.

### Library

- **Name:** Library (shape library)
- **Definition:** The **reusable shapes sidebar**: a collection of **`LibraryItem`** entries (`id`, `status`, `elements`, `created`, optional `name`/`error`). The **`Library`** class on **`App`** owns the current `LibraryItems`, queues updates, syncs **`libraryItemsAtom`**, and notifies **`onLibraryChange`**. Persistence can be adapted via **`LibraryPersistenceAdapter`** (see `packages/excalidraw/data/library.ts`).
- **Where it is used:** `packages/excalidraw/data/library.ts` (`Library`, `libraryItemsAtom`), `packages/excalidraw/types.ts` (`LibraryItem`, `LibraryItems`), `packages/excalidraw/components/LibraryMenu*.tsx`, `excalidraw-app/data/LocalData.ts` (IndexedDB adapters for library).
- **Do not confuse with:** An npm **package** / repo **library**, the **`packages/`** monorepo folder, or a **`frame`** on the canvas. **Library** here means **user-stored template shapes**, not the scene’s main element list.

### See also

- **Store** (`packages/element/src/store.ts`): captures diffs for **history** / undo-redo; pairs with **Scene** but is a separate concept from **AppState**.
- **Element** package vs **excalidraw** package: `@excalidraw/element` owns **geometry/types** and **Scene**; `packages/excalidraw` owns **React App**, **actions**, and **UI**.

## Actions
- Keep glossary terms synchronized with canonical types and class names in source.
- Add entries only for domain concepts that appear in code or user-facing product behavior.

## Source Checkpoints
- `packages/excalidraw/types.ts`
- `packages/element/src/types.ts`
- `packages/element/src/Scene.ts`
- `packages/excalidraw/actions/types.ts`
- `packages/excalidraw/actions/manager.tsx`
- `packages/excalidraw/data/library.ts`
- `excalidraw-app/collab/Portal.tsx`

## Related Documentation
- [`./PRD.md`](./PRD.md)
- [`../technical/architecture.md`](../technical/architecture.md)
- [`../memory/productContext.md`](../memory/productContext.md)