# Developer Setup — Onboarding Guide

> Повний шлях від `git clone` до першого merged PR.

---

## Prerequisites

| Інструмент | Мінімальна версія | Перевірка |
|------------|-------------------|-----------|
| Node.js | 18.0.0 | `node -v` |
| Yarn | 1.22.x | `yarn -v` |
| Git | будь-яка | `git --version` |
| Docker (опційно) | 20+ | `docker -v` |

> Yarn 1.x (Classic) — єдиний підтримуваний package manager. **Не використовуй npm або pnpm.**

---

## 1. Clone та встановлення залежностей

```bash
git clone https://github.com/excalidraw/excalidraw.git
cd excalidraw

yarn install
```

Yarn Workspaces автоматично встановлює залежності для всіх пакетів:

- `excalidraw-app/`
- `packages/common`, `packages/math`, `packages/element`, `packages/excalidraw`, `packages/utils`
- `examples/*`

---

## 2. Змінні середовища

Файл `.env.development` вже є в репозиторії і містить дефолтні значення для локальної розробки (включаючи публічний Firebase dev-проєкт). Для більшості задач нічого міняти не потрібно.

Якщо треба перевизначити щось локально — створи `.env.development.local` (він у `.gitignore`):

```bash
# .env.development.local — не комітити!

# Вимкнути діалог "Leave page?" під час розробки
VITE_APP_DISABLE_PREVENT_UNLOAD=true

# Вимкнути live reload (потрібно для дебагу Service Worker)
VITE_APP_DEV_DISABLE_LIVE_RELOAD=true
```

Ключові змінні `.env.development`:

| Змінна | Призначення |
|--------|-------------|
| `VITE_APP_BACKEND_V2_GET_URL` | API для завантаження збережених сцен |
| `VITE_APP_WS_SERVER_URL` | WebSocket-сервер для колаборації (за замовчуванням `localhost:3002`) |
| `VITE_APP_FIREBASE_CONFIG` | JSON-конфіг Firebase dev-проєкту |
| `VITE_APP_PORT` | Порт dev-сервера (за замовчуванням `3001`) |
| `VITE_APP_ENABLE_PWA` | Вмикає PWA у dev-режимі (за замовчуванням `false`) |

---

## 3. Запуск dev-сервера

```bash
yarn start
```

Відкриває `http://localhost:3001` з HMR (Vite).

> Якщо порт зайнятий — змінити `VITE_APP_PORT` у `.env.development.local`.

### Альтернатива: Docker

```bash
docker-compose up
```

Застосунок буде доступний на `http://localhost:3000`. Підходить, якщо не хочеш встановлювати Node локально.

---

## 4. Структура монорепо

```text
excalidraw/
├── excalidraw-app/          # PWA-застосунок (React 19 + Vite)
├── packages/
│   ├── common/              # @excalidraw/common  — константи, утиліти, EventBus
│   ├── math/                # @excalidraw/math    — 2D геометрія (Point, Vector)
│   ├── element/             # @excalidraw/element — CRUD елементів, Scene, рендеринг
│   ├── excalidraw/          # @excalidraw/excalidraw — публічна React-бібліотека
│   └── utils/               # @excalidraw/utils   — export helpers
├── examples/
│   ├── with-nextjs/         # Інтеграція з Next.js
│   └── with-script-in-browser/
├── firebase-project/        # Firebase rules та indexes
├── scripts/                 # Build / release утиліти
├── .env.development         # Дефолтні env-змінні для розробки
└── docker-compose.yml
```

Детальна архітектура → [architecture.md](architecture.md)

---

## 5. Запуск тестів

```bash
# Всі тести разом (typecheck + lint + prettier + unit)
yarn test:all

# Лише unit-тести (Vitest, watch mode)
yarn test

# Один раз без watch
yarn test:app --watch=false

# TypeScript typecheck
yarn test:typecheck

# ESLint
yarn test:code

# Prettier (перевірка форматування)
yarn test:other
```

### Покриття

```bash
yarn test:coverage          # одноразово
yarn test:coverage:watch    # з watch
yarn test:ui                # Vitest UI у браузері
```

