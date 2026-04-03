# Decision Log: App.tsx Architecture

## State Management в App.tsx

---

### Тип компонента

**Класовий компонент** — `class App extends React.Component<AppProps, AppState>` (≈11k рядків).

---

### Що зберігається в `this.state`

`AppState` (~272 поля) розділено на категорії:

| Категорія | Поля |
|---|---|
| Елементи | `newElement`, `selectedElementIds`, `hoveredElementIds`, `resizingElement`, `multiElement` |
| Інструмент | `activeTool`, `penMode`, `penDetected` |
| Canvas | `scrollX`, `scrollY`, `zoom`, `width`, `height`, `offsetLeft`, `offsetTop` |
| Стилі | `currentItemStrokeColor`, `currentItemFontSize`, `currentItemRoughness`, … |
| UI | `openDialog`, `openSidebar`, `toast`, `contextMenu`, `showHyperlinkPopup` |
| Редагування | `editingTextElement`, `editingFrame`, `editingGroupId` |
| Колаборація | `collaborators`, `userToFollow`, `followedBy` |

---

### 4 контейнери стану

```
┌─────────────────────────────────────────────────────────┐
│  this.state (React)   — UI, інструменти, взаємодія      │
│  this.scene (Scene)   — елементи полотна                │
│  this.store (Store)   — дельти змін, scheduling history │
│  editorJotaiStore     — транзієнтний UI-стан (атоми)    │
└─────────────────────────────────────────────────────────┘
```

---

### Ключові методи оновлення стану

**`syncActionResult()`** — центральна функція обробки дій:
```
ActionManager.executeAction()
  → syncActionResult()
      → store.scheduleAction(captureUpdate)  // для history
      → scene.replaceAllElements(elements)   // якщо є елементи
      → setState(appState)                   // якщо є appState
      → scene.triggerUpdate()                // force render
```

**`updateScene()`** — батчевий update ззовні (через `ExcalidrawImperativeAPI`):
```
store.scheduleMicroAction() → scene.replaceAllElements() → setState()
```

**`triggerRender()`** — примусовий ре-рендер:
```ts
setState({})  // або scene.triggerUpdate()
```

**Jotai-атоми** — через `updateEditorAtom()`:
```ts
editorJotaiStore.set(atom, ...args) → triggerRender()
```

---

### Side Effects та Event Listeners

#### `componentDidMount`
| Дія | Деталь |
|---|---|
| Підписка на Store | `store.onDurableIncrementEmitter` → `history.record(delta)` |
| Підписка на Scene | `scene.onUpdate(triggerRender)` |
| DOM-слухачі | `addEventListeners()` |
| ResizeObserver | `refreshEditorInterface()` + `updateDOMRect()` |
| Ініціалізація сцени | `updateDOMRect(initializeScene)` — завантаження з файлу/пропсів |
| Lifecycle event | `editorLifecycleEvents.emit("editor:mount")` |

#### DOM-події (реєструються в `addEventListeners`)

**Завжди:**
- `wheel` → handleWheel (zoom/scroll)
- `pointerup` → removePointer
- `copy` → onCopy
- `keyup` → onKeyUp
- `pointermove` → updateCurrentCursorPosition
- `gesturestart/change/end` → Safari pinch-zoom
- `focus` window → maybeCleanupAfterMissingPointerUp

**Тільки в edit-режимі:**
- `resize` window → onResize (очищає ShapeCache, оновлює DOM)
- `paste` → pasteFromClipboard
- `cut` → onCut
- `blur` window → onBlur (скидає binding)
- `unload` → onUnload
- `fullscreenchange` → onFullscreenChange

**На Canvas (JSX):**
- `onPointerDown/Move/Up` → handleCanvasPointer*
- `onContextMenu` → handleCanvasContextMenu
- `onDrop` → handleAppOnDrop

---

### Lifecycle послідовність

#### Монтування:
```
constructor
  → ініціалізація this.state з defaultAppState
  → створення: Scene, Store, History, ActionManager, Renderer

componentDidMount
  → підписки (Store, Scene)
  → addEventListeners()
  → ResizeObserver
  → initializeScene()  ← async, завантаження даних

componentDidUpdate (перший раз, коли isLoading → false)
  → emit "editor:initialize"
```

