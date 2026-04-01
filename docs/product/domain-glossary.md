# Domain Glossary

This glossary uses the project’s own terms as they appear in the codebase.
Definitions below are limited to meanings supported by the source files.

## Element

**Definition in this project**

An Element is a drawable or placeable item in Excalidraw’s editor model.
In code, concrete elements share a common base shape and include types such as rectangle, ellipse, text, arrow, freedraw, image, frame, magicframe, iframe, and embeddable.

**Where it is used**

- `packages/element/src/types.ts`
- `packages/element/src/Scene.ts`
- `packages/excalidraw/components/App.tsx`
- `packages/excalidraw/renderer/staticScene.ts`

**Do NOT confuse with**

Do not confuse it with a generic DOM element or React element.
Here it means an editor-domain object stored in the scene and rendered on the canvas.

## Bound Element

**Definition in this project**

A Bound Element is an element that is attached to another element through the editor's binding/container relationships.
In the codebase, this appears through fields such as `boundElements` on container elements and `containerId` on text elements, so the relationship is part of the scene model rather than a visual grouping only.

**Where it is used**

- `packages/element/src/types.ts`
- `packages/excalidraw/data/restore.ts`
- `packages/excalidraw/wysiwyg/textWysiwyg.tsx`
- `packages/utils/src/withinBounds.ts`

**Do NOT confuse with**

Do not confuse it with a generic parent-child UI hierarchy or a grouped selection.
Here it means a specific editor relationship used for attached text and other element-to-element bindings that must be restored and maintained in scene data.

## ExcalidrawElement

**Definition in this project**

`ExcalidrawElement` is the union type for the project’s shareable editor elements.
The type comment in `packages/element/src/types.ts` says these elements should be JSON serializable, contain no computed data, and be shareable between peers without peer-local state.

**Where it is used**

- `packages/element/src/types.ts`
- `packages/excalidraw/types.ts`
- `packages/excalidraw/actions/types.ts`
- `packages/excalidraw/data/library.ts`

**Do NOT confuse with**

Do not confuse it with “any object on screen.”
In this project it is a specific serialized editor data model used for storage, sync, and rendering.

## Linear Element

**Definition in this project**

A Linear Element is the Excalidraw element family whose geometry is defined by ordered points rather than only width and height.
In this repository, arrows and lines are treated as linear elements, and the runtime has dedicated state and editing flows for point creation, point dragging, and linear-element-specific selection behavior.

**Where it is used**

- `packages/excalidraw/types.ts`
- `packages/excalidraw/components/App.tsx`
- `packages/excalidraw/renderer/interactiveScene.ts`
- `packages/utils/src/withinBounds.ts`

**Do NOT confuse with**

Do not confuse it with any shape that merely looks straight.
Here it means a specific element category with point-based editing rules and dedicated runtime handling in the editor.

## Scene

**Definition in this project**

`Scene` is the stateful container for the editor’s element graph.
It stores all elements including deleted ones, non-deleted subsets, lookup maps, frame collections, a selected-elements cache, and a `sceneNonce` used for renderer cache invalidation.

**Where it is used**

- `packages/element/src/Scene.ts`
- `packages/excalidraw/components/App.tsx`
- `packages/excalidraw/scene/Renderer.ts`

**Do NOT confuse with**

Do not confuse it with a visual “screen” or route.
Here it means the in-memory editor model of elements and related lookup structures.

## AppState

**Definition in this project**

`AppState` is the main editor UI/runtime state shape.
It includes tool state, selection state, editing state, export settings, view settings, zoom and scroll, dialog and sidebar state, collaborators, canvas dimensions, and other runtime flags.

**Where it is used**

- `packages/excalidraw/types.ts`
- `packages/excalidraw/components/App.tsx`
- `packages/excalidraw/actions/types.ts`
- `packages/excalidraw/components/canvases/StaticCanvas.tsx`
- `packages/excalidraw/components/canvases/InteractiveCanvas.tsx`

**Do NOT confuse with**

Do not confuse it with the whole application database.
In this project it is the editor’s current UI/runtime state, separate from files, history, and some scene-owned data.

## Tool

**Definition in this project**

`ToolType` is the set of editor tools such as `selection`, `lasso`, `rectangle`, `diamond`, `ellipse`, `arrow`, `line`, `freedraw`, `text`, `image`, `eraser`, `hand`, `frame`, `magicframe`, `embeddable`, and `laser`.
The active tool is represented through `ActiveTool` and the `AppState.activeTool` field.

**Where it is used**

- `packages/excalidraw/types.ts`
- `packages/excalidraw/components/App.tsx`
- `packages/excalidraw/components/LayerUI.tsx`

**Do NOT confuse with**

Do not confuse it with a build tool or developer utility.
Here it means the currently selected editor interaction mode.

## Action

**Definition in this project**

An `Action` is a named editor operation with metadata and behavior.
The type includes fields such as `name`, `label`, `perform`, optional keyboard tests, predicates, tracking metadata, and optional panel UI.
Running an action produces an `ActionResult`, which may update elements, app state, or files.

**Where it is used**

- `packages/excalidraw/actions/types.ts`
- `packages/excalidraw/actions/manager.tsx`
- `packages/excalidraw/components/App.tsx`

**Do NOT confuse with**

Do not confuse it with a Redux action object or a generic user intent.
In this project it is a richer executable editor command definition.

## ActionManager

