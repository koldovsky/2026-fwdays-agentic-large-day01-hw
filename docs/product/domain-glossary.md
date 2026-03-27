# Domain Glossary

Alphabetical list of domain terms as used in this codebase. Definitions are project-specific, not generic.

## Action

- **Definition**: A registered operation that can be triggered by keyboard shortcut, menu item, or programmatic dispatch. Each action has a `name` (from the `ActionName` union), a `perform()` function that receives elements and appState and returns an `ActionResult` containing updated elements/appState and a `CaptureUpdateAction` directive.
- **Don't confuse with**: Generic "action" in Redux/Flux. Here an Action is a self-contained object with `perform()`, `keyTest()`, and optional `PanelComponent` — not a plain type/payload message.
- **Key files**:
  - `packages/excalidraw/actions/types.ts` — `Action` interface, `ActionName` union, `ActionResult` type
  - `packages/excalidraw/actions/manager.tsx` — `ActionManager` class (registry, dispatch)
  - `packages/excalidraw/actions/index.ts` — action registration
  - `packages/excalidraw/actions/actionCanvas.tsx` — canvas-related actions
  - `packages/excalidraw/actions/actionProperties.tsx` — property editing actions

## AppState

- **Definition**: The central application state interface containing ~80+ fields that describe the entire UI and editing state: active tool, current item defaults, viewport (zoom/scroll), selection, editing mode, collaborators, dialogs, export settings, and theme. Not to be confused with Jotai atoms — this is an imperative state object managed by the `App` class component.
- **Don't confuse with**: React component state or a global Redux store. `AppState` is a single TypeScript interface managed imperatively inside the `App` class, separate from the Jotai atom system.
- **Key files**:
  - `packages/excalidraw/types.ts` — `AppState` interface definition (line 272)
  - `packages/excalidraw/appState.ts` — `getDefaultAppState()` with all default values
  - `packages/excalidraw/components/App.tsx` — state management and updates

## Collaboration

- **Definition**: The real-time multi-user editing system. The `Collab` class manages the collaboration lifecycle: room creation, socket connection, scene broadcasting, element reconciliation, cursor syncing, and file (image) synchronization via Firebase. Uses Socket.IO for real-time transport and Firebase Firestore for persistent storage. Scenes are end-to-end encrypted using the room key from the URL hash.
- **Don't confuse with**: Generic WebSocket messaging. Collaboration here is an integrated system that combines Socket.IO transport, Firebase persistence, AES-GCM encryption, and version-based element reconciliation into a single lifecycle managed by the `Collab` class.
- **Key files**:
  - `excalidraw-app/collab/Collab.tsx` — `Collab` PureComponent class, collaboration lifecycle
  - `excalidraw-app/collab/Portal.tsx` — `Portal` class, Socket.IO connection management
  - `excalidraw-app/data/firebase.ts` — Firebase read/write operations
  - `packages/excalidraw/data/reconcile.ts` — `reconcileElements()` for merging remote changes
  - `packages/excalidraw/data/encryption.ts` — `encryptData()` / `decryptData()`

## Element

- **Definition**: The base drawing primitive on the canvas. Every shape, line, text, image, or frame is an element. Elements are plain objects conforming to `_ExcalidrawElementBase` with fields like `id`, `x`, `y`, `width`, `height`, `type`, `version`, `versionNonce`, `index` (FractionalIndex), `isDeleted`, `groupIds`, `boundElements`, `seed`. Elements are never removed from the array — they are soft-deleted by setting `isDeleted: true`.
- **Don't confuse with**: DOM elements or React elements. An Excalidraw Element is a plain data object describing a canvas shape — it has no DOM representation and is rendered to `<canvas>` via Rough.js.
- **Key files**:
  - `packages/element/src/types.ts` — `_ExcalidrawElementBase`, all element type definitions
  - `packages/element/src/newElement.ts` — element creation functions
  - `packages/element/src/mutateElement.ts` — `mutateElement()` for in-place updates

## ExcalidrawElement

- **Definition**: The TypeScript discriminated union type covering all element variants. Discriminated on the `type` field with variants: `selection`, `rectangle`, `diamond`, `ellipse`, `embeddable`, `iframe`, `image`, `frame`, `magicframe`, `freedraw`, `line`, `arrow`, `text`. Specialized subtypes include `ExcalidrawLinearElement` (line + arrow with `points` array), `ExcalidrawTextElement` (with `text`, `fontSize`, `fontFamily`), `ExcalidrawImageElement` (with `fileId`, `status`, `scale`, `crop`).
- **Don't confuse with**: A single concrete type. `ExcalidrawElement` is a union — you always narrow it via the `type` discriminant or type guard functions like `isLinearElement()`, `isTextElement()`.
- **Key files**:
  - `packages/element/src/types.ts` — all variant type definitions (449 lines)
  - `packages/element/src/typeChecks.ts` — type guard functions (`isLinearElement`, `isTextElement`, etc.)

