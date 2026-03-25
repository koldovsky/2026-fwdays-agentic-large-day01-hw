# Excalidraw — Product Context

## UX-цілі

### Головна UX-філософія
Excalidraw прагне бути **простим, інтуїтивним інструментом** для створення діаграм і ескізів, який відчувається як малювання на папері. Hand-drawn стиль (roughjs) навмисно знижує "бар'єр перфекціонізму" — користувачі менше турбуються про ідеальність і більше фокусуються на ідеях.

### Ключові UX-цілі

1. **Мінімальний поріг входу** — малювання починається одразу, без реєстрації чи налаштувань
2. **Welcome Screen** з підказками (`/packages/excalidraw/components/welcome-screen/`)
3. **Responsive UI** — адаптація під три form-фактори: `phone`, `tablet`, `desktop`
4. **Офлайн-first** — робота без інтернету через IndexedDB/localStorage
5. **Realtime collaboration** — безшовне спільне редагування

## Користувацькі сценарії

### 1. Малювання та створення
- **Інструменти**: фігури (rectangle, diamond, ellipse), лінії, стрілки, текст, фрейми
- **Canvas interaction**: створення елементів через drag на полотні
- **Elbow arrows** — автоматичні "ломані" стрілки для flowchart
- **Image cropping** — обрізка зображень прямо в редакторі

### 2. Виділення та маніпуляція
- **Lasso selection** — вільне виділення елементів
- **Snapping** — прив'язка до точок для вирівнювання (`selectionSnapPoints`)
- **Transform handles** — зміна розміру, обертання
- **Групування** — об'єднання елементів у групи (`groupIds`)

### 3. Спільна робота (Collaboration)
- **Live presence** — курсори інших користувачів у реальному часі
- **Multiplayer undo/redo** — Figma-натхненна модель (PR #7348)
- **Шерінг** — генерація посилань для спільного доступу
- **Tab sync** — синхронізація між вкладками браузера

### 4. Пошук та навігація
- **Command Palette** — швидкий пошук команд (`/packages/excalidraw/components/CommandPalette/`)
- **Scene search** — пошук по елементах сцени
- **Keyboard shortcuts** — повний набір хоткеїв (HelpDialog)

### 5. Експорт та інтеграція
- **Формати**: JSON, PNG, SVG (PDF доступний лише через Web-Embeds via simplePDF)
- **Бібліотеки** — імпорт/експорт колекцій елементів
- **Embed** — вбудовування як React-компонент у сторонні додатки

### 6. AI-функції
- **Text-to-Diagram (TTD)** — генерація діаграм з текстового опису (`TTDDialog`)
- **Diagram-to-Code** — конвертація діаграм у код (`DiagramToCodePlugin`)
- **AI Backend** — окремий сервіс (`VITE_APP_AI_BACKEND`)

## Доступність (Accessibility)

- **ARIA атрибути** — `aria-label`, `aria-keyshortcuts` на інтерактивних елементах
- **Keyboard navigation** — повна підтримка клавіатурних скорочень
- **OS-aware shortcuts** — автоматичне визначення ОС (⌘ на macOS, Ctrl на Windows)
- **Help Dialog** — довідка з усіма хоткеями

## Адаптивний дизайн

### Form-фактори
| Тип | Визначення | UI режим |
|---|---|---|
| `phone` | User-Agent parsing | `mobile` — мінімалістичний інтерфейс |
| `tablet` | User-Agent parsing | `compact` — компактна панель |
| `desktop` | За замовчуванням | `full` — повний інтерфейс |

### Адаптивні елементи
- **Styles Panel** — три режими: `compact`, `full`, `mobile`
- **Sidebar** — мінімальна ширина через `MQ_RIGHT_SIDEBAR_MIN_WIDTH`
- **CSS клас**: `excalidraw--mobile` для мобільних стилів
- **Mobile action buttons** — glass background стилізація

## Теми

- **Light / Dark theme** — перемикання через `useHandleAppTheme.ts`
- **Системна тема** — автоматичне визначення prefers-color-scheme

## Ключові UI-компоненти

| Компонент | Шлях | Призначення |
|---|---|---|
| WelcomeScreen | `/packages/excalidraw/components/welcome-screen/` | Онбординг |
| HelpDialog | `/packages/excalidraw/components/HelpDialog.tsx` | Довідка |
| CommandPalette | `/packages/excalidraw/components/CommandPalette/` | Пошук команд |
| Sidebar | `/packages/excalidraw/components/Sidebar/` | Бічна панель |
| ColorPicker | `/packages/excalidraw/components/ColorPicker/` | Вибір кольорів |
| FontPicker | `/packages/excalidraw/components/FontPicker/` | Вибір шрифтів |
| TTDDialog | `/packages/excalidraw/components/TTDDialog/` | AI Text-to-Diagram |
| LiveCollaboration | `/packages/excalidraw/components/live-collaboration/` | Колаборація |
| ConfirmDialog | `/packages/excalidraw/components/ConfirmDialog.tsx` | Підтвердження дій |
