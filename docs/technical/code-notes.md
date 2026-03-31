# Code Notes — Undocumented Behaviors, Side Effects & Technical Debt

## Summary
- Catalog of non-obvious behaviors, side effects, and technical-debt markers in source code.
- Intended as a risk register for maintainers and reviewers.

## Current State

This document catalogs non-obvious behaviors, implicit state machines, initialization
order dependencies, side effects, and acknowledged technical debt found in the source
code. Every entry cites the file and line(s) where evidence was found. Inference (not
directly stated in source) is labeled **[inference]**.

### 1. Implicit State Machines

### 1.1 Socket "initialized" gate in Portal

**File:** `excalidraw-app/collab/Portal.tsx` (lines 28, 72–73, 78)  
**File:** `excalidraw-app/collab/Collab.tsx` (lines 747, 750)

`Portal` has a boolean field `socketInitialized: boolean = false` with this inline
comment:

```ts
socketInitialized: boolean = false; // we don't want the socket to emit any updates until it is fully initialized
```

`isOpen()` (which all broadcast paths pass through) requires all four conditions to be
true simultaneously:

```ts
isOpen() {
  return !!(
    this.socketInitialized &&
    this.socket &&
    this.roomId &&
    this.roomKey
  );
}
```

`socketInitialized` is **never set to `true` inside `Portal`** — it is set externally
by `Collab.tsx` after the initial scene fetch resolves (or fails), inside a `finally`
block, so it always transitions even on error. The field is reset to `false` in
`Portal.close()`.

**Why it is non-obvious:** The flag is a public mutable field on `Portal` set by an
unrelated class (`Collab`). There is no state enum, no setter, and no documentation
explaining that callers must set it before broadcasts are unblocked. If `Collab`'s
initialization path changes, broadcasts could silently be dropped or prematurely
enabled.

**Classification:** Intentional (the comment acknowledges the intent), but fragile (no
encapsulation).

---

### 1.2 `preferredSelectionTool.initialized` bootstrap flag

**File:** `packages/excalidraw/components/App.tsx` (lines 2917–2927)  
**File:** `packages/excalidraw/types.ts` (lines 342–345)

`AppState` has:

```ts
preferredSelectionTool: {
  type: "selection" | "lasso";
  initialized: boolean;
};
```

On first load, `App` checks `restoredAppState.preferredSelectionTool.initialized`. If
`false`, it overrides the tool type based on the detected form factor:

```ts
if (!restoredAppState.preferredSelectionTool.initialized) {
  restoredAppState.preferredSelectionTool = {
    type: this.editorInterface.formFactor === "phone" ? "lasso" : "selection",
    initialized: true,
  };
}
```

**Why it is non-obvious:** `initialized: false` is a sentinel value inside a
persisted `AppState` field. The boolean persists across sessions, meaning that once
initialized, re-loading the editor on a different device class will not re-detect the
form factor. The field is also silently discarded and reset to `"selection" / "lasso"`
when a saved scene is restored with `initialized: false`, which can happen when loading
an older file format or from a fresh `restoreAppState()` call.

**Classification:** Intentional device-detection pattern, but the boolean in a
persisted field creates a hidden one-time-initialization dependency.

---

### 1.3 `CaptureUpdateAction` precedence state machine in `Store`

**File:** `packages/element/src/store.ts` (lines 369–399)

The `Store` maintains a `scheduledMacroActions: Set<CaptureUpdateActionType>`. Multiple
callers can call `scheduleAction()` independently within a single render cycle.
`getScheduledMacroAction()` resolves priority with a fixed hierarchy:

```text
IMMEDIATELY > NEVER > EVENTUALLY (default)
```

`IMMEDIATELY` always wins; a single `NEVER` from a remote update overrides
`EVENTUALLY`. The snapshot is updated for `IMMEDIATELY` and `NEVER` but **not** for
`EVENTUALLY`, meaning `EVENTUALLY` updates accumulate in the diff and are included in
the next `IMMEDIATELY` snapshot. This is documented in the `CaptureUpdateAction` enum
JSDoc (lines 37–65 of store.ts).

**Why it is non-obvious:** Multiple independent callers scheduling different action
types in the same frame means the effective capture type is determined by implicit
priority, not call order. A remote update (NEVER) mixed with a local ephemeral drag
(EVENTUALLY) will cause NEVER to win, suppressing even the ephemeral increment from
reaching History.

**Classification:** Intentional (documented in enum), but the interaction between
concurrent schedulers is not surfaced in the call sites.

