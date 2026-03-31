# Developer setup

## Scope

Цей документ описує повний onboarding для цього монорепозиторію: від `git clone` до першого PR.

Основний happy path у цьому репозиторії:

- встановити Node.js і Yarn 1
- встановити залежності workspace
- запустити `excalidraw-app`
- прогнати локальні перевірки
- створити гілку, закомітити зміни, відкрити PR

> Приклади команд нижче подані для Windows + PowerShell, бо саме цей сценарій явно підтверджений у репозиторії. Ключові команди root-level також будуть однаковими по суті на macOS/Linux.

## 1. Що у репозиторії

Це Yarn workspace monorepo з трьома основними зонами:

- `excalidraw-app` — hosted web app
- `packages/*` — reusable пакети (`@excalidraw/excalidraw`, `@excalidraw/common`, `@excalidraw/element`, `@excalidraw/math`, `@excalidraw/utils`)
- `examples/*` — інтеграційні приклади

Ключові технічні вимоги, підтверджені конфігами:

- Node.js: `>=18.0.0`
- CI використовує Node `20.x`
- package manager: `yarn@1.22.22`

Рекомендація для локальної роботи: одразу використовувати Node 20 LTS і Yarn 1.22.22.

## 2. Prerequisites

Встанови:

- Git
- Node.js 20 LTS
- Corepack або глобальний Yarn `1.22.22`

Перевірка в PowerShell:

```powershell
node -v
corepack --version
git --version
```

Якщо хочеш запускати Yarn через Corepack без глобальної інсталяції:

```powershell
corepack yarn@1.22.22 --version
```

## 3. Clone репозиторію

### Варіант A: є доступ на запис у репозиторій

```powershell
git clone <REPO_URL>
Set-Location "C:\Users\MTsybulskyi\IdeaProjects\2026-fwdays-agentic-large-day01-hw"
```

### Варіант B: стандартний open-source flow через fork

1. Зроби fork на GitHub
2. Клонуй свій fork
3. Додай original repo як `upstream`

```powershell
git clone <YOUR_FORK_URL>
Set-Location "C:\Users\MTsybulskyi\IdeaProjects\2026-fwdays-agentic-large-day01-hw"
git remote add upstream <ORIGINAL_REPO_URL>
git remote -v
```

## 4. Встановлення залежностей

Із кореня репозиторію:

```powershell
corepack yarn@1.22.22 install
```

Якщо `yarn` вже встановлений глобально:

```powershell
yarn install
```

Нотатки:

- root `package.json` задає workspace-інсталяцію для всього монорепозиторію
- `excalidraw-app/start` сам виконує `yarn && vite`, але окремий `install` краще зробити явно, щоб швидше побачити проблеми
- якщо Windows блокує `corepack enable`, можна просто викликати `corepack yarn@1.22.22 ...` напряму

## 5. Environment variables

Dev server читає env із кореня репозиторію.

Базовий dev happy path уже описаний у `.env.development`. Для першого запуску окремий `.env.local` не обов’язковий.

Підтверджені важливі значення:

- `VITE_APP_PORT=3001`
- `VITE_APP_WS_SERVER_URL=http://localhost:3002`
- `VITE_APP_AI_BACKEND=http://localhost:3016`
- `VITE_APP_PLUS_APP=http://localhost:3000`

Що це означає practically:

- сам editor/app має стартувати без додаткових локальних сервісів
- collaboration, AI та деякі інтеграційні сценарії залежать від окремих backend endpoints
- для першого onboarding достатньо запустити app без підняття всіх допоміжних сервісів

Якщо потрібні локальні overrides, створи `.env.local` у корені репозиторію і не коміть його.

## 6. Перший запуск app

Запускати потрібно з кореня репозиторію.

Preferred:

```powershell
corepack yarn@1.22.22 start
```

Якщо `yarn` глобальний:

```powershell
yarn start
```

Очікувана поведінка:

