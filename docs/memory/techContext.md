# Tech Context — Excalidraw

Верифіковано з: `package.json`, `tsconfig.json`, `vitest.config.mts`,
`excalidraw-app/vite.config.mts`, `examples/with-nextjs/next.config.js`,
`packages/*/package.json`.

---

## Мови та рантайм

| Технологія | Версія | Джерело |
|------------|--------|---------|
| **TypeScript** | 5.9.3 | root `devDependencies` |
| **Node.js** | ≥ 18.0.0 | `"engines"` у root `package.json` |
| **React** | 19.0.0 | `excalidraw-app` + `examples` |
| **React DOM** | 19.0.0 | `excalidraw-app` + `examples` |

---

## Менеджер пакетів та монорепо

- **Yarn 1** (Classic): `"packageManager": "yarn@1.22.22"` — root `package.json`
- **Yarn Workspaces**: `excalidraw-app`, `packages/*`, `examples/*`
- Встановлення: `yarn install` або `yarn clean-install`

---

## Система збірки

| Інструмент | Версія | Роль |
|------------|--------|------|
| **Vite** | 5.0.12 | Бандлер `excalidraw-app` + приклади |
| `@vitejs/plugin-react` | 3.1.0 | JSX transform |
| `vite-plugin-checker` | 0.7.2 | TS + ESLint перевірка при dev |
| `vite-plugin-pwa` | 0.21.1 | PWA / Workbox |
| `vite-plugin-svgr` | 4.2.0 | SVG → React компоненти |
| `vite-plugin-ejs` | 1.7.0 | Шаблонізація `index.html` |
| `vite-plugin-sitemap` | 0.7.1 | Генерація sitemap |
| **esbuild** | (bundled в Vite) | Транспіляція packages |
| **Next.js** | 14.1 | Тільки `examples/with-nextjs` |

---

## Конфігурація TypeScript

Файл: `tsconfig.json` (root)

- `target`: ESNext, `module`: ESNext, `moduleResolution`: node
- `strict`: true, `isolatedModules`: true, `noEmit`: true
- `jsx`: react-jsx
- **Path aliases** (вирішуються у Vite та Vitest теж):

```
@excalidraw/common    → packages/common/src/index.ts
@excalidraw/excalidraw → packages/excalidraw/index.tsx
@excalidraw/element   → packages/element/src/index.ts
@excalidraw/math      → packages/math/src/index.ts
@excalidraw/utils     → packages/utils/src/index.ts
```

---

## Тестування

| Інструмент | Версія | Роль |
|------------|--------|------|
| **Vitest** | 3.0.6 | Test runner |
| `@vitest/coverage-v8` | 3.0.7 | Покриття коду |
| `@vitest/ui` | 2.0.5 | UI для перегляду тестів |
| **jsdom** | 22.1.0 | DOM-середовище |
| `vitest-canvas-mock` | 0.3.3 | Mock Canvas API |
| `@testing-library/*` | — | React-компоненти тести |

**Пороги покриття** (`vitest.config.mts`):
- lines: 60%, branches: 70%, functions: 63%, statements: 60%

**Налаштування** (`setupTests.ts`): canvas mock, jest-dom, throttle mock, IndexedDB, font mocks, `#root` div.

---

## Стан застосунку

| Бібліотека | Версія | Використання |
|------------|--------|--------------|
| **Jotai** | 2.11.0 | State management (`editor-jotai.ts`, `app-jotai.ts`) |
| `jotai-scope` | — | Ізольований scope у `@excalidraw/excalidraw` |

> ESLint-правило забороняє прямий імпорт `jotai` — лише через `editor-jotai` або `app-jotai`.

---

## Бекенд і реалтайм

| Бібліотека | Версія | Роль |
|------------|--------|------|
| **Firebase** | 11.3.1 | Persistence, sharing (excalidraw-app) |
| **Socket.io-client** | 4.7.2 | Colaboration / realtime sync |
| `idb-keyval` | 6.0.3 | IndexedDB key-value store |

---

## Моніторинг і аналітика

| Бібліотека | Версія | Роль |
|------------|--------|------|
| `@sentry/browser` | 9.0.1 | Error tracking |
| `callsites` | 4.2.0 | Stack trace утиліта |

---

## Якість коду

| Інструмент | Версія | Роль |
|------------|--------|------|
| **ESLint** | — | Лінтинг (config: `@excalidraw/eslint-config` + `react-app`) |
| **Prettier** | 2.6.2 | Форматування (config: `@excalidraw/prettier-config`) |
| **Husky** | 7.0.4 | Git hooks |
| **lint-staged** | 12.3.7 | Перевірка тільки staged файлів |

---

## Бібліотеки рендерингу та i18n

**Рендеринг** (`packages/excalidraw`): Rough.js (фігури "від руки"), perfect-freehand (вільні лінії), CodeMirror 6 (редактор коду), Radix UI (UI-компоненти), `mermaid-to-excalidraw` (імпорт діаграм), `tinycolor2` (кольори).

**i18n**: `i18next-browser-languagedetector` **6.1.4** · переклади у `packages/excalidraw/locales/` · Crowdin · скрипти: `locales-coverage`, `locales-coverage:description`.

---

## CI/CD та деплой

| Технологія | Деталі |
|------------|--------|
| **GitHub Actions** | `.github/workflows/`: lint, test, docker, sentry, coverage, locales |
| **Vercel** | `vercel.json`: `outputDirectory: excalidraw-app/build`, `installCommand: yarn install` |
| **Docker** | Окремий workflow; `build:app:docker` скрипт |

---

## Ключові команди

```bash
# Встановлення
yarn install
yarn clean-install        # rm node_modules + yarn install

# Розробка
yarn start                # dev-сервер excalidraw-app (Vite HMR)

# Збірка
yarn build                # збірка excalidraw-app
yarn build:packages       # збірка всіх пакетів (common→math→element→excalidraw)
yarn build:app:docker     # Docker-збірка

# Тести
yarn test                 # vitest (watch mode)
yarn test:app --watch=false  # одноразовий запуск
yarn test:coverage        # з покриттям
yarn test:ui              # UI-режим Vitest
yarn test:typecheck       # tsc --noEmit
yarn test:code            # eslint
yarn test:all             # typecheck + code + other + app

# Виправлення
yarn fix                  # prettier + eslint --fix

# Очищення
yarn rm:build             # видалити build/dist папки
yarn rm:node_modules      # видалити node_modules
```

---

## Структура пакетів (версії)

| Пакет | Версія |
|-------|--------|
| `@excalidraw/excalidraw` | 0.18.0 |
| `@excalidraw/element` | 0.18.0 |
| `@excalidraw/common` | 0.18.0 |
| `@excalidraw/math` | 0.18.0 |
| `@excalidraw/utils` | 0.1.2 |

---

## Auto-review (CodeRabbit)

- Файл: `.coderabbit.yaml` у корені
- Профіль: `assertive`
- Мова: `uk-UA` (Ukrainian)
- Перевіряє homework-кроки учасників воркшопу у PR

---

## Додаткова документація

For detailed architecture → see [docs/technical/architecture.md](../technical/architecture.md)
For domain glossary → see [docs/product/domain-glossary.md](../product/domain-glossary.md)
