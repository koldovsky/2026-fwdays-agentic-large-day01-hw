# Tech Context — Excalidraw

## Вимоги до оточення

| | Версія | Джерело |
|---|---|---|
| Node.js | >=18.0.0 | `package.json` → `engines` |
| Yarn | 1.22.22 | `package.json` → `packageManager` |

`.npmrc`:
```
save-exact=true
legacy-peer-deps=true
```

---

## Основний стек

### Мова та типізація
| | Версія |
|---|---|
| TypeScript | 5.9.3 |
| Mode | strict, ESNext, ESM |
| Config | `tsconfig.json` (root) + per-package `tsconfig.json` |

Path aliases (`tsconfig.json`):
```json
"@excalidraw/common"    → "./packages/common/src/index.ts"
"@excalidraw/element"   → "./packages/element/src/index.ts"
"@excalidraw/math"      → "./packages/math/src/index.ts"
"@excalidraw/utils"     → "./packages/utils/src/index.ts"
"@excalidraw/excalidraw"→ "./packages/excalidraw/index.tsx"
```

### UI
| | Версія | Роль |
|---|---|---|
| React | 19.0.0 (app), peer ^17/^18/^19 | UI framework |
| React DOM | 19.0.0 | DOM rendering |
| Sass | 1.51.0 | CSS preprocessing |

### State Management
| | Версія | Роль |
|---|---|---|
| Jotai | 2.11.0 | Atomic state (ізольований на інстанцію) |
| jotai-scope | 0.7.2 | Scoping для Jotai |
| tunnel-rat | 0.1.2 | Portal-комунікація між компонентами |

### Графіка
| | Версія | Роль |
|---|---|---|
| roughjs | 4.6.4 | Стиль "від руки" |
| perfect-freehand | 1.2.0 | Гладкі лінії (freedraw) |
| pica | 7.1.1 | Ресайз зображень |
| png-chunks-extract/encode | 1.0.0 | PNG маніпуляція |

### Колаборація
| | Версія | Роль |
|---|---|---|
| firebase | 11.3.1 | Cloud storage для колаборації |
| socket.io-client | 4.7.2 | Real-time комунікація |

---

## Build Tools

### Bundler
| | Версія | Використання |
|---|---|---|
| Vite | 5.0.12 | Dev server + app build |
| ESBuild | 0.19.10 | Packages build |

- App config: `excalidraw-app/vite.config.mts`
- Packages build: `scripts/buildPackage.js`, `scripts/buildBase.js`
- WASM: `scripts/buildWasm.js` (hb-subset.wasm, woff2.wasm)

### Testing
| | Версія | Роль |
|---|---|---|
| Vitest | 3.0.6 | Test runner (замінює Jest) |
| @vitest/ui | 2.0.5 | UI для тестів |
| @vitest/coverage-v8 | 3.0.7 | Coverage |
| jsdom | 22.1.0 | DOM emulation |
| @testing-library/react | 16.2.0 | React testing utils |

Config: `vitest.config.mts` (root)

### Linting & Formatting
| | Версія | Config |
|---|---|---|
| ESLint | — | `.eslintrc.json` |
| Prettier | 2.6.2 | `.prettierignore` |
| lint-staged | 12.3.7 | `.lintstagedrc.js` |
| Husky | 7.0.4 | `.husky/pre-commit` |

---

## Команди

### Development
```bash
yarn start              # Dev server (excalidraw-app, порт 3000)
```

### Build
```bash
yarn build              # Збірка web app
yarn build:packages     # Збірка всіх npm-пакетів
```

Порядок збірки пакетів (`scripts/buildPackage.js`):
1. `@excalidraw/common`
2. `@excalidraw/math`
3. `@excalidraw/element`
4. `@excalidraw/excalidraw`

### Testing
```bash
yarn test               # Всі тести (Vitest)
yarn test:coverage      # З coverage репортом
yarn test:ui            # Vitest UI (браузерний інтерфейс)
yarn test:all           # typecheck + eslint + prettier + тести
```

### Code Quality
```bash
yarn fix                # Auto-fix: eslint + prettier
yarn typecheck          # tsc --noEmit
```

---

## Виходи збірки

```
dist/                   # Web app build (vite build)
packages/*/dist/        # npm packages (cjs + esm)
packages/excalidraw/types/  # Згенеровані .d.ts (у .gitignore)
```

---

## Конфігураційні файли

| Файл | Призначення |
|---|---|
| `tsconfig.json` | Root TypeScript (strict, ESNext, path aliases) |
| `vitest.config.mts` | Тести (jsdom, setupTests.ts, aliases) |
| `.eslintrc.json` | ESLint (забороняє прямі Jotai imports, import order) |
| `excalidraw-app/vite.config.mts` | Vite для веб-аплікації |
| `scripts/buildPackage.js` | Послідовна збірка пакетів |
| `.env.development` / `.env.production` | Env vars (Firebase, Socket.io URLs) |
| `crowdin.yml` | Конфіг Crowdin (локалізація) |
| `docker-compose.yml` | Docker-оточення |
| `vercel.json` | Vercel deploy config |

---

## See also

| Документ | Що містить |
|---|---|
| [`docs/memory/projectbrief.md`](./projectbrief.md) | Мета проєкту, можливості, публічне API |
| [`docs/memory/systemPatterns.md`](./systemPatterns.md) | Архітектура, патерни, component tree |
| [`docs/technical/architecture.md`](../technical/architecture.md) | Детальна архітектура з mermaid-діаграмами, data flow, rendering pipeline |
| [`docs/product/domain-glossary.md`](../product/domain-glossary.md) | Словник термінів (ExcalidrawElement, Scene, AppState, Action, ...) |
