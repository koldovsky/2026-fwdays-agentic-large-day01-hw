# Excalidraw — Технічний контекст

## Мова, фреймворк, рантайм

| Параметр | Значення |
|---|---|
| Мова | TypeScript 5.9.3 |
| UI фреймворк | React 19.0.10 |
| Збірка | Vite 5.0.12 |
| Рантайм | Node.js >= 18.0.0 |
| Пакетний менеджер | Yarn 1.22.22 |
| Монорепо | Yarn Workspaces |
| Модульна система | ESNext (ESM) |

## Ключові залежності

### Production

| Назва | Призначення | Версія |
|---|---|---|
| react / react-dom | UI фреймворк | 19.0.10 |
| roughjs | Hand-drawn стиль рендерингу | — |
| jotai | State management (атомарний) | — |
| socket.io-client | WebSocket для realtime collaboration | — |
| firebase | Аутентифікація, зберігання, база даних | — |
| nanoid | Генерація унікальних ID | — |
| lodash (throttle) | Утиліти (throttle/debounce) | — |
| tinycolor2 | Маніпуляція кольорами | — |
| i18next | Інтернаціоналізація | — |

### Dev

| Назва | Призначення | Версія |
|---|---|---|
| typescript | Мова / компілятор | 5.9.3 |
| vite | Збірка та dev-сервер | 5.0.12 |
| vitest | Тестовий фреймворк | 3.0.6 |
| eslint | Лінтинг коду | — |
| prettier | Форматування коду | — |
| husky | Git hooks (pre-commit) | 7.0.4 |
| lint-staged | Перевірка staged файлів | — |
| @testing-library/react | Тестування React-компонентів | — |
| vitest-canvas-mock | Мокінг Canvas API для тестів | — |
| fake-indexeddb | Мокінг IndexedDB для тестів | — |

## Dev tools — тестування, лінтинг, форматування

- **Тестування**: Vitest 3.0.6, JSDOM environment, React Testing Library
- **Лінтинг**: ESLint з `@excalidraw/eslint-config`, правила для імпортів та Jotai
- **Форматування**: Prettier з `@excalidraw/prettier-config`
- **Git hooks**: Husky 7.0.4 + lint-staged (ESLint --fix для .js/.ts/.tsx, Prettier для .css/.json/.md)
- **Editor config**: 2 пробіли, UTF-8, LF line endings

## Команди

### Розробка

```bash
yarn start                # Запуск dev-сервера (порт 3001)
yarn build                # Збірка додатку
yarn build:app:docker     # Збірка для Docker
```

### Тестування

```bash
yarn test:all             # Повний прогін: типи + лінт + формат + тести
yarn test:code            # ESLint з max-warnings=0
yarn test                 # Vitest (unit + integration тести)
```

### Якість коду

```bash
yarn fix:code             # Автовиправлення ESLint
yarn fix:other            # Форматування Prettier
```

### Збірка пакетів

```bash
yarn release              # Скрипт релізу пакетів
yarn clean-install        # Повне перевстановлення залежностей
```

## Змінні середовища

### Development (`.env.development`)

| Змінна | Значення | Опис |
|---|---|---|
| `VITE_APP_BACKEND_V2_GET_URL` | `https://json-dev.excalidraw.com/api/v2/` | API для отримання даних |
| `VITE_APP_BACKEND_V2_POST_URL` | `https://json-dev.excalidraw.com/api/v2/post/` | API для збереження |
| `VITE_APP_LIBRARY_URL` | `https://libraries.excalidraw.com` | Бібліотеки елементів |
| `VITE_APP_WS_SERVER_URL` | `http://localhost:3002` | WebSocket сервер (локальний) |
| `VITE_APP_PORT` | `3001` | Порт dev-сервера |
| `VITE_APP_AI_BACKEND` | `http://localhost:3016` | AI-бекенд |
| `VITE_APP_ENABLE_TRACKING` | `true` | Аналітика |
| `VITE_APP_ENABLE_PWA` | `false` | PWA режим |

### Production (`.env.production`)

| Змінна | Значення |
|---|---|
| `VITE_APP_BACKEND_V2_GET_URL` | `https://json.excalidraw.com/api/v2/` |
| `VITE_APP_WS_SERVER_URL` | `https://oss-collab.excalidraw.com` |
| `VITE_APP_AI_BACKEND` | `https://oss-ai.excalidraw.com` |
| `VITE_APP_ENABLE_TRACKING` | `false` |

Обидва середовища також містять Firebase конфігурацію та RSA публічний ключ для Excalidraw Plus.

## Docker конфігурація

### Dockerfile

- **Стадія збірки**: Node.js 18 — `yarn build:app:docker`
- **Стадія виконання**: Nginx Alpine — сервує `/excalidraw-app/build`
- **Health check**: `wget -q http://localhost/ -O /dev/null`

### docker-compose.yml

```yaml
ports: "3000:80"
volumes: ".:/opt/node_app/app"
```

## CI/CD (GitHub Actions)

| Workflow | Призначення |
|---|---|
| `test.yml` | Запуск тестів |
| `lint.yml` | ESLint + Prettier перевірки |
| `test-coverage-pr.yml` | Звіт покриття на PR |
| `size-limit.yml` | Контроль розміру бандлу |
| `build-docker.yml` | Збірка Docker образу |
| `publish-docker.yml` | Публікація Docker образу |
| `autorelease-excalidraw.yml` | Автоматичний реліз |
| `sentry-production.yml` | Sentry error tracking |
| `locales-coverage.yml` | Покриття перекладів |
| `semantic-pr-title.yml` | Валідація назви PR |
| `cancel.yml` | Скасування дублюючих workflow |

## Деплой

- **Vercel** — основний хостинг (`vercel.json`)
  - Output directory: `excalidraw-app/build`
  - CORS headers, кеш для .woff2 шрифтів
  - Редіректи для `/webex` та `vscode.excalidraw.com`
