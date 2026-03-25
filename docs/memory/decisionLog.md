# Excalidraw — Decision Log

## Ключові архітектурні рішення

---

### 1. Monorepo з Yarn Workspaces

**Рішення**: Розділити кодову базу на окремі пакети в монорепо.

**Пакети**:
- `@excalidraw/common` — утиліти, константи, типи
- `@excalidraw/element` — логіка елементів, Scene, Store
- `@excalidraw/math` — геометрія, вектори
- `@excalidraw/utils` — загальні утиліти
- `@excalidraw/excalidraw` — React-компонент (бібліотека)
- `excalidraw-app` — веб-додаток

**Обґрунтування**:
- Чітке розділення відповідальності (separation of concerns)
- Можливість публікувати пакети окремо на NPM
- Незалежне версіонування
- Tree-shaking через deep import paths
- Спрощення тестування окремих модулів

**Файл**: `/package.json` (workspaces конфігурація)

---

### 2. Jotai для State Management

**Рішення**: Використовувати Jotai замість Redux/Zustand/MobX.

**Реалізація**:
- Кастомний store: `appJotaiStore` / `editorJotaiStore`
- Ізоляція через `jotai-scope` → `createIsolation()`
- Provider pattern: `<EditorJotaiProvider>`
- Обмежені імпорти: ESLint правило забороняє прямий імпорт з `jotai`

**Обґрунтування**:
- Атомарна реактивність — тільки потрібні компоненти перерендерюються
- Мінімальний boilerplate порівняно з Redux
- Малий розмір бандлу
- Природна інтеграція з React hooks
- Підтримка ізольованих контекстів для вбудовування компонента

**Файли**: `/packages/excalidraw/editor-jotai.ts`, `/excalidraw-app/app-jotai.ts`

---

### 3. Fractional Indexing для Z-ordering

**Рішення**: Використовувати дробові індекси для порядку елементів замість цілочисельних.

**Реалізація**:
- Бібліотека `fractional-indexing`
- Поле `index` (branded type `FractionalIndex`) на кожному елементі
- Функції: `syncMovedIndices`, `syncInvalidIndices`

**Обґрунтування**:
- **Collaboration-first**: дозволяє офлайн-зміни порядку без серверного консенсусу
- Вставка елемента між двома іншими без перенумерації всіх
- Уникнення конфліктів при одночасному переміщенні різними користувачами
- CRDTs-сумісний підхід

**Файл**: `/packages/element/src/fractionalIndex.ts`

---

### 4. Vite замість webpack/CRA

**Рішення**: Мігрувати з Create React App (webpack) на Vite.

**Обґрунтування**:
- Значно швидший dev server (ESM native modules)
- Швидша збірка production бандлу
- CRA deprecated
- Нативна підтримка TypeScript без додаткових плагінів
- Кращий HMR (Hot Module Replacement)

**Breaking change**: Потребує `moduleResolution: "bundler"` в tsconfig

**Файли**: `/excalidraw-app/vite.config.mts`, `/vitest.config.mts`

---

### 5. ESM замість UMD

**Рішення**: Перейти з UMD (Universal Module Definition) на ES Modules (v0.18.0).

**Обґрунтування**:
- Стандарт JavaScript — нативна підтримка в браузерах і Node.js
- Tree-shaking — менший фінальний бандл для споживачів
- Кращий static analysis
- Сумісність з сучасними build tools (Vite, Rollup, esbuild)

**Наслідки**: Breaking change для споживачів, які використовували UMD/CommonJS

**Файл**: `/packages/excalidraw/package.json` (type: "module")

---

### 6. Delta-based History (Undo/Redo)

**Рішення**: Реалізувати undo/redo через дельти стану, а не повні снепшоти.

**Реалізація**:
- `HistoryDelta` extends `StoreDelta`
- Стеки `undoStack` / `redoStack`
- Пропуск невідомих/невізуальних змін
- Версійне управління для reconciliation

**Обґрунтування**:
- Менше споживання пам'яті (зберігаються тільки різниці)
- Підтримка multiplayer undo/redo (Figma-модель)
- Можливість мерджити дельти від різних користувачів
- Гранулярний контроль: які зміни undoable (IMMEDIATELY/EVENTUALLY/NEVER)

**Файли**: `/packages/excalidraw/history.ts`, `/packages/element/src/store.ts`

---

### 7. Canvas Rendering (три шари)

**Рішення**: Розділити рендеринг на три окремі canvas-шари.

**Шари**:
1. `StaticCanvas` — фінальний рендер елементів
2. `InteractiveCanvas` — зворотний зв'язок при взаємодії (виділення, ручки)
3. `NewElementCanvas` — елемент, що зараз створюється

**Обґрунтування**:
- Продуктивність: перемальовується тільки потрібний шар
- Інтерактивний шар оновлюється частіше без повного перерендерингу сцени
- Чітке розділення static vs dynamic рендерингу

**Файли**: `/packages/excalidraw/renderer/staticScene.ts`, `interactiveScene.ts`

---

### 8. Immutable Elements з Shallow Copy

**Рішення**: Елементи readonly; мутації створюють нові об'єкти через shallow copy.

**Реалізація**: `newElementWith()` — фабрика для створення оновленого елемента

**Обґрунтування**:
- Простота порівняння (reference equality)
- Безпечність у concurrent scenarios (collaboration)
- Предсказуваність: елемент не змінюється після створення
- Ефективність: shallow copy замість deep clone

**Файл**: `/packages/element/src/mutateElement.ts`

---

### 9. Firebase для Backend Services

**Рішення**: Використовувати Firebase як backend (auth, storage, Firestore).

**Обґрунтування**:
- Швидкий старт без власного backend
- Real-time database для колаборації
- Аутентифікація "з коробки"
- Масштабованість хмарної інфраструктури

**Файли**: `/excalidraw-app/data/firebase.ts`, `/firebase-project/`

---

### 10. Vitest замість Jest

**Рішення**: Використовувати Vitest як тестовий фреймворк.

**Обґрунтування**:
- Нативна інтеграція з Vite (спільна конфігурація, aliases)
- Швидший за Jest завдяки ESM та паралельному виконанню
- API-сумісний з Jest (мінімальна міграція)
- Вбудований coverage reporting

**Файл**: `/vitest.config.mts`

---

### 11. Restricted Imports (ESLint)

**Рішення**: Заборонити прямі імпорти з `jotai` та barrel-файлів пакетів.

**Правила**:
- Jotai: імпорт тільки через `editor-jotai.ts` обгортку
- Пакети: заборона імпорту з `@excalidraw/excalidraw` barrel (index.tsx) зсередини пакету

**Обґрунтування**:
- Контроль над API surface
- Уникнення циклічних залежностей
- Єдина точка конфігурації Jotai store

**Файл**: `/.eslintrc.json` (restricted-imports правила)
