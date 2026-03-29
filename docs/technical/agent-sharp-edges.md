# Sharp edges for agents and refactors

This document records **non-obvious invariants**, **implicit state transitions**, and **comment-flagged debt** (`TODO`, `FIXME`, `HACK`) that are easy to violate when optimizing or restructuring code. It complements [`architecture.md`](./architecture.md), which describes the happy-path data flow; here the focus is on what breaks if those paths are “simplified.”

Statements below are tied to the current TypeScript sources in this workspace.

---

## Scene updates and full `App` render

**What happens:** `Scene.triggerUpdate()` bumps `sceneNonce` and invokes all `onUpdate` callbacks. In `App.componentDidMount`, the editor registers `this.scene.onUpdate(this.triggerRender)`. For the common case, `triggerRender` calls `this.setState({})`—an **empty** React state update—so React still runs a full reconciliation and `App.render` runs. Render passes `sceneNonce` into `this.renderer.getRenderableElements(...)`, which drives cache invalidation for visible elements and canvas props.

**Why it matters:** Skipping React updates when “no AppState field changed,” or bypassing `triggerUpdate` while mutating elements, can leave **stale memoized visibility** or break ordering with `componentDidUpdate`’s `store.commit` and `onChange`.

**Documented elsewhere:** The subscription and high-level sequence appear in [`architecture.md`](./architecture.md) (sections on scene mutation and React render). The implementation detail that the mechanism is **`setState({})`** is called out here because it is easy to misread as redundant.

**Primary references:** `packages/excalidraw/components/App.tsx` (`triggerRender`, `componentDidMount`), `packages/element/src/Scene.ts` (`triggerUpdate`, `sceneNonce`).

---

## `componentDidUpdate` ordering and side effects

**What happens (actual order):**

1. **`_initialized` gate (first).** If `!this._initialized && !this.state.isLoading`, the code sets `this._initialized = true`, emits `editor:initialize` on `editorLifecycleEvents`, and calls `this.props.onInitialize?.(this.api)`. This is a **one-way implicit state machine** (`false` → `true`, not reset in normal lifecycle). The comment directly above this block in `App.tsx` says it **must** be updated *before* “state change listeners are triggered below”—i.e. before step 2.

2. **`this.appStateObserver.flush(prevState)`.** That method (`packages/excalidraw/components/AppStateObserver.ts`) is what **fires `onStateChange` subscribers**: it walks registered listeners and invokes callbacks when `predicate(currentState, prevState)` holds. It runs immediately after the `_initialized` gate and before the rest of the method’s branching.

3. **Near the end:** `this.store.commit(elementsMap, this.state)`, then `onChange` / `onChangeEmitter` **only when** `!this.state.isLoading` (avoids clobbering persistence when the tab is unfocused during init, per inline comment).

**Additional implicit transitions:** When `selectedLinearElement?.isEditing` is true but the element is no longer selected, a **`setTimeout`** schedules `actionFinalize` so capture flags are not reset incorrectly—another ordering-sensitive path.

**Why it matters:** Running `flush` before `_initialized` / `onInitialize` can notify **`onStateChange`** consumers before the editor has emitted **`editor:initialize`** or flipped the flag. Reordering `flush`, `commit`, or `onChange`, or calling `onChange` while loading, can break **history**, **observers**, or **local persistence**.

**Primary references:** `packages/excalidraw/components/App.tsx` (`componentDidUpdate`, `_initialized`), `packages/excalidraw/components/AppStateObserver.ts` (`flush`).

---

## Restore: empty text and silent `isDeleted`

**What happens:** In `restore.ts`, when `opts.deleteInvisibleElements` is set and text is empty, the code may set `isDeleted: true` and bump the element version. An adjacent **TODO** states this can break **sync / versioning** when applying deltas because the deletion may not be recorded the same way as an explicit delete in the collaboration pipeline.

**Why it matters:** Integrators or agents changing restore options or delta application must not assume **version bumps** always correspond to **recorded delete operations**.

