# Project Progress

## Maturity Assessment

| Package | Version | Maturity | Notes |
|---------|---------|----------|-------|
| `@excalidraw/common` | 0.18.0 | **Stable** | Shared utilities, well-defined API |
| `@excalidraw/math` | 0.18.0 | **Stable** | Pure math functions, actively migrating to Point tuples |
| `@excalidraw/element` | 0.18.0 | **Stable** | Core element logic, heavily tested (23 test files) |
| `@excalidraw/excalidraw` | 0.18.0 | **Stable** | Main library, 60 test files, extensive API |
| `@excalidraw/utils` | 0.1.2 | **Beta** | Lower version, fewer tests (4 test files), public export utilities |
| `excalidraw-app` | 1.0.0 | **Stable** | Production application, 3 test files (collab, language, mobile) |

## Test Coverage Overview

| Area | Test Files | Notes |
|------|-----------|-------|
| `packages/excalidraw` | 60 | Actions, clipboard, charts, mermaid, wysiwyg, components |
| `packages/element` | 23 | Bounds, binding, arrows, frames, z-index, sort, store, delta |
| `packages/math` | 7 | Curves, segments, lines, ellipses, points, ranges |
| `packages/common` | 6 | Colors, utils, app event bus, binary heap |
| `packages/utils` | 4 | Export, within-bounds |
| `excalidraw-app` | 3 | Collab, language list, mobile menu |
| **Total** | **103** | Excludes snapshot files |

### Areas with Good Coverage

- Element manipulation (creation, mutation, bounds, binding)
- Action system (delete, duplicate, flip, lock, properties)
- History/Store (delta, store increments)
- Data import/export (JSON, SVG, PNG)
- Math primitives (curves, segments, ellipses)

### Areas with Limited/No Coverage

- Renderer (no test files for `staticScene.ts` or `interactiveScene.ts`)
- Collaboration reconciliation (covered in `collab.test.tsx` but limited)
- Font subsetting (woff2, harfbuzz)
- Firebase operations (integration-level, not unit tested)
- PWA service worker
- Encryption/decryption functions
- Theme handling
- Command palette

## Build Status

- Build script chain: `yarn build:packages` → `common → math → element → excalidraw`
- App build: `yarn build:app` runs Vite build with Sentry and tracking enabled
- Docker build: multi-stage `Dockerfile` → Node 18 build, Nginx 1.27-alpine serve
- Coverage thresholds configured: lines 60%, branches 70%, functions 63%, statements 60% (see `vitest.config.mts`)

## Dependency Health

- **TypeScript**: 5.9.3
- **React**: 19.0.0
- **Vite**: 5.0.12
- **Jotai**: 2.11.0
- **Firebase**: 11.3.1
- **Yarn**: 1.22.22 (classic, not Berry/modern)
- **Node requirement**: >=18.0.0 (see `package.json` engines)
- **Known resolution**: `strip-ansi` pinned to 6.0.1 (see root `package.json` resolutions)
- **@vitejs/plugin-react**: 3.1.0

## Documentation Completeness

| Document | Status |
|----------|--------|
| Package READMEs | ✅ Present for common, element, excalidraw, utils |
| CHANGELOG | ✅ `packages/excalidraw/CHANGELOG.md` |
| API documentation | ⚠️ Types serve as documentation; no dedicated API docs |
| Architecture docs | ✅ Generated in `docs/technical/architecture.md` |
| Memory Bank | ✅ Generated in `docs/memory/` |
| Inline code comments | ⚠️ Moderate — key areas documented, many implementation details undocumented |
| Example projects | ✅ `examples/with-nextjs/`, `examples/with-script-in-browser/` |

## Cross-References

- For active context → see [`docs/memory/activeContext.md`](activeContext.md)
- For tech stack → see [`docs/memory/techContext.md`](techContext.md)
- For decision log → see [`docs/memory/decisionLog.md`](decisionLog.md)
- For dev setup → see [`docs/technical/dev-setup.md`](../technical/dev-setup.md)
