# Hidden Invariants

This file captures source-grounded behavior that is easy to miss during refactors. It is a deep technical reference. See [systemPatterns.md](../memory-bank/systemPatterns.md) for the compact architecture summary.

## Hidden Invariant 1
- File: `packages/element/src/store.ts`, `packages/excalidraw/history.ts`, `packages/excalidraw/components/App.tsx`
- What Happens: only `CaptureUpdateAction.IMMEDIATELY` produces durable increments and therefore undo/redo entries.
- Trigger: any path calling `syncActionResult()`, `updateScene()`, or `Store.scheduleMicroAction()`.
- Evidence: `Store.processAction()` emits durable increments only for `IMMEDIATELY`; `History.record()` listens to `onDurableIncrementEmitter`.
- Documented Where: [systemPatterns.md](../memory-bank/systemPatterns.md)
- Risk: using the wrong capture mode can silently pollute history or suppress undo entirely.
- Confidence: high

## Hidden Invariant 2
- File: `packages/excalidraw/components/App.tsx`
- What Happens: `onChange` is intentionally suppressed while the scene is loading.
- Trigger: initial scene restore and any phase where `state.isLoading` remains true.
- Evidence: `this.props.onChange` and `onChangeEmitter.trigger` are skipped until loading ends.
- Documented Where: [systemPatterns.md](../memory-bank/systemPatterns.md)
- Risk: removing this guard can overwrite local browser state with an empty scene during unfocused/tab-restore startup.
- Confidence: high

## Hidden Invariant 3
- File: `packages/excalidraw/data/restore.ts`
- What Happens: restore is not passive parsing; it migrates legacy data, repairs bindings/container/frame references, may delete invisibly small elements, generates replacement IDs for duplicates, and special-cases broken elbow arrows.
- Trigger: initial load, imports, external scenes, and remote collaboration payload normalization.
- Evidence: `restoreElements()`, `restoreAppState()`, `repair*()` helpers, duplicate-ID handling, and elbow-arrow repair branches.
- Documented Where: [systemPatterns.md](../memory-bank/systemPatterns.md)
- Risk: "cleanup" changes to restore can break old scenes or create sync divergence that only appears on migrated data.
- Confidence: high

## Hidden Invariant 4
- File: `excalidraw-app/App.tsx`, `excalidraw-app/data/LocalData.ts`
- What Happens: local persistence is debounced and then performs a second non-capturing scene update to flip image elements from `pending` to `saved`.
- Trigger: normal local editing when `LocalData.isSavePaused()` is false.
- Evidence: `onChange()` calls `LocalData.save()`, then conditionally issues `updateScene({ captureUpdate: NEVER })` for image status updates.
- Documented Where: [systemPatterns.md](../memory-bank/systemPatterns.md)
- Risk: treating image status as purely UI state can leave files unsaved or make exports/collab see stale statuses.
- Confidence: high

## Hidden Invariant 5
- File: `excalidraw-app/collab/Collab.tsx`, `packages/excalidraw/data/reconcile.ts`
- What Happens: collaboration prefers local elements when they are being edited/resized/created, have a newer version, or tie on version while having the lower `versionNonce`; reconciled results are then version-bumped against local state.
- Trigger: receiving remote room payloads.
- Evidence: `shouldDiscardRemoteElement()`, `_reconcileElements()`, `bumpElementVersions()`.
- Documented Where: [systemPatterns.md](../memory-bank/systemPatterns.md)
- Risk: changing tie-break or version-bump logic can create rebroadcast loops, lost edits, or non-converging rooms.
- Confidence: high

## Hidden Invariant 6
- File: `excalidraw-app/collab/Collab.tsx`, `excalidraw-app/collab/Portal.tsx`
- What Happens: collaboration pauses local saves, blocks socket broadcasts until room initialization completes, and periodically rebroadcasts the full scene to repair drift.
- Trigger: starting/stopping collaboration and ongoing room updates.
- Evidence: `LocalData.pauseSave()/resumeSave()`, `socketInitialized`, `queueBroadcastAllElements`, `INITIAL_SCENE_UPDATE_TIMEOUT`, `SYNC_FULL_SCENE_INTERVAL_MS`.
- Documented Where: [systemPatterns.md](../memory-bank/systemPatterns.md)
- Risk: refactors that look local to socket code can accidentally re-enable browser saves or broadcast partial/uninitialized state.
- Confidence: high

## Hidden Invariant 7
- File: `packages/excalidraw/components/App.tsx`, `packages/common/src/appEventBus.ts`
- What Happens: editor lifecycle events are "emit once + replay last", and can be awaited as promises by late subscribers.
- Trigger: subscribing via `api.onEvent(...)` for `editor:mount`, `editor:initialize`, or `editor:unmount`.
- Evidence: `editorLifecycleEventBehavior` sets `{ cardinality: "once", replay: "last" }`; `AppEventBus.on()` returns a Promise for once+replay events when no callback is supplied.
- Documented Where: `none`
- Risk: changing event behavior semantics can break host integrations that await initialization or subscribe after mount.
- Confidence: high

## Hidden Invariant 8
- File: `packages/excalidraw/components/App.tsx`, `packages/excalidraw/types.ts`
- What Happens: `props.onIncrement` is subscribed only during mount if it exists on initial render; later prop changes do not rewire this listener.
- Trigger: passing or toggling the `onIncrement` prop.
- Evidence: `componentDidMount()` conditionally subscribes to `store.onStoreIncrementEmitter` only once; there is no `componentDidUpdate()` re-subscription path.
- Documented Where: `packages/excalidraw/types.ts` comment on `onIncrement`
- Risk: host apps may expect runtime toggling of `onIncrement` to work and silently miss increment events.
- Confidence: high

