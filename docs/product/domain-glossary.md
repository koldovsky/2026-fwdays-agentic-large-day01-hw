# Domain Glossary — Excalidraw

Словник доменних термінів, які мають **специфічне значення** в кодовій базі Excalidraw. Для кожного терміну вказано визначення в контексті проєкту, ключові файли та типові помилки інтерпретації.

**Мова:** визначення та пояснення — **українською**; імена типів, файлів і символів у коді — **англійською**, як у репозиторії; назви полів і літерали в зворотних лапках `` `...` `` можуть лишатися англійською.

---

## Element (`ExcalidrawElement`)

**Визначення.** Базова одиниця контенту на canvas — будь-який намальований об'єкт: прямокутник, стрілка, текст, зображення тощо. У коді представлений як tagged union `ExcalidrawElement` з дискримінатором `type`.

**Ключові властивості (з `_ExcalidrawElementBase`):** `id`, `type`, `x`, `y`, `width`, `height`, `angle`, `strokeColor`, `backgroundColor`, `opacity`, `seed`, `version`, `versionNonce`, `index` (дробове впорядкування), `isDeleted`, `groupIds`, `frameId`, `boundElements`, `locked`.

**Підтипи:**

| Тип | `type` | Додаткові поля |
|-----|--------|----------------|
| `ExcalidrawRectangleElement` | `"rectangle"` | — |
| `ExcalidrawEllipseElement` | `"ellipse"` | — |
| `ExcalidrawDiamondElement` | `"diamond"` | — |
| `ExcalidrawTextElement` | `"text"` | `fontSize`, `fontFamily`, `text`, `containerId` |
| `ExcalidrawLinearElement` | `"line"` / `"arrow"` | `points`, `startBinding`, `endBinding` |
| `ExcalidrawFreeDrawElement` | `"freedraw"` | `points`, `pressures` |
| `ExcalidrawImageElement` | `"image"` | `fileId`, `status`, `crop` |
| `ExcalidrawFrameElement` | `"frame"` | `name` |
| `ExcalidrawEmbeddableElement` | `"embeddable"` | — |
| `ExcalidrawIframeElement` | `"iframe"` | — |

**Де використовується:** `packages/element/src/types.ts` (визначення), `packages/element/src/Scene.ts` (зберігання), `packages/excalidraw/components/App.tsx` (маніпуляції).

**НЕ плутати з:** DOM-елементами або React-елементами. `ExcalidrawElement` — це JSON-серіалізовна модель даних canvas-об'єкта, що не має нічого спільного з HTML/React.

---

## Scene

**Визначення.** Клас, що є **авторитетним in-memory сховищем** усіх елементів canvas. Підтримує впорядкований масив елементів, Maps для швидкого пошуку за `id`, кеш non-deleted елементів, кеш виділення та систему підписки на оновлення.

**Ключові методи:** `replaceAllElements`, `insertElement`, `mutateElement`, `getNonDeletedElements`, `getSelectedElements`, `triggerUpdate`, `getSceneNonce`.

**Механізм інвалідації:** `sceneNonce` — випадкове число, що змінюється при кожному оновленні сцени; використовується як **ключ кешу** для мемоізованого рендерингу та React re-render через `onUpdate` → `triggerRender`.

**Де використовується:** `packages/element/src/Scene.ts` (визначення), `packages/excalidraw/components/App.tsx` (`this.scene = new Scene()`), `packages/excalidraw/scene/Renderer.ts` (споживає `scene.getNonDeletedElements()`).

**НЕ плутати з:** модулями `staticScene` / `interactiveScene` у `packages/excalidraw/renderer/` — це функції рендерингу canvas-шарів, а не клас `Scene`, який керує даними елементів.

---

## AppState

**Визначення.** Інтерфейс, що описує **весь UI-стан редактора**, окрім самих елементів: активний інструмент, виділені елементи, viewport (zoom, scroll), стилі за замовчуванням для нових елементів, стан відкритих меню, тема, collab-дані тощо.

