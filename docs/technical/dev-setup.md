# Developer Setup & Onboarding

## Prerequisites

| Tool | Version |
|------|---------|
| Node.js | ≥ 18.0.0 |
| Yarn | 1.22.22 |

Install the exact Yarn version via Corepack (ships with Node 16+):

```bash
corepack enable
corepack prepare yarn@1.22.22 --activate
```

## First-time Setup

```bash
git clone https://github.com/excalidraw/excalidraw.git
cd excalidraw
yarn install          # installs all workspace dependencies
yarn start            # dev server → http://localhost:3001
```

That's it — `.env.development` is committed and pre-configured with dev-safe defaults (dev Firebase project, public backend URLs). No secrets required to run the app.

## Environment Variables

All variables are `VITE_APP_*` prefixed so Vite exposes them to the browser. The committed `.env.development` is the canonical reference (the repo has no separate `.env.example`). To override without touching the committed file, create `.env.development.local` (gitignored).

### Full variable reference

| Variable | Dev default | Description | Override locally? |
|---|---|---|---|
| `VITE_APP_BACKEND_V2_GET_URL` | `https://json-dev.excalidraw.com/api/v2/` | Scene JSON read endpoint | Yes — point at a self-hosted backend |
| `VITE_APP_BACKEND_V2_POST_URL` | `https://json-dev.excalidraw.com/api/v2/post/` | Scene JSON write endpoint | Yes |
| `VITE_APP_LIBRARY_URL` | `https://libraries.excalidraw.com` | Public library browser URL | Rarely |
| `VITE_APP_LIBRARY_BACKEND` | `https://us-central1-excalidraw-room-persistence.cloudfunctions.net/libraries` | Library read/write Cloud Function | Rarely |
| `VITE_APP_WS_SERVER_URL` | `http://localhost:3002` | Collaboration WebSocket server (excalidraw-room) | Yes — leave default if not testing collab |
| `VITE_APP_PLUS_LP` | `https://plus.excalidraw.com` | Excalidraw+ landing page URL | No |
| `VITE_APP_PLUS_APP` | `http://localhost:3000` (dev) | Excalidraw+ app URL | No |
| `VITE_APP_AI_BACKEND` | `http://localhost:3016` (dev) | AI feature (text-to-diagram) backend | Yes — point at a local AI server |
| `VITE_APP_FIREBASE_CONFIG` | Dev Firebase project JSON | Firebase project credentials (Firestore + Auth) | No — dev project is pre-configured |
| `VITE_APP_PLUS_EXPORT_PUBLIC_KEY` | RSA public key (PEM) | Public key used to verify Plus export signatures | No |
| `VITE_APP_ENABLE_TRACKING` | `true` (dev), `false` (prod) | Enable/disable analytics tracking | Yes — set `false` to silence tracking locally |
| `VITE_APP_PORT` | `3001` | Dev server port | Yes |
| `VITE_APP_ENABLE_PWA` | `false` | Enable PWA / Service Worker in dev server | Yes — `true` to test SW behaviour |
| `VITE_APP_ENABLE_ESLINT` | `true` (dev), `false` (prod) | Run ESLint overlay in dev server | Yes — set `false` to silence lint overlay |
| `VITE_APP_COLLAPSE_OVERLAY` | `true` (dev), `false` (prod) | Start with debug overlay collapsed | Yes |
| `VITE_APP_DISABLE_PREVENT_UNLOAD` | _(empty = off)_ | Suppress the "unsaved changes" beforeunload dialog | Yes — set `true` during development |
| `VITE_APP_DEV_DISABLE_LIVE_RELOAD` | _(empty = off)_ | Disable HMR / live reload | Yes — set `true` when debugging Service Workers |
| `VITE_APP_DEBUG_ENABLE_TEXT_CONTAINER_BOUNDING_BOX` | _(empty = off)_ | Render bounding boxes around text containers | Yes — debug aid only |
| `FAST_REFRESH` | `false` | React Fast Refresh (Vite default handles this; kept for legacy) | No |

### Common local overrides

Create `.env.development.local` with only the variables you need to change:

```bash
# .env.development.local — never commit this file

# Change dev server port
VITE_APP_PORT=3001

# Point at a local collaboration WebSocket server
VITE_APP_WS_SERVER_URL=http://localhost:3002

# Disable the "unsaved changes" dialog
VITE_APP_DISABLE_PREVENT_UNLOAD=true

# Disable HMR when debugging Service Workers
VITE_APP_DEV_DISABLE_LIVE_RELOAD=true

# Enable PWA in dev server
VITE_APP_ENABLE_PWA=true
```

The dev server serves the app at port `3001`. Collaboration WebSocket (excalidraw-room) runs separately on port `3002` — leave `VITE_APP_WS_SERVER_URL` at its default if you don't need live collaboration locally.

## Running Tests

