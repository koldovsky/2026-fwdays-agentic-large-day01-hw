# Product Context — Excalidraw

## UX Philosophy

Excalidraw будується навколо принципу **"sketchy by design"** — навмисний стиль "від руки"
знижує психологічний бар'єр перед малюванням: недосконала схема виглядає нормально,
бо так і задумано. Інтерфейс прибирає складність де може — мінімум UI у фокусі на полотні.

---

## UX Goals (верифіковано з коду)

### 1. Zero-friction start
- `showWelcomeScreen: boolean` (`AppState`) — порожнє полотно показує WelcomeScreen з підказками
- Три тунельних hint-компоненти: `MenuHint`, `ToolbarHint`, `HelpHint`
  (`packages/excalidraw/components/welcome-screen/WelcomeScreen.Hints.tsx`)
- Без реєстрації, без налаштувань — одразу малювати

### 2. Адаптивність до форм-фактора
Три режими UI (не лише responsive CSS):
```typescript
// packages/common/src/editorInterface.ts:4
formFactor: "phone" | "tablet" | "desktop"
desktopUIMode: "compact" | "full"
```

Breakpoints:
- `phone`: ширина ≤ 599px або (висота < 500 і ширина < 1000) — landscape phones
- `tablet`: 600–1180px (до iPad Air)
- `desktop`: решта

`StylesPanelMode` (`"mobile" | "compact" | "full"`) — панель властивостей адаптується під форм-фактор.
Host-застосунок може перевизначити через `UIOptions.getFormFactor()`.

### 3. Keyboard-first workflow
Інструменти мають shortcut з кожної клавіші (`HelpDialog.tsx`):
```
H — hand (pan)       V / 1 — selection    R / 2 — rectangle
D / 3 — diamond      O / 4 — ellipse      A / 5 — arrow
L / 6 — line         P / 7 — freedraw     T / 8 — text
9 — image            E — eraser           Z — undo
```
`handleKeyboardGlobally: boolean` prop — чи перехоплювати клавіатуру поза canvas.

### 4. Offline-first / PWA
- Service worker: `public/service-worker.js`
- `vite-plugin-pwa` у `excalidraw-app/vite.config.mts`
- `beforeinstallprompt` event перехоплюється для "Install PWA" у MainMenu (`excalidraw-app/App.tsx:180`)
- Collab слухає `window offline` event (`excalidraw-app/collab/Collab.tsx:211`)
- Fonts кешуються у IndexedDB для offline-рендеру

### 5. Collaboration як перший клас
```typescript
// ExcalidrawProps
isCollaborating?: boolean
onPointerUpdate?: (payload: { pointer, button, pointersMap }) => void
```
- Курсори колабораторів рендеряться на окремому interactive canvas
- URL share: `roomId` + `roomKey` у hash (`excalidraw-app/App.tsx:249`)
- `Collaborator.userState: "active" | "away" | "idle"` — idle detection

---

## User Scenarios

### Scenario 1: Швидка схема для себе (solo, desktop)
```
1. Відкрити excalidraw.com → WelcomeScreen з підказками
2. Вибрати інструмент (R для rectangle) → намалювати фігури
3. A для arrow → з'єднати фігури (auto-binding до фігур)
4. T → додати текст
5. Cmd+S → зберегти як .excalidraw або PNG/SVG
```
**Key code path:** `TOOL_TYPE` → pointer events in `App.tsx` → `mutateElement` → `staticScene`

### Scenario 2: Колаборація в реальному часі
```
1. Натиснути "Live collaboration" → генерується roomId + roomKey
2. Скопіювати URL → поділитися з командою
3. Кожен бачить курсори інших (CollaboratorPointer)
4. Зміни синхронізуються через Socket.io
5. Firebase зберігає стан сцени
```
**Key code path:** `Collab.tsx` → Socket.io → `CaptureUpdateAction.NEVER` для remote updates

### Scenario 3: Embedded у власний застосунок (розробник)
```typescript
import { Excalidraw } from "@excalidraw/excalidraw";

<Excalidraw
  initialData={{ elements, appState }}
  onChange={(elements, appState) => save(elements)}
  onExcalidrawAPI={(api) => setApi(api)}
  viewModeEnabled={readOnly}
  UIOptions={{ canvasActions: { export: false } }}
/>
```
**Сценарій view-only:** `viewModeEnabled: true` → елементи не редагуються, toolbar прихований.
`updateFrameRendering()` — вимкнути кліп Frame у view mode.

