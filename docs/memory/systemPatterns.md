# System Patterns

## Monorepo Package Layering

Strict one-way dependency graph (no circular imports):

```text
@excalidraw/common → @excalidraw/math → @excalidraw/element → @excalidraw/excalidraw → excalidraw-app
```

`@excalidraw/utils` is a leaf (no upward deps). Each package has `build:esm` producing `dist/dev/` and `dist/prod/` via conditional exports.

---

## State Management — Three Layers

| Layer            | Owner                              | Purpose                                               |
|------------------|------------------------------------|-------------------------------------------------------|
| Document Model   | `Scene` + `Store` + `History`      | Element graph, undo/redo deltas                       |
| Editor UI State  | `App` class component (`AppState`) | Tool, scroll, zoom, selections, dialogs (~80+ fields) |
| Cross-Cutting UI | Jotai (isolated per instance)      | Library panel, sidebar, search, eye-dropper, i18n     |

- `Scene` — canonical element graph; mutated via `replaceAllElements()` / `mutateElement()`.
- `Store` — records deltas after each commit, drives undo/redo and `onIncrement` host callback.
- `AppState` defaults from `getDefaultAppState()`; updated via `setState()` / `syncActionResult()`.
- Jotai atoms consumed via `useAtomValue` / `useAtom` from the isolated `jotai-scope` provider.

---

## Actions System

Declarative command registry: `actions/action*.ts` files call `register(action)` → appended to module-level array (`actions/register.ts`).

**Action shape** (`actions/types.ts`): `perform(elements, appState, formData, app) → ActionResult`, optional `keyTest`, optional `PanelComponent`. The returned `ActionResult` contains `captureUpdate` field for undo policy.

**`ActionManager`**: receives `syncActionResult` from `App`; handles `handleKeyDown()` (priority-ordered shortcuts) and `renderAction()` (toolbar rendering).

---

## Data Flow: Input → State → Pixels

```text
Event → App handler / ActionManager.handleKeyDown
      → action.perform() → ActionResult
      → App.syncActionResult() [withBatchedUpdates]
          ├─ store.scheduleAction()   → undo delta policy
          ├─ scene.replaceAllElements() → document model
          └─ this.setState()           → React re-render
      → componentDidUpdate()
          ├─ appStateObserver.flush()  → external observers
          ├─ store.commit()            → finalize undo delta
          └─ props.onChange()          → host callback
      → StaticCanvas / InteractiveCanvas → canvas pixels
```

---

## Rendering Pipeline

Three stacked canvas layers:

| Canvas      | Component           | Responsibility                          |
|-------------|---------------------|-----------------------------------------|
| Static      | `StaticCanvas`      | Background, grid, committed elements    |
| New element | `NewElementCanvas`  | In-progress element while drawing       |
| Interactive | `InteractiveCanvas` | Selection, handles, snap lines, cursors |

`Renderer.getRenderableElements()` — memoized on `sceneNonce` + viewport params; filters deleted/editing elements. Redraws triggered via `scene.triggerUpdate()` (bumps nonce) or `App.triggerRender(force)`.

---

## React Context Tree

`App.render()` nests nine providers (outer → inner): `ExcalidrawAPIContext`, `AppContext`, `AppPropsContext`, `ExcalidrawContainerContext`, `EditorInterfaceContext`, `ExcalidrawSetAppStateContext`, `ExcalidrawAppStateContext`, `ExcalidrawElementsContext`, `ExcalidrawActionManagerContext`. Consumed via exported hooks (`useExcalidrawAPI`, etc.) — no prop drilling.

---

## Key Patterns

- **Event listeners** — all registered/torn down atomically via `onRemoveEventListenersEmitter`; prevents partial-teardown leaks.
- **Batched updates** — `withBatchedUpdates` (coalesces `setState`) and `withBatchedUpdatesThrottled` (+ throttle) wrap high-frequency handlers.
- **Imperative API** — `createExcalidrawAPI()` exposes stable methods to host via `onExcalidrawAPI` prop; replaced with a throwing stub on unmount.
- **Conditional exports** — `packages/excalidraw/package.json` maps `"."` to `dev`/`prod` dist; sub-packages expose typed deep imports.
- **Testing** — Vitest on source (no build); canvas mocked via `vitest-canvas-mock`; IndexedDB via `fake-indexeddb`; component tests with `@testing-library/react` + jsdom.

---

## Dangerous Patterns & Implicit Contracts

(Full catalog: `docs/technical/undocumented-behaviors.md`, 20 entries)

**Mutation layers:**
- `mutateElement()` — in-place, no re-render. For perf-sensitive loops only.
- `scene.mutateElement()` — mutates + schedules React update. Must be called from a React event handler or `unstable_batchedUpdates()`. Never from bare `setTimeout`/`Promise`.

**`flushSync` is load-bearing** — used in 10+ places in `App.tsx` to force synchronous state flushing before next pointer event. Removing any causes silent stale-state bugs.

**Implicit state machines:**
- `bindMode` (`"orbit"` → `"inside"` → `"skip"`) — arrow binding driven by pointer events + `bindModeHandler` timeout. Undocumented.
- Double-click — split between native `dblclick` (mouse) and manual `lastCompletedCanvasClicks` counter (touch). Both paths must stay in sync.

**Global singletons (non-React):**
- `isSomeElementSelected` — module-level memoization shared across instances; must be manually cleared.
- `Scene.getScene()` — global registry still used by elbow-arrow routing (two marked TODOs).
- `libraryItemsAtom` — shared across all mounted instances; `Library.destroy()` does not reset it.

**Known broken areas (do not regress):**
- Bounding boxes wrong for curved elements when control points exceed extrema.
- GroupId ordering after undo/redo is not stable (issue #7348).
- Invisible elements can appear in undo/redo history.
- `isElementInFrame()` is a performance bottleneck — avoid new call-sites.
