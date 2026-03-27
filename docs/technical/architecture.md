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
