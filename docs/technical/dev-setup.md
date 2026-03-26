# Developer Setup and Onboarding

Цей документ описує практичний шлях для нового розробника: від першого `git clone` до відкриття першого Pull Request у репозиторій.

---

## 1. Prerequisites

Перед стартом переконайтесь, що встановлено:

- Git (2.40+)
- Node.js LTS (рекомендовано 20.x)
- Yarn Classic (1.22.x)
- Сучасний браузер (Chrome/Edge/Firefox)
- Редактор: Cursor або VS Code

Перевірка версій:

```bash
git --version
node --version
yarn --version
```

---

## 2. Clone Repository

1. Клонуйте репозиторій:

```bash
git clone <REPO_URL>
cd 2026-fwdays-agentic-large-day01-hw
```

2. Перевірте, що ви на правильній гілці (зазвичай `main`):

```bash
git branch --show-current
git pull
```

---

## 3. Install Dependencies

Встановіть залежності у корені монорепозиторію:

```bash
yarn install
```

Після завершення перевірте, що lock-файл не змінився неочікувано:

```bash
git status
```

---

## 4. Run Project Locally

### Основний варіант (app)

```bash
yarn start
```

### Альтернативно (якщо у проєкті використовується інший скрипт)

```bash
yarn dev
```

Якщо команда не знайдена, перевірте доступні скрипти:

```bash
yarn run
```

---

## 5. Validate Before Coding

Перед внесенням змін бажано переконатися, що базова гілка "зелена":

```bash
yarn lint
yarn test
yarn typecheck
```

> Якщо у репозиторії немає окремого скрипта, пропустіть цей крок або виконайте доступні перевірки з `yarn run`.

---

## 6. Create Feature Branch

Працюйте лише у feature-гілці:

```bash
git checkout -b feat/<short-description>
```

Приклади:

- `feat/add-dev-setup-doc`
- `fix/correct-export-hotkey`
- `docs/update-architecture-notes`

---

## 7. Implement Changes

Рекомендований робочий цикл:

1. Зробіть мінімальні цільові зміни.
2. Запустіть локальні перевірки (`lint`, `test`, `typecheck`).
3. Переконайтесь, що не зачепили нерелевантні файли.

Перевірка змін:

```bash
git status
git diff
```

---

## 8. Commit Changes

1. Додайте потрібні файли:

```bash
git add <path1> <path2>
```

2. Створіть зрозумілий коміт у стилі Conventional Commits:

```bash
git commit -m "docs: add developer onboarding guide"
```

Приклади:

- `feat: add export validation for image elements`
- `fix: prevent null scene crash on initial load`
- `docs: update architecture diagram notes`

---

## 9. Push and Open Pull Request

1. Запуште гілку:

```bash
git push -u origin HEAD
```

2. Створіть PR через GitHub UI або CLI:

```bash
gh pr create --fill
```

3. Заповніть PR за шаблоном репозиторію (`.github/PULL_REQUEST_TEMPLATE.md`):

- що змінено
- чому це потрібно
- як перевірити
- ризики/обмеження

---

## 10. PR Checklist (Recommended)

Перед відправкою на review:

- [ ] Код/доки збираються та запускаються локально
- [ ] Пройшли `lint` і `test` (якщо застосовно)
- [ ] Немає випадкових змін у сторонніх файлах
- [ ] Опис PR містить тест-план
- [ ] У PR невеликий та зрозумілий scope

---

## 11. Typical Issues and Quick Fixes

- **`yarn` не знайдено**
  - Встановіть Yarn Classic глобально: `npm i -g yarn@1`
- **Конфлікти після `git pull`**
  - Зробіть rebase на актуальний `main` та розв'яжіть конфлікти локально
- **Падає lint/test на "чистій" гілці**
  - Зафіксуйте версії Node/Yarn, перевстановіть залежності, перевірте локальні зміни
- **Великий PR складно рев'юити**
  - Розбийте на кілька менших PR із чітким призначенням

---

## 12. Definition of Done for First PR

Онбординг вважається завершеним, якщо:

1. Репозиторій клоновано та залежності встановлено без помилок.
2. Проєкт запускається локально.
3. Створено feature-гілку та зроблено мінімальну осмислену зміну.
4. Відкрито PR з коректним описом і test plan.
5. Отримано перший review feedback.
