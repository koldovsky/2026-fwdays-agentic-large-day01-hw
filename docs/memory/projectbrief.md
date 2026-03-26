# Project brief

## Що це за проєкт

- **Назва в репозиторії:** `excalidraw-monorepo` (кореневий `package.json`, `private: true`).
- **По суті:** монорепозиторій **Excalidraw** — веб-редактор діаграм із «рукописним» стилем (rough.js тощо), плюс **npm-пакет** `@excalidraw/excalidraw` для вбудовування редактора в React-додатки.
- **Опис бібліотеки:** у `packages/excalidraw/package.json` — *«Excalidraw as a React component»*; репозиторій upstream зазначено як `https://github.com/excalidraw/excalidraw`.

## Основна мета

1. **Повноцінний застосунок** (`excalidraw-app`) — Vite + React, збірка продакшен-версії, PWA, інтеграції (див. залежності застосунку в `excalidraw-app/package.json`).
2. **Модульна бібліотека** — розбиття логіки на пакети `@excalidraw/common`, `@excalidraw/math`, `@excalidraw/element`, `@excalidraw/utils` та агрегуючий `@excalidraw/excalidraw`.
3. **Приклади інтеграції** — workspace `examples/*` (наприклад `with-script-in-browser`, `with-nextjs`) для демонстрації споживання пакета.

## Скоуп workspace (факт з коду)

З кореневого `package.json`:

- `excalidraw-app`
- `packages/*`
- `examples/*`

## Ліцензія та походження

- Пакети `@excalidraw/*` у `package.json` позначені як **MIT**; посилання на issues/repo ведуть на офіційний GitHub Excalidraw.

## Що не є частиною цього документа

- Деталі бізнес-вимог конкретного курсу/дз — у репозиторії немає окремого README на корені; контекст навчання випливає лише з назви каталогу проєкту поза `package.json`.

## Details

- For system architecture and technical decomposition -> see `docs/technical/architecture.md`
- For local environment and development workflow -> see `docs/technical/dev-setup.md`
- For product requirements and scope -> see `docs/product/PRD.md`
- For business/domain terminology -> see `docs/product/domain-glossary.md`
