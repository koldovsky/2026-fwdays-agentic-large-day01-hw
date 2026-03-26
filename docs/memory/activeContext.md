# Active context

## Поточний фокус

- **Фокус ітерації:** сформувати повний `docs/memory/` як "knowledge baseline" для подальших змін у репо.
- **Статус:** базові 3 файли вже створені (`projectbrief.md`, `techContext.md`, `systemPatterns.md`), зараз додано решту (`productContext.md`, `activeContext.md`, `progress.md`, `decisionLog.md`).
- **Принцип наповнення:** тільки факти, підтверджені кодом/конфігом (без вигаданих бізнес-вимог).

## Що вважати "джерелом істини" зараз

- **Технології та команди:** кореневий `package.json`, пакетні `package.json`, `tsconfig.json`, `vitest.config.mts`, `excalidraw-app/vite.config.mts`.
- **UX і сценарії:** `packages/excalidraw/index.tsx`, `components/welcome-screen/*`, `components/main-menu/*`, `components/live-collaboration/*`, `types.ts`.
- **Монорепо-структура:** `workspaces` та alias-конфігурації.

## Операційний контекст для наступних задач

- Працюємо в Yarn workspace-монорепо (`yarn@1.22.22`, Node `>=18`).
- Локальна розробка залежить від alias на **source paths** (TS/Vite/Vitest), тому зміни в пакетах одразу впливають на app/test.
- Для перевірки впливу змін базовий маршрут: `yarn test:typecheck`, `yarn test:code`, `yarn test:app`.

## Поточні ризики/увага

- **Дрейф документації:** якщо змінюються скрипти/alias/версії, Memory Bank потрібно синхронізувати одразу в тому ж PR.
- **Частковий контекст:** у корені немає єдиного README/PRD, тому продуктовий контекст збирається з коду та examples.
- **Dirty working tree:** у репо вже були зміни до цієї ітерації (за початковим snapshot: змінений `.cursorignore`, видалений `repomix-compressed.txt`).

## Definition of done для Memory Bank

- Усі 7 файлів існують у `docs/memory/`.
- Кожен файл структурований заголовками/списками.
- Кожен файл < 200 рядків.
- Твердження мають source references (прямо або через секцію `Source verification`).

## Source verification

- `package.json`
- `tsconfig.json`
- `vitest.config.mts`
- `excalidraw-app/vite.config.mts`
- `packages/excalidraw/index.tsx`
- `packages/excalidraw/components/main-menu/MainMenu.tsx`
- `packages/excalidraw/components/main-menu/DefaultItems.tsx`
- `packages/excalidraw/components/welcome-screen/WelcomeScreen.tsx`
- `packages/excalidraw/components/live-collaboration/LiveCollaborationTrigger.tsx`
