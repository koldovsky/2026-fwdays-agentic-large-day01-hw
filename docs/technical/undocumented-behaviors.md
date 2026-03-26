# Undocumented Behavior Audit

> Аудит проведено: 2026-03-25
> Scope: implicit state machines, неочевидні side effects, init-order deps, HACK/FIXME/TODO/WORKAROUND

Формат кожного запису:
- **File:Line** — точне розташування у коді
- **Function/Context** — функція або клас, де знаходиться поведінка
- **Що робить код** — фактична поведінка
- **Що задокументовано** — що відсутнє у документації

---

## Зведена Таблиця

| ID | Категорія | Файл | Рядок | Функція/Контекст | Критичність |
|----|-----------|------|-------|-------------------|-------------|
| UB-01 | HACK | `packages/excalidraw/components/App.tsx` | 689 | `handleCanvasPointerDown` | Середня |
| UB-02 | HACK | `packages/excalidraw/components/App.tsx` | 7126 | `getTransformHandles` | Низька |
| UB-03 | TODO perf | `packages/element/src/frame.ts` | 752 | `getElementsInFrames` | Висока |
| UB-04 | TODO perf | `packages/excalidraw/snapping.ts` | 44 | `getSnapPoints` (константа) | Середня |
| UB-05 | TODO bug | `packages/element/src/delta.ts` | 726 | `AppStateDelta.apply` | Висока |
| UB-06 | TODO bug | `packages/element/src/delta.ts` | 1738 | `ElementsDelta.apply` | Середня |
| UB-07 | TODO arch | `packages/excalidraw/data/restore.ts` | 408 | `restoreElements` | Висока |
| UB-08 | TODO dead code | `excalidraw-app/App.tsx` | 417 | `ExcalidrawApp.componentDidMount` | Низька |
| UB-09 | TODO type abuse | `excalidraw-app/collab/Collab.tsx` | 499 | `Collab.handleRemoteSceneUpdate` | Середня |
| UB-10 | FIXME stateful | `packages/element/src/selection.ts` | 138 | `getSelectedElements` | Середня |
| UB-11 | FIXME unknown | `packages/excalidraw/components/App.tsx` | 8758 | невідомо | Невідома |
| UB-12 | TODO jotai | `packages/excalidraw/data/library.ts` | 253 | `LibraryManager.setLibraryItems` | Висока |
| UB-13 | Implicit SM | `packages/excalidraw/components/App.tsx` | 662, 3360 | `App` class / `componentDidUpdate` | Висока |
| UB-14 | Implicit SM | `packages/excalidraw/components/App.tsx` | 587–607 | module-level gesture flags | Висока |
| UB-15 | Implicit SM | `packages/excalidraw/cursor.ts` | 37–38 | module-level cursor cache | Середня |
| UB-16 | Implicit SM | `packages/excalidraw/i18n.ts` | 89–90 | `setLanguage` / module state | Середня |
| UB-17 | Implicit SM | `packages/excalidraw/components/hyperlink/Hyperlink.tsx` | 61, 384 | `HyperlinkPopup` module state | Середня |
| UB-18 | Implicit SM | `packages/excalidraw/fonts/Fonts.ts` | 61, 400 | `Fonts.loadFontsForElements` (static) | Висока |
| UB-19 | Implicit SM | `packages/excalidraw/actions/actionExport.tsx` | 167 | `actionSaveFileToDisk.perform` | Середня |
| UB-20 | Side Effect | `packages/excalidraw/components/App.tsx` | 3066–3070 | `App.componentDidMount` → `window.h` | Середня |
| UB-21 | Side Effect | `excalidraw-app/collab/Collab.tsx` | 246–252 | `Collab.componentDidMount` → `window.collab` | Середня |
| UB-22 | Side Effect | `packages/excalidraw/components/App.tsx` | 2061 | `App.componentDidMount` → `document.documentElement.style` | Висока |
| UB-23 | Side Effect | `packages/excalidraw/components/App.tsx` | 4461–4475 | `App.handleAppOnCut` / Cache.delete | Висока |
| UB-24 | Side Effect | `packages/excalidraw/components/App.tsx` | 11489 | `App.addImageFiles` auto-resize | Середня |
| UB-25 | Side Effect | `packages/excalidraw/data/library.ts` | 591 | `Library.saveLibrary` (module hash) | Висока |
| UB-26 | Init Order | `packages/element/src/elbowArrow.ts` | 995, 1059 | `updateElbowArrowPoints` | Висока |
| UB-27 | Init Order | `packages/excalidraw/components/App.tsx` | 662–3360 | `App` lifecycle chain | Висока |
| UB-28 | Init Order | `excalidraw-app/app-jotai.ts:13` + `excalidraw-app/collab/Collab.tsx:243` | 13, 243 | `collabAPIAtom` / `Collab.componentDidMount` | Висока |
| UB-29 | Init Order | `excalidraw-app/data/LocalData.ts` | 118–134 | `LocalData._save` (static debounce) | Висока |
| UB-30 | Init Order | `packages/excalidraw/data/library.ts` | 108–114 | `libraryItemsAtom` initial value | Середня |
| UB-31 | Async Race | `packages/excalidraw/components/App.tsx` | 2511–2600 | `App.onMagicFrameGenerate` | Висока |
| UB-32 | Async Race | `packages/excalidraw/components/App.tsx` | 11448–11540 | `App.addImageFiles` concurrent uploads | Висока |
| UB-33 | Async Race | `excalidraw-app/collab/Collab.tsx` | 139 | `Collab.socketInitializationTimer` | Середня |

