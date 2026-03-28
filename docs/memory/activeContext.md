# Active context — поточний фокус

Короткий зріз того, над чим зараз ведеться робота в репозиторії (для людей і для AI-агентів). Оновлювати при зміні пріоритетів.

## Поточна гілка роботи

- **Домашнє завдання Day 1 (воркшоп Agentic IDE)** — документація для онбордингу та перевірки PR: Memory Bank, технічна та продуктова документація в `docs/`.
- **База коду** — форк **Excalidraw monorepo** (`excalidraw-app`, `packages/*`, `examples/*`), менеджер пакетів **Yarn 1 workspaces**.

## Що зараз у пріоритеті

1. Завершити набір файлів **Memory Bank** у `docs/memory/` (у т.ч. бонусні: product/active/progress/decision контексти).
2. Узгодити зміст з реальною структурою репо та з вимогами `.github/PULL_REQUEST_TEMPLATE.md` / `.coderabbit.yaml`.
3. Підготувати коміт і **Pull Request** з описом за шаблоном: `Day 1: <ім'я> — Workshop Assignment`.

## Відкриті питання / ризики

- Перевірити, що жоден `docs/memory/*.md` не містить placeholder-тексту і що твердження можна звірити з вихідним кодом (не вигадані фічі).
- Після змін у документації за бажанням прогнати `yarn test:code` / `yarn prettier --list-different`, якщо торкалися формату файлів поза `docs/`.

## Файли «джерело правди» для агента

- Кореневі скрипти: `package.json` (`yarn start`, `yarn build`, `yarn test:all`).
- Доменні типи редактора: `packages/excalidraw/types.ts`, `packages/element/`.
- Інструкції для Copilot (стиль коду): `.github/copilot-instructions.md`.

## Останнє оновлення контексту

- **Дата:** 2026-03-28
- **Примітка:** фокус — завдання воркшопу та якість документації для AI-рев’ю.

---

## Документація інших рівнів

- **Технічна:** [Архітектура](../technical/architecture.md), [Онбординг і PR](../technical/dev-setup.md)
- **Продукт:** [PRD](../product/PRD.md), [Глосарій](../product/domain-glossary.md)
- **Memory Bank:** [progress](./progress.md), [techContext](./techContext.md), [decisionLog](./decisionLog.md)
