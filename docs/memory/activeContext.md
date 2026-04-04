# Active Context — Excalidraw Workshop

Верифіковано з: `.coderabbit.yaml`, `docs/decisionLog.md`, git status,
`docs/memory/projectbrief.md`, `.cursorignore`.

---

## Поточна ситуація

Це **навчальний форк Excalidraw** для воркшопу **fwdays 2026 «Agentic IDE, День 1»**.
Учасник виконує домашні завдання кроками; CodeRabbit автоматично перевіряє PR.

**Дата останнього запису:** 2026-04-04

---

## Прогрес завдань

### Крок 2 — `.cursorignore` ✅ Виконано

Файл `.cursorignore` створено в корені репозиторію (git status: untracked → готовий до коміту).

**Що включено:**
- Build artifacts: `node_modules/`, `dist/`, `build/`, `dev-dist/`, `coverage/`
- Lock files: `yarn.lock`, `package-lock.json`
- Generated WASM: `packages/excalidraw/subset/woff2/woff2-wasm.ts`, `harfbuzz-wasm.ts`
- Auto-generated fonts: `packages/excalidraw/fonts/**/*.woff2`
- Snapshots: `**/__snapshots__/`, `**/*.snap`
- IDE/OS: `.DS_Store`, `.idea/`, `.vscode/`, `.vercel/`

**CodeRabbit перевіряє:** ≥5 значущих патернів, source code НЕ виключений.

---

### Крок 4 — Memory Bank ✅ Виконано (частково в роботі)

Усі три обов'язкових файли створено в `docs/memory/`:

| Файл | Рядків | Статус |
|------|--------|--------|
| `projectbrief.md` | 85 | ✅ |
| `techContext.md` | 191 | ✅ |
| `systemPatterns.md` | 198 | ✅ |

**Додаткові файли** (понад вимоги CodeRabbit):

| Файл | Рядків | Статус |
|------|--------|--------|
| `productContext.md` | ~175 | ✅ щойно створено |
| `activeContext.md` | цей файл | ✅ щойно створено |
| `decisionLog.md` | 113 | ✅ |

**CodeRabbit перевіряє** (`docs/memory/projectbrief.md`, `techContext.md`, `systemPatterns.md`):
- Кожен файл ≥ 20 рядків, має заголовки + bullet points
- Факти верифіковані проти source code
- Розмір ≤ 200 рядків кожен

---

### Крок 5 — Technical & Product Docs ❌ Ще не виконано

Необхідні файли (per `.coderabbit.yaml` pre-merge checks):

| Файл | Вимога | Статус |
|------|--------|--------|
| `docs/technical/architecture.md` | 100–700 рядків, 3+ секції | ❌ відсутній |
| `docs/product/domain-glossary.md` | ≥5 термінів з визначеннями | ❌ відсутній |
| `docs/product/PRD.md` | 50–300 рядків, 3+ секції | ❌ відсутній |

**Що потрібно для `architecture.md`:**
- High-level Architecture (бажано Mermaid-діаграма)
- Data Flow (action → ActionResult → syncActionResult)
- State Management (AppState + Scene поза React)
- Rendering Pipeline (StaticCanvas + InteractiveCanvas)
- Package Dependencies (@excalidraw/* взаємозв'язки)

**Що потрібно для `domain-glossary.md`** (обов'язкові терміни):
- `Element`, `Scene`, `AppState`, `ExcalidrawElement`, `Tool`, `Action`
- Бажані: `Collaboration`, `Library`, `Bound Element`, `Linear Element`

**Що потрібно для `PRD.md`:**
- Product Purpose, Target Audience, Key Features (≥5), Non-goals

---

## Поточний git стан

```
## master...origin/master
 M yarn.lock          ← зміна пакетного менеджера (не критично)
?? .cursorignore      ← Крок 2: готово, не закомічено
?? docs/              ← Кроки 4-5: файли готові, не закомічені
?? repomix-compressed.txt  ← побічний файл (не потрібен у PR)
```

**Перед відкриттям PR:**
- [ ] Завершити Крок 5 (три файли вище)
- [ ] `git add .cursorignore docs/` (не додавати `repomix-compressed.txt`)
- [ ] PR title: `"Day 1: <ім'я> — Workshop Assignment"` (вимога CodeRabbit)

---

## Ключові архітектурні рішення (з decisionLog.md)

**Досліджено:** `packages/excalidraw/components/App.tsx` (~12 800 рядків, 2026-04-04)

- `App` — React **class component** з `this.state: AppState` (~560 полів)
- `this.setState` викликається 218 раз; `withBatchedUpdates` — 27 разів
- **Scene (елементи) поза React state** — `this.scene.replaceAllElements(...)`
- 9 важких об'єктів як поля класу: `Scene`, `Store`, `History`, `Renderer`, `Fonts`, `Library`, `ActionManager`, `BinaryFiles`, `imageCache`
- 37 реєстрацій `addEventListener`; всі очищуються через `onRemoveEventListenersEmitter`
- 3 emitter-и для lifecycle: `editor:mount`, `editor:initialize`, `editor:unmount`

---

## Наступні кроки (пріоритизовано)

1. **`docs/technical/architecture.md`** — найбільший за обсягом; почати з Mermaid C4 або flowchart
2. **`docs/product/domain-glossary.md`** — взяти терміни з `packages/excalidraw/types.ts` та `@excalidraw/element`
3. **`docs/product/PRD.md`** — reverse-engineer з `productContext.md` (вже є чернетка)
4. Відкрити PR на `master...origin/master` з title за форматом CodeRabbit

---

## Корисні команди для розробки

```bash
yarn start                    # dev-сервер (Vite HMR)
yarn test:typecheck            # перевірка типів перед комітом
yarn test:code                 # eslint
yarn fix                       # auto-fix prettier + eslint
```

---

## Ресурси для довідки

- `.coderabbit.yaml` — точні критерії оцінювання кожного кроку
- `docs/memory/systemPatterns.md` — архітектура редактора
- `docs/memory/techContext.md` — стек, команди, версії
- `packages/excalidraw/types.ts` — `AppState`, `ExcalidrawProps`, `Collaborator`
- `packages/excalidraw/actions/` — 36 action-файлів (весь функціонал редактора)

---

## Додаткова документація

For detailed architecture → see [docs/technical/architecture.md](../technical/architecture.md)
For domain glossary → see [docs/product/domain-glossary.md](../product/domain-glossary.md)
