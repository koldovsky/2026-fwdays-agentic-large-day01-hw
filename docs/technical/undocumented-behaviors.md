# Undocumented Behavior Audit

> Аудит проведено: 2026-03-25
> Scope: implicit state machines, неочевидні side effects, init-order deps, HACK/FIXME/TODO/WORKAROUND

Кожен запис: **що робить код** vs **що задокументовано** + file path + рядок.

---

## Зведена Таблиця

| ID | Категорія | Файл | Рядок | Критичність |
|----|-----------|------|-------|-------------|
| UB-01 | HACK | `packages/excalidraw/components/App.tsx` | 689 | Середня |
| UB-02 | HACK (обірваний) | `packages/excalidraw/components/App.tsx` | 7126 | Низька |
| UB-03 | TODO (perf) | `packages/element/src/frame.ts` | 752 | Висока |
| UB-04 | TODO (perf) | `packages/excalidraw/snapping.ts` | 44 | Середня |
| UB-05 | TODO (bug) | `packages/element/src/delta.ts` | 726 | Висока |
| UB-06 | TODO (bug) | `packages/element/src/delta.ts` | 1738 | Середня |
| UB-07 | TODO (arch) | `packages/excalidraw/data/restore.ts` | 408 | Висока |
| UB-08 | TODO (dead code) | `excalidraw-app/App.tsx` | 417 | Низька |
| UB-09 | TODO (type abuse) | `excalidraw-app/collab/Collab.tsx` | 499 | Середня |
| UB-10 | FIXME (stateful) | `packages/element/src/selection.ts` | 138 | Середня |
| UB-11 | FIXME (unknown) | `packages/excalidraw/components/App.tsx` | 8758 | Невідома |
| UB-12 | TODO (jotai scope) | `packages/excalidraw/data/library.ts` | 253 | Висока |
| UB-13 | Implicit SM | `packages/excalidraw/components/App.tsx` | 662, 3360 | Висока |
| UB-14 | Implicit SM | `packages/excalidraw/components/App.tsx` | 587–607 | Висока |
| UB-15 | Implicit SM | `packages/excalidraw/cursor.ts` | 37–38 | Середня |
| UB-16 | Implicit SM | `packages/excalidraw/i18n.ts` | 89–90 | Середня |
| UB-17 | Implicit SM | `packages/excalidraw/components/hyperlink/Hyperlink.tsx` | 61, 384 | Середня |
| UB-18 | Implicit SM | `packages/excalidraw/fonts/Fonts.ts` | 61, 400 | Висока |
| UB-19 | Implicit SM | `packages/excalidraw/actions/actionExport.tsx` | 167 | Середня |
| UB-20 | Side Effect | `packages/excalidraw/components/App.tsx` | 3066–3070 | Середня |
| UB-21 | Side Effect | `excalidraw-app/collab/Collab.tsx` | 246–252 | Середня |
| UB-22 | Side Effect | `packages/excalidraw/components/App.tsx` | 2061 | Висока |
| UB-23 | Side Effect | `packages/excalidraw/components/App.tsx` | 4461–4475 | Висока |
| UB-24 | Side Effect | `packages/excalidraw/components/App.tsx` | 11489 | Середня |
| UB-25 | Side Effect | `packages/excalidraw/data/library.ts` | 591 | Висока |
| UB-26 | Init Order | `packages/element/src/elbowArrow.ts` | 995, 1059 | Висока |
| UB-27 | Init Order | `packages/excalidraw/components/App.tsx` | 662–3360 | Висока |
| UB-28 | Init Order | `excalidraw-app/app-jotai.ts` + `excalidraw-app/collab/Collab.tsx` | 13, 243 | Висока |
| UB-29 | Init Order | `excalidraw-app/data/LocalData.ts` | 118–134 | Висока |
| UB-30 | Init Order | `packages/excalidraw/data/library.ts` | 108–114 | Середня |
| UB-31 | Async Race | `packages/excalidraw/components/App.tsx` | 2511–2600 | Висока |
| UB-32 | Async Race | `packages/excalidraw/components/App.tsx` | 11448–11540 | Висока |
| UB-33 | Async Race | `excalidraw-app/collab/Collab.tsx` | 139 | Середня |

---

## HACK / TODO / FIXME Entries

### UB-01: Touch Events Hack

