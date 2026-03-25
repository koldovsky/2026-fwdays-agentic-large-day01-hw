# Excalidraw — Undocumented Behaviors

## Overview

> Ця документація описує приховані поведінки, implicit state machines, side effects та workarounds у кодовій базі Excalidraw. Мета — попередити AI-агентів та розробників від "оптимізацій", які можуть зламати неочевидні залежності.

## Класифікація серйозності

| Рівень | Опис |
|--------|------|
| `bug` | Реальний баг або performance-проблема, потребує issue-тікету з code review |
| `workaround` | Навмисний обхід, працює коректно в поточних умовах |
| `tech-debt` | Технічний борг, не впливає на користувача зараз |
| `naming` | Неточне іменування, може ввести в оману при розробці |

---

## Undocumented Behavior #1

- **Файл**: `packages/excalidraw/components/App.tsx:689-693`
- **Серйозність**: `workaround`
- **Що відбувається**: `lastPointerUpIsDoubleClick` — це хак для обходу нативного browser doubleClick. Система використовує суміш нативних browser click events для desktop та ручної обробки для touch. Браузерний doubleClick працює некоректно з touch events, тому реалізація змішує два підходи.
- **Де задокументовано**: тільки коментар `// TODO this is a hack and we should ideally unify touch and pointer events`
- **Ризик**: AI може спробувати уніфікувати touch/pointer events або замінити на стандартний `dblclick` listener — зламає double-click на мобільних пристроях.

## Undocumented Behavior #2

- **Файл**: `packages/element/src/selection.ts:138-172`
- **Серйозність**: `tech-debt`
- **Що відбувається**: Функція `isSomeElementSelected` — це IIFE з closure-based кешем (`lastElements`, `lastSelectedElementIds`, `isSelected`). Це stateful utility на рівні модуля, а не чистий метод. Кеш спільний для всіх викликів у process.
- **Де задокументовано**: тільки коментар `// FIXME move this into the editor instance to keep utility methods stateless`
- **Ризик**: AI може створити другий екземпляр редактора або спробувати зробити функцію чистою — кеш стане спільним між інстансами або зникне, що спричинить performance деградацію на великих сценах.

## Undocumented Behavior #3

- **Файл**: `packages/common/src/colors.ts:116`
- **Серйозність**: `tech-debt`
- **Що відбувається**: Функція `pick()` дублюється в `colors.ts` замість імпорту з `utils.ts` через циркулярну залежність між модулями пакету `@excalidraw/common`.
- **Де задокументовано**: тільки коментар `// FIXME can't put to utils.ts rn because of circular dependency`
- **Ризик**: AI може спробувати "DRY рефакторинг" і перемістити `pick()` в utils.ts — зламає import resolution через circular dependency.

## Undocumented Behavior #4

- **Файл**: `packages/element/src/store.ts:109-110`
- **Серйозність**: `tech-debt`
- **Що відбувається**: `Store.scheduleCapture()` викликається з 17 місць у кодовій базі (16 у `App.tsx`, 1 у `linearElementEditor.ts`). Метод планує обчислення дельти для undo stack. Множинні точки виклику створюють implicit state machine, де порядок `schedule → commit → flush` є критичним для коректної роботи undo/redo. Метод `commit()` спочатку виконує micro actions, потім один macro action, потім скидає scheduled actions.
- **Де задокументовано**: тільки коментар `// TODO: Suspicious that this is called so many places. Seems error-prone.`
- **Ризик**: AI може спробувати консолідувати виклики або видалити "зайві" — зламає undo/redo для конкретних user flows (наприклад, multi-step element creation).

## Undocumented Behavior #5

- **Файл**: `packages/element/src/sizeHelpers.ts:27-28`, `packages/excalidraw/actions/actionFinalize.tsx:142`
- **Серйозність**: `bug`
- **Що відбувається**: Елементи менші за `INVISIBLY_SMALL_ELEMENT_SIZE` (0.1px) позначаються як `isDeleted: true`, але все ще записуються в Store. Це означає, що невидимі елементи можуть бути відновлені через undo/redo, а також exported, broadcasted та persisted.
- **Де задокументовано**: тільки коментар `// TODO: remove invisible elements consistently` та `// TODO: #7348 in theory this gets recorded by the store`
- **Ризик**: AI може додати фільтрацію invisible elements при збереженні в Store — зламає undo/redo consistency, бо undo очікує наявність цих елементів у history.

