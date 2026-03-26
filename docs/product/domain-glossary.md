# Domain glossary (Excalidraw)

Тлумачення термінів **з коду** цього репозиторію (`packages/excalidraw`, `packages/element`, `packages/common`). Не офіційний глосарій продукту Excalidraw Inc.

## Редактор і UI

| Термін | Значення (де в коді) |
|--------|----------------------|
| **Excalidraw** | React-компонент з `packages/excalidraw/index.tsx`, який ренерить внутрішній `App` і провайдери. |
| **App** | Клас `App` у `packages/excalidraw/components/App.tsx` — кореневий компонент редактора з React-станом `AppState`. |
| **AppState** | Повний стан UI редактора (zoom, scroll, activeTool, selection, theme, collaborators, …) — тип у `packages/excalidraw/types.ts`. |
| **UIAppState** | Підмножина / проєкція `AppState` для UI-панелей (див. експорти в `types.ts`). |
| **LayerUI** | Шар меню, сайдбарів і дітей-пропів навколо canvas (`packages/excalidraw/components/LayerUI.tsx`). |

## Сцена й дані

| Термін | Значення |
|--------|----------|
| **Scene** | Клас у `packages/element/src/Scene.ts` — впорядкований набір елементів, мапи, вибір, `replaceAllElements`, `triggerUpdate`. |
| **ExcalidrawElement** | Базовий тип елемента на canvas (підтипи: rectangle, text, arrow, …) — `packages/element/src/types.ts`. |
| **OrderedExcalidrawElement** | Елемент з порядком у сцені (брендований тип у `element/types`). |
| **elementsMap** | `Map` id → елемент для O(1) доступу під час рендеру та логіки. |
| **BinaryFiles** | Словник `FileId` → метадані + `dataURL` для вбудованих зображень (`types.ts`: `BinaryFileData`, `BinaryFiles`). |
| **SceneNonce** | Число для інвалідації мемоізованих обчислень при зміні сцени (`Scene.getSceneNonce()`). |

## Дії та історія

| Термін | Значення |
|--------|----------|
| **Action** | Опис команди користувача: `perform(elements, appState, data, app) → ActionResult` (`packages/excalidraw/actions/types.ts`). |
| **ActionManager** | Реєстр дій, `executeAction`, `handleKeyDown`, `renderAction` (`packages/excalidraw/actions/manager.tsx`). |
| **ActionResult** | Результат дії: опційно нові `elements`, `appState`, `files`, обов’язково `captureUpdate` (`CaptureUpdateActionType`). |
| **syncActionResult** | Метод `App`, який застосовує `ActionResult` до `Scene`, `Store` і React `setState`. |
| **Store** | `packages/element/src/store.ts` — знімки, дельти, планування `CaptureUpdateAction`, еміти для історії. |
| **CaptureUpdateAction** | `IMMEDIATELY` / `NEVER` / `EVENTUALLY` — чи потрапляє зміна в undo/redo та коли (`store.ts`). |
| **History** | `packages/excalidraw/history.ts` — стеки undo/redo з `HistoryDelta`. |

## Інструменти та режими

| Термін | Значення |
|--------|----------|
| **ToolType** | Рядковий союз інструментів палітри: `selection`, `rectangle`, `arrow`, `freedraw`, `text`, `laser`, … (`types.ts`). |
| **activeTool** | Поточний інструмент + опційно `customType` для плагінних інструментів. |
| **viewModeEnabled** | Режим перегляду без редагування (проп `ExcalidrawProps`). |
| **zenModeEnabled** | Мінімалістичний UI. |
| **collaborators** | `Map<SocketId, Collaborator>` — віддалені курсори, вибір, імена (`types.ts`). |

## Рендеринг

| Термін | Значення |
|--------|----------|
| **Static canvas** | Canvas для «статичної» сцени (сітка, елементи) — `StaticCanvas` + `renderStaticScene`. |
| **Interactive canvas** | Canvas для ручок, виділення, прев’ю — `InteractiveCanvas` + `renderInteractiveScene`. |
| **renderElement** | Функція з `@excalidraw/element`, що малює один елемент на `CanvasRenderingContext2D` / Rough canvas. |
| **Renderer** | `packages/excalidraw/scene/Renderer.ts` — обчислення видимих елементів для viewport. |

## Пакети монорепо

| Пакет | Роль |
|-------|------|
| **@excalidraw/common** | Константи, події, кольори, утиліти. |
| **@excalidraw/math** | 2D-математика (точки, вектори). |
| **@excalidraw/element** | Модель елементів, Scene, Store, геометрія, `renderElement`. |
| **@excalidraw/excalidraw** | Публічний редактор React. |
| **@excalidraw/utils** | Експорт PNG/SVG, shape helpers. |

## Верифікація

- Типи та пропси: `packages/excalidraw/types.ts`
- Сцена та store: `packages/element/src/Scene.ts`, `packages/element/src/store.ts`
- Дії: `packages/excalidraw/actions/types.ts`, `manager.tsx`
