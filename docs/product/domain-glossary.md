# Excalidraw — Domain Glossary

## Core Concepts

### ExcalidrawElement

**Definition:** The base type for all objects on the canvas. Every element has an `id`, position (`x`, `y`), dimensions (`width`, `height`), rotation (`angle`), visual properties (`strokeColor`, `backgroundColor`, `fillStyle`, `strokeWidth`, `opacity`, `roughness`), and metadata (`version`, `versionNonce`, `index`, `seed`).

**Де використовується:** `packages/element/src/types.ts` (type definitions), `packages/element/src/newElement.ts` (factories), `packages/element/src/Scene.ts` (`SceneElementsMap`)

**НЕ плутати з:** React Element (a virtual DOM node). An `ExcalidrawElement` is a data object representing a drawing primitive, not a UI component.

### Scene

**Definition:** The collection of all elements currently loaded in the editor, managed by the `Scene` class. The scene provides methods to add, remove, query, and reorder elements. It maintains a `SceneElementsMap` for indexed access by element ID.

**Де використовується:** `packages/element/src/Scene.ts` (class implementation), referenced by `ActionManager` and rendering pipelines

**НЕ плутати з:** The visible viewport. The scene is the full infinite canvas containing all elements, while the viewport shows only the visible portion.

### AppState

**Definition:** The mutable state object that tracks everything outside of elements: current tool, viewport position, zoom level, selected element IDs, UI panel visibility, grid settings, and collaboration status.

**Де використовується:** `packages/excalidraw/appState.ts` (defaults and type), returned by `Action.perform()`, consumed by all UI components and renderers

**НЕ плутати з:** React component state. AppState is a global editor state object managed by the action system, not local component state via `useState`.

### Action

**Definition:** A discrete, named operation that modifies elements and/or AppState. Actions are the only sanctioned way to change application state. Each action has a `perform()` function, optional keyboard binding (`keyTest`), and optional UI panel (`PanelComponent`). Managed by `ActionManager`.

**Де використовується:** `packages/excalidraw/actions/` (48 action files), `packages/excalidraw/actions/index.ts` (registration), `packages/excalidraw/actions/manager.tsx` (`ActionManager` dispatching)

**НЕ плутати з:** Redux actions. Excalidraw actions are objects with executable methods (`perform()`), not plain data payloads dispatched to a reducer.

### Tool

**Definition:** A drawing mode that determines how pointer events are interpreted on the canvas. Each tool (selection, rectangle, arrow, text, etc.) changes what happens on click/drag. The active tool is stored in `appState.activeTool`.

**Де використовується:** `packages/excalidraw/components/App.tsx` (tool state and event routing), `packages/excalidraw/components/Actions.tsx` (toolbar rendering), `packages/common/src/constants.ts` (tool type constants)

**НЕ плутати з:** Action. A Tool defines a drawing mode (what the cursor does), while an Action is a discrete state-changing operation. Selecting a tool is itself an action, but the tool determines ongoing pointer behavior.

### Canvas (Rendering Surface)

**Definition:** Excalidraw uses multiple HTML `<canvas>` elements layered on top of each other: StaticCanvas (rendered elements), InteractiveCanvas (selection UI, snap guides, cursors), and NewElementCanvas (element being actively drawn).

**Де використовується:** `packages/excalidraw/components/canvases/StaticCanvas.tsx`, `packages/excalidraw/components/canvases/InteractiveCanvas.tsx`, `packages/excalidraw/components/canvases/NewElementCanvas.tsx`

**НЕ плутати з:** The abstract "canvas" concept (the infinite drawing area). The HTML canvases are finite viewport-sized surfaces that render a portion of the infinite scene.

## Element Types

### Linear Element

**Definition:** An element defined by a series of points rather than a bounding box. Includes `line`, `arrow`, and `freedraw` types. Linear elements support interactive point editing.

**Де використовується:** `packages/element/src/linearElementEditor.ts` (`LinearElementEditor` — 72KB), `packages/element/src/types.ts` (`ExcalidrawLinearElement`)

**НЕ плутати з:** Container elements (rectangle, diamond, ellipse) which are defined by a bounding box, not a point array.

