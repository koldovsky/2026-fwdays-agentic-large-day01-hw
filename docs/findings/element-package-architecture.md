# `@excalidraw/element` — package architecture

This document summarizes how the `packages/element/` package is structured: the element domain model, scene graph, change capture (store / deltas), and canvas-oriented operations. It complements [`excalidraw-package-architecture.md`](./excalidraw-package-architecture.md) and supports a shared vocabulary for patterns across the monorepo.

---

## 1. Role and boundaries

| Aspect | Description |
|--------|-------------|
| **Purpose** | **Element-centric domain logic**: types, scene container, immutable-style mutations, bindings, hit geometry, z-order, rendering hooks (Rough.js), and the **Store** that diffs scene + editor state for undo and collaboration increments. |
| **Published name** | `@excalidraw/element` (see `package.json`). |
| **Runtime deps** | `@excalidraw/common`, `@excalidraw/math`. |
| **Upstream consumer** | **`@excalidraw/excalidraw`** (`App` owns a `Scene` and `Store`); render paths also import **`AppState`** / scene render config types from **`@excalidraw/excalidraw`** (monorepo TypeScript paths). |
| **Coupling note** | `Store` is constructed with **`App`** (`import type App from "@excalidraw/excalidraw/components/App"` in `store.ts`). `Scene` methods take **`AppState`**-shaped selection options. This is an intentional **inward reference** from the domain package to the editor shell — not a clean acyclic layer, but a stable hand-off point. |

The package is **publishable** and re-exported through the main embed package, yet its implementation assumes the **Excalidraw editor** as the orchestration host.

---

## 2. Top-level module map

Sources live under `packages/element/src/`. Grouping by responsibility:

| Area | Representative modules | Responsibility |
|------|------------------------|----------------|
| **Public barrel** | `index.ts` | Re-exports; also defines **`hashElementsVersion`**, **`hashString`**, **`getNonDeletedElements`**, **`getVisibleElements`**. |
| **Core types** | `types.ts` | Discriminated union of **`ExcalidrawElement`**, branded helpers (`FractionalIndex`, fonts, themes from `@excalidraw/common` types, **`Radians`** from `@excalidraw/math`). |
| **Scene graph** | `Scene.ts` | Authoritative **ordered elements**, maps (including deleted), **selection cache**, frame lists, **`replaceAllElements`**, **`mutateElement`** wrapper, **`sceneNonce`** for render invalidation. |
| **Change capture & undo substrate** | `store.ts`, `delta.ts` | **`Store`**, **`StoreSnapshot`**, **`StoreDelta`**, **`ElementsDelta`**, **`AppStateDelta`**, **`CaptureUpdateAction`**; diffing and commit scheduling tied to **`App`**. |
| **Element mutation primitive** | `mutateElement.ts`, `newElement.ts` | Low-level **`mutateElement`** (version / versionNonce / elbow-arrow side effects); **`newElement*`** factories. |
| **Rendering** | `renderElement.ts`, `shape.ts` | Rough.js drawing, element-type dispatch, **`ShapeCache`**, theme / app-state-dependent visuals. |
| **Linear & arrows** | `linearElementEditor.ts`, `elbowArrow.ts`, `arrows/*`, `arrowheads.ts`, `binding.ts` | Polyline editing, bindings, arrow geometry and heads. |
| **Layout & transform** | `bounds.ts`, `transform.ts`, `transformHandles.ts`, `resizeElements.ts`, `dragElements.ts`, `align.ts`, `distribute.ts` | Coordinates, resize, drag, alignment. |
| **Structure** | `frame.ts`, `groups.ts`, `zindex.ts`, `fractionalIndex.ts`, `sortElements.ts` | Frames, grouping, stacking order, fractional indexing for ordering / collab. |
| **Hit & collision** | `collision.ts`, `resizeTest.ts`, `selection.ts`, `distance.ts` | Picking, marquee selection helpers, distances. |
| **Text & embeds** | `textElement.ts`, `textMeasurements.ts`, `textWrapping.ts`, `embeddable.ts`, `image.ts` | Text metrics, wrapping, embeddable / image behavior. |
| **Domain features** | `flowchart.ts`, `cropElement.ts`, `elementLink.ts`, `duplicate.ts`, `heading.ts`, `showSelectedShapeActions.ts`, etc. | Higher-level behaviors used by the editor. |
| **Debug** | `visualdebug.ts` (separate export path in `package.json`) | Development / diagnostics. |
| **Tests** | `__tests__/` | Unit tests (e.g. transform). |

---

## 3. State and observation — layers

### 3.1 Scene-owned element state

- **`Scene`** holds **`elements`**, **`elementsMap`**, derived **`nonDeletedElements`** / **`nonDeletedElementsMap`**, frame caches, and a **selection result cache** keyed by selection options.
- Updates flow through **`replaceAllElements`**, **`mapElements`**, or **`mutateElement`** (instance method delegating to the module-level mutator with scene bookkeeping).
- **`triggerUpdate`** notifies subscribers (e.g. editor rerender / canvas refresh).

### 3.2 Store: snapshots, deltas, capture policy

- **`Store`** (in `store.ts`) owns a **`StoreSnapshot`** and schedules **macro** (`CaptureUpdateAction`) and **micro** actions.
- On commit, it compares snapshots and produces **`StoreChange`** / **`StoreDelta`** objects consumed by **`History`** in `@excalidraw/excalidraw` and by **`onStoreIncrementEmitter`** / **`onDurableIncrementEmitter`** for **`onIncrement`**-style sync.
- **`delta.ts`** implements **`Delta<T>`**, **`ElementsDelta`**, **`AppStateDelta`**, and merge / apply logic — including binding and linear-element consistency rules.

