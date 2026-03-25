# Domain Glossary — Excalidraw Project

> Верифіковано зі source code. Дата: 2026-03-25.
>
> Терміни наведені англійською, як вони існують у коді. Для кожного терміну вказані ключові файли та важлива відмінність між загальним та проєктним значенням.

---

## Зміст

1. [ExcalidrawElement](#excalidrawelement)
2. [Element](#element)
3. [Scene](#scene)
4. [AppState](#appstate)
5. [Tool / ActiveTool](#tool--activetool)
6. [Action](#action)
7. [ActionResult](#actionresult)
8. [ActionManager](#actionmanager)
9. [Renderer](#renderer)
10. [Store](#store)
11. [History / HistoryDelta](#history--historydelta)
12. [Collaboration / Collaborator](#collaboration--collaborator)
13. [Library / LibraryItem](#library--libraryitem)
14. [BinaryFiles / FileId](#binaryfiles--fileid)
15. [Frame / MagicFrame](#frame--magicframe)
16. [Binding / BoundElement](#binding--boundelement)
17. [sceneNonce](#scenenonce)
18. [mutateElement](#mutateelement)
19. [editorJotaiStore](#editorjotaistore)
20. [FractionalIndex](#fractionalindex)
21. [ShapeCache](#shapecache)
22. [LinearElementEditor](#linearelementeditor)
23. [roughjs](#roughjs)
24. [THEME](#theme)

---

## ExcalidrawElement

**Назва в коді:** `ExcalidrawElement`

**Визначення в проєкті:**
Базовий union-тип для всіх об'єктів, що можна намалювати на canvas. Включає такі підтипи:
`rectangle`, `diamond`, `ellipse`, `arrow`, `line`, `freedraw`, `text`, `image`, `frame`, `magicframe`, `iframe`, `embeddable`.

Кожен елемент — **immutable value object**: при зміні властивостей створюється новий об'єкт (або мутується in-place через `mutateElement` з оновленням `version` і `versionNonce`). Елемент завжди serializable у JSON і не містить обчислених даних.

**Ключові файли:**
- [`packages/element/src/types.ts`](../../packages/element/src/types.ts) — декларація типів `_ExcalidrawElementBase`, `ExcalidrawElement` та всіх підтипів
- [`packages/element/src/newElement.ts`](../../packages/element/src/newElement.ts) — фабричні функції (`newElement`, `newTextElement`, etc.)
- [`packages/element/src/mutateElement.ts`](../../packages/element/src/mutateElement.ts) — єдине місце мутації елемента

**НЕ плутати з:**
- *Загальне значення* — DOM-елемент (`HTMLElement`). У проєкті `Element` без префікса `Excalidraw` може означати будь-що.
- *Проєктне значення* — виключно об'єкт даних полотна (x, y, width, height, strokeColor тощо), що зберігається в `Scene`. Не має зв'язку з DOM.

---

## Element

**Назва в коді:** `element` (локальні змінні), `ExcalidrawElement` (тип)

**Визначення в проєкті:**
Скорочена форма `ExcalidrawElement` у локальному контексті. У функціях пакету `@excalidraw/element` змінна `element` завжди означає один запис полотна.

**Ключові поля базового типу** (`_ExcalidrawElementBase`):

| Поле | Тип | Призначення |
|---|---|---|
| `id` | `string` | Унікальний UUID елемента |
| `x`, `y` | `number` | Координата лівого верхнього кута у canvas-просторі |
| `width`, `height` | `number` | Розміри bounding box |
| `angle` | `Radians` | Кут повороту |
| `version` | `number` | Монотонно зростає при кожній зміні; основа для reconciliation у collab |
| `versionNonce` | `number` | Рандомне число; второй ключ reconciliation при однакових версіях |
| `index` | `FractionalIndex \| null` | Z-порядок у вигляді fractional index рядка |
| `isDeleted` | `boolean` | Soft-delete: елемент залишається в сцені для sync |
| `groupIds` | `GroupId[]` | Масив груп (від дочірньої до батьківської) |
| `frameId` | `string \| null` | Id фрейму-контейнера |
| `seed` | `number` | Константний seed для roughjs, щоб форма не змінювалась при ре-рендері |

**Ключові файли:**
- [`packages/element/src/types.ts`](../../packages/element/src/types.ts)
- [`packages/element/src/typeChecks.ts`](../../packages/element/src/typeChecks.ts) — type guards (`isTextElement`, `isLinearElement`, etc.)

**НЕ плутати з:**
- DOM `Element` — у коді ніколи не змішуються завдяки суворій TypeScript-типізації.
- `selectionElement` в AppState — спеціальний тимчасовий елемент, що позначає область виділення мишею; він не потрапляє в Scene як постійний об'єкт.

---

## Scene

**Назва в коді:** `Scene` (клас), `scene` (поле на екземплярі `App`)

**Визначення в проєкті:**
Mutable singleton-сховище всіх елементів поточного полотна. Є єдиним source of truth для списку елементів; React-стан (AppState) зберігає лише UI-метадані, але не самі елементи.

`Scene` забезпечує:
- Зберігання масиву та Map елементів (включно з `isDeleted`)
- Нотифікацію рендерера через `sceneNonce` при будь-якій зміні
- Кешування результатів `getSelectedElements` для уникнення зайвих обчислень

**Ключові методи:**

| Метод | Призначення |
|---|---|
| `replaceAllElements(next)` | Повна заміна колекції, переіндексація |
| `mutateElement(el, updates, opts)` | In-place мутація + `triggerUpdate()` якщо щось змінилось |
| `triggerUpdate()` | Збільшує `sceneNonce`, викликає підписані callbacks |
| `onUpdate(cb)` | Підписка на зміни (App використовує для виклику `triggerRender`) |
| `getSelectedElements({selectedElementIds})` | Повертає кешований список вибраних елементів |
| `getNonDeletedElements()` | Всі елементи де `isDeleted === false` |

**Ключові файли:**
- [`packages/element/src/Scene.ts`](../../packages/element/src/Scene.ts) — повна реалізація класу

**НЕ плутати з:**
- *Загальне значення* — "сцена" як театральна концепція або 3D-сцена.
- *Проєктне значення* — технічний клас-стор у пам'яті, аналог Redux store, але без React-реактивності. Оновлення в React відбувається окремо через `this.setState`.
- `SceneData` (тип) — DTO для зовнішнього API `updateScene()`, не є екземпляром класу `Scene`.

---

## AppState

**Назва в коді:** `AppState` (interface), `this.state` (в компоненті `App`)

**Визначення в проєкті:**
React-стан компонента `App` (~80 полів). Відповідає за все, що **не є елементами полотна**: UI, viewport, активний інструмент, стан редагування, коллаборація. Зберігається через `this.setState()`.

**Ключові групи полів:**

| Група | Поля |
|---|---|
| Viewport | `zoom`, `scrollX`, `scrollY`, `width`, `height`, `offsetLeft`, `offsetTop` |
| Tool | `activeTool`, `penMode`, `gridModeEnabled`, `snapLines` |
| Selection | `selectedElementIds`, `selectedGroupIds`, `selectionElement` |
| Editing | `editingTextElement`, `editingGroupId`, `multiElement`, `newElement` |
| Binding | `bindMode` (`orbit`/`skip`/`inside`), `bindingPreference`, `suggestedBinding` |
| Collab | `collaborators: Map<SocketId, Collaborator>`, `userToFollow`, `followedBy` |
| UI | `openMenu`, `openSidebar`, `openDialog`, `contextMenu`, `toast` |

Кожне поле має конфіг персистентності (`APP_STATE_STORAGE_CONF`): `browser` (localStorage), `export` (JSON/PNG), `server` (collab sync).

**Ключові файли:**
- [`packages/excalidraw/types.ts`](../../packages/excalidraw/types.ts) — `interface AppState` (~200 рядків)
- [`packages/excalidraw/appState.ts`](../../packages/excalidraw/appState.ts) — `APP_STATE_STORAGE_CONF`, initial state

**НЕ плутати з:**
- *Загальне значення* — "стан застосунку" в широкому сенсі.
- *Проєктне значення* — виключно React-state компонента `App`. Елементи полотна в AppState **не зберігаються** — вони живуть у `Scene`. `AppState` + `Scene` разом = повний стан редактора.
- `UIAppState` — підмножина AppState без `scrollX/scrollY/cursorButton`, що передається UI-компонентам.

---

## Tool / ActiveTool

**Назва в коді:** `ToolType` (union-тип), `ActiveTool` (тип), `activeTool` (поле AppState)

**Визначення в проєкті:**
Активний інструмент редагування, що визначає, як інтерпретуються pointer-події на canvas. Зберігається в `AppState.activeTool`.

**Тип `ToolType`** — один із:
`selection`, `lasso`, `rectangle`, `diamond`, `ellipse`, `arrow`, `line`, `freedraw`, `text`, `image`, `eraser`, `hand`, `frame`, `magicframe`, `embeddable`, `laser`.

**Тип `ActiveTool`** — розширений об'єкт:
```ts
{ type: ToolType; customType: null }
| { type: "custom"; customType: string }
```
Також містить `locked` (чи залишається інструмент після малювання) і `lastActiveTool` (для повернення після `eraser`/`hand`).

**Ключові файли:**
- [`packages/excalidraw/types.ts`](../../packages/excalidraw/types.ts) — `ToolType`, `ActiveTool`
- [`packages/excalidraw/components/App.tsx`](../../packages/excalidraw/components/App.tsx) — обробка `activeTool` при pointer-подіях

**НЕ плутати з:**
- *Загальне значення* — програмний "інструмент" або CLI-утиліта.
- *Проєктне значення* — виключно стан UI, що визначає режим малювання. Не є класом або об'єктом поведінки; поведінка закодована в обробниках подій `App.tsx` через `switch(activeTool.type)`.

---

## Action

**Назва в коді:** `Action<TData>` (interface), `ActionName` (union string literal)

**Визначення в проєкті:**
Структура, що описує одну операцію редактора (copy, undo, alignTop, etc.). Кожна дія має:
- `name: ActionName` — унікальний ідентифікатор (один з ~80 значень)
- `perform(elements, appState, formData, app)` — чиста функція, повертає `ActionResult`
- `keyTest(event, appState, elements, app)` — перевірка keyboard shortcut
- `PanelComponent` — React-компонент для відображення в Properties Panel
- `predicate` — умова показу/активності дії

**Ключові файли:**
- [`packages/excalidraw/actions/types.ts`](../../packages/excalidraw/actions/types.ts) — `interface Action`, `ActionName`, `ActionResult`
- [`packages/excalidraw/actions/`](../../packages/excalidraw/actions/) — директорія з реалізаціями (~40+ файлів)

**НЕ плутати з:**
- *Загальне значення* — дія як подія або Redux action-creator.
- *Проєктне значення* — статична структура-дескриптор операції, не клас. Виклик відбувається через `ActionManager.executeAction(name, source, event)`. Не є Redux action (проєкт не використовує Redux).

---

## ActionResult

**Назва в коді:** `ActionResult`

**Визначення в проєкті:**
Об'єкт, що повертає функція `Action.perform(...)`. Описує зміни, які потрібно застосувати до стану після виконання дії:

```ts
type ActionResult =
  | {
      elements?: readonly ExcalidrawElement[] | null;
      appState?: Partial<AppState> | null;
      files?: BinaryFiles | null;
      captureUpdate: CaptureUpdateActionType;
      replaceFiles?: boolean;
    }
  | false;  // false — дію слід скасувати
```

Якщо `elements` чи `appState` вказані, `ActionManager` передає їх у `App.syncActionResult()`, де вони застосовуються до `Scene` і `this.setState`.

**Ключові файли:**
- [`packages/excalidraw/actions/types.ts`](../../packages/excalidraw/actions/types.ts)

**НЕ плутати з:**
- *Загальне значення* — результат будь-якої функції.
- *Проєктне значення* — специфічний DTO між `Action.perform` та `App.syncActionResult`. Поле `captureUpdate` визначає, чи буде ця дія записана в History для undo/redo.

---

## ActionManager

**Назва в коді:** `ActionManager` (клас)

**Визначення в проєкті:**
Реєстр і диспетчер Actions. Зберігає Map усіх зареєстрованих `Action` і надає методи:
- `registerAction(action)` — реєстрація
- `executeAction(name, source, event?)` — виклик `action.perform()` + `app.syncActionResult()`
- `renderAction(name, data?)` — рендер `PanelComponent` дії
- `isActionEnabled(action, {elements, appState})` — перевірка `predicate`

**Ключові файли:**
- [`packages/excalidraw/actions/manager.tsx`](../../packages/excalidraw/actions/manager.tsx)
- [`packages/excalidraw/components/App.tsx`](../../packages/excalidraw/components/App.tsx) — використання `this.actionManager`

**НЕ плутати з:**
- *Загальне значення* — менеджер будь-яких обробників.
- *Проєктне значення* — централізована точка виконання всіх команд редактора (включно з keyboard shortcuts). Не плутати з React event handlers, що обробляють pointer events напряму в `App.tsx`.

---

## Renderer

**Назва в коді:** `Renderer` (клас), `renderStaticScene`, `renderInteractiveScene` (функції)

**Визначення в проєкті:**
Компонент, що фільтрує елементи Scene до підмножини, яку потрібно відрендерити на даному кроці. Використовує memoization з `sceneNonce` як ключ cache-invalidation.

`Renderer.getRenderableElements(params)` повертає:
- `elementsMap` — Map елементів для StaticCanvas (виключає `newElement`, WYSIWYG-текст)
- `visibleElements` — відфільтрований масив елементів у viewport (viewport culling)

Рендеринг до canvas відбувається в окремих функціях (`renderStaticScene`, `renderInteractiveScene`) і використовує `roughjs` (для hand-drawn стилю) і native Canvas 2D API.

**Ключові файли:**
- [`packages/excalidraw/scene/Renderer.ts`](../../packages/excalidraw/scene/Renderer.ts) — клас `Renderer`
- [`packages/excalidraw/renderer/staticScene.ts`](../../packages/excalidraw/renderer/staticScene.ts) — `renderStaticScene`
- [`packages/element/src/renderElement.ts`](../../packages/element/src/renderElement.ts) — рендеринг окремого елемента через roughjs

**НЕ плутати з:**
- *Загальне значення* — будь-який рендерер (WebGL, SSR, PDF).
- *Проєктне значення* — `Renderer` є лише **фільтром елементів**. Фактичне малювання пікселів відбувається у функціях `renderStaticScene` / `renderInteractiveScene`, які викликаються з React-компонентів `StaticCanvas.tsx` / `InteractiveCanvas.tsx`.

---

## Store

**Назва в коді:** `Store` (клас), `CaptureUpdateAction` (enum)

**Визначення в проєкті:**
Менеджер snapshot-ів між `Scene` і `History`. Відповідає за:
- Ведення поточного snapshot елементів (`StoreSnapshot`)
- Визначення, чи треба записати новий запис до History при кожному оновленні
- Генерацію `StoreChange` (diff між snapshots) і передачу його в `History.record(delta)`

**Три режими** через `CaptureUpdateAction`:
- `IMMEDIATELY` — записати в History зараз
- `NEVER` — не записувати (UI-only зміна)
- `EVENTUALLY` — відкласти (для streaming)

**Ключові файли:**
- [`packages/element/src/store.ts`](../../packages/element/src/store.ts) — клас `Store`, `StoreSnapshot`, `StoreChange`, `StoreDelta`
- [`packages/excalidraw/history.ts`](../../packages/excalidraw/history.ts) — взаємодія `History` ↔ `Store`

**НЕ плутати з:**
- *Загальне значення* — Redux store, Zustand store, браузерне сховище.
- *Проєктне значення* — вузький клас відповідальний виключно за diffing і snapshot для undo/redo. Не є state manager і не зберігає поточний стан елементів (це робить `Scene`).

---

## History / HistoryDelta

**Назва в коді:** `History` (клас), `HistoryDelta` (клас, extends `StoreDelta`)

**Визначення в проєкті:**
`History` — стек undo/redo операцій. Зберігає масиви `undoStack` і `redoStack` об'єктів `HistoryDelta`.

`HistoryDelta` — один запис в stack. Це **inverted delta**: щоб скасувати дію, дельта застосовується у зворотному напрямку (inverted в момент запису). Дельта описує зміни як для елементів, так і для `AppState`.

**Ключовий метод `History.record(delta)`:**
- Не записує вже існуючі `HistoryDelta` (щоб уникнути подвійного запису після undo/redo)
- Очищає `redoStack` тільки якщо змінились елементи (не тільки `AppState`)

**Ключові файли:**
- [`packages/excalidraw/history.ts`](../../packages/excalidraw/history.ts)
- [`packages/element/src/delta.ts`](../../packages/element/src/delta.ts) — `StoreDelta`, базовий клас

**НЕ плутати з:**
- *Загальне значення* — git history, browser history, logging.
- *Проєктне значення* — внутрішня структура undo/redo, не пов'язана ні з URL history, ні з `window.history`. Доступ через публічний API: `ExcalidrawImperativeAPI.undo()` / `.redo()`.

---

## Collaboration / Collaborator

**Назва в коді:** `Collaborator` (тип), `Collab` (React-компонент), `collaborators: Map<SocketId, Collaborator>` (поле AppState)

**Визначення в проєкті:**
Система реального часу для спільного редагування. У `@excalidraw/excalidraw` пакеті реалізована тільки **сторона стану**: `AppState.collaborators` — Map від `SocketId` до об'єкта `Collaborator` (username, pointer, selectedElementIds, color тощо).

Фактична WebSocket-комунікація живе в `excalidraw-app/collab/Collab.tsx` і використовує Socket.IO + Firebase для зберігання сцен. Sync здійснюється через `reconcileElements` (merge за `version`/`versionNonce`).

**Тип `Collaborator`:**
```ts
type Collaborator = Readonly<{
  pointer?: CollaboratorPointer;  // x, y, "pointer"|"laser"
  username?: string | null;
  selectedElementIds?: AppState["selectedElementIds"];
  color?: { background: string; stroke: string };
  socketId?: SocketId;
  isInCall?: boolean;
  isSpeaking?: boolean;
  isMuted?: boolean;
}>;
```

**Ключові файли:**
- [`packages/excalidraw/types.ts`](../../packages/excalidraw/types.ts) — `Collaborator`, `SocketId`, `UserToFollow`
- [`excalidraw-app/collab/Collab.tsx`](../../excalidraw-app/collab/Collab.tsx) — WebSocket + Firebase логіка
- [`excalidraw-app/collab/Portal.tsx`](../../excalidraw-app/collab/Portal.tsx) — Socket.IO wrapper

**НЕ плутати з:**
- *Загальне значення* — будь-яка колаборативна система.
- *Проєктне значення* — термін вузько відноситься до real-time multiplayer режиму через WebSocket. Поле `AppState.isCollaborating` (boolean) визначає, чи активний режим. `Collaborator` описує стан **іншого** користувача, не поточного.

---

## Library / LibraryItem

**Назва в коді:** `Library` (клас), `LibraryItem` (тип), `LibraryItems` (тип)

**Визначення в проєкті:**
`Library` — менеджер колекції збережених "шаблонів" елементів. Кожен `LibraryItem` — іменована група елементів (`NonDeleted<ExcalidrawElement>[]`), яку можна вставити на canvas.

`Library` не є частиною `Scene`; зберігається через `LibraryPersistenceAdapter` (IndexedDB у `excalidraw-app`). Стан бібліотеки доступний через Jotai-атом `libraryItemsAtom`.

**Тип `LibraryItem`:**
```ts
type LibraryItem = {
  id: string;
  status: "published" | "unpublished";
  elements: readonly NonDeleted<ExcalidrawElement>[];
  created: number;
  name?: string;
};
```

**Ключові файли:**
- [`packages/excalidraw/data/library.ts`](../../packages/excalidraw/data/library.ts) — клас `Library`, `mergeLibraryItems`, `libraryItemsAtom`
- [`packages/excalidraw/types.ts`](../../packages/excalidraw/types.ts) — `LibraryItem`, `LibraryItems`, `LibraryItemsSource`

**НЕ плутати з:**
- *Загальне значення* — npm library, будь-яка програмна бібліотека.
- *Проєктне значення* — колекція користувацьких шаблонів елементів (як clipboard, але постійне сховище). Не пов'язана з `npm` чи `node_modules`. `LibraryItem.status === "published"` означає завантажений з excalidraw.com community libraries, `"unpublished"` — локально збережений.

---

## BinaryFiles / FileId

**Назва в коді:** `BinaryFiles` (тип), `FileId` (branded string тип), `BinaryFileData` (тип)

**Визначення в проєкті:**
`BinaryFiles` — словник `{ [elementId]: BinaryFileData }` для зберігання вмісту файлів (зображення, відео), прикріплених до `ExcalidrawImageElement`. Зберігається окремо від елементів, щоб великі файли не потрапляли в кожен diff.

`FileId` — унікальний ідентифікатор файлу (branded string для TypeScript type safety).

`BinaryFileData` містить `dataURL: DataURL`, `mimeType`, `created` (timestamp), `lastRetrieved`.

**Ключові файли:**
- [`packages/excalidraw/types.ts`](../../packages/excalidraw/types.ts) — `BinaryFiles`, `BinaryFileData`, `FileId`, `DataURL`
- [`excalidraw-app/data/`](../../excalidraw-app/data/) — Firebase/IndexedDB адаптери для файлів

**НЕ плутати з:**
- *Загальне значення* — будь-який бінарний файл або File API.
- *Проєктне значення* — виключно асети (зображення), прикріплені до `ExcalidrawImageElement`. `files` передаються окремо в `onChange(elements, appState, files)` і зберігаються окремо від елементів.

---

## Frame / MagicFrame

**Назва в коді:** `ExcalidrawFrameElement`, `ExcalidrawMagicFrameElement`, `ExcalidrawFrameLikeElement`

**Визначення в проєкті:**
`Frame` — спеціальний елемент-контейнер, що візуально групує і/або кліпує елементи. Елементи з `frameId === frame.id` вважаються "всередині" фрейму. При рендерингу фрейм може кліпувати (обрізати) своїх дітей.

`MagicFrame` — AI-версія Frame, в якій вміст може бути згенерований за допомогою AI (поле `customData.generationData`).

Обидва є `ExcalidrawFrameLikeElement` — union-тип для спільної обробки.

**Ключові файли:**
- [`packages/element/src/types.ts`](../../packages/element/src/types.ts) — `ExcalidrawFrameElement`, `ExcalidrawMagicFrameElement`
- [`packages/element/src/frame.ts`](../../packages/element/src/frame.ts) — логіка фреймів (membership, culling, export)

**НЕ плутати з:**
- *Загальне значення* — animation frame (RAF), HTTP request frame, stack frame.
- *Проєктне значення* — виключно візуальний контейнер на canvas. Не є React-компонентом і не пов'язаний з `requestAnimationFrame`. `frameRendering` в AppState контролює відображення рамки, назви та кліпінгу.

---

## Binding / BoundElement

**Назва в коді:** `FixedPointBinding`, `BoundElement`, `BindMode`, `isBindingEnabled`

**Визначення в проєкті:**
Механізм прив'язки стрілок (`ExcalidrawArrowElement`) до форм (`ExcalidrawBindableElement`). Коли стрілка "прив'язана" до форми, при переміщенні форми стрілка автоматично слідує.

`FixedPointBinding` описує прив'язку кінця стрілки:
```ts
type FixedPointBinding = {
  elementId: string;       // id форми
  fixedPoint: [number, number];  // відносні координати (0.0–1.0)
  mode: BindMode;          // "inside" | "orbit" | "skip"
};
```

`BindMode`:
- `"orbit"` — стрілка обходить форму ззовні
- `"inside"` — стрілка входить всередину форми
- `"skip"` — ігнорувати binding

**Ключові файли:**
- [`packages/element/src/types.ts`](../../packages/element/src/types.ts) — `FixedPointBinding`, `BindMode`, `BoundElement`
- [`packages/element/src/binding.ts`](../../packages/element/src/binding.ts) — логіка прив'язки (~84 Кб)

**НЕ плутати з:**
- *Загальне значення* — data binding в Angular/Vue, event binding, function `.bind()`.
- *Проєктне значення* — виключно механізм з'єднання стрілок і форм на canvas. `AppState.isBindingEnabled` — чи відбувається автоматична прив'язка при малюванні стрілок.

---

## sceneNonce

**Назва в коді:** `sceneNonce` (поле `Scene`, параметр `Renderer`)

**Визначення в проєкті:**
Ціле число (random integer), що змінюється при **кожній** мутації Scene. Використовується як ключ cache-invalidation для memoized функцій `Renderer.getRenderableElements`. Якщо `sceneNonce` не змінився — Renderer повертає кешований результат без перерахунку.

**Ключові файли:**
- [`packages/element/src/Scene.ts`](../../packages/element/src/Scene.ts) — `private sceneNonce: number | undefined`
- [`packages/excalidraw/scene/Renderer.ts`](../../packages/excalidraw/scene/Renderer.ts) — використовується як параметр memoize

**НЕ плутати з:**
- *Загальне значення* — cryptographic nonce (number used once) у security контексті.
- *Проєктне значення* — простий лічильник-ключ для cache invalidation. Не несе security-функції. Аналог React key, але для обчислень поза React.

---

## mutateElement

**Назва в коді:** `mutateElement` (функція), `scene.mutateElement` (метод Scene)

**Визначення в проєкті:**
Єдине правило мутації елемента. Вносить зміни in-place (не створює новий об'єкт), оновлює `version`, `versionNonce`, `updated`, інвалідує `ShapeCache`. Повертає той самий об'єкт.

**Два варіанти:**
1. `mutateElement(element, elementsMap, updates)` — з пакету `@excalidraw/element`, мутує без нотифікації рендерера.
2. `scene.mutateElement(element, updates, opts)` — обгортка, яка після мутації викликає `scene.triggerUpdate()`, що призводить до ре-рендера.

> **ВАЖЛИВО:** `mutateElement` без Scene не тригерить ре-рендер. Використовуйте `scene.mutateElement` або встановіть `informMutation: true`, якщо потрібен ré-рендер.

**Ключові файли:**
- [`packages/element/src/mutateElement.ts`](../../packages/element/src/mutateElement.ts) — базова функція
- [`packages/element/src/Scene.ts`](../../packages/element/src/Scene.ts) — `Scene.mutateElement()` обгортка

**НЕ плутати з:**
- *Загальне значення* — будь-яка mutation в JavaScript.
- *Проєктне значення* — єдина санкціонована точка зміни `ExcalidrawElement`. Пряме присвоєння `element.x = 5` порушує контракт (не оновить `version`/nonce/cache). `newElementWith` — immutable альтернатива, що повертає новий об'єкт.

---

## editorJotaiStore

**Назва в коді:** `editorJotaiStore`, `EditorJotaiProvider`, `atom` (re-exported)

**Визначення в проєкті:**
Ізольований Jotai store (через `jotai-scope` / `createIsolation()`), що існує всередині `@excalidraw/excalidraw`. Дозволяє мати кілька незалежних екземплярів редактора на сторінці без конфліктів atom-значень.

Використовується для атомарного UI-стану, який не потрібно зберігати в React `this.state`: стан бібліотеки (`libraryItemsAtom`), SVG-кеш бібліотечних елементів, etc.

**Ключові файли:**
- [`packages/excalidraw/editor-jotai.ts`](../../packages/excalidraw/editor-jotai.ts) — `createIsolation()`, export `atom`, `editorJotaiStore`
- [`packages/excalidraw/index.tsx`](../../packages/excalidraw/index.tsx) — `<EditorJotaiProvider>` як корінь дерева

**НЕ плутати з:**
- *Загальне значення* — глобальний Jotai store через `import { getDefaultStore } from 'jotai'`.
- *Проєктне значення* — ізольований store scope. Atoms, оголошені в пакеті, не конфліктують із зовнішніми Jotai-atoms хост-застосунку.

---

## FractionalIndex

**Назва в коді:** `FractionalIndex` (branded string тип), `index` (поле елемента)

**Визначення в проєкті:**
Рядковий ідентифікатор позиції елемента у Z-порядку, що дозволяє вставляти елементи між двома існуючими без перегенерації всього масиву. Реалізований за алгоритмом [rocicorp/fractional-indexing](https://github.com/rocicorp/fractional-indexing).

Масив елементів у Scene завжди **відсортований по `index`**. При reconciliation у collab новий `index` присвоюється через `syncMovedIndices` / `syncInvalidIndices`.

**Ключові файли:**
- [`packages/element/src/fractionalIndex.ts`](../../packages/element/src/fractionalIndex.ts) — генерація та валідація
- [`packages/element/src/sortElements.ts`](../../packages/element/src/sortElements.ts) — сортування елементів

**НЕ плутати з:**
- *Загальне значення* — числовий float-індекс у масиві.
- *Проєктне значення* — **рядок**, не число (наприклад, `"a0"`, `"a1"`, `"a0V"`). Порядок визначається лексикографічно. `index: null` означає, що елемент ще не прив'язаний до Scene і не має визначеного Z-порядку.

---

## ShapeCache

**Назва в коді:** `ShapeCache` (клас)

**Визначення в проєкті:**
Кеш-шар для зберігання згенерованих `roughjs` фігур (`ElementShape`). Генерація фігур у "hand-drawn" стилі є обчислювально витратною, тому результати (SVG path operations) кешуються для кожного елемента. Кеш інвалідується (видаляється запис) при будь-якій зміні геометрії елемента в функціях `mutateElement`.

**Ключові файли:**
- [`packages/element/src/shape.ts`](../../packages/element/src/shape.ts)

**НЕ плутати з:**
- *Загальне значення* — кеш браузера або пам'яті.
- *Проєктне значення* — оптимізація рендерингу виключно для `roughjs` фігур. Робота напряму з `ShapeCache` зазвичай не потрібна, генерація викликається з рендерера автоматично.

---

## LinearElementEditor

**Назва в коді:** `LinearElementEditor` (клас)

**Визначення в проєкті:**
Спеціалізований клас-помічник для відстеження стану редагування багатоточкових елементів (`line`, `arrow`). Він зберігає інформацію про виділені точки (вершини), поточну точку перетягування (драггінгу), hovered midpoints тощо. Дані цього редактора зберігаються в `AppState.selectedLinearElement`.

Оскільки `ExcalidrawLinearElement` зберігає лише `points`, для повноцінного UI редагування вершин використовується цей допоміжний стейт.

**Ключові файли:**
- [`packages/element/src/linearElementEditor.ts`](../../packages/element/src/linearElementEditor.ts)

**НЕ плутати з:**
- *Загальне значення* — редагування тексту лінійно, або загальний WYSIWYG редактор.
- *Проєктне значення* — клас управління станом виділення і переміщення контрольних точок (vertices) тільки для стрілок та ліній.

---

## roughjs

**Назва в коді:** `generator.path`, `rc.draw()` (roughjs api)

**Визначення в проєкті:**
Зовнішня бібліотека, яка є серцем візуального стилю Excalidraw ("рукописний" вигляд). Основний рендеринг простих фігур делеговано цій бібліотеці через генерацію operations (`op: "move"`, `op: "bcurveTo"`).

Елементи полотна містять параметр `roughness` та `seed`, які передаються в roughjs для забезпечення детермінованого відтворення нерівностей.

**Ключові файли:**
- [`packages/element/src/shape.ts`](../../packages/element/src/shape.ts)

**НЕ плутати з:**
- *Загальне значення* — загальна "груба" концепція.
- *Проєктне значення* — конкретний npm пакет `roughjs`.

---

## THEME

**Назва в коді:** `THEME` (enum), `theme` (поле AppState)

**Визначення в проєкті:**
Константа, яка визначає колірну тему редактора (`"light"` або `"dark"`). Ця тема перемикає CSS-змінні та впливає на рендеринг Canvas (в dark mode до кольорів застосовується інверсія — `applyDarkModeFilter(strokeColor)`).

**Ключові файли:**
- [`packages/common/src/index.ts`](../../packages/common/src/index.ts) — `THEME.LIGHT`, `THEME.DARK`
- [`packages/excalidraw/components/App.tsx`](../../packages/excalidraw/components/App.tsx) — обробка теми

**НЕ плутати з:**
- *Загальне значення* — тема для операційної системи.
- *Проєктне значення* — глобальний прапорець, що змінює інверсію об'єктів при малюванні без необхідності міняти властивості самих об'єктів у `Scene`.

---

*Документ підтримується в актуальному стані при змінах у файлах-джерелах.*
