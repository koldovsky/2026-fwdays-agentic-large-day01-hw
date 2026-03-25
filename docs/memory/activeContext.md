# Active Context

_Last updated: 2026-03-25_

---

## Current Focus: post-0.18.0 Unreleased Work

All items below are in the `## Unreleased` section of `packages/excalidraw/CHANGELOG.md`.

---

## In Progress

### 1. API Lifecycle Overhaul

**Goal**: Replace the single `excalidrawAPI` prop with structured lifecycle hooks.

| Old | New |
|-----|-----|
| `excalidrawAPI` prop (called lazily) | `onExcalidrawAPI(api \| null)` — called on mount, `null` on unmount |
| — | `onMount({ excalidrawAPI, container })` — fires when editor root mounts |
| — | `onInitialize(api)` — fires once initial scene has loaded |
| — | `onUnmount()` — fires just before unmounting |
| — | `api.onEvent(name, callback)` / `api.onEvent(name)` → `Promise` |

Key additions:
- `ExcalidrawAPI.isDestroyed` flag — throws in dev / `console.error` in prod if methods called after unmount.
- `ExcalidrawAPIProvider` + `useExcalidrawAPI()` hook for context-based access without prop drilling.
- `useAppStateValue(prop | props | selectorFn)` hook for reactive state reads.
- `useOnExcalidrawStateChange(selector, callback)` hook.
- `api.onStateChange(selector, callback?)` imperative equivalent.

*Source*: `packages/excalidraw/types.ts` lines 577–589; CHANGELOG "Unreleased" section.

### 2. `onExport` Prop

Allows host apps to intercept and delay JSON/image export with async work or progress reporting.

```tsx
<Excalidraw
  onExport={async function* (_type, { files }, { signal }) {
    yield { type: "progress", message: "Uploading…" };
    await uploadFiles(files, signal);
  }}
/>
```

- Handler receives export data + `AbortSignal`.
- May return `Promise<void>` or `AsyncGenerator<OnExportProgress>` for built-in toast UI.
- Type: `OnExportProgress` declared in `packages/excalidraw/types.ts` line 553.

### 3. Lasso Selection Tool

Freehand selection replacing the rectangular drag-select.

- Action: `"toggleLassoTool"` registered in `ActionName` enum (`packages/excalidraw/actions/types.ts` line 145).
- Implementation: `LassoTrail extends AnimatedTrail` (`packages/excalidraw/lasso/index.ts` line 42).
- Selection logic: `getLassoSelectedElementIds` in `packages/excalidraw/lasso/utils.ts`.
  - Builds bounding box first, then tests intersection/enclosure using `polygonFromPoints` + `polygonIncludesPointNonZero`.
  - Optional path simplification via `simplify(lassoPath, simplifyDistance)`.
- Rendered as SVG trail via `AnimatedTrail` + `AnimationFrameHandler` (no React re-renders during drag).
- State: `streamline: 0.4`, `DECAY_LENGTH: 5000`, `DECAY_TIME: Infinity` (trail persists until release).

---

## Completed in 0.18.0 (2025-03-11)

- Elbow arrows with smart routing
- Flowchart auto-connection
- Scene search
- Image cropping
- Element linking
- Command palette
- Multiplayer undo / redo (`Store` + `HistoryDelta`)
- Font picker + CJK font support
- Text element wrapping
- ESM-only bundle (UMD deprecated)

---

## Known Open Work

- `excalidrawAPI` prop is deprecated but still present; eventual removal planned per CHANGELOG note.
- `on*` subscription methods on `ExcalidrawAPI` will progressively migrate to `api.onEvent(name)`.

## Details
For detailed architecture → see `docs/technical/architecture.md`
For domain glossary → see `docs/product/domain-glossary.md`
