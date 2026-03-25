# Architecture

> High-level architecture of the Excalidraw codebase. For detailed patterns see [systemPatterns.md](../memory/systemPatterns.md).

## System Diagram

```mermaid
graph TB
    subgraph "Browser"
        APP[excalidraw-app]
        subgraph "packages/"
            CORE["@excalidraw/excalidraw<br/>Core UI + Canvas"]
            ELEM["@excalidraw/element<br/>Element Operations"]
            MATH["@excalidraw/math<br/>Geometry"]
            COMMON["@excalidraw/common<br/>Shared Types"]
            UTILS["@excalidraw/utils<br/>Helpers"]
        end
    end

    subgraph "External Services"
        WS[WebSocket Server<br/>:3002 / oss-collab.excalidraw.com]
        FB[Firebase<br/>Auth + Firestore + Storage]
        API[JSON API<br/>json.excalidraw.com]
        AI[AI Backend<br/>:3016 / oss-ai.excalidraw.com]
    end

    APP --> CORE
    CORE --> ELEM --> COMMON
    CORE --> MATH --> COMMON
    CORE --> UTILS
    ELEM --> MATH

    APP -.->|WebSocket| WS
    APP -.->|Persistence| FB
    APP -.->|Scene sharing| API
    APP -.->|Diagram-to-code| AI
```

## Layer Architecture

```mermaid
graph LR
    subgraph "UI Layer"
        COMP[React Components<br/>156+ in components/]
        ACTIONS[Action System<br/>actions/]
        HOOKS[Custom Hooks<br/>hooks/]
    end

    subgraph "State Layer"
        JOTAI[Jotai Atoms<br/>editor-jotai.ts]
        APPSTATE[AppState<br/>AppStateObserver]
        CTX[Contexts<br/>Tunnels, API, UIState]
    end

    subgraph "Rendering Layer"
        STATIC[Static Canvas<br/>staticScene.ts]
        INTERACTIVE[Interactive Canvas<br/>interactiveScene.ts]
        SVG[SVG Export<br/>staticSvgScene.ts]
    end

    subgraph "Data Layer"
        PERSIST[Persistence<br/>IndexedDB + Firebase]
        COLLAB[Collaboration<br/>Collab.tsx + Portal]
        RESTORE[Restore/Reconcile<br/>restore.ts + reconcile.ts]
    end

    COMP --> JOTAI
    COMP --> APPSTATE
    ACTIONS --> APPSTATE
    JOTAI --> STATIC
    JOTAI --> INTERACTIVE
    APPSTATE --> COLLAB
    COLLAB --> RESTORE
    RESTORE --> PERSIST
```

## Data Flow

### User Interaction Flow

```mermaid
flowchart TD
    A[User Input<br/>mouse/keyboard/touch] --> B[App.tsx<br/>Event Handlers]
    B --> C{Action Type}
    C -->|Drawing| D[Element Creation<br/>packages/element/]
    C -->|UI| E[AppState Update]
    C -->|Tool switch| F[ActiveTool Change]

    D --> G[Scene Update]
    E --> G
    F --> G

    G --> H[AppStateObserver.flush]
    H --> I[Re-render Canvas]
    H --> J[Notify Subscribers]

    I --> K[Static Scene<br/>Background elements]
    I --> L[Interactive Scene<br/>Selection, handles]

    J --> M[Collaboration Sync]
    J --> N[Auto-save to IndexedDB]
```

### Collaboration Data Flow

```mermaid
flowchart LR
    subgraph "Client A"
        A1[User Action] --> A2[Local State Update]
        A2 --> A3[Broadcast via Portal]
    end

    subgraph "WebSocket Server"
        WS[Message Router<br/>socket.io]
    end

    subgraph "Client B"
        B1[Receive Update] --> B2["reconcileElements()<br/>version + nonce merge"]
        B2 --> B3[Local State Update]
        B3 --> B4[Re-render Canvas]
    end

    A3 -->|SCENE_UPDATE| WS
    WS -->|Broadcast| B1

    subgraph "Persistence"
        FB[Firebase<br/>Firestore + Storage]
        IDB[IndexedDB<br/>Local cache]
    end

    A2 -->|Throttled save| FB
    A2 -->|Immediate| IDB
    B3 -->|Immediate| IDB
```

