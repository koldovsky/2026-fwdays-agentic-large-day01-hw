# System Patterns — Excalidraw

## Архітектура монорепо

**Yarn Workspaces** із залежностями у чіткому напрямку:

```
@excalidraw/math
    ↓
@excalidraw/common
    ↓
@excalidraw/element  ←──  @excalidraw/math
    ↓
@excalidraw/excalidraw  (головна бібліотека)
    ↓
@excalidraw/utils  (публічні утиліти: export, bbox)
    ↓
excalidraw-app  (веб-аплікація)
```

Пакети не залежать від `excalidraw-app`. Зворотних залежностей немає.

---

## Component Tree

```
packages/excalidraw/index.tsx
└── <ExcalidrawAPIProvider>        # Imperative API (ref forwarding)
    └── <EditorJotaiProvider>      # Ізольований Jotai store
        └── <InitializeApp>        # Мова (i18n), тема
            └── <App>              # Монолітний оркестратор (~12.8K рядків)
                ├── <Actions>      # Тулбар (toolbar + shortcut bindings)
                ├── <DefaultSidebar> # Library panel
                ├── <MainMenu>     # Через tunnel (portal)
                ├── <Footer>       # Через tunnel (portal)
                ├── Canvas static  # renderStaticScene()
                ├── Canvas interactive # renderInteractiveScene()
                ├── <textWysiwyg> # Floating текстовий редактор
                └── Dialogs...     # ErrorDialog, ConfirmDialog, ExportDialog
```

`packages/excalidraw/components/App.tsx` — центральний компонент, оркеструє весь застосунок.

---

## State Management (3 рівні)

### 1. AppState — React state в App.tsx
- Весь UI-стан: поточний інструмент, зум, скрол, вибрані елементи, стилі, відкриті панелі
- Конфіг `APP_STATE_STORAGE_CONF` у `appState.ts` визначає що зберігати: `browser` / `export` / `server`
- `getDefaultAppState()` (`packages/excalidraw/appState.ts`) — початковий стан

### 2. Jotai — атомний, ізольований на інстанцію
```typescript
// packages/excalidraw/editor-jotai.ts
const jotai = createIsolation(); // окремий store на кожен <Excalidraw>
export const EditorJotaiProvider = jotai.Provider;
export const { useAtom, useAtomValue, useStore } = jotai;
```
Дозволяє кілька незалежних редакторів на одній сторінці.
> ESLint-правило: заборонено `import { atom } from 'jotai'` напряму — тільки через `editor-jotai.ts`.

### 3. Store / Scene — елементи
- `Scene` (`packages/element/src/Scene.ts`) — управляє колекцією елементів
- `Store` — відстежує зміни, генерує `StoreDelta` для history
- Елементи зберігаються окремо від `appState`

---

## History / Undo-Redo

```
Мутація елемента
  → mutateElement() (packages/element/src/mutateElement.ts)
  → Store.observe()
  → StoreDelta.calculate() (delta.ts)
  → History.record() (history.ts)
  → стек undo/redo
```

`HistoryDelta` зберігає лише diff, не snapshot — ефективно для великих сцен.

---

## Action Pattern

Всі операції (delete, duplicate, align, export...) — через `ActionManager`:

```typescript
// packages/excalidraw/actions/actionManager.tsx
class ActionManager {
  registerAction(action: Action)
  executeAction(action, source)
  renderAction(name)       // рендер кнопки
}
```

- Кожна дія — окремий файл у `packages/excalidraw/actions/`
- 32+ дій: `actionDelete`, `actionDuplicate`, `actionGroup`, `actionAlign`, `actionExport`...
- Підтримують keyboard shortcuts, toolbar buttons і контекстне меню

---

## Rendering Pipeline

```
User Input
  → App.tsx (event handler)
  → ActionManager.executeAction()  або  setState()
  → Store (@excalidraw/element)
  → scene/Renderer.getRenderableElements()  [мемоїзація]
  → renderer/staticScene.renderStaticScene()  [throttled rAF]
  → Canvas update
```