---

## HACK / TODO / FIXME

### UB-01: Touch Events Hack

**File:Line:** `packages/excalidraw/components/App.tsx:689`
**Function:** `handleCanvasPointerDown`
**Comment:** `// TODO this is a hack and we should ideally unify touch and pointer events`
**Що робить код:** Дублює логіку обробки подій для touch окремо від pointer events — два паралельні pipeline для одного результату.
**Що задокументовано:** Нічого. Немає пояснення чому їх не можна уніфікувати й коли це буде виправлено.

---

### UB-02: Disabled Transform Handles на Mobile (обірваний коментар)

**File:Line:** `packages/excalidraw/components/App.tsx:7126`
**Function:** `getTransformHandles`
**Comment:** `// HACK: Disable transform handles for linear elements on mobile until a`
**Що робить код:** Transform handles для лінійних елементів приховані на мобільних пристроях. Коментар обривається — умова відновлення невідома.
**Що задокументовано:** Нічого. Відсутня умова повернення функціональності.

---

### UB-03: Performance Bottleneck у Frame Logic

**File:Line:** `packages/element/src/frame.ts:752`
**Function:** `getElementsInFrames`
**Comment:** `// TODO: this a huge bottleneck for large scenes, optimise`
**Що робить код:** Функція перебирає всі елементи сцени O(n) без кешування при кожній зміні сцени.
**Що задокументовано:** Bottleneck не згадується. Користувачі з великими сценами зазнають деградації без пояснення.

---

### UB-04: Snap Limit Без Обґрунтування

**File:Line:** `packages/excalidraw/snapping.ts:44`
**Function:** константа `MAX_SNAP_POINTS` (module-level)
**Comment:** `// TODO increase or remove once we optimize`
**Що робить код:** Жорстко задане обмеження кількості snap-точок — обрізає snap на великих сценах.
**Що задокументовано:** Нічого. Відсутній snap може виглядати як баг.

---

### UB-05: Undo/Redo Може Бути Порожнім

**File:Line:** `packages/element/src/delta.ts:726`
**Function:** `AppStateDelta.apply`
**Comment:** `// TODO: #7348 we could still get an empty undo/redo, as we assume that previous appstate does not contain references to deleted elements`
**Що робить код:** Дельта застосовується до стану з видаленими елементами — може продукувати порожні undo/redo операції.
**Що задокументовано:** Issue #7348 існує, але поведінка не описана в документації API.

---

### UB-06: Bound Arrow Redraw Bug

**File:Line:** `packages/element/src/delta.ts:1738`
**Function:** `ElementsDelta.apply`
**Comment:** `// TODO: revisit since some bound arrows seem to be often redrawn incorrectly`
**Що робить код:** Bound arrows перемальовуються з некоректними координатами після певних операцій зміни дельти.
**Що задокументовано:** Нічого. Відомий баг без умов відтворення.

---

### UB-07: Restore Ламає Sync/Versioning

**File:Line:** `packages/excalidraw/data/restore.ts:408`
**Function:** `restoreElements`
**Comment:** `// TODO: we should not do this since it breaks sync / versioning when we exchange / apply just deltas and restore the elements (deletion isn't recorded)`
**Що робить код:** `restoreElements()` мутує масив елементів без запису видалення як дельти — порушує CRDT sync при колаборації.
**Що задокументовано:** Публічний API `restoreElements` задокументований без застережень щодо синхронізації.

