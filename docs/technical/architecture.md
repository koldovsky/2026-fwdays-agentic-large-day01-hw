# Architecture

> Last updated: 2026-03-25
> Cross-reference: [techContext.md](../memory/techContext.md) for stack versions, [systemPatterns.md](../memory/systemPatterns.md) for design patterns.

## High-Level Architecture

Excalidraw is a **monorepo** composed of five publishable packages and a standalone web application. All packages share one dependency lock file managed by Yarn Workspaces.

```mermaid
graph TD
    subgraph "Monorepo Root"
        App["excalidraw-app\n(React SPA / PWA)"]
        subgraph "packages/"
            Exc["@excalidraw/excalidraw\nv0.18.0\n(Core library)"]
            Elem["@excalidraw/element\nv0.18.0\n(Element ops)"]
            Common["@excalidraw/common\nv0.18.0\n(Shared utils)"]
            Math["@excalidraw/math\nv0.18.0\n(2D geometry)"]
            Utils["@excalidraw/utils\nv0.18.0\n(Misc utilities)"]
        end
    end

    App --> Exc
    Exc --> Elem
    Exc --> Common
    Exc --> Math
    Exc --> Utils
    Elem --> Common
    Elem --> Math
    Common --> Math
```

## Package Dependencies

Each package exports from a single `index.ts`. Dependency direction is strictly top-down — lower packages never import from higher ones.

## Layer Breakdown

### Layer 1 — Math & Geometry (`@excalidraw/math`)
Stateless pure functions: vector operations, 2D algebra, angle math. No React, no side effects.

### Layer 2 — Common Utilities (`@excalidraw/common`)
Shared constants, event bus (`appEventBus`), color utilities, bounding-box helpers, data structures (binary heap, queue, promise pool), URL utilities, and the `editorInterface` contract that decouples the editor from specific state implementations.

### Layer 3 — Element Operations (`@excalidraw/element`)
Everything about canvas elements without rendering them:
- Creation (`newElement/`), mutation (`mutateElement/`), duplication (`duplicate/`)
- Geometry: bounds, collision, distance, transforms, resize, z-index
- Advanced: elbow arrows, flowchart layout, fractional indexing, binding, frame management
- Scene graph management (`Scene/`)

### Layer 4 — Core Library (`@excalidraw/excalidraw`)
The public-facing React component and its subsystems:

| Subsystem | Location | Responsibility |
|-----------|----------|---------------|
| App Component | `components/App.tsx` | Root orchestrator (398 KB — largest file) |
| Action System | `actions/` | 46 discrete canvas operations |
| Renderer | `renderer/` | Pure canvas paint from scene state |
| WYSIWYG | `wysiwyg/` | In-canvas text editing |
| Fonts | `fonts/`, `subset/` | Font loading, subsetting for SVG export |
| Data | `data/` | Serialize, compress, encrypt, restore |
| Scene | `scene/` | Scene state transitions |
| Hooks | `hooks/` | Reusable React hooks |
| Locales | `locales/` | 50+ language strings |
| Components | `components/` | 136 UI components |

### Layer 5 — Web Application (`excalidraw-app`)
Wraps the library with production concerns:

| Module | Responsibility |
|--------|---------------|
| `App.tsx` | App shell, initializes Excalidraw with all props |
| `collab/Collab.tsx` | WebSocket collaboration, session lifecycle |
| `collab/Portal.tsx` | Socket.io portal (send/receive) |
| `data/firebase.ts` | Firebase CRUD operations |
| `data/LocalData.ts` | localStorage + IndexedDB persistence |
| `data/FileManager.ts` | File upload/download with Firebase Storage |
| `data/tabSync.ts` | Cross-tab scene synchronization |
| `data/index.ts` | Encryption, compression, backend sync |
| `app-jotai.ts` | Jotai store wrapper (prevents direct imports) |

## Component Hierarchy (Runtime)

```mermaid
graph TD
    Root["React Root"] --> App["<App /> (excalidraw-app)"]
    App --> ExcAlt["<Excalidraw />"]
    App --> Collab["<Collab />"]

    ExcAlt --> InitApp["<InitializeApp />"]
    ExcAlt --> LayerUI["<LayerUI />"]
    ExcAlt --> Canvases["<InteractiveCanvas />\n<StaticCanvas />"]

    LayerUI --> Actions["<Actions />"]
    LayerUI --> Toolbar["<Toolbar />"]
    LayerUI --> Sidebar["<DefaultSidebar />"]
    LayerUI --> MainMenu["<MainMenu />"]
    LayerUI --> Footer["<Footer />"]
    LayerUI --> TTDDialog["<TTDDialog />"]
    LayerUI --> CommandPalette["<CommandPalette />"]
```

## State Management

Three state layers:

