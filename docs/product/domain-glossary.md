# Domain Glossary

> Key terms and concepts used throughout the Excalidraw codebase.

## Element Types

| Term | Definition | Source |
|------|-----------|--------|
| `ExcalidrawElement` | Base union type of all drawable elements | `packages/element/src/types.ts` |
| `ExcalidrawRectangleElement` | Rectangle shape | `packages/element/src/types.ts` |
| `ExcalidrawDiamondElement` | Diamond/rhombus shape | `packages/element/src/types.ts` |
| `ExcalidrawEllipseElement` | Ellipse/circle shape | `packages/element/src/types.ts` |
| `ExcalidrawTextElement` | Text with font properties (family, size, align) | `packages/element/src/types.ts` |
| `ExcalidrawLinearElement` | Base for line and arrow elements (multi-point) | `packages/element/src/types.ts` |
| `ExcalidrawLineElement` | Straight/curved line (may form polygon) | `packages/element/src/types.ts` |
| `ExcalidrawArrowElement` | Arrow with optional start/end bindings | `packages/element/src/types.ts` |
| `ExcalidrawFreeDrawElement` | Freehand drawing with pressure data | `packages/element/src/types.ts` |
| `ExcalidrawImageElement` | Embedded image with crop/scale | `packages/element/src/types.ts` |
| `ExcalidrawFrameElement` | Container for grouping elements visually | `packages/element/src/types.ts` |
| `ExcalidrawMagicFrameElement` | AI-generated frame composition | `packages/element/src/types.ts` |
| `ExcalidrawIframeElement` | Embedded iframe/video content | `packages/element/src/types.ts` |
| `ExcalidrawEmbeddableElement` | Generic embeddable content | `packages/element/src/types.ts` |

## Element Subtypes & Modifiers

| Term | Definition |
|------|-----------|
| `NonDeletedExcalidrawElement` | Element where `isDeleted === false` |
| `OrderedExcalidrawElement` | Element with `fractionalIndex` for stable ordering |
| `ExcalidrawBindableElement` | Element that can have arrows bound to it |
| `GroupId` | String identifier linking grouped elements |
| `FractionalIndex` | String-based index for multiplayer-safe ordering (via `fractional-indexing`) |

## State & Scene

| Term | Definition | Source |
|------|-----------|--------|
| `AppState` | Full application state object (~100+ properties) | `packages/excalidraw/types.ts` |
| `UIAppState` | UI-specific subset of AppState (excludes scroll/cursor) | `packages/excalidraw/types.ts` |
| `StaticCanvasAppState` | State subset for static background rendering | `packages/excalidraw/types.ts` |
| `InteractiveCanvasAppState` | State subset for interactive foreground rendering | `packages/excalidraw/types.ts` |
| `SceneData` | Snapshot of canvas elements + app state | `packages/excalidraw/types.ts` |
| `AppStateObserver` | Subscription-based state change notification system | `packages/excalidraw/components/AppStateObserver.ts` |

## Rendering

| Term | Definition |
|------|-----------|
| Static Scene | Background canvas layer rendering all elements (non-interactive) |
| Interactive Scene | Foreground canvas layer for selection handles, transforms, snaps |
| SVG Scene | Rendering pipeline for SVG export |
| `RenderableElementsMap` | Map of non-deleted elements ready for canvas rendering |
| `SnapLine` | Visual alignment guide (PointSnapLine or GapSnapLine) |
| `Zoom` | Viewport zoom level object with value property |

## Collaboration

