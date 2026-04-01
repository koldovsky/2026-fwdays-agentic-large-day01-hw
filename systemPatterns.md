# System Patterns

## Packages Overview

The `packages/` directory is a layered package stack rather than a set of unrelated libraries. The overall dependency flow is:

`@excalidraw/common` -> `@excalidraw/math` -> `@excalidraw/element` -> `@excalidraw/excalidraw`

`@excalidraw/utils` sits beside that main chain as a convenience layer. It is not a low-level foundation package. Instead, it wraps and re-exports functionality from higher-level editor packages for consumers.

At a high level:

- `common` provides shared runtime primitives and generic helpers
- `math` provides typed 2D geometry
- `element` provides the canonical element model and scene/domain logic
- `excalidraw` provides the full React editor package
- `utils` provides convenience helpers on top of the editor stack

## Cross-Package Architecture

This part of the monorepo follows a clear layered architecture:

- lower layers are mostly stateless and reusable
- middle layers encode editor domain logic
- the top layer composes UI, runtime behavior, rendering, and public APIs

The packages become progressively more stateful as you move upward:

- `@excalidraw/common`: mostly stateless helpers with a few reusable infra primitives
- `@excalidraw/math`: stateless pure geometry
- `@excalidraw/element`: domain logic plus core scene/store state objects
- `@excalidraw/excalidraw`: full runtime state, UI state, rendering orchestration, and integration API
- `@excalidraw/utils`: stateless facade helpers for consumers

## `@excalidraw/common`

### Purpose

`@excalidraw/common` is the base utility and infrastructure layer for the rest of the stack. It contains shared constants, browser/runtime helpers, lightweight primitives, collections, and support code used by all higher packages.

### Architectural Style

This package is a **flat utility library with a few infrastructure primitives**.

It is mostly functional and stateless, with small reusable building blocks rather than feature modules. The public surface is aggregated in `packages/common/src/index.ts`.

### Key Modules

The main exports are grouped around:

- shared constants in `constants.ts`
- general helpers in `utils.ts`
- keyboard and point helpers in `keys.ts` and `points.ts`
- color and font metadata helpers in `colors.ts` and `font-metadata.ts`
- device/editor environment logic in `editorInterface.ts`
- event primitives in `emitter.ts` and `appEventBus.ts`
- versioned data tracking in `versionedSnapshotStore.ts`
- queue and heap style data structures in modules such as `queue.ts` and `binary-heap.ts`

### State Management

This package owns very little application state.

Where state exists, it is small and infrastructural:

- `Emitter` and `AppEventBus` manage subscriptions and event delivery
- `VersionedSnapshotStore` stores a value plus version tracking
- editor preference helpers may read/write browser storage

There is no editor domain state here.

### Relationships

This is the foundational dependency for the rest of the package stack.

- `@excalidraw/math` depends on it
- `@excalidraw/element` depends on it heavily
- `@excalidraw/excalidraw` uses it across runtime, UI, throttling, environment, and constants

## `@excalidraw/math`

### Purpose

`@excalidraw/math` is the typed 2D geometry layer. It provides the numeric and geometric operations needed for editor behaviors such as hit testing, transforms, bounds, vectors, segments, and curves.

### Architectural Style

This package is a **pure geometry toolkit**.

It is organized by shape and primitive, with no React, no UI composition, and no editor runtime ownership. The public API is aggregated in `packages/math/src/index.ts`.

### Key Modules

The package is structured around mathematical primitives:

- `point.ts` and `vector.ts` for fundamental geometry operations
- `angle.ts` and `range.ts` for scalar helpers
- `line.ts` and `segment.ts` for linear geometry
- `rectangle.ts`, `ellipse.ts`, `polygon.ts`, `triangle.ts`, and `curve.ts` for shape-specific math
- `types.ts` for branded geometry types
- `utils.ts` and `constants.ts` for shared numeric helpers

### State Management

There is effectively no owned state. The package is almost entirely stateless and functional.

