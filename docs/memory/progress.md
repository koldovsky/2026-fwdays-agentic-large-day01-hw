# Excalidraw — Прогрес проєкту

## Поточна версія: 0.18.0 (11 березня 2025)

## Shipped фічі (v0.18.0)

### Нові можливості
- [x] **Command Palette** — пошук команд з клавіатури
- [x] **Multiplayer undo/redo** — Figma-натхненна модель (#7348)
- [x] **Editable element stats** — редагування властивостей елементів
- [x] **Text element wrapping** — перенос тексту
- [x] **Font Picker** — розширений вибір шрифтів
- [x] **CJK font support** — китайські, японські, корейські шрифти
- [x] **Font subsetting для SVG** — оптимізація розміру експорту
- [x] **Elbow arrows** — ламані стрілки для flowcharts
- [x] **Scene search** — пошук елементів на сцені
- [x] **Image cropping** — обрізка зображень
- [x] **Element linking** — система зв'язків між елементами

### Архітектурні зміни (breaking)
- [x] **ESM формат** — перехід з UMD на ES Modules
- [x] **Vite** — міграція з webpack/CRA
- [x] **moduleResolution: "bundler"** — нова TS конфігурація
- [x] **Монорепо** — розділення на пакети (common, element, math, utils, excalidraw)

### API зміни
- [x] **onMount / onInitialize / onUnmount** — lifecycle events
- [x] **onStateChange()** — підписка на зміни стану (selector support)
- [x] **api.onEvent()** — уніфікована система подій
- [x] **ExcalidrawAPIProvider** — Provider + useExcalidrawAPI() hooks
- [x] **Async export** — onExport з підтримкою async generators

## Раніше shipped (до v0.18.0)

### Core функціонал
- [x] Hand-drawn рендеринг (roughjs)
- [x] Базові фігури: rectangle, diamond, ellipse, line, arrow, text
- [x] Realtime collaboration (Socket.io)
- [x] Firebase інтеграція (auth, storage)
- [x] Експорт: JSON, PNG, SVG
- [x] Бібліотеки елементів
- [x] Undo/Redo (базова версія)
- [x] Dark/Light theme
- [x] i18n (інтернаціоналізація)
- [x] PWA підтримка
- [x] Keyboard shortcuts
- [x] Copy/Paste
- [x] Drag & Drop
- [x] Zoom & Pan
- [x] Grid mode

### Інфраструктура
- [x] Monorepo (Yarn Workspaces)
- [x] CI/CD (GitHub Actions — 11+ workflows)
- [x] Docker (multi-stage build)
- [x] Vercel деплой
- [x] Sentry error tracking
- [x] Bundle size tracking (size-limit)
- [x] Test coverage reporting
- [x] Automated releases
- [x] Semantic PR validation

## In Progress / Emerging

### AI інтеграція
- [ ] **Text-to-Diagram (TTD)** — генерація діаграм через AI (компонент є, backend окремий)
- [ ] **Diagram-to-Code** — конвертація діаграм у код (plugin architecture)

### Відомі issues для вирішення
- [ ] Оптимізація fractional indexing продуктивності
- [ ] Multi-group selection у multiplayer
- [ ] WASM завантаження шрифтів із зовнішніх URL
- [ ] Dark theme color handling вдосконалення
- [ ] Text WYSIWYG editor стабільність у тестах

## Метрики якості

### Test Coverage (пороги)
| Метрика | Поріг |
|---|---|
| Lines | 60% |
| Branches | 70% |
| Functions | 63% |
| Statements | 60% |

### Browser Support
- **Production**: >0.2%, IE>11, Safari>=12, Edge>=79, Chrome>=70
- **Development**: latest Chrome, Firefox, Safari

### Пакети та їх статус

| Пакет | Версія | Статус |
|---|---|---|
| `@excalidraw/excalidraw` | 0.18.0 | Stable, NPM published |
| `@excalidraw/common` | 0.18.0 | Stable |
| `@excalidraw/element` | 0.18.0 | Stable |
| `@excalidraw/math` | 0.18.0 | Stable |
| `@excalidraw/utils` | 0.18.0 | Stable |
| `excalidraw-app` | 1.0.0 | Production (excalidraw.com) |

## Workshop контекст

Цей репозиторій є частиною **fwdays agentic engineering workshop 2026** (day 01 homework). Поточна робота зосереджена на:
- [x] Початкове налаштування репозиторію
- [x] Конфігурація CodeRabbit та PR template
- [x] Створення Memory Bank документації
- [ ] Подальші workshop завдання
