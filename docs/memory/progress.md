# Прогрес проєкту (Memory Bank)

## Пов’язана документація

- **Технічна** ([`docs/technical/`](../technical/)): [architecture.md](../technical/architecture.md) · [dev-setup.md](../technical/dev-setup.md)
- **Продуктова** ([`docs/product/`](../product/)): [PRD.md](../product/PRD.md) · [domain-glossary.md](../product/domain-glossary.md)

Знімок стану **на момент оновлення документа** (узгоджено з файловою системою репозиторію та одним повним прогоном тестів). Репозиторій: **`excalidraw-monorepo`** (`package.json`: `name`, `workspaces`).

---

## Навчальний контекст (Day 1 workshop)

Чеклист із `.github/PULL_REQUEST_TEMPLATE.md` порівняно з наявністю файлів у робочій копії:

### Обов’язкові пункти

| Пункт | Статус | Джерело перевірки |
|--------|--------|-------------------|
| `.cursorignore` у корені | **Є** | файл `.cursorignore` (непорожній) |
| `docs/memory/projectbrief.md` | **Є** | `docs/memory/projectbrief.md` |
| `docs/memory/techContext.md` | **Є** | `docs/memory/techContext.md` |
| `docs/memory/systemPatterns.md` | **Є** | `docs/memory/systemPatterns.md` |
| `docs/technical/architecture.md` | **Є** | `docs/technical/architecture.md` |
| `docs/product/domain-glossary.md` | **Є** | `docs/product/domain-glossary.md` |
| `docs/product/PRD.md` | **Є** | [PRD.md](../product/PRD.md) |

### Бонусні пункти (з того ж шаблону)

| Пункт | Статус |
|--------|--------|
| `docs/memory/productContext.md` | **Є** |
| `docs/memory/activeContext.md` | **Є** |
| `docs/memory/progress.md` | **Цей файл** |
| `docs/memory/decisionLog.md` | **Є** |
| `docs/technical/dev-setup.md` | **Є** ([dev-setup.md](../technical/dev-setup.md)) |
| 3+ недокументовані поведінки | **Зафіксовано** у [decisionLog.md](./decisionLog.md) (розділ «Незадокументована поведінка», 7 пунктів) |

---

## Стан кодової бази (upstream Excalidraw)

- **Монорепо:** Yarn workspaces — `excalidraw-app`, `packages/*`, `examples/*` (`package.json`).
- **Точка входу веб-застосунку:** `excalidraw-app/index.tsx` — `registerSW()`, рендер `<ExcalidrawApp />` з `./App`.
- **Тестовий раннер:** Vitest; конфіг `vitest.config.mts` (`environment: "jsdom"`, `setupFiles: ["./setupTests.ts"]`, аліаси на `packages/*`).
- **Якість (скрипти кореня):** `test:all` = typecheck + eslint + prettier + `test:app --watch=false` (`package.json`).

---

## Результат останньої верифікації тестів

Виконано в корені репозиторію: `yarn test:app --watch=false`.

- **Файли тестів:** 102 пройшли успішно.
- **Тести:** 1313 пройдено, 46 пропущено (`skipped`), 1 позначено як `todo` (усього 1360 у звіті Vitest).
- **Спостереження:** у `stderr` під час тестів `excalidraw-app` з’являється повідомлення про парсинг Firebase-конфігу (`undefined`) — тести при цьому позначаються як пройдені (`LanguageList.test.tsx`, `MobileMenu.test.tsx`).

Ці цифри відображають **поточний** стан після одного прогону; після змін у коді їх потрібно оновлювати повторним запуском.

---

## Документація Memory Bank (`docs/memory/`)

Наявні файли (перевірено списком у `docs/**/*.md`):

- `projectbrief.md` — опис проєкту та монорепо.
- `techContext.md` — стек, версії, команди.
- `systemPatterns.md` — архітектурні шари та патерни редактора.
- `productContext.md` — продуктовий/UX контекст.
- `activeContext.md` — поточний фокус роботи.
- `progress.md` — цей документ про прогрес і статус артефактів.
- `decisionLog.md` — журнал інженерних рішень, узгоджений з конфігами репо.

## Інша документація під `docs/`

- [docs/technical/architecture.md](../technical/architecture.md) — архітектура монорепо, потоки даних, рендер, залежності пакетів.
- [docs/technical/dev-setup.md](../technical/dev-setup.md) — локальне середовище та перші кроки.
- [docs/product/PRD.md](../product/PRD.md) — продуктові вимоги (reverse-engineered PRD).
- [docs/product/domain-glossary.md](../product/domain-glossary.md) — доменний словник (Element, Scene, AppState, Action тощо).

---

## Що логічно зробити далі (за чеклистом PR)

- За бажанням: оновлювати [PRD](../product/PRD.md) / [dev-setup](../technical/dev-setup.md) після змін у репо; документувати додаткові неочевидні поведінки.
- Після змін у коді або документації: оновити цей файл (та при потребі `activeContext.md`) і за потреби перезапустити `yarn test:app --watch=false` для актуальних цифр Vitest.

---

## Обмеження цього документа

- Статус файлів і каталогів — за **фактичною** наявністю у репозиторії, без припущень про незакомічені зміни.
- Покриття тестами й проходження CI не еквівалентні «готовності продукту»; тут зафіксовано лише результат одного локального прогону Vitest.
