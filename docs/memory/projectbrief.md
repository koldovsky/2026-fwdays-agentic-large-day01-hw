# Project Brief

## Що це за проєкт

- Це монорепозиторій `excalidraw-monorepo` з основним застосунком `excalidraw-app`, спільними пакетами в `packages/*` і прикладами в `examples/*`.
- Центральний продукт — Excalidraw: вебзастосунок і React-бібліотека для малювання діаграм/whiteboard із hand-drawn стилем.
- Репозиторій підтримує одразу два сценарії:
  - хостинг повного вебзастосунку `excalidraw-app`
  - публікацію вбудовуваної React-бібліотеки `@excalidraw/excalidraw`

## Основна мета

- Надати collaborative whiteboard, де користувачі можуть:
  - швидко ескізувати діаграми
  - ділитися сценами через share links
  - працювати в live collaboration rooms
  - вбудовувати редактор як React component у сторонні застосунки

## Що явно підтверджено в коді

- У `excalidraw-app/index.html` продукт описаний як:
  - `Excalidraw Whiteboard`
  - `Free, collaborative whiteboard`
  - `virtual collaborative whiteboard tool that lets you easily sketch diagrams that have a hand-drawn feel to them`
- У `packages/excalidraw/README.md` бібліотека описана як React component, який можна embed-ити напряму в інший app.
- У `packages/excalidraw/package.json` опис: `Excalidraw as a React component`.

## Репозиторний scope

### Main app

- `excalidraw-app/` — browser app, що монтується в `#root` і реєструє service worker.
- `excalidraw-app/App.tsx` обгортає UI в:
  - `TopErrorBoundary`
  - Jotai `Provider`
  - `ExcalidrawAPIProvider`
- Основний UI будується навколо компонента `<Excalidraw />` з пакета `@excalidraw/excalidraw`.

### Published packages

- `@excalidraw/excalidraw` — головний React package
- `@excalidraw/common` — common functions/constants
- `@excalidraw/element` — element-related logic
- `@excalidraw/math` — math functions
- `@excalidraw/utils` — utility/export helpers

### Supporting parts

- `examples/with-nextjs` і `examples/with-script-in-browser` — verified integration examples.
- `firebase-project/` — firestore/storage rules для backend-частини колаборації та файлів.
- Docker/Nginx конфігурація для контейнерного запуску app.

## Ключові можливості продукту

- Live collaboration:
  - `Collab.tsx` містить API для `startCollaboration`, `stopCollaboration`, `syncElements`
  - `Portal.tsx` працює через socket transport і шифрує socket payload
- Share/export:
  - `excalidraw-app/data/index.ts` реалізує `exportToBackend()` та `importFromBackend()`
  - `ShareDialog.tsx` дає старт collaboration session або share flow
- Local persistence:
  - `LocalData.ts` зберігає `appState`, `elements`, `images` у `localStorage` та `indexedDB`
- PWA/deployment:
  - `index.tsx` викликає `registerSW()`
  - `vite.config.mts` налаштовує `VitePWA`

## Non-goals / що не варто плутати

- Це не лише demo-сайт: у репо є окремо app і reusable npm packages.
- Це не лише library: `excalidraw-app` містить production web app з колаборацією, share flow, Sentry integration і PWA.

## Details
For detailed architecture → see docs/technical/architecture.md
For domain glossary → see docs/product/domain-glossary.md

