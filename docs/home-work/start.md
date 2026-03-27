# Огляд проєкту

## Роздуми

- Це монорепозиторій, а не один застосунок: у корені оголошені `workspaces` для `excalidraw-app`, `packages/*` і `examples/*`.
- Репозиторій поєднує дві основні ролі:
  - вебзастосунок Excalidraw;
  - publishable React-бібліотеку `@excalidraw/excalidraw`.
- Центральна доменна ідея проєкту: collaborative whiteboard / diagram editor з "hand-drawn" візуальним стилем.
- Логіка проєкту розкладена по внутрішніх пакетах:
  - `common` для спільних утиліт та інфраструктурних примітивів;
  - `math` для геометрії;
  - `element` для моделі елементів сцени та операцій над ними;
  - `utils` для допоміжних функцій експорту та bounds;
  - `excalidraw` як основний редакторський React-пакет.
- `excalidraw-app` містить продуктову обв'язку над ядром редактора:
  - collaboration;
  - share/import/export;
  - локальне та хмарне збереження;
  - теми, мови, PWA, аналітику й product UI.
- В інфраструктурі явно присутні `Firebase`, `Socket.IO`, `Sentry`, `Vite PWA`, `Vercel`, `Docker`.

## Результат

### Призначення

Це кодова база Excalidraw: open-source інструмента для малювання діаграм і whiteboard-сцен з рукописним стилем. Репозиторій одночасно містить:

- вебзастосунок, який запускається як готовий продукт;
- React-бібліотеку `@excalidraw/excalidraw`, яку можна вбудовувати в інші застосунки.

### Основний стек

- Мова та платформа: `TypeScript`, `Node.js >= 18`
- Frontend: `React 19`, `ReactDOM 19`
- Збірка: `Vite`, `Yarn workspaces`
- Стан і UI-архітектура: `Jotai`, `SCSS/Sass`
- Графіка та редакторські залежності: `roughjs`, `perfect-freehand`, `CodeMirror`, `@excalidraw/mermaid-to-excalidraw`, `Radix UI`
- Інфраструктура і сервіси: `Firebase`, `socket.io-client`, `Sentry`, PWA/service worker
- Якість коду: `Vitest`, `Testing Library`, `ESLint`, `Prettier`, `Husky`

### Структура репозиторію

- `excalidraw-app/` — основний вебзастосунок
- `packages/excalidraw/` — головна React-бібліотека редактора
- `packages/common/` — спільні утиліти, константи, event-bus та допоміжна інфраструктура
- `packages/element/` — елементи сцени, selection, трансформації, scene/render helpers
- `packages/math/` — геометричні примітиви та обчислення
- `packages/utils/` — утиліти для експорту, bounds і допоміжних операцій
- `examples/` — приклади інтеграції
- `firebase-project/` — конфігурація Firebase і правила доступу
- `public/` — статичні assets, шрифти, іконки, service worker
- `scripts/` — скрипти збірки, релізу, wasm/font tooling
- `.github/workflows/` — CI/CD

### Висновок

Проєкт організований як зрілий frontend-monorepo з чітким поділом між редакторським ядром, доменною логікою елементів і продуктовим вебзастосунком. Якщо входити в код, найкраща послідовність така:

1. `package.json`
2. `excalidraw-app/App.tsx`
3. `packages/excalidraw/`
4. `packages/element/`
5. `packages/common/`
