# Domain Glossary

Словник термінів проєкту Excalidraw. Терміни наведено англійською мовою, як вони зустрічаються у коді.

---

## Element

**Визначення в проєкті:**
Будь-який об'єкт, намальований на полотні (rectangle, ellipse, arrow, text тощо). Є базовою одиницею даних — все, що бачить користувач, є елементом.

**Де використовується:**

- [packages/excalidraw/element/src/types.ts](../../packages/excalidraw/element/src/types.ts) — базовий тип `ExcalidrawGenericElement`
- [packages/excalidraw/element/](../../packages/excalidraw/element/) — вся логіка трансформацій, геометрії, рендерингу

**НЕ плутати з:**

- Загальне DOM-значення «HTML element» — тут Element — це модель даних малюнка, не DOM-вузол.

---

## ExcalidrawElement

**Визначення в проєкті:**
Union-тип, що об'єднує всі можливі типи елементів. Є «паспортом» будь-якого об'єкта на полотні: містить `id`, координати `x/y`, `width`, `height`, `angle`, прапорець `isDeleted`, `version`, `versionNonce`.

```typescript
type ExcalidrawElement =
  | ExcalidrawGenericElement
  | ExcalidrawTextElement
  | ExcalidrawLinearElement
  | ExcalidrawArrowElement
  | ExcalidrawFreeDrawElement
  | ExcalidrawImageElement
  | ExcalidrawFrameElement
  | ExcalidrawMagicFrameElement
  | ExcalidrawIframeElement
  | ExcalidrawEmbeddableElement;
```

**Де використовується:**

- [packages/excalidraw/element/src/types.ts](../../packages/excalidraw/element/src/types.ts) — визначення (рядок ~206)
- Скрізь у `actions/`, `components/`, `scene/` як основний тип даних

**НЕ плутати з:**

- `Element` (загальний термін) — `ExcalidrawElement` є конкретним TypeScript-типом із суворою структурою.
- HTML `Element` — не має жодного відношення до DOM.

**Підтипи:**

| Тип | Призначення |
|-----|------------|
| `ExcalidrawRectangleElement` | Прямокутник |
| `ExcalidrawDiamondElement` | Ромб |
| `ExcalidrawEllipseElement` | Еліпс / коло |
| `ExcalidrawTextElement` | Текстовий блок |
| `ExcalidrawLinearElement` | Базовий для ліній (points[]) |
| `ExcalidrawArrowElement` | Стрілка з binding |
| `ExcalidrawLineElement` | Ламана лінія |
| `ExcalidrawFreeDrawElement` | Довільне малювання (з тиском) |
| `ExcalidrawImageElement` | Вбудоване зображення |
| `ExcalidrawFrameElement` | Фрейм-контейнер |
| `ExcalidrawMagicFrameElement` | AI-генерований фрейм |
| `ExcalidrawIframeElement` | Вбудований iframe |
| `ExcalidrawEmbeddableElement` | Вбудований зовнішній контент |

---

## NonDeletedExcalidrawElement

**Визначення в проєкті:**
Type guard — підтип `ExcalidrawElement`, де `isDeleted: false`. Використовується скрізь, де потрібні лише активні (видимі) елементи.

**Де використовується:**

- [packages/excalidraw/element/src/types.ts](../../packages/excalidraw/element/src/types.ts) — рядок ~233
- Функції рендерингу, вибірки, копіювання

**НЕ плутати з:**

- `ExcalidrawElement` (включає видалені) — при роботі з полотном завжди перевіряйте, який тип очікується.

---

## Scene

**Визначення в проєкті:**
Клас-менеджер усіх елементів на полотні. Є «джерелом правди» для стану малюнка: зберігає елементи в різних Map-уявленнях, надає підписки на зміни, кешує впорядковані списки.

**Де використовується:**

- [packages/excalidraw/element/src/Scene.ts](../../packages/excalidraw/element/src/Scene.ts) — реалізація
- Передається в усі функції рендерингу та дії через `App` component

**НЕ плутати з:**

- `SceneData` — це payload для завантаження/імпорту даних у Scene (bundle `elements + appState + files`).
- Театральне «сцена» — тут це технічний контейнер стану, не UI-концепція.

**Ключові Map-уявлення всередині Scene:**

| Тип | Що містить |
|-----|-----------|
| `ElementsMap` | Усі елементи (включно з `isDeleted: true`) |
| `NonDeletedElementsMap` | Тільки активні елементи |
| `SceneElementsMap` | Усі елементи + `FractionalIndex` (для порядку) |
| `NonDeletedSceneElementsMap` | Активні + впорядковані |

---

## SceneData

**Визначення в проєкті:**
DTO (Data Transfer Object) для завантаження стану в Scene. Об'єднує `elements`, `appState`, `collaborators` і `captureUpdate` в один bundle.

**Де використовується:**

- [packages/excalidraw/types.ts](../../packages/excalidraw/types.ts) — рядок ~702
- Використовується в `updateScene()` API та при імпорті файлів

**НЕ плутати з:**

- `Scene` — клас, що приймає `SceneData` і керує станом.
- `ExportedDataState` — формат для запису у файл/базу даних.

