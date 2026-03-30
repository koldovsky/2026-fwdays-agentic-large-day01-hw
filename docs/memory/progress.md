## Implemented features (evidenced)
- **Web app builds and runs via Vite**: `yarn start` delegates to `excalidraw-app` (package.json, excalidraw-app/package.json)
- **PWA**:
  - SW registration in app entry (excalidraw-app/index.tsx)
  - Workbox runtime caching + manifest configured (excalidraw-app/vite.config.mts)
- **Collaboration**:
  - Room id/key generation and `#room=...` links (excalidraw-app/data/index.ts)
  - Socket + Firebase sync pipeline (excalidraw-app/collab/Collab.tsx, excalidraw-app/data/firebase.ts)
- **Shareable link export/import**:
  - Export compress/encrypt + POST + hash storage (excalidraw-app/data/index.ts)
  - Import fetch + decompress/decrypt + legacy fallback (excalidraw-app/data/index.ts)
- **Persistence primitives**:
  - Local storage key conventions (excalidraw-app/app_constants.ts)
  - Firebase scene/files persistence (excalidraw-app/data/firebase.ts)
- **Embeddable package**:
  - Documented `<Excalidraw />` usage and SSR guidance (packages/excalidraw/README.md)
  - Published package metadata and exports map (packages/excalidraw/package.json)

## Partially implemented / feature flags (only where evidenced)
- **AI / text-to-diagram UI**:
  - App references `AIComponents` (excalidraw-app/App.tsx)
  - Package contains `TTDDialog` modules (packages/excalidraw/components/TTDDialog/*)
  - Completeness/behavior: Not found in code (not assessed end-to-end)

## Missing pieces
- **Backend service implementation** for `VITE_APP_BACKEND_V2_*` endpoints: Not found in code (excalidraw-app/data/index.ts references URLs only)
- **README at repo root**: Not found in code (no root `README.md` found by scan)

## Test coverage (if visible)
- **Unit/integration tests**: present across packages and app (e.g. packages/excalidraw/tests/*, excalidraw-app/tests/*)
- **Coverage thresholds** configured (vitest.config.mts):
  - lines: 60, branches: 70, functions: 63, statements: 60
- **CI coverage reporting on PRs** (GitHub Action): `.github/workflows/test-coverage-pr.yml`

## Stability assessment (evidence-based only)
- **Explicit instability signals**:
  - Flaky test noted (packages/excalidraw/wysiwyg/textWysiwyg.test.tsx)
  - Multiple TODO/FIXME markers in core modules (see `docs/memory/activeContext.md`)
- **Runtime stability**: Not found in code (no runtime monitoring results or bug tracker export included)

## Technical debt indicators
- **Legacy note referencing CRA** in `index.html` (excalidraw-app/index.html)
- **TODOs in performance-sensitive paths** (e.g. “huge bottleneck… optimise” in packages/element/src/frame.ts)
## Implemented features (evidenced)
- **Web app builds and runs via Vite**: `yarn start` delegates to `excalidraw-app` (package.json, excalidraw-app/package.json)
- **PWA**:
  - SW registration in app entry (excalidraw-app/index.tsx)
  - Workbox runtime caching + manifest configured (excalidraw-app/vite.config.mts)
- **Collaboration**:
  - Room id/key generation and `#room=...` links (excalidraw-app/data/index.ts)
  - Socket + Firebase sync pipeline (excalidraw-app/collab/Collab.tsx, excalidraw-app/data/firebase.ts)
- **Shareable link export/import**:
  - Export compress/encrypt + POST + hash storage (excalidraw-app/data/index.ts)
  - Import fetch + decompress/decrypt + legacy fallback (excalidraw-app/data/index.ts)
- **Persistence primitives**:
  - Local storage key conventions (excalidraw-app/app_constants.ts)
  - Firebase scene/files persistence (excalidraw-app/data/firebase.ts)
- **Embeddable package**:
  - Documented `<Excalidraw />` usage and SSR guidance (packages/excalidraw/README.md)
  - Published package metadata and exports map (packages/excalidraw/package.json)

## Partially implemented / feature flags (only where evidenced)
- **AI / text-to-diagram UI**:
  - App references `AIComponents` (excalidraw-app/App.tsx)
  - Package contains `TTDDialog` modules (via grep results in packages/excalidraw/components/TTDDialog/*)
  - Completeness/behavior: Not found in code (not assessed end-to-end)

## Missing pieces
- **Backend service implementation** for `VITE_APP_BACKEND_V2_*` endpoints: Not found in code (excalidraw-app/data/index.ts references URLs only)
- **README at repo root**: Not found in code (no root `README.md` found by scan)

## Test coverage (if visible)
- **Unit/integration tests**: present across packages and app (e.g. packages/excalidraw/tests/*, excalidraw-app/tests/*)
- **Coverage thresholds** configured (vitest.config.mts):
  - lines: 60, branches: 70, functions: 63, statements: 60
- **CI coverage reporting on PRs** (GitHub Action): `.github/workflows/test-coverage-pr.yml`

## Stability assessment (evidence-based only)
- **Explicit instability signals**:
  - Flaky test noted (packages/excalidraw/wysiwyg/textWysiwyg.test.tsx)
  - Multiple TODO/FIXME markers in core modules (see `docs/memory/activeContext.md`)
- **Runtime stability**: Not found in code (no runtime monitoring results or bug tracker export included)

## Technical debt indicators
- **Legacy note referencing CRA** in `index.html` (excalidraw-app/index.html)
- **TODOs in performance-sensitive paths** (e.g. “huge bottleneck… optimise” in packages/element/src/frame.ts via grep results)

## Documentation references

**Product**

- [PRD](../product/PRD.md)
- [Domain glossary](../product/domain-glossary.md)

**Technical**

- [Architecture](../technical/architecture.md)
- [Developer setup](../technical/dev-setup.md)
- [Technical decision log](../technical/decisionlog.md)
