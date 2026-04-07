# Tech Context: Excalidraw

> **Related docs:** [Architecture](../technical/architecture.md) · [System Patterns](./systemPatterns.md) · [Decision Log](./decisionLog.md) · [Project Brief](./projectbrief.md)

## Runtime Requirements

- **Node.js** ≥ 18.0.0
- **Package manager**: Yarn 1.22.22 (classic workspaces)

---

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Language | TypeScript (strict, ESNext) | 5.9.3 |
| UI Framework | React (functional + class components) | 19.0.0 |
| Build Tool | Vite | 5.0.12 |
| Canvas Rendering | roughjs (hand-drawn style) | 4.6.4 |
| Canvas Rendering | perfect-freehand (freehand strokes) | 1.2.0 |
| State (UI atoms) | jotai + jotai-scope (isolated stores) | 2.11.0 + 0.7.2 |
| Real-time Collab | socket.io-client | 4.7.2 |
| Cloud Backend | Firebase (Firestore + Storage) | 11.3.1 |
| Code Editor | CodeMirror 6 (commands/language/state/view) | ^6.0.0 |
| Testing | Vitest | 3.0.6 |
| Test DOM | jsdom | 22.1.0 |
| Test Utils | @testing-library/react | 16.2.0 |
| Error Monitoring | @sentry/browser | 9.0.1 |
| i18n | i18next + Crowdin (`crowdin.yml`) | — |
| Containerization | Docker: Node 18 build → Nginx 1.27 serve | — |

---

## Monorepo Structure

Root `package.json` declares Yarn workspaces:

```
excalidraw-monorepo/
├── excalidraw-app/          # Deployed SPA (Vite, private)
├── packages/
│   ├── excalidraw/          # @excalidraw/excalidraw v0.18.0 — main React component
│   ├── element/             # @excalidraw/element v0.18.0 — element types + operations
│   ├── common/              # @excalidraw/common v0.18.0 — shared utils + constants
│   ├── math/                # @excalidraw/math v0.18.0 — geometry primitives
│   └── utils/               # @excalidraw/utils — general utilities
└── examples/
    ├── with-nextjs/         # Next.js integration example
    └── with-script-in-browser/  # Plain HTML / script-tag example
```

**Build order** (packages have inter-dependencies):
```
common → math → element → excalidraw
```

---

## Key Scripts

All run from repository root via Yarn:

| Script | Command | Purpose |
|---|---|---|
| Dev server | `yarn start` | Vite dev server for excalidraw-app |
| Production build | `yarn build` | Build excalidraw-app SPA |
| Build packages | `yarn build:packages` | Build all 4 publishable packages (correct order) |
| Run tests | `yarn test` | Vitest (watch mode) |
| Run all tests | `yarn test:all` | typecheck + lint + prettier + vitest (no watch) |
| Type check | `yarn test:typecheck` | `tsc` — full TypeScript check |
| Coverage | `yarn test:coverage` | Vitest with V8 coverage |
| Lint | `yarn test:code` | ESLint (0 warnings allowed) |
| Auto-fix | `yarn fix` | prettier write + ESLint fix |
| Clean install | `yarn clean-install` | Remove all node_modules then `yarn install` |
| Docker build | `yarn build:app:docker` | Build with Sentry disabled (for container) |

---

## DX Tooling

- **ESLint** — `@excalidraw/eslint-config`, `eslint-plugin-import`, `eslint-plugin-prettier`
- **Prettier** — `@excalidraw/prettier-config`
- **Husky** (v7) — pre-commit hook (`./husky/pre-commit`)
- **lint-staged** (`.lintstagedrc.js`) — runs ESLint + Prettier on staged files
- **Vite plugins** — `@vitejs/plugin-react`, `vite-plugin-pwa`, `vite-plugin-checker`,
  `vite-plugin-svgr`, `vite-plugin-ejs`
- **PWA** — `vite-plugin-pwa` 0.21.1, offline-capable via `registerSW`
- **CodeSandbox** — `.codesandbox/Dockerfile` + `.codesandbox/tasks.json` for browser IDE
- **Vercel** — `vercel.json` for SPA deployment
- **Docker** — `Dockerfile` (multi-stage) + `docker-compose.yml` (port 3000)

---

## Environment Variables

Defined in `.env.development` / `.env.production` (Vite `VITE_APP_*` prefix):

| Variable | Purpose | Default (dev) |
|---|---|---|
| `VITE_APP_BACKEND_V2_GET_URL` | JSON scene sharing — GET endpoint | — |
| `VITE_APP_BACKEND_V2_POST_URL` | JSON scene sharing — POST endpoint | — |
| `VITE_APP_WS_SERVER_URL` | WebSocket collab server | `localhost:3002` |
| `VITE_APP_AI_BACKEND` | Text-to-Diagram / Diagram-to-Code backend | `localhost:3016` |
| `VITE_APP_FIREBASE_CONFIG` | Firebase project credentials (JSON string) | — |
| `VITE_APP_PLUS_APP` | Excalidraw+ integration URL | `localhost:3000` |
| `VITE_APP_DISABLE_SENTRY` | Set to `true` in Docker build | — |
| `VITE_APP_ENABLE_TRACKING` | Analytics (set in Vercel/CI build) | — |

---

## Browser Support

Defined in `package.json` `browserslist`:

- **Production**: > 0.2% market share; excludes IE, Safari < 12, Edge < 79, Chrome < 70
- **Development**: last 1 version of Chrome, Firefox, Safari

---

## Key Library Dependencies (packages/excalidraw)

| Package | Version | Purpose |
|---|---|---|
| `roughjs` | 4.6.4 | Hand-drawn shape rendering on canvas |
| `perfect-freehand` | 1.2.0 | Smooth freehand stroke generation |
| `jotai` | 2.11.0 | Atomic UI state (ephemeral, not undo-able) |
| `jotai-scope` | 0.7.2 | Isolated Jotai store per editor instance |
| `@excalidraw/mermaid-to-excalidraw` | 2.1.1 | Mermaid diagram import |
| `fractional-indexing` | 3.2.0 | Element z-order without full re-indexing |
| `nanoid` | 3.3.3 | Element ID generation |
| `pako` | 2.0.3 | zlib compression for scene export/share |
| `browser-fs-access` | 0.38.0 | Native file system open/save dialogs |
| `@braintree/sanitize-url` | 6.0.2 | URL sanitization for hyperlinks |
| `radix-ui` | 1.4.3 | Accessible UI primitives (dropdowns, etc.) |
| `tunnel-rat` | 0.1.2 | React portal tunnels between components |
| `clsx` | 1.1.1 | Class name construction utility |
| `lodash.debounce` / `lodash.throttle` | 4.0.8 / 4.1.1 | Event rate-limiting |
