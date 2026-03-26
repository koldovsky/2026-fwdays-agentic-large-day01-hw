# `@excalidraw/common` — package architecture

This document summarizes how the `packages/common/` package is structured: shared constants, browser-oriented utilities, lightweight pub/sub primitives, and editor chrome metadata. It is intended as a baseline for “what belongs in common vs element vs excalidraw.”

---

## 1. Role and boundaries

| Aspect | Description |
|--------|-------------|
| **Purpose** | **Cross-cutting utilities** used by `@excalidraw/math`, `@excalidraw/element`, and `@excalidraw/excalidraw`: numeric/layout helpers, **color** helpers, **keyboard/pointer** constants, **environment** checks, **Emitter**, typed **app-wide event bus**, **editor device / layout** detection, and small generic structures (**queues**, **promise pool**, **versioned snapshot**). |
| **Published name** | `@excalidraw/common` (see `package.json`). |
| **Declared npm dependency** | **`tinycolor2`** (colors / theme manipulation). |
| **Type-level coupling** | Several modules **`import type`** from **`@excalidraw/element/types`** and **`@excalidraw/excalidraw/types`** (e.g. `constants.ts`, `appEventBus.ts`). At runtime the bundle still centers on **common + tinycolor2**; typings tie shared constants to the editor model. |

`@excalidraw/common` is the **widest shared layer**, but it is **not strictly the bottom of the DAG** if you only look at `dependencies` in `package.json` — the **source graph** also points upward into element/excalidraw for **types**. That is a deliberate monorepo pattern here.

---

## 2. Top-level module map

Sources under `packages/common/src/` (see `index.ts` exports):

| Area | Modules | Responsibility |
|------|---------|----------------|
| **Constants & editor tuning** | `constants.ts` | Thresholds (drag, snap, arrow size), **`EVENT`**, **`POINTER_*`**, **`TOOL_TYPE`**, MIME lists, feature-adjacent literals; uses **types** from element/excalidraw where constants are typed against **`AppState`** / **`ExcalidrawElement`**. |
| **Colors** | `colors.ts`, `colors.test.ts` | Palettes, dark-mode filters; **`tinycolor2`**. |
| **Keys & input** | `keys.ts` | Key codes / helpers for shortcuts. |
| **Geometry helpers (lightweight)** | `points.ts`, `bounds.ts` | Point/bounds utilities that are **not** the full `@excalidraw/math` model (avoid duplicating concepts when adding code). |
| **URL & security helpers** | `url.ts` | Parsing / validation helpers (e.g. link handling patterns). |
| **Random & pooling** | `random.ts`, `promise-pool.ts` | IDs, throttled work pools. |
| **Collections** | `binary-heap.ts`, `queue.ts` | Generic algorithms / structures. |
| **Functional utilities** | `utils.ts` | `isDevEnv`, `debounce`, `throttleRAF`, `Emitter` consumers, object/array helpers, `invariant`, etc. |
| **Pub/sub primitive** | `emitter.ts` | Small **Emitter** class used across packages. |
| **Typed application events** | `appEventBus.ts` | **`AppEventBus`** — typed events with **once / replay** semantics; references **`UnsubscribeCallback`** from excalidraw types. |
| **Editor shell metadata** | `editorInterface.ts` | **Breakpoints**, **form factor** (phone/tablet/desktop), **desktop UI mode**, user-agent sniffing for layout decisions. |
| **Font metadata** | `font-metadata.ts` | Shared font family / metadata for text rendering. |
| **Generic snapshot store** | `versionedSnapshotStore.ts` | **`VersionedSnapshotStore<T>`** with version counter, subscribe, and waiters — reusable outside canvas. |
| **Types** | `utility-types.ts` | DTO, `Mutable`, `ValueOf`, etc. (path **`@excalidraw/common/utility-types`**). |
| **Debug** | `Debug` from `../debug` | Re-exported for development tooling. |

---

## 3. State management — layers

### 3.1 Mostly stateless module functions

- The majority of **`common`** is **pure functions and constants** — no global editor singleton.

### 3.2 `Emitter` and `AppEventBus`

- **`Emitter`** — generic publish/subscribe for arbitrary payloads.
- **`AppEventBus`** — **named, typed** events with configured **cardinality** (`once` / `many`) and **replay** (`none` / `last`), built on emitters. Used to coordinate lifecycle or cross-cutting editor concerns without hardwiring all callers.