**File:** `packages/excalidraw/components/App.tsx:689`
**Comment:** `// TODO this is a hack and we should ideally unify touch and pointer events`
**Що робить код:** Дублює логіку обробки подій для touch окремо від pointer events — два паралельні pipeline.
**Що задокументовано:** Нічого. Немає пояснення чому їх не можна уніфікувати й коли це буде виправлено.

---

### UB-02: Disabled Transform Handles на Mobile (обірваний коментар)

**File:** `packages/excalidraw/components/App.tsx:7126`
**Comment:** `// HACK: Disable transform handles for linear elements on mobile until a`
**Що робить код:** Transform handles для лінійних елементів приховані на мобільних пристроях. Коментар обривається.
**Що задокументовано:** Нічого. Умова повернення функціональності невідома.

---

### UB-03: Performance Bottleneck у Frame Logic

**File:** `packages/element/src/frame.ts:752`
**Comment:** `// TODO: this a huge bottleneck for large scenes, optimise`
**Що робить код:** Функція перебирає всі елементи сцени O(n) без кешування.
**Що задокументовано:** Bottleneck не згадується в документації. Користувачі з великими сценами страждають без пояснення.

---

### UB-04: Snap Limit Без Обґрунтування

**File:** `packages/excalidraw/snapping.ts:44`
**Comment:** `// TODO increase or remove once we optimize`
**Що робить код:** Жорстко задане обмеження кількості snap-точок — обрізає snap на великих сценах.
**Що задокументовано:** Нічого. Відсутній snap може виглядати як баг.

---

### UB-05: Undo/Redo Може Бути Порожнім

**File:** `packages/element/src/delta.ts:726`
**Comment:** `// TODO: #7348 we could still get an empty undo/redo, as we assume that previous appstate does not contain references to deleted elements`
**Що робить код:** Дельта застосовується до стану з видаленими елементами — може продукувати порожні undo/redo операції.
**Що задокументовано:** Issue #7348 існує, але поведінка не описана в документації API.

---

### UB-06: Bound Arrow Redraw Bug

**File:** `packages/element/src/delta.ts:1738`
**Comment:** `// TODO: revisit since some bound arrows seem to be often redrawn incorrectly`
**Що робить код:** Bound arrows перемальовуються з некоректними координатами після певних операцій.
**Що задокументовано:** Нічого. Відомий баг без умов відтворення.

---

### UB-07: Restore Ламає Sync/Versioning

**File:** `packages/excalidraw/data/restore.ts:408`
**Comment:** `// TODO: we should not do this since it breaks sync / versioning when we exchange / apply just deltas and restore the elements (deletion isn't recorded)`
**Що робить код:** `restoreElements()` мутує масив елементів, не записуючи видалення як дельту — порушує CRDT sync.
**Що задокументовано:** API `restoreElements` задокументований без застережень щодо синхронізації.

---

### UB-08: Dead Code Після Дедлайну

**File:** `excalidraw-app/App.tsx:417`
**Comment:** `// TODO maybe remove this in several months (shipped: 24-03-11)`
**Що робить код:** Блок активного коду, позначений для видалення більш ніж рік тому.
**Що задокументовано:** Нічого.

---

### UB-09: Зловживання Типом ImportedDataState

**File:** `excalidraw-app/collab/Collab.tsx:499`
**Comment:** `// TODO: ImportedDataState type here seems abused`
**Що робить код:** `ImportedDataState` використовується для collab-даних, хоча тип призначений для file-import.
**Що задокументовано:** Тип задокументований лише для file-import use case.

---

### UB-10: Stateful Utility Method

**File:** `packages/element/src/selection.ts:138`
**Comment:** `// FIXME move this into the editor instance to keep utility methods stateless`
**Що робить код:** Utility-функція зберігає/читає стан поза межами editor instance.
**Що задокументовано:** Функція описана як stateless utility, але має side effects.

---

### UB-11: Беззмістовний FIXME

**File:** `packages/excalidraw/components/App.tsx:8758`
**Comment:** `// FIXME`
**Що робить код:** Невідомо — коментар без пояснення.
**Що задокументовано:** Нічого.

---

### UB-12: Jotai Store Не Scoped Per Instance

**File:** `packages/excalidraw/data/library.ts:253`
**Comment:** `// TODO uncomment after/if we make jotai store scoped to each excal instance`
**Що робить код:** Закоментований код заблокований глобальним рефакторингом store, якого не відбулося.
**Що задокументовано:** Нічого. Обмеження на один global store не задокументовано.

---

## Implicit State Machines

### UB-13: App Initialization Boolean Flag

