# Domain Glossary — Excalidraw

Словник термінів проєкту. Кожен термін — таким, яким він фігурує в коді.

---

## ExcalidrawElement

**Визначення.**
TypeScript union-тип, що описує будь-який намальований об'єкт на canvas. Є базовим будівельним блоком усього візуального вмісту сцени. Кожен екземпляр — імутабельний, JSON-серіалізовний, не містить обчислюваних даних і може безпечно передаватися між колаборантами.

**Де використовується.**
- `packages/element/src/types.ts` — визначення (`_ExcalidrawElementBase` + конкретні підтипи)
- `packages/element/src/Scene.ts` — зберігання та доступ до елементів
- `packages/excalidraw/actions/types.ts` — першим аргументом у `Action.perform()`
- По всьому кодбейсу як основний тип даних

**Конкретні підтипи.**
`ExcalidrawRectangleElement`, `ExcalidrawEllipseElement`, `ExcalidrawDiamondElement`, `ExcalidrawTextElement`, `ExcalidrawLinearElement`, `ExcalidrawArrowElement`, `ExcalidrawFreeDrawElement`, `ExcalidrawImageElement`, `ExcalidrawFrameElement`, `ExcalidrawMagicFrameElement`, `ExcalidrawIframeElement`, `ExcalidrawEmbeddableElement`.

**Ключові поля base-типу.**
`id`, `x`, `y`, `width`, `height`, `angle`, `isDeleted`, `version`, `versionNonce`, `index` (FractionalIndex), `groupIds`, `frameId`, `locked`.

**НЕ плутати з.**
- Загальне значення "element" — HTML DOM-елемент (`document.querySelector`, React ref).
- У цьому проєкті "element" завжди означає об'єкт на нескінченному canvas Excalidraw, а не DOM-вузол.

---

## Scene

**Визначення.**
Клас-контейнер, що керує повним набором елементів, відображених на canvas у поточний момент. Зберігає як активні (non-deleted), так і видалені елементи (для reconciliation під час колаборації). Є єдиним джерелом правди щодо елементів; усі зміни проходять через `scene.replaceAllElements()`.

**Де використовується.**
- `packages/element/src/Scene.ts` — реалізація
- `packages/excalidraw/components/App.tsx` — `this.scene` як поле класу
- `packages/excalidraw/actions/` — отримання поточних елементів через `app.scene`

**Ключові методи.**
`getElementsIncludingDeleted()`, `getNonDeletedElements()`, `getNonDeletedElementsMap()`, `getSelectedElements()`, `replaceAllElements()`, `getElement(id)`.

**НЕ плутати з.**
- Загальне значення "scene" — 3D-сцена (Three.js, Unity, Blender), театральна сцена.
- У цьому проєкті Scene — це React-agnostic клас управління елементами, а не React state. Він живе поза `this.state` компонента `App` як `this.scene`.

---

## AppState

**Визначення.**
TypeScript-інтерфейс (~50+ полів), що описує повний поточний стан редактора. Містить налаштування UI, активний інструмент, zoom, scroll, виділення, тему, collab-дані, відкриті діалоги тощо. Є `state` class-компонента `App`. Кожне поле має storage-конфіг, який визначає, чи зберігати поле у localStorage, Firebase, чи включати в експорт.

**Де використовується.**
- `packages/excalidraw/types.ts:272` — визначення інтерфейсу `AppState`
- `packages/excalidraw/components/App.tsx` — `this.state: AppState`
- `packages/excalidraw/data/appState.ts` — `clearAppStateForLocalStorage/Database/Export` (фільтрація полів)
- `packages/excalidraw/actions/types.ts` — другим аргументом у `Action.perform()`

**Підтипи для рендерерів.**
- `StaticCanvasAppState` — підмножина полів для рендерингу незмінного шару
- `InteractiveCanvasAppState` — підмножина полів для рендерингу інтерактивного шару
- `UIAppState` — підмножина для React UI (без low-level cursor/scroll)

**НЕ плутати з.**
- Загальне значення "app state" — будь-який стан будь-якого застосунку.
- Jotai-атоми (`packages/excalidraw/editor-jotai.ts`) — окремий, менший UI-state для конкретних компонентів (sidebar docked, EyeDropper тощо). `AppState` — головний стан, Jotai — допоміжний.

---

## Action

