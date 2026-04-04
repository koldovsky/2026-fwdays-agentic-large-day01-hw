# Excalidraw — Development Setup Guide

## Prerequisites

- **Node.js** — v18 or later (check with `node -v`)
- **Yarn** — v1 (Classic). Install with `npm install -g yarn`
- **Git** — for version control

## Initial Setup

### 1. Clone the Repository

```bash
git clone https://github.com/<your-username>/2026-fwdays-agentic-large-day01-hw.git
cd 2026-fwdays-agentic-large-day01-hw
```

### 2. Install Dependencies

```bash
yarn install
```

This installs dependencies for the root workspace and all packages (`packages/common`, `packages/element`, `packages/excalidraw`, `packages/math`, `packages/utils`, `excalidraw-app`).

### 3. Start the Development Server

```bash
yarn start
```

The app will be available at `http://localhost:5173` with hot module replacement.

## Common Development Commands

### Building

```bash
yarn build              # Build the full app (excalidraw-app)
yarn build:packages     # Build all npm packages
yarn build:excalidraw   # Build only the core library
```

### Testing

```bash
yarn test:all           # Run ALL checks (tests + types + lint + format)
yarn test:app           # Run Vitest unit/integration tests
yarn test:app --watch   # Watch mode for tests
yarn test:typecheck     # TypeScript type checking only
yarn test:code          # ESLint only
yarn test:other         # Prettier formatting check
yarn test:coverage      # Run tests with coverage report
```

### Code Quality

```bash
yarn fix                # Auto-fix all lint + formatting issues
yarn fix:code           # Auto-fix ESLint issues
yarn fix:other          # Auto-fix Prettier formatting
```

### Cleanup

```bash
yarn rm:build           # Remove all build artifacts
yarn rm:node_modules    # Remove all node_modules
yarn clean-install      # Full clean reinstall
```

## Project Structure Quick Reference

```
.
├── excalidraw-app/     # Web application (excalidraw.com)
│   ├── App.tsx         # Main app entry (39KB)
│   ├── index.tsx       # React mount point
│   └── collab/         # Collaboration features
├── packages/
│   ├── common/         # Shared constants, utils, types
│   ├── element/        # Element types and operations
│   ├── excalidraw/     # Core React component library
│   │   ├── actions/    # 48 action handlers
│   │   ├── components/ # React UI components
│   │   ├── renderer/   # Canvas rendering engines
│   │   └── data/       # Serialization and persistence
│   ├── math/           # 2D geometry functions
│   └── utils/          # Export/import API
├── public/             # Static assets
├── scripts/            # Build utilities
└── examples/           # Integration examples
```

## Working with the Codebase

### Adding a New Action

1. Create a new file in `packages/excalidraw/actions/` (e.g., `actionMyFeature.tsx`)
2. Define the action object implementing the `Action` interface
3. Register it in `packages/excalidraw/actions/index.ts`
4. If it has a keyboard shortcut, add `keyTest` to the action

### Adding a New Element Type

1. Define the type in `packages/element/src/types.ts`
2. Add a factory function in `packages/element/src/newElement.ts`
3. Add rendering logic in `packages/element/src/renderElement.ts`
4. Add bounds calculation in `packages/element/src/bounds.ts`
5. Update restoration logic in `packages/excalidraw/data/restore.ts`

### Running a Single Test File

```bash
yarn test:app -- --run packages/excalidraw/actions/__tests__/actionAlign.test.tsx
```

### Adding i18n Strings

1. Add the key to `packages/excalidraw/locales/en.json`
2. Use `t("your.key")` in components
3. Run `yarn locales-coverage` to check translation status

## Environment Variables

- `.env.development` — development-specific variables
- `.env.production` — production build variables
- `VITE_APP_*` prefix required for client-side variables

## Pre-Commit Hooks

Husky + lint-staged run automatically on `git commit`:
- ESLint on staged `.ts`/`.tsx` files
- Prettier on staged files
- TypeScript type checking

If a hook fails, fix the issue and commit again. Do not skip hooks with `--no-verify`.

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `yarn install` fails | Delete `node_modules/` and `yarn.lock`, then `yarn install` |
| Port 5173 in use | Kill the process: `lsof -ti:5173 | xargs kill` |
| Canvas tests fail | Ensure `vitest-canvas-mock` is installed |
| Type errors after pull | Run `yarn build:packages` to rebuild type definitions |
| Stale build artifacts | Run `yarn rm:build && yarn build` |
