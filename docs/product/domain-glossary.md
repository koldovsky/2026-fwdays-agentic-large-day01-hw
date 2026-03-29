# Domain glossary

Project-specific vocabulary for the Excalidraw monorepo (`excalidraw-app`, `@excalidraw/excalidraw`, `@excalidraw/element`). Names are given in English as they appear in code.

---

## Element

**Definition**  
A single drawable object on the canvas: rectangles, ellipses, arrows, text, images, frames, etc. Elements are immutable records with geometry, style (`strokeColor`, `roughness`, …), identity (`id`), versioning (`version`, `versionNonce`), ordering (`index`), grouping (`groupIds`), and optional links/bindings. The union type is `ExcalidrawElement` in `@excalidraw/element`.

**Where used**  
`packages/element/src/types.ts` (type definitions), `packages/element/src/Scene.ts` (storage), `packages/excalidraw/components/App.tsx` (orchestration), `packages/excalidraw/actions/types.ts` (`ActionResult.elements`).

**Do not confuse with**  
A DOM/React “element.” Here it always means a canvas **data model** instance, not a JSX node.

---

## ExcalidrawElement

**Definition**  
The TypeScript union of all non-deleted and deleted element variants (shapes, lines, text, images, …) plus shared fields on `_ExcalidrawElementBase`. Narrowing uses the `type` discriminator (e.g. `"rectangle"`, `"arrow"`).

**Where used**  
`packages/element/src/types.ts` (`export type ExcalidrawElement`), re-exported across `packages/excalidraw` and `excalidraw-app`.

**Do not confuse with**  
“An element from Excalidraw” in casual speech without a type—the capital-E name refers specifically to this **union type** and its values.

---

## OrderedExcalidrawElement

**Definition**  
An `ExcalidrawElement` wrapped with ordering metadata (`Ordered<T>`) so the scene array order and fractional `index` stay aligned for multiplayer and undo/redo.

**Where used**  
`packages/element/src/types.ts`, `packages/element/src/Scene.ts` (`elements` array), action `perform` signatures in `packages/excalidraw/actions/types.ts`.

**Do not confuse with**  
“Sorted elements” in a generic sense—the name reflects **scene list ordering** and branded ordering types, not arbitrary sort keys.

---

## Scene

**Definition**  
The authoritative in-memory **container** for all canvas elements: ordered list, maps for lookup (including deleted), selection helpers, `sceneNonce` for render invalidation, and `onUpdate` subscribers. Geometry lives here; UI chrome does not.

**Where used**  
`packages/element/src/Scene.ts`, `packages/excalidraw/components/App.tsx` (`this.scene`), `docs/technical/architecture.md`.

**Do not confuse with**  
A “scene” in 3D engines or theatre. Here it is the **2D document model** (element graph + caches), not a single screenshot or slide.

---

## AppState

**Definition**  
Large React state object on `App` for everything that is **not** stored as standalone scene elements: active tool, selection sets, viewport (`scrollX`/`scrollY`/`zoom`), dialogs, collaboration maps (`collaborators`), style defaults for new drawings, theme, grid, etc. Persisted subsets are controlled via `APP_STATE_STORAGE_CONF` in `appState.ts`.

**Where used**  
`packages/excalidraw/types.ts`, `packages/excalidraw/appState.ts` (`getDefaultAppState`), `packages/excalidraw/components/App.tsx`, contexts `ExcalidrawAppStateContext` / `ExcalidrawSetAppStateContext`.

**Do not confuse with**  
Global Redux-style “app state” in general, or the **Scene**. `AppState` is **editor UI + camera + collaboration chrome**; drawable content is mostly in `Scene`.

---

## App

**Definition**  
The main **class** React component that owns `Scene`, `Store`, `ActionManager`, canvas refs, and `AppState`. It connects pointer handlers, `updateScene`, history, and embed API callbacks.

**Where used**  
`packages/excalidraw/components/App.tsx`, `packages/excalidraw/index.tsx` (wrapped by `Excalidraw`), tests under `packages/excalidraw/tests/`.

**Do not confuse with**  
`excalidraw-app` (the host web app) or a generic “application.” The identifier **`App`** is this **editor controller component**.

---

## Excalidraw (component)

**Definition**  
The public **embeddable React component** that mounts the editor (`App`), providers (Jotai, contexts), and wires props/imperative API. Consumers import `@excalidraw/excalidraw`.

**Where used**  
`packages/excalidraw/index.tsx`, `excalidraw-app/App.tsx` (host), `examples/*`.

**Do not confuse with**  
The product name “Excalidraw” or the repository folder `packages/excalidraw/`. **`Excalidraw`** in code usually means this **component export**.

