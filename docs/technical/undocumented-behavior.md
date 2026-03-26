# Undocumented Behavior

Findings from searching for `HACK`, `FIXME`, `WORKAROUND`, `flushSync`, StrictMode patterns, and implicit state machines in the codebase.

---

## HACK / FIXME / WORKAROUND Comments

### HACK — Linear element transform handles on mobile (App.tsx:7126)

```
// HACK: transform handles are disabled for 2-point linear elements on mobile
```

Transform handles are silently suppressed for linear elements with exactly two points when running on mobile (`isMobile` from `EditorInterface`). There is no explicit "no handles" mode in `AppState` — the condition is evaluated inside the render branch without surfacing it to the state machine.

**File**: `packages/excalidraw/components/App.tsx` line 7126

---

### FIXME — Bare marker on text container selection (App.tsx:8758)

```
// FIXME
```

A bare, unexplained `FIXME` on or near `getTextBindableContainerAtPosition`. No description of the expected vs. actual behavior. Likely marks a known edge case in how text elements bind to containers during pointer events.

**File**: `packages/excalidraw/components/App.tsx` line 8758

---

### FIXME — Theme detection via onChange instead of Store emitter (textWysiwyg.tsx:964)

```
// FIXME: theme changes are detected via onChangeEmitter watching elements
// rather than a dedicated Store theme emitter — pending Store refactor
```

The WYSIWYG text editor detects `theme` changes by subscribing to `onChangeEmitter` and filtering for element diffs, instead of having a purpose-built theme-change event. This is a known design gap left over before a planned Store refactor.

**File**: `packages/excalidraw/wysiwyg/textWysiwyg.tsx` line 964

---

### FIXME — UIOptions normalization in wrong place (index.tsx:105)

```
// FIXME: UIOptions normalization should happen in the parent component for
// correct React.memo comparison
```

`UIOptions` is normalized inside the `Excalidraw` component, which defeats the `React.memo` shallow-equality check — a new normalized object is created on every render. The fix requires moving normalization outside to the host app.

**File**: `packages/excalidraw/index.tsx` line 105

---

### FIXME — `isSomeElementSelected` uses module-level closure state (selection.ts)

`isSomeElementSelected` holds memoization state at module scope rather than as instance state on `Scene`. This means the memo is shared across all `Scene` instances on the page, which breaks multiple-editor setups.

**File**: `packages/element/src/selection.ts`

---

### FIXME — Frame detection in tests (frame.test.tsx)

```
// FIXME: frame element detection works in browser, fails in tests
// (╯°□°)╯︵ ┻━┻
```

The root cause is unknown — the failure is reproduced consistently in the Vitest/jsdom environment but not in a real browser. The test is marked as known-broken with no explanation of what diverges.

**File**: `packages/excalidraw/tests/frame.test.tsx`

---

### FIXME — Arrow label version bump is flaky (textWysiwyg.test.tsx:335)

```
// FIXME: too flaky. No one knows why.
```

A test verifying that the arrow element's `version` is bumped when its label text changes fails non-deterministically. No root cause has been identified; it is left in the suite with a comment acknowledging the mystery.

**File**: `packages/excalidraw/tests/textWysiwyg.test.tsx` line 335

---

## flushSync — Bypassing React 18 Automatic Batching

`flushSync` forces a synchronous re-render, bypassing React 18's automatic batching. It is used in 14 places in `App.tsx`, 2 places in `ConfirmDialog.tsx`, and 1 place in `UnlockPopup.tsx`.

**Confirmed call sites in `App.tsx`** (lines): 974, 1090, 1220, 5081, 5362, 5739, 5762, 6852, 9000, 9020, 9219, 9630, 9755, 10047.

**Confirmed call sites in `ConfirmDialog.tsx`** (lines): 53, 69.

**Confirmed call sites in `UnlockPopup.tsx`** (lines): 52.

**Why it's needed**: Several flows require the DOM to reflect updated state *before* the current JS call stack continues — for example, committing text edits before the text element is finalized, or ensuring focus is correct before processing a keyboard event.

**Notable case — Chromium 131 crash workaround** (`ConfirmDialog.tsx`):

```ts
// flushSync used to prevent Chromium 131 crash: focusing an element during
// a React DOM transition causes the browser to crash without it
flushSync(() => { ... })
```

This is a browser bug workaround, not a React design choice.

---

## React StrictMode Workarounds

### API object re-created in `componentDidMount`

In React StrictMode, `componentDidMount` is called, then `componentWillUnmount` (which stubs all `api.*` methods to throw), then `componentDidMount` again. To survive this, `App` re-creates the full `ExcalidrawImperativeAPI` object in `componentDidMount` rather than in the constructor.

**File**: `packages/excalidraw/components/App.tsx` — `componentDidMount`

---

### LibraryMenu tracks versions in a separate effect

`LibraryMenu` uses a separate `useEffect` to track the library version number so that StrictMode's double-invocation of effects does not overwrite the version with an older snapshot.

