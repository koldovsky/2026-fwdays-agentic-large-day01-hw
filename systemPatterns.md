# System Patterns: packages/excalidraw

## Ключові модулі

| Директорія/файл | Призначення |
|---|---|
| `components/App.tsx` | Монолітний головний компонент (~11k рядків), оркеструє весь застосунок |
| `actions/` | 40+ обробників дій (delete, duplicate, export, align...) + `ActionManager` |
| `renderer/` | Pipeline рендерингу на Canvas та SVG-експорт |
| `scene/` | Viewport, zoom, scroll, видимі елементи |
| `data/` | Серіалізація, десеріалізація, шифрування, міграція версій |
| `hooks/` | React-хуки: `useAppStateValue`, `useEmitter` та ін. |
| `context/tunnels.ts` | Portal-комунікація між компонентами (бібліотека `tunnel-rat`) |
| `eraser/` | Гумка з анімованим слідом |
| `lasso/` | Лассо-вибір з детекцією перетинів |
| `wysiwyg/` | Floating текстовий редактор |
| `fonts/` | Lazy-завантаження шрифтів (Virgil, Cascadia, CJK тощо) |
| `appState.ts` | `getDefaultAppState()` — вся UI-стан (зум, скрол, інструмент, стилі) |
| `history.ts` | Undo/redo стеки через `HistoryDelta` |
| `editor-jotai.ts` | Ізольований Jotai store на кожен екземпляр редактора |

---

## State Management

Стан розділений на два рівні:

**1. `appState` (UI-стан)** — звичайний React state в `App.tsx`:
- Інструмент, зум, скрол, вибрані елементи, відкриті меню, поточні стилі
- `APP_STATE_STORAGE_CONF` визначає, що зберігати в `browser` / `export` / `server`

**2. Jotai (асинхронний/ізольований стан)** — `editor-jotai.ts`:
```ts
const jotai = createIsolation(); // кожен екземпляр — окремий store
export const EditorJotaiProvider = jotai.Provider;
export const { useAtom, useAtomValue, useStore } = jotai;
```
Дозволяє запускати кілька незалежних редакторів на одній сторінці.

**3. Елементи** — зберігаються в `Store/Scene` з пакету `@excalidraw/element`, окремо від `appState`.

**History:**
```
Мутація елементів → StoreDelta.calculate() → History.record() → undo/redo стек
```

---

## Основні компоненти та взаємозв'язки

```
index.tsx
└── <ExcalidrawAPIProvider>        ← imperative API для хост-застосунків
    └── <EditorJotaiProvider>      ← ізольований Jotai store
        └── <InitializeApp>        ← мова, тема
            └── <App>              ← вся логіка
                ├── <Actions>      ← тулбар з кнопками дій
                ├── <DefaultSidebar> ← бібліотека, панель елементів
                ├── <MainMenu>     ← через tunnel (portal)
                ├── <Footer>       ← через tunnel (portal)
                ├── Canvas (static)     ← renderStaticScene()
                ├── Canvas (interactive) ← renderInteractiveScene()
                ├── textWysiwyg.tsx ← floating WYSIWYG
                └── Dialogs...
```

**Context Tunnels** — дозволяють `<MainMenu>`, `<Footer>` та подібним оголошуватись глибоко в дереві, але рендеритись у фіксованих позиціях layout.

---

## Pipeline рендерингу

```
User Input
  → App.tsx (event handler)
  → ActionManager.executeAction()
  → setState() / setElements()
  → Store (@excalidraw/element)
  → scene/Renderer.getRenderableElements()  [мемоізація]
  → renderer/staticScene.renderStaticScene()  [throttled]
  → Canvas update
```

| Файл | Роль |
|---|---|
| `renderer/staticScene.ts` | Головний рендер Canvas (сітка, елементи, фрейми) |
| `renderer/interactiveScene.ts` | Оверлеї (колаборатори, курсори, лазер) |
| `renderer/staticSvgScene.ts` | SVG-експорт |
| `scene/Renderer.ts` | Мемоізована фільтрація видимих елементів |

---

## Публічне API (`index.tsx`)

```ts
// Компонент
export const Excalidraw = React.memo(ExcalidrawBase);

// Утиліти
export { exportToCanvas, exportToBlob, exportToSvg, exportToClipboard }
export { serializeAsJSON, loadFromBlob, restoreElements }
export { convertToExcalidrawElements, zoomToFitBounds }

// UI-компоненти для кастомізації
export { Sidebar, Button, Footer, MainMenu, WelcomeScreen }
```

Хост-застосунок також отримує **`ExcalidrawImperativeAPI`** через `onExcalidrawAPI` prop — ~20 методів: `getElements()`, `setElements()`, `getAppState()`, `setState()`, `exportToBlob()` тощо.
