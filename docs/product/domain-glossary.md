# Domain glossary

A glossary of domain terms used in the codebase. Term names are listed **in English** (as they appear in code).

---

## Element

- **Name (in code)**: `ExcalidrawElement` (and concrete subtypes such as `ExcalidrawRectangleElement`, `ExcalidrawTextElement`, …)
- **Definition (in this project)**: a serializable (JSON-friendly) object describing a single drawn entity on the canvas: geometry (position/size/angle), style, metadata (groups/frames/link), and versioning used for sync and reconciliation.
- **Where it’s used (key files)**:
  - `packages/element/src/types.ts` (source of truth for element types)
  - `packages/element/src/Scene.ts` (storing/updating the scene’s element list)
  - `packages/excalidraw/types.ts` (how elements relate to `AppState`, canvas, API)
- **Do not confuse with**:
  - Browser DOM `Element`: here “element” means a **domain shape on the canvas**, not a DOM node.
  - React element: this is not a `ReactElement`, it’s scene data.

## ExcalidrawElement

- **Name (in code)**: `ExcalidrawElement`
- **Definition (in this project)**: a union type of all supported element kinds (rectangle/diamond/ellipse/text/line/arrow/freedraw/image/frame/…); the primary unit for persistence/export/collaboration.
- **Where it’s used (key files)**:
  - `packages/element/src/types.ts` (definition + base fields)
  - `packages/excalidraw/data/restore.ts` (restore/migrations/normalization)
  - `packages/excalidraw/data/reconcile.ts` (local/remote change reconciliation)
- **Do not confuse with**:
  - “any object on the scene”: in this project it’s a strict schema with versioning and a serialization contract.

## Scene

- **Name (in code)**: `Scene`
- **Definition (in this project)**: a container for the current set of elements (including/excluding deleted), their map indexes, selection caches, and nonces for render cache invalidation; responsible for replacing/inserting/mutating elements and notifying subscribers about updates.
- **Where it’s used (key files)**:
  - `packages/element/src/Scene.ts` (the `Scene` implementation)
  - `packages/excalidraw/components/App.tsx` (creating and using a scene in the editor)
  - `packages/excalidraw/scene/*` (render/export/scroll/zoom working with scene elements)
- **Do not confuse with**:
  - “scene” as a **screen/route**: here it’s the **canvas data model** (elements + indexes/caches).
  - `SceneData`: a payload/structure for updates/import, not the `Scene` container object.

## AppState

- **Name (in code)**: `AppState`
- **Definition (in this project)**: the editor’s large state describing UI/interaction and working “modes” (active tool, selection, scroll/zoom, dialogs/sidebars, snapping, collaborators, binding/cropping/search, etc.). Unlike `ExcalidrawElement`, `AppState` is not meant to be fully shareable across peers (parts are local/ephemeral).
- **Where it’s used (key files)**:
  - `packages/excalidraw/types.ts` (the `AppState` interface)
  - `packages/excalidraw/components/App.tsx` (editor state management)
  - `excalidraw-app/collab/Collab.tsx` (reading/updating state during collaboration, e.g. follow/viewport)
- **Do not confuse with**:
  - “application state” as global Redux-like state: here it’s **state of a specific Excalidraw editor instance**.
  - “scene state”: `AppState` and `Scene` are different planes (UI vs element data).

## Tool

- **Name (in code)**: `ToolType`, `ActiveTool`
- **Definition (in this project)**: the user’s current interaction tool for the canvas (selection, rectangle, arrow, text, eraser, hand, frame, laser, …). `ToolType` is the tool enum, `ActiveTool` represents the active tool including “custom” tool metadata.
- **Where it’s used (key files)**:
  - `packages/excalidraw/types.ts` (definitions of `ToolType`, `ActiveTool`, and `AppState.activeTool`)
  - `packages/excalidraw/components/App.tsx` (pointer/keyboard handling depends on the tool)
  - `packages/excalidraw/components/*Tool*` (tool selection UI)
- **Do not confuse with**:
  - “tool” as external CLI/tooling: here it’s an **editor mode** that defines how input is interpreted.
  - “shape type”: a tool may create an element of some `ExcalidrawElement["type"]`, but they’re not the same concept.

## Action

- **Name (in code)**: `Action`, `ActionName`, `ActionResult`
- **Definition (in this project)**: a command description (UI/keyboard/context menu/API) that can change elements/appState/files; includes metadata (label/keywords/icon), a `perform()` implementation, and optionally a UI panel component.
- **Where it’s used (key files)**:
  - `packages/excalidraw/actions/types.ts` (action contracts)
  - `packages/excalidraw/actions/*` (individual action implementations)
  - `packages/excalidraw/components/Actions.tsx` (rendering/dispatching available actions)
- **Do not confuse with**:
  - “Redux action”: here `Action` is Excalidraw’s **internal command system**, not necessarily a serialized event.
  - “tool action” as a gesture: actions are **commands**, tools are **input interpretation modes**.

## Collaboration

- **Name (in code)**: `Collab`, `CollabAPI`, `Portal`, `Collaborator`
- **Definition (in this project)**: a co-editing mode where scene elements and cursor/idle/viewport-follow events are synchronized between clients via websockets and (for persistence/files) Firebase. `Portal` encapsulates the socket protocol; `Collab` manages lifecycle, reconciliation, and integration with the Excalidraw API.
- **Where it’s used (key files)**:
  - `excalidraw-app/collab/Collab.tsx` (collaboration entrypoint in the host app)
  - `excalidraw-app/collab/Portal.tsx` (socket, broadcast, encrypt/decrypt)
  - `packages/excalidraw/types.ts` (types `Collaborator`, `SocketId`, `AppState.collaborators`)
- **Do not confuse with**:
  - “real-time presence” as a generic term: here it’s a **specific protocol** (INIT/UPDATE/MOUSE_LOCATION/IDLE_STATUS/USER_VISIBLE_SCENE_BOUNDS) + sync rules (element versions, reconcile).
  - “shared document”: collaboration here synchronizes **Excalidraw elements + parts of UI state**, not an arbitrary document.

## Library

- **Name (in code)**: `Library`, `LibraryItem`, `LibraryItems`
- **Definition (in this project)**: a collection of reusable “snippets” (items); each `LibraryItem` contains `elements` (usually a small group of shapes) plus metadata (id/status/created/name). It has an update queue, update diffing, and integration with a host persistence adapter.
- **Where it’s used (key files)**:
  - `packages/excalidraw/types.ts` (types `LibraryItem`, `LibraryItems`, `LibraryItemsSource`)
  - `packages/excalidraw/data/library.ts` (the `Library` class, persistence/migration adapters, `updateLibrary()`)
  - `packages/excalidraw/components/LibraryMenu*.tsx` (library UI)
  - `packages/excalidraw/actions/actionAddToLibrary.ts` (adding selection to the library)
- **Do not confuse with**:
  - “library” as an npm/package dependency: here it’s the **user’s shape library** (asset library).
  - clipboard/paste: library items are durable templates, not temporary clipboard data.

---

## Notes

- **About “deleted”**: many structures (Scene/selection/maps) work with elements “including deleted” vs “non-deleted”. This matters for undo/redo, collaboration, and reconciliation.
- **About versions**: `version` and `versionNonce` on `ExcalidrawElement` are key for synchronization and deterministic conflict resolution.
