# Domain Glossary

Scope: Definitions below are specific to this repository and its runtime model.

## Excalidraw
- Name: Excalidraw
- Definition in this project context: The combined drawing engine and app ecosystem in this monorepo: reusable editor core in `packages/excalidraw`, element/scene primitives in `packages/element`, and the hosted product shell in `excalidraw-app`.
- Key usage files:
  - `packages/excalidraw/components/App.tsx`
  - `excalidraw-app/App.tsx`
  - `packages/excalidraw/types.ts`

## Element
- Name: Element
- Definition in this project context: A single scene object instance (shape, text, arrow, image, frame, iframe, embeddable, etc.) represented by the `ExcalidrawElement` union and stored in scene arrays/maps.
- Key usage files:
  - `packages/element/src/types.ts`
  - `packages/element/src/Scene.ts`
  - `packages/excalidraw/data/restore.ts`

## ExcalidrawElement
- Name: ExcalidrawElement
- Definition in this project context: The canonical JSON-serializable union type for all drawable/shareable scene entities. It is designed to be peer-shareable and avoid peer-local computed state.
- Key usage files:
  - `packages/element/src/types.ts`
  - `packages/excalidraw/data/types.ts`
  - `packages/excalidraw/data/restore.ts`

## Scene
- Name: Scene
- Definition in this project context: The in-memory element container and query/update surface (`Scene` class) that keeps ordered elements, non-deleted maps, frame caches, selection cache, and scene nonce used by rendering/invalidation paths.
- Key usage files:
  - `packages/element/src/Scene.ts`
  - `packages/excalidraw/components/App.tsx`
  - `packages/excalidraw/scene/types.ts`

## AppState
- Name: AppState
- Definition in this project context: The editor runtime state model covering interaction, UI visibility, selection/editing state, active tool metadata, viewport, export settings, collaboration metadata, and many transient interaction fields.
- Key usage files:
  - `packages/excalidraw/types.ts`
  - `packages/excalidraw/components/App.tsx`
  - `excalidraw-app/App.tsx`

## Tool
- Name: Tool
- Definition in this project context: A selected interaction mode described by `ToolType` and `ActiveTool` (for example selection, lasso, shape tools, hand, eraser, frame, embeddable, laser, or host-defined custom tool type).
- Key usage files:
  - `packages/excalidraw/types.ts`
  - `packages/excalidraw/components/App.tsx`
  - `packages/excalidraw/actions/actionCanvas.tsx`

## Action
- Name: Action
- Definition in this project context: A command contract (`Action`) with perform/predicate/hotkey/panel metadata, registered via `register()` and executed by `ActionManager` from UI, keyboard, context menu, API, or command palette sources.
- Key usage files:
  - `packages/excalidraw/actions/types.ts`
  - `packages/excalidraw/actions/register.ts`
  - `packages/excalidraw/actions/manager.tsx`

## Collaboration
- Name: Collaboration
- Definition in this project context: The real-time co-editing pipeline in `excalidraw-app` that syncs scene deltas, pointer/idle metadata, and file states via socket transport (`Portal`) plus Firebase persistence/reconciliation.
- Key usage files:
  - `excalidraw-app/collab/Collab.tsx`
  - `excalidraw-app/collab/Portal.tsx`
  - `excalidraw-app/data/firebase.ts`

## SyncableExcalidrawElement
- Name: SyncableExcalidrawElement
- Definition in this project context: A branded ordered element subset eligible for network/persistence sync; excludes invisibly small elements and only keeps deleted ones during a configured retention window.
- Key usage files:
  - `excalidraw-app/data/index.ts`
  - `excalidraw-app/collab/Portal.tsx`
  - `excalidraw-app/collab/Collab.tsx`

## Library
- Name: Library
- Definition in this project context: The user-maintained collection of reusable drawing snippets represented by `LibraryItem[]` (v2 schema), managed with update queues/adapters and integrated with add-to-library actions.
- Key usage files:
  - `packages/excalidraw/types.ts`
  - `packages/excalidraw/data/library.ts`
  - `packages/excalidraw/actions/actionAddToLibrary.ts`

## LibraryItem
- Name: LibraryItem
- Definition in this project context: A typed reusable snippet record containing id, publish status, non-deleted element payload, creation timestamp, and optional metadata fields used by library workflows.
- Key usage files:
  - `packages/excalidraw/types.ts`
  - `packages/excalidraw/data/library.ts`
  - `packages/excalidraw/data/types.ts`
