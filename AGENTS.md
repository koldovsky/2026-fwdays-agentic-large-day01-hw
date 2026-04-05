# AGENTS.md

## Purpose

This file is a quick operating guide for AI/code agents working in this repo.
Before proposing changes, align with project context and current branch state.

## Required Context (must read first)

Always read these files before starting substantial work:

- `docs/memory/projectbrief.md`
- `docs/memory/productContext.md`
- `docs/memory/techContext.md`
- `docs/memory/systemPatterns.md`
- `docs/memory/decisionLog.md`
- `docs/memory/activeContext.md`
- `docs/memory/progress.md`

If task scope is product-heavy, also check `docs/product/PRD.md`.
If task scope is setup/build-related, also check `docs/technical/dev-setup.md`.

Canonical deeper docs:

- Product docs: `docs/product/PRD.md`, `docs/product/domain-glossary.md`
- Technical docs: `docs/technical/architecture.md`, `docs/technical/dev-setup.md`

## Repo Structure (short)

- `excalidraw-app/` - product web app shell (Vite app, app-level integrations).
- `packages/excalidraw/` - main embeddable editor package.
- `packages/element/`, `packages/common/`, `packages/math/`, `packages/utils/` - core internal layers.
- `examples/` - integration examples.
- `docs/` - product, technical, and memory documentation.

## Working Conventions

- Keep changes scoped and minimal; avoid unrelated refactors.
- Respect the app-vs-library boundary:
  - core editor behavior -> usually `packages/*`,
  - product/infrastructure behavior -> usually `excalidraw-app/*`.
- Prefer source-backed decisions; do not invent features or undocumented behavior.
- Update docs when behavior/process materially changes, especially in `docs/memory/*`.
- Do not use destructive git commands (`reset --hard`, force pushes) unless explicitly requested.

## Common Commands

Run from repository root:

- Install: `yarn install`
- Start app: `yarn start`
- Build app: `yarn build`
- Build packages: `yarn build:packages`
- Run tests: `yarn test`
- Full verification: `yarn test:all`
- Typecheck only: `yarn test:typecheck`
- Lint only: `yarn test:code`
- Prettier check: `yarn test:other`
- Autofix format + lint: `yarn fix`

## PR/Change Hygiene

- Before finishing, run relevant checks for touched scope (at least lint/typecheck/tests as needed).
- Keep commit/PR descriptions focused on why the change exists and user impact.
- When uncertain, prefer small safe changes plus explicit follow-up notes.
