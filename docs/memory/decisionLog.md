# Decision Log: Excalidraw

_Records significant architectural and product decisions with rationale. Add new entries at the top._

---

## [2026-03-25] Undocumented Behavior: mutateElement() silently rewrites elbow arrow updates

**Discovery:** `packages/element/src/mutateElement.ts:53-72` — when `mutateElement()` is called on an elbow arrow element and the updates include `points`, `fixedSegments`, or an empty update object (normalization), the function silently replaces the entire `updates` object. It calls `updateElbowArrowPoints()` to recalculate angle (forced to `0`), point positions, and bindings, then spreads the result over the original updates.

**Why this matters:**
- Callers passing `{ points: [...] }` get back a completely different set of points than they provided
- The `angle` is silently forced to `0 as Radians` regardless of what was passed
- The recalculation depends on `elementsMap` state at call time — if other elements haven't been updated yet, bindings will be wrong
- An empty `updates` object (`Object.keys(updates).length === 0`) also triggers the full recalculation

**Risk for AI-assisted changes:**
- AI may suggest directly setting arrow points without realizing they'll be overwritten
- Refactoring this function without preserving the elbow arrow branch will break all elbow arrow routing
- Initialization order matters: the `elementsMap` must be current when this runs

---

## [2026-03-25] Undocumented Behavior: ShapeCache.delete() clears two independent caches

**Discovery:** `packages/element/src/shape.ts:105-107` — `ShapeCache.delete(element)` deletes from both `ShapeCache.cache` (a WeakMap of roughjs shapes) and `elementWithCanvasCache` (a WeakMap of pre-rendered canvas bitmaps imported from `renderElement.ts`).

**Why this matters:**
- The method name and class name suggest it only clears shape data
- `elementWithCanvasCache` is defined in a completely different module (`renderElement.ts`) and is imported solely for this side effect
- `ShapeCache.destroy()` (line 110-112) only resets `ShapeCache.cache` and does NOT clear `elementWithCanvasCache`, creating an inconsistency
- `generateElementShape()` (line 140) also independently deletes from `elementWithCanvasCache` on cache miss

**Risk for AI-assisted changes:**
- AI may call `ShapeCache.delete()` expecting a lightweight cache clear, unknowingly forcing a full canvas bitmap re-render
- Adding a new cache layer without updating `ShapeCache.delete()` would create stale-cache bugs
- The asymmetry between `delete()` and `destroy()` regarding `elementWithCanvasCache` may be a latent bug

---

## [2026-03-25] Undocumented Behavior: Store action priority system with implicit precedence

**Discovery:** `packages/element/src/store.ts:391-406` — the Store class uses a three-tier action system (`IMMEDIATELY`, `NEVER`, `EVENTUALLY`) with implicit priority ordering and different snapshot/emission behaviors that are not obvious from the API.

**Key implicit behaviors verified in source:**
1. **Priority ordering** (line 394-403): `IMMEDIATELY` > `NEVER` > `EVENTUALLY`. When multiple actions are scheduled before a commit, `getScheduledMacroAction()` picks the highest-priority one and discards the rest
2. **Snapshot update asymmetry** (line 377-384): `IMMEDIATELY` and `NEVER` update the snapshot after processing; `EVENTUALLY` does not — meaning EVENTUALLY changes are invisible to the next delta calculation
3. **Micro before macro** (line 187-195): `commit()` flushes all micro-actions before executing the single macro-action, creating a two-phase execution model
4. **Silent no-op** (line 335-340): `EVENTUALLY` actions are completely skipped if `onStoreIncrementEmitter` has no subscribers — a performance optimization that changes observable behavior
5. **Self-documented suspicion** (line 109): `TODO: Suspicious that this is called so many places. Seems error-prone.` on `scheduleCapture()`

**Risk for AI-assisted changes:**
- Adding a new `scheduleAction()` call without understanding priority may silently be overridden by a higher-priority action in the same commit cycle
- EVENTUALLY actions not updating the snapshot means subsequent IMMEDIATELY actions will include those changes in their delta — effectively "absorbing" the EVENTUALLY changes into the next durable increment
- Removing or reordering subscribers can change whether EVENTUALLY actions execute at all

---

## [2025-03-11] Deprecate UMD bundle, ship ESM only

**Decision:** Drop UMD bundle format; distribute `@excalidraw/excalidraw` as ESM only.

**Rationale:**
- ESM enables full tree-shaking of dependencies — consumers only pay for what they use
- UMD required bundling everything, inflating package size
- Modern bundlers (Vite, Next.js, Webpack 5) all support ESM natively

