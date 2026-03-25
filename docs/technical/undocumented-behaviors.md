# Undocumented Behaviors

Знахідки з аналізу коду: implicit state machines, неочевидні side effects,
залежності від порядку ініціалізації, та коментарі HACK/FIXME/TODO з пояснень.

---

## 1. Implicit State Machines

### 1.1 Ініціалізація редактора — два незалежні прапори замість стейт-машини

**Файли:** `App.tsx:662`, `App.tsx:803`, `App.tsx:3360`

Ініціалізація контролюється двома окремими булевими значеннями, які разом утворюють
неявну машину стану з трьох фаз:

```
Фаза 1: isLoading=true,  _initialized=false  ← constructor → initializeScene()
Фаза 2: isLoading=false, _initialized=false  ← дані завантажено, ще не зафіксовано
Фаза 3: isLoading=false, _initialized=true   ← редактор готовий
```

Перехід 2→3 відбувається в `componentDidUpdate`, коли обидва прапори задовольняють умову:
```ts
// App.tsx:3360
if (!this._initialized && !this.state.isLoading) {
  this._initialized = true;
  this.editorLifecycleEvents.emit("editor:initialize", this.api);
  this.props.onInitialize?.(this.api);
}
```

`isLoading` — частина React `AppState` (змінюється через `setState`).
`_initialized` — instance-поле класу (мутується напряму, без ре-рендеру).
Фаза 2 існує лише в межах одного `componentDidUpdate` і ніде не задокументована.

---

### 1.2 `updateDOMRect` як ворота перед `initializeScene`

**Файл:** `App.tsx:3130`, `App.tsx:12701`

`initializeScene` ніколи не викликається напряму — тільки через `updateDOMRect(callback)`:

```ts
// componentDidMount:
this.updateDOMRect(this.initializeScene);
```

`updateDOMRect` вимірює `getBoundingClientRect()` контейнера. Якщо розміри не змінились —
callback викликається **синхронно**. Якщо змінились — спочатку `setState`, і callback
виконується після ре-рендеру.

Тобто: якщо контейнер не змонтований у DOM або має нульові розміри в момент `componentDidMount`,
сцена може взагалі не ініціалізуватися.

---

## 2. Залежності від порядку ініціалізації

### 2.1 `ActionManager` створюється до `Scene`

**Файл:** `App.tsx:819–825`

```ts
this.actionManager = new ActionManager(   // рядок 819
  this.syncActionResult,
  () => this.state,
  () => this.scene.getElementsIncludingDeleted(),  // ← this.scene ще null!
  this,
);
this.scene = new Scene();  // рядок 825
```

`ActionManager` отримує геттер `() => this.scene.getElementsIncludingDeleted()` — ця функція
не викликається в конструкторі, тому помилки немає. Але якщо будь-який action виконається
до того, як `this.scene` присвоєно — буде `TypeError`. Порядок рядків критичний.

---

### 2.2 `History` створюється двічі

**Файл:** `App.tsx:833`, `App.tsx:841`

```ts
this.store = new Store(this);
this.history = new History(this.store);  // рядок 833

this.fonts = new Fonts(this.scene);
this.history = new History(this.store);  // рядок 841 — перезаписує попередній!
```

Перший екземпляр `History` одразу відкидається. Це, мабуть, артефакт рефакторингу —
поведінка коректна лише тому, що перший екземпляр не встигає підписатися ні на що.

---

### 2.3 Реєстрація undo/redo actions залежить від `History`

**Файл:** `App.tsx:843–845`

```ts
this.actionManager.registerAll(actions);
this.actionManager.registerAction(createUndoAction(this.history));
this.actionManager.registerAction(createRedoAction(this.history));
```

`createUndoAction` і `createRedoAction` отримують посилання на `this.history` в момент виклику.
Якщо порядок зміниться (register до створення history) — дії матимуть `undefined` як history.

---

## 3. Неочевидні Side Effects

### 3.1 `isSomeElementSelected` — глобальний мемоізований стан у модулі

**Файл:** `packages/element/src/selection.ts:138`

```ts
// FIXME move this into the editor instance to keep utility methods stateless
export const isSomeElementSelected = (function () {
  let lastElements: readonly NonDeletedExcalidrawElement[] | null = null;
  let lastSelectedElementIds: AppState["selectedElementIds"] | null = null;
  let isSelected: boolean | null = null;

  const ret = (...): boolean => { /* memoized check */ };
  ret.clearCache = () => { lastElements = null; ... };
  return ret;
})();
```

Це IIFE з мутабельним closure — **глобальний кеш на рівні модуля**. Якщо на сторінці
є кілька інстанцій `<Excalidraw>`, вони всі діляться цим кешем. Це відомий баг
(FIXME в коді), але поки не виправлений.

---

### 3.2 `store.scheduleCapture()` — неявний запис в undo-стек

**Файл:** `packages/element/src/store.ts:109`

```ts
// TODO: Suspicious that this is called so many places. Seems error-prone.
public scheduleCapture() {
  this.scheduleAction(CaptureUpdateAction.IMMEDIATELY);
}
```

Кожен виклик `scheduleCapture()` при наступному `componentDidUpdate` створює запис в undo-стеку.
Метод розкиданий по кодбейсу (~20+ місць). Випадковий виклик або подвійний виклик
призводить до зайвих або порожніх undo-кроків.

---

### 3.3 Тема в WYSIWYG-редакторі не отримує оновлень через Store

