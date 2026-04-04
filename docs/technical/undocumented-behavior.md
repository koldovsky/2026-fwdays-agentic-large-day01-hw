# Undocumented Behavior — Excalidraw

Зібрані HACK / FIXME / TODO / WORKAROUND та неочевидна поведінка, знайдена в source code.
Усі посилання — конкретні рядки файлів.

---

## 1. Implicit State Machines

### 1.1 Tool activation — прихована машина станів

`AppState.activeTool` — не просте enum-поле, а структура з прихованими переходами:

```typescript
// packages/excalidraw/types.ts — AppState.activeTool
activeTool: {
  type: ActiveTool;
  locked: boolean;          // якщо true — не повертатись до selection після дії
  lastActiveTool: ActiveTool | null; // попередній tool для revert
  fromSelection: boolean;   // tool активований тимчасово з selection
}
```

**Неочевидна поведінка:**
- `eraser` і `hand` — після завершення дії автоматично повертаються до `lastActiveTool`
- `fromSelection: true` означає що натискання ESC поверне до `selection`, а не до попереднього `lastActiveTool`
- Зміна `locked` не відображається в UI явно — користувач не бачить чому інструмент "не відпускається"

### 1.2 multiElement vs newElement — два паралельні стани створення

```
AppState.newElement    — для drag-to-create (один pointer down/up)
AppState.multiElement  — для click-by-click (line, arrow з кількох точок)
```

Обидва можуть бути `non-null` одночасно лише в перехідних станах. Жодної документації про інваріанти.
> `packages/excalidraw/components/App.tsx:991,1049,1113` — логіка переходів між ними без коментарів

### 1.3 penMode / penDetected — неявна активація

```typescript
// App.tsx:4266
penMode: force ?? !prevState.penMode,
penDetected: true,
```

- `penDetected` встановлюється при першому pointer event зі стилусом і **ніколи не скидається** в сесії
- `penMode` може бути `true` без `penDetected: true` (якщо user вмикає вручну)
- Різниця між двома полями ніде не задокументована

### 1.4 isResizing vs isRotating vs isScaling — неточне іменування

```typescript
// App.tsx:12347
// TODO: rename this state field to "isScaling" to distinguish
```

`AppState.isResizing` фактично означає і resize, і scale. Автори самі визнають плутанину в назві.

---

## 2. Non-obvious Side Effects

### 2.1 mutateElement — пряма мутація з side effects

```typescript
// packages/element/src/mutateElement.ts:139
element.version = updates.version ?? element.version + 1;
element.versionNonce = updates.versionNonce ?? randomInteger();
```

`mutateElement()` — **мутує об'єкт in-place** (незважаючи на `Readonly<>` типи скрізь), автоматично:
- інкрементує `version`
- генерує новий `versionNonce`
- оновлює `updated` timestamp

Це означає що **будь-який виклик `mutateElement()` автоматично тригерить reconciliation при колаборації**, навіть якщо зміна не видима.

### 2.2 Store.scheduleCapture — неочевидний запис в history

```typescript
// packages/element/src/store.ts:109
// TODO: Suspicious that this is called so many places. Seems error-prone.
public scheduleCapture() { ... }
```

`scheduleCapture()` викликається у 38 місцях у `App.tsx`. Немає центрального місця, де зрозуміло **коли** зміна потрапить у стек undo. Тип `CaptureUpdateAction` має три значення:
- `IMMEDIATELY` — відразу
- `EVENTUALLY` — колись (default, батчується)
- `NEVER` — ніколи (для remote updates та **scene initialization**)

Якщо передати `NEVER` для локальної зміни — вона стане **non-undoable без жодного попередження**.

### 2.3 restore.ts — silent soft-delete порожнього тексту

```typescript
// packages/excalidraw/data/restore.ts:408
// TODO: we should not do this since it breaks sync / versioning when we
// exchange / apply just deltas and restore the elements (deletion isn't recorded)
if (opts?.deleteInvisibleElements && !text && !element.isDeleted) {
  element = { ...element, isDeleted: true };
  element = bumpVersion(element);
}
```

При restore (завантаження файлу, вставка) текстові елементи з порожнім текстом **автоматично soft-delete**, але це **не записується як delta** → при колаборації ці видалення не синхронізуються коректно.

### 2.4 wysiwyg — підписка на theme через onChangeEmitter замість Store