## Hidden Invariant 9
- File: `packages/element/src/store.ts`
- What Happens: store increments observe only `ObservedAppState` (a subset of full `AppState`), and macro action precedence is `IMMEDIATELY > NEVER > EVENTUALLY`.
- Trigger: any `store.commit()` cycle after updates/actions.
- Evidence: `getObservedAppState()` strips AppState to selected fields; `Store.getScheduledMacroAction()` resolves priority as `IMMEDIATELY`, then `NEVER`, else `EVENTUALLY`.
- Documented Where: `none`
- Risk: edits that change non-observed AppState fields won't emit increments; wrong action scheduling can silently alter undo/redo semantics.
- Confidence: high

## Hidden Invariant 10
- File: `packages/element/src/Scene.ts`, `packages/element/src/fractionalIndex.ts`
- What Happens: replacing scene elements always synchronizes fractional indices, and "moved-only" synchronization can fall back to full invalid-index sync.
- Trigger: `Scene.replaceAllElements()` and index-reordering operations calling `syncMovedIndices()`.
- Evidence: `replaceAllElements()` calls `syncInvalidIndices(...)`; `syncMovedIndices()` catches errors and falls back to `syncInvalidIndices(...)`.
- Documented Where: `none`
- Risk: operations expected to touch only a subset of elements can mutate more elements than expected, impacting versioning/deltas/reconciliation.
- Confidence: high

## Hidden Invariant 11
- File: `packages/utils/src/export.ts`
- What Happens: utility export APIs normalize input by running restore/migration logic and deleting invisible elements before export rendering.
- Trigger: calling `exportToCanvas()`, `exportToBlob()`, or `exportToSvg()` from `@excalidraw/utils`.
- Evidence: each export path invokes `restoreElements(..., { deleteInvisibleElements: true })` and `restoreAppState(...)` before delegating to render/export internals.
- Documented Where: `none`
- Risk: export output can diverge from raw in-memory scene objects if callers assume no restore/sanitization pass is applied.
- Confidence: high

## Hidden Invariant 12
- File: `packages/excalidraw/data/restore.ts`
- What Happens: during restore, empty text elements may be force-marked as deleted and version-bumped, which mutates sync semantics rather than just sanitizing input.
- Trigger: `restoreElement()` with `opts.deleteInvisibleElements === true` on a text element that resolves to empty text.
- Evidence: the code sets `isDeleted: true` and calls `bumpVersion(element)` next to TODO noting this can break delta/versioning behavior.
- Documented Where: `none`
- Risk: changing restore/delete behavior without adjusting delta pipelines can create non-obvious sync divergence between full-scene restore and incremental updates.
- Confidence: high

## Hidden Invariant 13
- File: `packages/excalidraw/components/App.tsx`, `packages/excalidraw/actions/actionFinalize.tsx`
- What Happens: text submit path relies on synchronous selection state flush before finalize semantics; ordering is required for keyboard-submit correctness.
- Trigger: WYSIWYG `onSubmit` for text editing, especially `viaKeyboard`.
- Evidence: `handleTextWysiwyg()` uses `flushSync()` with explicit comment that it must update state before finalize; the same flow then schedules capture and clears editing state.
- Documented Where: `none`
- Risk: refactoring this into async batched updates can cause wrong selection/finalization behavior and history inconsistencies.
- Confidence: high

## Hidden Invariant 14
- File: `excalidraw-app/collab/Collab.tsx`
- What Happens: stopping collaboration with remote-state override rewrites browser-state sync markers and rewrites image element statuses from `saved` to `pending` via non-capturing scene update.
- Trigger: `stopCollaboration(true)` path when the user confirms override.
- Evidence: `resetBrowserStateVersions()`, `LocalData.fileStorage.reset()`, and `updateScene({ captureUpdate: NEVER })` mapping saved image statuses to pending.
- Documented Where: `none`
- Risk: changing this flow can resurrect stale local data from other tabs or produce incorrect file lifecycle states after leaving a room.
- Confidence: high

## Hidden Invariant 15
- File: `packages/excalidraw/data/library.ts`, `excalidraw-app/App.tsx`, `excalidraw-app/data/LocalData.ts`
- What Happens: library initialization is intentionally race-tolerant and order-sensitive: URL installs, legacy migration, and adapter load can all run around startup, so resulting data is always merged instead of replaced.
- Trigger: `useHandleLibrary()` initialization with adapter and optional migration adapter.
- Evidence: init flow explicitly handles `(A) legacy` and `(B) adapter` paths; `updateLibrary({... merge: true })` is used with comments describing pre-load URL installs and migration ordering.
- Documented Where: `none`
- Risk: simplifying this to "single source load" can silently drop library items when URL import and persistence initialization overlap.
- Confidence: high

## Hidden Invariant 16
- File: `packages/excalidraw/components/App.tsx`, `packages/excalidraw/wysiwyg/textWysiwyg.tsx`
- What Happens: input handling and inline text editing depend on temporary hacks bridging divergent event/update paths (touch vs pointer and theme updates outside store-observed app state).
- Trigger: double-click/tap flows, mobile pointer behavior, and WYSIWYG updates when theme changes.
- Evidence: TODO/HACK comments around double-click handling (`lastPointerUpIsDoubleClick`, browser-vs-manual logic) plus WYSIWYG FIXME that theme updates currently piggyback on `onChangeEmitter` because store does not emit `appState.theme`.
- Documented Where: `none`
- Risk: "cleanup" of these hacks without replacing the hidden coupling can regress tap/double-click UX on mobile and desync editor theme vs text editor theme.
- Confidence: medium
