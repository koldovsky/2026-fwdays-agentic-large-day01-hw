# Product context

## UX-цілі продукту

- **Швидкий старт без налаштувань:** `excalidraw-app/index.tsx` одразу монтує `ExcalidrawApp`, реєструє service worker (`registerSW()`), що орієнтує продукт на "відкрив і працює".
- **Зрозумілий onboarding:** `WelcomeScreen` рендерить `Center`, `MenuHint`, `ToolbarHint`, `HelpHint` у дефолтному стані.
- **Орієнтація на спільну роботу:** `LiveCollaborationTrigger` має стан `isCollaborating`, показує кнопку Share/іконку та лічильник `collaborators.size`.
- **Низький friction для частих дій:** у `MainMenu/DefaultItems` винесені load/save/export/help/search/command palette/clear canvas.
- **Вбудовуваність у чужі продукти:** `@excalidraw/excalidraw` надає React-компонент і imperative API (`onChange`, `onExport`, `onPointerUpdate`, `onIncrement`, `onMount` тощо).

## Базові користувацькі сценарії (з коду)

1. **Створити/редагувати сцену**
   - Точка входу: `Excalidraw` компонент (`packages/excalidraw/index.tsx`).
   - Сигнали інтеграції: `onChange`, `onIncrement`, `onPointerUpdate`.

2. **Завантажити існуючу сцену**
   - Меню: `DefaultItems.LoadScene`.
   - Перед перезаписом є confirm-модалка (`openConfirmModal`) якщо сцена не порожня.

3. **Зберегти роботу**
   - `DefaultItems.SaveToActiveFile` викликає `actionSaveToActiveFile`.
   - Гаряча клавіша для save підтягується з `getShortcutFromShortcutName("saveScene")`.

4. **Експортувати результат**
   - `DefaultItems.SaveAsImage` відкриває діалог `openDialog: { name: "imageExport" }`.
   - Додатково в API присутній `onExport` для зовнішнього контролю.

5. **Колаборація в реальному часі**
   - В UI є `LiveCollaborationTrigger`.
   - У типах є `Collaborator`, `SocketId`, collaborator pointer/tool (`pointer`/`laser`), стани mute/speaking/call.

6. **Вбудування в сторонній React-додаток**
   - Пакет `@excalidraw/excalidraw` експортує основний компонент, стилі (`./index.css`) та типи.
   - Приклади інтеграції: `examples/with-script-in-browser`, `examples/with-nextjs`.

## UX-поведінка для різних формфакторів

- `MainMenu` має умовну поведінку для `phone` (рендер collaborator list у меню на мобільному).
- `LiveCollaborationTrigger` перемикає "іконка only" для малих ширин/не-desktop (`MQ_MIN_WIDTH_DESKTOP`).

## Явні обмеження/рамки (що видно з репо)

- Це web-first продукт (React + Vite + jsdom тести), а не нативний mobile-клієнт.
- У репо немає окремого продуктового PRD; продуктовий контекст зчитується з компонентів UI, API контрактів і прикладів.

## Source verification

- `excalidraw-app/index.tsx`
- `packages/excalidraw/index.tsx`
- `packages/excalidraw/components/welcome-screen/WelcomeScreen.tsx`
- `packages/excalidraw/components/live-collaboration/LiveCollaborationTrigger.tsx`
- `packages/excalidraw/components/main-menu/MainMenu.tsx`
- `packages/excalidraw/components/main-menu/DefaultItems.tsx`
- `packages/excalidraw/types.ts`

## Details

- For product requirements and roadmap-level intent -> see `docs/product/PRD.md`
- For canonical domain terminology used in UX and API naming -> see `docs/product/domain-glossary.md`
- For technical architecture that implements these product behaviors -> see `docs/technical/architecture.md`
