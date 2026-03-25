# Excalidraw — Прогрес проєкту

## Поточна версія: 0.18.0 (11 березня 2025)

## Реалізовані можливості (v0.18.0)

### Нові можливості
- [x] **Command Palette** — пошук команд з клавіатури
- [x] **Multiplayer undo/redo** — модель на основі Figma (#7348)
- [x] **Editable element stats** — редагування властивостей елементів
- [x] **Text element wrapping** — автоматичний перенос тексту
- [x] **Font Picker** — розширений вибір шрифтів
- [x] **CJK font support** — підтримка китайських, японських, корейських шрифтів
- [x] **Font subsetting** — оптимізація розміру SVG-експорту
- [x] **Elbow arrows** — ламані стрілки для блок-схем
- [x] **Scene search** — пошук елементів на сцені
- [x] **Image cropping** — обрізка зображень
- [x] **Element linking** — система посилань між елементами

### Архітектурні зміни (breaking)
- [x] **ESM** — перехід з UMD на ES Modules
- [x] **Vite** — міграція з webpack/CRA на Vite
- [x] **moduleResolution: "bundler"** — нова конфігурація TypeScript
- [x] **Monorepo** — розділення на пакети (common, element, math, utils, excalidraw)

### Зміни API
- [x] **onMount / onInitialize / onUnmount** — події життєвого циклу
- [x] **onStateChange()** — підписка на зміни стану (підтримка селекторів)
- [x] **api.onEvent()** — уніфікована система подій
- [x] **ExcalidrawAPIProvider** — провайдер + хуки useExcalidrawAPI()
- [x] **Async export** — асинхронний експорт через onExport

## Реалізовано раніше (до v0.18.0)

### Основний функціонал
- [x] **Hand-drawn rendering** — рукописний стиль малювання (RoughJS)
- [x] **Shape primitives** — базові фігури (прямокутник, ромб, еліпс, лінія, стрілка, текст)
- [x] **Realtime collaboration** — колаборація в реальному часі (Socket.io)
- [x] **Firebase integration** — аутентифікація, зберігання, база даних
- [x] **Export** — експорт у JSON, PNG, SVG
- [x] **Element libraries** — бібліотеки елементів
- [x] **Undo/Redo** — скасування/повтор дій (базова версія)
- [x] **Dark/Light theme** — темна та світла теми
- [x] **i18n** — інтернаціоналізація
- [x] **PWA** — підтримка Progressive Web App
- [x] **Keyboard shortcuts** — гарячі клавіші
- [x] **Copy/Paste** — копіювання та вставка
- [x] **Drag & Drop** — перетягування
- [x] **Zoom & Pan** — масштабування та прокручування
- [x] **Grid mode** — режим сітки

### Інфраструктура
- [x] **Monorepo** — Yarn Workspaces
- [x] **CI/CD** — GitHub Actions (11+ workflows)
- [x] **Docker** — багатоетапна збірка
- [x] **Vercel** — деплой на Vercel
- [x] **Sentry** — відстеження помилок
- [x] **Bundle size tracking** — контроль розміру бандлу (size-limit)
- [x] **Test coverage** — звіти покриття тестами
- [x] **Automated releases** — автоматичні релізи
- [x] **Semantic PR validation** — валідація назв PR

## В розробці / Заплановано

### AI-інтеграція
- [ ] **Text-to-Diagram (TTD)** — генерація діаграм через AI (компонент є, бекенд окремий)
- [ ] **Diagram-to-Code** — конвертація діаграм у код (архітектура плагінів)

### Відомі проблеми для вирішення
- [ ] **Fractional indexing** — оптимізація продуктивності
- [ ] **Multi-group selection** — виділення груп у мультиплеєрі
- [ ] **WASM font loading** — завантаження шрифтів із зовнішніх URL
- [ ] **Dark theme colors** — вдосконалення обробки кольорів
- [ ] **Text WYSIWYG editor** — стабільність у тестах

## Метрики якості

### Test Coverage (пороги)
| Метрика | Поріг |
|---|---|
| Lines | 60% |
| Branches | 70% |
| Functions | 63% |
| Statements | 60% |

### Browser Support
- **Production**: >0.2%, not dead, not ie <= 11, Safari>=12, Edge>=79, Chrome>=70
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
