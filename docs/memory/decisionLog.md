# Decision Log — Excalidraw

Журнал ключових архітектурних рішень. Кожен запис: контекст → рішення → наслідки.
Верифіковано з: `package.json`, `packages/excalidraw/components/App.tsx`, `excalidraw-app/vite.config.mts`.

---

## ADR-001 — Yarn Workspaces Monorepo

**Дата:** (до форку)
**Джерело:** root `package.json` → `"workspaces": ["excalidraw-app", "packages/*", "examples/*"]`

**Контекст:** Продукт складається з кількох незалежно публікованих пакетів + host-застосунку.

**Рішення:** Yarn 1 Workspaces (`"packageManager": "yarn@1.22.22"`).

**Пакети:**
- `@excalidraw/excalidraw` — публікований React-компонент (v0.18.0)
- `@excalidraw/element` — модель елементів і геометрія
- `@excalidraw/common` — спільні константи/утиліти
- `@excalidraw/math` — 2D математика
- `@excalidraw/utils` — загальні утиліти
- `excalidraw-app` — повний продукт (excalidraw.com)

**Наслідки:**
- Path aliases `@excalidraw/*` дублюються у `tsconfig.json`, `vitest.config.mts`, `vite.config.mts`
- Пакети збираються у правильному порядку: `common → math → element → excalidraw`
- `build:packages` = послідовний запуск `build:common && build:math && build:element && build:excalidraw`

---

## ADR-002 — React Class Component для ядра редактора

**Дата:** (до форку)
**Джерело:** `packages/excalidraw/components/App.tsx` — `class App extends React.Component`

**Контекст:** Редактор має складний lifecycle, велику кількість side effects і необхідність
прямого доступу до DOM/canvas поза React-рендерингом.

**Рішення:** `App` — React **class component** (~12 800 рядків).

**Причини вибору class над hooks:**
- `componentDidUpdate` дозволяє порівнювати `prevProps`/`prevState` без `useEffect` closures
- Поля класу (`this.scene`, `this.history`, тощо) уникають re-render при зміні важких об'єктів
- `withBatchedUpdates` обгортає event handlers — 27 використань у файлі

**Стан у двох рівнях:**
- `this.state: AppState` (~560 полів) — React state для UI (`this.setState` 218 раз)
- Поля класу: `Scene`, `Store`, `History`, `Renderer`, `Fonts`, `Library`, `ActionManager`, `BinaryFiles`, `imageCache` — поза React state

**Наслідки:**
- 37 ручних `addEventListener` у `addEventListeners()`, всі очищаються через `onRemoveEventListenersEmitter`
- Нові фічі важко переносити на hooks без рефакторингу
- `window.h.state` / `window.h.app` доступні в dev-режимі для тестів і дебагу

---

## ADR-003 — Елементи поза React State (Scene)

**Дата:** (до форку)
**Джерело:** `packages/excalidraw/components/App.tsx` → `this.scene = new Scene()`

**Контекст:** Елементи canvas (фігури, текст, лінії) — основні дані редактора.
Зберігання у `this.state` спричиняло б зайві re-renders при кожній зміні координат.

**Рішення:** Елементи живуть у `this.scene` (`Scene` з `@excalidraw/element`) — повністю поза React state.

**Цикл оновлення:**
```
action.perform(elements, appState) → ActionResult
  → syncActionResult()
      ├─ scene.replaceAllElements(elements)  ← елементи (без setState)
      └─ this.setState({ ...appState })      ← тільки UI-стан
```

**Наслідки:**
- `scene.onUpdate(this.triggerRender)` — ручний тригер рендерингу при зміні сцени
- `Store` + `History` незалежно відстежують snapshot елементів для undo/redo
- `Renderer.getRenderableElements()` мемоїзує visible-елементи окремо від React

---

## ADR-004 — Два Canvas-шари (Static + Interactive)

**Дата:** (до форку)
**Джерело:** `packages/excalidraw/components/canvases/` → `StaticCanvas.tsx`, `InteractiveCanvas.tsx`

**Контекст:** Canvas-рендеринг усіх елементів дорогий. Selection, handles і курсори
змінюються часто і незалежно від самих фігур.

**Рішення:** Два незалежних `<canvas>`:

