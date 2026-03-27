# Project Brief

This file is a compact scope index for the repo.
Deep product and technical details are intentionally kept in `docs/product/*` and `docs/technical/*`.

## Summary
- Excalidraw monorepo with a publishable editor package, a reference web app, and integration examples.
- Workspace roots: `packages/*`, `excalidraw-app`, `examples/*`.

## Scope Boundaries
- In repo: client editor runtime, UI, scene model, rendering, import/export, local persistence, collaboration client logic, and workspace build/test scripts.
- Out of repo: backend implementations (share backend, websocket infrastructure, Firebase services, AI backends).

## Constraints
- Tooling baseline is Node `>=18` with Yarn `1.x` workspaces.
- Runtime contract is browser-first with React compatibility requirements on `@excalidraw/excalidraw`.

## Source Of Detail
- Product context and requirements:
  - [productContext.md](./productContext.md)
  - [PRD](../product/PRD.md)
  - [Feature Catalog](../product/feature-catalog.md)
  - [UX Patterns](../product/ux-patterns.md)
  - [Domain Glossary](../product/domain-glossary.md)
- Technical architecture and constraints:
  - [techContext.md](./techContext.md)
  - [Architecture](../technical/architecture.md)
  - [Packages Architecture](../technical/packages-architecture.md)
  - [Hidden Invariants](../technical/hidden-invariants.md)
  - [Dev Setup](../technical/dev-setup.md)
