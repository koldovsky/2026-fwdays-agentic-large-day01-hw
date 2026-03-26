# `@excalidraw/math` — package architecture

This document summarizes how the `packages/math/` package is structured: branded 2D types and pure geometric operations. It supports a **strict, dependency-light** foundation for `@excalidraw/element` and `@excalidraw/excalidraw`.

---

## 1. Role and boundaries

| Aspect | Description |
|--------|-------------|
| **Purpose** | **Planar geometry**: branded **points**, **vectors**, **lines/segments**, **curves**, and primitive shapes (**rectangle**, **ellipse**, **polygon**, **triangle**) with **radians/degrees** and **ranges** — implemented as **pure functions** and **types** without React or canvas APIs. |
| **Published name** | `@excalidraw/math` (see `package.json`). |
| **Declared dependency** | **`@excalidraw/common`** (minimal use — e.g. **`toBrandedType`** in `range.ts`). |
| **Consumers** | **`@excalidraw/element`** (e.g. `mutateElement`, `renderElement`, `Scene`-related math), **`@excalidraw/excalidraw`** (pointer, transform, canvas math). |

This package is the **preferred home** for new **coordinate-system-aware** logic: if it is generic 2D math, it likely belongs here rather than in `element` or `excalidraw`.

---

## 2. Top-level module map

Sources under `packages/math/src/` (barrel in `index.ts`):

| Module | Responsibility |
|--------|----------------|
| **`types.ts`** | **Branded** scalars and composites: **`Radians`**, **`Degrees`**, **`GlobalPoint`**, **`LocalPoint`**, **`GlobalCoord`**, **`LocalCoord`** (object legacy), **`Line`**, **`LineSegment`**, **`Vector`**, **`Ellipse`**, **`Polygon`**, etc. |
| **`point.ts`** | **`pointFrom`**, rotation, distance, interpolation, conversions — **tuple-first** API with overloads for legacy `{x,y}`**. |
| **`vector.ts`** | Add, scale, normalize, dot, cross (2D), length. |
| **`line.ts`**, **`segment.ts`** | Infinite lines and segments; intersections, projections where implemented. |
| **`curve.ts`** | Bezier / curve-related math (used by arrows and handles). |
| **`angle.ts`** | Degrees ↔ radians, normalization. |
| **`range.ts`** | Interval helpers; uses **`toBrandedType`** from `@excalidraw/common`. |
| **`rectangle.ts`**, **`ellipse.ts`**, **`polygon.ts`**, **`triangle.ts`** | Shape-specific predicates and measurements. |
| **`constants.ts`**, **`utils.ts`** | **`PRECISION`**, shared small helpers. |

There are **no** classes representing a “document” or “scene” — only **values** and **functions**.

---

## 3. State management — layers

**Not applicable** — the package is **stateless**. Any mutable state (pointer position, selection) lives in **`AppState`** or transient handlers in `@excalidraw/excalidraw`.

**Branded types** encode **coordinate space intent** (`Global*` vs `Local*`) at compile time; this is **type-level** discipline, not runtime state.

---

## 4. Command model

**Not applicable** — no user actions or undo. Callers pass **inputs**, receive **outputs**.

---

## 5. Main units and relationships

| Unit | Role |
|------|------|
| **`GlobalPoint` / `LocalPoint`** | Primary **2D coordinates** as tuples; **`pointFrom`** is the standard constructor. |
| **`Vector`** | Direction and magnitude for moves, snaps, and constraints. |
| **`Radians` / angle helpers** | Rotation consistent with **`ExcalidrawElement.angle`** (element types import **`Radians`** from here). |
| **Shape modules** | Hit-testing and construction support in **element** (bounds, arrows, frames) without duplicating formulas in the UI package. |

**Relationship to `@excalidraw/common`**: only **light** imports (branding / tiny utilities). **Relationship to `@excalidraw/element`**: **element** depends on **math** for geometry; **math** does **not** depend on **element**.

---

## 6. Package relationship (single diagram)

```mermaid
flowchart TB
  subgraph math [@excalidraw/math]
    Types[types.ts branded geometry]
    Ops[point vector line curve shapes]
  end

  subgraph common [@excalidraw/common]
    Cm[toBrandedType and utils]
  end

  subgraph element [@excalidraw/element]
    El[bounds transform renderElement binding]
  end

  subgraph excalidraw [@excalidraw/excalidraw]
    App[pointer and canvas logic]
  end

  math --> common
  element --> math
  excalidraw --> math
  El --> Types
  App --> Ops
```

---

## 7. Data flow and persistence

| Concern | Notes |
|---------|--------|
| **Serialization** | Math types are **ephemeral** — persisted documents store **plain numbers** on elements; math operates on those at runtime. |
| **Stability** | Changing **branding** or **tuple vs object** conventions is a **cross-cutting** refactor (see TODOs in `point.ts` / `types.ts` about migrating away from `GlobalCoord`). |

---

## 8. Other aspects worth documenting (pattern baseline)

1. **Tuple vs `{x,y}` migration** — Comments in `types.ts` / `point.ts`; single convention reduces casting at boundaries.
2. **Numerical precision** — `PRECISION` / epsilon policy; when to clamp vs compare with tolerance.
3. **Global vs local** — Document when to use **`LocalPoint`** (element-internal) vs **`GlobalPoint`** (scene) for new APIs.
4. **Testing** — Pure functions are ideal for **table-driven** tests; current `math` package layout has few co-located tests — gap to note for contributors.
5. **Dependency direction** — Keep **`math`** free of **`element`** imports to preserve **acyclic** geometry reuse.
6. **3D or non-planar** — Out of scope; if ever needed, would be a separate package or explicit submodule to avoid bloating 2D consumers.

---

## 9. Summary

- **`@excalidraw/math`** provides **branded 2D geometric types** and **pure operations**, with a **thin dependency** on **`@excalidraw/common`**.
- It is **stateless** and **framework-agnostic** — the **editor** and **element** packages supply context (scroll, zoom, element frames).
- **`element`**’s **`types.ts`** uses **`Radians`** and point types from here, aligning **element data** with **geometric APIs**.
- Prefer adding **reusable plane geometry** here before embedding formulas in **UI** or **element** modules.

---

*Generated from source under `packages/math/` as of the current workspace revision.*
