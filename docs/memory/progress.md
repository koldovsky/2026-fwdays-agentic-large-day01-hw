# Progress

## Зроблено

### Документація
- [x] `docs/memory/projectbrief.md` — огляд проєкту, структура монорепо, аудиторія
- [x] `docs/memory/systemPatterns.md` — 10 архітектурних патернів з прикладами коду
- [x] `docs/memory/techContext.md` — стек, залежності, команди, CI/CD, deployment
- [x] `docs/product/domain-glossary.md` — 13 термінів домену з прикладами і застереженнями
- [x] `docs/memory/productContext.md` — product vision, UX-принципи, аудиторія
- [x] `docs/memory/activeContext.md` — поточний контекст роботи
- [x] `docs/memory/progress.md` — цей файл
- [x] `docs/memory/decisionLog.md` — архітектурні рішення
- [x] `docs/technical/architecture.md` — повна технічна архітектура з Mermaid-діаграмою
- [x] `docs/technical/undocumented-behaviors.md` — приховані баги, HACK/FIXME, side effects

### Дослідження кодбейсу
- [x] Структура монорепо і залежності між пакетами
- [x] Компонентне дерево (`<Excalidraw>` → `<App>` → `<LayerUI>` → canvas)
- [x] Action System (Command Pattern, ~50 actions)
- [x] Dual canvas rendering pipeline
- [x] Store → History delta pipeline
- [x] Implicit state machines в ініціалізації
- [x] HACK/FIXME/TODO аналіз (~80+ коментарів)

## В процесі

- [ ] Воркшоп-завдання (деталі уточнюються)

## Не досліджено

- [ ] Collab reconciliation детально (conflict resolution між учасниками)
- [ ] Font subsetting (`packages/excalidraw/subset/`)
- [ ] Lasso selection implementation (`packages/excalidraw/lasso/`)
- [ ] Elbow arrow routing (`packages/element/src/elbowArrow.ts`)
- [ ] AI/TTD (text-to-diagram) flow (`excalidraw-app/` + AI backend)
- [ ] Export pipeline (PNG, SVG, JSON) в деталях
- [ ] IndexedDB persistence layer (`excalidraw-app/data/`)

---

## Дивись також

- [Active Context](./activeContext.md) — поточний фокус та відомі обмеження
