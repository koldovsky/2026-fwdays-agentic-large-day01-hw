# Excalidraw Architecture

## 1. High-Level Overview

Excalidraw is structured as a **Yarn-workspaces monorepo** with five internal packages and a standalone web application. The architecture separates pure computation (math, element logic) from UI concerns (React components, canvas rendering) and deployment wiring (Firebase, Socket.io).

```
┌─────────────────────────────────────────────────────────────┐
│                    excalidraw-app                            │
│  Standalone web deployment: Firebase auth, Socket.io collab,│
│  Sentry monitoring, Vercel hosting, PWA manifest            │
└────────────────────────┬────────────────────────────────────┘
                         │ imports
┌────────────────────────▼────────────────────────────────────┐
│                 packages/excalidraw                          │
│  React engine: components, actions, rendering, hooks, UI    │
└───┬──────────────┬──────────────┬───────────────────────────┘
    │              │              │
┌───▼───┐   ┌─────▼─────┐  ┌────▼────┐
│element │   │  common   │  │  utils  │
│Scene,  │   │Emitter,   │  │Helpers  │
│Store,  │   │types,     │  │         │
│Delta   │   │constants  │  │         │
└───┬────┘   └─────┬─────┘  └─────────┘
    │              │
┌───▼──────────────▼──┐
│    packages/math    │
│  Vectors, points,   │
│  curves, transforms │
└─────────────────────┘
```

### Package Responsibilities

| Package | Responsibility | Key Exports |
|---------|---------------|-------------|
| `@excalidraw/math` | Pure 2D geometry — no React dependency | `Point`, `Vector`, `Segment`, `Curve`, matrix transforms |
| `@excalidraw/common` | Shared infrastructure — no React dependency | `Emitter`, utility types, constants, `AppEventBus` |
| `@excalidraw/element` | Element model and state persistence | `Scene`, `Store`, `StoreDelta`, element types, mutations, bindings |
| `@excalidraw/utils` | Miscellaneous helpers | Encoding, ID generation, environment detection |
| `@excalidraw/excalidraw` | React UI engine (the npm package) | `<Excalidraw>` component, actions, renderers, hooks, imperative API |
| `excalidraw-app` | Deployed product | Firebase config, collab manager, Sentry setup, routing |

---

## 2. Component Architecture

### App.tsx — The Central Orchestrator

`App.tsx` is a **React class component** (~9000+ lines) that owns:
- All pointer/keyboard/touch event handling
- Element creation, selection, drag, resize, rotation
- Canvas lifecycle (mount, resize, scroll, zoom)
- Action dispatching via `ActionManager`
- Collaboration event handling

It exposes state and capabilities downward through **8 React contexts**:

```
<AppContext.Provider>                    → AppClassProperties (methods + refs)
  <AppPropsContext.Provider>             → ExcalidrawProps (consumer config)
    <EditorInterfaceContext>             → EditorInterface (UI state helpers)
      <ExcalidrawElementsContext>        → readonly ExcalidrawElement[]
        <ExcalidrawAppStateContext>      → AppState
          <ExcalidrawSetAppStateContext> → setState function
            <ExcalidrawActionManagerContext> → ActionManager
              <ExcalidrawAPIContext>     → Imperative API ref
```

Child components consume contexts via hooks: `useApp()`, `useExcalidrawElements()`, `useExcalidrawAppState()`, etc.

### Component Organization

```
packages/excalidraw/components/
├── App.tsx                  # Central orchestrator (class component)
├── canvases/
│   ├── StaticCanvas.tsx     # Renders committed elements
│   ├── InteractiveCanvas.tsx # Renders selection UI, handles pointer events
│   └── NewElementCanvas.tsx # Renders element being drawn
├── Actions.tsx              # Renders action toolbar panels
├── LayerUI.tsx              # Main layout shell (toolbar, sidebar, footer)
├── Toolbar.tsx              # Tool selection bar
├── CommandPalette/          # Cmd+K search & action palette
├── ColorPicker/             # HSV color picker with presets
├── Sidebar/                 # Collapsible side panel (libraries, settings)
├── main-menu/               # File/edit/view menus
├── footer/                  # Status bar (zoom, help, social links)
├── live-collaboration/      # Collab UI (share dialog, presence avatars)
├── FollowMode/              # Follow another user's viewport
├── TTDDialog/               # Text-to-diagram (AI) dialog
├── hoc/
│   └── withInternalFallback.tsx  # HOC for dual-render deduplication
└── [30+ more feature components]
```

---

## 3. Actions System

The **Actions System** implements the **Command Pattern** — every user-facing operation is an `Action` object.

### Action Lifecycle

```
Registration (module load)     Dispatch                    Result
─────────────────────────     ────────                    ──────
register({                    ActionManager               ActionResult {
  name: "actionGroup",          .executeAction(             elements?,
  label: "Group",                 action,                   appState?,
  icon: <GroupIcon/>,             source,                   files?,
  keyTest: Ctrl+G,                value                     captureUpdate
  perform(elements,             )                         }
    appState, _, app) {                                     │
    return { ... }            Sources:                      ▼
  }                           "ui" | "keyboard" |       App.setState()
})                            "contextMenu" |            + Store.commit()
                              "api" | "commandPalette"
```