**File**: `packages/excalidraw/components/LibraryMenu.tsx`

---

## `unmounted` Flag — Guard Against Post-Unmount State Updates

`App` sets an `unmounted` boolean in `componentWillUnmount`. This flag is checked inside:

- `syncActionResult` — prevents `setState` after the component is gone
- Debounced/async callbacks — prevents stale closures from mutating scene state

Without this guard, async operations initiated before unmount (e.g., file loading, collaboration socket events) would call `setState` on a dead component, producing a React warning and potentially corrupting the next mount's state.

**File**: `packages/excalidraw/components/App.tsx` — `syncActionResult` and debounced handlers

---

## Initialization Order Dependencies

### `initializeScene` must run after `componentDidMount` wiring

`componentDidMount` wires up:
1. `store.onDurableIncrementEmitter → history.record()`
2. `scene.onUpdate(triggerRender)`
3. Event listeners

Only then does it call `initializeScene()`, which may synchronously or asynchronously call `scene.replaceAllElements` and `setState`. If wiring happened after `initializeScene`, the first batch of elements would arrive with no renderer callback registered and no history listener — elements would be invisible and undo would be broken.

---

### `onChange` gated on `!isLoading`

`componentDidUpdate` only fires `props.onChange(elements, appState, files)` when `!state.isLoading`. This prevents overwriting localStorage with an empty scene during the initialization window when the tab is not focused and React defers updates.

**File**: `packages/excalidraw/components/App.tsx` — `componentDidUpdate`

---

### `store.commit` called unconditionally every `componentDidUpdate`

`store.commit(elementsMap, appState)` is called at the **end** of every `componentDidUpdate` (line 3509), regardless of whether elements or appState changed. The Store performs its own diffing internally. Calling it earlier in `componentDidUpdate` would record partial state; calling it in the action handlers would miss mutations that happen outside the action system.

---

## Implicit State Machines

### Text editing lifecycle (AppState fields)

Text editing is not a single boolean — it is encoded across multiple AppState fields:

| Field | Set when |
|-------|----------|
| `editingTextElement` | WYSIWYG editor is open |
| `newElementId` | In-progress freedraw/arrow/line being drawn |
| `croppingElementId` | Image crop mode active |
| `editingGroupId` | Double-clicked into a group |
| `selectedLinearElement` | Linear element selected with sub-handle editing |

Transitions between these states have no explicit state machine. Each action handler checks combinations of these fields to determine legal operations.

---

### Tool activation is a discriminated union, not an enum

`ActiveTool` is a TypeScript discriminated union, not a simple string. Some tool types (`image`, `text`) carry extra payload (`customType`, `locked`). Code that checks `activeTool.type === "selection"` is implicitly testing a state transition guard.

**File**: `packages/excalidraw/types.ts` — `ActiveTool`

---

## Magic Numbers

### Hit-testing threshold 0.85 / 0.63 (App.tsx)

A comment near hit-testing logic notes that floating-point precision degrades below a zoom-adjusted threshold of approximately `0.63` — below this value, hit detection for thin lines and small elements becomes unreliable. The threshold `0.85` is used as a conservative safety margin. Neither value is named in `constants.ts`.

**File**: `packages/excalidraw/components/App.tsx` — exact line not pinpointed; search for `0.85` or `0.63` to find the hit-test threshold code.

---

## Non-obvious Side Effects

### `mutateElement` invalidates ShapeCache

Calling `mutateElement(element, elementsMap, updates)` calls `ShapeCache.delete(element)` only when `updates` contains at least one of `height`, `width`, `fileId`, or `points` — and only if any value actually changed (i.e. `didChange` is true at `mutateElement.ts:126`). Fields `x`, `y`, `angle`, and `scale` do **not** trigger `ShapeCache.delete`. This is a hidden side effect — callers that mutate shape geometry (height, width, points) without going through `mutateElement` will render stale RoughJS shapes.

**Exact condition** (`packages/element/src/mutateElement.ts:130–136`):
```ts
if (
  typeof updates.height !== "undefined" ||
  typeof updates.width  !== "undefined" ||
  typeof fileId         != "undefined"  ||
  typeof points         !== "undefined"
) {
  ShapeCache.delete(element);
}
```

**File**: `packages/element/src/mutateElement.ts`

---

### `scene.replaceAllElements` regenerates `sceneNonce`

Every call to `replaceAllElements` generates a new random `sceneNonce`. This invalidates the memoized result of `Renderer.getRenderableElements`. Callers that call `replaceAllElements` with an unchanged array still force a full viewport filter pass.

**File**: `packages/element/src/Scene.ts`

---

### Element `seed` field controls RoughJS determinism

Each element has a `seed: number` field (set at creation via `randomInteger()`). RoughJS uses this seed to generate the same hand-drawn strokes on every render. Cloning an element without copying `seed` produces a different visual appearance, even with identical geometry.

**File**: `packages/element/src/types.ts` — `_ExcalidrawElementBase.seed`