| Шар | Рендерер | Вміст |
|-----|----------|-------|
| `StaticCanvas` (знизу) | `renderer/staticScene.ts` | Фінальне зображення всіх елементів |
| `InteractiveCanvas` (поверх) | `renderer/interactiveScene.ts` | Selection, handles, курсори колаборантів, snap lines |

**Наслідки:**
- Зміна selection не перемальовує всі елементи
- SVG export — окремий шлях: `renderer/staticSvgScene.ts`
- `getRenderableElements()` у `Renderer` фільтрує тільки видимі у viewport елементи

---

## ADR-005 — Jotai для атомарного стану (не Redux)

**Джерело:** `packages/excalidraw/editor-jotai.ts`, `excalidraw-app/app-jotai.ts` · Jotai 2.11.0

**Рішення:** Два ізольованих Jotai store: `editor-jotai.ts` (scoped через `jotai-scope`) і `app-jotai.ts` (collab, share). ESLint забороняє прямий `import { atom } from 'jotai'` — тільки через обгортки. `EditorJotaiProvider` обгортає `<Excalidraw />`.

---

## ADR-006 — Vite як бандлер (не CRA / Webpack)

**Джерело:** `excalidraw-app/vite.config.mts` · Vite 5.0.12

**Рішення:** Vite 5 для app; esbuild для пакетів. Плагіни: `plugin-react`, `pwa`, `svgr`, `checker`. `manualChunks` — локалі, Mermaid, CodeMirror. Path aliases дублюють tsconfig.

**Наслідки:** `yarn start` → Vite HMR; `yarn build` → `excalidraw-app/build/` (Vercel).

---

## ADR-007 — Action System як центральний патерн бізнес-логіки

**Джерело:** `packages/excalidraw/actions/manager.tsx`

**Рішення:** `ActionManager` + ~80 зареєстрованих `Action` об'єктів. Кожен `Action` містить `name`, `perform`, `keyTest?`, `PanelComponent?`. Цикл: `registerAll` → `handleKeyDown`/`executeAction` → `syncActionResult`. Нова фіча = новий `action*.ts` + реєстрація.

---

## 2026-04-04 — Дослідження App.tsx (деталі lifecycle)

**Джерело:** `packages/excalidraw/components/App.tsx`

- **`componentDidMount`**: API recreate → Store→History wire → Scene trigger → event listeners → ResizeObserver → `initializeScene`
- **`componentDidUpdate`**: `appStateObserver.flush()` → embeddables → collab sync → theme → `store.commit()` → `props.onChange`
- **`componentWillUnmount`**: renderer, scene, files, ResizeObserver, listeners, library, caches, timers
- 57 × `addEventListener`; `AnimationFrameHandler` для trails; `debounce`/`throttle` на scroll/pointer

---

## 2026-04-04 — Undocumented Behavior: прихованих патерни

**UB-001 — Implicit State Machine: `activeTool`.** Неявна стейт-машина з трьома вимірами (`lastActiveTool`, `locked`, `fromSelection`), переходи розкидані по ~6 місцях `App.tsx`. Ризик: нові інструменти можуть порушити неявні переходи.

**UB-002 — Module-level синглтони.** `IS_PLAIN_PASTE`, `lastPointerUp`, `gesture` — спільні для всіх екземплярів `<Excalidraw />`. Multi-instance = race conditions (`// TODO this is a hack`, рядок 689).

**UB-003 — WYSIWYG theme subscription.** `textWysiwyg.tsx` слухає тему через загальний `onChangeEmitter` замість цільового Store-апдейту. Зміна порядку ініціалізації = зламана тема.

**Memory leak:** якщо `pointerup` не настав → `selectionElement` залишається; `maybeCleanupAfterMissingPointerUp` — workaround.

---

## 2026-04-04 — Technical Docs створені

| # | Документ | Розташування |
|---|----------|-------------|
| 1 | Architecture (high-level, data flow, state, rendering, packages) | `docs/technical/architecture.md` |
| 2 | Dev Setup (onboarding, commands, env, troubleshooting) | `docs/technical/dev-setup.md` |

---

## Додаткова документація

- [Architecture](../technical/architecture.md) — data flow, rendering pipeline
- [Dev Setup](../technical/dev-setup.md) — onboarding, commands, env
- [Domain Glossary](../product/domain-glossary.md) — термінологія проєкту
