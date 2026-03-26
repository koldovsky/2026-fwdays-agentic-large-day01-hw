# Progress — Excalidraw Monorepo

## Completed

These areas are built and functional in the current codebase.

| Area | Status | Details |
|------|--------|---------|
| Core drawing engine | Done | Canvas-based rendering with roughjs for hand-drawn aesthetics, perfect-freehand for strokes |
| Element model | Done | Typed element hierarchy, fractional z-indexing, soft-delete semantics |
| Store & undo/redo | Done | Central `Store` with `CaptureUpdateAction` deltas, full undo/redo stack |
| Collaboration system | Done | Socket.IO real-time sync, E2E encryption (key in URL hash), `reconcileElements()` merging |
| Import/export | Done | `.excalidraw` JSON, PNG (with embedded scene data), SVG export; Mermaid diagram import |
| PWA | Done | Service worker via `vite-plugin-pwa`, offline caching (fonts 90d, locales 30d, chunks 90d), file handler registration |
| Internationalization | Done | i18next with 30+ locale files, browser language detection |
| Library/app separation | Done | `@excalidraw/excalidraw` npm package (0.18.0) cleanly separated from product-layer app |
| Multi-package architecture | Done | Five packages: common, math, element, excalidraw, utils — with clear dependency graph |
| Build pipeline | Done | Vite for app, esbuild for packages, manual chunk splitting, SCSS compilation |
| Testing infrastructure | Done | Vitest with jsdom, React Testing Library, canvas/IndexedDB mocks, coverage thresholds |
| Linting & formatting | Done | ESLint with custom rules (import order, Jotai restriction, barrel restriction), Prettier, Husky pre-commit |
| Deployment — Vercel | Done | `vercel.json` configured, builds to `excalidraw-app/build` |
| Deployment — Docker | Done | Multi-stage Dockerfile: Node 18 build → nginx:1.27-alpine, healthcheck included |
| Deployment — npm | Done | `@excalidraw/excalidraw@0.18.0` published with dev/prod/types outputs |
| Font system | Done | Custom subsetting via harfbuzzjs + fonteditor-core, WOFF2 from CDN, Vite font plugin |
| Firebase cloud storage | Done | Firestore integration for scene persistence (app-only, lazy-initialized) |
| Error handling | Done | Typed error classes, React ErrorBoundary, Sentry integration |
| Imperative API | Done | `ExcalidrawImperativeAPI` via React context for programmatic control |
| Event bus | Done | `AppEventBus` typed pub/sub for decoupled cross-module communication |

## In Progress

| Area | Status | Details |
|------|--------|---------|
| Memory Bank documentation | In progress | Seven files in `docs/memory/` — establishing AI-agent context layer |
| Product documentation | Done | [PRD](../product/PRD.md) — reverse-engineered product requirements document |
| Technical documentation | Done | [Dev Setup Guide](../technical/dev-setup.md) — local development, build, test, and deploy instructions |

## Not Yet Started / Planned

These are gaps or improvement opportunities identified from the codebase.

| Area | Priority | Notes |
|------|----------|-------|
| E2E test suite | High | No end-to-end tests visible (Playwright, Cypress, etc.). Only unit/integration via Vitest. |
| Coverage gap analysis | Medium | Thresholds set (lines 60%, branches 70%, functions 63%, statements 60%) but actual coverage vs. thresholds not verified |
| Performance optimization | Medium | Large canvas rendering, many-element scenes, and memory usage are potential optimization targets |
| Accessibility audit | Medium | No a11y testing infrastructure visible (axe, pa11y, etc.). Radix UI helps but full audit not done. |
| Yarn modernization | Low | Currently Yarn 1 Classic (1.22.22). Modern Yarn (Berry/4.x) offers PnP, better caching, plugin system |
| Bundle size analysis | Low | No visible bundle-size tracking or budget enforcement |

## Known Technical Debt

| Debt Item | Impact | Details |
|-----------|--------|---------|
| Triple alias duplication | Maintenance burden | `@excalidraw/*` path aliases are duplicated across `tsconfig.json`, `vite.config.mts`, and `vitest.config.mts` — must be kept in sync manually |
| Yarn 1 Classic | DX limitation | Yarn 1 lacks PnP, workspaces protocol, and modern features. Migration blocked by ecosystem inertia. |
| Mixed SCSS / CSS | Inconsistency | SCSS used in `packages/excalidraw`, but no SCSS elsewhere. No CSS-in-JS or CSS Modules standardization. |
| Manual chunk config | Fragility | Vite manual chunk splitting (`manualChunks` in `vite.config.mts`) requires manual maintenance as dependencies change |
| No monorepo task runner | Build speed | Package builds run sequentially via shell script. Tools like Turborepo or Nx could parallelize and cache. |
