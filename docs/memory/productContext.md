# Product context (UX цілі та сценарії)

Опис побудований на публічному API та типах редактора (`packages/excalidraw/types.ts`, `packages/excalidraw/index.tsx`, `packages/common/src/constants.ts`). Це **не** окремий продуктовий документ від команди — лише те, що випливає з коду.

## UX-цілі (як їх можна прочитати з API)

- **Малювання та редагування діаграм** на canvas з набором інструментів, зафіксованих у типі `ToolType`: selection, lasso, rectangle, diamond, ellipse, arrow, line, freedraw, text, image, eraser, hand, frame, magicframe, embeddable, laser (`packages/excalidraw/types.ts`).
- **Керування виглядом сцени:** тема (`theme`), сітка (`gridModeEnabled`), режим перегляду без редагування (`viewModeEnabled`), зосереджений режим (`zenModeEnabled`), прив’язка об’єктів (`objectsSnapModeEnabled`) — усі як опційні пропси `ExcalidrawProps`.
- **Збереження та обмін даними:** колбек `onChange` отримує елементи, `AppState` і бінарні файли; `onExport` дозволяє перехопити експорт JSON / PNG з embedded scene; `onLibraryChange` — зміни бібліотеки (`ExcalidrawProps`).
- **Інтеграція в хост-застосунок:** слоти `renderTopLeftUI`, `renderTopRightUI`, `renderCustomStats`, `children` у `LayerUI`; кастомний рендер embeddable (`renderEmbeddable`), валідація URL (`validateEmbeddable`).
- **Доступність і вхід:** `autoFocus`, опція `handleKeyboardGlobally` для клавіатури; `langCode` для локалізації.
- **Колаборація (UX для кількох користувачів):** `isCollaborating`, `onPointerUpdate`, карта `collaborators` у `AppState` з полями для вказівника, лазера, вибору, імені, аватара, стану активності (`Collaborator`, `CollaboratorPointer` у `types.ts`); режим стеження `onUserFollow` / `UserToFollow`.
- **AI-функції (опційно):** проп `aiEnabled`; у класі `App` є гілки UI для magic frame (код у `App.tsx` перевіряє `props.aiEnabled !== false`).

## Сценарії користувача (підтримані можливостями коду)

1. **Створити сцену з нуля** — інструменти малювання, текст, зображення; початковий екран привітання контролюється станом (`showWelcomeScreen` у `getDefaultAppState`, умови в `App.render` для `renderWelcomeScreen` у `LayerUI`).
2. **Відкрити / зберегти сцену** — за замовчуванням увімкнені дії canvas (`DEFAULT_UI_OPTIONS` у `packages/common/src/constants.ts`): `loadScene`, `saveToActiveFile`, `clearCanvas`, `changeViewBackgroundColor`, `saveAsImage`, `export` з `saveFileToDisk: true`; `toggleTheme` за замовчуванням `null` і нормалізується в `index.tsx` разом із `theme` пропом.
3. **Експорт** — `ExportOpts` у `types.ts` підтримує `saveFileToDisk`, `onExportToBackend`, `renderCustomUI`; тип `onExport` обмежений `type: "json"` у коментарі до пропа.
4. **Робота з бібліотекою** — `libraryReturnUrl`, `onLibraryChange`; у `UIOptions.tools.image` можна вимкнути інструмент зображення (дефолт `true` у `index.tsx`).
5. **Вбудований контент** — типи для `ExcalidrawEmbeddableElement`, колбеки для відкриття посилань `onLinkOpen`, генерація посилань на виділення `generateLinkForSelection`.
6. **Колаборативна сесія** — покажчики та лазер інших учасників, відображення імен; у `excalidraw-app` додатково шар `Collab` (див. `projectbrief.md`).
7. **Адаптація під пристрій** — `UIOptions.getFormFactor(editorWidth, editorHeight)` для підміни `EditorInterface["formFactor"]` з хоста (`types.ts`).

## Обмеження / застаріле в API (з коментарів у коді)

- `UIOptions.welcomeScreen` позначено `@deprecated does nothing. Will be removed in 0.15` (`types.ts`).
- Проп `name` має коментар `@TODO come with better API before v0.18.0` (`types.ts`).

## Верифікація

- `packages/excalidraw/types.ts`: `ExcalidrawProps`, `ToolType`, `Collaborator`, `UIOptions`, `CanvasActions`.
- `packages/excalidraw/index.tsx`: злиття `UIOptions` з `DEFAULT_UI_OPTIONS`.
- `packages/common/src/constants.ts`: `DEFAULT_UI_OPTIONS`.

## Technical і Product docs

**Technical** (`docs/technical/`):

- [architecture.md](../technical/architecture.md)
- [dev-setup.md](../technical/dev-setup.md)
- [undocumented-behavior.md](../technical/undocumented-behavior.md)

**Product** (`docs/product/`):

- [PRD.md](../product/PRD.md) — зведений PRD з коду (поряд із цим файлом контексту продукту)
- [domain-glossary.md](../product/domain-glossary.md)
