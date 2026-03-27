# Tech Context

See [systemPatterns.md](./systemPatterns.md) for architecture and [progress.md](./progress.md) for current risks.

## Stack
- TypeScript with `strict: true`.
- React `19` in `excalidraw-app`; `@excalidraw/excalidraw` peers support React `17`/`18`/`19`.
- Vite `5`, Vitest `3`, Sass, Jotai, RoughJS, CodeMirror, Socket.IO client, Firebase SDK.
- Yarn `1.22.22` workspaces and Node `>=18`.

## Workspace Layout
- Root package: workspace orchestration, lint/test/build/release scripts.
- `packages/common`, `packages/math`, `packages/element`, `packages/excalidraw`, `packages/utils`.
- `excalidraw-app`: standalone/reference app.
- `examples/with-nextjs`, `examples/with-script-in-browser`.

## Tooling
- Root `tsconfig.json` and `vitest.config.mts` alias package imports directly to workspace source files.
- Package builds are driven by custom scripts in `scripts/` such as `buildBase.js`, `buildPackage.js`, `buildUtils.js`, and `build-node.js`.
- Tests run in `jsdom` with `setupTests.ts`; coverage thresholds are defined in `vitest.config.mts`.
- Docker support builds the app in Node 18 and serves the built app with nginx.

## Commands
- Install: `yarn`
- App dev server: `yarn start`
- Production preview: `yarn start:production` or `yarn build:preview`
- Build app: `yarn build`
- Build publishable packages: `yarn build:packages`
- Run Vitest suite: `yarn test:app`
- Full verification: `yarn test:all`
- Typecheck only: `yarn test:typecheck`
- Lint only: `yarn test:code`
- Format check: `yarn test:other`
- Example browser script app: `yarn start:example`
- Docker app build/run: `docker compose up --build`

## Constraints
- The package expects consumers to import `@excalidraw/excalidraw/index.css`.
- SSR frameworks need client-only rendering for the editor.
- Many app features are gated by runtime env vars and will not function fully in an offline or backend-less checkout.
- The collaboration, persistence, and export flows rely on browser APIs such as localStorage, IndexedDB, crypto, fetch, and ResizeObserver.

## External Services And Env
- Share/import backend: `VITE_APP_BACKEND_V2_GET_URL`, `VITE_APP_BACKEND_V2_POST_URL`
- Collaboration: `VITE_APP_WS_SERVER_URL`
- Firebase: `VITE_APP_FIREBASE_CONFIG`
- AI endpoints: `VITE_APP_AI_BACKEND`
- Excalidraw+/marketing/export: `VITE_APP_PLUS_APP`, `VITE_APP_PLUS_LP`, `VITE_APP_PLUS_EXPORT_PUBLIC_KEY`
- Library publish/browse: `VITE_APP_LIBRARY_URL`, `VITE_APP_LIBRARY_BACKEND`
- Build/runtime flags: `VITE_APP_GIT_SHA`, `VITE_APP_ENABLE_TRACKING`, `VITE_APP_DISABLE_SENTRY`, `VITE_APP_DISABLE_PREVENT_UNLOAD`, `VITE_WORKER_ID`
- Package-build internals: `PKG_NAME`, `PKG_VERSION`
