# Excalidraw Domain Glossary

Цей словник фіксує значення доменних термінів саме для Excalidraw (core пакети та app shell).

## Element

- **Назва:** `Element` (у коді доменний тип представлений як `ExcalidrawElement`)
- **Визначення:** Узагальнена назва об'єкта на полотні. У проєкті як канонічний тип використовується не `Element`, а `ExcalidrawElement` з `@excalidraw/element`.
- **Де використовується (ключові файли):**
  - `packages/element/src/types.ts`
  - `packages/element/src/Scene.ts`
  - `packages/excalidraw/components/App.tsx`
  - `packages/excalidraw/types.ts`
- **НЕ плутати з:** DOM/React `Element`. У фронтенд-типах `Element` часто означає UI-елемент, а в Excalidraw-домені - елемент сцени (`ExcalidrawElement`).

## Scene

- **Назва:** `Scene`
- **Визначення:** Центральне in-memory сховище елементів полотна (включно з видаленими), індексів/мап, selection-кешів і підписок на оновлення. Це модель документа на canvas, а не React-дерево.
- **Де використовується (ключові файли):**
  - `packages/element/src/Scene.ts`
  - `packages/excalidraw/components/App.tsx`
  - `packages/excalidraw/scene/Renderer.ts`
  - `docs/technical/architecture.md`
- **НЕ плутати з:** "scene" у 3D/game або сторінкою UI. Тут це саме клас-модель стану елементів Excalidraw.

## AppState

- **Назва:** `AppState`
- **Визначення:** Інтерфейс стану редактора: активний інструмент, selection, zoom/scroll, діалоги, режими, collaborator presence та інші UI/interaction дані.
- **Де використовується (ключові файли):**
  - `packages/excalidraw/types.ts`
  - `packages/excalidraw/appState.ts`
  - `packages/excalidraw/components/App.tsx`
  - `packages/excalidraw/actions/types.ts`
- **НЕ плутати з:** "усім станом застосунку". Дані елементів не живуть у `AppState`; вони живуть у `Scene`.

## ExcalidrawElement

- **Назва:** `ExcalidrawElement`
- **Визначення:** Union-тип усіх drawable об'єктів полотна (shape/text/line/arrow/image/frame/embeddable тощо). Елементи мають бути JSON-serializable та придатні до синхронізації між peers.
- **Де використовується (ключові файли):**
  - `packages/element/src/types.ts`
  - `packages/element/src/mutateElement.ts`
  - `packages/element/src/Scene.ts`
  - `packages/excalidraw/data/reconcile.ts`
- **НЕ плутати з:** абстрактним "графічним об'єктом" без контракту. У проєкті це строго типізований набір структур з версіонуванням і полями для merge/reconcile.

## Tool

- **Назва:** `Tool` (типи `ToolType`, `ActiveTool`)
- **Визначення:** Поточний режим взаємодії користувача з полотном (`selection`, `rectangle`, `line`, `text`, `hand`, `eraser`, тощо). Визначає, як інтерпретуються pointer/keyboard події.
- **Де використовується (ключові файли):**
  - `packages/excalidraw/types.ts`
  - `packages/excalidraw/appState.ts`
  - `packages/common/src/utils.ts`
  - `packages/excalidraw/components/App.tsx`
  - `packages/excalidraw/components/shapes.tsx`
- **НЕ плутати з:** `Action`. Tool - це режим (state), тоді як Action - окрема команда/операція.

## Action

- **Назва:** `Action`
- **Визначення:** Типізована команда редактора з `perform(...)`, умовами доступності, shortcut-логікою, опціональною панеллю UI та трекінгом подій.
- **Де використовується (ключові файли):**
  - `packages/excalidraw/actions/types.ts`
  - `packages/excalidraw/actions/manager.tsx`
  - `packages/excalidraw/actions/register.ts`
  - `packages/excalidraw/actions/actionCanvas.tsx`
  - `packages/excalidraw/components/App.tsx`
- **НЕ плутати з:** довільним "кліком у UI". Action - це формалізована командна одиниця, яку можна запускати з різних джерел (UI/keyboard/API/context menu).

## Collaboration

- **Назва:** `Collaboration`
- **Визначення:** Механіка багатокористувацької синхронізації сцени та presence. У core редактора це моделі/рендер collaborator-стану і reconcile; мережевий транспорт та кімнати реалізовані в `excalidraw-app`.
- **Де використовується (ключові файли):**
  - `packages/excalidraw/types.ts`
  - `packages/excalidraw/data/reconcile.ts`
  - `excalidraw-app/collab/Collab.tsx`
  - `excalidraw-app/collab/Portal.tsx`
  - `docs/memory/systemPatterns.md`
- **НЕ плутати з:** "колаборацією" як загальним бізнес-процесом. Тут це конкретний протокол/стани синхронізації елементів і користувачів.

## Library

- **Назва:** `Library`
- **Визначення:** Колекція reusable наборів елементів (library items), що може завантажуватись, зливатись, мігруватись і синхронізуватись через адаптери збереження.
- **Де використовується (ключові файли):**
  - `packages/excalidraw/types.ts`
  - `packages/excalidraw/data/library.ts`
  - `packages/excalidraw/data/restore.ts`
  - `packages/excalidraw/tests/library.test.tsx`
