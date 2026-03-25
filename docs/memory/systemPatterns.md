# System Patterns — Excalidraw

## Architectural Patterns

### 1. Monorepo with Yarn Workspaces

The codebase is split into focused packages (`excalidraw`, `element`, `common`, `math`, `utils`) with clear dependency boundaries. Each package has its own `package.json` and build configuration. The standalone app (`excalidraw-app`) consumes the packages as workspace dependencies.

### 2. Component-Based UI (React)

All UI is built from React functional components using hooks. The main entry point is the `<Excalidraw>` component in `packages/excalidraw/index.tsx`, which wraps the core `App` component and provides the imperative API via React Context.

### 3. Atomic State Management (Jotai)

Application state is managed through Jotai atoms rather than a centralized store. This enables fine-grained reactivity — only components that subscribe to a specific atom re-render when that atom changes.

### 4. Scene Graph Model

Drawing elements are stored in a flat array (the "scene") with z-index ordering. Elements are immutable data structures — mutations create new element versions rather than modifying in place. This supports efficient undo/redo and collaboration reconciliation.

### 5. Canvas Rendering Pipeline

Rendering uses HTML5 Canvas (not SVG DOM) for performance. The rough.js library provides the hand-drawn aesthetic. The rendering pipeline:

```
Elements → Transform (zoom/pan) → rough.js paths → Canvas draw calls
```

SVG export follows a separate path for file output.

### 6. Context API for Imperative Access

`ExcalidrawAPIContext` exposes an imperative API (`updateScene`, `resetScene`, `getSceneElements`, etc.) for embedding applications to programmatically control the canvas.

### 7. Event-Driven Collaboration

Real-time collaboration uses socket.io with an event-driven architecture:

```
Local change → Emit to server → Server broadcasts → Remote clients reconcile
```

Data reconciliation ensures consistency when concurrent edits occur.

## Key Data Structures

### ExcalidrawElement

The fundamental drawing unit. All elements share a base interface with properties like `id`, `type`, `x`, `y`, `width`, `height`, `angle`, `strokeColor`, `backgroundColor`, etc. Specialized types extend this base for specific shapes.

### AppState

Global application state including: current tool, selection, zoom level, scroll position, theme, collaboration status, UI mode (zen/view/grid), and more.

### Scene

Container managing the element array, providing methods for querying, adding, and updating elements with proper ordering.

## Design Decisions

- **Canvas over SVG DOM** — Chosen for rendering performance with large numbers of elements
- **Jotai over Redux** — Lighter state management with better performance characteristics
- **Monorepo over multi-repo** — Easier cross-package refactoring and atomic commits
- **Immutable elements** — Enables reliable undo/redo and conflict-free collaboration merges
- **Self-hostable fonts** — CDN with fallback ensures the hand-drawn look works offline

## Code Organization Conventions

- Actions live in `packages/excalidraw/actions/` (one file per action group)
- Components in `packages/excalidraw/components/` (one component per file)
- Hooks in `packages/excalidraw/hooks/`
- Data operations in `packages/excalidraw/data/`
- Tests co-located with source or in dedicated `tests/` directories
- Localization files in `packages/excalidraw/locales/`

## Related Documentation

- [Project Brief](projectbrief.md) — project overview and goals
- [Tech Context](techContext.md) — technology stack details
- [Architecture](../technical/architecture.md) — detailed architecture diagrams and data flow
- [Decision Log](decisionLog.md) — architectural decisions and undocumented behaviors
- [Domain Glossary](../domain-glossary.md) — terminology reference
- [PRD](../product/PRD.md) — product requirements