---

### 1.4 Module-level interaction state shared across all `App` instances

**File:** `packages/excalidraw/components/App.tsx` (lines 586–595)

At the top of `App.tsx`, outside any class, multiple interaction state variables are
declared as module-level `let` bindings:

```ts
let isHoldingSpace: boolean = false;
let isPanning: boolean = false;
let isDraggingScrollBar: boolean = false;
let currentScrollBars: ScrollBars = { horizontal: null, vertical: null };
let touchTimeout = 0;
let invalidateContextMenu = false;
let didTapTwice: boolean = false;
let tappedTwiceTimer = 0;
let firstTapPosition: { x: number; y: number } | null = null;
```

These are not instance variables; they are shared across every `App` instance in the
same JS module.

**Why it is non-obvious:** If multiple `<Excalidraw>` editors are mounted on the same
page, they share this mutable state. A `keydown` space in one editor sets
`isHoldingSpace = true` globally, which affects cursor logic in every other editor on
the same page. The comment at line 590 is `// FIXME` in spirit [inference — there is no
explicit comment, but the pattern is widely known to be incorrect for multi-instance
scenarios].

**Classification:** Fragile. Known issue pattern in multi-instance embedding.

### 2. Initialization Order Dependencies

### 2.1 `History` is instantiated twice in the constructor

**File:** `packages/excalidraw/components/App.tsx` (lines 833 and 841)

```ts
this.store = new Store(this);
this.history = new History(this.store);   // ← line 833

this.excalidrawContainerValue = { ... };

this.fonts = new Fonts(this.scene);
this.history = new History(this.store);   // ← line 841 — overwrites previous
```

The first `History` (line 833) subscribes to `Store.onDurableIncrementEmitter`. It is
then immediately replaced by a second `History` (line 841). The first instance is
orphaned — it holds a live subscription to the Store emitter that was created for
nothing. The second instance's subscription is the one actually used.

**Why it is non-obvious:** The orphaned `History` never has `destroy()` called on it.
If `History`'s constructor subscribes to an emitter without returning an unsubscribe
handle (which is the case here — `History` registers via `on()`), the orphaned
subscriber leaks.

**Classification:** Apparent bug / oversight. There is no comment explaining the
double instantiation.

---

### 2.2 `ActionManager` is constructed before `Scene`

**File:** `packages/excalidraw/components/App.tsx` (lines 819–825)

```ts
this.actionManager = new ActionManager(
  this.syncActionResult,
  () => this.state,
  () => this.scene.getElementsIncludingDeleted(),  // ← closure over this.scene
  this,
);
this.scene = new Scene();   // ← this.scene assigned AFTER ActionManager is created
```

`ActionManager` captures `this.scene` in a lambda: `() => this.scene.getElementsIncludingDeleted()`.
Because it is a closure (not an immediate dereference), the reference is resolved
lazily and this works. However, if any code invoked during the `ActionManager`
constructor called `getElementsIncludingDeleted` eagerly, `this.scene` would be
`undefined` at that point.

**Why it is non-obvious:** The correctness depends on the lambda being lazy. If
`ActionManager`'s constructor were changed to call the getter during initialization,
this would become a null-dereference crash.

**Classification:** Fragile but currently correct. No comment explains the dependency.

---

### 2.3 `componentWillUnmount` replaces `Scene` and `Renderer` on unmount (StrictMode artifact)

**File:** `packages/excalidraw/components/App.tsx` (lines 3178–3196)

In `componentWillUnmount`:

```ts
this.scene = new Scene();
this.fonts = new Fonts(this.scene);
this.renderer = new Renderer(this.scene);
```

A fresh `Scene` and `Renderer` are created during unmount. The constructor comment
(lines 847–852) explains this is intentional for React StrictMode:

```text
// in case internal editor APIs call this early, otherwise we need
// to construct this in componentDidMount because componentWillUnmount
// will invalidate it (so in StrictMode, doing this in constructor alone
// would be a problem)
this.api = this.createExcalidrawAPI();
```

**Why it is non-obvious:** `componentWillUnmount` creating new live objects (instead
of only destroying them) is counter-intuitive. In StrictMode, React mounts → unmounts
→ remounts, so the re-created `Scene` is picked up by the subsequent `componentDidMount`.
Any code that holds a reference to the old `Scene` after unmount will reference a
stale (freshly constructed, empty) object.

**Classification:** Intentional React StrictMode accommodation, but undocumented at
the unmount call site.

