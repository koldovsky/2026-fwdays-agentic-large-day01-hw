# Active Context

Evidence drawn from: git log, CHANGELOG (Unreleased section), TODO/FIXME/HACK comments, AppState defaults, new component files, and existing memory files.

---

## 1. Actively Evolving Areas

### Public API Overhaul (post-0.18.0 Unreleased)
The `packages/excalidraw/CHANGELOG.md` Unreleased section documents a significant rework of the component's public API:
- `excalidrawAPI` prop renamed to `onExcalidrawAPI`; lifecycle props `onMount`, `onInitialize`, `onUnmount` added
- New event system: `api.onEvent(name, callback)` / `api.onEvent(name).then(...)` — the CHANGELOG explicitly notes "in future releases, most `api.on*` subscriptions will be removed in favor of `onEvent`"
- New hooks exported: `ExcalidrawAPIProvider`, `useExcalidrawAPI`, `useAppStateValue`, `useOnExcalidrawStateChange`
- `onExport` async generator prop for host-controlled export flow
- `ExcalidrawAPI.isDestroyed` guard flag
- The comment `// @TODO come with better API before v0.18.0` at `types.ts:631` (the `name` prop) signals at least one more public API decision deferred

### Elbow Arrows & Arrow Binding (post-0.18.0)
- `ExcalidrawElbowArrowElement` with `fixedSegments: FixedSegment[] | null` introduced in `packages/element/src/types.ts:349–368`
- New `bindMode: "orbit" | "inside" | "skip"` on `AppState` (`appState.ts:130`) with a debounced handler (`bindModeHandler` timeout in `App.tsx:683`)
- Multiple `#8299`, `#8952` elbow arrow PRs shipped in 0.18.0; `fixedSegments` suggests ongoing refinement
- `// TODO: support multiplayer selected group IDs` in `renderer/interactiveScene.ts:1880` indicates multiplayer selection rendering is incomplete for grouped elements

### Element Locking & Locked Multi-Selections
- `lockedMultiSelections: { [groupId: string]: true }`, `activeLockedId` AppState fields (new in 0.18.0 or later)
- New component files: `UnlockPopup.tsx`, `LockButton.tsx` (`packages/excalidraw/components/`)
- `actionElementLock.ts`, `actionElementLock.test.tsx` (`packages/excalidraw/actions/`)
- Feature appears complete but multi-selection lock interaction (`lockedMultiSelections`) may still be evolving

### Lasso Selection Tool
- `"lasso"` added as a valid `Tool` type (`types.ts:145`) and `StaticCanvasRenderConfig` has `type: "selection" | "lasso"` (`types.ts:343`)
- No dedicated component file found yet; `AppState` comment at line 881: "after lasso selection until the next pointer down" — integration appears partial

### Image Cropping
- `isCropping`, `croppingElementId` AppState fields; `actionCropEditor.tsx` action
- Shipped in 0.18.0 (`#8613`); `isCropping` not persisted to browser/export/server (all `false` in `APP_STATE_STORAGE_CONF`) — state is purely transient, which is correct but worth noting

### Element Type Conversion
- `ConvertElementTypePopup.tsx`, `ConvertElementTypePopup.scss` present — not referenced in CHANGELOG Unreleased, suggesting in-progress or recently merged but undocumented

### `@excalidraw/math` — Point Tuple Migration (in progress)
- `packages/math/src/types.ts:42,60` and `point.ts:26,30,169`:
  > *"TODO remove this once we migrate the codebase to use Point tuples everywhere"*
- Both object-based (`GlobalCoord`, `LocalCoord`) and tuple-based (`GlobalPoint`, `LocalPoint`) representations coexist
- `pointFrom()` has overloads for both; migration appears ongoing across the codebase

---

## 2. Current Architectural Focus Areas

### Splitting StaticCanvas / InteractiveCanvas
- `types.ts:189–191` — three `AppState` fields (`editingGroupId`, `selectedElementIds`, `frameToHighlight`) carry `// TODO: move to interactive canvas if possible`
- Work toward cleaner separation of render concerns between the static (element) and interactive (UI overlay) canvases

