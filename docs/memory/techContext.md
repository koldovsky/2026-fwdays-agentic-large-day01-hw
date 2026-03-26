# Tech Context

## Основний стек

| Категорія         | Технологія                        | Версія      |
|-------------------|-----------------------------------|-------------|
| UI Framework      | React                             | 19.0.0      |
| Мова              | TypeScript                        | 5.9.3       |
| Білд-тул          | Vite                              | 5.0.12      |
| Тестування        | Vitest                            | 3.0.6       |
| State management  | Jotai                             | 2.11.0      |
| Реальний час      | Socket.IO client                  | 4.7.2       |
| Бекенд/БД         | Firebase                          | 11.3.1      |
| Помилки           | Sentry                            | 9.0.1       |
| i18n              | i18next                           | ^24.x       |
| Стилі             | SCSS                              | —           |
| Малювання         | Rough.js                          | 4.6.4       |
| Stroke smoothing  | Perfect-freehand                  | 1.2.0       |
| Текстовий editor  | CodeMirror                        | 6.x         |
| Accessibility UI  | Radix UI                          | 1.4.3       |
| Зображення        | Pica (resize)                     | 7.1.1       |
| PWA               | Vite Plugin PWA (Workbox)         | —           |
| Storage           | idb-keyval (IndexedDB)            | 6.0.3       |

## Версії середовища

- **Node.js**: `>= 18.0.0`
- **Yarn**: `1.22.22` (classic)
- **TypeScript target**: `ESNext`
- **Module system**: `ESNext`

## Конфігураційні файли

| Файл                      | Призначення                                     |
|---------------------------|-------------------------------------------------|
| `package.json`            | Монорепо + workspaces                           |
| `tsconfig.json`           | TypeScript, path aliases для packages           |
| `vitest.config.mts`       | Тести: jsdom, coverage thresholds               |
| `excalidraw-app/vite.config.mts` | Dev-сервер, білд, чанки, PWA               |
| `.env.development`        | localhost бекенди, WebSocket, Firebase dev      |
| `.env.production`         | CDN, production APIs, Firebase prod             |
| `vercel.json`             | Деплоймент, CORS, cache headers, redirects      |
| `.eslintrc.json`          | ESLint rules                                    |
| `.lintstagedrc.js`        | Pre-commit хуки                                 |
| `crowdin.yml`             | Синхронізація перекладів                        |

## TypeScript path aliases (`tsconfig.json`)

```text
"@excalidraw/common"      → "packages/common/src/index.ts"
"@excalidraw/element"     → "packages/element/src/index.ts"
"@excalidraw/excalidraw"  → "packages/excalidraw/index.tsx"
"@excalidraw/math"        → "packages/math/src/index.ts"
"@excalidraw/utils"       → "packages/utils/src/index.ts"
```

## Dev-сервер

- Port: `3001` (з `.env.development`)
- WebSocket бекенд: `localhost:3002`
- AI бекенд: `localhost:3016`
- PWA вимкнено в dev

## Build

- Output: `excalidraw-app/build/`
- Source maps: увімкнено
- Chunk splitting:
  - Локалі → окремі чанки (кеш 30 днів)
  - CodeMirror → окремий чанк
  - Mermaid → окремий чанк
- Max cache: 2.3 MB
- Asset inline limit: 0

## Основні команди

```bash
# Розробка
yarn start                  # Dev-сервер (порт 3001, auto-open)
yarn start:production       # Зібрати та запустити production-сервер

# Білд
yarn build                  # Повний білд (версія + пакети + застосунок)
yarn build:packages         # Білд усіх пакетів
yarn build:app              # Білд тільки застосунку
yarn build:app:docker       # Білд для Docker

# Тестування
yarn test                   # Запустити тести застосунку
yarn test:all               # typecheck + eslint + prettier + app tests
yarn test:typecheck         # TypeScript перевірка
yarn test:code              # ESLint
yarn test:other             # Prettier
yarn test:coverage          # Тести з coverage
yarn test:update            # Оновити snapshots

# Якість коду
yarn fix                    # fix:code + fix:other
yarn fix:code               # ESLint --fix
yarn fix:other              # Prettier

# Локалізація
yarn locales-coverage       # Звіт покриття локалей

# Очищення
yarn clean-install          # rm node_modules + fresh install
yarn rm:build               # Видалити build-директорії
```

## Coverage thresholds (vitest.config.mts)

```text
Lines:      60%
Branches:   70%
Functions:  63%
Statements: 60%
```

## CI/CD

- GitHub Actions (`.github/workflows/`)
- Husky pre-commit хуки (`.husky/`)
- lint-staged для автоформатування при коміті
- Crowdin для автосинхронізації перекладів

## Details

For detailed architecture → see [docs/technical/architecture.md](../technical/architecture.md)
For domain glossary → see [docs/product/domain-glossary.md](../product/domain-glossary.md)
