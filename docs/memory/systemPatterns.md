# System Patterns: `packages/excalidraw/`

> **Related docs:** [Architecture](../technical/architecture.md) · [Decision Log](./decisionLog.md) · [Tech Context](./techContext.md) · [Domain Glossary](../product/domain-glossary.md)

## Module Map

| Directory / File | Responsibility |
|---|---|
| `components/App.tsx` | Root class component — owns all state, wires every subsystem |
| `actions/` | ~90 named actions; `manager.tsx` registers and dispatches them |
| `components/` | All React UI — `LayerUI`, toolbars, dialogs, sidebars, canvas wrappers |
| `renderer/` | Raw canvas painting (`staticScene.ts`, `interactiveScene.ts`) |
| `scene/` | Viewport helpers: `Renderer.ts` (visible-element memoization), scroll, zoom |
| `data/` | Serialization, library, blob/image, restore, reconcile |
| `hooks/` | Custom React hooks (`useAppStateValue`, etc.) |
| `context/` | `ui-appState.ts` (UIAppStateContext), `tunnels.ts` |
| `history.ts` | `History` class — undo/redo stacks of `HistoryDelta` |
| `editor-jotai.ts` | Isolated Jotai store (`editorJotaiStore`) scoped to this editor instance |
| `appState.ts` | `getDefaultAppState()` + per-key serialization config |
| `types.ts` | Central type hub: `AppState`, `ExcalidrawProps`, `ExcalidrawImperativeAPI` |
| `index.tsx` | Public API barrel export |

---

## State Management

### Three Separate State Containers

```
this.state (AppState)     ← React class component state, ~200 props
this.scene (Scene)        ← element container from @excalidraw/element
this.store (Store)        ← snapshot + delta computation, feeds History
```

These are never merged — they are only joined at render time and in the Store snapshot.

### AppState

Defined at `types.ts:272`. Covers: active tool, scroll/zoom, selection, dialog state, `currentItem*` style defaults, collaboration state, export settings.

Distributed via **8 nested React Contexts** (`components/App.tsx:2129`):

```
ExcalidrawAPIContext
 └─ AppContext
     └─ AppPropsContext
         └─ ExcalidrawContainerContext
             └─ EditorInterfaceContext
                 └─ ExcalidrawSetAppStateContext
                     └─ ExcalidrawAppStateContext
                         └─ ExcalidrawElementsContext
                             └─ ExcalidrawActionManagerContext
```

Per-key serialization config at `appState.ts:138` (`APP_STATE_STORAGE_CONF`) controls which keys survive browser/export/server persistence.

### Jotai Atoms

`editor-jotai.ts` uses `jotai-scope`'s `createIsolation()` — atoms are scoped and do not leak to parent providers. Used for ephemeral UI state only (not undo-able).

Key atoms:

| Atom | File | Purpose |
|---|---|---|
| `libraryItemsAtom` | `data/library.ts:108` | Library items + load status |
| `isLibraryMenuOpenAtom` | `components/LibraryMenu.tsx:58` | Library panel open/closed |
| `isSidebarDockedAtom` | `components/Sidebar/Sidebar.tsx:46` | Sidebar dock state |
| `activeConfirmDialogAtom` | `components/ActiveConfirmDialog.tsx:8` | Active confirmation dialog |
| `activeEyeDropperAtom` | `components/EyeDropper.tsx:34` | Eye-dropper tool state |
| `searchQueryAtom` | `components/SearchMenu.tsx:55` | Search input value |
| `convertElementTypePopupAtom` | `components/ConvertElementTypePopup.tsx:135` | Shape-switch popup |
| `lastUsedPaletteItem` | `components/CommandPalette/CommandPalette.tsx:83` | Last command palette item |
| `rateLimitsAtom`, `chatHistoryAtom` | `components/TTDDialog/TTDContext.tsx` | TTD dialog state |
| `editorLangCodeAtom` | `i18n.ts:163` | Current language code |

`App` calls `editorJotaiStore.set(atom, ...)` imperatively via `updateEditorAtom()` (`App.tsx:854`) to push updates from the class component into the atom store.

### Store / History / Delta

```
User action
  → ActionResult.captureUpdate
  → App.syncActionResult()          [App.tsx:2735]
  → store.scheduleAction(CaptureUpdateAction)
  → Store computes diff → StoreDelta
  → History.record(delta)           [history.ts:117]
  → push to undoStack (inverse stored for redo)
```

`CaptureUpdateAction` enum (`appState.ts`):
- `IMMEDIATELY` — recorded, undo-able
- `NEVER` — remote/init updates, never recorded
- `EVENTUALLY` — batched for later capture

`updateScene()` at `App.tsx:4532` is the public API entrypoint; calls `store.scheduleMicroAction()` then `scene.replaceAllElements()` + `setState`.

---

## Component Tree

```
<EditorJotaiProvider>               isolated Jotai scope
  <InitializeApp>                   sets lang/theme before first paint
    <App>                           class component, owns all state
      [8 Context.Providers]
        <LayerUI>                   all HTML toolbar/panel UI
          <Actions>                 toolbar button groups
          <LibraryMenu>
          <DefaultSidebar>
          <Stats>, <SearchMenu>
          {props.children}          host-app injection slot
        <SVGLayer>                  laser/lasso/eraser SVG trails
        <StaticCanvas>              bg canvas: elements + grid
        <NewElementCanvas>          in-progress element being drawn
        <InteractiveCanvas>         selection handles, cursors, snaps
        <ContextMenu>
        <Hyperlink>, <FollowMode>
        <ActiveConfirmDialog>       driven by Jotai atom
        <ConvertElementTypePopup>
```

