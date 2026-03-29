# Decision log — undocumented behavior and refactor hazards

This file is the single place for **behavior that is easy to get wrong** relative to docs or comments: **(A)** mismatches or gaps between written documentation and what the code does, and **(B)** implicit invariants, ordering, and comment-flagged debt (`TODO` / `FIXME` / `HACK`) that refactors or agent edits often break. It complements [`architecture.md`](../technical/architecture.md) (happy-path data flow).

Statements are tied to the current TypeScript sources in this workspace unless noted.

---

## A. Documentation vs implementation

### 1. `updateScene`: JSDoc default for `captureUpdate` vs implementation

**Documented:** The JSDoc on `App.updateScene` marks `captureUpdate` with `@default CaptureUpdateAction.EVENTUALLY` and describes three capture modes when the option is used.

**Actual:** `scheduleMicroAction` runs only inside `if (captureUpdate)`. If the host **omits** `captureUpdate`, **no** micro-action is scheduled for that call. That is **not** the same as explicitly passing `CaptureUpdateAction.EVENTUALLY`, which does enqueue a micro-action with that action type.

**Why it matters:** Integrators migrating from the old `commitToHistory: false` default may assume “unspecified” equals `EVENTUALLY`; the runtime default is “do nothing in the Store for capture,” not `EVENTUALLY`.

**References:** `packages/excalidraw/components/App.tsx` (`updateScene`, ~4532–4566); `packages/excalidraw/CHANGELOG.md` (captureUpdate migration narrative).

---

### 2. `syncActionResult`: architecture doc vs when `setState` runs

**Documented:** `docs/technical/architecture.md` §2 step 4 says that when `actionResult.appState` applies, `setState` merges into React state (with editing-text and controlled-prop handling).

**Actual:** The branch is taken when `actionResult.appState || editingTextElement || this.state.contextMenu`. At this point in the function `editingTextElement` is still always `null`, so in practice the extra trigger beyond `appState` is **`this.state.contextMenu`**: if a **context menu is open**, the editor still enters the large `setState` merge **even when** `actionResult.appState` is absent—among other effects it **forces `contextMenu: null`**, clearing the menu on unrelated actions.

**Why it matters:** Hosts or tests reasoning only from “appState in the action result” miss this coupling between open context menu and forced state refresh.

**References:** `packages/excalidraw/components/App.tsx` (`syncActionResult`, condition ~2755–2800); `docs/technical/architecture.md` §2.

---

### 3. `updateFrameRendering`: API comment vs independent flags and hit-testing

**Documented:** `ExcalidrawImperativeAPI` in `types.ts` says `updateFrameRendering` “disables rendering of frames (**including element clipping**)” and that frames stay interactive unless view mode is used.

**Actual:** `updateFrameRendering` merges **`enabled`**, **`clip`**, **`name`**, and **`outline`** independently (each field defaults to the previous value when omitted). Clipping is not inherently tied to `enabled` in one boolean. Separately, hit-testing uses **`frameRendering.enabled && frameRendering.clip`** to decide whether elements inside a frame require the cursor to be inside the frame; if `enabled` is false, that check is skipped and the filter behaves differently than the prose “disable rendering + clipping” bundle suggests.

**Why it matters:** Embedders cannot treat “turn off frames” as a single switch matching the comment; they must set the combination they want for draw, clip, labels, outlines, and pointer behavior.

**References:** `packages/excalidraw/types.ts` (~949–954); `packages/excalidraw/components/App.tsx` (`updateFrameRendering` ~4242–4260; hit-test filter ~6015–6022).

---

### 4. `syncActionResult`: “nothing changed” path vs files-only updates

**Documented:** Architecture §2 step 5: if nothing changed the scene or state, `scene.triggerUpdate()` still runs.

**Actual:** The `didUpdate` flag is set only when `actionResult.elements` or the app-state branch runs. Updates that **only** set `actionResult.files` (and `captureUpdate`) **do not** set `didUpdate`, so execution falls through to `triggerUpdate()` even though **file maps and image cache** were updated. The doc’s “nothing changed” is easy to read as “no meaningful editor work,” which is false for files-only paths.

