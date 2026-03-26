# Project brief

## Що це за проєкт

- **Назва репозиторію (workspace):** `excalidraw-monorepo` — приватний Yarn workspaces монорепозиторій (`package.json`, поле `name`).
- **База:** форк/клон кодової бази [Excalidraw](https://github.com/excalidraw/excalidraw) (MIT, `LICENSE`; посилання на репозиторій у `packages/excalidraw/package.json`).
- **Два основні «продукти» в одному дереві:**
  - **Бібліотека** `@excalidraw/excalidraw` (`packages/excalidraw`) — React-компонент для вбудови редактора в інші застосунки (`description` у `packages/excalidraw/package.json`).
  - **Повноцінний веб-застосунок** `excalidraw-app` — обгортка навколо бібліотеки з інтеграціями (хмарне збереження, колаборація тощо).

## Основна мета

- Надати **інтерактивний редактор діаграм** у стилі «ручного малюнка» (canvas, елементи сцени, експорт, бібліотека фігур) — ядро в `packages/excalidraw` та залежних пакетах.
- Дозволити **вбудовування** через npm-пакет: peer-залежності `react` / `react-dom`, експорт стилів `index.css` (документовано в `packages/excalidraw/README.md`).
- У застосунку `excalidraw-app` — **повний досвід excalidraw.com-подібного клієнта**: головний `App.tsx` імпортує `Excalidraw`, діалоги, меню, аналітику, модуль `collab/Collab.tsx` для спільної роботи.

## Обсяг монорепозиторію (workspaces)

З `package.json` (`workspaces`):

- `excalidraw-app` — Vite-застосунок.
- `packages/*` — `@excalidraw/common`, `@excalidraw/element`, `@excalidraw/excalidraw`, `@excalidraw/math`, `@excalidraw/utils` та ін.
- `examples/*` — приклади інтеграції (наприклад `examples/with-nextjs` з власним `README.md`).

## Що явно не описано в коді

- Назва локальної папки (`2026-fwdays-agentic-large-day01-hw`) вказує на навчальний контекст; у корені немає окремого README з вимогами ДЗ — **цілі курсу тут не верифікуються**, лише структура проєкту з джерел.

## Верифікація

- Кореневий `package.json`: `name`, `workspaces`, скрипти збірки/тестів.
- `packages/excalidraw/package.json`: версія пакета `0.18.0`, опис «Excalidraw as a React component».
- `excalidraw-app/App.tsx`: імпорт `Excalidraw` та пов’язаних API з `@excalidraw/excalidraw`.

## Technical і Product docs

**Technical** (`docs/technical/`):

- [architecture.md](../technical/architecture.md)
- [dev-setup.md](../technical/dev-setup.md)
- [undocumented-behavior.md](../technical/undocumented-behavior.md)

**Product** (`docs/product/`):

- [PRD.md](../product/PRD.md)
- [domain-glossary.md](../product/domain-glossary.md)
