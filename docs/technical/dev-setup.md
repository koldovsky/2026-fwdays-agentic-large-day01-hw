# Dev Setup

## Prerequisites
- Node.js `>=18.0.0`
- Yarn `1.22.22` (workspace uses `yarn@1.22.22`)
- Git and a GitHub fork of this repository

## Clone and install
1. Clone your fork:
   - `git clone https://github.com/<your-username>/2026-fwdays-agentic-large-day01-hw.git`
2. Enter repo:
   - `cd 2026-fwdays-agentic-large-day01-hw`
3. Install deps:
   - `yarn install --immutable`

## Run locally
- Start app:
  - `yarn start`
- The script runs Vite in `excalidraw-app`.

## Tests and quality checks
- App tests:
  - `yarn test`
- Full verification:
  - `yarn test:all`
- Typecheck only:
  - `yarn test:typecheck`
- Lint:
  - `yarn test:code`
- Formatting check:
  - `yarn test:other`

## Build
- Build app:
  - `yarn build`
- Build all packages:
  - `yarn build:packages`

## First PR workflow
1. Create branch:
   - `git checkout -b day1/<github-username>`
2. Make docs/code changes.
3. Run relevant checks (`yarn test`, `yarn build` at minimum).
4. Commit with clear message.
5. Push branch:
   - `git push -u origin day1/<github-username>`
6. Open PR to your fork/base as required by homework instructions.

## Common issues
- **Tests fail locally**: verify Node version and rerun `yarn install --immutable`.
- **Large-context AI confusion**: scope queries to `@folder`/`@file` and rely on Memory Bank docs.
- **Slow indexing/noise**: keep `.cursorignore` updated for generated/build artifacts.

## If baseline is already red
- Before making changes, run baseline checks and record failures.
- In PR description, explicitly mark these as pre-existing and include command output summary.
- Validate your change set with targeted checks relevant to touched areas, then rerun global checks when feasible.

## Related Docs
- [Architecture](./architecture.md)
- [Memory Tech Context](../memory/techContext.md)
- [Memory Active Context](../memory/activeContext.md)
