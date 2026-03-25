# Excalidraw Domain Glossary

A reference for terms as they are used in the Excalidraw codebase. Each entry clarifies project-specific meaning to prevent confusion with common/generic usage.

---

## Element

**Definition:** The fundamental drawable unit on the canvas. Every shape, line, text, image, or embedded content is an `ExcalidrawElement`. All elements share a common base type (`_ExcalidrawElementBase`) with geometry, styling, versioning, and grouping fields.

**Where used:**
- `packages/element/src/types.ts` — base type and all subtypes defined here
- `packages/excalidraw/components/App.tsx` — elements are read and mutated throughout the editor
- `packages/excalidraw/actions/types.ts` — actions receive and return element arrays

**Do NOT confuse with:** A generic HTML DOM element or React element. An Excalidraw Element is a plain data object (not a DOM node) describing what to draw on the canvas.

---

## ExcalidrawElement

**Definition:** The TypeScript union type covering all drawable element subtypes: `rectangle`, `diamond`, `ellipse`, `line`, `arrow`, `text`, `image`, `freedraw`, `frame`, `magicframe`, `iframe`/`embeddable`. Each subtype extends `_ExcalidrawElementBase`.

**Where used:**
- `packages/element/src/types.ts` — canonical definition
- Used as the element array type throughout `packages/excalidraw/` and `excalidraw-app/`

**Do NOT confuse with:** The base type `_ExcalidrawElementBase` (internal, not exported). `ExcalidrawElement` is the exported union of all concrete subtypes.

---

## Scene

**Definition:** The stateful registry of all elements currently in the editor. The `Scene` class (in `packages/element/src/Scene.ts`) owns the element array, maintains a `Map<id, element>` index, and notifies subscribers when elements change. It is the single source of truth for what exists on the canvas.

**Where used:**
- `packages/element/src/Scene.ts` — class definition
- `packages/excalidraw/components/App.tsx` — holds a `Scene` instance
- `packages/excalidraw/data/reconcile.ts` — collab sync merges into the scene

**Do NOT confuse with:** A visual "scene" as in a rendered frame. The `Scene` is a data container (an in-memory store), not a rendering construct.

---

## AppState

**Definition:** A plain TypeScript object that holds all editor UI and session state that is not part of the element data: zoom level, scroll position, active tool, selected element IDs, theme, export settings, grid mode, sidebar visibility, and more. Defaults are defined in `packages/excalidraw/appState.ts`.

**Where used:**
- `packages/excalidraw/appState.ts` — `getDefaultAppState()` factory
- `packages/excalidraw/types.ts` — `AppState` type definition
- `packages/excalidraw/components/App.tsx` — held as React state, passed down the tree
- `packages/excalidraw/actions/types.ts` — actions receive and return `Partial<AppState>`

**Do NOT confuse with:** The element data (stored in `Scene`). `AppState` is ephemeral UI state; elements are the persistent drawing data. `AppState` is also distinct from Jotai atoms — it is a single plain object, not a reactive store.

---

## Action

**Definition:** A named, registered handler for a user operation. Each action has a `name` (from `ActionName`), a `perform` function, optional keyboard shortcut (`keyTest`), optional `PanelComponent` for toolbar rendering, and a `captureUpdate` field that controls undo/redo history. Actions are triggered from the toolbar, keyboard shortcuts, context menu, or the command palette.

**Where used:**
- `packages/excalidraw/actions/types.ts` — `Action` interface and `ActionName` union type
- `packages/excalidraw/actions/register.ts` — `register()` for registering actions
- `packages/excalidraw/actions/*.ts` — ~100 individual action modules
- `packages/excalidraw/components/App.tsx` — `ActionManager` dispatches actions

**Do NOT confuse with:** A Redux action or a generic event handler. Excalidraw actions are self-contained objects that transform elements and/or appState and declare history behavior.

---

## Tool

**Definition:** The currently active drawing or interaction mode selected by the user. `ToolType` is a string literal union: `"selection"`, `"lasso"`, `"rectangle"`, `"diamond"`, `"ellipse"`, `"arrow"`, `"line"`, `"freedraw"`, `"text"`, `"image"`, `"eraser"`, `"hand"`, `"frame"`, `"magicframe"`, `"embeddable"`, `"laser"`. The active tool is stored as `appState.activeTool`.

**Where used:**
- `packages/excalidraw/types.ts` — `ToolType` and `ActiveTool` types
- `packages/excalidraw/appState.ts` — `activeTool` default (`"selection"`)
- `packages/excalidraw/components/App.tsx` — tool-specific event handling logic

**Do NOT confuse with:** An `Action`. Tools change the drawing mode; actions perform discrete operations. Selecting the rectangle tool is a tool change; deleting an element is an action.

---

## Collaboration / Collab

**Definition:** The real-time multi-user editing feature. Users join a shared room via a URL. Changes are broadcast over Socket.io WebSocket to `oss-collab.excalidraw.com` (prod) or `localhost:3002` (dev). Each connected user is a `Collaborator` with a cursor position, username, and selected elements. Conflict resolution uses version-based reconciliation (`packages/excalidraw/data/reconcile.ts`).

**Where used:**
- `excalidraw-app/collab/Collab.tsx` — WebSocket event handling and sync logic
- `packages/excalidraw/data/reconcile.ts` — merge algorithm (higher `version` wins; `versionNonce` as tiebreaker)
- `packages/excalidraw/types.ts` — `Collaborator`, `SocketId`, `UserToFollow` types
- `packages/excalidraw/appState.ts` — `collaborators: Map<SocketId, Collaborator>`

**Do NOT confuse with:** Firebase sync (used for persistent room storage) vs. Socket.io sync (used for live cursor/element broadcast). Both are part of collaboration, but they serve different roles.

