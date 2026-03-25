# System Patterns: Excalidraw

## Три рівні стану (паралельно)

| Рівень | Механізм | Що зберігає |
|---|---|---|
| **React State** | `this.setState()` в class `App` | UI, tools, zoom, selection, dialogs |
| **Scene** | Мутабельний singleton (`@excalidraw/element`) | Масив canvas-елементів |
| **Jotai atoms** | `editorJotaiStore` (ізольований через `jotai-scope`) | Дрібний UI-стан (popups, atoms) |

### Потік оновлення

```
Pointer/Keyboard → ActionManager → action.perform() → ActionResult
  → syncActionResult() [withBatchedUpdates]
      ├─ scene.replaceAllElements()  → Scene
      ├─ this.setState(appState)     → React
      └─ store.scheduleAction()      → History queue
            ↓
       componentDidUpdate
            ├─ store.commit()        → snapshot → delta → History
            └─ onChange?.()          → host app callback
```

## Action Pattern

Усі операції — однаковий інтерфейс `Action`:

```ts
interface Action {
  name: ActionName;
  perform: (elements, appState, formData, app) => ActionResult;
  keyTest?: (event, appState, elements, app) => boolean;
  PanelComponent?: React.FC<PanelComponentProps>;
  predicate?: (...) => boolean;
  trackEvent: { category, action? } | false;
}
```

- **40+ дій**: copy/paste, undo/redo, align, group, export, zoom, frames, lasso...
- `ActionManager` диспетчеризує від: keyboard, UI click, context menu, API
- `ActionName` — union type всіх можливих дій (типобезпека)

## History / Undo-Redo

```
Store (snapshot manager)
  → StoreChange → StoreDelta
    → History.record(delta)
        undoStack: HistoryDelta[]
        redoStack: HistoryDelta[]
```

- Delta-based (не full snapshots) — економія памʼяті
- `HistoryDelta` = дельта елементів + дельта appState одночасно
- Скидання redoStack лише при зміні **елементів**, не appState

## Canvas Rendering

**Три canvas-шари:**
- `StaticCanvas` — фінальні committed елементи, кешується, рідко перемальовується
- `InteractiveCanvas` — selection handles, snap lines, cursors, перемальовується на кожен pointer event
- `NewElementCanvas` — новий елемент що малюється

**Renderer (RAF-based):**
- `Renderer.ts` — оркестратор з throttledRAF
- `staticScene.ts` — малювання елементів через Canvas 2D API
- `interactiveScene.ts` — selection, handles, snap guides
- `staticSvgScene.ts` — SVG рендер для exportToSvg

## Component Architecture (`App.tsx`)

- **Class component** (навмисно): stable `this` для pointer handlers, imperativeAPI
- Розмір: ~12 800 рядків — єдиний великий компонент (God Object)
- Надає 9 React Contexts нащадкам: `AppContext`, `AppStateContext`, `ElementsContext`...

### Contexts

| Context | Hook | Зміст |
|---|---|---|
| `AppContext` | `useApp()` | Весь `App` instance |
| `ExcalidrawAppStateContext` | `useExcalidrawAppState()` | `AppState` |
| `ExcalidrawElementsContext` | `useExcalidrawElements()` | `visibleElements[]` |
| `EditorInterfaceContext` | `useEditorInterface()` | `formFactor`, `desktopUIMode` |
| `ExcalidrawAPIContext` | `useExcalidrawAPI()` | `ExcalidrawImperativeAPI` |

## Imperative API (`ExcalidrawImperativeAPI`)

Зовнішній API для host apps:

```ts
api.updateScene({ elements, appState, captureUpdate })
api.getSceneElements()
api.getAppState()
api.addFiles(files)
api.scrollToContent()
api.setActiveTool({ type })
api.onChange(callback)          // subscribe до змін
api.onStateChange(prop, cb)     // reactive subscription
api.onEvent("editor:mount", cb) // lifecycle events
api.isDestroyed                 // флаг після unmount
```

## Data Layer

| Модуль | Функція |
|---|---|
| `data/json.ts` | `serializeAsJSON` / `loadFromBlob` — основний `.excalidraw` формат |
| `data/restore.ts` | Migration між версіями формату |
| `data/library.ts` | Бібліотека елементів: load, save, merge |
| `data/encryption.ts` | Web Crypto — шифрування shareable links |
| `data/reconcile.ts` | Merge remote collab elements |
| `appState.ts` | `APP_STATE_STORAGE_CONF`: `{ browser, export, server }` per field |

## Collab Architecture (`excalidraw-app/collab/`)

```
Collab.tsx (React component)
  ├─ Portal.tsx (WebSocket wrapper — socket.io)
  ├─ collabAPIAtom (Jotai)  ← спільний стан між App і Collab
  └─ Firebase Storage       ← збереження image files для shared scenes
```

- Collab living у `excalidraw-app/` (не у пакеті)
- WebSocket: окремий сервер `excalidraw-room`
- Reconcile: `reconcileElements()` при отриманні remote updates

## Pub/Sub Emitters

| Emitter | Подія |
|---|---|
| `onChangeEmitter` | Кожен render (elements + appState) |
| `onPointerDownEmitter` | Pointer down на canvas |
| `onScrollChangeEmitter` | Зміна scroll/zoom |
| `store.onDurableIncrementEmitter` | → `history.record()` |
| `editorLifecycleEvents` | `editor:mount`, `editor:initialize`, `editor:unmount` |

## Lifecycle (App.tsx)

```
constructor         → Scene, Store, History, ActionManager, Renderer
componentDidMount   → addEventListeners, ResizeObserver, initializeScene (async)
componentDidUpdate  → store.commit, onChange callback, reactive side-effects
componentWillUnmount→ cleanup all: listeners, observers, emitters, RAF loops
```
