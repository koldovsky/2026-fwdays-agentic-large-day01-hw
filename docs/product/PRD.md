# Excalidraw Product Requirements Document (Reverse-Engineered)

## Scope and evidence

- This PRD is reverse-engineered from repository source code and project docs.
- Main evidence used:
  - `package.json` (root)
  - `excalidraw-app/package.json`
  - `excalidraw-app/index.tsx`
  - `excalidraw-app/App.tsx`
  - `excalidraw-app/collab/Collab.tsx`
  - `excalidraw-app/vite.config.mts`
  - `packages/excalidraw/index.tsx`
  - `packages/excalidraw/components/App.tsx`
  - `packages/excalidraw/data/*`
  - `packages/element/src/store.ts`
  - `packages/excalidraw/history.ts`
  - `docs/technical/architecture.md`
  - `docs/product/domain-glossary.md`

## 1) Мета продукту

- **Призначення:** надати whiteboard/diagram editor з "hand-drawn" стилем як:
  - вбудовуваний React-компонент (`@excalidraw/excalidraw`),
  - окремий вебзастосунок (`excalidraw-app`).
- **Цінність для користувача:**
  - швидке створення та редагування діаграм/схем на canvas,
  - можливість спільної роботи (collaboration),
  - експорт/імпорт сцен і повторне використання елементів через Library.
- **Проблема, яку вирішує:**
  - зменшення тертя для візуального пояснення ідей через простий інтерфейс редактора,
  - єдина модель сцени для локальної роботи, інтеграцій та колаборації.
- **Підтвердження в коді:**
  - `excalidraw-app/index.tsx` рендерить `<ExcalidrawApp />` і реєструє PWA SW,
  - `packages/excalidraw/index.tsx` експортує публічний React/API шар,
  - `packages/excalidraw/components/App.tsx` оркеструє state, input, rendering, API.

## 2) Цільова аудиторія / користувачі

- **Кінцеві користувачі редактора:**
  - люди, що створюють діаграми/нотатки/схеми у `excalidraw-app/App.tsx`.
- **Користувачі колаборації:**
  - учасники спільних сесій (presence, синхронізація сцени, файлів) у `excalidraw-app/collab/Collab.tsx`.
- **Інтегратори (host developers):**
  - розробники, що вбудовують `<Excalidraw />` та використовують API/hook-провайдери (`packages/excalidraw/index.tsx`).
- **Maintainers/stakeholders проєкту:**
  - контриб’ютори монорепозиторію (`workspaces` у root `package.json`).

### Сценарії використання (видимі з коду)

- Локальне редагування сцени:
  - інструменти, selection, viewport, дії через `ActionManager` + `AppState` у `App.tsx`.
- Спільна робота:
  - room/socket підключення, обмін інкрементами та файлами в `Collab.tsx`.
- Вбудовування в сторонній React-проєкт:
  - через `Excalidraw`, `ExcalidrawAPIProvider`, `useExcalidrawAPI`.
- Імпорт/експорт та відновлення:
  - helper-и з `packages/excalidraw/data/*`.

## 3) Ключові функції

### Обов’язкові (core) функції

- **Canvas editor runtime**
  - створення/редагування елементів, робота з інструментами, selection, zoom/scroll (`packages/excalidraw/components/App.tsx`, `packages/excalidraw/types.ts`).
- **Командна модель дій**
  - `ActionManager` виконує дії з unified `ActionResult` контрактом (`packages/excalidraw/actions/manager.tsx`).
- **State/update pipeline**
  - розділення `elements` (Scene) та `appState` + commit pipeline через `Store` (`packages/element/src/store.ts`) і `History` (`packages/excalidraw/history.ts`).
- **Undo/Redo**
  - окремі action-и та стек історії (`createUndoAction`, `createRedoAction`, `History`).
- **Rendering pipeline**
  - `StaticCanvas` + `InteractiveCanvas`, рендер під контролем `App`.
- **Публічний API для host app**
  - `updateScene`, `mutateElement`, `applyDeltas`, state/files getters, підписки (`createExcalidrawAPI` у `App.tsx`, експорт у `index.tsx`).

### Додаткові / platform-функції

- **Collaboration**
  - websocket room-синхронізація та collaborator state (`excalidraw-app/collab/Collab.tsx`, `socket.io-client`).
- **Library subsystem**
  - збереження/merge reusable items (`packages/excalidraw/data/library.ts`).
- **Binary files handling**
  - менеджмент файлів сцени (зображення тощо) у runtime pipeline (`App.tsx`, `types.ts`).
- **PWA-поведінка в app shell**
  - `registerSW()` + `VitePWA` конфіг (`index.tsx`, `vite.config.mts`).
- **Командна палітра, діалоги, app-level UI**
  - інтегровано в `excalidraw-app/App.tsx`.

## 4) Технічні обмеження / ліміти

### Технологічні та платформні обмеження

- **Node runtime**
  - мінімум `node >= 18.0.0` (root і `excalidraw-app` `package.json`).
- **Package manager**
  - зафіксовано на `yarn@1.22.22` (root `package.json`).
- **Frontend/browser targets**
  - визначені в `excalidraw-app/package.json` `browserslist`:
    - production excludes старі браузери (IE<=11, старі Safari/Edge/Chrome тощо),
    - development орієнтується на останні версії Chrome/Firefox/Safari.

### Архітектурні обмеження

- **Monorepo + workspace coupling**
  - app і пакети пов’язані через workspace структуру та alias-и Vite (`vite.config.mts`), що впливає на спосіб локальної розробки/білду.
- **Single orchestrator pattern**
  - центральна логіка редактора сконцентрована у `packages/excalidraw/components/App.tsx`; зміни часто зачіпають lifecycle/input/render/state одночасно.
- **State model split**
  - `appState` і `Scene elements` рознесені, а історія/інкременти проходять через `Store`/`History`; це ускладнює зміни без порушення undo/redo та collab-потоків.

### Config/env обмеження

- **Сильна залежність від `VITE_APP_*` env**
  - URLs, Firebase, websocket, PWA/lint flags, tracking контролюються env (`.env.development`, `.env.production`, `vite-env.d.ts`, usage in app files).
- **Collab runtime залежить від доступного websocket endpoint**
  - default dev endpoint у `.env.development`: `VITE_APP_WS_SERVER_URL=http://localhost:3002`.

### Якісні/процесні обмеження

- **Code quality gates**
  - типізація, lint, prettier, unit/integration tests закріплені root scripts (`test:typecheck`, `test:code`, `test:other`, `test`, `test:all`).
- **Відомі edge/risk з коду**
  - TODO/FIXME/HACK у `App.tsx`, `restore.ts`, `library.ts`, `selection.test.tsx` вказують на ділянки з підвищеним ризиком змін (pointer flow, sync/versioning edge-cases, multi-instance jotai scope).

## Notes

- PRD відображає поточний стан реалізації (implementation-driven), а не продуктову стратегію поза межами репозиторію.
