# Domain glossary

Короткий словник термінів, які мають спеціальне значення саме в цій кодовій базі Excalidraw.

## Element
- **Назва:** `Element`
- **Визначення:** У коді це звичайно будь-який об'єкт сцени на полотні: фігура, текст, стрілка, зображення, frame тощо. Це розмовний umbrella-term; зазвичай конкретний тип задається через `ExcalidrawElement` або його підтипи.
- **Де використовується:** `packages/element/src/types.ts`, `packages/element/src/Scene.ts`, `packages/excalidraw/components/App.tsx`
- **НЕ плутати з:** DOM element / React element. У цьому проєкті `element` майже завжди означає об'єкт малюнка, а не HTML-вузол.

## ExcalidrawElement
- **Назва:** `ExcalidrawElement`
- **Визначення:** Канонічний union-тип серіалізованих елементів сцени. Має бути JSON-serializable і не містити peer-local/computed state. Саме цей тип синхронізується, експортується та зберігається.
- **Де використовується:** `packages/element/src/types.ts`, `packages/element/src/Scene.ts`, `packages/excalidraw/types.ts`
- **НЕ плутати з:** загальним `element` як неформальним словом; також не плутати з тимчасовими runtime-полями на кшталт `selectionElement` чи `newElement` з `AppState`.

## Scene
- **Назва:** `Scene`
- **Визначення:** Переважно це runtime-контейнер редактора (`class Scene`), який володіє впорядкованим списком елементів, мапами, кешами виділення та update callbacks. У ширшому сенсі словом “scene” також називають поточний документ на полотні.
- **Де використовується:** `packages/element/src/Scene.ts`, `packages/excalidraw/components/App.tsx`, `packages/excalidraw/types.ts`
- **НЕ плутати з:** просто «екраном» або лише видимою картинкою на canvas. У проєкті `Scene` — це передусім модель/контейнер даних редактора.

## SceneData
- **Назва:** `SceneData`
- **Визначення:** Partial payload для imperative-оновлення сцени через API (`updateScene`). Може містити `elements`, `appState`, `collaborators` і `captureUpdate`, але не є повним runtime-об'єктом `Scene`.
- **Де використовується:** `packages/excalidraw/types.ts`, `excalidraw-app/collab/Collab.tsx`, `docs/technical/architecture.md`
- **НЕ плутати з:** `Scene` як класом-контейнером або з повним форматом файлу експорту (`ExportedDataState`).

## AppState
- **Назва:** `AppState`
- **Визначення:** UI/editor state редактора: активний tool, viewport, selection, режими редагування, export flags, collab-related state, sidebar/dialog state тощо. Це не самі елементи сцени, а стан оболонки та взаємодії з ними.
- **Де використовується:** `packages/excalidraw/types.ts`, `packages/excalidraw/appState.ts`, `packages/excalidraw/data/types.ts`
- **НЕ плутати з:** повним документом Excalidraw. Документ = елементи + файли + частина `AppState`; сам `AppState` не описує весь малюнок.

## Tool
- **Назва:** `ToolType` / `activeTool`
- **Визначення:** Режим роботи редактора: `selection`, `lasso`, `rectangle`, `arrow`, `text`, `frame`, `embeddable`, `laser` тощо. Tool визначає, як редактор інтерпретує pointer/keyboard input у поточний момент.
- **Де використовується:** `packages/excalidraw/types.ts`, `packages/excalidraw/appState.ts`, `packages/excalidraw/components/MobileToolBar.tsx`
- **НЕ плутати з:** `Action`. Tool — це тривалий mode, а не одноразова команда.

## Action
- **Назва:** `Action`
- **Визначення:** Зареєстрована команда редактора з `name`, `perform`, optional shortcut/predicate/UI panel. Action може запускатися з toolbar, меню, клавіатури, context menu або API і повертає `ActionResult`.
- **Де використовується:** `packages/excalidraw/actions/types.ts`, `packages/excalidraw/actions/register.ts`, `packages/excalidraw/actions/manager.tsx`
- **НЕ плутати з:** tool або довільним event handler. У цьому проєкті `Action` — формалізована команда, яку диспетчеризує `ActionManager`.

