# Undocumented Behaviors — Full Detail

> Synoptic index: [docs/memory/decisionLog.md](../memory/decisionLog.md) Related: [Technical Architecture](architecture.md) | [Architectural Decisions](decisions.md)

---

## Undocumented Behavior 1: `autoFocus` Defaults to `false`, Breaking Keyboard Shortcuts by Default

**Behavior**: The `<Excalidraw>` component's `autoFocus` prop defaults to `false`. When false, the canvas container does not receive browser focus on mount, so all keyboard shortcuts (delete, undo/redo, tool switching, etc.) are silently non-functional until the user clicks the canvas.

**What the code does**:

- `packages/excalidraw/index.tsx` line 87: `autoFocus = false` — explicit default.
- `packages/excalidraw/components/App.tsx`: on mount, `autoFocus` determines whether `containerRef.current.focus()` is called.
- Every test file (`history.test.tsx`, `clipboard.test.tsx`, `flip.test.tsx`, `image.test.tsx`, and ~15 others) hardcodes `<Excalidraw autoFocus={true} />` specifically to make keyboard events work in the test environment. This is test-level documentation that the production default is `false`.

**What docs say**: `autoFocus` is not mentioned anywhere in `packages/excalidraw/README.md`. No prop list or API reference exists in the README; it defers entirely to `docs.excalidraw.com`.

**The mismatch**: An integrator who follows the README setup (`<Excalidraw />` with no props) will find that keyboard shortcuts do not work. The fix (`autoFocus={true}`) is discoverable only by reading TypeScript types or the test harness. The README mentions a "blank canvas" as a common failure mode but does not mention the keyboard-inoperability footgun that affects every embedding.

**Source evidence**:

- `packages/excalidraw/index.tsx:87` — `autoFocus = false`
- `packages/excalidraw/tests/history.test.tsx`, `clipboard.test.tsx`, `flip.test.tsx` — every test file overrides `autoFocus={true}`
- `packages/excalidraw/tests/excalidraw.test.tsx` lines 385–397 — explicit "Test autoFocus prop" describe block
- `packages/excalidraw/README.md` — no mention of `autoFocus`

---

## Undocumented Behavior 2: `Ctrl+V` and `Ctrl+Shift+V` Produce Visually Different Outputs

**Behavior**: Pasting with `Ctrl+V` assigns a new random `seed` to every pasted element, producing a visually distinct rendering. Pasting with `Ctrl+Shift+V` preserves the original `seed`, producing a pixel-identical visual copy. Since `seed` controls the roughjs stroke jitter, two elements with the same shape but different seeds will look different even at identical `roughness` settings.

**What the code does**:

- `packages/excalidraw/components/App.tsx` lines 4923–4931: a module-level `IS_PLAIN_PASTE` flag is set to `event.shiftKey` in the `keydown` handler, then read in the paste handler.
- `packages/element/src/duplicate.ts` lines 75–77: `randomizeSeed` is `!retainSeed`. When true, `copy.seed = randomInteger()` and `bumpVersion(copy)` are called; when false, both are skipped.
- `packages/excalidraw/tests/clipboard.test.tsx` lines 97–124: two tests assert this behavior explicitly — "should randomize seed on paste" and "should retain seed on shift-paste".

**What docs say**: Not in `packages/excalidraw/README.md`. A single CHANGELOG entry ("Retain `seed` on shift-paste, #6509") is the only written record. No developer guide or API reference describes the two-mode paste system or explains that `seed` governs visual randomness.

**The mismatch**: A developer who calls `serializeAsClipboardJSON()` and then simulates a paste does not know that the visual output depends on which modifier key was held. Programmatic pasting through the clipboard API always goes through the `Ctrl+V` path, meaning copied elements will render differently from originals even if no property was changed. The only way to get a visually identical paste is `Ctrl+Shift+V`, which is not discoverable from any documentation.

**Source evidence**:

- `packages/excalidraw/components/App.tsx:4923–4931` — `IS_PLAIN_PASTE` flag logic
- `packages/element/src/duplicate.ts:75–77` — `randomizeSeed` branch
- `packages/excalidraw/tests/clipboard.test.tsx:97–124` — tests that assert both behaviors
- `packages/excalidraw/README.md` — no mention

---

## Undocumented Behavior 3: A `line` Element Silently Becomes a Filled Polygon Under Three Conditions