### Relationships

This package depends only on `@excalidraw/common` and acts as a low-level substrate for the rest of the editor:

- `@excalidraw/element` uses it for geometry-heavy domain logic
- `@excalidraw/excalidraw` uses it directly for editor behaviors like snapping and interaction math
- `@excalidraw/utils` uses it in convenience helpers

## `@excalidraw/element`

### Purpose

`@excalidraw/element` is the core domain/model layer for Excalidraw elements. It defines the canonical element types and contains most element-centric logic: creation, mutation, bounds, collision, selection, grouping, transforms, ordering, binding, and scene-level change tracking.

### Architectural Style

This package is a **domain service layer centered on the element model**.

It mixes:

- many pure functions for operating on elements
- a few central stateful model objects such as `Scene` and `Store`

Its public surface is aggregated in `packages/element/src/index.ts`.

### Key Modules

The package is broad, but the most important areas are:

- `types.ts` for the canonical element type system
- `newElement.ts` and `mutateElement.ts` for creation and mutation
- `bounds.ts`, `collision.ts`, `distance.ts`, and `shape.ts` for geometry and hit testing
- `selection.ts`, `groups.ts`, `frame.ts`, and `zindex.ts` for scene organization
- `binding.ts`, `elbowArrow.ts`, `arrowheads.ts`, and `arrows/helpers.ts` for arrow and binding logic
- `textElement.ts`, `textMeasurements.ts`, and `textWrapping.ts` for text logic
- `Scene.ts` for the scene container and cached views over elements
- `store.ts` and `delta.ts` for snapshot/delta tracking

### State Management

This is the first package in the stack that owns meaningful domain state.

Its key stateful constructs are:

- `Scene`, which owns in-memory collections and derived scene caches
- `Store`, which captures snapshots and computes deltas for durable or ephemeral changes

Most other modules are stateless helpers built around those objects.

### Relationships

This is the core business-logic layer between low-level math/common and the React editor package.

- depends on `@excalidraw/common` and `@excalidraw/math`
- powers `@excalidraw/excalidraw` scene logic, history, rendering inputs, selection, and transformations
- is reused by `@excalidraw/utils` for helpers like bounds and common element operations

## `@excalidraw/excalidraw`

### Purpose

`@excalidraw/excalidraw` is the main embeddable React editor package. It exposes Excalidraw as a React component and combines UI, runtime behavior, rendering, actions, serialization, hooks, and public APIs into one consumable package.

### Architectural Style

This package is best described as a **centralized editor-core runtime wrapped in React**.

Internally it follows a hybrid architecture:

- React component shell for integration and UI composition
- editor-core style runtime centered around a single `App` controller
- command/action pattern for user operations
- layered canvas rendering architecture
- modular services for restore/export/library/history/text/features

It is modular by responsibility, but operationally centralized around `components/App.tsx`.

### Key Modules

The package is organized as a layered editor runtime:

- `index.tsx` as the public entrypoint and API bridge
- `components/App.tsx` as the main orchestrator
- `components/` for visible editor UI
- `actions/` for command definitions and dispatch
- `scene/` and `renderer/` for rendering data and render passes
- `data/` for import/export/restore/reconcile logic
- `history.ts` for undo/redo management
- `hooks/` and `context/` for React integration
- `editor-jotai.ts` for editor-scoped atom state
- `fonts/`, `charts/`, `lasso/`, `eraser/`, and `wysiwyg/` for focused feature areas

### State Management

State management is hybrid.

The major pieces are:

- main editor/UI state in the stateful `App` component
- scene state through `Scene` and `Store` from `@excalidraw/element`
- undo/redo through `History`
- scoped atom state through Jotai in `editor-jotai.ts`
- React contexts for exposing API, app state, action manager, container, editor interface, and UI services
- fine-grained app state subscriptions through the imperative API and hooks such as `useAppStateValue()`

So the package does not use one universal store. Instead it combines:

