# Excalidraw — Системні патерни

## Архітектура

**Тип**: Монорепо (Yarn Workspaces) з розділенням на пакети.

```text
excalidraw-app (додаток)
    ├── @excalidraw/excalidraw  (React-компонент, UI, actions, renderer)
    ├── @excalidraw/element      (елементи, Scene, Store, мутації)
    ├── @excalidraw/common       (утиліти, константи, типи)
    ├── @excalidraw/math         (геометрія, вектори, точки)
    └── @excalidraw/utils        (загальні утиліти)
```

**Залежності між пакетами**:
- `excalidraw` → `element` → `common` + `math`
- `excalidraw-app` → `excalidraw` + Firebase + Socket.io

## State Management

### Дворівнева система управління станом:

**1. Jotai Atoms** (рівень додатку)
- Файл: `/excalidraw-app/app-jotai.ts`
- Кастомний Jotai store (`appJotaiStore`)
- Provider: `EditorJotaiProvider`
- Контексти: `ExcalidrawAPIContext`, `ExcalidrawAPISetContext`

**2. Store Pattern** (рівень елементів)
- Файл: `/packages/element/src/store.ts`
- Клас `Store` зі snapshot-based управлінням стану
- Два типи емітерів:
  - `onDurableIncrementEmitter` — для історії та колаборації
  - `onStoreIncrementEmitter` — для публічного API
- Стратегії захоплення дій:
  - `IMMEDIATELY` — миттєво undoable
  - `EVENTUALLY` — асинхронні багатокрокові
  - `NEVER` — remote/ініціалізація (без undo)

**3. AppState** (імутабельний об'єкт стану)
- Файл: `/packages/excalidraw/appState.ts`
- UI стан (тема, зум, viewport)
- Стан інструменту (активний інструмент, властивості ліній)
- Стан виділення (вибрані елементи)
- Фабрика: `getDefaultAppState()`

## Ключові Design Patterns

### Command Pattern — Actions
- Директорія: `/packages/excalidraw/actions/`
- ~48 файлів action-хендлерів
- Приклади:
  - `actionAlign.tsx` — вирівнювання
  - `actionDeleteSelected.tsx` — видалення
  - `actionDuplicateSelection.tsx` — дублювання
  - `actionHistory.tsx` — undo/redo
  - `actionClipboard.tsx` — буфер обміну
  - `actionExport.tsx` — експорт

### Observer/Emitter Pattern
- Пакет: `@excalidraw/common`
- Emitter для слабкого зв'язування компонентів
- `AppEventBus` для глобальних подій
- Специфічні: `onHistoryChangedEmitter`, `onStoreIncrementEmitter`

### Immutable Update Pattern
- Файл: `/packages/element/src/mutateElement.ts`
- `newElementWith()` — фабрика імутабельних оновлень
- Shallow copy з селективним override властивостей
- Збереження ідентичності елемента при оновленні

### Fractional Indexing (Z-order)
- Управління порядком елементів через дробові індекси
- Підтримка мультиплеєрних сценаріїв без колізій
- Функції: `syncMovedIndices`, `syncInvalidIndices`

### Delta-based History
- Файл: `/packages/excalidraw/history.ts`
- `HistoryDelta` extends `StoreDelta`
- Стеки `undoStack` / `redoStack`
- Пропуск невидимих/невізуальних змін
- Версійне управління для колаборації

## Data Flow

```text
Користувач (input)
    │
    ▼
Action Handler (packages/excalidraw/actions/)
    │
    ▼
Element Mutation (packages/element/src/mutateElement.ts)
    │
    ├──► Store Snapshot (packages/element/src/store.ts)
    │       ├──► History Delta (packages/excalidraw/history.ts)
    │       └──► Collab Sync (excalidraw-app/collab/)
    │
    ▼
Scene Update (packages/element/src/Scene.ts)
    │
    ▼
Renderer (packages/excalidraw/renderer/)
    ├── staticScene.ts      — статичний рендер
    ├── interactiveScene.ts — інтерактивний рендер (~1800 рядків)
    └── staticSvgScene.ts   — SVG експорт
    │
    ▼
Canvas / DOM (вивід)
```

**Persistence flow**:
```
Scene State
    ├──► IndexedDB (локально)
    ├──► localStorage (fallback)
    ├──► Firebase (хмарне збереження)
    └──► Tab Sync (між вкладками)
```

Файли: `/excalidraw-app/data/` — `FileManager.ts`, `LocalData.ts`, `firebase.ts`, `tabSync.ts`

## Система типів

### Branded Types (типова безпека)
- `FontString` — валідовані рядки шрифтів
- `FractionalIndex` — для порядку елементів
- `GroupId` — ідентифікатори груп
- `FileId` — ідентифікатори файлів
- `SocketId` — ID сокетів колаборації

### Utility Types
- Файл: `@excalidraw/common/utility-types`
- `Merge`, `MarkNonNullable`, `ValueOf`, `MakeBrand`
- Type guards: `NonDeletedExcalidrawElement`, `NonDeleted<T>`

### Element Types
- Файл: `/packages/element/src/types.ts`
- Базові readonly властивості: `id`, `x`, `y`, `width`, `height`, `angle`, `seed`, `version`
- Метадані: `isDeleted`, `groupIds`, `frameId`, `boundElements`, `index`
- Варіанти: Rectangle, Diamond, Ellipse, Line, Arrow, Text, Image, Frame тощо
- Поле `updated` — timestamp для reconciliation при колаборації

### Path Aliases (tsconfig.json)
- `@excalidraw/common` → `/packages/common/src/`
- `@excalidraw/element` → `/packages/element/src/`
- `@excalidraw/excalidraw` → `/packages/excalidraw/index.tsx`
- `@excalidraw/math` → `/packages/math/src/`

## Тестова архітектура

### Фреймворк та конфігурація
- **Vitest 3.0.6** з JSDOM середовищем
- Конфіг: `/vitest.config.mts`
- Setup: `/setupTests.ts`

### Мокінг
- Canvas API: `vitest-canvas-mock`
- IndexedDB: `fake-indexeddb/auto`
- Поліфіли для `window.crypto`, RAF, шрифтів

### Структура тестів
- **Unit тести**: `/packages/element/tests/` — чисті функції (bounds, selection)
- **Component тести**: `/packages/excalidraw/tests/` — React Testing Library
- **Integration тести**: `/excalidraw-app/tests/` — повний рендер `<ExcalidrawApp />`
- Хелпери: `/packages/excalidraw/tests/helpers/api.ts`

### Coverage thresholds (vitest.config.mts)

| Метрика | Поріг |
|---|---|
| Lines | 60% |
| Branches | 70% |
| Functions | 63% |
| Statements | 60% |

### Патерни тестування
- Фабрика `_ce()` для створення тестових елементів
- `act()` обгортка для state-апдейтів
- Мокінг Firebase та Socket.IO для інтеграційних тестів
- Snapshot-тести для складних UI компонентів

## Конвенції коду

- **Компоненти**: PascalCase (`App.tsx`, `DefaultSidebar.tsx`)
- **Утиліти**: camelCase (`getDefaultAppState`, `newElementWith`)
- **Константи**: UPPER_SNAKE_CASE
- **Actions**: `action<Feature>.tsx` (command pattern)
- **Стилі**: Co-located SCSS (`Component.tsx` + `Component.scss`)
- **Тести**: `.test.ts` / `.test.tsx` суфікс
