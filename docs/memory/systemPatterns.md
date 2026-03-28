## `packages/excalidraw` Architecture

---

### Directory Layout

The package has **no `src/` folder** — all code lives directly under `packages/excalidraw/`:

| Directory / File | Role |
|---|---|
| **`components/`** | All React UI — `App`, canvases, `LayerUI`, toolbars, menus, dialogs, sidebars |
| **`actions/`** | Declarative command system — copy, zoom, style, delete, export, etc. |
| **`data/`** | Serialization (`json.ts`), blob loading, file helpers, library, restore/reconcile |
| **`renderer/`** | Low-level canvas drawing — static scene, interactive overlays, snaps, animations |
| **`scene/`** | Viewport/zoom/scroll, `Renderer` wrapper, export helpers |
| **`context/`** | React context helpers (`ui-appState.ts`, `tunnels.ts`) |
| **`hooks/`** | Reusable React hooks (`useStableCallback`, `useAppStateValue`, etc.) |
| **`lasso/`** | Lasso-selection trail (`LassoTrail`) |
| **`eraser/`** | Eraser trail (`EraserTrail`) |
| **`charts/`** | Spreadsheet parsing + bar/line/radar chart helpers |
| **`fonts/`** | Font loading and integration |
| **`wysiwyg/`** | In-canvas text editing |
| **`locales/`** | i18n translation JSON per language |
| **`css/`** | Global editor styles |
| **`tests/`** | Vitest tests |
| **`subset/`** | Font subsetting utilities |
| `types.ts` | `AppState`, props, API type definitions |
| `appState.ts` | `getDefaultAppState()`, export-cleaning helpers |
| `editor-jotai.ts` | Jotai store isolation for the editor |
| `index.tsx` | Public API entry point |

---

### Entry Point (`index.tsx`)

The exported `<Excalidraw>` component wraps three layers:

```
EditorJotaiProvider   ← scoped Jotai store
  └── InitializeApp   ← async i18n load (shows spinner until ready)
        └── App       ← the real editor (class component)
```

`index.tsx` also re-exports the imperative API, hooks, `Sidebar`, `MainMenu`, `Footer`, `WelcomeScreen`, `CommandPalette`, serialization helpers, element utilities, and more.

---

### State Management

State is split across three layers:

**1. `AppState` on `App` (React class component — primary source of truth)**

`App` extends `React.Component<AppProps, AppState>`. `AppState` is a large interface in `types.ts` covering: active tool, selection, scroll/zoom, context menu, open dialogs, collaboration fields, export settings, etc.

`App` owns:
- `this.scene` — a `Scene` instance (from `@excalidraw/element`) holding the ordered element list
- `this.store` — `Store` class from `@excalidraw/element/src/store.ts`; drives undo/redo snapshots
- `this.history` — `History` class from `packages/excalidraw/history.ts`; records deltas from `Store`
- `this.actionManager` — runs actions and funnels results back via `syncActionResult`
- `this.renderer` — bridges `Scene` to throttled canvas repaints

**2. React Context Providers (inside `App.render()`)**

Nested providers expose internal state slices to descendants without prop-drilling:

| Context | Contents |
|---|---|
| `ExcalidrawAPIContext` | Imperative API handle |
| `AppContext` | The `App` instance itself (`AppClassProperties`) |
| `ExcalidrawAppStateContext` | Read `AppState` |
| `ExcalidrawSetAppStateContext` | Write `AppState` |
| `ExcalidrawElementsContext` | Current elements |
| `ExcalidrawActionManagerContext` | `ActionManager` instance |
| `AppPropsContext`, `EditorInterfaceContext`, `ExcalidrawContainerContext` | Various prop/DOM refs |

**3. Jotai atoms (scoped UI state)**

`editor-jotai.ts` uses `jotai-scope`'s `createIsolation()` to produce a scoped `editorJotaiStore` and the `EditorJotaiProvider` wrapper. Atoms themselves are defined close to where they are used, but all share this scoped store. Notable atoms:

