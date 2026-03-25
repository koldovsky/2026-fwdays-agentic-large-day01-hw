# Domain Glossary

## Canonical Terms

### Excalidraw

- Name: Excalidraw
- Definition: The product name of the browser-based editor and, at the same time, the name of the public React package `@excalidraw/excalidraw`.
- Used in: `excalidraw-app/App.tsx`, `packages/excalidraw/index.tsx`, `package.json`.
- Do not confuse with: `excalidraw-app` as the hosted SPA, `@excalidraw/excalidraw` as the publishable package.

### Scene

- Name: Scene
- Definition: The current canvas state as a holistic model that includes elements, `AppState`, and related files.
- Used in: `packages/element/src/Scene.ts`, `packages/excalidraw/components/App.tsx`, `excalidraw-app/App.tsx`.
- Do not confuse with: `ExcalidrawElement` as an individual object, `AppState` as UI state without scene geometry.

### ExcalidrawElement

- Name: ExcalidrawElement
- Definition: The canonical TypeScript type for a canvas element from `packages/element`, describing geometry, versions, deletion state, and other synchronization fields.
- Used in: `packages/element/src/types.ts`, `packages/excalidraw/types.ts`, `packages/utils/src/export.ts`.
- Do not confuse with: `Element` as a general product term, `Scene` as a collection of elements.

### Element

- Name: Element
- Definition: A general product term for an object on the canvas; examples include rectangle, text, arrow, image, and frame.
- Used in: `packages/element/src/types.ts`, `packages/excalidraw/components/LayerUI.tsx`, `docs/technical/architecture.md`.
- Do not confuse with: `ExcalidrawElement` as a concrete code type, `Binary File` as the external payload for image elements.

### Tool

- Name: Tool
- Definition: The active interaction mode in the editor, for example selection, rectangle, arrow, text, or frame.
- Used in: `packages/excalidraw/types.ts` (`ToolType`, `ActiveTool`), `packages/element/tests/helpers/ui.ts`, `packages/excalidraw/components/LayerUI.tsx`.
- Do not confuse with: `Action` as a command, `AppState` as the full set of UI flags.

### Action

- Name: Action
- Definition: The canonical editor command with a label, predicate, and `perform(...)`, executed by `ActionManager` from the toolbar, keyboard, context menu, or API.
- Used in: `packages/excalidraw/actions/types.ts`, `packages/excalidraw/actions/manager.tsx`, `packages/excalidraw/components/main-menu/DefaultItems.tsx`.
- Do not confuse with: `Tool` as a drawing mode, `Scene` as canvas data.

### AppState

- Name: AppState
- Definition: The canonical UI and editor-state type without scene geometry; examples include zoom, theme, active tool, dialog state, and selection metadata.
- Used in: `packages/excalidraw/types.ts`, `packages/excalidraw/appState.ts`, `packages/excalidraw/actions/manager.tsx`.
- Do not confuse with: `Scene` as element state, `Tool` as a single field inside `AppState`.

### Binary File

- Name: Binary File
- Definition: A non-embedded payload, mostly image data, stored separately from the JSON scene.
- Used in: `packages/excalidraw/types.ts` (`BinaryFileData`, `BinaryFiles`), `excalidraw-app/data/LocalData.ts`, `excalidraw-app/data/firebase.ts`.
- Do not confuse with: an `ExcalidrawElement` of type `image`, `Library` as a collection of reusable items.

### Library

- Name: Library
- Definition: A reusable collection of templates or components that can be saved and inserted again.
- Used in: `packages/excalidraw/data/library.ts`, `excalidraw-app/data/LocalData.ts`, `.env.development` (`VITE_APP_LIBRARY_URL`, `VITE_APP_LIBRARY_BACKEND`).
- Do not confuse with: `Scene` as the current canvas, `Binary File` as the file of a specific element.

### Collaboration Room

- Name: Collaboration Room
- Definition: A live multi-user session represented by a room ID, room key, and Socket.IO connection.
- Used in: `excalidraw-app/collab/Collab.tsx`, `excalidraw-app/collab/Portal.tsx`, `excalidraw-app/data/firebase.ts`.
- Do not confuse with: `Shareable Link` as a static snapshot export, `Room Link` as the URL representation of room credentials.

