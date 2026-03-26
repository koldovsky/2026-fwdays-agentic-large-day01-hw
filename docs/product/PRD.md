# PRD — Excalidraw (reverse engineering)

**Статус:** неофіційний документ, відновлений з **публічного API, типів і README** пакета `@excalidraw/excalidraw` у цьому репозиторії. Це не заміна продуктової стратегії команди Excalidraw.

**Версія пакета в дереві:** `0.18.0` (`packages/excalidraw/package.json`).

---

## 1. Мета продукту

- Надати **вбудований у веб-застосунок редактор діаграм** у вигляді React-компонента з ручним / «ескізним» виглядом (canvas, Rough.js у залежностях пакета).
- Забезпечити **повноекранне заповнення контейнера** (`100%` ширини та висоти батька) — мінімальна інтеграція описана в `packages/excalidraw/README.md`; без ненульової висоти батька canvas не видно.
- Дозволити хосту **підписуватися на зміни сцени** (`onChange`), **ініціалізувати дані** (`initialData`), **керувати життєвим циклом** (`onMount`, `onUnmount`, `onInitialize`, `onExcalidrawAPI`) — інтерфейс `ExcalidrawProps` у `packages/excalidraw/types.ts`.
- У межах монорепозиторію окремий застосунок **`excalidraw-app`** демонструє сценарій «повного клієнта» з бекендом, колаборацією та інтеграціями (звужена мета конкретного workspace, не лише npm-пакет).

---

## 2. Цільова аудиторія

| Сегмент | Підстава в артефактах |
|---------|------------------------|
| **Розробники веб-застосунків (React)** | Пакет публікується як npm-модуль з `peerDependencies` на `react` / `react-dom`; README описує встановлення та імпорт CSS. |
| **Інтегратори Next.js / SSR-фреймворків** | README явно вимагає **клієнтський** рендер і `dynamic(..., { ssr: false })` для Next.js. |
| **Продукти з власним UI навколо редактора** | `renderTopLeftUI`, `renderTopRightUI`, `renderCustomStats`, `children`, `UIOptions`, `renderEmbeddable` — розширення без форку ядра. |
| **Застосунки з реальним часом / освіта / whiteboard** | Пропси `isCollaborating`, `onPointerUpdate`, `collaborators` у стані, `onUserFollow`; покажчики та лазер у типі `Collaborator` (`types.ts`). |
| **Кінцеві користувачі (через hosted app)** | Репозиторій містить готовий Vite-застосунок і приклади `examples/*` — споживач не обов’язково розробник npm-інтеграції. |

---

## 3. Ключовий функціонал

### 3.1 Інструменти малювання

Тип `ToolType` у `packages/excalidraw/types.ts` включає: selection, lasso, rectangle, diamond, ellipse, arrow, line, freedraw, text, image, eraser, hand, frame, magicframe, embeddable, laser. Підтримуються **кастомні** інструменти (`ActiveTool` з `type: "custom"`).

### 3.2 Режими та вигляд

Керування через пропси та стан: `theme`, `viewModeEnabled`, `zenModeEnabled`, `gridModeEnabled`, `objectsSnapModeEnabled` (`ExcalidrawProps`). У стані редактора — zoom, scroll, snap lines, рамки (`frameRendering`), обрізання зображень (`cropping`), zen mode тощо (типи `StaticCanvasAppState`, `InteractiveCanvasAppState`).

### 3.3 Робота зі сценою та файлами

- Оновлення сцени: `onChange(elements, appState, files)`; бінарні вкладення типу `BinaryFiles` / `BinaryFileData` (`types.ts`).
- Завантаження стартових даних: `initialData`.
- Експорт: згадка в пропі `onExport` про виклики для **`json`** та **PNG з embedded JSON** як тип `json`; `ExportOpts` підтримує збереження на диск, бекенд-колбек, кастомний UI експорту (`types.ts`).
- Зображення: `generateIdForFile`; у константах обмеження розміру файлу та масштабу експорту (`packages/common/src/constants.ts`: `MAX_ALLOWED_FILE_BYTES`, `DEFAULT_MAX_IMAGE_WIDTH_OR_HEIGHT`, `EXPORT_SCALES`).

### 3.4 Бібліотека фігур

`onLibraryChange`, `libraryReturnUrl`; у `UIOptions.tools` — перемикач інструмента `image` (`types.ts`, `DEFAULT_UI_OPTIONS` у `packages/common/src/constants.ts`).

### 3.5 Колаборація та презентація

- Проп `isCollaborating`, `onPointerUpdate` для синхронізації вказівника/лазера.
- `Collaborator`: pointer, selection, username, avatar, idle state тощо.
- `onUserFollow` / `UserToFollow` для режиму стеження за учасником.

### 3.6 Вбудований контент і безпека посилань

