# System Patterns

## Architecture Overview
Excalidraw is a **Yarn-workspaces monorepo** with layered packages and a standalone web app.

```
packages/math       → Pure 2D geometry (vectors, points, curves)
packages/common     → Shared types, constants, Emitter, utilities
packages/element    → Element model, Scene graph, Store (state persistence)
packages/utils      → Additional helpers
packages/excalidraw → Core React engine: components, actions, rendering
excalidraw-app      → Deployed web app (Vercel), wires in Firebase + Socket.io + Sentry
```

Each inner package exports via `package.json` `"exports"` with wildcard subpaths for tree-shaking.

## Core Design Patterns

### 1. Class-Based App Component + Context Injection
`App.tsx` (packages/excalidraw) is a **React class component** — not a function component. It manages the full lifecycle of canvas state, pointer events, and element mutations. Dependencies are distributed via **8+ React contexts**:
- `AppContext`, `AppPropsContext`, `EditorInterfaceContext`
- `ExcalidrawElementsContext`, `ExcalidrawAppStateContext`, `ExcalidrawSetAppStateContext`
- `ExcalidrawActionManagerContext`, `ExcalidrawAPIContext`

Consumed by hooks: `useApp()`, `useAppProps()`, `useExcalidrawElements()`, etc.

### 2. Actions System (Command Pattern)
Every toolbar operation is an **Action** object registered at module load time:
```
{ name, label, icon, perform(), predicate?, keyTest?, PanelComponent? }
```
- `perform()` returns `ActionResult` with new elements/appState and a `captureUpdate` flag.
- `ActionManager` dispatches actions from UI, keyboard, context menu, command palette, or API.
- 46+ named actions (e.g., `actionDeleteSelected`, `actionChangeStrokeColor`, `actionGroup`).

### 3. Immutable Store + Delta-Based Undo/Redo
**Store** (packages/element) manages state commits with a three-tier capture strategy:
| Mode | When | Undoable? |
|------|------|-----------|
| `IMMEDIATELY` | Most user actions | Yes, instantly |
| `EVENTUALLY` | Async/batched ops | Yes, after batch |
| `NEVER` | Remote sync, init | No |

- **StoreSnapshot** — immutable point-in-time of elements + appState.
- **StoreDelta** — diff between two snapshots; invertible for undo.
- **StoreIncrement** — emitted event (Durable → history, Ephemeral → UI only).

### 4. Dual-Canvas Rendering
Two HTML canvases layered on top of each other:
- **Static canvas** — Renders all committed elements via Rough.js. Redraws only when elements change.
- **Interactive canvas** — Renders selection handles, snap lines, hover highlights. Redraws on every pointer move.
- A third **NewElement canvas** renders the element currently being drawn.

### 5. Scene Graph (packages/element)
`Scene` class holds:
- `elementsMap` (Map for O(1) lookup by ID)
- `nonDeletedElements` (ordered array for rendering)
- Selection cache keyed by hash for memoized `getSelectedElements()`.
- Elements are never removed — deleted elements get `isDeleted: true`.
- Ordering uses **fractional indexing** for O(1) reorder without array shifts.

### 6. Jotai Atoms + Scope Isolation
UI state managed with Jotai atoms (lightweight alternative to Redux). `jotai-scope` creates isolated stores so multiple Excalidraw instances on the same page don't interfere.

Selective re-rendering via `useAppStateValue(selector)` — components only update when their selected slice changes.

### 7. Emitter Pattern (packages/common)
Generic `Emitter<T>` class with `.on()`, `.once()`, `.off()`, `.trigger()`. Used for:
- Store increment events (durable/ephemeral)
- App state change subscriptions
- Library update notifications

### 8. Type Safety Patterns
- **Branded types**: `SelectionHash`, `SocketId` — prevent accidental string mixing.
- **Discriminated unions**: `ActionResult = { ... } | false`, `ActiveTool` variants.
- **Overloaded hooks**: `useAppStateValue` accepts single key, key array, or selector function.
- **Utility types**: `Mutable<T>`, `MaybePromise<T>`, `ValueOf<T>`, `Merge<A, B>`.

## Data Flow
```
User input (pointer/keyboard)
  → App event handlers
  → Element creation/mutation + action dispatch
  → Scene.replaceAllElements() / mutateElement()
  → Store.scheduleCapture(IMMEDIATELY | EVENTUALLY | NEVER)
  → Store.commit() → snapshot diff → emit StoreIncrement
  → Listeners: History (undo/redo), onChange, Collaboration sync
  → Canvas re-render (static + interactive)
  → Context updates → UI component re-renders
```

## Testing Patterns
- **Vitest + jsdom** with mocked Canvas API (`vitest-canvas-mock`).
- Global test context: `window.h = { app, elements, state }`.
- Helper API: `API.createElement()`, `API.setElements()`, `API.setSelectedElements()`.
- Assertions: `assertElements(h.elements, [{ id, isDeleted, selected }])`.
- Actions tested by executing through `h.app.actionManager.executeAction()` inside `act()`.
