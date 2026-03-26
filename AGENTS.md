# AGENTS.md — контекст для AI (Cursor та ін.)

Цей файл допомагає **новій сесії** швидко зорієнтуватися в репозиторії. Деталі не дублюються тут — лише **куди дивитися** і мінімальні факти.

## Що це за проєкт

**Форк / worktree monorepo Excalidraw**: веб-редактор діаграм (whiteboard) + npm-пакет `@excalidraw/excalidraw` для вбудовування. Продуктовий застосунок — `excalidraw-app` (Vite); ядро — `packages/excalidraw`, модель елементів — `packages/element`.

## Memory Bank

**Старт сесії:** `projectbrief` → `productContext` → `techContext` → `systemPatterns`. **Актуальне:** `activeContext` → `progress` → `decisionLog`.

| Файл | Зміст |
| --- | --- |
| `docs/memory/projectbrief.md` | Мета, карта монорепо |
| `docs/memory/productContext.md` | Користувачі, сценарії, продуктові обмеження |
| `docs/memory/techContext.md` | Стек, версії, **команди `yarn`** |
| `docs/memory/systemPatterns.md` | `AppState`, Actions, пакети, рендеринг (огляд) |
| `docs/memory/activeContext.md` | Поточний фокус (оновлюй під задачу) |
| `docs/memory/progress.md` | Що зроблено в доках/інфраструктурі форку |
| `docs/memory/decisionLog.md` | Зафіксовані рішення (легкі ADR) |

Перевірка воркшопу може вимагати лише підмножину файлів; повний набір — для щоденної роботи.

## Спека та технічна документація (SSD)

- **`docs/spec/SSD.md`** — як узгоджено вести зміни: PRD → глосарій → архітектура → код.
- **`docs/product/PRD.md`** — продуктові очікування (reverse-engineered).
- **`docs/product/domain-glossary.md`** — терміни домену з прив’язкою до коду (`AppState`, `ExcalidrawElement`, …).
- **`docs/technical/architecture.md`** — потоки даних, пакети, діаграми, тести, інтеграції.

Перед зміною поведінки або публічного API варто оновлювати відповідні розділи спеки, а Memory Bank — лише якщо змінились ключові команди/патерни.

## Мінімальні команди (корінь репо)

Менеджер пакетів: **Yarn 1** (workspaces). Не покладатися на `npm install` як на основний шлях.

- `yarn start` — дев-збірка застосунку
- `yarn build:packages` — збірка workspace-пакетів перед вбудовуванням
- `yarn test` / `yarn test:app` — Vitest
- `yarn test:all` — typecheck + lint + prettier + тести

Повний перелік і пояснення: `docs/memory/techContext.md` та кореневий `package.json` → `scripts`.

## Конвенції для агентів

- Зміни в моделі сцени: спочатку `packages/element`, потім UI в `packages/excalidraw`.
- Уникати циклічних імпортів між `element` і `excalidraw`.
- Після логічних змін у ядрі — релевантні тести й за можливості `yarn test:typecheck`.
- Ігнорування контексту Cursor керується **`.cursorignore`** (артефакти збірки, `node_modules`, lock-файли тощо); вихідний код і `.github` для CI — зазвичай **не** виключені.

## Зв’язок з іншими файлами

- Узгоджені перевірки для воркшопу: **`.coderabbit.yaml`** (вимоги до Memory Bank, `AGENTS.md`, доків).
- Правила самого редактора: **`.cursorrules`** (якщо є).
