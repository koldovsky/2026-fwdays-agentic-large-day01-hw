# Local Development Setup

> Cross-reference: [infrastructure.md](infrastructure.md) for environment variables, [architecture.md](architecture.md) for package structure.

## Prerequisites

| Tool | Required Version | Check |
|------|-----------------|-------|
| Node.js | ≥ 18.0.0 | `node --version` |
| Yarn | 1.22.x | `yarn --version` |
| Git | any | `git --version` |

> **Note:** npm is not supported — the repo uses Yarn Workspaces.

## Quick Start

```bash
# 1. Clone
git clone <repo-url>
cd 2026-fwdays-agentic-large-day01-hw

# 2. Install all workspace dependencies
yarn install
# or for a clean slate:
yarn clean-install

# 3. Start dev server
yarn start
# → App available at http://localhost:3001
```

## What `yarn start` Does

- Runs only the `excalidraw-app` dev server via Vite
- **Does NOT start** the collaboration WebSocket server (requires separate process)
- **Does NOT start** the AI backend
- Hot Module Replacement is active — file changes reflect immediately

## Starting Optional Services

### Collaboration Server (WebSocket)
The dev environment expects a Socket.io server at `http://localhost:3002`.

> The collab server lives in a separate repository (`excalidraw-room`). Clone and run it independently, or skip — the app works offline without it.

### AI Backend
Expects `http://localhost:3016` for text-to-diagram features.

> Also a separate service. Without it, the TTD Dialog will fail to generate diagrams but won't crash the app.

## Environment Configuration

Dev environment is pre-configured via `.env.development`. Key values:

```env
VITE_APP_WS_SERVER_URL=http://localhost:3002
VITE_APP_AI_BACKEND=http://localhost:3016
VITE_APP_PORT=3001
```

To override locally without committing, create `.env.development.local` (gitignored).

## Building

```bash
# Build just the web app (output: excalidraw-app/build/)
yarn build:app

# Build all packages (for library development)
yarn build:packages

# Build individual packages
yarn build:common
yarn build:element
yarn build:excalidraw
yarn build:math

# Serve production build locally
yarn start:production
```

### Docker Build

```bash
# Build image
docker build -t excalidraw .

# Run container
docker-compose up
# → App available at http://localhost:3000
```

## Running Tests

```bash
# Run all unit tests (watch mode)
yarn test:app

# Run with coverage report
yarn test:coverage

# Run ESLint
yarn test:code

# Run Prettier check
yarn test:other

# Run everything
yarn test:all
```

### Test Environment Details
- Runner: Vitest with jsdom environment
- Canvas: mocked via `vitest-canvas-mock`
- Fonts: mocked to avoid network calls
- Config: `vitest.config.mts`, setup: `setupTests.ts`

## Linting & Formatting

```bash
# Auto-fix ESLint issues
yarn fix:code

# Auto-format with Prettier
yarn fix:other
```

Pre-commit hooks (Husky + lint-staged) run these automatically on staged files.

## IDE Setup

### TypeScript Path Aliases
The following aliases are configured in `tsconfig.json` and Vite:

| Alias | Points to |
|-------|-----------|
| `@excalidraw/common` | `packages/common/src` |
| `@excalidraw/element` | `packages/element/src` |
| `@excalidraw/math` | `packages/math/src` |
| `@excalidraw/utils` | `packages/utils/src` |
| `@excalidraw/excalidraw` | `packages/excalidraw/index.tsx` |

Ensure your IDE (VS Code / JetBrains) picks up `tsconfig.json` from the root.

### Recommended VS Code Extensions
- ESLint (`dbaeumer.vscode-eslint`)
- Prettier (`esbenp.prettier-vscode`)
- TypeScript Vue Plugin or built-in TS support

## Common Issues

| Problem | Likely Cause | Fix |
|---------|-------------|-----|
| `yarn` not found | npm used instead | Install Yarn: `npm i -g yarn` |
| Port 3001 in use | Another process | `VITE_APP_PORT=3005 yarn start` |
| Canvas tests fail | Missing mock | Check `setupTests.ts` imports `vitest-canvas-mock` |
| Type errors on `@excalidraw/*` | Missing build | Run `yarn build:packages` first |
| Collaboration not working | WS server not running | Start `excalidraw-room` server on port 3002 |
| Fonts not loading | Asset path | Set `window.EXCALIDRAW_ASSET_PATH` if self-hosting |

## Localization Development

```bash
# Check which translations are incomplete
yarn locales-coverage
```

Translation files: `packages/excalidraw/src/locales/`
Crowdin config: `crowdin.yml` (translation management platform)

## Package Development (Library Mode)

When modifying packages, you must rebuild them for changes to appear in the app:

```bash
# Rebuild a specific package
yarn build:element

# Or use watch mode (if available per package)
cd packages/element && yarn build --watch
```
