# Architecture

> High-level architecture of the Excalidraw codebase. For detailed patterns see [systemPatterns.md](../../memory-bank/systemPatterns.md).

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

## Key Design Principles

1. **Canvas-first**: All drawing happens on HTML Canvas (not DOM) for performance
2. **Atomic state**: Jotai atoms isolated per editor instance via `jotai-scope`
3. **Offline-first**: IndexedDB auto-save, PWA with service worker
4. **Embeddable**: Core is a publishable React component (`@excalidraw/excalidraw`)
5. **Collaboration-native**: WebSocket sync with conflict resolution built-in

## Directory Map

```
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
- [System Patterns](../../memory-bank/systemPatterns.md) — state management, rendering pipeline, collaboration flow
- [Tech Context](../../memory-bank/techContext.md) — dependencies and versions
- [Decision Log](../../memory-bank/decisionLog.md) — architectural decisions with rationale
