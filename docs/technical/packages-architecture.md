# Packages Architecture Deep Dive

This document is a source-grounded deep dive into `packages/*` in this repo.
Use it with:
- `docs/memory-bank/systemPatterns.md` for compact architecture context
- `docs/technical/hidden-invariants.md` for risky edge-case behavior

## Scope

Analyzed sources:
- `packages/common/*`
- `packages/math/*`
- `packages/element/*`
- `packages/excalidraw/*`
- `packages/utils/*`
- build scripts: `scripts/buildBase.js`, `scripts/buildPackage.js`, `scripts/buildUtils.js`
- workspace/runtime wiring: `package.json`, `tsconfig.json`, `vitest.config.mts`

## Package Map

| Package | Primary role | Main entry | Notes |
| --- | --- | --- | --- |
| `@excalidraw/common` | Shared constants/utilities, event primitives, editor-interface helpers | `packages/common/src/index.ts` | Exports `Emitter`, `AppEventBus`, `VersionedSnapshotStore`, large shared utils/constants surface |
| `@excalidraw/math` | Geometry primitives and algorithms | `packages/math/src/index.ts` | Branded tuple types (`GlobalPoint`, `LocalPoint`, `Vector`), curve/polygon/segment math |
| `@excalidraw/element` | Canonical element model and scene-state mechanics | `packages/element/src/index.ts` | Owns `Scene`, `Store`, `Delta`, ordering/index repair, binding/frame/text geometry logic |
| `@excalidraw/excalidraw` | Editor runtime + React UI + public API | `packages/excalidraw/index.tsx` | Exposes `<Excalidraw />`, imperative API, restore/reconcile, actions, rendering, exports |
| `@excalidraw/utils` | Utility-facing export/bounds helpers | `packages/utils/src/index.ts` | Provides `exportToCanvas/blob/svg`, bounds overlap helpers, geometry shape adapters |

## Dependency Model

### Workspace/runtime resolution

- Workspaces are `packages/*`, `excalidraw-app`, `examples/*` (`package.json`).
- During dev/test, internal aliases resolve package imports to source files (`tsconfig.json`, `vitest.config.mts`).
- This means runtime behavior in tests is source-driven, not `dist/*`-driven.

### Build-time packaging behavior

- `buildBase.js` (used by `common`, `math`, `element`) bundles source but keeps `@excalidraw/common`, `@excalidraw/element`, `@excalidraw/math` external.
- `buildPackage.js` (used by `excalidraw`) keeps `common/element/math` external and aliases `@excalidraw/utils` to workspace source.
- `buildUtils.js` (used by `utils`) aliases all `@excalidraw/*` packages to workspace source and bundles them.
- Root `yarn build:packages` currently builds `common`, `math`, `element`, and `excalidraw` (not `utils`).

Implication: dependency boundaries are enforced by both package manifests and build-script alias/external rules, not only by TypeScript imports.

### Observed coupling patterns (important for refactors)

- `common` has runtime imports from `@excalidraw/math` in source (`colors.ts`, `utils.ts`).
- `element` has many `import type` links to `@excalidraw/excalidraw/types` and a few runtime links to `@excalidraw/utils/*`.
- `utils` imports `@excalidraw/excalidraw/*` internals (restore/export/clipboard paths), so utility exports depend on editor internals and build aliasing.

These are current architecture characteristics and they reduce strict package isolation.

## Cross-Package Runtime Flows

### 1. Startup and initial scene hydration

1. `InitializeApp` loads language before rendering children (`packages/excalidraw/components/InitializeApp.tsx`).
2. `App.initializeScene()` loads `initialData`, then `restoreElements(..., { repairBindings: true, deleteInvisibleElements: true })` and `restoreAppState(...)`.
3. Store/history are reset, then initial scene is applied with `CaptureUpdateAction.NEVER`.
4. `editor:initialize` event is emitted only after loading state is done.

Why it matters: initialization is intentionally non-undoable and migration-heavy.

### 2. Local edit -> store increment -> history

