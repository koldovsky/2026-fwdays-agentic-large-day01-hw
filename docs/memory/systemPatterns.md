# Architecture & Patterns

## Monorepo Package Map

| Package | Responsibility |
|---------|---------------|
| `@excalidraw/common` | Shared constants, utilities, types, event bus, color palette (see `packages/common/src/`) |
| `@excalidraw/math` | 2D math primitives: points, vectors, lines, segments, curves, ellipses, polygons, rectangles (see `packages/math/src/`) |
| `@excalidraw/element` | Element types, Scene management, mutation, bounds, collision, binding, arrows, store/delta system, history deltas (see `packages/element/src/`) |
| `@excalidraw/excalidraw` | React component library: App component, actions, renderer, data import/export, i18n, fonts, UI components (see `packages/excalidraw/`) |
| `@excalidraw/utils` | Public utility functions for consumers: export helpers, bounding box utils (see `packages/utils/src/`) |
| `excalidraw-app` | The hosted application: Firebase collab, Sentry, PWA, app-level state, share dialog (see `excalidraw-app/`) |

## Component Architecture

- **Functional components with hooks** throughout (see coding standards in `.github/copilot-instructions.md`)
- Exception: `Collab` is a `PureComponent` class (see `excalidraw-app/collab/Collab.tsx`)
- The core `App` component in `packages/excalidraw/components/App.tsx` is a large class component that manages canvas, input, and state
- `<Excalidraw>` wrapper in `packages/excalidraw/index.tsx` wraps `App` with providers and memoization

## State Management Pattern

### Jotai Atoms

- **App-level store** (`appJotaiStore` in `excalidraw-app/app-jotai.ts`): holds atoms for collaboration state
  - `collabAPIAtom` — reference to the Collab instance
  - `isCollaboratingAtom` — boolean for collaboration mode
  - `isOfflineAtom` — offline indicator
  - `shareDialogStateAtom` — share dialog state
  - `collabErrorIndicatorAtom` — collaboration error state
  - `localStorageQuotaExceededAtom` — storage quota state
- **Editor-level store** (`editorJotaiStore` in `packages/excalidraw/editor-jotai.ts`): isolated via `jotai-scope`'s `createIsolation()`
  - Used for library atoms, UI state within the editor component

### AppState

- Defined as `interface AppState` in `packages/excalidraw/types.ts` (line 272)
- Contains ~80+ fields: active tool, current item properties, zoom, scroll, UI state, collaborators map
- Defaults in `packages/excalidraw/appState.ts` via `getDefaultAppState()`
- Managed imperatively inside the `App` class component

### Store & Delta System

- `Store` class in `packages/element/src/store.ts` captures observed changes and emits `StoreIncrement` events
- `CaptureUpdateAction` enum: `IMMEDIATELY` (undoable), `NEVER` (remote/init), `EVENTUALLY` (async)
- `StoreDelta` / `HistoryDelta` in `packages/excalidraw/history.ts` for undo/redo

## Rendering Pipeline

- Two canvas layers: **static canvas** (elements) and **interactive canvas** (selection, cursors, handles)
- `packages/excalidraw/renderer/staticScene.ts` — renders grid, elements, links on the static canvas
- `packages/excalidraw/renderer/interactiveScene.ts` — renders selection UI, transform handles, collaborator cursors
- Element rendering delegated to `packages/element/src/renderElement.ts`
- Rough.js integration for hand-drawn style via `packages/element/src/shape.ts`
- `throttleRAF` used to throttle render calls (see `packages/common/src/utils.ts`)

## Collaboration Pattern

- `Collab` class (`excalidraw-app/collab/Collab.tsx`) — manages lifecycle, reconciliation, file sync
- `Portal` class (`excalidraw-app/collab/Portal.tsx`) — manages Socket.IO connection, room join, broadcasts
- Flow: local change → serialize → encrypt → Socket.IO emit → remote receive → decrypt → `reconcileElements()` → update scene
- Firebase Firestore for persistent scene storage; Firebase Storage for image files
- Element versioning via `version` / `versionNonce` fields and `fractional-indexing` for ordering

## Data Flow (Text Description)

1. User input (mouse/keyboard) → event handlers in `App` class component
2. Event handlers create/modify elements via `mutateElement()` or dispatch actions via `ActionManager`
3. `ActionManager.executeAction()` returns `ActionResult` with new elements/appState
4. `App.updateScene()` applies the result, updates `Store`, triggers re-render
5. `Store` emits increments → `History` captures deltas for undo/redo
6. Canvas re-render triggered via `throttleRAF` — static and interactive scenes rendered separately
7. In collab mode: changes broadcast via `Portal` → Socket.IO → remote peers reconcile

## Error Handling

- `TopErrorBoundary` (`excalidraw-app/components/TopErrorBoundary.tsx`) — top-level React error boundary
- `ErrorDialog` for user-facing error messages
- `CollabError` for collaboration-specific errors
- Sentry integration for production error reporting (see `excalidraw-app/sentry.ts`)

## Code Style (from ESLint)

- Base ESLint config: `packages/eslintrc.base.json`
- Uses `eslint-config-react-app`, `eslint-plugin-import`, `eslint-config-prettier`
- Prettier via `@excalidraw/prettier-config`
- Restricted imports: Jotai imports must go through wrapper modules

## Cross-References

- For tech stack details → see [`docs/memory/techContext.md`](techContext.md)
- For architecture deep-dive → see [`docs/technical/architecture.md`](../technical/architecture.md)
- For domain glossary → see [`docs/product/domain-glossary.md`](../product/domain-glossary.md)
- For key decisions → see [`docs/memory/decisionLog.md`](decisionLog.md)
