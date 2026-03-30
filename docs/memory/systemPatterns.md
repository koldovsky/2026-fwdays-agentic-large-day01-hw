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
- `packages/excalidraw/components/App.tsx`: App orchestration, API, event emitters, scene/store/history usage.
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
