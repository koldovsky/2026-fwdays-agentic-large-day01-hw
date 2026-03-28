# Domain Glossary — Excalidraw

This glossary defines key terms as they are used **in this codebase**. Each entry maps the English name (as it appears in code) to its project-specific meaning, location, and relationships.

---

## Element

**Name (in code):** `Element`, `ExcalidrawElement`, `_ExcalidrawElementBase`

**Definition in this project:**
The fundamental unit of content on the canvas. Every shape, line, text block, image, frame, or embedded widget that a user draws is an `ExcalidrawElement`. All elements share a common base (`_ExcalidrawElementBase`) with fields like `id`, `x`/`y` coordinates, stroke/fill styling, `version`, `isDeleted`, `groupIds`, `frameId`, and `locked`. The concrete type is a discriminated union of all specific element shapes.

```ts
export type ExcalidrawElement =
  | ExcalidrawGenericElement      // rectangle, diamond, ellipse
  | ExcalidrawTextElement
  | ExcalidrawLinearElement       // line
  | ExcalidrawArrowElement
  | ExcalidrawFreeDrawElement
  | ExcalidrawImageElement
  | ExcalidrawFrameElement
  | ExcalidrawMagicFrameElement
  | ExcalidrawIframeElement
  | ExcalidrawEmbeddableElement;
```

**Where used (key files):**
- **Definition:** `packages/element/src/types.ts`
- **Stored & managed:** `packages/element/src/Scene.ts`
- **State types:** `packages/excalidraw/types.ts` (`AppState`, `BinaryFiles`, component props)
- **Action system:** `packages/excalidraw/actions/types.ts` (`ActionResult.elements`)
- **Import/export:** `packages/excalidraw/data/types.ts` (`ImportedDataState.elements`)
- **Main app:** `packages/excalidraw/components/App.tsx`

**Important variants / subtypes:**
| Variant | Meaning |
|---|---|
| `NonDeletedExcalidrawElement` | Element with `isDeleted: false` — what gets rendered |
| `OrderedExcalidrawElement` | Element with fractional index (`index`) for z-ordering |
| `ExcalidrawElementType` | String union of all `element.type` values |
| `SceneElementsMap` | `Map<string, ExcalidrawElement>` keyed by `id` |
| `NonDeletedSceneElementsMap` | Same, but filtered to non-deleted |

**NOT to be confused with:**
- *General meaning:* A DOM element or React element.
- *In this project:* Always refers to a canvas drawing primitive — a JSON-serializable, peer-shareable data object. It is **not** a UI/DOM node.

---

## Scene

**Name (in code):** `Scene`, `SceneData`

**Definition in this project:**
Three related but distinct concepts share the "scene" name:

1. **`Scene` class** — The authoritative, reactive in-memory store of all canvas elements. It holds ordered element lists and lookup maps, tracks `sceneNonce` (a change counter), manages selection state, and notifies subscribers on mutation. There is one `Scene` instance per editor, owned by the `App` component.

2. **`packages/excalidraw/scene/` folder** — A collection of rendering helpers: `Renderer`, zoom/scroll utilities, and `types.ts` with `StaticSceneRenderConfig` / `InteractiveSceneRenderConfig`. This is the *viewport and render pipeline* layer, not the data store.

3. **`SceneData`** — A lightweight payload type used by the `updateScene` public API to push new elements, appState, and collaborators into the editor from the outside.

```ts
// SceneData — the external API payload
export type SceneData = {
  elements?: ImportedDataState["elements"];
  appState?: ImportedDataState["appState"];
  collaborators?: Map<SocketId, Collaborator>;
  captureUpdate?: CaptureUpdateActionType;
};
```

**Where used (key files):**
- **`Scene` class:** `packages/element/src/Scene.ts`
- **App ownership:** `packages/excalidraw/components/App.tsx` (`public scene: Scene`)
- **Renderer:** `packages/excalidraw/scene/Renderer.ts`
- **Render types:** `packages/excalidraw/scene/types.ts`
- **`SceneData` type:** `packages/excalidraw/types.ts`

**NOT to be confused with:**
- *General meaning:* A 3D scene graph (e.g. Three.js `Scene`) or a movie scene.
- *In this project:* The `Scene` class is a **2D element store with change notifications** — not a spatial graph. The `scene/` folder is about rendering configuration, not data storage.

---

## AppState

**Name (in code):** `AppState`, `UIAppState`, `StaticCanvasAppState`, `InteractiveCanvasAppState`

**Definition in this project:**
A large React component state interface (`interface AppState`) that captures all editor UI state that is **not** an element on the canvas. This includes the active tool, current selection, scroll/zoom position, open dialogs, export options, collaboration cursors, search state, snap settings, and much more. `App extends React.Component<AppProps, AppState>`.

Key fields of note:
- `activeTool` — which tool is currently selected
- `selectedElementIds` — map of selected element IDs
- `collaborators` — live map of remote users and their cursors
- `editingElement` / `newElement` — element currently being created or edited
- `scrollX`, `scrollY`, `zoom` — viewport position