**File:** `packages/excalidraw/components/App.tsx:662, 3360`
**Код:** `private _initialized = false;`
**Що робить код:** Boolean флаг контролює логіку першого рендеру. Переходи: `false → true` відбуваються в `componentDidUpdate` коли `!isLoading`. Третього стану немає, але є implicit "initializing" фаза.
**Що задокументовано:** Немає жодної документації про lifecycle переходи App компонента.

---

### UB-14: 10+ Gesture State Флагів

**File:** `packages/excalidraw/components/App.tsx:587–607`

```ts
let didTapTwice: boolean = false;
let tappedTwiceTimer = 0;
let isHoldingSpace: boolean = false;
let isPanning: boolean = false;
let isDraggingScrollBar: boolean = false;
let touchTimeout = 0;
let invalidateContextMenu = false;
let IS_PLAIN_PASTE = false;
let IS_PLAIN_PASTE_TIMER = 0;
let PLAIN_PASTE_TOAST_SHOWN = false;
```

**Що робить код:** Module-level змінні формують неявний state machine взаємодій. Комбінації флагів визначають поведінку без явного опису переходів.
**Що задокументовано:** Нічого. Відсутня діаграма станів чи опис взаємодій.

---

### UB-15: Cursor Module-Level Cache

**File:** `packages/excalidraw/cursor.ts:37–38`
**Код:** `let eraserCanvasCache: any; let previewDataURL: string;`
**Що робить код:** Кешує canvas та dataURL між рендерами без механізму інвалідації при зміні теми/розміру.
**Що задокументовано:** Нічого.

---

### UB-16: Global Language State

**File:** `packages/excalidraw/i18n.ts:89–90`
**Код:** `let currentLang: Language = defaultLang; let currentLangData = {};`
**Що робить код:** Глобальний мутований стан мови. При зміні через `setLanguage()` компоненти не отримують сповіщення через стандартні механізми.
**Що задокументовано:** API `setLanguage` задокументований без згадки про глобальний стан.

---

### UB-17: Hyperlink Tooltip Implicit 3-State Machine

**File:** `packages/excalidraw/components/hyperlink/Hyperlink.tsx:61, 384`
**Код:** `let IS_HYPERLINK_TOOLTIP_VISIBLE = false; let HYPERLINK_TOOLTIP_TIMEOUT_ID: number | null = null;`
**Що робить код:** Boolean + timer ID утворюють 3-стан: `hidden → pending → visible`. Race condition при швидкому hover/unhover.
**Що задокументовано:** Нічого.

---

### UB-18: Fonts Static Initialization Without Mutex

**File:** `packages/excalidraw/fonts/Fonts.ts:61, 400`
**Код:** `private static _initialized: boolean = false;`
**Що робить код:** Lazy initialization через static boolean. Повторні виклики до завершення async-завантаження ігноруються без помилки — шрифти можуть бути відсутні.
**Що задокументовано:** Нічого про поведінку при concurrent викликах.

---

### UB-19: Export In-Progress Flag (Not Async-Safe)

**File:** `packages/excalidraw/actions/actionExport.tsx:167`
**Код:** `let onExportInProgress = false;`
**Що робить код:** Запобігає подвійному експорту, але не є async-safe — між перевіркою та встановленням флагу можливий race в JS event loop.
**Що задокументовано:** Нічого.

---

## Side Effects

### UB-20: window.h Debug Object

**File:** `packages/excalidraw/components/App.tsx:3066–3070`
**Код:** `Object.defineProperties(window.h, { getAppState, setState, ... });`
**Що робить код:** Прикріплює мутабельне посилання на внутрішній стан до `window.h`. Зберігається між перемонтуваннями — може витікати old state.
**Що задокументовано:** Нічого. Побічний ефект прихований всередині `componentDidMount`.

---

### UB-21: window.collab у Prod

**File:** `excalidraw-app/collab/Collab.tsx:246–252`
**Код:** `Object.defineProperties(window, { collab: { value: this } });`
**Що робить код:** Реєструє `Collab` інстанс у глобальному `window`. Умова guard може не спрацьовувати в production.
**Що задокументовано:** Нічого. Відсутнє застереження про глобальне забруднення namespace.

---

### UB-22: overscrollBehaviorX Глобальна Мутація

**File:** `packages/excalidraw/components/App.tsx:2061`
**Код:** `document.documentElement.style.overscrollBehaviorX = "none";`
**Що робить код:** Змінює CSS `<html>` елемента глобально для всієї сторінки — впливає на scroll поза межами канви.
**Що задокументовано:** Embedding-документація не попереджає про зміну глобальних стилів.

