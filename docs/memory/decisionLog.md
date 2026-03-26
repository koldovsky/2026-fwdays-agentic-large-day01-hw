# Decision Log

## Related Docs

- [Architectural Decisions — Full Detail](../technical/decisions.md) — complete rationale, tradeoffs, and source evidence for Decisions 1–8
- [Undocumented Behaviors — Full Detail](../technical/undocumented-behaviors.md) — complete analysis for Undocumented Behaviors 1–10
- [Technical Architecture](../technical/architecture.md) — implementation details (data flow, state management, rendering pipeline, collaboration)
- [Product Requirements (PRD)](../product/PRD.md) — product-level context for collaboration (§5.7), embedding API (§4.4, FR-21–FR-25), security requirements (§7), and open questions (§8)

---

## Architectural Decisions

### Decision 1: Monorepo with Dual Artifacts (App + npm Package)

Private web app (`excalidraw-app`) and publishable npm package (`@excalidraw/excalidraw`) share one Yarn workspace. Path aliases avoid rebuild cycles in development; build order is enforced (`common → math → element → excalidraw`). The app intentionally imports internal library sub-paths outside the official `exports` map.

→ [Full detail](../technical/decisions.md#decision-1-monorepo-with-dual-artifacts-app--npm-package)

---

### Decision 2: React Class Component for the Core Editor (`App.tsx`)

`App.tsx` (~12,800 lines) is a `React.Component` class rather than a functional component. Long-lived mutable instance variables (`scene`, `history`, `actionManager`, `renderer`, `fonts`) benefit from stable identity; `componentDidUpdate` delta computation relies on previous-state access. Jotai atoms cover isolated UI state.

→ [Full detail](../technical/decisions.md#decision-2-react-class-component-for-the-core-editor-apptsx)

---

### Decision 3: Transport-Agnostic Collaboration API in the Library

The library ships no WebSocket or Firebase code. Collaboration is injected via `ExcalidrawImperativeAPI` callbacks and props. The app shell (`excalidraw-app`) provides the Socket.IO + Firebase reference implementation; `reconcileElements()` and `applyDeltas()` are exported for custom transports.

→ [Full detail](../technical/decisions.md#decision-3-transport-agnostic-collaboration-api-in-the-library) | [Architecture data flow](../technical/architecture.md) | [PRD §4.4](../product/PRD.md)

---

### Decision 4: AES-GCM End-to-End Encryption with Key-in-Fragment

All scenes and share links are AES-GCM encrypted. The decryption key lives only in the URL fragment (`#room=<id>,<key>`) and is never transmitted to the server. Firebase stores only `{ iv, ciphertext }`. Trade-off: losing the fragment loses the room permanently.

→ [Full detail](../technical/decisions.md#decision-4-aes-gcm-end-to-end-encryption-with-key-in-fragment) | [PRD §5.7 and §7](../product/PRD.md)

---

### Decision 5: Separate Packages for Math, Element, Common, Utils

`@excalidraw/math`, `@excalidraw/element`, `@excalidraw/common`, and `@excalidraw/utils` are independent versioned packages. Strict dependency direction is enforced at compile time. `@excalidraw/math` exports branded coordinate types (`GlobalPoint`, `LocalPoint`) preventing accidental mixing.

→ [Full detail](../technical/decisions.md#decision-5-separate-packages-for-math-element-common-utils)

---

### Decision 6: roughjs + Deterministic Seeds for Hand-Drawn Style

All shapes are rendered via `roughjs`. Each element stores a `seed: number` ensuring deterministic rendering across sessions and collaborators. `roughness: 0` still uses roughjs with `preserveVertices: true`; roughness is auto-reduced for elements under 20 px.

→ [Full detail](../technical/decisions.md#decision-6-roughjs--deterministic-seeds-for-hand-drawn-style)

---

### Decision 7: Two Stacked Canvases (Static + Interactive)

A **StaticCanvas** (throttled, committed elements) and an **InteractiveCanvas** (every pointer event, selection/cursors/snaps) are stacked. A third **NewElementCanvas** isolates the in-progress element. This avoids re-rendering the full scene on every pointer move.

→ [Full detail](../technical/decisions.md#decision-7-two-stacked-canvases-static--interactive)

---

### Decision 8: Fractional Indexing for Element Order

Elements carry a `FractionalIndex` string (`index` field) for stable z-order compatible with concurrent multi-user insertions. Index strings can grow with many sequential insertions between the same two elements; periodic reindexing mitigates this.

→ [Full detail](../technical/decisions.md#decision-8-fractional-indexing-for-element-order)

---

## Undocumented Behaviors

### Undocumented Behavior 1: `autoFocus` Defaults to `false`

`autoFocus` defaults to `false`, silently disabling all keyboard shortcuts until the user clicks the canvas. Every test file overrides `autoFocus={true}`. Not mentioned in the README.

→ [Full detail](../technical/undocumented-behaviors.md#undocumented-behavior-1-autofocus-defaults-to-false-breaking-keyboard-shortcuts-by-default)

---

### Undocumented Behavior 2: `Ctrl+V` vs `Ctrl+Shift+V` Produce Different Visuals

`Ctrl+V` randomizes `seed` on paste; `Ctrl+Shift+V` retains it. Because `seed` controls roughjs jitter, the same shape pasted two ways looks different. Programmatic paste always takes the `Ctrl+V` path.

→ [Full detail](../technical/undocumented-behaviors.md#undocumented-behavior-2-ctrlv-and-ctrlshiftv-produce-visually-different-outputs)

---

### Undocumented Behavior 3: `line` Element Silently Becomes a Filled Polygon

`ExcalidrawLineElement.polygon` (undocumented field) auto-promotes to `true` on loop-close, on background-color application to ≥3-point lines, or via a toolbar toggle. Restoring a polygon with <4 points silently resets `polygon` to `false`.

→ [Full detail](../technical/undocumented-behaviors.md#undocumented-behavior-3-a-line-element-silently-becomes-a-filled-polygon-under-three-conditions)

---

### Undocumented Behavior 4: `initialData.scrollToContent` Fixes the Blank-Canvas Problem

`ImportedDataState.scrollToContent = true` recentres the viewport to fit all loaded elements. The README calls blank-canvas-after-load a common failure but never names this fix.

→ [Full detail](../technical/undocumented-behaviors.md#undocumented-behavior-4-initialdatascrolltocontent-is-the-undocumented-fix-for-the-documented-blank-canvas-problem)

---

### Undocumented Behavior 5: Stored `roughness` Diverges from Rendered Roughness for Small Elements

`adjustRoughness()` silently divides the roughness value at draw time for elements under 20 px. The stored `element.roughness` is never mutated, so reading it returns a value inconsistent with what was rendered.

→ [Full detail](../technical/undocumented-behaviors.md#undocumented-behavior-5-stored-roughness-diverges-from-rendered-roughness-for-small-elements)

---

### Undocumented Behavior 6: `EXCALIDRAW_ASSET_PATH` Accepts an Array for Multi-CDN Fallback

`window.EXCALIDRAW_ASSET_PATH` accepts `string | string[]`. An array registers multiple font-face sources in priority order; a hardcoded CDN fallback is always appended last. The README documents only the string form.

→ [Full detail](../technical/undocumented-behaviors.md#undocumented-behavior-6-windowexcalidraw_asset_path-accepts-an-array-for-multi-cdn-fallback)

---

### Undocumented Behavior 7: `exportToBlob` Silently Overrides `exportBackground` for JPEG

Passing `mimeType: "image/jpg"` is silently corrected to `"image/jpeg"`. If `exportBackground` is false for a JPEG export, it is forcibly overridden to `true` with a `console.warn`. Neither behavior is documented.

→ [Full detail](../technical/undocumented-behaviors.md#undocumented-behavior-7-exporttoblob-silently-overrides-exportbackground-for-jpeg-and-corrects-imagejpg-typo)

---

### Undocumented Behavior 8: `onIncrement` Is Only Subscribed at Initial Mount

`onIncrement` is registered once in `componentDidMount`. A prop provided after mount (e.g., after an async connection setup) is never wired up. The only documentation is a single JSDoc comment on the type.

→ [Full detail](../technical/undocumented-behaviors.md#undocumented-behavior-8-onincrement-prop-is-only-subscribed-if-present-at-initial-mount)

---

### Undocumented Behavior 9: Deleted Elements Are Retained for 24 Hours

`.isDeleted = true` elements remain in the scene array and are synced for 24 hours (`DELETED_ELEMENT_TIMEOUT`). This propagates deletions to offline collaborators but means deleted content is still present in memory, storage, and raw element arrays.

→ [Full detail](../technical/undocumented-behaviors.md#undocumented-behavior-9-deleted-elements-are-retained-in-scene-data-for-24-hours)

---

### Undocumented Behavior 10: `overscrollBehaviorX` Is a Global Side Effect

On pointer-enter, `document.documentElement.style.overscrollBehaviorX` is set to `"none"`; on pointer-leave, back to `"auto"`. This overrides any host-page `overscroll-behavior-x`. On unmount, it resets to `""` (does not restore the original value).

→ [Full detail](../technical/undocumented-behaviors.md#undocumented-behavior-10-overscrollbehaviorx-is-set-on-documentdocumentelement-as-a-global-side-effect)