- React state for editor and UI
- scene/store snapshots for element changes
- Jotai for narrower editor-local state
- contexts as a dependency injection layer

### Main Components and Relationships

The main runtime flow is:

1. `Excalidraw` in `index.tsx`
2. `InitializeApp`
3. internal `App`
4. context providers from `App`
5. `LayerUI`
6. canvas and overlay stack

Inside `App`, the important relationships are:

- `App` owns behavior, state, scene, history, renderer, and API
- `LayerUI` composes menus, dialogs, sidebars, footer, welcome screen, stats, and top-level chrome
- `StaticCanvas` renders the stable scene
- `NewElementCanvas` renders the in-progress element preview
- `InteractiveCanvas` renders transient interaction state and receives pointer events
- specialized overlays such as hyperlink UI, SVG trails, popups, and context menus sit beside the canvases

This layered canvas split is one of the package's key performance and clarity patterns.

### Relationships

This is the top application/library layer in `packages/`.

- depends directly on `@excalidraw/common`, `@excalidraw/element`, and `@excalidraw/math`
- re-exports some lower-level functionality for consumers
- is the package consumed by host applications and by `excalidraw-app`

## `@excalidraw/utils`

### Purpose

`@excalidraw/utils` is a consumer-facing convenience package. It provides helpers around exporting, bounds checks, and common element utility operations without requiring consumers to piece together lower-level APIs manually.

### Architectural Style

This package is a **thin facade/convenience layer**.

Its public surface in `packages/utils/src/index.ts` is intentionally small and mostly wraps higher-level Excalidraw functionality instead of owning deep editor logic.

### Key Modules

The main modules are:

- `export.ts` for high-level export helpers
- `withinBounds.ts` for containment and overlap helpers
- `bbox.ts` for bounding-box and intersection helpers
- `index.ts` for public exports, including `getCommonBounds` re-exported from `@excalidraw/element`

### State Management

This package is effectively stateless. It exports pure helpers and convenience wrappers.

### Relationships

`@excalidraw/utils` is not a foundational layer. It sits near the top of the stack:

- reuses functionality from `@excalidraw/excalidraw`
- reuses helpers from `@excalidraw/element`
- may rely on lower-level geometry and browser-related helpers indirectly

Its role is to simplify consumption, not to define core domain architecture.

## Main System Patterns

Across all packages in `packages/`, the most important patterns are:

### Layered dependency graph

The architecture intentionally separates:

- generic runtime primitives
- pure geometry
- editor domain logic
- full UI/editor runtime
- consumer convenience wrappers

### Increasing statefulness upward

Lower layers are mostly functional and reusable. Stateful runtime behavior appears mainly in:

- `@excalidraw/element` through `Scene` and `Store`
- `@excalidraw/excalidraw` through `App`, `History`, contexts, and Jotai-backed UI/runtime state

### Centralized editor orchestration

Even though the repo is split into packages, the actual editor runtime is centrally orchestrated in `@excalidraw/excalidraw/components/App.tsx`.

### Command and delta-based editing

Editor operations are modeled through:

- action/command dispatch in `@excalidraw/excalidraw`
- snapshot/delta tracking in `@excalidraw/element`
- undo/redo history in `@excalidraw/excalidraw/history.ts`

### Layered rendering

The visual editor separates:

- stable scene rendering
- in-progress element rendering
- transient interaction rendering

This is implemented in the top editor package, but built on lower-level scene and element abstractions.

## Summary

The `packages/` directory forms a coherent architecture rather than a loose monorepo collection:

- `@excalidraw/common` is the shared primitive layer
- `@excalidraw/math` is the pure geometry layer
- `@excalidraw/element` is the domain/model layer
- `@excalidraw/excalidraw` is the full editor runtime and public React package
- `@excalidraw/utils` is the convenience integration layer

If you think about the system in terms of responsibility boundaries, the architecture is:

**primitives -> math -> element domain -> editor runtime -> consumer helpers**
