# System Patterns — Excalidraw

Архітектурні патерни та ключові модулі пакету `packages/excalidraw`.

---

## Загальна структура каталогу

```
packages/excalidraw/
├── index.tsx            ← публічна точка входу (Excalidraw компонент + re-exports)
├── types.ts             ← AppState, ExcalidrawProps, всі ключові типи
├── editor-jotai.ts      ← Jotai store для editor-subtree
├── actions/             ← 46 файлів: ActionManager, register, action*.tsx
├── components/          ← 277 файлів: App.tsx + весь UI
│   └── canvases/        ← StaticCanvas, InteractiveCanvas
├── scene/               ← Renderer.ts, scroll, zoom, export
├── renderer/            ← staticScene.ts, interactiveScene.ts, SVG export
├── data/                ← persistence, JSON, blob, library, restore
├── hooks/               ← React hooks (useExcalidrawAPI, тощо)
├── fonts/               ← завантаження шрифтів (woff2)
├── i18n/                ← переклади
├── wysiwyg/             ← текстовий редактор прямо на канвасі
├── lasso/               ← інструмент лассо
└── css/                 ← SCSS стилі
```

---

## Точка входу — `index.tsx`

Публічний компонент `Excalidraw` — тонка обгортка (`React.memo`):

```
EditorJotaiProvider        ← scoped Jotai store
  └─ InitializeApp         ← первинна ініціалізація
       └─ App              ← реальна реалізація (components/App.tsx)
```

Також експортує: `MainMenu`, `Sidebar`, `Footer`, `TTDDialog`, хуки
(`useExcalidrawAPI`, `useExcalidrawStateValue`), утиліти з `@excalidraw/element`,
`@excalidraw/common`, `@excalidraw/utils`.

---

## State Management

Використовується **гібридний підхід** — два механізми:

**React class state (основний)**

`App` — це class-компонент. `AppState` (~560+ полів в `types.ts`) живе в
`this.state` / `this.setState`.

| Тип | Призначення |
|-----|-------------|
| `AppState` | повний стан редактора: activeTool, scroll/zoom, selection, dialogs, collab, export settings, тощо |
| `StaticCanvasAppState` | підмножина для статичного canvas-рендерера |
| `InteractiveCanvasAppState` | підмножина для інтерактивного шару |
| `UIAppState` | для UI-компонентів |
| `ObservedAppState` | для history/snapshot |
| `AppClassProperties` | фасад `App`-інстансу для системи дій |

**Scene (елементи) — окремо від React state**

Елементи не зберігаються в `this.state`. Вони керуються через `this.scene`
(клас `Scene` з `@excalidraw/element`) через `scene.replaceAllElements(...)`.

**Jotai (допоміжний)**

`editor-jotai.ts` надає ізольований Jotai store для atoms-based фіч усередині
editor-дерева (не замінює React state повністю).

**Цикл оновлення через Action:**

```
action.perform(elements, appState, ...)
  → ActionResult { elements, appState, captureUpdate }
  → App.syncActionResult()
      ├─ store.scheduleAction(captureUpdate)   ← history batching
      ├─ scene.replaceAllElements(elements)    ← оновлення елементів
      └─ this.setState(appState)               ← оновлення UI стану
```

---

## Система елементів (`@excalidraw/element`)

Елементи визначені в сусідньому пакеті `packages/element`. Базовий тип
`_ExcalidrawElementBase` містить: `id`, `x/y`, `width/height`, `angle`, кольори,
`opacity`, `roughness`, `version`, `groupIds`, `frameId`, `isDeleted`, тощо.

Конкретні типи (discriminated union):

```
ExcalidrawElement =
  | rectangle | diamond | ellipse
  | text
  | linear (line/arrow) | freedraw
  | image | frame | magicframe
  | iframe | embeddable
  | selection
```

---

## Система дій (Action System)

Кожна дія реєструється через `register(action)`:

```typescript
{
  name: string,
  label: string | () => string,
  keyTest?: (event) => boolean,   // keyboard shortcut
  PanelComponent?: React.FC,       // toolbar UI
  perform(elements, appState, formData, app): ActionResult | false
}
```

`ActionManager` (`actions/manager.tsx`):
- `registerAll(actions)` — реєструє всі дії при старті
- `handleKeyDown(event)` — перебирає дії за `keyPriority`, знаходить першу з `keyTest = true`
- `executeAction(action)` → `perform()` → `syncActionResult()`
- `renderAction(name)` — рендерить `PanelComponent` для toolbar/меню

---

## Конвеєр рендерингу (Rendering Pipeline)

Два незалежних canvas-шари:

```
┌─────────────────────────────────────────────┐
│  InteractiveCanvas (поверх)                 │
│  - handles, selection box, remote cursors   │
│  - renderInteractiveScene() → interactiveScene.ts │
├─────────────────────────────────────────────┤
│  StaticCanvas (знизу)                       │
│  - фінальне зображення елементів            │
│  - renderStaticScene() → staticScene.ts     │
└─────────────────────────────────────────────┘
```

**Потік рендерингу:**

```
1. scene/Renderer.ts
   └─ getRenderableElements() [мемоїзовано]
       ├─ фільтрує in-flight newElement та текст, що редагується
       └─ isElementInViewport() → тільки видимі елементи

2. StaticCanvas (useEffect на зміни state/scene)
   └─ renderStaticScene(roughCanvas, elementMap, StaticCanvasAppState)
       └─ @excalidraw/element → renderElement()  ← реальне малювання

3. InteractiveCanvas
   └─ renderInteractiveScene(InteractiveCanvasAppState)
       └─ selection, handles, snap lines, collaborator cursors

4. SVG Export (окремо)
   └─ renderer/staticSvgScene.ts → паралельний шлях для SVG
```

---

## Взаємозв'язки між модулями

```
index.tsx (Excalidraw)
    │
    └─► components/App.tsx  ◄──────────────────────────┐
             │                                          │
             ├─► ActionManager ──────────────────────► syncActionResult()
             │       └─► action*.tsx → ActionResult ───┘
             │
             ├─► scene/Renderer.ts
             │       └─► @excalidraw/element (Scene, renderElement)
             │
             ├─► StaticCanvas
             │       └─► renderer/staticScene.ts
             │               └─► @excalidraw/element/renderElement
             │
             ├─► InteractiveCanvas
             │       └─► renderer/interactiveScene.ts
             │
             └─► types.ts (AppState, ExcalidrawProps, ...)

@excalidraw/element ── спільний пакет (елементи, геометрія, Scene, renderElement)
@excalidraw/math    ── геометрія (трансформації, hitTest)
@excalidraw/common  ── константи, утиліти
```

---

## Висновок

Ядро — **монолітний клас `App`**: оркеструє `ActionManager`, `Scene`, два canvas-шари та React state. `AppState` (~560 полів) у `this.state`; елементи живуть поза React у `Scene`. Бізнес-логіка у ~46 action-файлах → `ActionResult` → `syncActionResult`.

---

## Додаткова документація

For detailed architecture → see [docs/technical/architecture.md](../technical/architecture.md)
For domain glossary → see [docs/product/domain-glossary.md](../product/domain-glossary.md)
