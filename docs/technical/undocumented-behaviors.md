# Undocumented Behaviors

A catalog of implicit assumptions, silent contracts, hidden state machines, risky side effects,
and known-broken areas discovered by searching for `HACK`, `FIXME`, `TODO`, and `WORKAROUND`
comments and reading the surrounding code.

---

## Undocumented Behavior #1

- **File**: `packages/element/src/mutateElement.ts` (line 34–35)
- **What is happening**: `mutateElement()` performs **in-place (direct) mutation** of an element object and does NOT trigger a React re-render. Callers must use `scene.mutateElement()` or `ExcalidrawImperativeAPI.mutateElement()` if they need the UI to update. The low-level `mutateElement` is an internal primitive that only bumps the element's `version` / `versionNonce` and invalidates the `ShapeCache`—nothing else.
- **Where documented**: Only in the JSDoc comment of the function itself (`WARNING: this won't trigger the component to update…`). Not in any architectural doc.
- **Risks**: An AI that calls the low-level `mutateElement` directly instead of going through `scene.mutateElement` will produce silent bugs—elements change on disk but the canvas never redraws.

---

## Undocumented Behavior #2

- **File**: `packages/excalidraw/components/App.tsx` (lines ~960–1230)
- **What is happening**: `bindMode` is an **implicit three-state machine** (`"orbit"` → `"inside"` → `"skip"`) driven by pointer events and a `bindModeHandler` timeout. Transitions between states are forced synchronously via `flushSync()` to ensure React sees the right state before the next pointer event fires. This is a deliberate workaround for React's async batching.
- **Where documented**: Nowhere—no diagram, no comment explaining the full state flow or its invariants.
- **Risks**: Modifying arrow-binding pointer-event logic without understanding this machine will silently break the three-mode cycle. The `flushSync` calls are load-bearing; removing them causes state to lag by one event.

---

## Undocumented Behavior #3

- **File**: `packages/excalidraw/components/App.tsx` (line 689, field `lastPointerUpIsDoubleClick`)
- **What is happening**: Double-click detection is **split across two systems**: native browser `dblclick` events are used for mouse, while a manual counter (`lastCompletedCanvasClicks`) is used for touch. The TODO comment calls this "a hack." The `shouldHandleBrowserCanvasDoubleClick()` helper (line 6324) decides which path to use by inspecting the raw event `type` string.
- **Where documented**: Only a TODO comment at line 689: "we should ideally unify touch and pointer events."
- **Risks**: Adding new pointer-event handlers that don't account for both paths will cause double-click to behave inconsistently between mouse and touchscreen. Removing either tracking mechanism breaks one device class silently.

---

## Undocumented Behavior #4

- **File**: `packages/element/src/selection.ts` (lines 138–170)
- **What is happening**: `isSomeElementSelected` is a **module-level memoized singleton** implemented as an IIFE closure. It stores `lastElements`, `lastSelectedElementIds`, and a `isSelected` result in the module closure—not in React state or a ref. The cache must be manually cleared via `ret.clearCache()`. The FIXME comment says it should be moved into the editor instance.
- **Where documented**: Only the `// FIXME move this into the editor instance to keep utility methods stateless` comment.
- **Risks**: If this function is ever called from two different Excalidraw instances mounted simultaneously, they share state and will corrupt each other's cache. An AI that calls `clearCache` at the wrong time (or never) causes stale selections.

---

## Undocumented Behavior #5

- **File**: `packages/excalidraw/components/App.tsx` (line 5739, `flushSync` around `setState`)
- **What is happening**: Before the `finalize` action is dispatched on keyboard-submit, the selection state is forcibly flushed synchronously via `flushSync`. This is required because the finalize action inspects `selectedElementIds` and must see the updated value. React normally batches this update until after the handler returns.
- **Where documented**: A partial TODO at line 5737: "either move this into finalize as well, or handle all state updates in one place."
- **Risks**: Any change that removes or reorders this `flushSync` before the finalize dispatch will cause keyboard-triggered finalization to use stale selection state, silently selecting nothing.

---

## Undocumented Behavior #6

- **File**: `packages/excalidraw/wysiwyg/textWysiwyg.tsx` (line 964)
- **What is happening**: Theme changes are detected inside the WYSIWYG text editor by subscribing to `app.onChangeEmitter` (which fires on every element change) and comparing `app.state.theme` against a module-level `LAST_THEME` variable. This is an explicit workaround because `Store` does not yet emit `appState.theme` changes as store increments.
- **Where documented**: Only the `// FIXME after we start emitting updates from Store for appState.theme` comment.
- **Risks**: The WYSIWYG editor rescans theme on every element mutation. This is a performance risk for large scenes. An AI that routes theme changes through the Store (the "right" path) would inadvertently skip this listener and leave the text editor unstyled.

