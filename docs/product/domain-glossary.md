# Словник доменних термінів Excalidraw

Цей документ описує ключові терміни, що використовуються в кодовій базі Excalidraw.
Для кожного терміну наведено визначення в контексті проєкту, ключові файли та відмінності від загальновживаного значення.

---

## Element

**Визначення в контексті проєкту:**
Базова одиниця малювання на полотні — будь-який графічний об'єкт (прямокутник, еліпс, стрілка, текст, зображення тощо). Кожен елемент має унікальний `id`, координати (`x`, `y`), розміри (`width`, `height`), стилі (`strokeColor`, `backgroundColor`, `opacity`) та метадані для колаборації (`version`, `versionNonce`, `index`).

**Де використовується:**
- `packages/element/src/types.ts` — базовий тип `_ExcalidrawElementBase` (рядок 40)
- `packages/element/src/newElement.ts` — фабричні функції створення елементів
- `packages/element/src/mutateElement.ts` — мутація елементів з трекінгом версій
- `packages/element/src/typeChecks.ts` — guard-функції для перевірки типу елементів

**НЕ плутати з:**
В загальному значенні "element" — це будь-який елемент DOM або абстрактний елемент колекції. В Excalidraw це конкретно **графічний примітив на полотні**, JSON-серіалізований об'єкт без обчислюваних даних, призначений для синхронізації між учасниками.

---

## ExcalidrawElement

**Визначення в контексті проєкту:**
Дискримінований union-тип TypeScript, що об'єднує всі конкретні типи елементів: `ExcalidrawGenericElement` (rectangle, diamond, ellipse), `ExcalidrawTextElement`, `ExcalidrawLinearElement` (arrow, line), `ExcalidrawFreeDrawElement`, `ExcalidrawImageElement`, `ExcalidrawFrameElement`, `ExcalidrawMagicFrameElement`, `ExcalidrawIframeElement`, `ExcalidrawEmbeddableElement`.

Також існують похідні типи:
- `NonDeletedExcalidrawElement` — виключає видалені елементи
- `OrderedExcalidrawElement` — містить `FractionalIndex` для впорядкування в мультиплеєрі
- `ExcalidrawBindableElement` — елементи, до яких можна прив'язати стрілки
- `ExcalidrawTextContainer` — елементи-контейнери для тексту

**Де використовується:**
- `packages/element/src/types.ts` — визначення union-типу (рядок 206)
- `packages/element/src/renderElement.ts` — рендеринг за типом елемента
- `packages/excalidraw/types.ts` — використовується в `SceneData`, `AppState`

**НЕ плутати з:**
Це не один конкретний тип, а **об'єднання (union) усіх підтипів**. Конкретний тип визначається полем `type` (наприклад, `"rectangle"`, `"arrow"`, `"text"`).

---

## Scene

**Визначення в контексті проєкту:**
Клас, що управляє всією колекцією елементів на полотні. Зберігає як усі елементи (включно з видаленими), так і окремо лише активні. Відповідає за вставку, заміну, мутацію елементів, кешування вибраних елементів, та нотифікацію підписників про зміни через патерн Observable (`onUpdate(callback)`). Використовує `sceneNonce` — випадкове число, що оновлюється при кожній зміні, для інвалідації кешу рендерера.

**Де використовується:**
- `packages/element/src/Scene.ts` — визначення класу `Scene`
- `packages/excalidraw/components/App.tsx` — `this.scene = new Scene()` (рядок ~617)
- `packages/excalidraw/scene/Renderer.ts` — отримує Scene в конструкторі для доступу до елементів
- `packages/excalidraw/renderer/staticScene.ts` — статичний рендеринг елементів Scene
- `packages/excalidraw/renderer/interactiveScene.ts` — інтерактивний рендеринг

**НЕ плутати з:**
В загальному значенні "scene" — це довільна 3D/2D сцена. В Excalidraw Scene — це **менеджер колекції елементів** з підтримкою undo/redo, синхронізації та кешування, а не візуальне представлення.

---

## AppState