1. Actions call `syncActionResult()` or `updateScene()`.
2. These schedule capture/update actions in `Store` (`IMMEDIATELY` / `NEVER` / `EVENTUALLY`).
3. `componentDidUpdate()` calls `store.commit(elementsMap, this.state)`.
4. Durable increments (`IMMEDIATELY`) are converted to history entries (`History.record()`).

Why it matters: history integrity depends on correct capture mode selection.

### 3. Remote/init updates and reconciliation

1. Remote payloads are restored/migrated (`data/restore.ts`), then reconciled (`data/reconcile.ts`).
2. Reconcile prefers local elements under active editing/newer version rules, then reorders by fractional index and de-duplicates invalid indices.
3. These updates should be applied with `CaptureUpdateAction.NEVER` so they do not pollute undo/redo.

### 4. Utility export pipeline

`@excalidraw/utils` export APIs call `restoreElements(..., { deleteInvisibleElements: true })` and `restoreAppState(...)` before rendering to canvas/svg/blob (`packages/utils/src/export.ts`).

Why it matters: exports are normalized/sanitized snapshots, not a raw direct dump of current in-memory objects.

## Package-Specific Technical Notes

### `@excalidraw/common`

- `AppEventBus` supports event behavior contracts (`cardinality`, `replay`), including awaitable once+replay events.
- `Emitter` is the base callback primitive used across store/history/app runtime.
- `VersionedSnapshotStore.pull(sinceVersion)` provides wait-until-changed semantics used for async state consumers.

### `@excalidraw/math`

- Core geometry is tuple-first and branded, with legacy object coord types still present.
- Bezier length uses Legendre-Gauss constants (`constants.ts`) and reusable curve helpers.
- Precision-sensitive helpers (`PRECISION`) are shared in polygon/segment/point logic.

### `@excalidraw/element`

- `Scene` is the canonical in-memory container and cache owner:
  - full map including deleted
  - non-deleted map
  - selected-elements cache keyed by options hash + reference identity
  - random `sceneNonce` for render invalidation
- `replaceAllElements()` always runs `syncInvalidIndices()`.
- `mutateElement()` updates `version`, `versionNonce`, `updated` only when actual changes are detected.
- `Store` tracks only `ObservedAppState` (subset), not whole `AppState`.
- `Delta` application includes conflict resolution (`rebind/unbind`, redraw text/bound arrows) and guarded fallback paths.

### `@excalidraw/excalidraw`

- `index.tsx` is both public API surface and runtime bootstrap wrapper.
- Editor lifecycle events (`editor:mount`, `editor:initialize`, `editor:unmount`) are configured as once+replay-last bus events.
- `onIncrement` prop subscription is optimized and attached only if present on initial mount.
- `updateScene()` can optionally schedule store capture via `captureUpdate`.

### `@excalidraw/utils`

- `export.ts` bridges directly into editor internals (`data/restore`, `scene/export`, `clipboard`).
- `withinBounds.ts` includes container/bound/arrow closure logic when deciding inclusion.
- `shape.ts` is a geometry adapter layer for collision/shape conversion independent from UI components.

## Hotspot Files (highest maintenance risk)

Largest non-test files under `packages/*`:
- `packages/excalidraw/components/App.tsx` (~12.8k LOC)
- `packages/element/src/binding.ts` (~2.9k LOC)
- `packages/element/src/linearElementEditor.ts` (~2.5k LOC)
- `packages/element/src/elbowArrow.ts` (~2.3k LOC)
- `packages/element/src/delta.ts` (~2.1k LOC)
- `packages/excalidraw/renderer/interactiveScene.ts` (~2.1k LOC)

When making structural changes, start with these files and verify store/history/reconcile/export behavior explicitly.

## Refactor Guardrails

- Always decide and document `CaptureUpdateAction` on new update paths.
- Avoid bypassing restore/reconcile helpers when ingesting external scenes.
- Treat fractional-index utilities as stateful consistency logic, not formatting helpers.
- Keep cross-package imports explicit; do not assume strict acyclic boundaries exist today.
