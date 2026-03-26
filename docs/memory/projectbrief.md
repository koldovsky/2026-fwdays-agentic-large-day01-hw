# Project Brief

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

## What this project is

- **Workspace name** (root `package.json`): `excalidraw-monorepo` â€” **Yarn 1** workspaces (`excalidraw-app`, `packages/*`, `examples/*`).
- **Upstream lineage**: Excalidraw â€” whiteboard / diagram editor as a **React** component plus a **standalone web app**.
- **This repository folder**: a **course / homework / agentic** sandbox; structure follows the upstream-style monorepo.

## Goals

### Product goals (aligned with upstream)

- Ship the **standalone web app** (`excalidraw-app/`) for end users.
- Ship the **embeddable library** `@excalidraw/excalidraw` (`packages/excalidraw/`) and internal packages `@excalidraw/common`, `@excalidraw/element`, `@excalidraw/math`, `@excalidraw/utils`.
- Keep **examples** (`examples/with-nextjs`, `examples/with-script-in-browser`) buildable.

### Goals for this clone (maintenance & learning)

- Keep **quality gates** green: TypeScript (`tsc`), ESLint, Prettier, Vitest (see root `package.json` `test:*`).
- Keep **documentation** in `docs/` current when behavior or architecture is explored (see `activeContext.md`).

**Versions, stack, and commands** â€” single source: [`techContext.md`](techContext.md) (not duplicated here).

## Repository layout (high level)

| Path | Role |
|------|------|
| `excalidraw-app/` | SPA shell, Vite dev/build, collaboration and app-level integrations |
| `packages/excalidraw/` | Editor package (`@excalidraw/excalidraw`): UI, actions, data, renderer |
| `packages/common/`, `packages/element/`, `packages/math/`, `packages/utils/` | Shared packages (`@excalidraw/common`, `@excalidraw/element`, `@excalidraw/math`, `@excalidraw/utils`) |
| `examples/` | Integration demos |
| `scripts/` | Build, release, WASM, locale tooling |
| `firebase-project/` | Firebase-related project assets (as present) |
| `docs/` | Product, technical docs, Memory Bank, operations |

## Documentation map

| Need | Location |
|------|----------|
| Memory Bank index (which file to open) | [`README.md`](README.md) |
| Stack, versions, commands | [`techContext.md`](techContext.md) |
| Architecture patterns | [`systemPatterns.md`](systemPatterns.md) |
| Users, scenarios, UX intent | [`productContext.md`](productContext.md), [`docs/product/`](../product/) |
| Current focus & doc policy | [`activeContext.md`](activeContext.md) |
| Status & backlog | [`progress.md`](progress.md), [`decisionLog.md`](decisionLog.md) |
| Deep technical write-ups | [`docs/technical/`](../technical/), [`docs/reference/`](../reference/) |

## Out of scope (this brief)

- Full API matrices, env vars, deployment runbooks â€” see `docs/technical/`, `docs/operations/`, `docs/reference/`.


