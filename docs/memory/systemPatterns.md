# System patterns — Excalidraw monorepo

## Пов’язана документація

- **Технічна** ([`docs/technical/`](../technical/)): [architecture.md](../technical/architecture.md) · [dev-setup.md](../technical/dev-setup.md)
- **Продуктова** ([`docs/product/`](../product/)): [PRD.md](../product/PRD.md) · [domain-glossary.md](../product/domain-glossary.md)

Документ синхронізований з поточним кодом репозиторію (`excalidraw-monorepo`, Yarn workspaces).

## Монорепозиторій

- **Менеджер пакетів:** Yarn 1, `workspaces`: `excalidraw-app`, `packages/*`, `examples/*` (`package.json`).
- **Збірка застосунку:** Vite (`excalidraw-app/vite.config.mts`), аліаси на вихідні `.ts`/`.tsx` у `packages/*` для локальної розробки.
- **Пакети бібліотеки:** збірка ESM через `scripts/buildPackage.js` (`@excalidraw/excalidraw`), `buildBase.js` (`common`, `element`, `math`), `buildUtils.js` (`@excalidraw/utils`); експорт `development` / `production` у `package.json` пакетів.

## Шари пакетів (залежності)

| Пакет | Роль |
|--------|------|
| `@excalidraw/common` | Константи, утиліти, події; залежить від `tinycolor2`. |
| `@excalidraw/math` | Геометрія, вектори, криві (без React). |
| `@excalidraw/element` | Типи елементів, `Scene`, `Store`, дельти, мутації; залежить від `common` + `math`. |
| `@excalidraw/excalidraw` | React-компонент редактора, UI, дані, рендер; залежить від `common`, `element`, `math`. |
| `@excalidraw/utils` | Додаткові утиліти (окремий пакет, версія `0.1.2`). |

**Напрямок залежностей:** `excalidraw` → `element` → `math` / `common`; уникати зворотних імпортів з `element` у `excalidraw` (у `store.ts` тип `App` — виняток для зв’язку зі стором).

## Додаток `excalidraw-app`

- **Вхід:** `index.tsx` → `<ExcalidrawApp />`.
- **Композиція:** `TopErrorBoundary` → Jotai `Provider` → `ExcalidrawAPIProvider` → `ExcalidrawWrapper` з `<Excalidraw ... />` (`App.tsx`).
- **Інтеграції застосунку:** Firebase, Socket.io, Sentry, `idb-keyval`, власні атоми колаборації; не входять у пакет `@excalidraw/excalidraw`.

## Ядро редактора (`packages/excalidraw`)

### Публічний API

- Експорт з `index.tsx`: обгортка `<Excalidraw>`, `ExcalidrawAPIProvider`, `polyfill()`, хуки стану.
- `ExcalidrawAPIProvider` тримає імперативний API в React Context для коду поза деревом `<Excalidraw>`.

### Клас `App` (`components/App.tsx`)

- Великий класовий компонент React — центр життєвого циклу канвасу.
- У конструкторі ініціалізуються:
  - `ActionManager` → `registerAll(actions)` + undo/redo;
  - `Scene` (з `@excalidraw/element`);
  - `Renderer(this.scene)`;
  - `Store(this)` та `History(this.store)`;
  - `rough.canvas`, шрифти, бібліотека.
- Імперативний API редактора створюється в `createExcalidrawAPI()`.

### Патерн «дії» (command-like)

- **`ActionManager`** (`actions/manager.tsx`): реєстрація `Action`, делегування `perform`, підтримка async-результатів.
- **`Action`** (`actions/types.ts`): `name`, `perform`, опційно `keyTest`, `predicate`, `PanelComponent`, `trackEvent`.
- Реєстрація нових дій: `register()` у `actions/register.ts` збирає масив, потім `registerAll` у `App`.

### Сцена та рендер

- **`Scene`** (`packages/element/src/Scene.ts`): володіє масивом/мапою елементів, похідними колекціями не видалених елементів і службовими кешами стану, `sceneNonce` для інвалідації кешу рендера.
- **`Renderer`** (`packages/excalidraw/scene/Renderer.ts`): мемоізоване обчислення `RenderableElementsMap` і `visibleElements` від `Scene` + фрагментів `AppState` (zoom, scroll, viewport).
- Статичний рендер канвасу: `renderStaticScene` / throttle (`renderer/staticScene`).

### Стан, історія, колаборація

- **`Store`** (`packages/element/src/store.ts`): знімки `StoreSnapshot`, планування `CaptureUpdateAction`, еміт подій інкрементів (`onStoreIncrementEmitter`, `onDurableIncrementEmitter`).
- **`CaptureUpdateAction`:** `IMMEDIATELY` | `NEVER` | `EVENTUALLY` — керує тим, чи потрапляє оновлення в undo/redo (заміна старого `commitToHistory` у публічному API `updateScene`).
- **`History`** (`packages/excalidraw/history.ts`): стеки `HistoryDelta`, застосування дельт до елементів і `AppState` з виключенням `version` / `versionNonce` для коректного мультиплеєрного undo.

### Воркери

- **`WorkerPool`** (`packages/excalidraw/workers.ts`): короткоживучі `Worker` з пулом idle, TTL за замовчуванням ~1 с, перевірка що worker не змерджений у main chunk.

### Дані та сумісність версій

- **`restoreElements` / `restoreAppState`** (`packages/excalidraw/data/restore.ts`): нормалізація збережених/вхідних даних до поточних типів і дефолтів.
- **`reconcileElements`** (`packages/excalidraw/data/reconcile.ts`): узгодження масивів елементів (наприклад, віддалені оновлення).

### Локальний UI-стан (Jotai)

- `editor-jotai`, `EditorJotaiProvider` у дереві Excalidraw — атомарний стан частин UI, окремо від `AppState` класу `App`.

## Математика та експорт (`packages/math`, `packages/utils`)

- Чисті функції та типи для обчислень на полотні; тести Vitest у `packages/math/tests`, `packages/utils/tests`.

## Тестування та якість

- **Vitest** (`test:app`), **ESLint**, **Prettier**, **`tsc`** на корені (`test:all`).
- **`setupTests.ts`** у корені — глобальне налаштування тестового середовища.

## Швидкі орієнтири для змін

- Нова можливість редактора: зазвичай нова/оновлена **`Action`** + реєстрація; при зміні елементів — **`mutateElement` / `newElementWith`** з `@excalidraw/element`, оновлення сцени через шляхи `App` / `updateScene` з коректним **`captureUpdate`**.
- Зміна порядку або структури елементів на дискі/мережі: **`restore`** + **`reconcile`**.
- Продуктивність рендера: **`Renderer`** мемоізація + **`sceneNonce`** у `Scene`.