### 3.3 No separate UI state package

- Editor chrome state remains in **`AppState`** (`@excalidraw/excalidraw`); **`ObservedAppState`** and related types are imported into **`delta.ts`** / **`store.ts`** so deltas can include both **elements** and **relevant app fields**.

### 3.4 Versioning and ordering (logical “state” on elements)

- Each element carries **`version`**, **`versionNonce`**, **`updated`**, and **`index`** (fractional index). These support **reconciliation**, **undo**, and **multiplayer** ordering — documented conceptually here even though they are fields, not a separate store.

---

## 4. Mutation and capture pipeline (replacing “command model”)

There is **no `ActionManager` in this package**. Instead:

| Step | Where | Behavior |
|------|--------|----------|
| **Intent** | `@excalidraw/excalidraw` (`App`, actions, pointers) | Decides what should change. |
| **Apply** | `Scene` / **`mutateElement`** / replacements | Updates element references and maps; may bump versions. |
| **Schedule** | **`store.scheduleAction`** / **`scheduleCapture`** | Declares whether the change is **IMMEDIATELY** / **EVENTUALLY** / **NEVER** undo-related. |
| **Commit & diff** | **`Store`** internals | Emits increments and durable deltas for history. |

So **`@excalidraw/element`** defines **how changes are represented and observed**; **`@excalidraw/excalidraw`** defines **when** user or API operations run.

---

## 5. Main units and relationships

| Unit | Relationship |
|------|----------------|
| **`Scene`** | Single source of truth for **element arrays and maps** inside a running editor; exposes queries (**`getElement`**, **`getSelectedElements`**, etc.). |
| **`Store`** | Attached to **`App`**; reads **`app.scene`** and **`app.state`** to build snapshots; **must** stay consistent with `Scene` mutations. |
| **`mutateElement` (function)** | Pure-ish update of one element inside a map; **`Scene.mutateElement`** wires scene refresh and related invariants. |
| **`renderElement`** | Bridge from **element + app state + render config** to **canvas** (Rough.js, embeds, text). Depends on types from **`excalidraw`** for render config. |
| **`LinearElementEditor`** | Stateful editing helper for linear elements (points, handles) used by `App` and rendering. |
| **`newElement` / type checks** | Factory and **narrowing** helpers (`isTextElement`, …) used across the monorepo. |

---

## 6. End-to-end architecture (single diagram)

```mermaid
flowchart TB
  subgraph excalidraw_pkg [@excalidraw/excalidraw]
    App[App class]
    Hist[History]
  end

  subgraph element_pkg [@excalidraw/element]
    Scene[Scene]
    Store[Store]
    Delta[delta.ts Delta types]
    Mut[mutateElement]
    Rend[renderElement]
  end

  subgraph deps [Dependencies]
    Cm[@excalidraw/common]
    Mt[@excalidraw/math]
  end

  App --> Scene
  App --> Store
  Store -->|snapshot from| Scene
  Store -->|snapshot from| App
  Store --> Delta
  Store -->|increments| App
  Hist -->|undo redo deltas| Store
  Scene --> Mut
  App -->|pointer actions| Mut
  Rend --> Scene
  Rend --> Cm
  Rend --> Mt
  Mut --> Cm
  Mut --> Mt
  Scene --> Mt
  element_pkg --> Cm
  element_pkg --> Mt
```

---

## 7. Data flow and persistence

| Concern | Where (typical) | Notes |
|---------|-----------------|-------|
| **JSON / file format** | `@excalidraw/excalidraw` (`data/*`) | Serialization is not owned here; this package supplies **types** and **invariants** (e.g. indices, bindings). |
| **Collaboration merge** | `data/reconcile.ts` (excalidraw) + element **version** fields | Reconciliation logic lives in the app package; element types carry the fields reconciliation uses. |
| **Scene hashing** | `index.ts` — **`hashElementsVersion`** | Fast change detection over **`versionNonce`**. |

---

## 8. Other aspects worth documenting (pattern baseline)

1. **Monorepo type cycle** — `element` importing **`App`** / **`AppState`** from `excalidraw`: rationale, build order, and alternatives (facade interface).
2. **Fractional indexing** — `fractionalIndex.ts` + `Scene` validation throttles; invariants when elements move layers.
3. **Binding graph** — `binding.ts` consistency when endpoints move or elements delete.
4. **`renderElement` performance** — `ShapeCache`, when caches invalidate, interaction with **`sceneNonce`**.
5. **Testing** — unit vs integration: what belongs in `element/__tests__` vs `excalidraw/tests`.
6. **Public exports** — `package.json` **`exports`** including **`./visualdebug`** for tooling.
7. **Embeds & security** — embeddable validation is split between props in excalidraw and element helpers (`embeddable.ts`).

---

## 9. Summary

- **`@excalidraw/element`** is the **domain + observation layer** for canvas items: **`Scene`** for structure, **`Store`/`delta`** for diffs and undo/collab hooks, **`mutateElement`/`renderElement`** for change and draw.
- It depends on **`common`** and **`math`** for shared utilities and geometry types.
- It **references the Excalidraw `App`** for store wiring and **imports editor/render types** for `renderElement` — the package is not an isolated “geometry-only” library.
- **Behavioral orchestration** stays in **`@excalidraw/excalidraw`**; this package defines **what an element is** and **how sets of elements change in a traceable way**.

---

*Generated from source under `packages/element/` and related imports as of the current workspace revision.*
