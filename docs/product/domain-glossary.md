# Domain Glossary — Excalidraw

Словник термінів у тому вигляді, в якому вони вживаються в кодовій базі.
Всі визначення верифіковані з source code.

---

## ExcalidrawElement

**Визначення в проєкті:**
Базова одиниця даних — будь-який об'єкт, намальований на полотні.
Є JSON-серіалізованим immutable-записом без обчислених даних.

```typescript
// packages/element/src/types.ts:40
type _ExcalidrawElementBase = Readonly<{
  id: string;
  x: number; y: number;
  width: number; height: number;
  angle: Radians;
  strokeColor: string; backgroundColor: string;
  fillStyle: FillStyle; strokeWidth: number;
  opacity: number; roughness: number;
  version: number;       // збільшується при кожній зміні
  versionNonce: number;  // random, для reconciliation при колаборації
  index: FractionalIndex | null; // z-order у multipayer
  isDeleted: boolean;    // soft-delete
  groupIds: readonly GroupId[];
  frameId: string | null;
  boundElements: readonly BoundElement[] | null;
  locked: boolean;
  customData?: Record<string, any>;
}>;
```

**Повна ієрархія типів:**
```
ExcalidrawElement (union)
├── ExcalidrawRectangleElement  (type: "rectangle")
├── ExcalidrawDiamondElement    (type: "diamond")
├── ExcalidrawEllipseElement    (type: "ellipse")
├── ExcalidrawTextElement       (type: "text")
├── ExcalidrawImageElement      (type: "image")
├── ExcalidrawLinearElement
│   ├── ExcalidrawLineElement   (type: "line")
│   ├── ExcalidrawArrowElement  (type: "arrow")
│   └── ExcalidrawElbowArrowElement
├── ExcalidrawFreeDrawElement   (type: "freedraw")
├── ExcalidrawFrameElement      (type: "frame")
├── ExcalidrawMagicFrameElement (type: "magicframe")
├── ExcalidrawEmbeddableElement (type: "embeddable")
└── ExcalidrawSelectionElement  (type: "selection") — не persisted
```

**Де використовується:**
- `packages/element/src/types.ts` — визначення
- `packages/element/src/mutateElement.ts` — єдиний спосіб змінити
- `packages/excalidraw/renderer/staticScene.ts` — рендер
- Всюди як основна одиниця даних

**НЕ плутати з:**
- DOM-елементом чи React-елементом — `ExcalidrawElement` не є вузлом дерева, це plain object зі сцени
- "Фігурою" у загальному розумінні — `ExcalidrawSelectionElement` теж є елементом, але не зберігається

---

## Scene

**Визначення в проєкті:**
Контейнер для всіх елементів, що наразі завантажені в редактор.
Керує колекцією, сповіщає підписників при змінах.

```typescript
// packages/element/src/Scene.ts:108
export class Scene {
  getElementsIncludingDeleted(): readonly OrderedExcalidrawElement[]
  getNonDeletedElements(): NonDeletedExcalidrawElement[]
  getNonDeletedElementsMap(): NonDeletedSceneElementsMap
  replaceAllElements(elements: ElementsMapOrArray): void
  addCallback(cb: SceneStateCallback): SceneStateCallbackRemover
  destroy(): void
}
```

**Де використовується:**
- `packages/element/src/Scene.ts` — реалізація
- `packages/excalidraw/components/App.tsx` — утримує єдиний інстанс на редактор
- `packages/excalidraw/scene/Renderer.ts` — читає через `scene.getNonDeletedElements()`

**НЕ плутати з:**
- "Сценою" у 3D-рушіях (Three.js scene) — тут це плоска колекція 2D-елементів без ієрархії
- Viewport/canvas — Scene зберігає дані, не відповідає за їх відображення

---

## AppState

**Визначення в проєкті:**
Весь UI-стан редактора: поточний інструмент, зум, скрол, стилі, стан панелей.
Зберігається як React state в `App.tsx`. Не містить елементи сцени.

```typescript
// packages/excalidraw/types.ts:272
export interface AppState {
  activeTool: { type: ActiveTool; locked: boolean; lastActiveTool: ActiveTool | null; ... };
  zoom: { value: NormalizedZoomValue };
  scrollX: number;
  scrollY: number;
  selectedElementIds: Readonly<{ [id: string]: true }>;
  editingTextElement: ExcalidrawTextElement | null;
  newElement: NonDeleted<ExcalidrawNonSelectionElement> | null;
  collaborators: Map<SocketId, Collaborator>;
  theme: "light" | "dark";
  viewModeEnabled: boolean;
  zenModeEnabled: boolean;
  gridModeEnabled: boolean;
  currentItemStrokeColor: string;
  currentItemFillStyle: FillStyle;
  // ... ~60 полів
}
```

