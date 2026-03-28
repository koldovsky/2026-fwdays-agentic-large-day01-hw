# Progress snapshot

**As of: 2026-03-28** (repository tree and config files; no separate changelog consulted).

### How to update this snapshot

1. **Bump the date** above when you re-verify the inventory.
2. **Package versions** — from repo root, print `version` fields (repeat for each package path as needed):
   - `node -p "require('./packages/common/package.json').version"`
   - `node -p "require('./packages/excalidraw/package.json').version"`
   - Same pattern for `packages/math`, `packages/element`, `packages/utils`, plus `excalidraw-app/package.json` for React, and `examples/with-script-in-browser/package.json` / `examples/with-nextjs/package.json` for examples.
3. **Root toolchain** — read `devDependencies` in root `package.json` (`typescript`, `vite`, `vitest`) or:  
   `node -p "const p=require('./package.json'); [p.devDependencies.typescript,p.devDependencies.vite,p.devDependencies.vitest].join(' ')"`
4. **Rebuild artifacts** (when checking examples that copy `dist`):
   - All library packages: `yarn build:packages` (root `package.json`).
   - Next.js example workspace (fonts): `yarn --cwd ./examples/with-nextjs build:workspace` — expects `packages/excalidraw/dist/prod/fonts` after `build:packages` (see `examples/with-nextjs/package.json` `copy:assets`).
5. **CI parity** — local equivalents: `.github/workflows/test.yml` (`yarn test:app`), `.github/workflows/lint.yml` (`yarn test:other`, `yarn test:code`, `yarn test:typecheck`), `.github/workflows/test-coverage-pr.yml` (`yarn test:coverage`). Prefer `yarn test:all` for a fuller gate. Open those workflow files if triggers or Node version change.

After updates, refresh the **TODO/FIXME** counts in `docs/memory/activeContext.md` using `node scripts/count-todo-fixme.js` (from repo root), then edit the paragraph and **As of** date there.

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

## Related documentation

- Memory Bank: [`techContext.md`](techContext.md), [`activeContext.md`](activeContext.md)  
- Technical: [`../technical/dev-setup.md`](../technical/dev-setup.md), [`../technical/architecture.md`](../technical/architecture.md)  
- Product: [`../product/PRD.md`](../product/PRD.md), [`../product/domain-glossary.md`](../product/domain-glossary.md)
