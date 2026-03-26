# Architecture — Excalidraw

## High-Level Architecture

```
┌─────────────────────────────────────────────────────┐
│                  excalidraw-app                      │
│            (Standalone Web Application)              │
│                                                     │
│  ┌───────────┐  ┌──────────┐  ┌──────────────────┐ │
│  │  Firebase  │  │ Collab   │  │  App.tsx (host)  │ │
│  │  Storage   │  │ Socket.io│  │                  │ │
│  └───────────┘  └──────────┘  └──────────────────┘ │
└──────────────────────┬──────────────────────────────┘
                       │ uses
┌──────────────────────▼──────────────────────────────┐
│              @excalidraw/excalidraw                  │
│           (Core React Component Library)             │
│                                                     │
│  ┌──────────┐  ┌──────────┐  ┌─────────────────┐   │
│  │Components│  │ Actions  │  │  Data Layer     │   │
│  │  (UI)    │  │ (Logic)  │  │  (I/O, Export)  │   │
│  └──────────┘  └──────────┘  └─────────────────┘   │
│                                                     │
│  ┌──────────┐  ┌──────────┐  ┌─────────────────┐   │
│  │  Hooks   │  │ Jotai    │  │  Canvas Render  │   │
│  │          │  │ Atoms    │  │  (rough.js)     │   │
│  └──────────┘  └──────────┘  └─────────────────┘   │
└──────────────────────┬──────────────────────────────┘
                       │ depends on
       ┌───────────────┼───────────────┐
       ▼               ▼               ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│  @excalidraw│ │  @excalidraw│ │  @excalidraw│
│  /element   │ │  /common    │ │  /math      │
│             │ │             │ │             │
│ Types &     │ │ Colors,     │ │ Geometry,   │
│ manipulation│ │ Constants,  │ │ Points,     │
│ of drawing  │ │ Fonts, i18n │ │ Polygons,   │
│ elements    │ │ EventBus    │ │ Segments    │
└─────────────┘ └─────────────┘ └─────────────┘
```

## Package Dependency Graph

```
excalidraw-app
  └── @excalidraw/excalidraw
        ├── @excalidraw/element
        ├── @excalidraw/common
        ├── @excalidraw/math
        └── @excalidraw/utils
              ├── @excalidraw/element
              ├── @excalidraw/common
              └── @excalidraw/math
```

## Data Flow

### Rendering Pipeline

```
User Input (mouse/keyboard/touch)
    │
    ▼
Event Handlers (App.tsx)
    │
    ▼
Action Dispatch (actions/)
    │
    ▼
State Update (Jotai atoms + element array)
    │
    ▼
React Re-render (selective, atom-based)
    │
    ▼
Canvas Rendering (rough.js → Canvas 2D API)
```

### Collaboration Flow

```
Local User                    Server                  Remote User
    │                           │                         │
    │── element change ────────▶│                         │
    │                           │── broadcast ───────────▶│
    │                           │                         │
    │                           │◀── element change ──────│
    │◀── broadcast ─────────────│                         │
    │                           │                         │
    ▼                           ▼                         ▼
 Reconcile                                            Reconcile
```

## Layer Responsibilities

### Components (`packages/excalidraw/components/`)

React UI components: toolbar, sidebar, dialogs, color picker, context menus, welcome screen. These are presentational and delegate logic to actions and hooks.

### Actions (`packages/excalidraw/actions/`)

Business logic for user-initiated operations: align, distribute, delete, duplicate, export, group, flip, z-index changes. Each action defines keyboard shortcuts, toolbar icons, and the state transformation to apply.

### Data Layer (`packages/excalidraw/data/`)

Handles persistence and serialization: saving/loading scenes (JSON, blob), library management, export to PNG/SVG, restore from various formats, and data reconciliation for collaboration.

### Hooks (`packages/excalidraw/hooks/`)

Custom React hooks encapsulating reusable stateful logic: device detection, library management, scroll handling, and animation frame coordination.

### Element Package (`packages/element/`)

Pure data operations on elements: creation (factory functions), geometric bounds calculation, transformation (resize, rotate), hit-testing, and type definitions.

### Math Package (`packages/math/`)

Low-level mathematical primitives: points, vectors, line segments, polygons, ellipses, and geometric intersection/containment tests. Used heavily by lasso selection and element collision detection.

### Common Package (`packages/common/`)

Cross-cutting concerns shared by all packages: color constants, font loading, internationalization, event bus, and general-purpose utility functions.

## Key Interfaces

### `ExcalidrawProps` (embedding API)

```typescript
{
  initialData?: ImportedDataState;
  onChange?: (elements, appState, files) => void;
  onPointerUpdate?: (payload) => void;
  UIOptions?: UIOptions;
  isCollaborating?: boolean;
  langCode?: string;
  theme?: "light" | "dark";
  // ... and more
}
```

### `ExcalidrawImperativeAPI` (programmatic control)

```typescript
{
  updateScene(sceneData): void;
  resetScene(): void;
  getSceneElements(): ExcalidrawElement[];
  getAppState(): AppState;
  setActiveTool(tool): void;
  exportToBlob(opts): Promise<Blob>;
  // ... and more
}
```

## Deployment

- **Vercel** — Primary hosting for the standalone web app
- **Docker** — Available via `docker-compose.yml` for self-hosting
- **npm** — `@excalidraw/excalidraw` published for embedding

## Related Documentation

- [System Patterns](../memory/systemPatterns.md) — architectural patterns and design decisions
- [Tech Context](../memory/techContext.md) — full technology stack
- [Decision Log](../memory/decisionLog.md) — architectural decisions and undocumented behaviors
- [PRD](../product/PRD.md) — product requirements and SDK API reference
- [Domain Glossary](../product/domain-glossary.md) — terminology reference
- [Dev Setup](dev-setup.md) — developer onboarding guide
