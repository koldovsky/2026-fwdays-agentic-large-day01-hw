# Decision log

## D-001: Монорепо на Yarn workspaces

- **Рішення:** тримати app, packages і examples в одному repo через `workspaces`.
- **Доказ у коді:** кореневий `package.json` (`workspaces`, `packageManager: yarn@1.22.22`).
- **Наслідок:** спільні залежності, локальний зв'язок пакетів, централізовані root scripts.

## D-002: Виділення домену в окремі пакети

- **Рішення:** розділити на `@excalidraw/common`, `math`, `element`, `utils`, а `@excalidraw/excalidraw` тримати як фасад.
- **Доказ у коді:** `packages/*/package.json`, залежності між пакетами (`element -> common+math`, `math -> common`).
- **Наслідок:** краща модульність, повторне використання та окрема збірка пакетів.

## D-003: Source-first резолв у dev/test

- **Рішення:** налаштувати alias в `tsconfig.json`, `vite.config.mts`, `vitest.config.mts` на `packages/.../src`.
- **Доказ у коді:** `paths` у TS та `resolve.alias` у Vite/Vitest.
- **Наслідок:** швидкий цикл розробки без постійного publish/build package tarballs для локального запуску.

## D-004: React + Vite як app shell

- **Рішення:** runtime застосунку через Vite + React 19.
- **Доказ у коді:** `excalidraw-app/package.json` (react/react-dom 19, vite), `excalidraw-app/index.tsx`.
- **Наслідок:** сучасний dev server, швидка збірка, SPA shell для редактора.

## D-005: Стан редактора через Jotai з ізоляцією

- **Рішення:** використовувати `jotai-scope` (`createIsolation`) + окремий store (`createStore`).
- **Доказ у коді:** `packages/excalidraw/editor-jotai.ts`.
- **Наслідок:** контрольована область стану редактора й безпечніший embedding-кейс.

## D-006: UX-орієнтація на onboarding і collaboration

- **Рішення:** дефолтний welcome-flow і явний collab trigger у UI.
- **Доказ у коді:** `WelcomeScreen` (Center/Hints), `LiveCollaborationTrigger` (`isCollaborating`, counter).
- **Наслідок:** новий користувач бачить підказки одразу; спільна робота має окремий affordance.

## D-007: Якісний контур як частина стандартного процесу

- **Рішення:** тримати typecheck/lint/prettier/tests у root scripts і hooks.
- **Доказ у коді:** `test:typecheck`, `test:code`, `test:other`, `test:app`, `test:all`, `prepare: husky install`.
- **Наслідок:** менший ризик регресій та стабільніші PR перед релізом.

## D-008: Підтримка сценарію embed + standalone

- **Рішення:** розвивати одночасно standalone app (`excalidraw-app`) і reusable package (`@excalidraw/excalidraw`) + examples.
- **Доказ у коді:** workspaces структура, exports у `packages/excalidraw/package.json`, `examples/*`.
- **Наслідок:** продукт придатний і як окремий сервіс, і як вбудований редактор у зовнішні React-системи.

## Source verification

- `package.json`
- `tsconfig.json`
- `vitest.config.mts`
- `excalidraw-app/vite.config.mts`
- `excalidraw-app/index.tsx`
- `packages/common/package.json`
- `packages/math/package.json`
- `packages/element/package.json`
- `packages/utils/package.json`
- `packages/excalidraw/package.json`
- `packages/excalidraw/editor-jotai.ts`
- `packages/excalidraw/components/welcome-screen/WelcomeScreen.tsx`
- `packages/excalidraw/components/live-collaboration/LiveCollaborationTrigger.tsx`

## D-009: Неявна поведінка в рантаймі редактора (станом на аудит 2026-03-26)

- **Рішення/факт:** зафіксувати технічний борг, де поведінка коду складніша або менш явна, ніж поточна документація.
- **Контекст:** аудит на implicit state machines, неочевидні side effects і initialization-order dependencies.

### 1) Collaboration init flow (`excalidraw-app/collab/Collab.tsx`, `excalidraw-app/collab/Portal.tsx`)

