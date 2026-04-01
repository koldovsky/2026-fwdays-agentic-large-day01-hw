# Product Requirements Document — Excalidraw (reverse-engineered)

Документ реконструйовано з вихідного коду монорепозиторію `excalidraw-monorepo`. Усі факти верифіковані проти source code.

---

## 1. Product Purpose

Excalidraw — це **безкоштовний відкритий whiteboard-інструмент**, який дозволяє швидко створювати діаграми, схеми та нотатки з характерним **hand-drawn стилем**. Офіційний опис із PWA-маніфесту: *"Excalidraw is a whiteboard tool that lets you easily sketch diagrams that have a hand-drawn feel to them"* (поле `description` у `defineConfig` всередині `excalidraw-app/vite.config.mts`).

Паралельно проєкт надає **React-компонент `@excalidraw/excalidraw`** для вбудовування редактора у сторонні застосунки (`packages/excalidraw/package.json`: *"Excalidraw as a React component"*).

---

## 2. Target Audience

### Кінцеві користувачі (excalidraw.com)

- **Розробники та інженери** — швидке скетчування архітектурних діаграм, sequence diagrams, flowcharts під час обговорень.
- **Дизайнери та продуктові команди** — wireframes, user flow diagrams без формальності Figma/Visio.
- **Викладачі та студенти** — пояснювальні схеми з мінімальним порогом входу.
- **Будь-хто, кому потрібна дошка** — zero-friction старт: без реєстрації, миттєве збереження в браузері.

### Інтегратори (npm-пакет)

- **React-розробники** — вбудовують `<Excalidraw>` у власні продукти; публічний API через `useExcalidrawAPI`, кастомізація `MainMenu`, `Footer`, `WelcomeScreen`.
- Приклади: `examples/with-nextjs`, `examples/with-script-in-browser`.

---

## 3. Key Features

### 3.1 Інструменти малювання

16 типів інструментів (тип `ToolType` у `packages/excalidraw/types.ts`):

| Категорія | Інструменти |
|-----------|-------------|
| Фігури | `rectangle`, `diamond`, `ellipse` |
| Лінії | `arrow`, `line`, `freedraw` |
| Контент | `text`, `image`, `embeddable` |
| Структура | `frame`, `magicframe` |
| Навігація / утиліти | `selection`, `lasso`, `eraser`, `hand`, `laser` |

Підтримується **tool lock** (`Q`) — інструмент залишається активним після малювання.

### 3.2 Hand-drawn візуальний стиль

- Рендеринг через **roughjs** (`packages/excalidraw/package.json`).
- Шрифт **Virgil** для hand-drawn тексту (`packages/excalidraw/fonts/Virgil/`).
- Бібліотека **perfect-freehand** для природного вигляду вільного малювання.
- Регульований `roughness` на кожному елементі.

### 3.3 Експорт та серіалізація

- **PNG / JPEG** — `exportToBlob` з опцією `exportEmbedScene` (JSON у PNG metadata).
- **SVG** — `exportToSvg` з підтримкою dark mode.
- **Clipboard** — `exportToClipboard` (PNG, SVG, JSON).
- **JSON (.excalidraw)** — `serializeAsJSON` / `saveAsJSON` (`packages/excalidraw/data/json.ts`).
- Налаштування: `exportBackground`, `exportWithDarkMode`, `exportScale`.

### 3.4 Колаборація в реальному часі

- **Socket.IO** транспорт з E2E шифруванням (AES-GCM, `packages/excalidraw/data/encryption.ts`).
- **Кімнати** за URL-хешем `#room=<roomId>,<roomKey>` — ключ ніколи не передається серверу.
- **Pointer broadcasting** — видимі курсори інших учасників (`MOUSE_LOCATION`, `IDLE_STATUS`).
- **Firebase** для persistence сцен та файлів у колаборативних кімнатах.

### 3.5 Sharing (Share Link)

- Зашифрований payload → бекенд, URL вигляду `#json=id,key`.
- `exportToBackend` / `importFromBackend` (`excalidraw-app/data/index.ts`).
- Файли зберігаються у Firebase Storage.

### 3.6 Бібліотека елементів (Library)

- Збереження наборів елементів як `LibraryItem` для повторного використання.
- Persistence в IndexedDB (`LibraryIndexedDBAdapter`).
- UI: бічна панель `LibraryMenu` з drag-and-drop вставкою на canvas.
- Статуси: `published` / `unpublished`.

### 3.7 Binding та smart arrows

- Стрілки автоматично прив'язуються до фігур (`startBinding` / `endBinding`).
- **Elbow arrows** — автоматичне прокладання ортогонального маршруту.
- При переміщенні фігури стрілка слідує за нею.
- Текст може бути bound до контейнера (`containerId`).

### 3.8 Frames

- Логічні контейнери для групування елементів (аналог artboard у Figma); типи елементів `frame` / `magicframe` у моделі (`packages/element/src/types.ts`).
- **Magic Frame** — інструмент `magicframe` у `ToolType` і елемент `ExcalidrawMagicFrameElement`; UI-шлях генерації через `onMagicFrameGenerate` у `packages/excalidraw/components/App.tsx`. Запит до зовнішнього сервісу задається змінною середовища **`VITE_APP_AI_BACKEND`** (оголошення в `packages/excalidraw/vite-env.d.ts`). Це **опційна клієнтська інтеграція**, а не серверний модуль у цьому репозиторії.
- Clip rendering при експорті.

