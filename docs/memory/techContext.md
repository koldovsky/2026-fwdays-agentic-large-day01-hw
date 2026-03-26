# Tech Context: Excalidraw

## Stack Overview

| Layer | Technology | Version |
|-------|-----------|---------|
| Language | TypeScript | 5.9.3 |
| UI Framework | React + React-DOM | 19.0.0 |
| Build (app) | Vite | 5.0.12 |
| Build (packages) | esbuild | 0.19.10 |
| Package Manager | Yarn workspaces | 1.22.22 |
| Node.js | Minimum | >=18.0.0 |

---

## Monorepo Structure

- `excalidraw-app/` — hosted web app (collab, Firebase, app-level integrations); not published to npm
- `packages/excalidraw/` — `@excalidraw/excalidraw` — main React component library (published)
- `packages/element/` — `@excalidraw/element` — element types, constructors, transforms (published)
- `packages/math/` — `@excalidraw/math` — 2D geometry / vectors (published)
- `packages/common/` — `@excalidraw/common` — shared constants, utilities, branded types (published)
- `packages/utils/` — `@excalidraw/utils` — export/import, compression, file handling (standalone, no internal deps)

Dependency direction: `excalidraw-app` → `excalidraw` → `element` → `math` + `common`. App layer may use packages; packages must not depend on app.

---

## Frontend

### State Management
- **Jotai** 2.11.0 — atom-based reactive state
- **jotai-scope** 0.7.2 — scoped atom stores
- **Centralized AppState** object with defaults in `packages/excalidraw/appState.ts`
- App-specific stores: `excalidraw-app/app-jotai.ts`, `packages/excalidraw/editor-jotai.ts`

### UI Components
- **Radix-ui** 1.4.3 — accessible primitive components
- **CodeMirror** 6.x — embedded code editor (e.g., Mermaid diagrams)
- **SCSS / Sass** 1.51.0 — styling

### Rendering
- **Rough.js** 4.6.4 — canvas rendering with hand-drawn aesthetic
- **perfect-freehand** 1.2.0 — smooth freehand stroke rendering
- **Canvas API** (not DOM) — all drawing happens on HTML5 `<canvas>`

### Image & File Handling
- **pica** 7.1.1 — high-quality image resizing
- **image-blob-reduce** 3.0.1 — client-side image compression
- **png-chunks-encode/extract/text** 1.0.0 — PNG metadata embedding (scene data in PNG exports)
- **pako** 2.0.3 — zlib compression for scene data

---

## Collaboration & Backend

### Real-Time Sync
- **Socket.io-client** 4.7.2 — WebSocket transport for live collaboration
- **Dev WS server**: `localhost:3002` (set in `.env.development`)
- **Prod WS server**: `oss-collab.excalidraw.com`

### Database & Auth
- **Firebase** 11.3.1 — auth, Firestore DB, storage
- **Dev Firebase**: separate dev project (config in `.env.development`)
- **Prod Firebase**: separate prod project (config in `.env.production`)

---

## Tooling

### Testing

- **Vitest** 3.0.6 — test runner
- **@testing-library/react** 16.2.0 — component testing
- **@testing-library/dom** 10.4.0
- **vitest-canvas-mock** 0.3.3 — mock `<canvas>` for JSDOM
- **jsdom** 22.1.0 — DOM environment for tests
- **Setup file**: `setupTests.ts` — canvas mock, IndexedDB mock, FontFace mock, polyfills
- **Config**: `vitest.config.mts`

### Coverage Thresholds (enforced in CI)

| Metric | Threshold |
|--------|-----------|
| Lines | 60% |
| Branches | 70% |
| Functions | 63% |
| Statements | 60% |

### Code Quality
- **ESLint** — `@excalidraw/eslint-config` 1.0.3, zero warnings in CI
- **Prettier** 2.6.2 — `@excalidraw/prettier-config` 1.0.2
- **Husky + lint-staged** — pre-commit hooks via `.lintstagedrc.js`
- **TypeScript strict mode** — root `tsconfig.json`

### Error Tracking & Analytics
- **Sentry** 9.0.1 — error tracking (disabled in Docker build via `yarn build:app:docker`)

### PWA
- **vite-plugin-pwa** 0.21.1 — Service Worker + precache

### Localization
- **i18next** — 40+ language JSON files in `packages/excalidraw/locales/`
- Locale files are code-split at build time (except `en.json`)

---

## Configuration Files

| File | Purpose |
|------|---------|
| `tsconfig.json` | Root TypeScript config, `@excalidraw/*` path aliases |
| `vitest.config.mts` | Test config: JSDOM, aliases, coverage, setupFiles |
| `excalidraw-app/vite.config.mts` | Dev server (port 3001), build output, PWA, asset chunking |
| `.eslintrc.json` | ESLint rules, import ordering, Jotai restrictions |
| `.env.development` | Dev env: localhost:3002 WS, dev Firebase, tracking on |
| `.env.production` | Prod env: prod Firebase, oss-collab.excalidraw.com, tracking off |
| `Dockerfile` | Multi-stage: Node 18 build → nginx 1.27-alpine serve (port 80) |
| `docker-compose.yml` | Local dev environment |

---

## CLI Commands

### Development
```bash
yarn start              # dev server on port 3001 (auto-opens browser)
yarn start:production   # build then serve production build locally
```

### Building
```bash
yarn build              # full build pipeline
yarn build:app          # web app with Sentry tracking
yarn build:app:docker   # web app without Sentry (for Docker)
yarn build:packages     # all packages (common, math, element, excalidraw)
yarn build:excalidraw   # @excalidraw/excalidraw package only
yarn build:preview      # build + preview locally
```

### Testing
```bash
yarn test               # run Vitest once
yarn test:all           # full suite: typecheck + lint + other + app tests
yarn test:typecheck     # TypeScript type check
yarn test:code          # ESLint (max-warnings=0)
yarn test:other         # Prettier format check
yarn test:coverage      # generate coverage report
yarn test:update        # update snapshots
```

### Code Quality
```bash
yarn fix                # auto-fix: format + lint
yarn fix:code           # ESLint auto-fix
yarn fix:other          # Prettier auto-format
```

### Localization
```bash
yarn locales-coverage   # generate locale coverage report
```

### Cleanup
```bash
yarn rm:build           # remove build artifacts
yarn rm:node_modules    # remove all node_modules
yarn clean-install      # clean + reinstall
```

### Release
```bash
yarn release            # release with default tag
yarn release:next       # release as "next" tag
yarn release:latest     # release as "latest" tag
```

---

## Related Documents

| Document | Relevance |
|----------|-----------|
| [systemPatterns.md](./systemPatterns.md) | How this tech stack is used in architecture (Jotai patterns, Canvas rendering, etc.) |
| [activeContext.md](./activeContext.md) | Current dev state, coding standards, reminders for active work |
| [progress.md](./progress.md) | What features are shipped vs in progress, CI coverage thresholds |
| [projectbrief.md](./projectbrief.md) | Monorepo layout and package dependency chain |
| [dev-setup.md](../technical/dev-setup.md) | Hands-on walkthrough: dev server, tests, lint, build, Docker, PR workflow |
| [architecture.md](../technical/architecture.md) | How packages and dependencies relate architecturally |
