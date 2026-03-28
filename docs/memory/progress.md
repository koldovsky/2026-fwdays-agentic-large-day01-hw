# Progress — стан виконання робіт

Трекінг прогресу по репозиторію (воркшоп Day 1 / супровід документації).

## Виконано

- **`.cursorignore`** у корені — патерни для `node_modules/`, `build/`, `dist/`, lock-файлів, coverage, кешів тощо.
- **Memory Bank (`docs/memory/`)**:
  - обов’язкові: `projectbrief.md`, `techContext.md`, `systemPatterns.md`;
  - бонусні: `productContext.md`, `activeContext.md`, `progress.md`, `decisionLog.md`.
- **Technical docs:** `docs/technical/architecture.md`; `docs/technical/dev-setup.md` — онбординг від клону до PR + перевірка AI.
- **Product docs:** `docs/product/domain-glossary.md`, `docs/product/PRD.md`.
- **Перехресні посилання:** у всіх файлах Memory Bank є секція «Документація інших рівнів» з лінками на `docs/technical/` та `docs/product/`.
- **Undocumented behaviors:** у `decisionLog.md` зафіксовано 4 випадки (U-001…U-004) «очікування vs код».

## У процесі / перед сабмітом

- Перевірити PR title: `Day 1: <ім'я> — Workshop Assignment` (рекомендація `.coderabbit.yaml`).
- Проставити чекбокси в `.github/PULL_REQUEST_TEMPLATE.md` під час відкриття PR.
- За бажанням: `yarn test:other` (Prettier для markdown), якщо CI перевіряє форматування.

## Заплановано (опційно)

- Додаткові приклади undocumented behavior за мірою вивчення коду.

## Метрики якості для сабміту

| Критерій | Статус |
|----------|--------|
| Memory Bank core (3 файли, ≥20 рядків, Markdown) | Готово |
| `architecture.md` з потрібними секціями | Готово |
| Glossary ≥5 термінів з визначеннями | Готово (10 термінів) |
| PRD з метою, аудиторією, фічами, non-goals | Готово |

## Останнє оновлення

- 2026-03-28 — додано обов’язкову документацію Day 1 для перевірки CodeRabbit.

---

## Документація інших рівнів

- **Технічна:** [Архітектура](../technical/architecture.md), [Онбординг](../technical/dev-setup.md)
- **Продукт:** [PRD](../product/PRD.md), [Глосарій](../product/domain-glossary.md)
- **Memory Bank:** [projectbrief](./projectbrief.md), [activeContext](./activeContext.md), [decisionLog](./decisionLog.md)
