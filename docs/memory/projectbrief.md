# Project brief — Excalidraw monorepo

## Що це за проєкт

- **Назва репозиторію** (root `package.json`): `excalidraw-monorepo` — приватний Yarn workspaces-монорепозиторій на базі [Excalidraw](https://github.com/excalidraw/excalidraw).
- **Основний продукт**: бібліотека **`@excalidraw/excalidraw`** (`packages/excalidraw`) — React-компонент для вбудованого векторного «hand-drawn» редактора діаграм і малюнків.
- **Повноцінний веб-додаток**: пакет **`excalidraw-app`** — production-обгортка навколо бібліотеки (збірка Vite, PWA, інтеграції).

## Основна мета

- Надати **відкритий редактор креслень** з API для вбудовування в сторонні застосунки (`Excalidraw`, `ExcalidrawAPIProvider`, imperative API через `onExcalidrawAPI`).
- Забезпечити **повний досвід excalidraw.com**: завантаження/збереження, бібліотека фігур, експорт, колаборація, аналітика тощо — у межах `excalidraw-app` та пов’язаних модулів у `packages/excalidraw`.

## Склад монорепо (workspaces)

З кореневого `package.json`:

- `excalidraw-app` — SPA на Vite + React.
- `packages/*` — `@excalidraw/common`, `@excalidraw/element`, `@excalidraw/math`, `@excalidraw/excalidraw`, `@excalidraw/utils`.
- `examples/*` — приклади інтеграції (наприклад Next.js, скрипт у браузері).

## Для кого цей Memory Bank

- Швидкий онбординг: що будується, де «ядро» редактора, де застосунок.
- Контекст для агентів/розробників без читання всього дерева файлів.

## Обмеження та припущення

- Репозиторій виглядає як **форк/клон upstream Excalidraw** (версії пакетів `0.18.0`, посилання на GitHub у `packages/excalidraw/package.json`). Локальні зміни можуть відрізнятися від апстріму — перевіряти diff і теги git.
- `examples/*` **виключені** з кореневого `tsconfig.json` (`"exclude": [..., "examples", ...]`) — окремі залежності та збірка.

## Верифікація (джерела в коді)

| Твердження | Де подивитися |
|------------|----------------|
| Назва й workspaces | Кореневий `package.json` (`name`, `workspaces`) |
| Опис бібліотеки | `packages/excalidraw/package.json` (`description`) |
| Точка входу застосунку | `excalidraw-app/index.tsx` → `ExcalidrawApp` |
| Публічний API редактора | `packages/excalidraw/index.tsx` (експорт `Excalidraw`, провайдери) |