- `validateEmbeddable`, `renderEmbeddable` для host-controlled embed.
- `onLinkOpen`, `generateLinkForSelection` для гіперпосилань на елементи/групи.
- У залежностях пакета — `@braintree/sanitize-url` (`packages/excalidraw/package.json`).

### 3.7 Додаткові можливості (за прапорцями / опціями)

- **`aiEnabled`:** опційне вмикання AI-потоків у пропсах; у коді редактора є гілки для magic frame тощо.
- **Клавіатура / фокус:** `handleKeyboardGlobally`, `autoFocus`.
- **Скрол:** `detectScroll`, `onScrollChange`, `renderScrollbars`.
- **Дублювання:** `onDuplicate` з можливістю замінити наступний масив елементів.
- **Вставка:** `onPaste`.
- **Інкременти Store (історія):** `onIncrement` з обмеженням у JSDoc — підписка лише якщо проп заданий на **першому** рендері.

### 3.8 Дії над canvas (дефолтні)

`DEFAULT_UI_OPTIONS.canvasActions` (`packages/common/src/constants.ts`): зміна кольору фону, очищення canvas, експорт, завантаження сцени, збереження в активний файл, перемикач теми, збереження як зображення. Конкретний набір у UI може вимикатися через `UIOptions.canvasActions` (див. коментар у `types.ts` про відповідність імен дій і прапорців).

### 3.9 Локалізація

`langCode` у `ExcalidrawProps`; у пакеті присутні файли локалей (`packages/excalidraw/locales/`).

---

## 4. Технічні обмеження

### 4.1 Середовище виконання

- **Браузер:** цільові діапазони за `browserslist` у `packages/excalidraw/package.json` (production: наприклад `not safari < 12`, `not chrome < 70`, `not edge < 79`, `not ie <= 11`). Це **ціль збірки**, а не гарантія тестування кожної комбінації.
- **Canvas / DOM:** редактор побудований на HTML Canvas і пов’язаних API; без них функціонал недоступний.

### 4.2 React і SSR

- **Peer:** `react` та `react-dom` версій `^17.0.2 || ^18.2.0 || ^19.0.0` (`packages/excalidraw/package.json`).
- **SSR:** офіційна позиція README — рендер **лише на клієнті**; для Next.js — dynamic import з `ssr: false`.

### 4.3 Інтеграція

- Обов’язковий **імпорт стилів** `@excalidraw/excalidraw/index.css` (README).
- Батьківський контейнер має мати **явну висоту** (README).
- Для самостійного хостингу шрифтів/асетів README згадує `window.EXCALIDRAW_ASSET_PATH` як навмисну опцію, а не дефолт.

### 4.4 Розмір і продуктивність даних

- `MAX_ALLOWED_FILE_BYTES = 4 * 1024 * 1024` для завантажуваних файлів (`packages/common/src/constants.ts`).
- Складні сцени: у коді є TODO про вузькі місця для великих сцен (наприклад у `packages/element/src/frame.ts`) — reverse-engineered PRD фіксує ризик, не кількісний SLA.

### 4.5 Формат даних і сумісність

- Версії схем у константах `VERSIONS.excalidraw` / `excalidrawLibrary` (`packages/common/src/constants.ts`) — впливають на серіалізацію / бібліотеку.
- Міграція імпортів для `0.18.x` описана в README пакета (зміна шляхів deep imports).

### 4.6 Залежність від хоста для мережевих функцій

Повноцінний колаборативний бекенд, кімнати, бібліотеки в хмарі — у прикладі `excalidraw-app` та `.env.*` задаються URL-ами; **npm-пакет сам по собі** не надає сервера спільної роботи — хост реалізує протокол або використовує готовий застосунок.

### 4.7 Відомі вузькі місця API (з коду)

- `onIncrement` підписується лише при наявності пропа на першому рендері (`ExcalidrawProps` JSDoc).
- `onExport` у коментарі обмежений типом виклику `json` (включно з embedded PNG як `json`).
- Депрекейт / TODO у типах (`UIOptions.welcomeScreen`, API для `name`) — зона нестабільності контракту.

---

## 5. Верифікація джерел

| Тема | Файли / місця |
|------|----------------|
| Мета embed | `packages/excalidraw/README.md`, `packages/excalidraw/package.json` (`description`) |
| API і функції | `packages/excalidraw/types.ts` (`ExcalidrawProps`, `ToolType`, `Collaborator`, `UIOptions`, `ExportOpts`) |
| Дефолтні дії UI | `packages/common/src/constants.ts` (`DEFAULT_UI_OPTIONS`, ліміти файлів / експорту) |
| Браузери та React | `packages/excalidraw/package.json` (`browserslist`, `peerDependencies`) |
| Монорепо / app | `package.json` workspaces, `excalidraw-app/` |
