# Active Context

Evidence drawn from: source files, tests, and TODO/FIXME/HACK comments in the repository.

---

## 1. Areas With Ongoing Code-Level Change Signals

### Public component API surface
- `packages/excalidraw/types.ts` exposes `onExcalidrawAPI`, `onMount`, `onInitialize`, `onUnmount`, `onExport`, `onStateChange`, and `onEvent`.
- `packages/excalidraw/index.tsx` exports `ExcalidrawAPIProvider`, `useExcalidrawAPI`, `useAppStateValue`, and `useOnExcalidrawStateChange`.
- `packages/excalidraw/types.ts` still contains a TODO near the `name` prop, which signals unresolved API cleanup in that area.

### Elbow arrows and binding behavior
- `packages/element/src/types.ts` defines `ExcalidrawElbowArrowElement` and `FixedSegment`.
- `packages/excalidraw/appState.ts` includes `bindMode`.
- `packages/excalidraw/renderer/interactiveScene.ts` contains `// TODO: support multiplayer selected group IDs`.

### Element locking
- `packages/excalidraw/appState.ts` includes `lockedMultiSelections` and `activeLockedId`.
- Lock-related UI and actions exist in `packages/excalidraw/components/UnlockPopup.tsx`, `LockButton.tsx`, and `packages/excalidraw/actions/actionElementLock.ts`.

### Lasso selection
- `packages/excalidraw/lasso/index.ts` defines `LassoTrail`.
- `packages/excalidraw/components/App.tsx` instantiates `lassoTrail`.
- `packages/excalidraw/tests/lasso.test.tsx` provides dedicated test coverage.

### Point migration in `@excalidraw/math`
- `packages/math/src/types.ts` and `packages/math/src/point.ts` still support both tuple-based and object-based coordinate forms.
- TODO comments in those files show the migration is incomplete.

---

## 2. Current Architectural Pressure Points

### Static vs interactive canvas separation
- `packages/excalidraw/types.ts` marks `editingGroupId`, `selectedElementIds`, and `frameToHighlight` with TODOs about moving them to the interactive canvas state.

### Undo/redo edge cases
- `packages/excalidraw/actions/actionFinalize.tsx` and `packages/excalidraw/tests/history.test.tsx` contain `#7348` TODO markers tied to undo/redo behavior.

### Library state isolation
- `packages/excalidraw/data/library.ts` documents deferred cleanup tied to per-instance Jotai scoping.

### Theme propagation outside `Store`
- `packages/excalidraw/wysiwyg/textWysiwyg.tsx` contains a FIXME noting that `appState.theme` changes are not yet emitted by `Store`.

---

## 3. Verified Technical Debt

| Area | Location | Evidence |
|---|---|---|
| Arrow vs linear-element separation | `packages/excalidraw/data/restore.ts` | `// TODO: Separate arrow from linear element` |
| Restore/store sync around deleted text | `packages/excalidraw/data/restore.ts` | inline comment about store sync breakage |
| Legacy deprecated state field | `packages/excalidraw/data/types.ts` | overdue removal TODO for `isSidebarDocked` |
| Mobile touch/pointer unification | `packages/excalidraw/components/App.tsx` | `HACK` comment in double-click handling |
| Mobile transform handles for linear elements | `packages/excalidraw/components/App.tsx` | `HACK` comment disabling them |
| Bare FIXME in text binding lookup | `packages/excalidraw/components/App.tsx` | unnamed `FIXME` remains |
| `isResizing` naming drift | `packages/excalidraw/components/App.tsx` | TODO to rename to `isScaling` |
| Curved-element flip bounds | `packages/excalidraw/tests/flip.test.tsx` | TODO comments around incorrect bounding boxes |
| Snapping gap limit | `packages/excalidraw/snapping.ts` | `VISIBLE_GAPS_LIMIT_PER_AXIS = 99999` with TODO |
| EyeDropper preview offset | `packages/excalidraw/components/EyeDropper.tsx` | FIXME about viewport offset |
| WASM loading from URL | `packages/excalidraw/subset/woff2/woff2-loader.ts`, `packages/excalidraw/subset/harfbuzz/harfbuzz-loader.ts` | TODO comments about URL-based loading |

---

## Details

For architecture context → see [docs/technical/architecture.md](../technical/architecture.md)
For domain terminology → see [docs/product/domain-glossary.md](../product/domain-glossary.md)
For known undocumented behaviors → see [docs/memory/decisionLog.md](decisionLog.md)