**Behavior**: `ExcalidrawLineElement` carries a `polygon: boolean` field (default `false`). When `true`, the line is treated as a closed shape supporting fill. This mode activates automatically — without user awareness — in three distinct circumstances: (1) when the user finishes drawing a line whose path forms a loop, (2) when a non-transparent background color is applied to an open line with ≥ 3 points, and (3) as a manual toggle in the line editor toolbar (≥ 4 points required).

**What the code does**:

- `packages/element/src/types.ts` lines 343–347: `polygon: boolean` field on `ExcalidrawLineElement` — no JSDoc.
- `packages/excalidraw/actions/actionFinalize.tsx` lines 247–264: on draw-end, if `isPathALoop(element.points)` is true, `polygon` is set to `true` and the last point is snapped to the first.
- `packages/excalidraw/actions/actionProperties.tsx` lines 396–414: when `backgroundColor` is applied to a line that satisfies `canBecomePolygon(element.points)`, the element is silently promoted to `polygon: true`.
- `packages/element/src/shape.ts` lines 920–930: polygon mode switches roughjs rendering from `generator.linearPath(...)` to `generator.polygon(...)`, enabling fill hatching.
- `packages/excalidraw/data/restore.ts` lines 455–461: on data restore, `polygon: true` is silently reset to `false` if `isValidPolygon(element.points)` fails (fewer than 4 points or not closed) — stored data can be silently mutated on import.

**What docs say**: Not mentioned in `packages/excalidraw/README.md`, any API reference, or any developer guide. The `polygon` field in `types.ts` has no JSDoc comment. i18n strings `labels.polygon.convertToPolygon` and `labels.polygon.breakPolygon` exist but are unreachable without knowing the feature exists.

**The mismatch**: Developers creating `line` elements programmatically (e.g., for radar charts or custom shapes) will encounter automatic polygon promotion when they set a background color, with no warning. Serializing and re-importing a polygon with 3 points resets `polygon` to `false`, causing silent visual change. The entire mode is a hidden subtype of `line` with no type guard and no documentation.

**Source evidence**:

- `packages/element/src/types.ts:343–347` — `polygon` field definition (no JSDoc)
- `packages/excalidraw/actions/actionFinalize.tsx:247–264` — loop-close auto-promotion
- `packages/excalidraw/actions/actionProperties.tsx:396–414` — background-color auto-promotion
- `packages/element/src/shape.ts:920–930` — rendering switch on `polygon`
- `packages/excalidraw/data/restore.ts:455–461` — silent `polygon` reset on restore
- `packages/excalidraw/README.md` — no mention

---

## Undocumented Behavior 4: `initialData.scrollToContent` Is the Undocumented Fix for the Documented Blank-Canvas Problem

**Behavior**: `ImportedDataState` (the type of `initialData`) contains a `scrollToContent?: boolean` field. When `true`, the viewport is automatically scroll-centred and zoomed to fit all loaded elements after initialisation. When omitted (the default), the viewport uses the `scrollX`/`scrollY` from the saved `appState` — if elements were created off-screen, the canvas appears blank.

**What the code does**:

- `packages/excalidraw/data/types.ts` line 47: `scrollToContent?: boolean` — part of `ImportedDataState`, no JSDoc.
- `packages/excalidraw/components/App.tsx` lines 2946–2957: in `initializeScene`, when `initialData.scrollToContent` is truthy, `calculateScrollCenter(elements, appState)` is called to recentre the viewport before the first render.
- The default is `undefined` / falsy — no automatic scroll-centering occurs.

**What docs say**: `packages/excalidraw/README.md` mentions `initialData` by name only ("pass `initialData` to load a saved scene") and does not describe any of its fields. The README's "Common issues" or setup section does not reference `scrollToContent` as a remedy for any problem.

**The mismatch**: The README (and the broader Excalidraw documentation at `docs.excalidraw.com`) identifies "the canvas appears blank after loading a scene" as a common integration failure mode. The solution — setting `initialData.scrollToContent = true` — exists in the codebase but is not mentioned in any README, doc, or comment adjacent to the described failure. Developers must discover it by reading `data/types.ts` directly or by searching the source for `scrollToContent`.

**Source evidence**:

