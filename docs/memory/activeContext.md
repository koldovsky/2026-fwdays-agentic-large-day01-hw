# Active Context

## Поточний стан (2026-03-25)

### Гілка

`day1/Alex-krava` (відгалужена від `master`)

## Поточний фокус

### Завдання дня 1 (homework)

Це **навчальний проєкт** у рамках курсу "Agentic IDE 2026 (fwdays)".
Мета — практикувати роботу з AI-агентами в IDE (Claude Code / Cursor) на реальній кодовій базі.

Поточна задача:

- Дослідити Excalidraw-монорепо
- Створити Memory Bank у `docs/memory/` для структурованого контексту
- Файли: `productContext.md`, `activeContext.md`, `progress.md`, `decisionLog.md`

---

## Активні файли

| Файл | Статус | Нотатка |
|------|--------|---------|
| `docs/memory/productContext.md` | ✅ Готово | UX-цілі, сценарії |
| `docs/memory/activeContext.md` | ✅ Готово | Цей файл |
| `docs/memory/progress.md` | ✅ Готово | Прогрес проєкту |
| `docs/memory/decisionLog.md` | ✅ Готово | Ключові рішення |
| `docs/memory/projectbrief.md` | ✅ Готово | Загальний опис проєкту |
| `docs/memory/techContext.md` | ✅ Готово | Стек технологій |
| `docs/memory/systemPatterns.md` | ✅ Готово | Архітектурні патерни |

---

## Архітектурний контекст

### Де ми зараз у кодовій базі

**Рівень застосунку (`excalidraw-app/`):**

- `App.tsx` — головна orchestration логіка (~40KB), ключовий файл
- `collab/Collab.tsx` — менеджер реального часу
- `components/AI.tsx` — AI-інтеграція (є точка для розширення)

**Рівень бібліотеки (`packages/excalidraw/`):**

- `renderer/` — canvas-рендеринг (InteractiveCanvas + StaticCanvas)
- `scene/` — immutable стан сцени
- `actions/` — 100+ action-обробників

### Відомі точки розширення

- `renderTopRightUI` prop — кастомні кнопки в тулбарі
- `onChange` callback — підписка на зміни стану
- `onPointerUpdate` — трекінг курсорів
- `excalidrawAPI` ref — програмний доступ до методів

---

## Наступні можливі кроки

- [ ] Дослідити `excalidraw-app/components/AI.tsx` для AI-фіч
- [ ] Переглянути `packages/excalidraw/index.tsx` (публічний API бібліотеки)
- [ ] Запустити dev-сервер: `yarn start`
- [ ] Запустити тести: `yarn test`

---

## Середовище розробки

```bash
# Запуск
yarn start          # Dev на port 3001

# Збірка
yarn build          # Production build

# Тести
yarn test           # Vitest

# Лінт
yarn fix            # ESLint + Prettier
```

**Node.js:** >= 18.0.0
**Package manager:** Yarn 1.22.22

## Details

For detailed architecture → see [docs/technical/architecture.md](../technical/architecture.md)
For domain glossary → see [docs/product/domain-glossary.md](../product/domain-glossary.md)