**Ключові групи полів:**
- **Інструменти:** `activeTool`, `penMode`, `isBindingEnabled`
- **Виділення:** `selectedElementIds`, `selectedGroupIds`, `editingGroupId`
- **Viewport:** `zoom`, `scrollX`, `scrollY`, `width`, `height`
- **Стилі нових елементів:** `currentItemStrokeColor`, `currentItemBackgroundColor`, `currentItemFontSize`, …
- **UI chrome:** `openMenu`, `openSidebar`, `openDialog`, `zenModeEnabled`, `theme`
- **Колаборація:** `collaborators`, `userToFollow`, `followedBy`

**Управління станом:** React `setState` на класі `App` (без Redux/Zustand). Оновлення через `syncActionResult` (результат Action) та `updateScene`.

**Персистентність:** контролюється `APP_STATE_STORAGE_CONF` — per-key map з трьома прапорцями: `browser` (localStorage), `export` (JSON-файл), `server` (Firebase). Більшість полів зберігаються лише в `browser`.

**Де використовується:** `packages/excalidraw/types.ts` (інтерфейс `AppState`), `packages/excalidraw/appState.ts` (defaults + `APP_STATE_STORAGE_CONF`), `packages/excalidraw/components/App.tsx` (React state).

**НЕ плутати з:** станом елементів — елементи живуть у `Scene`, а `AppState` описує все навколо них (UI, viewport, tool). Це два паралельних потоки даних.

---

## Tool (`ToolType` / `ActiveTool` / `AppState.activeTool`)

**Визначення.** **Режим взаємодії** з canvas — що відбувається при кліку/drag: малювання фігури, виділення, переміщення, стирання тощо.

**`ToolType`:** union з 16 рядкових літералів — `"selection"`, `"lasso"`, `"rectangle"`, `"diamond"`, `"ellipse"`, `"arrow"`, `"line"`, `"freedraw"`, `"text"`, `"image"`, `"eraser"`, `"hand"`, `"frame"`, `"magicframe"`, `"embeddable"`, `"laser"`.

**`ActiveTool`:** не обгортка навколо `AppState`, а окремий тип у `packages/excalidraw/types.ts` — дискримінований union: або `{ type: ToolType; customType: null }`, або `{ type: "custom"; customType: string }` для сторонніх інструментів. Поля `locked`, `lastActiveTool`, `fromSelection` до **`ActiveTool` не входять**.

**`AppState.activeTool`:** об’єкт типу `{ lastActiveTool: ActiveTool | null; locked: boolean; fromSelection: boolean } & ActiveTool` — тут зберігається поточний інструмент разом із метаданими: фіксація інструменту після малювання (`locked`), попередній інструмент для виходу з `eraser` / `hand` (`lastActiveTool`), тимчасове перемикання з режиму виділення (`fromSelection`).

**Де використовується:** `packages/excalidraw/types.ts` (`ToolType`, `ActiveTool`, поле `activeTool` в `AppState`), `packages/common/src/constants.ts` (`TOOL_TYPE`), `packages/excalidraw/components/App.tsx` (`setActiveTool`), toolbar-компоненти.

**НЕ плутати з:** Action. Tool — це *режим* (що робитиму), Action — це *команда* (зроби зараз). Деякі Action можуть перемикати Tool (наприклад, `actionSetFrameAsActiveTool`).

---

## Action (`Action` / `ActionManager`)

**Визначення.** **Іменована команда** з методом `perform`, що приймає поточні елементи, `AppState` і контекст, і повертає `ActionResult` — новий стан елементів та/або `AppState`. Система Action є головним механізмом мутації стану в Excalidraw.

**`ActionResult`:** `{ elements?, appState?, files?, captureUpdate }` або `false` (нічого не змінювати). Поле `captureUpdate` контролює, чи записується зміна в історію (undo/redo).

**`ActionManager`:** клас, що зберігає реєстр усіх Action, виконує їх (`executeAction`), обробляє keyboard shortcuts (`handleKeyDown`), рендерить панельні компоненти (`renderAction`).

**Реєстрація:** кожен Action-модуль викликає `register(action)` з `actions/register.ts`; `App` constructor виконує `actionManager.registerAll(actions)`.

**Приклади:** `actionDeleteSelected`, `actionCopy`, `actionPaste`, `actionClearCanvas`, `actionZoomIn`, `actionToggleTheme`, `actionChangeViewBackgroundColor`.

