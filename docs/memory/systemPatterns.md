# System Patterns

## Архітектура на високому рівні

Проєкт організований як монорепа з розділенням на:
- **Application layer**: `excalidraw-app` (кінцевий SPA, інтеграції, collab UX).
- **Domain/editor layer**: `packages/excalidraw` (ядро редактора + публічний React API).
- **Core libraries**: `packages/common`, `packages/element`, `packages/math`, `packages/utils`.

У `excalidraw-app/vite.config.mts` alias-резолвінг напряму мапить `@excalidraw/*` на локальні сорси `packages/*`, тобто app розробляється поверх вихідного коду пакетів.

## Ключові патерни

## 1) Composition Root + Provider pattern
- `packages/excalidraw/index.tsx` збирає `Excalidraw` як точку входу.
- Обгортки `EditorJotaiProvider` + `InitializeApp` + `<App />` формують централізовану ініціалізацію.
- `ExcalidrawAPIProvider` дозволяє підписуватись на imperative API за межами дерева компонента.

## 2) Editor Kernel (оркестратор стану)
- `packages/excalidraw/components/App.tsx` виступає центральним класом-оркестратором.
- У конструкторі ініціалізуються підсистеми:
  - `Scene`;
  - `Store`;
  - `History`;
  - `ActionManager`;
  - `Renderer`.
- Це реалізує явний поділ відповідальностей між сценою, історією, командами та рендерингом.

## 3) Command pattern через ActionManager
- `actions/manager.tsx` реєструє actions і виконує їх із різних джерел:
  - keyboard (`handleKeyDown`);
  - UI/API (`executeAction`).
- `Action.perform(elements, appState, value, app)` повертає `ActionResult`, який централізовано застосовується updater-ом.

## 4) Історія змін на delta/snapshot підході
- `history.ts` використовує `StoreDelta`/`StoreSnapshot` із `@excalidraw/element`.
- `undo/redo` працює через інверсію delta (`HistoryDelta.inverse`) і повторне застосування змін.
- Патерн зменшує обсяг збережених даних у порівнянні з full snapshot на кожну дію.

## 5) Багаторівневий state management
- **AppState (React state)**: UI/interaction стан редактора.
- **Scene/Store state**: канонічні елементи сцени та їхні зміни.
- **Jotai atoms**: локальні/епізодичні UI стани.
- Контексти (`ExcalidrawAppStateContext`, `ExcalidrawElementsContext`, `ExcalidrawActionManagerContext`, ін.) надають доступ до цих рівнів.

## 6) Realtime collaboration pattern
- У `excalidraw-app/collab/Portal.tsx` WebSocket-обмін іде через Socket.IO з room-моделлю (`join-room`, broadcast подій).
- Передача payload шифрується (`encryptData`) перед `socket.emit`.
- `excalidraw-app/data/firebase.ts` забезпечує довготривале зберігання сцен/файлів у Firestore + Storage.
- Синхронізація сцен використовує `reconcileElements`, що зменшує конфлікти при паралельних змінах.

## 7) Static delivery pattern
- Runtime не потребує Node-сервера: `vite build` -> статичні файли.
- `Dockerfile` копіює `excalidraw-app/build` у Nginx image (`/usr/share/nginx/html`).

## Практичні наслідки для змін

- Зміни editor-логіки краще вносити в `packages/excalidraw` / `packages/element`, а не в `excalidraw-app`.
- UI-розширення здебільшого проходять через actions + contexts + `LayerUI`.
- Колабораційні фічі потребують узгодження між `collab/*`, `data/firebase.ts` і станом редактора.
- Для продуктивності варто дотримуватись існуючого поділу: delta-based history, selective sync і chunking у Vite.