**Файл:** `packages/excalidraw/wysiwyg/textWysiwyg.tsx:964`

```ts
// FIXME after we start emitting updates from Store for appState.theme
const unsubOnChange = app.onChangeEmitter.on((elements) => {
  if (app.state.theme !== LAST_THEME) {
    updateWysiwygStyle();
  }
});
```

`Store` не емітує зміни `AppState` (тільки елементи). Тому зміна теми у WYSIWYG-редакторі
відстежується через `onChangeEmitter` — окремий канал, що тригериться при будь-якій зміні
елементів. Якщо тема зміниться без зміни елементів — стиль редактора не оновиться.

---

### 3.4 `restore()` мовчки видаляє порожні текстові елементи поза Store

**Файл:** `packages/excalidraw/data/restore.ts:408`

```ts
if (opts?.deleteInvisibleElements && !text && !element.isDeleted) {
  // TODO: we should not do this since it breaks sync / versioning when we
  // exchange / apply just deltas and restore the elements
  element = { ...element, originalText: text, isDeleted: true };
  element = bumpVersion(element);
}
```

Порожні текстові елементи позначаються як `isDeleted: true` з bumped version — **поза
Store і History**. Це `onChange`-видиме, але не undo-able. При колаборації або обміні
дельтами видалення може бути невидимим для інших учасників.

---

### 3.5 Touch + pointer events — ручний double-click

**Файл:** `App.tsx:689`

```ts
// TODO this is a hack and we should ideally unify touch and pointer events
// and implement our own double click handling end-to-end (currently we're
// using a mix of native browser for click events and manual for touch -
// and browser doubleClick sucks to begin with)
lastPointerUpIsDoubleClick: boolean = false;
```

Double-click на desktop обробляється нативною браузерною подією. На touch — ручна
реалізація через `lastPointerUpIsDoubleClick`. Поведінка double-click різниться між
платформами; баги в одній платформі не відтворюються в іншій.

---

### 3.6 Кругова залежність у `@excalidraw/common`

**Файл:** `packages/common/src/colors.ts:116`

```ts
// FIXME can't put to utils.ts rn because of circular dependency
const pick = <R extends Record<string, any>, K extends readonly (keyof R)[]>(
  source: R, keys: K,
) => { ... };
```

Утилітарна функція `pick` живе в `colors.ts` замість `utils.ts` через кругову залежність
всередині пакету `@excalidraw/common`. Симптом ширшої проблеми зі структурою пакету.

---

## 4. HACK / FIXME без пояснення

### 4.1 Transform handles вимкнені на мобільних для лінійних елементів

**Файл:** `App.tsx:7126`

```ts
// HACK: Disable transform handles for linear elements on mobile until a
// better way of showing them is found
!(
  isLinearElement(selectedElements[0]) &&
  (this.editorInterface.userAgent.isMobileDevice ||
    selectedElements[0].points.length === 2)
)
```

Transform handles для лінійних елементів з 2 точками або на мобільних — вимкнені.
Умова перевірки вшита прямо в логіку рендерингу handles.

---

### 4.2 `UIOptions` перестворюється на кожен рендер — мемо не працює

**Файл:** `packages/excalidraw/index.tsx:105`

```ts
// FIXME normalize/set defaults in parent component so that the memo resolver
// compares the same values
const UIOptions: AppProps["UIOptions"] = {
  ...props.UIOptions,
  canvasActions: { ...DEFAULT_UI_OPTIONS.canvasActions, ...canvasActions },
  ...
};
```

`UIOptions` — новий об'єкт на кожен рендер через spread. `React.memo` на `<Excalidraw>`
(index.tsx:279) порівнює props по референсу, тому `UIOptions` завжди "змінився" →
`<App>` отримує новий об'єкт при кожному ре-рендері батьківського компонента.

---

## 5. Відомі баги, задокументовані в тестах

| Файл | Рядок | Опис |
|---|---|---|
| `flip.test.tsx` | 479–613 | Bounding box неправильний для елементів з кривими поза minMax точками (8 місць) |
| `zindex.test.tsx` | 1322–1325 | Неправильний порядок z-index при duplicate; наступний крок теж некоректний |
| `history.test.tsx` | 2369 | Порядок `groupIds` не гарантований після серії undo/redo |
| `selection.test.tsx` | 250, 273 | Memory leak якщо `pointerUp` не тригернути після `pointerDown` |
| `frame.test.tsx` | 336 | Додавання елементів до frame не працює в тестовому середовищі |

---

## 6. Архітектурні обмеження (TODO)

| Файл | Суть |
|---|---|
| `store.ts:434` | `BinaryFiles` (зображення) не входять до Store → Store не може замінити `onChange` |
| `delta.ts:1422` | Дельти не валідуються семантично → можливі data integrity проблеми при undo/redo |
| `restore.ts:502` | `arrow` не відокремлений від `linear` елемента на рівні типів |
| `sizeHelpers.ts:27` | Невидимі елементи видаляються непослідовно по всіх actions |
| `frame.ts:752` | `getFrameElements()` — bottleneck для великих сцен, оптимізація відкладена |
| `positionElementsOnGrid.ts:6` | Позначено як "mostly vibe-coded" — потребує переписування |

---

## Дивись також

- [Architecture](./architecture.md) — загальна картина, де живуть ці компоненти
- [System Patterns](../memory/systemPatterns.md) — нормальна поведінка Store, History, Action
- [Decision Log](../memory/decisionLog.md) — чому прийняті рішення, що породили ці обмеження
