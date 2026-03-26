# Tech Context — Excalidraw Monorepo

> **See also:**
[Developer Setup Guide](../technical/dev-setup.md)
[Architecture Description](../technical/architecture.md)

## Language & Runtime

- **TypeScript** 5.9.3 — strict mode, `noEmit`, `ESNext` target
- **Node.js** >= 18.0.0 (enforced via `engines` in `package.json`)
- **JSX**: `react-jsx` (automatic runtime, no manual `React` imports needed)

## Core Framework

- **React** 19.0.0 (app); library peer-supports `^17.0.2 || ^18.2.0 || ^19.0.0`
- **react-dom** 19.0.0

## Build Tooling

| Tool | Version | Where |
|------|---------|-------|
| **Vite** | 5.0.12 | App dev server + production build |
| **esbuild** | 0.19.10 | Package builds (`scripts/buildPackage.js`) |
| **@vitejs/plugin-react** | 3.1.0 | React Fast Refresh in Vite |
| **vite-plugin-pwa** | 0.21.1 | Service worker + PWA manifest |
| **vite-plugin-checker** | 0.7.2 | TS + ESLint overlay in dev |
| **vite-plugin-svgr** | 4.2.0 | SVG as React components |
| **vite-plugin-ejs** | 1.7.0 | EJS templates in HTML |
| **vite-plugin-html** | 3.2.2 | HTML minification |
| **vite-plugin-sitemap** | 0.7.1 | Sitemap generation for excalidraw.com |
| **sass** | 1.51.0 | SCSS compilation (in excalidraw package) |
| **autoprefixer** | 10.4.7 | CSS vendor prefixes |

## Package Manager

- **Yarn 1** (Classic) — `packageManager: "yarn@1.22.22"` in root
- `.npmrc`: `save-exact=true`, `legacy-peer-deps=true`

## State Management

- **Jotai** 2.11.0 — atomic state
- **jotai-scope** 0.7.2 — isolated editor store
- Two store boundaries:
  - `editor-jotai` — for the excalidraw editor internals
  - `app-jotai` — for the host application layer

## Key Libraries (Runtime)

