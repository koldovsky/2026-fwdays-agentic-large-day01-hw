# Domain Glossary

> Terms found in source code, types, constants, and component names. Organized by domain area.

---

## Canvas & Drawing

| Term | Definition | Source |
|------|-----------|--------|
| **Scene** | The complete set of elements on the canvas at a given moment. Managed by `Scene` class in `packages/element/src/Scene.ts`. | `packages/element/src/Scene.ts` |
| **Element** | A single drawable object on the canvas (shape, text, image, etc.). All elements extend `ExcalidrawElement`. | `packages/excalidraw/types.ts` |
| **ExcalidrawElement** | Base type for all canvas objects. Has `id`, `type`, `x`, `y`, `width`, `height`, `angle`, `version`, `versionNonce`, and style properties. | `packages/excalidraw/types.ts` |
| **Linear Element** | An element defined by a sequence of points rather than a bounding box (arrows, lines). | `actionLinearEditor.tsx` |
| **Bound Text** | A text element that is "bound" (attached) to a shape container, rendering inside it. | `actionBoundText.tsx` |
| **Embeddable** | A special element type that renders an external URL inside an iframe on the canvas. | `actionEmbeddable.ts`, `TOOL_TYPE.embeddable` |
| **Frame** | A named container element that groups and labels other elements. | `actionFrame.ts`, `TOOL_TYPE.frame` |
| **Magic Frame** | An AI-powered frame that can generate content from its elements. | `TOOL_TYPE.magicframe` |
| **Freedraw** | Freehand drawing tool producing smooth strokes via `perfect-freehand`. | `TOOL_TYPE.freedraw` |
| **Elbow Arrow** | A smart arrow type that routes around elements with right-angle bends. | `elbowArrow/`, `ARROW_TYPE.elbow` |
| **Binding** | The connection between an arrow endpoint and a shape — arrow stays attached when shape moves. | `actionToggleArrowBinding.tsx`, `binding/` |
| **Group** | A set of elements treated as one unit for move/resize/delete. | `actionGroup.tsx`, `groups/` |
| **Z-index** | Stacking order of elements on the canvas. Controlled via bring-to-front/send-to-back. | `actionZindex.tsx`, `zindex/` |
| **Fractional Index** | A string-based ordering scheme for elements that allows O(1) insertions without renumbering. | `fractionalIndex/` |
| **Version / VersionNonce** | Two integers on every element used for CRDT-style reconciliation. Higher `version` wins; equal versions use `versionNonce` as tiebreaker. | `packages/excalidraw/types.ts` |
| **Roughness** | Drawing style level: `architect` (0) = clean, `artist` (1) = slightly rough, `cartoonist` (2) = very rough. | `ROUGHNESS` in `constants.ts` |
| **Roundness** | Corner style: `LEGACY` (1), `PROPORTIONAL_RADIUS` (2), or `ADAPTIVE_RADIUS` (3). | `ROUNDNESS` in `constants.ts` |

---

## Tools

| Term | Definition | Constant |
|------|-----------|---------|
| **selection** | Default pointer tool for selecting and manipulating elements | `TOOL_TYPE.selection` |
| **lasso** | Freehand selection by drawing a closed loop | `TOOL_TYPE.lasso` |
| **hand** | Pan the canvas (no element interaction) | `TOOL_TYPE.hand` |
| **eraser** | Removes elements by painting over them | `TOOL_TYPE.eraser` |
| **laser** | Laser pointer for presentations — leaves a fading trail | `TOOL_TYPE.laser`, `DEFAULT_LASER_COLOR` |
| **image** | Insert raster images from clipboard or file | `TOOL_TYPE.image` |
| **text** | Click to create text elements | `TOOL_TYPE.text` |

---

## Collaboration

| Term | Definition | Source |
|------|-----------|--------|
| **Room** | A shared drawing session identified by a `roomId`. Created by generating a random 10-byte ID. | `app_constants.ts: ROOM_ID_BYTES` |
| **RoomKey** | 22-character Base64URL encryption key embedded in the share URL fragment. Never sent to server. | `data/index.ts` |
| **Collaboration Link** | URL with `#room=[roomId],[roomKey]` fragment. Pattern validated by `isCollaborationLink()`. | `data/index.ts` |
| **Portal** | The Socket.io transport layer in `collab/Portal.tsx`. Sends and receives scene updates. | `excalidraw-app/collab/Portal.tsx` |
| **Collab** | The React component (`Collab.tsx`) that owns the collaboration lifecycle — join, sync, leave. | `excalidraw-app/collab/Collab.tsx` |
| **Reconciliation** | `reconcileElements()` — merges remote elements with local state using version/versionNonce. | `packages/excalidraw/index.tsx` |
| **Syncable Element** | An element eligible for WebSocket sync: not deleted, or deleted within `DELETED_ELEMENT_TIMEOUT` (24h). | `data/index.ts: isSyncableElement()` |
| **Collaborator** | A remote user represented by `{ socketId, pointer, button, selectedElementIds, username, userState, color }`. | `packages/excalidraw/types.ts` |
| **UserIdleState** | Enum: `ACTIVE`, `AWAY`, `IDLE` — tracks user activity for presence indicators. | `constants.ts` |
| **Follow Mode** | Feature allowing one user to follow another's viewport in real time. | `components/FollowMode/` |
| **Tab Sync** | Cross-tab scene synchronization using `BroadcastChannel` or `localStorage` events. | `data/tabSync.ts` |

