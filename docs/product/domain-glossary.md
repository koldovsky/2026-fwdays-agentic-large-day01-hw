# Domain Glossary

Словник термінів Excalidraw у контексті цього репозиторію.

## Element

- **Назва в коді:** `ExcalidrawElement`
- **Визначення в проєкті:** атомарна сутність на полотні (shape, text, arrow, image, frame тощо), яка є серіалізованою, версіонованою та синхронізованою одиницею стану.
- **Де використовується (ключові файли):**
  - `packages/element/src/types.ts`
  - `packages/element/src/Scene.ts`
  - `packages/excalidraw/data/reconcile.ts`
- **НЕ плутати з:** загальним DOM `Element` у браузері; тут це не HTML-вузол, а модель графічного об'єкта редактора.

## Scene

- **Назва в коді:** `Scene`
- **Визначення в проєкті:** центральний контейнер елементів редактора, який зберігає масив/мапи елементів (включно з видаленими), індекси порядку, кеші вибірки та тригерить оновлення рендера через `sceneNonce`.
- **Де використовується (ключові файли):**
  - `packages/element/src/Scene.ts`
  - `packages/excalidraw/components/App.tsx`
  - `packages/excalidraw/scene/Renderer.ts`
- **НЕ плутати з:** "сценою" як візуальним кадром у графічних рушіях; тут це, перш за все, структура даних і операції над нею.

## AppState

- **Назва в коді:** `AppState`
- **Визначення в проєкті:** повний UI/runtime-стан редактора (активний інструмент, селекція, viewport, режими, діалоги, колаборатори, стан кадрування тощо), який живе поряд із `Scene` та частково серіалізується для browser/export/server.
- **Де використовується (ключові файли):**
  - `packages/excalidraw/types.ts`
  - `packages/excalidraw/appState.ts`
  - `packages/excalidraw/components/App.tsx`
- **НЕ плутати з:** глобальним application state всього продукту; це стан саме інстансу редактора Excalidraw.

## ExcalidrawElement

- **Назва в коді:** `ExcalidrawElement`
- **Визначення в проєкті:** union-тип усіх підтриманих типів елементів Excalidraw (`rectangle`, `diamond`, `ellipse`, `text`, `line`, `arrow`, `freedraw`, `image`, `frame`, `magicframe`, `iframe`, `embeddable`) із контрактом для колаборації, збереження та рендеру.
- **Де використовується (ключові файли):**
  - `packages/element/src/types.ts`
  - `packages/element/src/renderElement.ts`
  - `packages/excalidraw/types.ts`
- **НЕ плутати з:** "будь-яким елементом"; у проєкті це строго типізована доменна модель з обов'язковими полями версії/порядку/стану видалення.

## Tool

- **Назва в коді:** `ToolType` / `activeTool`
- **Визначення в проєкті:** вибраний користувачем режим взаємодії з полотном (selection, lasso, rectangle, arrow, text, eraser, hand тощо), який визначає поведінку pointer/keyboard подій та створення/редагування елементів.
- **Де використовується (ключові файли):**
  - `packages/excalidraw/types.ts`
  - `packages/excalidraw/appState.ts`
  - `packages/excalidraw/components/App.tsx`
- **НЕ плутати з:** dev/tooling (CLI, build tools); тут "tool" означає інструмент редактора в UI.

## Action

- **Назва в коді:** `Action` / `ActionManager`
- **Визначення в проєкті:** формалізована операція редактора з контрактом `perform(...) => ActionResult` (sync/async), яка запускається з UI/keyboard/API та повертає зміни `elements/appState/files` разом із політикою `captureUpdate`.
- **Де використовується (ключові файли):**
  - `packages/excalidraw/actions/types.ts`
  - `packages/excalidraw/actions/manager.tsx`
  - `packages/excalidraw/actions/register.ts`
- **НЕ плутати з:** Redux action як "лише payload". Тут це виконувана команда з логікою, предикатами, hotkeys і telemetry.

## Collaboration

- **Назва в коді:** `Collab` / `Portal`
- **Визначення в проєкті:** підсистема реального часу для спільного редагування: room lifecycle, шифрування socket payload, reconcile віддалених елементів, sync курсорів/idle-стану, а також збереження сцени й файлів у Firebase.
- **Де використовується (ключові файли):**
  - `excalidraw-app/collab/Collab.tsx`
  - `excalidraw-app/collab/Portal.tsx`
  - `excalidraw-app/data/firebase.ts`
- **НЕ плутати з:** простим "sharing link". У проєкті це повний двосторонній протокол синхронізації стану і файлів.

## Library

- **Назва в коді:** `Library`, `LibraryItem`, `LibraryItems`
- **Визначення в проєкті:** каталог перевикористовуваних наборів елементів (shape bundles) зі статусом публікації, merge/update логікою, імпортом із URL/Blob і persistence adapter-інтеграцією.
- **Де використовується (ключові файли):**
  - `packages/excalidraw/data/library.ts`
  - `packages/excalidraw/types.ts`
  - `packages/excalidraw/components/LibraryMenu.tsx`
- **НЕ плутати з:** npm library/package. Тут це користувацька бібліотека графічних шаблонів усередині редактора.