**Definition in this project**

`ActionManager` is the runtime object that registers actions, resolves keyboard actions, executes actions, and renders action panel components.
It reads current app state and current elements through getters provided by `App`.

**Where it is used**

- `packages/excalidraw/actions/manager.tsx`
- `packages/excalidraw/components/App.tsx`
- `packages/excalidraw/components/LayerUI.tsx`

**Do NOT confuse with**

Do not confuse it with a background job scheduler.
Here it is the editor command dispatcher and action UI bridge.

## Store

**Definition in this project**

`Store` is the object that captures observed changes and emits store increments.
Its source comment describes it as a store that captures observed changes and emits them as `StoreIncrement` events.
It tracks snapshots, scheduled macro actions, and scheduled micro actions, and it can emit durable and ephemeral increments.

**Where it is used**

- `packages/element/src/store.ts`
- `packages/excalidraw/components/App.tsx`

**Do NOT confuse with**

Do not confuse it with a general-purpose global application store.
In this project it is a change-capture and increment-emission mechanism tied closely to undo/redo and scene updates.

## History

**Definition in this project**

`History` is the undo/redo layer attached to the editor store.
`App.tsx` constructs it from the `Store`, and durable increments recorded by the store are forwarded into history.

**Where it is used**

- `packages/excalidraw/components/App.tsx`
- `packages/excalidraw/actions/actionHistory` via undo/redo registration in `App.tsx`

**Do NOT confuse with**

Do not confuse it with browser history.
Here it means editor mutation history for undo and redo.

## Collaborator

**Definition in this project**

`Collaborator` is the editor-side data shape for a remote or current participant in a collaboration session.
It can include pointer state, selected element IDs, username, idle state, color data, avatar URL, socket ID, call presence flags, and current-user markers.

**Where it is used**

- `packages/excalidraw/types.ts`
- `excalidraw-app/collab/Collab.tsx`
- `packages/excalidraw/components/canvases/InteractiveCanvas.tsx`

**Do NOT confuse with**

Do not confuse it with a general organization user record.
In this project it is the runtime collaboration-presence model used for rendering and session behavior.

## Collaboration

**Definition in this project**

Collaboration is the live multi-user editing mode built around `Collab`, `CollabAPI`, room links, socket-based updates, and Firebase-backed scene/file flows.
The app exposes collaboration through methods like `startCollaboration`, `stopCollaboration`, `syncElements`, `fetchImageFilesFromFirebase`, and `onPointerUpdate`.

**Where it is used**

- `excalidraw-app/collab/Collab.tsx`
- `excalidraw-app/App.tsx`
- `excalidraw-app/share/ShareDialog.tsx`

**Do NOT confuse with**

Do not confuse it with static sharing.
In this project collaboration specifically means an active live session with participant presence and synchronized updates.

## Library

**Definition in this project**

`Library` is the editor feature for storing reusable sets of elements as library items.
The `Library` class manages current library items, update notifications, persistence hooks, loading state, and reconciliation with external or persisted sources.

**Where it is used**

- `packages/excalidraw/data/library.ts`
- `packages/excalidraw/components/App.tsx`
- `excalidraw-app/App.tsx`

**Do NOT confuse with**

Do not confuse it with an npm package library.
Here it means the in-editor reusable item collection.

## LibraryItem

**Definition in this project**

`LibraryItem` is the stored unit inside the Excalidraw library.
It has an `id`, a `status` of `published` or `unpublished`, a list of non-deleted elements, a creation timestamp, and optional `name` or `error`.

**Where it is used**

- `packages/excalidraw/types.ts`
- `packages/excalidraw/data/library.ts`

**Do NOT confuse with**

Do not confuse it with a source code module or asset bundle.
In this project it is a reusable saved drawing fragment.

## BinaryFileData

**Definition in this project**

`BinaryFileData` is the project’s file payload type for editor-managed binary assets, especially images.
It stores MIME type, ID, `dataURL`, creation timestamp, optional `lastRetrieved`, and optional version.

**Where it is used**

- `packages/excalidraw/types.ts`
- `excalidraw-app/data/LocalData.ts`
- `excalidraw-app/data/firebase.ts`
- `excalidraw-app/collab/Collab.tsx`

**Do NOT confuse with**

Do not confuse it with a raw browser `File` object.
In this project it is the normalized persisted asset representation used by the editor and storage layers.

## ActiveTool

**Definition in this project**

`ActiveTool` is the structured representation of the current selected tool.
It is either a built-in `ToolType` with `customType: null` or a custom tool with `type: "custom"` and a string `customType`.
In `AppState.activeTool`, it is extended with fields such as `lastActiveTool`, `locked`, and `fromSelection`.

**Where it is used**

- `packages/excalidraw/types.ts`
- `packages/excalidraw/components/App.tsx`

**Do NOT confuse with**

Do not confuse it with the broader list of available tools.
Here it means the current runtime selection plus extra editor control metadata.

## Source Basis

This glossary was derived from:

- `packages/excalidraw/types.ts`
- `packages/element/src/types.ts`
- `packages/element/src/Scene.ts`
- `packages/excalidraw/actions/types.ts`
- `packages/excalidraw/actions/manager.tsx`
- `packages/excalidraw/data/library.ts`
- `packages/excalidraw/components/App.tsx`
- `excalidraw-app/collab/Collab.tsx`
- `excalidraw-app/data/LocalData.ts`
