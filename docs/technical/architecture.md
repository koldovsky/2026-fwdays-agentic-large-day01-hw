# Excalidraw — Detailed Architecture

## High-Level Overview

Excalidraw is a monorepo containing five npm packages and a standalone web application. The core library (`packages/excalidraw`) is an embeddable React component that renders an infinite-canvas drawing editor. The web app (`excalidraw-app/`) adds collaboration, persistence, and hosting on top.

```text
┌─────────────────────────────────────────────────┐
│                 excalidraw-app                    │
│  (Firebase, collaboration, file persistence)     │
├─────────────────────────────────────────────────┤
│              packages/excalidraw                  │
│  (React component, actions, UI, rendering)       │
├──────────┬──────────┬──────────┬────────────────┤
│ packages │ packages │ packages │   packages     │
│ /element │ /common  │  /math   │    /utils      │
└──────────┴──────────┴──────────┴────────────────┘
```

## Package Architecture

### packages/common (Foundation Layer)

Shared constants, utility functions, and TypeScript types used by all other packages.

**Key modules:**
- `constants.ts` (14KB) — application-wide constants (colors, keys, thresholds, dimensions)
- `utils.ts` (34KB) — general-purpose utilities (debounce, throttle, type guards, DOM helpers)
- `colors.ts` (10KB) — color manipulation (hex parsing, contrast, palette generation)
- `editorInterface.ts` — abstract editor interface for cross-package communication
- `appEventBus.ts` — event emitter for decoupled app events

### packages/math (Geometry Layer)

Pure mathematical functions with no React or DOM dependencies. 12 source files covering:

- **Vectors** — add, subtract, normalize, rotate, scale, dot/cross product
- **Points** — distance, midpoint, interpolation
- **Angles** — radians/degrees conversion, angle between points
- **Matrices** — 2D transformation matrices
- **Bounds** — bounding box intersection, containment tests
- **Curves** — Bezier curve operations

### packages/element (Element Layer)

Defines all drawing element types, their creation, transformation, and rendering logic.

**Core modules:**
- `types.ts` — TypeScript interfaces for all 13 element types
- `newElement.ts` (13KB) — factory functions for element creation
- `transform.ts` (22KB) — resize, rotate, move operations
- `bounds.ts` (34KB) — bounding box and hit-test calculations
- `binding.ts` (84KB) — arrow-to-shape connection system
- `linearElementEditor.ts` (72KB) — interactive editing of lines/arrows (point manipulation)
- `elbowArrow.ts` (64KB) — auto-routed orthogonal arrows with waypoints
- `renderElement.ts` (35KB) — element-to-canvas rendering via Rough.js
- `shape.ts` (34KB) — geometric shape path generation
- `Scene.ts` (13KB) — scene graph management (add, remove, query elements)
- `store.ts` (29KB) — element store with delta tracking for collaboration
- `zindex.ts` (17KB) — z-ordering operations (bring to front, send to back)
- `fractionalIndex.ts` — fractional indexing for multiplayer-safe ordering
- `frame.ts` (26KB) — frame/artboard grouping and containment logic
- `textElement.ts` (15KB) — text measurement, wrapping, and bound-text handling

### packages/excalidraw (Application Layer)

The main embeddable React component. Published as `@excalidraw/excalidraw` on npm.

#### Action System (`actions/`, 48 files)

Every user-initiated state change goes through an action. Actions are registered in `actions/index.ts` and dispatched by `ActionManager` (`actions/manager.tsx`).

**Action categories:**
- **Selection**: selectAll, duplicateSelection, deleteSelectedElements
- **Properties**: changeStrokeColor, changeBackgroundColor, changeFontSize, changeFontFamily, changeStrokeWidth, changeStrokeStyle, changeFillStyle, changeOpacity, changeRoughness, changeRoundness
- **History**: undo, redo, finalize
- **Clipboard**: copy, cut, paste, copyAsPng, copyAsSvg
- **Alignment**: alignTop, alignBottom, alignLeft, alignRight, distributeHorizontally, distributeVertically
- **Grouping**: group, ungroup
- **Z-order**: sendToBack, bringToFront, sendBackward, bringForward
- **Tools**: toggleEraserTool, toggleHandTool, toggleLassoTool
- **Export**: saveToActiveFile, saveFileToDisk, exportWithDarkMode
- **Text**: bindText, unbindText, wrapTextInContainer
- **Linking**: hyperlink, elementLink, copyElementLink

#### Rendering Engine (`renderer/`, 8 files)

Multi-canvas rendering with separate pipelines for display and export:

- `interactiveScene.ts` (57KB) — renders selection handles, snap guides, collaboration cursors, drag previews
- `staticScene.ts` (13KB) — renders the final appearance of elements (used for export too)
- `staticSvgScene.ts` (25KB) — SVG-specific rendering for vector export
- `renderElement.ts` — delegates to Rough.js for hand-drawn shapes

#### Components (`components/`, 156 directories)

- `App.tsx` (407KB) — the main component, handles all pointer/keyboard events, tool state, and orchestrates the canvas layers. This is the largest and most critical file.
- `canvases/` — StaticCanvas, InteractiveCanvas, NewElementCanvas
- `ColorPicker/` — color selection with presets and custom input
- `dropdownMenu/` — reusable dropdown menu system
- `MainMenu/` — file operations menu
- `Actions.tsx` (41KB) — toolbar and property panel rendering
- `HelpDialog.tsx` — keyboard shortcut reference
- `LayerUI.tsx` — main UI layout orchestration

#### Data Layer (`data/`, 17 directories)

