# Excalidraw — System Patterns

## State Management

### Hierarchical State Architecture

Excalidraw uses a layered state model:

1. **Jotai Atoms** — fine-grained reactive state at app level (`app-jotai.ts`)
2. **EditorJotaiStore** — scoped atom store for editor instances (`editor-jotai.ts`)
3. **AppState** — mutable application state (viewport, tool, UI toggles) defined in `appState.ts`
4. **SceneElementsMap** — indexed element store (`packages/element/src/store.ts`)
5. **BinaryFiles** — image and binary data keyed by fileId

### Immutable Element Updates

Elements are treated as immutable. Changes produce new objects via `newElementWith()`. This prevents accidental mutations during collaboration and supports deterministic undo/redo.

## Action System

All user-initiated state changes flow through the **Action System** (`packages/excalidraw/actions/`).

Each action implements:
- `name` — unique identifier
- `perform(elements, appState, formData, app)` — core logic returning `{elements, appState, files}`
- `predicate?` — guards when action is available
- `keyTest?` — keyboard shortcut binding
- `PanelComponent?` — optional UI in the properties panel
- `trackEvent?` — analytics event

Actions are registered in `actions/index.ts` (48 actions) and dispatched via `ActionManager` (`actions/manager.tsx`).

## Canvas Rendering

### Multi-Canvas Strategy

Four canvas layers serve different purposes:

| Canvas | File | Purpose |
|--------|------|---------|
| StaticCanvas | `canvases/StaticCanvas.tsx` | Final rendered elements |
| InteractiveCanvas | `canvases/InteractiveCanvas.tsx` | Selection handles, hover states, snapping guides |
| NewElementCanvas | `canvases/NewElementCanvas.tsx` | Element being actively drawn |
| Background | (inline) | Grid and viewport background |

### Rendering Pipeline

1. Filter visible elements by viewport bounds
2. Sort by fractional index (z-order)
3. Render via Rough.js (hand-drawn shapes) or Canvas 2D API (text, images)
4. Apply zoom and scroll transforms
5. Interactive layer overlays selection UI

Rendering code lives in `renderer/staticScene.ts` and `renderer/interactiveScene.ts`.

## Element System

### Element Hierarchy

All elements extend a base type with: `id`, `x`, `y`, `width`, `height`, `angle`, `strokeColor`, `backgroundColor`, `fillStyle`, `strokeWidth`, `roughness`, `opacity`, `seed`, `version`, `versionNonce`, `index` (fractional), `groupIds`, `frameId`, `boundElements`, `locked`.

Element types: `rectangle`, `diamond`, `ellipse`, `arrow`, `line`, `freedraw`, `text`, `image`, `frame`, `magicframe`, `embeddable`, `iframe`, `selection`.

### Fractional Indexing

Elements use fractional indices (`packages/element/src/fractionalIndex.ts`) for z-ordering. This allows concurrent insertions without renumbering — essential for multiplayer editing.

### Bound Elements

Text can be bound inside containers (rectangles, ellipses, diamonds). Arrows bind to shape edges. Binding logic in `packages/element/src/binding.ts` (84KB) handles connection detection, gap calculation, and updates on element movement.

## History & Undo/Redo

Delta-based history system (`packages/excalidraw/history.ts`):

- **StoreDelta** captures incremental changes (not full snapshots)
- Each delta is invertible — undo applies the inverse
- Undo pops from `undoStack`, pushes inverse to `redoStack`
- Redo pops from `redoStack`, pushes inverse to `undoStack`
- Collaboration metadata (version, versionNonce) is excluded from history

## Collaboration

Real-time collaboration via Socket.io:

- Delta-based sync — only changed properties are transmitted
- Conflict resolution via `version`/`versionNonce` on each element
- Presence system: live cursors, usernames, selected elements
- `Portal` abstraction (`excalidraw-app/collab/Portal.tsx`) manages the WebSocket tunnel
- Fractional indexing prevents ordering conflicts

## Data Serialization

- **JSON** — primary format for `.excalidraw` files
- **PNG with metadata** — raster export with embedded scene data in PNG chunks
- **SVG** — vector export via `renderer/staticSvgScene.ts`
- **Compression** — Pako zlib for binary data encoding
- **IndexedDB** (via `idb-keyval`) — local browser persistence
- **File System Access API** — native file save/open dialogs

## Coordinate System

- **Scene coordinates** — infinite 2D plane, elements positioned absolutely
- **Viewport coordinates** — visible browser window area
- Transforms: `sceneCoordsToViewportCoords()` / `viewportCoordsToSceneCoords()`
- Zoom range: 0.1 to 30 (10% to 3000%)
