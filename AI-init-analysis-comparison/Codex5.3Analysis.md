Прийняв задачу: даю стислий огляд призначення, стеку і структури цього репозиторію за наявним кодом.

- [x] Визначити призначення проєкту
- [x] Витягнути основний технологічний стек з `package.json`
- [x] Пояснити структуру monorepo по ключових директоріях

**Призначення**
- Це monorepo Excalidraw: вебдодаток для малювання/whiteboard + npm-пакети для вбудовування Excalidraw як React-компонента.
- У `packages/excalidraw/README.md` прямо зазначено: Excalidraw експортується як React component для інтеграції в інші застосунки.
- `excalidraw-app/` — основний застосунок; `packages/*` — бібліотеки ядра (common/element/math/utils + публічний пакет `@excalidraw/excalidraw`); `examples/*` — приклади інтеграції.

**Основний стек**
- **Мова/платформа:** TypeScript, Node.js `>=18` (див. `package.json`, `excalidraw-app/package.json`).
- **Frontend:** React `19.0.0`, ReactDOM `19.0.0` (`excalidraw-app/package.json`).
- **Білд/дев-сервер:** Vite `5.0.12`, `@vitejs/plugin-react` (`package.json`).
- **Монорепо/пакетний менеджер:** Yarn workspaces, `yarn@1.22.22` (`package.json`).
- **Тести/якість:** Vitest (`test:app`), ESLint, Prettier, TypeScript typecheck (`package.json` scripts).
- **Колаборація/інфра (у застосунку):** Firebase, `socket.io-client`, Sentry, Jotai (`excalidraw-app/package.json`).

**Структура репозиторію**
- `excalidraw-app/` — основний UI-додаток (точка входу, компоненти, collab, data-шар, тести).
- `packages/common/` — спільні константи/утиліти.
- `packages/math/` — математика/геометрія.
- `packages/element/` — логіка елементів канвасу.
- `packages/utils/` — утилітарні функції (експорт/імпорт, обробка ресурсів тощо).
- `packages/excalidraw/` — публічний пакет `@excalidraw/excalidraw` для вбудовування.
- `examples/with-nextjs/`, `examples/with-script-in-browser/` — референсні інтеграції.
- `scripts/` — збірка пакетів, релізні та допоміжні скрипти.
- `firebase-project/` — конфіги/правила Firebase.
- `public/` — статичні assets, іконки, шрифти, service worker.
- `.github/`, `.coderabbit.yaml` — CI/рев’ю та воркшопні шаблони/вимоги для документації.
