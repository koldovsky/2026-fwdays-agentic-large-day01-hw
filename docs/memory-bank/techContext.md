# Tech Context

This file is a compact tooling and workflow index for Memory Bank.
Detailed setup, commands, and architecture are documented in `docs/technical/*`.

## Stack Snapshot
- TypeScript (`strict: true`), React `19` in `excalidraw-app`, and React `17/18/19` compatibility in `@excalidraw/excalidraw`.
- Vite/Vitest-based toolchain with Yarn `1.22.22` workspaces and Node `>=18`.
- Browser-first runtime with optional backend/service integrations.

## Workspace Layout
- Root package orchestrates workspace scripts.
- `packages/common`, `packages/math`, `packages/element`, `packages/excalidraw`, `packages/utils`.
- `excalidraw-app`: standalone/reference app.
- `examples/with-nextjs`, `examples/with-script-in-browser`.

## Quick Commands
- Install: `yarn`
- App dev server: `yarn start`
- Build app: `yarn build`
- Build publishable packages: `yarn build:packages`
- Full verification: `yarn test:all`
- Full local command matrix, CI mapping, and PR workflow: [dev-setup.md](../technical/dev-setup.md)

## Source Of Detail
- Architecture overview and render/data/state flow: [architecture.md](../technical/architecture.md)
- Deep `packages/*` internals: [packages-architecture.md](../technical/packages-architecture.md)
- Risky behavior and non-obvious constraints: [hidden-invariants.md](../technical/hidden-invariants.md)
- Session focus and outstanding risks: [activeContext.md](./activeContext.md), [progress.md](./progress.md)