### Export Data Flow

```mermaid
flowchart LR
    A[Scene Elements + AppState] --> B{Export Format}
    B -->|PNG| C[Canvas → Blob<br/>+ embedded JSON metadata]
    B -->|SVG| D[staticSvgScene.ts<br/>→ SVG string]
    B -->|JSON| E[Serialize to<br/>.excalidraw file]
    B -->|Clipboard| F[Copy as PNG/SVG/text]

    C --> G[Download / Share]
    D --> G
    E --> G
    F --> H[System Clipboard]
```

### State Management Flow

```mermaid
flowchart TD
    subgraph "Jotai Atoms (Reactive)"
        JA[collabAPIAtom]
        JB[isCollaboratingAtom]
        JC[isOfflineAtom]
        JD[UIAppState atoms]
    end

    subgraph "AppState (Imperative)"
        AS[AppState object<br/>~100+ properties]
        OBS[AppStateObserver<br/>subscription-based]
    end

    subgraph "React Contexts"
        CTX1[ExcalidrawAPIContext<br/>imperative API for host apps]
        CTX2[UIAppStateContext<br/>UI state for components]
        CTX3[TunnelsContext<br/>portal-based UI composition]
    end

    JA --> |useAtomValue| COMP[React Components]
    AS --> OBS --> |notify| COMP
    CTX1 --> |useContext| COMP
    CTX2 --> |useContext| COMP
    CTX3 --> |render into slots| COMP
```

## Package Dependencies

### Dependency Graph

```mermaid
graph TD
    APP["excalidraw-app<br/>(web application)"]
    EXC["@excalidraw/excalidraw<br/>(core library)"]
    ELEM["@excalidraw/element<br/>(element operations)"]
    MATH["@excalidraw/math<br/>(geometry & math)"]
    COMMON["@excalidraw/common<br/>(shared types & constants)"]
    UTILS["@excalidraw/utils<br/>(helper functions)"]

    APP --> EXC
    EXC --> ELEM
    EXC --> MATH
    EXC --> COMMON
    EXC --> UTILS
    ELEM --> MATH
    ELEM --> COMMON
    MATH --> COMMON
```

### Package Details

| Package | Purpose | Key Exports | Build |
|---------|---------|-------------|-------|
| `@excalidraw/common` | Foundation layer | Constants (`FONT_FAMILY`, `TOOL_TYPE`, `EVENT`), shared types, utility functions | esbuild → ESM |
| `@excalidraw/math` | Geometry engine | Point/vector operations, curve math, polygon intersection, angle calculations | esbuild → ESM |
| `@excalidraw/element` | Element operations | Element types (`ExcalidrawElement` union), creation, mutation, binding, collision detection | esbuild → ESM |
| `@excalidraw/excalidraw` | Core UI library | React component, actions, renderer, state management, data layer | esbuild → ESM |
| `@excalidraw/utils` | Standalone helpers | Scene export utilities, element helpers (no React dependency) | esbuild → ESM |

### Build Order (Critical)

Packages must be built in dependency order:

```text
1. @excalidraw/common    (no internal deps)
2. @excalidraw/math      (depends on common)
3. @excalidraw/element   (depends on common, math)
4. @excalidraw/excalidraw (depends on all above)
5. @excalidraw/utils     (depends on common)
```

Command: `yarn build:packages` handles this automatically.

### External Dependency Map

