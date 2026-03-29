# Decision Log — Undocumented Behaviors & Technical Debt

> **Audience**: Senior engineers, architects, and technical leads.
> **Scope**: `excalidraw-app/` and `packages/`
> **Updated**: 2026-03-29
> **Full detail**: [`docs/technical/technical-debt-catalog.md`](../technical/technical-debt-catalog.md)

---

## Table of Contents

1. [Implicit State Machines](#1-implicit-state-machines)
2. [Non-obvious Side Effects](#2-non-obvious-side-effects)
3. [Initialization Order Dependencies](#3-initialization-order-dependencies)
4. [Hidden Assumptions & Constraints](#4-hidden-assumptions--constraints)
5. [High-Risk Clusters](#5-high-risk-clusters)

---

## 1. Implicit State Machines

| Machine | Location | Key Implicit Behavior |
|---|---|---|
| **Collaboration Lifecycle** | `collab/Collab.tsx` | State inferred from atoms + flags; `LocalData.pauseSave` may never resume on error path |
| **Active Tool / Drawing** | `components/App.tsx` | `bindModeHandler` is a raw `setTimeout` — transition back from BIND_MODE is time-driven only |
| **Linear Element Editor** | `linearElementEditor.ts` | `hoverPointIndex` and `selectedPointsIndices` must be manually kept in sync; mismatched pointerUp causes phantom hover |
| **Bind Mode Timer** | `components/App.tsx` | Debounce pattern undocumented; shared reference across concurrent pointer devices |

State diagrams for all four machines are in the [technical debt catalog](../technical/technical-debt-catalog.md#1-implicit-state-machines).

---

## 2. Non-obvious Side Effects

| ID | File | Risk | Summary |
|---|---|---|---|
| SE-1 | `App.tsx:11376–11412` | **High** | Raw `mutateElement()` bypasses history and collab sync — silent state divergence |
| SE-2 | `data/FileManager.ts:107` | **High** | Failed saves never retried → permanent image data loss in collab |
| SE-3 | `element/src/selection.ts:138` | **High** | Module-level memoization shared across all `<Excalidraw>` instances |
| SE-4 | `collab/Collab.tsx:762` | **High** | `restoreElements` before reconciliation can corrupt in-progress drawings |
| SE-5 | `data/restore.ts:408` | **High** | Silent `isDeleted` mutation during restore not recorded to Store → elements reappear for peers |
| SE-6 | `collab/Collab.tsx:499` | **High** | `pauseSave` called before async import; never resumed if import fails |

---

## 3. Initialization Order Dependencies

| ID | File | Risk | Summary |
|---|---|---|---|
| IO-1 | `App.tsx:11754` | Medium | `touchstart`/`wheel` must be registered imperatively (not via React) to allow `preventDefault` |
| IO-2 | `App.tsx:9216` | **High** | `flushSync` required for bind mode timer to see correct `newElement`; React 18 concurrent mode incompatible |
| IO-3 | `elbowArrow.ts:995,1059` | Medium | `Scene.getScene()` singleton workaround; empty `elementsMap` misroutes empty-scene edge case |
| IO-4 | `excalidraw-app/App.tsx:417` | Medium | `LibraryLocalStorageMigrationAdapter` still runs on every startup; shipped 2024-03-11, deadline long past |

---

## 4. Hidden Assumptions & Constraints

| ID | File | Risk | Summary |
|---|---|---|---|
| HA-1 | `App.tsx:6043` | Medium | Hit-test FP floor: do not reduce the 0.85 multiplier without extensive zoom testing |
| HA-2 | `positionElementsOnGrid.ts:6` | Medium | Grid layout self-admitted "vibe-coded"; broken for heterogeneous AI-generated scenes |
| HA-3 | `frame.ts:752` | **High** | `isElementInFrame` is O(n) per render; no caching; jank at 500+ elements |
| HA-4 | `snapping.ts:44` | Low | `VISIBLE_GAPS_LIMIT_PER_AXIS = 99999` silently drops snap points in extreme scenes |
| HA-5 | `elbowArrow.ts:2119` + 4 others | **High** | Temporary overflow guards for normalization bug — active in 5 files |
| HA-6 | `delta.ts:842,853` | Medium | `filterInvisibleChanges` comparisons suspected redundant → phantom undo entries |
| HA-7 | `store.ts:434` | Medium | `StoreChange` excludes binary files — not a drop-in `onChange` replacement |
| HA-8 | `textWysiwyg.tsx:964` | Medium | Theme polling via `onChangeEmitter` fires on every element mutation instead of a discrete Store event |
| HA-9 | `index.tsx:105` | Medium | `UIOptions` rebuilt on every render — defeats all child memoization |
| HA-10 | `common/src/colors.ts:116` | Low | `pick` utility inlined due to circular dep with `utils.ts` |

---

## 5. High-Risk Clusters

### Cluster A — Elbow Arrow Overflow (5 files)

Root cause: unbounded coordinate generation in normalization algorithm. Independent guards in `newElement.ts`, `elbowArrow.ts`, `shape.ts`, `restore.ts`, `utils/src/shape.ts`.
**Action**: Fix root cause in `updateElbowArrowPoints`/`generateElbowArrowShape`, then remove all five guards.

### Cluster B — Delta/Store Integrity — Issue #7348 (6 locations)

Covers: empty undo entries, missing semantic validation, missing arrow rebind context, invisible elements in store, silent deletion during restore.
**Action**: Fix as a coordinated set; partial fixes shift the bug.

### Cluster C — Multi-Instance Isolation (3 locations)

Covers: module-level selection cache (`selection.ts:138`), Jotai library store not per-instance (`library.ts:253`), `UIOptions` memo break (`index.tsx:105`).
**Action**: Audit all module-level singletons against multi-instance embedding.

---

## Related Documentation

| Document | Location |
|---|---|
| **Full Technical Debt Detail** | [`docs/technical/technical-debt-catalog.md`](../technical/technical-debt-catalog.md) |
| **Technical Architecture** | [`docs/technical/architecture.md`](../technical/architecture.md) |
| **Product Requirements** | [`docs/product/PRD.md`](../product/PRD.md) |
