# Tech Context

## Runtime

| Залежність | Версія | Де |
|---|---|---|
| Node.js | >=18.0.0 | engine constraint (package.json) |
| Yarn | 1.22.22 | packageManager (package.json) |
| React | 19.0.0 | excalidraw-app/package.json |
| React (peer) | ^17 \|\| ^18 \|\| ^19 | packages/excalidraw/package.json |
| TypeScript | 5.9.3 | devDependencies (root) |

## Збірка

| Інструмент | Версія | Призначення |
|---|---|---|
| Vite | 5.0.12 | dev-server + production build |
| ESBuild | 0.19.10 | збірка npm-пакетів (buildPackage.js) |
| vite-plugin-react | 3.1.0 | React Fast Refresh |
| vite-plugin-pwa | 0.21.1 | Service Worker / офлайн |
| vite-plugin-svgr | 4.2.0 | SVG як React-компоненти |
| vite-plugin-checker | 0.7.2 | TypeScript + ESLint у dev-режимі |

## Ключові бібліотеки

### Canvas / Рендеринг
- **roughjs** `4.6.4` — hand-drawn стиль фігур
- **perfect-freehand** `1.2.0` — згладжування ліній від руки
- **canvas-roundrect-polyfill** `0.0.1` — полівілл для roundRect
- **pica** `7.1.1` — high-quality image resize

### State / UI
- **jotai** `2.11.0` — атомарний state для UI-компонентів
- **jotai-scope** `0.7.2` — ізоляція Jotai store між інстанціями
- **tunnel-rat** `0.1.2` — React portals через тунелі (Slot pattern)
- **radix-ui** `1.4.3` — accessible UI primitives
- **clsx** `1.1.1` — умовні CSS класи

### Колаборація (тільки excalidraw-app)
- **socket.io-client** `4.7.2` — WebSocket для real-time collab
- **firebase** `11.3.1` — persistence сцени та бінарних файлів
- **@sentry/browser** `9.0.1` — моніторинг помилок у production

### Дані / Утиліти
- **nanoid** `3.3.3` — генерація ID елементів
- **pako** `2.0.3` — gzip-стиснення JSON сцени
- **idb-keyval** `6.0.3` — IndexedDB для локального зберігання (excalidraw-app)
- **fractional-indexing** `3.2.0` — порядок елементів на сцені
- **@excalidraw/mermaid-to-excalidraw** `2.1.1` — Mermaid → елементи

### i18n
- **i18next-browser-languagedetector** `6.1.4` — автовизначення мови
- Переклади — Crowdin, 80+ мов у `packages/excalidraw/locales/`

## Тестування

| Інструмент | Версія | Призначення |
|---|---|---|
| Vitest | 3.0.6 | unit + integration тести |
| @vitest/coverage-v8 | 3.0.7 | coverage репорти |
| @vitest/ui | 2.0.5 | browser UI для тестів |
| @testing-library/react | 16.2.0 | рендер компонентів у тестах |
| jsdom | 22.1.0 | DOM environment |
| vitest-canvas-mock | 0.3.3 | мок Canvas API |
| fake-indexeddb | 3.1.7 | мок IndexedDB |

## Якість коду

- **ESLint** — `@excalidraw/eslint-config` + `eslint-config-react-app`
- **Prettier** — `@excalidraw/prettier-config`
- **Husky** `7.0.4` — pre-commit hook
- **lint-staged** `12.3.7` — перевірка тільки змінених файлів
- **TypeScript strict** — `tsc` як окремий тест-скрипт

## Dev-сервер та порти

```
VITE_APP_PORT=3001          # основний dev-сервер (yarn start)
VITE_APP_WS_SERVER_URL=http://localhost:3002  # excalidraw-room (WebSocket)
VITE_APP_AI_BACKEND=http://localhost:3016    # AI backend
```

## Ключові команди

```bash
# Встановлення залежностей
yarn install

# Запуск dev-сервера (http://localhost:3001)
yarn start

# Збірка веб-застосунку
yarn build:app

# Збірка всіх npm-пакетів
yarn build:packages

# Тести
yarn test                   # watch-режим (Vitest)
yarn test:app --watch=false # одноразово
yarn test:typecheck         # tsc перевірка
yarn test:code              # ESLint
yarn test:all               # все разом

# Coverage
yarn test:coverage

# Linting + форматування
yarn fix                    # prettier + eslint --fix

# Docker
docker-compose up           # порт 3000
```

## CI/CD (GitHub Actions)

| Workflow | Тригер | Що робить |
|---|---|---|
| `test.yml` | PR/push | Vitest тести |
| `lint.yml` | PR/push | ESLint + TypeScript |
| `test-coverage-pr.yml` | PR | Coverage diff |
| `build-docker.yml` | push main | Docker image |
| `publish-docker.yml` | release | Публікація на Docker Hub |
| `sentry-production.yml` | release | Source maps у Sentry |
| `autorelease-excalidraw.yml` | tag | npm публікація пакету |

## Deployment

- **Vercel** — excalidraw.com (автодеплой з main)
- **Docker** — `Dockerfile` + `docker-compose.yml` для self-hosting
- **npm** — `@excalidraw/excalidraw` публікується через GitHub Actions

## Конфігурація середовища

Файл `.env.development` — шаблон з усіма змінними.
Локальні перевизначення — `.env.development.local` (не комітиться).
Всі змінні мають префікс `VITE_APP_` (доступні у клієнтському коді через `import.meta.env`).

---

## Дивись також

- [Dev Setup](../technical/dev-setup.md) — покрокове підняття проєкту та перший PR
- [Architecture](../technical/architecture.md) — як пакети взаємодіють між собою
- [Project Brief](./projectbrief.md) — загальний огляд монорепо та його продуктів