---

## Undocumented Behavior #7

- **File**: `packages/excalidraw/index.tsx` (lines 105–116)
- **What is happening**: The `UIOptions` object passed to `<App />` is **reconstructed every render** inside the exported `<Excalidraw />` wrapper, defeating React.memo's shallow comparison. The FIXME says defaults should be normalized in the parent so the memo resolver compares the same reference.
- **Where documented**: Only the `// FIXME normalize/set defaults in parent component so that the memo resolver compares the same values` comment.
- **Risks**: Any attempt to optimize re-renders by wrapping the exported component in `React.memo` will not work as long as this issue persists. An AI might try to add memoization and conclude it works in isolation, but the root issue is upstream.

---

## Undocumented Behavior #8

- **File**: `packages/element/src/sizeHelpers.ts` (line 27)
- **What is happening**: "Invisibly small" elements (e.g., width/height < 0.1 px) are **marked `isDeleted: true` in place** during the `finalize` action, but they are still recorded in the `Store` and therefore appear in undo/redo history. A user can undo and resurrect an invisible element they never intentionally created.
- **Where documented**: TODOs in `packages/excalidraw/actions/actionFinalize.tsx` (lines 142, 232) and `packages/element/src/sizeHelpers.ts` (line 27).
- **Risks**: An AI that adds cleanup logic after `finalize` without knowing this may double-delete, or may accidentally prevent the Store from recording the deletion—breaking undo.

---

## Undocumented Behavior #9

- **File**: `packages/element/src/Scene.ts` (line 433)
- **What is happening**: `Scene.mutateElement()` requires the caller to be inside a **React event handler or `unstable_batchedUpdates()`**. If called from a `setTimeout`, `Promise` callback, or async flow outside React's synthetic event system, the mutation fires but React will re-render each mutation independently—causing performance degradation or visual glitches.
- **Where documented**: Only the inline comment: "Make sure you are calling it either from a React event handler or within unstable_batchedUpdates()."
- **Risks**: AI-generated async operations (e.g., AI agent applying a batch of element changes) that call `scene.mutateElement` in a loop outside `unstable_batchedUpdates` will cause N separate renders instead of 1.

---

## Undocumented Behavior #10

- **File**: `packages/excalidraw/data/library.ts` (line 253)
- **What is happening**: The `Library.destroy()` method intentionally **does not reset the Jotai `libraryItemsAtom`** because the Jotai store is currently shared across all Excalidraw instances on the page. Clearing the atom would wipe the library for other mounted instances. The code to reset it is commented out with a TODO.
- **Where documented**: Only the `// TODO uncomment after/if we make jotai store scoped to each excal instance` comment.
- **Risks**: When multiple Excalidraw instances are mounted on the same page, destroying one instance does NOT clear its library items from the global Jotai atom. Items from the destroyed instance remain visible in surviving instances. An AI generating multi-instance embedding code must account for this shared-state lifetime.

---

## Undocumented Behavior #11

- **File**: `packages/element/src/elbowArrow.ts` (lines 995, 1059)
- **What is happening**: Elbow-arrow routing currently depends on `Scene.getScene()` — a **global scene registry** lookup by element ID. Two TODOs mark these call-sites as to-be-removed once the global registry is eliminated. Until then, elbow arrows can only be routed if the scene is registered globally.
- **Where documented**: Only the TODO comments: "Remove this once Scene.getScene() is removed."
- **Risks**: Any refactoring that removes `Scene.getScene()` before updating elbow-arrow routing will silently produce straight/broken arrows instead of properly routed elbow arrows.

---

## Undocumented Behavior #12

- **File**: `packages/excalidraw/components/App.tsx` (line 7126)
- **What is happening**: **Transform handles for linear elements on mobile are disabled** via a HACK guard. The condition checks `isMobileDevice` and suppresses the handles because no good UI for showing them on mobile has been designed yet. The handles work on desktop but silently disappear on touch screens.
- **Where documented**: Only the `// HACK: Disable transform handles for linear elements on mobile until a better way of showing them is found` comment.
- **Risks**: An AI adding new transform handle interactions for linear elements will need to know that mobile suppression is intentional and not a bug. Removing the HACK without a mobile UI replacement will expose unfinished handles.

---

## Undocumented Behavior #13

- **File**: `packages/element/src/frame.ts` (line 752)
- **What is happening**: `isElementInFrame()` is called on **every pointer move and re-render** to determine frame membership. The TODO notes this is "a huge bottleneck for large scenes." There is no memoization or incremental update—the full containment check runs every time.
- **Where documented**: Only the `// TODO: this a huge bottleneck for large scenes, optimise` comment.
- **Risks**: An AI that adds more call-sites to `isElementInFrame()` (e.g., for validation or rendering) will further degrade performance on large scenes. Performance profiling will show this function dominating pointer-move CPU time.

