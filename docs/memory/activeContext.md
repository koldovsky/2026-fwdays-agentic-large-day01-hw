# Active context

## Related documentation

- **Product:** [PRD](../product/PRD.md), [Domain glossary](../product/domain-glossary.md)
- **Technical:** [Architecture](../technical/architecture.md), [Dev setup](../technical/dev-setup.md), [Code vs documentation](../technical/code-vs-documentation.md)

## Current team / sprint focus

- **Not verified** — Repository contains no issue tracker, branch metadata, or dated roadmap in scanned files; “what is being worked on now” cannot be inferred from code alone.

## Maintainer-marked follow-ups (proxy for “attention areas”)

These are **explicit `TODO` / `FIXME` comments** in source (not proof of active work, only of annotated debt).

- **Large surface area of pending refactors in the main editor component**
  - Evidence:
    - `packages/excalidraw/components/App.tsx` — multiple `TODO` / `FIXME` / `HACK` comments (e.g. touch vs pointer unification ~689, paste behavior ~4029, mobile transform handles ~7126, empty `FIXME` ~8758).

- **History / store / undo consistency (cross-cutting `#7348` references)**
  - Evidence:
    - `packages/excalidraw/actions/actionFinalize.tsx` — `TODO: #7348` regarding store recording and invisible elements (~142, ~232, ~346).
    - `packages/element/src/delta.ts` — multiple `#7348` TODOs around undo/redo and bindings (~726, ~1422, ~1882).
    - `packages/excalidraw/tests/history.test.tsx` — `#7348` TODOs (~2369, ~3596, ~3699, ~4372).

- **Point / coordinate model migration**
  - Evidence:
    - `packages/math/src/point.ts` — `TODO remove the overload once we migrate to using Point tuples everywhere` (~26, ~30, ~169).
    - `packages/math/src/types.ts` — same migration note (~42, ~60).

- **Library lifecycle vs Jotai scope**
  - Evidence:
    - `packages/excalidraw/data/library.ts` — `destroy` leaves commented-out reset of `libraryItemsAtom` with `TODO uncomment after/if we make jotai store scoped to each excalid instance` (~253–258).

- **Host app (`excalidraw-app`)**
  - Evidence:
    - `excalidraw-app/App.tsx` — `TODO maybe remove this in several months (shipped: 24-03-11)` on `migrationAdapter: LibraryLocalStorageMigrationAdapter` in `useHandleLibrary` (~417–418).
    - `excalidraw-app/collab/Collab.tsx` — `TODO: ImportedDataState type here seems abused` (~499).
    - `excalidraw-app/index.html` — HTML comment `FIXME: remove this when we update CRA (fix SW caching)` above inline `<style>` (~165–166).

- **Alignment / distribution with frames**
  - Evidence:
    - `packages/excalidraw/actions/actionAlign.tsx` — predicate excludes frame-like elements: `TODO enable aligning frames when implemented properly` (~50–51).
    - `packages/excalidraw/actions/actionDistribute.tsx` — `TODO enable distributing frames when implemented properly` (~43).

- **Bounds / geometry edge cases**
  - Evidence:
    - `packages/element/src/bounds.ts` — `else if (op === "lineTo") { // TODO: Implement this }` and `qcurveTo` branch (`// TODO: Implement this`) (~671–674).
    - `packages/element/src/frame.ts` — `TODO: this a huge bottleneck for large scenes, optimise` (~752).

## Active areas of code (high complexity or “in progress” signals)

- **Editor shell** — `packages/excalidraw/components/App.tsx` (very large file; dense TODO/FIXME markers as above).
- **Collaboration** — `excalidraw-app/collab/Collab.tsx` + `excalidraw-app/collab/Portal.tsx` (socket + Firebase file paths; type-abuse TODO in `Collab.tsx`).
- **Element store / delta** — `packages/element/src/store.ts`, `packages/element/src/delta.ts` (TODOs on snapshot usage, binary files, cloning ~109, ~434, ~980–981 in `store.ts`).

## Incomplete / work-in-progress (observable branches)

- **Path bounds for some path operations** — `lineTo` / `qcurveTo` limits not implemented in the loop in `getBoundsFromPath` (or adjacent helper).
  - Evidence: `packages/element/src/bounds.ts` (~671–674).

- **Align / distribute when selection includes frames** — disabled by predicate.
  - Evidence: `packages/excalidraw/actions/actionAlign.tsx` (~50–51); `packages/excalidraw/actions/actionDistribute.tsx` (~43).

- **Library destroy cleanup** — Jotai reset on destroy commented out.
  - Evidence: `packages/excalidraw/data/library.ts` (~253–258).

- **Commented-out dead code in host app**
  - Evidence: `excalidraw-app/App.tsx` — block `// const onExport = () => { ... }` (~841–844).

## Risks / unclear areas (observable only)

- **Flaky test called out by maintainers**
  - Evidence: `packages/excalidraw/wysiwyg/textWysiwyg.test.tsx` — `// FIXME too flaky. No one knows why.` (~335).

- **Z-index regression expectations marked wrong**
  - Evidence: `packages/element/tests/zindex.test.tsx` — `// FIXME incorrect, should put F1_1 after R3` (~1322–1325).

- **Tests noting memory leak risk**
  - Evidence: `packages/excalidraw/tests/selection.test.tsx` — `TODO: There is a memory leak if pointer up is not triggered` (~250, ~273).

- **Partially verified** — Whether `lineTo` / `qcurveTo` missing bounds affect user-visible bugs depends on path data; only the empty branches are evidenced in `packages/element/src/bounds.ts`.
