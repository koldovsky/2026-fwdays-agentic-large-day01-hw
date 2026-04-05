# Excalidraw: Active Context

## Details

For branch progress timeline -> see `docs/memory/progress.md`  
For product context -> see `docs/memory/productContext.md`  
For product requirements -> see `docs/product/PRD.md`

## Current Focus

- Закрити воркшопний контур документації: memory + technical + product.
- Підтримувати узгодженість між короткими memory-доками та деталізованими product/technical документами.
- Підготувати чистий стан для фінального PR (структура, посилання, consistency).

## Recently Completed

- Створено `docs/memory/productContext.md` і додано зв'язок з `docs/product/PRD.md`.
- Створено `docs/technical/dev-setup.md` (onboarding від clone до first PR).
- Створено `docs/product/PRD.md` (reverse-engineered PRD з key features і constraints).
- Створено `docs/memory/progress.md` із хронологією задач і комітів по гілці.
- Раніше зафіксовано `docs/memory/decisionLog.md` із documented/inferred рішеннями та undocumented behaviors.

## In Progress

- Відкритих in-progress задач по документації зараз немає.

## Open Questions

- Чи деталізувати в `docs/product/PRD.md` acceptance criteria для ключових сценаріїв.
- Чи додавати додаткові user journeys/metrics у product docs, чи залишити поточний рівень деталізації.

## Risks / Constraints

- Technical/Product документи мають залишатись source-backed і без вигаданих фіч.
- Memory-документи повинні лишатись короткими: деталі переносити у `docs/product/*` та `docs/technical/*`.
- Межа app vs library має бути чіткою в кожному документі, щоб уникати хибних очікувань щодо npm API.

## Next Actions

- Підготувати фінальний опис PR (коротко: що додано в memory/product/technical docs).
- За потреби додати дрібні редакторські правки в формулювання перед merge.
- Підтримувати узгодженість між `docs/memory/productContext.md` і `docs/product/PRD.md` при наступних змінах.

## Closed Next Actions

- Перевірено міждокументні посилання (`memory` -> `product`/`technical`): усі цільові файли на місці.
- Пройдено PR checklist і співставлено артефакти з пунктами завдання (core + bonus docs покриті).
