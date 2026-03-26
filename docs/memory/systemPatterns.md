# System patterns

## Монорепозиторій і межі модулів

- **Workspaces** розділяють спільну логіку (`packages/*`) і клієнтський застосунок (`excalidraw-app`).
- **Публічні пакети** з префіксом `@excalidraw/*` мають `exports` у власних `package.json` (dev/prod entry, типи в `dist/types/...`).
- **`tsconfig.json`** і **`vitest.config.mts`** / **`excalidraw-app/vite.config.mts`** дублюють однакові **аліаси** на вихідники в `packages/*/src` (або `packages/excalidraw/index.tsx`) — єдиний спосіб імпорту в розробці без попередньої збірки пакетів.

## Два рівні стану: Jotai

### Редактор (`packages/excalidraw`)

- **`editor-jotai.ts`:** `jotai-scope` → `createIsolation()`; експорт `EditorJotaiProvider`, `useAtom` / `useSetAtom` / `useAtomValue`, окремий **`editorJotaiStore`** через `createStore()` з `jotai`.
- **Призначення:** ізольований стан UI редактора (кольори, сайдбар, діалоги тощо) без змішування з глобальним React-контекстом застосунку.

### Застосунок (`excalidraw-app`)

- **`app-jotai.ts`:** власний **`appJotaiStore`**, стандартний Jotai `Provider`, хук **`useAtomWithInitialValue`** (ініціалізація через `useLayoutEffect`).
- **`App.tsx`** імпортує атоми колаборації з `collab/Collab` (`collabAPIAtom`, `isCollaboratingAtom`, `isOfflineAtom`) поряд із `Excalidraw`.

## Публічний API бібліотеки

- **`packages/excalidraw/index.tsx`:** експорт обгортки `Excalidraw`, **`ExcalidrawAPIProvider`** (React Context для імперативного API поза деревом `<Excalidraw>`), підключення стилів і шрифтів, `EditorJotaiProvider` / `editorJotaiStore`.
- **`InitializeApp`**, кореневий **`App`** з `./components/App` — внутрішнє дерево редактора.

## Доменні пакети

- **`@excalidraw/element`:** типи елементів, геометрія сцени, операції з елементами; історія/знімки через абстракції на кшталт `Store`, `StoreSnapshot`, `StoreDelta` (використання в `packages/excalidraw/history.ts`).
- **`@excalidraw/math`:** математика для геометрії.
- **`@excalidraw/common`:** константи, утиліти, події (`EVENT`), спільні типи.
- **`@excalidraw/utils`:** допоміжні функції (окремий пакет з власною версією).

## Історія та колаборація

- **`packages/excalidraw/history.ts`:** клас **`HistoryDelta`** розширює `StoreDelta` з `@excalidraw/element`; застосування дельт до `elements` + `appState` з правилами (наприклад, виключення `version` / `versionNonce` для undo/redo у колабі).
- **`excalidraw-app/collab/Collab.tsx`:** класовий компонент, синхронізація через **`reconcileElements`**, **`restoreElements`**, **`socket.io-client`**, шифрування з `@excalidraw/excalidraw/data/encryption` — **рівень застосунку** поверх ядра.

## Збірка: застосунок vs пакети

- **Застосунок:** Vite (HMR, плагіни HTML/PWA/checker).
- **Пакети:** esbuild-скрипти для ESM + Sass; змінні середовища через `packages/excalidraw/env.cjs` у пайплайні збірки (`scripts/buildPackage.js`).

## Точка входу застосунку

- **`excalidraw-app/index.tsx`:** `createRoot`, **`registerSW`** з `virtual:pwa-register`, ініціалізація Sentry через `../excalidraw-app/sentry`, рендер `<ExcalidrawApp />` з `./App`.

## Верифікація

- `packages/excalidraw/editor-jotai.ts`, `excalidraw-app/app-jotai.ts`
- `packages/excalidraw/index.tsx`, `packages/excalidraw/history.ts`
- `excalidraw-app/App.tsx`, `excalidraw-app/collab/Collab.tsx`
- `tsconfig.json`, `vitest.config.mts`, `excalidraw-app/vite.config.mts`, `scripts/buildPackage.js`

## Technical і Product docs

**Technical** (`docs/technical/`):

- [architecture.md](../technical/architecture.md)
- [dev-setup.md](../technical/dev-setup.md)
- [undocumented-behavior.md](../technical/undocumented-behavior.md)

**Product** (`docs/product/`):

- [PRD.md](../product/PRD.md)
- [domain-glossary.md](../product/domain-glossary.md)