**Why it matters:** Observers relying on scene nonce / render triggers vs file cache updates can misread this as a no-op path.

**References:** `packages/excalidraw/components/App.tsx` (`syncActionResult` ~2749–2815); `docs/technical/architecture.md` §2 step 5.

---

### 5. `restore` + `deleteInvisibleElements`: silent deletion and versioning

**Documented:** In-repo technical notes focus on restore shape migration and general restore behavior; option names like `deleteInvisibleElements` appear in code but are not spelled out as “may mark elements deleted and bump version without a user-visible delete” in product-facing docs.

**Actual:** When `opts.deleteInvisibleElements` is set, empty text (and invisibly small elements in another branch) can be rewritten with **`isDeleted: true`** and version bumps (`bumpVersion` / version fields). Inline **TODO** in the same area flags that this can disagree with how collaboration / deltas record deletes.

**Why it matters:** Callers enabling `deleteInvisibleElements` get semantic deletes and version changes that may not match documentation or mental models of “restore = normalize,” affecting sync and conflict behavior.

**References:** `packages/excalidraw/data/restore.ts` (~407–410, ~694–701).

---

## B. Implicit invariants and agent/refactor hazards

These items are either **under-documented in high-level architecture** or live mainly in **code comments**; they are not always “wrong docs,” but they behave like undocumented contracts once you change surrounding code.

### Scene updates and full `App` render

**What happens:** `Scene.triggerUpdate()` bumps `sceneNonce` and invokes all `onUpdate` callbacks. In `App.componentDidMount`, the editor registers `this.scene.onUpdate(this.triggerRender)`. For the common case, `triggerRender` calls `this.setState({})`—an **empty** React state update—so React still runs a full reconciliation and `App.render` runs. Render passes `sceneNonce` into `this.renderer.getRenderableElements(...)`, which drives cache invalidation for visible elements and canvas props.

**Why it matters:** Skipping React updates when “no AppState field changed,” or bypassing `triggerUpdate` while mutating elements, can leave **stale memoized visibility** or break ordering with `componentDidUpdate`’s `store.commit` and `onChange`.

**Documented elsewhere:** The subscription and high-level sequence appear in [`architecture.md`](../technical/architecture.md) (sections on scene mutation and React render). The implementation detail that the mechanism is **`setState({})`** is easy to misread as redundant.

**Primary references:** `packages/excalidraw/components/App.tsx` (`triggerRender`, `componentDidMount`), `packages/element/src/Scene.ts` (`triggerUpdate`, `sceneNonce`).

---

### `componentDidUpdate` ordering and side effects

**What happens (actual order):**

1. **`_initialized` gate (first).** If `!this._initialized && !this.state.isLoading`, the code sets `this._initialized = true`, emits `editor:initialize` on `editorLifecycleEvents`, and calls `this.props.onInitialize?.(this.api)`. This is a **one-way implicit state machine** (`false` → `true`, not reset in normal lifecycle). The comment directly above this block in `App.tsx` says it **must** be updated *before* “state change listeners are triggered below”—i.e. before step 2.

2. **`this.appStateObserver.flush(prevState)`.** That method (`packages/excalidraw/components/AppStateObserver.ts`) is what **fires `onStateChange` subscribers**: it walks registered listeners and invokes callbacks when `predicate(currentState, prevState)` holds. It runs immediately after the `_initialized` gate and before the rest of the method’s branching.

3. **Near the end:** `this.store.commit(elementsMap, this.state)`, then `onChange` / `onChangeEmitter` **only when** `!this.state.isLoading` (avoids clobbering persistence when the tab is unfocused during init, per inline comment).

**Additional implicit transitions:** When `selectedLinearElement?.isEditing` is true but the element is no longer selected, a **`setTimeout`** schedules `actionFinalize` so capture flags are not reset incorrectly—another ordering-sensitive path.

**Why it matters:** Running `flush` before `_initialized` / `onInitialize` can notify **`onStateChange`** consumers before the editor has emitted **`editor:initialize`** or flipped the flag. Reordering `flush`, `commit`, or `onChange`, or calling `onChange` while loading, can break **history**, **observers**, or **local persistence**.