Конфіг збереження (`appState.ts` → `APP_STATE_STORAGE_CONF`):
- `browser` — зберігати в localStorage між сесіями
- `export` — включати при серіалізації/export
- `server` — синхронізувати між колабораторами

**Де використовується:**
- `packages/excalidraw/appState.ts` — `getDefaultAppState()`
- `packages/excalidraw/components/App.tsx` — `this.state`
- `packages/excalidraw/actions/types.ts` — передається в кожну дію

**НЕ плутати з:**
- State management бібліотекою (Redux/Jotai) — AppState це звичайний React state (`this.setState`)
- Станом елементів — елементи живуть в `Scene`, не в `AppState`

---

## Tool

**Визначення в проєкті:**
Активний режим взаємодії користувача з полотном. Визначає, що відбудеться при pointer-подіях.

```typescript
// packages/common/src/constants.ts:447
export const TOOL_TYPE = {
  selection: "selection",   // вибір / переміщення елементів
  lasso: "lasso",           // вільне лассо-виділення
  rectangle: "rectangle",
  diamond: "diamond",
  ellipse: "ellipse",
  arrow: "arrow",
  line: "line",
  freedraw: "freedraw",     // вільне малювання пером
  text: "text",
  image: "image",
  eraser: "eraser",
  hand: "hand",             // pan (пересування полотна)
  frame: "frame",
  magicframe: "magicframe", // AI-frame
  embeddable: "embeddable", // вставка iframe
  laser: "laser",           // laser pointer (для презентацій)
} as const;
```

Зберігається в `AppState.activeTool`:
```typescript
activeTool: {
  type: ActiveTool;
  locked: boolean;         // не повертатись до selection після створення
  lastActiveTool: ActiveTool | null; // для eraser/hand revert
  fromSelection: boolean;  // тимчасовий перехід з selection
}
```

**Де використовується:**
- `packages/common/src/constants.ts` — константи `TOOL_TYPE`
- `packages/excalidraw/types.ts` — `AppState.activeTool`
- `packages/excalidraw/components/App.tsx` — обробка pointer events залежно від `activeTool`

**НЕ плутати з:**
- `Action` — Tool це режим введення; Action це дискретна команда (delete, duplicate тощо)

---

## Action

**Визначення в проєкті:**
Дискретна команда, що трансформує `elements` і/або `appState` і повертає новий стан.
Реєструється в `ActionManager`, може бути викликана з UI, клавіатури, API або контекстного меню.

```typescript
// packages/excalidraw/actions/types.ts:162
export interface Action<TData = any> {
  name: ActionName;
  label: string | ((elements, appState, app) => string);
  keywords?: string[];
  perform: (elements, appState, formData, app) => ActionResult | Promise<ActionResult>;
  keyTest?: (event, appState, elements, app) => boolean;
  predicate?: (elements, appState, appProps, app) => boolean;
  PanelComponent?: React.FC<PanelComponentProps>;
  trackEvent: false | { category: "toolbar" | "element" | "canvas" | ... };
}

type ActionResult = {
  elements?: readonly ExcalidrawElement[] | null;
  appState?: Partial<AppState> | null;
  captureUpdate: CaptureUpdateActionType; // чи писати в history
} | false;

type ActionSource = "ui" | "keyboard" | "contextMenu" | "api" | "commandPalette";
```

36 зареєстрованих `ActionName`: `copy`, `cut`, `paste`, `deleteSelectedElements`,
`duplicateSelection`, `group`, `ungroup`, `undo`, `redo`, `flipHorizontal`, ...

**Де використовується:**
- `packages/excalidraw/actions/types.ts` — інтерфейс
- `packages/excalidraw/actions/manager.tsx` — `ActionManager` (register, execute, render)
- `packages/excalidraw/actions/` — 36 файлів реалізацій

**НЕ плутати з:**
- `Tool` — Action це "зробити щось зараз"; Tool це "перейти в режим малювання"
- Redux action — тут немає диспетчеризації, `ActionManager.executeAction()` синхронно оновлює стан

---

## Collaboration