---

## Tool / ToolType / ActiveTool

**Definition**  
**Tool** is the current editing mode: selection, shapes, freedraw, text, eraser, hand pan, frame, laser, etc. `ToolType` lists allowed string literals; `ActiveTool` is either a built-in tool or a `"custom"` tool with `customType`.

**Where used**  
`packages/excalidraw/types.ts` (`ToolType`, `ActiveTool`, `appState.activeTool`), toolbar and pointer routing in `packages/excalidraw/components/`.

**Do not confuse with**  
Browser devtools, CLI tools, or an `ExcalidrawElement`—a **tool** is **mode of interaction**, not a shape on the canvas.

---

## Action

**Definition**  
A registered command object with `perform(elements, appState, value, app)` returning `ActionResult` (or `false`). Actions drive menus, keyboard shortcuts, command palette, and programmatic API. Names are enumerated as `ActionName`.

**Where used**  
`packages/excalidraw/actions/types.ts`, `packages/excalidraw/actions/manager.tsx` (`ActionManager`), files under `packages/excalidraw/actions/`.

**Do not confuse with**  
Redux actions, Redux Toolkit `createAction`, or generic “user action” events—here **`Action`** is a **first-class editor command** with optional UI (`PanelComponent`).

---

## ActionManager

**Definition**  
Registry and dispatcher for all **Actions**: `executeAction`, `handleKeyDown`, `renderAction`, predicate checks. It reads current elements/state from `App` and forwards results to the **`syncActionResult`** pipeline.

**Where used**  
`packages/excalidraw/actions/manager.tsx`, constructed in `packages/excalidraw/components/App.tsx`.

**Do not confuse with**  
OS window manager or React `Action` types from other libraries.

---

## ActionResult

**Definition**  
Outcome of running an action: optional new `elements`, partial `appState`, `files`, `replaceFiles`, and required **`captureUpdate`** (how the change participates in undo/history). Can be `false` to block the action.

**Where used**  
`packages/excalidraw/actions/types.ts`, `syncActionResult` in `packages/excalidraw/components/App.tsx`.

**Do not confuse with**  
HTTP response bodies or Promise **result** values in general—the shape is **editor-specific**.

---

## Collaboration / Collaborator

**Definition**  
**Collaboration** is live multi-user editing over a shared room: remote cursors, selection, and idle state are represented in `AppState.collaborators` as a map of socket-related entries. A **`Collaborator`** value holds pointer position, optional selection, username, colors, avatar, etc.

**Where used**  
`packages/excalidraw/types.ts` (`Collaborator`, `AppState.collaborators`), `packages/excalidraw/components/canvases/InteractiveCanvas.tsx`, `excalidraw-app/collab/Collab.tsx`.

**Do not confuse with**  
Comments-only “collaboration” or Git collaboration—here it means **real-time presence on the canvas**.

---

## Room

**Definition**  
A **collaboration session** identified in the URL (e.g. hash `#room=id,key`) with Socket.io and Firebase-backed sync. Distinct from a one-off **shareable read-only link** (encrypted snapshot).

**Where used**  
`excalidraw-app/collab/Collab.tsx`, `excalidraw-app/share/ShareDialog.tsx`, `docs/memory/productContext.md`.

**Do not confuse with**  
Chat “rooms” or physical rooms—the term is **URL-bound session** for sync.

---

## Portal

**Definition**  
In the host app, **`Portal`** is a **class** that owns the Socket.io connection and listeners for collaboration, used by `Collab`. It is not React `createPortal`.

**Where used**  
`excalidraw-app/collab/Portal.tsx`, `excalidraw-app/collab/Collab.tsx`.

**Do not confuse with**  
React DOM **Portal** (`createPortal`) or network “portal” products—this is the **collab transport helper** for the web app.

---

## Library

**Definition**  
User’s **reusable shape collection** (sidebar): items can be dragged onto the canvas, imported/exported as `.excalidrawlib`, or loaded from allowed URLs. Implemented with Jotai-backed state in `data/library.ts` and UI in the app sidebar.

**Where used**  
`packages/excalidraw/data/library.ts`, `excalidraw-app/components/AppSidebar.tsx`, `packages/excalidraw/types.ts` (`LibraryItems`, `LibraryItem`).

**Do not confuse with**  
npm **package** libraries, or the **public shape library** website as a product—this glossary entry is the **in-app Library panel data**.

---

## LibraryItem

**Definition**  
One entry in the library: typically a small template of elements (and metadata) that can be inserted onto the canvas.

**Where used**  
`packages/excalidraw/types.ts`, `packages/excalidraw/data/library.ts`, restore/load paths in `packages/excalidraw/data/`.

