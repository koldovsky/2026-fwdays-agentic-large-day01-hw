# Tech context

## Менеджер пакетів і Node

- **Package manager:** `yarn@1.22.22` (поле `packageManager` у кореневому `package.json`).
- **Node:** `>=18.0.0` (`engines` у корені та в `excalidraw-app/package.json`).

## Монорепозиторій

- **Механізм:** Yarn workspaces (`workspaces` у кореневому `package.json`).
- **Workspaces:** `excalidraw-app`, `packages/*`, `examples/*`.

## Версії ключових технологій (з `package.json`)

| Область | Версія / деталі | Джерело |
|--------|------------------|---------|
| TypeScript | `5.9.3` | корінь `devDependencies` |
| React / React DOM | `19.0.0` | `excalidraw-app` dependencies |
| Vite | `5.0.12` | корінь `devDependencies`; `excalidraw-app` збірка через `vite` |
| Vitest | `3.0.6` | корінь |
| ESLint / Prettier | `eslint-config-react-app` 7.0.1, `prettier` 2.6.2, `@excalidraw/prettier-config` | корінь |
| Husky | `7.0.4` | корінь; скрипт `prepare`: `husky install` |

## Пакети `@excalidraw/*` (версії в репо)

- `@excalidraw/excalidraw` — **0.18.0** (`packages/excalidraw/package.json`).
- `@excalidraw/common`, `@excalidraw/math`, `@excalidraw/element` — **0.18.0**.
- `@excalidraw/utils` — **0.1.2** (`packages/utils/package.json`).

## Застосунок `excalidraw-app` (додаткові залежності)

З `excalidraw-app/package.json` (вибірково): `jotai` 2.11.0, `firebase` 11.3.1, `@sentry/browser` 9.0.1, `socket.io-client` 4.7.2, `idb-keyval`, `i18next-browser-languagedetector`, тощо.

## Збірка бібліотечних пакетів

- Скрипти `build:esm` у пакетах викликають **`node ../../scripts/buildBase.js`** (common, math, element) або **`buildPackage.js`** (excalidraw), **`buildUtils.js`** (utils) — використовується **esbuild** + **esbuild-sass-plugin** (див. `scripts/buildPackage.js` та `packages/excalidraw/package.json` devDependencies).

## TypeScript / шляхи

- Кореневий `tsconfig.json`: `strict`, `jsx: react-jsx`, `paths` для `@excalidraw/common|element|math|utils|excalidraw` → вихідні `src` / `index.tsx`.
- `excalidraw-app/vite.config.mts` та `vitest.config.mts` дублюють **alias** на ті самі шляхи для dev/test.

## Команди (корінь репозиторію)

З кореневого `package.json` `scripts`:

| Команда | Призначення |
|---------|-------------|
| `yarn start` | dev-сервер застосунку (`yarn --cwd ./excalidraw-app start` → `vite`) |
| `yarn build` | збірка застосунку |
| `yarn build:packages` | послідовно `common` → `math` → `element` → `excalidraw` |
| `yarn test` / `yarn test:app` | Vitest |
| `yarn test:all` | typecheck + eslint + prettier + app tests |
| `yarn test:typecheck` | `tsc` |
| `yarn test:code` | ESLint |
| `yarn fix` | Prettier write + ESLint fix |
| `yarn start:example` | `build:packages` + приклад `with-script-in-browser` |
| `yarn clean-install` | видалення `node_modules` + `yarn install` |

## Тестове середовище

- `vitest.config.mts`: `environment: "jsdom"`, `setupFiles: ["./setupTests.ts"]`, `globals: true`, coverage thresholds (lines/branches/functions/statements задані чисельно).

## Приклади

- **`examples/with-script-in-browser`:** Vite `5.0.12`, React `19.0.0`, залежність `@excalidraw/excalidraw: "*"`, скрипти `start` / `build` / `preview` (порт preview `5002`).
- **`examples/with-nextjs`:** Next `14.1`, React `19.0.0`, `@types/react` `19.0.10`. Скрипти: `build:packages` → корінь; `build:workspace` = збірка пакетів + `copy:assets` (копіювання `../../packages/excalidraw/dist/prod/fonts` у `public`); `dev` на порту **3005**; `start` на **3006**.