- `isSidebarDockedAtom` (`components/Sidebar/Sidebar.tsx`)
- `isLibraryMenuOpenAtom` (`components/LibraryMenu.tsx`), `libraryItemsAtom` (`data/library.ts`)
- `activeEyeDropperAtom` (`components/EyeDropper.tsx`), `activeConfirmDialogAtom` (`components/ActiveConfirmDialog.tsx`)
- `convertElementTypePopupAtom` (`components/ConvertElementTypePopup`), `searchItemInFocusAtom` (`components/SearchMenu`)
- `editorLangCodeAtom` (`i18n.ts`)

`App` bridges Jotai ↔ class via `updateEditorAtom` + `triggerRender()`.

**Subscription model for host apps:** `useExcalidrawStateValue(selector)` / `useOnExcalidrawStateChange` subscribe to specific `AppState` slices via `api.onStateChange(selector, callback)` — avoiding full-tree re-renders on every state change.

---

### Key Components

**`App` (`components/App.tsx`)** — ~12,000+ lines, class-based. The core of the entire editor. Its `render()` outputs the full component tree:

```
App.render()
├── [nested providers]
├── LayerUI          ← all chrome: toolbars, sidebars, menus, props.children
├── SVGLayer         ← laser/lasso/eraser trails
├── Hyperlink        ← link popup
├── ContextMenu
├── StaticCanvas     ← non-interactive, throttled repaint
├── NewElementCanvas ← shown while drawing a new element
├── InteractiveCanvas← pointer input, selection handles
├── FollowMode       ← collaboration follow-view
├── UnlockPopup
├── ConvertElementTypePopup
└── [embeddables, frame names, etc.]
```

**Canvas layer (`components/canvases/`):**

| Component | Purpose |
|---|---|
| `StaticCanvas` | Renders committed scene elements; throttled repaints |
| `InteractiveCanvas` | Handles all pointer events, selection handles, element resize |
| `NewElementCanvas` | Shown during element creation in-progress |

**`scene/Renderer.ts`** bridges `Scene` to `renderer/staticScene.ts` (low-level draw calls).

**Shell UI:**
`LayerUI` → `Toolbar`, `ToolButton`, `MainMenu`, `Footer`, `Sidebar`, `LibraryMenu`, `SearchMenu`, `CommandPalette`, `Stats`, and modal triggers.

---

### Actions System

A declarative command registry decoupled from the UI:

```
register(action)            → module-level actions[] array
ActionManager               → registers all actions, resolves keyboard shortcuts
ActionManager.executeAction → runs action.perform(elements, appState, formData, app)
                           → returns ActionResult { elements?, appState?, captureUpdate?, ... }
App.syncActionResult        → merges ActionResult into scene + setState + history
```

`Action` interface (from `actions/types.ts`):
- `perform(elements, appState, formData, app)` → `ActionResult`
- `keyTest` — keyboard shortcut matching
- `PanelComponent` — optional inline UI renderer

Drawing and pointer interactions (drag, resize, pan) are handled directly in `App` as imperative event handlers — `handleCanvasPointerDown`, etc. — not as actions. Actions cover discrete commands: delete, copy, zoom, align, export, etc.

---

### Data Layer

| Module | Responsibility |
|---|---|
| `data/json.ts` | `serializeAsJSON()` → `ExportedDataState`; `cleanAppStateForExport` strips runtime fields |
| `data/blob.ts` | `loadFromBlob`, `loadSceneOrLibraryFromBlob` — parses JSON/PNG/SVG, validates, calls restore |
| `data/restore.ts` | `restoreElements`, `restoreAppState`, `restoreLibraryItems` — normalize data across versions |
| `data/reconcile.ts` | Element reconciliation for real-time collaboration merging |
| `data/library.ts` | Library item hashing, merging; feeds `libraryItemsAtom` |

---

### Collaboration Flow (end-to-end)

```
User interaction
  → InteractiveCanvas pointer handlers (in App)
  → scene.mutateElement / scene.replaceAllElements
  → store.commit → history snapshot
  → App.onChangeEmitter.trigger(elements, appState, files)
  → host's onChange prop / collaboration socket
  → reconcile.ts (on incoming remote changes)
  → App.updateScene (imperative API)
  → re-render cycle
```