**Primary references:** `packages/excalidraw/data/restore.ts`.

---

## Pointer, touch, and double-click

**What happens:** A **TODO** in `App` describes the current approach as a **hack**: mixing native browser click/double-click with manual touch handling, with flags such as `lastPointerUpIsDoubleClick` carrying state across events.

**Why it matters:** Consolidating handlers or deduplicating events without preserving this implicit machine can break **double-click to edit**, **text entry**, or **mobile** behavior.

**Primary references:** `packages/excalidraw/components/App.tsx` (fields and comments near `lastPointerUpIsDoubleClick`).

---

## `Excalidraw` wrapper props and `React.memo`

**What happens:** The `Excalidraw` component merges `UIOptions` with defaults. A **FIXME** notes that normalization should happen so the **memo comparator** compares stable values; otherwise shallow equality can disagree with semantic prop changes.

**Why it matters:** Tweaking `memo` or prop shape without aligning defaults can cause **stale UI options** or confusing render frequency.

**Primary references:** `packages/excalidraw/index.tsx`.

---

## Mobile: linear elements and transform handles

**What happens:** A **HACK** gates hit-testing so **transform handles are disabled** for linear elements on mobile (and for two-point lines under a broader condition), until a better UX exists.

**Why it matters:** “Fixing” mobile/desktop parity for handles without redesign can **re-enable broken** resize/transform behavior on small screens.

**Primary references:** `packages/excalidraw/components/App.tsx` (hover / handle selection path; search for `HACK:`).

---

## `Store.scheduleCapture` and undo

**What happens:** `scheduleCapture` schedules work that becomes **durable increments** and affects the **undo stack**. A **TODO** in `store.ts` flags that it is “called so many places” and feels **error-prone**.

**Why it matters:** New code paths that mutate elements or app state must use the same **capture** conventions as surrounding actions; otherwise **history** can be empty, duplicated, or inconsistent.

**Primary references:** `packages/element/src/store.ts`, [`architecture.md`](./architecture.md) (capture modes on `updateScene` / `Store`).

---

## `Scene.mutateElement` and React batching

**What happens:** The JSDoc on `Scene.mutateElement` requires callers to invoke it from a **React event handler** or within **`unstable_batchedUpdates`**, so updates batch correctly with the editor’s React cycle.

**Why it matters:** Calling mutation from arbitrary async ticks or non-UI entry points without batching can cause **extra renders** or **visible inconsistency** between React state and scene.

**Primary references:** `packages/element/src/Scene.ts` (`mutateElement`).

---

## Comment inventory (high-signal)

There is **no** `WORKAROUND` tag in `.ts`/`.tsx` in this repo at the time of writing. **`HACK`** appears in the linear-element mobile handle path in `App.tsx`. **`FIXME`** and **`TODO`** appear across packages; clusters worth manual review before large refactors include:

| Theme | Example locations |
|--------|-------------------|
| History / deltas / `#7348` | `packages/element/src/delta.ts`, `packages/excalidraw/tests/history.test.tsx`, `packages/excalidraw/actions/actionFinalize.tsx` |
| Export / tests | `packages/utils/tests/export.test.ts` (SVG and deleted elements) |
| Flaky or incorrect tests | `packages/excalidraw/wysiwyg/textWysiwyg.test.tsx`, `packages/element/tests/zindex.test.tsx` |
| Types / migration | `packages/math/src/types.ts`, `packages/math/src/point.ts` |
| Theming / wysiwyg | `packages/excalidraw/wysiwyg/textWysiwyg.tsx` |

Use ripgrep for `\b(TODO|FIXME|HACK)\b` when preparing a change that touches those areas.

---

## Related documentation

- [`architecture.md`](./architecture.md) — end-to-end editor architecture and file index.
- [`../memory/systemPatterns.md`](../memory/systemPatterns.md) — monorepo and composition patterns at a glance.
