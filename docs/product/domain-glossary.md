# Domain Glossary

## Element

**Definition:** The fundamental unit of a drawing. Every shape, line, text block, or image on the canvas is an Element. Each element has a unique `id`, position (`x`, `y`), dimensions, `version` (incremented on each mutation), and `versionNonce` (random, for conflict resolution).

**Key files:** `packages/element/src/types.ts` (type definitions), `packages/element/src/newElement.ts` (creation), `packages/element/src/mutateElement.ts` (immutable updates)

**Not to be confused with:** React elements or DOM elements. In Excalidraw, "element" always means a drawing object on the canvas.

## ExcalidrawElement

**Definition:** The TypeScript type for all canvas elements. A discriminated union based on `type` field. Concrete types include: `rectangle`, `ellipse`, `diamond`, `arrow`, `line`, `freedraw`, `text`, `image`, `frame`, `magicframe`, `embeddable`, `iframe`, `selection`. Each type extends a base with common fields (id, x, y, width, height, angle, strokeColor, backgroundColor, opacity, roughness, etc.).

**Key files:** `packages/element/src/types.ts` (`ExcalidrawGenericElement`, `ExcalidrawTextElement`, `ExcalidrawLinearElement`, `ExcalidrawImageElement`, etc.)

**Not to be confused with:** `AppState` — elements are drawing objects, AppState is UI/editor state.

## Scene

**Definition:** The container that holds all elements. A `Scene` instance maintains the ordered array of `ExcalidrawElement[]`, provides lookup maps (`getNonDeletedElementsMap()`), and emits update events when elements change. Elements are never truly removed — they get an `isDeleted: true` flag (soft deletion for undo/collab).

**Key files:** `packages/element/src/Scene.ts`

**Not to be confused with:** The visual viewport or the rendered output. Scene is the data model, not the view.

## AppState

**Definition:** The complete UI and editor state (~113 fields). Includes: `activeTool`, `zoom`, `scrollX`/`scrollY`, `selectedElementIds`, `theme`, `collaborators`, `editingTextElement`, `openDialog`, `openSidebar`, current drawing defaults (`currentItemStrokeColor`, `currentItemFontFamily`, etc.), and many more. Stored as React class component state in `App.tsx`.

**Key files:** `packages/excalidraw/types.ts` (interface), `packages/excalidraw/appState.ts` (defaults + storage config)

**Not to be confused with:** Scene/elements — AppState does NOT contain the drawing elements themselves.

## Tool

**Definition:** The currently selected drawing instrument. Represented by `AppState.activeTool.type`. Available tools: `selection`, `lasso`, `rectangle`, `diamond`, `ellipse`, `arrow`, `line`, `freedraw`, `text`, `image`, `eraser`, `hand`, `frame`, `magicframe`, `embeddable`, `laser`. Tools can also be `custom` (host-app defined). The `locked` flag keeps a tool active after creating an element.

**Key files:** `packages/excalidraw/types.ts` (`ToolType`, `ActiveTool`), `packages/excalidraw/components/App.tsx` (tool-specific pointer handlers)

**Not to be confused with:** Actions. A Tool defines *what* will be created; an Action defines *what operation* to perform.

## Action

**Definition:** A discrete operation that modifies elements or AppState. Every user command (change color, align, delete, copy, export, toggle grid, etc.) is an Action. Each Action implements `perform()` returning an `ActionResult` with updated elements/state, `keyTest()` for keyboard shortcuts, and optionally a `PanelComponent` for toolbar UI.

**Key files:** `packages/excalidraw/actions/types.ts` (interface), `packages/excalidraw/actions/manager.tsx` (ActionManager), `packages/excalidraw/actions/` (36 action implementations)

**Not to be confused with:** Tools. Actions are operations; Tools define the active drawing mode.

## Store

**Definition:** The change-tracking engine. On every React update (`componentDidUpdate`), `Store.commit()` compares current elements/appState to previous snapshot. It generates `DurableIncrement` deltas (recorded to History for undo/redo) and `EphemeralIncrement` deltas (sent to collaboration peers). Uses `CaptureUpdateAction` flags to control whether a change should be recorded.

**Key files:** `packages/element/src/store.ts`

**Not to be confused with:** Jotai store (separate, for UI atoms) or Redux store (not used in Excalidraw).

## Collaboration

**Definition:** Real-time multi-user editing. Implemented in `excalidraw-app/collab/` (not in the library package). Uses socket.io for WebSocket communication and Firebase for persistent storage. Scenes are end-to-end encrypted via Web Crypto API. Remote changes are merged via `reconcileElements()` using element version numbers. Collaborator presence (cursors, usernames, idle states) is tracked via `AppState.collaborators` Map.

**Key files:** `excalidraw-app/collab/Collab.tsx`, `excalidraw-app/collab/Portal.tsx`, `packages/excalidraw/data/reconcile.ts`

**Not to be confused with:** The core Excalidraw library — collab is an app-level feature, not part of `@excalidraw/excalidraw`.

## Library

**Definition:** A collection of reusable element groups that users can save and insert onto the canvas. Each `LibraryItem` has an `id`, `status` ("published"/"unpublished"), `elements` array, and `created` timestamp. Libraries can be imported/exported as JSON, shared via URL, and persisted via a `LibraryPersistenceAdapter` pattern.

**Key files:** `packages/excalidraw/data/library.ts` (Library class, persistence), `packages/excalidraw/types.ts` (`LibraryItem`, `LibraryItems`)

**Not to be confused with:** The element array on canvas. Library items are templates, not active scene elements.

## Bound Element

**Definition:** An element that is visually and logically connected to another. The primary example is text bound to a shape — the text moves, resizes, and gets deleted with its container. Arrows also "bind" to shapes at connection points. Binding is tracked via `boundElements` array on the container and `containerId` on the bound element.

**Key files:** `packages/element/src/binding.ts`, `packages/element/src/types.ts` (`BoundElement`, `ExcalidrawBindableElement`)

**Not to be confused with:** Grouping — groups are user-defined selections; bindings are structural relationships between elements.

## Linear Element

**Definition:** An element defined by an array of points rather than a bounding box. Includes `line`, `arrow`, and `freedraw` types. Linear elements support multi-point editing via `LinearElementEditor` — users can add/move/delete individual points. Arrows additionally support start/end bindings to other elements and arrowheads.

**Key files:** `packages/element/src/linearElementEditor.ts` (`LinearElementEditor`), `packages/element/src/types.ts` (`ExcalidrawLinearElement`, `ExcalidrawArrowElement`)

**Not to be confused with:** "Linear" as in "straight line" — linear elements can be curved (round arrows) or have multiple segments.

## Frame

**Definition:** A container element that visually groups and clips other elements. Elements inside a frame are clipped to its boundaries during rendering. Frames have a visible name label. `magicframe` is a variant that supports AI-powered code generation from its contents (diagram-to-code).

**Key files:** `packages/element/src/frame.ts`, `packages/excalidraw/renderer/staticScene.ts` (frame clipping logic)

**Not to be confused with:** HTML iframe or animation frame. In Excalidraw, a Frame is a grouping/clipping container on the canvas.