**Де використовується:** `packages/excalidraw/actions/types.ts` (інтерфейс `Action`, `ActionResult`, `ActionName`), `packages/excalidraw/actions/manager.tsx` (`ActionManager`), `packages/excalidraw/actions/register.ts`, 40+ файлів конкретних Action у `packages/excalidraw/actions/`.

**НЕ плутати з:** Redux actions або DOM events. Excalidraw Action — це зареєстрований об'єкт з `perform`, `keyTest`, `PanelComponent`; виконується через `ActionManager`, а не через dispatch.

---

## Binding (Bound Element)

**Визначення.** **Зв'язок між стрілкою (arrow) і фігурою**, до якої вона прикріплена. Стрілка зберігає `startBinding` / `endBinding` (тип `FixedPointBinding`: `elementId` + `fixedPoint` + `mode`), а цільова фігура зберігає список `boundElements` (масив `{ id, type: "arrow" | "text" }`).

**`BindMode`:** `"inside"` | `"orbit"` | `"skip"` — визначає, як кінець стрілки взаємодіє з межею фігури.

**Два види binding:**
1. **Arrow → Shape** — endpoint стрілки прикріплений до фігури; при переміщенні фігури стрілка слідує за нею.
2. **Text → Container** — текстовий елемент всередині фігури; `containerId` на тексті + `boundElements` з `type: "text"` на контейнері.

**`isBindingElement` vs `isBindableElement`:** перший перевіряє, чи є елемент **стрілкою** (тобто може мати binding), другий — чи є елемент **фігурою**, до якої можна прив'язатися.

**Де використовується:** `packages/element/src/types.ts` (`BoundElement`, `FixedPointBinding`), `packages/element/src/binding.ts` (вся логіка), `packages/element/src/linearElementEditor.ts`, `packages/element/src/typeChecks.ts`.

**НЕ плутати з:** data binding (React/Angular) або event binding. У Excalidraw binding — це **геометричний зв'язок** між елементами canvas.

---

## Linear Element

**Визначення.** Елемент, геометрія якого визначається **масивом точок** (`points: LocalPoint[]`) — лінія або стрілка. Тип `ExcalidrawLinearElement` з `type: "line" | "arrow"`.

**Як працюють `points`:** координати в локальній системі елемента; перша точка нормалізується до `[0, 0]`, глобальна позиція визначається `x`/`y` елемента.

**Підтипи:**
- `ExcalidrawLineElement` — `type: "line"`, має `polygon` (замкнутий контур)
- `ExcalidrawArrowElement` — `type: "arrow"`, має `startArrowhead`, `endArrowhead`, bindings
- `ExcalidrawElbowArrowElement` — стрілка з `elbowed: true`, автоматичне прокладання маршруту

**`LinearElementEditor`:** об'єкт сесії редагування — зберігає виділені точки, стан drag, index виділеного endpoint. Живе в `AppState.selectedLinearElement`, а **не** в самому елементі.

**Де використовується:** `packages/element/src/types.ts`, `packages/element/src/linearElementEditor.ts` (клас `LinearElementEditor`), `packages/excalidraw/components/App.tsx`.

**НЕ плутати з:** `freedraw` — теж має `points`, але це окремий тип (`ExcalidrawFreeDrawElement`), не `ExcalidrawLinearElement`. "Linear" не означає "пряма лінія" — полілінії та elbowed-стрілки теж є linear elements.

---

## Library (`LibraryItem`)

**Визначення.** Колекція **збережених наборів елементів**, які можна повторно використовувати. Кожен `LibraryItem` — це масив `ExcalidrawElement[]` з метаданими: `id`, `status` (`"published"` | `"unpublished"`), `created`, `name`.

**Зберігання:** IndexedDB через `LibraryIndexedDBAdapter` (ключ `excalidraw-library` в `idb-keyval`). Є міграція зі старого localStorage-формату.

**UI:** `LibraryMenu` → `LibraryMenuItems` → `LibraryUnit`; drag-and-drop для вставки на canvas.