- `packages/excalidraw/data/types.ts:47` — `scrollToContent?: boolean` (no JSDoc)
- `packages/excalidraw/components/App.tsx:2946–2957` — `initializeScene` scroll-center logic
- `packages/excalidraw/README.md` — mentions `initialData` by name, no field descriptions
- `packages/excalidraw/tests/excalidraw.test.tsx` — `scrollToContent` is used in test fixtures but not explained

---

## Undocumented Behavior 5: Stored `roughness` Diverges from Rendered Roughness for Small Elements

**Behavior**: For elements whose shortest side is under 20 px or longest side is under 50 px, the `roughness` value passed to roughjs at draw time is silently reduced: divided by 3 (for elements under 10 px), divided by 2 (10–49 px), and capped at 2.5. The element's stored `.roughness` property is never mutated — only the render-time value changes. Reading `element.roughness` after drawing gives a value inconsistent with what was rendered.

**What the code does** — `packages/element/src/shape.ts`, function `adjustRoughness` (lines 170–191):

```text
if (minSize >= 20 && maxSize >= 50)          → no reduction (full-size shape)
if (minSize >= 15 && roundness set)          → no reduction (rounded shape)
if (isLinearElement && maxSize >= 50)        → no reduction (long line/arrow)
if maxSize < 10px                            → roughness ÷ 3  (capped at 2.5)
otherwise (small shape)                      → roughness ÷ 2  (capped at 2.5)
```

`adjustRoughness` is called inside `generateRoughOptions`, which feeds into `ShapeCache`. The stored element field is never touched.

**What docs say**: The CHANGELOG references "Make adaptive-roughness less aggressive [#7250]" but gives no thresholds or formula. `packages/excalidraw/README.md` describes `roughness` as a user-controlled stylistic property with no mention of automatic adjustment. The `roughness` field in `types.ts` has no JSDoc describing the render-time override.

**The mismatch**: A developer who creates elements programmatically with `roughness: 2` for small icons (under 10 px) will see them rendered with roughness ≈ 0.67, but `element.roughness` still returns `2`. Comparing serialized data to visual output will show a systematic discrepancy. There is no API to query the effective render-time roughness, and no documentation warning that the stored and rendered values are different concepts for small elements.

**Source evidence**:

- `packages/element/src/shape.ts:170–191` — `adjustRoughness()` function with full threshold logic
- `packages/excalidraw/README.md` — no mention of auto-adjustment
- CHANGELOG (`#7250`) — one-line note with no thresholds
- `packages/element/src/types.ts` — `roughness` field has no JSDoc caveat

---

## Undocumented Behavior 6: `window.EXCALIDRAW_ASSET_PATH` Accepts an Array for Multi-CDN Fallback

**Behavior**: `window.EXCALIDRAW_ASSET_PATH` is typed as `string | string[] | undefined`. When set to an array, Excalidraw registers font face `src` entries for every URL in the array, in order, producing a CSS `local()` / `url()` priority chain. The browser attempts each URL in sequence and uses the first that succeeds. A final hardcoded fallback (`ExcalidrawFontFace.ASSETS_FALLBACK_URL`) is always appended after any user-supplied entries.

**What the code does**:

- `packages/excalidraw/global.d.ts` line 4: `EXCALIDRAW_ASSET_PATH: string | string[] | undefined` — typed to accept arrays.
- `packages/excalidraw/fonts/ExcalidrawFontFace.ts` lines 153–163: `if (typeof ... === "string")` adds a single URL; `else if (Array.isArray(...))` iterates and pushes one URL per element.
- Line 167: the CDN fallback URL is always pushed last regardless of what the user provided.

**What docs say**: `packages/excalidraw/README.md` lines 120–125 document only the string form (`window.EXCALIDRAW_ASSET_PATH = "/"`). No mention of array assignment, multi-CDN fallback, or the implicit trailing CDN fallback that is always appended.

**The mismatch**: A self-hosting integrator who wants primary fonts from their own CDN with a secondary backup has no documented path for this. The array form, the fallback ordering semantics, and the unconditional CDN tail are all invisible from the README. An integrator who sets a string path might also be surprised to learn that font loading will still silently fall back to the CDN if the self-hosted asset is missing.

**Source evidence**:

- `packages/excalidraw/global.d.ts:4` — `string | string[] | undefined` type
- `packages/excalidraw/fonts/ExcalidrawFontFace.ts:153–167` — branching on string vs. array, trailing CDN fallback
- `packages/excalidraw/README.md:120–125` — documents string form only

