# Tech context — стек, версії, команди

## Менеджер пакетів і Node

- **Yarn Classic**: `packageManager: "yarn@1.22.22"` (кореневий `package.json`).
- **Node**: `engines.node >= 18.0.0` (корінь і `excalidraw-app/package.json`).

## Мови та інструменти якості

- **TypeScript** `5.9.3` (root `devDependencies`).
- **ESLint** з `@excalidraw/eslint-config`, `eslint-config-react-app`, імпорт/prettier-плагіни.
- **Prettier** `2.6.2` з `@excalidraw/prettier-config`.
- **Vitest** `3.0.6` + **jsdom**, `@vitest/coverage-v8`, `vitest-canvas-mock`.
- **Husky** + **lint-staged** (`prepare`: `husky install`).

## Фронтенд-стек (застосунок)

- **React** `19.0.0`, **React DOM** `19.0.0` (`excalidraw-app/package.json`).
- **Vite** `5.0.12` (`excalidraw-app`: `start` → `vite`, збірка через `vite build`).
- **Jotai** `2.11.0` — стан у застосунку та в пакеті excalidraw.
- **Інтеграції в app**: Firebase `11.3.1`, `socket.io-client` `4.7.2`, `@sentry/browser` `9.0.1`, `idb-keyval`, `i18next-browser-languagedetector`, `uqr`.

## Плагіни Vite (app)

З `excalidraw-app/vite.config.mts`: `@vitejs/plugin-react`, `vite-plugin-svgr`, `vite-plugin-ejs`, `vite-plugin-pwa`, `vite-plugin-checker`, `vite-plugin-html`, `vite-plugin-sitemap`, кастомний `woff2BrowserPlugin` з `scripts/woff2/`.

## Збірка пакетів бібліотеки

- **esbuild** + **esbuild-sass-plugin** у `scripts/buildPackage.js` / `buildBase.js` / `buildUtils.js` (див. `getConfig` у `scripts/buildPackage.js`: `format: "esm"`, `target: "es2020"`, частина залежностей `external`).
- Пакети публікують **`dist/dev`**, **`dist/prod`**, типи в `dist/types/...` (`packages/*/package.json` → `exports`).

## Версії workspace-пакетів

| Пакет | Версія (`package.json`) |
|-------|-------------------------|
| `@excalidraw/common` | 0.18.0 |
| `@excalidraw/element` | 0.18.0 |
| `@excalidraw/math` | 0.18.0 |
| `@excalidraw/excalidraw` | 0.18.0 |
| `@excalidraw/utils` | 0.1.2 |

## Корисні команди (корінь репо)

З кореневого `package.json` `scripts`:

- **Розробка app**: `yarn start` → `yarn --cwd ./excalidraw-app start` (Vite).
- **Збірка app**: `yarn build` (app + version script).
- **Збірка лише пакетів**: `yarn build:packages` → common → math → element → excalidraw (без окремого кроку для `utils` у цьому скрипті).
- **Приклад зі скриптом у браузері**: `yarn start:example` (спочатку `build:packages`).
- **Тести**: `yarn test` / `yarn test:app` (Vitest); `yarn test:all` — typecheck + eslint + prettier + app tests; `yarn test:coverage`.
- **Лінт/формат**: `yarn test:code`, `yarn fix`, `yarn fix:code`, `yarn fix:other`.
- **Typecheck**: `yarn test:typecheck` → `tsc`.
- **Очистка**: `yarn rm:build`, `yarn rm:node_modules`, `yarn clean-install`.

## Розробка з вихідників (aliases)

- Кореневий `tsconfig.json`: `paths` для `@excalidraw/*` → `packages/.../src` або `packages/excalidraw/index.tsx`.
- Ті самі аліаси продубльовані в `vitest.config.mts` і `excalidraw-app/vite.config.mts` для збірки/тестів без попередньої публікації пакетів.

## Верифікація (джерела)

- Версії та скрипти: кореневий `package.json`, `excalidraw-app/package.json`, `packages/*/package.json`.
- Vitest: `vitest.config.mts`.
- Vite: `excalidraw-app/vite.config.mts`.
- esbuild для пакетів: `scripts/buildPackage.js`, `scripts/buildBase.js`.
