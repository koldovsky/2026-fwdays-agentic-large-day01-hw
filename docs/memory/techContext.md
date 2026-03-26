# Tech context

## Runtime та пакетний менеджер

- **Node.js:** `>=18.0.0` (`package.json` та `excalidraw-app/package.json`, поле `engines`).
- **Yarn (classic):** `1.22.22` — зафіксовано в `packageManager` кореневого `package.json`.
- **Workspaces:** `excalidraw-app`, `packages/*`, `examples/*`.

## Мова та компілятор

- **TypeScript:** `5.9.3` (root `devDependencies`).
- **TSConfig:** `strict: true`, `jsx: react-jsx`, `module` / `target` ESNext, `noEmit: true` для перевірки типів (`tsconfig.json`).
- **Path mapping (розробка):** аліаси `@excalidraw/common|element|excalidraw|math|utils` → `packages/...` (`tsconfig.json` → `compilerOptions.paths`).

## UI-стек

- **React:** `19.0.0`, **react-dom:** `19.0.0` (`excalidraw-app/package.json` `dependencies`).
- **Типи React:** `@types/react` `19.0.10`, `@types/react-dom` `19.0.4` (root `devDependencies`).
- **Jotai:** `2.11.0` — і в `excalidraw-app`, і в `@excalidraw/excalidraw` (`dependencies`).

## Збірка та dev-сервер (застосунок)

- **Vite:** `5.0.12` (root `devDependencies`); конфіг `excalidraw-app/vite.config.mts` (плагіни: `@vitejs/plugin-react`, PWA, checker, EJS, sitemap, тощо).
- **Порт dev-сервера:** з `VITE_APP_PORT` або дефолт `3000` (`excalidraw-app/vite.config.mts`, `server.port`).

## Збірка бібліотечних пакетів

- Скрипт `build:esm` у пакетах викликає `node ../../scripts/buildPackage.js` (або `buildBase.js` для `common`) — **esbuild** + **sass** (`scripts/buildPackage.js` імпортує `esbuild`, `esbuild-sass-plugin`).
- Артефакти: `dist/dev`, `dist/prod`, типи через `gen:types` / `tsc` (див. `packages/excalidraw/package.json` `scripts`).

## Тестування та якість

- **Vitest:** `3.0.6` + `@vitest/coverage-v8` `3.0.7` (root).
- **Конфіг:** `vitest.config.mts` — `environment: jsdom`, `setupFiles: ./setupTests.ts`, аліаси збігаються з `tsconfig`.
- **Пороги coverage:** `lines` 60%, `branches` 70%, `functions` 63%, `statements` 60% (`vitest.config.mts`).
- **ESLint / Prettier:** скрипти `test:code`, `test:other`, конфіги `@excalidraw/eslint-config`, `@excalidraw/prettier-config`.
- **Husky / lint-staged:** `prepare`: `husky install` (root `package.json`).

## Ключові залежності застосунку

З `excalidraw-app/package.json` `dependencies` (орієнтири для інтеграцій):

- **Firebase** `11.3.1`
- **socket.io-client** `4.7.2`
- **Sentry** `@sentry/browser` `9.0.1`
- **idb-keyval** `6.0.3`, **i18next-browser-languagedetector** `6.1.4`

## Корисні команди (з кореня)

| Команда | Призначення (за `package.json` scripts) |
|--------|----------------------------------------|
| `yarn start` | Dev: `yarn --cwd ./excalidraw-app start` → `vite` |
| `yarn build` | Прод-збірка застосунку |
| `yarn build:packages` | Послідовно `common` → `math` → `element` → `excalidraw` |
| `yarn test` | `vitest` |
| `yarn test:all` | typecheck + eslint + prettier + app tests |
| `yarn test:typecheck` | `tsc` |
| `yarn fix` | prettier write + eslint fix |
| `yarn clean-install` | видалення `node_modules` + `yarn install` |

## Версії внутрішніх пакетів (на момент аналізу)

- `@excalidraw/common`, `@excalidraw/element`, `@excalidraw/excalidraw`, `@excalidraw/math`: **0.18.0** (`package.json` у відповідних пакетах).
- `@excalidraw/utils`: **0.1.2** (`packages/utils/package.json`).

## Technical і Product docs

**Technical** (`docs/technical/`):

- [architecture.md](../technical/architecture.md)
- [dev-setup.md](../technical/dev-setup.md)
- [undocumented-behavior.md](../technical/undocumented-behavior.md)

**Product** (`docs/product/`):

- [PRD.md](../product/PRD.md)
- [domain-glossary.md](../product/domain-glossary.md)
