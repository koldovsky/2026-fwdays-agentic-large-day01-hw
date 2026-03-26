# Progress

## Implemented modules and capabilities

- **Monorepo/workspace structure implemented**
  - root workspaces and multi-package build/test scripts are defined and wired (`package.json` root).
- **Core editor package implemented (`@excalidraw/excalidraw`)**
  - entry component and providers in `packages/excalidraw/index.tsx`.
  - lifecycle/state orchestration in `packages/excalidraw/components/App.tsx`.
  - action framework in `packages/excalidraw/actions/manager.tsx`.
  - rendering layers (`StaticCanvas`, `InteractiveCanvas`) in `packages/excalidraw/components/canvases/*`.
- **State and history infrastructure implemented**
  - store snapshot/increment engine in `packages/element/src/store.ts`.
  - undo/redo integration in `packages/excalidraw/history.ts`.
- **Library subsystem implemented**
  - item merge, atom state, update queue, adapter contracts in `packages/excalidraw/data/library.ts`.
- **Product app shell implemented (`excalidraw-app`)**
  - boot flow (`index.tsx`), app composition (`App.tsx`), collab module (`collab/Collab.tsx`), data integrations.
- **PWA integration implemented**
  - service worker registration in `excalidraw-app/index.tsx`, plugin config in `excalidraw-app/vite.config.mts`.

## Features in development / active refinement (code signals)

- **Pointer and touch handling consolidation**
  - marked by TODO/HACK in `packages/excalidraw/components/App.tsx`.
- **Robustness for missing pointer-up edge cases**
  - explicit TODO in `packages/excalidraw/tests/selection.test.tsx`.
- **Restore/sync consistency for invisible-text deletion path**
  - TODO in `packages/excalidraw/data/restore.ts`.
- **Scoped jotai cleanup for library per editor instance**
  - TODO in `packages/excalidraw/data/library.ts`.
- **UIOptions normalization/memo correctness**
  - FIXME in `packages/excalidraw/index.tsx`.

## Planned or clearly anticipated work (from TODO/FIXME and code contracts)

- **Formalize or simplify implicit editor state transitions**
  - especially around bind mode and delayed pointer flows in `App.tsx`.
- **Strengthen documentation/contracts for edge behavior**
  - API lifecycle invalidation on unmount (`isDestroyed` behavior in `App.tsx`).
- **Continue app-level integration hardening**
  - collab and external scene import paths in `excalidraw-app/App.tsx` and `collab/Collab.tsx`.

## Progress quality checkpoints currently available

- `yarn test`, `yarn test:all`, `yarn test:typecheck`, `yarn test:coverage` from root scripts.
- Lint/format scripts present (`test:code`, `test:other`, `fix:*`) in root `package.json`.
- Package-level build scripts for all core packages (`build:common`, `build:math`, `build:element`, `build:excalidraw`).

## Current documentation baseline

- Architecture deep dive: `docs/technical/architecture.md`.
- Domain terms: `docs/product/domain-glossary.md`.
- Memory notes already present:
  - `docs/memory/projectbrief.md`
  - `docs/memory/techContext.md`
  - `docs/memory/systemPatterns.md`
  - `docs/memory/decisionLog.md`

## Details

For detailed architecture -> `docs/technical/architecture.md`  
For domain glossary -> `docs/product/domain-glossary.md`
