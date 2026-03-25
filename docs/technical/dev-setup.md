# Локальне середовище та перший PR

Документ описує онбординг від клонування репозиторію до відкриття першого pull request: інструменти, змінні середовища, типові команди, перевірки якості та робочий процес з Git. Деталі стеку й версій — у [techContext.md](../memory/techContext.md); структура коду — у [architecture.md](./architecture.md).

---

## Що потрібно на машині

- **Node.js** `>=18.0.0` (`engines` у кореневому та `excalidraw-app/package.json`). У `.github/workflows/*.yml` для CI зазвичай указано **Node 20.x** — локально зручно тримати ту саму мажорну версію, щоб уникнути розбіжностей.
- **Yarn Classic (v1)** `1.22.22` — значення поля `packageManager` у кореневому `package.json`. Зручно ввімкнути через [Corepack](https://nodejs.org/api/corepack.html): `corepack enable` і далі використовувати `yarn` з версією, зафіксованою в репозиторії.
- **Git** для клонування та гілок.

Опційно для повної колаборації в браузері — окремий сервер кімнат (див. `VITE_APP_WS_SERVER_URL` у `.env.development`); для базового редагування сцени локально він не обов’язковий.

---

## 1. Клонування

```bash
git clone <URL-репозиторію>
cd <каталог-проєкту>
```

Якщо репозиторій форкнули на GitHub/GitLab, додайте `upstream` на оригінал і періодично підтягуйте зміни (`git fetch upstream`, `git merge` або `git rebase` — за правилами вашої команди).

---

## 2. Залежності

У **корені** монорепозиторію:

```bash
yarn install
```

Під час `install` виконується скрипт `prepare` → `husky install` (кореневий `package.json`): Git починає використовувати хуки з каталогу `.husky` (файли хуків зазвичай уже в репозиторії). У файлі `.husky/pre-commit` виклик `lint-staged` за замовчуванням **закоментований**; за потреби розкоментуйте рядок, щоб перед комітом автоматично ганяти ESLint/Prettier згідно з `.lintstagedrc.js`.

Workspaces: `excalidraw-app`, `packages/*`, `examples/*` — один `yarn install` на корені встановлює залежності для всього дерева.

---

## 3. Змінні середовища

- У репозиторії є **`.env.development`** у корені: `envDir` у `excalidraw-app/vite.config.mts` вказує на `"../"`, тому Vite підхоплює ці змінні для режиму development.
- **Персональні перевизначення** (секрети, локальні URL) краще тримати в **`.env.development.local`** або **`.env.local`** — ці файли перелічені в `.gitignore` і не потрапляють у коміти.
- Типи для `import.meta.env`: у пакеті бібліотеки перелік ширший — `packages/excalidraw/vite-env.d.ts`; для оболонки застосунку — `excalidraw-app/vite-env.d.ts`. Частина змінних потрібна лише для колаборації, AI, трекінгу тощо.

У `.env.development` зазвичай заданий **`VITE_APP_PORT`** (у шаблоні репозиторію — `3001`). Якщо змінної немає, у `excalidraw-app/vite.config.mts` використовується запасний порт **`3000`**. Щоб змінити порт локально не чіпаючи комітнутий `.env`, використовуйте `.env.development.local`.

---

## 4. Запуск застосунку

З **кореня**:

```bash
yarn start
```

Скрипт делегує в `excalidraw-app` (`yarn && vite`): відкрийте в браузері адресу з консолі Vite (за замовчуванням `http://localhost:<VITE_APP_PORT>`).

Корисні додаткові команди з кореня (повний список — [techContext.md](../memory/techContext.md)):

| Команда | Призначення |
|--------|-------------|
| `yarn build` | Production-збірка додатка |
| `yarn build:packages` | Збірка пакетів `@excalidraw/*` у потрібному порядку |
| `yarn start:example` | Збірка пакетів + dev прикладу `examples/with-script-in-browser` |
| `yarn clean-install` | Чисте перевстановлення `node_modules` |

Якщо змінюєте код у `packages/*` і щось «не підхоплюється», переконайтеся, що для вашого сценарію достатньо HMR або запустіть відповідну збірку пакетів.

---

## 5. Тести, типи та стиль перед PR

На **pull request** у цьому репозиторії GitHub Actions запускають, зокрема:

- **Lint** (`.github/workflows/lint.yml`): `yarn test:other` (Prettier `--list-different`), `yarn test:code` (ESLint), `yarn test:typecheck` (`tsc`) — порядок саме такий, не як у `test:all`.
- **Test Coverage PR** (`.github/workflows/test-coverage-pr.yml`): `yarn test:coverage` (Vitest із покриттям).

Повний локальний прогін однією командою (зручно перед відправкою PR):

```bash
yarn test:all
```

Він виконує `test:typecheck`, `test:code`, `test:other` і `test:app --watch=false` (Vitest без watch). Це покриває те саме, що Lint workflow, плюс звичайний прогін тестів; **покриття** як у CI перевіряється окремо через `yarn test:coverage`.

Окремо:

- `yarn test` / `yarn test:app` — Vitest у режимі за замовчуванням (часто з watch).
- `yarn test:coverage` — покриття з порогами з `vitest.config.mts`.
- `yarn fix` — автоформатування Prettier + ESLint `--fix` по репозиторію (перевірте diff перед комітом).

---

## 6. Гілка, коміти, push

1. **Оновіть головну гілку** з віддаленого репозиторію (у цьому проєкті в workflow зазначено **`master`**; у форку може бути інша гілка за замовчуванням — уточніть у вашій команді).
2. Створіть **тематичну гілку**: `git checkout -b feature/короткий-опис` або `fix/...` за домовленістю команди.
3. Робіть **атомарні коміти** з зрозумілими повідомленнями (що змінено й навіщо).
4. **Push** у свій remote (форк або feature-гілка на origin):

   ```bash
   git push -u origin feature/короткий-опис
   ```

5. У веб-інтерфейсі GitHub/GitLab створіть **Pull Request / Merge Request** у цільову гілку (часто `master`).

У репозиторії є шаблон опису PR — `.github/PULL_REQUEST_TEMPLATE.md`. Якщо використовуєте **GitHub Actions** з цього репозиторію, workflow **Semantic PR title** (`.github/workflows/semantic-pr-title.yml`) вимагає, щоб заголовок PR відповідав [Conventional Commits](https://www.conventionalcommits.org/) (наприклад `feat: …`, `fix: …`).

У описі варто коротко вказати мотивацію змін, як перевірити вручну (кроки або скріншот для UI), посилання на issue/task, якщо є. Після відкриття PR дочекайтеся проходження перевірок CI та рев’ю.

---

## 7. Типові проблеми

- **Помилки після оновлення з головної гілки** (`master` або `main` — залежно від репозиторію): `yarn install`, за потреби `yarn clean-install`.
- **Дивна збірка або кеш Vite:** `yarn rm:build` (очищення `build`/`dist` у відповідних workspaces — див. скрипт у кореневому `package.json`).
- **Несумісна версія Node:** перейдіть на LTS ≥ 18, перевірте `node -v`.
- **Порт зайнятий:** задайте інший `VITE_APP_PORT` у `.env.development.local` (або змініть значення в `.env.development`, якщо це лише ваш локальний форк).

---

## Джерела в репозиторії

- Корінь: `package.json`, `.lintstagedrc.js`, `.husky/pre-commit`, `.env.development`, `.gitignore`, `.github/workflows/`, `.github/PULL_REQUEST_TEMPLATE.md`
- Додаток: `excalidraw-app/package.json`, `excalidraw-app/vite.config.mts`, `excalidraw-app/vite-env.d.ts`
- Тести: `vitest.config.mts`, `setupTests.ts`
