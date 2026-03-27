# System Patterns

See [techContext.md](./techContext.md) for commands/tooling and [hidden invariants](../technical/hidden-invariants.md) for source-grounded edge cases.

## Architecture Overview
- The repo is a layered monorepo with these runtime boundaries:
- `@excalidraw/common`: shared constants, utility helpers, emitters, app event bus, browser/environment helpers.
- `@excalidraw/math`: reusable 2D geometry primitives and algorithms.
- `@excalidraw/element`: canonical element data model, scene container, bounds/selection/transform logic, fractional index ordering, deltas, and store snapshot machinery.
- `@excalidraw/excalidraw`: the actual editor runtime and UI, including `App`, actions, rendering, data restore/reconcile, fonts, hooks, export, and library flows.
- `@excalidraw/utils`: standalone export/serialization helpers for consumers outside the full editor runtime.
- `excalidraw-app`: host app that composes the editor with local persistence, share links, collaboration, Firebase-backed file storage, AI features, and Excalidraw+ integrations.
- `examples/*`: example consumer apps.

## Key Components
- `packages/excalidraw/index.tsx`: public package entry, polyfills, API provider, and editor bootstrap.
- `packages/excalidraw/components/App.tsx`: stateful editor core with scene, renderer, action manager, imperative API, and event orchestration.
- `packages/element/src/Scene.ts`: canonical in-memory element container with cached selections/maps and a render-invalidating scene nonce.
- `packages/element/src/store.ts`: snapshot/change/delta engine that emits durable vs ephemeral increments based on capture mode.
- `packages/excalidraw/history.ts`: undo/redo layer fed only by durable store increments.
- `packages/excalidraw/data/restore.ts` and `packages/excalidraw/data/reconcile.ts`: migration, repair, and local-vs-remote merge logic.
- `excalidraw-app/collab/Collab.tsx` and `Portal.tsx`: collaboration orchestration, encrypted websocket transport, Firebase snapshots/files, collaborator presence, and throttled full-scene rebroadcasts.
- `excalidraw-app/data/LocalData.ts`: debounced local persistence and IndexedDB-backed image storage.

## Important Flows
- Startup: `InitializeApp` resolves language first, then `App.initializeScene()` restores initial data, repairs elements/app state, resets store/history, and loads scene fonts.
- Editor updates: internal actions use `syncActionResult()`; external consumers use `updateScene()`. Both routes must pair scene/app-state changes with the correct `CaptureUpdateAction`.
- Store/history: `Store` computes snapshot changes; `History` records only durable increments, so remote/init updates must stay out of the undo stack.
- Restore/import: `restoreElements()` migrates/repairs incoming elements, deduplicates IDs, can delete invisibly small elements, and contains special-case repair logic for problematic arrows/bindings.
- Collaboration: remote payloads are decrypted, restored against local elements, reconciled using version/versionNonce/editing-state rules, then applied with `CaptureUpdateAction.NEVER`.
- Local persistence: `onChange` debounces writes to localStorage and IndexedDB, then performs a second non-capturing scene update to flip image element status from `pending` to `saved`.

## Invariants
- Element ordering is based on fractional indices; invalid indices are repaired and only aggressively validated in dev/test/debug paths.
- `CaptureUpdateAction.IMMEDIATELY` is the only mode that creates durable history entries.
- `CaptureUpdateAction.NEVER` updates the store snapshot but deliberately avoids undo/redo recording; this is the safe mode for initialization and remote state.
- `CaptureUpdateAction.EVENTUALLY` emits ephemeral increments and intentionally does not update the snapshot immediately.
- Collaboration convergence depends on `version`, `versionNonce`, and “local element currently being edited/resized/created” checks.
- The app treats file/image status transitions as stateful side effects, not just derived UI.
- Local browser persistence and live collaboration are mutually constrained: collaboration pauses local save to avoid conflicts.
