# Excalidraw — Domain Glossary

## Core Concepts

### ExcalidrawElement

The base type for all objects on the canvas. Every element has an `id`, position (`x`, `y`), dimensions (`width`, `height`), rotation (`angle`), visual properties (`strokeColor`, `backgroundColor`, `fillStyle`, `strokeWidth`, `opacity`, `roughness`), and metadata (`version`, `versionNonce`, `index`, `seed`).

**Do not confuse with:** React Element (a virtual DOM node). An ExcalidrawElement is a data object, not a UI component.

### Scene

The collection of all elements currently loaded in the editor, managed by the `Scene` class (`packages/element/src/Scene.ts`). The scene provides methods to add, remove, query, and reorder elements. It maintains a `SceneElementsMap` for indexed access.

**Do not confuse with:** The visible viewport — the scene is the full infinite canvas, while the viewport shows only part of it.

### AppState

The mutable state object that tracks everything outside of elements: current tool, viewport position, zoom level, selected element IDs, UI panel visibility, grid settings, and collaboration status. Defaults defined in `packages/excalidraw/appState.ts`.

### Action

A discrete, named operation that modifies elements and/or AppState. Actions are the only sanctioned way to change application state. Each action has a `perform()` function, optional keyboard binding (`keyTest`), and optional UI panel (`PanelComponent`). Managed by `ActionManager`.

**Do not confuse with:** Redux actions. Excalidraw actions are objects with executable methods, not plain data payloads.

### Canvas (Rendering Surface)

Excalidraw uses multiple HTML `<canvas>` elements layered on top of each other: StaticCanvas (rendered elements), InteractiveCanvas (selection UI, snap guides, cursors), and NewElementCanvas (element being actively drawn).

**Do not confuse with:** The abstract "canvas" concept (the infinite drawing area). The HTML canvases are finite viewport-sized surfaces.

## Element Types

### Linear Element

An element defined by a series of points rather than a bounding box. Includes `line`, `arrow`, and `freedraw` types. Linear elements support point editing via `LinearElementEditor`.

### Bound Element

An element that is logically attached to another. Most commonly, text bound inside a container (rectangle, ellipse, diamond) or an arrow bound to a shape endpoint. Managed by the binding system in `packages/element/src/binding.ts`.

**Do not confuse with:** Grouped elements. Bound elements have a structural dependency (e.g., text resizes with its container), while grouped elements are merely selected together.

### Frame

An artboard-like container element (`ExcalidrawFrameElement`) that clips its children to its bounds. Used for organizing sections of a diagram. Elements inside a frame move with it and are clipped to its boundaries during export.

### Embeddable

An element that renders external content (YouTube videos, websites) via an embedded iframe. Type: `ExcalidrawEmbeddableElement`. Uses an allowlist for permitted domains.

## Visual Properties

### Roughness

Controls the intensity of the hand-drawn sketch effect (0 = clean, 1 = artist, 2 = cartoonist). Applied via Rough.js during rendering. The `seed` property ensures consistent random strokes for the same element.

### Fill Style

The pattern used to fill a shape's interior: `hachure` (parallel lines), `cross-hatch` (crossed lines), `solid` (flat fill), `zigzag`, `zigzag-line`. Rendered by Rough.js.

### Stroke Style

The line pattern for element borders: `solid`, `dashed`, or `dotted`.

### Roundness

Determines corner shape. Can be `null` (sharp corners) or an object specifying the rounding algorithm. "Round" corners use adaptive or proportional radius.

## Architecture Concepts

### Fractional Index

A string-based ordering key (`element.index`) that allows elements to be inserted between existing elements without reindexing the entire array. Critical for conflict-free multiplayer editing. Implementation in `packages/element/src/fractionalIndex.ts`.

### StoreDelta

An incremental change record capturing which element properties changed and their before/after values. Used for both undo/redo history and real-time collaboration sync. Defined in `packages/element/src/store.ts`.

### Viewport vs Scene Coordinates

**Scene coordinates**: absolute position on the infinite canvas (element.x, element.y).
**Viewport coordinates**: pixel position on the visible screen.
Transform functions: `sceneCoordsToViewportCoords()` and `viewportCoordsToSceneCoords()`.

## Tools

### Selection Tool

The default tool. Click to select elements, drag to move, Shift+click for multi-select, drag from empty space for box selection.

### Hand Tool

Pans the viewport without selecting or modifying elements. Activated via toolbar, `H` key, or holding Space while dragging.

### Eraser Tool

Removes elements by clicking or dragging over them. Does not delete immediately — marks elements for deletion on pointer up.

### Lasso Tool

Free-form selection by drawing a loop around elements. Elements fully enclosed by the lasso path are selected.

## Collaboration

### Portal

The abstraction layer for real-time data sync in collaborative sessions (`excalidraw-app/collab/Portal.tsx`). Manages the Socket.io connection, broadcasts deltas, and receives remote changes.

### Presence

The system that shares collaborator state in real-time: cursor position, active tool, selected elements, and username. Rendered as colored pointers on the InteractiveCanvas.

### Room

A collaborative session identified by a unique room ID. Created when a user clicks "Live collaboration." All participants in a room see each other's changes and cursors in real-time.
