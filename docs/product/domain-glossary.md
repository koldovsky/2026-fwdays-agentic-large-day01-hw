# Domain Glossary

Source-verified against the current codebase.

## Element

- **Name**: `Element`
- **Definition**: Generic project shorthand for a drawable object on the canvas: shape, text, image, frame, arrow, embeddable, or iframe-like node. In code, most logic works with immutable element records rather than DOM nodes.
- **Where used**: `packages/element/src/types.ts`, `packages/element/src/mutateElement.ts`, `packages/excalidraw/components/App.tsx`, `packages/excalidraw/renderer/staticScene.ts`
- **Do not confuse with**: the browser's DOM `Element`. In this project, `Element` usually means a scene object stored in Excalidraw state.

## ExcalidrawElement

- **Name**: `ExcalidrawElement`
- **Definition**: The core union type for all persisted scene objects. It defines shared fields such as `id`, geometry, style props, `version`, `versionNonce`, `index`, `isDeleted`, `groupIds`, and `frameId`, and then branches into concrete element types like `text`, `arrow`, `image`, `frame`, and `embeddable`.
- **Where used**: `packages/element/src/types.ts`, `packages/element/src/bounds.ts`, `packages/excalidraw/data/restore.ts`, `packages/excalidraw/data/reconcile.ts`
- **Do not confuse with**: a single shape subtype such as `rectangle` or `text`. `ExcalidrawElement` is the umbrella type for all scene elements.

## Scene

- **Name**: `Scene`
- **Definition**: The runtime container that owns the current element collection, cached maps, selection cache, frame lists, and a `sceneNonce` used for render/cache invalidation. It is the authoritative in-memory model of the canvas contents.
- **Where used**: `packages/element/src/Scene.ts`, `packages/excalidraw/components/App.tsx`, `packages/excalidraw/scene/scrollbars.ts`, `packages/excalidraw/tests/scene/export.test.ts`
- **Do not confuse with**: a serialized `.excalidraw` document. In this project, `Scene` is a live class with lookup and caching behavior, not just JSON.

## AppState

- **Name**: `AppState`
- **Definition**: The large UI/application state object for everything that is not element content itself: active tool, viewport, selection, in-progress editing, dialogs, snapping, theme, collaborators, export flags, and more.
- **Where used**: `packages/excalidraw/types.ts`, `packages/excalidraw/appState.ts`, `packages/excalidraw/components/App.tsx`, `packages/excalidraw/actions/types.ts`
- **Do not confuse with**: React component state in general. Here `AppState` is a specific domain contract shared across actions, rendering, persistence, and collaboration.

## Tool

- **Name**: `ToolType` / `activeTool`
- **Definition**: The current interaction mode selected by the user, such as `selection`, `rectangle`, `arrow`, `text`, `image`, `eraser`, `hand`, `frame`, `embeddable`, or `laser`. `activeTool` in `AppState` also stores mode metadata like `locked`, `customType`, and previous tool history.
- **Where used**: `packages/excalidraw/types.ts`, `packages/excalidraw/appState.ts`, `packages/excalidraw/components/App.tsx`, `packages/excalidraw/components/Actions.tsx`
- **Do not confuse with**: an `Action`. A tool is a persistent input mode; an action is a command executed once.

## Action

- **Name**: `Action`
- **Definition**: A registered command object that can be triggered from UI, keyboard, context menu, API, or command palette. An action exposes `perform(...)` and may also define `keyTest`, `predicate`, analytics metadata, and a `PanelComponent`.
- **Where used**: `packages/excalidraw/actions/types.ts`, `packages/excalidraw/actions/manager.tsx`, `packages/excalidraw/actions/actionCanvas.tsx`, `packages/excalidraw/components/CommandPalette/defaultCommandPaletteItems.ts`
- **Do not confuse with**: a tool button or Redux-style action payload. In this project, `Action` is executable behavior plus optional UI metadata.

## Collaboration