---

## Undocumented Behavior 7: `exportToBlob` Silently Overrides `exportBackground` for JPEG and Corrects `"image/jpg"` Typo

**Behavior**: `exportToBlob` (from `@excalidraw/utils`) silently corrects two caller mistakes: (1) if `mimeType` is the invalid string `"image/jpg"`, it is rewritten to `"image/jpeg"` with no warning; (2) if `mimeType` is JPEG and `opts.appState.exportBackground` is `false` or unset, it is forcibly overridden to `true` (with a `console.warn`). JPEG has no alpha channel and cannot encode transparency, so the override is technically necessary — but callers receive no error, only a console warning, and the returned blob will contain a white background regardless of what was requested.

**What the code does**:

- `packages/utils/src/export.ts` line 116: `if (mimeType === "image/jpg") { mimeType = MIME_TYPES.jpg; }` — silent typo correction, no warning.
- Lines 120–127: `if (mimeType === MIME_TYPES.jpg && !opts.appState?.exportBackground)` — emits `console.warn` and mutates the local `opts` copy to set `exportBackground: true`.
- Line 132: default quality for JPEG is `0.92` (vs `0.8` for other formats), also undocumented.

**What docs say**: `packages/utils/README.md` (if it exists) and `packages/excalidraw/README.md` do not describe `exportToBlob` behavior differences by MIME type, the typo correction, the forced background behavior, or the per-format quality defaults.

**The mismatch**: A developer generating transparent diagram exports who switches from PNG to JPEG will silently receive opaque images. The `console.warn` is only visible in a browser devtools console, not surfaced as a thrown error or returned status. The typo correction means `"image/jpg"` (an invalid MIME type) works in practice, which may mask the underlying issue in CI environments where the warning is not monitored.

**Source evidence**:

- `packages/utils/src/export.ts:116` — `"image/jpg"` → `MIME_TYPES.jpg` silent correction
- `packages/utils/src/export.ts:120–127` — forced `exportBackground: true` with `console.warn`
- `packages/utils/src/export.ts:132` — per-format quality defaults
- `packages/excalidraw/README.md` — no mention of JPEG-specific behavior

---

## Undocumented Behavior 8: `onIncrement` Prop Is Only Subscribed If Present at Initial Mount

**Behavior**: The `onIncrement` prop on `<Excalidraw>` is only wired up during `componentDidMount`. If the prop is `undefined` at mount time and provided later (e.g., after an async operation or state update), the callback is never registered and increments are never delivered. Conversely, if the prop is present at mount but later replaced with a new function reference, the old closure is what gets called — there is no re-subscription on prop update.

**What the code does**:

- `packages/excalidraw/types.ts` line 567: JSDoc comment `"note: only subscribes if the props.onIncrement is defined on initial render"` — the only written record of this constraint.
- `packages/excalidraw/components/App.tsx` lines 3102–3107: `if (this.props.onIncrement) { this.store.onStoreIncrementEmitter.on(...) }` — called once inside `componentDidMount`, never re-evaluated in `componentDidUpdate`.
- The emitter registration is permanent for the lifetime of the component: `this.store.onStoreIncrementEmitter.clear()` is called only in `componentWillUnmount`.

**What docs say**: The behavior is documented only in the type comment (one sentence). `packages/excalidraw/README.md` does not mention `onIncrement`, its mount-time subscription semantics, or the implications for lazy or dynamic prop passing.

**The mismatch**: The transport-agnostic collaboration design (Decision 3) encourages integrators to wire up `onIncrement` for CRDT-style sync. An integrator who establishes the WebSocket connection asynchronously and provides `onIncrement` only after the connection is ready will silently receive no increments. This is the most likely real-world usage pattern and the most likely failure mode — and the only documentation is a single type comment that is not surfaced in any README or integration guide.

**Source evidence**:

- `packages/excalidraw/types.ts:567` — one-line JSDoc warning (the only documentation)
- `packages/excalidraw/components/App.tsx:3102–3107` — subscription inside `componentDidMount`, not `componentDidUpdate`
- `packages/excalidraw/components/App.tsx:3190` — `onStoreIncrementEmitter.clear()` in unmount
- `packages/excalidraw/README.md` — no mention of `onIncrement`

---

## Undocumented Behavior 9: Deleted Elements Are Retained in Scene Data for 24 Hours

