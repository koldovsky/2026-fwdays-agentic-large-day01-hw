# Progress

## Related documentation

- **Product:** [PRD](../product/PRD.md), [Domain glossary](../product/domain-glossary.md)
- **Technical:** [Architecture](../technical/architecture.md), [Dev setup](../technical/dev-setup.md), [Code vs documentation](../technical/code-vs-documentation.md)

## Implemented features (end-to-end paths present in code)

- **Monorepo install, build, test, lint scripts**
  - Evidence:
    - `package.json` — `workspaces`, `scripts` (`build`, `build:packages`, `test`, `test:all`, `test:typecheck`, `test:code`, `test:other`, `start`, etc.).

- **Web app entry and SPA bootstrap**
  - Evidence:
    - `excalidraw-app/index.tsx` — `createRoot`, `registerSW` (PWA), renders `ExcalidrawApp` from `./App`.
    - `excalidraw-app/App.tsx` — `Excalidraw` component, `initializeScene`, `Collab`, `LocalData`, `ShareDialog`, etc.

- **Package libraries built as ESM via Node scripts**
  - Evidence:
    - `packages/common/package.json` — `"build:esm": "rimraf dist && node ../../scripts/buildBase.js && yarn gen:types"`.
    - `packages/excalidraw/package.json` — `"build:esm": "rimraf dist && node ../../scripts/buildPackage.js && yarn gen:types"`.
    - `scripts/buildBase.js` — `esbuild` `build({...})` for dev/prod dirs.

- **Production container image**
  - Evidence:
    - `Dockerfile` — `yarn build:app:docker`, copies `excalidraw-app/build` to `nginx` image.

- **CI: tests on default branch**
  - Evidence:
    - `.github/workflows/test.yml` — `yarn install`, `yarn test:app`.

- **CI: lint/typecheck on PRs**
  - Evidence:
    - `.github/workflows/lint.yml` — `yarn test:other`, `yarn test:code`, `yarn test:typecheck`.

- **Editor + element + math behavior covered by automated tests (volume)**
  - Evidence:
    - `find` for `*.test.ts(x)` / `*.spec.ts(x)` — **102 files** in this checkout (command output used for count; files live under `packages/*`, `excalidraw-app/tests`, etc.).

- **Host-app–specific tests**
  - Evidence:
    - `excalidraw-app/tests/MobileMenu.test.tsx`
    - `excalidraw-app/tests/LanguageList.test.tsx`
    - `excalidraw-app/tests/collab.test.tsx`

## Partially implemented

- **Path bounds for certain path operations**
  - Evidence:
    - `packages/element/src/bounds.ts` — `lineTo` / `qcurveTo` branches contain `// TODO: Implement this` (~671–674).

- **Align / distribute including frame-like elements**
  - Evidence:
    - `packages/excalidraw/actions/actionAlign.tsx` — frames excluded with TODO (~50–51).
    - `packages/excalidraw/actions/actionDistribute.tsx` — same pattern (~43).

- **Library teardown resetting global Jotai library atom**
  - Evidence:
    - `packages/excalidraw/data/library.ts` — commented block with TODO (~253–258).

- **Host app library migration path**
  - Evidence:
    - `excalidraw-app/App.tsx` — `migrationAdapter: LibraryLocalStorageMigrationAdapter` with removal TODO (~417–418).

## Missing / not implemented (inferred only where code states a gap)

- **Bounds for `lineTo` / `qcurveTo` in the cited loop** — branches explicitly unimplemented.
  - Evidence: `packages/element/src/bounds.ts` (~671–674).

- **Automated tests under `examples/`**
  - Evidence:
    - `rg` for `\.test\.(ts|tsx)` under `examples/` returns no matches (this checkout).

- **Root TypeScript project does not include `examples/`**
  - Evidence:
    - `tsconfig.json` — `"exclude": [..., "examples", ...]` (~35).

## Test coverage signals

- **Runner**: Vitest with `jsdom`, global setup, coverage thresholds.
  - Evidence:
    - `vitest.config.mts` — `environment: "jsdom"`, `setupFiles: ["./setupTests.ts"]`, `coverage.thresholds` (lines 60, branches 70, functions 63, statements 60) (~57–70).
    - `setupTests.ts` — imports `vitest-canvas-mock`, `@testing-library/jest-dom`.

- **CI runs unit tests via `yarn test:app` only** (not `test:all` in `test.yml`).
  - Evidence:
    - `.github/workflows/test.yml` — `yarn test:app` (~18–19).
    - `package.json` — `test:app` → `vitest` (~67).

- **Gaps** — Which lines are covered is **not verified** from this task (would require running `vitest --coverage` and reading reports).

## Maturity assessment

- **Partially verified** — Production-like signals: Docker + nginx (`Dockerfile`), CI workflows (`.github/workflows/*.yml`), PWA registration (`import { registerSW } from "virtual:pwa-register"` in `excalidraw-app/index.tsx`), Sentry side-effect import (`import "../excalidraw-app/sentry"` in `excalidraw-app/index.tsx` ~5). No claim of deployment status or SLA.