### Communication Patterns

| Pattern | Used For |
|---|---|
| React Context | `AppState`, `setAppState`, `actionManager`, `elements`, `api` — read by any descendant |
| Jotai atoms | Ephemeral UI state (sidebar, dialogs, search, eye-dropper) |
| Class refs | `this.scene`, `this.canvas`, `this.interactiveCanvas` — stable identity across renders |
| Emitters | `onChangeEmitter`, `onPointerDownEmitter`, etc. (from `@excalidraw/common`) — used for `ExcalidrawImperativeAPI` subscriptions |
| `AppStateObserver` | Fine-grained `AppState` change subscriptions (key, selector, predicate) |

---

## Action System

Action shape (`actions/types.ts:162`):

```ts
interface Action {
  name: ActionName;           // string union of ~90 names
  perform(elements, appState, formData, app): ActionResult;
  keyTest?(event, appState, elements): boolean;
  PanelComponent?: React.FC;  // renders a toolbar control
  predicate?(appState, elements, ...): boolean;  // enable/disable guard
  viewMode?: boolean;         // allowed in view-only mode?
}
```

`ActionResult` (`actions/types.ts:26`):
```ts
{ elements?, appState?, files?, captureUpdate: CaptureUpdateActionType } | false
```

**Registration:** `register(action)` in each action file → module-level array → `App` constructor calls `actionManager.registerAll(actions)` (`App.tsx:843`).

**Dispatch:** `ActionManager.handleKeyDown()` (keyboard) or `executeAction()` (UI/API) → `perform()` → `App.syncActionResult()`.

**Rendering:** `actionManager.renderAction(name)` renders the action's `PanelComponent` inline in toolbars.

---

## Rendering Pipeline

Three canvas elements, each maintained by a React component:

| Canvas | Component | Renderer | Paints |
|---|---|---|---|
| Static | `components/canvases/StaticCanvas.tsx` | `renderer/staticScene.ts` | Grid, all elements, images |
| New Element | `components/canvases/NewElementCanvas.tsx` | `renderer/renderNewElementScene.ts` | Element being drawn |
| Interactive | `components/canvases/InteractiveCanvas.tsx` | `renderer/interactiveScene.ts` | Selection, handles, cursors, snaps |
| SVG export | — | `renderer/staticSvgScene.ts` | Full scene to SVG DOM |

`scene/Renderer.ts` memoizes visible-element computation — cache busts on `sceneNonce` + viewport params. Static canvas only re-paints when something actually changed.

All pointer event handlers live on `InteractiveCanvas`.

---

## Public API (`index.tsx`)

`ExcalidrawImperativeAPI` (via `onExcalidrawAPI` prop or `useExcalidrawAPI()` hook, constructed at `App.tsx:743`):

| Method | Purpose |
|---|---|
| `updateScene({ elements, appState, captureUpdate })` | Primary programmatic update entrypoint |
| `applyDeltas(deltas[])` | Apply pre-computed `StoreDelta` objects |
| `getSceneElements()` / `getAppState()` / `getFiles()` | Read current state |
| `setActiveTool(tool)` | Change drawing tool |
| `scrollToContent(elements?, opts?)` | Pan/zoom to fit |
| `resetScene()` | Clear all elements and state |
| `onChange(cb)` → unsubscribe | Subscribe to scene change events |
| `onStateChange(prop, cb)` | Fine-grained `AppState` key subscription |
| `onPointerDown/Up(cb)` | Pointer event subscriptions |
| `registerAction(action)` | Extend action registry at runtime |
| `history.clear()` | Wipe undo/redo stacks |
| `onEvent(event, cb)` | Lifecycle events: `editor:mount`, `editor:initialize`, `editor:unmount` |

---

## Key File/Line Reference

| Item | File | Line |
|---|---|---|
| `AppState` interface | `types.ts` | 272 |
| `ExcalidrawImperativeAPI` | `types.ts` | 917 |
| `ExcalidrawProps` | `types.ts` | 560 |
| `getDefaultAppState()` | `appState.ts` | 22 |
| `APP_STATE_STORAGE_CONF` | `appState.ts` | 138 |
| `editorJotaiStore` | `editor-jotai.ts` | 1 |
| React Contexts (all 8) | `components/App.tsx` | 501–565 |
| `App` class declaration | `components/App.tsx` | 617 |
| `App.constructor` | `components/App.tsx` | 787 |
| `App.createExcalidrawAPI()` | `components/App.tsx` | 743 |
| `App.render()` | `components/App.tsx` | 2065 |
| `App.syncActionResult()` | `components/App.tsx` | 2735 |
| `App.updateScene()` | `components/App.tsx` | 4532 |
| `ActionManager` class | `actions/manager.tsx` | 52 |
| `Action` interface | `actions/types.ts` | 162 |
| `ActionResult` type | `actions/types.ts` | 26 |
| `History` class | `history.ts` | 90 |
| `Renderer.getRenderableElements()` | `scene/Renderer.ts` | 26 |