---

### UB-08: Dead Code Після Дедлайну

**File:Line:** `excalidraw-app/App.tsx:417`
**Function:** `ExcalidrawApp.componentDidMount`
**Comment:** `// TODO maybe remove this in several months (shipped: 24-03-11)`
**Що робить код:** Блок активного коду, позначений для видалення більш ніж рік тому. Продовжує виконуватись.
**Що задокументовано:** Нічого.

---

### UB-09: Зловживання Типом ImportedDataState

**File:Line:** `excalidraw-app/collab/Collab.tsx:499`
**Function:** `Collab.handleRemoteSceneUpdate`
**Comment:** `// TODO: ImportedDataState type here seems abused`
**Що робить код:** `ImportedDataState` використовується для collab payload, хоча тип призначений виключно для file-import.
**Що задокументовано:** Тип задокументований лише для file-import use case.

---

### UB-10: Stateful Utility Method

**File:Line:** `packages/element/src/selection.ts:138`
**Function:** `getSelectedElements`
**Comment:** `// FIXME move this into the editor instance to keep utility methods stateless`
**Що робить код:** Utility-функція зберігає/читає стан поза межами editor instance — приховані side effects.
**Що задокументовано:** Функція виглядає як stateless utility, але має side effects.

---

### UB-11: Беззмістовний FIXME

**File:Line:** `packages/excalidraw/components/App.tsx:8758`
**Function:** невідомо — коментар без контексту
**Comment:** `// FIXME`
**Що робить код:** Невідомо.
**Що задокументовано:** Нічого.

---

### UB-12: Jotai Store Не Scoped Per Instance

**File:Line:** `packages/excalidraw/data/library.ts:253`
**Function:** `LibraryManager.setLibraryItems`
**Comment:** `// TODO uncomment after/if we make jotai store scoped to each excal instance`
**Що робить код:** Закоментований код заблокований глобальним рефакторингом store, якого не відбулося. Обмеження: один global store для всіх екземплярів.
**Що задокументовано:** Нічого. Обмеження на один global store не задокументовано.

---

## Implicit State Machines

### UB-13: App Initialization Boolean Flag

**File:Line:** `packages/excalidraw/components/App.tsx:662, 3360`
**Function:** `App` class field + `App.componentDidUpdate`
**Код:** `private _initialized = false;`
**Що робить код:** Boolean флаг контролює логіку першого рендеру. Перехід `false → true` відбувається в `componentDidUpdate` коли `!isLoading`. Є implicit "initializing" фаза без третього стану.
**Що задокументовано:** Немає жодної документації про lifecycle переходи App компонента.

---

### UB-14: 10+ Gesture State Флагів

**File:Line:** `packages/excalidraw/components/App.tsx:587–607`
**Function:** module-level перед класом `App`

```ts
let didTapTwice: boolean = false;     // App.tsx:588
let tappedTwiceTimer = 0;             // App.tsx:589
let isHoldingSpace: boolean = false;  // App.tsx:590
let isPanning: boolean = false;       // App.tsx:591
let isDraggingScrollBar: boolean = false; // App.tsx:592
let touchTimeout = 0;                 // App.tsx:593
let invalidateContextMenu = false;    // App.tsx:594
let IS_PLAIN_PASTE = false;           // App.tsx:598
let IS_PLAIN_PASTE_TIMER = 0;         // App.tsx:599
let PLAIN_PASTE_TOAST_SHOWN = false;  // App.tsx:600
```

**Що робить код:** Module-level змінні формують неявний state machine взаємодій. Комбінації флагів визначають поведінку без явного опису переходів.
**Що задокументовано:** Нічого. Відсутня діаграма станів.

---

### UB-15: Cursor Module-Level Cache

**File:Line:** `packages/excalidraw/cursor.ts:37–38`
**Function:** module-level (використовується в `getCursorImageSrc`)
**Код:** `let eraserCanvasCache: any; let previewDataURL: string;`
**Що робить код:** Кешує canvas та dataURL між рендерами без механізму інвалідації при зміні теми/розміру.
**Що задокументовано:** Нічого.

---

### UB-16: Global Language State

