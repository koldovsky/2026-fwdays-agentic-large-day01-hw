# Project Brief

## What is this project

- This repository is the `excalidraw-monorepo`.
- It contains:
  - the main web app (`excalidraw-app/`),
  - reusable packages (`packages/*`),
  - integration examples (`examples/*`).
- The primary package is `@excalidraw/excalidraw`, exported as an embeddable React component.

## Main purpose

- Build and maintain Excalidraw as:
  - a full-featured browser drawing application,
  - a reusable SDK/component for embedding into other products.
- Keep core editor logic reusable across app and integrations via workspace packages.

## Repository scope

- Product app runtime and deployment scripts.
- Library package publishing and typed exports.
- Developer tooling: testing, linting, formatting, release, and build scripts.
- Example consumer projects (browser script usage and Next.js usage).

## Key deliverables from this repo

- `@excalidraw/excalidraw` package build outputs in `packages/excalidraw/dist`.
- Production app build via `excalidraw-app`.
- Shared low-level packages:
  - `@excalidraw/common`
  - `@excalidraw/element`
  - `@excalidraw/math`
  - `@excalidraw/utils`

## Source verification

- `package.json` (root): monorepo name, workspaces, root scripts.
- `packages/excalidraw/package.json`: package description and exports.
- `packages/excalidraw/README.md`: embedding-oriented purpose and quick-start.
- `excalidraw-app/package.json`: app-specific runtime/build scripts.

---

## Related documentation

**Technical** (`docs/technical/`)

- [Architecture](../technical/architecture.md)
- [Developer setup](../technical/dev-setup.md)

**Product** (`docs/product/`)

- [PRD](../product/PRD.md)
- [Domain glossary](../product/domain-glossary.md)
