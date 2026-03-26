# Technical Context

**Scope:** Stack, constraints, and where things live. **Not** here: step-by-step setup, full `VITE_*` catalog, or every npm script — use [docs/technical/dev-setup.md](../technical/dev-setup.md). **Rendering pipeline, Store/Scene/History, and diagrams** — use [docs/technical/architecture.md](../technical/architecture.md).

## Core tech stack

- **App**: React 19 + Vite 5 SPA (`excalidraw-app/`). **Example**: Next.js 14 in `examples/with-nextjs` (not the main product shell).
- **Language**: TypeScript 5.9, **strict** (root + `packages/tsconfig.base.json`).
- **Styles**: Sass, clsx, Radix UI. **No** Tailwind / shadcn in this repo.
- **State**: Jotai + `jotai-scope` — ESLint forbids importing `"jotai"` directly; use `editor-jotai` / `app-jotai`.
- **Integrations**: Env-configured HTTP/WebSocket, **Firebase 11**, **Socket.io client**, optional **Sentry**. Library builds: static **ESM** under `packages/*/dist`.
- **Editor / media**: CodeMirror 6, **roughjs**, **perfect-freehand**, **@excalidraw/mermaid-to-excalidraw**, and related packages (see `package.json` workspaces for versions).

## Monorepo layout

- **Package manager**: Yarn 1 (`yarn@1.22.22`); workspaces: `excalidraw-app`, `packages/*`, `examples/*`.
- **Published-style packages**: `@excalidraw/common`, `element`, `math`, `excalidraw`, `utils` (aligned versions, e.g. **0.18.0** where applicable).
- **Path aliases**: `@excalidraw/*` → `packages/*/src` (root `tsconfig.json`; mirrored in Vite / Vitest).

## Development workflow

- **Tooling**:
  - Vite (`@vitejs/plugin-react`, checker, PWA, SVGR, EJS/html helpers),
  - **ESLint** +**Prettier**,
  - **Vitest** (jsdom, `vitest-canvas-mock`, Testing Library),
  - **lint-staged** + Husky (`prepare`).
- **Typical commands** (root): (substitute `npm run <script>` / `pnpm <script>` if you don’t use Yarn)
  - `yarn start` (Vite dev)
  - `yarn build`
  - `yarn build:packages`
  - `yarn test`
  - `yarn test:all`
  - `yarn test:typecheck`
  - `yarn test:code`
  - `yarn fix`
  
  Dev port from **`VITE_APP_PORT`** or Vite defaults.
- **Full script list, CI notes, and local onboarding** → [docs/technical/dev-setup.md](../technical/dev-setup.md) and root [package.json](../../package.json).

## Technical constraints (summary)

- **No SSR / Server Actions** on the main Excalidraw app path (static SPA). Next.js sample is illustrative only.
- **PWA**: `vite-plugin-pwa`; dev behavior gated by **`VITE_APP_ENABLE_PWA`**.
- **ESLint**: e.g. `@typescript-eslint/consistent-type-imports`, ordered imports with `@excalidraw/**` group, `react/jsx-no-target-blank`, restricted paths in `packages/excalidraw` (barrels, Jotai).
- **Tests**: Vitest thresholds — lines/statements **60%**, branches **70%**, functions **63%** ([vitest.config.mts](../../vitest.config.mts)).
- **Library packaging**: `@excalidraw/excalidraw` — dev/prod ESM + **`index.css`**; build via [scripts/buildPackage.js](../../scripts/buildPackage.js) + declarations.

## Environment variables

All **`VITE_*`** are inlined at build time. Groups: server port, storage/collab backend URLs, WebSocket, portal/AI endpoints, **Firebase** JSON config, Sentry/PWA/ESLint/tracking toggles, Plus/export-related keys. **Typed lists**: [excalidraw-app/vite-env.d.ts](../../excalidraw-app/vite-env.d.ts), [packages/excalidraw/vite-env.d.ts](../../packages/excalidraw/vite-env.d.ts). **Explained for humans** → [docs/technical/dev-setup.md](../technical/dev-setup.md) (env section + `.env.*` files).

## Deployment & runtime

- **Node**: `>=18.0.0` (`engines`). **Vercel**: `vercel.json` → `excalidraw-app/build`. **Docker**: multi-stage Node build + **Nginx** static serve.
- **CI**: `.github/workflows/`. **No** first-party SQL; persistence via **Firebase**, **IndexedDB**, and configured backends.

## Details

- For detailed system architecture and rendering pipeline → see [docs/technical/architecture.md](../technical/architecture.md)
