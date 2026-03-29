# Tech context

## Менеджер пакетів і workspaces

- **Yarn Classic:** `packageManager`: `yarn@1.22.22` (`package.json`).
- **Workspaces:** `excalidraw-app`, `packages/*`, `examples/*` (той самий файл).

## Runtime

- **Node.js:** `engines.node`: `>=18.0.0` — у корені та в `excalidraw-app/package.json`.

## Ключові версії (за `package.json`)

| Область | Версія | Джерело |
|--------|--------|---------|
| TypeScript | 5.9.3 | root `devDependencies` |
| Vite | 5.0.12 | root `devDependencies` |
| Vitest | 3.0.6 | root `devDependencies` |
| React / React DOM | 19.0.0 | `excalidraw-app` `dependencies` |
| `@excalidraw/excalidraw` (пакет) | 0.18.0 | `packages/excalidraw/package.json` |
| `@excalidraw/common`, `element`, `math` | 0.18.0 | відповідні `packages/*/package.json` |
| `@excalidraw/utils` | 0.1.2 | `packages/utils/package.json` |
| Jotai | 2.11.0 | `excalidraw-app` та `packages/excalidraw` `dependencies` |
| Firebase (клієнт) | 11.3.1 | `excalidraw-app` |
| `socket.io-client` | 4.7.2 | `excalidraw-app` |
| `@sentry/browser` | 9.0.1 | `excalidraw-app` |

## Збірка пакетів

- Скрипти `build:common`, `build:element`, `build:excalidraw`, `build:math` викликають у підпакетах `build:esm` (див. root `scripts` у `package.json`).
- Збірка бібліотеки excalidraw використовує **esbuild** і **esbuild-sass-plugin** через `scripts/buildPackage.js` (імпорт `esbuild`, `sassPlugin`).

## Основні команди (корінь репозиторію)

- **Розробка застосунку:** `yarn start` → `yarn --cwd ./excalidraw-app start` → у `excalidraw-app` це `vite` (див. `excalidraw-app/package.json` `scripts.start`).
- **Повна збірка веб-апки:** `yarn build` → збірка в `excalidraw-app`.
- **Збірка всіх workspace-пакетів послідовно:** `yarn build:packages`.
- **Тести:** `yarn test` / `yarn test:app` (Vitest); повний набір: `yarn test:all` (typecheck + eslint + prettier + app tests).
- **Перевірка типів:** `yarn test:typecheck` → `tsc` (root `tsconfig.json`, `noEmit`).
- **Лінт / формат:** `yarn test:code` (eslint), `yarn test:other` (prettier check); автофікс: `yarn fix`, `yarn fix:code`.
- **Приклад у браузері зі скриптом:** `yarn start:example` (спочатку `build:packages`).
- **Очистка артефактів:** `yarn rm:build`, `yarn rm:node_modules`; повне перевстановлення: `yarn clean-install`.

## Конфігурація середовища

- Vite в `excalidraw-app/vite.config.mts` вказує `envDir: "../"` — змінні з кореневих `.env*` (коментар у файлі).
- **Порт dev-сервера:** `VITE_APP_PORT` або за замовчуванням **3000** (`server.port` у `vite.config.mts`).

## Тести

- **Vitest** з кореневим `vitest.config.mts`; alias-и `@excalidraw/*` дзеркалять `tsconfig.json` / Vite.
