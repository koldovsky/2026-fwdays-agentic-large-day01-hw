# Undocumented Behaviors (Companion)

## Details

Source summary document: `docs/memory/decisionLog.md`  
For product requirements -> see `docs/product/PRD.md`  
For domain glossary -> see `docs/product/domain-glossary.md`  
For detailed architecture -> see `docs/technical/architecture.md`  
For technical setup -> see `docs/technical/dev-setup.md`

## Purpose

- This companion keeps extended undocumented behavior entries extracted from `docs/memory/decisionLog.md`.
- It exists to keep `decisionLog.md` concise while preserving full behavior evidence.

## Undocumented Behaviors (Extended)

### UB-006: Store capture policy as hidden contract

- **File**: `packages/element/src/store.ts`, `packages/excalidraw/components/App.tsx`
- **Type**: implicit state machine
- **What happens**: action scheduling and durable/ephemeral capture behavior rely on `IMMEDIATELY`/`NEVER`/`EVENTUALLY` semantics.
- **Where documented**: split between comments and API docs.
- **Risk**: undo/redo or sync integrity breaks after "optimization."
- **Evidence Sources**:
  - `packages/element/src/store.ts`
  - `packages/excalidraw/components/App.tsx`

---

### UB-007: Finalize captures everything for consistency

- **File**: `packages/excalidraw/actions/actionFinalize.tsx`
- **Type**: non-obvious side effect
- **What happens**: finalize forces immediate capture even for edge cases (including invisible elements), with known TODO caveats.
- **Where documented**: TODO comments and tests.
- **Risk**: "history cleanup" changes can cause data inconsistency.
- **Evidence Sources**:
  - `packages/excalidraw/actions/actionFinalize.tsx`
  - `packages/excalidraw/tests/history.test.tsx`

---

### UB-008: Restore mutates visibility and versioning

- **File**: `packages/excalidraw/data/restore.ts`
- **Type**: non-obvious side effect
- **What happens**: empty text may be marked deleted and version-bumped during restore with `deleteInvisibleElements`.
- **Where documented**: TODO warning in code.
- **Risk**: delta sync/versioning divergence in collaboration.
- **Evidence Sources**:
  - `packages/excalidraw/data/restore.ts`

---

### UB-009: Delta filtering can still produce empty history steps

- **File**: `packages/element/src/delta.ts`, `packages/excalidraw/history.ts`
- **Type**: implicit state machine
- **What happens**: visible-change filtering and iterative undo/redo replay can still yield empty/confusing history transitions.
- **Where documented**: TODO comments and tests.
- **Risk**: subtle undo/redo UX and integrity regressions.
- **Evidence Sources**:
  - `packages/element/src/delta.ts`
  - `packages/excalidraw/history.ts`
  - `packages/excalidraw/tests/history.test.tsx`

---

### UB-010: Frame ordering and drag-dependent membership invariants

- **File**: `packages/element/src/frame.ts`
- **Type**: implicit state machine
- **What happens**: frame behavior relies on ordering invariant (children before frame) and drag-state-dependent membership checks.
- **Where documented**: docstring + TODO.
- **Risk**: clipping/z-order/membership regressions after refactors.
- **Evidence Sources**:
  - `packages/element/src/frame.ts`
  - `packages/element/tests/zindex.test.tsx`
