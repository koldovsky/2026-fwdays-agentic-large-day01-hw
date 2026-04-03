# Active Context

## Поточний фокус

**Контекст:** fwdays 2026 — Agentic IDE Workshop, Day 1 homework
**Учасник:** Anatoliy Huts
**Репозиторій:** форк Excalidraw, використовується як навчальний полігон

Завдання — дослідити великий реальний open-source проєкт за допомогою AI-агентів
і зафіксувати знання у структурованих документах (Memory Bank + Docs).

---

## Статус завдань

### Обов'язкові (required for PR grading)

| Файл | Статус | Примітка |
|---|---|---|
| `.cursorignore` | ✅ done | Build artifacts, бінарні шрифти, wasm, repomix-output.xml |
| `docs/memory/projectbrief.md` | ✅ done | Мета, API, структура монорепо |
| `docs/memory/techContext.md` | ✅ done | Стек, версії, команди, конфіги |
| `docs/memory/systemPatterns.md` | ✅ done | Архітектура, патерни, component tree |
| `docs/technical/architecture.md` | ✅ done | Mermaid діаграми, data flow, rendering |
| `docs/product/domain-glossary.md` | ✅ done | 11 термінів з source code |
| `docs/product/PRD.md` | ❌ pending | **Наступний пріоритет** |

### Бонусні

| Файл | Статус |
|---|---|
| `docs/memory/productContext.md` | ✅ done |
| `docs/memory/activeContext.md` | ✅ done (цей файл) |
| `docs/technical/undocumented-behavior.md` | ✅ done |
| `docs/memory/progress.md` | ❌ not started |
| `docs/memory/decisionLog.md` | ❌ not started |
| `docs/technical/dev-setup.md` | ❌ not started |

---

## Наступний крок

**Створити `docs/product/PRD.md`** — reverse-engineered PRD для Excalidraw.

Вимоги CodeRabbit (`.coderabbit.yaml`):
- Product Purpose (2–3 речення)
- Target Audience
- Key Features (мінімум 5)
- Non-goals / Constraints
- 50–300 рядків

---

## Що вже зроблено в цій сесії

1. `.cursorignore` — виключає build artifacts, `repomix-output.xml` (9.7MB), бінарні шрифти/wasm
2. `docs/memory/` — 4 файли Memory Bank (projectbrief, techContext, systemPatterns, productContext)
3. `docs/technical/architecture.md` — 369 рядків, 5 секцій з mermaid діаграмами
4. `docs/product/domain-glossary.md` — 11 термінів (ExcalidrawElement, Scene, AppState, Tool, Action, Collaboration, Library, Frame, Store/StoreDelta, BinaryFiles, Binding, Group)
5. `docs/technical/undocumented-behavior.md` — 4 implicit state machines, 7 side effects, 4 init-order deps, 13 known bugs

---

## Грейдинг (CodeRabbit)

Автоматичний review через `.coderabbit.yaml` на PR у гілку `master`.
Перевіряє:
- Наявність `.cursorignore` з ≥5 патернами
- Всі 3 core Memory Bank файли (≥20 рядків кожен)
- `docs/technical/architecture.md` (100–700 рядків, ≥3 секції)
- `docs/product/domain-glossary.md` (≥5 термінів)
- `docs/product/PRD.md` (50–300 рядків, ≥3 секції)

---

## See also

| Документ | Що містить |
|---|---|
| [`docs/memory/projectbrief.md`](./projectbrief.md) | Мета проєкту, публічне API |
| [`docs/memory/techContext.md`](./techContext.md) | Стек, команди |
| [`docs/memory/systemPatterns.md`](./systemPatterns.md) | Архітектура |
| [`docs/memory/productContext.md`](./productContext.md) | UX goals, сценарії |
| [`docs/technical/architecture.md`](../technical/architecture.md) | Детальна архітектура |
| [`docs/product/domain-glossary.md`](../product/domain-glossary.md) | Словник термінів |
