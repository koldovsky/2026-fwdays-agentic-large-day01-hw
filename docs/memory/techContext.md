# Tech context — стек і команди

## Менеджер пакетів і monorepo

- **Yarn 1** (`packageManager`: `yarn@1.22.22`), **workspaces**: `excalidraw-app`, `packages/*`, `examples/*`.
- **Node.js:** `>=18.0.0` (корінь і `excalidraw-app`).

## Мови та типізація

- **TypeScript** `5.9.3` (кореневі `devDependencies`).
- Новий код у стилі репозиторію — TS, суворі типи для елементів і стану додатку.

## UI та збірка

- **React** `19.0.0`, **React DOM** `19.0.0` — у `excalidraw-app` (і як peer для `@excalidraw/excalidraw`).
- **Vite** `5.0.12` у корені; додаток збирається через **`vite`** у `excalidraw-app` (`yarn start` → `vite`).
- Плагіни (корінь): `@vitejs/plugin-react` `3.1.0`, `vite-plugin-pwa`, `vite-plugin-svgr`, `vite-plugin-checker`, `vite-plugin-ejs`.

## Тести та якість

- **Vitest** `3.0.6`, **ESLint** (конфіг `@excalidraw/eslint-config`), **Prettier** `2.6.2` (`@excalidraw/prettier-config`).

## Ключові залежності пакета `@excalidraw/excalidraw` (версія `0.18.0`)

- Внутрішні workspace-пакети: `@excalidraw/common`, `@excalidraw/element`, `@excalidraw/math` — усі `0.18.0`.
- **roughjs** `4.6.4` — «ескізний» рендер.
- **jotai** `2.11.0` — атомарний стан у частині UI.
- **nanoid**, **pako**, **perfect-freehand**, **radix-ui**, **CodeMirror 6** (@codemirror/*) — згідно з `packages/excalidraw/package.json`.

## Залежності `excalidraw-app`

- **jotai** `2.11.0`, **socket.io-client** `4.7.2`, **firebase** `11.3.1`, **@sentry/browser** `9.0.1`, **i18next-browser-languagedetector** `6.1.4`, **idb-keyval** `6.0.3` тощо.

## Основні команди (з кореневого `package.json`)

| Команда | Призначення |
|---------|-------------|
| `yarn install` | Залежності для всього workspace |
| `yarn start` | Дев-сервер додатку (`excalidraw-app`, Vite) |
| `yarn build` | Прод-збірка додатку |
| `yarn build:packages` | Збірка `common` → `math` → `element` → `excalidraw` |
| `yarn test` / `yarn test:app` | Vitest |
| `yarn test:all` | typecheck + eslint + prettier + тести |
| `yarn test:typecheck` | `tsc` |
| `yarn test:code` | ESLint |
| `yarn test:other` | Prettier `--list-different` |
| `yarn fix` | Prettier write + ESLint fix |

## Команди всередині `excalidraw-app`

| Команда | Призначення |
|---------|-------------|
| `yarn start` | `vite` (з `package.json` app: спочатку `yarn`, потім `vite`) |
| `yarn build` | `build:app` + `build:version` |
| `yarn build:app` | `vite build` з env для git SHA / tracking |

## Важливо для розробників

- Зміни в `packages/excalidraw` після правок часто потребують **`yarn build:excalidraw`** (або повного `build:packages`) перед запуском додатка, якщо споживаються зібрані артефакти.
- Для embed у Next.js — клієнтський рендер і dynamic import без SSR (див. `packages/excalidraw/README.md`).

## Де дивитися версії

- Корінь: `package.json`.
- Додаток: `excalidraw-app/package.json`.
- Редактор: `packages/excalidraw/package.json`.

---

## Документація інших рівнів

- **Технічна:** [Архітектура](../technical/architecture.md), [Онбординг і перший PR](../technical/dev-setup.md)
- **Продукт:** [PRD](../product/PRD.md), [Глосарій](../product/domain-glossary.md)
- **Memory Bank:** [projectbrief](./projectbrief.md), [systemPatterns](./systemPatterns.md), [productContext](./productContext.md), [decisionLog](./decisionLog.md)