**Визначення.**
Реалізація патерну Command. Кожна операція редактора (undo, copy, changeStrokeColor, zoomIn тощо) представлена об'єктом `Action`. Дія інкапсулює логіку виконання (`perform`), прив'язку клавіш (`keyTest`), UI-компонент панелі (`PanelComponent`) та умову доступності (`predicate`).

**Де використовується.**
- `packages/excalidraw/actions/types.ts` — інтерфейс `Action`, тип `ActionName` (~50 значень)
- `packages/excalidraw/actions/manager.tsx` — клас `ActionManager`: реєстрація та dispatch
- `packages/excalidraw/actions/*.ts` — реалізації конкретних дій
- `packages/excalidraw/components/App.tsx` — `this.actionManager`

**Lifecycle дії.**
```
trigger (ui/keyboard/contextMenu/api/commandPalette)
  → actionManager.executeAction(action, source, value)
  → action.perform(elements, appState, formData, app) → ActionResult
  → syncActionResult(): scene.replaceAllElements() + this.setState() + store.scheduleAction()
```

**НЕ плутати з.**
- Загальне значення "action" — Redux action, будь-яка подія.
- Тут Action — це повноцінний Command-об'єкт з UI, клавішами та бізнес-логікою. Він не є Redux action і не диспетчеризується через reducer.

---

## Tool

**Визначення.**
Активний режим взаємодії користувача з canvas. Визначається через `ToolType` — рядковий union. Поточний інструмент зберігається в `AppState.activeTool`. Деякі інструменти відповідають типам елементів (rectangle, ellipse), інші — режимам (selection, eraser, hand, laser).

**Де використовується.**
- `packages/excalidraw/types.ts` — `ToolType`, `ActiveTool`, `ElementOrToolType`
- `packages/excalidraw/components/App.tsx` — `this.state.activeTool`, метод `setActiveTool()`
- `packages/excalidraw/components/LayerUI.tsx` — Toolbar, відображення активного інструменту
- `packages/excalidraw/actions/` — `actionToggleEraserTool`, `actionToggleHandTool` тощо

**Значення `ToolType`.**
`"selection"`, `"lasso"`, `"rectangle"`, `"diamond"`, `"ellipse"`, `"arrow"`, `"line"`, `"freedraw"`, `"text"`, `"image"`, `"eraser"`, `"hand"`, `"frame"`, `"magicframe"`, `"embeddable"`, `"laser"`.

**НЕ плутати з.**
- Загальне значення "tool" — будь-який інструмент/утиліта.
- У цьому проєкті Tool — виключно режим взаємодії з canvas, а не плагін чи утилітарна функція.

---

## Store

**Визначення.**
Клас, що спостерігає за змінами елементів та `AppState` і емітує їх як `StoreIncrement` події. Є сполучною ланкою між мутаціями елементів та системою History. Контролює, чи потрапляє зміна в undo-стек, через `CaptureUpdateAction` (`IMMEDIATELY` / `EVENTUALLY` / `NEVER`).

**Де використовується.**
- `packages/element/src/store.ts` — реалізація класу `Store`, константа `CaptureUpdateAction`
- `packages/excalidraw/components/App.tsx` — `this.store`, виклики `store.scheduleAction()` і `store.commit()` у `componentDidUpdate`
- `packages/excalidraw/history.ts` — підписка на `store.onDurableIncrementEmitter`

**НЕ плутати з.**
- Загальне значення "store" — Redux store, Zustand store, Jotai store.
- Цей `Store` — не state-менеджер і не сховище даних. Це дельта-журнал змін для системи undo/redo. Jotai store (`editorJotaiStore`) — окрема річ для UI-атомів.

---

## History

**Визначення.**
Система undo/redo. Складається з двох стеків (`undoStack`, `redoStack`) об'єктів `HistoryDelta`. Записує дельту-знімок кожної дії, позначеної як `CaptureUpdateAction.IMMEDIATELY`. Undo/redo відновлює попередній стан через застосування інвертованої дельти.

**Де використовується.**
- `packages/excalidraw/history.ts` — клас `History`, `HistoryDelta`, `HistoryChangedEvent`
- `packages/excalidraw/components/App.tsx` — `this.history`; у `componentDidMount` підписується на `store.onDurableIncrementEmitter`
- `packages/excalidraw/actions/actionHistory.ts` — дії `undo`, `redo`

**НЕ плутати з.**
- Загальне значення "history" — browser history (`window.history`), git history.
- Тут History — виключно undo/redo стек редактора, побудований на дельтах елементів і AppState.

