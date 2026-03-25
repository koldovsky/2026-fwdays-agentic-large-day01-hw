# System Patterns

## Monorepo Package Layering

Packages have a strict one-way dependency graph — no circular imports:

```
@excalidraw/common
    └── @excalidraw/math
          └── @excalidraw/element        ← Scene, Store, History, renderElement
                └── @excalidraw/excalidraw  ← React component, ActionManager, Renderer
                      └── excalidraw-app    ← Firebase, collab, Sentry, PWA
```

`@excalidraw/utils` is a leaf utility package (no upward deps). Each package has its own
`build:esm` script producing `dist/dev/` and `dist/prod/` entry points with conditional exports.

---

## State Management — Three Layers

### Layer 1: Document Model (Scene + Store)
- **`Scene`** (`packages/element/src/Scene.ts`) — canonical element graph; holds all
  `ExcalidrawElement` objects. Accessed via `scene.getNonDeletedElements()`, mutated via
  `scene.replaceAllElements()` / `mutateElement()`.
- **`Store`** (`packages/element/src/store.ts`) — records element deltas after each commit.
  Drives **undo/redo** and the `onIncrement` host callback.
- **`History`** wraps `Store` to expose `undo()` / `redo()` stacks.

### Layer 2: Editor UI State (AppState)
- `App` is a **class component** holding `state: AppState` (defined in `types.ts`).
- `getDefaultAppState()` (`appState.ts`) provides defaults for all ~80+ fields.
- Updated exclusively through `this.setState()` or `syncActionResult()`.
- Covers: active tool, scroll/zoom, selections, dialogs, themes, collaborators, etc.

### Layer 3: Cross-Cutting UI (Jotai)
- Isolated Jotai store per editor instance (`editor-jotai.ts`) via `jotai-scope`.
- Used for: library panel, sidebar docked state, search, eye-dropper, i18n language atom.
- Components read atoms via `useAtomValue` / `useAtom` hooks from the isolated provider.

---

## Actions System

A declarative plugin-style command registry:

1. **Registration** — each `actions/action*.ts` file calls `register(action)` which appends
   to a module-level `actions` array (`actions/register.ts`).
2. **Action shape** (`actions/types.ts`):
   - `perform(elements, appState, formData, app) → ActionResult`
   - Optional `keyTest` for keyboard shortcut binding
   - Optional `PanelComponent` for toolbar rendering
   - `captureUpdate` field controls undo delta policy
3. **`ActionManager`** (`actions/manager.tsx`):
   - Receives `syncActionResult` callback from `App`
   - `handleKeyDown()` — priority-ordered shortcut resolution
   - `renderAction()` — renders `PanelComponent` for toolbar items
   - Constructed in `App` constructor; registered with all `actions` + undo/redo

---

## Data Flow: Input → State → Pixels

```
Pointer / Keyboard event
    │
    ▼
App event handler  OR  ActionManager.handleKeyDown
    │
    ▼
action.perform() → ActionResult { elements?, appState?, captureUpdate }
    │
    ▼
App.syncActionResult()  [withBatchedUpdates]
  ├─ store.scheduleAction(captureUpdate)   → undo delta policy
  ├─ scene.replaceAllElements(elements)   → document model update
  └─ this.setState(appState patch)        → React re-render scheduled
    │
    ▼
componentDidUpdate()
  ├─ appStateObserver.flush(prevState)    → external state observers
  ├─ store.commit(elementsMap, state)     → finalize undo delta
  └─ props.onChange(elements, appState)  → host callback
    │
    ▼
StaticCanvas useEffect / InteractiveCanvas callback
  └─ renderStaticScene / renderInteractiveScene  → canvas pixels updated
```

---

## Rendering Pipeline

### Two-Canvas Architecture
`App.render()` stacks three canvas layers inside a positioned container:

| Canvas | Component | Renderer | Responsibility |
|---|---|---|---|
| Static | `StaticCanvas` | `renderer/staticScene.ts` | Background, grid, all committed elements |
| New element | `NewElementCanvas` | inline | In-progress element while drawing |
| Interactive | `InteractiveCanvas` | `renderer/interactiveScene.ts` | Selection, handles, snap lines, cursors |

### Renderer Class (`scene/Renderer.ts`)
- Owns a `Scene` reference.
- `getRenderableElements()` — memoized function (keyed on `sceneNonce` + viewport params)
  that filters out deleted/editing elements and computes viewport-visible subset.
- Calls `renderStaticSceneThrottled` from `renderer/staticScene.ts`.

### Triggering Redraws
- `scene.triggerUpdate()` — bumps scene nonce → `StaticCanvas` effect re-runs
- `App.triggerRender(force)` — `force=true` calls `scene.triggerUpdate()`; else `setState({})`
  forces React reconciliation without document model changes

