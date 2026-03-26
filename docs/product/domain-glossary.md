# Domain Glossary

Цей словник фіксує значення ключових термінів Excalidraw саме в контексті цього репозиторію.

## Element

- **Name (in code):** `Element` (зазвичай як `ExcalidrawElement` або похідні типи)
- **Definition (project context):** Базова атомарна сутність на полотні (shape, text, line/arrow, image, frame тощо), яка має координати, стилі, версіонування і може бути видаленою логічно (`isDeleted`).
- **Used in (key files):** `packages/element/src/types.ts`, `packages/element/src/Scene.ts`, `packages/excalidraw/types.ts`
- **Do not confuse with:** Загальне "DOM element" у вебі. Тут `Element` означає модель графічного об'єкта Excalidraw, а не HTML-вузол.

## Scene

- **Name (in code):** `Scene`
- **Definition (project context):** Контейнер та менеджер колекції елементів редактора; відповідає за зберігання елементів (включно з видаленими), індексацію, вибірки selected/non-deleted та тригер оновлень рендеру.
- **Used in (key files):** `packages/element/src/Scene.ts`, `packages/excalidraw/types.ts`, `packages/excalidraw/scene/types.ts`
- **Do not confuse with:** "Сцена" як лише візуальний кадр/екран. У цьому проєкті це stateful структура даних і API для елементів.

## AppState

- **Name (in code):** `AppState`
- **Definition (project context):** Повний UI/application state редактора: активний інструмент, selection, viewport (zoom/scroll), режими, діалоги, collaborator-дані, налаштування експорту тощо.
- **Used in (key files):** `packages/excalidraw/types.ts`, `packages/excalidraw/appState.ts`, `packages/excalidraw/components/App.tsx`
- **Do not confuse with:** Загальний global app state у React/Redux додатку. Тут це конкретний контракт стану Excalidraw-редактора.

## ExcalidrawElement

- **Name (in code):** `ExcalidrawElement`
- **Definition (project context):** Union-тип усіх підтриманих типів елементів Excalidraw (rectangle, text, arrow, image, frame, embeddable тощо), придатний до серіалізації та синхронізації.
- **Used in (key files):** `packages/element/src/types.ts`, `packages/excalidraw/types.ts`, `packages/excalidraw/data/reconcile.ts`
- **Do not confuse with:** Конкретний клас-об'єкт одного типу елемента. Це узагальнений тип-об'єднання.

## Tool

- **Name (in code):** `ToolType`, `ActiveTool`
- **Definition (project context):** Режим взаємодії користувача з canvas (selection, rectangle, arrow, text, hand, eraser, laser тощо) та його поточний стан (locked, lastActiveTool, fromSelection).
- **Used in (key files):** `packages/excalidraw/types.ts`, `packages/excalidraw/appState.ts`, `packages/excalidraw/components/MobileToolBar.tsx`
- **Do not confuse with:** "Інструмент" як утиліта розробника/CLI. Тут це editor drawing/interaction mode.

## Action

- **Name (in code):** `Action`, `ActionName`, `ActionManager`
- **Definition (project context):** Формалізована команда редактора (undo, copy, align, addToLibrary, toggle tools тощо) з `perform()`-логікою, predicate/shortcut-правилами і трекінгом джерела виклику.
- **Used in (key files):** `packages/excalidraw/actions/types.ts`, `packages/excalidraw/actions/manager.tsx`, `packages/excalidraw/actions/register.ts`
- **Do not confuse with:** Redux action як plain object. Тут `Action` — об'єкт поведінки з функціями, UI-панелями та клавіатурними умовами.

## Collaboration

- **Name (in code):** `Collab`, `Collaborator`, `isCollaborating`
- **Definition (project context):** Підсистема realtime-спільної роботи: синхронізація scene, курсорів/виділень, idle state, room lifecycle, шифрування payload і робота з backend (socket + firebase).
- **Used in (key files):** `excalidraw-app/collab/Collab.tsx`, `excalidraw-app/collab/Portal.tsx`, `packages/excalidraw/types.ts`
- **Do not confuse with:** Будь-яка "співпраця" на рівні процесів. Тут це конкретний технічний механізм багатокористувацької синхронізації полотна.

## Library

- **Name (in code):** `Library`, `LibraryItem`, `LibraryItems`
- **Definition (project context):** Колекція перевикористовуваних наборів елементів (shapes/snippets), які можна імпортувати, оновлювати, мерджити, публікувати та зберігати через adapter persistence.
- **Used in (key files):** `packages/excalidraw/data/library.ts`, `packages/excalidraw/types.ts`, `packages/excalidraw/components/LibraryMenu.tsx`
- **Do not confuse with:** npm/JS library package. Тут `Library` — це user-facing asset collection усередині редактора.
