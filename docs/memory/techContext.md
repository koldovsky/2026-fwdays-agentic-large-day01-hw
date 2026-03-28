# Tech context

## Мова та рантайм

- **TypeScript**: `5.9.3` (кореневий `package.json`, `devDependencies.typescript`).
- **Node.js**: `>=18.0.0` (кореневий `package.json` та `excalidraw-app/package.json`, `engines.node`).
- **JSX**: `react-jsx` (кореневий `tsconfig.json`, `compilerOptions.jsx`).

## Менеджер пакетів і монорепо

- **Yarn Classic**: `yarn@1.22.22` (кореневий `package.json`, поле `packageManager`).
- **Workspaces** (кореневий `package.json`, поле `workspaces`):
  - `excalidraw-app`
  - `packages/*`
  - `examples/*`

## UI-стек (застосунок)

- **React**: `19.0.0` (`excalidraw-app/package.json`, `dependencies.react` / `react-dom`).
- **Збірка / dev-server**: **Vite** `5.0.12` у корені + скрипти в `excalidraw-app` (`excalidraw-app/package.json`: `vite`, `build:app`, `start`).
- **Стан**: **Jotai** `2.11.0` (`excalidraw-app/package.json`).

## Інтеграції в `excalidraw-app` (за `package.json`)

- **Firebase** `11.3.1`
- **Socket.IO client** `4.7.2`
- **Sentry (browser)** `9.0.1`
- **i18next language detector** `6.1.4`
- **idb-keyval** `6.0.3`

## Пакети бібліотеки (версії)

- `@excalidraw/common`, `@excalidraw/math`, `@excalidraw/element`, `@excalidraw/utils`: **`0.18.0`** (див. відповідні `packages/*/package.json`).
- `@excalidraw/excalidraw`: **`0.18.0`** (`packages/excalidraw/package.json`).

## Якість коду та тести

- **Vitest** `3.0.6` + `@vitest/coverage-v8` `3.0.7` (кореневий `package.json`).
- **ESLint** через `eslint-config-react-app` та `@excalidraw/eslint-config` (кореневий `package.json`).
- **Prettier** `2.6.2` + `@excalidraw/prettier-config` (кореневий `package.json`).
- **Husky** `7.0.4` + `lint-staged` `12.3.7` (кореневий `package.json`).

## Команди (кореневий `package.json`)

### Розробка

- `yarn start` → `yarn --cwd ./excalidraw-app start` (далі в `excalidraw-app`: `vite`).
- `yarn start:example` → збирає пакети й запускає приклад `examples/with-script-in-browser`.

### Збірка

- `yarn build` → збірка через `excalidraw-app` (`build` скрипт там викликає `vite build` + `build:version`).
- `yarn build:packages` → послідовна збірка `common`, `math`, `element`, `excalidraw`.

### Тести / перевірки

- `yarn test` → `vitest` (`test:app`).
- `yarn test:all` → `test:typecheck` + `test:code` + `test:other` + `test:app --watch=false`.
- `yarn test:typecheck` → `tsc`.
- `yarn test:code` → `eslint ...`.
- `yarn test:other` → `prettier --list-different`.

### Утиліти

- `yarn clean-install` → видалення `node_modules` + `yarn install`.
- `yarn rm:build` / `yarn rm:node_modules` → прибирання артефактів (див. скрипти в корені).

## Конфігурація шляхів (`@excalidraw/*`)

- TypeScript path mapping: кореневий `tsconfig.json` (`compilerOptions.paths`).
- Vite alias-и: `excalidraw-app/vite.config.mts` (`resolve.alias`).
