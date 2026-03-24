# System Patterns

## Architecture Overview

Excalidraw follows an **MVP-like (Model-View-Presenter)** pattern:

- **Model:** `Scene` (element storage) + `AppState` (UI/editor state) + `Store` (change tracking)
- **View:** React components + two HTML Canvas layers (static + interactive)
- **Presenter:** `App.tsx` class component (~12,800 lines) + `ActionManager`

The central `App` class component acts as the orchestrator — it owns state, handles events, dispatches actions, and triggers rendering.

## State Management

Three independent state layers:

### 1. AppState (React class component state)
- ~113 fields defined in `packages/excalidraw/types.ts` (`AppState` interface)
- Defaults in `packages/excalidraw/appState.ts` (`getDefaultAppState()`)
- Covers: active tool, zoom, scroll, selection, theme, collaborators, UI panels
- Updated via `this.setState()` or `syncActionResult()`
- `APP_STATE_STORAGE_CONF` controls which fields persist to browser/export/server

### 2. Scene (element array)
- `Scene` class in `@excalidraw/element` — single source of truth for all drawing elements
- Elements are an ordered array of `ExcalidrawElement` objects
- Updated via `scene.replaceAllElements()` — triggers `onUpdate` → re-render
- Elements are immutable by convention — use `mutateElement()` or `newElementWith()` to create new versions

### 3. Jotai atoms (UI state)
- Isolated store per editor instance (`editor-jotai.ts` uses `jotai-scope` → `createIsolation()`)
- **Direct import from `"jotai"` is forbidden** — must use `editor-jotai` or `app-jotai`
- Used for: popups, tunnels, panel state, convert-element UI
- Updated via `editorJotaiStore.set()` + `triggerRender()`

### State update flow
```
Action.perform() → ActionResult { elements?, appState?, files? }
       ↓
syncActionResult() (batched via withBatchedUpdates)
  ├── store.scheduleAction(captureUpdate)
  ├── scene.replaceAllElements(elements)
  ├── this.setState({ ...appState })
  └── addMissingFiles(files)
       ↓
componentDidUpdate()
  ├── appStateObserver.flush()  → notify subscribers
  ├── store.commit()            → generate increments → history + collab
  └── props.onChange()          → notify host app
```

## Action System

Located in `packages/excalidraw/actions/` (36 action implementation files, 46 total including types/manager/tests).

Each action implements the `Action` interface:
- `perform(elements, appState, formData, app)` → `ActionResult`
- `keyTest(event)` — keyboard shortcut binding
- `PanelComponent` — optional toolbar UI
- `predicate(elements, appState)` — controls when action is available

`ActionManager` (`actions/manager.tsx`):
- Registers all actions at construction time
- `handleKeyDown()` — dispatches keyboard shortcuts with priority sorting
- `executeAction(action, source, event)` — runs action from UI/keyboard/API/context menu/command palette
- Results flow through `syncActionResult()` back into App state

## Rendering Pipeline

Two-layer canvas architecture:

```
App.render()
    ↓
Renderer.getRenderableElements()  ← memoized, filters by viewport
    ↓
┌─────────────────────────┐  ┌──────────────────────────────┐
│   Static Canvas         │  │   Interactive Canvas          │
│   (renderer/staticScene)│  │   (renderer/interactiveScene) │
│                         │  │                               │
│ - Background color      │  │ - Selection boxes/handles     │
│ - Grid                  │  │ - Transform controls          │
│ - All drawing elements  │  │ - Collaborator cursors        │
│ - Rough.js rendering    │  │ - Snap lines                  │
│ - Frame clipping        │  │ - Lasso/eraser trails         │
│ - Hover/suggestion UI   │  │ - New element preview         │
└─────────────────────────┘  └──────────────────────────────┘
```

- **Static canvas**: Renders actual drawing content via Rough.js. Uses `ShapeCache` to avoid re-generating shapes every frame.
- **Interactive canvas**: Overlay for selection UI, handles, cursors. Re-renders more frequently during interactions.
- **SVG renderer** (`renderer/staticSvgScene.ts`): Separate pipeline for lossless SVG export.
- Rendering is **throttled** via `requestAnimationFrame` for performance.

## Component Patterns

### Class component (App.tsx)
- The main `App` extends `React.Component<AppProps, AppState>`
- Owns lifecycle, event handlers, and all core logic
- Uses `React.memo` wrapper at export (`Excalidraw` component in `index.tsx`)

### React Context hierarchy (provided by App.render)
```
ExcalidrawAPIContext          → imperative API for host apps
  AppContext                  → entire App instance (legacy, avoid in new code)
    AppPropsContext           → component props
      ExcalidrawContainerContext
        EditorInterfaceContext → device/form factor
          ExcalidrawSetAppStateContext → setState function
            ExcalidrawAppStateContext  → current AppState
              ExcalidrawElementsContext → current elements
                ExcalidrawActionManagerContext → ActionManager
```

### Tunnel pattern
`context/tunnels.ts` uses `tunnel-rat` library — allows child components (MainMenu, WelcomeScreen, Sidebar) to render into fixed DOM slots without prop drilling.

### Emitter pattern
Custom `Emitter` class for event pub/sub: `onChangeEmitter`, `onPointerDownEmitter`, `onPointerUpEmitter`, `onScrollChangeEmitter`, `onUserFollowEmitter`. Used both internally and exposed via the imperative API.

## Data Flow

### User interaction → visual feedback
```
Pointer/Keyboard event
  → Event handler in App.tsx
    → ActionManager.executeAction() or direct setState
      → syncActionResult()
        → Scene update + AppState update
          → componentDidUpdate()
            → Store.commit() (delta tracking)
            → onChange callback (host notification)
          → render() → Renderer → Canvas
```

### Persistence (save/load)
```
Save: elements + appState + files
  → data/json.ts (serializeAsJSON) or data/blob.ts (PNG with metadata)
    → filesystem.ts (File System Access API) or network

Load: file or URL
  → data/blob.ts or data/json.ts (parse)
    → data/restore.ts (migrate to current schema version)
      → scene.replaceAllElements() + setState()
```

### History (undo/redo)
```
Store.commit() detects changes → emits DurableIncrement with delta
  → History.record(delta)
    → Undo: History applies reverse delta → updateScene()
    → Redo: History applies forward delta → updateScene()
```

## Related Docs

### Technical
- [Architecture](../technical/architecture.md) — system design, data flow, rendering pipeline
- [Dev Setup](../technical/dev-setup.md) — onboarding guide, from git clone to first PR

### Product
- [PRD](../product/PRD.md) — reverse-engineered product requirements
- [Domain Glossary](../product/domain-glossary.md) — core domain terms