**Де використовується:** `packages/excalidraw/types.ts` (`LibraryItem`), `packages/excalidraw/data/library.ts` (persistence, merge), `excalidraw-app/data/LocalData.ts` (`LibraryIndexedDBAdapter`), `packages/excalidraw/components/LibraryMenu.tsx`.

**НЕ плутати з:** npm-бібліотекою `@excalidraw/excalidraw`. Library тут — це **UI-фіча**: бічна панель із збереженими шаблонами фігур.

---

## Collaboration (Collab / Portal)

**Визначення.** Режим реального часу, в якому кілька користувачів одночасно редагують одну сцену. Реалізований на базі **Socket.IO** (транспорт) + **Firebase** (persistence сцен і файлів) + **E2E шифрування** (ключ у URL-хеші).

**Ключові поняття:**
- **Room** — кімната, ідентифікована `roomId` + `roomKey`; URL вигляду `#room=<id>,<key>`.
- **Portal** — клас-обгортка над Socket.IO з'єднанням: `socket`, `roomId`, `roomKey`, методи `_broadcastSocketData` (encrypt + emit).
- **Collab** — React-компонент, що оркеструє Portal, Firebase, reconciliation елементів, pointer updates.
- **WS_SUBTYPES:** `SCENE_INIT`, `SCENE_UPDATE`, `MOUSE_LOCATION`, `IDLE_STATUS`, `USER_VISIBLE_SCENE_BOUNDS`.

**Де використовується:** `excalidraw-app/collab/Collab.tsx`, `excalidraw-app/collab/Portal.tsx`, `excalidraw-app/data/firebase.ts`, `packages/excalidraw/types.ts` (`Collaborator`, `collaborators`), `excalidraw-app/app_constants.ts` (`WS_EVENTS`, `WS_SUBTYPES`).

**НЕ плутати з:** `Portal` — це **НЕ** React `createPortal`. У контексті Excalidraw `Portal` — це клас транспортного рівня для Socket.IO. `isCollaborating` prop на `<Excalidraw>` — лише прапорець для UI; повна collab-логіка живе в `excalidraw-app`, а не в пакеті `@excalidraw/excalidraw`.

---

## Store

**Визначення.** Клас, що відповідає за **облік змін** (undo/redo та інкрементальні оновлення). Працює з двома типами інкрементів: **`DurableIncrement`** (записуються в історію) та **`EphemeralIncrement`** (тимчасові, не для undo).

**Механізм:** при виконанні Action, `captureUpdate` визначає, чи записувати зміну. `Store` порівнює snapshot до/після та генерує delta. `History` підписується на `onDurableIncrementEmitter` для undo/redo стеку.

**Де використовується:** `packages/element/src/store.ts` (клас `Store`), `packages/excalidraw/components/App.tsx` (`this.store`), `packages/excalidraw/history.ts` (споживає `DurableIncrement`).

**НЕ плутати з:** Redux store або іншими state management рішеннями. `Store` в Excalidraw — спеціалізований механізм **обліку інкрементальних змін**, а не загальне сховище стану.

---

## Frame

**Визначення.** Контейнерний елемент (`type: "frame"` або `"magicframe"`), що візуально та логічно групує інші елементи. Елементи всередині frame мають `frameId`, що вказує на батьківський frame. При експорті frame використовується як clip-область.

**Варіанти:**
- `ExcalidrawFrameElement` — звичайний frame з опціональним `name`
- `ExcalidrawMagicFrameElement` — magic frame; генерація контенту вимагає налаштованого клієнтського бекенду (`VITE_APP_AI_BACKEND` у `packages/excalidraw/vite-env.d.ts`), а не вбудованого сервера в репозиторії (узгоджено з розділом про Frames у [PRD.md](PRD.md)).

**Де використовується:** `packages/element/src/types.ts` (типи), `packages/excalidraw/actions/actionFrame.ts` (actions), `packages/excalidraw/frame.ts` (утиліти), `packages/excalidraw/components/App.tsx` (`onMagicFrameGenerate`), `packages/excalidraw/renderer/` (clip rendering).

**НЕ плутати з:** HTML `<iframe>` або animation frame. Frame в Excalidraw — це **логічний контейнер** на canvas, аналог artboard у Figma.
