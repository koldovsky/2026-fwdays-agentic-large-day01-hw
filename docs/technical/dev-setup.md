# Excalidraw: Dev Setup (clone -> first PR)

Цей документ - практичний онбординг для нового контриб'ютора: від клонування репозиторію до відкриття першого PR.

## Scope

- Фокус: локальний запуск, базовий робочий цикл, перевірки перед PR.
- Базове середовище: **Node 20.x** + **Yarn Classic 1.22.22**.
- Docker-сценарій описано окремо як опційний.

## 1) Встановлення інструментів

### Node 20

Встанови Node 20 будь-яким зручним способом (OS package manager або version manager).
Для офіційних інструкцій дивись [Node.js Docs](https://nodejs.org/en/docs).

Після встановлення:

```bash
nvm install 20
nvm use 20
```

### Yarn Classic 1.22.22

Рекомендовано через Corepack (постачається з Node 20):

```bash
corepack enable
corepack prepare yarn@1.22.22 --activate
```

### Перевірка інструментів

```bash
node -v
yarn -v
git --version
```

Очікування:

- `node -v` -> `v20.x.x`
- `yarn -v` -> `1.22.22`

## 2) Clone репозиторію

```bash
git clone <repo-or-fork-url>
cd excalidraw
```

## 3) Встановлення залежностей

```bash
yarn install
```

## 4) Перший локальний запуск

```bash
yarn start
```

Це запускає `excalidraw-app` у dev-режимі (Vite). Після старту відкрий URL із консолі (за замовчуванням `http://localhost:3000`; можна змінити через `VITE_APP_PORT`).

## 5) Де вносити зміни

- `packages/excalidraw` - core editor package (`@excalidraw/excalidraw`).
- `packages/element`, `packages/common`, `packages/math`, `packages/utils` - internal core-шари.
- `excalidraw-app` - продуктова оболонка (app-level інтеграції, collab/persistence тощо).

## 6) Мінімальний цикл перед PR

Перед пушем проганяй мінімум:

```bash
yarn test:typecheck
yarn test:code
yarn test:app --watch=false
```

Повна перевірка:

```bash
yarn test:all
```

## 7) Git flow до першого PR

### Створи feature-branch

```bash
git checkout -b <feature-branch-name>
```

### Закоміть зміни

```bash
git add <changed-files>
git commit -m "chore(docs): add dev setup onboarding guide"
```

### Запуш гілку

```bash
git push -u origin HEAD
```

### Відкрий PR

- Створи PR у GitHub UI зі своєї гілки.
- Заповни чеклист у `.github/PULL_REQUEST_TEMPLATE.md`.
- Переконайся, що CI проходить (`lint` і `tests`).

## 8) Docker workflow (опційно)

Коли використовувати:

- потрібно швидко перевірити контейнерний запуск app;
- хочеш запустити прод-збірку через nginx без локального dev server.

### Варіант A: docker compose

```bash
docker compose up --build
```

Після запуску app доступний на `http://localhost:3000` (мапінг `3000:80`).

### Варіант B: docker build/run

```bash
docker build -t excalidraw .
docker run --rm -p 3000:80 excalidraw
```

Примітка: Dockerfile наразі збирає образ на `node:18` (це окремо від локальної рекомендації Node 20 для dev-середовища).

## 9) Часті проблеми

- Залежності "зламались" або дивні конфлікти:

```bash
yarn clean-install
```

- Потрібно перевірити зібрані пакети перед прикладами/інтеграціями:

```bash
yarn build:packages
```

## Верифіковано по source code

- `package.json` (root): `packageManager`, `engines`, scripts (`start`, `test:*`, `build:app:docker`, `clean-install`).
- `excalidraw-app/package.json`: app scripts (`start`, `build`, `build:app:docker`, `serve`).
- `.github/workflows/lint.yml`: CI lint/typecheck flow (`yarn test:other`, `yarn test:code`, `yarn test:typecheck`) на Node `20.x`.
- `.github/workflows/test.yml`: CI tests flow (`yarn test:app`) на Node `20.x`.
- `.github/PULL_REQUEST_TEMPLATE.md`: PR checklist.
- `Dockerfile`: docker build pipeline і runtime через nginx.
- `docker-compose.yml`: локальний containerized запуск на порту `3000`.
- `.lintstagedrc.js`, `.husky/pre-commit`: pre-commit tooling контекст.