- **Name**: `Collab` / collaboration
- **Definition**: The real-time multi-user editing subsystem that syncs elements, cursors, viewport-follow events, usernames, and room state over a portal/socket layer. It also coordinates room links, cloud file exchange, and full-scene vs incremental sync.
- **Where used**: `excalidraw-app/collab/Collab.tsx`, `excalidraw-app/collab/Portal.tsx`, `excalidraw-app/data/index.ts`, `packages/excalidraw/data/reconcile.ts`
- **Do not confuse with**: simple shared persistence. In this project, collaboration means live session behavior with remote presence and conflict resolution.

## Collaborator

- **Name**: `Collaborator`
- **Definition**: The per-remote-user presence record stored in `AppState.collaborators`. It can include pointer position, button state, selected elements, username, idle state, colors, avatar, audio-call flags, and socket identity.
- **Where used**: `packages/excalidraw/types.ts`, `excalidraw-app/collab/Collab.tsx`, `packages/excalidraw/renderer/interactiveScene.ts`, `packages/excalidraw/components/UserList.tsx`
- **Do not confuse with**: an application user account. A `Collaborator` here is ephemeral session presence data.

## Reconciliation

- **Name**: `reconcileElements`
- **Definition**: The merge process that combines local and remote ordered elements during collaboration. It keeps actively edited local elements when needed, compares `version` and `versionNonce`, preserves unseen local elements, then reorders by fractional index.
- **Where used**: `packages/excalidraw/data/reconcile.ts`, `excalidraw-app/App.tsx`, `excalidraw-app/collab/Collab.tsx`
- **Do not confuse with**: React reconciliation. Here it means conflict resolution for scene data coming from multiple peers.

## versionNonce

- **Name**: `versionNonce`
- **Definition**: A random integer regenerated on each element change. When two element versions are equal, it acts as a deterministic tiebreaker during collaboration merge logic.
- **Where used**: `packages/element/src/types.ts`, `packages/excalidraw/data/reconcile.ts`, `packages/excalidraw/data/library.ts`, `packages/excalidraw/history.ts`
- **Do not confuse with**: a security nonce. In this project it is a conflict-resolution field attached to elements.

## Library

- **Name**: `Library`
- **Definition**: The subsystem and persisted collection of reusable drawing snippets. It manages loading, merging, hashing, publishing status, adapter-based persistence, and UI updates for reusable element templates.
- **Where used**: `packages/excalidraw/data/library.ts`, `packages/excalidraw/components/LibraryMenu.tsx`, `packages/excalidraw/hooks/useLibraryItemSvg.ts`, `packages/excalidraw/index.tsx`
- **Do not confuse with**: a code library or npm package. In this project, `Library` means reusable canvas content that users can insert into scenes.

## LibraryItem

- **Name**: `LibraryItem`
- **Definition**: A versioned reusable snippet inside the library, identified by `id` and containing `elements`, `status`, creation timestamp, and optional `name` or `error`. Its `elements` are non-deleted `ExcalidrawElement`s ready to be dropped into a scene.
- **Where used**: `packages/excalidraw/types.ts`, `packages/excalidraw/data/library.ts`, `packages/excalidraw/hooks/useLibraryItemSvg.ts`, `packages/excalidraw/actions/actionAddToLibrary.ts`
- **Do not confuse with**: a single element. One `LibraryItem` usually wraps a small group of elements.

## Binding

- **Name**: binding / `boundElements`
- **Definition**: The relationship system that links arrows or text to other elements so connected content stays attached when source elements move or update. It is represented on elements through fields like `boundElements`, `containerId`, and related binding computations.
- **Where used**: `packages/element/src/binding.ts`, `packages/element/src/types.ts`, `packages/excalidraw/components/App.tsx`, `packages/excalidraw/appState.ts`
- **Do not confuse with**: dependency injection or event binding. Here it means geometric attachment between scene elements.

## Frame

- **Name**: `frame` / `ExcalidrawFrameElement`
- **Definition**: A scene element type that acts as a container-like region for other elements and participates in frame-aware selection, rendering, and clipping rules. This codebase also has `magicframe`, which is frame-like but distinct.
- **Where used**: `packages/element/src/types.ts`, `packages/element/src/frame.ts`, `packages/excalidraw/actions/actionFrame.ts`, `packages/excalidraw/components/App.tsx`
- **Do not confuse with**: a browser animation frame or an HTML iframe. In this project, a `frame` is a canvas element used for grouping/layout on the scene.
