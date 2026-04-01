# Decision Log

Журнал ключових рішень по проєкту. Формат: ADR-подібні записи + trade-off notes, conventions, workarounds, deferred decisions.

**Статуси:** `accepted` · `provisional` · `deferred` · `superseded` · `deprecated`

---

## ADR-001: Монорепозиторій з Yarn Classic workspaces

- **Статус:** accepted
- **Контекст:** Excalidraw — це і SaaS-додаток, і набір npm-бібліотек (`@excalidraw/excalidraw`, `common`, `element`, `math`, `utils`). Потрібен єдиний репозиторій з чіткими межами пакетів і спільним toolchain.
- **Рішення:** Yarn Classic 1.22 з workspaces (`excalidraw-app`, `packages/*`, `examples/*`). Path aliases `@excalidraw/*` → `packages/*/src` і в `tsconfig.json`, і в Vite/Vitest.
- **Наслідки:** Спрощує розробку (один `yarn install`, одна CI-pipeline), але блокує можливість незалежного версіонування пакетів без додаткових інструментів (changesets / lerna).

---

## ADR-002: Vite для додатку, esbuild для бібліотечних пакетів

- **Статус:** accepted
- **Контекст:** Потрібен швидкий dev-сервер для `excalidraw-app` та оптимізована збірка ESM-бандлів для npm-пакетів.
- **Рішення:** `excalidraw-app` працює через Vite (dev + prod); пакети `@excalidraw/*` збираються через `esbuild` + `esbuild-sass-plugin` (`scripts/buildPackage.js`). Env-змінні інжектяться з `.env.*` на етапі збірки.
- **Наслідки:** Дві різні збірочні конфігурації — потенційний drift між ними. Aliases дублюються в `tsconfig.json`, `vite.config.mts`, `vitest.config.mts`.

---

## ADR-003: Jotai як основний state manager

- **Статус:** accepted
- **Контекст:** Потрібно ділити стан між ядром редактора (`packages/excalidraw`) і обгорткою додатку (`excalidraw-app`) з мінімальним boilerplate і підтримкою React 19 concurrent features.
- **Рішення:** Jotai 2.11 з окремими store-інстансами: `editorJotaiStore` для ядра, `app-jotai` store для колаборації та продуктових фіч.
- **Альтернативи:** Zustand (більш imperative), Redux (надто verbose для даної архітектури).
- **Наслідки:** Атомарний підхід природно лягає на компонентну модель, але debug-experience гірший ніж у Redux DevTools.

---

## ADR-004: Firebase + Socket.IO для реальтайм-колаборації

- **Статус:** accepted
- **Контекст:** Колаборація потребує і persistent storage (Firestore, Storage для файлів share-link), і low-latency signaling для sync курсорів/елементів.
- **Рішення:** Firebase (Firestore + Storage) як persistence, Socket.IO-клієнт для realtime-транспорту. Кімнати — за URL-хешем `#room=…`, share-link — `#json=id,key` з шифруванням payload.
- **Наслідки:** Vendor lock-in на Firebase для persistence; Socket.IO-сервер винесений за межі репо.

---

## ADR-005: Hand-drawn естетика як core identity

- **Статус:** accepted
- **Контекст:** Excalidraw позиціонується як "whiteboard that feels hand-drawn" — це ключовий диференціатор від Figma/Miro/draw.io.
- **Рішення:** roughjs для рендерингу фігур, шрифт Virgil для hand-drawn тексту, `perfect-freehand` для вільного малювання, Assistant як UI-шрифт.
- **Наслідки:** Не підходить для точних технічних креслень; rendering overhead через rough paths.

---

## ADR-006: PWA з офлайн-доступом і localStorage-first

- **Статус:** accepted
- **Контекст:** Zero-friction UX: миттєвий старт без реєстрації, працює без мережі.
- **Рішення:** VitePWA plugin, автозбереження сцени в `localStorage` (ключ `excalidraw`), стан UI в `excalidraw-state`, тема в `excalidraw-theme`. Бібліотека елементів і TTD-чати — в IndexedDB через `idb-keyval`.
- **Наслідки:** Обмеження localStorage (~5–10 MB) для великих сцен; міграція даних при зміні схеми — вручну через `APP_STATE_STORAGE_CONF` (`packages/excalidraw/appState.ts`).

