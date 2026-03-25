# Domain glossary — Excalidraw

Терміни в контексті **цього** репозиторію. Назви — як у TypeScript.

## Element

- **Визначення**: одна сутність на полотні (фігура, лінія, текст, зображення, фрейм тощо). Зберігається як частина масиву сцени, серіалізується в JSON.
- **Де в коді**: `packages/element/src/types.ts` — union **`ExcalidrawElement`**, базові поля в `_ExcalidrawElementBase`.
- **Не плутати з**: DOM element / React element — у документації React «element» означає вузол VDOM, тут — **data model** сцени.

## ExcalidrawElement

- **Визначення**: конкретний union-тип усіх підтипів елементів редактора (`rectangle`, `arrow`, `text`, …).
- **Де в коді**: `packages/element/src/types.ts`.
- **Не плутати з**: назвою продукту «Excalidraw» — це саме **тип даних**.

## Scene

- **Визначення**: не один клас у коді, а **концепція**: множина **non-deleted** елементів з порядком (`z-index` через масив), плюс метадані перегляду (scroll/zoom) в **`AppState`**.
- **Де в коді**: оновлення сцени — через **`ActionManager`** і рендер у `App` / renderer.
- **Не плутати з**: «scene graph» у 3D-движках — тут 2D canvas і плоский список елементів з можливістю груп.

## AppState

- **Визначення**: об’єкт **UI та редактора**: активний інструмент, виділення, модальні стани, експорт, колаборатори, сітка, тема тощо.
- **Де в коді**: `packages/excalidraw/types.ts` (`interface AppState`), дефолти — `packages/excalidraw/appState.ts`.
- **Не плутати з**: Redux «store» — тут **React + Jotai** та оновлення через **actions**, не обов’язково один глобальний Redux store.

## Tool

- **Визначення**: режим взаємодії користувача з полотном (selection, rectangle, freedraw, …), зберігається в **`appState.activeTool`**.
- **Де в коді**: типи інструмента в `AppState` у `types.ts`.
- **Не плутати з**: «instrument» у трасуванні — у коді саме **tool**.

## Action

- **Визначення**: іменована операція редактора, яка отримує поточний стан і повертає **`ActionResult`** (оновлені `elements` та/або `appState`).
- **Де в коді**: `packages/excalidraw/actions/types.ts`, виконання — `packages/excalidraw/actions/manager.tsx` (**`ActionManager`**).
- **Не плутати з**: GitHub Action або Redux Action — тут доменний **Command**-патерн Excalidraw.

## Collaboration

- **Визначення**: спільни редагування однієї сцени кількома клієнтами; у продуктовому застосунку — синхронізація через мережу (**socket.io-client** та серверна частина поза цим описом).
- **Де в коді**: колаборатори в **`AppState.collaborators`**, логіка в `excalidraw-app` та частинах `packages/excalidraw`.
- **Не плутати з**: Google Docs-style операційна трансформація тексту — у Excalidraw інша модель синхронізації сцени.

## Library

- **Визначення**: користувацькі **набори збережених елементів**, які можна вставляти на полотно.
- **Де в коді**: компоненти `LibraryMenu*` у `packages/excalidraw/components/`.
- **Не плутати з**: npm package — тут **user library** даних.

## Bound element

- **Визначення**: елемент (часто стрілка), **прив’язаний** до іншого елемента (endpoint на межі фігури); при переміщенні опорного елемента — оновлюється геометрія прив’язки.
- **Де в коді**: `startBoundElement`, `suggestedBinding` у **`AppState`**, логіка в `packages/element` (binding) та обробники в `App`.
- **Не плутати з**: database bound — тут **геометрична** прив’язка.

## Linear element

- **Визначення**: полілінія / лінія з кількома точками (у т.ч. стрілки).
- **Де в коді**: `ExcalidrawLinearElement` у `packages/element/src/types.ts`.
- **Не плутати з**: «linear» як лінійна алгебра в `packages/math` — там інший шар абстракції.
