# Progress — стан робіт (пам’ять)

> Не дублюй GitHub Issues; тут — **короткий зріз** для людей і агентів: що вже є в документації й інфраструктурі форку.

## Документація та контекст (локально в цьому worktree)

- [x] Memory Bank: `projectbrief`, `techContext`, `systemPatterns`
- [x] Розширений Memory Bank: `productContext`, `activeContext`, `progress`, `decisionLog`
- [x] SSD-навігатор: `docs/spec/SSD.md`
- [x] Продукт: `docs/product/PRD.md`, `domain-glossary.md`
- [x] Техніка: `docs/technical/architecture.md`
- [x] `AGENTS.md` для Cursor
- [x] `.cursorignore` (патерни для великого monorepo)

## Що ще має сенс (за потреби роботи)

- [ ] Оновлювати `activeContext.md` під кожну серйозну задачу
- [ ] Заносити архітектурні рішення в `decisionLog.md`
- [ ] Підтримувати PRD/архітектуру в синхроні з поведінкою після великих змін upstream

## Воркшоп vs повсякденна робота

- Вимоги **CodeRabbit** у `.coderabbit.yaml` покривають мінімум (3 файли Memory Bank + тех/продукт доки).
- Повний набір у `docs/memory/` — **для зручної щоденної роботи**; перевірка може не вимагати всіх файлів, але вони корисні команді.
