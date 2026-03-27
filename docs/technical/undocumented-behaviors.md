# Undocumented Behaviors

A catalog of implicit assumptions, silent contracts, hidden state machines,
risky side effects, and known-broken areas discovered by searching for `HACK`,
`FIXME`, `TODO`, and `WORKAROUND` comments and reading the surrounding code.

---

## Undocumented Behavior #1

- **File**: `packages/element/src/mutateElement.ts` (line 34–35)
- **Symbol**: `mutateElement` (exported function, defined at line 37)
- **Permalink**: [view](https://github.com/ihpr/2026-fwdays-agentic-large-day01-hw/blob/487132d8b90bb8d1047c2c0431945ae4f1a3e9dd/packages/element/src/mutateElement.ts#L34-L37)
- **What is happening**: `mutateElement()` performs **in-place (direct)
  mutation** of an element object and does NOT trigger a React re-render.
  Callers must use `scene.mutateElement()` or
  `ExcalidrawImperativeAPI.mutateElement()` if they need the UI to update. The
  low-level `mutateElement` is an internal primitive that only bumps the
  element's `version` / `versionNonce` and invalidates the `ShapeCache`—nothing
  else.
- **Where documented**: Only in the JSDoc comment of the function itself
  (`WARNING: this won't trigger the component to update…`). Not in any
  architectural doc.

---

## Undocumented Behavior #2

- **File**: `packages/excalidraw/components/App.tsx` (lines ~960–1230)
- **Symbol**: `App` class — `AppState.bindMode` state field (type `BindMode`), toggled via `setState({ bindMode })` with `flushSync`
- **Permalink**: [view](https://github.com/ihpr/2026-fwdays-agentic-large-day01-hw/blob/487132d8b90bb8d1047c2c0431945ae4f1a3e9dd/packages/excalidraw/components/App.tsx#L960-L977)
- **What is happening**: `bindMode` is an **implicit three-state machine**
  (`"orbit"` → `"inside"` → `"skip"`) driven by pointer events and a
  `bindModeHandler` timeout. Transitions between states are forced synchronously
  via `flushSync()` to ensure React sees the right state before the next pointer
  event fires. This is a deliberate workaround for React's async batching.
- **Where documented**: Nowhere—no diagram, no comment explaining the full state
  flow or its invariants.

---

## Undocumented Behavior #3

- **File**: `packages/excalidraw/components/App.tsx` (line 689, field
  `lastPointerUpIsDoubleClick`)
- **Symbol**: `App.lastPointerUpIsDoubleClick` (instance field, line 693) and `App.shouldHandleBrowserCanvasDoubleClick` (private method, line 6324)
- **Permalink**: [field](https://github.com/ihpr/2026-fwdays-agentic-large-day01-hw/blob/487132d8b90bb8d1047c2c0431945ae4f1a3e9dd/packages/excalidraw/components/App.tsx#L689-L694) | [method](https://github.com/ihpr/2026-fwdays-agentic-large-day01-hw/blob/487132d8b90bb8d1047c2c0431945ae4f1a3e9dd/packages/excalidraw/components/App.tsx#L6324-L6328)
- **What is happening**: Double-click detection is **split across two systems**:
  native browser `dblclick` events are used for mouse, while a manual counter
  (`lastCompletedCanvasClicks`) is used for touch. The TODO comment calls this
  "a hack." The `shouldHandleBrowserCanvasDoubleClick()` helper (line 6324)
  decides which path to use by inspecting the raw event `type` string.
- **Where documented**: Only a TODO comment at line 689: "we should ideally
  unify touch and pointer events."

---

## Undocumented Behavior #4

- **File**: `packages/element/src/selection.ts` (lines 138–170)
- **Symbol**: `isSomeElementSelected` (exported IIFE-based memoized function with `ret.clearCache`)
- **Permalink**: [view](https://github.com/ihpr/2026-fwdays-agentic-large-day01-hw/blob/487132d8b90bb8d1047c2c0431945ae4f1a3e9dd/packages/element/src/selection.ts#L138-L172)
- **What is happening**: `isSomeElementSelected` is a **module-level memoized
  singleton** implemented as an IIFE closure. It stores `lastElements`,
  `lastSelectedElementIds`, and a `isSelected` result in the module closure—not
  in React state or a ref. The cache must be manually cleared via
  `ret.clearCache()`. The FIXME comment says it should be moved into the editor
  instance.
- **Where documented**: Only the
  `// FIXME move this into the editor instance to keep utility methods stateless`
  comment.

---

## Undocumented Behavior #5

- **File**: `packages/excalidraw/components/App.tsx` (line 5739, `flushSync`
  around `setState`)
- **Symbol**: `App.handleTextWysiwyg` (private method, line 5664) — `flushSync` inside `onSubmit` callback
- **Permalink**: [view](https://github.com/ihpr/2026-fwdays-agentic-large-day01-hw/blob/487132d8b90bb8d1047c2c0431945ae4f1a3e9dd/packages/excalidraw/components/App.tsx#L5737-L5749)
- **What is happening**: Before the `finalize` action is dispatched on
  keyboard-submit, the selection state is forcibly flushed synchronously via
  `flushSync`. This is required because the finalize action inspects
  `selectedElementIds` and must see the updated value. React normally batches
  this update until after the handler returns.
- **Where documented**: A partial TODO at line 5737: "either move this into
  finalize as well, or handle all state updates in one place."

---

## Undocumented Behavior #6

- **File**: `packages/excalidraw/wysiwyg/textWysiwyg.tsx` (line 964)
- **Symbol**: `unsubOnChange` — subscription via `app.onChangeEmitter.on()`, comparing `app.state.theme` against module-level `LAST_THEME`
- **Permalink**: [view](https://github.com/ihpr/2026-fwdays-agentic-large-day01-hw/blob/487132d8b90bb8d1047c2c0431945ae4f1a3e9dd/packages/excalidraw/wysiwyg/textWysiwyg.tsx#L964-L968)
- **What is happening**: Theme changes are detected inside the WYSIWYG text
  editor by subscribing to `app.onChangeEmitter` (which fires on every element
  change) and comparing `app.state.theme` against a module-level `LAST_THEME`
  variable. This is an explicit workaround because `Store` does not yet emit
  `appState.theme` changes as store increments.
- **Where documented**: Only the
  `// FIXME after we start emitting updates from Store for appState.theme`
  comment.

---

## Undocumented Behavior #7

- **File**: `packages/excalidraw/index.tsx` (lines 105–116)
- **Symbol**: `ExcalidrawBase` (function component, line 61) — local `UIOptions` constant rebuilt every render
- **Permalink**: [view](https://github.com/ihpr/2026-fwdays-agentic-large-day01-hw/blob/487132d8b90bb8d1047c2c0431945ae4f1a3e9dd/packages/excalidraw/index.tsx#L105-L116)
- **What is happening**: The `UIOptions` object passed to `<App />` is
  **reconstructed every render** inside the exported `<Excalidraw />` wrapper,
  defeating React.memo's shallow comparison. The FIXME says defaults should be
  normalized in the parent so the memo resolver compares the same reference.
- **Where documented**: Only the
  `// FIXME normalize/set defaults in parent component so that the memo resolver compares the same values`
  comment.

---

## Undocumented Behavior #8

- **File**: `packages/element/src/sizeHelpers.ts` (line 27)
- **Symbol**: `isInvisiblySmallElement` (exported function, line 30) and `actionFinalize.perform` (lines 142, 232 in `actionFinalize.tsx`)
- **Permalink**: [sizeHelpers](https://github.com/ihpr/2026-fwdays-agentic-large-day01-hw/blob/487132d8b90bb8d1047c2c0431945ae4f1a3e9dd/packages/element/src/sizeHelpers.ts#L27-L33) | [actionFinalize L142](https://github.com/ihpr/2026-fwdays-agentic-large-day01-hw/blob/487132d8b90bb8d1047c2c0431945ae4f1a3e9dd/packages/excalidraw/actions/actionFinalize.tsx#L139-L151) | [actionFinalize L232](https://github.com/ihpr/2026-fwdays-agentic-large-day01-hw/blob/487132d8b90bb8d1047c2c0431945ae4f1a3e9dd/packages/excalidraw/actions/actionFinalize.tsx#L229-L238)
- **What is happening**: "Invisibly small" elements (e.g., width/height < 0.1
  px) are **marked `isDeleted: true` in place** during the `finalize` action,
  but they are still recorded in the `Store` and therefore appear in undo/redo
  history. A user can undo and resurrect an invisible element they never
  intentionally created.
- **Where documented**: TODOs in
  `packages/excalidraw/actions/actionFinalize.tsx` (lines 142, 232) and
  `packages/element/src/sizeHelpers.ts` (line 27).

---

## Undocumented Behavior #9

- **File**: `packages/element/src/Scene.ts` (line 433)
- **Symbol**: `Scene.mutateElement` (public method, line 435)
- **Permalink**: [view](https://github.com/ihpr/2026-fwdays-agentic-large-day01-hw/blob/487132d8b90bb8d1047c2c0431945ae4f1a3e9dd/packages/element/src/Scene.ts#L433-L447)
- **What is happening**: `Scene.mutateElement()` requires the caller to be
  inside a **React event handler or `unstable_batchedUpdates()`**. If called
  from a `setTimeout`, `Promise` callback, or async flow outside React's
  synthetic event system, the mutation fires but React will re-render each
  mutation independently—causing performance degradation or visual glitches.
- **Where documented**: Only the inline comment: "Make sure you are calling it
  either from a React event handler or within unstable_batchedUpdates()."

---

## Undocumented Behavior #10

- **File**: `packages/excalidraw/data/library.ts` (line 253)
- **Symbol**: `Library.destroy` (method, line 249)
- **Permalink**: [view](https://github.com/ihpr/2026-fwdays-agentic-large-day01-hw/blob/487132d8b90bb8d1047c2c0431945ae4f1a3e9dd/packages/excalidraw/data/library.ts#L248-L259)
- **What is happening**: The `Library.destroy()` method intentionally **does not
  reset the Jotai `libraryItemsAtom`** because the Jotai store is currently
  shared across all Excalidraw instances on the page. Clearing the atom would
  wipe the library for other mounted instances. The code to reset it is
  commented out with a TODO.
- **Where documented**: Only the
  `// TODO uncomment after/if we make jotai store scoped to each excal instance`
  comment.

---

## Undocumented Behavior #11

- **File**: `packages/element/src/elbowArrow.ts` (lines 995, 1059)
- **Symbol**: `updateElbowArrowPoints` (exported function) — both TODO sites are inside this function
- **Permalink**: [L995](https://github.com/ihpr/2026-fwdays-agentic-large-day01-hw/blob/487132d8b90bb8d1047c2c0431945ae4f1a3e9dd/packages/element/src/elbowArrow.ts#L993-L1001) | [L1059](https://github.com/ihpr/2026-fwdays-agentic-large-day01-hw/blob/487132d8b90bb8d1047c2c0431945ae4f1a3e9dd/packages/element/src/elbowArrow.ts#L1057-L1061)
- **What is happening**: Elbow-arrow routing currently depends on
  `Scene.getScene()` — a **global scene registry** lookup by element ID. Two
  TODOs mark these call-sites as to-be-removed once the global registry is
  eliminated. Until then, elbow arrows can only be routed if the scene is
  registered globally.
- **Where documented**: Only the TODO comments: "Remove this once
  Scene.getScene() is removed."

---

## Undocumented Behavior #12

- **File**: `packages/excalidraw/components/App.tsx` (line 7126)
- **Symbol**: `App.handleCanvasPointerMove` (private method, line 6686) — HACK guard at line 7126
- **Permalink**: [view](https://github.com/ihpr/2026-fwdays-agentic-large-day01-hw/blob/487132d8b90bb8d1047c2c0431945ae4f1a3e9dd/packages/excalidraw/components/App.tsx#L7121-L7133)
- **What is happening**: **Transform handles for linear elements on mobile are
  disabled** via a HACK guard. The condition checks `isMobileDevice` and
  suppresses the handles because no good UI for showing them on mobile has been
  designed yet. The handles work on desktop but silently disappear on touch
  screens.
- **Where documented**: Only the
  `// HACK: Disable transform handles for linear elements on mobile until a better way of showing them is found`
  comment.

---

## Undocumented Behavior #13

- **File**: `packages/element/src/frame.ts` (line 752)
- **Symbol**: `isElementInFrame` (exported function, line 754)
- **Permalink**: [view](https://github.com/ihpr/2026-fwdays-agentic-large-day01-hw/blob/487132d8b90bb8d1047c2c0431945ae4f1a3e9dd/packages/element/src/frame.ts#L752-L762)
- **What is happening**: `isElementInFrame()` is called on **every pointer move
  and re-render** to determine frame membership. The TODO notes this is "a huge
  bottleneck for large scenes." There is no memoization or incremental
  update—the full containment check runs every time.
- **Where documented**: Only the
  `// TODO: this a huge bottleneck for large scenes, optimise` comment.

---

## Undocumented Behavior #14

- **File**: `packages/excalidraw/data/restore.ts` (line 408)
- **Symbol**: `restoreElement` (exported function, line 350) — `case "text":` branch at line 408
- **Permalink**: [view](https://github.com/ihpr/2026-fwdays-agentic-large-day01-hw/blob/487132d8b90bb8d1047c2c0431945ae4f1a3e9dd/packages/excalidraw/data/restore.ts#L405-L411)
- **What is happening**: During restore, **empty text elements are
  soft-deleted** (`isDeleted: true`) when `opts.deleteInvisibleElements` is set.
  However, this deletion is done by mutating the element object
  directly—bypassing the Store's change-tracking. As a result, the deletion is
  **not recorded in undo/redo history** and not broadcast to collaborators.
- **Where documented**: Only the
  `// TODO: we should not do this since it breaks sync / versioning when we exchange / apply just deltas and restore the elements`
  comment.

---

## Undocumented Behavior #15

- **File**: `packages/element/src/positionElementsOnGrid.ts` (line 6)
- **Symbol**: `positionElementsOnGrid` (exported function, line 7)
- **Permalink**: [view](https://github.com/ihpr/2026-fwdays-agentic-large-day01-hw/blob/487132d8b90bb8d1047c2c0431945ae4f1a3e9dd/packages/element/src/positionElementsOnGrid.ts#L6-L12)
- **What is happening**: The grid-positioning algorithm used to arrange
  AI-generated elements is **explicitly marked as "mostly vibe-coded"**
  (`// TODO rewrite (mostly vibe-coded)`). The logic handles edge cases
  empirically without formal geometric guarantees.
- **Where documented**: Only the TODO comment.

---

## Undocumented Behavior #16

- **File**: `packages/excalidraw/snapping.ts` (line 44)
- **Symbol**: `VISIBLE_GAPS_LIMIT_PER_AXIS` (module-level constant, line 45)
- **Permalink**: [view](https://github.com/ihpr/2026-fwdays-agentic-large-day01-hw/blob/487132d8b90bb8d1047c2c0431945ae4f1a3e9dd/packages/excalidraw/snapping.ts#L43-L45)
- **What is happening**: The gap-snapping computation is bounded by
  `VISIBLE_GAPS_LIMIT_PER_AXIS = 99999`. The TODO says this limit should be
  "increased or removed once we optimize." The limit is a performance guard, not
  a correctness constraint.
- **Where documented**: Only the `// TODO increase or remove once we optimize`
  comment.

---

## Undocumented Behavior #17

- **File**: `packages/excalidraw/tests/history.test.tsx` (lines 2369,
  3596, 3699)
- **Symbol**: TODO `#7348` comments between test cases — `groupIds` ordering not preserved after undo/redo
- **Permalink**: [L2369](https://github.com/ihpr/2026-fwdays-agentic-large-day01-hw/blob/487132d8b90bb8d1047c2c0431945ae4f1a3e9dd/packages/excalidraw/tests/history.test.tsx#L2369-L2372)
- **What is happening**: **GroupId ordering after undo/redo is not preserved**.
  The history system does not post-process `groupIds` arrays, so repeated
  undo/redo sequences may produce groups with the same IDs in a different
  order—subtly different from the original. This is a known open issue (#7348).
- **Where documented**: Only `// TODO: #7348` comments in test files.

---

## Undocumented Behavior #18

- **File**: `packages/excalidraw/tests/flip.test.tsx` (lines 479–613)
- **Symbol**: `it.skip` test cases in `describe("arrow")` and `describe("line")` — TODO comments about wrong bounding box for curved elements
- **Permalink**: [view](https://github.com/ihpr/2026-fwdays-agentic-large-day01-hw/blob/487132d8b90bb8d1047c2c0431945ae4f1a3e9dd/packages/excalidraw/tests/flip.test.tsx#L479-L613)
- **What is happening**: **Bounding boxes for curved elements (arcs/beziers) are
  incorrectly computed** when control points extend outside the element's
  min/max point envelope. The bounding box snaps to point extrema, not to the
  actual curve extrema. Multiple TODO comments in the flip tests mark this as a
  known wrong behavior.
- **Where documented**: Only
  `//TODO: elements with curve outside minMax points have a wrong bounding box!!!`
  comments in tests.

---

## Undocumented Behavior #19

- **File**: `packages/excalidraw/components/EyeDropper.tsx` (line 105)
- **Symbol**: `mouseMoveListener` (arrow function inside `EyeDropper` component's `useEffect`, line 96)
- **Permalink**: [view](https://github.com/ihpr/2026-fwdays-agentic-large-day01-hw/blob/487132d8b90bb8d1047c2c0431945ae4f1a3e9dd/packages/excalidraw/components/EyeDropper.tsx#L96-L111)
- **What is happening**: The color-picker eye-dropper preview div is positioned
  at `clientX + 20, clientY + 20` without viewport-edge clamping. The FIXME says
  the offset should flip (to `clientX - 20, clientY - 20`) when the preview box
  would go outside the viewport, but this is not implemented.
- **Where documented**: Only the
  `// FIXME swap offset when the preview gets outside viewport` comment.

---

## Undocumented Behavior #20

- **File**: `packages/element/src/store.ts` (line 109)
- **Symbol**: `Store.scheduleCapture` (public method, line 110)
- **Permalink**: [view](https://github.com/ihpr/2026-fwdays-agentic-large-day01-hw/blob/487132d8b90bb8d1047c2c0431945ae4f1a3e9dd/packages/element/src/store.ts#L106-L112)
- **What is happening**: `store.scheduleCapture()` is called from **many
  different places** throughout the codebase. The TODO comment says "Suspicious
  that this is called so many places. Seems error-prone." There is no single
  authority governing when a capture is scheduled—any code path that calls
  `scheduleCapture` outside a meaningful change will produce an unnecessary undo
  entry.
- **Where documented**: Only the
  `// TODO: Suspicious that this is called so many places. Seems error-prone.`
  comment.
