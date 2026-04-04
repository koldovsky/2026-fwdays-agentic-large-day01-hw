# System patterns — Excalidraw architecture

## High-level shape

- **React component shell** (`packages/excalidraw/components/`, `App.tsx` and related) hosts UI, menus, and hooks into the editor.
- **Scene model** combines:
  - **`ExcalidrawElement[]`** — serializable drawing primitives (rectangles, lines, text, etc.) owned and validated in **`@excalidraw/element`** (`packages/element/`).
  - **`AppState`** — UI/camera/tool settings (zoom, selection, view mode, etc.), defined and defaulted in the excalidraw package (e.g. `appState`, `types`).
- **Rendering** turns the scene + app state into **canvas** (and SVG for export) output using **`roughjs`** for the sketch style and dedicated render modules under `packages/excalidraw/renderer/` (e.g. static SVG export via `renderer/staticSvgScene.ts`).

## Action system

- User operations (toolbar, keyboard shortcuts, context menu) are modeled as **actions** registered with an **`ActionManager`** (`packages/excalidraw/actions/manager` and related action modules).
- Components obtain the manager via **`useExcalidrawActionManager()`** (see `components/App` and consumers such as `components/main-menu/DefaultItems.tsx`).
- Actions call into mutations of elements / `AppState` and integrate with history where applicable.

## State management patterns

- **Transient UI and global editor state** use **Jotai** atoms/scopes in the React layer (`jotai`, `jotai-scope` in `packages/excalidraw/package.json`).
- **Scene + history** remain tied to the element graph and app-state reducers—not “generic React state” for every pixel—keeping undo/redo and collaboration semantics tractable.

## Canvas vs DOM

- **Primary drawing surface**: HTML **Canvas** for interactive rendering and performance.
- **DOM**: overlays for text editing (WYSIWYG), UI chrome, and accessibility; see `wysiwyg/` and component tree under `components/`.

## Package boundaries (mental model)

- **`@excalidraw/element`**: geometry, binding, typing of elements, deltas for history.
- **`@excalidraw/common`**: shared utilities and constants across packages.
- **`@excalidraw/math`**: vector/matrix helpers for transforms and hit testing.
- **`@excalidraw/excalidraw`**: full editor experience, actions, renderer, and public React API.

## Extension points

- New **tools** and **actions** plug into the action manager and tool registration rather than bypassing the scene model.
- **Export** flows reuse renderer helpers (e.g. `renderSceneToSvg` in `renderer/staticSvgScene.ts`) so on-screen and exported scenes stay consistent.