### Bound Element

**Definition:** An element that is logically attached to another. Most commonly, text bound inside a container (rectangle, ellipse, diamond) or an arrow bound to a shape endpoint.

**Де використовується:** `packages/element/src/binding.ts` (binding logic — 84KB), element properties `boundElements` (on containers) and `containerId` (on bound text)

**НЕ плутати з:** Grouped elements. Bound elements have a structural dependency (e.g., text resizes with its container), while grouped elements are merely selected together via `groupIds`.

### Frame

**Definition:** An artboard-like container element that clips its children to its bounds. Used for organizing sections of a diagram. Elements inside a frame move with it and are clipped during export.

**Де використовується:** `packages/element/src/frame.ts` (26KB), type `ExcalidrawFrameElement` in `packages/element/src/types.ts`

**НЕ плутати з:** Group. A frame is a visible container with clipping boundaries, while a group is an invisible logical association of elements.

### Embeddable

**Definition:** An element that renders external content (YouTube videos, websites) via an embedded iframe. Uses an allowlist for permitted domains.

**Де використовується:** Type `ExcalidrawEmbeddableElement` in `packages/element/src/types.ts`, rendering in `packages/excalidraw/components/`

**НЕ плутати з:** Image element. Embeddables are live interactive iframes, while images are static raster content.

## Architecture Concepts

### Fractional Index

**Definition:** A string-based ordering key (`element.index`) that allows elements to be inserted between existing elements without reindexing the entire array. Critical for conflict-free multiplayer editing.

**Де використовується:** `packages/element/src/fractionalIndex.ts`, `element.index` property on every `ExcalidrawElement`

**НЕ плутати з:** Array index or z-index CSS property. Fractional indices are string keys (e.g., "a0", "a1") designed for concurrent insertion, not integer positions.

### StoreDelta

**Definition:** An incremental change record capturing which element properties changed and their before/after values. Used for both undo/redo history and real-time collaboration sync.

**Де використовується:** `packages/element/src/store.ts` (29KB), `packages/excalidraw/history.ts` (history stacks)

**НЕ плутати з:** Full state snapshot. A delta records only what changed, not the entire state, making it efficient for network sync and memory usage.

### Viewport vs Scene Coordinates

**Definition:** Two coordinate systems used in Excalidraw. **Scene coordinates** are absolute positions on the infinite canvas (`element.x`, `element.y`). **Viewport coordinates** are pixel positions on the visible screen.

**Де використовується:** Transform functions `sceneCoordsToViewportCoords()` and `viewportCoordsToSceneCoords()` in `packages/excalidraw/`, used by all event handlers and renderers

**НЕ плутати з:** CSS coordinates. Viewport coordinates account for canvas offset, zoom, and scroll, while CSS coordinates are relative to the DOM element.

## Collaboration

### Portal

**Definition:** The abstraction layer for real-time data sync in collaborative sessions. Manages the Socket.io connection, broadcasts deltas, and receives remote changes.

**Де використовується:** `excalidraw-app/collab/Portal.tsx`, `excalidraw-app/collab/Collab.tsx`

**НЕ плутати з:** React Portal (`createPortal`). Excalidraw's Portal is a data sync mechanism, not a DOM rendering utility.

### Presence

**Definition:** The system that shares collaborator state in real-time: cursor position, active tool, selected elements, and username. Rendered as colored pointers on the InteractiveCanvas.

**Де використовується:** `excalidraw-app/collab/Collab.tsx`, `packages/excalidraw/renderer/interactiveScene.ts` (cursor rendering)

**НЕ плутати з:** Element selection state. Presence is about showing where other users are, while selection is about which elements the current user has chosen.

### Room

**Definition:** A collaborative session identified by a unique room ID. Created when a user clicks "Live collaboration." All participants in a room see each other's changes and cursors in real-time.

**Де використовується:** `excalidraw-app/collab/Collab.tsx`, `excalidraw-app/collab/Portal.tsx`

**НЕ плутати з:** Scene. A room is a network session for collaboration, while a scene is the local collection of drawing elements.