| Файл | Роль |
|---|---|
| `renderer/staticScene.ts` | Canvas рендер фонових елементів |
| `renderer/interactiveScene.ts` | Оверлеї: курсори колабораторів, лазер-pointer |
| `renderer/staticSvgScene.ts` | SVG-експорт |
| `scene/Renderer.ts` | Мемоїзована фільтрація видимих елементів |

Два окремих `<canvas>` — static (рідко перемальовується) + interactive (часто).

---

## Context Tunnels (Portal pattern)

```typescript
// packages/excalidraw/context/tunnels.ts
import { tunnel } from "tunnel-rat";
export const tunnels = { MainMenu: tunnel(), Footer: tunnel(), ... };
```

`<MainMenu>` і `<Footer>` оголошуються глибоко в дереві (користувацький код),
але рендеряться у фіксованих позиціях через tunnel.

---

## Fonts — Lazy Loading

- Шрифти (Virgil, Cascadia, CJK) завантажуються за потребою (`packages/excalidraw/fonts/`)
- Субсеттинг через WASM (`scripts/wasm/hb-subset.wasm`, `woff2.wasm`)
- Кешуються в `IndexedDB`

---

## Element Types

Базовий тип `ExcalidrawElement` (`packages/element/src/types.ts`):

```
ExcalidrawElement
├── ExcalidrawGenericElement     (rectangle, diamond, ellipse)
├── ExcalidrawLinearElement      (line, arrow, freedraw)
│   └── ExcalidrawArrowElement
├── ExcalidrawTextElement
├── ExcalidrawImageElement
├── ExcalidrawFrameLikeElement
│   ├── ExcalidrawFrameElement
│   └── ExcalidrawMagicFrameElement
└── ExcalidrawBindableElement    (може приймати стрілки)
```

Всі елементи — **immutable за угодою**. Зміни тільки через `mutateElement()`.

---

## Key Patterns

### Immutable Elements
```typescript
// НЕ робити: element.x = 10
// Завжди через:
mutateElement(element, { x: 10 });
```

### NonDeleted filter
```typescript
// Перед рендером завжди фільтруємо:
getNonDeletedElements(elements)  // packages/element/src/index.ts
```

Елементи soft-delete (прапор `isDeleted: true`), не видаляються з масиву.

### Scene Version
```typescript
getSceneVersion(elements)   // hash для detect змін
hashElementsVersion(elements)
```

### Collaboration
- Кожен колаборатор — об'єкт `Collaborator` з полями `pointer`, `username`, `color`
- Курсори рендеряться в `interactiveScene`
- Синхронізація через Socket.io, persistence через Firebase

---

## Ключові файли для навігації

| Задача | Файл |
|---|---|
| Точка входу бібліотеки | `packages/excalidraw/index.tsx` |
| Головний компонент | `packages/excalidraw/components/App.tsx` |
| Публічні типи | `packages/excalidraw/types.ts` |
| Типи елементів | `packages/element/src/types.ts` |
| State за замовчуванням | `packages/excalidraw/appState.ts` |
| Jotai store | `packages/excalidraw/editor-jotai.ts` |
| Canvas рендер | `packages/excalidraw/renderer/staticScene.ts` |
| Мутація елементів | `packages/element/src/mutateElement.ts` |
| History | `packages/excalidraw/history.ts` |
| Actions | `packages/excalidraw/actions/` |
| Export | `packages/utils/src/export.ts` |

---

## See also

| Документ | Що містить |
|---|---|
| [`docs/technical/architecture.md`](../technical/architecture.md) | Детальна архітектура з mermaid-діаграмами, data flow, rendering pipeline |
| [`docs/product/domain-glossary.md`](../product/domain-glossary.md) | Словник термінів (ExcalidrawElement, Scene, AppState, Action, ...) |
