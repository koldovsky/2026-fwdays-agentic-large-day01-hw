# Decision log

## 2026-03-26 — `packages/excalidraw/components/App.tsx`: state management, side effects, lifecycle

### Контекст

- Потрібно зафіксувати, як влаштовано керування станом у центральному компоненті редактора `App.tsx`, які є side effects та як працює lifecycle.

### Рішення (архітектурна інтерпретація)

- `App.tsx` є **центральним orchestrator-компонентом** редактора, де:
  - React `this.state` (`AppState`) тримає UI/editor-стан.
  - `Scene` (з `@excalidraw/element`) тримає модель елементів полотна.
  - `Store` + `History` забезпечують capture/undo/redo через інкременти і дельти.
  - `ActionManager` є єдиним стандартним шляхом виконання дій користувача над сценою.
- Критичний update-path:
  - Action -> `syncActionResult(...)` -> оновлення `scene`/`this.state` -> `componentDidUpdate` -> `store.commit(...)` -> `onChange`/емітери.
- Для зовнішніх інтеграцій використовується imperative API (`createExcalidrawAPI`), включно з `updateScene`, `onStateChange`, `onIncrement`, `onChange`.
- Поряд із React state використовується локальний Jotai-store (`editorJotaiStore`) для UI-атомів; зміни атомів у `App` проходять через `updateEditorAtom(...)` і форсують перерендер.

### Деталі state management

- **Ініціалізація стану:** в `constructor` через `getDefaultAppState()` + накладання пропсів (`viewModeEnabled`, `zenModeEnabled`, `gridModeEnabled`, `theme`) і runtime-розмірів (`width`, `height`).
- **Доменні зміни з actions:** `ActionManager` створений з `this.syncActionResult` як updater.
- **`syncActionResult(...)`:**
  - планує capture в `store` через `store.scheduleAction(captureUpdate)`,
  - замінює елементи сцени (`scene.replaceAllElements`) коли треба,
  - мерджить `actionResult.appState` у `this.state`,
  - якщо змін у state/scene не було, тригерить `scene.triggerUpdate()`.
- **`updateScene(...)` (API-шлях):**
  - опційно планує `store.scheduleMicroAction(...)`,
  - оновлює `this.state` (`appState`, `collaborators`),
  - оновлює `scene` (`elements`).
- **Фіксація змін:** в `componentDidUpdate` викликається `store.commit(elementsMap, this.state)`; після цього (коли `!isLoading`) викликаються `props.onChange` і внутрішній `onChangeEmitter`.
- **Селективні підписки на стан:** `AppStateObserver` (`this.appStateObserver.flush(prevState)`) дає механіку `onStateChange`.

### Side effects

- **DOM/Canvas side effects:**
  - створення canvas/roughjs контексту,
  - оновлення `document.documentElement.style.overscrollBehaviorX`,
  - `classList.toggle("theme--dark", ...)` на контейнері.
- **Глобальні listeners (document/window/container):**
  - keyboard, pointer, copy/paste/cut, wheel, drag/drop,
  - `message` (iframe-плеєри), `focus`, `resize`, `blur`, `unload`,
  - `fullscreenchange`, Safari gesture events.
- **Спостерігачі/таймери:**
  - `ResizeObserver` для контейнера,
  - численні `setTimeout/clearTimeout` (bind mode, touch/double-tap, finalize тощо).
- **Сторонні/інфраструктурні ефекти:**
  - підписка на `store` інкременти (запис в history, прокидування `onIncrement`),
  - підписка на `scene.onUpdate(this.triggerRender)`,
  - dev/test-інжекція в `window.h` для дебагу.
- **Unmount cleanup effects:**
  - `renderer.destroy()`, `scene.destroy()`, cleanup cache/emitters/listeners/observer/timers,
  - позначення API як `isDestroyed` і блокування частини методів після unmount.

### Lifecycle компонента

- **constructor**
  - піднімає базові сервіси (`Scene`, `Renderer`, `Store`, `History`, `Library`, `ActionManager`),
  - ініціалізує `this.state`,
  - реєструє стандартні actions + undo/redo actions.
- **componentDidMount**
  - створює/актуалізує API і прокидає його назовні,
  - додає listeners, scene/store subscriptions,
  - ініціалізує scene (через `initializeScene`) або відновлення з web-share-target,
  - емітить lifecycle event `editor:mount`.
- **componentDidUpdate**
  - одноразово емітить `editor:initialize` після завершення loading,
  - flush підписок `AppStateObserver`,
  - виконує похідні синхронізації стану (theme/export mode/welcome/follow/tool cleanups),
  - комітить store і нотифікує зовнішні колбеки змін.
- **componentWillUnmount**
  - емітить `editor:unmount`, зануляє зовнішній API,
  - робить повний cleanup side effects і runtime-обʼєктів.

### Наслідки та інваріанти

