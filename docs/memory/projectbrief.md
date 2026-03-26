# Project brief

## Що це за проєкт

- **Репозиторій:** `excalidraw-monorepo` (див. `name` у кореневому `package.json`).
- **Тип проєкту:** монорепозиторій Excalidraw з двома основними сценаріями:
  - **Бібліотека:** пакет `@excalidraw/excalidraw` для вбудовування як React-компонент.
  - **Застосунок:** `excalidraw-app` як готовий веб-редактор поверх тієї ж бібліотеки.
- **Структура workspaces:** `excalidraw-app`, `packages/*`, `examples/*` (root `package.json`).

## Основна мета

- Надати **редактор діаграм/whiteboard** з hand-drawn стилем у двох формах:
  - як публічний npm-пакет (`@excalidraw/excalidraw`),
  - як готовий веб-додаток (`excalidraw-app`).
- Розділити код по пакетах для повторного використання:
  - базові утиліти та модель (`common`, `math`, `element`, `utils`),
  - UI + дані редактора в `packages/excalidraw`.

## Межі та обсяг

- **В межах репо:**
  - бібліотечний код у `packages/*`,
  - продуктовий shell у `excalidraw-app`,
  - інтеграційні приклади у `examples/*`.
- **Поза межами цього brief:**
  - деталі інструментів і команд — у `techContext.md`,
  - архітектурні патерни та взаємодія модулів — у `systemPatterns.md`.

## Верифіковані джерела

| Твердження | Перевірено в |
|---|---|
| Назва монорепо та workspaces | `package.json` (root) |
| Роль `@excalidraw/excalidraw` | `packages/excalidraw/package.json`, `packages/excalidraw/README.md` |
| Наявність app-shell | `excalidraw-app/package.json`, `excalidraw-app/index.tsx` |
| Приклади інтеграції | `examples/*`, `packages/excalidraw/README.md` |