### Store / History / Undo-Redo Stabilization (issue #7348)
- Five separate `// TODO: #7348` comments across `actionFinalize.tsx` and `tests/history.test.tsx`
- The multiplayer undo/redo feature (PR #7348, shipped in 0.18.0) introduced edge cases not yet fully resolved:
  - Invisibly-small elements being recorded in store and potentially restored by undo
  - `CaptureUpdateAction.IMMEDIATELY` being used as a workaround where granular capture leads to inconsistency
  - Group-id ordering after undo/redo not guaranteed
  - Arrow binding rebinding on undo/redo considered overly aggressive but left for safety

### Library Jotai Scope (deferred)
- `packages/excalidraw/data/library.ts:253`:
  > *"TODO uncomment after/if we make jotai store scoped to each excal instance"*
- `library.destroy()` leaves `libraryItemsAtom` state dirty across embedded instances; the fix is blocked on scoping jotai stores per instance

### Theme Changes Not Emitted by Store
- `packages/excalidraw/wysiwyg/textWysiwyg.tsx:964`:
  > *"FIXME after we start emitting updates from Store for appState.theme"*
- The text WYSIWYG editor listens to `app.onChangeEmitter` for theme changes instead of the `Store`, bypassing the normal update pipeline

---

## 3. Unfinished Work / Technical Debt

| Area | Location | Note |
|---|---|---|
| Arrow / linear element type separation | `data/restore.ts:502` | `// TODO: Separate arrow from linear element` |
| Soft-delete in restore breaking sync | `data/restore.ts:408` | Marking empty text elements as deleted without recording to store breaks delta sync |
| `LegacyAppState.isSidebarDocked` deprecated field | `data/types.ts:31` | `@deprecated #6213 TODO remove 23-06-01` — removal date was June 2023, still present |
| `onExcalidrawAPI` prop deprecation path | `types.ts:752` | `/** @deprecated does nothing. Will be removed in 0.15 */` — already past 0.18 |
| Mobile touch / pointer event unification | `App.tsx:689` | *"HACK and we should ideally unify touch and pointer events"* — double-click is handled with mixed browser/manual logic |
| Mobile transform handles for linear elements | `App.tsx:7126` | *"HACK: Disable transform handles for linear elements on mobile"* |
| Unnamed FIXME in `getTextBindableContainerAtPosition` | `App.tsx:8758` | Bare `// FIXME` with no further description |
| `isResizing` vs `isScaling` naming | `App.tsx:12347` | State field conflates scaling and rotation; rename deferred |
| Bounding box for curved elements on flip | `tests/flip.test.tsx:479–514` | Four `//TODO` marks on flipped element bounding box being wrong |
| Snapping gap limit | `snapping.ts:44` | `VISIBLE_GAPS_LIMIT_PER_AXIS = 99999` — `// TODO increase or remove once we optimize` |
| Custom font family numeric ID | `fonts/Fonts.ts:339` | Numeric family IDs may need to change for custom font support |
| EyeDropper viewport offset | `EyeDropper.tsx:105` | `// FIXME swap offset when preview gets outside viewport` |
| WASM font tools from URL | `woff2-loader.ts`, `harfbuzz-loader.ts` | Both have `// TODO: consider adding support for fetching wasm from URL` |

---

## 4. Open Questions for Future Contributors / AI Agents

1. **Lasso tool integration status**: `"lasso"` exists as a Tool type and there is AppState handling, but there is no dedicated lasso component or action file. Is this shipped as minimal or still being built?

2. **ConvertElementTypePopup ownership**: `ConvertElementTypePopup.tsx` exists with no CHANGELOG entry. Is this part of an unreleased feature branch merged early, or a hidden/experimental feature?

3. **Point tuple migration completion**: The `@excalidraw/math` migration away from `{x, y}` objects to `[x, y]` tuples is explicitly in progress (`TODO remove overloads`). Until complete, both forms must be handled in any code touching coordinates.

4. **Jotai scoping per instance**: Library state (`libraryItemsAtom`) is deliberately NOT reset on instance destroy due to a deferred scoping decision. Embedding multiple Excalidraw instances on the same page shares library state — this is a known, intentional limitation until jotai stores are scoped.

5. **`onEvent` migration timeline**: The Unreleased CHANGELOG says "most `api.on*` subscriptions will be removed in favor of `onEvent`" — exact scope and timing undefined. AI agents should not add new `api.on*` usages.

6. **Issue #7348 edge cases**: Several undo/redo scenarios around invisible elements, grouped arrows, and container-text sizing are acknowledged as inconsistent but left as-is. Do not assume undo/redo is fully correct for these element types.

7. **`bindMode` ("orbit" / "inside" / "skip") semantics**: Introduced with elbow arrows and a debounced timer in `App`. The interaction model between `FixedSegment`, `bindMode`, and the elbow arrow router is complex and not documented outside the code.

---

## Details

For architecture context → see [docs/technical/architecture.md](../technical/architecture.md)
For domain terminology → see [docs/product/domain-glossary.md](../product/domain-glossary.md)
For known undocumented behaviors → see [docs/memory/decisionLog.md](decisionLog.md)