**Behavior**: When an element is deleted (`.isDeleted = true`), it is not removed from the scene array. Instead, it continues to be synced to collaborators and persisted to Firebase/localStorage for 24 hours (`DELETED_ELEMENT_TIMEOUT = 86_400_000 ms`). Only after the timeout does `isSyncableElement()` return `false` for it, causing it to be excluded from sync payloads. During the retention window, all collaborators' clients hold a copy of the "deleted" element in memory and storage.

**What the code does**:

- `excalidraw-app/app_constants.ts` line 9: `DELETED_ELEMENT_TIMEOUT = 24 * 60 * 60 * 1000; // 1 day`
- `excalidraw-app/data/index.ts` lines 48–55: `isSyncableElement()` returns `true` for deleted elements if `element.updated > Date.now() - DELETED_ELEMENT_TIMEOUT` — i.e., deleted within the last 24 hours.
- The 24-hour retention is intentional: it ensures that a collaborator who was offline when the deletion occurred still receives the deletion event when they reconnect, rather than seeing a "ghost" element that was deleted while they were away.

**What docs say**: No README, integration guide, or developer documentation describes the retention window, its purpose, or its implications. The field `isDeleted` on element types is documented as a boolean with no retention semantics. There is no API to force-flush deleted elements or reduce the retention window.

**The mismatch**: An integrator who inspects scene elements and filters out `isDeleted === true` entries for storage quota reasons will be working against the intended design — the deletion signal needs to propagate. An integrator building a "scene statistics" dashboard who counts elements will over-count until 24 hours after each deletion. More critically, any export or serialization utility that includes `isDeleted` elements (which is the default — `getSceneElements()` excludes them but the raw `elements` array does not) may include sensitive "deleted" content that users believe is gone.

**Source evidence**:

- `excalidraw-app/app_constants.ts:9` — `DELETED_ELEMENT_TIMEOUT = 24 * 60 * 60 * 1000`
- `excalidraw-app/data/index.ts:48–55` — `isSyncableElement()` retention logic
- `packages/excalidraw/README.md` — no mention of deletion retention semantics

---

## Undocumented Behavior 10: `overscrollBehaviorX` Is Set on `document.documentElement` as a Global Side Effect

**Behavior**: When the pointer enters the Excalidraw canvas, the component sets `document.documentElement.style.overscrollBehaviorX = "none"`. When the pointer leaves, it resets it to `"auto"`. This is a page-level CSS mutation — not scoped to the canvas or its container — and it overrides any `overscroll-behavior-x` the host application has set on `:root` or `<html>`. It is cleaned up on component unmount (reset to `""`), but during the component's lifetime, the host page's horizontal overscroll behavior is dynamically toggled on every pointer enter/leave event.

**What the code does**:

- `packages/excalidraw/components/App.tsx` lines 2058–2063: `toggleOverscrollBehavior()` method sets `document.documentElement.style.overscrollBehaviorX` based on `event.type === "pointerenter"`.
- Line 3200 (in `componentWillUnmount`): resets to `""` (removes the inline style entirely, which may expose a different value than what was set before mount).
- The comment explains the intent: prevent MacOS Chrome's swipe-back/forward navigation from triggering while panning inside the canvas.

**What docs say**: Not mentioned anywhere in `packages/excalidraw/README.md`, any prop documentation, or any integration guide. There is no prop to disable or customize this behavior. The cleanup resets to `""` rather than restoring the original value, meaning if the host page had `overscroll-behavior-x: contain` set as an inline style on `<html>`, that value is lost after the Excalidraw component unmounts.

**The mismatch**: A host application that sets its own `overscroll-behavior-x` on the `<html>` element will have that value silently overridden during Excalidraw pointer interaction. Applications using full-page horizontal scroll (e.g., multi-panel layouts or horizontal carousels) may observe navigation or scroll interference when the cursor exits the canvas. There is no opt-out prop, no event for this mutation, and no documentation warning that the component mutates `document.documentElement` style.

**Source evidence**:

- `packages/excalidraw/components/App.tsx:2058–2063` — `toggleOverscrollBehavior()` mutating `document.documentElement`
- `packages/excalidraw/components/App.tsx:3200` — reset to `""` on unmount (does not restore original value)
- `packages/excalidraw/README.md` — no mention of global side effects or `overscroll-behavior-x`
