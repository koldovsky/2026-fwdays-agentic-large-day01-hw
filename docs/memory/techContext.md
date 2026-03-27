# Tech Context

## Stack

- **Monorepo/package manager**: Yarn Classic `1.22.22` (workspaces).
- **Runtime**: Node.js `>=18.0.0`.
- **Language**: TypeScript `5.9.3`.
- **Frontend**:
  - React `19.0.0` (app), peer support у library: React `17/18/19`.
  - Vite `5.0.12`, `@vitejs/plugin-react` `3.1.0`.
- **Testing**: Vitest `3.0.6`, `@vitest/coverage-v8` `3.0.7`, `jsdom`.
- **Lint/format**: ESLint (`@excalidraw/eslint-config`), Prettier `2.6.2`.
- **Collaboration/storage**:
  - `socket.io-client` `4.7.2`,
  - `firebase` `11.3.1`,
  - `idb-keyval` `6.0.3`.

## Важливі інфраструктурні компоненти

- **Build/app shell**: `excalidraw-app/vite.config.mts`:
  - PWA (`vite-plugin-pwa`),
  - type/lint checker overlay (`vite-plugin-checker`),
  - sitemap (`vite-plugin-sitemap`),
  - SVG React components (`vite-plugin-svgr`).
- **Path aliases** синхронізовані між:
  - `tsconfig.json`,
  - `vitest.config.mts`,
  - `excalidraw-app/vite.config.mts`.

## Основні команди (root)

- **Розробка**
  - `yarn start` - запуск `excalidraw-app`.
  - `yarn start:production` - build + serve app.
  - `yarn start:example` - збірка пакетів + приклад browser script.
- **Збірка**
  - `yarn build` - збірка app.
  - `yarn build:packages` - збірка `common`, `math`, `element`, `excalidraw`.
  - `yarn build:preview` - app preview build.
- **Якість**
  - `yarn test` / `yarn test:app` - Vitest.
  - `yarn test:all` - typecheck + lint + prettier + tests.
  - `yarn test:typecheck` - `tsc`.
  - `yarn test:code` - ESLint.
  - `yarn test:other` - Prettier check.
  - `yarn fix` - автофікси форматування і lint.

## Команди в підпроєктах

- `excalidraw-app`:
  - `yarn --cwd ./excalidraw-app start`
  - `yarn --cwd ./excalidraw-app build`
  - `yarn --cwd ./excalidraw-app build:preview`
- `packages/excalidraw`:
  - `build:esm`
  - `gen:types`
- `examples/with-nextjs`:
  - `dev`, `build`, `start`, `lint`

## Верифікація з source code

- Версії та scripts: `package.json` (root), `excalidraw-app/package.json`, `packages/excalidraw/package.json`.
- Tooling-конфіги: `tsconfig.json`, `vitest.config.mts`, `excalidraw-app/vite.config.mts`.
- Next.js приклад: `examples/with-nextjs/package.json`.