**Do not confuse with**  
Any generic “item”—it is **typed library content**, not a scene element until inserted.

---

## Store (element package)

**Definition**  
**`Store`** records observable edits for **undo/redo** and external consumers: schedules `CaptureUpdateAction` (`IMMEDIATELY` / `NEVER` / `EVENTUALLY`), commits with current element map + `AppState`, emits durable/ephemeral increments for `History`.

**Where used**  
`packages/element/src/store.ts`, `packages/excalidraw/components/App.tsx` (`commit`, `scheduleAction`).

**Do not confuse with**  
Redux/Zustand **store**, Jotai **store** (`editorJotaiStore`), or Firebase—this **`Store`** is the **history/capture layer** next to `Scene`.

---

## History

**Definition**  
Undo/redo stacks fed by **durable** store increments when the user performs undoable edits; navigation-only changes are excluded per product behavior.

**Where used**  
`packages/excalidraw/history.ts`, wired from `App.tsx` via `Store.onDurableIncrementEmitter`.

**Do not confuse with**  
Browser session **history** or Git **history**.

---

## CaptureUpdateAction

**Definition**  
Enum-like constants controlling whether a change is **undoable immediately**, **never** (e.g. remote/init), or **eventually** (multi-step/async). Carried on `ActionResult.captureUpdate` and `updateScene`.

**Where used**  
`packages/element/src/store.ts` (`CaptureUpdateAction`), `packages/excalidraw/actions/types.ts`, `updateScene` in `App.tsx`.

**Do not confuse with**  
React `capture` phase or “screen capture.”

---

## Renderer (`Renderer` class)

**Definition**  
Memoized helper that computes **which elements are visible** in the viewport and builds **`RenderableElementsMap`** for static/interactive canvas passes (skips double-draw for text being edited, etc.).

**Where used**  
`packages/excalidraw/scene/Renderer.ts`, `packages/excalidraw/components/App.tsx`.

**Do not confuse with**  
React **renderer** (react-dom) or a generic “graphics renderer” product.

---

## BinaryFiles

**Definition**  
Mapping from **file id** (associated with image elements) to `BinaryFileData` (mime, `dataURL`, timestamps). Large blobs are tracked separately from vector element JSON.

**Where used**  
`packages/excalidraw/types.ts` (`BinaryFiles`, `BinaryFileData`), `packages/excalidraw/components/App.tsx` (`App.files`), export/import flows.

**Do not confuse with**  
Raw `File` browser objects or arbitrary binary **files** on disk—the type is **in-memory asset payloads** for the scene.

---

## Frame / frame element

**Definition**  
A **frame**-like element (`frame`, `magicframe`, …) groups or clips content for presentation/export; other elements may reference `frameId`. Distinct from browser **iframe** embeds (`embeddable` / `iframe` types have their own rules).

**Where used**  
`packages/element/src/types.ts` (`frameId`, frame-like types), frame rendering and export in `packages/excalidraw` / `packages/element`.

**Do not confuse with**  
Video **frames**, stack **frames**, or only the HTML `<iframe>` tag—**frame** here is a **canvas layout region** type.

---

## Binding / boundElements

**Definition**  
**Binding** connects arrows (and related geometry) to shapes or text so endpoints move with targets. `boundElements` on an element lists attached connectors/text; linear elements store binding metadata for endpoints.

**Where used**  
`packages/element/src/types.ts` (`BoundElement`, `boundElements`), `packages/excalidraw/types.ts` (`bindMode`), arrow tools and hit-testing in `packages/excalidraw` / `packages/element`.

**Do not confuse with**  
Data **binding** in UI frameworks, or keybinding **bindings**—here it means **connector attachment** to shapes.

---

## updateScene

**Definition**  
Central **`App`** method to apply partial **elements**, **appState**, **collaborators**, and optional **captureUpdate** in one coordinated update (may schedule store micro-actions before mutating scene/React state).

**Where used**  
`packages/excalidraw/components/App.tsx`, embed API and collaboration code paths.

**Do not confuse with**  
A generic “refresh the page” update—it is the **typed editor batch API** for scene + UI.

---

## sceneNonce

**Definition**  
Opaque token incremented when the **Scene** changes, used to invalidate memoized render work (visibility maps, canvas caches) without relying only on reference equality.

**Where used**  
`packages/element/src/Scene.ts` (`getSceneNonce`), `packages/excalidraw/scene/Renderer.ts`, canvas components.

**Do not confuse with**  
Cryptographic **nonce**—here it is a **cache-busting generation counter**.

---

## Related documentation

- `docs/technical/architecture.md` — data flow and package layout  
- `docs/memory/productContext.md` — user-visible features and flows  
