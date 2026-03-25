# Product Context: Excalidraw

## Для кого цей продукт?

- **Розробники та технічні спеціалісти** — архітектурні діаграми, flowcharts
- **Дизайнери** — wireframes, UI sketches
- **Викладачі** — пояснення концепцій на "дошці"
- **Команди** — brainstorming у реальному часі
- **Сторонні розробники** — інтеграція `@excalidraw/excalidraw` у власні SaaS

## Ключові UX-цілі

### 1. Zero learning curve
- Інструменти очевидні без onboarding
- Welcome screen з підказками при першому відкритті (`showWelcomeScreen`)
- Keyboard shortcuts відображаються поруч з інструментами

### 2. Hand-drawn aesthetic
- Усі форми рендеряться через `roughjs` — навмисно "нечіткий" вигляд
- Це знижує психологічний бар'єр: diagram не має бути ідеальною
- Рукописні шрифти (`Virgil`, `Caveat`, та ін.)

### 3. Speed & responsiveness
- Canvas rendering (не DOM) — плавність при великій кількості елементів
- StaticCanvas + InteractiveCanvas поділ — мінімальне перемальовування
- Throttled pointer events, RAF-based animations

### 4. Collaboration без friction
- Shareable link = зашифрований URL без необхідності аккаунту
- Real-time multiuser cursor + follow mode
- Multiplayer undo/redo (з v0.18.0)

### 5. Offline-first (PWA)
- Service Worker кешує app shell
- Шрифти кешуються `CacheFirst` 90 днів
- LocalStorage + IndexedDB для автосейву

## Основні User Scenarios

### Scenario 1: Quick sketch (solo)
```
Відкрити excalidraw.com → почати малювати → Ctrl+S → .excalidraw файл
або: Cmd+Shift+E → export PNG для презентації
```

### Scenario 2: Team brainstorming
```
Створити room (Live collaboration) → поділитись URL →
колеги приєднуються → Follow Mode → спільне малювання
→ Export shared scene→ Firebase backend storage
```

### Scenario 3: Embed у product
```
npm install @excalidraw/excalidraw →
<Excalidraw initialData={...} onChange={handleChange} /> →
SerializeAsJSON → зберегти у БД
```

### Scenario 4: AI diagram generation
```
Command palette (⌘K) → "Text to diagram" →
вставити Mermaid / prose → AI backend →
converted elements на canvas
```

### Scenario 5: File-based persistence
```
Web Share Target (PWA) → відкрити .excalidraw файл →
автоматично завантажується у canvas
```

## UI Layout

```
┌──────────────────────────────────────────────────────┐
│  [MainMenu]  [Toolbar: shapes, tools]       [Sidebar]│
│                                                       │
│              CANVAS (infinite)                        │
│                                                       │
│  [Footer: zoom, undo/redo]          [Properties panel]│
└──────────────────────────────────────────────────────┘
```

- **Toolbar** — ліворуч або зверху (залежно від form factor)
- **Properties panel** — праворуч для виділеного елемента
- **Sidebar** — бібліотека, статистика, кастомна панель (composable)
- **LayerUI** — overlay над canvas (не впливає на canvas rendering)

## Режими редактора

| Режим | `viewModeEnabled` | `zenModeEnabled` | Опис |
|---|---|---|---|
| Edit | false | false | Повний UX |
| View | true | — | Read-only, без toolbar |
| Zen | false | true | Без UI overlay, чистий canvas |

## Теми

- Light / Dark — перемикається через UI або `theme` prop
- `EXCALIDRAW_THROTTLE_RENDER` — perf flag для host apps
- CSS variables — host apps можуть кастомізувати кольори

## Метрики успіху (з коду)

- `trackEvent()` — GA analytics в `excalidraw-app`
- Events: `load`, `element`, `canvas`, `export`, `toolbar`, `collab`, `search_menu`
- Sentry — моніторинг помилок у продакшні (`excalidraw-app/sentry.ts`)
