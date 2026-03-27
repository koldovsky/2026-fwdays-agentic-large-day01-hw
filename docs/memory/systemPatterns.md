# System patterns

## Related documentation

- **Product:** [PRD](../product/PRD.md), [Domain glossary](../product/domain-glossary.md)
- **Technical:** [Architecture](../technical/architecture.md), [Dev setup](../technical/dev-setup.md), [Code vs documentation](../technical/code-vs-documentation.md)

## Architecture style

- **Monorepo** with **Yarn workspaces** and **path-aliased TypeScript packages** under `@excalidraw/*` (`tsconfig.json` `paths`, `packages/tsconfig.base.json`).
- **Dual consumption model**:
  - **Development**: `excalidraw-app/vite.config.mts` (and `vitest.config.mts`) **resolve `@excalidraw/*` to source files** in `packages/*/src` or `packages/excalidraw/index.tsx`.
  - **Published / packaged output**: each package builds **ESM** into `dist/dev` and `dist/prod` with **esbuild**-driven scripts (`packages/*/package.json` `build:esm` → `scripts/buildBase.js`, `buildPackage.js`, or `buildUtils.js`).

## Package dependency direction (from `package.json`)

- `@excalidraw/math` → `@excalidraw/common`.
- `@excalidraw/element` → `@excalidraw/common`, `@excalidraw/math`.
- `@excalidraw/excalidraw` → `@excalidraw/common`, `@excalidraw/element`, `@excalidraw/math` (plus external npm dependencies listed in `packages/excalidraw/package.json`).
- `@excalidraw/utils` is built with its own script (`buildUtils.js`) and is **aliased** from `@excalidraw/utils` in `scripts/buildBase.js` for sibling packages.

## Main components and responsibilities

| Component | Responsibility (inferred from structure + manifests) |
|-----------|-----------------------------------------------------|
| `packages/common` | Shared constants/utilities consumed by math, element, and excalidraw. |
| `packages/math` | 2D math primitives used by element layer. |
| `packages/element` | Element model / manipulation (depends on math + common). |
| `packages/utils` | Standalone utilities (export-related deps like `roughjs`, `pako`, PNG helpers per `packages/utils/package.json`). |
| `packages/excalidraw` | React UI, canvas behavior, locales, fonts, etc. — primary embeddable library. |
| `excalidraw-app` | Product shell: hosting, collaboration client (`socket.io-client`), persistence/analytics hooks (`firebase`, `@sentry/browser`), i18n detector, etc. |

## Important conventions (ESLint)

- **Jotai**: direct `import from "jotai"` is **forbidden** at root config; message points to app-specific modules (`editor-jotai` / `app-jotai`) — `.eslintrc.json` `no-restricted-imports`.
- **Barrel imports inside `packages/excalidraw`**: importing from `@excalidraw/excalidraw` barrel is restricted for non-test files; use **relative imports** to specific modules — `.eslintrc.json` override for `packages/excalidraw/**/*.{ts,tsx}`.
- **Type-only imports**: `@typescript-eslint/consistent-type-imports` enforced (`prefer`: `type-imports`).
- **Import order**: `import/order` with `@excalidraw/**` as external group — `.eslintrc.json`.

## Data / interaction flows (high level)

- **Editor library**: React component tree and canvas rendering live in `packages/excalidraw`; lower layers (`element`, `math`, `common`) supply model and geometry.
- **excalidraw-app**: Vite bundles the app; at runtime it can talk to **configured backends** via `VITE_APP_*` URLs (see `.env.development` for names: JSON API, WebSocket server, library CDN, Firebase config, AI backend, etc.).
- **Collaboration**: `socket.io-client` in `excalidraw-app/package.json` supports real-time sync when a WS server is configured.
- **Persistence / cloud**: `firebase` client dependency in app; `firebase-project/` holds **Firestore + Storage rules** configuration (`firebase.json`).

## Build-time patterns

- **Packages**: esbuild bundles with different **define** for `import.meta.env` (`DEV` vs `PROD`) in `scripts/buildBase.js` (and analogous patterns in other build scripts).
- **excalidraw package**: `buildPackage.js` uses **sass** via `esbuild-sass-plugin` and env parsing from `packages/excalidraw/env.cjs` (see `scripts/buildPackage.js` header).
- **App production build**: `excalidraw-app` sets env vars such as `VITE_APP_GIT_SHA`, `VITE_APP_ENABLE_TRACKING` in `build:app` script (`excalidraw-app/package.json`); Docker build uses `build:app:docker` with `VITE_APP_DISABLE_SENTRY=true`.

## Testing pattern

- **Vitest** + **jsdom** + shared **`setupTests.ts`** (includes `vitest-canvas-mock` per `setupTests.ts` grep).
- Coverage thresholds are **explicit** in `vitest.config.mts` (lines/branches/functions/statements percentages).

## Key constraints & design decisions

- **Node**: minimum **18** (`package.json` `engines`).
- **TypeScript**: root `tsconfig.json` uses `strict: true`, `noEmit: true` for app/typecheck; packages use `packages/tsconfig.base.json` for declaration emit settings used when generating types (`emitDeclarationOnly` in base config).
- **Browser support**: `browserslist` blocks legacy browsers (e.g. IE11, old Safari) in `packages/excalidraw/package.json` and `excalidraw-app/package.json`.
- **Size budget**: `packages/excalidraw/.size-limit.json` exists for bundle size checks (workflow `size-limit.yml` in `.github/workflows/`).

## Not verified

- Exact runtime sequence of Firebase vs Socket.IO features in `excalidraw-app` (requires reading application source; only dependencies and env names are confirmed above).
