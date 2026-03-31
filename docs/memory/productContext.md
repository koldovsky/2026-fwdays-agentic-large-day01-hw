# Product Context

## Призначення UX

- Excalidraw позиціонується як `Free, collaborative whiteboard` для швидкого sketching діаграм із hand-drawn feel.
- UX одночасно покриває два рівні:
  - hosted web app для кінцевих користувачів
  - embeddable React editor для інтеграції в інші продукти
- Базовий сценарій інтеграції навмисно простий: `<Excalidraw />` у контейнері з ненульовою висотою.

## Основні UX-цілі

- Мінімізувати час до першої взаємодії:
  - welcome screen показує короткі hints
  - перший інструмент ховає welcome screen у mobile test flow
- Дати кілька очевидних entrypoints для ключових дій:
  - load scene
  - help
  - live collaboration
  - search / command palette
  - export / save as image
- Зробити sharing/collaboration частиною основного UI, а не другорядною функцією.
- Підтримати довіру користувача:
  - encrypted/privacy messaging у футері та share dialog
- Підтримати персоналізацію:
  - theme toggle
  - preferences
  - language switching
- Підтримати розширені сценарії:
  - AI text-to-diagram
  - diagram-to-code
  - library import/use
  - Excalidraw+ related entrypoints

## Ключові користувацькі сценарії

### 1. Швидкий старт на canvas

- App entry монтує `ExcalidrawApp` і одразу рендерить editor.
- Welcome screen містить:
  - menu hint
  - toolbar hint
  - help hint
  - `Load scene`
  - `Help`
  - optional `Live collaboration`
- Для гостьового користувача welcome screen також містить `Sign up` link.

### 2. Робота з документом / scene

- Main menu дає стандартні дії:
  - load scene
  - save to active file
  - export
  - save as image
  - clear canvas
- Command palette дублює app-level дії для швидкого доступу.
- Export flow підтримує backend share link і окремий export в Excalidraw+.

### 3. Спільна робота

- Live collaboration доступний із:
  - welcome screen
  - main menu
  - top-right trigger
  - command palette
- Share dialog дозволяє:
  - стартувати collaboration session
  - копіювати room link
  - викликати native share API, якщо доступний
  - завершувати session
- Активна collaboration session супроводжується privacy copy і QR code.

### 4. Надійне локальне використання

- App зберігає scene locally через `LocalData`.
- Є PWA install flow через command palette.
- Є offline warning під час collaboration.
- Є warning, коли browser storage quota exceeded.

### 5. Адаптація під пристрої та мову

- Mobile form factor окремо тестується в `MobileMenu.test.tsx`.
- Welcome screen зникає після взаємодії користувача.
- Language switching окремо тестується в `LanguageList.test.tsx`.
- Theme/system theme доступні через main menu.

### 6. Розширені сценарії

- Sidebar промотує comments і presentations flows через Excalidraw+.
- AI layer містить:
  - `DiagramToCodePlugin`
  - `TTDDialog` для text-to-diagram
- Mermaid import/editing UX присутній через `TTDDialog` і окремі тести.
- Library UX покриває import, drop і вставку reusable items.

## UX-принципи, які прямо видно в коді

- Multiple entrypoints for same intent:
  - collaboration
  - sharing
  - help/community links
- Progressive enhancement:
  - native share only when supported
  - PWA install only when prompt available
  - AI depends on backend env
- Hosted app + embedded product coexist without forked editor core.

## Details
For detailed architecture → see docs/technical/architecture.md
For domain glossary → see docs/product/domain-glossary.md
