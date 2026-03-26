# Decision Log

## Ключові архітектурні рішення

---

### D-01: Монорепо з Yarn Workspaces

**Рішення:** Розмістити `excalidraw-app` та всі пакети в одному репо з Yarn Workspaces.

**Альтернативи:** Окремі репозиторії для кожного пакету.

**Причина:**

- Спільний TypeScript config та ESLint-правила
- Локальні посилання між пакетами без npm publish під час розробки
- Єдиний CI/CD pipeline

**Джерело:** `package.json` → `"workspaces": ["excalidraw-app", "packages/*", "examples/*"]`

---

### D-02: Два Canvas замість одного

**Рішення:** Розділити рендеринг на `StaticCanvas` (малювання елементів) та `InteractiveCanvas` (курсор, selection, UI оверлей).

**Альтернативи:** Один canvas з усім рендерингом.

**Причина:**

- `StaticCanvas` перемальовується тільки при зміні елементів
- `InteractiveCanvas` перемальовується при будь-якому русі миші
- Суттєва оптимізація продуктивності

**Джерело:** `packages/excalidraw/renderer/` — окремі файли для кожного canvas.

---

### D-03: Immutable State + Action System

**Рішення:** Весь стан сцени — immutable snapshot. Зміни тільки через `ActionManager.dispatch()`.

**Альтернативи:** Мутабельний стан з direct updates.

**Причина:**

- Детерміністичне undo/redo через versioned snapshots
- Легке тестування actions ізольовано
- Передбачуваність CRDT reconciliation при колаборації

**Джерело:** `packages/excalidraw/actions/`, `packages/common/src/versionedSnapshotStore.ts`

---

### D-04: Jotai замість Redux / Context

**Рішення:** Атомарний стан через Jotai для app-рівня, React state для бібліотечного рівня.

**Альтернативи:** Redux (занадто verbose), React Context (performance проблеми при частих оновленнях).

**Причина:**

- Атоми = fine-grained subscriptions (рендериться тільки те, що змінилось)
- Composable без boilerplate
- Немає Provider hell

**Джерело:** `excalidraw-app/app-jotai.ts`, `packages/excalidraw/editor-jotai.ts`

---

### D-05: End-to-end шифрування в URL-хеші

**Рішення:** Ключ AES-GCM зберігається в `#` фрагменті URL (не передається серверу).

**Альтернативи:** Серверне шифрування, незашифровані сесії.

**Причина:**

- Сервер (Firebase) ніколи не бачить ключ — zero-knowledge
- Поділитися посиланням = поділитися ключем автоматично
- Стандартний Web Crypto API

**Джерело:** `excalidraw-app/data/` — функції шифрування/дешифрування.

---

### D-06: Rough.js для візуального стилю

**Рішення:** Використовувати Rough.js (v4.6.4) для генерації "hand-drawn" ефекту примітивів.

**Альтернативи:** SVG filter-ефекти, canvas ручний шум.

**Причина:**

- Готова бібліотека з підтримкою всіх примітивів (rect, ellipse, arc, path)
- Налаштований `roughness` параметр для гнучкості стилю
- Активно підтримується

**Джерело:** `packages/excalidraw/renderer/`, `package.json` → `"roughjs": "4.6.4"`

---

### D-07: Perfect-freehand для вільного малювання

**Рішення:** Perfect-freehand (v1.2.0) для згладжування шляху при freedraw.

**Альтернативи:** Catmull-Rom spline, Bezier апроксимація.

**Причина:**

- Симулює тиск пера (pressure-based stroke width)
- Smooth результат без додаткової математики
- Мінімальна бібліотека (< 5KB)

**Джерело:** `packages/excalidraw/renderer/`, `package.json` → `"perfect-freehand": "1.2.0"`

---

### D-08: Firebase для persistence + Socket.IO для real-time

**Рішення:** Розділити відповідальність: Firebase Firestore = зберігання сесій, Socket.IO = real-time транспорт.

**Альтернативи:** Тільки Firebase Realtime Database, WebRTC peer-to-peer.

**Причина:**

- Firebase = надійне зберігання з offline-підтримкою
- Socket.IO = низька затримка для live-курсорів та змін
- Чітке розділення storage vs transport

**Джерело:** `excalidraw-app/collab/Collab.tsx`, `.env.development`

---

### D-09: Vite як білдер

**Рішення:** Vite (v5.0.12) для dev-сервера та production build.

**Альтернативи:** Webpack, Rollup напряму.

**Причина:**

- HMR без конфігурації
- ES modules в dev режимі (миттєвий старт)
- Rollup-based prod build з tree-shaking
- Vite Plugin PWA для service worker

**Джерело:** `excalidraw-app/vite.config.mts`

---

### D-10: React 19

**Рішення:** Використовувати React 19.0.0.

**Причина:**

- Concurrent features для плавного рендерингу при складних сценах
- Нові hooks та покращений Suspense
- Актуальна версія для довгострокової підтримки

**Джерело:** `package.json` → `"react": "^19.0.0"`

---

## Рішення щодо документації

### D-11: Memory Bank структура

**Рішення:** Розділити документацію на `docs/memory/` (контекст для AI), `docs/product/` (домен), `docs/technical/` (архітектура).

**Причина:**

- AI-агенти потребують структурованого контексту для ефективної роботи
- Розділення дозволяє оновлювати кожен шар незалежно
- `docs/memory/` файли — до 200 рядків для швидкого завантаження контексту

**Дата:** 2026-03-25

## Details

For detailed architecture → see [docs/technical/architecture.md](../technical/architecture.md)
For domain glossary → see [docs/product/domain-glossary.md](../product/domain-glossary.md)
For undocumented behaviors audit → see [docs/technical/undocumented-behaviors.md](../technical/undocumented-behaviors.md)
