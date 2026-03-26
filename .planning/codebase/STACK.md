# Technology Stack

**Analysis Date:** 2025-03-26

## Languages

**Primary:**
- **TypeScript** (5.9.3) — Application and library source under `packages/*`, `excalidraw-app/`
- **TSX/JSX** — React UI in `packages/excalidraw/` and `excalidraw-app/`
- **SCSS/Sass** (1.51.0 in `@excalidraw/excalidraw`) — Styles compiled via esbuild/Vite pipelines
- **JavaScript** — Node build scripts in `scripts/` (CommonJS: `require`, e.g. `scripts/buildPackage.js`, `packages/excalidraw/env.cjs`)

**Secondary:**
- **HTML** — `excalidraw-app/index.html` (EJS templating via Vite plugins)
- **JSON** — Locales, manifests, ESLint/TS configs

## Runtime

**Environment:**
- **Node.js** ≥18.0.0 (`package.json` `engines`; `Dockerfile` uses `node:18` for build)
- **Browser** — Target ranges defined in `browserslist` in `excalidraw-app/package.json` and package manifests

**Package Manager:**
- **Yarn Classic** 1.22.22 (`packageManager` in root `package.json`)
- Lockfile: `yarn.lock` (root); `examples/with-nextjs/yarn.lock` for that example

## Frameworks

**Core:**
- **React** 19.0.0 — UI (`excalidraw-app/package.json`, `packages/excalidraw` peer range `^17 || ^18 || ^19`)
- **Vite** 5.0.12 — Dev server and production bundle for `excalidraw-app/` (`excalidraw-app/vite.config.mts`)
- **Jotai** 2.11.0 — Client state (`excalidraw-app/package.json`, `packages/excalidraw/package.json`)

**Editor / drawing:**
- **CodeMirror 6** (`@codemirror/*`, `@lezer/highlight`) — In-editor code experience in `packages/excalidraw`
- **Rough.js**, **perfect-freehand**, **pica**, **browser-fs-access**, **Radix UI**, etc. — Canvas, UX, and file UX (`packages/excalidraw/package.json`)

**Testing:**
- **Vitest** 3.0.6 — Primary test runner (`vitest.config.mts`, root `package.json` scripts)
- **@vitest/coverage-v8** — Coverage reporting
- **jsdom** — Test environment (`vitest.config.mts`)
- **Chai** 4.3.6 — Assertions (root devDependency)
- **Testing Library** (`@testing-library/react`, `@testing-library/dom`, `@testing-library/jest-dom`) — Component tests (`packages/excalidraw/package.json`)

**Build/Dev:**
- **esbuild** 0.19.10 + **esbuild-sass-plugin** — Library package builds (`scripts/buildPackage.js`, `scripts/buildBase.js`, `scripts/buildUtils.js`)
- **@vitejs/plugin-react** — React refresh and JSX in Vite
- **vite-plugin-pwa** — Service worker and PWA manifest (`excalidraw-app/vite.config.mts`)
- **vite-plugin-checker** — TypeScript + ESLint overlay in dev (`excalidraw-app/vite.config.mts`)
- **vite-plugin-svgr**, **vite-plugin-ejs**, **vite-plugin-html**, **vite-plugin-sitemap** — Assets, HTML, sitemap
- **Prettier** 2.6.2 + **@excalidraw/prettier-config** — Formatting
- **ESLint** + **@excalidraw/eslint-config**, **eslint-config-react-app** — Linting (`.eslintrc.json`)
- **Husky** + **lint-staged** — Git hooks (root `package.json`)

**Examples (optional workspaces):**
- **Next.js** 14.1 — `examples/with-nextjs/package.json`
- **Vite** 5.0.12 — `examples/with-script-in-browser/package.json`

## Key Dependencies

**Critical:**
- `@excalidraw/excalidraw`, `@excalidraw/common`, `@excalidraw/element`, `@excalidraw/math`, `@excalidraw/utils` — Monorepo packages (`packages/*/package.json`)
- `firebase` 11.3.1 — Firestore and Storage for collaboration/file flows (`excalidraw-app/data/firebase.ts`)
- `socket.io-client` 4.7.2 — Real-time collaboration transport (`excalidraw-app` usage; tests mock in `excalidraw-app/tests/collab.test.tsx`)
- `@sentry/browser` 9.0.1 — Error reporting (`excalidraw-app/sentry.ts`, `excalidraw-app/index.tsx`)
- `idb-keyval` — IndexedDB key-value access (`excalidraw-app/package.json`)

**Infrastructure (build / quality):**
- `typescript` 5.9.3 — Project-wide typechecking (`tsconfig.json`, `yarn test:typecheck`)
- `dotenv` — Parsed in `packages/excalidraw/env.cjs` for embedding env into esbuild builds (reads `.env.development` / `.env.production` paths from `scripts/buildPackage.js`; do not commit secrets)
- `http-server` — Local static serving after build (`excalidraw-app/package.json` `serve` script)

## Configuration

**Environment:**
- Vite loads env from repository root: `envDir: "../"` in `excalidraw-app/vite.config.mts` with `loadEnv(mode, "../")`
- Typed `import.meta.env` keys declared in `excalidraw-app/vite-env.d.ts` and `packages/excalidraw/vite-env.d.ts`
- `.env` / `.env.*` at repo root — **present for local/production builds; never commit values or quote them in docs**

**Build:**
- Root `tsconfig.json` — `paths` for `@excalidraw/*` → `packages/*/src`
- Per-package `packages/*/tsconfig.json` extend `packages/tsconfig.base.json`
- `excalidraw-app/vite.config.mts` — Aliases mirroring TS paths to source for dev
- `vitest.config.mts` — Same path aliases for tests
- `scripts/buildPackage.js` — Injects `DEV`/`PROD` and parsed dotenv into esbuild `define` for package builds

## Platform Requirements

**Development:**
- Node ≥18, Yarn 1.x
- Run app: `yarn start` (root) → `excalidraw-app` Vite dev server; default port from `VITE_APP_PORT` or 3000 (`excalidraw-app/vite.config.mts`)

**Production:**
- Static SPA output: `excalidraw-app/build` (Vite `outDir`)
- **Docker:** multi-stage image — Node 18 build, **nginx** 1.27-alpine serves static files (`Dockerfile`)
- CI uses Node **20.x** for tests (`/.github/workflows/test.yml`) and Sentry release job (`/.github/workflows/sentry-production.yml`)

---

*Stack analysis: 2025-03-26*