---

## AppState

**Визначення в проєкті:**
Центральний об'єкт стану всього застосунку. Містить поточний інструмент, вибрані елементи, налаштування зовнішнього вигляду, viewport, стан UI-панелей, дані колаборації. Все що не є елементом малюнка — це AppState.

**Де використовується:**

- [packages/excalidraw/types.ts](../../packages/excalidraw/types.ts) — визначення (рядок ~272)
- [packages/excalidraw/appState.ts](../../packages/excalidraw/appState.ts) — defaults + конфігурація persistence
- Передається в усі Actions, компоненти, функції рендерингу

**НЕ плутати з:**

- `SceneData.appState` — це часткове (Partial) уявлення для імпорту, не повний AppState.
- Redux/Zustand store — AppState зберігається у React state компонента `App`, не в зовнішньому сторі.

**Ключові секції AppState:**

| Секція | Приклади полів |
|--------|---------------|
| Активний інструмент | `activeTool`, `isBindingEnabled` |
| Вибір | `selectedElementIds`, `selectedGroupIds` |
| Поточні стилі | `currentItemStrokeColor`, `currentItemFontSize` |
| Viewport | `zoom`, `scrollX`, `scrollY`, `width`, `height` |
| UI | `openMenu`, `openDialog`, `openSidebar`, `zenModeEnabled` |
| Колаборація | `collaborators`, `userToFollow`, `followedBy` |
| Редагування | `newElement`, `editingTextElement`, `resizingElement` |

**Похідні типи:**

| Тип | Призначення |
|-----|------------|
| `StaticCanvasAppState` | Підмножина для рендерингу статичного canvas |
| `InteractiveCanvasAppState` | Підмножина для інтерактивного canvas |
| `ObservedStandaloneAppState` | Поля для серіалізації (`name`, `viewBackgroundColor`) |

---

## Tool

**Визначення в проєкті:**
Активний режим взаємодії користувача з полотном. Визначає, що відбувається при кліку/перетягуванні миші.

**Де використовується:**

- [packages/excalidraw/types.ts](../../packages/excalidraw/types.ts) — `ToolType` (рядок ~143), `ActiveTool` (рядок ~163)
- `AppState.activeTool` зберігає поточний Tool

**Значення `ToolType`:**

```typescript
"selection" | "lasso" | "rectangle" | "diamond" | "ellipse" |
"arrow" | "line" | "freedraw" | "text" | "image" | "eraser" |
"hand" | "frame" | "magicframe" | "embeddable" | "laser"
```

**`ActiveTool`** розширює `ToolType` підтримкою кастомних інструментів:

```typescript
type ActiveTool =
  | { type: ToolType; customType: null }
  | { type: "custom"; customType: string }
```

**НЕ плутати з:**

- `Action` — дія (наприклад, «copy», «undo»). Tool — це стан, Action — це подія.
- Загальне «інструмент розробника» — тут Tool — виключно контекст малювання.

---

## Action

**Визначення в проєкті:**
Атомарна операція зі зміни стану застосунку. Дія має назву, може мати UI-компонент у панелі, виконується через `perform()` і повертає `ActionResult` (нові `elements`, `appState`, `files`).

**Де використовується:**

- [packages/excalidraw/actions/types.ts](../../packages/excalidraw/actions/types.ts) — інтерфейс `Action` (рядок ~162)
- [packages/excalidraw/actions/](../../packages/excalidraw/actions/) — всі реалізації (~100+ дій)
- `ActionManager` — реєстр та диспетчер дій

**Інтерфейс:**

```typescript
interface Action {
  name: ActionName;           // наприклад "copy", "deleteSelectedElements"
  perform: ActionFn;          // (elements, appState, ...) => ActionResult
  keyTest?: (event, ...) => boolean;  // keyboard shortcut
  PanelComponent?: React.FC;  // кнопка/контрол у тулбарі
  predicate?: (...) => boolean; // умова активності
}
```

**`ActionSource`** — звідки прийшла дія: `"ui" | "keyboard" | "contextMenu" | "api" | "commandPalette"`

**НЕ плутати з:**

- `Tool` — Tool задає режим, Action виконує конкретну операцію. Tool — стан, Action — команда.
- Redux Action — тут немає Redux, `ActionResult` повертається до компонента `App` напряму.

---

## Collaboration

**Визначення в проєкті:**
Режим реального часу, де кілька користувачів одночасно редагують одне полотно. Реалізується через WebSocket (socket.io). Включає синхронізацію елементів, курсорів, вибору, відстеження присутності.

**Де використовується:**

- [packages/excalidraw/types.ts](../../packages/excalidraw/types.ts) — `Collaborator`, `CollaboratorPointer`, `SocketId`, `UserToFollow`
- `AppState.collaborators` — Map активних учасників
- `packages/excalidraw/data/reconcile.ts` — алгоритм reconciliation при конфліктах

**Ключові типи:**

