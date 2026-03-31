# System Patterns

## High-level architecture

- Monorepo architecture with shared domain packages + app + examples.
- `@excalidraw/excalidraw` package is the integration boundary for host apps.
- Main editor runtime is centered in `packages/excalidraw/components/App.tsx`.

## Main architectural patterns

- **Layered editor core**
  - UI wrapper and providers in `index.tsx`.
  - Editor orchestration in class `App`.
  - Scene/data/renderer concerns separated into dedicated modules (`Scene`, `Store`, `Renderer`, `History`).

- **Hybrid state pattern**
  - React component state (`AppState`) in class component.
  - Domain state/updates via `Store` and `Scene`.
  - Fine-grained UI atoms via Jotai isolation (`editor-jotai.ts`).

- **Event-driven integration**
  - Internal emitters for onChange, pointer, scroll, user-follow.
  - Imperative API object exposed to host apps (`createExcalidrawAPI`).
  - Lifecycle event bus (`editorLifecycleEvents`) for mount/init/unmount style events.

- **Action/command pattern**
  - User operations registered in `ActionManager`.
  - Undo/redo actions registered explicitly.
  - Actions return synchronized updates consumed by app/store.

- **Canvas rendering**
  - `Renderer` (`packages/excalidraw/scene/Renderer.ts`) is constructed with the same `Scene` instance as `App` (`new Renderer(this.scene)` in `App.tsx`). It does **not** own the canvas DOM; `App` owns canvases and Rough.js context while `Renderer` drives **what** to draw and **which** elements are eligible.
  - **Render pipeline / optimizations:** `Renderer.getRenderableElements` (memoized) filters non-deleted elements, skips the text element currently being edited (handled elsewhere), and computes **viewport-visible** elements via `isElementInViewport` from `@excalidraw/element`. A **scene nonce** participates in cache keys so stale caches invalidate when the scene changes.
  - **Static vs interactive layers:** `packages/excalidraw/renderer/staticScene.ts` draws the stable scene (throttled with `throttleRAF` / `renderStaticSceneThrottled`; cancelled in `Renderer.destroy()`). `packages/excalidraw/renderer/interactiveScene.ts` draws selection, transform handles, and interaction affordances using helpers such as `hitElementItself`, `getTransformHandles`, and `LinearElementEditor` from `@excalidraw/element`.
  - **Hit-testing:** Pointer targeting and geometry checks are implemented primarily in `App` and `@excalidraw/element` (e.g. `getElementAtPosition`, `hitElementItself`); the interactive renderer visualizes the outcome of that logic rather than defining the data model.
  - **Interaction with `Store` / wrapper:** `index.tsx` only supplies providers and props; **`App`** subscribes `scene.onUpdate` → `triggerRender`, runs `componentDidUpdate` → `store.commit(elementsMap, this.state)`, and passes `renderInteractiveSceneCallback` into the canvas layer so React re-renders stay aligned with `Scene` + `AppState`.

- **Element system**
  - **`Scene`** (from `@excalidraw/element`) is the **source of truth for elements** on the canvas: ordered list / map, mutations (`mutateElement`, `replaceAllElements`), and `onUpdate` / `getSceneNonce` for render invalidation. `Renderer` and `History` both read through `Scene`.
  - **`Store`** (from `@excalidraw/element`, constructed with `App`) holds **snapshots** of elements + observed app state, schedules **capture** (`scheduleMicroAction`, `scheduleCapture`) for undo/redo, and emits **increments** (`onDurableIncrementEmitter`, `onStoreIncrementEmitter`) consumed by `History` and optional host `onIncrement`.
  - **Serialization / persistence:** Load and restore paths use `packages/excalidraw/data/` (e.g. `restore.ts`, `restoreElements` / `restoreAppState`) and integrate with `updateScene` / `syncActionResult` so file and collaboration flows reconcile with `Scene` + `Store`.
  - **Selection and transforms:** Selection ids and tool state live in `AppState`; geometric selection, transforms, grouping, and bindings are implemented in `@excalidraw/element` and orchestrated from `App` and `ActionManager` (which receives `() => this.scene.getElementsIncludingDeleted()` and current `AppState`).
  - **`History` + `ActionManager`:** `History` records deltas from durable store increments; `ActionManager` executes user **actions** that mutate `Scene` / `AppState` and coordinate capture so undo/redo stays consistent with `Store`.

## Component relationships

- `index.tsx`:
  - wraps editor with `EditorJotaiProvider`,
  - passes integration callbacks/props into `App`.
- `App`:
  - owns scene/store/history instances,
  - exposes API and event subscriptions,
  - orchestrates rendering and lifecycle effects.
- Examples consume package-level API to validate integration scenarios.

## Cross-cutting concerns

- Performance:
  - caching (`ShapeCache`, image cache),
  - render triggers via scene updates and batched updates.
- Compatibility:
  - polyfills and browser-specific event handling.
- Embeddability:
  - strict API surface + hooks for host-controlled behavior.

## Source verification

- `packages/excalidraw/index.tsx`: wrapper/provider pattern and props pipeline.
- `packages/excalidraw/components/App.tsx`: `Renderer`, `Scene`, `Store`, `History`, `ActionManager`, `renderInteractiveSceneCallback`, `store.commit`, `scene.onUpdate`.
- `packages/excalidraw/scene/Renderer.ts`: `Renderer` class, memoized renderable/visible elements, `destroy()` / throttled static render cancel.
- `packages/excalidraw/renderer/staticScene.ts`, `packages/excalidraw/renderer/interactiveScene.ts`: static vs interactive drawing layers.
- `packages/element` (`Scene`, `Store`, types, hit/transform helpers imported by renderer and `App`).
- `packages/excalidraw/editor-jotai.ts`: isolated Jotai store/provider.
- `packages/excalidraw/actions/*`: action registration and command style operations.

---

## Related documentation

**Technical** (`docs/technical/`)

- [Architecture](../technical/architecture.md)
- [Developer setup](../technical/dev-setup.md)

**Product** (`docs/product/`)

- [PRD](../product/PRD.md)
- [Domain glossary](../product/domain-glossary.md)