## ActionManager
- **Назва:** `ActionManager`
- **Визначення:** Runtime-диспетчер actions усередині editor core. Реєструє всі `Action`, маршрутизує keyboard/UI/API виклики, трекає analytics і передає `ActionResult` назад у `App` для синхронізації стану.
- **Де використовується:** `packages/excalidraw/actions/manager.tsx`, `packages/excalidraw/components/App.tsx`, `packages/excalidraw/actions/register.ts`
- **НЕ плутати з:** Redux-like store або generic command bus. Тут це конкретний механізм виконання editor actions Excalidraw.

## Collaboration
- **Назва:** `Collab` / collaboration
- **Визначення:** Окремий hosted-app layer для real-time спільної роботи: room lifecycle, socket transport, encrypted payloads, scene reconciliation, Firebase persistence та image/file sync. Це надбудова над core editor runtime.
- **Де використовується:** `excalidraw-app/collab/Collab.tsx`, `excalidraw-app/collab/Portal.tsx`, `docs/technical/architecture.md`
- **НЕ плутати з:** просто share/export функціями або лише списком користувачів. Collaboration тут включає transport, reconciliation і room persistence.

## Portal
- **Назва:** `Portal`
- **Визначення:** Нижчий transport-layer collaboration subsystem. Керує socket connection, join-room lifecycle, encrypted broadcast payloads і відправкою scene/file updates між учасниками кімнати.
- **Де використовується:** `excalidraw-app/collab/Portal.tsx`, `excalidraw-app/collab/Collab.tsx`, `docs/technical/architecture.md`
- **НЕ плутати з:** React Portal. У цій кодовій базі `Portal` — це collab networking abstraction, а не UI-механізм рендеру поза DOM tree.

## Collaborator
- **Назва:** `Collaborator`
- **Визначення:** Session-level проєкція одного remote/local participant у collab room: pointer, button state, selected elements, username, avatar, idle/call flags, `socketId`, `isCurrentUser`.
- **Де використовується:** `packages/excalidraw/types.ts`, `excalidraw-app/collab/Collab.tsx`, `packages/excalidraw/components/UserList.tsx`
- **НЕ плутати з:** акаунтом користувача або записом у БД. Тут це ephemeral presence/state object для поточної collaborative session.

## Library
- **Назва:** `Library`
- **Визначення:** Підсистема редактора для колекції reusable шаблонів/стікерів з кількох елементів. Вона керує current library items, merge/update/reset flows, listeners та інтеграцією з library UI.
- **Де використовується:** `packages/excalidraw/data/library.ts`, `packages/excalidraw/components/LibraryMenu.tsx`, `packages/excalidraw/components/App.tsx`
- **НЕ плутати з:** програмною бібліотекою npm/yarn. Тут `Library` — внутрішня колекція reusable drawing assets користувача.

## LibraryItem
- **Назва:** `LibraryItem`
- **Визначення:** Одна одиниця бібліотеки: `id`, `status`, `created`, optional `name`/`error` та масив `elements`. Один `LibraryItem` може складатися з кількох елементів і вставляється як єдиний reusable block.
- **Де використовується:** `packages/excalidraw/types.ts`, `packages/excalidraw/data/library.ts`, `packages/excalidraw/actions/actionAddToLibrary.ts`
- **НЕ плутати з:** одним `ExcalidrawElement` або цілою сценою. Library item — це reusable snippet, часто з кількох елементів.

## ImportedDataState
- **Назва:** `ImportedDataState`
- **Визначення:** М'який формат вхідних даних сцени для import/restore/initial data flows. Дозволяє partial `elements`, partial `appState`, `files`, `libraryItems` і службові поля на кшталт `scrollToContent`.
- **Де використовується:** `packages/excalidraw/data/types.ts`, `packages/excalidraw/types.ts`, `excalidraw-app/collab/Collab.tsx`
- **НЕ плутати з:** повним форматом експортованого файла (`ExportedDataState`) або runtime `Scene`. Це саме tolerant input payload для завантаження/відновлення.

