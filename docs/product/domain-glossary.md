# Domain Glossary

## Details

### Technical Details
For system architecture, components and data flow:
→ docs/technical/architecture.md

Use when:
- modifying system structure
- adding new services
- understanding dependencies

---

### Product Context
For domain concepts and business terminology:
→ docs/product/domain-glossary.md

Use when:
- working with business logic
- naming entities
- understanding domain rules

## Element

- Назва: `Element` (доменний термін), у типах коду це переважно `ExcalidrawElement`.
- Визначення в проєкті: базова сутність на полотні (shape/text/line/image/frame тощо), яка має геометрію, стилі, версію, порядок (`index`) і життєвий стан (`isDeleted`).
- Де використовується (ключові файли):
  - `packages/element/src/types.ts`
  - `packages/element/src/Scene.ts`
  - `packages/excalidraw/components/App.tsx`
- НЕ плутати з: DOM `Element` у браузері. Тут `Element` означає об'єкт діаграми, а не HTML-вузол.

## ExcalidrawElement

- Назва: `ExcalidrawElement`.
- Визначення в проєкті: union-тип всіх підтримуваних елементів редактора (`rectangle`, `text`, `arrow`, `image`, `frame`, `magicframe`, `embeddable` тощо), що серіалізуються і синхронізуються між клієнтами.
- Де використовується (ключові файли):
  - `packages/element/src/types.ts`
  - `packages/excalidraw/types.ts`
  - `excalidraw-app/data/index.ts`
- НЕ плутати з: окремими підтипами (`ExcalidrawTextElement`, `ExcalidrawLinearElement`) або з тимчасовими UI-структурами.

## Scene

- Назва: `Scene`.
- Визначення в проєкті: контейнер поточного набору елементів редактора (включно з deleted), індексів і кешів вибірки; надає API для заміни, вставки, мутації елементів та тригерить `onUpdate` для рендеру.
- Де використовується (ключові файли):
  - `packages/element/src/Scene.ts`
  - `packages/excalidraw/components/App.tsx`
  - `packages/excalidraw/scene/Renderer.ts`
- НЕ плутати з: “сценою” як фінальним експортом картинки. Тут це runtime-модель стану елементів.

## AppState

- Назва: `AppState`.
- Визначення в проєкті: головний стан UI та взаємодії редактора (activeTool, selection, zoom/scroll, dialogs, collaborators, snapping, cropping тощо), який живе в `App` і частково чиститься перед export/storage.
- Де використовується (ключові файли):
  - `packages/excalidraw/types.ts`
  - `packages/excalidraw/appState.ts`
  - `packages/excalidraw/components/App.tsx`
- НЕ плутати з: станом самої сцени елементів (`Scene`) або глобальним станом shell-додатку `excalidraw-app`.

## Tool / ToolType / ActiveTool

- Назва: `ToolType`, `ActiveTool`.
- Визначення в проєкті: інструмент редактора, яким користувач зараз працює (`selection`, `rectangle`, `text`, `hand`, `eraser`, `laser` тощо). `ActiveTool` додатково містить runtime-поля (`locked`, `lastActiveTool`, `fromSelection`).
- Де використовується (ключові файли):
  - `packages/excalidraw/types.ts`
  - `packages/excalidraw/appState.ts`
  - `packages/excalidraw/actions/actionCanvas.tsx`
- НЕ плутати з: UI-кнопкою тулбара. Кнопка лише перемикає `activeTool`, але не є самим доменним станом інструмента.

## Action

- Назва: `Action`.
- Визначення в проєкті: формалізована команда редактора (через UI, hotkey, API, context menu), яка виконує `perform(...)` і повертає `ActionResult`.
- Де використовується (ключові файли):
  - `packages/excalidraw/actions/types.ts`
  - `packages/excalidraw/actions/manager.tsx`
  - `packages/excalidraw/actions/index.ts`
- НЕ плутати з: довільним event handler у React. `Action` має стандартний контракт, трекінг та інтеграцію в undo/redo capture.

## ActionManager

- Назва: `ActionManager`.
- Визначення в проєкті: реєстр і виконавець `Action`-ів; обробляє клавіатурні шорткати, рендерить action-panels і передає результати в updater (`syncActionResult` в `App`).
- Де використовується (ключові файли):
  - `packages/excalidraw/actions/manager.tsx`
  - `packages/excalidraw/components/App.tsx`
  - `packages/excalidraw/components/LayerUI.tsx`
- НЕ плутати з: Redux/command bus загального призначення. Це вузький менеджер команд саме для редактора Excalidraw.

## ActionResult

- Назва: `ActionResult`.
- Визначення в проєкті: результат виконання `Action` з частковими оновленнями `elements`, `appState`, `files` та обов'язковим `captureUpdate` для контролю історії/інкрементів.
- Де використовується (ключові файли):
  - `packages/excalidraw/actions/types.ts`
  - `packages/excalidraw/actions/manager.tsx`
  - `packages/excalidraw/components/App.tsx`
- НЕ плутати з: HTTP response або загальним “result object”. Це внутрішній протокол між `ActionManager` та `App`.

## Collaboration

- Назва: `Collab`, `CollabAPI`, `isCollaborationLink`.
- Визначення в проєкті: підсистема live-співпраці для спільної сесії (room link з ключем, обмін елементами/курсором, синхронізація через websocket + Firebase).
- Де використовується (ключові файли):
  - `excalidraw-app/collab/Collab.tsx`
  - `excalidraw-app/collab/Portal.tsx`
  - `excalidraw-app/data/index.ts`
- НЕ плутати з: share-link для одноразового перегляду/імпорту. Collaboration тут означає живу синхронну сесію.

## Library

- Назва: `Library`.
- Визначення в проєкті: менеджер бібліотеки reusable-елементів/наборів фігур, з підтримкою імпорту, merge, persistence adapter, міграції і подій оновлення.
- Де використовується (ключові файли):
  - `packages/excalidraw/data/library.ts`
  - `packages/excalidraw/types.ts`
  - `packages/excalidraw/components/LibraryMenu.tsx`
- НЕ плутати з: npm library/package. Тут `Library` це користувацька колекція готових графічних об'єктів.

## LibraryItem

- Назва: `LibraryItem`.
- Визначення в проєкті: одиниця бібліотеки з `id`, `status`, списком `elements`, `created` і метаданими (`name`, `error`), яка зберігається та публікується незалежно від поточної сцени.
- Де використовується (ключові файли):
  - `packages/excalidraw/types.ts`
  - `packages/excalidraw/data/library.ts`
  - `packages/excalidraw/components/PublishLibrary.tsx`
- НЕ плутати з: одним `ExcalidrawElement`. `LibraryItem` містить масив елементів (міні-композицію), а не одну фігуру.