- `restore.ts` (31KB) — import and data migration from older formats
- `encode.ts` (11KB) — serialization with compression
- `blob.ts` (14KB) — binary blob creation for export
- `library.ts` (31KB) — library item management
- `filesystem.ts` — File System Access API integration

#### Other Key Modules

- `clipboard.ts` (19KB) — clipboard read/write with multi-method fallback
- `snapping.ts` (36KB) — element snap-to-grid and snap-to-element
- `history.ts` (6.5KB) — undo/redo stack management
- `appState.ts` (12KB) — default AppState definition
- `i18n.ts` — internationalization setup
- `hooks/` (14 files) — React hooks for state access, events, device detection

### packages/utils (Export Layer)

Public API for programmatic export/import:

- `serializeAsJSON()` — scene to JSON string
- `exportToBlob()` — scene to PNG/JPEG Blob
- `exportToSvg()` — scene to SVG element
- `importFromBlob()` — load scene from file
- `exportToCanvas()` — render to canvas element

### excalidraw-app (Web Application)

The standalone web app hosted at excalidraw.com. Adds features not in the library:

- `App.tsx` (39KB) — initializes collaboration, persistence, and UI shell
- `collab/Collab.tsx` — collaboration controller (Socket.io lifecycle)
- `collab/Portal.tsx` — WebSocket tunnel abstraction
- `data/` — local persistence via IndexedDB
- `share/` — link sharing and room creation
- `components/AI.tsx` — AI-powered features UI

## State Management

Excalidraw's state is divided into three core layers, all governed by the Action System.

### AppState

The global editor state object defined in `packages/excalidraw/appState.ts`. Tracks UI concerns: active tool, viewport position (`scrollX`, `scrollY`), zoom level, selected element IDs, grid settings, theme, and collaboration status. Updated exclusively through action `perform()` return values.

### Elements (SceneElementsMap)

The collection of all drawing elements, stored as an indexed map in `packages/element/src/store.ts`. Elements are immutable — updates create new objects via `newElementWith()`. The store records `StoreDelta` objects for each change, enabling both undo/redo and real-time collaboration sync.

### ActionManager

The central dispatcher defined in `packages/excalidraw/actions/manager.tsx`. All state transitions flow through it:

1. User event (click, key press, API call) triggers an action
2. `ActionManager.executeAction()` calls `action.perform(elements, appState)`
3. The action returns updated `{ elements, appState }` (partial updates allowed)
4. The store records a `StoreDelta` for history tracking
5. React re-renders based on changed state
6. If in a collaborative room, the delta is broadcast via `Portal`

Actions are registered in `packages/excalidraw/actions/index.ts` (48 actions total). Each action optionally defines `keyTest` (keyboard shortcut), `predicate` (availability guard), `PanelComponent` (properties panel UI), and `trackEvent` (analytics).

## Data Flow

```text
User Event (click/key/touch)
    │
    ▼
App.tsx event handler
    │
    ▼
ActionManager.executeAction()
    │
    ├── Action.perform() → returns {elements, appState, files}
    │
    ▼
State Update
    ├── SceneElementsMap updated → StoreDelta recorded
    ├── AppState updated → React re-render triggered
    └── History stack updated (if applicable)
    │
    ▼
Canvas Re-render
    ├── StaticCanvas → staticScene.ts
    ├── InteractiveCanvas → interactiveScene.ts
    └── NewElementCanvas (if drawing)
    │
    ▼
Collaboration Sync (if in room)
    └── Portal.broadcastDelta() → Socket.io → other clients
```

## Rendering Architecture

### Coordinate Transformation

All elements are positioned in **scene coordinates** (infinite 2D plane). The viewport maps a window onto this plane.

Key transforms:
- `sceneCoordsToViewportCoords(x, y, {scrollX, scrollY, zoom})` — scene → screen
- `viewportCoordsToSceneCoords(x, y, {scrollX, scrollY, zoom})` — screen → scene

### Rendering Optimization

- Elements outside the viewport are culled before rendering
- Rough.js shape data is cached per element (invalidated on property change)
- `requestAnimationFrame` drives the render loop at 60fps
- Memoization prevents React re-renders of unchanged components

## Collaboration Architecture

```text
Client A                    Server (Socket.io)              Client B
   │                            │                              │
   │── StoreDelta ──────────────│──────────────────────────────▶│
   │                            │                              │
   │◀─────────────────────────── │── StoreDelta ───────────────│
   │                            │                              │
   │── Presence (cursor) ──────│──────────────────────────────▶│
   │◀──────────────────────────│── Presence (cursor) ─────────│
```

- **Delta sync**: only changed element properties are transmitted
- **Conflict resolution**: `version` and `versionNonce` on each element; latest version wins
- **Fractional indexing**: concurrent insertions don't conflict on z-order
- **Presence**: cursor position, selected elements, and username broadcast independently

## Testing Architecture

- **Vitest** runs unit and integration tests
- **Canvas mocking** via `vitest-canvas-mock` (Canvas 2D API stubbed)
- **Testing Library** for React component interaction tests
- Tests live alongside source code or in `__tests__/` directories
- Snapshot tests for UI component rendering
- `yarn test:all` runs tests, type checks, linting, and formatting checks

## Build Pipeline

```text
Source (TypeScript + React)
    │
    ├── packages/* → ESBuild → dist/dev/ + dist/prod/ + dist/types/
    │
    └── excalidraw-app → Vite → dist/ (production bundle)
```

- ESBuild produces both dev (with source maps) and prod (minified) builds
- Vite handles the web app build with plugins for PWA, SVG, EJS templates
- TypeScript declarations generated separately for npm consumption