## History

- **Definition**: The undo/redo system built on the delta-based `Store`. `History` maintains `undoStack` and `redoStack` arrays of `HistoryDelta` objects. Each delta captures the inverse of a durable state change. Undo pops from undo stack, applies the delta, and pushes the inverse onto redo. History skips entries that produce no visible change (e.g., selection-only appState changes don't clear redo stack).
- **Don't confuse with**: Browser `window.history` or a simple command stack. This History operates on element/appState deltas, not URL navigation, and uses `CaptureUpdateAction` to classify which changes are undoable vs remote-only.
- **Key files**:
  - `packages/excalidraw/history.ts` — `History` class, `HistoryDelta` class
  - `packages/element/src/store.ts` — `Store`, `StoreSnapshot`, `StoreChange`, `StoreDelta`
  - `packages/element/src/delta.ts` — `ElementsDelta`, `AppStateDelta`, `Delta`

## Library

- **Definition**: A collection of reusable element groups that users can save and load. Library items are arrays of elements that can be dragged onto the canvas. Stored in IndexedDB via `LibraryIndexedDBAdapter`. Libraries can be imported/exported as JSON files and shared via URL. The `Library` class manages the item lifecycle with add/remove/update operations.
- **Don't confuse with**: npm packages or the `@excalidraw/excalidraw` library package. A Library here is a user-facing feature for saving and reusing drawing element groups, persisted in IndexedDB.
- **Key files**:
  - `packages/excalidraw/data/library.ts` — `Library` class, `useHandleLibrary` hook
  - `excalidraw-app/data/LocalData.ts` — `LibraryIndexedDBAdapter`, `LibraryLocalStorageMigrationAdapter`
  - `packages/excalidraw/types.ts` — `LibraryItem`, `LibraryItems` types

## Renderer

- **Definition**: The canvas rendering system with two layers. The static scene renderer draws all elements (shapes via Rough.js, text, images, grid, link handles) onto one canvas. The interactive scene renderer draws selection UI, transform handles, collaborator cursors/pointers, binding previews, and snapping guides onto a second canvas. Both renderers are throttled via `throttleRAF`.
- **Don't confuse with**: React's virtual DOM rendering. The Renderer here draws directly onto HTML `<canvas>` elements using the 2D Canvas API and Rough.js — React only manages the canvas DOM nodes, not their pixel content.
- **Key files**:
  - `packages/excalidraw/renderer/staticScene.ts` — static canvas rendering
  - `packages/excalidraw/renderer/interactiveScene.ts` — interactive canvas rendering
  - `packages/element/src/renderElement.ts` — per-element rendering logic
  - `packages/element/src/shape.ts` — Rough.js shape generation
  - `packages/excalidraw/renderer/helpers.ts` — canvas bootstrap and dimension utilities

## Scene

- **Definition**: The container/manager for the element array. `Scene` class maintains the authoritative list of elements, provides filtered views (non-deleted elements, selected elements), maps for O(1) element lookup, and emits change callbacks. It handles fractional index validation, element insertion/replacement, and selection hash caching.
- **Don't confuse with**: A "scene" in a game engine or 3D context. Here Scene is a data manager class for a flat array of 2D elements — no scene graph, no hierarchy, no spatial partitioning.
- **Key files**:
  - `packages/element/src/Scene.ts` — `Scene` class (471 lines)
  - `packages/excalidraw/components/App.tsx` — creates and owns the Scene instance

## Tool

- **Definition**: A drawing or interaction mode selected by the user. The `ToolType` union includes: `selection`, `lasso`, `rectangle`, `diamond`, `ellipse`, `arrow`, `line`, `freedraw`, `text`, `image`, `eraser`, `hand`, `frame`, `magicframe`, `embeddable`, `laser`. The active tool is stored in `appState.activeTool` which includes `type`, `customType` (for plugin tools), `locked` (stay on tool after drawing), and `lastActiveTool` (for reverting from eraser/hand).
- **Don't confuse with**: A build tool or CLI tool. A Tool here is a user-facing drawing mode that determines how pointer events are interpreted on the canvas.
- **Key files**:
  - `packages/excalidraw/types.ts` — `ToolType`, `ActiveTool`, `ElementOrToolType` types
  - `packages/excalidraw/components/App.tsx` — tool handling in pointer event handlers
  - `packages/excalidraw/appState.ts` — default tool state

## Cross-References

- For architecture details → see [`docs/technical/architecture.md`](../technical/architecture.md)
- For system patterns → see [`docs/memory/systemPatterns.md`](../memory/systemPatterns.md)
- For tech stack → see [`docs/memory/techContext.md`](../memory/techContext.md)