**Визначення в контексті проєкту:**
Інтерфейс TypeScript, що містить увесь стан UI та взаємодії користувача з редактором. Включає:
- **Viewport:** `zoom`, `scrollX`, `scrollY`, `width`, `height`
- **Виділення:** `selectedElementIds`, `selectedGroupIds`, `hoveredElementIds`
- **Активний інструмент:** `activeTool` (поточний Tool)
- **Стилі за замовчуванням:** `currentItemStrokeColor`, `currentItemFontSize` тощо
- **Редагування:** `editingTextElement`, `newElement`, `resizingElement`
- **Режими:** `viewModeEnabled`, `zenModeEnabled`, `gridModeEnabled`
- **Колаборація:** `collaborators`, `userToFollow`, `followedBy`
- **UI:** `contextMenu`, `openDialog`, `openSidebar`, `isLoading`

**Де використовується:**
- `packages/excalidraw/types.ts` — визначення інтерфейсу `AppState` (рядок 272)
- `packages/excalidraw/components/App.tsx` — `React.Component<AppProps, AppState>`
- `packages/excalidraw/actions/types.ts` — дії отримують та повертають `AppState`
- `packages/excalidraw/data/restore.ts` — відновлення стану з файлу

**НЕ плутати з:**
Це не глобальний стан додатку у розумінні Redux/MobX. AppState — це **React-стан головного компонента App**, що керує виключно інтерактивною частиною (UI, viewport, вибір), а не даними малюнка (за це відповідає Scene).

---

## Tool

**Визначення в контексті проєкту:**
Інструмент малювання, який користувач активує через панель інструментів або гарячі клавіші. Визначається як union-тип `ToolType` з 16 значень: `selection`, `lasso`, `rectangle`, `diamond`, `ellipse`, `arrow`, `line`, `freedraw`, `text`, `image`, `eraser`, `hand`, `frame`, `magicframe`, `embeddable`, `laser`. Зберігається в `AppState.activeTool` через обгортку `ActiveTool`, яка додає поля `locked` (фіксація інструменту) та `lastActiveTool` (для повернення до попереднього).

**Де використовується:**
- `packages/common/src/constants.ts` — константи `TOOL_TYPE` (рядок 447)
- `packages/excalidraw/types.ts` — типи `ToolType`, `ActiveTool`
- `packages/excalidraw/components/App.tsx` — метод `setActiveTool()`
- `packages/excalidraw/components/toolbar/` — UI панель інструментів

**НЕ плутати з:**
В загальному значенні "tool" — будь-який програмний інструмент. В Excalidraw Tool — це **конкретний режим малювання**, що визначає, який тип елемента створюється при взаємодії з полотном (або спеціальний режим, як `hand` чи `eraser`).

---

## Action

**Визначення в контексті проєкту:**
Дискретна операція, яку можна виконати над станом редактора. Кожна Action реєструється через функцію `register()` і має: `name` (ActionName), `label` (для UI), `perform` (функція-обробник), `keyTest` (перевірка гарячої клавіші), `predicate` (умова доступності), `PanelComponent` (React-компонент для панелі). Функція `perform` отримує `elements`, `appState`, `value` та повертає `ActionResult` з оновленими `elements` і `appState`. В кодовій базі зареєстровано 147+ дій.

**Де використовується:**
- `packages/excalidraw/actions/types.ts` — інтерфейс `Action`, тип `ActionResult`
- `packages/excalidraw/actions/register.ts` — функція реєстрації `register()`
- `packages/excalidraw/actions/actionDeleteSelected.ts` — приклад: видалення елементів
- `packages/excalidraw/actions/actionHistory.ts` — приклад: undo/redo
- `packages/excalidraw/actions/actionAlign.ts` — приклад: вирівнювання
- `packages/excalidraw/components/App.tsx` — диспетчеризація дій

**НЕ плутати з:**
Це не Redux action і не DOM event. Action в Excalidraw — це **самодостатній об'єкт-команда** з логікою виконання, прив'язкою до клавіш та UI-компонентом, зареєстрований у глобальному реєстрі дій.

---

## Collaboration

**Визначення в контексті проєкту:**
Система спільного редагування в реальному часі через WebSocket (socket.io). Клас `Collab` керує сесією колаборації, а клас `Portal` — з'єднанням через сокет. Кімната (room) ідентифікується парою `roomId` + `roomKey`. Portal слухає події `"init-room"`, `"new-user"`, `"room-user-change"` і транслює оновлення елементів з шифруванням. Кожен учасник представлений типом `Collaborator` з полями: позиція курсора, вибрані елементи, ім'я, аватар, стан активності.

