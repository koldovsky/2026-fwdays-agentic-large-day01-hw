# Tech Context

## Tooling baseline

- Package manager: Yarn Classic (`yarn@1.22.22`).
- Monorepo model: Yarn workspaces (`excalidraw-app`, `packages/*`, `examples/*`).
- Node.js requirement: `>=18.0.0` (root and app package engines).
- Language: TypeScript (root uses `typescript@5.9.3`).

## Main frameworks and libraries

- UI framework: React 19 (`react@19.0.0`, `react-dom@19.0.0`).
- Build tool: Vite (`vite@5.0.12`) with React plugin.
- State management: Jotai in app/library code.
- Collaboration/storage integrations:
  - Firebase SDK (`firebase@11.3.1`) in app
  - socket-based collaboration paths (imports and collab modules in `excalidraw-app`)

## Testing, linting, and formatting

- Test runner: Vitest (`vitest@3.0.6`) with `jsdom` environment.
- Coverage provider: `@vitest/coverage-v8`.
- Linting: ESLint (`yarn test:code`).
- Formatting: Prettier (`yarn test:other`, `yarn fix:other`).
- Pre-commit checks: lint-staged config runs ESLint fix and Prettier write.

## Build and delivery context

- App build output dir: `excalidraw-app/build` (from app Vite config).
- PWA: `vite-plugin-pwa` configured with runtime caching and manifest.
- Dockerized deployment path:
  - build stage on Node 18
  - runtime stage on Nginx Alpine
- `docker-compose.yml` maps container port 80 to host port 3000.

## Important commands (root)

- `yarn start` - run main app dev server (delegates to `excalidraw-app`).
- `yarn build` - build app.
- `yarn build:packages` - build internal package set.
- `yarn test` - run app tests via Vitest.
- `yarn test:all` - run typecheck + lint + format check + tests.
- `yarn test:coverage` - run coverage output.
- `yarn fix` - run formatting and lint autofix.

## Important commands (app/examples)

- `yarn --cwd ./excalidraw-app start` - app dev server (`vite`).
- `yarn --cwd ./excalidraw-app start:production` - build + local static serve.
- `yarn --cwd ./examples/with-nextjs dev` - Next.js integration example.
- `yarn --cwd ./examples/with-script-in-browser start` - browser script example.

## Source-verified references

- Root dependencies/scripts/workspaces: `package.json`.
- TypeScript path aliases: `tsconfig.json`.
- Vitest setup/coverage thresholds: `vitest.config.mts`.
- App dependencies/scripts: `excalidraw-app/package.json`.
- App Vite/PWA/build config: `excalidraw-app/vite.config.mts`.
- Docker setup: `Dockerfile`, `docker-compose.yml`.
- Pre-commit checks: `.lintstagedrc.js`.
