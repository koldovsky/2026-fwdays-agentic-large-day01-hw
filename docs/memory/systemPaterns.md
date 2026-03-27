# System Patterns

## Архітектурний стиль

- Monorepo з поділом на застосунок і бібліотечні домени.
- Модульна layered-структура:
  - **App layer**: `excalidraw-app` (інтеграція, runtime, колаборація, persistence).
  - **Editor/domain layer**: `packages/excalidraw`.
  - **Core domain services**: `packages/element`, `packages/math`, `packages/common`, `packages/utils`.
- Патерн "library-first + app-shell": ті самі доменні модулі живлять і публічну npm бібліотеку, і веб-продукт.

## Ключові патерни

- **Action registry (Command-like pattern)**
  - Централізована реєстрація редакторських дій через `register()`.
  - Дозволяє поступово нарощувати поведінку редактора як набір composable actions.
  - Доказ: `packages/excalidraw/actions/register.ts`.

- **Event bus (Pub/Sub with behavior policy)**
  - `AppEventBus` підтримує:
    - cardinality (`once` / `many`),
    - replay (`none` / `last`),
    - callback або awaitable API.
  - Корисно для decoupled взаємодії між модулями.
  - Доказ: `packages/common/src/appEventBus.ts`.

- **Versioned snapshot store (reactive state sync)**
  - `VersionedSnapshotStore<T>` веде `version`, `subscribe()`, `pull(sinceVersion)`.
  - Дає механіку pull/wait для синхронізації стану без жорсткого зв'язування.
  - Доказ: `packages/common/src/versionedSnapshotStore.ts`.

- **State via Jotai stores**
  - Ізольовані стори стану для різних bounded context (editor/app).
  - Докази:
    - `packages/excalidraw/editor-jotai.ts`
    - `excalidraw-app/app-jotai.ts`

- **Collaboration pipeline**
  - Portal-модуль для realtime обміну:
    - socket room lifecycle,
    - encrypted payload transport,
    - throttle для file upload,
    - диференціальна синхронізація елементів за версіями.
  - Доказ: `excalidraw-app/collab/Portal.tsx`.

- **Persistence split (LS + IndexedDB)**
  - `LocalData` розділяє DataState між `localStorage` і IndexedDB.
  - Є debounce save, lock/pause механіка, file-status tracking, migration adapter.
  - Доказ: `excalidraw-app/data/LocalData.ts`.

## Інтеграційні патерни

- **Alias-based package boundaries**
  - Однакова система alias-резолву у TS/Vitest/Vite знижує ризик дрейфу імпортів.
  - Докази:
    - `tsconfig.json`
    - `vitest.config.mts`
    - `excalidraw-app/vite.config.mts`

- **Public API через package exports**
  - `@excalidraw/excalidraw` публікує керовані entrypoints через `exports`.
  - Дозволяє стабільний контракт для embed use cases.
  - Доказ: `packages/excalidraw/package.json`.

## DDD-інтерпретація (на рівні цього репозиторію)

- **Core domain**: сцена, елементи, трансформації, геометрія (`packages/element`, `packages/math`, частково `packages/excalidraw`).
- **Application services**: orchestration editor behavior і user actions (`packages/excalidraw/components`, `packages/excalidraw/actions`).
- **Infrastructure**: socket transport, encryption, browser storage, Vite/PWA tooling (`excalidraw-app/collab`, `excalidraw-app/data`, `excalidraw-app/vite.config.mts`).
- **Bounded contexts**:
  - Editing context,
  - Collaboration context,
  - Local persistence context,
  - Embedding/public API context.
