# Tech Context: Excalidraw

## Стек та версії

| Категорія         | Технологія          | Версія   |
| ----------------- | ------------------- | -------- |
| UI                | React               | 19.0.x   |
| Мова              | TypeScript          | 5.9.x    |
| Збірка            | Vite                | 5.0.x    |
| Пакетний менеджер | Yarn Workspaces     | 1.22.22  |
| Стан (глобальний) | Jotai + jotai-scope | 2.11.x / 0.7.x |
| Стилі             | SCSS (Sass)         | via Vite |
| Тести             | Vitest              | 3.0.x    |
| Node.js           | min required        | ≥18.0.0  |

## Ключові бібліотеки

| Бібліотека                          | Призначення                        |
| ----------------------------------- | ---------------------------------- |
| `roughjs`                           | Рукописний стиль SVG/canvas        |
| `nanoid`                            | Генерація ID елементів             |
| `lodash.throttle`                   | Throttle pointer events            |
| `socket.io-client`                  | WebSocket collab                   |
| `pako`                              | Binary compression для share links |
| `@excalidraw/mermaid-to-excalidraw` | Mermaid diagram converter          |
| `firebase`                          | Shared scene storage               |
| `idb-keyval`                        | IndexedDB для файлів і бібліотек   |

## Vite конфіг (важливі деталі)

- Dev port: `3001` (з `VITE_APP_PORT`)
- PWA: `vite-plugin-pwa`, `registerType: "autoUpdate"`
- Шрифти: окрема стратегія кешування `CacheFirst`, 90 днів
- Locales: lazy-loaded chunks, окремий cache `locales/`
- Source maps: увімкнені в build
- Aliases: `@excalidraw/*` → `packages/*/src/index.ts` (локально)

## Скрипти

```bash
yarn start              # Dev server (excalidraw-app), порт 3001
yarn build              # Продакшн збірка
yarn build:packages     # Збірка всіх npm-пакетів (common→math→element→excalidraw)
yarn test               # Vitest (всі тести)
yarn test:typecheck     # tsc --noEmit
yarn test:code          # ESLint --max-warnings=0
yarn fix                # auto-fix ESLint + Prettier
yarn release            # Release скрипт
```

## Env змінні (development)

```text
VITE_APP_BACKEND_V2_GET_URL    # JSON backend (share links)
VITE_APP_BACKEND_V2_POST_URL   # JSON backend POST
VITE_APP_WS_SERVER_URL         # WebSocket collab (default: localhost:3002)
VITE_APP_FIREBASE_CONFIG       # Firebase JSON config
VITE_APP_PLUS_APP              # Excalidraw Plus URL
VITE_APP_AI_BACKEND            # AI backend (TTD dialog)
VITE_APP_ENABLE_PWA            # Enable PWA in dev (default: false)
VITE_APP_ENABLE_ESLINT         # ESLint в dev overlay (default: true)
```

## Структура пакетів

```text
packages/
├── common/     @excalidraw/common    — константи, утиліти, EVENT types
├── element/    @excalidraw/element   — типи, логіка елементів, Scene, Store
├── math/       @excalidraw/math      — Point, Vector, Radians types
└── excalidraw/ @excalidraw/excalidraw — React компонент, публічне API
```

## Правила кодування (`.github/copilot-instructions.md`)

- TypeScript для всього нового коду
- Functional React components + hooks
- Prefer immutable data (`const`, `readonly`)
- Use `?.` та `??` (optional chaining, nullish coalescing)
- PascalCase для компонентів/типів, camelCase для змінних
- Prefer performance: trade RAM for CPU cycles
- Math: завжди використовувати `Point` тип з `packages/math/src/types.ts`

## Тестування

- **Vitest** + `vitest-canvas-mock` + `jsdom`
- Файли тестів: `*.test.ts` / `*.test.tsx` поруч з файлами
- Canvas API мокується через `vitest-canvas-mock`
- `yarn test:app --update` — оновлення snapshots
- Coverage: `yarn test:coverage`

## CI/CD

- GitHub Actions (`/.github/workflows/`)
- Pre-commit: Husky + lint-staged (ESLint + Prettier перед кожним commit)
- Release: `node scripts/release.js` → npm publish + git tag