---

### 2.4 `unmounted` flag reset order in `componentDidMount`

**File:** `packages/excalidraw/components/App.tsx` (lines 3058–3059)

```ts
public async componentDidMount() {
  this.unmounted = false;
  this.api = this.createExcalidrawAPI();
```

`syncActionResult` short-circuits on `this.unmounted === true`:

```ts
public syncActionResult = withBatchedUpdates((actionResult) => {
  if (this.unmounted || actionResult === false) { return; }
```

`this.unmounted` starts as `false` (class field at line 622), is set to `true` in
`componentWillUnmount`, and reset back to `false` at the top of `componentDidMount`.
If the async `componentDidMount` body schedules work before `this.unmounted` is reset,
that work would incorrectly be allowed to proceed.

**Why it is non-obvious:** The `async componentDidMount` body contains awaited calls
after line 3059. If any of those awaited promises resolve after the component is
unmounted again (React StrictMode double-mount), the `this.unmounted` flag may have
been reset to `false` by the second mount before the first mount's async work
completes.

**Classification:** Latent race condition in StrictMode; the `this.unmounted` guard is
also checked in async continuations in some places but not all.

### 3. Non-obvious Side Effects

### 3.1 `syncActionResult` unconditionally forces `contextMenu: null`

**File:** `packages/excalidraw/components/App.tsx` (lines 2797–2800)

Every call to `syncActionResult` that includes an `appState` result will force:

```ts
// NOTE this will prevent opening context menu using an action
// or programmatically from the host, so it will need to be rewritten later
contextMenu: null,
```

This means **no action can open a context menu** via `ActionResult`. The NOTE comment
explicitly calls this out as a known limitation requiring a future rewrite. An embedder
calling `updateScene()` (which routes through `syncActionResult`) will also find the
context menu dismissed.

**Classification:** Acknowledged technical debt with a NOTE comment. Temporary.

---

### 3.2 `mutateElement()` called directly to bypass history and multiplayer

**File:** `packages/excalidraw/components/App.tsx` (lines 11376, 11386, 11401, 11412)

In the binding cleanup path (unlinking bound text from deleted elements), raw
`mutateElement()` is called with explicit comments:

```ts
// NOTE: We use the raw mutateElement() because we don't want history
// entries or multiplayer updates
```

`mutateElement()` modifies the element object in-place without going through
`Store.scheduleAction`, so these mutations are invisible to History (no undo entry)
and are not broadcast to collaborators.

**Why it is non-obvious:** The side effect is that binding cleanup after element
deletion is a non-undoable, non-collaborative mutation. If the referenced binding
target is visible in another collaborator's session, their copy will not see the
unlink until the next full scene sync.

**Classification:** Intentional (commented), but the behavior is invisible to
collaborators.

---

### 3.3 `textWysiwyg` injects a `<textarea>` directly into `document.body`

**File:** `packages/excalidraw/wysiwyg/textWysiwyg.tsx` (line 426)