---

## Data & Persistence

| Term | Definition | Source |
|------|-----------|--------|
| **AppState** | The complete UI and editor state — 272+ fields including active tool, zoom, scroll, theme, dialogs, etc. | `packages/excalidraw/types.ts` |
| **BinaryFileData** | A stored file (image) with `mimeType`, `id`, `dataURL`, `created`, `lastRetrieved`, `version`. | `packages/excalidraw/types.ts` |
| **Library / LibraryItem** | A saved set of elements that can be reused. Items are stored in IndexedDB. | `data/library/` |
| **EncryptedData** | `{ data: ArrayBuffer, iv: Uint8Array }` — output of AES-GCM encryption. | `data/index.ts` |
| **SocketUpdateData** | Branded type for messages sent over WebSocket. Subtypes: `INIT`, `UPDATE`, `MOUSE_LOCATION`, `IDLE_STATUS`, `USER_VISIBLE_SCENE_BOUNDS`. | `data/index.ts` |
| **FileManager** | Handles upload to Firebase Storage and local caching of `BinaryFileData`. | `data/FileManager.ts` |
| **LocalData** | Wrapper around `localStorage` and IndexedDB for offline persistence. | `data/LocalData.ts` |
| **Versioned Snapshot** | Immutable snapshots of scene state used for undo/redo history. | `packages/common/src/versionedSnapshotStore.ts` |

---

## Export & Sharing

| Term | Definition | Source |
|------|-----------|--------|
| **Share Link** | An encrypted URL pointing to a scene stored on `json.excalidraw.com`. | `ShareableLinkDialog.tsx` |
| **exportToCanvas** | Renders scene elements to an `HTMLCanvasElement` (for PNG export). | `packages/excalidraw/index.tsx` |
| **exportToSvg** | Renders to SVG with fonts embedded as `<defs>`. | `packages/excalidraw/index.tsx` |
| **exportToBlob** | PNG export as `Blob` (wraps `exportToCanvas`). | `packages/excalidraw/index.tsx` |
| **serializeAsJSON** | Converts scene to Excalidraw JSON format for file save. | `packages/excalidraw/index.tsx` |
| **loadFromBlob** | Restores scene from a `.excalidraw` or `.png` file blob. | `packages/excalidraw/index.tsx` |

---

## AI Features

| Term | Definition | Source |
|------|-----------|--------|
| **TTD (Text-to-Diagram)** | Feature that converts natural language or Mermaid syntax to Excalidraw elements via AI backend. | `components/TTDDialog/`, `TOOL_TYPE.magicframe` |
| **TTDDialog** | The modal UI for entering text and previewing AI-generated diagrams. | `components/TTDDialog/TTDDialog.tsx` |
| **DiagramToCode** | Plugin that converts Excalidraw diagrams into code representations. | `components/DiagramToCodePlugin/` |
| **TTDStorage** | Stores TTD conversation history in IndexedDB. | `data/TTDStorage.ts` |
| **Mermaid** | Supported input format for TTD — converted via `mermaid-to-excalidraw` library. | `vite.config.mts` chunk split |

---

## Fonts

| Term | Definition |
|------|-----------|
| **Virgil** | Default handwritten-style font (family ID: 1). The signature Excalidraw look. |
| **Cascadia** | Monospace font (family ID: 3) for code-like text. |
| **Excalifont** | Newer default font (family ID: 5), designed for Excalidraw. |
| **Nunito** | Rounded sans-serif (family ID: 6). |
| **Liberation Sans** | Web-safe fallback font (family ID: 9). |
| **Font Subsetting** | Generating a minimal font file containing only the characters used in the scene, for SVG embedding. |
| **EXCALIDRAW_ASSET_PATH** | Global `window` variable that points to the CDN/path for font files. Required for self-hosting. |

---

## UI Patterns

| Term | Definition | Source |
|------|-----------|--------|
| **Action** | A discrete canvas operation with name, perform function, optional keyboard shortcut, and optional panel UI. | `actions/types.ts` |
| **Command Palette** | Global keyboard-driven command search, registering all Actions. | `components/CommandPalette/` |
| **Zen Mode** | Hides all UI chrome — only the canvas is visible. | `actionToggleZenMode.tsx` |
| **View Mode** | Read-only canvas — prevents editing. | `actionToggleViewMode.tsx` |
| **Grid Mode** | Snaps elements to a configurable grid. Default: 20px, step: 5px. | `DEFAULT_GRID_SIZE`, `DEFAULT_GRID_STEP` |
| **Stats** | Overlay showing element count, memory, and performance metrics. | `components/Stats/` |
| **EyeDropper** | Color picker tool that samples colors from the canvas. | `components/EyeDropper.tsx` |
| **SearchMenu** | Find elements by content within the scene. | `components/SearchMenu.tsx` |
