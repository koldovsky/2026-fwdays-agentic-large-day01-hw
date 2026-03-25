# Технічний контекст (Memory Bank)

## Пов’язана документація

- **Технічна** ([`docs/technical/`](../technical/)): [architecture.md](../technical/architecture.md) · [dev-setup.md](../technical/dev-setup.md)
- **Продуктова** ([`docs/product/`](../product/)): [PRD.md](../product/PRD.md) · [domain-glossary.md](../product/domain-glossary.md)

Короткий знімок стеку, зафіксованих версій і команд. Усі числа та назви пакетів узгоджені з файлами репозиторію (`package.json`, `vitest.config.mts`, `excalidraw-app/vite.config.mts`, `tsconfig.json`, `vercel.json`).

---

## Назва та тип репозиторію

- **npm name (root):** `excalidraw-monorepo` (`package.json`)
- **Приватний** монорепозиторій на **Yarn Workspaces** (Classic / v1)

---

## Середовище виконання

- **Node.js:** `>=18.0.0` (`engines` у корені та `excalidraw-app/package.json`)
- **Менеджер пакетів:** `yarn@1.22.22` (`packageManager` у корені)
- **TypeScript (root devDependency):** `5.9.3`

---

## Workspaces

З кореневого `package.json`:

- `excalidraw-app` — веб-додаток (Vite)
- `packages/*` — `@excalidraw/common`, `@excalidraw/element`, `@excalidraw/excalidraw`, `@excalidraw/math`, `@excalidraw/utils` (версії пакетів див. їхні `package.json`)
- `examples/*` — `with-script-in-browser`, `with-nextjs`

---

## Основний UI-стек (додаток)

`excalidraw-app/package.json`:

- **React / React DOM:** `19.0.0` — **UI на React** (файли `.tsx`); **Vue** у залежностях і коді репозиторію не використовується.
- **Стан:** `jotai` `2.11.0`
- **Реалтайм / бекенд-клієнт:** `socket.io-client` `4.7.2`
- **Firebase:** `11.3.1`
- **Спостереження помилок:** `@sentry/browser` `9.0.1`
- **i18n-детектор:** `i18next-browser-languagedetector` `6.1.4`
- **Локальне сховище:** `idb-keyval` `6.0.3`

---

## Збірка та dev-сервер (додаток)

- **Bundler / dev:** Vite `5.0.12` (root `devDependencies`; те саме у `examples/with-script-in-browser`)
- **React plugin:** `@vitejs/plugin-react` `3.1.0` (root)
- **Конфіг:** `excalidraw-app/vite.config.mts`
  - **Порт dev-сервера:** `Number(VITE_APP_PORT || 3000)` (змінні з `envDir: "../"`)
  - **Вихід збірки:** `build` → каталог `excalidraw-app/build` (`build.outDir`)
  - **Публічні файли:** `../public` відносно `excalidraw-app`
- **Плагіни (з коду конфігу):** `@vitejs/plugin-react`, `vite-plugin-svgr`, `vite-plugin-ejs`, `vite-plugin-pwa`, `vite-plugin-checker`, `vite-plugin-html`, `vite-plugin-sitemap`, кастомний `woff2BrowserPlugin` з `scripts/woff2/woff2-vite-plugins` (версії npm-плагінів — у кореневому та `excalidraw-app/package.json`, де зазначено)

---

## Пакети бібліотеки (огляд)

- **`@excalidraw/excalidraw`:** `0.18.0` — React-компонент; залежності включають CodeMirror 6, `roughjs`, `sass`, `radix-ui`, `jotai`, `mermaid-to-excalidraw` тощо (`packages/excalidraw/package.json`)
- **`@excalidraw/common` / `element` / `math`:** `0.18.0`; **`@excalidraw/utils`:** `0.1.2`
- **Збірка пакетів:** скрипти `build:esm` викликають `scripts/buildBase.js`, `buildPackage.js` або `buildUtils.js` + `gen:types` (див. `packages/*/package.json`)

---

## TypeScript (корінь)

`tsconfig.json`:

- **Target / module:** `ESNext`, `moduleResolution: "node"`
- **JSX:** `react-jsx`, **strict:** увімкнено
- **Path aliases:** `@excalidraw/common`, `element`, `excalidraw`, `math`, `utils` → `packages/...`
- **Include:** `packages`, `excalidraw-app`

---

## Тестування

- **Раннер:** Vitest `3.0.6` (root)
- **UI (опційно):** `@vitest/ui` `2.0.5`
- **Покриття:** `@vitest/coverage-v8` `3.0.7`
- **Конфіг:** `vitest.config.mts` — `environment: "jsdom"`, `globals: true`, `setupFiles: ["./setupTests.ts"]`, пороги coverage (`lines` 60, `branches` 70, `functions` 63, `statements` 60)
- **Допоміжно:** `jsdom` `22.1.0`, `vitest-canvas-mock` `0.3.3`, `@testing-library/react` / `jest-dom` (у `packages/excalidraw`), `chai` `4.3.6`, `@types/jest` `27.4.0`

---

## Лінтинг і форматування

- **ESLint:** через `eslint-config-react-app` `7.0.1`, база `@excalidraw/eslint-config` `1.0.3`, `eslint-plugin-import` `2.31.0`, `eslint-plugin-prettier` `3.3.1`, `eslint-config-prettier` `8.5.0`
- **Prettier:** `2.6.2`, конфіг `@excalidraw/prettier-config` `1.0.2`
- **Pre-commit:** `husky` `7.0.4`, `lint-staged` `12.3.7`
- **Кореневий конфіг:** `.eslintrc.json`

---

## Деплой (Vercel)

`vercel.json`:

- **`outputDirectory`:** `excalidraw-app/build`
- **`installCommand`:** `yarn install`

---

## Приклади

| Проєкт | Примітки з `package.json` |
|--------|---------------------------|
| `examples/with-script-in-browser` | Vite `5.0.12`, React `19.0.0`, `@excalidraw/excalidraw` `*` |
| `examples/with-nextjs` | Next `14.1`, React `19.0.0`, dev на порту `3005`, start на `3006` |

---

## Команди (корінь репозиторію)

Усі наведені нижче — з кореневого `scripts` у `package.json`.

### Розробка та збірка

- `yarn start` — dev `excalidraw-app` (всередині: `yarn && vite`)
- `yarn start:production` — production-збірка + `http-server` на `localhost:5001`
- `yarn build` — повна збірка додатка (`build:app` + `build:version`)
- `yarn build:app` — `vite build` у `excalidraw-app` (з env для Vercel / tracking)
- `yarn build:packages` — послідовно `common` → `math` → `element` → `excalidraw`
- `yarn build:preview` — збірка + `vite preview` (порт `5000`)
- `yarn start:example` — `build:packages` + старт `examples/with-script-in-browser`

### Тести та якість коду

- `yarn test` / `yarn test:app` — `vitest`
- `yarn test:all` — typecheck + eslint + prettier + `test:app --watch=false`
- `yarn test:typecheck` — `tsc`
- `yarn test:code` — `eslint --max-warnings=0 --ext .js,.ts,.tsx .`
- `yarn test:other` — `prettier --list-different` (шляхи як у скрипті `prettier`)
- `yarn test:coverage` — `vitest --coverage`
- `yarn test:ui` — Vitest UI з coverage
- `yarn fix` — `prettier --write` + eslint `--fix`

### Утиліти

- `yarn clean-install` — видалення `node_modules` + `yarn install`
- `yarn rm:build` / `yarn rm:node_modules` — очищення артефактів (`rimraf`)
- `yarn locales-coverage` / `locales-coverage:description` — скрипти в `scripts/`
- `yarn release` (+ `release:test` / `next` / `latest`) — `scripts/release.js`

---

## Джерела в репозиторії

- Корінь: `package.json`, `tsconfig.json`, `vitest.config.mts`, `setupTests.ts`, `.eslintrc.json`, `vercel.json`
- Додаток: `excalidraw-app/package.json`, `excalidraw-app/vite.config.mts`
- Пакети: `packages/*/package.json`, `packages/tsconfig.base.json`
- Приклади: `examples/*/package.json`
