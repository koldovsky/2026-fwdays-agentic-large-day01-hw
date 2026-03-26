# Decision log

Формат: **рішення**, **контекст (факт з коду)**, **де зафіксовано**. Останні записи можуть стосуватися документації цього клону, якщо вони відображають прийнятий підхід до знань про код.

## Архітектура редактора (випливає з реалізації)

| ID | Рішення | Обґрунтування в коді |
|----|---------|----------------------|
| D1 | Кореневий UI-стан редактора тримається в **React `state` класу `App`**, а не в Redux. | `class App extends React.Component<AppProps, AppState>` (`packages/excalidraw/components/App.tsx`). |
| D2 | Зміни користувача проходять через **Command-подібні `Action`** і **`ActionManager`**, який викликає `perform` і передає результат у **`syncActionResult`**. | `packages/excalidraw/actions/manager.tsx`, `actions/types.ts` (`ActionResult`), конструктор `App` з `new ActionManager(this.syncActionResult, ...)`. |
| D3 | Елементи сцени живуть у **`Scene`** (пакет `element`), а не в React state. | `this.scene = new Scene()` у конструкторі `App`; `replaceAllElements` у `syncActionResult`. |
| D4 | Запис у історію (undo/redo) зав’язаний на **`Store`** і **`CaptureUpdateAction`** (`IMMEDIATELY` / `NEVER` / `EVENTUALLY`). | `packages/element/src/store.ts`; `syncActionResult` викликає `this.store.scheduleAction(actionResult.captureUpdate)`. |
| D5 | Рендер розділений на **статичний** та **інтерактивний** canvas плюс окремий шар для **нового елемента**. | `StaticCanvas`, `InteractiveCanvas`, `NewElementCanvas` у `App.render` (`packages/excalidraw/components/App.tsx`). |
| D6 | Малювання елемента на статичному шарі делеговане в пакет **`@excalidraw/element`** (`renderElement`). | `import { renderElement } from "@excalidraw/element"` у `packages/excalidraw/renderer/staticScene.ts`. |
| D7 | Частина UI-стану редактора винесена в **Jotai** з **`jotai-scope`**, окремо від `AppState`. | `packages/excalidraw/editor-jotai.ts` (`createIsolation`, `EditorJotaiProvider`). |
| D8 | Застосунок-обгортка може тримати власний Jotai **store** для домену додатку. | `excalidraw-app/app-jotai.ts` (`createStore`, `Provider`). |
| D9 | Монорепозиторій збирається через **Yarn workspaces** і **path aliases** для `@excalidraw/*` у `tsconfig` / Vite / Vitest. | Кореневий `package.json` (`workspaces`, `packageManager`); `tsconfig.json` `paths`; `excalidraw-app/vite.config.mts`. |
| D10 | Бібліотечні пакети збираються **esbuild**-скриптами, застосунок — **Vite**. | `scripts/buildPackage.js`, `buildBase.js`, `buildUtils.js`; `excalidraw-app/package.json` scripts з `vite`. |

## Залежності між пакетами (npm `dependencies`)

| ID | Рішення | Факт |
|----|---------|------|
| D11 | `element` залежить від `common` і `math`; `math` — від `common`. | `packages/element/package.json`, `packages/math/package.json`. |
| D12 | `excalidraw` оголошує залежності на `common`, `element`, `math`, `utils` (`0.1.2`) та інші пакети у `package.json`. | `packages/excalidraw/package.json`. |
| D13 | Пакети **`element`** та **`excalidraw`** оголошують **`@excalidraw/utils`** (`0.1.2`) у своїх `package.json`, узгоджено з імпортами з коду. | `packages/element/package.json`, `packages/excalidraw/package.json`. |

## Циклічні зв’язки (навітьтність дизайну)

| ID | Рішення | Факт |
|----|---------|------|
| D14 | `Store` у `element` приймає посилання на **`App`** з `excalidraw`. | `constructor(private readonly app: App)` у `packages/element/src/store.ts`, імпорт типу `App` з `@excalidraw/excalidraw/components/App`. |
| D15 | `Scene` використовує типи **`AppState`** з пакета `excalidraw`. | Імпорт у `packages/element/src/Scene.ts` з `../../excalidraw/types`. |

## Документація Memory Bank / technical (цей клон)

| ID | Рішення | Нотатка |
|----|---------|---------|
| D16 | Зберігати стислий контекст проєкту в **`docs/memory/`**. | Файли `projectbrief.md`, `techContext.md`, `systemPatterns.md`, `productContext.md`, `activeContext.md`, `progress.md`, `decisionLog.md`. |
| D17 | Детальну архітектуру тримати окремо в **`docs/technical/architecture.md`**. | Щоб не дублювати довгі потоки в кожному memory-файлі; посилання з `systemPatterns.md` / `activeContext.md`. |
| D18 | Неочевидну поведінку та ризики збирати в **`docs/technical/undocumented-behavior.md`**. | HACK/FIXME, render cycle, ініціалізація. |
| D19 | Продуктовий зріз з коду — у **`docs/product/PRD.md`** (reverse-engineered PRD). | Мета, аудиторія, функції, обмеження з типів і README пакета. |

## Technical і Product docs (посилання)

**Technical** (`docs/technical/`):

- [architecture.md](../technical/architecture.md)
- [dev-setup.md](../technical/dev-setup.md)
- [undocumented-behavior.md](../technical/undocumented-behavior.md)

**Product** (`docs/product/`):

- [PRD.md](../product/PRD.md)
- [domain-glossary.md](../product/domain-glossary.md)

## Як додавати нові записи

### Ідентифікатори

- Додай новий рядок у **відповідну** таблицю за темою (архітектура, залежності, цикли, документація тощо).
- Номер ID має йти **послідовно** після найвищого вже використаного в цьому файлі.
- Приклад: якщо останній запис — **D19**, наступний — **`D20`**, далі `D21`, `D22`, …

### Обов’язково

- Шлях до файлу або символу в коді, який підтверджує рішення.

### Уникати

- Записів без прив’язки до коду, якщо це не явна домовленість команди (тоді вказати джерело: мітинг, RFC, повідомлення).
