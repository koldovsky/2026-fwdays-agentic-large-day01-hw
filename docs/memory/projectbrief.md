# Project Brief

## Що це за проєкт

`2026-fwdays-agentic-large-day01-hw` — це монорепозиторій Excalidraw (`excalidraw-monorepo`), який містить:
- вебзастосунок-дошку для малювання (`excalidraw-app`);
- пакет для вбудовування в React (`@excalidraw/excalidraw`);
- внутрішні пакети доменної логіки (`@excalidraw/common`, `@excalidraw/element`, `@excalidraw/math`, `@excalidraw/utils`);
- приклади інтеграції (`examples/*`).

Підтвердження в коді:
- root `package.json` → `name: "excalidraw-monorepo"` і `workspaces`;
- `packages/excalidraw/package.json` → `description: "Excalidraw as a React component"`;
- `excalidraw-app/package.json` → окремий deployable застосунок.

## Основна мета

Основна мета проєкту — надати:
- готовий вебклієнт Excalidraw для малювання та колаборації в браузері;
- перевикористовуваний React SDK (`@excalidraw/excalidraw`) для вбудовування редактора в інші продукти;
- спільну доменну основу через окремі пакети монорепи.

## Межі системи

- Backend-сервіс у цьому репозиторії відсутній як окремий Node API.
- Колаборація/синхронізація робиться через зовнішній WebSocket endpoint (`socket.io-client`) і Firebase (Firestore + Storage) у клієнті.
- Продакшн-деплой орієнтований на статичну збірку (`vite build`) + Nginx.

## Ключові артефакти репозиторію

- `excalidraw-app/` — основний SPA-клієнт.
- `packages/excalidraw/` — публічний React-компонент і API.
- `packages/common/`, `packages/element/`, `packages/math/`, `packages/utils/` — модульна доменна база.
- `scripts/` — build/release утиліти.
- `Dockerfile` + `docker-compose.yml` — контейнеризація і локальний запуск.

## Що вважати "готовим результатом"

- У дев-режимі застосунок стартує через `yarn start` (root проксить у `excalidraw-app`).
- У прод-режимі збірка генерує `excalidraw-app/build` і може віддаватися через Nginx-контейнер.
- SDK із `packages/excalidraw` збирається як окремий npm-пакет із типами.