---

## Delta / ElementsDelta / AppStateDelta

**Визначення.**
Структура даних, що описує різницю між двома станами (до і після зміни). `ElementsDelta` — зміни в елементах, `AppStateDelta` — зміни в `AppState`. Використовуються як у History (undo/redo), так і у колаборації (reconciliation).

**Де використовується.**
- `packages/element/src/delta.ts` — класи `Delta`, `ElementsDelta`, `AppStateDelta`, `StoreDelta`
- `packages/element/src/store.ts` — `Store` збирає дельти та емітує `DurableIncrement`/`EphemeralIncrement`
- `packages/excalidraw/history.ts` — `HistoryDelta extends StoreDelta`

**НЕ плутати з.**
- Загальне значення "delta" — зміна, символ Δ у математиці.
- У цьому проєкті Delta — конкретний клас з методами `apply()`, `invert()`, `isEmpty()`, що застосовується для детермінованого undo/redo і collab-reconciliation.

---

## Collaboration

**Визначення.**
Підсистема real-time спільного редагування. Реалізована виключно у `excalidraw-app` (не в npm-пакеті). Використовує Socket.io для передачі дельт між учасниками та Firebase для збереження сцени. Кожен учасник — об'єкт `Collaborator` у `AppState.collaborators`.

**Де використовується.**
- `excalidraw-app/collab/Collab.tsx` — головний React-компонент колаборації
- `excalidraw-app/collab/Portal.tsx` — Socket.io транспортний шар
- `excalidraw-app/data/firebase.ts` — завантаження/збереження сцени у Firebase
- `packages/excalidraw/types.ts` — типи `Collaborator`, `SocketId`, `CollaboratorPointer`

**НЕ плутати з.**
- Загальне значення "collaboration" — будь-яка командна робота.
- У проєкті Collaboration — технічна підсистема з конкретною архітектурою: WebSocket (Socket.io) + Firebase + E2E-шифрування. Базовий npm-пакет `@excalidraw/excalidraw` надає лише prop `isCollaborating` і callback `onPointerUpdate`; вся реальна логіка — у `excalidraw-app`.

---

## Library

**Визначення.**
Колекція збережених груп елементів (`LibraryItem`), які користувач може повторно використовувати, вставляючи на canvas. Підтримує локальні (unpublished) та публічні (published) елементи. Зберігається у localStorage або через кастомний `LibraryPersistenceAdapter`.

**Де використовується.**
- `packages/excalidraw/data/library.ts` — клас `Library`, інтерфейси `LibraryPersistenceAdapter`, `LibraryMigrationAdapter`
- `packages/excalidraw/types.ts:522` — типи `LibraryItem`, `LibraryItems`, `LibraryItemsSource`
- `packages/excalidraw/components/App.tsx` — `this.library`
- `packages/excalidraw/components/LibraryMenu*` — UI бібліотеки

**Структура `LibraryItem`.**
```ts
{
  id: string;
  status: "published" | "unpublished";
  elements: readonly NonDeleted<ExcalidrawElement>[];
  created: number; // epoch ms
  name?: string;
}
```

**НЕ плутати з.**
- Загальне значення "library" — npm-бібліотека, програмна бібліотека.
- Тут Library — функціональна область продукту ("бібліотека шаблонів") та клас, що нею керує. Не npm-пакет і не стороння залежність.

---

## Frame

**Визначення.**
Спеціальний тип елемента-контейнера (`ExcalidrawFrameElement`, type: `"frame"`), що групує інші елементи у іменовану область і може обрізати (clip) їх при рендерингу та експорті. `ExcalidrawMagicFrameElement` (type: `"magicframe"`) — розширення для AI-генерації вмісту.

**Де використовується.**
- `packages/element/src/types.ts` — `ExcalidrawFrameElement`, `ExcalidrawMagicFrameElement`, `ExcalidrawFrameLikeElement`
- `packages/element/src/frame.ts` — логіка роботи з фреймами
- `packages/excalidraw/types.ts` — `AppState.frameRendering` (enabled, name, outline, clip)

**НЕ плутати з.**
- Загальне значення "frame" — HTML `<iframe>`, animation frame (RAF), стек-фрейм.
- У цьому проєкті Frame — виключно named container-елемент на canvas для організації та групування контенту.

---

## ExcalidrawImperativeAPI

