# System Patterns

## Monorepo Layer Structure

Dependencies always flow inward — no package imports from a package above it:

```text
excalidraw-app          ← application layer (not published)
  └── @excalidraw/excalidraw   ← editor component (published)
        ├── @excalidraw/element ← element/scene/store logic
        │     ├── @excalidraw/common
        │     └── @excalidraw/math

@excalidraw/utils       ← standalone published helper package
```

In development, Vite aliases all `@excalidraw/*` imports to workspace `src/` paths, so no build step is needed during local development.

## State Management — Four Layers

State is not centralized in a single store. It is split across four distinct layers:

### 1. `AppState` — primary editor state
- Owned by `App` (`packages/excalidraw/components/App.tsx`), a **class component** (`React.Component<AppProps, AppState>`)
- Contains: active tool, selection, zoom/scroll, open dialogs, theme, collaborators, UI flags
- Updated via `setState` / `setAppState`; broadcast through React Context to all child components
- `UIAppState` (`context/ui-appState.ts`) is a subset of `AppState` that excludes scroll/cursor internals — UI components should consume this, not the full `AppState`

### 2. `Scene` + `Store` — element-level state
- `Scene` (`packages/element/src/Scene.ts`): owns the ordered element list and element maps; provides `sceneNonce` for render invalidation
- `Store` (`packages/element/src/store.ts`): tracks structural changes; emits `StoreChange` events; uses `CaptureUpdateAction` enum to control what gets recorded
- Both are instantiated inside `App` and passed to children via context

### 3. `ActionManager` — command dispatch
- All user commands are `Action` objects registered with `ActionManager` (`packages/excalidraw/actions/manager.tsx`)
- Each action's `perform` function returns an `ActionResult`:
  ```ts
  type ActionResult = {
    elements?: readonly ExcalidrawElement[] | null;
    appState?: Partial<AppState> | null;
    files?: BinaryFiles | null;
    captureUpdate: CaptureUpdateActionType; // controls undo recording
  } | false;
  ```
- Action flow is:
  `ActionManager.executeAction(action, source)` → `action.perform(...)` returns `ActionResult` → `App.syncActionResult` batches scene/files/state updates → React render/update → `componentDidUpdate` → `Store.commit(elementsMap, this.state)`
- Sources: `"ui"` | `"keyboard"` | `"contextMenu"` | `"api"` | `"commandPalette"`

### 4. Jotai — scoped peripheral UI atoms
- `packages/excalidraw/editor-jotai.ts` uses `jotai-scope`'s `createIsolation()` so atoms are scoped to `EditorJotaiProvider`, never leaking globally
- Used only for small UI state: `editorLangCodeAtom`, `isSidebarDockedAtom`, `isLibraryMenuOpenAtom`, `convertElementTypePopupAtom`
- A second isolated Jotai store (`tunnelsJotai`) powers `tunnel-rat` portal slots

## React Context Stack

`App.render()` nests these providers (outer → inner):

| Context | Contents |
|---|---|
| `ExcalidrawAPIContext` | `ExcalidrawImperativeAPI` instance |
| `AppContext` | The `App` instance (`AppClassProperties`) |
| `AppPropsContext` | Props passed to `<Excalidraw />` |
| `ExcalidrawContainerContext` | DOM container ref |
| `EditorInterfaceContext` | Form-factor flags (phone / desktop) |
| `ExcalidrawSetAppStateContext` | `setAppState` setter |
| `ExcalidrawAppStateContext` | Current `AppState` |
| `ExcalidrawElementsContext` | Current element array |
| `ExcalidrawActionManagerContext` | `ActionManager` instance |
| `UIAppStateContext` | Scroll-free subset for UI components |

## Undo / Redo — History

