# Product Context — Excalidraw

Верифіковано з: `excalidraw-app/App.tsx`, `packages/excalidraw/types.ts`,
`packages/excalidraw/actions/`, `excalidraw-app/components/`,
`.coderabbit.yaml`, `packages/excalidraw/README.md`.

---

## Продуктова мета

Excalidraw — **відкритий веб-інструмент для малювання діаграм у стилі "від руки"**
(whiteboard / virtual hand-drawn canvas).

Два рівні продукту:
- **`excalidraw.com`** — повний застосунок з колаборацією, Firebase, Sentry, Excalidraw Plus.
- **`@excalidraw/excalidraw`** — вбудовуваний React-компонент для інтеграції в будь-який застосунок.

---

## Цільова аудиторія

| Сегмент | Потреба |
|---------|---------|
| Розробники | Швидкі технічні діаграми, архітектурні схеми |
| Дизайнери / PM | Вайрфрейми, флоучарти, скетчі |
| Команди | Спільна робота на дошці в реальному часі |
| Інтегратори | Вбудовування редактора у власний продукт (SaaS, нотатники, IDE) |

---

## Ключові UX-цілі

- **Zero-friction**: відкрив → одразу малюєш; не потрібна реєстрація.
- **Hand-drawn feel**: Rough.js надає навмисно "нечіткий" вигляд (знижує тиск на перфекціонізм).
- **Real-time collaboration**: спільна робота з видимими курсорами колаборантів, без конфліктів.
- **Portability**: експорт у PNG, SVG, `.excalidraw` (JSON); імпорт Mermaid діаграм.
- **Embeddability**: один `<Excalidraw />` компонент — готовий редактор; SSR-safe через `dynamic`.
- **Accessible UI**: Radix UI, keyboard shortcuts для всіх основних дій, локалізація (80+ мов).

---

## Основні сценарії використання

### 1. Малювання та редагування (core)

**Інструменти** (з `activeTool` у `AppState`, `packages/excalidraw/types.ts`):
- Фігури: rectangle, diamond, ellipse, arrow, line, freedraw
- Текст: текстовий елемент + WYSIWYG-редактор прямо на canvas
- Вибір: selection (прямокутне), lasso (`preferredSelectionTool` у AppState)
- Службові: hand (pan), eraser, laser pointer (для презентацій)
- Фрейми: frame, magicframe (AI-assisted layout)
- Вбудовування: embeddable (iframe), image

**Операції** (з `packages/excalidraw/actions/`):
- Вирівнювання (`actionAlign`), розподіл (`actionDistribute`), z-index (`actionZindex`)
- Групування (`actionGroup`), блокування (`actionElementLock`)
- Дублювання (`actionDuplicateSelection`), видалення (`actionDeleteSelected`)
- Flip (`actionFlip`), CropEditor (`actionCropEditor`)
- Bound text (`actionBoundText`), лінійний редактор (`actionLinearEditor`)

### 2. Колаборація в реальному часі

- `LiveCollaborationTrigger` → Socket.io (`socket.io-client 4.7.2`)
- Видимі курсори колаборантів (тип `Collaborator` у `types.ts`: `pointer`, `username`, `color`, `isInCall`, `isSpeaking`, `isMuted`)
- Лазерна указка — інструмент для показу при live-сесії
- Синхронізація через Firebase + WebSocket; link-based кімнати
- Follow-mode: `userToFollow` у `AppState` — слідувати за курсором іншого учасника

### 3. Бібліотека елементів

- `LibraryMenu` (`components/LibraryMenu.tsx`) — перегляд, додавання, публікація
- `actionAddToLibrary` — збереження вибраних елементів як шаблонів
- IndexedDB (через `LibraryIndexedDBAdapter`) + `LibraryLocalStorageMigrationAdapter`
- Browse публічних бібліотек з excalidraw.com

### 4. Експорт та sharing

**Дії** (`actionExport.tsx`):
- PNG / SVG / JSON (`.excalidraw`) — `ImageExportDialog`, `JSONExportDialog`
- Embed scene в SVG (`exportEmbedScene` у AppState)
- Dark mode export (`exportWithDarkMode`), scale (`exportScale`)

**Sharing** (`excalidraw-app/share/ShareDialog.tsx`):
- `ShareableLinkDialog` — генерація посилання
- `exportToBackend` → Firebase storage
- QR-код (пакет `uqr`)
- Excalidraw Plus export (`ExportToExcalidrawPlus.tsx`)

### 5. AI та Text-to-Diagram (TTD)

- `TTDDialogTrigger` — конвертація тексту/Mermaid у діаграму
- `AIComponents` (`excalidraw-app/components/AI.tsx`) — AI-функції
- `MagicButton` (`components/MagicButton.tsx`) — магічні фрейми з AI-layout
- `actionEmbeddable` — вставка iframe-вмісту (YouTube, Vimeo, Google Maps)

### 6. Режими роботи

| Режим | AppState поле | UX-ефект |
|-------|--------------|----------|
| View mode | `viewModeEnabled` | лише перегляд, без редагування |
| Zen mode | `zenModeEnabled` | прихований UI, тільки canvas |
| Grid mode | `gridModeEnabled` | сітка для вирівнювання |
| Pen mode | `penMode` | оптимізовано для стилуса |
| Dark theme | `theme` | темна тема UI + canvas |

### 7. Command Palette та пошук

- `CommandPalette` з `DEFAULT_CATEGORIES` — пошук усіх дій і елементів
- `SearchMenu` (`components/SearchMenu.tsx`) — пошук по canvas
- `actionToggleSearchMenu` — клавіатурний шорткат

---

## UI-архітектура (верхній рівень)

```text
excalidraw-app/App.tsx
├── AppWelcomeScreen      ← onboarding для нових користувачів
├── AppMainMenu           ← головне меню (файл, тема, мова, About)
├── AppFooter             ← нижня панель (GitHub, Discord, X, YouTube)
├── AppSidebar            ← бічна панель (бібліотека, вкладки)
├── Collab                ← панель колаборації
├── ShareDialog           ← діалог sharing
├── CommandPalette        ← пошук дій ⌘K
├── ExcalidrawPlusPromoBanner ← промо Excalidraw Plus
└── AIComponents          ← AI-функції
```

---

## Інтеграційні сценарії (для розробників)

- **Мінімальна вставка**: `<Excalidraw />` у контейнер з `height: 100vh` + CSS import
- **SSR (Next.js)**: `dynamic(..., { ssr: false })` — Canvas API недоступний на сервері
- **Persistence**: `initialData` prop + `onChange` callback → збереження у власному storage
- **Кастомний UI**: `MainMenu`, `Footer`, `Sidebar`, `WelcomeScreen` — слоти для вставки
- **Imperative API**: `useExcalidrawAPI` / `onExcalidrawAPI` — доступ до `ExcalidrawImperativeAPI`

---

## Non-goals (чого продукт НЕ робить)

- Не є повноцінним векторним редактором (не Figma, не Illustrator)
- Не зберігає версії документів (немає history в хмарі)
- Не підтримує растрове редагування зображень
- Не має вбудованого відеодзвінка (лише аудіо-стан колаборантів в `Collaborator`)

---

## Додаткова документація

For detailed architecture → see [docs/technical/architecture.md](../technical/architecture.md)
For domain glossary → see [docs/product/domain-glossary.md](../product/domain-glossary.md)
