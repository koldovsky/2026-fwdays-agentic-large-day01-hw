# System Patterns

## Архітектура

### Монорепо + публічні пакети

```text
Monorepo (Yarn Workspaces)
│
├── excalidraw-app/       ← SPA-застосунок (споживає packages)
│
└── packages/
    ├── common/           ← утиліти без залежностей від React
    ├── math/             ← 2D геометрія (залежить від common)
    ├── element/          ← логіка елементів (залежить від common, math)
    ├── excalidraw/       ← React-компонент (залежить від усіх вище)
    └── utils/            ← загальні хелпери
```

Залежності між пакетами — одностороннє дерево:
`common` ← `math` ← `element` ← `excalidraw` ← `excalidraw-app`

---

## Ключові патерни

### 1. Canvas Rendering Engine (`packages/excalidraw/renderer/`)

- Малювання — через HTML5 `<canvas>`, не DOM
- Rough.js генерує ефект «від руки» для кожного примітиву
- Perfect-freehand згладжує шлях при вільному малюванні
- Повне перемальовування при кожній зміні сцени (immutable-підхід)

### 2. State Management — Jotai Atoms (`excalidraw-app/app-jotai.ts`)

- Глобальний стан через атоми Jotai (атомарний, composable)
- Немає Redux/Context-«глобального об'єкта» — кожен шматок стану незалежний
- `app-jotai.ts` — файл з атомами для app-рівня (не бібліотека)

### 3. Scene Management (`packages/excalidraw/scene/`)

- Сцена = immutable snapshot елементів + appState
- Зміни відбуваються через action-диспетч, не мутацію
- History / undo-redo через версійний snapshot store (`versionedSnapshotStore.ts`)

### 4. Actions System (`packages/excalidraw/actions/`)

- Всі команди користувача — окремі action-об'єкти
- Єдиний dispatch-механізм
- Спрощує тестування і command palette

### 5. Real-time Collaboration (`excalidraw-app/collab/`)

- Socket.IO WebSocket
- Reconciliation при отриманні змін від інших клієнтів
- End-to-end шифрування (ключ в URL-хеші, не передається серверу)
- Firebase Firestore для persistence сесій

### 6. Error Boundaries

- `TopErrorBoundary.tsx` — React error boundary на рівні застосунку
- Sentry інтегрований (`excalidraw-app/sentry.ts`) для production-репортинга

### 7. PWA / Offline

- Vite Plugin PWA + Workbox
- Service Worker для офлайн-кешування
- Роздільне кешування: fonts (90 днів), locales (30 днів)
- Реєстрація SW у `excalidraw-app/index.tsx`

### 8. i18n (`packages/excalidraw/locales/`)

- i18next + language detector
- Локалі виносяться в окремі JS-чанки (lazy-load)
- Crowdin для управління перекладами

### 9. Data Layer (`packages/excalidraw/data/`, `excalidraw-app/data/`)

- Серіалізація / десеріалізація сцени у JSON
- Підтримка PNG/SVG з вбудованими метаданими сцени
- idb-keyval для локального зберігання в IndexedDB

### 10. Font System

- Кастомні шрифти: Virgil (handwritten), Cascadia (mono), Assistant (sans)
- WOFF2 конвертація через `scripts/woff2/`
- Font subsetting для зменшення розміру (`packages/excalidraw/subset/`)
- Font metadata у `packages/common/src/font-metadata.ts`

---

## Ключові компоненти застосунку

| Файл / Директорія                        | Роль                                           |
|------------------------------------------|------------------------------------------------|
| `excalidraw-app/App.tsx`                 | Головний компонент, orchestration              |
| `excalidraw-app/index.tsx`               | React entry point, SW реєстрація               |
| `excalidraw-app/collab/Collab.tsx`       | Менеджер колаборації                           |
| `excalidraw-app/components/AI.tsx`       | AI-інтеграція                                  |
| `excalidraw-app/components/AppMainMenu`  | Головне меню                                   |
| `packages/excalidraw/index.tsx`          | Публічний API бібліотеки                       |
| `packages/excalidraw/renderer/`          | Canvas rendering engine                        |
| `packages/excalidraw/scene/`             | Менеджер стану сцени                           |
| `packages/excalidraw/actions/`           | Action system                                  |
| `packages/excalidraw/data/`              | Серіалізація, persistence                      |
| `packages/excalidraw/hooks/`             | Кастомні React hooks                           |
| `packages/common/src/appEventBus.ts`     | Event bus для cross-component комунікації      |
| `packages/common/src/versionedSnapshotStore.ts` | History / undo-redo store              |

---

## Патерни якості коду

- **TypeScript strict mode** — `tsconfig.json` strict: true
- **ESLint** — `@excalidraw/eslint-config` + кастомні правила
- **Prettier** — форматування
- **Husky + lint-staged** — pre-commit перевірки
- **Vitest** — unit-тести у кожному пакеті та в app
- **Coverage thresholds** — enforced у CI (lines 60%, branches 70%)

---

## Deployment патерн

```text
Development:
  yarn start → Vite dev server (port 3001) → localhost Firebase + WebSocket

Production build:
  yarn build → packages built first → excalidraw-app/build/

Deploy:
  Vercel (основний) або Docker self-hosted
  Firebase для колаборації / storage
```

## Details

For detailed architecture → see [docs/technical/architecture.md](../technical/architecture.md)
For domain glossary → see [docs/product/domain-glossary.md](../product/domain-glossary.md)
