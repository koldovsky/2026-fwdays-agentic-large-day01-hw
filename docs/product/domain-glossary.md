# Domain Glossary

Проєктний словник термінів (DDD-орієнтований) для поточної кодової бази.
Кожен термін подано англійською так, як він названий у коді.

## 1) `Scene`
- **Definition (project context):** Runtime aggregate, що утримує канонічний стан елементів полотна та координує їх оновлення.
- **Used in (key files):**
  - `packages/element/src/Scene.ts`
  - `packages/excalidraw/components/App.tsx`
  - `docs/technical/architecture.md`
- **Do not confuse with:** загальним "scene" у графічних рушіях або просто масивом елементів.

## 2) `ExcalidrawElement`
- **Definition (project context):** Базова поліморфна сутність домену для об'єктів, що малюються/зберігаються/синхронізуються.
- **Used in (key files):**
  - `packages/element/src/types.ts`
  - `packages/excalidraw/types.ts`
- **Do not confuse with:** UI-станом застосунку (`AppState`).

## 3) `ExcalidrawFrameElement`
- **Definition (project context):** Сутність-фрейм для групування та рамкування контенту сцени.
- **Used in (key files):**
  - `packages/element/src/types.ts`
  - `packages/excalidraw/actions/actionFrame.ts`
- **Do not confuse with:** `ExcalidrawMagicFrameElement` (AI-орієнтований різновид).

## 4) `ExcalidrawMagicFrameElement`
- **Definition (project context):** Спеціалізований тип фрейму (`type: "magicframe"`) для AI/diagram-to-code сценаріїв.
- **Used in (key files):**
  - `packages/element/src/types.ts`
  - `excalidraw-app/components/AI.tsx`
- **Do not confuse with:** звичайним `ExcalidrawFrameElement`.

## 5) `FixedPointBinding`
- **Definition (project context):** Value object прив'язки стрілки до конкретної точки/режиму на цільовому елементі.
- **Used in (key files):**
  - `packages/element/src/types.ts`
- **Do not confuse with:** загальним посиланням між елементами без геометричних параметрів.

## 6) `BindMode`
- **Definition (project context):** Тип режиму прив'язки (`inside`, `orbit`, `skip`) для поведінки конекторів/стрілок.
- **Used in (key files):**
  - `packages/element/src/types.ts`
  - `packages/excalidraw/types.ts`
- **Do not confuse with:** UI-перемикачами в інтерфейсі (наприклад enable/disable bind).

## 7) `AppState`
- **Definition (project context):** Центральна модель стану редактора: інструмент, selection, viewport, діалоги, collab flags.
- **Used in (key files):**
  - `packages/excalidraw/types.ts`
  - `packages/excalidraw/appState.ts`
- **Do not confuse with:** serialized/persisted підмножинами стану.

## 8) `ObservedAppState`
- **Definition (project context):** Звужене представлення `AppState`, яке відстежується Store для snapshot/diff.
- **Used in (key files):**
  - `packages/excalidraw/types.ts`
  - `packages/element/src/store.ts`
- **Do not confuse with:** повним `AppState`, який має ширший обсяг полів.

## 9) `APP_STATE_STORAGE_CONF`
- **Definition (project context):** Policy-map, що визначає які ключі `AppState` зберігати локально/експортувати/відправляти на сервер.
- **Used in (key files):**
  - `packages/excalidraw/appState.ts`
- **Do not confuse with:** runtime дефолтами `AppState`.

## 10) `ExcalidrawImperativeAPI`
- **Definition (project context):** Публічний API-сервіс для хоста/інтегратора (`updateScene`, `applyDeltas`, `scrollToContent` тощо).
- **Used in (key files):**
  - `packages/excalidraw/types.ts`
  - `packages/excalidraw/index.tsx`
- **Do not confuse with:** внутрішніми методами `App` компонента.

## 11) `Action`
- **Definition (project context):** Command-абстракція поведінки редактора (`perform`, predicate, shortcut, panel metadata).
- **Used in (key files):**
  - `packages/excalidraw/actions/types.ts`
  - `packages/excalidraw/actions/register.ts`
- **Do not confuse with:** довільною React-подією або callback-функцією.

## 12) `ActionResult`
- **Definition (project context):** Стандартизований результат виконання Action (оновлені elements/appState/files + capture policy).
- **Used in (key files):**
  - `packages/excalidraw/actions/types.ts`
  - `docs/technical/architecture.md`
- **Do not confuse with:** low-level інкрементами Store (`StoreIncrement`).

## 13) `ActionManager`
- **Definition (project context):** Application service, що реєструє дії, маршрутизує hotkeys та виконує команди.
- **Used in (key files):**
  - `packages/excalidraw/actions/manager.tsx`
  - `docs/technical/architecture.md`
- **Do not confuse with:** Redux-like dispatcher/store патерном.

## 14) `CaptureUpdateAction`
- **Definition (project context):** Політика фіксації змін для history/store (`IMMEDIATELY`, `EVENTUALLY`, `NEVER`).
- **Used in (key files):**
  - `packages/element/src/store.ts`
  - `packages/excalidraw/history.ts`
- **Do not confuse with:** користувацькими Action-командами з toolbar.

## 15) `Store`
- **Definition (project context):** Сервіс capture/diff для стану сцени й app state; формує durable/ephemeral increments.
- **Used in (key files):**
  - `packages/element/src/store.ts`
  - `docs/technical/architecture.md`