**Where used (key files):**
- **Definition:** `packages/excalidraw/types.ts` (interface `AppState`, ~line 272)
- **Owner:** `packages/excalidraw/components/App.tsx`
- **Render configs:** `packages/excalidraw/scene/types.ts` (render functions receive slices of `AppState`)
- **Actions:** `packages/excalidraw/actions/types.ts` (every action receives and may return `Partial<AppState>`)

**Important variants:**
| Variant | Purpose |
|---|---|
| `UIAppState` | `Omit<AppState, ...>` — passed to UI callbacks; excludes canvas-specific fields |
| `StaticCanvasAppState` | Subset for the static (background) canvas layer |
| `InteractiveCanvasAppState` | Subset for the interactive (selection/cursor) canvas layer |
| `ObservedAppState` | Granular subset used by the `Store` for change detection |

**NOT to be confused with:**
- *General meaning:* Generic "application state" as a design pattern.
- *In this project:* A **specific TypeScript interface** defined in `types.ts`. It does **not** contain the canvas elements — those live in `Scene`. `AppState` is UI/editor control state; `Scene` is data.

---

## ExcalidrawElement

**Name (in code):** `ExcalidrawElement`

**Definition in this project:**
See **Element** above. `ExcalidrawElement` is the canonical exported name for the element union type. It is the type you use when you want to refer to "any element that can exist on an Excalidraw canvas." All serialization, collaboration, and public API contracts use this name.

**Where used (key files):**
- `packages/element/src/types.ts` — definition
- `packages/excalidraw/types.ts` — used throughout public API types

**NOT to be confused with:**
- *General meaning:* An HTML element.
- *In this project:* A pure data object (JSON-serializable) representing one drawable item on the canvas. Think of it as a "record" in a drawing database, not a DOM node.

---

## Tool

**Name (in code):** `ToolType`, `ActiveTool`, `ElementOrToolType`

**Definition in this project:**
The currently selected interaction mode in the editor toolbar. A **tool** determines what happens when the user clicks or drags on the canvas (create a rectangle, draw a freehand line, pan the canvas, erase elements, etc.). The active tool is stored in `AppState.activeTool`.

```ts
export type ToolType =
  | "selection" | "lasso" | "rectangle" | "diamond" | "ellipse"
  | "arrow" | "line" | "freedraw" | "text" | "image"
  | "eraser" | "hand" | "frame" | "magicframe" | "embeddable" | "laser";

export type ActiveTool =
  | { type: ToolType; customType: null }
  | { type: "custom"; customType: string };   // third-party / plugin tools
```

`ActiveTool` also carries `locked` (stay in tool after use), `lastActiveTool`, and `fromSelection` in `AppState`.

**Where used (key files):**
- **Definition:** `packages/excalidraw/types.ts`
- **Constants:** `@excalidraw/common` (`TOOL_TYPE`, `updateActiveTool`, `isSelectionLikeTool`)
- **Usage:** `packages/excalidraw/components/App.tsx` (`setActiveTool`, pointer/event handling)
- **Collaboration:** `packages/excalidraw/types.ts` (`CollaboratorPointer.tool: "pointer" | "laser"`)

**NOT to be confused with:**
- *General meaning:* A software utility or developer tool.
- *In this project:* A **canvas interaction mode** from a fixed enumerated set (`ToolType`), plus an optional "custom" extension point for third-party integrations. It is NOT a component or class — it is a string type value stored in state.

---

## Action

**Name (in code):** `Action`, `ActionName`, `ActionResult`, `ActionManager`

**Definition in this project:**
A **command pattern** implementation for all discrete editor operations — format text, delete elements, toggle grid, add to library, etc. An `Action` is a plain object with a `name` (`ActionName`), a `perform` function, optional keyboard test (`keyTest`), optional React panel component (`PanelComponent`), and optional analytics tracking.

The `perform` function receives current elements, `AppState`, form data, and the `App` instance, and returns an `ActionResult` — either `false` (no-op) or an object with optional new `elements`, `appState`, and `files`.

The `ActionManager` class registers all actions, routes keyboard shortcuts, and executes actions through a single `executeAction` method that applies the result back to `App`.

```ts
export type ActionResult =
  | {
      elements?: readonly ExcalidrawElement[] | null;
      appState?: Partial<AppState> | null;
      files?: BinaryFiles | null;
      captureUpdate: CaptureUpdateActionType;
      replaceFiles?: boolean;
    }
  | false;
```

**Where used (key files):**
- **Types:** `packages/excalidraw/actions/types.ts`
- **Manager:** `packages/excalidraw/actions/manager.tsx`
- **All actions:** `packages/excalidraw/actions/index.ts` (re-exports all concrete actions)
- **Registration:** `packages/excalidraw/components/App.tsx` (constructor: `new ActionManager(...)`, `registerAll(actions)`)

**NOT to be confused with:**
- *General meaning:* A Redux action or a UI button click event.
- *In this project:* A **registered, named command** with keyboard binding, optional toolbar UI panel, and a pure `perform` function. Unlike Redux, actions here **directly return new state** (elements + appState) rather than dispatching to a reducer.