```typescript
// packages/excalidraw/wysiwyg/textWysiwyg.tsx:964
// FIXME after we start emitting updates from Store for appState.theme
const unsubOnChange = app.onChangeEmitter.on((elements) => {
  if (app.state.theme !== LAST_THEME) {
    updateWysiwygStyle();
  }
});
```

Зміна теми оновлює WYSIWYG-редактор через `onChangeEmitter` (що слухає зміни **елементів**), а не через Store. Якщо тема змінюється без зміни елементів — WYSIWYG може не оновитись.

### 2.5 isSomeElementSelected — глобальний мemoized стан поза редактором

```typescript
// packages/element/src/selection.ts:138
// FIXME move this into the editor instance to keep utility methods stateless
export const isSomeElementSelected = (function () {
  let lastElements: readonly NonDeletedExcalidrawElement[] | null = null;
  let lastSelectedElementIds: AppState["selectedElementIds"] | null = null;
  let isSelected: boolean | null = null;
  // ...
})();
```

Це module-level singleton з кешем. При кількох `<Excalidraw>` на сторінці вони **ділять один кеш**, що може давати неправильний результат.

### 2.6 Library.destroy() — неповне очищення Jotai store

```typescript
// packages/excalidraw/data/library.ts:253
// TODO uncomment after/if we make jotai store scoped to each excal instance
// jotaiStore.set(libraryItemsAtom, { status: "loading", ... });
```

При unmount `<Excalidraw>` бібліотека **не очищає libraryItemsAtom** у Jotai store через незавершений рефакторинг скопінгу. Залишки стану бібліотеки "витікають" між інстансами.

### 2.7 frameId reset при drag — hacky відновлення членства у Frame

```typescript
// App.tsx:10007
// NOTE this is a hacky solution and should be done differently
frameId: duplicateElement.frameId ?? origElement.frameId,
```

При перетягуванні елементів поруч із Frame їх `frameId` тимчасово скидається до оригінального значення і перераховується лише на `pointerup`. Між `pointerdown` і `pointerup` `frameId` може бути некоректним.

---

## 3. Initialization Order Dependencies

### 3.1 App constructor — суворий порядок ініціалізації

```typescript
// App.tsx:840-855 (constructor)
this.fonts  = new Fonts(this.scene);          // 1. залежить від scene
this.history = new History(this.store);        // 2. залежить від store
this.actionManager.registerAll(actions);       // 3. після fonts і history
this.actionManager.registerAction(createUndoAction(this.history));  // 4.
this.actionManager.registerAction(createRedoAction(this.history));  // 5.
this.api = this.createExcalidrawAPI();         // 6. після всього
```

`api` створюється **двічі**: в конструкторі і в `componentDidMount`. Коментар пояснює це React StrictMode — `componentWillUnmount` інвалідує api, тому конструктор потрібен як fallback для "early internal calls".

### 3.2 polyfill() — виклик при першому import, не в компоненті

```typescript
// packages/excalidraw/index.tsx (top-level)
polyfill();
```

`polyfill()` виконується **при кожному import бібліотеки**, не при mount компонента. Це side effect на рівні модуля — якщо бібліотека імпортується на сервері (SSR), polyfill спрацює в Node.js-оточенні.

### 3.3 UIOptions normalization — відсутня при першому рендері

```typescript
// packages/excalidraw/index.tsx:105
// FIXME normalize/set defaults in parent component so that the memo resolver
// compares the same values
const UIOptions: AppProps["UIOptions"] = {
  ...props.UIOptions,
  canvasActions: { ...DEFAULT_UI_OPTIONS.canvasActions, ...canvasActions },
};
```

`UIOptions` нормалізується **всередині render функції**, а не в батьківському компоненті. Memo-перевірка порівнює об'єкти за референсом — кожен рендер створює новий об'єкт → `React.memo` не працює для `UIOptions`.

### 3.4 Image initialization — двоетапна схема

```typescript
// packages/excalidraw/types.ts:146
// ExcalidrawImageElement.status: "pending" | "saved" | "error"
```

Зображення проходять через **два стани** при ініціалізації:
1. `status: "pending"` — елемент є, файл ще не завантажений
2. `status: "saved"` — файл є в `BinaryFiles`

Між цими станами елемент рендериться як placeholder. Якщо `fileId` відсутній у `BinaryFiles` при рендері — placeholder відображається мовчки без помилки.