| Library | Version | Purpose |
|---------|---------|---------|
| **roughjs** | 4.6.4 | Hand-drawn rendering of shapes |
| **perfect-freehand** | 1.2.0 | Freehand drawing strokes |
| **nanoid** | 3.3.3 | Unique ID generation |
| **pako** | 2.0.3 | Gzip compression for data sharing |
| **clsx** | 1.1.1 | Conditional CSS class names |
| **radix-ui** | 1.4.3 | Accessible UI primitives |
| **@codemirror/*** | ^6.0.0 | Code/text editing (Mermaid, etc.) |
| **@lezer/highlight** | ^1.0.0 | Syntax highlighting for CodeMirror |
| **@excalidraw/mermaid-to-excalidraw** | 2.1.1 | Mermaid diagram conversion |
| **browser-fs-access** | 0.38.0 | File System Access API polyfill |
| **fractional-indexing** | 3.2.0 | Z-order indexing for elements |
| **pica** | 7.1.1 | High-quality image resizing |
| **lodash.debounce** | 4.0.8 | Debouncing utility |
| **lodash.throttle** | 4.1.1 | Throttling utility |
| **pwacompat** | 2.0.17 | PWA compatibility shims |
| **@braintree/sanitize-url** | 6.0.2 | URL sanitization (XSS prevention) |
| **tunnel-rat** | 0.1.2 | React portal-like rendering |

## App-Specific Dependencies

| Library | Version | Purpose |
|---------|---------|---------|
| **firebase** | 11.3.1 | Cloud storage + Firestore |
| **@sentry/browser** | 9.0.1 | Error tracking |
| **socket.io-client** | 4.7.2 | Real-time collaboration |
| **idb-keyval** | 6.0.3 | Simple IndexedDB key-value store |
| **i18next-browser-languagedetector** | 6.1.4 | Language detection |

## Testing

| Tool | Version | Purpose |
|------|---------|---------|
| **Vitest** | 3.0.6 | Test runner (Vite-native) |
| **jsdom** | 22.1.0 | Browser environment simulation |
| **@testing-library/react** | 16.2.0 | React component testing |
| **@testing-library/jest-dom** | 6.6.3 | DOM assertion matchers |
| **vitest-canvas-mock** | 0.3.3 | Canvas API mock for tests |
| **fake-indexeddb** | 3.1.7 | IndexedDB mock |
| **@vitest/coverage-v8** | 3.0.7 | Code coverage (V8-based) |

### Coverage Thresholds (from `vitest.config.mts`)

- Lines: 60%
- Branches: 70%
- Functions: 63%
- Statements: 60%

## Linting & Formatting

- **ESLint** — extends `@excalidraw/eslint-config` + `react-app`
  - Enforces `import/order` with `@excalidraw/**` grouping
  - Enforces `consistent-type-imports` (separate type imports)
  - Restricts direct `jotai` imports (must use `editor-jotai` / `app-jotai`)
  - Restricts barrel imports within `packages/excalidraw/`
- **Prettier** 2.6.2 — config via `@excalidraw/prettier-config`
- **Husky** 7.0.4 + **lint-staged** 12.3.7 — pre-commit hooks

## NPM Scripts (Root)

### Development
- `yarn start` — Vite dev server (port 3000 by default)
- `yarn start:production` — build + serve on port 5001
- `yarn start:example` — build packages + run browser example

### Building
- `yarn build` — build the app (`excalidraw-app/build`)
- `yarn build:packages` — build all library packages (common → math → element → excalidraw)
- `yarn build:app:docker` — production build with Sentry disabled

### Testing
- `yarn test` — run Vitest in watch mode
- `yarn test:all` — typecheck + eslint + prettier + tests
- `yarn test:typecheck` — `tsc` (no emit)
- `yarn test:code` — ESLint
- `yarn test:other` — Prettier check
- `yarn test:coverage` — Vitest with V8 coverage

### Code Quality
- `yarn fix` — auto-fix Prettier + ESLint issues
- `yarn fix:code` — ESLint `--fix`
- `yarn fix:other` — Prettier `--write`

### Cleanup
- `yarn rm:build` — remove all build outputs
- `yarn rm:node_modules` — remove all node_modules
- `yarn clean-install` — remove node_modules + reinstall

## Environment Variables

Loaded from `.env.*` at repo root (via `envDir: "../"` in Vite config):

| Variable | Purpose |
|----------|---------|
| `VITE_APP_BACKEND_V2_GET_URL` | Backend GET endpoint |
| `VITE_APP_BACKEND_V2_POST_URL` | Backend POST endpoint |
| `VITE_APP_WS_SERVER_URL` | WebSocket server URL |
| `VITE_APP_FIREBASE_CONFIG` | Firebase config (JSON string) |
| `VITE_APP_PORT` | Dev server port (default 3000) |
| `VITE_APP_ENABLE_TRACKING` | Analytics toggle |
| `VITE_APP_DISABLE_SENTRY` | Sentry disable flag |
| `VITE_APP_GIT_SHA` | Git commit SHA (injected by Vercel) |
| `VITE_APP_ENABLE_PWA` | PWA toggle in dev mode |
| `VITE_APP_ENABLE_ESLINT` | ESLint overlay toggle |

## TypeScript Configuration Highlights

- **Path aliases** for all `@excalidraw/*` packages (resolved to source in dev)
- Aliases duplicated in: `tsconfig.json`, `vitest.config.mts`, `vite.config.mts`
- `strict: true`, `isolatedModules: true`, `noEmit: true`
- Includes: `packages/`, `excalidraw-app/`; excludes: `examples/`, `dist/`

## Containerization

- **Dockerfile**: multi-stage — Node 18 build → nginx:1.27-alpine serving static files
- Healthcheck: `wget -q -O /dev/null http://localhost || exit 1`