## Undocumented Behavior #6

- **Файл**: `packages/excalidraw/components/App.tsx:7126-7132`
- **Серйозність**: `workaround`
- **Що відбувається**: Transform handles (resize/rotate) навмисно вимкнені для linear elements на мобільних пристроях та для лінійних елементів з двома точками. Це тимчасовий workaround через відсутність кращого UX рішення.
- **Де задокументовано**: тільки коментар `// HACK: Disable transform handles for linear elements on mobile until a better way of showing them is found`
- **Ризик**: AI може "виправити" це як баг і увімкнути handles — зламає UX на мобільних, де handles перекриваються з самим елементом і стають невикористовуваними.

## Undocumented Behavior #7

- **Файл**: `packages/excalidraw/wysiwyg/textWysiwyg.tsx:964-968`
- **Серйозність**: `workaround`
- **Що відбувається**: Text WYSIWYG editor підписується на `app.onChangeEmitter` щоб відловити зміну теми (dark/light) та оновити стилі текстового редактора. Це обхідний шлях, тому що `Store` ще не емітить зміни `appState.theme`.
- **Де задокументовано**: тільки коментар `// FIXME after we start emitting updates from Store for appState.theme`
- **Ризик**: AI може перенести підписку на Store events або видалити як "дублювання" — WYSIWYG editor перестане реагувати на зміну теми в реальному часі.

## Undocumented Behavior #8

- **Файл**: `packages/excalidraw/components/App.tsx:5737-5749`
- **Серйозність**: `workaround`
- **Що відбувається**: При keyboard-submit тексту використовується React `flushSync()` для примусового синхронного оновлення `selectedElementIds` перед викликом finalize action. Без цього selection state буде stale, бо React batching відкладає setState.
- **Де задокументовано**: тільки коментар `// TODO either move this into finalize as well, or handle all state updates in one place, skipping finalize action`
- **Ризик**: AI може видалити `flushSync` як "антипатерн React 19" — selection state буде stale під час finalize, елемент не буде обраний після створення тексту з клавіатури.

## Undocumented Behavior #9

- **Файл**: `packages/excalidraw/components/App.tsx:12347-12350`
- **Серйозність**: `naming`
- **Що відбувається**: State field `isResizing` насправді означає "isScaling" (зміна розміру), а не загальне "resizing" яке включає і обертання. Паралельно існує `isRotating` для обертання. Семантика назв не відповідає реальному значенню.
- **Де задокументовано**: тільки коментар `// TODO: rename this state field to "isScaling" to distinguish it from the generic "isResizing" which includes scaling and rotating`
- **Ризик**: AI може використати `isResizing` для умовної логіки, вважаючи що це включає обертання — отримає неправильну поведінку при rotate transform.

## Undocumented Behavior #10

- **Файл**: `packages/excalidraw/tests/selection.test.tsx:250, 273`
- **Серйозність**: `bug`
- **Що відбувається**: Selection flow утримує ресурси (event listeners, internal state) між pointer down та pointer up. Якщо pointer up не відбувається, ці ресурси не звільняються, спричиняючи memory leak.
- **Де задокументовано**: тільки коментар `// TODO: There is a memory leak if pointer up is not triggered`
- **Ризик**: AI може рефакторити event handling і забути забезпечити trigger pointer up в усіх code paths — спричинить memory leak, який накопичується з кожною interaction.

## Undocumented Behavior #11

- **Файл**: `packages/element/src/delta.ts:721-726`
- **Серйозність**: `bug`
- **Що відбувається**: History delta filtering (`filterInvisibleChanges()`) припускає, що previous appState не містить references до deleted elements. Функція має defensive filtering для `selectedElementIds`, `selectedGroupIds`, `croppingElementId`, `editingGroupId`, `selectedLinearElement` — але ця очистка відбувається лише під час history operations, а не під час remote updates. Через це можуть виникати "порожні" undo/redo кроки, де користувач натискає Ctrl+Z і нічого не відбувається.
- **Де задокументовано**: тільки коментар `// TODO: #7348 we could still get an empty undo/redo, as we assume that previous appstate does not contain references to deleted elements`
- **Ризик**: AI може оптимізувати undo/redo filtering не знаючи про цю hidden assumption — посилить проблему empty undo steps або зламає remote collaboration sync.