**Визначення.**
Публічний програмний API, що надається хост-застосунку через callback `onExcalidrawAPI`. Дозволяє зовнішньому коду керувати редактором: оновлювати сцену, отримувати стан, встановлювати активний інструмент, підписуватися на зміни тощо.

**Де використовується.**
- `packages/excalidraw/types.ts:917` — інтерфейс `ExcalidrawImperativeAPI`
- `packages/excalidraw/components/App.tsx:743` — `createExcalidrawAPI()`
- `excalidraw-app/collab/Collab.tsx` — використання API для оновлення сцени під час колаборації

**Ключові методи.**
`updateScene()`, `getSceneElements()`, `getAppState()`, `setActiveTool()`, `scrollToContent()`, `history.clear()`, `onChange()`, `onStateChange()`, `resetScene()`.

**НЕ плутати з.**
- Загальне значення "imperative API" — будь-який API з прямими командами.
- Тут це конкретний інтерфейс ізоляції між `excalidraw-app` (або сторонніми хост-застосунками) та внутрішнім класом `App`. Після `componentWillUnmount` API стає недійсним (`isDestroyed = true`).

---

## BinaryFiles

**Визначення.**
Словник (`Record<FileId, BinaryFileData>`) бінарних файлів (зображень), прикріплених до сцени. Файли зберігаються окремо від елементів: `ExcalidrawImageElement` містить лише `fileId`, а реальні дані знаходяться у `BinaryFiles`. Це дозволяє дедублікувати файли і контролювати їх завантаження.

**Де використовується.**
- `packages/excalidraw/types.ts` — типи `BinaryFileData`, `BinaryFiles`, `FileId`
- `packages/excalidraw/components/App.tsx` — `this.files: BinaryFiles`
- `excalidraw-app/data/FileManager.ts` — завантаження/вивантаження до Firebase Storage

**НЕ плутати з.**
- Загальне значення "files" — файлова система, `File` API браузера.
- У цьому проєкті `BinaryFiles` — специфічна структура in-memory кешу зображень, що є третьою частиною тріади стану: `elements + appState + files`.

---

## FractionalIndex

**Визначення.**
Branded string-тип (`string & { _brand: "franctionalIndex" }`) для визначення порядку елементів у сцені. Алгоритм fractional indexing дозволяє вставляти елементи між існуючими без перенумерації всього масиву — критично для CRDT-подібного reconciliation у колаборації.

**Де використовується.**
- `packages/element/src/types.ts` — тип `FractionalIndex`, поле `index` у `_ExcalidrawElementBase`
- `packages/element/src/fractionalIndex.ts` — `syncMovedIndices()`, `syncInvalidIndices()`, `validateFractionalIndices()`
- `packages/element/src/Scene.ts` — валідація при кожному оновленні сцени

**НЕ плутати з.**
- Загальне значення "index" — числовий індекс масиву.
- `FractionalIndex` — це рядок виду `"a0"`, `"a1"`, `"a0.5"` (бібліотека `fractional-indexing`), а не число. Масив елементів завжди синхронізований з цими значеннями.

---

## Renderer

**Визначення.**
Підсистема рендерингу canvas, розділена на два незалежні шари. `staticScene` рендерить фінальний вигляд елементів (тільки при їх зміні). `interactiveScene` рендерить selection handles, snap lines, курсори колаборантів (при кожному русі миші). `ShapeCache` кешує RoughJS-фігури для уникнення повторних обчислень.

**Де використовується.**
- `packages/excalidraw/renderer/staticScene.ts` — рендерер незмінного шару
- `packages/excalidraw/renderer/interactiveScene.ts` — рендерер інтерактивного шару
- `packages/excalidraw/components/App.tsx` — `this.renderer`, два `<canvas>` елементи
- `packages/element/src/renderElement.ts` — рендеринг окремого елемента

**НЕ плутати з.**
- Загальне значення "renderer" — рушій рендерингу (WebGL, Three.js Renderer, React Reconciler).
- Тут Renderer — це планувальник canvas-рендерингу поверх 2D Context API, що оптимізує перемальовування через RAF і два роздільні шари.

---

## Дивись також

- [PRD](./PRD.md) — продуктові вимоги де ці терміни зустрічаються в контексті фіч
- [Architecture](../technical/architecture.md) — як терміни реалізовані технічно
- [System Patterns](../memory/systemPatterns.md) — патерни взаємодії між Scene, Store, Action...
