# Progress

## Поточний прогрес по проєкту (verified snapshot)

- **Монорепо сформоване:** `excalidraw-app` + `packages/*` + `examples/*` у `workspaces`.
- **Бібліотечні пакети виділені:** `common`, `math`, `element`, `utils`, `excalidraw`.
- **Тестовий контур є:** Vitest (`jsdom`), ESLint, Prettier, TypeScript strict, Husky hooks.
- **Пайплайн збірки є:** root scripts для app/packages, окремі build-скрипти пакетів.
- **Інтеграційні приклади є:** `with-script-in-browser` і `with-nextjs`.

## Завершено в межах Memory Bank

1. Створено `docs/memory/projectbrief.md`.
2. Створено `docs/memory/techContext.md`.
3. Створено `docs/memory/systemPatterns.md`.
4. Створено `docs/memory/productContext.md`.
5. Створено `docs/memory/activeContext.md`.
6. Створено `docs/memory/progress.md`.
7. Створено `docs/memory/decisionLog.md`.

## Що вже стабільно в кодовій базі

- **Runtime/app entry:** `excalidraw-app/index.tsx` (React root + PWA register).
- **Package architecture:** `@excalidraw/excalidraw` агрегує UI/API та залежить на модулі нижчого рівня.
- **State layer:** Jotai з ізоляцією store (`editor-jotai.ts`).
- **Build topology:** alias на source для TS/Vite/Vitest + dist артефакти для publish.

## Що ще потребує регулярного оновлення документації

- Версії залежностей (`package.json` файли).
- Команди збірки/тестування (root scripts, example scripts).
- Продуктові сценарії при зміні `MainMenu`, `WelcomeScreen`, collaboration UI.

## Чекпоінти перевірки після майбутніх змін

- `yarn test:typecheck`
- `yarn test:code`
- `yarn test:app --watch=false`
- `yarn build:packages`
- `yarn build`

## Source verification

- `package.json`
- `excalidraw-app/index.tsx`
- `packages/excalidraw/package.json`
- `packages/common/package.json`
- `packages/math/package.json`
- `packages/element/package.json`
- `packages/utils/package.json`
- `packages/excalidraw/editor-jotai.ts`
- `vitest.config.mts`
