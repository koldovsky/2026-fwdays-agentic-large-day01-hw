# Domain Glossary

Словник термінів проєкту Excalidraw. Всі визначення базуються виключно на source code.

> **Умовні позначення:**
> - **Визначення** — що означає термін у межах цього проєкту
> - **Де використовується** — ключові файли
> - **Не плутати з** — загальновживане значення vs проєктне

---

## Action

**Визначення.** Команда, яку можна виконати в редакторі (копіювати, змінити колір, скасувати тощо). Кожна `Action` реалізує інтерфейс з полями `name`, `perform`, необов'язковим `PanelComponent` та `keyTest`. Метод `perform` отримує поточні елементи та `AppState`, повертає `ActionResult`.

```typescript
// packages/excalidraw/actions/types.ts (line 162)
export interface Action<TData = any> {
  name: ActionName;
  perform: ActionFn<TData>;
  label: string | ((elements, appState, app) => string);
  keyTest?: (event, appState, elements, app) => boolean;
  PanelComponent?: React.FC<PanelComponentProps>;
  predicate?: (elements, appState, appProps, app) => boolean;
  checked?: (appState) => boolean;
  trackEvent: false | { category: ...; action?: string; ... };
  viewMode?: boolean;
}
```

**ActionSource** — звідки прийшов виклик: `"ui" | "keyboard" | "contextMenu" | "api" | "commandPalette"`.

**Де використовується:**
- `packages/excalidraw/actions/types.ts` — інтерфейс `Action`, тип `ActionResult`, `ActionName`, `ActionSource`
- `packages/excalidraw/actions/index.ts` — реєстрація всіх ~80 дій
- `packages/excalidraw/actions/manager.tsx` — клас `ActionManager`
- `packages/excalidraw/components/App.tsx` — `this.actionManager.registerAll(actions)` (рядок 843)

