# Tech Context

## Related Docs
- [Dev Setup — full onboarding from clone to PR](../technical/dev-setup.md)
- [System Patterns — how the architecture uses this stack](systemPatterns.md)
- [Project Brief — what & why](projectbrief.md)

---

## Package Versions (verified from source)

### Core (root `package.json` + `packages/excalidraw/package.json`)

| Package | Version | Source |
|---------|---------|--------|
| `@excalidraw/excalidraw` | 0.18.0 | packages/excalidraw/package.json |
| TypeScript | 5.9.3 | root package.json |
| React | ^17 \|\| ^18 \|\| ^19 (peer) | packages/excalidraw/package.json |
| Vite | 5.0.12 | root package.json |
| Vitest | 3.0.6 | root package.json |
| Jotai | 2.11.0 | packages/excalidraw/package.json |
| Rough.js | 4.6.4 | packages/excalidraw/package.json |
| Perfect-freehand | 1.2.0 | packages/excalidraw/package.json |
| Radix UI | 1.4.3 | packages/excalidraw/package.json |

### App layer (`excalidraw-app/package.json`)

| Package | Version |
|---------|---------|
| Firebase | 11.3.1 |
| Socket.io-client | 4.7.2 |

### Internal monorepo packages (all v0.18.0)

- `@excalidraw/element` — element types & utilities
- `@excalidraw/common` — shared constants, utils, helpers
- `@excalidraw/math` — geometry primitives (Point, Vector, Radians)

## Dev Commands

```bash
# Development
yarn start                  # dev server on port 3000 (or VITE_APP_PORT)

# Build
yarn build                  # full build
yarn build:packages         # build all packages
yarn build:excalidraw       # build library only
yarn build:app              # build web app only

# Testing
yarn test                   # vitest (default)
yarn test:app               # vitest for app
yarn test:all               # typecheck + lint + prettier + vitest
yarn test:typecheck         # tsc type check
yarn test:code              # eslint
yarn test:other             # prettier check
yarn test:coverage          # with coverage report
yarn test:ui                # vitest UI + coverage

# Fix
yarn fix                    # prettier + eslint auto-fix
yarn fix:code               # eslint fix only
yarn fix:other              # prettier fix only

# Maintenance
yarn clean-install          # rm node_modules + fresh install
yarn rm:build               # remove all dist/ dirs
```

## Build & Test Config

### Vite (`excalidraw-app/vite.config.mts`)
- Output: `build/`
- Source maps: enabled
- Asset inline limit: 0 (no auto-inlining)
- Manual chunks: locales, codemirror, mermaid-to-excalidraw
- PWA (Workbox): fonts cached 90 days, locales 30 days, chunks 90 days
- Plugins: React, SVGR, EJS, PWA, type-checker, HTML minifier, sitemap

### Vitest (`vitest.config.mts`)
- Environment: jsdom
- Setup: `./setupTests.ts`
- Globals: enabled
- Coverage thresholds: lines 60%, branches 70%, functions 63%, statements 60%
- Path aliases: all `@excalidraw/*` packages resolved locally

## Repomix (AI context packing)

```bash
npx repomix               # standard: 856 files, ~3.3M tokens
npx repomix --compress    # compressed: 856 files, ~1.26M tokens (-62%)
```

**Token hogs to exclude via `repomix.config.json`:**
- `packages/excalidraw/subset/` — WASM binaries as TS strings (~1M tokens)
- `packages/excalidraw/fonts/` — font source files (~400k tokens)
- `packages/excalidraw/locales/` — 59 translation JSONs

With exclusions: estimated **~400k tokens** — fits most model context windows.
