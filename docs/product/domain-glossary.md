# Domain Glossary

## Element Types

All elements extend `_ExcalidrawElementBase` (`packages/element/src/types.ts`).

| Term | Description |
|------|-------------|
| `ExcalidrawRectangleElement` | Rectangle shape |
| `ExcalidrawDiamondElement` | Diamond / rotated square (common in flowcharts) |
| `ExcalidrawEllipseElement` | Circle or ellipse |
| `ExcalidrawLineElement` | Polyline (no arrowhead); can close into polygon |
| `ExcalidrawArrowElement` | Directed arrow; supports standard and elbow routing; can bind to elements |
| `ExcalidrawFreeDrawElement` | Freehand pencil stroke with pressure points |
| `ExcalidrawTextElement` | Editable text; can be standalone or bound inside a container |
| `ExcalidrawImageElement` | Raster image with crop support; references a `FileId` |
| `ExcalidrawFrameElement` | Named container that visually groups elements |
| `ExcalidrawMagicFrameElement` | AI-generated frame variant |
| `ExcalidrawIframeElement` | Embedded iframe (video, website) |
| `ExcalidrawEmbeddableElement` | Generic embeddable content |
| `ExcalidrawSelectionElement` | Internal — represents the drag-selection rectangle |

## Element Groupings (type aliases)

| Term | Meaning |
|------|---------|
| `ExcalidrawElement` | Union of all renderable element types |
| `NonDeletedExcalidrawElement` | Elements with `isDeleted === false` |
| `ExcalidrawBindableElement` | Elements that arrows can attach to (rect, diamond, ellipse, text, image, iframe) |
| `ExcalidrawTextContainer` | Elements that can hold a bound text label (rect, diamond, ellipse, arrow) |
| `ExcalidrawLinearElement` | Arrow or line |
| `FrameLikeElement` | Frame or MagicFrame |
| `ElementsMap` / `SceneElementsMap` | `Map<string, ExcalidrawElement>` — O(1) lookup by id |

## Core State & Infrastructure

| Term | Description |
|------|-------------|
| **AppState** | Master state object in `packages/excalidraw/types.ts`; holds active tool, viewport (zoom/scroll), current styling properties, UI panels, collaborators, and interaction flags |
| **Scene** | In-memory ordered collection of all elements (`packages/element/src/Scene.ts`); maintains both an ordered array (for rendering order) and a Map (for lookup) |
| **Store** | Captures `StoreSnapshot`s and emits `StoreDelta`s on change (`packages/element/src/store.ts`); drives history and collaboration sync |
| **StoreSnapshot** | Immutable point-in-time capture of elements + appState |
| **StoreDelta** | Diff between two snapshots |
| **HistoryDelta** | Inverse of a StoreDelta; applied to undo/redo a change |
| **CaptureUpdateAction** | Enum: `IMMEDIATELY` (add to undo), `NEVER` (remote updates), `EVENTUALLY` (batch with next IMMEDIATELY) |

## Element Properties

| Term | Description |
|------|-------------|
| **version / versionNonce** | Incremented on every mutation; used for conflict detection in multiplayer |
| **fractional index (`index`)** | String-encoded fractional number for multiplayer-safe z-order |
| **binding** | Arrow attachment to a `ExcalidrawBindableElement` (start/end binding) |
| **boundElements** | Array on a container element listing bound arrows and text |
| **groupIds** | Array of group IDs the element belongs to (supports nested groups) |
| **frameId** | ID of the `FrameElement` this element is inside |
| **isDeleted** | Soft-delete flag; elements are kept in scene for collaboration sync |
| **customData** | Arbitrary JSON payload for embedders to attach metadata |

## Visual Style Terms

| Term | Values / Description |
|------|---------------------|
| **roughness** | `0` architect (clean), `1` artist (medium), `2` cartoonist (very rough) |
| **fillStyle** | `hachure`, `cross-hatch`, `solid`, `zigzag`, `dots`, `dashed`, `zigzag-line` |
| **strokeStyle** | `solid`, `dashed`, `dotted` |
| **roundness** | `null` (sharp), `LEGACY`, `PROPORTIONAL_RADIUS`, `ADAPTIVE_RADIUS` |
| **FONT_FAMILY** | Virgil (handwritten), Helvetica, Cascadia (monospace), Excalifont, Nunito, etc. |
| **THEME** | `light` or `dark` |

## Tool Types (`TOOL_TYPE` constant)

`selection`, `lasso`, `rectangle`, `diamond`, `ellipse`, `arrow`, `line`, `freedraw`, `text`, `image`, `eraser`, `hand`, `frame`, `magicframe`, `embeddable`, `laser`

## Collaboration

| Term | Description |
|------|-------------|
| **Portal** | WebSocket connection manager inside `Collab.tsx` |
| **FileManager** | Handles upload/download of image files to Firebase storage |
| **Collaborator** | Remote user object: pointer position, tool, username, avatar |
| **room link** | Shareable URL containing room ID + AES-GCM encryption key (in URL hash — never sent to server) |

## Imperative API

| Term | Description |
|------|-------------|
| **ExcalidrawImperativeAPI** | Interface for programmatic control of the component (`updateScene`, `getSceneElements`, `exportToBlob`, etc.) |
| **ExcalidrawAPIProvider** | React context provider exposing the API to child components |