| Category | Package | Used By | Purpose |
|----------|---------|---------|---------|
| **Rendering** | `roughjs` | excalidraw | Hand-drawn shape rendering |
| **Rendering** | `perfect-freehand` | excalidraw | Smooth freehand strokes |
| **State** | `jotai` + `jotai-scope` | excalidraw | Atomic state, per-instance isolation |
| **Collaboration** | `socket.io-client` | excalidraw-app | WebSocket real-time sync |
| **Persistence** | `firebase` | excalidraw-app | Auth, Firestore, Cloud Storage |
| **Persistence** | `idb-keyval` | excalidraw | IndexedDB wrapper for local save |
| **Data** | `pako` | excalidraw | Compression for scene data |
| **Data** | `nanoid` | excalidraw | Unique element ID generation |
| **Data** | `fractional-indexing` | excalidraw | Stable element ordering for multiplayer |
| **Data** | `png-chunk-text` | excalidraw | Embed scene JSON in PNG exports |
| **UI** | `clsx` | excalidraw | Conditional CSS class names |
| **UI** | `fuzzy` | excalidraw | Fuzzy search for command palette |
| **i18n** | `i18next` | excalidraw | 60+ language translations |
| **Code** | `@codemirror/*` | excalidraw | In-app code editing |
| **Monitoring** | `@sentry/browser` | excalidraw-app | Error tracking (production) |

## Rendering Pipeline

### Canvas Layers

Excalidraw uses a multi-layer canvas approach for performance. Each layer serves a distinct purpose:

```mermaid
flowchart TD
    A[React State Change] --> B[Render Scheduler]
    B --> C["getNormalizedCanvasDimensions()<br/>DPI & viewport scaling"]
    C --> D{Layer Selection}

    D --> E["Static Canvas<br/>(staticScene.ts)<br/>Background element rendering"]
    D --> F["Interactive Canvas<br/>(interactiveScene.ts, ~57KB)<br/>Selection handles, transforms, snaps"]
    D --> G["New Element Canvas<br/>(renderNewElementScene.ts)<br/>Element being drawn"]
    D --> H["SVG Export<br/>(staticSvgScene.ts)<br/>Vector export rendering"]

    E --> I[Composite Canvas Output]
    F --> I
    G --> I
```

### Render Cycle

1. **State mutation** triggers render via `AppStateObserver`
2. **DPI normalization** adapts to device pixel ratio
3. **Static layer** renders all committed elements (cached when possible)
4. **Interactive layer** renders selection UI, transform handles, snap guides
5. **New element layer** renders the element currently being drawn
6. **Composite** layers are stacked in the browser

### Key Optimizations

- Layers are rendered independently — only dirty layers re-render
- Static scene is cached and reused when only interactive state changes
- `requestAnimationFrame` throttling prevents excessive renders
- Chunk-based rendering splits work across frames for large scenes

## Key Design Principles

1. **Canvas-first**: All drawing happens on HTML Canvas (not DOM) for performance
2. **Atomic state**: Jotai atoms isolated per editor instance via `jotai-scope`
3. **Offline-first**: IndexedDB auto-save, PWA with service worker
4. **Embeddable**: Core is a publishable React component (`@excalidraw/excalidraw`)
5. **Collaboration-native**: WebSocket sync with conflict resolution built-in

## Directory Map

```text
excalidraw-app/              → Web application shell
├── collab/                  → Real-time collaboration (Collab.tsx, Portal)
├── components/              → App-specific UI
├── data/                    → Firebase config, file management
└── vite.config.mts          → Build configuration

packages/excalidraw/         → Core library (555+ TS/TSX files)
├── components/              → 156+ React components
│   └── App.tsx              → Monolithic core (~407KB)
├── renderer/                → Canvas rendering pipeline
├── actions/                 → Action system (tools, transforms, clipboard)
├── data/                    → Persistence, export, reconciliation
├── hooks/                   → Custom React hooks
├── context/                 → Tunnels, contexts
├── scene/                   → Scene management
├── editor-jotai.ts          → Jotai store configuration
├── errors.ts                → Custom error hierarchy
└── types.ts                 → Core type definitions

packages/element/            → Element operations
packages/math/               → Geometry & math utilities
packages/common/             → Shared constants & types
packages/utils/              → Helper functions
```

## Related Docs

- [Dev Setup](./dev-setup.md) — onboarding guide
- [System Patterns](../memory/systemPatterns.md) — state management, rendering pipeline, collaboration flow
- [Tech Context](../memory/techContext.md) — dependencies and versions
- [Decision Log](../memory/decisionLog.md) — architectural decisions with rationale
