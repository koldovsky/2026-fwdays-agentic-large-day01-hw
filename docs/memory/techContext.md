# Excalidraw: Tech Context

## Runtime та менеджер пакетів

- Package manager: `yarn@1.22.22` (Yarn Classic).
- Мінімальна версія Node.js: `>=18.0.0`.
- CI у workflow запускається на `node-version: 20.x` (добрий baseline для локальної сумісності).
- Monorepo workspaces:
  - `excalidraw-app`
  - `packages/*`
  - `examples/*`

## Основний стек

- Мова: TypeScript (`5.9.3` у root/tooling).
- UI: React (`19.0.0` у `excalidraw-app`).
- Bundler/dev server: Vite (`5.0.12` у root tooling).
- Тести: Vitest (`3.0.6`) + `jsdom` + `@vitest/coverage-v8`.
- Лінт/форматування:
  - ESLint (`@excalidraw/eslint-config`, `eslint-config-react-app`),
  - Prettier (`@excalidraw/prettier-config`).

## Важливі пакети за зонами

- Core editor package: `@excalidraw/excalidraw@0.18.0`.
- Internal packages:
  - `@excalidraw/common`,
  - `@excalidraw/element`,
  - `@excalidraw/math`,
  - `@excalidraw/utils`.
- App-level infra у `excalidraw-app`:
  - `firebase`,
  - `socket.io-client`,
  - `idb-keyval`,
  - `jotai`,
  - `@sentry/browser`.

## Щоденні команди (root)

- Встановлення:
  - `yarn install`
- Локальний запуск app:
  - `yarn start`
- Збірка app:
  - `yarn build`
- Збірка пакетів:
  - `yarn build:packages`
- Тести:
  - `yarn test` (alias до `test:app`)
  - `yarn test:app`
  - `yarn test:coverage`
- Якість коду:
  - `yarn test:code` (ESLint)
  - `yarn test:typecheck` (tsc)
  - `yarn test:other` (Prettier check)
  - `yarn test:all` (typecheck + lint + prettier + tests)
- Автофікс:
  - `yarn fix`

## Команди всередині app

- `yarn --cwd ./excalidraw-app start`
- `yarn --cwd ./excalidraw-app build`
- `yarn --cwd ./excalidraw-app start:production`
- `yarn --cwd ./excalidraw-app build:preview`

## Тестовий і ts-контекст

- Vitest aliases налаштовані на локальні `packages/*/src`, тому тести перевіряють актуальний workspace-код.
- Test environment: `jsdom`, setup файл: `setupTests.ts`.
- `tsconfig.json`:
  - `strict: true`,
  - `noEmit: true`,
  - path aliases для `@excalidraw/*`.

## Практичні нотатки для нового розробника

- Для зміни редактора зазвичай працюють в `packages/excalidraw` + дотичних internal пакетах.
- Для сценаріїв колаборації/інтеграції з бекендом — у `excalidraw-app`.
- Якщо ціль — перевірка перед PR, мінімальний набір: `yarn test:typecheck && yarn test:code && yarn test:app --watch=false`.

## Верифіковано по source code

- `package.json` (root) — packageManager, workspaces, scripts, tooling versions.
- `excalidraw-app/package.json` — app dependencies/scripts.
- `packages/excalidraw/package.json` — версія бібліотеки та peer dependencies.
- `.github/workflows/lint.yml`, `.github/workflows/test.yml` — CI Node baseline.
- `vitest.config.mts`, `tsconfig.json`, `.eslintrc.json` — test/lint/typecheck контекст.
