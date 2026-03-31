# Decision Log

## Summary
- Records implementation behaviors that are easy to miss during routine development.
- Focuses on source-verified items that should stay visible in memory docs.

## Current State

### 1) Collaboration gate depends on external flag
- **Description:** `Portal` broadcast readiness depends on `socketInitialized`, but that flag is managed outside `Portal`.
- **What code is doing:** In `excalidraw-app/collab/Portal.tsx`, `isOpen()` requires `socketInitialized && socket && roomId && roomKey`. `socketInitialized` starts as `false` and resets to `false` on `close()`, but `Portal` does not set it to `true` internally.
- **What documented:** There is an inline comment in `Portal.tsx` and deeper analysis in `docs/technical/code-notes.md`; this behavior was not explicitly tracked in `docs/memory/*` before this entry.

### 2) Direct element mutation intentionally bypasses history/collab
- **Description:** Some binding-cleanup paths mutate elements directly and skip normal history/sync pathways.
- **What code is doing:** In `packages/excalidraw/components/App.tsx`, repeated notes near `mutateElement()` state that raw mutation is used because history entries and multiplayer updates are not desired in that path.
- **What documented:** The intent is documented in code comments and detailed in `docs/technical/code-notes.md`; memory docs previously did not call out this exception path.

### 3) `flushSync` is required for bind-mode correctness
- **Description:** A bind-mode update path relies on synchronous React state flush to avoid stale reads.
- **What code is doing:** In `packages/excalidraw/components/App.tsx`, a note near `flushSync(...)` states the delayed bind-mode change must see the correct `newElement` state, so batching is intentionally bypassed at that point.
- **What documented:** This is documented inline in source and in `docs/technical/code-notes.md`; memory docs did not previously include this constraint.

## Actions
- Keep this log focused on high-impact hidden behaviors, not generic implementation details.
- When one of these behaviors changes, update this file and `docs/technical/code-notes.md` together.

## Source Checkpoints
- `excalidraw-app/collab/Portal.tsx`
- `packages/excalidraw/components/App.tsx`
- `docs/technical/code-notes.md`

## Related Documentation
- [`./systemPatterns.md`](./systemPatterns.md)
- [`./productContext.md`](./productContext.md)
- [`./progress.md`](./progress.md)
- [`../technical/code-notes.md`](../technical/code-notes.md)
- [`../product/PRD.md`](../product/PRD.md)