### 3.9 Image support

- Drag-and-drop та paste зображень на canvas.
- **Cropping** — `crop` rect, drag-handles, mask/clip у рендерері.
- Підтримка `scale` та `status` (`pending` / `saved` / `error`).

### 3.10 Mermaid import

- Paste-детекція Mermaid-синтаксису з автоматичною конвертацією.
- Ліниве завантаження `@excalidraw/mermaid-to-excalidraw`.
- UI через TTD Dialog (`MermaidToExcalidraw.tsx`).

### 3.11 Search

- Пошук по текстових елементах і frame-іменах.
- Debounce, scroll-to-match, keyboard shortcut `Ctrl+F`.
- Реалізація на Jotai-атомах (`SearchMenu.tsx`).

### 3.12 Grid та snapping

- Конфігурований grid (`gridSize`, `gridStep`, `gridModeEnabled`).
- Object snap (`objectsSnapModeEnabled`) — прив'язка до сусідніх елементів.
- Midpoint snapping для точного позиціонування.

### 3.13 PWA та офлайн

- Service worker через `VitePWA` з auto-update.
- Runtime caching для шрифтів, локалей, чанків.
- File handler для `.excalidraw` файлів, share target.

### 3.14 Інтернаціоналізація

- **57 JSON-файлів перекладів** у `packages/excalidraw/locales/` (усі `*.json` у каталозі, окрім `percentages.json`); окремо **`percentages.json`** — метадані завершеності перекладів.
- Поріг відображення мови в UI: ≥85% завершеності (`COMPLETION_THRESHOLD` в `i18n.ts`).
- RTL-підтримка.

### 3.15 Темна тема

- Перемикання `THEME.LIGHT` / `THEME.DARK` (shortcut `Shift+Alt+D`).
- `exportWithDarkMode` для експорту.
- Persistence вибору теми в localStorage.

### 3.16 Keyboard shortcuts та Command Palette

- Розгалужена система shortcuts (`packages/excalidraw/actions/shortcuts.ts`): інструменти, z-order, grouping, zoom, flip, стилі тощо.
- **Command Palette** (`Ctrl+/` або `Ctrl+Shift+P`) для швидкого доступу до дій.

### 3.17 Embeddable content

- Вбудовування зовнішнього контенту (YouTube, GitHub Gist тощо) як `embeddable` / `iframe` елементів.
- URL-паттерни для автодетекції (`packages/element/src/embeddable.ts`).

---

## 4. Non-goals / Constraints

### Що продукт НЕ робить

1. **Немає серверного рендерингу (SSR)** — клієнтський застосунок; для Next.js потрібен `dynamic(..., { ssr: false })` (`packages/excalidraw/README.md`).

2. **Немає вбудованої автентифікації** — open-source версія не має системи акаунтів. Cookie `excplus-auth` обслуговує лише комерційний **Excalidraw+** (SaaS), що виходить за межі OSS-репо.

3. **Немає вбудованого AI-сервера в OSS-репозиторії** — реалізація бекенду для Text-to-Diagram / подібних сценаріїв не входить у цей код; застосунок може звертатися до **зовнішнього** endpoint, якщо він налаштований (`VITE_APP_AI_BACKEND`, див. `packages/excalidraw/vite-env.d.ts` та виклики з `App.tsx`). Умови й доступність такого сервісу — поза межами відкритого коду.

4. **Не є інструмент для pixel-perfect дизайну** — hand-drawn стиль є свідомим рішенням; Excalidraw не конкурує з Figma/Sketch у точності.

5. **Немає вбудованої бази даних** — persistence через localStorage/IndexedDB (клієнт) та Firebase (колаборація); власного серверного сховища немає.

6. **Не підтримує SVG selection rendering** — `"Selection rendering is not supported for SVG"` (`renderer/staticSvgScene.ts`).

7. **Обмежений mobile UX** — transform handles для лінійних елементів відключені на мобільних як workaround; повноцінне рішення відкладено.

### Технічні обмеження

- **View mode** — в режимі перегляду відключено редагування, double-click, більшість UI-панелей; лише навігація та zoom.
- **`COMPLEX_BINDINGS` за замовчуванням off** — розширена модель binding ще не стабільна.
- **Undo/redo при rebinding** — відомі edge-cases (#7348); binding + history consistency не повністю вирішена.
- **Browser-only** — залежність від Canvas API, Web Crypto API, IndexedDB.

---

## 5. Technical Context (summary)

| Аспект | Рішення |
|--------|---------|
| Frontend | React 19 + TypeScript (`excalidraw-app/package.json`: `"react": "19.0.0"`) |
| State | React `setState` (AppState) + Jotai (атоми) + Scene (елементи) |
| Rendering | HTML Canvas (2 шари: static + interactive) |
| Build | Vite (app) + esbuild (packages) |
| Monorepo | Yarn workspaces, 5 пакетів у `packages/` (`common`, `element`, `excalidraw`, `math`, `utils`) |
| Tests | Vitest |
| Persistence | localStorage, IndexedDB (idb-keyval), Firebase |
| Realtime | Socket.IO + AES-GCM encryption |
| PWA | vite-plugin-pwa + Workbox |
| i18n | Custom i18n з dynamic import локалей |
| Error tracking | Sentry |
