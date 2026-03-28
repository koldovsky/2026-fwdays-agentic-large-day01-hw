# Decision log — ключові рішення

Журнал прийнятих рішень щодо архітектури та інструментів, релевантних цьому репозиторію. Формат: дата (за наявності), контекст, рішення, наслідки.

## R-001 — Monorepo з Yarn workspaces

- **Контекст:** Excalidraw складається з додатка, кількох пакетів (`common`, `element`, `excalidraw`, `math`, `utils`) та прикладів.
- **Рішення:** один репозиторій, `workspaces` у кореневому `package.json`, спільні dev-залежності та скрипти збірки/тестів з кореня.
- **Наслідки:** зміни в `packages/*` потребують збірки пакетів перед запуском додатка; команди типу `yarn build:packages`, `yarn --cwd ./excalidraw-app start`.

## R-002 — TypeScript як основна мова редактора

- **Контекст:** велика кількість взаємопов’язаних типів (елементи, стан додатка, дії).
- **Рішення:** новий код у стилі проєкту — TypeScript, суворі типи для елементів і `AppState`.
- **Наслідки:** зміни в `packages/excalidraw/types.ts` та пакеті `element` каскадно впливають на компіляцію.

## R-003 — Vite для збірки додатка (поточний стек репо)

- **Контекст:** у кореневих `devDependencies` присутні `vite`, `@vitejs/plugin-react`, плагіни PWA/checker/SVGR.
- **Рішення:** збірка/розробка додатка орієнтована на Vite-екосистему (див. скрипти `excalidraw-app`).
- **Наслідки:** для локального дев-сервера використовуються vite-орієнтовані команди з `package.json`, не слід документувати застарілі webpack-команди без перевірки.

## R-004 — Розділення пакетів `math` / `element` / `excalidraw`

- **Контекст:** геометрія, модель елементів і React-редактор — різні шари.
- **Рішення:** `@excalidraw/math` для обчислень, `@excalidraw/element` для моделі елементів, `@excalidraw/excalidraw` для UI та інтеграційного API.
- **Наслідки:** виправлення багів рендеру часто торкаються `excalidraw`, тоді як нормалізація елементів — `element`/`common`.

## R-005 — Документація для AI та рев’ю (воркшоп)

- **Контекст:** перевірка PR автоматизована (CodeRabbit) + ручний чеклист.
- **Рішення:** тримати Memory Bank у `docs/memory/*.md`, технічні документи в `docs/technical/`, продукт — у `docs/product/`; уникати порожніх секцій і неверіфікованих фіч.
- **Наслідки:** зміни в `.coderabbit.yaml` або шаблоні PR потребують синхронізації з фактичним вмістом `docs/`.

---

## Недокументована поведінка (код vs публічна документація)

Фрагменти поведінки, які **не описані** в `packages/excalidraw/README.md` або загальнопродуктових гайдах, але **впливають** на збірку, тести чи рендер. Зафіксовано для онбордингу та AI-контексту.

### U-001 — `useEffect` у `NewElementCanvas` без масиву залежностей

- У `packages/excalidraw/components/canvases/NewElementCanvas.tsx` виклик `useEffect(() => { ... })` оформлено **без другого аргументу** (масиву залежностей немає).
- Після кожного commit-рендеру React знову виконує колбек цього ефекту; у колбеці викликається `renderNewElementScene` з поточними `props` (`appState.newElement`, `elementsMap`, `allElementsMap`, `scale`, `rc`, `renderConfig`, `appState`).
- У `packages/excalidraw/README.md` немає опису цього виклику `useEffect` / `renderNewElementScene`.

### U-002 — Дефолтна «округлість» кутів залежить від тестового режиму

- У `packages/excalidraw/appState.ts` у `getDefaultAppState()` полю `currentItemRoundness` присвоюється вираз `isTestEnv() ? "sharp" : "round"`.
- У `packages/common/src/utils.ts` `isTestEnv()` визначено як `import.meta.env.MODE === ENV.TEST`.
- У `packages/excalidraw/README.md` немає пояснення, що початкове `currentItemRoundness` залежить від `isTestEnv()`.

### U-003 — Часові мітки та ID елементів у тестах детерміновані

- У `packages/common/src/utils.ts` `getUpdatedTimestamp()` повертає `1`, якщо `isTestEnv()` істинне, інакше `Date.now()`.
- У `packages/common/src/random.ts` `randomId()` повертає `` `id${testIdBase++}` ``, якщо `isTestEnv()` істинне, інакше результат виклику `nanoid()`.
- У `packages/excalidraw/README.md` немає опису гілок `getUpdatedTimestamp` / `randomId` для інтеграторів пакета.

### U-004 — Скрипт `start` у `excalidraw-app` завжди запускає `yarn`

- У `excalidraw-app/package.json` значення `scripts.start` — рядок `"yarn && vite"`.
- У кореневому `package.json` значення `scripts.start` — рядок `"yarn --cwd ./excalidraw-app start"`.
- Локальний порядок команд для розробника: [dev-setup.md](../technical/dev-setup.md).

---

## Як додавати новий запис

1. Ідентифікатор `R-XXX` (інкремент).
2. Короткий **Контекст** (проблема або питання).
3. **Рішення** одним або кількома реченнями.
4. **Наслідки** для розробки та документації.

---

## Документація інших рівнів

- **Технічна:** [Архітектура](../technical/architecture.md), [Онбординг і перший PR](../technical/dev-setup.md)
- **Продукт:** [PRD](../product/PRD.md), [Глосарій](../product/domain-glossary.md)
- **Memory Bank:** [projectbrief](./projectbrief.md), [techContext](./techContext.md), [systemPatterns](./systemPatterns.md)