---

## 4. Known Bugs (задокументовані як FIXME/TODO)

| Файл | Рядок | Опис |
|---|---|---|
| `packages/utils/tests/export.test.ts` | 94 | `exportToSvg` **не фільтрує** `isDeleted` елементи |
| `packages/element/tests/zindex.test.tsx` | 1322 | Z-order при переміщенні у Frame — некоректний результат, тест це підтверджує |
| `packages/excalidraw/actions/actionDuplicateSelection.test.tsx` | 488,494 | При duplicate групи — вибираються зайві елементи (`selectGroupsForSelectedElements`) |
| `packages/element/src/frame.ts` | 752 | `isElementInFrame()` — **bottleneck** для великих сцен, не оптимізовано |
| `packages/element/src/positionElementsOnGrid.ts` | 6 | **"mostly vibe-coded"** — автор сам ставить під сумнів коректність |
| `packages/excalidraw/wysiwyg/textWysiwyg.test.tsx` | 335 | Тест позначений **"too flaky. No one knows why."** — пропускається |
| `packages/excalidraw/actions/actionFinalize.tsx` | 142,232,346 | Invisible elements записуються у Store → можуть бути restored через undo (#7348) |
| `packages/element/src/sizeHelpers.ts` | 27 | Invisible elements не видаляються консистентно з actions, broadcast, export |
| `packages/excalidraw/tests/flip.test.tsx` | 479-613 | Bounding box кривих (freedraw/line) **некоректний** при flip — 8 TODO |
| `packages/excalidraw/tests/selection.test.tsx` | 250,273 | **Memory leak** якщо `pointerup` не тригериться |
| `packages/common/src/colors.ts` | 116 | Утиліта розміщена у `colors.ts` через **circular dependency** з `utils.ts` |
| `packages/element/src/delta.ts` | 1738 | Bound arrows "seem to be often redrawn incorrectly" при undo/redo |
| `packages/math/src/types.ts` | 42,60 | Два legacy типи `Vector`/`Point` живуть поряд з новими tuple-типами — міграція незавершена |

---

## 5. Архітектурні технічні борги

### 5.1 Scene.getScene() — глобальний singleton registry

```typescript
// packages/element/src/elbowArrow.ts:995,1059
// TODO (dwelle,mtolmacs): Remove this once Scene.getScene() is removed
```

`Scene.getScene(elementId)` — статичний метод, що повертає Scene по ID елемента через глобальний Map.
Використовується у `elbowArrow.ts` бо функції не мають доступу до Scene через props.
**Ламає ізоляцію між інстансами.**

### 5.2 Point/Vector — незавершена міграція типів

```typescript
// packages/math/src/point.ts:26
// TODO remove the overload once we migrate to using Point tuples everywhere
```

Кодова база в процесі міграції з `{x, y}` об'єктів до `[x, y]` tuple-типів. Обидва формати співіснують — функції мають overloads для обох. `@excalidraw/math` поки підтримує обидва.

### 5.3 Library Jotai store — не scoped на інстанс

```typescript
// packages/excalidraw/data/library.ts:253
// TODO uncomment after/if we make jotai store scoped to each excal instance
```

`libraryItemsAtom` живе в глобальному `editorJotaiStore`, а не в ізольованому store кожного редактора. При кількох `<Excalidraw>` вони ділять одну бібліотеку — навмисно чи ні, не зазначено.

### 5.4 Touch/pointer events — дублювання логіки

```typescript
// App.tsx:689
// TODO this is a hack and we should ideally unify touch and pointer events
// and implement our own double click handling end-to-end
```

`lastPointerUpIsDoubleClick` — ручна реалізація double-click для touch (бо браузерний `dblclick` незадовільний). Touch і pointer events обробляються різними code paths з частковим дублюванням логіки.

---

*Джерела: `packages/excalidraw/components/App.tsx`, `packages/element/src/store.ts`,
`packages/element/src/mutateElement.ts`, `packages/element/src/selection.ts`,
`packages/excalidraw/data/restore.ts`, `packages/excalidraw/data/library.ts`,
`packages/excalidraw/wysiwyg/textWysiwyg.tsx`, `packages/excalidraw/index.tsx`,
`packages/element/src/elbowArrow.ts`, `packages/element/src/frame.ts`*
