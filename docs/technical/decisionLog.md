# Technical decision log — undocumented and fragile behavior

> **Purpose:** Track **behavior implied by code** that is easy to misuse or break: hidden state, ordering assumptions, and engineer markers (`HACK`, `FIXME`, `TODO`, `WORKAROUND`). Paths are relative to the repo root.  
> **Note:** A full-text search also hits **translation strings** (e.g. Spanish “todo”); those are excluded here.

---

## 1. Comment-marker audit (high-signal only)

| Marker | Location | What it signals |
|--------|----------|-----------------|
| `FIXME` | `packages/utils/tests/export.test.ts` | `exportToSvg` no longer filters deleted elements — test/doc drift. |
| `FIXME` | `packages/element/src/selection.ts` | Module-scoped cache on `isSomeElementSelected` should live on the editor instance. |
| `FIXME` | `packages/element/tests/zindex.test.tsx` | Expected z-order after operations is wrong; follow-up asserts marked incorrect. |
| `FIXME` | `packages/excalidraw/wysiwyg/textWysiwyg.tsx` | Theme-related behavior pending Store emissions. |
| `FIXME` | `packages/excalidraw/index.html` | Service worker caching; remove when CRA/update path changes. |
| `FIXME` | `packages/common/src/colors.ts` | Cannot move helper to `utils` due to circular imports. |
| `HACK` | `packages/excalidraw/components/App.tsx` | Mobile: transform handles disabled for linear elements. |
| `HACK` | `excalidraw-app/collab/Collab.tsx` | When stopping collab with override, reset browser state versions so other tabs’ saved state is ignored. |
| `hack` | `packages/excalidraw/tests/test-utils.ts` | Tests wait on `window.h.state.isLoading` to paper over `initialScene()` races. |
| `hack` | `packages/excalidraw/components/Popover.tsx` | StrictMode double `useLayoutEffect`: guard so viewport fit runs once per position. |
| `WORKAROUND` | `packages/excalidraw/CHANGELOG.md` | Historical CRA note (external doc only). |

Many additional `TODO` / `#7348` notes concern **undo/redo vs invisible elements**, **delta/store consistency**, and **export/embed** (see sections below).

---

## 2. Implicit state machines

- **`isSomeElementSelected`** (`packages/element/src/selection.ts`): Implemented as an IIFE with **module-level** `lastElements`, `lastSelectedElementIds`, and cached `isSelected`. Correctness assumes **reference identity** on `elements` and `selectedElementIds` between calls; exposes `clearCache()` for rare invalidation. This is a hidden **memoization state machine**, not visible in the type signature.

- **Editor `Store` scheduling** (`packages/element/src/store.ts`): `scheduleCapture()` is explicitly marked **“Suspicious that this is called so many places. Seems error-prone.”** The interaction of `scheduleAction`, `scheduleMicroAction`, and macro actions forms an implicit **commit pipeline**; call-site order and timing are not documented in one place.

- **Collaboration lifecycle** (`excalidraw-app/collab/Collab.tsx`): Stopping collaboration branches on `keepRemoteState` and user confirm; the “override” path mutates storage, history, and scene together — **implicit phases** not named as a state chart.

---

## 3. Non-obvious side effects

- **Export + embedded scene** (`packages/utils/src/export.ts`, `packages/excalidraw/scene/export.ts`): Comments describe a **“Scene hack”** / **“tempScene hack”**: export may **clone elements and regenerate ids** for frame labels and SVG pipeline. Callers must pass **original, uncloned** elements for `serializeAsJSON` when embedding PNG/SVG metadata so **ids stay stable**. Easy to break by refactoring export entry points.

- **Stop collaboration (override)** (`excalidraw-app/collab/Collab.tsx`): `resetBrowserStateVersions()`, `LocalData.fileStorage.reset()`, `history.pushState`, and `updateScene` with `CaptureUpdateAction.NEVER` — **cross-cutting** persistence and navigation side effects bundled in one user confirmation path.

- **Frame labels in export** (`packages/excalidraw/scene/export.ts`): Frame titles edited in the DOM are **synthesized as temporary text elements** for SVG export — mutates the element list used during export (documented in-file as a hack, but still a surprising side effect for readers of higher-level APIs).

- **Popover viewport positioning** (`packages/excalidraw/components/Popover.tsx`): Writes **`style.width` / `style.left` / `overflowX`** on the DOM node; combined with StrictMode guard, behavior depends on **React 18 effect semantics**.

---

## 4. Initialization order dependencies

- **Test `renderApp`** (`packages/excalidraw/tests/test-utils.ts`): Waits until **both** canvases exist **and** `window.h.state.isLoading` is false. Order encodes **“App finished initial scene load”** without a dedicated readiness API — brittle if loading flags or `window.h` wiring change.

- **SVG export embed** (`packages/excalidraw/scene/export.ts`): **Serialize JSON for embed before** applying the temp scene path that duplicates elements and changes ids; reversing steps corrupts embedded scene identity.

- **PNG embed** (`packages/utils/src/export.ts`): Same **ordering constraint** — metadata serialization uses pre-hack element references.

---

## 5. Related product decisions

For **architectural choices** (monorepo, Jotai split, hosting, CI), see `../memory/decisionLog.md` and `architecture.md`.

---

## How to extend

Add dated subsections or table rows when new `HACK`/`FIXME` clusters appear or when a refactor removes a fragile pattern (note **removed** and **replacement invariant**).
