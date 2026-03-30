# Code behavior: documentation vs implementation gaps

> Extracted from [`docs/memory/decisionLog.md`](../memory/decisionLog.md) §B. Each entry documents a mismatch between written documentation/comments and actual runtime behavior in the current TypeScript sources.

---

## 1. `updateScene`: JSDoc default for `captureUpdate` vs implementation

**Documented:** The JSDoc on `App.updateScene` marks `captureUpdate` with `@default CaptureUpdateAction.EVENTUALLY` and describes three capture modes when the option is used.

**Actual:** `scheduleMicroAction` runs only inside `if (captureUpdate)`. If the host **omits** `captureUpdate`, **no** micro-action is scheduled for that call. That is **not** the same as explicitly passing `CaptureUpdateAction.EVENTUALLY`, which does enqueue a micro-action with that action type.

**Why it matters:** Integrators migrating from the old `commitToHistory: false` default may assume "unspecified" equals `EVENTUALLY`; the runtime default is "do nothing in the Store for capture," not `EVENTUALLY`.

**References:** `packages/excalidraw/components/App.tsx` (`updateScene`, ~4532–4566); `packages/excalidraw/CHANGELOG.md` (captureUpdate migration narrative).

---

## 2. `syncActionResult`: architecture doc vs when `setState` runs

**Documented:** `docs/technical/architecture.md` §2 step 4 says that when `actionResult.appState` applies, `setState` merges into React state (with editing-text and controlled-prop handling).

**Actual:** The branch is taken when `actionResult.appState || editingTextElement || this.state.contextMenu`. At this point in the function `editingTextElement` is still always `null`, so in practice the extra trigger beyond `appState` is **`this.state.contextMenu`**: if a **context menu is open**, the editor still enters the large `setState` merge **even when** `actionResult.appState` is absent — among other effects it **forces `contextMenu: null`**, clearing the menu on unrelated actions.

**Why it matters:** Hosts or tests reasoning only from "appState in the action result" miss this coupling between open context menu and forced state refresh.

**References:** `packages/excalidraw/components/App.tsx` (`syncActionResult`, condition ~2755–2800); `docs/technical/architecture.md` §2.

---

## 3. `updateFrameRendering`: API comment vs independent flags and hit-testing

**Documented:** `ExcalidrawImperativeAPI` in `types.ts` says `updateFrameRendering` "disables rendering of frames (**including element clipping**)" and that frames stay interactive unless view mode is used.

**Actual:** `updateFrameRendering` merges **`enabled`**, **`clip`**, **`name`**, and **`outline`** independently (each field defaults to the previous value when omitted). Clipping is not inherently tied to `enabled` in one boolean. Separately, hit-testing uses **`frameRendering.enabled && frameRendering.clip`** to decide whether elements inside a frame require the cursor to be inside the frame; if `enabled` is false, that check is skipped and the filter behaves differently than the prose "disable rendering + clipping" bundle suggests.

**Why it matters:** Embedders cannot treat "turn off frames" as a single switch matching the comment; they must set the combination they want for draw, clip, labels, outlines, and pointer behavior.

**References:** `packages/excalidraw/types.ts` (~949–954); `packages/excalidraw/components/App.tsx` (`updateFrameRendering` ~4242–4260; hit-test filter ~6015–6022).

---

## 4. `syncActionResult`: "nothing changed" path vs files-only updates

**Documented:** Architecture §2 step 5: if nothing changed the scene or state, `scene.triggerUpdate()` still runs.

**Actual:** The `didUpdate` flag is set only when `actionResult.elements` or the app-state branch runs. Updates that **only** set `actionResult.files` (and `captureUpdate`) **do not** set `didUpdate`, so execution falls through to `triggerUpdate()` even though **file maps and image cache** were updated. The doc's "nothing changed" is easy to read as "no meaningful editor work," which is false for files-only paths.

**Why it matters:** Observers relying on scene nonce / render triggers vs file cache updates can misread this as a no-op path.

**References:** `packages/excalidraw/components/App.tsx` (`syncActionResult` ~2749–2815); `docs/technical/architecture.md` §2 step 5.

---

## 5. `restore` + `deleteInvisibleElements`: silent deletion and versioning

**Documented:** In-repo technical notes focus on restore shape migration and general restore behavior; option names like `deleteInvisibleElements` appear in code but are not spelled out as "may mark elements deleted and bump version without a user-visible delete" in product-facing docs.

**Actual:** When `opts.deleteInvisibleElements` is set, empty text (and invisibly small elements in another branch) can be rewritten with **`isDeleted: true`** and version bumps (`bumpVersion` / version fields). Inline **TODO** in the same area flags that this can disagree with how collaboration / deltas record deletes.

**Why it matters:** Callers enabling `deleteInvisibleElements` get semantic deletes and version changes that may not match documentation or mental models of "restore = normalize," affecting sync and conflict behavior.

**References:** `packages/excalidraw/data/restore.ts` (~407–410, ~694–701).

---

_Companion file: [`implicit-invariants.md`](./implicit-invariants.md) (Section C — implicit invariants and refactor hazards)._

_Last updated: 2026-03-30._
