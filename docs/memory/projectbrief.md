# Project Brief

## Що це за проєкт

- Це monorepo Excalidraw: поєднує веб-застосунок (`excalidraw-app`), бібліотеку для вбудовування (`packages/excalidraw`) і приклади інтеграції (`examples/*`).
- Ключова бізнес-ідея: надати whiteboard/diagram інструмент з "hand-drawn" UX, який працює як окремий продукт і як embeddable React-компонент.
- Репозиторій організований через Yarn Workspaces: `excalidraw-app`, `packages/*`, `examples/*`.

## Основна мета

- Розвивати ядро Excalidraw як reusable продуктову платформу:
  - **App** для кінцевих користувачів (малювання, колаборація, збереження, PWA).
  - **Library** `@excalidraw/excalidraw` для інтеграції в інші React-застосунки.
- Забезпечити єдині доменні модулі для геометрії, елементів сцени та загальних утиліт:
  - `packages/math`
  - `packages/element`
  - `packages/common`
  - `packages/utils`

## Межі та склад системи

- **Presentation/Application layer**: `excalidraw-app` (Vite app shell, колаборація, локальне збереження, runtime-плагіни).
- **Domain/editor layer**: `packages/excalidraw` (компоненти редактора, actions, scene/data API).
- **Supporting domain modules**:
  - `packages/element` (модель і поведінка елементів сцени),
  - `packages/math` (геометричні обчислення),
  - `packages/common` (подієві та інфраструктурні утиліти).
- **Consumer examples**: `examples/with-nextjs`, `examples/with-script-in-browser`.

## Верифікація з source code

- Monorepo/workspaces: `package.json` (root) -> `name: "excalidraw-monorepo"`, `workspaces`.
- App workspace: `excalidraw-app/package.json`.
- Library package: `packages/excalidraw/package.json` -> `name: "@excalidraw/excalidraw"`, `description`.
- Embed позиціонування: `packages/excalidraw/README.md` -> "exported as a React component".
- Приклади інтеграції: `examples/with-nextjs/package.json`, `examples/with-script-in-browser/package.json`.
