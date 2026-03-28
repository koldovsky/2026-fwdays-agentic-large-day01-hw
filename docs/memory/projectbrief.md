# Project brief

## Що це за проєкт

- **Назва монорепозиторію**: `excalidraw-monorepo` (див. кореневий `package.json`, поле `name`).
- **Призначення**: вихідний код **Excalidraw** — веб-додаток для малювання діаграм і скетчів «від руки» та набір **npm-пакетів** з логікою редактора й UI-компонентом `@excalidraw/excalidraw`.
- **Доказ у коді**: пакет `@excalidraw/excalidraw` має опис *«Excalidraw as a React component»* (`packages/excalidraw/package.json`).

## Основна мета (з коду)

- **Зібрати й запустити веб-застосунок** у каталозі `excalidraw-app` (Vite + React; точка входу `excalidraw-app/index.tsx`).
- **Розділити код на пакети** з чіткими залежностями (`packages/common`, `packages/math`, `packages/element`, `packages/utils`, `packages/excalidraw`) і збирати їх окремо (`build:packages` у кореневому `package.json`).
- **Надати інтеграційні приклади** у `examples/*` (окремі workspace-пакети в кореневому `package.json`).

## Обмеження щодо «мети курсу / ДЗ»

- У репозиторії **немає** кореневого `README.md` з описом навчального завдання; назва папки на диску не використовується як джерело істини в Memory Bank.

## Ключові артефакти для орієнтації

- **Кореневий маніфест**: `package.json` — workspaces, скрипти збірки/тестів, `engines.node`.
- **Застосунок**: `excalidraw-app/package.json`, `excalidraw-app/App.tsx`, `excalidraw-app/index.tsx`.
- **Бібліотека UI**: `packages/excalidraw/package.json`, `packages/excalidraw/index.tsx` (експорт компонента).
