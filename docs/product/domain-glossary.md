# Domain glossary — Excalidraw

Словник термінів предметної області редактора. Назви збігаються з кодом або загальноприйнятими назвами в репозиторії.

**Пов’язано:** [PRD](./PRD.md), [Архітектура](../technical/architecture.md), [systemPatterns](../memory/systemPatterns.md), [decisionLog](../memory/decisionLog.md) (приклади «код vs документація»).

---

## Element

- **Що це:** Мінімальна одиниця контенту на дошці: прямокутник, еліпс, стрілка, текст, фрейм тощо. У коді це об’єкт з полями `id`, `type`, геометрією, стилями та метаданими версіонування.
- **Де в коді:** Базові властивості та дискриміновані типи — `packages/element/src/types.ts` (`ExcalidrawElement` та підтипи).
- **Не плутати з:** DOM-елементом HTML — тут мова про **дані сцени**, а не про `HTMLElement`.

---

## ExcalidrawElement

- **Що це:** Об’єднаний тип усіх можливих елементів сцени (union). Будь-яка операція «над фігурою» на рівні типів приймає або звужує `ExcalidrawElement`.
- **Де в коді:** `packages/element/src/types.ts` (експорт типів сцени).
- **Не плутати з:** Компонентом React `<Excalidraw />` — це тип **даних**, не React-компонент.

---

## Scene (сцена)

- **Що це:** У контексті Excalidraw — **сукупність елементів** у певному порядку плюс логіка видимості, scroll і zoom, яка визначає, що малюється на canvas. Окремого класу `Scene` у `packages/excalidraw/scene/` може не бути; модуль `scene/` містить нормалізацію zoom, скрол, експорт і **типи конфігів рендеру** (`scene/types.ts`).
- **Де в коді:** Операції над наборами елементів — `@excalidraw/element` (реекспорт у `packages/excalidraw/scene/index.ts`); рендер — `renderer/staticScene.ts`, `renderer/interactiveScene.ts`.
- **Не плутати з:** «Сценою» в Three.js/WebGL — тут 2D canvas і векторна модель.

---

## AppState

- **Що це:** Об’єкт стану **інтерфейсу редактора**: активний інструмент, zoom, scroll, виділення, відкриті меню/діалоги, прапорці zen/view mode, дані колаборації тощо. Не плутати з масивом елементів — це окремий шар стану.
- **Де в коді:** Інтерфейс `AppState` — `packages/excalidraw/types.ts`; значення за замовчуванням — `packages/excalidraw/appState.ts` (`getDefaultAppState`).
- **Не плутати з:** Глобальним станом Redux — у проєкті використовується класовий `App` + Jotai для частини UI.

---

## Tool (інструмент)

- **Що це:** Режим вводу користувача: виділення, малювання прямокутника, лінії, тексту тощо. Зберігається в `appState.activeTool` з полями `type`, `customType`, `locked` тощо.
- **Де в коді:** Типи інструментів і логіка перемикання — у `App` та пов’язаних модулях; стан — у `AppState.activeTool` (`packages/excalidraw/types.ts`).
- **Не плутати з:** «Інструментом» CLI (yarn/vite) — тут лише **режим редактора**.

---

## Action

- **Що це:** Опис **команди**, яку можна викликати з меню, палітри або шорткату: містить `name`, `perform`, опційно `predicate`, `keyTest`, `trackEvent`.
- **Де в коді:** `packages/excalidraw/actions/types.ts` (`Action`), реєстрація — `actions/register.ts`, виконання — `ActionManager` у `actions/manager.tsx`.
- **Не плутати з:** Redux action — це власний патерн Excalidraw, не FSA.

---

## Collaboration (колаборація)

- **Що це:** Спільне редагування: синхронізація елементів і відображення інших учасників (курсори, виділення). У стані редактора — `appState.collaborators` та поля в конфігу інтерактивного рендеру (`remotePointerViewportCoords` тощо) у `packages/excalidraw/scene/types.ts`.
- **Де в коді:** UI-шар — `InteractiveCanvas` / `interactiveScene.ts`; транспорт — зазвичай `excalidraw-app` (наприклад `socket.io-client` у залежностях додатку).
- **Не плутати з:** Git collaboration — це **реалтайм** у відкритій сесії, а не pull request.

---

## Library (бібліотека фігур)

- **Що це:** Набір збережених користувачем (або вбудованих) фігур для повторного вставлення на дошку. У продукті відображається як бічна панель бібліотеки.
- **Де в коді:** Компоненти та стан бібліотеки в межах `packages/excalidraw` (пошук за `library` у пакеті); дані серіалізуються разом із сценою в типових сценаріях експорту/завантаження.
- **Не плутати з:** npm package library — тут **бібліотека елементів** у UI.

---

## Bound element (прив’язаний елемент)

- **Що це:** Зв’язок лінійного елемента (наприклад стрілки) з іншим елементом: на батьківському елементі зберігається `boundElements` з посиланнями на `id` і тип (`arrow` / `text`) — див. `BoundElement` у `packages/element/src/types.ts`.
- **Де в коді:** Мутації прив’язок у логіці `App`, візуальний фідбек — `interactiveScene.ts` (підсвітка binding).
- **Не плутати з:** CSS `position: bound` — це **дані моделі**, не стилі.

---

## Linear element

- **Що це:** Елемент із послідовністю точок (лінія, стрілка): типи на кшталт `line` / `arrow` з масивом `points` у моделі лінійного елемента в `packages/element`.
- **Де в коді:** Типи `ExcalidrawLinearElement` та редактор точок — `LinearElementEditor` у контексті `AppState.selectedLinearElement` (`packages/excalidraw/types.ts`).
- **Не плутати з:** HTML `<linearGradient>` — це **векторна полілінія** на canvas.
