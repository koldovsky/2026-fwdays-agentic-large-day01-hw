# Tech Context

## Details

### Technical Docs
For architecture, APIs, setup and infrastructure:
- ../technical/architecture.md
- ../technical/api-reference.md
- ../technical/dev-setup.md
- ../technical/infrastructure.md

Use when:
- modifying system structure
- adding or integrating services
- checking setup, contracts, or dependencies

---

### Product Docs
For domain concepts, features and UX behavior:
- ../product/domain-glossary.md
- ../product/feature-catalog.md
- ../product/ux-patterns.md

Use when:
- working with business logic
- naming entities
- validating product/UX rules

Verified against root `package.json`, `excalidraw-app/package.json`, and `packages/excalidraw/package.json` unless noted.

## Overview

- **Monorepo**: Yarn workspaces â€” `excalidraw-app`, `packages/*`, `examples/*`.
- **Products**: standalone workspace `excalidraw-app`; npm packages **`@excalidraw/excalidraw` 0.18.0**; **`@excalidraw/common`**, **`@excalidraw/element`**, **`@excalidraw/math`** 0.18.0; **`@excalidraw/utils`** 0.1.2 (`packages/*/package.json` `name` / `version`).

## Runtime & tooling versions

| Area | Version / note | Source |
|------|----------------|--------|
| Node | `>=18.0.0` | `engines` in root + `excalidraw-app/package.json` |
| Yarn | `1.22.22` | root `packageManager` |
| TypeScript | `5.9.3` | root `devDependencies` |
| Vite | `5.0.12` | root `devDependencies` |
| Vitest | `3.0.6` | root `devDependencies` |
| React (app) | `19.0.0` | `excalidraw-app` `dependencies` |
| `@types/react` | `19.0.10` | root `devDependencies` |
| ESLint / Prettier | `eslint-config-*`, `prettier@2.6.2` | root `devDependencies` |
| Husky | `7.0.4` | root `devDependencies` |
| Editor package | `@excalidraw/excalidraw` **0.18.0** | `packages/excalidraw/package.json` `version` |
| App integrations (sample) | `firebase@11.3.1`, `socket.io-client@4.7.2`, `@sentry/browser@9.0.1`, `jotai@2.11.0` | `excalidraw-app/package.json` |

## Stack (concise)

- **Language**: TypeScript (strict project refs via root `tsconfig` + packages).
- **UI**: React 19 (app); library declares `peerDependencies` `react`/`react-dom` `^17 || ^18 || ^19`.
- **Bundler**: Vite 5 (app dev/build; PWA plugin and others in root devDeps).
- **Styles**: SCSS (`sass` in `packages/excalidraw` dependencies).
- **Tests**: Vitest, Testing Library, jsdom (`vitest.config.mts`, `setupTests.ts`).
- **State model (one line)**: React `AppState` + `Scene` + `Store` in `packages/excalidraw/components/App.tsx`; Jotai for auxiliary UI atoms â€” **details:** [`systemPatterns.md`](systemPatterns.md).

## Workspace layout

- `excalidraw-app/` â€” Vite app entry, production build, collaboration UI.
- `packages/excalidraw/` â€” main library source (no `src/` subfolder; modules live under `components/`, `actions/`, `data/`, etc.).
- `packages/common/`, `packages/element/`, `packages/math/`, `packages/utils/` â€” shared code; `@excalidraw/element` hosts `Store` + `CaptureUpdateAction` (`packages/element/src/store.ts`).
- `examples/` â€” integration demos.

## Dependency chain (simplified)

- `@excalidraw/excalidraw` â†’ `@excalidraw/common`, `@excalidraw/element`, `@excalidraw/math`, `@excalidraw/utils` (see `packages/excalidraw/package.json` `dependencies`).
- `@excalidraw/element` â†’ `@excalidraw/common`, `@excalidraw/math`.

## Commands (root `package.json` `scripts`)

| Script | What it runs |
|--------|----------------|
| `yarn` | Install workspaces |
| `yarn start` | `yarn --cwd ./excalidraw-app start` (Vite dev) |
| `yarn build` | `yarn --cwd ./excalidraw-app build` |
| `yarn build:packages` | `build:common` â†’ `build:math` â†’ `build:element` â†’ `build:excalidraw` |
| `yarn test` | `vitest` |
| `yarn test:all` | `test:typecheck` â†’ `test:code` â†’ `test:other` â†’ `test:app --watch=false` |
| `yarn test:typecheck` | `tsc` |
| `yarn test:code` | ESLint on `.js,.ts,.tsx` |
| `yarn test:other` | Prettier `--list-different` on configured globs |
| `yarn start:example` | `build:packages` then `examples/with-script-in-browser` `start` |
| `yarn fix` | `prettier --write` then `eslint --fix` |

## Optional tooling

- **CodeGraphContext**: `scripts/cgc.ps1`, see `docs/reference/codegraphcontext.md` and `docs/technical/dev-setup.md`.
- **Repomix** (`npx repomix`): single-file pack; no `packages/excalidraw/src/` in this tree â€” use globs like `packages/excalidraw/**/*.ts`; ignore `repomix-*.txt` / `repomix-output.xml` when doing full-repo `--compress` to avoid nesting huge artifacts.

## Where architecture details live

- **Narrative patterns (Memory Bank):** [`systemPatterns.md`](systemPatterns.md).
- **Structured architecture (diagrams, data flow, packages):** [`docs/technical/architecture.md`](../technical/architecture.md).