### Оновити snapshot-тести

```bash
yarn test:update
```

---

## 6. Форматування та linting

```bash
# Виправити все автоматично
yarn fix

# Тільки ESLint --fix
yarn fix:code

# Тільки Prettier --write
yarn fix:other
```

> Husky + lint-staged вже налаштовані: перед кожним комітом автоматично запускаються lint і prettier для змінених файлів.

---

## 7. Білд пакетів (якщо змінюєш `packages/*`)

При роботі з `excalidraw-app` пакети збираються автоматично. Але якщо змінюєш вихідний код у `packages/*` — треба зребілдити:

```bash
# Всі пакети у правильному порядку (common → math → element → excalidraw)
yarn build:packages

# Або окремо
yarn build:common
yarn build:math
yarn build:element
yarn build:excalidraw
```

### Запуск прикладів

```bash
# with-script-in-browser example
yarn start:example
```

---

## 8. Workflow першого PR

### 8.1 Гілка

Назви гілку за патерном: `<type>/<short-description>`

```bash
git checkout -b feat/my-feature
# або
git checkout -b fix/canvas-scroll-bug
```

### 8.2 Розробка

- Запусти `yarn start` і перевіряй зміни live
- Пиши тести для нової логіки
- Переконайся, що `yarn test:all` проходить локально

### 8.3 Коміт

Husky автоматично перевіряє staged-файли. Стиль повідомлень — конвенційний:

```text
feat: add grid snapping for arrow elements
fix: correct zoom level on canvas resize
refactor: extract element bounds calculation
docs: update contributing guide
```

```bash
git add <файли>
git commit -m "feat: short description"
```

### 8.4 Push та PR

```bash
git push -u origin feat/my-feature
```

Відкрий PR у GitHub. **Назва PR повинна відповідати Conventional Commits** — це перевіряє GitHub Action `semantic-pr-title`:

```text
feat: Add grid snapping for arrow elements
fix: Correct zoom level on canvas resize
```

### 8.5 CI checks (автоматичні)

При відкритті PR запускаються:

| Check | Що перевіряє |
|-------|-------------|
| `Lint` | Prettier + ESLint + TypeScript typecheck |
| `Semantic PR title` | Назва PR відповідає Conventional Commits |
| `size-limit` | Розмір bundle `@excalidraw/excalidraw` не перевищує ліміт |
| `locales-coverage` | Нові ключи i18n додані до всіх локалей |

При push у `master` також запускається:

| Check | Що перевіряє |
|-------|-------------|
| `Tests` | Повний набір Vitest unit-тестів |

### 8.6 Merge

- Всі CI checks зелені
- Хоча б один reviewer затвердив
- PR squash-merged у `master`

---

## 9. Корисні команди

```bash
# Повне очищення і переінсталяція
yarn clean-install

# Видалити всі build-артефакти
yarn rm:build

# Покрити білд для продакшну (Vercel)
yarn build:app

# Зібрати Docker-образ
yarn build:app:docker
```

---

## 10. Troubleshooting

**`yarn install` падає з помилкою прав доступу**
— Перевір, що не використовуєш `sudo yarn`. Замість цього виправ права на `~/.npm` або `~/.yarn`.

**Порт 3001 вже зайнятий**
— Додай `VITE_APP_PORT=3005` у `.env.development.local`.

**Типи не резолвяться після зміни пакетів**
— Запусти `yarn build:packages` і перезапусти TypeScript server у редакторі.

**HMR не оновлює компоненти з `packages/*`**
— Vite не слідкує за збіркою пакетів. Потрібно: зміни в `packages/*` → `yarn build:<package>` → зміни відобразяться в застосунку.

**Тест падає через canvas**
— У Vitest використовується `vitest-canvas-mock`. Якщо пишеш новий тест з canvas, переконайся, що мок підключено через `setupFiles` у `vitest.config.ts`.

---

## Посилання

- [Архітектура проєкту](architecture.md)
- [Domain Glossary](../product/domain-glossary.md)
- [Project Brief](../memory/projectbrief.md)
