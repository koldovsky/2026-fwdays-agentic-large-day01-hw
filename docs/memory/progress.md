# Progress — project state

Snapshot of what exists **in this tree**, verified against `package.json` files, `tsconfig.json`, workspace layout, and `.github/workflows/`.

## Monorepo composition

- **Workspaces** (root `package.json`): `excalidraw-app`, `packages/*`, `examples/*`.
- **Packages:**
  - `@excalidraw/excalidraw` — React editor/library (`packages/excalidraw/`).
  - `@excalidraw/common`, `@excalidraw/element`, `@excalidraw/math`, `@excalidraw/utils` — supporting libraries.
- **Application:** `excalidraw-app` — Vite + React 19, PWA plugins, collab-related dependencies (Firebase, `socket.io-client`, Sentry, etc.).
- **Examples:** Next.js and Vite+script samples under `examples/`.

## Build and distribution

- Library ships **ESM** builds from `packages/excalidraw` (`build:esm` → `dist/`, conditional `development` / `production` entry in `exports`).
- Root orchestration: `build:packages` builds common → math → element → excalidraw in order.
- App build: `yarn build` at root runs `excalidraw-app` build plus version script; Docker-oriented variant sets `VITE_APP_DISABLE_SENTRY=true`.

## Quality gates (local scripts)

| Layer | Command (root) |
|-------|----------------|
| Unit / component tests | `yarn test` / `yarn test:app` (Vitest) |
| TypeScript | `yarn test:typecheck` |
| Lint | `yarn test:code` (ESLint) |
| Format | `yarn test:other` (Prettier `--list-different`) |
| Combined | `yarn test:all` |

Vitest config and coverage scripts are defined at root (`vitest`, `@vitest/coverage-v8`, UI mode via `test:ui`).

## Automation (CI)

Workflows present under `.github/workflows/` include, among others:

- `test.yml` — automated tests
- `lint.yml` — lint pipeline
- `locales-coverage.yml` — translation coverage
- `size-limit.yml` — bundle size checks
- `build-docker.yml` / `publish-docker.yml` — container workflows
- `autorelease-excalidraw.yml`, `sentry-production.yml`, `semantic-pr-title.yml`, `cancel.yml`, `test-coverage-pr.yml`

Exact job definitions are in those YAML files (not duplicated here).

## Documentation in-repo

- **`docs/memory/projectbrief.md`** — high-level purpose and package roles.
- **`docs/memory/productContext.md`** — UI strings, shortcuts, scripts.
- **`docs/technical/architecture.md`** — detailed architecture reference.
- **`docs/product/domain-glossary.md`** — domain glossary.
- **This file** — delivery/tooling snapshot.
- **Package readmes:** e.g. `packages/excalidraw/README.md` for embed usage (as referenced in `projectbrief.md`).

## Version baseline

- `@excalidraw/excalidraw`: **0.18.0** (`packages/excalidraw/package.json`).
- **React:** 19.x in app and examples (`excalidraw-app/package.json`, examples).
- **TypeScript:** 5.9.x at root; stricter project-wide `tsconfig` for packages + app.

## Not inferred here

- Passing/failing status of CI on a given branch (requires a run).
- Comparison to latest upstream `main` on GitHub (this clone may lag or diverge).
- Product roadmap or release calendar (external to this repo).
