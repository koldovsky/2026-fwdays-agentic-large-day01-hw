# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
yarn install           # Install all workspace dependencies
yarn start             # Dev server at http://localhost:3001
yarn start:production  # Build + serve production at http://localhost:5001

# Build
yarn build:packages    # Build all packages (required before build:app)
yarn build             # Full production build

# Testing
yarn test              # Vitest watch mode
yarn test:all          # Typecheck + lint + format check + tests
yarn test:coverage     # Vitest with coverage report

# Single test file
yarn vitest run packages/excalidraw/tests/foo.test.ts

# Code quality
yarn test:code         # ESLint (0 warnings allowed)
yarn test:typecheck    # TypeScript check only
yarn fix               # Prettier + ESLint auto-fix
```

**Package build order** (enforced by dependencies):
```
common → math → element → excalidraw
```

## Architecture

Layered monorepo — each layer only imports from layers below it:

```
excalidraw-app/           ← Application layer: collab, Firebase, persistence
  └── @excalidraw/excalidraw  ← Component layer: React UI, actions, rendering
        ├── @excalidraw/element  ← Domain layer: element model, transforms, binding
        │     ├── @excalidraw/math    ← Foundation: Point, Vector, curves (no deps)
        │     └── @excalidraw/common  ← Foundation: constants, type guards, utils
        └── @excalidraw/utils   ← Consumer utilities: export PNG/SVG
```

### Key Entry Points

| Purpose | File |
|---------|------|
| App bootstrap | `excalidraw-app/index.tsx` |
| App component (collab, Firebase) | `excalidraw-app/App.tsx` |
| Core canvas logic | `packages/excalidraw/components/App.tsx:617` (class component) |
| Public library export | `packages/excalidraw/index.tsx` |
| Element type definitions | `packages/element/src/types.ts` |
| AppState type (~200 props) | `packages/excalidraw/types.ts:272` |
| Default AppState | `packages/excalidraw/appState.ts:22` |

### Rendering Pipeline

Two stacked canvases:
- **StaticCanvas** (bottom): grid, all scene elements → `renderStaticScene()` throttled via RAF
- **InteractiveCanvas** (top): selection, handles, cursors, snap → `renderInteractiveScene()` each frame

Shape generation uses RoughJS for hand-drawn aesthetic; shapes are cached in `ShapeCache` (WeakMap keyed by element) and invalidated on version increment.

### State Management

- **AppState**: large object (~200 props) passed through component tree; mutated via `updateScene()`
- **Scene** (`packages/element/src/Scene.ts`): owns `elementsMap: Map<id, ExcalidrawElement>`, provides `getNonDeletedElements()`, `getSelectedElements()`, `getSceneNonce()`
- **Elements are immutable**: every change creates new element with incremented `version`
- **Jotai atoms**: two isolated stores — `packages/excalidraw/editor-jotai.ts` (editor scope) and `excalidraw-app/app-jotai.ts` (app scope: collab, offline state). Do not import `jotai` directly; use the app-specific modules (ESLint enforced).

### Action System

Actions (`packages/excalidraw/actions/`) are objects with:
- `perform(elements, appState, value, app)` → `{elements, appState, captureUpdate}`
- `keyTest(event, appState, elements, app)` → boolean
- Optional `PanelComponent` for toolbar rendering

`ActionManager` (`packages/excalidraw/actions/manager.tsx:52`) handles keyboard dispatch, priority resolution, and view-mode gating.

### Collaboration

- `excalidraw-app/collab/Collab.tsx` — room lifecycle
- `excalidraw-app/collab/Portal.tsx` — Socket.io transport with AES encryption (room key in URL fragment, never sent to server)
- `packages/excalidraw/data/reconcile.ts:73` — conflict resolution: higher `version` wins; same version uses `versionNonce` as deterministic tiebreaker

### Persistence

| Store | What | When |
|-------|------|------|
| localStorage | elements + appState JSON | 300ms debounced |
| IndexedDB | images/files (idb-keyval) | on change, 24h TTL cleanup |
| Firebase | shared scenes | collab sessions only |

## Code Conventions

- TypeScript strict mode; functional React components with hooks
- `PascalCase` components/types, `camelCase` variables, `ALL_CAPS` constants
- CSS Modules for all component styling
- Use `Point` type from `packages/math/src/types.ts` for all coordinates
- Imports: `@typescript-eslint/consistent-type-imports` enforced (use `import type`)

## What to Avoid Reading

Unless the task directly requires them:
- `node_modules/`, `packages/excalidraw/fonts/`, `packages/excalidraw/locales/`
- `packages/excalidraw/tests/fixtures/`, `**/__snapshots__/`
- `packages/excalidraw/subset/wasm/`, `scripts/wasm/`
- Build outputs: `build/`, `dist/`, `dev-dist/`, `coverage/`
- `repomix-output.xml`, `memory-bank/`

## Testing Notes

- Test runner: Vitest with jsdom environment
- Coverage thresholds: 60% lines/statements, 63% functions, 70% branches
- Run package-local tests before full-suite when changes are contained to one package