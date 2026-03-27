# Architecture

## Package Dependency Graph

```
excalidraw-app
    └── @excalidraw/excalidraw      (packages/excalidraw)
            ├── @excalidraw/element (packages/element)
            │       ├── @excalidraw/math   (packages/math)
            │       └── @excalidraw/common (packages/common)
            ├── @excalidraw/math
            └── @excalidraw/common

@excalidraw/utils                   (packages/utils)   — standalone export lib
```

Each package has its own `package.json` with `exports` map. Packages are built with esbuild; the app is built with Vite.

## State Management

Excalidraw uses three complementary state systems, each with a distinct scope:

### AppState (monolithic UI state)

Defined in `packages/excalidraw/types.ts`. A single large object owned by `App.tsx` that covers:

- **Tool selection** — `activeTool`, `editingElement`, `resizingElement`
- **Viewport** — `scrollX`, `scrollY`, `zoom`
- **UI panels** — `openMenu`, `openDialog`, `showStats`
- **Collaboration UI** — `collaborators`, `isLoading`

`AppState` is updated via `setState()` on the `App` class component. Because it is monolithic, updates trigger a top-level re-render; the rendering pipeline then decides what actually needs to be redrawn.

### Jotai atoms (fine-grained reactive state)

Used for state that needs to be shared across components without prop-drilling, or that must update independently from `AppState` to avoid unnecessary re-renders. Always import atoms from the project wrappers:

- `excalidraw-app/app-jotai.ts` — app-level atoms (collaboration, sync status)
- `packages/excalidraw/editor-jotai.ts` — editor-level atoms (sidebar, active panel)

Never import directly from `jotai`. Atoms are read with `useAtom` / `useAtomValue` and written with `useSetAtom`.

### Scene / Store / History pipeline

The authoritative element list flows through three layers:

```
mutateElement() / newElementWith()
        ↓
Scene  — ordered element array + O(1) Map lookup
        ↓
Store  — produces delta snapshots (DurableIncrement / EphemeralUpdate)
        ↓
History — undo/redo stacks, driven by CaptureUpdateAction enum
```

| Layer | File | Responsibility |
|-------|------|----------------|
| `Scene` | `packages/element/src/Scene.ts` | In-memory element registry; `replaceAllElements()`, spatial queries |
| `Store` | `packages/element/src/store.ts` | Snapshot diffs; feeds collaboration sync and history |
| `History` | `packages/excalidraw/history.ts` | Delta-based undo/redo; `CaptureUpdateAction.IMMEDIATELY` records, `.NEVER` skips |

**Golden rule:** never mutate element properties directly. Use:
- `mutateElement(element, { prop: value })` — in-place mutation, triggers reactivity
- `newElementWith(element, { prop: value })` — returns an immutable copy (safe for derived state)

## Key Files

| File | Role |
|------|------|
| `packages/excalidraw/components/App.tsx` | Root editor class component; owns AppState, wires all events |
| `packages/element/src/Scene.ts` | In-memory element tree (ordered array + Map for O(1) lookup) |
| `packages/element/src/store.ts` | Snapshot/delta system; drives history and collaboration sync |
| `packages/excalidraw/history.ts` | Delta-based undo/redo stacks |
| `packages/excalidraw/scene/Renderer.ts` | Viewport culling, memoized renderable element selection |
| `packages/excalidraw/renderer/staticScene.ts` | Canvas render loop for shapes, grid, frames |
| `packages/excalidraw/renderer/interactiveScene.ts` | Canvas render loop for selections, cursors, handles |
| `excalidraw-app/collab/Collab.tsx` | WebSocket collaboration, encryption, cursor sync |
| `packages/element/src/mutateElement.ts` | The only correct way to update element properties |
| `packages/element/src/types.ts` | All element type definitions |
| `packages/excalidraw/types.ts` | AppState, ToolType, Collaborator, and other core types |
| `packages/common/src/constants.ts` | TOOL_TYPE, ROUGHNESS, FONT_FAMILY, THEME, etc. |

## Data Flow: User Draws a Shape

```
1. pointerdown on canvas
        ↓
2. App.tsx handlePointerDown()
   → sets activeTool, initializes newElement in AppState
        ↓
3. pointermove (throttled via rAF)
   → App.tsx handlePointerMove()
   → mutateElement(newElement, { width, height, ... })
        ↓
4. Canvas re-render triggered
   → renderNewElementScene() draws live preview
        ↓
5. pointerup
   → App.tsx handlePointerUp()
   → Scene.replaceAllElements([...elements, finalElement])
   → Store.commit(CaptureUpdateAction.IMMEDIATELY)
   → History.record(delta)
   → AppState.newElement = null
   → Final render
```

## Data Flow: Collaboration Sync

```
Local user commits element change
        ↓
Collab.tsx intercepts via Store DurableIncrement
        ↓
Serialize + encrypt changed elements (AES-GCM)
        ↓
Socket.io broadcast to room
        ↓
Remote peer receives encrypted payload
        ↓
Decrypt → deserialize elements
        ↓
Scene.replaceAllElements() with merged result
Store.commit(CaptureUpdateAction.NEVER)   ← not added to history
        ↓
Remote render update
```

## Canvas Architecture

Two overlapping `<canvas>` elements:
1. **Static canvas** — re-rendered only when elements change (shapes, grid, background)
2. **Interactive canvas** — re-rendered on every pointer move (selections, resize handles, collaborator cursors)

This split avoids redrawing all shapes on every mouse move.

## Embeddable Component API

`@excalidraw/excalidraw` exposes:
- `<Excalidraw />` — drop-in React component with extensive props
- `ExcalidrawImperativeAPI` — programmatic control (via `excalidrawAPI` prop or `useExcalidrawAPI()` hook)
  - `updateScene()`, `updateLibrary()`, `addFiles()`
  - `getSceneElements()`, `getAppState()`
  - `exportToBlob()`, `exportToSvg()`
  - `scrollToContent()`, `resetScene()`

`@excalidraw/utils` (separate package) provides `exportToSvg()`, `exportToBlob()`, `serializeAsJSON()` for use outside React.