### Action Interface

```typescript
interface Action {
  name: ActionName               // Unique identifier (147+ registered names)
  label: string | ContextualFn   // Display text
  icon?: ReactNode | ContextualFn
  perform(elements, appState, formData, app) → ActionResult | Promise<ActionResult>
  predicate?(elements, appState, props, app) → boolean  // Visibility filter
  keyTest?(event, appState, elements, app) → boolean     // Keyboard binding
  checked?(appState) → boolean                           // Toggle state
  PanelComponent?: React.FC                              // Properties panel UI
  trackEvent: false | TrackingConfig
}
```

### Key Action Categories

| Category | Examples |
|----------|---------|
| Element CRUD | `actionDeleteSelected`, `actionDuplicateSelection`, `actionPaste` |
| Transform | `actionGroup`, `actionUngroup`, `actionFlipHorizontal`, `actionAlignTop` |
| Style | `actionChangeStrokeColor`, `actionChangeOpacity`, `actionChangeFontFamily` |
| Canvas | `actionZoomIn`, `actionResetZoom`, `actionToggleGridMode` |
| App | `actionToggleViewMode`, `actionToggleDarkMode`, `actionExportScene` |
| History | `actionUndo`, `actionRedo` |

---

## 4. State Management

### Three State Systems

| System | What | Where | Granularity |
|--------|------|-------|-------------|
| **AppState** | UI state (selected tool, colors, zoom, scroll) | `App.state` (React class state) | Per-render |
| **Scene** | Element data (all shapes on canvas) | `Scene` class (Map + Array) | Per-element |
| **Jotai atoms** | Isolated UI slices (dialogs, menus) | `editorJotaiStore` | Per-atom |

### Store & Delta System (Undo/Redo + Collaboration)

```
         ┌──────────────┐
         │  User Action  │
         └──────┬───────┘
                │
                ▼
    Store.scheduleCapture(mode)
    mode = IMMEDIATELY | EVENTUALLY | NEVER
                │
                ▼
        Store.commit(elements, appState)
                │
        ┌───────┴────────┐
        │  Diff old vs   │
        │  new snapshot   │
        └───────┬────────┘
                │
        ┌───────▼────────┐
        │  StoreDelta    │  ← invertible diff
        └───────┬────────┘
                │
    ┌───────────┼───────────┐
    │           │           │
    ▼           ▼           ▼
 History    onChange     Collab sync
(undo/redo) (callback)  (broadcast)
```

### Core State Classes

- **StoreSnapshot** — Immutable point-in-time of elements + appState. Uses hash-based comparison for change detection.
- **StoreDelta** — Encodes what changed (added/removed/updated elements). Invertible for undo/redo.
- **StoreIncrement** — Event wrapper: `DurableIncrement` (goes to undo history) or `EphemeralIncrement` (UI-only, no history).

### Capture Modes

| Mode | Use Case | Undoable? |
|------|----------|-----------|
| `IMMEDIATELY` | Direct user actions (draw, move, delete) | Yes |
| `EVENTUALLY` | Async operations (paste from clipboard, image load) | Yes, after batch |
| `NEVER` | Remote collaboration sync, initial load | No |

---

## 5. Rendering Pipeline

### Dual-Canvas Architecture

