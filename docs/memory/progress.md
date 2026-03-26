# Progress (стан проєкту)

## Що верифіковано з репозиторію

- **Версія пакетів ядра:** `@excalidraw/excalidraw`, `@excalidraw/common`, `@excalidraw/element`, `@excalidraw/math` — `0.18.0` у відповідних `packages/*/package.json`.
- **Версія `@excalidraw/utils`:** `0.1.2` (`packages/utils/package.json`).
- **Збірка та тести:** у кореневому `package.json` є скрипти `build`, `build:packages`, `test`, `test:all`, `test:typecheck`, `test:code` (ESLint), `test:other` (Prettier).
- **Workspaces:** `excalidraw-app`, `packages/*`, `examples/*` — перелік у кореневому `package.json`.
- **Приклади:** наявні каталоги на кшталт `examples/with-nextjs` (є `README.md` у прикладі).

## Підтримка достовірності

- Автоматична перевірка тверджень з цього файлу (версії, workspaces, скрипти, ключові шляхи): `yarn verify:memory-facts` ([скрипт](../../scripts/verify-memory-facts.js)).
- Процес і ручний чекліст: [verification-checklist.md](./verification-checklist.md). У PR на GitHub той самий скрипт виконується в workflow **Lint** після `yarn install`.

## Документація та артефакти в робочій копії

- `docs/memory/` — Memory Bank (цей файл включно).

**Technical** (`docs/technical/`):

- [architecture.md](../technical/architecture.md)
- [dev-setup.md](../technical/dev-setup.md)
- [undocumented-behavior.md](../technical/undocumented-behavior.md)

**Product** (`docs/product/`):

- [PRD.md](../product/PRD.md)
- [domain-glossary.md](../product/domain-glossary.md)

Інші великі артефакти (наприклад `repomix-output.xml` у корені, якщо присутній) **не** є частиною офіційного релизного процесу Excalidraw; їх призначення визначає власник клону.

## Що в репозиторії не знайдено

- **Кореневий README** з дорожньою картою або статусом релізу — у знімку структури його не було.
- **CONTRIBUTING** у корені — не знайдено.
- **Єдиний backlog / milestone-файл** для цього клону — відсутній; прогрес продукту Excalidraw ведеться в апстримі на GitHub (посилання в `packages/excalidraw/package.json`: `repository`, `bugs`).

## Як оновлювати цей файл

- Після релізу або bump версій — перечитати `packages/*/package.json`.
- Після додавання фіч — короткий пункт + шлях до файлів.
- Після проходження CI локально — зафіксувати `yarn test:all` (дата, гілка) у таблиці нижче (вручну).

## Журнал перевірок (ручний)

| Дата | Команда / дія | Результат |
|------|----------------|-----------|
| _додати_ | _наприклад `yarn test:all`_ | _pass / fail_ |
