# Development Setup: Excalidraw

Complete onboarding guide from clone to first PR.

## Prerequisites

- **Node.js** >= 18.0.0 ([download](https://nodejs.org/))
- **Yarn** Classic (v1.22.x) — `npm install -g yarn`
- **Git** — for version control

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/excalidraw/excalidraw.git
cd excalidraw
```

### 2. Install Dependencies

```bash
yarn install
```

This installs dependencies for all workspaces (excalidraw-app, packages/*, examples/*).

If you encounter issues, try a clean install:
```bash
yarn clean-install
```

### 3. Start Development Server

```bash
yarn start
```

Opens at **http://localhost:3001** (port configured in `.env.development`).

### 4. Verify Setup

Open http://localhost:3001 in your browser. You should see the Excalidraw canvas with the toolbar.

## Project Structure

```
excalidraw/
├── excalidraw-app/          # Main web application (start here for app changes)
│   ├── App.tsx              # Root component
│   ├── index.tsx            # Entry point
│   ├── components/          # App-specific components
│   ├── collab/              # Collaboration logic
│   └── data/                # Data persistence (LocalStorage, Firebase)
├── packages/
│   ├── excalidraw/          # Core React component (start here for library changes)
│   │   ├── actions/         # All editor actions
│   │   ├── components/      # UI components
│   │   ├── renderer/        # Canvas rendering
│   │   └── scene/           # Scene management
│   ├── element/             # Element logic (creation, transforms, bounds)
│   ├── math/                # Math utilities (Point, Vector, geometry)
│   ├── common/              # Shared constants and utilities
│   └── utils/               # Export/import utilities
├── examples/                # Integration examples
├── .env.development         # Dev environment config
└── .env.production          # Production environment config
```

## Environment Configuration

### `.env.development` (default)
- Dev server on port 3001
- WebSocket collaboration: `localhost:3002`
- AI backend: `localhost:3016`
- Firebase: dev project (`excalidraw-oss-dev`)

### `.env.local` (create for overrides)
```bash
# Disable the "unsaved changes" dialog during dev
VITE_APP_DISABLE_PREVENT_UNLOAD=true

# Disable live reload (useful for Service Worker debugging)
VITE_APP_DEV_DISABLE_LIVE_RELOAD=true
```

## Available Scripts

### Development
| Command | Description |
|---------|-------------|
| `yarn start` | Start dev server (port 3001) |
| `yarn start:production` | Start with production config |

### Building
| Command | Description |
|---------|-------------|
| `yarn build` | Production build of excalidraw-app |
| `yarn build:packages` | Build all packages (common → math → element → excalidraw) |
| `yarn build:app` | Build only the app |

**Note**: Package build order matters due to dependencies: `common` → `math` → `element` → `excalidraw`

### Testing
| Command | Description |
|---------|-------------|
| `yarn test` | Run tests in watch mode (Vitest) |
| `yarn test:all` | Full test suite (typecheck + eslint + prettier + tests) |
| `yarn test:app` | Unit/integration tests only |
| `yarn test:typecheck` | TypeScript type checking |
| `yarn test:code` | ESLint with zero warnings |
| `yarn test:other` | Prettier format check |
| `yarn test:coverage` | Tests with coverage report |

### Code Quality
| Command | Description |
|---------|-------------|
| `yarn fix` | Auto-fix formatting and lint issues |
| `yarn fix:code` | ESLint auto-fix |
| `yarn fix:other` | Prettier auto-format |

## Git Hooks (Husky)

Pre-commit hooks run automatically via **lint-staged**:
- ESLint on staged `.js`, `.ts`, `.tsx` files
- Prettier on staged `.css`, `.scss`, `.json`, `.md` files

## Coding Standards

- **TypeScript**: Strict mode, prefer immutable data (`const`, `readonly`)
- **React**: Functional components with hooks, CSS Modules for styling
- **Naming**: PascalCase (components/types), camelCase (variables), ALL_CAPS (constants)
- **Math code**: Always use `Point` type from `packages/math/src/types.ts`
- **Performance**: Prefer allocation-free implementations, trade RAM for CPU cycles

## Making Your First PR

1. Create a feature branch:
   ```bash
   git checkout -b feature/my-change
   ```

2. Make your changes following the coding standards above

3. Run the full test suite:
   ```bash
   yarn test:all
   ```

4. Fix any issues:
   ```bash
   yarn fix
   ```

5. Commit your changes (pre-commit hooks will run automatically)

6. Push and create a PR on GitHub
   - Fill in the PR template (`.github/PULL_REQUEST_TEMPLATE.md`)
   - CodeRabbit will automatically review your PR

## Collaboration Development

To test real-time collaboration locally, you need the WebSocket server:

1. Clone [excalidraw-room](https://github.com/excalidraw/excalidraw-room)
2. Start it on port 3002
3. Open two browser tabs at localhost:3001
4. Click "Live collaboration" to create/join a room

## Troubleshooting

- **Port 3001 in use**: Change `VITE_APP_PORT` in `.env.local`
- **Build fails**: Try `yarn clean-install` then `yarn build`
- **Tests hang**: Ensure no other Vitest instance is running
- **Type errors after pull**: Run `yarn build:packages` to rebuild package types

## Related Documentation

- [Architecture](./architecture.md)
- [Tech Context](../../memory-bank/techContext.md)
- [System Patterns](../../memory-bank/systemPatterns.md)
