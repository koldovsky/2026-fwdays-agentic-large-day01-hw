# Налаштування середовища та onboarding розробників

Цей документ допомагає швидко підняти локальну розробку в монорепозиторії **excalidraw-monorepo** (Vite-додаток `excalidraw-app` + пакети `@excalidraw/*`). Детальнішу картину архітектури див. [architecture.md](./architecture.md).

---

## Що варто знати перед стартом

- **Монорепа** на [Yarn Workspaces](https://classic.yarnpkg.com/lang/en/docs/workspaces/): корінь керує залежностями та спільними скриптами; робочі пакети — `excalidraw-app`, `packages/*`, `examples/*`.
- **Редактор** живе в `packages/excalidraw`; **веб-клієнт** з колаборацією, Firebase тощо — у `excalidraw-app`. У dev-режимі Vite підміняє імпорти `@excalidraw/*` на вихідний TypeScript у `packages/` (див. `excalidraw-app/vite.config.mts`).

---

## Вимоги

| Інструмент | Версія / примітка |
|------------|-------------------|
| **Node.js** | `>= 18` (у `Dockerfile` для збірки використовується образ `node:20`; для узгодженості з CI/контейнером можна обрати LTS 20) |
| **Yarn** | Classic **1.x** — у корені вказано `packageManager`: `yarn@1.22.22`. Установіть глобально або через Corepack: `corepack enable` і використовуйте версію з поля `packageManager`. |

Інших обов’язкових нативних залежностей для базового UI-розробницького циклу немає.

---

## Перший запуск

1. **Клонуйте репозиторій** і перейдіть у корінь проєкту.

2. **Встановіть залежності** з кореня:

   ```bash
   yarn install
   ```

   Після `install` виконується скрипт `prepare` (Husky): локально ініціалізуються git-hooks у `.husky/`.

3. **Змінні середовища.** Vite завантажує env з **кореня** репозиторію (`envDir: ".."` у `excalidraw-app/vite.config.mts`):

   - Базові значення для розробки — у файлі **`.env.development`** у корені (репозиторій уже містить шаблон).
   - Для **локальних перевизначень без коміту** створіть **`.env.development.local`** або **`.env.local`** у корені (Vite об’єднує їх залежно від режиму; див. [документацію Vite щодо env](https://vitejs.dev/guide/env-and-mode.html)).

   Корисні для щоденної роботи змінні:

   - **`VITE_APP_PORT`** — порт dev-сервера (у `.env.development` за замовчуванням, наприклад, `3001`; якщо не задано — fallback у конфігу `3000`).
   - **`VITE_APP_WS_SERVER_URL`** — WebSocket для колаборації; для локальної кімнати часто ставлять `http://localhost:3002` (потрібен окремий сервіс [excalidraw-room](https://github.com/excalidraw/excalidraw-room), якщо тестуєте повний сценій колаборації).
   - **`VITE_APP_FIREBASE_CONFIG`**, бекенд-URL для JSON/AI тощо — описані в `.env.development` / `.env.production`; для чисто локального UI частина функцій може бути недоступна без відповідних сервісів.

4. **Запустіть dev-сервер** з кореня:

   ```bash
   yarn start
   ```

   Це виконує `yarn --cwd ./excalidraw-app start`, який підтягує залежності в `excalidraw-app` і запускає `vite`. За налаштуваннями Vite браузер може відкриватися автоматично.

---

## Основні команди (з кореня репозиторію)

| Команда | Призначення |
|---------|-------------|
| `yarn start` | Розробка: hot reload, аліаси на `packages/*` |
| `yarn build` | Production-збірка веб-додатку (`excalidraw-app`) |
| `yarn build:packages` | Послідовна збірка ESM пакетів `common` → `math` → `element` → `excalidraw` (потрібно для публікації пакетів або деяких сценаріїв; для звичайного `yarn start` зазвичай не обов’язково) |
| `yarn build:app:docker` | Збірка з `VITE_APP_DISABLE_SENTRY=true` (орієнтована на Docker) |
| `yarn start:production` | Збірка + локальний статичний сервер (`http-server` на порту зі скрипта в `excalidraw-app`) |
| `yarn test` | Vitest (конфіг: `vitest.config.mts` у корені) |
| `yarn test:all` | TypeScript (`tsc`) + ESLint + Prettier check + тести без watch |
| `yarn test:typecheck` | Лише `tsc` |
| `yarn test:code` | ESLint по `.js`, `.ts`, `.tsx` |
| `yarn fix` | Prettier write + ESLint `--fix` |
| `yarn clean-install` | Повне перевстановлення `node_modules` (через `rimraf` + `yarn install`) |

Перегляд тестів з UI: `yarn test:ui` (Vitest UI + coverage за скриптом).

---

## Якість коду та стиль

- **ESLint** — `@excalidraw/eslint-config`, перевірка: `yarn test:code`.
- **Prettier** — `@excalidraw/prettier-config`, перевірка форматування: `yarn test:other` (або `yarn prettier --list-different` з кореня за `package.json`).
- **TypeScript** — строгий режим (`strict: true` у кореневому `tsconfig.json`), шляхи `@excalidraw/*` зіставлені з `packages/`.
- **Lint-staged** — конфігурація в `.lintstagedrc.js` (ESLint на змінених `*.{js,ts,tsx}`, Prettier на інших типах). У `.husky/pre-commit` виклик `lint-staged` **закоментований**; за потреби команда може увімкнути перевірки перед комітом локально.

---

## Docker (опційно)

- **`Dockerfile`**: багатоетапна збірка (Node → `yarn build:app:docker` → Nginx зі статикою з `excalidraw-app/build`).
- **`docker-compose.yml`**: сервіс `excalidraw`, мапінг портів **`3000:80`** (контейнер віддає зібраний фронт через Nginx).

Для щоденної розробки зазвичай достатньо `yarn start` на хості; Docker зручний для перевірки production-збірки або деплою.

---

## Структура репозиторію (куди дивитися в перший тиждень)

- **`excalidraw-app/`** — точка входу застосунку, Vite, колаборація, Firebase, інтеграції.
- **`packages/excalidraw/`** — React-редактор (`App`, canvas, дії, історія).
- **`packages/element/`**, **`packages/common/`**, **`packages/math/`**, **`packages/utils/`** — сцена, примітиви, математика, утиліти експорту тощо.
- **`examples/*`** — приклади інтеграції (наприклад Next.js); зазвичай потребують попередньої збірки пакетів — див. README у відповідній папці.

---

## Рекомендації для IDE

- Відкривайте **корінь монорепи** як workspace — тоді спрацюють кореневі `tsconfig.json` і шляхи `paths` для `@excalidraw/*`.
- Якщо TypeScript «не бачить» пакети, переконайтеся, що встановлено залежності з кореня (`yarn install`) і що IDE використовує workspace TypeScript (версія з `package.json`).

---

## Подальше читання

- [architecture.md](./architecture.md) — потік даних, пакети, рендеринг.
- [docs/memory/techContext.md](../memory/techContext.md) — стислий технічний контекст.
- [docs/product/PRD.md](../product/PRD.md) — вимоги до продукту «як є».

Якщо після onboarding залишилися блокери (порт зайнятий, відсутній локальний WS для колаборації, питання по Firebase), узгодьте з командою мінімальний набір env для вашого сценарію або використовуйте `.env.*.local` лише на своїй машині.
