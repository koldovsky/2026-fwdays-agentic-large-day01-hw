# Tech Context

## Базовий стек

## Runtime і пакетний менеджер
- Node.js: `>=18.0.0` (root `engines.node`).
- Yarn classic: `yarn@1.22.22` (root `packageManager`).
- Монорепа через Yarn Workspaces: `excalidraw-app`, `packages/*`, `examples/*`.

## Мови та фреймворки
- TypeScript `5.9.3` (root devDependency).
- React `19.0.0` + `react-dom 19.0.0` (в `excalidraw-app`).
- Vite `5.0.12` як dev server/build tool.

## Frontend та клієнтські інтеграції
- PWA: `vite-plugin-pwa` + `virtual:pwa-register` (`excalidraw-app/index.tsx`).
- Firebase SDK `11.3.1`:
  - Firestore (`getFirestore`, `runTransaction`);
  - Storage (`getStorage`, `uploadBytes`).
- Realtime: `socket.io-client 4.7.2` для колаборації.
- Локальний UI state: `jotai 2.11.0` (в app і в `packages/excalidraw`).

## Якість коду і тести
- ESLint (root script `test:code`).
- Prettier (root script `test:other`/`fix:other`).
- Vitest (`test`, `test:app`, `test:coverage`).
- Typecheck: `tsc` (`test:typecheck`).
- Git hooks: Husky + lint-staged.

## Контейнеризація і запуск
- `Dockerfile` multi-stage:
  - stage build: `node:20`;
  - stage runtime: `nginx:1.27-alpine`.
- `docker-compose.yml`:
  - сервіс `excalidraw`;
  - порт `3000:80`.

## Робочі команди (перевірені по scripts)

## Основні
- `yarn start` — запуск dev-сервера (`excalidraw-app`).
- `yarn build` — збірка застосунку.
- `yarn build:app:docker` — збірка для Docker runtime.
- `yarn start:production` — локальний запуск production-збірки.

## Якість/перевірки
- `yarn test` — запуск Vitest.
- `yarn test:all` — typecheck + lint + prettier check + тести.
- `yarn test:code` — ESLint.
- `yarn test:typecheck` — TypeScript перевірка.
- `yarn fix` — форматування та автофікс ESLint.

## Змінні середовища та конфіг
- Vite env читаються через `loadEnv(mode, "../")` у `excalidraw-app/vite.config.mts`.
- Firebase конфіг читається з `VITE_APP_FIREBASE_CONFIG` (JSON parse у `excalidraw-app/data/firebase.ts`).
- Порт dev-сервера: `VITE_APP_PORT` (fallback `3000`).
