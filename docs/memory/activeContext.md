# Excalidraw — Active Context

## Поточний стан репозиторію

- **As of**: 2026-03-25 / commit `75bb5e8`
- **Гілка**: `master`
- **Статус**: clean (немає незакомічених змін)
- **Версія пакетів**: 0.18.0
- **Дата останнього коміту**: 24 березня 2026

## Останні коміти

| Hash | Опис | Контекст |
|---|---|---|
| `4451b1e` | updates | Оновлення конфігурації CodeRabbit та PR template |
| `da795d2` | check-instructions | Перевірка інструкцій |
| `5247322` | initial | Початкове налаштування |
| `a345399` | Initial | Перший коміт |

> **Примітка**: Це fork/workshop-версія Excalidraw для навчальних цілей (agentic engineering workshop). Коміти відображають початкове налаштування, а не активну розробку фіч.

## Поточний фокус

### Workshop контекст
Репозиторій є частиною **fwdays agentic engineering workshop 2026** (day 01 homework). Основний фокус — вивчення та документування існуючої кодової бази Excalidraw.

### Активні напрямки в upstream Excalidraw (v0.18.0)

1. **AI-інтеграція**
   - TTDDialog (Text-to-Diagram) — генерація діаграм через AI
   - DiagramToCodePlugin — конвертація в код
   - Окремий AI backend (`VITE_APP_AI_BACKEND`)

2. **Collaboration вдосконалення**
   - Multiplayer undo/redo (Figma-модель, PR #7348)
   - Fractional indexing для безконфліктного ordering
   - Store increments (Durable vs Ephemeral) для sync

3. **ESM міграція**
   - Перехід з UMD на ES Modules (breaking change в 0.18.0)
   - `moduleResolution: "bundler"` в TypeScript конфігурації
   - Vite замість webpack/CRA

4. **Розширена типографіка**
   - FontPicker з extended fonts
   - CJK (Chinese/Japanese/Korean) підтримка
   - Font subsetting для SVG експорту
   - WASM-based woff2 обробка

5. **UX покращення**
   - Command Palette для швидкого пошуку
   - Scene search
   - Image cropping
   - Elbow arrows для flowcharts
   - Editable element stats

## Конфігурація інструментів

### CodeRabbit (`.coderabbit.yaml`)
- Налаштований для code review
- Оновлено в останньому коміті

### PR Template
- Шаблон для pull requests оновлено

## Відомі TODO / FIXME в коді

- Оптимізація продуктивності fractional indexing
- Multi-group selection у multiplayer режимі
- WASM завантаження шрифтів із зовнішніх URL
- Dark theme — обробка кольорів
- Стабільність Text WYSIWYG editor у тестах

## Залежності для моніторингу

- **As of**: 2026-03-25 / commit `75bb5e8`

| Пакет | Поточна версія | Примітка |
|---|---|---|
| React | 19.0.10 | Остання major версія |
| Vite | 5.0.12 | Основний build tool |
| TypeScript | 5.9.3 | Строгий режим |
| Vitest | 3.0.6 | Тестовий фреймворк |
| Socket.io | — | Realtime collaboration |
| Firebase | — | Backend services |