- root script викликає `yarn --cwd ./excalidraw-app start`
- app-level script запускає `yarn && vite`
- Vite піднімає dev server і намагається відкрити браузер автоматично
- типовий URL: `http://localhost:3001`

Якщо браузер не відкрився автоматично:

```powershell
Start-Process "http://localhost:3001"
```

Якщо порт `3001` зайнятий, Vite може перейти на інший вільний порт. У такому випадку орієнтуйся на `Local:` URL у терміналі.

## 7. Швидка smoke-перевірка після запуску

Мінімальний чек після старту:

- app відкривається в браузері
- видно canvas і Excalidraw UI
- welcome screen / toolbar рендеряться
- немає фатального crash на bootstrap

Що може не працювати без додаткових сервісів:

- live collaboration через локальний Socket.IO server
- AI flows
- окремі інтеграції Excalidraw+

Це нормально для першого onboarding.

## 8. Корисні root-команди

Основні команди з кореня репозиторію:

```powershell
yarn start
yarn build
yarn build:packages
yarn test:app
yarn test:app --watch=false
yarn test:typecheck
yarn test:code
yarn test:other
yarn test:coverage
yarn test:all
yarn fix
```

Що вони роблять:

- `yarn start` — запускає hosted app у dev режимі
- `yarn build` — білдить app
- `yarn build:packages` — білдить workspace packages
- `yarn test:app` — запускає Vitest
- `yarn test:typecheck` — запускає `tsc`
- `yarn test:code` — запускає ESLint
- `yarn test:other` — перевіряє форматування через Prettier list-different
- `yarn test:coverage` — запускає тести з coverage
- `yarn test:all` — повний локальний прогін основних перевірок
- `yarn fix` — Prettier write + ESLint fix

## 9. Як орієнтуватися в робочому циклі

### Якщо змінюєш hosted app

Найчастіше працюєш у:

- `excalidraw-app/*`
- інколи в `packages/excalidraw/*`
- інколи в shared packages (`packages/common`, `packages/element`, `packages/math`, `packages/utils`)

### Якщо змінюєш reusable editor/runtime

Працюєш у:

- `packages/excalidraw/*`
- залежно від задачі — також у `packages/element/*`, `packages/common/*`, `packages/math/*`

### Якщо хочеш перевірити production-like output локально

```powershell
yarn build
Set-Location ".\excalidraw-app"
yarn start:production
```

Або preview build:

```powershell
Set-Location ".\excalidraw-app"
yarn build:preview
```

## 10. Створи робочу гілку

Перед змінами онови базову гілку і створи feature branch.

Якщо працюєш через fork:

```powershell
git fetch upstream
git checkout master
git merge upstream/master
git checkout -b docs/dev-setup
```

Якщо працюєш напряму з origin:

```powershell
git fetch origin
git checkout master
git pull --ff-only origin master
git checkout -b docs/dev-setup
```

Порада: називай гілки коротко і по суті, наприклад:

- `docs/dev-setup`
- `fix/share-dialog-copy`
- `feat/library-import`

## 11. Зроби першу зміну

Рекомендований мінімальний workflow:

1. внеси зміну
2. перевір app локально
3. прогони потрібні тести
4. подивись diff

Корисні команди:

```powershell
git status
git --no-pager diff
```

## 12. Локальні перевірки перед PR

Мінімум перед PR:

```powershell
yarn test:app --watch=false
yarn test:typecheck
yarn test:code
yarn test:other
```

Якщо зміна суттєва або торкається кількох пакетів:

```powershell
yarn test:all
```

Що важливо знати про CI:

- PR workflow запускає linting/typecheck/format checks
- окремо є coverage workflow
- semantic PR title перевіряється окремим workflow
- CI використовує Node `20.x`

Отже, локально найкраще теж сидіти на Node 20.

## 13. Commit

Після перевірок:

```powershell
git add .
git commit -m "docs: add developer onboarding guide"
```

Для цього репозиторію semantic PR title явно перевіряється в GitHub Actions. Тому зручно одразу дотримуватись схожого стилю і для commit/branch naming.

