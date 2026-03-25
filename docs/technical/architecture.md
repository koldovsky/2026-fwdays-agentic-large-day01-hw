# Architecture

> Cross-reference: [techContext.md](../memory/techContext.md) for stack versions, [systemPatterns.md](../memory/systemPatterns.md) for design patterns.

## High-Level Overview

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

## State Architecture

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

    Collab -->|reads/writes| CollabAPI
    App -->|reads| IsCollab
    ExcalidrawAPI -->|exposes| AppState
    ExcalidrawAPI -->|exposes| Elements
```

## Action System

All 46 canvas operations are defined as `Action` objects:

```typescript
interface Action {
  name: string
  label?: string
  perform: (elements, appState, value, app) => ActionResult
  keyTest?: (event) => boolean
  contextItemLabel?: string
  PanelComponent?: React.FC   // renders in properties panel
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
