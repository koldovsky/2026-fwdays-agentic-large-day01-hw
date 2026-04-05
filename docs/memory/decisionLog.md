# Decision Log

## Details

For product requirements -> see `docs/product/PRD.md`  
For domain glossary -> see `docs/product/domain-glossary.md`  
For detailed architecture -> see `docs/technical/architecture.md`  
For technical setup -> see `docs/technical/dev-setup.md`

## ADRs

### Accepted

#### ADR-2026-04-05-01: Guard hidden runtime invariants

##### Context

- We audited Excalidraw for undocumented behavior patterns with focus on `HACK`/`FIXME`/`TODO` markers.
- Goal: protect refactors (including AI-assisted changes) from breaking hidden runtime invariants.

##### Decision

- Treat editor lifecycle as a strict ordered flow: `editor:mount` is not equivalent to `editor:initialize`.
- Treat paste handling as browser-sensitive logic: avoid introducing new async boundaries before clipboard event data is captured unless required by platform APIs.
- Exception: `parseClipboard` is async in the implementation and is awaited after data extraction, so async parsing is allowed once clipboard payload is already materialized.
- Treat input handling (touch/pointer/double-click) as an implicit state machine; avoid isolated edits without integration tests.
- Keep Store/History capture semantics (`IMMEDIATELY`/`NEVER`/`EVENTUALLY`) intact unless history + sync behavior is revalidated.
- Preserve finalize/restore side effects tied to invisible elements and binding repair until a replacement design is documented.
- Preserve frame ordering/membership invariants (children-before-frame, drag-dependent membership checks).

##### Consequences

- Any optimization in these areas requires regression coverage for render cycle, undo/redo, and collaboration sync.
- Future refactors should first convert inline `TODO`/`HACK` notes into explicit design docs before behavior changes.

##### Evidence Sources

- `packages/excalidraw/components/App.tsx`
- `packages/excalidraw/index.tsx`
- `packages/excalidraw/components/InitializeApp.tsx`
- `packages/element/src/store.ts`
- `packages/excalidraw/history.ts`
- `packages/element/src/delta.ts`
- `packages/element/src/frame.ts`
- `packages/excalidraw/data/restore.ts`
- `packages/excalidraw/subset/woff2/woff2-loader.ts`
- `packages/excalidraw/subset/harfbuzz/harfbuzz-loader.ts`

---

### Inferred (Hypotheses)

> These ADRs are inferred from current code behavior and comments. They are not yet confirmed by historical ADR records.

#### ADR-2026-04-05-02 (Inferred): Two-phase editor lifecycle events

##### Context

- Integrators need an early API handle and a later "ready" signal.

##### Decision

- Keep `editor:mount` and `editor:initialize` as separate lifecycle checkpoints.

##### Consequences

- Better integration flexibility, but strict ordering requirements for consumers.

##### Evidence Sources

- `packages/excalidraw/components/App.tsx`
- `packages/excalidraw/types.ts`
- `packages/excalidraw/tests/packages/events.test.tsx`

#### ADR-2026-04-05-03 (Inferred): Capture policy separates local history from sync/init

##### Context

- Editor must support undo/redo while avoiding polluted history for remote/init updates.

##### Decision

- Use explicit capture semantics: `IMMEDIATELY`, `NEVER`, `EVENTUALLY`.

##### Consequences

- Powerful control over history/sync, but fragile if callers choose wrong capture mode.

##### Evidence Sources

- `packages/excalidraw/components/App.tsx`
- `packages/element/src/store.ts`
- `packages/excalidraw/history.ts`

#### ADR-2026-04-05-04 (Inferred): Preserve history consistency over minimal deltas

##### Context

- Finalize and delta flows include edge cases with invisible/deleted/bound elements.

##### Decision

- Prefer consistency-safe captures/rebinding even when some entries can be non-ideal (TODO-marked trade-offs).

##### Consequences

- Fewer integrity bugs, but occasional confusing undo/redo behavior and extra complexity.

##### Evidence Sources

- `packages/excalidraw/actions/actionFinalize.tsx`
- `packages/element/src/delta.ts`
- `packages/excalidraw/tests/history.test.tsx`

#### ADR-2026-04-05-05 (Inferred): Frame model uses ordering invariants for rendering logic

##### Context

- Frame clipping/membership/z-order depends on predictable ordering and drag state.

##### Decision

- Keep "children-before-frame" ordering invariant and state-aware membership checks.

##### Consequences

- Stable rendering semantics, but high coupling to ordering internals.

##### Evidence Sources

- `packages/element/src/frame.ts`
- `packages/element/tests/zindex.test.tsx`

#### ADR-2026-04-05-06 (Inferred): Lazy-load font WASM modules as isolated chunks

##### Context

- Font compression/subsetting is expensive and should not bloat main bundle.

##### Decision

- Lazy-load WOFF2/Harfbuzz WASM modules with local singleton-style caching.

##### Consequences

- Better startup performance, but special constraints on imports and module boundaries.

##### Evidence Sources

- `packages/excalidraw/subset/woff2/woff2-loader.ts`
- `packages/excalidraw/subset/harfbuzz/harfbuzz-loader.ts`

---

## Undocumented Behaviors

### UB-001: Lifecycle order dependency (`mount` vs `initialize`)

- **File**: `packages/excalidraw/components/App.tsx`
- **Type**: initialization-order dependency
- **What happens**: `editor:mount` is emitted before initial scene load is complete; `editor:initialize` waits for `!isLoading`.
- **Where documented**: partial (`types.ts`, tests), mostly implicit.
- **Risk**: early API usage causes race conditions.

### UB-002: Late `onIncrement` does not subscribe

- **File**: `packages/excalidraw/types.ts`, `packages/excalidraw/components/App.tsx`
- **Type**: initialization-order dependency
- **What happens**: store increment subscription is created only when `onIncrement` exists on initial render.
- **Where documented**: short note in props type comment.
- **Risk**: dynamic prop wiring appears broken after mount.

### UB-003: Clipboard data must be parsed in same frame

- **File**: `packages/excalidraw/components/App.tsx`
- **Type**: non-obvious side effect
- **What happens**: introducing extra awaits before clipboard event data is captured can clear `clipboardData` in some browsers, but `parseClipboard` itself is async and is awaited after extraction.
- **Where documented**: inline comment only.
- **Risk**: paste regressions in browser-specific flows.

### UB-004: Touch/pointer double-click state machine

- **File**: `packages/excalidraw/components/App.tsx`
- **Type**: implicit state machine
- **What happens**: behavior depends on internal click history and pointer-type branching (`touch` vs pointer events), including HACK/TODO paths.
- **Where documented**: inline TODO/HACK comments.
- **Risk**: mobile interaction regressions after local changes.

### UB-005: `flushSync` ordering in text submit/finalize path

- **File**: `packages/excalidraw/components/App.tsx`
- **Type**: non-obvious side effect
- **What happens**: selection state is force-flushed before finalize-related logic to maintain correct ordering.
- **Where documented**: inline TODO.
- **Risk**: flaky selection/history if reordered.
Additional entries `UB-006` through `UB-010` are tracked in the companion document `docs/memory/undocumentedBehaviors.md` to keep this log concise while preserving full evidence details.