---

## Collaboration

**Name (in code):** `Collaborator`, `CollaboratorPointer`, `SocketId`, `isCollaborating`

**Definition in this project:**
The set of types, state fields, and rendering logic that support **real-time multi-user editing**. The Excalidraw package itself is **sync-agnostic** — it does not manage WebSocket connections or server communication. Instead, it exposes:
- `AppState.collaborators: Map<SocketId, Collaborator>` — a map of remote users that the host application keeps up-to-date
- Props like `isCollaborating`, `onPointerUpdate`, `onUserFollow` — callbacks and flags the host app implements
- Render infrastructure that draws remote cursors, selections, and laser trails using the `collaborators` map

The host application (e.g. `excalidraw.com`) is responsible for the actual sync layer; the package renders whatever collaborator data is provided to it.

```ts
type Collaborator = {
  pointer?: CollaboratorPointer;
  button?: "up" | "down";
  selectedElementIds?: AppState["selectedElementIds"];
  username?: string | null;
  userState?: UserIdleState;
  color?: { background: string; stroke: string };
  avatarUrl?: string;
  id?: string;
};
```

**Where used (key files):**
- **Types:** `packages/excalidraw/types.ts` (`Collaborator`, `CollaboratorPointer`, `SocketId`)
- **Rendering:** `packages/excalidraw/renderer/interactiveScene.ts` (draws remote cursors and selections)
- **Canvas layer:** `packages/excalidraw/components/canvases/InteractiveCanvas.tsx`
- **Laser trails:** `packages/excalidraw/laser-trails.ts`
- **UI trigger:** `packages/excalidraw/components/live-collaboration/LiveCollaborationTrigger.tsx`
- **User list:** `packages/excalidraw/components/UserList.tsx`

**Collaboration-related element fields:**
- `version` and `versionNonce` on `_ExcalidrawElementBase` — used for conflict resolution during sync

**NOT to be confused with:**
- *General meaning:* General team collaboration tools (Slack, Notion, etc.).
- *In this project:* A **specific rendering and state-management protocol** within the canvas editor. The package renders collaborator state but does **not** implement the networking layer — that is the host application's responsibility.

---

## Library

**Name (in code):** `Library`, `LibraryItem`, `LibraryItems`

**Definition in this project:**
A user-managed collection of reusable element groups (e.g. diagrams, icons, shapes) that can be inserted onto the canvas. A **`LibraryItem`** is a named, versioned bundle of `NonDeleted<ExcalidrawElement>[]`. The **`Library`** class manages the current library state, handles async loading/saving, integrates with Jotai atoms (`libraryItemsAtom`), and notifies the host application via `onLibraryChange`.

```ts
export type LibraryItem = {
  id: string;
  status: "published" | "unpublished";
  elements: readonly NonDeleted<ExcalidrawElement>[];
  created: number;     // epoch ms
  name?: string;
  error?: string;
};
export type LibraryItems = readonly LibraryItem[];
```

**Where used (key files):**
- **Types:** `packages/excalidraw/types.ts` (`LibraryItem`, `LibraryItems`, `LibraryItem_v1`)
- **Class:** `packages/excalidraw/data/library.ts`
- **App ownership:** `packages/excalidraw/components/App.tsx` (`this.library = new Library(this)`)
- **Import/export:** `packages/excalidraw/data/types.ts` (`ImportedDataState.libraryItems`, `ExportedLibraryData`)
- **Actions:** `packages/excalidraw/actions/index.ts` (`actionAddToLibrary`)

**NOT to be confused with:**
- *General meaning:* A software dependency / npm package / code library.
- *In this project:* A **user-facing content library** — a saved collection of drawable element groups, analogous to a "sticker sheet" or "symbol palette" in design tools. It has nothing to do with code dependencies.

---

## Quick Reference

| Term | Type | Where defined | Key relationship |
|---|---|---|---|
| `ExcalidrawElement` | `type` (union) | `packages/element/src/types.ts` | Stored in `Scene`, returned by `ActionResult` |
| `Scene` | `class` | `packages/element/src/Scene.ts` | Owned by `App`, holds all `ExcalidrawElement`s |
| `AppState` | `interface` | `packages/excalidraw/types.ts` | React state of `App`; references `ActiveTool`, `Collaborator` |
| `ToolType` / `ActiveTool` | `type` | `packages/excalidraw/types.ts` | Stored in `AppState.activeTool` |
| `Action` / `ActionResult` | `interface` / `type` | `packages/excalidraw/actions/types.ts` | Managed by `ActionManager`; inputs/outputs are `Element[]` + `AppState` |
| `Collaborator` | `type` | `packages/excalidraw/types.ts` | Map in `AppState.collaborators`; rendered by `interactiveScene` |
| `Library` / `LibraryItem` | `class` / `type` | `packages/excalidraw/data/library.ts`, `types.ts` | Stores `ExcalidrawElement[]` groups; owned by `App` |
| `SceneData` | `type` | `packages/excalidraw/types.ts` | External API payload for `updateScene` |