- `HistoryDelta` (`packages/excalidraw/history.ts`) extends `StoreDelta` from `@excalidraw/element`
- Two stacks: undo / redo; each entry is a `HistoryDelta` capturing element and appState diffs
- `captureUpdate` in `ActionResult` controls whether an action creates a history entry:
  - `CaptureUpdateAction.IMMEDIATELY` — normal undoable action
  - `CaptureUpdateAction.EVENTUALLY` — debounced (e.g. slider drag)
  - `CaptureUpdateAction.NEVER` — not recorded (e.g. viewport pan)
- Undo/redo apply the delta's inverse, then reconcile with collaborator state

## Rendering Pipeline

Canvas is split into three layers drawn on top of each other:

```text
StaticCanvas      ← all committed elements (rough.js, images, grid)
InteractiveCanvas ← selection handles, transform controls, snapping lines, remote cursors
NewElementCanvas  ← the in-progress element while drawing
SVGLayer          ← laser pointer / lasso / eraser trails
```

`Renderer` (`packages/excalidraw/scene/Renderer.ts`) computes `getRenderableElements()` by filtering `Scene` elements to those within the viewport + a margin. It throttles calls to `renderStaticSceneThrottled`.

## Public Component API

```tsx
// Minimum setup
import { Excalidraw } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";

<div style={{ height: "100vh" }}>
  <Excalidraw />
</div>
```

Key props (`ExcalidrawProps`):
- `onExcalidrawAPI` — called on mount with `ExcalidrawImperativeAPI`
- `onChange(elements, appState, files)` — fires on every scene change
- `initialData` — initial elements, appState, files, library
- `UIOptions` — hide/show toolbar tools, canvas actions
- `isCollaborating`, `onPointerUpdate` — collaboration hooks
- `aiEnabled` — gates AI features (TTD dialog, magic frame)

`ExcalidrawImperativeAPI` methods include `updateScene`, `getAppState`, `getSceneElements`, `history.undo/redo`, `registerAction`, `onChange`, `onStateChange`, and `onEvent`.

## Collab Pattern (excalidraw-app)

- `Collab.tsx` manages the Socket.io connection and reconciles remote changes via `reconcileElements()` from `@excalidraw/excalidraw/data/reconcile`
- `Portal.tsx` wraps the socket and room management
- Remote state is merged into local `Scene` through `ExcalidrawImperativeAPI.updateScene`

## Tunnel-Rat Slot Pattern

`context/tunnels.ts` creates named "tunnels" (React portals without a DOM node):

```ts
const { MainMenuTunnel, FooterCenterTunnel, TTDDialogTriggerTunnel } = useTunnels();

// Inside LayerUI:
<MainMenuTunnel.Out />      // renders whatever was sent In

// Inside a child component:
<MainMenuTunnel.In>
  <MyMenuContent />
</MainMenuTunnel.In>
```

This allows deeply nested components to inject content into named slots in `LayerUI` without prop drilling.

## Code Conventions

- All new code in **TypeScript**; no `any` except where necessary
- Functional components + hooks throughout; three class components exist by design:
  - `App` (`packages/excalidraw/components/App.tsx`) — owns mutable `AppState` and all editor instance methods
  - `Collab` (`excalidraw-app/collab/Collab.tsx`, `PureComponent`) — manages Socket.io lifecycle, file sync, and collaborator state; needs instance fields and timers
  - `TopErrorBoundary` (`excalidraw-app/components/TopErrorBoundary.tsx`, `React.Component`) — React error boundary (must be a class per React API)
- Element mutations always go through `mutateElement()` from `@excalidraw/element` — never mutate element objects directly
- Math primitives use `Point` type from `@excalidraw/math/types` — never inline `{ x, y }` objects
- Popover open/close state stored in `appState.openPopup` (single string field) — ensures mutual exclusion and global observability
- Analytics via `trackEvent(category, action, label)` in action handlers

## Details

For detailed architecture → see [docs/technical/architecture.md](../technical/architecture.md)
For domain glossary → see [docs/product/domain-glossary.md](../product/domain-glossary.md)
