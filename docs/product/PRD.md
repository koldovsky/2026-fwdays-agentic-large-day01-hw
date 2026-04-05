# Excalidraw PRD (Reverse-Engineered)

Цей PRD відновлено з поточної реалізації Excalidraw (source code + конфігурація + docs у репозиторії).
Документ описує продукт на рівні вимог і меж, без вигаданих фіч.

## Product Purpose

Excalidraw - це open-source віртуальний collaborative whiteboard для швидкого створення діаграм і скетчів у браузері.
Продукт існує у двох формах: як готовий web app (`excalidraw-app`) і як embeddable React-редактор (`@excalidraw/excalidraw`) для інтеграції у сторонні застосунки.
Ключова мета - дати low-friction досвід візуального пояснення ідей з підтримкою експорту, локального відновлення та (в app) realtime collaboration.

## Target Audience

### 1) End users (web app)

- Кому: користувачі, яким треба швидко намалювати схему/діаграму/ескіз у браузері.
- Навіщо: створення візуальних артефактів для пояснення ідей, обговорень, спільної сесії.
- Очікуваний результат: швидкий старт без складного налаштування, з можливістю ділитись результатом через export/collab.

### 2) Integrators / developers (SDK)

- Кому: команди, які хочуть вбудувати whiteboard-редактор у власний React-продукт.
- Навіщо: отримати готовий canvas editor через `<Excalidraw />` і API-колбеки, замість розробки редактора з нуля.
- Очікуваний результат: передбачувана інтеграція через npm package, peer dependencies React і documented setup-кроки.

## Key Features

### 1) Canvas drawing and editing tools

- Набір інструментів включає selection/hand, shape tools, text, line/arrow, image, eraser, frame, embeddable-related interactions.
- Додатково є action-system для редагування (group, align/distribute, history, clipboard, crop).
- Цінність: покриває базові та просунуті сценарії diagramming/whiteboarding.

### 2) Export and file outputs

- Підтримуються експортні потоки для canvas/SVG (включно з експортною логікою для frame/content).
- Є save/load JSON pipeline для сцени.
- Цінність: користувач може винести результат у стандартні формати для поширення або повторного імпорту.

### 3) Realtime collaboration (app-level)

- У web app реалізовано синхронізацію сцени, presence/cursors і мережевий collab lifecycle.
- Мережевий шар організовано через collab-модулі app shell, а не як обов'язкову частину npm API.
- Цінність: кілька користувачів можуть працювати над однією сценою одночасно.

### 4) Local persistence and recovery (app-level)

- App зберігає елементи та app state локально, окремо обробляє binary files через IndexedDB.
- Локальна персистентність працює як захист від втрати прогресу між сесіями.
- Цінність: користувач може продовжити роботу після перезавантаження/повернення.

### 5) Embeddable React editor SDK

- `@excalidraw/excalidraw` постачається як React component для інтеграції у сторонні продукти.
- Мінімальний setup включає CSS import і контейнер з ненульовою висотою.
- Цінність: швидке додавання whiteboard-можливостей у власний продукт інтегратора.

### 6) Reusable library items

- У продукті є library-сутність для перевикористовуваних наборів елементів сцени.
- Підтримуються сценарії оновлення/персистентності library items.
- Цінність: пришвидшує повторні робочі сценарії та стандартизацію шаблонів.

### 7) Images and embeddables in scene model

- Модель сцени підтримує image/binary files і embeddable elements як окремі доменні сутності.
- Це дозволяє поєднувати hand-drawn diagramming з медіа та зовнішнім контентом.
- Цінність: гнучкіші дошки для змішаних типів контенту.

## Technical Constraints / Non-goals

### Product boundaries

- Excalidraw не зводиться лише до web app: це одночасно app + embeddable library.
- Не всі можливості `excalidraw-app` є частиною публічного API пакета `@excalidraw/excalidraw`.

### Runtime and integration constraints

- Tooling у monorepo: Yarn Classic (`yarn@1.22.22`), Node engines `>=18` (локальний baseline у проектних docs/CI - Node 20.x).
- Для інтеграторів діють peer dependencies React/ReactDOM (`^17 || ^18 || ^19`).
- Для SSR-середовищ редактор має рендеритись client-side (з `ssr: false` у прикладах README).

### Architecture constraints

- Collaboration і частина persistence-поведінки реалізовані на app-рівні (`excalidraw-app/*`), а не як універсальний мережевий модуль бібліотеки.
- Core editor опирається на strict state/action/history pipeline; зміни в цих зонах мають високий ризик регресій без додаткової валідації.

### Explicit non-goals

- PRD не вводить вигадані фічі (наприклад, AI drawing) і не розширює scope поза наявною реалізацією.
- Документ не замінює технічну архітектуру; деталі runtime-патернів у `docs/technical/*` та `docs/memory/*`.

## Evidence (source-backed)

- Product positioning:
  - `excalidraw-app/index.html`
  - `packages/excalidraw/package.json`
  - `LICENSE`
- Embedding contract:
  - `packages/excalidraw/README.md`
  - `packages/excalidraw/types.ts`
- Core features (tools/actions/export):
  - `packages/excalidraw/components/shapes.tsx`
  - `packages/excalidraw/actions/*`
  - `packages/excalidraw/scene/export.ts`
- Collaboration and app-level orchestration:
  - `excalidraw-app/collab/Collab.tsx`
  - `excalidraw-app/collab/Portal.tsx`
- Local persistence and binary files:
  - `excalidraw-app/data/LocalData.ts`
  - `excalidraw-app/data/localStorage.ts`
- Domain semantics:
  - `docs/product/domain-glossary.md`
  - `docs/memory/productContext.md`