- **Do not confuse with:** localStorage/IndexedDB persistence layer.

## 16) `StoreSnapshot`
- **Definition (project context):** Знімок спостережуваного стану, який використовується для обчислення дельт.
- **Used in (key files):**
  - `packages/element/src/store.ts`
- **Do not confuse with:** форматами збереження на бекенді/в файлах.

## 17) `StoreDelta`
- **Definition (project context):** Доменна дельта змін (`elements` + `appState`) з операціями apply/inverse/squash.
- **Used in (key files):**
  - `packages/element/src/store.ts`
- **Do not confuse with:** спеціалізованим `HistoryDelta`.

## 18) `DurableIncrement`
- **Definition (project context):** Інкремент зміни, який потрапляє в undo/redo історію.
- **Used in (key files):**
  - `packages/element/src/store.ts`
- **Do not confuse with:** транзієнтним `EphemeralIncrement`.

## 19) `EphemeralIncrement`
- **Definition (project context):** Тимчасовий інкремент без запису в довготривалу історію.
- **Used in (key files):**
  - `packages/element/src/store.ts`
- **Do not confuse with:** збереженими або відтворюваними історичними кроками.

## 20) `History`
- **Definition (project context):** Undo/redo application service для керування стеками дельт і їх відтворенням.
- **Used in (key files):**
  - `packages/excalidraw/history.ts`
  - `docs/technical/architecture.md`
- **Do not confuse with:** browser navigation history.

## 21) `HistoryDelta`
- **Definition (project context):** Спеціалізація дельти для механіки історії та replay-семантики.
- **Used in (key files):**
  - `packages/excalidraw/history.ts`
- **Do not confuse with:** загальним `StoreDelta` без історичного контексту.

## 22) `Collaborator`
- **Definition (project context):** Value object присутності remote-користувача (курсор, ім'я, статуси, аватар, voice/video flags).
- **Used in (key files):**
  - `packages/excalidraw/types.ts`
  - `excalidraw-app/collab/Collab.tsx`
- **Do not confuse with:** обліковим записом користувача/auth profile.

## 23) `Collab`
- **Definition (project context):** Оркестратор колаборації: lifecycle кімнати, reconciliation, sync, presence/idle.
- **Used in (key files):**
  - `excalidraw-app/collab/Collab.tsx`
  - `docs/memory/systemPaterns.md`
- **Do not confuse with:** транспортним шаром socket-з'єднання (`Portal`).

## 24) `Portal`
- **Definition (project context):** Транспорт колаборації для кімнати: broadcast, presence-пакети, file upload queue.
- **Used in (key files):**
  - `excalidraw-app/collab/Portal.tsx`
  - `docs/memory/systemPaterns.md`
- **Do not confuse with:** React Portal для рендерингу DOM.

## 25) `LocalData`
- **Definition (project context):** Сервіс локального збереження DataState (розподіл між localStorage та IndexedDB).
- **Used in (key files):**
  - `excalidraw-app/data/LocalData.ts`
  - `docs/memory/systemPaterns.md`
- **Do not confuse with:** хмарною синхронізацією/спільною кімнатою.

## 26) `Library`
- **Definition (project context):** Доменний сервіс бібліотеки reusable shape наборів (читання, merge, sync, persistence hooks).
- **Used in (key files):**
  - `packages/excalidraw/data/library.ts`
  - `packages/excalidraw/types.ts`
- **Do not confuse with:** npm package/library у загальному сенсі.

## 27) `LibraryItem`
- **Definition (project context):** Сутність елемента бібліотеки (`id`, `status`, `elements`, metadata).
- **Used in (key files):**
  - `packages/excalidraw/types.ts`
  - `packages/excalidraw/data/library.ts`
- **Do not confuse with:** serialized обгортками на кшталт persisted payload.

## 28) `TTDDialog`
- **Definition (project context):** UI-воркфлоу Text-to-Diagram з вкладками Mermaid/чат та інтеграцією генерації діаграм.
- **Used in (key files):**
  - `packages/excalidraw/components/TTDDialog/TTDDialog.tsx`
  - `excalidraw-app/components/AI.tsx`
- **Do not confuse with:** окремим конвертером Mermaid або generic chat UI.

## 29) `TTDPersistenceAdapter`
- **Definition (project context):** Абстракція інфраструктури збереження сесій Text-to-Diagram.
- **Used in (key files):**
  - `packages/excalidraw/components/TTDDialog/types.ts`
  - `packages/excalidraw/components/TTDDialog/TextToDiagram.tsx`
- **Do not confuse with:** загальними DB adapters без TTD-домену.

## 30) `TTDIndexedDBAdapter`
- **Definition (project context):** Конкретна реалізація `TTDPersistenceAdapter` через IndexedDB.
- **Used in (key files):**
  - `excalidraw-app/data/TTDStorage.ts`
  - `excalidraw-app/components/AI.tsx`
- **Do not confuse with:** persistence механізмом `Library` або `LocalData`.

## 31) `TTDStreamFetch`
- **Definition (project context):** SSE-клієнт стримінгу відповіді для AI Text-to-Diagram з обробкою rate-limit сигналів.
- **Used in (key files):**
  - `packages/excalidraw/components/TTDDialog/utils/TTDStreamFetch.ts`
  - `excalidraw-app/components/AI.tsx`
- **Do not confuse with:** звичайним одноразовим `fetch` без stream protocol.