**Визначення в проєкті:**
Режим спільного редагування в реальному часі між кількома користувачами.
Кожен учасник представлений об'єктом `Collaborator`.

```typescript
// packages/excalidraw/types.ts:70
export type Collaborator = Readonly<{
  pointer?: CollaboratorPointer;       // позиція курсора на сцені
  button?: "up" | "down";
  selectedElementIds?: AppState["selectedElementIds"];
  username?: string | null;
  userState?: UserIdleState;           // "active" | "away" | "idle"
  color?: { background: string; stroke: string };
  avatarUrl?: string;
  id?: string;
  socketId?: SocketId;
  isCurrentUser?: boolean;
  isInCall?: boolean; isSpeaking?: boolean; isMuted?: boolean;
}>;

// AppState.collaborators — Map SocketId → Collaborator
collaborators: Map<SocketId, Collaborator>;
```

Транспорт: `socket.io-client@4.7.2` + `firebase@11.3.1` (`excalidraw-app/`)

**Де використовується:**
- `packages/excalidraw/types.ts` — тип `Collaborator`
- `packages/excalidraw/renderer/interactiveScene.ts` — рендер курсорів на окремому canvas
- `excalidraw-app/src/` — Socket.io і Firebase логіка
- `packages/excalidraw/components/App.tsx` — `isCollaborating` prop

**НЕ плутати з:**
- "Багатокористувацьким режимом" загально — у Excalidraw Collaboration строго означає real-time sync через Socket.io; view-only sharing не є Collaboration

---

## Library

**Визначення в проєкті:**
Колекція збережених наборів елементів (трафаретів), які користувач може повторно вставляти на сцену.
Кожен елемент колекції — `LibraryItem`.

```typescript
// packages/excalidraw/types.ts:522
export type LibraryItem = {
  id: string;
  status: "published" | "unpublished";
  elements: readonly NonDeleted<ExcalidrawElement>[];
  created: number;  // epoch ms
  name?: string;
};
export type LibraryItems = readonly LibraryItem[];
```

Версії:
- `LibraryItem_v1` (`LibraryItem_v1 = readonly ExcalidrawElement[]`) — legacy, deprecated
- `LibraryItem` (v2) — поточна, з `id`, `status`, `created`

**Де використовується:**
- `packages/excalidraw/types.ts` — типи
- `packages/excalidraw/data/library.ts` — клас `Library` (завантаження, збереження в IndexedDB)
- `packages/excalidraw/components/LibraryMenu*` — UI бічної панелі
- `ExcalidrawProps.onLibraryChange` — колбек для host-застосунків

**НЕ плутати з:**
- npm-бібліотекою `@excalidraw/excalidraw` — Library це функціональність всередині редактора (збережені трафарети), не пакет

---

## Frame

**Визначення в проєкті:**
Іменований прямокутний контейнер, що групує елементи логічно та візуально.
Елементи всередині Frame обрізаються по його межах (`clip: true`).

```typescript
// packages/element/src/types.ts:163
export type ExcalidrawFrameElement = _ExcalidrawElementBase & {
  type: "frame";
  name: string | null;
};
export type ExcalidrawMagicFrameElement = _ExcalidrawElementBase & {
  type: "magicframe";  // AI-генерований вміст
  name: string | null;
};
export type ExcalidrawFrameLikeElement =
  | ExcalidrawFrameElement
  | ExcalidrawMagicFrameElement;
```

Прив'язка елемента до Frame: `ExcalidrawElement.frameId: string | null`

Конфіг рендеру (`AppState.frameRendering`):
```typescript
frameRendering: {
  enabled: boolean;
  name: boolean;    // показувати назву
  outline: boolean; // показувати межу
  clip: boolean;    // обрізати вміст
}
```

**Де використовується:**
- `packages/element/src/types.ts` — типи
- `packages/element/src/frameElement.ts` — логіка (getElementsInFrame, elementOverlapsWithFrame)
- `packages/excalidraw/renderer/staticScene.ts` — clip region при рендері

**НЕ плутати з:**
- HTML `<iframe>` — Frame це елемент сцени-контейнер; `ExcalidrawEmbeddableElement` це той, що вставляє iframe
- Group — Group не має візуальної межі і не обрізає; Frame має і те, і те

---

## Store / StoreDelta

**Визначення в проєкті:**
`Store` — спостерігач за змінами елементів; фіксує snapshots і генерує дельти для history/collaboration.
`StoreDelta` — diff між двома snapshots (не повний snapshot).

