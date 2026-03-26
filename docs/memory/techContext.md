# Tech context — Excalidraw monorepo

## Платформа

- **Node.js**: `>=18.0.0` (`package.json` `engines`)
- **Менеджер пакетів**: **Yarn 1** (`packageManager`: `yarn@1.22.22`, workspaces)

## Workspaces

```text
excalidraw-app
packages/*
examples/*
```

Кореневий `name`: `excalidraw-monorepo`.

## Ключові версії (за `package.json` у корені та пакетах)

| Технологія        | Версія (орієнтир)                                     |
| ----------------- | ----------------------------------------------------- |
| TypeScript        | 5.9.3                                                 |
| React / React DOM | 19.0.0 (`excalidraw-app`)                             |
| Vite              | 5.0.12                                                |
| Vitest            | 3.0.6                                                 |
| Jotai             | 2.11.0 (`excalidraw-app` та `@excalidraw/excalidraw`) |

Пакети `@excalidraw/common`, `@excalidraw/element`, `@excalidraw/math`, `@excalidraw/excalidraw`: **0.18.0** (локальні workspace-залежності).

## Основні команди (корінь репозиторію)

| Команда | Призначення |
| --- | --- |
| `yarn start` | Дев-сервер застосунку (`excalidraw-app`, Vite) |
| `yarn build` | Прод-збірка застосунку |
| `yarn build:packages` | Збірка `common` → `math` → `element` → `excalidraw` |
| `yarn test` / `yarn test:app` | Vitest |
| `yarn test:all` | typecheck + eslint + prettier + app tests |
| `yarn test:typecheck` | `tsc` |
| `yarn test:code` | ESLint |
| `yarn test:coverage` | Vitest з покриттям |
| `yarn start:example` | Збірка пакетів + приклад `with-script-in-browser` |

## Тести й якість

- **Vitest** з `jsdom`, аліаси `@excalidraw/*` у `vitest.config.mts`
- Пороги coverage у `vitest.config.mts` (lines/branches/functions/statements)

## Збірка пакетів

- `@excalidraw/excalidraw`: `build:esm` через `scripts/buildPackage.js` + генерація типів
- Базові пакети (`common`, `element`, …): `scripts/buildBase.js`

## Інтеграції застосунку (`excalidraw-app`)

Залежності включають **Firebase**, **socket.io-client**, **Sentry**, **Jotai**, **i18next**-detector, **idb-keyval** — для колаборації, офлайн/зберігання, спостереження помилок (деталі в коді `excalidraw-app/`).