- Всі значущі оновлення мають проходити через `syncActionResult(...)` або `updateScene(...)`, щоб не обійти `Store/History`.
- `componentDidUpdate` є критичною точкою commit/notification; побічні оновлення всередині нього мають бути контрольовані, щоб уникати зайвих ререндер-циклів.
- Imperative API після unmount вважається невалідним за контрактом (`isDestroyed` + guard-методи).


## Details 
For detailed architecture → see docs/technical/architecture.md 
For domain glossary → see docs/product/domain-glossary.md

## 2026-03-26 — Undocumented behavior audit (`HACK/FIXME/TODO/WORKAROUND`)

### Контекст

- Проведено пошук по кодовій базі на предмет `HACK`, `FIXME`, `TODO`, `WORKAROUND` і виділено місця, де поведінка виглядає неявною або недостатньо документованою.

### Що робить код vs що задокументовано

#### 1) Implicit state machine для arrow binding mode

- **Що робить код:**
  - У `packages/excalidraw/components/App.tsx` `bindMode` переходить між `orbit`, `skip`, `inside` через `setState`, `flushSync` і `setTimeout`.
  - Додатково використовується `bindModeHandler` (`BIND_MODE_TIMEOUT`) для відкладених переходів при hover/binding.
- **Що задокументовано:**
  - Є локальні коментарі в коді, але немає окремої формалізованої діаграми станів у docs.

#### 2) HACK у touch/pointer/double-click обробці

- **Що робить код:**
  - Логіка змішує native pointer/click і ручну touch-обробку (manual double-tap).
  - Це створює залежність від браузерного порядку подій.
- **Що задокументовано:**
  - Прямо позначено TODO/HACK у `App.tsx`, але немає зовнішньої документації про обмеження/ризики.

#### 3) Recovery side effect при втраті `pointerup`

- **Що робить код:**
  - Якщо `pointerup` не прийшов (наприклад, user tab-away), `maybeCleanupAfterMissingPointerUp(...)` примусово викликає cleanup.
  - Супроводжується TODO у тестах про potential memory leak без `pointerUp`.
- **Що задокументовано:**
  - В коді є коментарі й тести (`selection.test.tsx`), але в технічній документації цей recovery path не описаний явно.

#### 4) Глобальний side effect на `document.documentElement`

- **Що робить код:**
  - `toggleOverscrollBehavior(...)` змінює `document.documentElement.style.overscrollBehaviorX` при pointer enter/leave редактора.
  - Це впливає на весь документ, не тільки на контейнер редактора.
- **Що задокументовано:**
  - Є inline-коментар у коді; зовнішня документація про глобальний вплив відсутня.

#### 5) Initialization-order dependency для API (StrictMode-sensitive)

- **Що робить код:**
  - API створюється так, щоб уникнути невалідного стану в сценаріях StrictMode / unmount-remount.
  - В `componentWillUnmount` API інвалідується (`isDestroyed` + guard-перевизначення частини методів).
- **Що задокументовано:**
  - Частково в коментарях `App.tsx`; як окремий контракт інтеграції для host apps — задокументовано недостатньо.

#### 6) Pre-init merge логіки `openSidebar`

- **Що робить код:**
  - Під час `initializeScene()` використовується fallback на pre-init `this.state.openSidebar`, бо state міг змінитись поза `initialData`.
- **Що задокументовано:**
  - Inline-коментар у коді є; у docs немає окремого розділу про цей dependency від порядку ініціалізації.

#### 7) Failsafe для неправильного порядку state updates

- **Що робить код:**
  - У `componentDidUpdate` є guard: якщо `editingTextElement` уже deleted, він примусово скидається в `null`.
  - Це явний захист від неконсистентного update-order.
- **Що задокументовано:**
  - Тільки inline-коментар; формально цей edge-case не описаний у документації.

#### 8) Restore-side effect, що може ламати sync/versioning

- **Що робить код:**
  - У `packages/excalidraw/data/restore.ts` для порожнього text елемента (`deleteInvisibleElements`) елемент примусово маркується deleted і `bumpVersion(...)`.
  - TODO вказує, що це може порушувати delta-sync/versioning (видалення не записується як окрема операція).
- **Що задокументовано:**
  - Є TODO у коді; у docs немає окремого попередження про цей ризик.

#### 9) Library cleanup і scope Jotai store

- **Що робить код:**
  - `Library.destroy()` чистить частину Jotai-стану, але повне скидання `libraryItemsAtom` закоментовано з TODO до scoped store per instance.
  - Потенційно створює cross-instance coupling для multi-editor сценаріїв.
- **Що задокументовано:**
  - Лише TODO у коді, без explicit doc про наслідки для багатьох інстансів.

### Висновок

- Ключові неявні поведінки виявлені та локалізовані переважно в:
  - `packages/excalidraw/components/App.tsx`
  - `packages/excalidraw/data/restore.ts`
  - `packages/excalidraw/data/library.ts`
  - `packages/excalidraw/tests/selection.test.tsx`
- Поточна документація покриває архітектуру загалом, але **не формалізує edge-case контракти** (state machines, recovery paths, init-order assumptions) на рівні інтеграційного гайду.