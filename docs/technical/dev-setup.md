# Dev Setup — від клону до першого PR

---

## Вимоги

| Інструмент | Версія | Перевірка |
|---|---|---|
| Node.js | >=18.0.0 (CI використовує 20.x) | `node -v` |
| Yarn | 1.22.22 (classic) | `yarn -v` |
| Git | будь-яка | `git -v` |

> Yarn 2+ (Berry) **не підходить** — проєкт використовує Yarn 1 workspaces.
> Якщо встановлений Berry: `npm install -g yarn@1.22.22`

---

## 1. Клонування та встановлення залежностей

```bash
git clone https://github.com/excalidraw/excalidraw.git
cd excalidraw

yarn install
```

`yarn install` встановлює залежності для всіх workspaces одразу:
`excalidraw-app`, `packages/*`, `examples/*`.

Також автоматично виконається `prepare` скрипт → встановить Husky (pre-commit hook).

---

## 2. Запуск dev-сервера

```bash
yarn start
```

Запускає Vite dev-сервер для `excalidraw-app` на **http://localhost:3001**.

Що вмикається автоматично:
- Hot Module Replacement (React Fast Refresh)
- TypeScript + ESLint перевірка в реальному часі (через `vite-plugin-checker`)
- Firebase підключення до dev-проєкту `excalidraw-oss-dev` (публічні ключі у `.env.development`)

> HMR можна вимкнути: `VITE_APP_DEV_DISABLE_LIVE_RELOAD=true` у `.env.development.local`

---

## 3. Змінні середовища

Файл `.env.development` вже є в репо з усіма дефолтними значеннями для розробки.
Для локальних перевизначень — створи `.env.development.local` (не комітиться):

```bash
touch excalidraw-app/.env.development.local
```

Ключові змінні:

| Змінна | Дефолт | Призначення |
|---|---|---|
| `VITE_APP_PORT` | `3001` | Порт dev-сервера |
| `VITE_APP_WS_SERVER_URL` | `http://localhost:3002` | WebSocket для collab |
| `VITE_APP_AI_BACKEND` | `http://localhost:3016` | AI backend |
| `VITE_APP_ENABLE_PWA` | `false` | Service Worker у dev |
| `VITE_APP_DEV_DISABLE_LIVE_RELOAD` | _(порожньо)_ | Вимкнути HMR |
| `VITE_APP_DISABLE_PREVENT_UNLOAD` | _(порожньо)_ | Прибрати діалог при закритті вкладки |

> Всі змінні мають префікс `VITE_APP_` — тільки вони доступні в клієнтському коді
> через `import.meta.env`.

---

## 4. Опціональні локальні сервіси

Для повноцінної колаборації потрібен окремий WebSocket-сервер:

```bash
# excalidraw-room — окремий репозиторій
git clone https://github.com/excalidraw/excalidraw-room.git
cd excalidraw-room && npm install && npm start
# слухає на :3002
```

Без нього — звичайна робота без collab. AI-функції та Firebase працюють без нього.

---

## 5. Збірка пакетів (якщо потрібно)

Для роботи з `examples/` або при змінах у `packages/` може знадобитись збірка:

```bash
# Зібрати всі пакети в правильному порядку
yarn build:packages
# = common → math → element → excalidraw

# Або окремо:
yarn build:common
yarn build:math
yarn build:element
yarn build:excalidraw
```

> Для звичайної розробки в `excalidraw-app` збирати пакети **не потрібно** —
> Vite резолвить їх напряму з workspace через TypeScript paths.

---

## 6. Тести

```bash
# Watch-режим (Vitest) — запускається і перезапускається при зміні файлів
yarn test

# Одноразово (для CI або перевірки перед PR)
yarn test:app --watch=false

# TypeScript — перевірка типів
yarn test:typecheck

# ESLint
yarn test:code

# Prettier
yarn test:other

# Все разом (як у CI)
yarn test:all

# Coverage
yarn test:coverage
```

