# Developer Setup Guide

Full onboarding from clone to first PR.

## Prerequisites

| Tool | Version | Check |
|------|---------|-------|
| Node.js | ≥18.0.0 | `node -v` |
| Yarn | 1.22.22 (exact) | `yarn -v` |
| Git | any recent | `git -v` |

Yarn version is enforced via `packageManager` field in root `package.json`. If you have a different version, install it:

```bash
corepack enable
corepack prepare yarn@1.22.22 --activate
```

## 1. Clone & Install

```bash
git clone https://github.com/koldovsky/2026-fwdays-agentic-large-day01-hw.git
cd 2026-fwdays-agentic-large-day01-hw
yarn install
```

`yarn install` automatically runs `prepare` → `husky install`, which sets up Git pre-commit hooks.

## 2. Start Development Server

```bash
yarn start
```

Opens the Excalidraw app at **http://localhost:3001** with Vite HMR.

### Alternative: Docker

```bash
docker-compose up
```

Builds a Node 18 → Nginx 1.27 image, serves at **http://localhost:3000**.

### Alternative: Run Example

```bash
yarn start:example
```

Builds all packages first, then starts the `with-script-in-browser` example.

## 3. Verify Setup

Run the full test suite to confirm everything works:

```bash
yarn test:all
```

This runs (in sequence):
1. `test:typecheck` — `tsc` (TypeScript compilation check)
2. `test:code` — `eslint --max-warnings=0` (zero warnings allowed)
3. `test:other` — `prettier --list-different` (formatting check)
4. `test:app --watch=false` — Vitest unit/integration tests

## 4. Project Structure

```
├── excalidraw-app/          # Main web application (Vite + React)
├── packages/
│   ├── common/              # Shared utilities, constants, types
│   ├── math/                # Geometry primitives (Point, Radians, etc.)
│   ├── element/             # Element types, bounds, shapes, bindings
│   ├── excalidraw/          # Core editor library (npm: @excalidraw/excalidraw)
│   └── utils/               # Helper utilities
├── examples/
│   ├── with-nextjs/         # Next.js integration example
│   └── with-script-in-browser/  # Vite browser example
├── .env.development         # Dev environment variables
├── .env.production          # Production environment variables
├── vitest.config.mts        # Test configuration
└── tsconfig.json            # Root TypeScript config
```

Workspaces are defined in root `package.json`:

```json
"workspaces": ["excalidraw-app", "packages/*", "examples/*"]
```

Run a command in a specific workspace:

```bash
yarn --cwd ./packages/excalidraw build:esm
yarn --cwd ./excalidraw-app start
```

## 5. Available Scripts

### Root Commands

| Command | Purpose |
|---------|---------|
| `yarn start` | Dev server (port 3001) |
| `yarn build` | Full production build |
| `yarn build:app` | Build excalidraw-app only |
| `yarn build:packages` | Build all npm packages (common → math → element → excalidraw) |
| `yarn test:all` | Full CI check (types + lint + format + tests) |
| `yarn test:app` | Vitest in watch mode |
| `yarn test:code` | ESLint check |
| `yarn test:other` | Prettier check |
| `yarn test:typecheck` | TypeScript type check |
| `yarn test:coverage` | Tests with coverage report |
| `yarn test:ui` | Vitest UI with coverage |
| `yarn fix` | Auto-fix lint + format issues |
| `yarn fix:code` | ESLint auto-fix |
| `yarn fix:other` | Prettier auto-format |
| `yarn clean-install` | Remove all node_modules and reinstall |
| `yarn rm:build` | Remove all build artifacts |

### Package Build Order

Packages must be built in dependency order:

```
common → math → element → excalidraw
```

`yarn build:packages` handles this automatically.

## 6. Environment Variables

Two env files at root level, loaded by Vite via `loadEnv(mode, '../')`:

### `.env.development` (default for `yarn start`)

| Variable | Value | Purpose |
|----------|-------|---------|
| `VITE_APP_BACKEND_V2_GET_URL` | `https://json-dev.excalidraw.com/api/v2/` | Scene data API |
| `VITE_APP_WS_SERVER_URL` | `http://localhost:3002` | Collaboration WebSocket |
| `VITE_APP_AI_BACKEND` | `http://localhost:3016` | AI/TTD backend |
| `VITE_APP_FIREBASE_CONFIG` | Dev project JSON | Firebase config |
| `VITE_APP_PORT` | `3001` | Dev server port |
| `VITE_APP_ENABLE_TRACKING` | `true` | Analytics |

### `.env.production`

| Variable | Value |
|----------|-------|
| `VITE_APP_BACKEND_V2_GET_URL` | `https://json.excalidraw.com/api/v2/` |
| `VITE_APP_WS_SERVER_URL` | `https://oss-collab.excalidraw.com` |
| `VITE_APP_AI_BACKEND` | `https://oss-ai.excalidraw.com` |
| `VITE_APP_ENABLE_TRACKING` | `false` |

Create `.env.local` for personal overrides (gitignored).

## 7. TypeScript Configuration

