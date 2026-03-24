# Decision Log

## 2026-03-24: Memory Bank Structure

**Decision:** Place Memory Bank files in `docs/memory/` with additional docs in `docs/technical/` and `docs/product/`.

**Context:** The project needed structured documentation for AI-assisted development. The Cline Memory Bank pattern was adopted with 7 core files.

**Alternatives considered:**
- Single large README — rejected (too monolithic, hard to maintain)
- Root-level files — rejected (clutters repository root)
- Wiki — rejected (not version-controlled with code)

**Outcome:** Clean separation of concerns. Memory files are concise, cross-linkable, and colocated with the codebase.

## 2026-03-24: Documentation-First Approach

**Decision:** Document the existing architecture before making code changes.

**Context:** Excalidraw is a large codebase (~12,800 lines in App.tsx alone). Understanding the architecture first reduces risk of breaking changes.

**Alternatives considered:**
- Jump straight into code changes — rejected (high risk of unintended side effects)
- Rely solely on CLAUDE.md — rejected (insufficient for deep architectural understanding)

**Outcome:** Created comprehensive docs covering architecture, domain terms, and product requirements. Validated all docs against source code to ensure accuracy.

## 2026-03-24: Validation Before Trust

**Decision:** Validate every factual claim in Memory Bank docs against actual source code before relying on them.

**Context:** AI-generated documentation can contain hallucinations or inaccuracies. Found 6 minor issues across 6 files during validation.

**Issues found:**
- Utils package dependency arrow was wrong
- File casing mismatch (store.ts vs Store.ts)
- File name mismatch (linearElementEditor.ts vs linearElement.ts)
- Approximate counts were slightly off (~130 → ~113 fields, 45+ → 36 action files)

**Outcome:** Documentation accuracy confirmed at >95%. Minor fixes needed but no structural errors.

---

## Undocumented Behavior Catalog

Discovered via codebase audit (HACK/FIXME/TODO/WORKAROUND comments, implicit state analysis). These behaviors are not documented anywhere and pose risk for AI-assisted or human refactoring.

### Undocumented Behavior #1: Implicit State Machine — Hybrid Double-Click / Double-Tap

- **File**: `packages/excalidraw/components/App.tsx` (lines 689, 1469, 3577, 6324)
- **What happens**: Double-click detection uses two completely separate code paths — browser native `dblclick` events for pointer devices, and a custom manual tap-counting system (`didTapTwice`, `tappedTwiceTimer`, `firstTapPosition`) for touch. The `shouldHandleBrowserCanvasDoubleClick()` method (line 6324) returns `true` unconditionally for touch but uses position threshold checks for pointer. Module-level state (`lastPointerUpIsDoubleClick`) bridges the two systems.
- **Where documented**: Nowhere. The only hint is `// TODO this is a hack and we should ideally unify touch and pointer events` (line 689).
- **Risk**: An AI may suggest unifying event handling (as the TODO says), but this would break touch double-tap on mobile devices where the browser `dblclick` is unreliable. Changing timeouts or position thresholds would break one of the two paths.

### Undocumented Behavior #2: Initialization Order Dependency — App Constructor Sequencing

- **File**: `packages/excalidraw/components/App.tsx` (lines 787–851)
- **What happens**: Constructor creates objects in a strict undocumented order with closure-based deferred resolution. `ActionManager` is created at line 819 **before** `Scene` at line 825, capturing a closure `() => this.scene.getElementsIncludingDeleted()` that only works because it's not called until later. `Store` (line 832) depends on `this.scene` being initialized. `History` (line 833) depends on `Store`. `Fonts` (line 840) depends on `Scene`. The `appStateObserver` (class field, line 676) captures `() => this.state` but Scene callbacks aren't connected until `componentDidMount` (line 3109).
- **Where documented**: Nowhere. No comments explain why this order matters.
- **Risk**: An AI may reorder initialization (e.g., create Store before Scene) and get a runtime crash. Or move `scene.onUpdate` registration from `componentDidMount` to the constructor — this would break React StrictMode (double mount).

### Undocumented Behavior #3: Silent History Loss — scheduleCapture Deduplication

