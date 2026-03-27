# Progress snapshot

**As of: 2026-03-26** (repository tree and config files; no separate changelog consulted).

## Monorepo

- **Name**: `excalidraw-monorepo` (`package.json`).
- **Workspaces**: `excalidraw-app`, `packages/*`, `examples/*` (same file).
- **Package manager**: Yarn **1.22.22** (`packageManager` field).

## Packages (published-style)

| Package | Version (from `package.json`) |
|---------|-------------------------------|
| `@excalidraw/common` | 0.18.0 |
| `@excalidraw/math` | 0.18.0 |
| `@excalidraw/element` | 0.18.0 |
| `@excalidraw/excalidraw` | 0.18.0 |
| `@excalidraw/utils` | 0.1.2 |

## Applications and examples

- **Host app**: `excalidraw-app` — React **19.0.0**, Vite-driven scripts (`excalidraw-app/package.json`: `start`, `build`, `build:app`, …).
- **Example (Vite)**: `examples/with-script-in-browser` — React 19, Vite 5.0.12, depends on `@excalidraw/excalidraw` `*`.
- **Example (Next)**: `examples/with-nextjs` — Next **14.1**, React 19; `build:workspace` builds packages and copies fonts from `packages/excalidraw/dist/prod/fonts`.

## Toolchain (root)

- **TypeScript** 5.9.3, **Vite** 5.0.12, **Vitest** 3.0.6 (`package.json` `devDependencies`).
- **Node**: `engines` `>=18.0.0`; CI workflows sampled use **20.x** (e.g. `.github/workflows/test.yml`, `lint.yml`).

## Tests and quality scripts

From root `package.json`:

- `yarn test:app` → `vitest` (`vitest.config.mts`: jsdom, path aliases, `setupTests.ts`, coverage thresholds).
- `yarn test:typecheck` → `tsc`
- `yarn test:code` → ESLint
- `yarn test:other` → Prettier `--list-different`
- `yarn test:all` → combines the above + `test:app --watch=false`
- `prepare` → `husky install`

## CI workflows present

Under `.github/workflows/`: `test.yml`, `lint.yml`, `test-coverage-pr.yml`, `size-limit.yml`, `locales-coverage.yml`, `semantic-pr-title.yml`, `sentry-production.yml`, `build-docker.yml`, `publish-docker.yml`, `autorelease-excalidraw.yml`, `cancel.yml`.

## Feature areas (code exists)

- Editor UI and canvas: `packages/excalidraw/`
- Collab + backend v2 + Firebase wiring: `excalidraw-app/` (`collab/`, `data/`, `app_constants.ts`)
- PWA: `excalidraw-app/index.tsx`, Vite PWA plugin (root `package.json` devDependency; config in `excalidraw-app/vite.config.mts`)

## Not evidenced here

External issue tracker state, release calendar, or commercial SLA—treat roadmap as **unknown** from repo alone.

## Related Memory Bank

- `docs/memory/techContext.md` — commands and env notes  
- `docs/memory/activeContext.md` — what to prioritize when changing the repo
