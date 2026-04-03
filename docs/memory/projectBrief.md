# Project Brief

## What this project is
- Monorepo for Excalidraw with a standalone web app (`excalidraw-app`) and reusable packages (`packages/*`).
- Built with React + TypeScript and managed by Yarn workspaces.
- Main objective: interactive whiteboard/drawing experience with collaboration and export/import flows.

## Why it exists
- Provide an end-user drawing app and embeddable `@excalidraw/excalidraw` component for other products.
- Keep shared logic in reusable packages while shipping a production app.

## Repository shape
- `excalidraw-app/`: app shell, collaboration wiring, app-level UX.
- `packages/excalidraw/`: core editor package and React component exports.
- `packages/element/`: element model, transforms, geometry operations.
- `packages/common/`, `packages/math/`, `packages/utils/`: shared utilities.
- `examples/`: integration examples.

## Operational constraints
- Node version: `>=18.0.0`.
- Package manager: `yarn@1.22.22`.
- Build/test scripts are centralized in root `package.json`.

## Related Docs
- [Tech Context](./techContext.md)
- [System Patterns](./systemPatterns.md)
- [Product Context](./productContext.md)
- [Architecture](../technical/architecture.md)
- [Dev Setup](../technical/dev-setup.md)
- [Domain Glossary](../product/domain-glossary.md)
- [PRD](../product/PRD.md)