**Primary references:** `packages/excalidraw/components/App.tsx` (`componentDidUpdate`, `_initialized`), `packages/excalidraw/components/AppStateObserver.ts` (`flush`).

---

### Pointer, touch, and double-click

**What happens:** A **TODO** in `App` describes the current approach as a **hack**: mixing native browser click/double-click with manual touch handling, with flags such as `lastPointerUpIsDoubleClick` carrying state across events.

**Why it matters:** Consolidating handlers or deduplicating events without preserving this implicit machine can break **double-click to edit**, **text entry**, or **mobile** behavior.

**Primary references:** `packages/excalidraw/components/App.tsx` (fields and comments near `lastPointerUpIsDoubleClick`).

---

### `Excalidraw` wrapper props and `React.memo`

**What happens:** The `Excalidraw` component merges `UIOptions` with defaults. A **FIXME** notes that normalization should happen so the **memo comparator** compares stable values; otherwise shallow equality can disagree with semantic prop changes.

**Why it matters:** Tweaking `memo` or prop shape without aligning defaults can cause **stale UI options** or confusing render frequency.

**Primary references:** `packages/excalidraw/index.tsx`.

---

### Mobile: linear elements and transform handles

**What happens:** A **HACK** gates hit-testing so **transform handles are disabled** for linear elements on mobile (and for two-point lines under a broader condition), until a better UX exists.

**Why it matters:** “Fixing” mobile/desktop parity for handles without redesign can **re-enable broken** resize/transform behavior on small screens.

**Primary references:** `packages/excalidraw/components/App.tsx` (hover / handle selection path; search for `HACK:`).

---

### `Store.scheduleCapture` and undo

**What happens:** `scheduleCapture` schedules work that becomes **durable increments** and affects the **undo stack**. A **TODO** in `store.ts` flags that it is “called so many places” and feels **error-prone**.

**Why it matters:** New code paths that mutate elements or app state must use the same **capture** conventions as surrounding actions; otherwise **history** can be empty, duplicated, or inconsistent.

**Primary references:** `packages/element/src/store.ts`, [`architecture.md`](../technical/architecture.md) (capture modes on `updateScene` / `Store`).

---

### `Scene.mutateElement` and React batching

**What happens:** The JSDoc on `Scene.mutateElement` requires callers to invoke it from a **React event handler** or within **`unstable_batchedUpdates`**, so updates batch correctly with the editor’s React cycle.

**Why it matters:** Calling mutation from arbitrary async ticks or non-UI entry points without batching can cause **extra renders** or **visible inconsistency** between React state and scene.

**Primary references:** `packages/element/src/Scene.ts` (`mutateElement`).

---

### Comment inventory (high-signal)

There is **no** `WORKAROUND` tag in `.ts`/`.tsx` in this repo at the time of writing. **`HACK`** appears in the linear-element mobile handle path in `App.tsx`. **`FIXME`** and **`TODO`** appear across packages; clusters worth manual review before large refactors include:

| Theme                        | Example locations                                                                                             |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------- |
| History / deltas / `#7348`   | `packages/element/src/delta.ts`, `packages/excalidraw/tests/history.test.tsx`, `packages/excalidraw/actions/actionFinalize.tsx` |
| Export / tests               | `packages/utils/tests/export.test.ts` (SVG and deleted elements)                                              |
| Flaky or incorrect tests     | `packages/excalidraw/wysiwyg/textWysiwyg.test.tsx`, `packages/element/tests/zindex.test.tsx`                  |
| Types / migration            | `packages/math/src/types.ts`, `packages/math/src/point.ts`                                                    |
| Theming / wysiwyg            | `packages/excalidraw/wysiwyg/textWysiwyg.tsx`                                                                 |

Use ripgrep for `\b(TODO|FIXME|HACK)\b` when preparing a change that touches those areas.

---

## Related documentation

- [`architecture.md`](../technical/architecture.md) — end-to-end editor architecture and file index.
- [`systemPatterns.md`](./systemPatterns.md) — monorepo and composition patterns at a glance.

_Last updated: 2026-03-29._
