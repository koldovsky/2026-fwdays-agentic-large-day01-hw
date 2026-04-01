# System patterns

## Монорепозиторій і межі пакетів

- **Кореневий TypeScript** (`tsconfig.json`): `include` — `packages`, `excalidraw-app`; `exclude` — `examples`, `dist`, `types`, `tests`.
- **Path aliases** `@excalidraw/common|element|excalidraw|math|utils` мапляться на `packages/*/src` або `packages/excalidraw/index.tsx` — однакова схема в `tsconfig.json` `compilerOptions.paths`.
- Публікаційні пакети (`@excalidraw/common`, `element`, `math`, `excalidraw`, `utils`) збирають **dev/prod** артефакти в `dist/` з умовними `exports` у кожному `package.json`.

## Додаток vs бібліотека

- **`packages/excalidraw`** експортує React-компонент(и) і API: наприклад, `ExcalidrawAPIProvider` і обгортка на базі `ExcalidrawProps` у `packages/excalidraw/index.tsx` (контексти `ExcalidrawAPIContext` / `ExcalidrawAPISetContext` з `./components/App`).
- **`excalidraw-app`** імпортує з `@excalidraw/excalidraw` і додає продуктові речі: колаборація (`excalidraw-app/collab/`), Firebase (`excalidraw-app/data/firebase.ts`), обгортка `App.tsx` з `Provider` з `./app-jotai`.

## Збірка та dev-сервер

- **Vite** (`excalidraw-app/vite.config.mts`): React plugin, SVGR, EJS, PWA, checker, HTML, sitemap; **alias** повторюють `tsconfig` для прямого резолву сирців під час розробки.
- **Пакети** збираються через **esbuild**-скрипти (`scripts/buildPackage.js`, `buildBase.js`) з ін’єкцією env з `.env.development` / `.env.production` (див. `ENV_VARS` у `buildPackage.js`).

## Стан UI (React)

- **Jotai** використовується і в ядрі редактора (`EditorJotaiProvider`, `editorJotaiStore` у `packages/excalidraw/index.tsx`), і в застосунку (`excalidraw-app/app-jotai`, атоми колабу в `App.tsx`).
- Патерн **imperative API**: `onExcalidrawAPI` / контекст дозволяють керувати редактором ззовні дерева (див. коментар до `ExcalidrawAPIProvider` у `packages/excalidraw/index.tsx`).

## Стилі

- Глобальні стилі редактора: імпорт `app.scss`, `styles.scss`, `fonts.css` у `packages/excalidraw/index.tsx`.
- У репозиторії зафіксовано **CSS modules** для компонентів як конвенцію (див. `.github/copilot-instructions.md`).

## Колаборація і бекенд-клієнти

- **Firebase** (Firestore, Storage): ініціалізація та допоміжні функції в `excalidraw-app/data/firebase.ts`.
- **Socket.IO** (клієнт): динамічний імпорт у колаборації (`excalidraw-app/collab/Collab.tsx` і типи в `Portal.tsx`).

## Спостереження та помилки

- **Sentry** підключається на старті застосунку: `import "../excalidraw-app/sentry"` у `excalidraw-app/index.tsx`.

## Тестування

- **Vitest** з тими самими `@excalidraw/*` alias, що й у збірці (`vitest.config.mts`), щоб тести резолвили сирці без попередньої публікації пакетів.

## Математика й типи

- Для координат і геометрії в коді очікується узгоджене використання типів з `packages/math` (у `.github/copilot-instructions.md` згадано `packages/math/src/types.ts` та тип `Point`).