---

### UB-23: WebShare Cache Видалення як Side Effect Читання

**File:** `packages/excalidraw/components/App.tsx:4461–4475`
**Що робить код:** Видаляє кеш-запис як побічний ефект читання. При помилці між `match` та `delete` — дані залишаться назавжди.
**Що задокументовано:** Нічого.

---

### UB-24: Автоматичний Image Resize Без Сповіщення

**File:** `packages/excalidraw/components/App.tsx:11489`
**Що робить код:** Автоматично змінює розмір зображення без сповіщення користувача. Оригінальний файл не зберігається.
**Що задокументовано:** Нічого у документації API про автоматичний resize.

---

### UB-25: Library Save Hash — Конфлікт При Кількох Інстансах

**File:** `packages/excalidraw/data/library.ts:591`
**Код:** `let lastSavedLibraryItemsHash = 0;`
**Що робить код:** Глобальний хеш останнього збереженого стану. При множинних інстансах Excalidraw — конфлікт.
**Що задокументовано:** Обмеження на одну інстансію не задокументовано.

---

## Init Order Dependencies

### UB-26: Scene.getScene() Singleton

**File:** `packages/element/src/elbowArrow.ts:995, 1059`
**Comment:** `// TODO (dwelle,mtolmacs): Remove this once Scene.getScene() is removed`
**Що робить код:** Функції залежать від глобального Scene singleton. Якщо Scene не ініціалізована — повертають некоректні значення без помилки.
**Що задокументовано:** Нічого про вимогу порядку ініціалізації.

---

### UB-27: App Component Lifecycle Implicit Chain

**File:** `packages/excalidraw/components/App.tsx:662, 803, 2860, 3057, 3360`
**Що робить код:** Прихований ланцюжок:

1. `constructor` → `_initialized = false`, `isLoading = true`
2. `componentDidMount` → `initializeScene()` (async)
3. `componentDidUpdate` → якщо `!isLoading` → `_initialized = true`

Будь-який код що перевіряє `_initialized` до завершення `initializeScene()` отримає `false` без ознаки очікування.
**Що задокументовано:** Порядок ніде не описаний.

---

### UB-28: Jotai Store vs Component Render Race

**File:** `excalidraw-app/app-jotai.ts:13` + `excalidraw-app/collab/Collab.tsx:243`
**Що робить код:** `collabAPIAtom` встановлюється лише після `componentDidMount`, але компоненти можуть читати atom під час render — до mount. Початкове значення — `undefined`.
**Що задокументовано:** Нічого.

---

### UB-29: LocalData Static Debounce

**File:** `excalidraw-app/data/LocalData.ts:118–134`
**Що робить код:** Static `_save` використовує debounce ініціалізований при завантаженні модуля. `this.fileStorage` (static property) може ще не бути встановлене на момент першого виклику.
**Що задокументовано:** Нічого.

---

### UB-30: Library Items Atom — isInitialized Race

**File:** `packages/excalidraw/data/library.ts:108–114`
**Код:** `{ status: "loaded", isInitialized: false, libraryItems: [] }` — початковий стан atom.
**Що робить код:** Компоненти перевіряють `isInitialized` під час рендеру. Проміжок між першим рендером і встановленням `true` призводить до порожньої бібліотеки без loading-індикатора.
**Що задокументовано:** Нічого про поведінку до ініціалізації.

---

## Async Race Conditions

### UB-31: Magic Frame — Відсутній Cancellation

**File:** `packages/excalidraw/components/App.tsx:2511–2600`
**Що робить код:** Async виклик зовнішнього API без AbortController. При unmount компонента під час очікування — `setState` викликається на unmounted компоненті.
**Що задокументовано:** Нічого про cancellation або error boundaries.

---

### UB-32: Concurrent Image Uploads — Race Condition

**File:** `packages/excalidraw/components/App.tsx:11448–11540`
**Що робить код:** Множинні async image uploads можуть взаємно перезаписувати стан елементів. Немає черги або mutex.
**Що задокументовано:** Нічого.

---

### UB-33: Socket Init Timer Leak

**File:** `excalidraw-app/collab/Collab.tsx:139`
**Код:** `private socketInitializationTimer?: number;`
**Що робить код:** Timer встановлюється під час ініціалізації socket. При network error ініціалізація не завершується — timer може залишитись активним після unmount.
**Що задокументовано:** Нічого.