| Тип | Призначення |
|-----|------------|
| `Collaborator` | Стан підключеного користувача (курсор, вибір, ім'я, колір) |
| `CollaboratorPointer` | Позиція курсора: `x`, `y`, `tool` (`"pointer"` або `"laser"`) |
| `SocketId` | Branded string — ID сокет-з'єднання |
| `UserToFollow` | `{ socketId, username }` — відстеження конкретного користувача |

**`FractionalIndex`** — рядкове впорядкування елементів, стійке до конкурентних вставок (CRDT-підхід).

**НЕ плутати з:**

- Загальна «колаборація» в сенсі спільної роботи — тут це конкретний технічний режим із WebSocket, reconciliation та live-курсорами.

---

## Library

**Визначення в проєкті:**
Колекція збережених груп елементів (stencils), які користувач може повторно вставляти на полотно. Кожен `LibraryItem` — набір елементів зі статусом публікації.

**Де використовується:**

- [packages/excalidraw/types.ts](../../packages/excalidraw/types.ts) — `LibraryItem`, `LibraryItems` (рядок ~522)
- [packages/excalidraw/data/library.ts](../../packages/excalidraw/data/library.ts) — `LibraryPersistenceAdapter`, `LibraryMigrationAdapter`
- [packages/excalidraw/components/LibraryMenu.tsx](../../packages/excalidraw/components/LibraryMenu.tsx) — UI бібліотеки

**Структура `LibraryItem`:**

```typescript
{
  id: string;
  status: "unpublished" | "published";
  name: string;
  elements: readonly NonDeletedExcalidrawElement[];
}
```

**`LibraryPersistenceAdapter`** — інтерфейс для зберігання бібліотеки в різних сховищах (localStorage, IDB, сервер).

**НЕ плутати з:**

- npm «бібліотека» — `Library` тут — це набір пресетів для малювання, не пакет коду.
- `ExportedLibraryData` — формат файлу `.excalidrawlib` для експорту/імпорту бібліотеки.

---

## BinaryFiles / FileId

**Визначення в проєкті:**
Система зберігання бінарних файлів (зображень) окремо від елементів. `ImageElement` містить лише `FileId`-посилання; самі дані зберігаються в `BinaryFiles`.

**Де використовується:**

- [packages/excalidraw/types.ts](../../packages/excalidraw/types.ts) — `BinaryFileData`, `BinaryFiles`, `FileId`
- [packages/excalidraw/element/src/types.ts](../../packages/excalidraw/element/src/types.ts) — `ExcalidrawImageElement.fileId`

**НЕ плутати з:**

- `FileId` елемента — це посилання, не самі дані. Дані знаходяться у `BinaryFiles[fileId]`.

---

## SnapLine

**Визначення в проєкті:**
Візуальна напрямна лінія, що з'являється при перетягуванні елементів для вирівнювання. Буває трьох видів: `PointSnapLine`, `GapSnapLine`, `PointerSnapLine`.

**Де використовується:**

- [packages/excalidraw/snapping.ts](../../packages/excalidraw/snapping.ts) — логіка та типи
- `AppState.snapLines` — масив активних snap-ліній для рендерингу

**НЕ плутати з:**

- CSS `snap` — тут це математичний розрахунок позицій на canvas, не CSS-властивість.

---

## FractionalIndex

**Визначення в проєкті:**
Branded string для задання порядку елементів у сцені. Дозволяє вставляти елементи між іншими без переіндексації — стійко до конкурентних операцій у колаборації.

**Де використовується:**

- [packages/excalidraw/element/src/types.ts](../../packages/excalidraw/element/src/types.ts) — тип `FractionalIndex`
- `SceneElementsMap` — всі елементи мають поле `index: FractionalIndex`
- [packages/excalidraw/data/reconcile.ts](../../packages/excalidraw/data/reconcile.ts) — reconciliation

**НЕ плутати з:**

- Числовий індекс масиву — `FractionalIndex` є рядком, що лексикографічно порівнюється. Порядок у масиві і FractionalIndex — різні речі.

---

## ExportedDataState / ImportedDataState

**Визначення в проєкті:**
Схеми для серіалізації малюнку у файл або базу даних.

- `ExportedDataState` — строга схема для запису: `type`, `version`, `source`, `elements`, `appState`, `files`.
- `ImportedDataState` — м'яка схема для читання: всі поля опціональні (для сумісності зі старими форматами).

**Де використовується:**

- [packages/excalidraw/data/types.ts](../../packages/excalidraw/data/types.ts)
- [packages/excalidraw/data/json.ts](../../packages/excalidraw/data/json.ts) — функції `serializeAsJSON`, `loadFromJSON`

**НЕ плутати з:**

- `SceneData` — runtime-payload для `updateScene()`, не файловий формат.

---

## ActionResult

**Визначення в проєкті:**
Об'єкт, що повертає `Action.perform()`. Описує зміни стану, які треба застосувати: нові `elements`, `appState`, `files`. Якщо дія нічого не змінює — `false`.

**Де використовується:**

- [packages/excalidraw/actions/types.ts](../../packages/excalidraw/actions/types.ts) — рядок ~25
- `ActionManager` читає результат і застосовує зміни через `setState`

**НЕ плутати з:**

- Redux action/reducer — тут немає єдиного store, ActionResult повертається безпосередньо в компонент `App`.
