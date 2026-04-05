# Excalidraw: Progress

## Details

For high-level project scope -> see `docs/memory/projectbrief.md`  
For product context -> see `docs/memory/productContext.md`  
For technical setup -> see `docs/technical/dev-setup.md`

## База завдання (орієнтир)

- Завершити Memory Bank (`productContext.md`, `activeContext.md`, `progress.md`, `decisionLog.md`).
- Розширити Technical Docs через `docs/technical/dev-setup.md`.
- Згенерувати reverse-engineered PRD у `docs/product/PRD.md`.
- Задокументувати 3+ приклади undocumented behavior у `docs/memory/decisionLog.md`.

## Додатково виконано (поза базою завдання)

- Базове налаштування репозиторію під роботу з великим monorepo:
  - кілька ітерацій ignore-правил (`a668e6b2`, `ee61f2b1`, `58282027`, `517bee04`).
- Підготовка dev-середовища:
  - вимкнення tracking/Sentry у development (`e59305ce`).
- Оновлення dependency lock-state:
  - синхронізація `yarn.lock` під `@excalidraw/mermaid-to-excalidraw@2.1.1` (`e398ea13`).
- Розширення документації, яке прямо не було в short-list:
  - `docs/technical/architecture.md` (`6a978c8f`),
  - `docs/product/domain-glossary.md` (`0ef05727`),
  - посилення `projectbrief` і стартового memory bank (`b0f34e8f`, `8224b812`).

## Поточний статус гілки

- Гілка: `workshop-03-24-practice`
- Стан відносно `workshop-remote/master`: серія task-oriented комітів із фокусом на docs/memory, product docs та базову підготовку репозиторію.

## Основні задачі, виконані в рамках гілки

### 1) Підготовка робочого середовища та шумозахисту

- `e398ea13` — синхронізовано `yarn.lock` з оновленою залежністю `@excalidraw/mermaid-to-excalidraw`.
- `e59305ce` — знижено dev-шум: вимкнено tracking/Sentry у development.
- `a668e6b2`, `ee61f2b1`, `58282027`, `517bee04` — доповнено/уточнено ignore-правила для build-артефактів, dump-файлів і великих ресурсів.

### 2) Створення memory bank (базовий контекст)

- `b0f34e8f` — додано стартовий memory bank.
- `8224b812` — посилено `projectbrief` (кращі зв'язки між контекстними документами).
- `6e905ec2` — задокументовано inferred ADRs і ризикові/неочевидні поведінки.

### 3) Технічна та продуктова документація

- `6a978c8f` — додано source-backed technical architecture reference.
- `0ef05727` — створено `docs/product/domain-glossary.md`.
- `8aaebf02` — створено `docs/memory/productContext.md` (UX-цілі, сценарії, межі app vs library).
- `ad6fd83f` — створено `docs/technical/dev-setup.md` (онбординг від clone до PR).
- `c1b63656` — створено `docs/product/PRD.md` + зв'язок із `productContext`.

## Ключові артефакти на виході

- Memory:
  - `docs/memory/projectbrief.md`
  - `docs/memory/techContext.md`
  - `docs/memory/systemPatterns.md`
  - `docs/memory/decisionLog.md`
  - `docs/memory/productContext.md`
- Technical/Product:
  - `docs/technical/architecture.md`
  - `docs/technical/dev-setup.md`
  - `docs/product/domain-glossary.md`
  - `docs/product/PRD.md`

## Поточний фокус і next steps

- Підтримувати узгодженість між `docs/memory/productContext.md` і `docs/product/PRD.md` при майбутніх змінах.
- За потреби деталізувати user journeys і acceptance criteria у product docs.
- Тримати memory-документи короткими, а глибоку деталізацію виносити у `docs/product/*` і `docs/technical/*`.

## Верифіковано по git history

- Дані в документі зібрані з commit history гілки `workshop-03-24-practice` відносно `workshop-remote/master`.
