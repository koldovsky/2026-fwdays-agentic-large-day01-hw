# Dev Setup — Excalidraw Onboarding Guide

From clone to first PR. All commands verified against `package.json`, config files, and source code.

---

## Prerequisites

| Tool | Required version | Check |
|---|---|---|
| Node.js | ≥ 18.0.0 | `node --version` |
| Yarn | 1.22.22 | `yarn --version` |
| Git | any | `git --version` |

> **Node version manager:** use `nvm` or `fnm`.
> Engines field in `package.json`: `"node": ">=18.0.0"`
> Package manager field: `"packageManager": "yarn@1.22.22"`

---

## 1. Clone & Install

```bash
# 1. Clone the repo (or your fork)
git clone https://github.com/<your-username>/excalidraw.git
cd excalidraw

# 2. Install all workspace dependencies (root + all packages)
yarn install
```

**What happens:**
- Yarn Workspaces installs deps for all 6 workspaces at once:
  `excalidraw-app`, `packages/common`, `packages/math`, `packages/element`,
  `packages/excalidraw`, `packages/utils`, `examples/*`
- `.npmrc` forces exact versions (`save-exact=true`) and `legacy-peer-deps=true`
- `prepare` script runs `husky install` → sets up git hooks automatically

**Expected output:** `node_modules/` at root, no separate `node_modules/` per package (hoisted).

---

## 2. Environment Setup

The app reads `.env.development` automatically. For local overrides:

```bash
# Create a local override file (gitignored)
cp .env.development .env.development.local
```

Key variables in `.env.development`:

| Variable | Default | Purpose |
|---|---|---|
| `VITE_APP_PORT` | `3001` | Dev server port |
| `VITE_APP_WS_SERVER_URL` | `http://localhost:3002` | Local collab server |
| `VITE_APP_FIREBASE_CONFIG` | OSS dev project | Firebase config (already set) |
| `VITE_APP_ENABLE_PWA` | `false` | Enable PWA in dev (usually keep false) |
| `VITE_APP_ENABLE_ESLINT` | `true` | ESLint in Vite dev server |
| `VITE_APP_DISABLE_PREVENT_UNLOAD` | (empty) | Set `true` to skip "unsaved changes" dialog |

> **No secrets needed** for basic development — Firebase OSS dev project credentials
> are already in `.env.development`. Do NOT commit `.env.development.local`.

---

## 3. Start Dev Server

```bash
yarn start
```

- Runs `yarn --cwd ./excalidraw-app start`
- Vite dev server starts on port `3001` (or `VITE_APP_PORT`)
- Browser opens automatically (`open: true` in `vite.config.mts`)
- HMR (Hot Module Replacement) enabled by default

**Access:** `http://localhost:3001`

---

## 4. Project Structure Quick Reference

```
excalidraw/
├── excalidraw-app/          # Web application (Vite SPA)
│   ├── App.tsx              # Root component, collab init, PWA
│   ├── collab/Collab.tsx    # Socket.io + Firebase collaboration
│   ├── vite.config.mts      # Vite config (plugins, aliases, PWA)
│   └── public/              # Static assets, service worker
│
├── packages/
│   ├── common/src/          # Constants, utils, COLOR_PALETTE, editorInterface
│   ├── math/src/            # Point, Vector, Curve, Ellipse, Segment
│   ├── element/src/         # Scene, Store, mutateElement, binding, bounds
│   ├── excalidraw/          # Main React library
│   │   ├── index.tsx        # Public API entry point
│   │   ├── components/App.tsx  # Core component (~12 800 lines)
│   │   ├── actions/         # 36 action files + manager.tsx
│   │   ├── renderer/        # Canvas & SVG rendering
│   │   ├── scene/           # Renderer (memoized viewport filter)
│   │   └── data/            # Serialization, restore, library, localStorage
│   └── utils/src/           # exportToCanvas, exportToSvg, exportToBlob
│
├── scripts/                 # Build scripts (buildPackage.js, buildWasm.js)
├── .env.development         # Dev env vars (committed, safe)
├── .env.production          # Prod env vars (committed, safe)
├── vitest.config.mts        # Test config (jsdom, aliases, coverage thresholds)
├── tsconfig.json            # Root TS config (strict, path aliases)
└── package.json             # Workspace root (scripts, engines)
```

---

## 5. All Available Commands

### Development
```bash
yarn start                   # Dev server for excalidraw-app (port 3001)
yarn start:production        # Production build preview
yarn start:example           # Build packages + run browser example
```

### Build
```bash
yarn build                   # Build excalidraw-app (production)
yarn build:packages          # Build all npm packages (common→math→element→excalidraw)
yarn build:common            # Build @excalidraw/common only
yarn build:math              # Build @excalidraw/math only
yarn build:element           # Build @excalidraw/element only
yarn build:excalidraw        # Build @excalidraw/excalidraw only
```

> **Package build order is strict:** `common` → `math` → `element` → `excalidraw`
> (each depends on the previous). `yarn build:packages` handles this automatically.

### Testing
```bash
yarn test                    # Run all tests with Vitest (watch mode)
yarn test:app --watch=false  # Run once, no watch
yarn test:coverage           # Run with coverage report
yarn test:ui                 # Vitest UI (browser interface + coverage)
yarn test:typecheck          # TypeScript check (tsc --noEmit)
yarn test:code               # ESLint (max-warnings=0)
yarn test:other              # Prettier check
yarn test:all                # typecheck + eslint + prettier + tests (no watch)
yarn test:update             # Update snapshots
```

