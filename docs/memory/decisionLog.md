# Decision Log

Архітектурні рішення в Excalidraw — що зроблено, чому, і які trade-offs.

---

## ADR-001: App як class component

**Рішення:** Головний компонент `App` — `React.Component`, а не функціональний компонент.

**Чому:** `this.state` доступний синхронно всередині pointer event handlers без проблем
із stale closures. У функціональних компонентах `useState` у handlers захоплює значення
на момент рендеру — критична проблема для high-frequency подій (pointermove, pointerdown).

**Trade-off:** ~12 800 рядків в одному файлі, складний для навігації. Нові компоненти
пишуться як функціональні — `App` — виняток, а не правило.

**Файл:** `packages/excalidraw/components/App.tsx:617`

---

## ADR-002: Scene поза React state

**Рішення:** `Scene` живе як `this.scene` — instance-поле класу, а не в `this.state`.

**Чому:** Елементи сцени змінюються часто і незалежно від React life-cycle. Зберігання
в `this.state` викликало б зайві ре-рендери на кожну мутацію елемента. `Scene` емітує
власні події → `triggerRender()` перемальовує canvas без React diffing.

**Trade-off:** Елементи і `AppState` розсинхронізовані — треба явно передавати обидва
скрізь де потрібні. Три окремих джерела правди: `this.scene`, `this.state`, `this.files`.

**Файл:** `packages/element/src/Scene.ts`, `App.tsx:825`

---

## ADR-003: Dual canvas замість одного

**Рішення:** Два `<canvas>` елементи: static (елементи) та interactive (selection/handles).

**Чому:** Перемальовка всього canvas на кожен `pointermove` — дорого. Static canvas
перемальовується тільки при зміні елементів (через `throttleRAF`). Interactive canvas
перемальовується часто, але рендерить значно менше пікселів.

**Trade-off:** Складніший rendering pipeline, два окремих render config types
(`StaticCanvasAppState`, `InteractiveCanvasAppState`).

**Файли:** `packages/excalidraw/renderer/staticScene.ts`, `interactiveScene.ts`

---

## ADR-004: Delta-based History замість snapshot

**Рішення:** Undo/redo зберігає дельти (`ElementsDelta`, `AppStateDelta`), а не повні
знімки стану.

**Чому:** Snapshot-підхід для великих сцен (~1000+ елементів) потребує багато пам'яті.
Дельти компактні та придатні для collab-reconciliation (той самий механізм).

**Trade-off:** Складніша реалізація. Відомі проблеми з порядком `groupIds` після серії
undo/redo (TODO #7348). Дельти не валідуються семантично.

**Файли:** `packages/element/src/delta.ts`, `packages/excalidraw/history.ts`

---

## ADR-005: Collab тільки в excalidraw-app, не в npm-пакеті

**Рішення:** Весь collab-код (Firebase, Socket.io) живе в `excalidraw-app`, а не в
`@excalidraw/excalidraw`.

**Чому:** Collab потребує серверної інфраструктури (excalidraw-room, Firebase). Вбудовувати
це в npm-пакет означало б нав'язувати конкретний backend всім споживачам пакету.

**Trade-off:** Розробники, що вбудовують пакет, мусять реалізовувати collab самостійно
через `ExcalidrawImperativeAPI`. Пакет надає лише `isCollaborating` prop і `onPointerUpdate`.

**Файли:** `excalidraw-app/collab/`, `packages/excalidraw/types.ts` (Collaborator types)

---

## ADR-006: Jotai для UI-стану, не для бізнес-логіки

**Рішення:** Jotai використовується тільки для UI-атомів (sidebar docked, EyeDropper тощо),
ізольованих через `jotai-scope`.

**Чому:** `jotai-scope` дає кожній інстанції `<Excalidraw>` власний ізольований store —
кілька редакторів на сторінці не конфліктують. `AppState` в `this.state` залишається
синхронним source of truth для бізнес-логіки.

**Trade-off:** Два різних механізми стану для різних задач. Розробник мусить розуміти,
що йде в `AppState`, а що — в Jotai-атоми.

**Файл:** `packages/excalidraw/editor-jotai.ts`

---

## ADR-007: Action System як Command Pattern

**Рішення:** ~50 дій реалізовані як об'єкти з `perform`, `keyTest`, `PanelComponent`.

**Чому:** Єдине місце для бізнес-логіки, keyboard bindings і UI. Додавання нової дії
не потребує змін у event handlers або toolbar — тільки реєстрація в `ActionManager`.

**Trade-off:** Всі дії мають однаковий інтерфейс, навіть якщо не потребують keyboard
binding або UI. `ActionName` — string union ~50 значень, не type-safe при додаванні.

**Файли:** `packages/excalidraw/actions/types.ts`, `actions/manager.tsx`

---

## ADR-008: FractionalIndex для порядку елементів

**Рішення:** Порядок елементів визначається `FractionalIndex` (рядок типу `"a0"`, `"a1V"`),
а не числовим індексом у масиві.

**Чому:** При collab кілька учасників можуть одночасно вставляти елементи. Числова
перенумерація всього масиву — O(n) і конфліктна. Fractional indexing дозволяє вставку
між двома існуючими без зміни решти елементів — CRDT-сумісно.

**Trade-off:** Рядки важчі для читання та debugging. Потрібна синхронізація індексів
при кожному оновленні сцени (`syncMovedIndices`, `syncInvalidIndices`).

**Файл:** `packages/element/src/fractionalIndex.ts`

---

## Дивись також

- [Architecture](../technical/architecture.md) — як ці рішення реалізовані технічно
- [System Patterns](./systemPatterns.md) — патерни з прикладами коду
- [Undocumented Behaviors](../technical/undocumented-behaviors.md) — наслідки деяких рішень