```typescript
// packages/element/src/store.ts:78
export class Store {
  captureIncrement(elements, appState): void  // зберегти в history
  captureAllIncrement(): void                 // force capture (напр. undo)
  commit(elements, appState): void            // зафіксувати без history
  clear(): void
}

// packages/element/src/store.ts:497
export class StoreDelta {
  static calculate(prevSnapshot, nextSnapshot): StoreDelta
  applyTo(elements, appState, snapshot): [elements, appState, changed]
}
```

**Де використовується:**
- `packages/element/src/store.ts` — реалізація
- `packages/excalidraw/history.ts` — `HistoryDelta extends StoreDelta`
- `packages/excalidraw/components/App.tsx` — викликає `store.captureIncrement()`

**НЕ плутати з:**
- Redux Store — `Store` тут відповідає лише за history snapshots, не за весь стан застосунку

---

## BinaryFiles

**Визначення в проєкті:**
Словник бінарних файлів (зображень), що використовуються `ExcalidrawImageElement`.
Зберігається окремо від елементів — елемент містить лише `FileId`, дані — у `BinaryFiles`.

```typescript
// packages/excalidraw/types.ts:113
export type BinaryFileData = {
  mimeType: ValueOf<typeof IMAGE_MIME_TYPES> | typeof MIME_TYPES.binary;
  id: FileId;       // = string (branded type)
  dataURL: DataURL; // base64 або blob URL
  created: number;  // epoch ms
  lastRetrieved?: number;
};
export type BinaryFiles = Record<ExcalidrawElement["id"], BinaryFileData>;
```

**Де використовується:**
- `packages/excalidraw/types.ts` — типи
- `packages/excalidraw/components/App.tsx` — `this.files`
- `packages/utils/src/export.ts` — передається в `exportToCanvas`, `exportToSvg`
- `ActionResult.files` — action може повертати нові файли

**НЕ плутати з:**
- `ExcalidrawElement` — `BinaryFileData` це окремий registry, не частина елемента; елемент зберігає лише `fileId: FileId`

---

## Binding

**Визначення в проєкті:**
Прив'язка кінця стрілки (`ExcalidrawArrowElement`) до іншого елемента (`ExcalidrawBindableElement`).
При переміщенні target-елемента стрілка слідує за ним автоматично.

```typescript
// packages/element/src/types.ts:284
export type FixedPointBinding = {
  elementId: ExcalidrawBindableElement["id"];
  // фіксована точка прив'язки у відносних координатах [0..1, 0..1]
  fixedPoint: readonly [number, number];
};

// ExcalidrawArrowElement має:
startBinding: FixedPointBinding | null;
endBinding: FixedPointBinding | null;
```

`ExcalidrawBindableElement` — union тип елементів, що можуть приймати стрілки:
rectangle, diamond, ellipse, text, image, frame, embeddable.

**Де використовується:**
- `packages/element/src/types.ts` — `FixedPointBinding`
- `packages/element/src/binding.ts` (~84KB) — вся логіка прив'язки
- `AppState.isBindingEnabled`, `AppState.bindingPreference`

**НЕ плутати з:**
- React data binding — Binding тут суто геометричний зв'язок між стрілкою і фігурою

---

## Group

**Визначення в проєкті:**
Логічне об'єднання кількох елементів під спільним `GroupId`.
Не є окремим об'єктом — реалізовано через поле `groupIds` на кожному елементі.

```typescript
// packages/element/src/types.ts:24
export type GroupId = string;

// в _ExcalidrawElementBase:
groupIds: readonly GroupId[];  // від найглибшого до найвищого рівня (nested groups)
```

**Де використовується:**
- `packages/element/src/types.ts` — `GroupId`
- `packages/element/src/groups.ts` — `getElementsInGroup`, `selectGroupsForSelectedElements`
- `packages/excalidraw/actions/actionGroup.tsx` — `actionGroup` / `actionUngroup`
- `AppState.editingGroupId` — id групи в режимі редагування

**НЕ плутати з:**
- `Frame` — Group не має візуальної межі та не обрізає вміст; Frame є окремим елементом сцени

---

*Джерела: `packages/element/src/types.ts`, `packages/excalidraw/types.ts`,
`packages/common/src/constants.ts`, `packages/excalidraw/actions/types.ts`,
`packages/element/src/store.ts`, `packages/element/src/Scene.ts`*