---

## Library

**Definition:** A user-curated collection of reusable element groups (`LibraryItem[]`). Each `LibraryItem` contains a set of `ExcalidrawElement`s that can be dragged onto the canvas. Libraries can be loaded from `.excalidrawlib` JSON files or from URLs. The `Library` class (`packages/excalidraw/data/library.ts`) manages loading, persistence, and merging.

**Where used:**
- `packages/excalidraw/data/library.ts` — `Library` class, `LibraryItems` type, persistence adapters
- `packages/excalidraw/types.ts` — `Library` imported as a type
- `packages/excalidraw/actions/actionAddToLibrary.ts` — action to save selection to library
- `packages/excalidraw/index.tsx` — library-related props exposed in public API

**Do NOT confuse with:** The npm package library (`@excalidraw/excalidraw`). In the product domain, "Library" means the user's saved shape collection, not the published package.

---

## Frame

**Definition:** A special container element (`type: "frame"` or `type: "magicframe"`) that groups child elements and can be exported as a standalone section of the canvas. Frames have a title and clip their contents visually. `MagicFrame` additionally supports AI-assisted generation.

**Where used:**
- `packages/element/src/types.ts` — `ExcalidrawFrameElement`, `ExcalidrawMagicFrameElement`
- `packages/excalidraw/actions/actionFrame.ts` — frame-related actions
- `packages/excalidraw/components/App.tsx` — frame rendering and hit-testing logic

**Do NOT confuse with:** A rendering frame (animation frame) or an `<iframe>` HTML element. Excalidraw `frame` elements are grouping/export containers in the scene data.

---

## BinaryFiles

**Definition:** A `Record<elementId, BinaryFileData>` dictionary mapping image element IDs to their binary content (data URL, MIME type, timestamps). Stored separately from the element array because binary data is large and handled differently during sync and export.

**Where used:**
- `packages/excalidraw/types.ts` — `BinaryFiles` and `BinaryFileData` types
- `packages/excalidraw/actions/types.ts` — `ActionResult` can include `files`
- `excalidraw-app/data/` — Firebase Storage upload/download

**Do NOT confuse with:** The `ExcalidrawImageElement` in the scene (which holds only the `fileId` reference). The actual binary content lives in `BinaryFiles`, not in the element itself.

---

## Reconciliation

**Definition:** The algorithm that merges element updates from remote collaborators into the local scene without data loss. For each incoming element, the algorithm compares `version` numbers — higher wins. If versions are equal, `versionNonce` is used as a deterministic tiebreaker (lower nonce wins). Elements currently being edited locally are protected from remote overwrite.

**Where used:**
- `packages/excalidraw/data/reconcile.ts` — `reconcileElements()` function
- `excalidraw-app/collab/Collab.tsx` — called on every incoming Socket.io message

**Do NOT confuse with:** React reconciliation (diffing virtual DOM). Excalidraw reconciliation is a data-layer merge of collaborative element updates.

---

## FractionalIndex

**Definition:** A string-encoded position value (branded type `FractionalIndex`) assigned to each element as its `index` field. Fractional indices allow inserting elements between existing ones in z-order without renumbering the entire array. Essential for stable ordering during concurrent edits.

**Where used:**
- `packages/element/src/types.ts` — `FractionalIndex` branded type; `index` field on base element
- `packages/element/src/Scene.ts` — `syncMovedIndices`, `syncInvalidIndices`, `validateFractionalIndices`
- Library: `fractional-indexing` 3.2.0

**Do NOT confuse with:** Array index (numeric position). `FractionalIndex` is a string like `"a0"` or `"a0V"`, not a number, and it encodes relative order rather than absolute position.

---

## CaptureUpdateActionType

**Definition:** A value returned inside `ActionResult` that tells the history system how to handle the action: whether to record it as an undoable step (`"immediately"`), defer it (`"eventually"`), or skip history entirely (`"never"`). Controls undo/redo granularity.

**Where used:**
- `packages/excalidraw/actions/types.ts` — `captureUpdate` field of `ActionResult`
- `packages/element/` — `CaptureUpdateActionType` type exported from element package

**Do NOT confuse with:** A generic event type or middleware action type. It is specific to the undo/redo history pipeline.

---

## ExcalidrawAPI

**Definition:** The imperative API object returned to host applications via the `onExcalidrawAPI` prop. Exposes methods like `getSceneElements()`, `updateScene()`, `scrollToContent()`, `exportToBlob()`, and (upcoming) `onEvent()`. Allows programmatic control of the editor from outside the React component tree.

**Where used:**
- `packages/excalidraw/index.tsx` — constructed and passed out via `onExcalidrawAPI`
- `packages/excalidraw/types.ts` — `ExcalidrawImperativeAPI` type
- `excalidraw-app/App.tsx` — consumed by the hosted app

**Do NOT confuse with:** The `AppClassProperties` type (internal class interface used by actions) or the React props interface (`ExcalidrawProps`). `ExcalidrawAPI` is the external consumer-facing imperative handle.

---

## ViewMode

**Definition:** A read-only mode of the editor where elements cannot be created or modified. Controlled by `appState.viewModeEnabled`. In this mode most actions are disabled (only those with `viewMode: true` on the `Action` definition are permitted). Used to embed the canvas as a non-editable viewer.

**Where used:**
- `packages/excalidraw/appState.ts` — `viewModeEnabled: false` default
- `packages/excalidraw/actions/types.ts` — `viewMode?: boolean` on `Action`
- `packages/excalidraw/components/App.tsx` — guards event handlers

**Do NOT confuse with:** "Zen mode" (`zenMode` action), which hides the UI chrome but keeps editing enabled. View mode disables editing entirely; zen mode only affects the UI overlay.
