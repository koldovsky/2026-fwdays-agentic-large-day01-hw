# Project brief — Excalidraw monorepo

## Пов’язана документація

- **Технічна** ([`docs/technical/`](../technical/)): [architecture.md](../technical/architecture.md) · [dev-setup.md](../technical/dev-setup.md)
- **Продуктова** ([`docs/product/`](../product/)): [PRD.md](../product/PRD.md) · [domain-glossary.md](../product/domain-glossary.md)

## Що це за проєкт

- **Кодова база:** монорепозиторій **Excalidraw** під ім’ям `excalidraw-monorepo` (підтверджено `package.json`: `name`, `workspaces`).
- **Продукт:** **Excalidraw** — інтерактивний редактор діаграм і малюнків у стилі «рукописного» скетчу; основна бібліотека експортується як **React-компонент** (`packages/excalidraw/package.json`: `description`, `README.md`).
- **Веб-додаток:** пакет `excalidraw-app` — оболонка навколо `@excalidraw/excalidraw` з повноцінним UI, збереженням даних, колаборацією та інтеграціями (`excalidraw-app/App.tsx`: імпорт `Excalidraw`, `Collab`, Firebase- та data-шари).

## Основна мета (продукт)

- Надати користувачам **інструмент для малювання та візуального мислення** в браузері (канвас, фігури, текст, експорт тощо) — у відповідності з призначенням пакета **«Excalidraw as a React component»** і змістом `packages/excalidraw/README.md`.
- Дозволити **вбудовувати** редактор у сторонні застосунки через npm-пакет `@excalidraw/excalidraw` (peer: `react`, `react-dom`).
- Через `excalidraw-app` підтримувати **повноцінний сценарій використання як застосунку**: меню, діалоги, спільна робота (`socket.io-client` у `excalidraw-app/package.json`), локальне/хмарне збереження (`firebase`, `idb-keyval`), PWA (`vite-plugin-pwa`, `registerSW` у `excalidraw-app/index.tsx`).

## Контекст репозиторію (навчальний)

- Назва робочої теки та шаблон PR вказують на **завдання першого дня воркшопу** (чеклист артефактів у `.github/PULL_REQUEST_TEMPLATE.md`, зокрема `docs/memory/projectbrief.md`).
- **Мета в рамках курсу:** зафіксувати розуміння великого open-source проєкту та підготувати **Memory Bank / документацію** поруч із робочим кодом (не змінює саму мету Excalidraw, але пояснює, навіщо цей клон у навчальному контексті).

## Структура монорепо (верифіковано з `package.json`)

| Зона | Призначення (за пакетами та кодом) |
|------|-----------------------------------|
| `packages/excalidraw` | UI редактора, рендер, i18n, основна логіка застосунку-редактора |
| `packages/common` | Спільні константи, утиліти (`description` у `package.json`) |
| `packages/element` | Модель і логіка елементів сцени |
| `packages/math` | Геометрія та математика для елементів |
| `packages/utils` | Додаткові утиліти (геометрія, експорт тощо) |
| `excalidraw-app` | Точка входу продуктового веб-застосунку (Vite, `index.tsx` → `App.tsx`) |
| `examples/*` | Приклади інтеграції для розробників |

## Ключові технології (коротко, з маніфестів)

- **Менеджер пакетів / workspaces:** Yarn 1 (`packageManager`, `workspaces` у кореневому `package.json`).
- **Фронтенд:** React 19 (`excalidraw-app/package.json`), збірка через **Vite** (скрипти `start` / `build` у `excalidraw-app`).
- **Якість коду:** TypeScript, ESLint, Prettier, Vitest (скрипти `test:*` у корені).
- **Деплой (конфіг у репо):** `vercel.json` вказує `outputDirectory: excalidraw-app/build` та `installCommand: yarn install`.

## Обмеження цього документа

- Опис **узгоджений із файлами репозиторію** (маніфести, точка входу, PR-шаблон, README пакета excalidraw).
- Деталі архітектури та продукту — розділ «Пов’язана документація» на початку файлу; команди та версії — [docs/memory/techContext.md](./techContext.md); інші файли Memory Bank — згідно з чеклистом у `.github/PULL_REQUEST_TEMPLATE.md`.
