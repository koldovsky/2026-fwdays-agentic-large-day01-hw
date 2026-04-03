# Developer Setup Guide

Complete onboarding from `git clone` to your first pull request.

## Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| Node.js | ≥ 18.0.0 | Use nvm or fnm to manage versions |
| Yarn | 1.22.22 | Classic (v1), not Berry |
| Git | Any recent | — |

Check your versions:
```bash
node --version   # should be 18+
yarn --version   # should be 1.22.x
```

## 1. Clone & Install

```bash
git clone https://github.com/excalidraw/excalidraw.git
cd excalidraw
yarn install
```

`yarn install` installs dependencies for all Yarn workspaces:
- `excalidraw-app/`
- `packages/excalidraw/`
- `packages/element/`
- `packages/common/`
- `packages/math/`
- `packages/utils/`

## 2. Environment Configuration

The app reads runtime config from Vite env files. Two files are committed:

| File | Used when |
|------|-----------|
| `.env.development` | `yarn start` (dev server) |
| `.env.production` | `yarn build:app` (production build) |

For local development the defaults in `.env.development` work out of the box — they point to the public Excalidraw backends (Firebase, Socket.io, AI).

If you need to run everything locally (e.g., for isolated testing), override the relevant variables:

```bash
# excalidraw-app/.env.local (git-ignored, takes precedence)
VITE_APP_WS_SERVER_URL=http://localhost:3002
VITE_APP_BACKEND_V2_GET_URL=http://localhost:3003/api/v2/
VITE_APP_BACKEND_V2_POST_URL=http://localhost:3003/api/v2/post/
```

### Key Environment Variables

| Variable | Purpose |
|----------|---------|
| `VITE_APP_WS_SERVER_URL` | Socket.io collab server URL |
| `VITE_APP_BACKEND_V2_GET_URL` | Scene persistence backend (GET) |
| `VITE_APP_BACKEND_V2_POST_URL` | Scene persistence backend (POST) |
| `VITE_APP_FIREBASE_CONFIG` | Firebase project credentials (JSON string) |
| `VITE_APP_AI_BACKEND` | AI feature backend (TTD, Magic Frame) |
| `VITE_APP_LIBRARY_BACKEND` | Shared library backend |
| `VITE_APP_PLUS_APP` | Excalidraw+ app URL |
| `VITE_APP_DISABLE_PREVENT_UNLOAD` | Set to `"true"` to disable the unsaved-changes browser prompt (useful for development) |

## 3. Start the Development Server

```bash
yarn start
```

Opens `http://localhost:3001` (or `$VITE_APP_PORT` if set).

Hot module replacement (HMR) is enabled — changes to React components reload instantly.

## 4. Project Structure

```
excalidraw/
├── excalidraw-app/          # Web app
│   ├── App.tsx              # Root application component
│   ├── collab/Collab.tsx    # Collaboration layer (Socket.io)
│   ├── data/                # Firebase, LocalStorage, FileManager
│   ├── components/          # App-specific UI (menu, sidebar, AI dialog)
│   └── vite.config.mts      # Vite config for the web app
├── packages/
│   ├── excalidraw/          # Core React component
│   │   ├── actions/         # All user actions (move, resize, style, ...)
│   │   ├── data/            # Serialize, encrypt, encode, image handling
│   │   ├── renderer/        # Canvas and SVG render pipelines
│   │   └── index.tsx        # Public API entry point
│   ├── element/             # Element types, binding, grouping
│   ├── common/              # Constants, event names, storage keys
│   ├── math/                # Geometry math
│   └── utils/               # Misc helpers
└── examples/                # Integration examples
```

## 5. Running Tests

```bash
yarn test                    # Run Vitest (watch mode)
yarn test:app --watch=false  # Run once (CI mode)
yarn test:coverage           # With coverage report
```

Individual test files:
```bash
yarn test packages/excalidraw/tests/export.test.tsx
```

Update snapshots:
```bash
yarn test:update
```

## 6. Type Checking, Linting, Formatting

```bash
yarn test:typecheck    # TypeScript type check (tsc)
yarn test:code         # ESLint (max 0 warnings)
yarn test:other        # Prettier check

yarn fix               # Auto-fix: prettier + eslint
yarn fix:code          # ESLint --fix only
yarn fix:other         # Prettier --write only
```

Run all checks at once (same as CI):
```bash
yarn test:all
```

## 7. Building

### Build the web app
```bash
yarn build:app
```
Output: `excalidraw-app/build/`

### Build npm packages
```bash
yarn build:packages    # Builds common, math, element, excalidraw in order
yarn build:excalidraw  # Build @excalidraw/excalidraw only
```
Output: `packages/*/dist/`

### Docker build
```bash
yarn build:app:docker
docker build -t excalidraw .
docker run -p 80:80 excalidraw
```

## 8. Making Changes

### Core component changes (`packages/excalidraw`)
Changes are picked up by HMR in the dev server without rebuilding packages — Vite resolves workspace packages via path aliases.

### If you add a new package export
Update `packages/excalidraw/package.json` `exports` field and run `yarn build:excalidraw` to verify the output.

### Adding a new Action
1. Create a file in `packages/excalidraw/actions/`
2. Define an `Action` object with `name`, `perform`, and optionally `keyTest` + `PanelComponent`
3. Register it in `packages/excalidraw/actions/index.ts`

## 9. Git Workflow

```bash
git checkout -b feat/my-feature
# Make changes
yarn fix                   # Auto-fix formatting/linting
yarn test:all              # Full check suite
git add <specific files>
git commit -m "feat: describe your change"
git push origin feat/my-feature
# Open PR on GitHub
```

The `pre-commit` hook (Husky) runs `lint-staged` automatically on commit.

## 10. Common Issues

| Problem | Fix |
|---------|-----|
| `yarn install` fails with node version error | Use `nvm use 18` or higher |
| Canvas doesn't render locally | Check browser console for font/asset load errors; try setting `VITE_APP_ASSET_PATH` |
| Collab doesn't work locally | The default `VITE_APP_WS_SERVER_URL` points to production — expected in dev |
| TypeScript errors after pulling | Run `yarn install` — a new package may have been added |
| Tests fail with snapshot mismatch | Run `yarn test:update` to regenerate snapshots |

## 11. Useful Debug Flags

Set these in `.env.local` or browser console:

| Flag | Effect |
|------|--------|
| `window.DEBUG_FRACTIONAL_INDICES = true` | Log fractional indexing operations |
| `VITE_APP_DISABLE_PREVENT_UNLOAD=true` | Disable "leave page?" prompt during dev |
| `VITE_APP_DEBUG_ENABLE_TEXT_CONTAINER_BOUNDING_BOX=true` | Show text container debug outlines |
| `localStorage.setItem("excalidraw-debug", "true")` | Enable additional debug logging |

## Related Documentation

### Memory Bank
- [Tech Context](../memory/techContext.md) - Technology stack
- [System Patterns](../memory/systemPatterns.md) - Architecture patterns
- [Project Brief](../memory/projectbrief.md) - Project overview
- [Decision Log](../memory/decisionLog.md) - Undocumented behaviors

### Technical Documentation
- [Architecture](architecture.md) - System architecture

### Product Documentation
- [PRD](../product/PRD.md) - Product requirements
- [Domain Glossary](../product/domain-glossary.md) - Terminology
