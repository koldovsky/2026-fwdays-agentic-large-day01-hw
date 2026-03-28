# Dev setup — онбординг від клону до першого PR

Повний гайд для роботи з цим monorepo (форк Excalidraw) локально, перевірки якості та сабміту домашнього завдання з перевіркою **CodeRabbit**. Доповнює [architecture.md](./architecture.md) практичними кроками.

---

## 1. Передумови

- **Node.js** `>=18` (див. `engines` у кореневому `package.json`).
- **Yarn Classic 1.x** — у репозиторії зафіксовано `packageManager: yarn@1.22.22`; не змішуйте з npm/pnpm без крайньої потреби.
- Обліковий запис **GitHub** з доступом до форку (куди пушитимете гілку).
- Редактор з підтримкою Markdown (наприклад **Cursor** / VS Code) для роботи з `docs/`.

---

## 2. Форк і клон

1. На GitHub зробіть **Fork** апстрим-репозиторію (або використайте вже виданий форк для воркшопу).
2. Клонуйте **свій** форк:

```bash
git clone git@github.com:<your-username>/<your-fork>.git
cd <your-fork>
```

3. (Опційно) Додайте `upstream` для подальшої синхронізації:

```bash
git remote add upstream <url-оригінального-excalidraw-або-курсу>
```

---

## 3. Встановлення залежностей

З **кореня** monorepo:

```bash
yarn install
```

Це підтягне залежності для workspace: `excalidraw-app`, `packages/*`, `examples/*`.

**Важливо:** скрипт `yarn start` у **`excalidraw-app/package.json`** виглядає як `yarn && vite` — тобто при кожному запуску з каталогу app знову виконується `yarn`. З кореня зазвичай достатньо одного `yarn install`, далі `yarn start` з кореня (див. нижче).

---

## 4. Збірка пакетів редактора

Якщо змінюєте код у `packages/excalidraw` і додаток споживає зібрані артефакти, з кореня:

```bash
yarn build:packages
```

Або повна послідовність окремих пакетів:

```bash
yarn build:common && yarn build:math && yarn build:element && yarn build:excalidraw
```

Для щоденної розробки UI часто достатньо попередньої збірки або workflow з репозиторію курсу.

---

## 5. Локальний дев-сервер (повний додаток)

З **кореня**:

```bash
yarn start
```

Це викличе `yarn --cwd ./excalidraw-app start` → Vite dev server для `excalidraw-app`.

Відкрийте URL з виводу Vite. Порт задається `VITE_APP_PORT` у `.env` кореня або **3000** за замовчуванням (`excalidraw-app/vite.config.mts`).

---

## 6. Тести, лінт і форматування

Перед PR бажано прогнати:

```bash
yarn test:typecheck   # TypeScript
yarn test:code        # ESLint
yarn test:other       # Prettier --list-different по markdown/css/json/...
yarn test:app         # Vitest
```

Або все разом:

```bash
yarn test:all
```

Автофікс де можливо:

```bash
yarn fix
```

---

## 7. Документація воркшопу (Day 1)

Переконайтеся, що в PR потрапляють файли з чеклиста `.github/PULL_REQUEST_TEMPLATE.md`:

| Область | Шляхи |
|--------|--------|
| Memory Bank | `docs/memory/projectbrief.md`, `techContext.md`, `systemPatterns.md` + бонусні |
| Технічна | `docs/technical/architecture.md`, **цей файл** `dev-setup.md` |
| Продукт | `docs/product/PRD.md`, `domain-glossary.md` |
| Cursor | `.cursorignore` у корені |

Орієнтири для **CodeRabbit** описані в `.coderabbit.yaml` (мова рев’ю, перевірки на непорожні секції, довжина `architecture.md` тощо).

---

## 8. Гілка, коміт і push

1. Створіть гілку від актуального `master` / `main`:

```bash
git checkout -b day1-workshop-assignment
```

2. Додайте зміни та закомітьте змістовним повідомленням (українською або англійською):

```bash
git add docs/ .cursorignore
git status
git commit -m "docs: Day 1 workshop — Memory Bank, architecture, PRD, dev-setup"
```

3. Відправте на GitHub:

```bash
git push -u origin day1-workshop-assignment
```

---

## 9. Перший Pull Request

1. У веб-інтерфейсі GitHub натисніть **Compare & pull request**.
2. **Заголовок** (рекомендація `.coderabbit.yaml`):  
   `Day 1: <Ваше ім’я> — Workshop Assignment`
3. У описі вставте шаблон з `.github/PULL_REQUEST_TEMPLATE.md` і проставте галочки в чеклисті.
4. Переконайтеся, що base repository — правильний (форк курсу / вашого ментора).
5. Після створення PR зачекайте на **coderabbitai** — виправте зауваження або додайте коментарі, якщо щось трактується помилково.

---

## 10. Перевірка, що AI використовує документацію

Завдання воркшопу: переконатися, що агент у новій сесії спирається на `docs/`, а не галюцинує.

1. Відкрийте проєкт у **Cursor** (або іншому Agentic IDE).
2. Почніть **новий чат** без зайвого контексту з попередніх гілок.
3. Поставте питання з явною прив’язкою до репо, наприклад:
   - «Які команди з кореня запускають дев-сервер і повний typecheck?»
   - «Де в коді описаний `AppState` і де дефолтний стан?»
   - «Як у цьому monorepo пов’язані `staticScene` і `interactiveScene`?»
4. Перевірте відповідь:
   - чи збігаються команди з [techContext.md](../memory/techContext.md) та `package.json`;
   - чи шляхи файлів відповідають [architecture.md](./architecture.md) та [systemPatterns.md](../memory/systemPatterns.md).

Якщо агент помиляється — уточніть запит («відповідай лише згідно з `docs/technical/architecture.md`») або додайте файли в контекст вручну (@ mention у Cursor).

---

## Пов’язані документи

- [Архітектура](./architecture.md)
- Memory Bank: [techContext.md](../memory/techContext.md), [systemPatterns.md](../memory/systemPatterns.md)
- Продукт: [PRD.md](../product/PRD.md), [domain-glossary.md](../product/domain-glossary.md)
