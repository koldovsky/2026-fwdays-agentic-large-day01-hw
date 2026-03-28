# System patterns — архітектура та патерни Excalidraw

## Загальна модель

- **React** як оболонка UI; кореневий класовий компонент **`App`** у `packages/excalidraw/components/App.tsx` тримає більшість життєвого циклу редактора та `AppState`.
- **Два шари canvas:** «статична» сцена (фон, сітка, фігури) і «інтерактивна» (виділення, хендли, remote pointers). Це зменшує зайві перемальовування й спрощує експорт.

## Управління станом

- **`AppState`** — центральний опис UI-стану (інструмент, zoom, scroll, виділення, діалоги, колаборатори тощо). Тип: `packages/excalidraw/types.ts`, дефолти: `packages/excalidraw/appState.ts`.
- **Елементи сцени** — масив/мапа `ExcalidrawElement` з пакета **`@excalidraw/element`**; оновлення проходять через логіку `App` (history, reconciliation).
- **Jotai** використовується для частини UI-стану (пакет `jotai` у залежностях), але доменна модель дошки зав’язана на `App` + елементи.

## Система дій (Action system)

- Кожна команда (меню, шорткат, палітра) інкапсульована як **`Action`**: `perform`, `predicate`, `keyTest`, `trackEvent` тощо — `packages/excalidraw/actions/types.ts`.
- **`ActionManager`** (`packages/excalidraw/actions/manager.tsx`) реєструє дії та викликає `perform` з оновленням стану через переданий `updater`.
- Реєстрація наборів дій: `packages/excalidraw/actions/register.ts` (`register` додає дії в загальний список).

## Рендеринг (Canvas pipeline)

- **Static scene:** `packages/excalidraw/renderer/staticScene.ts` — сітка, видимі елементи, roughjs (`RoughCanvas` передається в конфіг).
- **Interactive scene:** `packages/excalidraw/renderer/interactiveScene.ts` — selection box, linear handles, remote cursors, scrollbars.
- **Компоненти canvas:** `StaticCanvas.tsx`, `InteractiveCanvas.tsx`, `NewElementCanvas.tsx` у `packages/excalidraw/components/canvases/` — зв’язують React refs з функціями рендеру.
- **Новий елемент у процесі створення:** `packages/excalidraw/renderer/renderNewElementScene.ts` (стан `appState.newElement`).

## Модель елементів

- Базові властивості (позиція, стиль, `version`, `versionNonce`, `index`, `groupIds`, `frameId`, `boundElements`) — у `packages/element/src/types.ts`.
- Окремі типи: прямокутники, еліпси, лінійні елементи, текст, фрейми, embeddable тощо — дискримінатор `type`.

## Геометрія та сцена

- **`@excalidraw/math`** — точки, трансформації (наприклад `Point` з узгодженими типами).
- Модуль **`packages/excalidraw/scene/`** — нормалізація zoom, скрол, експорт, типи конфігів рендеру (`scene/types.ts`), а також реекспорт хелперів з `@excalidraw/element`.

## Колаборація (патерн)

- У `AppState` є `collaborators`, у конфігу інтерактивного рендеру — мапи remote pointers / selected ids (`InteractiveCanvasRenderConfig` у `scene/types.ts`).
- Транспорт (socket.io, firebase) підключається на рівні **`excalidraw-app`**, а редактор відображає узгоджений набір елементів і UI-стану колаборації.

## Патерни розширення

- Нові користувацькі дії — новий `Action` + реєстрація в `ActionManager`.
- Нові типи елементів — розширення типів у `element`, обробники в `App` та відповідні гілки рендеру.
- Стилі коду для AI/людей: `.github/copilot-instructions.md` (TypeScript, hooks, CSS modules де застосовно).

---

## Документація інших рівнів

- **Технічна:** [Архітектура](../technical/architecture.md), [Онбординг і перший PR](../technical/dev-setup.md)
- **Продукт:** [PRD](../product/PRD.md), [Глосарій](../product/domain-glossary.md)
- **Memory Bank:** [projectbrief](./projectbrief.md), [techContext](./techContext.md), [activeContext](./activeContext.md), [progress](./progress.md)