### 3.3 `VersionedSnapshotStore`

- Holds a **single value** with monotonically increasing **`version`**, **`subscribe`**, and **`set`/`update`** with equality short-circuit. Suitable for **React external store** patterns or async waiters — not the same as **`@excalidraw/element`**’s `Store` (scene undo).

### 3.4 Environment and layout as “read-only state”

- **`editorInterface`** derives **device and layout** from `window` / `navigator` / media assumptions. Consumers treat this as **snapshot inputs** to UI mode, not as persisted app data.

---

## 4. Command model

**Not applicable** — `common` does not define user commands. It supplies **building blocks** (`KEYS`, `EVENT`, `Emitter`) that **`ActionManager`** and handlers in `@excalidraw/excalidraw` use.

---

## 5. Main units and relationships

| Unit | Consumers (typical) | Role |
|------|----------------------|------|
| **`constants.ts`** | All packages | Single place for **magic numbers** and **enums** shared between element math and UI. |
| **`utils.ts`** | All packages | Shared **environment**, **timing**, and **collection** helpers. |
| **`Emitter` / `AppEventBus`** | Excalidraw app, element (via common) | Decoupled notifications. |
| **`editorInterface.ts`** | `App`, responsive components | **Form factor** and breakpoint constants. |
| **`colors.ts`** | Rendering, themes | Theme-aware color math. |
| **`versionedSnapshotStore.ts`** | Optional feature code | Generic **versioned** state container. |

---

## 6. Package relationship (single diagram)

```mermaid
flowchart TB
  subgraph common [@excalidraw/common]
    Const[constants colors keys]
    Util[utils emitter appEventBus]
    EdIf[editorInterface]
    VS[VersionedSnapshotStore]
    Col[colors plus tinycolor2]
  end

  subgraph math [@excalidraw/math]
    MathCore[point vector geometry]
  end

  subgraph element [@excalidraw/element]
    El[Scene store renderElement]
  end

  subgraph excalidraw [@excalidraw/excalidraw]
    App[App and UI]
  end

  math --> common
  element --> common
  element --> math
  excalidraw --> common
  excalidraw --> element
  Const -.->|type imports| element
  Const -.->|type imports| excalidraw
  Util -.->|type imports| excalidraw
```

Solid arrows: **runtime / declared `dependencies`**. Dotted: **TypeScript type-only imports** from common into higher-layer type definitions (see `constants.ts`, `appEventBus.ts`).

---

## 7. Data flow and persistence

| Concern | Location | Notes |
|---------|----------|-------|
| **Local preferences** | e.g. `editorInterface.ts` **desktop UI mode** storage key | Small **localStorage** usage for layout preference — not full scene persistence. |
| **Scene / file IO** | `@excalidraw/excalidraw` | Not in `common`. |

---

## 8. Other aspects worth documenting (pattern baseline)

1. **Splitting “common” vs “math”** — When a new helper is **2D geometric** with branded points, prefer **`@excalidraw/math`**; when **DOM/editor policy** or **threshold**, prefer **`common`**.
2. **Type imports upward** — Document **build/tsconfig path** rules so `common` can reference `element`/`excalidraw` types without circular **runtime** requires.
3. **`constants.ts` size** — Growth risks; possible future **submodules** (input vs export vs collaboration).
4. **Browser-only APIs** — `editorInterface` and some `utils` assume **`window`/`navigator`** — SSR / tests implications.
5. **Testing** — `*.test.ts` beside modules (`colors`, `utils`, `appEventBus`); pattern for new utilities.
6. **Security** — URL helpers and constants related to embeds / links; align with excalidraw validation props.

---

## 9. Summary

- **`@excalidraw/common`** is the **shared utility and policy constants** layer plus **lightweight reactive primitives** (`Emitter`, `AppEventBus`, `VersionedSnapshotStore`).
- It declares **`tinycolor2`** and is imported by **math**, **element**, and **excalidraw**.
- **Type references** into **element** and **excalidraw** keep constants and events **aligned with `AppState` and elements** — important when evolving shared enums or thresholds.
- It does **not** own **scene structure**, **undo**, or **React UI** — those stay in **element** and **excalidraw**.

---

*Generated from source under `packages/common/` as of the current workspace revision.*