```mermaid
graph LR
    subgraph "Jotai Store (app-jotai.ts)"
        CollabAPI["collabAPIAtom"]
        IsCollab["isCollaboratingAtom"]
        IsOffline["isOfflineAtom"]
        RoomLink["activeRoomLinkAtom"]
    end

    subgraph "Excalidraw Internal State (editor-jotai.ts)"
        AppState["AppState\n(272 fields)"]
        Elements["ExcalidrawElement[]"]
        Files["BinaryFiles"]
    end

    subgraph "ActionManager"
        AM["dispatch(action)\n→ ActionResult\n→ setState"]
    end

    Collab -->|reads/writes| CollabAPI
    App -->|reads| IsCollab
    ExcalidrawAPI -->|exposes| AppState
    ExcalidrawAPI -->|exposes| Elements
    AM -->|produces| AppState
    AM -->|produces| Elements
```

- **AppState** — 272-field object covering active tool, zoom, scroll offset, open dialogs, theme, and all UI flags
- **Elements** — immutable array of `ExcalidrawElement` objects; mutations go through `mutateElement()` to preserve referential equality checks
- **ActionManager** — receives dispatched actions, calls `action.perform()`, receives `ActionResult`, and applies the resulting state diff

## Data Flow

### 1. User Interaction → State Update → Re-render

```mermaid
sequenceDiagram
    participant User
    participant Canvas as InteractiveCanvas
    participant ActionManager
    participant AppState as AppState / Elements
    participant Renderer as StaticCanvas

    User->>Canvas: pointerdown / keypress
    Canvas->>ActionManager: dispatch action (name + payload)
    ActionManager->>ActionManager: action.perform(elements, appState, value)
    ActionManager-->>AppState: ActionResult { elements, appState }
    AppState->>Renderer: scene change triggers re-render
    Renderer->>Renderer: renderStaticScene() — pure paint
```

### 2. State Update → Persistence

```mermaid
sequenceDiagram
    participant AppState
    participant LocalData as LocalData (localStorage)
    participant IDB as IndexedDB
    participant Firebase

    AppState->>LocalData: saveElements() — debounced
    AppState->>LocalData: saveAppState() — debounced
    AppState->>IDB: saveLibrary() — on library change
    AppState->>Firebase: FileManager.saveFiles() — images/files only
```

### 3. Collaboration Sync Flow

```mermaid
sequenceDiagram
    participant User1 as User 1 (local)
    participant Collab as Collab.tsx
    participant WS as Socket.io Server
    participant User2 as User 2 (remote)

    User1->>Collab: element change (via onChange callback)
    Collab->>Collab: serialize + pako.deflate + AES-GCM encrypt
    Collab->>WS: socket.emit(SCENE_UPDATE, encryptedPayload)
    WS->>User2: broadcast to room
    User2->>User2: decrypt + inflate + reconcileElements()
    User2->>User2: updateScene() → re-render
```

### 4. Export Flow

```mermaid
sequenceDiagram
    participant User
    participant ExportDialog
    participant Renderer as exportToCanvas()
    participant Output

    User->>ExportDialog: choose format (PNG/SVG/JSON)
    ExportDialog->>Renderer: exportToCanvas(elements, appState)
    Renderer->>Renderer: renderStaticScene() on offscreen canvas
    Renderer-->>ExportDialog: HTMLCanvasElement
    ExportDialog->>Output: toBlob() → PNG download
    Note over Output: PNG also embeds full JSON\nin tEXt chunk for re-import
```

## Action System

All 46 canvas operations are defined as `Action` objects:

```typescript
// packages/excalidraw/actions/types.ts
interface Action {
  name: ActionName
  label: string | ((elements, appState, app) => string)
  perform: (elements, appState, value, app) => ActionResult | Promise<ActionResult>
  trackEvent: false | { category: string; action?: string }
  keyTest?: (event, appState, elements, app) => boolean
  predicate?: (elements, appState, appProps, app) => boolean
  checked?: (appState) => boolean
  PanelComponent?: React.FC   // renders in properties panel
  viewMode?: boolean          // if true, action works in read-only mode
}
```

The `ActionManager` registers actions and dispatches them from keyboard events, context menus, and the command palette — single definition, multiple triggers.

## Rendering Pipeline

```mermaid
sequenceDiagram
    participant State as Jotai/AppState
    participant Reconciler as React Reconciler
    participant Canvas as HTML Canvas
    participant Rough as Rough.js

    State->>Reconciler: Scene change
    Reconciler->>Canvas: renderScene()
    Canvas->>Rough: generatePath(element)
    Rough-->>Canvas: hand-drawn path
    Canvas->>Canvas: 2D API drawPath()
```

The renderer is a **pure function** — same input always produces same pixels. No side effects or subscriptions inside the render path.

## Public API Surface (`ExcalidrawImperativeAPI`)

Key imperative API methods accessed via `onExcalidrawAPI` prop callback:

| Category | Methods |
|----------|---------|
| Scene | `updateScene()`, `resetScene()`, `getSceneElements()`, `applyDeltas()` |
| Elements | `mutateElement()`, `scrollToContent()` |
| State | `getAppState()`, `getFiles()`, `refresh()` |
| Tools | `setActiveTool()`, `setCursor()`, `resetCursor()` |
| UI | `toggleSidebar()`, `registerAction()` |
| Events | `onChange()`, `onPointerDown()`, `onPointerUp()`, `onScrollChange()`, `onStateChange()`, `onEvent()` |

All event subscriptions return an **unsubscribe** function.
