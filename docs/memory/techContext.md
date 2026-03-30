# Technical Context

## Runtime and package management

- Node engine requirement: `>=18.0.0`.
- Monorepo package manager setting: `yarn@1.22.22`.
- Workspaces:
  - `excalidraw-app`
  - `packages/*`
  - `examples/*`

## Core stack

- Language: TypeScript.
- UI: React 19 (`react`, `react-dom`).
- Build tooling: Vite 5.
- Tests: Vitest, jsdom, chai.
- Lint/format: ESLint + Prettier.
- Hooks tooling: Husky + lint-staged.

## Important dependencies by concern

- Editor/app state helpers: `jotai`, `jotai-scope`.
- Collaboration/app features: `firebase`, `socket.io-client`.
- Error monitoring in app: `@sentry/browser`.
- Rendering helpers: `roughjs` (in package dependencies).

## Key commands (root)

- Install:
  - `yarn install` (workspace-native)
  - `npm install` (works, but repo is configured for Yarn workspaces)
- Run app:
  - `yarn start`
- Build:
  - `yarn build`
  - `yarn build:packages`
- Test:
  - `yarn test`
  - `yarn test:all`
  - `yarn test:coverage`
- Quality:
  - `yarn test:code`
  - `yarn fix`

## Package-level commands

- `packages/excalidraw`:
  - `build:esm`
  - `gen:types`
- `excalidraw-app`:
  - `start`
  - `build`
  - `start:production`

## Build outputs and generated artifacts

- Common generated folders:
  - `build/`, `dist/`, `dev-dist/`, `coverage/`
- Workspace generated paths:
  - `excalidraw-app/build`
  - `packages/*/dist`
  - `examples/*/dist`

## Source verification

- `package.json` (root): engines, workspaces, scripts, devDependencies.
- `excalidraw-app/package.json`: app dependencies and app scripts.
- `packages/excalidraw/package.json`: package exports, dependencies, build scripts.

---

## Related documentation

**Technical** (`docs/technical/`)

- [Architecture](../technical/architecture.md)
- [Developer setup](../technical/dev-setup.md)

**Product** (`docs/product/`)

- [PRD](../product/PRD.md)
- [Domain glossary](../product/domain-glossary.md)