```bash
# Run all tests once (recommended before pushing)
yarn test:all

# Watch mode during development
yarn test:app

# Single file or pattern
yarn test:app -- packages/element/src/__tests__/mutateElement.test.ts
yarn test:app -- --testNamePattern "should mutate"

# Coverage report (output: coverage/)
yarn test:coverage
```

Coverage thresholds are enforced: lines ≥ 60%, branches ≥ 70%, functions ≥ 63%, statements ≥ 60%. The build fails if these are not met.

## Linting & Formatting

```bash
yarn fix              # auto-fix both ESLint and Prettier in one step
yarn fix:code         # ESLint --fix only
yarn fix:other        # Prettier --write only

yarn test:code        # lint check (no fix)
yarn test:other       # format check (no fix)
yarn test:typecheck   # TypeScript typecheck (tsc --noEmit)
```

A Husky pre-commit hook runs `lint-staged` automatically on every commit. It operates directly on staged files: `eslint --max-warnings=0 --fix` for `*.{js,ts,tsx}` and `prettier --write` for `*.{css,scss,json,md,html,yml}`. The net effect is similar to `yarn fix`, but the mechanism differs — lint-staged invokes the tools directly rather than delegating to `yarn fix`. This matters if you customise the `yarn fix` scripts in `package.json`, since those changes will not affect the pre-commit hook. You rarely need to run `yarn fix` manually unless you want to clean the entire tree (not just staged files).

## Building

```bash
# Production build of the web app
yarn build                    # output: excalidraw-app/build/

# Build just the npm packages (for publishing)
yarn build:packages           # builds common → math → element → excalidraw in order
```

The app build uses Vite; package builds use esbuild (via `scripts/buildPackage.js`). You only need `yarn build:packages` if you are making changes to `packages/*` and need to test them as built artifacts.

## Monorepo Structure

This is a Yarn 1 workspaces monorepo. The packages form a strict dependency graph:

```
excalidraw-app
    └── @excalidraw/excalidraw   (packages/excalidraw)
            ├── @excalidraw/element  (packages/element)
            │       ├── @excalidraw/math    (packages/math)
            │       └── @excalidraw/common  (packages/common)
            ├── @excalidraw/math
            └── @excalidraw/common

@excalidraw/utils               (packages/utils — standalone)
```

During development, Yarn workspace symlinks wire packages together — you do **not** need to rebuild packages to see changes reflected in the app. The TypeScript path aliases in `tsconfig.json` point directly at source files.

## Key Files to Know First

| File | Why it matters |
|------|---------------|
| `packages/excalidraw/components/App.tsx` | Root editor component; owns `AppState`, wires all pointer events |
| `packages/element/src/Scene.ts` | In-memory element registry; the source of truth for what's on the canvas |
| `packages/element/src/mutateElement.ts` | The only correct way to update element properties |
| `packages/excalidraw/types.ts` | `AppState`, `ToolType`, `Collaborator` — core type definitions |
| `packages/element/src/types.ts` | All element type definitions (`ExcalidrawElement` and subtypes) |
| `packages/common/src/constants.ts` | `TOOL_TYPE`, `ROUGHNESS`, `FONT_FAMILY`, `THEME`, etc. |
| `excalidraw-app/collab/Collab.tsx` | WebSocket collaboration, E2E encryption, cursor sync |
| `excalidraw-app/app-jotai.ts` | All Jotai atoms used by the app — use this, never import from `jotai` directly |

## Common Gotchas

**Never mutate elements directly.** Always use:
- `mutateElement(el, { prop: value })` — in-place update during user interaction
- `newElementWith(el, { prop: value })` — immutable copy for store/history operations

**Math coordinates.** Use `Point` from `packages/math/src/types.ts` — never plain `{ x, y }` objects.

**Jotai imports.** Import atoms from `app-jotai.ts` (app) or `editor-jotai` (packages), not directly from `jotai`. ESLint enforces this.

**No barrel imports inside packages.** Don't import from `packages/excalidraw/index.tsx` from within the packages — import from the specific source file instead.

**Type-only imports.** Use `import type { Foo }` whenever you're only importing a type. ESLint will catch violations.

## Collaboration Server (Optional)

Real-time collaboration requires a separate WebSocket server ([excalidraw-room](https://github.com/excalidraw/excalidraw-room)). For most development work you don't need it — work on elements, rendering, and UI without it. To test collaboration:

```bash
# In a separate terminal, clone and run excalidraw-room
git clone https://github.com/excalidraw/excalidraw-room.git
cd excalidraw-room
yarn && yarn start    # starts on port 3002
```

The app's `.env.development` already points `VITE_APP_WS_SERVER_URL` at `http://localhost:3002`.

## Docker (Alternative Setup)

If you prefer a containerized environment:

```bash
docker-compose up     # builds and serves the app via Nginx
```

The multi-stage `Dockerfile` builds the app and serves static files. This mirrors the production deployment on Vercel.