---

## Undocumented Behavior #14

- **File**: `packages/excalidraw/data/restore.ts` (line 408)
- **What is happening**: During restore, **empty text elements are soft-deleted** (`isDeleted: true`) when `opts.deleteInvisibleElements` is set. However, this deletion is done by mutating the element object directly—bypassing the Store's change-tracking. As a result, the deletion is **not recorded in undo/redo history** and not broadcast to collaborators.
- **Where documented**: Only the `// TODO: we should not do this since it breaks sync / versioning when we exchange / apply just deltas and restore the elements` comment.
- **Risks**: AI-generated sync or restore flows that expect all mutations to go through the Store will miss these silent deletions. Collaborators will see ghost elements that the local user cannot see.

---

## Undocumented Behavior #15

- **File**: `packages/element/src/positionElementsOnGrid.ts` (line 6)
- **What is happening**: The grid-positioning algorithm used to arrange AI-generated elements is **explicitly marked as "mostly vibe-coded"** (`// TODO rewrite (mostly vibe-coded)`). The logic handles edge cases empirically without formal geometric guarantees.
- **Where documented**: Only the TODO comment.
- **Risks**: Any AI agent that relies on `positionElementsOnGrid` for precise layout of generated elements may get subtly wrong positions for unusual inputs (non-square groups, single elements, nested arrays). The function's contract is not formally defined.

---

## Undocumented Behavior #16

- **File**: `packages/excalidraw/snapping.ts` (line 44)
- **What is happening**: The gap-snapping computation is bounded by `VISIBLE_GAPS_LIMIT_PER_AXIS = 99999`. The TODO says this limit should be "increased or removed once we optimize." The limit is a performance guard, not a correctness constraint.
- **Where documented**: Only the `// TODO increase or remove once we optimize` comment.
- **Risks**: On scenes with more than 99,999 elements along a single axis, snapping silently stops computing gap guides. An AI generating large auto-layouts may produce scenes where snapping is partially broken.

---

## Undocumented Behavior #17

- **File**: `packages/excalidraw/tests/history.test.tsx` (lines 2369, 3596, 3699)
- **What is happening**: **GroupId ordering after undo/redo is not preserved**. The history system does not post-process `groupIds` arrays, so repeated undo/redo sequences may produce groups with the same IDs in a different order—subtly different from the original. This is a known open issue (#7348).
- **Where documented**: Only `// TODO: #7348` comments in test files.
- **Risks**: An AI that generates elements with explicit group ordering and then allows undo/redo may produce reordered groups, breaking visual layering within groups.

---

## Undocumented Behavior #18

- **File**: `packages/excalidraw/tests/flip.test.tsx` (lines 479–613)
- **What is happening**: **Bounding boxes for curved elements (arcs/beziers) are incorrectly computed** when control points extend outside the element's min/max point envelope. The bounding box snaps to point extrema, not to the actual curve extrema. Multiple TODO comments in the flip tests mark this as a known wrong behavior.
- **Where documented**: Only `//TODO: elements with curve outside minMax points have a wrong bounding box!!!` comments in tests.
- **Risks**: An AI that relies on element bounding boxes for snapping, collision detection, or layout will get incorrect results for curved shapes. The bug affects flip, rotate, resize, and any operation that reads `getBoundingBox()`.

---

## Undocumented Behavior #19

- **File**: `packages/excalidraw/components/EyeDropper.tsx` (line 105)
- **What is happening**: The color-picker eye-dropper preview div is positioned at `clientX + 20, clientY + 20` without viewport-edge clamping. The FIXME says the offset should flip (to `clientX - 20, clientY - 20`) when the preview box would go outside the viewport, but this is not implemented.
- **Where documented**: Only the `// FIXME swap offset when the preview gets outside viewport` comment.
- **Risks**: Near the right and bottom edges of the viewport, the eye-dropper preview is partially clipped. An AI refactoring the eye-dropper positioning must implement the flip logic.

---

## Undocumented Behavior #20

- **File**: `packages/element/src/store.ts` (line 109)
- **What is happening**: `store.scheduleCapture()` is called from **many different places** throughout the codebase. The TODO comment says "Suspicious that this is called so many places. Seems error-prone." There is no single authority governing when a capture is scheduled—any code path that calls `scheduleCapture` outside a meaningful change will produce an unnecessary undo entry.
- **Where documented**: Only the `// TODO: Suspicious that this is called so many places. Seems error-prone.` comment.
- **Risks**: An AI adding a new action or mutation that calls `scheduleCapture` in the wrong lifecycle phase (e.g., during render or during undo itself) will pollute the undo stack with empty entries.
