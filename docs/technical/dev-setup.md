# Dev setup: від онбордингу до першого PR

Монорепозиторій **excalidraw-monorepo** (`package.json`). Нижче — мінімальний шлях, перевірений по скриптах і конфігах у цьому дереві.

## 1. Що поставити

| Вимога | Джерело в репо |
|--------|----------------|
| **Node.js** `>= 18.0.0` | `package.json` → `engines.node` |
| **Yarn Classic** `1.22.22` | `package.json` → `packageManager` |

Файлу `.nvmrc` у корені **немає** — обери LTS Node 18 або новіший самостійно (наприклад через `nvm`, `fnm`, `asdf`).

Рекомендація: увімкни Corepack і використовуй зафіксовану версію Yarn:

```bash
corepack enable
corepack prepare yarn@1.22.22 --activate
```

(Якщо Corepack недоступний — встанови Yarn 1.x вручну відповідно до політики вашої команди.)

## 2. Клон і залежності

З кореня репозиторію:

```bash
yarn install
```

Після `install` спрацьовує скрипт **`prepare`** → `husky install` (`package.json`).

### Husky / pre-commit

У `.husky/pre-commit` зараз лише закоментований рядок `# yarn lint-staged` — **автоматичний lint-staged на commit не виконується**, доки хук не увімкнути. Локальні перевірки перед PR потрібно запускати вручну (розділ 5).

Конфіг **lint-staged** лежить у `.lintstagedrc.js`: ESLint з `--fix` для `*.{js,ts,tsx}`, Prettier для `*.{css,scss,json,md,html,yml}`.

## 3. Змінні середовища

Vite для `excalidraw-app` читає env з **батьківської** директорії (`excalidraw-app/vite.config.mts` → `envDir: "../"`).

У репозиторії вже є:

- `.env.development`
- `.env.production`

Приклад порту dev-сервера: `VITE_APP_PORT` (у `.env.development` за замовчуванням вказано `3001`; можна змінити).

Коментар у `.env.development`: секрети та перевизначення краще тримати в **`.env.local`** і не комітити.

## 4. Запуск у розробці

| Команда (з кореня) | Призначення |
|--------------------|-------------|
| `yarn start` | Dev: `yarn --cwd ./excalidraw-app start` → Vite, зазвичай відкриває браузер (`open: true` у `vite.config.mts`) |
| `yarn build` | Прод-збірка застосунку |
| `yarn build:packages` | Послідовна збірка `common` → `math` → `element` → `excalidraw` у `dist` (потрібно для сценаріїв на зібраних пакетах) |
| `yarn start:example` | `build:packages` + старт прикладу `examples/with-script-in-browser` |

Колаборація в dev з `.env.development` очікує WebSocket за `VITE_APP_WS_SERVER_URL` (наприклад `http://localhost:3002`); окремий сервер кімнат у цей репозиторій **не входить** — посилання в env вказує на репозиторій excalidraw-room.

## 5. Перевірки перед комітом / PR

Повний набір, як у CI-орієнтованому workflow:

```bash
yarn test:all
```

Складається з (`package.json`):

1. `yarn test:typecheck` — `tsc`
2. `yarn test:code` — ESLint `--max-warnings=0` для `.js,.ts,.tsx`
3. `yarn test:other` — Prettier `--list-different`
4. `yarn test:app --watch=false` — Vitest один прогін

Швидші варіанти:

- `yarn test` — лише Vitest (watch)
- `yarn fix` — `prettier --write` + `eslint --fix`

ESLint тягне `@excalidraw/eslint-config` і `react-app` (`.eslintrc.json`). Prettier: `@excalidraw/prettier-config`.

## 6. Де що лежить (орієнтир для змін)

| Зона | Шлях |
|------|------|
| Застосунок (Vite) | `excalidraw-app/` |
| Пакет редактора | `packages/excalidraw/` |
| Елементи сцени, Store, Scene | `packages/element/` |
| Спільні константи / утиліти | `packages/common/` |
| Математика | `packages/math/` |
| Експорт / shape utils | `packages/utils/` |
| Приклади | `examples/*` |

Аліаси `@excalidraw/*` на вихідники задані в `tsconfig.json` і дублюються в `vitest.config.mts` та `excalidraw-app/vite.config.mts`.

## 7. Документація в цьому клоні

Кореневого **README** може не бути — користуйся:

- `docs/memory/` — Memory Bank
- `docs/technical/architecture.md` — архітектура редактора
- `docs/technical/undocumented-behavior.md` — неявна поведінка
- `docs/product/PRD.md` — продуктовий зріз з коду

## 8. Чеклист першого PR

1. **Онбординг**: Node ≥ 18, Yarn 1.22.22, `yarn install`.
2. **Гілка**: з правил вашої команди (наприклад `feature/...` або `fix/...`).
3. **Зміна**: мінімальний scope; узгодити стиль імпортів з `.eslintrc.json` (`import/order`, `consistent-type-imports`).
4. **Локально**: `yarn test:all` (або хоча б `yarn test:typecheck` + `yarn test:code` + релевантні тести Vitest).
5. **Форматування**: `yarn fix` або пройти Prettier/ESLint як у `.lintstagedrc.js`.
6. **Опис PR**: що змінено і навіщо; якщо торкаєтесь неочевидної поведінки — посилання на файл / тест.
7. **Опційно**: увімкнути `yarn lint-staged` у `.husky/pre-commit`, якщо команда домовилась про обов’язкові pre-commit hooks.

## 9. Якщо щось зламалось

- Чиста перевстановлення: `yarn clean-install` (скрипт у `package.json` — видаляє `node_modules` у workspaces + root, потім `yarn install`).
- Артефакти збірки: `yarn rm:build`.
- TypeScript / шляхи: перевір `paths` у `tsconfig.json` після додавання нових entry у пакетах.

---

*Остання звірка з репозиторієм: скрипти та `engines` з кореневого `package.json`, Husky / lint-staged з `.husky/pre-commit` та `.lintstagedrc.js`, Vite `envDir` з `excalidraw-app/vite.config.mts`.*
