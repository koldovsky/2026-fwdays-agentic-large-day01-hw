# Decision Log

## Architecture Decisions

### Monorepo with separate packages

**Decision:** Split codebase into `@excalidraw/common`, `@excalidraw/math`, `@excalidraw/element`, `@excalidraw/excalidraw`, `@excalidraw/utils` instead of one package.
**Rationale:** Allows consumers to import only what they need (e.g., math utilities without the full React component). Enforces clear dependency boundaries — element logic cannot accidentally import app-level state.

### Delta-based history instead of full snapshots

**Decision:** Store `HistoryDelta` (diff) on the undo/redo stacks rather than full scene snapshots.
**Rationale:** Full snapshots would be prohibitively large for complex drawings. Deltas are small and invertible, enabling efficient undo/redo without memory pressure.

### CaptureUpdateAction.NEVER for remote changes

**Decision:** Collaboration updates are committed to the Scene with `NEVER`, meaning they never enter the local undo stack.
**Rationale:** Undoing a remote collaborator's action would be unexpected and disruptive. Each user's history is local-only.

### Fractional indices for element ordering

**Decision:** Elements carry a string-encoded fractional index (`element.index`) rather than integer positions.
**Rationale:** Integer positions require re-indexing all elements when inserting between two; fractional indices allow insertion between any two elements without touching others — critical for conflict-free multiplayer ordering.

### E2E encryption with key in URL hash

**Decision:** Room encryption key is embedded in the URL fragment (`#key=...`) and never sent to the server.
**Rationale:** The server (Socket.io relay) should have zero knowledge of diagram content. The URL hash is never included in HTTP requests, so the key stays client-side only.

### Jotai over Redux/Zustand

**Decision:** Use Jotai for global UI state rather than Redux or Zustand.
**Rationale:** Jotai's atom model fits the fine-grained, derived state needs of the editor (e.g., per-element selection state) without the boilerplate of Redux. Atoms are composable and tree-shakeable.

### Two-canvas rendering split

**Decision:** Separate static canvas (shapes) from interactive canvas (selection handles, cursors).
**Rationale:** Redrawing all shapes on every pointer move would be expensive. The static canvas only redraws when elements change; the interactive canvas redraws freely on pointer events.

### `mutateElement()` as the sole mutation path

**Decision:** All element property changes must go through `mutateElement()` or `newElementWith()` — never direct property assignment.
**Rationale:** Centralizing mutation ensures `version`/`versionNonce` are always incremented (required for collaboration conflict detection) and shape cache is always invalidated.
