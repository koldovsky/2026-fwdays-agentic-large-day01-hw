# Active context

What to treat as **current focus** when opening this repo **now**, based only on structure, CI, and code markers—not on an external roadmap.

## No single “sprint” theme evidenced

There is **no** open issue list, milestone file, or contributor checklist in-tree that defines one active initiative. Treat default focus as **keeping the monorepo green** (typecheck, lint, tests, package build) and **touching the highest-churn subsystems** only with regression awareness.

## CI expectations (merge / mainline hygiene)

| Workflow | Trigger (from file) | Commands |
|----------|---------------------|----------|
| `.github/workflows/test.yml` | Push to `master` | `yarn install`, `yarn test:app` |
| `.github/workflows/lint.yml` | Pull request | `yarn test:other`, `yarn test:code`, `yarn test:typecheck` |
| `.github/workflows/test-coverage-pr.yml` | Pull request | `yarn test:coverage` + PR coverage report |
| `.github/workflows/size-limit.yml` | PR to `master` | Size limit on `packages/excalidraw` after `build:esm` |

Other workflows present: `build-docker.yml`, `publish-docker.yml`, `sentry-production.yml`, `locales-coverage.yml`, `semantic-pr-title.yml`, `autorelease-excalidraw.yml`, `cancel.yml` (see `.github/workflows/`).

**Invariant:** Changes should pass the same gates your branch targets (at minimum `yarn test:typecheck` and `yarn test:code` per `package.json` scripts).

## TODO / FIXME signal (hotspots, not a backlog)

**Scope:** `*.ts` and `*.tsx` only; any directory path containing `node_modules` is skipped (no `examples/node_modules` edge case if present).

As of **2026-03-28** (run from repo root: `node scripts/count-todo-fixme.js` — `*.ts` / `*.tsx` only, skips any path segment `node_modules`), the scan reports **113** `TODO`/`FIXME` substring **matches** across **63** files—distributed maintenance debt, not one module. The **ripgrep** commands below use the same globs and exclusions; re-run when refreshing this doc; counts will drift.

**Reproduce (repo root):**

- **ripgrep** (if installed): same globs as below.  
  - Match count (substring occurrences):  
    `rg -o 'TODO|FIXME' -g '*.ts' -g '*.tsx' --glob '!**/node_modules/**' | wc -l`  
  - Files with at least one match:  
    `rg -l 'TODO|FIXME' -g '*.ts' -g '*.tsx' --glob '!**/node_modules/**' | wc -l`

**Node.js** (no `rg`; same rules — see `scripts/count-todo-fixme.js`):

```bash
node scripts/count-todo-fixme.js
```

**Notable concentrations** (useful when debugging related behavior):

- `packages/excalidraw/components/App.tsx` — multiple TODOs plus one `FIXME` (input, paste, state).
- `packages/element/src/delta.ts` — several TODOs referencing issue-style notes (e.g. `#7348`) around undo/redo and bindings.
- `packages/excalidraw/actions/actionFinalize.tsx` — TODOs around store/undo and invisible elements.
- `excalidraw-app/App.tsx` — time-boxed TODO (“maybe remove in several months”, dated in comment).

**Not evidenced in this repo:** failing tests list, flaky-test registry, or “current epic” documentation.

## Suggested first reads (by intent)

| Intent | Start here |
|--------|------------|
| Run the product locally | Root `package.json` scripts → `excalidraw-app/` Vite entry `excalidraw-app/index.tsx` |
| Editor behavior / regressions | `packages/excalidraw/components/App.tsx`, `packages/excalidraw/actions/` |
| Hosted-only sharing / collab | `excalidraw-app/App.tsx`, `excalidraw-app/data/`, `excalidraw-app/collab/Collab.tsx` |
| Publishable package | `packages/excalidraw/package.json`, `scripts/buildPackage.js` |
| Quality gates | `vitest.config.mts`, root `package.json` `test:*` scripts |

## Invariants not to break casually

- **Workspace layout**: `excalidraw-app`, `packages/*`, `examples/*` (root `package.json` `workspaces`).
- **Path aliases** for `@excalidraw/*` in `tsconfig.json`, `excalidraw-app/vite.config.mts`, and `vitest.config.mts`—embed and tests assume them.
- **Library embed contract**: CSS + sized container (see `packages/excalidraw/README.md`; summarized in `docs/memory/projectbrief.md`).

## Sibling Memory Bank docs

- `docs/memory/projectbrief.md` — what the repo is for.  
- `docs/memory/techContext.md` — stack, versions, commands.  
- `docs/memory/systemPatterns.md` — architecture patterns (editor core, actions).  
- `docs/memory/productContext.md`, `progress.md`, `decisionLog.md` — product, inventory, decisions (this batch).

## Product and technical docs

- Product: [`../product/domain-glossary.md`](../product/domain-glossary.md), [`../product/PRD.md`](../product/PRD.md)  
- Technical: [`../technical/dev-setup.md`](../technical/dev-setup.md), [`../technical/architecture.md`](../technical/architecture.md)
