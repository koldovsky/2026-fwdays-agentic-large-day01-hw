# Tech Context

> **See also**: [projectbrief](projectbrief.md) | [systemPatterns](systemPatterns.md) | [decisionLog](decisionLog.md) | [productContext](productContext.md) | [activeContext](activeContext.md) | [progress](progress.md)
> **Technical docs**: [Architecture](../technical/architecture.md) | [Dev Setup](../technical/dev-setup.md)
> **Product docs**: [PRD](../product/PRD.md) | [Domain Glossary](../product/domain-glossary.md)

## Language & Runtime

- **TypeScript** 5.9.3 — strict mode, ESNext target, react-jsx
- **Node.js** ≥ 18.0.0
- **Yarn** 1.22.22 (Classic, with workspaces)

## Core Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| UI framework | React | 19.0.0 |
| Build / dev server | Vite | 5.0.12 |
| Test runner | Vitest | 3.0.6 |
| Test environment | jsdom | 22.1.0 |
| State (atoms) | Jotai | 2.11.0 |
| Canvas rendering | rough.js | 4.6.4 |
| Styling | Sass (SCSS modules) | 1.51.0 |
| UI primitives | Radix UI | 1.4.3 |
| Pen strokes | perfect-freehand | 1.2.0 |
| Compression | pako | 2.0.3 |
| IDs | nanoid | 3.3.3 |
| Element ordering | fractional-indexing | 3.2.0 |

## Application Dependencies (excalidraw-app)

| Dependency | Version | Purpose |
|-----------|---------|---------|
| Firebase | 11.3.1 | Firestore persistence + Storage for images |
| socket.io-client | 4.7.2 | Real-time collaboration |
| @sentry/browser | 9.0.1 | Error monitoring |
| idb-keyval | 6.0.3 | IndexedDB wrapper for local file storage |
| i18next-browser-languagedetector | 6.1.4 | Auto-detect user language |

## TypeScript Configuration

```
target: ESNext
module: ESNext
moduleResolution: node
strict: true
jsx: react-jsx
isolatedModules: true
noEmit: true
```

## Linting & Formatting

- **ESLint**: extends `@excalidraw/eslint-config` + `react-app`
  - Enforces `@typescript-eslint/consistent-type-imports`
  - Restricts direct `jotai` imports (must use app wrappers)
  - `import/order` with `@excalidraw/**` path groups
- **Prettier**: `@excalidraw/prettier-config`
  - Runs on `*.{css,scss,json,md,html,yml}`
- **Husky**: pre-commit hook → `lint-staged`
- **lint-staged**: ESLint `--fix` on `*.{js,ts,tsx}`, Prettier `--write` on
  style/doc files

## Test Configuration (vitest.config.mts)

- Environment: `jsdom`
- Setup file: `./setupTests.ts`
- Hooks: parallel sequence
- Globals: enabled
- Coverage thresholds:
  - Lines: 60%
  - Branches: 70%
  - Functions: 63%
  - Statements: 60%
- Coverage reporters: text, json-summary, json, html, lcovonly

## Commands Reference

### Development

```bash
yarn start                 # Dev server (excalidraw-app)
yarn start:production      # Build + serve locally on :5001
yarn start:example         # Build packages, then run browser example
```

### Building

```bash
yarn build                 # Build excalidraw-app (Vercel)
yarn build:app:docker      # Build with Sentry disabled (Docker)
yarn build:packages        # Build all packages in dependency order
yarn build:common          # Build @excalidraw/common
yarn build:math            # Build @excalidraw/math
yarn build:element         # Build @excalidraw/element
yarn build:excalidraw      # Build @excalidraw/excalidraw
yarn build:preview         # Build + Vite preview on :5000
```

### Testing

```bash
yarn test:app              # vitest (watch mode)
yarn test:all              # typecheck + lint + prettier + vitest
yarn test:typecheck        # tsc (no emit)
yarn test:code             # eslint --max-warnings=0
yarn test:other            # prettier --list-different
yarn test:update           # update snapshots
yarn test:coverage         # vitest --coverage
yarn test:ui               # vitest UI with coverage
```

### Code Quality

```bash
yarn fix                   # Fix prettier + eslint
yarn fix:code              # eslint --fix
yarn fix:other             # prettier --write
```

### Release & Maintenance

```bash
yarn release               # Interactive release
yarn release:latest        # Publish @latest tag
yarn release:next          # Publish @next tag
yarn rm:build              # Remove all build artifacts
yarn rm:node_modules       # Remove all node_modules
yarn clean-install         # rm node_modules + yarn install
```

## Build Order

Packages must be built bottom-up following the dependency chain:

```
1. @excalidraw/common     (no internal deps)
2. @excalidraw/math       (depends on common)
3. @excalidraw/element    (depends on common, math)
4. @excalidraw/excalidraw (depends on common, math, element)
```

`yarn build:packages` enforces this order automatically.

## Environment Variables

- `VITE_APP_FIREBASE_CONFIG` — Firebase project config (JSON)
- `VITE_APP_GIT_SHA` — Git commit SHA (set by Vercel via `$VERCEL_GIT_COMMIT_SHA`)
- `VITE_APP_DISABLE_SENTRY` — Disable Sentry (used in Docker builds)
- `VITE_APP_ENABLE_TRACKING` — Enable analytics (production builds)

## Deployment Targets

| Target | Tool | Config |
|--------|------|--------|
| Production (web) | Vercel | `vercel.json` |
| Self-hosted | Docker (Nginx) | `Dockerfile`, `docker-compose.yml` |
| npm registry | Node scripts | `scripts/release.js` |
