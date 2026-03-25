# Product context — UX-цілі та сценарії (Memory Bank)

## Пов’язана документація

- **Технічна** ([`docs/technical/`](../technical/)): [architecture.md](../technical/architecture.md) · [dev-setup.md](../technical/dev-setup.md)
- **Продуктова** ([`docs/product/`](../product/)): [PRD.md](../product/PRD.md) · [domain-glossary.md](../product/domain-glossary.md)

Опис цілей досвіду користувача й типових потоків для **веб-застосунку** `excalidraw-app` і вбудованого редактора `@excalidraw/excalidraw`. Узгоджено з реалізацією у вихідному коді (без припущень про зовнішні сервіси, крім того, що явно викликається з коду).

---

## UX-цілі (пріоритети досвіду)

- **Швидко почати малювати** — порожній канвас з екраном привітання та підказками (меню, панель інструментів, довідка): `excalidraw-app/components/AppWelcomeScreen.tsx` (`WelcomeScreen.*`).
- **Не втрачати роботу локально** — автозбереження сцени й файлів через `LocalData` (localStorage + IndexedDB), синхронізація між вкладками, `flushSave` при виході / втраті фокусу; опційне попередження перед закриттям вкладки, якщо є незбережені зображення: `excalidraw-app/data/LocalData.ts`, `excalidraw-app/App.tsx` (`onChange`, `beforeunload`, `VITE_APP_DISABLE_PREVENT_UNLOAD`).
- **Ділитися та отримувати сцени** — імпорт за посиланнями (`#json=…`, `?id=…`), зовнішній файл `#url=…`, підтвердження перезапису поточної сцени: `initializeScene` у `excalidraw-app/App.tsx`.
- **Спільна робота в реальному часі** — кімнати за URL, синхронізація вказівника, завантаження зображень з Firebase під час колабу; **колаборація вимкнена в iframe**: `isCollabDisabled = isRunningInIframe()` у `excalidraw-app/App.tsx`, `excalidraw-app/collab/Collab.tsx`.
- **Експорт і публікація** — збереження зображення / на диск, експорт на бекенд (публічне посилання), кастомний UI для Excalidraw+ у діалозі експорту; експорт чекає на завантаження «висячих» зображень: `onExportToBackend`, `UIOptions.canvasActions.export`, `onExport` у `excalidraw-app/App.tsx`.
- **Знаходити дії без полювання по меню** — гаряча командна палітра, пошук по меню, пункти для колаборації / соцмереж / PWA: `CommandPalette` у `excalidraw-app/App.tsx`, `MainMenu.DefaultItems.CommandPalette` у `excalidraw-app/components/AppMainMenu.tsx`.
- **Доступність і зручність вводу** — глобальна обробка клавіатури в застосунку: `handleKeyboardGlobally={true}` у `excalidraw-app/App.tsx`.
- **Персоналізація** — тема (включно з системною), мова зі списку в головному меню: `useHandleAppTheme`, `LanguageList` у `excalidraw-app/components/AppMainMenu.tsx`.
- **Офлайн-подібний досвід** — реєстрація PWA service worker: `excalidraw-app/index.tsx` (`registerSW`), команда встановлення в палітрі (`labels.installPWA`).
- **Розширення через AI (опційно)** — діалог text-to-diagram (стрімінг на `VITE_APP_AI_BACKEND`) і diagram-to-code за кадром: `excalidraw-app/components/AI.tsx`, тригер `TTDDialogTrigger` у `excalidraw-app/App.tsx`.

---

## Сценарії користувача (верифіковані з коду)

### 1. Перший запуск і навігація по UI

- Користувач бачить центр привітання з логотипом, пунктами «завантажити сцену», довідка, за наявності — live collaboration; гість бачить посилання на реєстрацію Excalidraw+: `AppWelcomeScreen.tsx`.
- Підказки вказують на меню (гамбургер), тулбар і help: `WelcomeScreen.Hints.*` у тому ж файлі.
- Головне меню містить завантаження / збереження у файл, експорт, збереження як зображення, колаб (якщо не iframe), командну палітру, пошук, help, очистку полотна, соцмережі, Plus, sign in/up, налаштування, тему, мову, колір фону: `AppMainMenu.tsx`.

### 2. Робота з файлами та локальними даними

