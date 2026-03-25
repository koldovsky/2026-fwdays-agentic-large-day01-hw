# Active Context

## Поточний фокус

Воркшоп **fwdays 2026 — Agentic track, Day 01**.
Завдання: дослідити великий реальний open-source проєкт (Excalidraw) за допомогою AI-агента
та задокументувати його архітектуру.

## Що зроблено в цій сесії

- Досліджено структуру монорепо, пакети, залежності
- Створено `docs/technical/architecture.md` — повна архітектура з Mermaid-діаграмою,
  data flow, state management, rendering pipeline, package dependencies
- Створено `docs/technical/undocumented-behaviors.md` — implicit state machines,
  неочевидні side effects, HACK/FIXME/TODO з поясненнями

## Ключові файли для розуміння проєкту

```
docs/memory/projectbrief.md       ← що це і навіщо
docs/memory/systemPatterns.md     ← архітектурні патерни з кодом
docs/memory/techContext.md        ← стек, команди, CI/CD
docs/memory/productContext.md     ← product vision і UX-принципи
docs/product/domain-glossary.md   ← терміни: Scene, Store, Delta, Action...
docs/technical/architecture.md    ← технічна архітектура
docs/technical/undocumented-behaviors.md ← приховані баги і side effects
```

## Де починати, якщо треба щось змінити

| Задача | Де дивитись |
|---|---|
| Новий тип елемента | `packages/element/src/types.ts` |
| Нова дія (Action) | `packages/excalidraw/actions/` |
| Зміна UI | `packages/excalidraw/components/LayerUI.tsx` |
| Зміна canvas рендерингу | `packages/excalidraw/renderer/` |
| Колаборація | `excalidraw-app/collab/` |
| Публічний API пакету | `packages/excalidraw/index.tsx` |

## Відомі обмеження поточного стану

- `isSomeElementSelected` — глобальний кеш ламається при кількох інстанціях (FIXME)
- `History` ініціалізується двічі в конструкторі `App` (артефакт рефакторингу)
- `UIOptions` завжди створює новий об'єкт → `React.memo` не працює для `<Excalidraw>`

---

## Дивись також

- [Progress](./progress.md) — чеклист виконаного та залишеного
- [Undocumented Behaviors](../technical/undocumented-behaviors.md) — знайдені side effects та баги