| Term | Definition | Source |
|------|-----------|--------|
| `Collaborator` | Remote user with pointer position, selection, presence | `packages/excalidraw/types.ts` |
| `CollaboratorPointer` | Cursor position and active tool (pointer/laser) | `packages/excalidraw/types.ts` |
| Portal | WebSocket abstraction for message routing between clients | `excalidraw-app/collab/` |
| Room | Shared collaboration session identified by unique ID | `excalidraw-app/collab/` |
| `SocketId` | Unique socket connection identifier | `packages/excalidraw/types.ts` |
| `UserIdleState` | Activity status: active, idle, or away | `packages/excalidraw/types.ts` |
| `reconcileElements()` | Merges local and remote element changes using version + nonce | `packages/excalidraw/data/reconcile.ts` |
| `SYNC_FULL_SCENE_INTERVAL_MS` | Throttle interval (20s) for full scene sync | `excalidraw-app/app_constants.ts` |
| `CURSOR_SYNC_TIMEOUT` | Cursor position sync interval (~33ms ≈ 30fps) | `excalidraw-app/app_constants.ts` |

## Tools

| Term | Definition |
|------|-----------|
| `ToolType` | Union: selection, lasso, rectangle, diamond, ellipse, arrow, line, freedraw, text, image, eraser, hand, frame, magicframe, embeddable, laser |
| `ActiveTool` | Currently selected tool with `locked` and `fromSelection` flags |
| `ElementOrToolType` | Union of element type or tool type identifiers |

## Bindings & Connections

| Term | Definition |
|------|-----------|
| `FixedPointBinding` | Arrow connection to element at a specific normalized point |
| `BindMode` | How an arrow connects: `"inside"`, `"orbit"`, or `"skip"` |
| `BoundElement` | Reference from a container to its bound child (arrow or text) |
| `Arrowhead` | Arrow endpoint style: arrow, circle, diamond, bar, triangle |

## Visual Properties

| Term | Values |
|------|--------|
| `FillStyle` | `hachure`, `cross-hatch`, `solid`, `zigzag` |
| `StrokeStyle` | `solid`, `dashed`, `dotted` |
| `StrokeRoundness` | `round` (default), `sharp` |
| `RoundnessType` | `LEGACY`, `PROPORTIONAL_RADIUS`, `ADAPTIVE_RADIUS` |
| `TextAlign` | `left`, `center`, `right` |
| `VerticalAlign` | `top`, `middle`, `bottom` |
| `Theme` | `light`, `dark` |

## Data & Files

| Term | Definition |
|------|-----------|
| `BinaryFileData` | Image file with metadata (mimeType, id, created timestamp) |
| `FileId` | Branded string uniquely identifying an image/file asset |
| `DataURL` | Branded string for base64-encoded data URLs |
| `ExportedDataState` | Serialized scene for file export/save |
| `ImportedDataState` | Scene data structure for import/restore |
| FileManager | Handles file upload/download during collaboration |

## Action System

| Term | Definition | Source |
|------|-----------|--------|
| `Action` | Command with label, icon, `perform()` function | `packages/excalidraw/actions/types.ts` |
| `ActionName` | 100+ named actions (copy, paste, undo, selectAll, export, etc.) | `packages/excalidraw/actions/types.ts` |
| `ActionResult` | Return type: partial updates to elements/appState/files | `packages/excalidraw/actions/types.ts` |
| `ActionSource` | Origin: `"ui"`, `"keyboard"`, `"contextMenu"`, `"api"`, `"commandPalette"` | `packages/excalidraw/actions/types.ts` |

## Library System

| Term | Definition |
|------|-----------|
| `LibraryItem` | Reusable element set (published or unpublished) |
| `LibraryItems` | Array of `LibraryItem` |
| `LibraryPersistedData` | Stored library data format |

## Infrastructure

| Term | Definition |
|------|-----------|
| Tunnel | `tunnel-rat` portal for remote component rendering (e.g., MainMenuTunnel) |
| `ExcalidrawImperativeAPI` | Programmatic API for host applications (getAppState, updateElement, etc.) |
| `EditorLocalStorage` | Wrapper for localStorage with namespaced keys |

## Related Docs
- [PRD](./PRD.md) — product requirements
- [Product Context](../memory/productContext.md) — features and UX principles
- [System Patterns](../memory/systemPatterns.md) — architecture details
