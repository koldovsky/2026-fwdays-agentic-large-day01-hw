# Active Context: Excalidraw

> Оновлено: 2026-03-25

## Поточний стан репозиторію

- **Остання стабільна версія**: `0.18.0` (2025-03-11)
- **Unreleased** зміни вже у `main`:
  - `onMount` / `onInitialize` / `onUnmount` props
  - `ExcalidrawAPIProvider` + `useExcalidrawAPI()` exported
  - `onExport` async generator prop
  - `ExcalidrawAPI.isDestroyed` флаг
  - Renamed `excalidrawAPI` prop → `onExcalidrawAPI`

## Активна гілка розробки: Unreleased API changes

### Breaking changes у підготовці
- `excalidrawAPI` prop перейменовано в `onExcalidrawAPI`
- Тепер `onExcalidrawAPI` викликається на mount (а не в constructor)
- На unmount — викликається з `null`

### Нові pub/sub lifecycle events
```ts
api.onEvent("editor:mount", ({ excalidrawAPI, container }) => { ... });
api.onEvent("editor:initialize").then((api) => { api.scrollToContent(); });
api.onEvent("editor:unmount", () => { ... });
```

### Нові хуки для host apps
- `useExcalidrawAPI()` — отримати API поза деревом `<Excalidraw>`
- `useExcalidrawStateValue(prop)` — реактивна підписка на AppState
- `useOnExcalidrawStateChange(prop, callback)` — callback при зміні

## Фокусні теми (з CHANGELOG Unreleased)

1. **Lifecycle events API** — стандартизація `editor:mount/initialize/unmount`
2. **Host app integration** — `ExcalidrawAPIProvider`, `isDestroyed`
3. **Async export** — `onExport` async generator з прогрес-тостом

## Відомі технічні борги

- `App.tsx` ~12 800 рядків — God Object, складно тестувати
- Pointer events — mix of native та manual handling (TODO у коментарі ~L689)
- `structuredClone` видалено (#9128) — perf fix
- `defaultProps` видалено (#9035) — React 19 compat

## Активні зовнішні сервіси (dev)

| Сервіс | URL | Статус |
|---|---|---|
| JSON backend | `json-dev.excalidraw.com` | Prod dev instance |
| WebSocket collab | `localhost:3002` | Потрібен локально |
| AI backend | `localhost:3016` | Для TTD dialog |
| Firebase | `excalidraw-oss-dev` project | Dev Firebase project |

## Що потрібно для локального запуску

```bash
# 1. Install
yarn install

# 2. Env (опціонально, потрібно для collab та AI)
cp .env.development .env.development.local
# Відредагувати VITE_APP_FIREBASE_CONFIG, VITE_APP_WS_SERVER_URL

# 3. Run
yarn start   # Dev server на :3001

# 4. Tests
yarn test    # Vitest
yarn test:typecheck  # TypeScript check
```

## Packages build order (важливо!)

```
common → math → element → excalidraw
```
Через залежності між пакетами. Команда: `yarn build:packages`

## Останні значимі фічі (v0.18.0)

- Command palette (⌘K) — #7804
- Multiplayer undo/redo — #7348
- Elbow arrows — #8299
- Flowcharts — #8329
- Image cropping — #8613
- Scene search — #8438
- Element linking — #8812
- Text wrapping — #7999
- Font picker + CJK fonts — #8012, #8530