- **File**: `packages/element/src/store.ts` (line 109)
- **What happens**: `scheduleCapture()` is called from 20+ places in the codebase. It adds `CaptureUpdateAction.IMMEDIATELY` to a `Set` of scheduled actions. Since it's a Set, repeated calls in the same execution frame are deduplicated — only one capture actually occurs. The real change commit is deferred to `Store.commit()`, which is called in `componentDidUpdate`. If `commit()` is never called (e.g., due to an early return in componentDidUpdate) — changes are **silently lost** from undo/redo history.
- **Where documented**: Only a TODO comment: `"Suspicious that this is called so many places. Seems error-prone."`
- **Risk**: An AI may add a new `scheduleCapture()` call not knowing it can be deduplicated with another, or not knowing that without `commit()` changes don't enter history. Optimizing `componentDidUpdate` (e.g., adding an early return) can cause undo/redo loss.

### Undocumented Behavior #4: Global Panning State — Module-Level Flags

- **File**: `packages/excalidraw/components/App.tsx` (lines 591–592, 8028–8124)
- **What happens**: Two module-level (not instance) boolean flags `isPanning` and `isDraggingScrollBar` control canvas state. `isPanning = true` is set **before** adding event listeners (line 8043). If the user switches tabs (tab away) during panning, `pointerup` never fires — the flag stays `true` forever, and all subsequent pointer events are ignored (`if (isPanning) return;`). Cursor restoration depends on `isHoldingSpace` — if space is held, cursor stays GRAB after panning stops.
- **Where documented**: Nowhere.
- **Risk**: An AI may not know about these global flags and suggest adding a new event handler that conflicts with the `isPanning` guard. Or suggest refactoring to instance-level state without handling all edge cases around tab switching.

### Undocumented Behavior #5: Restore Deletes Elements Without Recording Deltas

- **File**: `packages/excalidraw/data/restore.ts` (line 408)
- **What happens**: When `deleteInvisibleElements: true`, empty text elements are marked as `isDeleted: true` and their version is incremented (`bumpVersion`). But this change is **not recorded as a delta** for sync/undo. The TODO comment explicitly states: `"we should not do this since it breaks sync / versioning when we exchange / apply just deltas"`. Called during initial data load (App.tsx:2910) and paste/library operations (App.tsx:3885).
- **Where documented**: Only a TODO comment.
- **Risk**: An AI may suggest adding more types of "invisible" elements to this cleanup logic, worsening the sync problem. Or remove `bumpVersion` "for optimization" — this would break version reconciliation in collaboration.

### Undocumented Behavior #6: Scene.triggerUpdate() — Synchronous Callbacks Without Batching

- **File**: `packages/element/src/Scene.ts` (lines 303–308)
- **What happens**: Every scene mutation (`replaceAllElements`, `insertElement`, `mutateElement`) synchronously calls `triggerUpdate()`, which iterates over all registered callbacks. App registers `this.triggerRender` as a callback. There is no batching — 10 sequential element mutations = 10 trigger renders. If a callback modifies the scene, this potentially creates an infinite loop.
- **Where documented**: Nowhere.
- **Risk**: An AI may suggest batch-updating elements via a loop `for (el of elements) mutateElement(el, ...)`, not knowing that each mutation triggers a full render. The correct approach is `replaceAllElements()` with a new array. This difference is documented nowhere.

### Undocumented Behavior #7: Jotai Store — Global, Not Per-Instance

- **File**: `packages/excalidraw/data/library.ts` (line 253), `packages/excalidraw/editor-jotai.ts` (line 18)
- **What happens**: The Jotai store is created once at module level. Commented-out code with TODO: `"uncomment after/if we make jotai store scoped to each excal instance"`. Library state (`libraryItemsAtom`) is global — when an instance is destroyed (`destroy()`, line 249) only the SVG cache is cleared, the atom is not reset. Multiple Excalidraw instances on the same page share library state.
- **Where documented**: Only a TODO comment.
- **Risk**: An AI may assume that each `<Excalidraw>` component has isolated state (as the `jotai-scope` documentation suggests), and propose per-instance library features. This won't work — library state is global.

## Related Docs

### Technical
- [Architecture](../technical/architecture.md) — system design, data flow, rendering pipeline
- [Dev Setup](../technical/dev-setup.md) — onboarding guide, from git clone to first PR

### Product
- [PRD](../product/PRD.md) — reverse-engineered product requirements
- [Domain Glossary](../product/domain-glossary.md) — core domain terms