#### Оновлення (`componentDidUpdate` відстежує):
- `langCode` → `updateLanguage()`
- `viewModeEnabled` / `zenModeEnabled` / `theme` → `setState()`
- `userToFollow` → emit follow/unfollow events
- `scrollX/scrollY/zoom` → `onScrollChangeEmitter`
- `openDialog` / `editingTextElement` — cleanup видаленого стану

#### Розмонтування (`componentWillUnmount`):
```
unmounted = true
→ api.isDestroyed = true
→ emit "editor:unmount"
→ renderer.destroy(), scene.destroy()
→ removeEventListeners()
→ library.destroy()
→ laserTrails.stop(), eraserTrail.stop()
→ очищення всіх emitters
→ ShapeCache.destroy(), SnapCache.destroy()
```

---

### Event Emitters (власні, не DOM)

| Emitter | Призначення |
|---|---|
| `onChangeEmitter` | Зміни елементів/appState/файлів (для `onChange` prop) |
| `onPointerDownEmitter` / `onPointerUpEmitter` | Pointer-події (для `onPointerDown/Up` prop) |
| `onScrollChangeEmitter` | Зміни scroll/zoom |
| `onUserFollowEmitter` | Follow/unfollow колаборатора |
| `editorLifecycleEvents` | mount / initialize / unmount |
| `store.onDurableIncrementEmitter` | → `history.record()` |

---

### Загальний data flow

```
DOM Event
  → Handler (onKeyDown / handleCanvasPointerDown / …)
  → ActionManager.executeAction()  або  пряме setState()
  → syncActionResult()
  → scene.replaceAllElements() + setState()
  → Scene.onUpdate → triggerRender → setState({}) → render()
                    ↓
              Store emitters → History.record(delta)
```

---

## appState.ts — утилітарний модуль

`appState.ts` — **не компонент**. Чисто конфігураційний файл без side effects та lifecycle.

### `getDefaultAppState()`

Повертає початкові значення всього UI-стану. Використовується в конструкторі `App.tsx`:

```ts
export const getDefaultAppState = (): Omit<AppState, "offsetTop"|"offsetLeft"|"width"|"height"> => ({
  theme: THEME.LIGHT,
  scrollX: 0, scrollY: 0,
  zoom: { value: 1 },
  activeTool: { type: "selection", ... },
  collaborators: new Map(),
  followedBy: new Set(),
  // ... ~50 полів
});
```

### `APP_STATE_STORAGE_CONF` — конфіг персистентності

Кожне поле AppState має три прапори: `{ browser, export, server }`.

| Поле | browser | export | server | Пояснення |
|---|---|---|---|---|
| `gridSize` / `gridStep` / `gridModeEnabled` | ✓ | ✓ | ✓ | Синхронізується скрізь |
| `viewBackgroundColor` | ✓ | ✓ | ✓ | Теж |
| `lockedMultiSelections` | ✓ | ✓ | ✓ | Теж |
| `scrollX/scrollY/zoom` | ✓ | ✗ | ✗ | Тільки в браузері |
| `currentItemStrokeColor` та ін. | ✓ | ✗ | ✗ | Тільки в браузері |
| `newElement`, `contextMenu`, `toast` | ✗ | ✗ | ✗ | Повністю транзієнтні |
| `collaborators`, `followedBy` | ✗ | ✗ | ✗ | Тільки в пам'яті |

### Функції фільтрації стану

```ts
clearAppStateForLocalStorage(appState)  // → browser: true
cleanAppStateForExport(appState)        // → export: true
clearAppStateForDatabase(appState)      // → server: true
```

Всі три — обгортки над `_clearAppStateForStorage()`, яка фільтрує поля за конфігом.

### Predicate-хелпери

```ts
isEraserActive({ activeTool })   // activeTool.type === "eraser"
isHandToolActive({ activeTool }) // activeTool.type === "hand"
```
