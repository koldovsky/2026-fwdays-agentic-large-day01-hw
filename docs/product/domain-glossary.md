# Domain Glossary

This glossary defines project terms as they are used in this codebase.

## Element

- **Name:** `Element`
- **Definition:** A drawable/editor entity on canvas (shape, text, arrow, image, frame, embeddable, etc.) represented by Excalidraw element types.
- **Where used:** `packages/element/src/types.ts`, `packages/excalidraw/components/App.tsx`, `packages/excalidraw/actions/types.ts`.
- **Do not confuse with:** Generic UI "component element" in React. Here it is a scene object with geometry, style, versioning, and ids.

## ExcalidrawElement

- **Name:** `ExcalidrawElement`
- **Definition:** Union type for all persisted scene element variants (`rectangle`, `ellipse`, `text`, `arrow`, `image`, `frame`, `magicframe`, `iframe`, `embeddable`, etc.).
- **Where used:** `packages/element/src/types.ts` (type definition), `packages/excalidraw/types.ts`, `packages/excalidraw/actions/types.ts`.
- **Do not confuse with:** A single shape subtype. `ExcalidrawElement` is the top-level union over all subtypes.

## Scene

- **Name:** `Scene`
- **Definition:** Runtime container for editor elements/maps with mutation/query APIs used by `App` and rendering.
- **Where used:** `packages/excalidraw/components/App.tsx` (`this.scene = new Scene()`), `packages/excalidraw/scene/Renderer.ts` (reads scene elements), `@excalidraw/element` APIs.
- **Do not confuse with:** A serialized document only. In this project it is also a live runtime model used for rendering and editing operations.

## AppState

- **Name:** `AppState`
- **Definition:** Editor UI/interaction state model (tool selection, viewport, selection ids, dialogs, collaborators, editing flags, etc.).
- **Where used:** `packages/excalidraw/types.ts` (`interface AppState`), `packages/excalidraw/components/App.tsx`, `packages/excalidraw/hooks/useAppStateValue.ts`.
- **Do not confuse with:** Global app state manager (Redux-style). Here it is primarily `React.Component` state inside `App`.

## Tool

- **Name:** `Tool` (`ToolType`, `ActiveTool`)
- **Definition:** Current user drawing/interaction mode (`selection`, `lasso`, `arrow`, `text`, `eraser`, `hand`, `laser`, etc.).
- **Where used:** `packages/excalidraw/types.ts` (`ToolType`, `ActiveTool`), `packages/excalidraw/components/App.tsx`, toolbar components in `packages/excalidraw/components/*`.
- **Do not confuse with:** Dev/build tooling. Here "tool" means editor input mode.

## Action

- **Name:** `Action`
- **Definition:** Command abstraction with metadata and `perform(...)` function that transforms editor state and returns `ActionResult`.
- **Where used:** `packages/excalidraw/actions/types.ts`, `packages/excalidraw/actions/manager.tsx`, `packages/excalidraw/components/App.tsx`.
- **Do not confuse with:** Plain UI callback. It is a structured command with predicates, key bindings, analytics metadata, and update semantics.

## ActionResult

- **Name:** `ActionResult`
- **Definition:** Result payload from an action: optional `elements`, `appState`, `files`, plus required capture policy (`captureUpdate`).
- **Where used:** `packages/excalidraw/actions/types.ts`, `packages/excalidraw/actions/manager.tsx`, `packages/excalidraw/components/App.tsx` (`syncActionResult`).
- **Do not confuse with:** Side-effect status object only. It is the state transition contract between actions and `App`.

## ActionManager

- **Name:** `ActionManager`
- **Definition:** Registry/executor for actions. Resolves keyboard/UI/API actions, enforces predicates, invokes updater (`syncActionResult`).
- **Where used:** `packages/excalidraw/actions/manager.tsx`, `packages/excalidraw/components/App.tsx`.
- **Do not confuse with:** State store. It orchestrates command execution, not state persistence.

## CaptureUpdateAction

- **Name:** `CaptureUpdateAction`
- **Definition:** Update capture policy for store/history: `IMMEDIATELY`, `NEVER`, `EVENTUALLY`.
- **Where used:** `packages/element/src/store.ts`, `packages/excalidraw/actions/types.ts`, `packages/excalidraw/components/App.tsx`, `excalidraw-app/collab/Collab.tsx`.
- **Do not confuse with:** UI action names. This controls undo/redo/increment behavior in the store pipeline.

## Store

- **Name:** `Store`
- **Definition:** Snapshot/increment engine in `@excalidraw/element` that schedules macro/micro actions and emits durable/ephemeral increments.
- **Where used:** `packages/element/src/store.ts`, `packages/excalidraw/components/App.tsx` (`store.commit`, `scheduleAction`, `scheduleMicroAction`), `packages/excalidraw/history.ts`.
- **Do not confuse with:** Browser storage (localStorage/IndexedDB). This is an in-memory editor update pipeline.

## History

- **Name:** `History`
- **Definition:** Undo/redo manager built on store deltas (`HistoryDelta`, undoStack, redoStack).
- **Where used:** `packages/excalidraw/history.ts`, `packages/excalidraw/components/App.tsx` (undo/redo action registration and recording durable increments).
- **Do not confuse with:** Browser navigation history. It tracks editor content state transitions.