**Consequences:**
- CRA users must eject or use craco workaround
- Webpack users must set `resolve.fullySpecified: false`
- TypeScript `"moduleResolution": "node"` / `"node10"` no longer supported — must use `"bundler"`, `"node16"`, or `"nodenext"`

---

## [2025-03-11] Multiplayer undo / redo

**Decision:** Implement undo/redo that is aware of concurrent edits from other peers.

**Rationale:**
- Naive local undo would revert remote users' changes, causing data loss and confusion
- Version-based reconciliation already tracks per-element versions — undo needed to integrate with this

**Consequences:**
- Undo history must be scoped per-client, not shared
- Undo/redo implemented in `packages/excalidraw/history.ts` via `HistoryDelta`; `version` and `versionNonce` are excluded when applying history deltas so each undo/redo generates a new version and is treated as a fresh user action for collaboration

---

## Canvas rendering instead of DOM elements

**Decision:** Render all drawing primitives on HTML5 `<canvas>`, not as DOM/SVG elements.

**Rationale:**
- DOM rendering at scale (hundreds of elements) causes layout/repaint bottlenecks
- Canvas rendering gives full control over draw order and hit-testing
- Rough.js operates natively on canvas context

**Consequences:**
- Accessibility requires explicit ARIA overlays (canvas has no semantic structure)
- Text selection / copy within shapes not natively supported
- Hit-testing and selection logic must be implemented manually

---

## Element immutability

**Decision:** All `ExcalidrawElement` objects are immutable; mutations produce new objects via `newElementWith()`.

**Rationale:**
- Cheap reference equality (`===`) for change detection avoids deep comparisons
- Required for collaboration: `version` must increment on every change, which requires creating a new object
- Enables simple undo/redo via history snapshots (store previous references, not diffs)
- Deleted elements retained with `isDeleted: true` so remote peers can reconcile deletions

**Consequences:**
- All update paths must go through `newElementWith()` — direct mutation is a bug
- Scene arrays grow over time (deleted elements accumulate); `getNonDeletedElements()` required for rendering

---

## Fractional indexing for z-order

**Decision:** Use fractional indexing (`fractional-indexing` library) for element `index` property instead of integer array positions.

**Rationale:**
- Integer positions require reindexing all elements when inserting between two elements
- In multiplayer, concurrent reindexing by two peers produces conflicts
- Fractional indices allow inserting between any two values without touching other elements

**Consequences:**
- `index` property is a string (fractional), not an integer
- Ordering relies on string comparison, not array position
- Library provides utilities for generating indices between two existing values

---

## Monorepo split: app vs packages

**Decision:** Separate hosted app (`excalidraw-app/`) from publishable packages (`packages/`), enforced by dependency rules.

**Rationale:**
- Library consumers must not inherit Firebase/socket.io-client as transitive dependencies
- SSR frameworks (Next.js) must be able to import the library without server-side crashes from browser APIs
- Clear boundary makes it easier to reason about what is "product" vs "library"

**Consequences:**
- All collaboration and persistence infrastructure stays in `excalidraw-app/`
- Packages must not reference `window`/`document` at module load time
- New features must be classified: is this app-only or reusable?

---

## Jotai for reactive state, AppState for editor state

**Decision:** Use Jotai atoms for reactive UI state and a centralized `AppState` object for editor state.

**Rationale:**
- Jotai provides fine-grained subscriptions without prop-drilling
- `AppState` as a plain object is serializable, snapshottable (for undo), and easy to diff
- Scoped Jotai stores (`jotai-scope`) prevent atom leakage between multiple editor instances on the same page

**Consequences:**
- ESLint rule enforces scoped store usage — global `useAtom` without scope is flagged
- `AppState` defaults defined in `appState.ts` serve as the single source of truth for initial state
- Two separate stores: `editorJotaiStore` (editor-scoped) and `appJotaiStore` (app-scoped)

---

## Related Documents

| Document | Relevance |
|----------|-----------|
| [systemPatterns.md](./systemPatterns.md) | Patterns that emerged from these decisions (immutability, collab, rendering, actions) |
| [projectbrief.md](./projectbrief.md) | Project context, element model, monorepo layout |
| [progress.md](./progress.md) | Which decisions are shipped vs still in progress |
| [activeContext.md](./activeContext.md) | Current constraints and reminders derived from these decisions |
| [architecture.md](../technical/architecture.md) | Technical implementation of decisions (rendering pipeline, data flow, package graph) |
| [domain-glossary.md](../product/domain-glossary.md) | Precise meanings of terms used in decisions (Scene, Reconciliation, FractionalIndex, etc.) |
