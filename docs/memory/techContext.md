# Tech context

## Керування пакетами та середовище

- **Менеджер пакетів:** Yarn **1.x** — у корені вказано `"packageManager": "yarn@1.22.22"` (`package.json`).
- **Node:** `engines.node` — **`>=18.0.0`** (і в root, і в `excalidraw-app/package.json`).

## Мови та якість коду

- **TypeScript** root: **`5.9.3`** (`devDependencies` у root `package.json`).
- **Режим компілятора:** `strict`, `jsx: react-jsx`, `module`/`target`: ESNext — `tsconfig.json`.
- **ESLint / Prettier:** `@excalidraw/eslint-config`, `@excalidraw/prettier-config`, `eslint-config-react-app`, `prettier@2.6.2` (root `package.json`).
- **Husky / lint-staged:** `prepare` → `husky install` (підготовка git-hooks).

## Фронтенд-стек (ядро й застосунок)

| Технологія | Де зафіксовано | Примітка |
|------------|----------------|----------|
| React **19.0.0** | `excalidraw-app/package.json` `dependencies` | Разом із `react-dom` |
| Vite **5.0.12** | root `devDependencies` | Dev/build для `excalidraw-app` |
| Vitest **3.0.6** | root `devDependencies` | Тести, див. `vitest.config.mts` |
| Jotai **2.11.0** | `excalidraw-app` та `packages/excalidraw` | Стан у продукті та редакторі |
| Firebase **11.3.1** | `excalidraw-app` | Бекенд-інтеграції продукту |
| socket.io-client **4.7.2** | `excalidraw-app` | Мережевий шар (колаб тощо) |
| Sentry **9.0.1** | `excalidraw-app` | Моніторинг помилок (`excalidraw-app/sentry.ts`, імпорт у `index.tsx`) |

## Build/Dev інструменти

- **Vite (app):** `excalidraw-app/vite.config.mts` (plugins: React, SVGR, checker, PWA, sitemap, HTML/EJS).
- **Vitest (repo):** `vitest.config.mts` (`jsdom`, thresholds, aliases `@excalidraw/*`).
- **Esbuild (packages):** бібліотечна збірка через `scripts/buildPackage.js`.

## Збірка пакетів `@excalidraw/*`

- Скрипт **`build:esm`** у пакетах (наприклад `packages/excalidraw/package.json`): `rimraf dist && node ../../scripts/buildPackage.js && yarn gen:types`.
- **`scripts/buildPackage.js`** використовує **esbuild** + **esbuild-sass-plugin** для бандлу бібліотеки; окремо генеруються типи (`gen:types` через `tsc` у пакеті).

## Збірка та запуск застосунку (`excalidraw-app`)

Основні команди (root `package.json` + `excalidraw-app/package.json`):

- **Dev app:** `yarn start` (делегує в `excalidraw-app start` -> `vite`).
- **Prod build app:** `yarn build` (делегує в `excalidraw-app build`).
- **Preview app build:** `yarn build:preview`.
- **Docker build app:** `yarn build:app:docker`.
- **Build libraries:** `yarn build:packages`.
- **Run browser example:** `yarn start:example`.

Примітка: кореневі скрипти здебільшого делегують у підпроєкти через `yarn --cwd`.

## Тестування (root `package.json`)

- `yarn test` / `yarn test:app` — **Vitest**.
- `yarn test:typecheck` — **`tsc`** (без emit, `noEmit: true` у `tsconfig.json`).
- `yarn test:code` — ESLint по `.js,.ts,.tsx`.
- `yarn test:other` — Prettier `--list-different`.
- `yarn test:all` — послідовно typecheck, eslint, prettier, `test:app --watch=false`.
- Coverage: `test:coverage`, пороги в `vitest.config.mts` (lines/branches/functions/statements).

## Конфігурація тестів

- **Оточення:** `jsdom` (`vitest.config.mts`).
- **Алиаси `@excalidraw/*`:** дзеркалять `tsconfig.json` paths для `common`, `element`, `excalidraw`, `math`, `utils`.

## Корисні утилітарні скрипти (root)

- `build:packages` — збірка `common` → `math` → `element` → `excalidraw`.
- `rm:build`, `rm:node_modules`, `clean-install` — очищення артефактів.
- `release` / `release:*` — `scripts/release.js`.

## Джерела

- Root `package.json`, `excalidraw-app/package.json`, `packages/excalidraw/package.json`
- `tsconfig.json`, `vitest.config.mts`, `excalidraw-app/vite.config.mts`
- `scripts/buildPackage.js`
