# Decision Log

## Undocumented Behavior #1: Hidden-tab initialization retry
- File: `excalidraw-app/App.tsx`
- Observed behavior: if user rejects import override while tab is hidden, initialization is deferred and retried on `focus` (`initializeScene` recursion via one-time focus listener).
- Documentation status: not described in product/technical docs in this repo snapshot.
- Risk: agent-generated refactors can remove this branch and regress startup/import behavior for background tabs.
- Recommendation: preserve the hidden-tab retry path and document it in architecture/runtime lifecycle notes.

## Undocumented Behavior #2: Save callback mutates scene element statuses
- File: `excalidraw-app/App.tsx`
- Observed behavior: `onChange` triggers `LocalData.save(...)`; save callback may update element `status` to `"saved"` and call `updateScene` with `CaptureUpdateAction.NEVER`.
- Documentation status: not explicitly called out as side-effect in onboarding docs.
- Risk: changing this flow can pollute undo history or desync persisted image status markers.
- Recommendation: treat this callback as persistence side-effect path; preserve `captureUpdate: NEVER` semantics unless intentionally redesigning history behavior.

## Undocumented Behavior #3: Export waits for pending file states
- File: `excalidraw-app/App.tsx`
- Observed behavior: `onExport` is an async generator that blocks final export until `FileStatusStore` pending image loads reach zero, then waits an extra 500ms before finalizing.
- Documentation status: not surfaced as part of export behavior contract.
- Risk: removing wait loop can produce incomplete exports with missing images; reducing buffer can reintroduce race conditions.
- Recommendation: keep the pending-file synchronization contract and document it in technical export pipeline notes.

## Undocumented Behavior #4: Storage sync is gated by visibility/collab mode
- File: `excalidraw-app/App.tsx`
- Observed behavior: `syncData` runs on focus/visibility and only applies browser-storage state in non-collab (or collab-disabled) paths, guarded by version checks.
- Documentation status: only implicit in source; no explicit runtime sync matrix in docs.
- Risk: naive changes may cause stale data overwrite or missed sync across tabs.
- Recommendation: add a small state matrix (collab on/off, hidden/visible) to architecture docs before altering synchronization logic.

## Related Docs
- [System Patterns](./systemPatterns.md)
- [Active Context](./activeContext.md)
- [Architecture](../technical/architecture.md)