Приклади нормальних формулювань:

- `docs: add dev setup guide`
- `fix: handle share dialog edge case`
- `feat: add onboarding note for Windows`

## 14. Push

Для fork workflow:

```powershell
git push -u origin docs/dev-setup
```

Для direct branch workflow:

```powershell
git push -u origin docs/dev-setup
```

## 15. Відкрий перший PR

На GitHub створи PR у `master`.

Що видно з репозиторію:

- існує PR template: `.github/PULL_REQUEST_TEMPLATE.md`
- є semantic PR title check
- є lint/test/coverage workflows

### Як назвати PR

Використовуй semantic title, наприклад:

- `docs: add developer setup guide`
- `fix: update onboarding command examples`
- `feat: document local collaboration prerequisites`

### Що заповнити в PR

PR template у цьому workspace орієнтований на workshop assignment і містить checklist по документації, зокрема:

- `docs/memory/projectbrief.md`
- `docs/memory/techContext.md`
- `docs/memory/systemPatterns.md`
- `docs/technical/architecture.md`
- `docs/product/domain-glossary.md`
- `docs/product/PRD.md`
- bonus: `docs/technical/dev-setup.md`

Тобто для цього конкретного репозиторію нормальний перший PR може бути саме documentation-oriented.

## 16. Після відкриття PR

Типовий цикл:

1. дочекайся CI
2. виправ зауваження рев’ю або падіння перевірок
3. допуш зміни в ту ж гілку
4. переконайся, що PR title лишився semantic

Корисні команди для оновлення гілки:

```powershell
git fetch origin
git status
```

Якщо треба підтягнути актуальний `master`:

```powershell
git fetch upstream
git merge upstream/master
```

або, якщо без fork:

```powershell
git fetch origin
git merge origin/master
```

## 17. Troubleshooting

### `yarn` не знайдений

Використай Corepack напряму:

```powershell
corepack yarn@1.22.22 install
corepack yarn@1.22.22 start
```

### App не відкрився в браузері

Відкрий URL вручну:

```powershell
Start-Process "http://localhost:3001"
```

### Порт `3001` зайнятий

Перевір хто слухає порт:

```powershell
cmd /c "netstat -ano | findstr :3001"
```

Потім дивись фактичний `Local:` URL у Vite output.

### Треба зупинити dev server

Якщо процес у поточному вікні:

```powershell
# натисни Ctrl+C
```

Якщо треба завершити node-процес вручну:

```powershell
Get-Process node
Stop-Process -Id <PID> -Force
```

### Падають collaboration або AI фічі локально

Це перше місце для перевірки:

- `.env.development`
- чи піднятий Socket.IO collaboration backend
- чи доступний AI backend

Базовий editor onboarding не вимагає, щоб ці сервіси працювали локально.

## 18. Recommended first-day checklist

- [ ] Встановлено Node 20
- [ ] Працює `yarn install`
- [ ] Працює `yarn start`
- [ ] App відкривається локально
- [ ] Зрозуміло, де hosted app, а де reusable packages
- [ ] Створено окрему git-гілку
- [ ] Перед змінами прогнано хоча б `yarn test:app --watch=false`
- [ ] Перед PR прогнано `yarn test:typecheck`, `yarn test:code`, `yarn test:other`
- [ ] PR має semantic title
- [ ] PR опис заповнений по шаблону

## 19. Source files used

Цей документ зібраний на основі:

- `package.json`
- `excalidraw-app/package.json`
- `.env.development`
- `excalidraw-app/vite.config.mts`
- `vitest.config.mts`
- `.github/PULL_REQUEST_TEMPLATE.md`
- `.github/workflows/lint.yml`
- `.github/workflows/test.yml`
- `.github/workflows/test-coverage-pr.yml`
- `.github/workflows/semantic-pr-title.yml`
- `.github/skills/run-app-windows/SKILL.md`
- `docs/memory/techContext.md`