- **НЕ плутати з:** бібліотекою коду/npm package. У цьому контексті це бібліотека графічних шаблонів (елементів сцени).

## Linear Element

- **Назва:** `ExcalidrawLinearElement`
- **Визначення:** Спеціалізований тип елемента для лінійних фігур (line/arrow), який зберігає `points` і редагується через окрему логіку multi-point editing.
- **Де використовується (ключові файли):**
  - `packages/element/src/types.ts`
  - `packages/element/src/linearElementEditor.ts`
  - `packages/element/src/utils.ts`
  - `packages/excalidraw/lasso/index.ts`
- **НЕ плутати з:** будь-яким "line shape" у загальному UI-сенсі. У проєкті це окремий структурований тип з власним редактором і правилами редагування.

## Bound Element

- **Назва:** `ExcalidrawBindableElement`
- **Визначення:** Тип елемента, до якого можуть прив'язуватися інші сутності (наприклад, стрілки або bound text); використовується в binding-логіці та стані редагування (`startBoundElement`, `suggestedBinding`).
- **Де використовується (ключові файли):**
  - `packages/element/src/types.ts`
  - `packages/excalidraw/actions/actionBoundText.tsx`
  - `packages/excalidraw/actions/actionToggleArrowBinding.tsx`
  - `packages/excalidraw/actions/actionProperties.tsx`
- **НЕ плутати з:** звичайним "зв'язком" між об'єктами без типізації. Тут це конкретний тип і набір правил прив'язки у редакторі Excalidraw.

## ActiveTool

- **Назва:** `ActiveTool`
- **Визначення:** Поточно активний інструмент, включно з `custom`-інструментами та метаданими в `AppState.activeTool` (`locked`, `fromSelection`, `lastActiveTool`).
- **Де використовується (ключові файли):**
  - `packages/excalidraw/types.ts`
  - `packages/excalidraw/appState.ts`
  - `packages/common/src/utils.ts`
  - `packages/excalidraw/components/App.tsx`
- **НЕ плутати з:** переліком доступних tools у UI. `ActiveTool` - це фактичний поточний стан, а не каталог інструментів.

## ActionResult

- **Назва:** `ActionResult`
- **Визначення:** Контракт результату виконання `Action`: які `elements`, `appState`, `files` змінюються і як capture-ити update для history/store.
- **Де використовується (ключові файли):**
  - `packages/excalidraw/actions/types.ts`
  - `packages/excalidraw/actions/manager.tsx`
  - `packages/excalidraw/components/App.tsx`
  - `packages/excalidraw/history.ts`
- **НЕ плутати з:** "будь-яким результатом функції". Це специфічний протокол інтеграції action-системи зі сценою, store та undo/redo.

## Collaborator

- **Назва:** `Collaborator`
- **Визначення:** Модель віддаленого учасника (pointer, selected ids, username, колір, voice/call-флаги тощо), що рендериться в UI колаборації.
- **Де використовується (ключові файли):**
  - `packages/excalidraw/types.ts`
  - `packages/excalidraw/appState.ts`
  - `packages/excalidraw/clients.ts`
  - `excalidraw-app/collab/Collab.tsx`
- **НЕ плутати з:** обліковим записом користувача в системі. Це runtime-представлення peer-а в конкретній сесії.

## LibraryItem

- **Назва:** `LibraryItem`
- **Визначення:** Одиниця бібліотеки (`id`, `status`, `elements`, `created`, optional `name`) - один reusable фрагмент сцени.
- **Де використовується (ключові файли):**
  - `packages/excalidraw/types.ts`
  - `packages/excalidraw/data/library.ts`
  - `packages/excalidraw/data/types.ts`
  - `packages/excalidraw/tests/library.test.tsx`
- **НЕ плутати з:** окремим `ExcalidrawElement`. `LibraryItem` зазвичай містить набір елементів і метадані бібліотеки.

## BinaryFiles

- **Назва:** `BinaryFiles`
- **Визначення:** Мапа бінарних ресурсів (переважно image data) для елементів сцени, що зберігається окремо від масиву `ExcalidrawElement`.
- **Де використовується (ключові файли):**
  - `packages/excalidraw/types.ts`
  - `packages/excalidraw/actions/types.ts`
  - `packages/excalidraw/components/App.tsx`
  - `excalidraw-app/data/FileManager.ts`
- **НЕ плутати з:** вкладеннями "всередині" елементів. Елементи містять посилання/ідентифікатори, а бінарні дані живуть у окремому шарі.

## ElementOrToolType

- **Назва:** `ElementOrToolType`
- **Визначення:** Union-тип, який об'єднує element `type` і `ToolType` (плюс `custom`) для тих місць, де UI або логіка працює з обома категоріями.
- **Де використовується (ключові файли):**
  - `packages/excalidraw/types.ts`
  - `packages/element/src/comparisons.ts`
  - `packages/element/src/typeChecks.ts`
- **НЕ плутати з:** `ActionName`. Це не команда, а тип-ідентифікатор інструмента або типу елемента.