Root `tsconfig.json`:
- **Target**: ESNext
- **Strict mode**: enabled
- **JSX**: react-jsx
- **Module resolution**: node
- **Path aliases**: `@excalidraw/common`, `@excalidraw/element`, `@excalidraw/excalidraw`, `@excalidraw/math`, `@excalidraw/utils`

Path aliases are mirrored in `vitest.config.mts` for test resolution.

## 8. Code Quality Tools

### ESLint

Config: `.eslintrc.json` — extends `@excalidraw/eslint-config` + `react-app`.

Key rules:
- **Import ordering**: builtins → external → `@excalidraw/*` → internal → relative
- **Type imports**: `@typescript-eslint/consistent-type-imports` — enforced `type` keyword for type-only imports
- **Jotai restriction**: Must import from `editor-jotai` or `app-jotai`, not `jotai` directly
- **No barrel imports**: Inside `packages/excalidraw/`, use direct relative paths, not barrel re-exports
- **Zero warnings**: `--max-warnings=0` — any ESLint warning fails CI

### Prettier

Config: `@excalidraw/prettier-config` (shared npm package).

Formats: `*.{css,scss,json,md,html,yml}` (TypeScript is handled by ESLint).

### Pre-Commit Hooks

Configured via Husky + lint-staged (`.lintstagedrc.js`):

| File Type | Action |
|-----------|--------|
| `*.{js,ts,tsx}` | `eslint --max-warnings=0 --fix` |
| `*.{css,scss,json,md,html,yml}` | `prettier --write` |

Hooks run automatically on `git commit`. Do **not** skip with `--no-verify`.

## 9. Testing

### Configuration

- **Runner**: Vitest 3.0.6 with jsdom environment
- **Setup**: `setupTests.ts` (root)
- **Globals**: enabled — `describe`, `it`, `expect` available without imports
- **Hook execution**: parallel (for performance)

### Coverage Thresholds

| Metric | Minimum |
|--------|---------|
| Lines | 60% |
| Branches | 70% |
| Functions | 63% |
| Statements | 60% |

### Running Tests

```bash
yarn test:app              # Watch mode
yarn test:app --watch=false  # Single run
yarn test:coverage         # With coverage report
yarn test:ui               # Visual UI with coverage
yarn test:update           # Update snapshots
```

## 10. Making Your First PR

### Step-by-step

```bash
# 1. Create a feature branch
git checkout -b feature/my-change

# 2. Make your changes
# ... edit files ...

# 3. Auto-fix lint and formatting
yarn fix

# 4. Run full test suite
yarn test:all

# 5. Commit (pre-commit hooks run automatically)
git add .
git commit -m "feat: description of change"

# 6. Push and create PR
git push origin feature/my-change
```

### PR Checklist

- [ ] `yarn test:typecheck` passes (no TypeScript errors)
- [ ] `yarn test:code` passes (zero ESLint warnings)
- [ ] `yarn test:other` passes (formatting correct)
- [ ] `yarn test:app --watch=false` passes (all tests green)
- [ ] Coverage thresholds still met if adding new code
- [ ] New tests added for new functionality

### Commit Message Convention

Follow conventional commits:
- `feat:` — new feature
- `fix:` — bug fix
- `refactor:` — code restructuring
- `test:` — adding/updating tests
- `docs:` — documentation changes

## 11. Common Tasks

### Add a new element property

1. Update type in `packages/element/src/types.ts`
2. Add default in `packages/excalidraw/data/restore.ts`
3. Handle in relevant actions under `packages/excalidraw/actions/`
4. Add tests

### Add a new action

1. Create action file in `packages/excalidraw/actions/`
2. Register in `packages/excalidraw/actions/index.ts`
3. Add keyboard shortcut in `packages/excalidraw/actions/shortcuts.ts`
4. Add i18n key in `packages/excalidraw/locales/en.json`

### Run only specific tests

```bash
yarn test:app -- --grep "element binding"
yarn test:app packages/element/tests/binding.test.ts
```

### Debug in browser

Dev server includes Vite's HMR and source maps. Open DevTools → Sources → find files under `packages/` or `excalidraw-app/`.

## 12. Deployment

### Vercel (Production)

Configured via `vercel.json`:
- Output directory: `excalidraw-app/build`
- Install command: `yarn install`
- Security headers: CORS, X-Content-Type-Options, Referrer-Policy
- Font caching: `Cache-Control: max-age=31536000` for `.woff2`

### Docker (Self-Hosting)

```bash
docker-compose up --build
```

Two-stage build:
1. **Build stage**: Node 18, `yarn build:app:docker`
2. **Serve stage**: Nginx 1.27-alpine, static files from `excalidraw-app/build`

Exposed on port 3000 (maps 80 inside container).

## 13. Troubleshooting

| Problem | Solution |
|---------|----------|
| `yarn install` fails | `yarn clean-install` (removes all node_modules first) |
| Type errors after pull | `yarn test:typecheck` — check for breaking type changes |
| Port 3001 in use | Set `VITE_APP_PORT` in `.env.local` |
| Tests hang | Check for `--watch` mode; use `--watch=false` for CI |
| Build artifacts stale | `yarn rm:build` then rebuild |
| Collaboration not working | Start local WebSocket server at `localhost:3002` |
| Firebase errors | Check `VITE_APP_FIREBASE_CONFIG` in env file |
