# System patterns

Verified against `packages/excalidraw` (especially `index.tsx`, `components/App.tsx`, `actions/`), `excalidraw-app/App.tsx`, and workspace `package.json` dependency edges.

## High-level architecture

```mermaid
flowchart TB
  subgraph app [excalidraw-app]
    Shell[React shell + collab + storage + analytics]
  end
  subgraph lib [packages/excalidraw]
    Excalidraw[Excalidraw component API]
    App[App class component]
    Shell --> Excalidraw --> App
  end
  subgraph pkgs [shared packages]
    Common[@excalidraw/common]
    Math[@excalidraw/math]
    Element[@excalidraw/element]
    Utils[@excalidraw/utils]
  end
  App --> Common
  App --> Math
  App --> Element
  lib --> Utils
  Element --> Common
  Element --> Math
  Math --> Common
```

- **`excalidraw-app`** composes product features (Firebase, socket.io, Jotai app store, dialogs) around the **library** export from `@excalidraw/excalidraw`.
- **`packages/excalidraw`** owns the editor: one large **`App` class component** coordinates canvas, scene, history, and UI.

## Public API pattern (embed)

- **`Excalidraw`** (`packages/excalidraw/index.tsx`) is the primary export: wraps internal `App`, applies polyfills, loads SCSS/fonts, and exposes optional **`ExcalidrawAPIProvider`** / hooks for using the imperative API outside the subtree.
- Host apps must import **`@excalidraw/excalidraw/index.css`** (see `packages/excalidraw/README.md`) and give the component a **non-zero height** container.

## Editor core: state and document model

Inside `App` (`packages/excalidraw/components/App.tsx`), construction sets up:

- **`Scene`** — holds element graph / scene-level concerns used by rendering and interaction.
- **`Store`** + **`History`** — mutation and undo/redo pipeline tied to the store.
- **Canvas + RoughJS** — `rough.canvas(...)` for the hand-drawn stroke rendering.
- **`Renderer`** — dedicated renderer instance for scene output.
- **`ActionManager`** — registers and dispatches editor commands.

Element-level geometry, types, and helpers live primarily in **`@excalidraw/element`**; vector math in **`@excalidraw/math`**; shared constants and helpers in **`@excalidraw/common`**.

## Action system

- Actions are defined as objects implementing **`Action`** (`packages/excalidraw/actions/types.ts`): `name`, `perform`, optional `keyTest`, `predicate`, UI metadata, analytics `trackEvent`, etc.
- **`register()`** (`actions/register.ts`) accumulates the default action list at module load.
- **`ActionManager`** (`actions/manager.tsx`) registers actions and runs them; `App` calls **`registerAll(actions)`** plus undo/redo actions wired to **`History`**.

This pattern keeps keyboard shortcuts, menus, and programmatic operations on a **single perform() abstraction**.

## State management split

- **Editor-internal**: Jotai usage appears in the editor package (e.g. `editor-jotai`, atoms updated from `App`) for scoped reactive UI state.
- **Product shell**: `excalidraw-app` uses **Jotai** (`app-jotai`) for app-level concerns (e.g. collaboration API atoms referenced from `App.tsx`).

## Data flow (conceptual)

- User input → **`App` handlers** → mutations via **store/history** → **scene** updates → **canvas render** (RoughJS + internal renderer).
- Import/export, library, and collaboration paths live under **`packages/excalidraw/data/`** and related modules; the hosted app adds persistence and network sync layers.

## Build and consumption pattern

- **Development** in the monorepo resolves `@excalidraw/*` to **TypeScript sources** via `tsconfig` paths and Vite aliases.
- **Published npm workflow** builds **`dist/dev`**, **`dist/prod`**, and type stubs per package `exports` in each `package.json`.

## Testing pattern

- **Vitest** at repo root with **path aliases mirroring `tsconfig`**, **`jsdom`**, `setupFiles: ./setupTests.ts`, and coverage thresholds in `vitest.config.mts`.
- Component tests in `packages/excalidraw/tests/` use Testing Library (declared in `packages/excalidraw/package.json`).

## Extension points (for integrators)

- **`Excalidraw` props** (`types`): callbacks such as `onChange`, `onExport`, `initialData`, UI slots (`renderTopLeftUI`, etc.), theme and mode flags — see `packages/excalidraw/types` / `index.tsx` usage.
- **Examples** under `examples/` show alternate hosts (Vite, Next.js) consuming the same package patterns.

## Related documentation

- [`../technical/architecture.md`](../technical/architecture.md) — expanded topology and boundaries (overlaps this file by design).
- [`../product/domain-glossary.md`](../product/domain-glossary.md) — definitions for Scene, AppState, Action, Tool, Element.
