# Technical Stack

## Language & Compilation Target

- **TypeScript 5.9.3** (see root `package.json`)
- Target: **ESNext** (see `tsconfig.json` → `compilerOptions.target`)
- Strict mode enabled, JSX: `react-jsx`

## Framework

- **React 19.0.0** (see `excalidraw-app/package.json`)
- Peer dependency range: `^17.0.2 || ^18.2.0 || ^19.0.0` (see `packages/excalidraw/package.json`)
- **Vite 5.0.12** as bundler and dev server (see root `package.json`)

## State Management

- **Jotai 2.11.0** — lightweight atomic state (see `packages/excalidraw/package.json`)
- **jotai-scope 0.7.2** — scoped Jotai providers for editor isolation (see `packages/excalidraw/editor-jotai.ts`)
- Two Jotai stores: `appJotaiStore` (app-level, `excalidraw-app/app-jotai.ts`) and `editorJotaiStore` (editor-level, `packages/excalidraw/editor-jotai.ts`)
- Imperative `AppState` object managed by the `App` class component internally

## Styling

- **SCSS** (sass 1.51.0) for component styles (see `excalidraw-app/index.scss`, `packages/excalidraw/css/`)
- CSS modules referenced in components
- No CSS-in-JS library

## Testing

- **Vitest 3.0.6** as test runner (see root `package.json`, `vitest.config.mts`)
- **@testing-library/react 16.2.0** + **@testing-library/jest-dom 6.6.3**
- **vitest-canvas-mock 0.3.3** for canvas API mocking
- **fake-indexeddb 3.1.7** for IndexedDB mocking in tests
- **jsdom 22.1.0** as test environment
- Coverage thresholds: lines 60%, branches 70%, functions 63%, statements 60%
- 127 test files across the monorepo

## Commands

| Command | Description |
|---------|-------------|
| `yarn start` | Start Vite dev server (port 3001 via `.env.development`) |
| `yarn test:app` | Run unit tests in watch mode (Vitest) |
| `yarn test:app --watch=false` | Run tests once (CI mode) |
| `yarn test:all` | Full suite: typecheck + lint + prettier + unit tests |
| `yarn build:app` | Build production app via Vite |
| `yarn build:packages` | Build all packages: common → math → element → excalidraw |
| `yarn build` | Build app (alias for `build:app`) |
| `yarn test:code` | Run ESLint (max 0 warnings) |
| `yarn test:other` | Check Prettier formatting |
| `yarn test:typecheck` | Run TypeScript type checking |

## Build & Bundle

- **Vite** for dev server and production builds
- Vite plugins: `@vitejs/plugin-react`, `vite-plugin-svgr`, `vite-plugin-ejs`, `vite-plugin-pwa`, `vite-plugin-checker`, `vite-plugin-html`, `vite-plugin-sitemap`
- **esbuild** used for package builds (`scripts/buildPackage.js`)
- Package build scripts: `yarn build:packages` builds common → math → element → excalidraw in order

## CI/CD & Deployment

- **Vercel** for production hosting (see `vercel.json`, output: `excalidraw-app/build`)
- **Docker** with multi-stage build: Node 18 build → Nginx 1.27-alpine serve (see `Dockerfile`, `docker-compose.yml`)
- **Husky 7.0.4** + **lint-staged 12.3.7** for pre-commit hooks

## External Services

| Service | Purpose | Config Location |
|---------|---------|----------------|
| **Firebase** (Firestore + Storage) | Collaboration persistence, file storage | `excalidraw-app/data/firebase.ts`, env `VITE_APP_FIREBASE_CONFIG` |
| **Sentry** | Error tracking (production only) | `excalidraw-app/sentry.ts` |
| **Crowdin** | Localization management | `crowdin.yml` → `packages/excalidraw/locales/` |
| **Socket.IO** | Real-time WebSocket for collaboration | `excalidraw-app/collab/Portal.tsx` |

## Monorepo Tooling

- **Yarn 1.22.22** workspaces (classic, not Berry)
- Workspaces: `excalidraw-app`, `packages/*`, `examples/*`
- Path aliases via `tsconfig.json` paths and Vite `resolve.alias`
- Packages scoped under `@excalidraw/` namespace

## Key Dependencies

| Dependency | Purpose |
|-----------|---------|
| `roughjs 4.6.4` | Hand-drawn rendering style |
| `perfect-freehand 1.2.0` | Freehand stroke rendering |
| `fractional-indexing 3.2.0` | Element ordering for collaboration |
| `pako 2.0.3` | Compression (deflate/inflate) for data encoding |
| `nanoid 3.3.3` | Unique ID generation |
| `clsx 1.1.1` | CSS class composition |
| `lodash.throttle / lodash.debounce` | Rate limiting |
| `socket.io-client 4.7.2` | WebSocket client for collab |
| `firebase 11.3.1` | Firebase SDK |
| `@excalidraw/mermaid-to-excalidraw 2.1.1` | Mermaid diagram conversion |
| `@excalidraw/laser-pointer 1.3.1` | Laser pointer animation |
| `browser-fs-access 0.38.0` | File system access API |
| `image-blob-reduce 3.0.1` / `pica 7.1.1` | Image resizing |
| `radix-ui 1.4.3` | UI primitives (dropdowns, dialogs) |
| `@codemirror/*` | Code editor for Mermaid/TTD input |

## Cross-References

- For project overview → see [`docs/memory/projectbrief.md`](projectbrief.md)
- For architecture → see [`docs/technical/architecture.md`](../technical/architecture.md)
- For system patterns → see [`docs/memory/systemPatterns.md`](systemPatterns.md)
- For key decisions → see [`docs/memory/decisionLog.md`](decisionLog.md)