**Де використовується:**
- `excalidraw-app/collab/Collab.tsx` — головний клас колаборації
- `excalidraw-app/collab/Portal.tsx` — WebSocket-з'єднання через socket.io
- `packages/excalidraw/types.ts` — типи `Collaborator`, `SocketId`, `CollaboratorPointer`
- `packages/excalidraw/components/live-collaboration/LiveCollaborationTrigger.tsx` — UI-кнопка запуску колаборації
- `packages/excalidraw/types.ts` — `AppState.collaborators` (Map<SocketId, Collaborator>)

**НЕ плутати з:**
Це не Git-колаборація чи коментарі. Collaboration в Excalidraw — це **real-time синхронізація полотна** між учасниками через WebSocket з шифруванням, відображенням курсорів та підтримкою функції "слідувати за користувачем".

---

## Library

**Визначення в контексті проєкту:**
Колекція збережених елементів для повторного використання. Клас `Library` керує списком `LibraryItem` (масив елементів зі статусом `"published"` або `"unpublished"`). Підтримує завантаження з URL/Blob, злиття колекцій, та персистентність через адаптери `LibraryPersistenceAdapter` і `LibraryMigrationAdapter`. Оновлення відбуваються через чергу промісів (`updateQueue`) і нотифікуються через Emitter-патерн.

**Де використовується:**
- `packages/excalidraw/data/library.ts` — клас `Library`
- `packages/excalidraw/data/types.ts` — типи `LibraryItem`, `LibraryItems`
- `packages/excalidraw/actions/actionAddToLibrary.ts` — дія додавання до бібліотеки
- `packages/excalidraw/components/LibraryMenu.tsx` — UI-компонент бібліотеки

**НЕ плутати з:**
Це не бібліотека залежностей (npm library) і не бібліотека компонентів. Library в Excalidraw — це **персональна колекція шаблонів**, набір збережених груп елементів, які можна перетягнути на полотно для повторного використання.

---

## Bound Element

**Визначення в контексті проєкту:**
Елемент, до якого прив'язаний інший елемент — стрілка або текст. Наприклад, прямокутник може мати прив'язану стрілку (стрілка «чіпляється» до краю фігури і слідує за нею при переміщенні) або прив'язаний текст (текст відображається всередині фігури). Зв'язок зберігається у полі `boundElements` батьківського елемента (масив `{id, type}`) та у полі `containerId` (для тексту) або `startBinding`/`endBinding` (для стрілок) дочірнього елемента.

**Де використовується:**
- `packages/element/src/types.ts` — поле `boundElements` у `_ExcalidrawElementBase`
- `packages/element/src/binding.ts` — движок зв'язування: `bindLinearElement()`, `unbindLinearElement()`, `getElligibleElementForBindingElement()`
- `packages/element/src/textElement.ts` — прив'язка тексту до контейнерів (`getBoundTextElement()`, `getContainerElement()`)
- `packages/element/src/typeChecks.ts` — guard `isBindableElement()`, `isBoundToContainer()`

**НЕ плутати з:**
В загальному значенні "bound" — це межа або обмеження. В Excalidraw Bound Element — це **елемент-батько, до якого прикріплені дочірні елементи** (стрілки або текст), що утворюють стабільний візуальний зв'язок і рухаються разом.

---

## Linear Element

**Визначення в контексті проєкту:**
Елемент, що складається з послідовності точок, з'єднаних сегментами — лінія (`line`) або стрілка (`arrow`). Визначається типом `ExcalidrawLinearElement` з додатковим полем `points` (масив відносних координат `[x, y]`). Стрілки додатково мають `startBinding`, `endBinding` (прив'язка до фігур), `startArrowhead`, `endArrowhead` (наконечники) та `elbowed` (ламана стрілка). Редагування точок здійснюється через клас `LinearElementEditor`, який дозволяє додавати, видаляти та переміщувати окремі точки.

**Де використовується:**
- `packages/element/src/types.ts` — тип `ExcalidrawLinearElement`, `ExcalidrawArrowElement`
- `packages/element/src/linearElement.ts` — клас `LinearElementEditor` (~2000 рядків)
- `packages/element/src/newElement.ts` — фабрики `newLinearElement()`, `newArrowElement()`
- `packages/element/src/binding.ts` — логіка прив'язки стрілок до фігур

**НЕ плутати з:**
Це не лінійна алгебра і не лінійний gradient. Linear Element — це **елемент з довільною кількістю точок** (polyline), що відрізняється від «простих» фігур (rectangle, ellipse), які визначаються лише позицією та розмірами.