- Зміни сцени зберігаються в фоні; у колабі елементи синхронізуються через `collabAPI.syncElements`: `onChange` у `App.tsx`.
- При перевищенні квоти localStorage показується небезпечне попередження: `localStorageQuotaExceeded` + `t("alerts.localStorageQuotaExceeded")` у `App.tsx`.
- Бібліотека фігур — IndexedDB з міграцією зі старого localStorage: `useHandleLibrary` з `LibraryIndexedDBAdapter` у `App.tsx`.

### 3. Відкриття сцени з посилання або імпорт

- Backend JSON: хеш `#json=id,key`; спільне посилання кімнати обробляється `getCollaborationLinkData` / `collabAPI.startCollaboration`.
- Зовнішня сцена за URL: `#url=…` з `fetch` і `loadFromBlob`; помилка → `errorMessage` у стані (`alerts.invalidSceneUrl`).
- Логіка з підтвердженням перезапису та очищенням URL після імпорту: `initializeScene` у `App.tsx`.

### 4. Колаборація та ділення

- Десктоп (не мобільний), не iframe: у правому верхньому куті — банер Plus (за форм-фактором), індикатор помилки колабу, кнопка live collaboration: `renderTopRightUI` у `App.tsx`.
- Діалог шерингу отримує `onExportToBackend` для зліпка на бекенд: `ShareDialog` у `App.tsx`.
- Офлайн під час сесії — попередження: `isCollaborating && isOffline` у `App.tsx`.
- Після успішного `exportToBackend` показується `ShareableLinkDialog` з посиланням: `latestShareableLink` у `App.tsx`.

### 5. Експорт і перезапис файлів

- Діалог підтвердження перезапису містить дії для зображення, диска та Excalidraw+: `OverwriteConfirmDialog` у `App.tsx`.
- Користувач може відкрити text-to-diagram через `TTDDialogTrigger` (поруч з AI-компонентами): `App.tsx`.

### 6. Внутрішні посилання на елементи

- Клік по лінку елемента з типом «element link» скролить до цілі з анімацією замість звичайної навігації: `onLinkOpen` у `App.tsx`.

### 7. Окремі / спеціальні режими

- Вбудовування з того ж origin у iframe блокується повідомленням «I'm not a pretzel!»: `isSelfEmbedding` у `App.tsx`.
- Маршрут `/excalidraw-plus-export` ренерить окремий потік iframe-експорту в Plus: `ExcalidrawApp` у `App.tsx`, `ExcalidrawPlusIframeExport.tsx`.
- Бічна панель: вкладки «comments» і «presentation» з промо Excalidraw+ (не повноцінний продукт у OSS): `AppSidebar.tsx`.

### 8. Діагностика та стабільність

- Глобальний перехоплювач помилок з можливістю скинути localStorage: `TopErrorBoundary` у `App.tsx`.
- Sentry підключається на старті через side-effect import у `excalidraw-app/index.tsx` (`../excalidraw-app/sentry`).
- У dev — visual debug з меню та `DebugCanvas`: `AppMainMenu.tsx`, `App.tsx`.

---

## Обмеження та примітки для UX-письма

- **Мобільний vs десктоп:** частина колаб-UI прихована на мобільному (`renderTopRightUI` повертає `null` при `isMobile`).
- **Iframe:** без live collaboration у меню та welcome; решта редактора доступна.
- **Excalidraw+** — інтеграційні точки (меню, палітра, експорт, сайдбар, AI rate limit copy), зовнішні URL з `import.meta.env.VITE_APP_*`.

---

## Джерела в репозиторії (для верифікації)

| Зона | Файли |
|------|--------|
| Точка входу, PWA, Sentry | `excalidraw-app/index.tsx` |
| Склад застосунку, сцена, колаб, експорт, AI | `excalidraw-app/App.tsx` |
| Меню, welcome | `excalidraw-app/components/AppMainMenu.tsx`, `AppWelcomeScreen.tsx` |
| Сайдбар, футер | `AppSidebar.tsx`, `AppFooter.tsx` |
| Локальні дані / квота | `excalidraw-app/data/LocalData.ts`, `App.tsx` |
| AI | `excalidraw-app/components/AI.tsx` |
| Редактор (режими, тести UI props) | `packages/excalidraw` (наприклад `tests/excalidraw.test.tsx` для `UIOptions`, `zenModeEnabled`) |

Деталі стеку та команд — [docs/memory/techContext.md](./techContext.md); межі продукту — [docs/memory/projectbrief.md](./projectbrief.md).