**Не плутати з:** Redux-action (об'єкт з `type` і `payload`). Тут `Action` — самодостатній об'єкт-команда з логікою виконання, рендером панелі та перевіркою клавіш всередині одного інтерфейсу.

---

## ActionManager

**Визначення.** Реєстр і диспетчер усіх `Action`. Зберігає словник `actions: Record<ActionName, Action>`. Метод `executeAction(action, source, value)` викликає `action.perform`, відстежує аналітику і передає `ActionResult` в `updater` (яким є `syncActionResult` з `App`).

```typescript
// packages/excalidraw/actions/manager.tsx (line 52)
export class ActionManager {
  actions = {} as Record<ActionName, Action>;
  updater: (actionResult: ActionResult | Promise<ActionResult>) => void;
  getAppState: () => Readonly<AppState>;
  getElementsIncludingDeleted: () => readonly OrderedExcalidrawElement[];
  app: AppClassProperties;
}
```

**Де використовується:**
- `packages/excalidraw/actions/manager.tsx` — клас
- `packages/excalidraw/components/App.tsx` — `this.actionManager` як поле класу `App`

**Не плутати з:** Redux store або Flux dispatcher. `ActionManager` не містить стан — він лише маршрутизує команди.

---

## ActionResult

**Визначення.** Значення, яке повертає `action.perform`. Містить опціональні нові `elements`, `appState`, `files` та обов'язковий `captureUpdate` (що визначає, чи записується зміна в undo-стек). Значення `false` означає, що дія не виконалась.

```typescript
// packages/excalidraw/actions/types.ts (line 25)
export type ActionResult =
  | {
      elements?: readonly ExcalidrawElement[] | null;
      appState?: Partial<AppState> | null;
      files?: BinaryFiles | null;
      captureUpdate: CaptureUpdateActionType;
      replaceFiles?: boolean;
    }
  | false;
```

**Де використовується:**
- `packages/excalidraw/actions/types.ts` — тип
- `packages/excalidraw/components/App.tsx` — `syncActionResult` застосовує результат до `Scene` і `this.state`

**Не плутати з:** відповіддю сервера або HTTP-результатом. Це суто клієнтський об'єкт описування змін стану редактора.

---

## AppState

**Визначення.** Великий `interface` (рядки 272–472 у `packages/excalidraw/types.ts`), який описує весь стан UI-редактора: поточний інструмент, позицію viewport, виділені елементи, налаштування стилів, відкриті діалоги, колаборатори тощо. Зберігається у React state класу `App` (`this.state`).

Основні категорії полів:
- **Viewport:** `scrollX`, `scrollY`, `zoom: Zoom`, `width`, `height`, `offsetLeft`, `offsetTop`
- **Tool:** `activeTool: ActiveTool`, `preferredSelectionTool`
- **Editing session:** `newElement`, `selectionElement`, `resizingElement`, `editingTextElement`, `multiElement`
- **Selection:** `selectedElementIds`, `selectedGroupIds`, `editingGroupId`
- **Styles defaults:** `currentItemStrokeColor`, `currentItemBackgroundColor`, `currentItemFontSize`, та ін.
- **Collaboration:** `collaborators: Map<SocketId, Collaborator>`, `userToFollow`, `followedBy`
- **UI shell:** меню, sidebar-и, діалоги, `isLoading`, `errorMessage`, `toast`

Вужчі підтипи:
- `UIAppState` — `AppState` без `startBoundElement`, `cursorButton`, `scrollX`, `scrollY`; передається у UI-компоненти
- `StaticCanvasAppState` — містить `scrollX`/`scrollY`; передається у `renderStaticScene`
- `ObservedAppState` — підмножина для undo-delta-розрахунків у `Store`

**Де використовується:**
- `packages/excalidraw/types.ts` — визначення
- `packages/excalidraw/appState.ts` — `getDefaultAppState()` (ініціалізатор)
- `packages/excalidraw/components/App.tsx` — `this.state: AppState`

**Не плутати з:** станом бекенду або Redux store. `AppState` — це React `this.state` одного компонента, без жодного глобального store.

---

## BinaryFileData / BinaryFiles

**Визначення.** `BinaryFileData` — метадані та вміст одного файлу (зображення), що використовується елементами типу `image`. Поля: `id: FileId`, `mimeType`, `dataURL: DataURL`, `created`, `lastRetrieved?`, `version?`. `BinaryFiles` — словник `Record<ExcalidrawElement["id"], BinaryFileData>`.

```typescript
// packages/excalidraw/types.ts (line 113)
export type BinaryFileData = {
  mimeType: ValueOf<typeof IMAGE_MIME_TYPES> | typeof MIME_TYPES.binary;
  id: FileId;
  dataURL: DataURL;
  created: number;
  lastRetrieved?: number;
  version?: number;
};
export type BinaryFiles = Record<ExcalidrawElement["id"], BinaryFileData>;
```

`ExcalidrawImageElement` містить `fileId: FileId | null` — посилання на запис у `BinaryFiles`. `App` зберігає файли у `public files: BinaryFiles = {}`.

**Де використовується:**
- `packages/excalidraw/types.ts` — тип
- `packages/excalidraw/components/App.tsx` — `this.files`
- `excalidraw-app/collab/Collab.tsx` — завантаження/вивантаження файлів через `FileManager`

**Не плутати з:** File API браузера (`File`, `Blob`). `BinaryFileData` — це серіалізований dataURL, а не живий `Blob`.

---

## CaptureUpdateAction

**Визначення.** Константний об'єкт-enum у `packages/element/src/store.ts` (рядки 38–69), що керує тим, чи і коли зміна потрапить в undo-стек.

| Значення | Семантика |
|----------|-----------|
| `IMMEDIATELY` | Записується в undo-стек одразу; для більшості локальних мутацій |
| `EVENTUALLY` | Відкладається до наступного `IMMEDIATELY`; для проміжних кроків async-процесів |
| `NEVER` | Ніколи не записується; для remote-оновлень і ініціалізації сцени |

**Де використовується:**
- `packages/element/src/store.ts` — визначення та обробка у `Store.processAction`
- `packages/excalidraw/actions/types.ts` — обов'язкове поле `ActionResult.captureUpdate`
- `excalidraw-app/collab/Collab.tsx` — `captureUpdate: CaptureUpdateAction.NEVER` при застосуванні remote елементів

**Не плутати з:** Git commit або транзакцією БД. Це виключно механізм undo-семантики всередині редактора.

---

## Collaborator

**Визначення.** Тип, що описує одного учасника collaborative-сесії: його курсор, кнопку миші, виділені елементи та ім'я. Зберігається у `AppState.collaborators: Map<SocketId, Collaborator>`.

```typescript
// packages/excalidraw/types.ts (приблизно рядок 70)
// Collaborator містить: pointer, button, selectedElementIds, username, color,
// avatarUrl, userState, socketId, isCurrentUser, isInCall, isSpeaking
```

Позиція курсору — окремий тип `CollaboratorPointer` з полями `x`, `y`, `tool`, `timeStamp`. Remote оновлення курсорів приходять через `WS_SUBTYPES.MOUSE_LOCATION` і зберігаються в `collaborators` без запису в undo-стек.

**Де використовується:**
- `packages/excalidraw/types.ts` — тип
- `excalidraw-app/collab/Collab.tsx` — оновлення через `updateCollaborator(socketId, {...})`
- `packages/excalidraw/renderer/interactiveScene.ts` — відмальовка remote-курсорів і імен

**Не плутати з:** поняттям «користувач» у системі авторизації. `Collaborator` — ephemeral-запис активного сеансу без прив'язки до облікового запису.

---

## ExcalidrawElement

**Визначення.** Union-тип усіх можливих елементів сцени. Базові поля визначені у `_ExcalidrawElementBase`, кожен підтип додає специфічні поля і дискримінант `type`.

```typescript
// packages/element/src/types.ts (line 206)
export type ExcalidrawElement =
  | ExcalidrawGenericElement      // rectangle, diamond, ellipse
  | ExcalidrawTextElement         // text
  | ExcalidrawLinearElement       // line
  | ExcalidrawArrowElement        // arrow
  | ExcalidrawFreeDrawElement     // freedraw
  | ExcalidrawImageElement        // image
  | ExcalidrawFrameElement        // frame
  | ExcalidrawMagicFrameElement   // magicframe
  | ExcalidrawIframeElement       // iframe
  | ExcalidrawEmbeddableElement;  // embeddable
```

Ключові базові поля: `id`, `x`, `y`, `width`, `height`, `angle: Radians`, `strokeColor`, `fillStyle`, `opacity`, `version`, `versionNonce`, `index: FractionalIndex | null`, `isDeleted`, `groupIds`, `frameId`, `boundElements`, `locked`, `customData?`.

Варіанти типу:
- `OrderedExcalidrawElement` — `index` гарантовано non-null (`FractionalIndex`); використовується всередині `Scene`
- `NonDeletedExcalidrawElement` — runtime-фільтр, де `isDeleted = false`

**Де використовується:**
- `packages/element/src/types.ts` — всі визначення
- `packages/element/src/Scene.ts` — `elements: readonly OrderedExcalidrawElement[]`
- Всі action-и, рендерери, колаб-логіка

**Не плутати з:** HTML-елементом DOM або React-елементом. `ExcalidrawElement` — це серіалізований Plain Object, що описує фігуру на canvas.

---

## Frame / ExcalidrawFrameElement

**Визначення.** Елемент типу `"frame"` або `"magicframe"` — прямокутна область, що групує та обрізає дочірні елементи. Дочірні елементи посилаються на фрейм через поле `frameId: string | null` у базовому типі. `MagicFrame` — варіант фрейму з AI-генерацією коду.

```typescript
// packages/element/src/types.ts (line 163)
export type ExcalidrawFrameElement = _ExcalidrawElementBase & {
  type: "frame";
  name: string | null;
};
export type ExcalidrawFrameLikeElement =
  | ExcalidrawFrameElement
  | ExcalidrawMagicFrameElement;
```

`Scene` підтримує окрему колекцію `frames: readonly ExcalidrawFrameLikeElement[]` і `nonDeletedFramesLikes` для швидкого доступу.

**Де використовується:**
- `packages/element/src/types.ts` — тип
- `packages/element/src/Scene.ts` — `this.frames`, `this.nonDeletedFramesLikes`
- `packages/excalidraw/renderer/staticScene.ts` — frame clipping при відмальовці

**Не плутати з:** CSS `frame`, HTML `<frame>` або `<iframe>`. Це виключно концепція групування елементів на canvas з ефектом clip-mask.

---

## History

**Визначення.** Клас у `packages/excalidraw/history.ts`, що реалізує undo/redo на основі `StoreDelta`-записів. Підписується на `Store.onDurableIncrementEmitter` і накопичує стеки `undoStack` / `redoStack`. `HistoryDelta` розширює `StoreDelta` і при `applyTo` виключає поля `version`/`versionNonce` з дельт елементів.

```typescript
// packages/excalidraw/history.ts
class History {
  undoStack: HistoryDelta[];
  redoStack: HistoryDelta[];
  onHistoryChangedEmitter: Emitter<...>;
  record(elementsChange, appStateChange): void;
  undo(elements, appState, files): HistoryReplayResult | void;
  redo(elements, appState, files): HistoryReplayResult | void;
  clear(): void;
}
```

Ініціалізується як `this.history = new History(this.store)` у конструкторі `App` (рядок 833). Дії `undo` і `redo` реєструються через `createUndoAction(this.history)` / `createRedoAction(this.history)` (рядок 844–845).

**Де використовується:**
- `packages/excalidraw/history.ts` — клас
- `packages/excalidraw/components/App.tsx` — `this.history`
- `packages/excalidraw/actions/actionHistory.ts` — визначення дій undo/redo

**Не плутати з:** `git history` або логом подій. Це суто клієнтський in-memory undo-стек, що не персистується між сесіями.

---

## Library / LibraryItem

**Визначення.** `LibraryItem` — колекція `NonDeleted<ExcalidrawElement>[]`, збережена під одним `id`, з полями `status: "published" | "unpublished"`, `name?`, `created`. `LibraryItems = readonly LibraryItem[]`. Клас `Library` управляє двома знімками: `currLibraryItems` (актуальний) і `prevLibraryItems` (для визначення дельт при `onLibraryChange`).

```typescript
// packages/excalidraw/types.ts (line 521)
export type LibraryItem = {
  id: string;
  status: "published" | "unpublished";
  elements: readonly NonDeleted<ExcalidrawElement>[];
  created: number;
  name?: string;
  error?: string;
};
```

Публічний API класу: `getLatestLibrary()`, `updateLibrary(items)`, `setLibrary(items)`, `resetLibrary()`.

**Де використовується:**
- `packages/excalidraw/types.ts` — тип `LibraryItem`
- `packages/excalidraw/data/library.ts` — клас `Library`
- `packages/excalidraw/components/App.tsx` — `this.library = new Library(this)`

**Не плутати з:** npm-бібліотекою або зовнішньою залежністю. `Library` — це вбудований каталог багаторазових фігур/стікерів, що відображається у бічній панелі редактора.

---

## Renderer

**Визначення.** Клас у `packages/excalidraw/scene/Renderer.ts`, що надає мемоїзований метод `getRenderableElements(params)`. Приймає параметри viewport (`zoom`, `scrollX`, `scrollY`, `width`, `height`) та `sceneNonce` як cache-buster. Повертає `{ elementsMap, visibleElements }` — лише ті елементи, що потрапляють у поточний viewport, без елемента в режимі редагування тексту.

```typescript
// packages/excalidraw/scene/Renderer.ts (line 98)
// memoize({ zoom, offsetLeft, offsetTop, scrollX, scrollY,
//           height, width, editingTextElement, newElementId, sceneNonce })
// => { elementsMap, visibleElements }
```

Throttling рендерингу статичного canvas реалізований через `throttleRAF` з `@excalidraw/common`.

**Де використовується:**
- `packages/excalidraw/scene/Renderer.ts` — клас
- `packages/excalidraw/components/App.tsx` — `this.renderer = new Renderer(this.scene)`

**Не плутати з:** React-рендером або серверним SSR. `Renderer` — це виключно «що малювати» (viewport culling + memoization), не «як малювати».

---

## Scene

**Визначення.** Клас у `packages/element/src/Scene.ts` — авторитетне сховище всіх елементів редактора. Підтримує кілька синхронізованих структур даних: масив `elements: readonly OrderedExcalidrawElement[]`, `elementsMap: SceneElementsMap` (Map по `id`), окремо `nonDeletedElements`, `nonDeletedElementsMap`, `frames`, `nonDeletedFramesLikes`, кеш виділених елементів.

Ключові методи:
- `replaceAllElements(nextElements)` — повна заміна, синхронізує всі внутрішні колекції, викликає `triggerUpdate()`
- `triggerUpdate()` — оновлює `sceneNonce` і викликає всі зареєстровані callbacks
- `getElementsIncludingDeleted()` — повертає `elements` разом з `isDeleted: true`
- `getNonDeletedElements()` — лише активні елементи
- `getElement(id)`, `getSelectedElements(selectedIds, appState)` — точковий доступ

**Де використовується:**
- `packages/element/src/Scene.ts` — клас
- `packages/excalidraw/components/App.tsx` — `this.scene = new Scene()` (рядок 825)
- `packages/excalidraw/scene/Renderer.ts` — `sceneNonce` як cache-buster

**Не плутати з:** театральною сценою або «scene» у game engines (де сцена — це повний граф об'єктів зі своїм update-loop). Тут `Scene` — суто контейнер елементів без власного update-loop.

---

## Store

**Визначення.** Клас у `packages/element/src/store.ts`, що спостерігає за змінами `AppState` і елементів, обчислює дельти (`StoreDelta`) і емітує їх у `History`. Не є Redux store — не зберігає поточний стан, лише реагує на зміни і накопичує дельти для undo/redo.

Два публічних емітери:
- `onDurableIncrementEmitter: Emitter<[DurableIncrement]>` — для `History` (undo-стек)
- `onStoreIncrementEmitter: Emitter<[DurableIncrement | EphemeralIncrement]>` — публічний API (`ExcalidrawImperativeAPI.onIncrement`)

Метод `scheduleAction(captureUpdate)` визначає, чи стане поточна зміна `DurableIncrement` (записується) або `EphemeralIncrement` (пропускається).

**Де використовується:**
- `packages/element/src/store.ts` — клас, `CaptureUpdateAction`
- `packages/excalidraw/components/App.tsx` — `this.store = new Store(this)` (рядок 832)
- `packages/excalidraw/history.ts` — підписується на `onDurableIncrementEmitter`

**Не плутати з:** Redux store, Zustand store або будь-яким state-контейнером. `Store` у цьому проєкті — це виключно observer для побудови undo-дельт.

---

## Tool (ToolType / ActiveTool)

**Визначення.** `ToolType` — union string literal-тип усіх інструментів редактора. `ActiveTool` — поточний активний інструмент у `AppState.activeTool`, разом з метаданими `lastActiveTool`, `locked`, `fromSelection`.

```typescript
// packages/excalidraw/types.ts (line 143)
export type ToolType =
  | "selection" | "lasso" | "rectangle" | "diamond" | "ellipse"
  | "arrow" | "line" | "freedraw" | "text" | "image"
  | "eraser" | "hand" | "frame" | "magicframe" | "embeddable" | "laser";

// AppState.activeTool (line 332)
activeTool: {
  lastActiveTool: ActiveTool | null;
  locked: boolean;
  fromSelection: boolean;
} & ActiveTool;
```

`"custom"` — спеціальний тип для інструментів, доданих через зовнішній API. `fromSelection: true` означає тимчасове переключення з selection-інструменту (наприклад, shortcuts).

**Де використовується:**
- `packages/excalidraw/types.ts` — `ToolType`, `ActiveTool`
- `packages/excalidraw/components/App.tsx` — `this.setActiveTool(tool)`
- `packages/excalidraw/components/ToolIcon.tsx` — відображення toolbar

**Не плутати з:** Drawing tool у Photoshop або brush у Figma. У Excalidraw `tool` визначає лише тип **наступного** елемента, що буде створений, а не brush-стиль.

---

## ExcalidrawImperativeAPI

**Визначення.** Публічний інтерфейс для програмного управління редактором ззовні (з хост-застосунку або тестів). Створюється через `createExcalidrawAPI()` у `App.tsx` і повертається через `ref` пропс `<Excalidraw excalidrawAPI={...} />`.

Основні методи:
- `updateScene({ elements, appState, files, captureUpdate })` — застосувати зміни
- `getSceneElements()` / `getAppState()` / `getFiles()` — читання поточного стану
- `setActiveTool(tool)`, `setCursor(cursor)`, `scrollToContent()`
- `addFiles(data)`, `resetScene()`, `mutateElement(el, updates)`
- `onChange(callback)` — підписка на будь-яку зміну
- `onIncrement(callback)` — підписка на `DurableIncrement | EphemeralIncrement`
- `onPointerDown`, `onPointerUp`, `onScrollChange`, `onUserFollow`
- `history.clear()` — скинути undo-стек

**Де використовується:**
- `packages/excalidraw/types.ts` — інтерфейс `ExcalidrawImperativeAPI` (рядки 917–987)
- `packages/excalidraw/components/App.tsx` — `createExcalidrawAPI()`
- `excalidraw-app/App.tsx` — отримання через `ref`, передача в collab-модуль

**Не плутати з:** REST API або GraphQL. Це in-process JavaScript API для вбудовування редактора у власний застосунок.

---

## Zoom

**Визначення.** Branded тип `Zoom = Readonly<{ value: NormalizedZoomValue }>`, де `NormalizedZoomValue = number & { _brand: "normalizedZoom" }`. Брендування запобігає передачі довільного `number` замість нормалізованого значення. Зберігається у `AppState.zoom`.

```typescript
// packages/excalidraw/types.ts (line 491)
export type NormalizedZoomValue = number & { _brand: "normalizedZoom" };
export type Zoom = Readonly<{ value: NormalizedZoomValue }>;
```

Viewport у редакторі визначається трьома полями `AppState`: `scrollX: number`, `scrollY: number`, `zoom: Zoom`. `scrollX`/`scrollY` виключені з `UIAppState`, але присутні у `StaticCanvasAppState` та `_CommonCanvasAppState`.

**Де використовується:**
- `packages/excalidraw/types.ts` — тип
- `packages/excalidraw/scene/scroll.ts`, `scrollbars.ts` — розрахунок позицій
- `packages/excalidraw/scene/Renderer.ts` — параметр мемоїзації

**Не плутати з:** CSS `transform: scale()` або `devicePixelRatio`. `Zoom.value` — логічний коефіцієнт сцени, що застосовується через трансформацію canvas-контексту, незалежно від DPI.

---

## FractionalIndex

**Визначення.** Рядковий тип у форматі [fractional indexing](https://github.com/rocicorp/fractional-indexing), що використовується для упорядкування елементів у `z-order` при multiplayer-сценаріях (collab, undo/redo). Зберігається як `element.index: FractionalIndex | null`. `OrderedExcalidrawElement` гарантує non-null `index`.

```typescript
// packages/element/src/types.ts (base field)
index: FractionalIndex | null;
// OrderedExcalidrawElement — index завжди non-null
```

Синхронізується функціями `syncMovedIndices` та `syncInvalidIndices` при кожному `replaceAllElements`.

**Де використовується:**
- `packages/element/src/types.ts` — поле у `_ExcalidrawElementBase`
- `packages/element/src/Scene.ts` — `syncInvalidIndices(_nextElements)` у `replaceAllElements`
- `packages/element/src/store.ts` — враховується у дельтах порядку елементів

**Не плутати з:** масивним integer-індексом або позицією в DOM. `FractionalIndex` — це рядок типу `"a0"`, `"a1"`, `"a2V"`, що дозволяє вставити елемент між двома без перенумерації всього масиву.

---

## StoreDelta / ElementsDelta / Delta

**Визначення.** Ієрархія класів для представлення змін між двома станами (diff), використовувана History для undo/redo.

- `Delta<T>` (`packages/element/src/delta.ts`) — базова структура з полями `deleted` і `inserted` (партіали значень до і після)
- `ElementsDelta` — агрегат дельт елементів: `added`, `removed`, `updated: Record<id, Delta<ElementPartial>>`. Метод `applyTo(elements, appState)` повертає нові елементи. Має `inverse()` для redo→undo перетворення
- `AppStateDelta` — дельта для ObservedAppState
- `StoreDelta` (клас у `store.ts`) — `{ id, elements: ElementsDelta, appState: AppStateDelta }`. Фабричні методи `calculate(prev, next)`, `inverse()`, `applyTo()`

**Де використовується:**
- `packages/element/src/delta.ts` — `Delta`, `ElementsDelta`, `AppStateDelta`
- `packages/element/src/store.ts` — `StoreDelta`, `DurableIncrement`, `EphemeralIncrement`
- `packages/excalidraw/history.ts` — `HistoryDelta` розширює `StoreDelta`

**Не плутати з:** git diff або JSON patch (RFC 6902). Це внутрішній формат дельт, оптимізований для злиття concurrent-змін у collab-сесіях.
