# Product context

## Проблема, яку вирішує продукт

- Потреба у **швидкому, безкоштовному онлайн-інструменті** для створення діаграм, схем і нотаток із відчуттям малюнка від руки — без складних інтерфейсів типу Visio/Figma.
- Потреба в **React-компоненті для вбудовування** редактора креслень у сторонні застосунки (`packages/excalidraw`, опис — *"Excalidraw as a React component"*).

## UX-цілі

- **Hand-drawn стиль:** рендеринг через `roughjs` (`packages/excalidraw/package.json`), шрифт **Virgil** (`packages/excalidraw/fonts/Virgil/`), бібліотека `perfect-freehand` для вільного малювання.
- **Мінімалістичний UI:** лаконічна панель інструментів, кастомний мінімалістичний скролбар (`packages/excalidraw/css/styles.scss`), UI-шрифт **Assistant** (`excalidraw-app/index.html`).
- **Zero-friction:** миттєвий старт без реєстрації, автозбереження в `localStorage`, PWA з офлайн-доступом (`VitePWA` у `excalidraw-app/vite.config.mts`).

## Основні сценарії (user flows)

- **Створення малюнка:** набір інструментів `ToolType` (`packages/excalidraw/types.ts`): `rectangle`, `ellipse`, `arrow`, `line`, `freedraw`, `text`, `image`, `frame`, `eraser`, `hand`, `laser` тощо.
- **Експорт:** PNG/SVG/clipboard через `exportToCanvas`, `exportToBlob`, `exportToSvg`, `exportToClipboard` (`packages/utils/src/export.ts`); серіалізація в JSON — `serializeAsJSON` (`packages/excalidraw/data/json.ts`).
- **Колаборація в реальному часі:** Socket.IO-портал (`excalidraw-app/collab/Portal.tsx`), кімнати за URL-хешем `#room=…` (`excalidraw-app/data/index.ts`), оркестрація в `excalidraw-app/collab/Collab.tsx`.
- **Share-link:** зашифрований payload → бекенд, URL з `#json=id,key` (`excalidraw-app/data/index.ts` → `exportToBackend`/`importFromBackend`), файли у Firebase Storage.
- **Вбудовування як React-компонент:** `<Excalidraw>` (default export), `useExcalidrawAPI`, `MainMenu`, `Footer` та інші — все з `packages/excalidraw/index.tsx`; приклади в `examples/with-nextjs`.

## Що зберігається між сесіями

- **localStorage:** елементи сцени (`excalidraw`), стан UI (`excalidraw-state`), тема (`excalidraw-theme`), колаб-юзернейм (`excalidraw-collab`) — ключі з `excalidraw-app/app_constants.ts`.
- **IndexedDB (idb-keyval):** бібліотека елементів (`LibraryIndexedDBAdapter`), TTD-чати (`TTDIndexedDBAdapter`) — `excalidraw-app/data/LocalData.ts`, `TTDStorage.ts`.
- **Firebase (Firestore + Storage):** колаборативні сцени та файли share-link — `excalidraw-app/data/firebase.ts`.
- **Політика полів:** що саме зберігається в browser / export / server визначає `APP_STATE_STORAGE_CONF` у `packages/excalidraw/appState.ts`.