When text editing begins, a `<textarea>` is created imperatively and appended to
`document.body` (not to the editor's container):

```ts
const editable = document.createElement("textarea");
```

The element is styled with `position: absolute` and `zIndex: var(--zIndex-wysiwyg)`.

**Why it is non-obvious:** The textarea lives outside the React component tree and
outside the editor container. This means:
- Shadow DOM / iframe isolation breaks because the element escapes the editor boundary.
- CSS variables must be defined on `:root` or propagated to `document.body` to
  apply correctly.
- The element is not cleaned up by React unmounting — cleanup requires the
  explicit `textWysiwyg.destroy()` call from `App`.

**Classification:** Intentional (required for `contenteditable` z-index layering over
canvas), but undocumented for embedders.

---

### 3.4 Caret-position measurement injects a hidden `<div>` mirror into `document.body`

**File:** `packages/excalidraw/wysiwyg/textWysiwyg.tsx` (lines 140, 160, 178)

To compute per-character caret positions for canvas-aligned text rendering, a
temporary `<div>` is appended to `document.body`:

```ts
const mirror = document.createElement("div");
// ... styled with position: fixed, opacity: 0, pointerEvents: none ...
document.body.append(mirror);
try {
  // getBoundingClientRect() calls on ranges inside mirror
} finally {
  mirror.remove();
}
```

**Why it is non-obvious:** If an exception is thrown inside the `try` block that is
not caught, `mirror.remove()` in the `finally` block will still execute. However,
`return null` in the outer `catch` means the hidden div is cleaned up even on
error. The real risk is the synchronous layout reflow forced by `getBoundingClientRect`
during text editing.

**Classification:** Intentional measurement technique with proper cleanup, but the
document-body DOM side-effect is invisible to the React component tree.

---

### 3.5 Theme changes for the WYSIWYG editor are observed via `onChangeEmitter`, not Store

**File:** `packages/excalidraw/wysiwyg/textWysiwyg.tsx` (lines 964–969)

```ts
// FIXME after we start emitting updates from Store for appState.theme
const unsubOnChange = app.onChangeEmitter.on((elements) => {
  if (app.state.theme !== LAST_THEME) {
    updateWysiwygStyle();
  }
});
```

Theme changes are not yet emitted through the `Store` increment pipeline. Instead,
`textWysiwyg` taps `App.onChangeEmitter` directly to detect theme changes and
re-style the textarea. The FIXME comment acknowledges that this is a temporary
workaround until `Store` emits `appState.theme` changes.

**Classification:** Acknowledged temporary workaround (FIXME).

---

### 3.6 `ShapeCache` and `SnapCache` are module-level singletons, not instance-scoped

**File:** `packages/element/src/shape.ts` (lines 81–115)  
**File:** `packages/excalidraw/snapping.ts` (lines 122–154)

Both `ShapeCache` and `SnapCache` are classes with only `static` members — they are
effectively module-level singletons with no instance affinity:

```ts
export class ShapeCache {
  private static rg = new RoughGenerator();
  private static cache = new WeakMap<ExcalidrawElement, ...>();
  // ...
}
```

`App.componentWillUnmount` calls `ShapeCache.destroy()` and `SnapCache.destroy()` to
reset them. This means:

- If two `<Excalidraw>` instances are mounted simultaneously, they share a single shape
  cache. One instance's unmount will destroy cached shapes for the still-mounted
  instance.
- `ShapeCache` uses a `WeakMap` keyed on element identity, so stale entries are GC'd
  naturally when elements are replaced; the risk is only at unmount time.

**Classification:** Known multi-instance limitation; `SnapCache.destroy()` at unmount
is an active hazard for concurrent editor instances.

---

### 3.7 `isSomeElementSelected` is a module-level memoized function with manual cache

**File:** `packages/element/src/selection.ts` (lines 138–172)

```ts
// FIXME move this into the editor instance to keep utility methods stateless
export const isSomeElementSelected = (function () {
  let lastElements: readonly NonDeletedExcalidrawElement[] | null = null;
  let lastSelectedElementIds: AppState["selectedElementIds"] | null = null;
  let isSelected: boolean | null = null;

  const ret = (...): boolean => {
    if (isSelected != null && elements === lastElements && ...) {
      return isSelected; // cached
    }
    // recompute
  };
  ret.clearCache = () => { lastElements = null; ... };
  return ret;
})();
```

The FIXME comment explicitly states this should be moved into the editor instance.
The memoization is keyed on reference equality (`elements === lastElements`), so it
is only correct while elements are never mutated in-place with the same reference.

**Why it is non-obvious:** Because this is a singleton (module-level closure), all
`App` instances share the same cache. A selection change in one instance will
invalidate the cache used by all other instances on the next render.

**Classification:** Acknowledged technical debt (FIXME). Fragile for multi-instance.

### 4. HACK / FIXME Markers Summary

| Marker | File | Line | Summary |
|---|---|---|---|
| `HACK` | `packages/excalidraw/components/App.tsx` | 7126 | Transform handles disabled for linear elements on mobile — no proper mobile UX yet |
| `FIXME` | `packages/excalidraw/components/App.tsx` | 8758 | `getTextBindableContainerAtPosition` call has no explanation for why it exists at that point in the double-click text flow |
| `FIXME` | `packages/excalidraw/index.tsx` | 105 | `UIOptions` defaults merged in child instead of parent; memo comparison sees different object shapes each render |
| `FIXME` | `packages/excalidraw/wysiwyg/textWysiwyg.tsx` | 964 | Theme change detection via `onChangeEmitter` instead of `Store` (temporary) |
| `FIXME` | `packages/element/src/selection.ts` | 138 | `isSomeElementSelected` is a stateful module-level singleton; should be editor-instance-scoped |
| `FIXME` | `packages/common/src/colors.ts` | 116 | `pick` utility cannot be moved to `utils.ts` due to a circular dependency between `@excalidraw/common` submodules |
| `FIXME` | `packages/excalidraw/components/LayerUI.tsx` | 111, 113 | `canvasActions.export` and `canvasActions.saveAsImage` checks duplicated in parent instead of inside menu items |
| `FIXME` | `packages/excalidraw/actions/actionCanvas.tsx` | 73 | An action registered in the wrong file; should live in `DefaultItems.tsx` |
| `NOTE (hacky)` | `packages/excalidraw/components/App.tsx` | 10007 | Duplicate element `frameId` is reset to the original's `frameId` during drag-to-duplicate; acknowledged as a "hacky solution" |

### 5. Verified Behavioral Constraints

These are non-obvious constraints found in source comments that affect callers.

### 5.1 `addFiles` does not update already-present files

**File:** `packages/excalidraw/components/App.tsx` (lines 4480–4487)

```ts
/**
 * adds supplied files to existing files in the appState.
 * NOTE if file already exists in editor state, the file data is not updated
 */
```

Calling `excalidrawAPI.addFiles()` with a file whose `FileId` is already registered
is a silent no-op for that file. The caller must delete and re-add to force an update.

---

### 5.2 `wheel`, `touchstart`, `touchend` must be non-passive

**File:** `packages/excalidraw/components/App.tsx` (lines 11754–11769)

```ts
// NOTE wheel, touchstart, touchend events must be registered outside
// of react because react binds them passively (so we can't prevent
// default on them)
```

React 17+ registers `wheel`, `touchstart`, and `touchend` as passive listeners on the
root. The editor needs `preventDefault()` on these (to block scroll/zoom-interfering
browser defaults). The events are therefore registered imperatively via the canvas
`ref` callback (`handleInteractiveCanvasRef`) using `{ passive: false }`.

---

### 5.3 Floating-point hit-test threshold is calibrated at 0.63×

**File:** `packages/excalidraw/components/App.tsx` (lines 6043–6047)

```ts
// NOTE: Here be dragons. Do not go under the 0.63 multiplier unless you're
// willing to test extensively. The hit testing starts to become unreliable
// due to FP imprecision under 0.63 in high zoom levels.
0.85 * (DEFAULT_COLLISION_THRESHOLD / this.state.zoom.value),
```

The element hit threshold formula has an empirically calibrated lower bound for
floating-point precision reasons. Reducing it without extensive manual testing at high
zoom levels risks false negatives in hit detection.

---

### 5.4 Remote elements must be restored _before_ reconciliation

**File:** `excalidraw-app/collab/Collab.tsx` (lines 762–765)

```ts
// NOTE ideally we restore _after_ reconciliation but we can't do that
// as we'd regenerate even elements such as appState.newElement which would
// break the state
remoteElements = restoreElements(remoteElements, existingElements);
```

`restoreElements` normalizes schema differences. Running it after reconciliation would
regenerate element objects (including `appState.newElement`), breaking in-progress
drawing state. The ordering constraint is undocumented outside this comment.

---

### 5.5 `flushSync` required for bind-mode state visibility

**File:** `packages/excalidraw/components/App.tsx` (lines 9216–9222)

```ts
// NOTE: We need the flushSync here for the
// delayed bind mode change to see the right state
// (specifically the `newElement`)
flushSync(() => {
  this.setState(...);
});
```

React's normal batching would defer the state update, causing the subsequent
bind-mode evaluation to read a stale `newElement`. `flushSync` forces a synchronous
render at that point. This is a deliberate escape hatch from React's scheduler and
must not be removed without verifying that bind mode still reads the correct
`newElement` reference.

## Actions
- Keep this file scoped to high-signal, non-obvious behaviors and maintenance risks.
- Re-verify cited constraints after major edits to `App.tsx`, `Store`, collaboration, or WYSIWYG flows.

## Source Checkpoints
- `packages/excalidraw/components/App.tsx`
- `packages/excalidraw/index.tsx`
- `packages/excalidraw/wysiwyg/textWysiwyg.tsx`
- `packages/element/src/store.ts`
- `packages/element/src/selection.ts`
- `packages/element/src/shape.ts`
- `packages/excalidraw/snapping.ts`
- `excalidraw-app/collab/Portal.tsx`
- `excalidraw-app/collab/Collab.tsx`

## Related Documentation
- [`./architecture.md`](./architecture.md)
- [`./dev-setup.md`](./dev-setup.md)
- [`../memory/systemPatterns.md`](../memory/systemPatterns.md)