---

## ADR-007: AI-бекенд — тільки зовнішній сервіс

- **Статус:** provisional
- **Контекст:** Text-to-Diagram (TTD) і Diagram-to-Code потребують LLM. У репо є повний клієнтський код (streaming, UI, beta-мітка), але серверна частина відсутня.
- **Рішення:** AI-функціональність працює лише при наявності `VITE_APP_AI_BACKEND`; без нього AI-фічі недоступні.
- **Trade-off:** Спрощує open-source репо (немає серверних секретів/інфра-коду) vs неможливість повноцінного self-host без підняття окремого бекенду.
- **Відкрите питання:** Чи потрібен fallback/mock для локальної розробки?

---

## ADR-008: COMPLEX_BINDINGS за feature-flag (off)

- **Статус:** provisional
- **Контекст:** Розширена модель привʼязки стрілок до елементів — великий рефактор у `binding.ts`, `linearElementEditor.ts`, `interactiveScene.ts`.
- **Рішення:** Feature-flag `COMPLEX_BINDINGS` вимкнений за замовчуванням; нова модель доступна тільки при явному включенні.
- **Ризики:** Два code paths — подвоєння тестових сценаріїв; drift між старою і новою моделями.
- **Критерій зняття:** Стабілізація binding + history (undo/redo при rebinding, issue #7348).

---

## CONV-001: CSS Modules для стилізації компонентів

- **Тип:** convention
- **Джерело:** `.github/copilot-instructions.md`
- **Суть:** Нові React-компоненти стилізуються через CSS modules. Глобальні стилі — `app.scss`, `styles.scss`, `fonts.css`.

---

## CONV-002: Типи з `@excalidraw/math` для координат

- **Тип:** convention
- **Джерело:** `.github/copilot-instructions.md`
- **Суть:** У math-related коді використовувати тип `Point` з `packages/math/src/types.ts` замість `{ x, y }`.

---

## CONV-003: Performance-first підхід у TypeScript

- **Тип:** convention
- **Джерело:** `.github/copilot-instructions.md`
- **Суть:** Prefer allocation-free реалізації; trade RAM за менше CPU cycles; `const` / `readonly` за замовчуванням.

---

## WA-001: Mobile transform handles вимкнені для лінійних елементів

- **Тип:** workaround
- **Статус:** deferred
- **Контекст:** На мобільних пристроях transform handles для ліній/стрілок спричиняли UX-проблеми (misclicks, overlap).
- **Поточне рішення:** Handles вимкнені як workaround.
- **Бажане рішення:** Адаптивні handles з більшою hit area або gesture-based трансформації.

---

## WA-002: Frame align/distribute — TODO

- **Тип:** workaround
- **Статус:** deferred
- **Контекст:** Вирівнювання та розподіл для frame-елементів позначені TODO «when implemented properly».
- **Поточний стан:** Дії існують, але не працюють коректно для frame boundaries.

---

## DEF-001: `ExcalidrawProps.name` API потребує редизайну

- **Тип:** deferred decision
- **Контекст:** Коментар у коді — «come with better API before v0.18.0». Версія вже 0.18.0, рішення не прийнято.
- **Ризик:** Breaking change для інтеграторів, якщо API зміниться у 0.19.

---

## DEF-002: Binding + History consistency (#7348)

- **Тип:** deferred decision
- **Контекст:** Undo/redo при перепривʼязці стрілок має баги. TODO в тестах вказують на незакриті edge-cases.
- **Блокер для:** Зняття feature-flag `COMPLEX_BINDINGS` (ADR-008).

---

## DEF-003: Незалежне версіонування workspace-пакетів

- **Тип:** deferred decision
- **Контекст:** Зараз усі `@excalidraw/*` мають однакову версію 0.18.0 (крім `utils` — 0.1.2). При незалежному публікуванні потрібен інструмент типу changesets.
- **Поточний підхід:** Ручне оновлення версій; для зовнішніх споживачів — peer dependencies.