### Scenario 4: Презентація / демо
```
1. Увімкнути Zen Mode (Cmd+Shift+Z) → прибирається весь UI
2. Laser tool (K) → підсвічує pointer з анімованим слідом
3. Hand tool (H) → pan без випадкового малювання
4. Zoom to fit (Shift+1) → вмістити всю сцену
```
**Key code path:** `zenModeEnabled` в AppState → `LayerUI`ховає toolbar
`laser` tool → `AnimatedTrail` у `animated-trail.ts`

### Scenario 5: Мобільний / touch
```
1. formFactor = "phone" → нижня тулбар, стилі панель — compact
2. Два пальці → zoom/pan (pinch gesture)
3. Apple Pencil / стилус → penMode auto-detected (penDetected: true)
4. penMode: true → відключає touch-pan при малюванні
```
**Key code path:** `editorInterface.formFactor` → `StylesPanelMode = "mobile"` → адаптований LayerUI

### Scenario 6: Export для документів
```
1. Export dialog → вибрати PNG / SVG / JSON
2. PNG: exportToBlob() з exportScale (1x/2x/3x)
3. SVG: exportToSvg() — повністю векторний, з шрифтами inline
4. JSON: serializeAsJSON() → .excalidraw файл для повторного відкриття
5. Clipboard: exportToClipboard() → paste прямо у Figma/Notion
```
**Formats:** `packages/utils/src/export.ts` — `exportToCanvas`, `exportToBlob`, `exportToSvg`

### Scenario 7: Library (збережені трафарети)
```
1. Намалювати елементи → виділити → "Add to Library"
2. Library panel (DefaultSidebar) → зберігається в IndexedDB
3. Drag з Library на canvas → вставка з offset
4. "Publish to library" → status: "published"
5. Import .excalidrawlib → merge з поточною бібліотекою
```
**Key code path:** `LibraryItem.status: "published" | "unpublished"` → `data/library.ts` → IndexedDB

---

## UI Modes та їх ефекти

| Mode | Prop/State | Що змінюється |
|---|---|---|
| `viewModeEnabled` | prop | Toolbar прихований, елементи read-only, pan/zoom доступні |
| `zenModeEnabled` | prop / Cmd+Shift+Z | Весь UI прихований, тільки canvas |
| `gridModeEnabled` | prop / Cmd+' | Сітка на canvas, snap to grid |
| `objectsSnapModeEnabled` | prop | Snap до країв/центрів інших елементів |
| `isCollaborating` | prop | Показує аватари колабораторів, курсори |
| `desktopUIMode: "compact"` | localStorage | Properties panel — collapsed by default |

---

## Customization Points для host-застосунків

```typescript
// ExcalidrawProps — що може перевизначити інтегратор
renderTopLeftUI   // кастомний UI у верхньому лівому куті
renderTopRightUI  // кастомний UI у верхньому правому куті
renderCustomStats // кастомна статистика у Stats panel
UIOptions.canvasActions  // вимкнути/приховати пункти меню
UIOptions.tools.image    // вимкнути image tool
UIOptions.getFormFactor  // примусовий form factor

// Lifecycle hooks
onExcalidrawAPI   // API доступний (editor ще не mounted)
onMount           // editor root змонтований
onInitialize      // початкова сцена завантажена
onUnmount         // editor розмонтований

// Data hooks
onChange          // будь-яка зміна elements/appState
onIncrement       // кожен Store increment (для precise sync)
onDuplicate       // перехоплення дублювання елементів
onPaste           // перехоплення paste (повернути false = блокувати)
onLibraryChange   // зміна бібліотеки
onPointerUpdate   // рух курсора (для collab)
```

---

## See also

| Документ | Що містить |
|---|---|
| [`docs/technical/architecture.md`](../technical/architecture.md) | Data flow, rendering pipeline |
| [`docs/product/domain-glossary.md`](../product/domain-glossary.md) | Словник термінів |