## Renderer

- **Name:** `Renderer`
- **Definition:** Helper that derives renderable/visible element subsets from scene and viewport state for canvas rendering.
- **Where used:** `packages/excalidraw/scene/Renderer.ts`, `packages/excalidraw/components/App.tsx`.
- **Do not confuse with:** React renderer internals. This is Excalidraw scene filtering/render preparation logic.

## StaticCanvas

- **Name:** `StaticCanvas`
- **Definition:** Canvas layer responsible for static scene rasterization (`renderStaticScene`) with memoized prop comparisons.
- **Where used:** `packages/excalidraw/components/canvases/StaticCanvas.tsx`, `packages/excalidraw/components/App.tsx`.
- **Do not confuse with:** Whole editor canvas. It is one render layer; interactive overlays are separate.

## InteractiveCanvas

- **Name:** `InteractiveCanvas`
- **Definition:** Canvas layer for interactive overlays and runtime interaction rendering (`renderInteractiveScene`) with animation loop.
- **Where used:** `packages/excalidraw/components/canvases/InteractiveCanvas.tsx`, `packages/excalidraw/components/App.tsx`.
- **Do not confuse with:** DOM event layer only. It both handles interaction hooks and drives interactive visual rendering.

## ExcalidrawAPI

- **Name:** `ExcalidrawImperativeAPI` / `ExcalidrawAPI`
- **Definition:** Imperative host-facing API object created in `App` (`updateScene`, `getAppState`, subscriptions, etc.).
- **Where used:** `packages/excalidraw/components/App.tsx` (`createExcalidrawAPI`), `packages/excalidraw/index.tsx` (`ExcalidrawAPIProvider`), `excalidraw-app/collab/Collab.tsx`.
- **Do not confuse with:** Network API. This is in-process runtime API for host integration.

## Library

- **Name:** `Library`
- **Definition:** Reusable item collection subsystem for saved snippets/shapes, with merge/update logic and persistence adapter hooks.
- **Where used:** `packages/excalidraw/data/library.ts` (`class Library`, `libraryItemsAtom`), `packages/excalidraw/components/App.tsx`.
- **Do not confuse with:** JS/TS package library. Here it means Excalidraw drawing-item library visible in editor UI.

## LibraryItem

- **Name:** `LibraryItem`
- **Definition:** A reusable grouped item stored in the Excalidraw library, diffed/merged by item hash/id.
- **Where used:** `packages/excalidraw/data/library.ts`, `packages/excalidraw/types.ts`.
- **Do not confuse with:** Generic list item in UI. It is a serialized drawing snippet unit.

## Collaboration

- **Name:** `Collaboration` / `Collaborator`
- **Definition:** Multi-user synchronization model (remote pointers, selection state, room sync, upload/download files).
- **Where used:** `packages/excalidraw/types.ts` (`Collaborator`, `CollaboratorPointer`), `excalidraw-app/collab/Collab.tsx`, `excalidraw-app/data/*`.
- **Do not confuse with:** Only websocket transport. In project context it includes state reconciliation, presence, viewport relay, and file sync.

## Reconcile

- **Name:** `reconcileElements`
- **Definition:** Merge/reconciliation routine for local/remote element updates preserving ordered/versioned element semantics.
- **Where used:** `packages/excalidraw/data/reconcile.ts`, exports in `packages/excalidraw/index.tsx`, usage in `excalidraw-app/collab/Collab.tsx`.
- **Do not confuse with:** React reconciliation. This is Excalidraw scene data reconciliation.

## BinaryFiles

- **Name:** `BinaryFiles` / `BinaryFileData`
- **Definition:** Mapping of file ids to binary asset metadata/dataURLs for image-like assets in scene.
- **Where used:** `packages/excalidraw/types.ts`, `packages/excalidraw/components/App.tsx` (`files`, `addFiles`, cache updates), `excalidraw-app/collab/Collab.tsx`.
- **Do not confuse with:** Raw filesystem files only. Here it is editor-managed binary asset state, often encoded and synced.

## Frame and MagicFrame

- **Name:** `ExcalidrawFrameElement`, `ExcalidrawMagicFrameElement`
- **Definition:** Frame-like element types for grouping/layout context; `magicframe` is used with diagram-to-code/AI-related workflows.
- **Where used:** `packages/element/src/types.ts`, `packages/excalidraw/components/App.tsx` (frame interactions and magic generation), action modules.
- **Do not confuse with:** Browser iframe. Frame elements are canvas objects; iframe element is a separate type (`type: "iframe"`).

## Embeddable / Iframe element

- **Name:** `ExcalidrawEmbeddableElement`, `ExcalidrawIframeElement`, `ExcalidrawIframeLikeElement`
- **Definition:** Elements that represent embedded external or generated rich content with validation/render activation rules.
- **Where used:** `packages/element/src/types.ts`, `packages/excalidraw/components/App.tsx` (embed validation/render/activation paths).
- **Do not confuse with:** Plain hyperlink. These are first-class scene elements rendered/managed by editor runtime.