---

## React Context Tree

`App.render()` nests nine context providers (outer → inner):

```
ExcalidrawAPIContext          → this.api (imperative API)
AppContext                    → this (full App instance)
AppPropsContext               → this.props
ExcalidrawContainerContext    → { container, id }
EditorInterfaceContext        → this.editorInterface
ExcalidrawSetAppStateContext  → this.setAppState
ExcalidrawAppStateContext     → this.state
ExcalidrawElementsContext     → scene.getNonDeletedElements()
ExcalidrawActionManagerContext → this.actionManager
```

Child components consume these via exported hooks (`useExcalidrawAPI`, `useEditorInterface`,
`useStylesPanelMode`) rather than prop drilling.

---

## Event Listener Pattern

All DOM event listeners are registered in `addEventListeners()` and torn down through a single
`onRemoveEventListenersEmitter` — calling `removeEventListeners()` fires one trigger that
cleans up all subscriptions atomically. This prevents partial-teardown leaks.

---

## Batched State Updates

High-frequency handlers (pointer move, wheel, keyboard) are wrapped in:
- `withBatchedUpdates` — wraps in React `unstable_batchedUpdates` to coalesce `setState` calls
- `withBatchedUpdatesThrottled` — same + throttle for events that fire at frame rate

This avoids redundant renders during fast user interactions.

---

## Imperative API Pattern

`createExcalidrawAPI()` (in `App`) builds an `ExcalidrawImperativeAPI` facade that exposes
stable method references (`updateScene`, `getSceneElements`, `exportToBlob`, etc.) to the host
application via the `onExcalidrawAPI` prop callback. On unmount, the API is replaced with a
destroyed stub that throws on all calls — preventing stale-reference bugs.

---

## Module Exports (Conditional)

`packages/excalidraw/package.json` uses conditional `exports`:

```json
{
  ".": {
    "development": "./dist/dev/index.js",
    "production": "./dist/prod/index.js"
  }
}
```

Deep type-only imports are also exposed for sub-packages (`./common/*`, `./element/*`,
`./math/*`, `./utils/*`), enabling typed access to internals without publishing separate packages.

---

## Testing Strategy

- Vitest aliased to package sources (`packages/*/src`) — tests run on source, no `dist` build needed
- Canvas APIs mocked via `vitest-canvas-mock`
- IndexedDB mocked via `fake-indexeddb`
- Component tests use `@testing-library/react` with `jsdom` environment
- Action tests (e.g. `actionDeleteSelected.test.tsx`) test against real `App` render tree

---

## Known Implicit Contracts & Dangerous Patterns

See `docs/technical/undocumented-behaviors.md` for the full catalog (20 entries). Key patterns
that every AI agent working on this codebase must internalize:

### Mutation Must Go Through the Right Layer
- `mutateElement()` (low-level) — mutates in-place, **no re-render**. Use for perf-sensitive
  inner loops only.
- `scene.mutateElement()` — mutates and schedules a React update. **Requires** being called from
  a React event handler or inside `unstable_batchedUpdates()`.
- Never call `scene.mutateElement()` from a bare `setTimeout` or `Promise` callback — each
  mutation will produce a separate render.

### `flushSync` Is Load-Bearing
`App.tsx` uses `flushSync` in 10+ places to force synchronous React state flushing before the
next pointer event or action reads `this.state`. Removing any of these calls causes silent bugs
where handlers observe stale state.

### Implicit State Machines
- **`bindMode`** (`"orbit"` → `"inside"` → `"skip"`) in `App.tsx` — arrow binding mode driven
  by pointer events and a `bindModeHandler` timeout. Undocumented transitions.
- **Double-click detection** — split between native `dblclick` (mouse) and manual
  `lastCompletedCanvasClicks` counter (touch). Both paths must be kept in sync.

### Global Singletons (Non-React State)
- `isSomeElementSelected` in `selection.ts` — module-level memoization closure shared across all
  instances; must be manually cleared.
- `Scene.getScene()` — global registry still used by elbow-arrow routing (two marked TODOs).
- Jotai `libraryItemsAtom` — shared across all mounted Excalidraw instances; `Library.destroy()`
  intentionally does not reset it.

### Known Broken Areas (Do Not Regress)
- Bounding boxes for curved elements are **wrong** when control points exceed point extrema.
- GroupId ordering after undo/redo is **not stable** (issue #7348).
- Invisible elements can appear in undo/redo history (they are stored in the Store).
- `isElementInFrame()` is a **performance bottleneck** — avoid adding new call-sites.
