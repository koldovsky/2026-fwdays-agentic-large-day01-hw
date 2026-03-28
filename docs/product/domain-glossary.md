# Domain Glossary

This glossary defines key domain terms as they are used in this Excalidraw codebase.

## ExcalidrawElement
- **Definition:** The canonical serialized canvas object type (rectangle, text, arrow, image, frame, etc.) with geometry, style, versioning, and collaboration metadata.
- **Used in (key files):** `packages/element/src/types.ts`, `packages/element/src/Scene.ts`, `packages/excalidraw/components/App.tsx`.
- **Do not confuse with:** DOM `Element` or a generic UI element. In this project, it is a drawing model entity.

## Element
- **Definition:** A local alias often used in utility files for a narrowed element type (usually `NonDeletedExcalidrawElement`), not a single global domain type.
- **Used in (key files):** `packages/utils/src/withinBounds.ts`, `packages/element/src/types.ts`.
- **Do not confuse with:** The standard browser DOM `Element` interface.

## Scene
- **Definition:** The runtime in-memory container for all scene elements, indexes, and selection-aware lookups; it is the editor's authoritative element store.
- **Used in (key files):** `packages/element/src/Scene.ts`, `packages/excalidraw/components/App.tsx`, `packages/excalidraw/scene/Renderer.ts`.
- **Do not confuse with:** `SceneData` DTO or rendering functions; `Scene` is a stateful model object.

## SceneData
- **Definition:** A transport/update payload shape used by `updateScene` APIs (`elements`, `appState`, `collaborators`, `captureUpdate`).
- **Used in (key files):** `packages/excalidraw/types.ts`, `packages/excalidraw/components/App.tsx`.
- **Do not confuse with:** The `Scene` class that stores and mutates element state.

## AppState
- **Definition:** The full editor UI/session state (active tool, selection, viewport, dialogs, editing mode, collaborators map, and other transient flags).
- **Used in (key files):** `packages/excalidraw/types.ts`, `packages/excalidraw/appState.ts`, `packages/excalidraw/components/App.tsx`.
- **Do not confuse with:** The scene element list itself; element storage lives in `Scene`.

## ToolType
- **Definition:** The canonical union of built-in tool identifiers (`selection`, `rectangle`, `ellipse`, `laser`, etc.) used to model current interaction mode.
- **Used in (key files):** `packages/excalidraw/types.ts`, `packages/common/src/constants.ts`, `packages/excalidraw/components/MobileToolBar.tsx`.
- **Do not confuse with:** `ExcalidrawElementType` (what an element is) or an editor command/action.

## ActiveTool
- **Definition:** The currently selected tool state in `AppState`, including lock/custom mode metadata, not just a plain tool string.
- **Used in (key files):** `packages/excalidraw/types.ts`, `packages/excalidraw/appState.ts`, `packages/excalidraw/components/App.tsx`.
- **Do not confuse with:** `Action` definitions; this is current interaction mode, not a command to execute.

## Action
- **Definition:** A registered editor command with behavior (`perform`) and optional keyboard/UI wiring (for example undo, view mode toggle, add to library).
- **Used in (key files):** `packages/excalidraw/actions/types.ts`, `packages/excalidraw/actions/register.ts`, `packages/excalidraw/actions/manager.tsx`.
- **Do not confuse with:** `ToolType`; actions are discrete commands, tools are persistent modes.

## ActionResult
- **Definition:** The structured output of an executed `Action`, containing updates (`elements`, `appState`, `files`) and history capture policy.
- **Used in (key files):** `packages/excalidraw/actions/types.ts`, `packages/excalidraw/components/App.tsx`.
- **Do not confuse with:** API/network response objects; this is internal editor command output.

## Collab
- **Definition:** The application-layer collaboration coordinator that manages room lifecycle, sync, and remote updates around the editor.
- **Used in (key files):** `excalidraw-app/collab/Collab.tsx`, `excalidraw-app/collab/CollabWrapper.tsx`, `excalidraw-app/collab/Portal.tsx`.
- **Do not confuse with:** Core editor package internals; collab transport/orchestration is app-layer integration.

## Collaborator
- **Definition:** A per-user presence model (pointer, selection, username, colors, call status) keyed by `SocketId` in collaboration sessions.
- **Used in (key files):** `packages/excalidraw/types.ts`, `packages/excalidraw/appState.ts`, `excalidraw-app/collab/Collab.tsx`.
- **Do not confuse with:** Project contributors/maintainers; this means a live remote participant in a room.

## Library
- **Definition:** The runtime service and feature set for reusable shape/stencil collections, including loading, saving, and publishing workflows.
- **Used in (key files):** `packages/excalidraw/data/library.ts`, `packages/excalidraw/types.ts`, `packages/excalidraw/actions/actionAddToLibrary.ts`.
- **Do not confuse with:** The npm package/library distribution model; this is user shape assets inside the editor.

## LibraryItem
- **Definition:** A single reusable library entry containing an `elements` bundle plus metadata (`id`, `status`, `created`, optional `name`).
- **Used in (key files):** `packages/excalidraw/types.ts`, `packages/excalidraw/data/library.ts`, `packages/excalidraw/actions/actionAddToLibrary.ts`.
- **Do not confuse with:** Scene elements currently drawn on canvas; library items are reusable templates/stencils.