**Coverage thresholds** (`vitest.config.mts`):

| Metric | Threshold |
|---|---|
| Lines | 60% |
| Branches | 70% |
| Functions | 63% |
| Statements | 60% |

### Code Quality
```bash
yarn fix                     # Auto-fix: prettier + eslint
yarn fix:code                # ESLint fix only
yarn fix:other               # Prettier fix only
yarn prettier                # Check formatting
```

### Utilities
```bash
yarn clean-install           # Remove all node_modules + reinstall
yarn rm:build                # Remove all dist/ build/ dev-dist/ directories
yarn rm:node_modules         # Remove all node_modules recursively
```

---

## 6. Git Hooks (Husky + lint-staged)

Pre-commit hook (`.husky/pre-commit`) runs `lint-staged` automatically on `git commit`.

`lint-staged` config (`.lintstagedrc.js`):
```js
{
  "*.{js,ts,tsx}": files => "eslint --max-warnings=0 --fix " + files,
  "*.{css,scss,json,md,html,yml}": ["prettier --write"]
}
```

> If the pre-commit hook fails — fix the reported errors, re-stage, and commit again.
> Do NOT use `--no-verify` to skip the hook.

---

## 7. Editor Setup

### VS Code (recommended)

Required extensions:
- **ESLint** — `dbaeumer.vscode-eslint`
- **Prettier** — `esbenp.prettier-vscode`

EditorConfig (`.editorconfig`):
```ini
charset = utf-8
end_of_line = lf        # LF only — enforced by .gitattributes (text=auto eol=lf)
indent_size = 2
indent_style = space
insert_final_newline = true
trim_trailing_whitespace = true
```

### TypeScript Path Aliases

These aliases work in VS Code, Vitest, and Vite automatically:
```
@excalidraw/common    → packages/common/src/index.ts
@excalidraw/element   → packages/element/src/index.ts
@excalidraw/math      → packages/math/src/index.ts
@excalidraw/utils     → packages/utils/src/index.ts
@excalidraw/excalidraw→ packages/excalidraw/index.tsx
```

---

## 8. Docker (alternative setup)

```bash
# Build and run with Docker Compose (maps to port 3000)
docker compose up

# Access: http://localhost:3000
```

`docker-compose.yml` mounts the repo as a volume, so file changes reflect without rebuild.
Multi-stage `Dockerfile`: `node:18` build → `nginx:1.27-alpine` serve.

---

## 9. Collaboration Server (optional)

For local real-time collaboration, you need a separate room server:

```bash
# Clone and run the excalidraw-room server
git clone https://github.com/excalidraw/excalidraw-room
cd excalidraw-room
npm install && npm start   # defaults to port 3002
```

Then set in `.env.development.local`:
```
VITE_APP_WS_SERVER_URL=http://localhost:3002
```

> Without a local room server, collaboration uses the production OSS server
> (`https://oss-collab.excalidraw.com`) — fine for most development work.

---

## 10. First PR Workflow

### Branch naming
```bash
git checkout -b feat/your-feature-name
# or
git checkout -b fix/issue-description
```

### Make changes, then:
```bash
yarn fix                     # Auto-fix formatting + linting
yarn test:typecheck          # Check types
yarn test:app --watch=false  # Run tests
```

### Commit
```bash
git add <specific-files>     # Never `git add .` — avoid committing .env.local
git commit -m "feat: description"
# pre-commit hook runs lint-staged automatically
```

### PR Template (`.github/PULL_REQUEST_TEMPLATE.md`)

For this workshop, use the format:
```
Title: Day 1: <Your Name> — Workshop Assignment

Checklist:
- [ ] .cursorignore
- [ ] docs/memory/projectbrief.md
- [ ] docs/memory/techContext.md
- [ ] docs/memory/systemPatterns.md
- [ ] docs/technical/architecture.md
- [ ] docs/product/domain-glossary.md
- [ ] docs/product/PRD.md
```

### CodeRabbit auto-review

Every PR against any branch triggers CodeRabbit review (`.coderabbit.yaml`).
Reviews only files matching:
```
docs/**
.cursorignore
.cursorrules
.cursor/**
AGENTS.md
```
Language: Ukrainian (`uk-UA`). Response within ~1–2 minutes.

---

## 11. Common Issues

| Problem | Cause | Fix |
|---|---|---|
| `Cannot find module @excalidraw/...` | Packages not built | Run `yarn build:packages` |
| Port 3001 in use | Another process | Set `VITE_APP_PORT=3002` in `.env.development.local` |
| Pre-commit hook fails on Windows | LF/CRLF mismatch | Run `git config core.autocrlf false` |
| `yarn install` fails with peer deps | Conflicting versions | `.npmrc` has `legacy-peer-deps=true` — already handled |
| `localStorage quota exceeded` | Large scene in browser | Clear localStorage or use incognito |
| TypeScript errors in `packages/excalidraw/types/` | Generated types missing | Run `yarn build:excalidraw` first |
| Fonts not loading in tests | IndexedDB not available in jsdom | Expected — font loading is mocked in test env |

---

