# Tech Context

## Core Stack

- Monorepo: Yarn workspaces (`yarn@1.22.22`)
- Runtime: Node.js `>=18.0.0`
- Language: TypeScript `5.9.3`
- UI: React `19.0.0`, React DOM `19.0.0`
- State: Jotai `2.11.0`
- Build tool: Vite `5.0.12`
- Tests: Vitest `3.0.6`, jsdom, Testing Library, `vitest-canvas-mock`
- Lint/format: ESLint, Prettier, Husky, lint-staged

## Workspace Layout

- `excalidraw-app`
- `packages/common`
- `packages/element`
- `packages/excalidraw`
- `packages/math`
- `packages/utils`
- `examples/*`

## Important Libraries And Integrations

- `firebase@11.3.1` for Firestore/Storage in collaboration and file flows
- `socket.io-client@4.7.2` for live collaboration
- `vite-plugin-pwa@0.21.1` for PWA support
- `vite-plugin-checker@0.7.2` for TypeScript/ESLint overlay checks
- `vite-plugin-svgr@4.2.0` for SVG-to-React imports
- `@sentry/browser@9.0.1` for browser monitoring
- `idb-keyval@6.0.3` for local file persistence
- `roughjs@4.6.4` in the editor package for hand-drawn rendering
- `@codemirror/*` for editor-related functionality in `packages/excalidraw`
- `@excalidraw/mermaid-to-excalidraw@2.1.1` for Mermaid conversion

## Top-Level Commands

### Run And Build

- `yarn start` - start `excalidraw-app`
- `yarn build` - build the app through `excalidraw-app`
- `yarn build:preview` - build and preview
- `yarn start:production` - build and serve the production app locally
- `yarn start:example` - build packages and run the browser example

### Package Builds

- `yarn build:packages`
- `yarn build:common`
- `yarn build:math`
- `yarn build:element`
- `yarn build:excalidraw`

### Tests And Quality Gates

- `yarn test`
- `yarn test:all`
- `yarn test:app`
- `yarn test:typecheck`
- `yarn test:code`
- `yarn test:other`
- `yarn test:coverage`
- `yarn fix`

### Service Commands

- `yarn locales-coverage`
- `yarn release`
- `yarn clean-install`

## App-Level Commands

Defined in `excalidraw-app/package.json`:

- `yarn --cwd ./excalidraw-app start`
- `yarn --cwd ./excalidraw-app build:app`
- `yarn --cwd ./excalidraw-app build`
- `yarn --cwd ./excalidraw-app serve`
- `yarn --cwd ./excalidraw-app build:preview`

## Build Configuration

- The Vite dev server uses `VITE_APP_PORT` or defaults to `3000`
- `envDir` points to the repository root
- `publicDir` points to the root `public` directory
- Aliases in Vite and Vitest point to local `packages/*` sources, not built artifacts
- App build output goes to `excalidraw-app/build`
- Source maps are enabled

## Test Environment

- Vitest runs in `jsdom`
- Globals are enabled
- `setupTests.ts` loads `vitest-canvas-mock`
- Tests mock `throttleRAF`, `matchMedia`, `FontFace`, and `fake-indexeddb`
- Coverage thresholds: lines `60`, branches `70`, functions `63`, statements `60`

## Docker

- The repo includes `Dockerfile` and `docker-compose.yml`
- Compose maps port `3000:80`
- The container name is `excalidraw`
- The development setup mounts the whole repository as a volume

## Related Docs

- Detailed runtime architecture: `docs/technical/architecture.md`
- Developer onboarding and local setup: `docs/technical/dev-setup.md`

## Verified From Source

- `package.json`
- `excalidraw-app/package.json`
- `packages/excalidraw/package.json`
- `tsconfig.json`
- `excalidraw-app/vite.config.mts`
- `vitest.config.mts`
- `setupTests.ts`
- `docker-compose.yml`