### Shareable Link

- Name: Shareable Link
- Definition: A link to a remotely stored encrypted scene snapshot in the form `#json=<id>,<key>`.
- Used in: `excalidraw-app/data/index.ts`, `excalidraw-app/share/ShareDialog.tsx`, `.env.production` (`VITE_APP_BACKEND_V2_GET_URL`, `VITE_APP_BACKEND_V2_POST_URL`).
- Do not confuse with: `Collaboration Room` as a live session, `Room Link` as a `#room=` URL.

### Room Link

- Name: Room Link
- Definition: A collaboration URL in the format `#room=<roomId>,<roomKey>` that opens a live room.
- Used in: `excalidraw-app/collab/Collab.tsx`, `excalidraw-app/collab/Portal.tsx`, `docs/memory/systemPatterns.md`.
- Do not confuse with: `Shareable Link` as a static snapshot URL, `Collaboration Room` as the runtime session behind that URL.

### Portal

- Name: Portal
- Definition: The internal name of the collaboration transport layer that wraps the Socket.IO socket, room metadata, and broadcast helpers.
- Used in: `excalidraw-app/collab/Portal.tsx`, `excalidraw-app/collab/Collab.tsx`, `excalidraw-app/data/firebase.ts`.
- Do not confuse with: the React portal API, `Collaboration Room` as the user-facing session built on top of the transport layer.

### Syncable Element

- Name: Syncable Element
- Definition: An element allowed to be broadcast or saved in the collaboration path; tiny invisible elements are filtered out, while deleted elements temporarily remain syncable as tombstones.
- Used in: `excalidraw-app/data/index.ts`, `excalidraw-app/collab/Collab.tsx`, `docs/memory/decisionLog.md`.
- Do not confuse with: `ExcalidrawElement` as any element in general, `Element` as the general term without sync filtering.

### Reconciliation

- Name: Reconciliation
- Definition: The process of merging remote scene updates with local state, based on version/versionNonce and scene ordering.
- Used in: `packages/element/src/reconciliation.ts`, `excalidraw-app/collab/Collab.tsx`, `packages/element/src/Scene.ts`.
- Do not confuse with: React reconciliation, `Action` dispatch as a UI command.

### Excalidraw+

- Name: Excalidraw+
- Definition: The commercial or hosted product surface referenced by the OSS app in export, promo, and AI-related flows.
- Used in: `excalidraw-app/components/ExcalidrawPlusPromoBanner.tsx`, `excalidraw-app/components/ExportToExcalidrawPlus.tsx`, `.env.production` (`VITE_APP_PLUS_LP`, `VITE_APP_PLUS_APP`, `VITE_APP_PLUS_EXPORT_PUBLIC_KEY`).
- Do not confuse with: the OSS Excalidraw app, `Diagram-to-Code` as a separate AI feature.

### TTD

- Name: TTD
- Definition: Text-to-Diagram, meaning chat-driven diagram generation with local persistence of chat history.
- Used in: `excalidraw-app/components/AI.tsx`, `excalidraw-app/data/TTDStorage.ts`, `docs/product/PRD.md`.
- Do not confuse with: `Diagram-to-Code`, which generates HTML or code from frame content.

### Diagram-to-Code

- Name: Diagram-to-Code
- Definition: An AI-assisted workflow that transforms a selected frame and its child elements into generated HTML or code output.
- Used in: `excalidraw-app/components/AI.tsx`, `excalidraw-app/components/AppSidebar.tsx`, `docs/product/PRD.md`.
- Do not confuse with: `TTD` as text-based diagram generation, `Frame` as a container without AI by itself.

### Frame

- Name: Frame
- Definition: A container canvas element that groups content and is used in export and AI workflows.
- Used in: `packages/element/src/types.ts`, `packages/element/tests/frame.test.tsx`, `excalidraw-app/components/AI.tsx`.
- Do not confuse with: generic group selection, `ExcalidrawElement` as the broader union type.