- **Що робить код:**
  - Тримає неявну state machine ініціалізації кімнати через `socketInitialized`, `fallbackInitializationHandler`, `socketInitializationTimer`, події `connect_error`, `first-in-room`, `INIT`.
  - Одна й та ж бізнес-мета (отримати initial scene) може завершитись різними шляхами (Firebase fetch, socket INIT, timeout fallback).
- **Що задокументовано:**
  - У `docs/technical/architecture.md` описано загальний data flow, але немає явної діаграми/контракту станів для collaboration bootstrap.
- **Ризик:**
  - Високий ризик race conditions і складність локалізації багів при мережевих edge-case.

### 2) Store scheduling/commit (`packages/element/src/store.ts`)

- **Що робить код:**
  - Реалізує implicit state machine для `IMMEDIATELY/NEVER/EVENTUALLY` через macro/micro action queues.
  - Поведінка commit залежить від пріоритетів capture-update і порядку накопичення action-ів.
  - Є явний маркер боргу: `TODO: Suspicious that this is called so many places. Seems error-prone.`
- **Що задокументовано:**
  - `docs/technical/architecture.md` описує commit flow і пріоритети, але не фіксує інваріанти черг і допустимі сценарії виклику `scheduleCapture()`.
- **Ризик:**
  - Середній/високий ризик прихованих регресій в undo/redo та durable increments.

### 3) Side effects під час file upload (`excalidraw-app/collab/Portal.tsx`)

- **Що робить код:**
  - `queueFileUpload` не тільки зберігає файли, а й змінює `status` image-елементів на `saved`, потім викликає `updateScene(..., captureUpdate: NEVER)`.
  - Тобто I/O крок має side effect на scene state і подальшу синхронізацію з колаборантами.
- **Що задокументовано:**
  - Документація описує API/update flow загалом, але не вказує, що file-upload пайплайн модифікує scene елементи.
- **Ризик:**
  - Середній ризик неочікуваних змін стану під час мережевих/повільних upload сценаріїв.

### 4) Залежність від порядку оновлень в текстовому редакторі (`packages/excalidraw/components/App.tsx`)

- **Що робить код:**
  - В submit-flow використовується `flushSync` перед finalize-логікою, щоб встигнути оновити selection state.
  - Є прямий TODO про те, що state updates і finalize зараз рознесені та залежать від порядку виконання.
- **Що задокументовано:**
  - У high-level flow є `syncActionResult`, `updateScene`, `commit`, але немає окремо зафіксованої залежності від sync flush в текстовому submit.
- **Ризик:**
  - Середній ризик крихкої поведінки при рефакторингу подій/батчингу React-апдейтів.

### 5) Global static caches (`packages/excalidraw/snapping.ts`, `packages/excalidraw/fonts/Fonts.ts`)

- **Що робить код:**
  - `SnapCache` тримає static mutable cache (`referenceSnapPoints`, `visibleGaps`) з ручним життєвим циклом (`destroy`).
  - `Fonts` має lazy init + static registries (`_registered`, `_initialized`, `loadedFontsCache`) з merge-логікою "хто ініціалізувався раніше".
- **Що задокументовано:**
  - У документації є загальна initialization flow, але немає явних lifecycle-правил для цих глобальних cache/registry.
- **Ризик:**
  - Середній ризик leakage/stale-state між інстансами та неочевидної поведінки при embed-сценаріях.

## Follow-up decisions (proposed)

- Додати в `docs/technical/architecture.md` окремий розділ `Implicit runtime state machines`:
  - collaboration bootstrap states/events;
  - store micro/macro action invariants;
  - lifecycle global static caches.
- На рівні коду додати короткі contract-comments біля критичних точок переходу станів:
  - що є trigger;
  - які інваріанти очікуються до/після.
- Пріоритезувати TODO/HACK/FIXME в `App.tsx`, `store.ts`, `textWysiwyg.tsx`, `colors.ts` як окремий техборг backlog.

## Details

- For full technical architecture context behind these decisions -> see `docs/technical/architecture.md`
- For domain terms used in product-facing decisions -> see `docs/product/domain-glossary.md`
- For business/product intent alignment -> see `docs/product/PRD.md`
