# System Patterns

## Компонентне дерево

```
<Excalidraw>                       ← React.memo (index.tsx:279)
  └── <EditorJotaiProvider>        ← ізольований Jotai store (editor-jotai.ts:14)
        └── <InitializeApp>        ← i18n + тема
              └── <App>            ← class component (~12 800 рядків)
                    ├── <LayerUI>  ← весь React UI поверх canvas
                    │     └── Toolbar, Properties, Sidebar, Dialogs (через Tunnels)
                    ├── <canvas> static      ← незмінні елементи
                    └── <canvas> interactive ← selection, handles, cursor
```

---

## Ключові патерни

### 1. Class Component як ядро (App.tsx)

Свідоме рішення — `this.state` доступний синхронно без closures (критично для pointer handlers). Інстанс-поля мутуються напряму без `setState` де ре-рендер не потрібен:

```
this.scene    → Scene       зберігає елементи поза state
this.store    → Store       дельта-журнал для history
this.history  → History     undo/redo стек
this.renderer → Renderer    планувальник canvas-рендерингу
this.actionManager          реєстр та виконавець дій
this.animationFrameHandler  RAF-цикл для анімацій
```

### 2. Два шари State

**`AppState` (class state)** — ~50 полів, логіка редактора. Кожне поле має storage-конфіг (`appState.ts:138`):
```ts
gridSize:      { browser: true,  export: true,  server: true  }
collaborators: { browser: false, export: false, server: false }
```
`clearAppStateForLocalStorage/Database/Export` фільтрують поля за цим конфігом.

**Jotai** (`editor-jotai.ts`) — UI-атоми (sidebar docked, EyeDropper тощо). Ізольований через `jotai-scope` → кілька інстанцій `<Excalidraw>` не конфліктують. Оновлення через `this.updateEditorAtom(atom)` з ручним `triggerRender()`.

### 3. Action System (Command Pattern)

`actions/types.ts`, `actions/manager.tsx`:
```ts
Action {
  name: ActionName   // ~50 унікальних ключів
  perform(elements, appState, value, app) → ActionResult | false
  keyTest(event)     // keyboard binding
  PanelComponent     // UI у Properties panel
  predicate()        // чи доступна дія
}
// Потік:
action.perform() → syncActionResult() → scene.replaceAllElements()
                                      + this.setState()
                                      + store.scheduleAction()
```
Джерела: `"ui" | "keyboard" | "contextMenu" | "api" | "commandPalette"`.

### 4. Dual Canvas Rendering

`renderer/staticScene.ts` + `renderer/interactiveScene.ts`:

| Canvas | Що рендерить | Коли |
|---|---|---|
| `static` | Фінальний вигляд елементів | При зміні елементів |
| `interactive` | Selection handles, snap lines | При кожному русі миші |

`ShapeCache` кешує RoughJS-фігури. Очищається при resize (`App.tsx:3206`), знищується при unmount (`App.tsx:3194`).

### 5. Store → History Pipeline

`packages/element/src/store.ts`, `history.ts`:
```
Дія → store.scheduleAction(CaptureUpdateAction.IMMEDIATELY)
     → componentDidUpdate: store.commit(elementsMap, state)
     → store.onDurableIncrementEmitter
     → history.record(HistoryDelta)  ← pushes на undo стек
```
`CaptureUpdateAction` (store.ts:38): `IMMEDIATELY | EVENTUALLY | NEVER`.

### 6. Event Listener Management

`App.tsx:3229` — всі слухачі управляються через `onRemoveEventListenersEmitter`:
```ts
this.onRemoveEventListenersEmitter.once(
  addEventListener(document, EVENT.KEYDOWN, handler),
  addEventListener(window, EVENT.RESIZE, handler),
);
// Cleanup — один виклик:
this.onRemoveEventListenersEmitter.trigger();
```
При зміні `viewModeEnabled` → `addEventListeners()` перереєструє edit-only слухачі.

### 7. Batching оновлень (`reactUtils.ts`)

```ts
withBatchedUpdates(fn)          // unstable_batchedUpdates — всі event handlers
withBatchedUpdatesThrottled(fn) // + throttleRAF (1 виклик на animation frame)
```
`flushSync` — точково (~6 місць) для синхронного DOM перед наступними обчисленнями.

### 8. Tunnel (Slot) Pattern (`context/tunnels.ts`)

`tunnel-rat` дозволяє рендерити UI з коду споживача у потрібне місце `LayerUI` без prop drilling:
```tsx
<Excalidraw>
  <MainMenu>      ← телепортується через MainMenuTunnel всередині LayerUI
    <MainMenu.Item />
  </MainMenu>
</Excalidraw>
```
Доступні тунелі: `MainMenuTunnel, FooterCenterTunnel, DefaultSidebarTriggerTunnel, TTDDialogTriggerTunnel, WelcomeScreenCenterTunnel, OverwriteConfirmDialogTunnel`.

### 9. Imperative API (`App.tsx:743`)

```ts
api.updateScene({ elements, appState })
api.scrollToContent(elements)
api.setActiveTool({ type: "rectangle" })
api.history.clear()
// Підписки:
api.onChange(callback)
api.onStateChange(selector, callback) // конкретні поля AppState
api.onPointerDown/Up/ScrollChange(callback)
```
При `componentWillUnmount`: `api.isDestroyed = true`, всі `get*` методи кидають error (`App.tsx:3155`).

### 10. AppStateObserver

Subscription на конкретні поля `AppState` без повного ре-рендеру:
```ts
api.onStateChange("zoom", (zoom) => { ... })
api.onStateChange((s) => s.theme, (theme) => { ... })
```
`appStateObserver.flush(prevState)` у `componentDidUpdate` — нотифікує підписників тільки при реальній зміні.

---

## Lifecycle Summary

```
constructor
  → Scene, Store, History, ActionManager, Fonts, Renderer
  → реєстрація ~50 actions
  → createExcalidrawAPI()

componentDidMount
  → store.onDurableIncrementEmitter → history.record()
  → scene.onUpdate(triggerRender)
  → addEventListeners() + ResizeObserver
  → initializeScene() (завантаження initialData)
  → props.onMount, props.onExcalidrawAPI

componentDidUpdate
  → appStateObserver.flush(prevState)
  → store.commit(elementsMap, state)   ← snapshot → history pipeline
  → реакція на дельту: zoom, theme, viewMode, userToFollow...
  → props.onChange(elements, state, files)  // якщо !isLoading

componentWillUnmount
  → api.isDestroyed = true
  → renderer/scene destroy, resizeObserver.disconnect()
  → removeEventListeners(), очищення emitters, кешів, таймерів
```

---

## Дивись також

- [Architecture](../technical/architecture.md) — повна технічна архітектура з Mermaid-діаграмою
- [Decision Log](./decisionLog.md) — чому прийняті ключові архітектурні рішення
- [Undocumented Behaviors](../technical/undocumented-behaviors.md) — side effects та implicit state machines
- [Domain Glossary](../product/domain-glossary.md) — визначення Scene, Store, Action, Delta...
