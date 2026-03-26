# System patterns

## Монорепозиторій і межі пакетів

- **Горизонтальний поділ:** `@excalidraw/common`, `@excalidraw/math`, `@excalidraw/element`, `@excalidraw/utils` — низькорівневі типи/геометрія/модель/утиліти; **`@excalidraw/excalidraw`** агрегує UI, scene, data, i18n.
- **Локальна розробка без publish:** `tsconfig.json` **paths** маплять `@excalidraw/*` на `packages/*/src` або `packages/excalidraw/*` — один тип узгодження для IDE, тестів і Vite.
- **Публікація:** пакет `excalidraw` має **умовні exports** (`development` / `production` для JS і CSS) — див. `packages/excalidraw/package.json` → поле `exports`.

## Публічний API редактора

- **Точка входу бібліотеки:** `packages/excalidraw/index.tsx` експортує компонент **`Excalidraw`**, обгортки контексту (**`ExcalidrawAPIProvider`**, контексти API з `components/App`), плюс реекспорт UI-деталей згідно з barrel-файлом.
- **Імперативний API:** через **`onExcalidrawAPI`** / **`useExcalidrawAPI`** (описано коментарями в `index.tsx` щодо хуків на базі API).
- **Стан редактора:** **Jotai** — `EditorJotaiProvider`, `editorJotaiStore` в `index.tsx`; продукт додатково використовує `excalidraw-app/app-jotai.ts`.

## Внутрішній патерн редактора (в `packages/excalidraw`)

- **Core orchestrator:** `components/App.tsx` тримає `AppState`, `Scene`, `Renderer`, `ActionManager`, `Store`, `History`.
- **Action-driven updates:** UI/shortcuts запускають actions -> `ActionManager` -> `syncActionResult(...)` -> зміни `scene`/`state`.
- **State commit loop:** у `componentDidUpdate` викликається `store.commit(elementsMap, state)`; після цього тригеряться `onChange`/`onIncrement`.
- **Контексти для дочірнього UI:** `ExcalidrawAppStateContext`, `ExcalidrawElementsContext`, `ExcalidrawActionManagerContext`, `ExcalidrawAPIContext` (усі піднімаються в `App.tsx`).

## Застосунок поверх бібліотеки

- **`excalidraw-app/App.tsx`** імпортує з `@excalidraw/excalidraw` основний компонент, діалоги, `reconcileElements`, analytics тощо, і з `@excalidraw/common` / `@excalidraw/element` — предметну логіку.
- **Bootstrapping UI:** `excalidraw-app/index.tsx` — `createRoot`, **`virtual:pwa-register`** (PWA), Sentry, рендер `<ExcalidrawApp />`.
- **Колаборація й дані продукту:** окремі модулі під **колаб** (`excalidraw-app/collab/`), **Firebase** та локальні сховища (`excalidraw-app/data/*`) — шар *над* пакетом, не частина мінімального embed.

## Збірка та dev-сервер

- **Vite** (`excalidraw-app/vite.config.mts`): React plugin, SVGR, EJS, PWA, checker, HTML, sitemap, **woff2** plugin з `scripts/woff2/`; **alias** збігаються з `tsconfig` paths; `build.outDir: build`; `manualChunks` для локалей тощо.
- **Бібліотечний бандл:** **esbuild** у `scripts/buildPackage.js` — один прохід для ESM-артефактів з обробкою SCSS.

## Поведінкові підсистеми (пакет `excalidraw`)

- **Історія undo/redo:** класи на кшталт **`History`**, **`HistoryDelta`** у `packages/excalidraw/history.ts` (дельти знімків стану).
- **Сцена / камера:** модулі під `packages/excalidraw/scene/` (наприклад zoom, scroll, export).
- **Великі обчислення / шрифти:** web worker і WASM-шар у `packages/excalidraw/subset/` (harfbuzz, woff2), підвантажувані окремими chunk-ами.
- **Дані:** `packages/excalidraw/data/*` — restore, reconcile, blob, library (узгоджено з тим, як `App.tsx` викликає `restoreElements` / `reconcile`).
- **Рендеринг шарами:** статичний і інтерактивний canvas в `packages/excalidraw/components/canvases/*`, SVG-overlay в `components/SVGLayer.tsx`.

## Тестування

- **Інтеграційні / компонентні тести** редактора: `packages/excalidraw/tests/**/*.tsx` з jsdom і Testing Library (залежності в `packages/excalidraw/package.json`).
- **Тести застосунку:** `excalidraw-app/tests/` (наприклад `collab.test.tsx`).

## Джерела для верифікації

| Патерн | Файли / каталоги |
|--------|-------------------|
| Paths / aliases | `tsconfig.json`, `vitest.config.mts`, `excalidraw-app/vite.config.mts` |
| Публічний компонент | `packages/excalidraw/index.tsx` |
| App shell | `excalidraw-app/App.tsx`, `excalidraw-app/index.tsx` |
| Оркестрація editor state | `packages/excalidraw/components/App.tsx` |
| Історія | `packages/excalidraw/history.ts` |
| Збірка lib | `scripts/buildPackage.js`, `packages/excalidraw/package.json` scripts |
| Workers / subset | `packages/excalidraw/subset/`, `packages/excalidraw/workers.ts` |
