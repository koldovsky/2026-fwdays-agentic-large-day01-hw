# Active context — поточний фокус

## Пов’язана документація

- **Технічна** ([`docs/technical/`](../technical/)): [architecture.md](../technical/architecture.md) · [dev-setup.md](../technical/dev-setup.md)
- **Продуктова** ([`docs/product/`](../product/)): [PRD.md](../product/PRD.md) · [domain-glossary.md](../product/domain-glossary.md)

Знімок **навіщо зараз працюють** у цьому клоні та **де шукати відповіді в коді**. Узгоджено з `.github/PULL_REQUEST_TEMPLATE.md`, наявними файлами в `docs/` і точками входу в репозиторії.

---

## Основний фокус (навчальний контекст)

- **Завдання Day 1 воркшопу** — підготувати артефакти для PR за чеклистом у `.github/PULL_REQUEST_TEMPLATE.md` (Memory Bank, технічна/продуктова документація).
- **Продуктова кодова база** — форк/клон **Excalidraw** як монорепо `excalidraw-monorepo` (`package.json`: `name`, `workspaces`).
- **Паралельна мета** — зрозуміти великий OSS-проєкт: де UI, де дані, де колаб, як зібрати й протестувати (деталі в розділі «Пов’язана документація» вище та в [projectbrief.md](./projectbrief.md), [techContext.md](./techContext.md), [systemPatterns.md](./systemPatterns.md)).

---

## Стан артефактів (верифіковано файловою системою)

### Уже присутні в `docs/memory/`

- `projectbrief.md` — короткий опис проєкту та структури workspaces.
- `techContext.md` — стек, версії, команди з маніфестів і конфігів.
- `systemPatterns.md` — шари пакетів, `App`, `ActionManager`, `Scene` / `Store` / `History`.
- `productContext.md` — UX-цілі та сценарії з прив’язкою до `excalidraw-app` (бонусний пункт чеклиста).
- `progress.md` — статус артефактів чеклиста та знімок тестів.
- `decisionLog.md` — журнал рішень (бонус Memory Bank).

### Документація поза `docs/memory/` (обов’язкові пункти чеклиста)

- `docs/technical/architecture.md` — **є** (архітектура, data flow, рендер-пайплайн).
- `docs/technical/dev-setup.md` — **є** (локальне середовище, перші кроки).
- `docs/product/domain-glossary.md` — **є** (доменний словник).
- `docs/product/PRD.md` — **є** ([PRD.md](../product/PRD.md)).

### Інше з чеклиста (корінь репо)

- `.cursorignore` — **є** у корені репозиторію (правила ігнорування для інструментів).

### Бонусні файли Memory Bank (за шаблоном PR)

- `activeContext.md` — цей файл.
- `progress.md`, `decisionLog.md` — **є** у `docs/memory/`.
- Опційно: документування 3+ undocumented behaviors (див. [decisionLog.md](./decisionLog.md)).

---

## Де «живе» робота в коді (орієнтири)

### Застосунок (продуктова оболонка)

- **Вхід:** `excalidraw-app/index.tsx` — `registerSW()` (PWA), side-effect import `../excalidraw-app/sentry`, рендер `<ExcalidrawApp />`.
- **Композиція продукту:** `excalidraw-app/App.tsx` — імпорт `Excalidraw`, `ExcalidrawAPIProvider`, `reconcileElements`, `CaptureUpdateAction` з `@excalidraw/excalidraw`; колаб, сцена, експорт, AI-тригери (`TTDDialogTrigger` тощо).

### Публічна бібліотека редактора

- **Експорт пакета:** `packages/excalidraw/index.tsx` — обгортка `<Excalidraw>`, `EditorJotaiProvider`, `polyfill`, меню / welcome з пакета.
- **Ядро життєвого циклу:** `packages/excalidraw/components/App.tsx` (клас `App`) — узгоджено з описом у `systemPatterns.md`.

### Пакети домену

- `@excalidraw/common`, `math`, `element`, `utils` — під `packages/*` (залежності й ролі — у `systemPatterns.md`).

---

## Команди, релевантні для «перевірити, що все збирається»

З кореневого `package.json` → `scripts`:

- **Dev:** `yarn start` — запуск `excalidraw-app` через Vite.
- **Збірка пакетів + приклад:** `yarn start:example` — `build:packages` + старт `examples/with-script-in-browser`.
- **Якість:** `yarn test:all` — typecheck, ESLint, Prettier, Vitest без watch.

---

## Що логічно робити далі (пріоритет за чеклистом)

1. За бажанням — розширити або оновити [PRD](../product/PRD.md) / [dev-setup](../technical/dev-setup.md) під зміни в репо.
2. За бажанням — документувати додаткові неочевидні поведінки (пор. [decisionLog.md](./decisionLog.md)).

---

## Обмеження цього документа

- **Призначення:** швидкий «де ми зараз» для агента або людини в контексті воркшопу, не дублікат повного стеку чи архітектури.
- **Оновлювати:** після зміни чеклиста PR або коли з’являються нові обов’язкові файли в `docs/`.

---

## Джерела для верифікації

| Що перевірено | Файл / місце |
|---------------|----------------|
| Чеклист і бонус Memory Bank | `.github/PULL_REQUEST_TEMPLATE.md` |
| Назва монорепо, workspaces, скрипти | Кореневий `package.json` |
| Точка входу застосунку | `excalidraw-app/index.tsx` |
| Інтеграція з `@excalidraw/excalidraw` | `excalidraw-app/App.tsx` (імпорти на початку файлу) |
| Публічний API пакета редактора | `packages/excalidraw/index.tsx` |
| Наявність `docs/technical/`, `docs/product/` | перелік `docs/**/*.md` у робочій копії |
