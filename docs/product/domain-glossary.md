# Domain Glossary

This glossary describes how core terms are used in this codebase, not their generic whiteboard or graphics-industry meanings.

## Element

- **Name:** `Element`
- **Definition in this project:** A drawable unit in the editor model. In practice, the code usually means an `ExcalidrawElement` or one of its concrete variants such as rectangle, text, arrow, image, frame, or embeddable.
- **Where it is used:** `packages/element/src/types.ts`, `packages/element/src/Scene.ts`, `packages/excalidraw/components/App.tsx`
- **Do not confuse with:** A generic DOM element. In this project, an element is editor content stored in the scene, not an HTML node.

## ExcalidrawElement

- **Name:** `ExcalidrawElement`
- **Definition in this project:** The canonical serialized content type for scene objects. It is intentionally JSON-serializable and collaboration-safe, and it excludes peer-local runtime state.
- **Where it is used:** `packages/element/src/types.ts`, `packages/excalidraw/types.ts`, `packages/excalidraw/data/restore.ts`
- **Do not confuse with:** Any shape instance on screen. Here it is a typed data model with versioning, ordering, deletion, grouping, and binding metadata.

## Scene

- **Name:** `Scene`
- **Definition in this project:** The authoritative container for editor elements. It stores all elements, keeps fast lookup maps and non-deleted subsets, tracks ordering, caches selections, and notifies the app when the element graph changes.
- **Where it is used:** `packages/element/src/Scene.ts`, `packages/excalidraw/components/App.tsx`, `packages/excalidraw/renderer/interactiveScene.ts`
- **Do not confuse with:** A rendered canvas bitmap or a presentation slide. In this project, `Scene` is the in-memory content graph plus indexing utilities.

## AppState

- **Name:** `AppState`
- **Definition in this project:** The editor UI and interaction state around the scene: active tool, selection, zoom, scroll, dialogs, collaborators, snapping, export settings, editing modes, and other session-level state.
- **Where it is used:** `packages/excalidraw/types.ts`, `packages/excalidraw/appState.ts`, `packages/excalidraw/components/App.tsx`
- **Do not confuse with:** Persistent document content. Most `AppState` fields are UI/session concerns and are filtered differently for browser storage, export, and server sync.

## Tool

- **Name:** `Tool`
- **Definition in this project:** A user interaction mode that determines what pointer input does next, such as selection, lasso, rectangle, text, image, eraser, hand, frame, or laser. The current tool is stored in `AppState.activeTool`.
- **Where it is used:** `packages/excalidraw/types.ts`, `packages/excalidraw/appState.ts`, `packages/excalidraw/components/ToolButton.tsx`
- **Do not confuse with:** A generic toolbar button. In this project, a tool is an interaction mode, while the toolbar is only one UI surface for choosing it.

## Action

- **Name:** `Action`
- **Definition in this project:** A command object that encapsulates an editor operation. An action has a name, label, predicates, shortcuts, analytics metadata, optional UI panel integration, and a `perform` function that returns scene/app/file updates.
- **Where it is used:** `packages/excalidraw/actions/types.ts`, `packages/excalidraw/actions/register.ts`, `packages/excalidraw/actions/manager.tsx`
- **Do not confuse with:** Any state change or Redux-style event. In this project, `Action` is a formal command abstraction used by menus, shortcuts, toolbar controls, and the imperative API.

## Collaboration

- **Name:** `Collaboration`
- **Definition in this project:** The real-time multiplayer layer that syncs scene updates, pointer locations, idle state, viewport-follow behavior, and file transfer across peers, while also persisting shared room data to Firebase.
- **Where it is used:** `excalidraw-app/collab/Collab.tsx`, `excalidraw-app/collab/Portal.tsx`, `excalidraw-app/data/firebase.ts`
- **Do not confuse with:** Plain shared file export/import. In this project, collaboration is a live room-based synchronization system with networking, reconciliation, and remote presence.

## Collaborator

- **Name:** `Collaborator`
- **Definition in this project:** The per-remote-user presence model shown in a collaborative session. It contains pointer state, selection, username, idle status, avatar/color metadata, call state, and socket identity.
- **Where it is used:** `packages/excalidraw/types.ts`, `excalidraw-app/collab/Collab.tsx`, `packages/excalidraw/components/LiveCollaborationTrigger.tsx`
- **Do not confuse with:** A project contributor in Git. Here it means an active participant connected to the current shared room.

## Library

- **Name:** `Library`
- **Definition in this project:** The reusable collection of saved drawing snippets. Library items are grouped bundles of non-deleted elements that users can add, import, publish, merge, persist, and reinsert into scenes.
- **Where it is used:** `packages/excalidraw/data/library.ts`, `packages/excalidraw/types.ts`, `packages/excalidraw/actions/actionAddToLibrary.ts`
- **Do not confuse with:** A code library or npm package. In this project, the library is a user-facing stencil/snippet catalog.

## LibraryItem

- **Name:** `LibraryItem`
- **Definition in this project:** A single reusable library entry with its own `id`, publication status, creation timestamp, optional name, and a list of element definitions that make up the reusable snippet.
- **Where it is used:** `packages/excalidraw/types.ts`, `packages/excalidraw/data/library.ts`, `packages/excalidraw/data/restore.ts`
- **Do not confuse with:** A single element. One `LibraryItem` usually contains multiple elements arranged as one reusable asset.

## BinaryFile

- **Name:** `BinaryFileData`
- **Definition in this project:** Metadata plus content for file-backed assets, primarily images. It stores the file id, MIME type, `dataURL`, timestamps, and version information used to load, persist, and garbage-collect file resources referenced by scene elements.
- **Where it is used:** `packages/excalidraw/types.ts`, `excalidraw-app/data/FileManager.ts`, `packages/excalidraw/components/App.tsx`
- **Do not confuse with:** An arbitrary uploaded attachment. In this project, binary files are tightly coupled to scene/image handling and file storage workflows.

## Frame

- **Name:** `Frame`
- **Definition in this project:** A frame-like scene element that visually and structurally groups content. Frames participate in clipping, highlighting, naming, selection logic, and tooling, and the code often handles both `frame` and `magicframe` through `ExcalidrawFrameLikeElement`.
- **Where it is used:** `packages/element/src/types.ts`, `packages/element/src/frame.ts`, `packages/excalidraw/actions/actionFrame.ts`
- **Do not confuse with:** A browser animation frame or an iframe. In this project, a frame is a canvas object used to organize diagram content.

## Binding

- **Name:** `Binding`
- **Definition in this project:** The attachment relationship between linear elements, text, and bindable shapes. It lets arrows or text stay connected to element geometry via fixed-point metadata and binding modes such as `inside`, `orbit`, or `skip`.
- **Where it is used:** `packages/element/src/types.ts`, `packages/element/src/binding.ts`, `packages/excalidraw/appState.ts`
- **Do not confuse with:** JavaScript function binding. Here it is geometric attachment behavior between scene elements.

## PointerDownState

- **Name:** `PointerDownState`
- **Definition in this project:** The interaction snapshot captured at the start of a pointer gesture. It records origin coordinates, hit-testing results, original element snapshots, resize metadata, drag state, modifier keys, and temporary event listeners.
- **Where it is used:** `packages/excalidraw/types.ts`, `packages/excalidraw/components/App.tsx`, `packages/excalidraw/tests/helpers/ui.ts`
- **Do not confuse with:** The browser pointer event object itself. In this project, it is the editor’s derived interaction context built from that event.
