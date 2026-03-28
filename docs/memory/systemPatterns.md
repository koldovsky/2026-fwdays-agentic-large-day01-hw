# System Patterns: Excalidraw

## Architecture Pattern

**Monorepo with layered packages** — each package has clear responsibilities:

```
excalidraw-app (application layer)
  └── @excalidraw/excalidraw (component layer)
        ├── @excalidraw/element (element layer)
        │     ├── @excalidraw/math (math primitives)
        │     └── @excalidraw/common (shared utilities)
        └── @excalidraw/utils (export/import utilities)
```

## State Management

- **Jotai atoms** for global state (atomic, composable)
- **React Context** for component-scoped state (e.g., tunnel context)
- **AppState** object passed through component tree
- Scene elements stored as immutable array, updated via replace-not-mutate

## Rendering Pipeline

1. State change triggers re-render
2. `renderStaticScene()` — renders non-interactive elements (grid, background)
3. `renderInteractiveScene()` — renders interactive elements (selection, handles)
4. Canvas 2D API with RoughJS for hand-drawn aesthetic
5. Double buffering for smooth rendering

## Element Model

All elements extend `ExcalidrawElement` base type:
- `id`, `type`, `x`, `y`, `width`, `height`, `angle`
- `version`, `versionNonce` — for conflict resolution
- `isDeleted` — soft delete (retained for sync)
- Immutable updates: every change creates new version with incremented `version`

## Collaboration Pattern

1. WebSocket connection via Socket.io
2. Optimistic local updates (immediate UI response)
3. Broadcast changes to peers
4. Conflict resolution via version + versionNonce tiebreaker
5. Reconciliation merges remote changes with local state

## Data Persistence

- **LocalStorage** — debounced auto-save (300ms via `SAVE_TO_LOCAL_STORAGE_TIMEOUT`)
- **IndexedDB** — image/file storage with 24h TTL cleanup
- **Firebase** — cloud persistence for shared scenes
- **URL sharing** — compressed scene data embedded in URL hash

## Action System

- Actions defined as objects with `name`, `perform`, `keyTest`, `PanelComponent`
- Registered centrally in action manager
- Keyboard shortcuts mapped via `keyTest` functions
- Each action receives current state and returns state updates

## Code Conventions

- TypeScript strict mode, functional React components with hooks
- PascalCase for components/types, camelCase for variables, ALL_CAPS for constants
- CSS Modules for component styling
- `Point` type from `packages/math/src/types.ts` for all coordinates
- Immutable data preference (const, readonly)
- Performance: trade RAM for CPU cycles

## Related Documentation

- [Architecture](../technical/architecture.md)
- [Development Setup](../technical/dev-setup.md)
- [Product Requirements](../product/PRD.md)
- [Domain Glossary](../product/domain-glossary.md)
