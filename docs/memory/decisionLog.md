# Decision Log: Excalidraw

> Архівовані ключові архітектурні та продуктові рішення.
> Джерела: CHANGELOG.md, source code comments, PR references.

---

## ADR-001: Class Component для `App.tsx`

**Статус:** Активне  
**Контекст:** Головний компонент — `class App extends React.Component`

**Рішення:** Зберегти class component (не переходити на functional)

**Причини:**
- Stable `this` для pointer-event handlers без stale-closure проблем
- `ExcalidrawImperativeAPI` потребує стабільних references на методи
- `componentWillUnmount` дає надійний cleanup для 20+ event listeners
- class instance зручніший для `window.h` debug API в dev mode

**Trade-offs:** ~12 800 рядків у одному файлі (God Object pattern)

---

## ADR-002: Мутабельний Scene (поза React)

**Статус:** Активне  
**Контекст:** Canvas-елементи зберігаються у `Scene` об'єкті, поза React state

**Рішення:** `scene.mutateElement()` + іммутабельні елементи + `triggerRender()`

**Причини:**
- Canvas читає елементи напряму — zero copy при render
- React re-render не потрібен для кожного pointer move
- `StaticCanvas` кешується — перемальовується тільки при реальних змінах

**Trade-offs:** Два джерела правди (Scene + AppState) — треба синхронізувати

---

## ADR-003: Delta-based History (не snapshots)

**Статус:** Активне, v0.18.0 (#7348)  
**Контекст:** Undo/Redo система

**Рішення:** `Store` → `StoreDelta` → `HistoryDelta[]` стеки

**Причини:**
- Snapshots великих canvas — великий RAM footprint
- Delta дозволяє multiplayer undo (окремі стеки для local vs remote)
- `CaptureUpdateAction.NEVER` — remote updates не потрапляють в undo stack

**Пов'язано:** Renamed `commitToHistory` → `captureUpdate` (breaking change v0.18)

---

## ADR-004: Два Canvas Layers

**Статус:** Активне  
**Контекст:** Продуктивність rendering

**Рішення:** `StaticCanvas` + `InteractiveCanvas` (окремих два `<canvas>`)

**Причини:**
- Static: рідко перемальовується (тільки при мутаціях)
- Interactive: кожен pointer event (selection handles, snap lines, cursor)
- Поділ дозволяє кешувати важкий static layer

---

## ADR-005: ESM замість UMD (v0.18.0, #7441)

**Статус:** Активне  
**Контекст:** Формат npm пакету

**Рішення:** Перехід з UMD bundle → ESM (ES Modules)

**Причини:**
- Tree shaking — менший bundle
- Сучасний стандарт
- Locales як ES modules (а не static JSON)
- CRA офіційно більше не підтримується

**Migration:** Потрібен `moduleResolution: "bundler"|"node16"` у tsconfig

---

## ADR-006: Jotai + jotai-scope (ізольований store)

**Статус:** Активне  
**Контекст:** Глобальний реактивний стан для дрібних UI деталей

**Рішення:** `createIsolation()` з `jotai-scope` → `EditorJotaiProvider`

**Причини:**
- Ізоляція: кілька `<Excalidraw>` на сторінці не конфліктують
- Atom-level subscriptions — компоненти ре-рендеряться тільки при зміні свого атому
- Не замінює AppState — доповнює для дрібних concerns

---

## ADR-007: Firebase для shared scenes та images

**Статус:** Активне  
**Контекст:** Backend storage для share links та collab

**Рішення:** Firebase Firestore + Storage

**Причини:**
- Serverless — не потрібен власний backend для OSS версії
- Шифрування на стороні клієнта (Web Crypto) — Firebase не бачить контенту
- Firebase Storage для image files окремо від scene JSON

**Dev setup:** Використовується `excalidraw-oss-dev` Firebase project для розробки

---

## ADR-008: roughjs для rendering стилю

**Статус:** Активне (з самого початку)  
**Контекст:** Візуальний стиль

**Рішення:** Всі форми рендеряться через `roughjs`

**Причини:**
- Визначальна риса продукту — "hand-drawn feel"
- Знижує психологічний бар'єр (не потрібні ідеальні схеми)
- Диференціація від інших whiteboard tools

---

## ADR-009: Monorepo з Yarn Workspaces

**Статус:** Активне  
**Контекст:** Організація коду

**Рішення:** 4 окремих пакети: `common`, `math`, `element`, `excalidraw`

**Причини:**
- `@excalidraw/element` — може використовуватися без React (server-side, node)
- `@excalidraw/math` — zero-deps math lib
- Поступове розгортання (decoupling від `App.tsx`)
- `index-node.ts` у `excalidraw` пакеті — node-safe exports без browser APIs

**Build order:** `common → math → element → excalidraw`

---

## ADR-010: Fractional Indexing для Z-order (#7359, v0.18.0)

**Статус:** Активне  
**Контекст:** Z-index елементів при collab

**Рішення:** Fractional index (string-based) замість integer array index

**Причини:**
- Integer index потребує ребалансування при кожній вставці
- Fractional: вставка між двома елементами без зміни інших
- Multiplayer-safe без конфліктів при concurrent operations

---

## ADR-011: Undocumented Behavior - Text Element UI State Side Effects

**Статус:** Виявлено (TODO)  
**Контекст:** `packages/excalidraw/components/App.tsx:5737`

**Опис проблематики:** При сабміті тексту за допомогою клавіатури, відбувається неочевидний side effect: компонент вручну гарантує оновлення React-стану перед викликом екшену `finalize` через `flushSync`.
**Проблема (Implicit state machine):** Стан оновлюється кількома різними гілками коду в різних місцях, що створює order dependency та прихований state machine.
**Рекомендовано коментарем:** "TODO either move this into finalize as well, or handle all state updates in one place, skipping finalize action".

---

## ADR-012: Undocumented Behavior - Initialization Order Dependency у UIOptions

**Статус:** Виявлено (FIXME)  
**Контекст:** `packages/excalidraw/index.tsx:105`

**Опис проблематики:** Під час мапінгу дефолтних властивостей `UIOptions` порушується мемоїзація.  
**Проблема (Initialization order dependency):** Нормалізація та застосування значень за замовчуванням відбувається прямо у компоненті обгортки (`ExcalidrawBase`), що призводить до того, що resolver для мемоїзації порівнює щоразу нові посилання об'єктів.
**Рекомендовано коментарем:** "FIXME normalize/set defaults in parent component so that the memo resolver compares the same values".

---

## ADR-013: Undocumented Behavior - Порушення версіонування при видаленні невидимих елементів

**Статус:** Виявлено (TODO)  
**Контекст:** `packages/excalidraw/data/restore.ts:408`

**Опис проблематики:** Під час відновлення порожніх текстових елементів вони локально помічаються як видалені (isDeleted: true), обходячи стандартний механізм storage mutation.
**Проблема (Неочевидні side effects):** Відбувається розсинхронізація (breaks sync / versioning), оскільки ця подія видалення не фіксується і не потрапляє в дельти для інших клієнтів.
**Рекомендовано коментарем:** "TODO: we should not do this since it breaks sync / versioning when we exchange / apply just deltas and restore the elements (deletion isn't recorded)".
