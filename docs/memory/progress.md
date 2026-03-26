# Progress

## Статус проєкту: Зрілий open-source продукт

Excalidraw — активно підтримуваний open-source проєкт з CI/CD, тестами та production deployment на excalidraw.com. Нижче — поточний стан основних підсистем.

---

## Завершені підсистеми

### Ядро застосунку

- [x] **Monorepo структура** — Yarn Workspaces, 5 пакетів
- [x] **Canvas rendering** — Rough.js + Perfect-freehand, два canvas (interactive + static)
- [x] **Element system** — rectangle, ellipse, diamond, arrow, line, freedraw, text, image, frame, group
- [x] **Actions system** — 100+ actions через ActionManager
- [x] **State management** — AppState (~120+ полів) + Jotai atoms
- [x] **Scene management** — immutable snapshots, undo/redo

### Колаборація

- [x] **Socket.IO WebSocket** — real-time синхронізація
- [x] **End-to-end шифрування** — AES-GCM, ключ в URL-хеші
- [x] **Firebase Firestore** — persistence колаборативних сесій
- [x] **CRDT-like reconciliation** — `reconcile.ts` + FractionalIndex

### Збереження та експорт

- [x] **LocalStorage / IndexedDB** — idb-keyval для локальних чернеток
- [x] **PNG/SVG export** — з вбудованими метаданими сцени
- [x] **JSON export/import** — повна серіалізація сцени
- [x] **Clipboard** — copy/paste елементів між вкладками

### PWA та продуктивність

- [x] **PWA** — Vite Plugin PWA + Workbox service worker
- [x] **Офлайн-режим** — кешування шрифтів (90d), локалей (30d)
- [x] **Code splitting** — lazy-load чанки для локалей та важких компонентів
- [x] **Font subsetting** — `packages/excalidraw/subset/`

### Розробницький досвід (DX)

- [x] **TypeScript strict mode** — по всіх пакетах
- [x] **ESLint + Prettier** — `@excalidraw/eslint-config`
- [x] **Husky + lint-staged** — pre-commit hooks
- [x] **Vitest** — unit-тести з coverage thresholds (lines 60%, branches 70%)
- [x] **GitHub Actions** — CI/CD pipeline

### Інфраструктура

- [x] **Vercel** — деплой + `vercel.json` (CORS, кеш, редиректи)
- [x] **Docker** — `Dockerfile` + `docker-compose.yml`
- [x] **Firebase** — окремі проєкти dev/prod

---

## Документація

| Файл | Статус | Вміст |
|------|--------|-------|
| `docs/memory/projectbrief.md` | ✅ Готово | Огляд проєкту, аудиторія, структура |
| `docs/memory/techContext.md` | ✅ Готово | Стек, версії, команди |
| `docs/memory/systemPatterns.md` | ✅ Готово | Архітектурні патерни, ключові компоненти |
| `docs/product/domain-glossary.md` | ✅ Готово | 20+ термінів домену |
| `docs/technical/architecture.md` | ✅ Готово | Детальна технічна архітектура |
| `docs/memory/productContext.md` | ✅ Створено | UX-цілі, сценарії |
| `docs/memory/activeContext.md` | ✅ Створено | Поточний фокус |
| `docs/memory/progress.md` | ✅ Створено | Цей файл |
| `docs/memory/decisionLog.md` | ✅ Створено | Ключові рішення |

---

## Версії пакетів

| Пакет | Версія |
|-------|--------|
| `@excalidraw/excalidraw` | 0.18.0 |
| `@excalidraw/element` | 0.18.0 |
| `@excalidraw/common` | 0.18.0 |
| `@excalidraw/math` | 0.18.0 |
| `@excalidraw/utils` | 0.1.2 |
| `excalidraw-app` | 1.0.0 |

---

## Відомі обмеження / Tech Debt

| Область | Опис |
|---------|------|
| Мобільний UX | Touch підтримується, але не оптимізований для мобільних |
| Cloud history | Undo/redo тільки в межах сесії, немає хмарної версійності |
| Text formatting | Тільки plain text в елементах |
| Performance | Повне перемальовування canvas при кожній зміні (correctness > perf) |
| `App.tsx` розмір | ~40KB — потребує розбиття |

---

## Метрики коду

- **Мов підтримки:** 80+
- **Типів елементів:** ~12
- **Кількість actions:** 100+
- **Coverage thresholds:** lines ≥ 60%, branches ≥ 70%
- **Розмір збірки:** chunk-split за локалями та фічами

## Details

For detailed architecture → see [docs/technical/architecture.md](../technical/architecture.md)
For domain glossary → see [docs/product/domain-glossary.md](../product/domain-glossary.md)