> Якщо тест зависає — перевір чи є `fireEvent.pointerUp()` після `pointerDown()`.
> Відомий memory leak при незакритих pointer events (`selection.test.tsx:250`).

---

## 7. Linting та форматування

```bash
# Виправити все автоматично (prettier + eslint --fix)
yarn fix

# Тільки prettier
yarn fix:other

# Тільки eslint
yarn fix:code
```

**Pre-commit hook** (Husky + lint-staged) запускає автоматично при `git commit`:
- `*.{js,ts,tsx}` → `eslint --max-warnings=0 --fix`
- `*.{css,scss,json,md,html,yml}` → `prettier --write`

Якщо hook заблокував коміт — виправ помилки і спробуй знову. Пропускати hook (`--no-verify`) — не варто, CI все одно перевірить.

---

## 8. Docker (альтернативний спосіб запуску)

```bash
docker-compose up
```

Запускає застосунок на **http://localhost:3000**. Корисно для перевірки production build
без локального Node.js. Не підходить для активної розробки (немає HMR).

---

## 9. Структура для орієнтації

```
excalidraw-app/          # Тут пишеш код для веб-застосунку
  collab/                # Колаборація (Socket.io + Firebase)
  components/            # App-specific компоненти
  data/                  # Firebase, FileManager, restore

packages/excalidraw/     # Тут пишеш код npm-пакету
  components/App.tsx     # Головний клас (~12 800 рядків)
  components/LayerUI.tsx # Весь React UI поверх canvas
  actions/               # ~50 дій (Command Pattern)
  renderer/              # staticScene.ts, interactiveScene.ts
  data/                  # appState, library, restore, encode

packages/element/        # Типи, Scene, Store, Delta, History
packages/common/         # Константи, утиліти, кольори
packages/math/           # 2D геометрія
```

---

## 10. Перший PR — чеклист

### Перед початком роботи

```bash
git checkout main
git pull origin main
git checkout -b feat/my-feature   # або fix/, docs/, refactor/
```

### Під час роботи

- Зміни в `packages/` — перевір чи не потрібна збірка (`yarn build:packages`)
- Нова дія (Action) — зареєструй в `actionManager.registerAll` і додай до `ActionName`
- Новий тип елемента — оновити `ExcalidrawElement` union + `restoreElement` в `data/restore.ts`
- Зміни в публічному API пакету — оновити `packages/excalidraw/index.tsx`

### Перед пушем

```bash
# Перевір все локально перед тим як CI побачить помилку
yarn test:typecheck    # TypeScript
yarn test:code         # ESLint
yarn test:other        # Prettier
yarn test:app --watch=false  # Unit тести
```

### CI перевіряє в PR

| Workflow | Що робить |
|---|---|
| `lint.yml` | `yarn test:other` + `yarn test:code` + `yarn test:typecheck` |
| `test-coverage-pr.yml` | `yarn test:coverage` + коментар з diff coverage в PR |
| `semantic-pr-title.yml` | Заголовок PR має відповідати Conventional Commits |

### Заголовок PR — Conventional Commits

```
feat: add snap-to-grid for text elements
fix: correct bounding box for rotated arrows
docs: update architecture diagram
refactor: extract frame logic to separate file
```

### PR template (`.github/PULL_REQUEST_TEMPLATE.md`)

При відкритті PR автоматично підставляється шаблон — заповни чеклист і нотатки.

### Пуш і PR

```bash
git add <конкретні файли>   # уникай git add -A
git commit -m "feat: ..."
git push origin feat/my-feature
# → відкрий PR на GitHub
```

---

## Швидкий старт (TL;DR)

```bash
git clone https://github.com/excalidraw/excalidraw.git && cd excalidraw
yarn install
yarn start
# → http://localhost:3001

# Перед PR:
yarn test:all
```

---

## Дивись також

- [Tech Context](../memory/techContext.md) — повний список команд, CI/CD, deployment
- [Architecture](./architecture.md) — структура кодбейсу, де що шукати