**File:Line:** `packages/excalidraw/i18n.ts:89–90`
**Function:** module-level (зчитується `setLanguage`, `t`)
**Код:** `let currentLang: Language = defaultLang; let currentLangData = {};`
**Що робить код:** Глобальний мутований стан мови. При зміні через `setLanguage()` компоненти не отримують сповіщення через стандартні React-механізми.
**Що задокументовано:** API `setLanguage` задокументований без згадки про глобальний стан.

---

### UB-17: Hyperlink Tooltip Implicit 3-State Machine

**File:Line:** `packages/excalidraw/components/hyperlink/Hyperlink.tsx:61, 384`
**Function:** module-level (використовується в `HyperlinkPopup`)
**Код:** `let IS_HYPERLINK_TOOLTIP_VISIBLE = false; let HYPERLINK_TOOLTIP_TIMEOUT_ID: number | null = null;`
**Що робить код:** Boolean + timer ID утворюють 3-стан: `hidden → pending → visible`. Race condition при швидкому hover/unhover.
**Що задокументовано:** Нічого.

---

### UB-18: Fonts Static Initialization Without Mutex

**File:Line:** `packages/excalidraw/fonts/Fonts.ts:61, 400`
**Function:** `Fonts.loadFontsForElements` (static метод)
**Код:** `private static _initialized: boolean = false;`
**Що робить код:** Lazy initialization через static boolean. Повторні виклики до завершення async-завантаження ігноруються без помилки — шрифти можуть бути відсутні.
**Що задокументовано:** Нічого про поведінку при concurrent викликах.

---

### UB-19: Export In-Progress Flag (Not Async-Safe)

**File:Line:** `packages/excalidraw/actions/actionExport.tsx:167`
**Function:** `actionSaveFileToDisk.perform`
**Код:** `let onExportInProgress = false;`
**Що робить код:** Запобігає подвійному експорту, але не є async-safe — між перевіркою та встановленням флагу можливий race в JS event loop.
**Що задокументовано:** Нічого.

---

## Side Effects

### UB-20: window.h Debug Object

**File:Line:** `packages/excalidraw/components/App.tsx:3066–3070`
**Function:** `App.componentDidMount`
**Код:** `Object.defineProperties(window.h, { getAppState, setState, ... });`
**Що робить код:** Прикріплює мутабельне посилання на внутрішній стан до `window.h`. Зберігається між перемонтуваннями — може витікати old state у dev режимі.
**Що задокументовано:** Нічого. Побічний ефект прихований всередині `componentDidMount`.

---

### UB-21: window.collab у Prod

**File:Line:** `excalidraw-app/collab/Collab.tsx:246–252`
**Function:** `Collab.componentDidMount`
**Код:** `Object.defineProperties(window, { collab: { value: this } });`
**Що робить код:** Реєструє екземпляр `Collab` у глобальному `window`. Guard умова може не спрацьовувати в production.
**Що задокументовано:** Нічого. Відсутнє застереження про глобальне забруднення namespace.

---

### UB-22: overscrollBehaviorX Глобальна Мутація

**File:Line:** `packages/excalidraw/components/App.tsx:2061`
**Function:** `App.componentDidMount`
**Код:** `document.documentElement.style.overscrollBehaviorX = "none";`
**Що робить код:** Змінює CSS `<html>` елемента глобально для всієї сторінки — впливає на scroll поза межами канви при embedding.
**Що задокументовано:** Embedding-документація не попереджає про зміну глобальних стилів сторінки.

---

### UB-23: WebShare Cache Видалення як Side Effect Читання

**File:Line:** `packages/excalidraw/components/App.tsx:4461–4475`
**Function:** `App.handleAppOnCut` / cache cleanup block
**Що робить код:** Видаляє cache-запис як побічний ефект читання. При помилці між `cache.match()` та `cache.delete()` — дані залишаться назавжди.
**Що задокументовано:** Нічого.

---

### UB-24: Автоматичний Image Resize Без Сповіщення

**File:Line:** `packages/excalidraw/components/App.tsx:11489`
**Function:** `App.addImageFiles`
**Що робить код:** Автоматично змінює розмір зображення без сповіщення користувача. Оригінальний файл не зберігається.
**Що задокументовано:** Нічого у публічній документації API про автоматичний resize.

---

### UB-25: Library Save Hash — Конфлікт При Кількох Інстансах