```
┌─────────────────────────────────────────┐
│              Browser viewport           │
│  ┌───────────────────────────────────┐  │
│  │    Interactive Canvas (top)       │  │  ← Selection boxes, resize handles,
│  │    pointer-events: auto           │  │    snap lines, hover highlights
│  ├───────────────────────────────────┤  │
│  │    NewElement Canvas (middle)     │  │  ← Element currently being drawn
│  │    pointer-events: none           │  │
│  ├───────────────────────────────────┤  │
│  │    Static Canvas (bottom)         │  │  ← All committed elements via Rough.js
│  │    pointer-events: none           │  │    Grid, background color
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

### Static Canvas Render Cycle (`renderStaticScene`)

1. Bootstrap canvas with dimensions and theme
2. Apply zoom transformation matrix
3. Render grid (if enabled)
4. Iterate visible elements with frame clipping
5. Call `renderElement()` for each element → Rough.js generates hand-drawn paths
6. Render link icon overlays
7. **Optimization**: Only redraws when `sceneNonce` changes

### Interactive Canvas Render Cycle (`renderInteractiveScene`)

1. Render selection bounding boxes and transform handles
2. Show element resize/rotation controls
3. Draw snap lines and grid alignment points
4. Highlight hovered elements
5. **Redraws on every pointer move** for immediate visual feedback

### Element Rendering by Type

| Element Type | Renderer | Notes |
|-------------|----------|-------|
| Rectangle, Ellipse, Diamond | Rough.js | Hand-drawn paths with configurable roughness |
| Line, Arrow | Rough.js polyline | Optional arrowheads, elbow routing |
| Freedraw | Perfect Freehand | Pressure-sensitive smooth strokes |
| Text | Canvas `fillText` | Font metrics calculation, wrapping |
| Image | Canvas `drawImage` | Bounds fitting, aspect ratio |
| Frame | Clip region | Masks child elements within bounds |

---

## 6. Scene Graph

The `Scene` class (`packages/element/src/Scene.ts`) is the central element registry.

### Data Structures

```
Scene
├── elementsMap: Map<id, ExcalidrawElement>    ← O(1) lookup by ID
├── nonDeletedElements: OrderedElement[]       ← Rendering order (array)
├── nonDeletedElementsMap: Map<id, Element>    ← Non-deleted subset
└── selectedElementsCache: Map<hash, Element[]> ← Memoized selections
```

### Key Design Decisions

- **Soft delete**: Elements are marked `isDeleted: true`, never removed from the Map. This enables undo and collaboration reconciliation.
- **Fractional indexing**: Elements use fractional index values for ordering, allowing O(1) reorder without shifting the entire array — critical for collaborative editing.
- **Selection caching**: `getSelectedElements()` results are memoized by a hash of selected element IDs, avoiding recomputation on every render.
- **Dual access**: Map for ID lookups, Array for ordered iteration — both kept in sync.

---

## 7. Collaboration Architecture

```
┌──────────┐     WebSocket      ┌──────────────┐     WebSocket     ┌──────────┐
│ Client A │ ◄─────────────────► │  Collab      │ ◄───────────────► │ Client B │
│          │   scene updates     │  Server      │   scene updates   │          │
│          │   cursor position   │ (Socket.io)  │   cursor position │          │
└──────────┘                     └──────────────┘                   └──────────┘
```

### Key Concepts

- **Room**: A shared session identified by a unique ID embedded in the URL hash fragment.
- **Reconciliation**: Incoming remote elements are merged with local state using `CaptureUpdateAction.NEVER` — remote changes don't create undo entries.
- **Presence**: Each client broadcasts cursor position, selected elements, username, and avatar.
- **Follow Mode**: A client can lock their viewport to follow another user's scroll and zoom.
- **Encryption**: Scene data is encrypted client-side before being sent to the storage backend.

### Data Persistence

| Storage | What | When |
|---------|------|------|
| JSON backend API | Scene data (encrypted) | Shared links |
| Socket.io server | Real-time room state | Active collaboration |
| Firebase | Authentication | User identity |
| localStorage + IndexedDB | Autosave | Offline resilience, crash recovery |

---

## 8. Event Flow (End-to-End)

```
1. User clicks canvas
   │
2. InteractiveCanvas captures pointer event
   │
3. App.handlePointerDown() determines action:
   │  - Hit test: did we click an element?
   │  - Tool check: are we drawing a new shape?
   │  - Selection: multi-select, drag-select?
   │
4. During drag: App.handlePointerMove()
   │  - Creates/transforms elements via Scene.mutateElement()
   │  - Updates AppState (cursor, selection, tool state)
   │  - NewElementCanvas renders in-progress shape
   │
5. On release: App.handlePointerUp()
   │  - Finalizes element (commits to Scene)
   │  - Store.scheduleCapture(IMMEDIATELY)
   │
6. Store.commit()
   │  - Diffs old vs new snapshot → StoreDelta
   │  - Emits DurableIncrement → History stack (undo)
   │  - Emits StoreIncrement → onChange callback + collab broadcast
   │
7. React re-render
   │  - renderStaticScene() draws all elements
   │  - renderInteractiveScene() draws selection UI
   │  - Context consumers update (toolbar, properties panel)
```

---

## 9. Extension Points (npm Package API)

The `<Excalidraw>` component provides several extension mechanisms for embedders:

| Extension | Mechanism |
|-----------|-----------|
| Custom tools | `props.tools` — register additional tool types |
| Custom UI | `props.renderTopRightUI`, `renderCustomStats`, `UIOptions` |
| Imperative API | `ref` exposes `updateScene()`, `getSceneElements()`, `exportToSvg()`, etc. |
| onChange callback | `props.onChange(elements, appState, files)` — fires on every state change |
| Libraries | Third-party shape libraries loadable via the sidebar |
| Themes | `props.theme` switches between light and dark rendering |
| Initial data | `props.initialData` — preload elements, appState, files |
| View mode | `props.viewModeEnabled` — read-only rendering |

---

## 10. Key Architectural Decisions Summary

| Decision | Rationale |
|----------|-----------|
| **Class component for App** | Complex lifecycle management, imperative API bridge via `forwardRef`, mature patterns for this scale |
| **Jotai over Redux** | Lightweight, atom-based, supports multi-instance isolation via `jotai-scope` |
| **Dual canvas** | Separates expensive element rendering from cheap pointer-feedback rendering |
| **Soft delete** | Elements marked `isDeleted: true`, never removed — enables undo and collaboration |
| **Fractional indexing** | O(1) element reordering without shifting arrays — critical for real-time collab |
| **Rough.js** | Hand-drawn aesthetic is a core product differentiator, not decoration |
| **StoreDelta invertibility** | Undo = apply inverse delta; efficient history without full-state snapshots |
| **Monorepo with zero-React inner packages** | `math` and `element` have no React dependency — usable outside React contexts |
