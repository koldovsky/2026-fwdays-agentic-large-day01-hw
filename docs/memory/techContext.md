# Tech context

## Details

For detailed architecture → see [docs/technical/architecture.md](../technical/architecture.md)  
For domain glossary → see [docs/product/domain-glossary.md](../product/domain-glossary.md)

## Package manager & workspace

- **Monorepo**: Yarn workspaces
  - Workspaces: `excalidraw-app`, `packages/*`, `examples/*` (root `package.json`).
- **Package manager**: `yarn@1.22.22` (root `package.json` `packageManager`).

## Runtime/tooling requirements

- **Node.js**: `>=18.0.0` (root `package.json` `engines.node`, also `excalidraw-app/package.json`).
- **TypeScript**: `5.9.3` (root `package.json` devDependencies).

## Core stack (app)

- **React**: `19.0.0` (in `excalidraw-app/package.json` dependencies).
- **Vite**: repo uses Vite for app dev/build
  - Root devDependency: `vite@5.0.12`
  - App config: `excalidraw-app/vite.config.mts` with plugins:
    - `@vitejs/plugin-react`
    - `vite-plugin-pwa`
    - `vite-plugin-checker` (TypeScript + ESLint in dev overlay)
    - `vite-plugin-sitemap`, `vite-plugin-ejs`, `vite-plugin-svgr`, `vite-plugin-html`
- **State**: Jotai is used in the app (`excalidraw-app/package.json` dependency; usage visible in `excalidraw-app/App.tsx` imports like `useAtom`/`Provider`).
- **Collaboration / realtime**: `socket.io-client@4.7.2` (app deps; collaboration modules imported in `excalidraw-app/App.tsx`).
- **Cloud integrations** (present as deps):
  - **Firebase**: `firebase@11.3.1`
  - **Sentry**: `@sentry/browser@9.0.1`

## Core stack (packages)

- **Primary published package**: `@excalidraw/excalidraw@0.18.0`
  - ESM module with exports map (see `packages/excalidraw/package.json`).
  - Peer deps: React/ReactDOM `^17 || ^18 || ^19` (same file).
- **Shared internal packages**: `@excalidraw/common`, `@excalidraw/element`, `@excalidraw/math`, `@excalidraw/utils`
  - Root TS path aliases map to source (root `tsconfig.json` `compilerOptions.paths`).

## Build & packaging

- **App build outputs**: `excalidraw-app/vite.config.mts` sets `build.outDir = "build"`.
- **Package builds**: scripts under root `scripts/`
  - Example: `scripts/buildPackage.js` uses **esbuild** + **esbuild-sass-plugin** to produce ESM builds in `dist/dev` and `dist/prod`, and inject env via `import.meta.env`.
- **Docker build**:
  - Build stage: `node:18`, runs `yarn build:app:docker` (root `Dockerfile`).
  - Runtime stage: `nginx:1.27-alpine`, serves `/usr/share/nginx/html` (root `Dockerfile`).
  - Dev compose: exposes `3000:80` (root `docker-compose.yml`).

## Test / quality tooling (repo root)

- **Unit/integration tests**: `vitest` (root scripts `test`, `test:coverage`, etc; root devDependency `vitest@3.0.6`).
- **Lint**: `eslint` (root script `test:code`).
- **Format**: `prettier@2.6.2` (root scripts `prettier`, `test:other`, `fix:other`).
- **Git hooks**: `husky` + `lint-staged` (`prepare` script in root `package.json`).

## Common commands (verified from root `package.json`)

- **Install**: `yarn`
- **Start dev app**: `yarn start` (delegates to `excalidraw-app`).
- **Build app**: `yarn build` (delegates to `excalidraw-app build`).
- **Build all packages**: `yarn build:packages`
- **Typecheck**: `yarn test:typecheck` (runs `tsc`)
- **All checks**: `yarn test:all` (typecheck + eslint + prettier + vitest)
- **Fix formatting + lint**: `yarn fix`