**File:Line:** `packages/excalidraw/data/library.ts:591`
**Function:** `Library.saveLibrary`
**Код:** `let lastSavedLibraryItemsHash = 0;`
**Що робить код:** Глобальний module-level хеш останнього збереженого стану. При множинних інстансах Excalidraw на одній сторінці — конфлікт хешів.
**Що задокументовано:** Обмеження на одну екземпляр не задокументовано.

---

## Init Order Dependencies

### UB-26: Scene.getScene() Singleton

**File:Line:** `packages/element/src/elbowArrow.ts:995, 1059`
**Function:** `updateElbowArrowPoints`
**Comment:** `// TODO (dwelle,mtolmacs): Remove this once Scene.getScene() is removed`
**Що робить код:** Функція залежить від глобального Scene singleton. Якщо Scene не ініціалізована — повертає некоректні значення без помилки або попередження.
**Що задокументовано:** Нічого про вимогу порядку ініціалізації.

---

### UB-27: App Component Lifecycle Implicit Chain

**File:Line:** `packages/excalidraw/components/App.tsx:662, 803, 2860, 3057, 3360`
**Function:** `App.constructor` → `App.componentDidMount` → `App.componentDidUpdate`

Прихований ланцюжок:

1. `constructor` (`:662`) → `_initialized = false`, `isLoading = true`
2. `componentDidMount` (`:803`) → викликає `initializeScene()` (async)
3. `componentDidUpdate` (`:3360`) → якщо `!isLoading` → `_initialized = true`

Будь-який код що перевіряє `_initialized` до завершення `initializeScene()` отримає `false` без ознаки очікування.
**Що задокументовано:** Порядок ніде не описаний.

---

### UB-28: Jotai Store vs Component Render Race

**File:Line:** `excalidraw-app/app-jotai.ts:13` + `excalidraw-app/collab/Collab.tsx:243`
**Function:** `collabAPIAtom` (atom) / `Collab.componentDidMount`
**Що робить код:** `collabAPIAtom` встановлюється лише після `Collab.componentDidMount` (`:243`), але компоненти можуть читати atom під час render — до mount. Початкове значення — `undefined` (`:13`).
**Що задокументовано:** Нічого про початковий `undefined` стан.

---

### UB-29: LocalData Static Debounce

**File:Line:** `excalidraw-app/data/LocalData.ts:118–134`
**Function:** `LocalData._save` (static debounced method)
**Що робить код:** Static `_save` debounce ініціалізується при завантаженні модуля. `this.fileStorage` (static property) може ще не бути встановлене на момент першого виклику — silent failure.
**Що задокументовано:** Нічого.

---

### UB-30: Library Items Atom — isInitialized Race

**File:Line:** `packages/excalidraw/data/library.ts:108–114`
**Function:** `libraryItemsAtom` initial value
**Код:** `{ status: "loaded", isInitialized: false, libraryItems: [] }` — початковий стан.
**Що робить код:** Компоненти перевіряють `isInitialized` під час рендеру. Проміжок між першим рендером і встановленням `true` → порожня бібліотека без loading-індикатора.
**Що задокументовано:** Нічого про поведінку до ініціалізації.

---

## Async Race Conditions

### UB-31: Magic Frame — Відсутній Cancellation

**File:Line:** `packages/excalidraw/components/App.tsx:2511–2600`
**Function:** `App.onMagicFrameGenerate`
**Що робить код:** Async виклик зовнішнього AI API без `AbortController`. При unmount компонента під час очікування відповіді — `setState` викликається на unmounted компоненті.
**Що задокументовано:** Нічого про cancellation або error boundaries при AI виклику.

---

### UB-32: Concurrent Image Uploads — Race Condition

**File:Line:** `packages/excalidraw/components/App.tsx:11448–11540`
**Function:** `App.addImageFiles`
**Що робить код:** Множинні паралельні async image uploads можуть взаємно перезаписувати стан елементів. Немає черги або mutex.
**Що задокументовано:** Нічого.

---

### UB-33: Socket Init Timer Leak

**File:Line:** `excalidraw-app/collab/Collab.tsx:139`
**Function:** `Collab` class field + `Collab.initializeSocket`
**Код:** `private socketInitializationTimer?: number;`
**Що робить код:** Timer встановлюється під час ініціалізації socket. При network error ініціалізація не завершується — timer залишається активним після unmount компонента.
**Що задокументовано:** Нічого про cleanup або timeout behavior.
