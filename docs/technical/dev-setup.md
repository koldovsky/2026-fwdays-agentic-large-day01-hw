# Developer Setup Guide — Excalidraw

Complete onboarding guide: from cloning the repository to submitting your first pull request.

---

## Prerequisites

| Requirement | Version |
| ----------- | ------- |
| **Node.js** | >= 18.0.0 |
| **Yarn** | 1.22.22 (locked via `packageManager` in package.json) |
| **Git** | Any recent version |

> **Tip:** Use [nvm](https://github.com/nvm-sh/nvm) or [fnm](https://github.com/Schniz/fnm) to manage Node versions.

---

## 1. Clone & Install

```bash
# Clone the repository
git clone https://github.com/excalidraw/excalidraw.git
cd excalidraw

# Install dependencies (Yarn workspaces handles all packages)
yarn install
```

This installs dependencies for all workspace packages:
- `excalidraw-app` — standalone web application
- `packages/excalidraw` — core React component library
- `packages/element` — element types and manipulation
- `packages/common` — shared utilities
- `packages/math` — geometry and math primitives
- `packages/utils` — export/import utilities
- `examples/*` — integration examples

---

## 2. Start Development Server

```bash
yarn start
```

This starts the Vite dev server for `excalidraw-app` on **http://localhost:3001** with hot module replacement.

### Environment Variables (Development)

Development defaults are in `.env.development`:

| Variable | Default | Purpose |
| -------- | ------- | ------- |
| `VITE_APP_PORT` | 3001 | Dev server port |
| `VITE_APP_WS_SERVER_URL` | http://localhost:3002 | WebSocket server for collaboration |
| `VITE_APP_AI_BACKEND` | http://localhost:3016 | AI features backend |
| `VITE_APP_BACKEND_V2_GET_URL` | https://json-dev.excalidraw.com/api/v2/ | Scene storage (GET) |
| `VITE_APP_BACKEND_V2_POST_URL` | https://json-dev.excalidraw.com/api/v2/post/ | Scene storage (POST) |
| `VITE_APP_ENABLE_TRACKING` | true | Analytics tracking |
| `VITE_APP_ENABLE_ESLINT` | true | In-browser ESLint overlay |
| `VITE_APP_ENABLE_PWA` | false | PWA support |

> **Note:** All env variables must be prefixed with `VITE_APP_` for Vite to expose them to the client bundle.

---

## 3. Docker Alternative

If you prefer containerized development:

```bash
docker-compose up --build
```

This serves the app on **http://localhost:3000** using nginx (production build) or mounts the repo for development.

---

## 4. Project Structure

```
excalidraw/
├── packages/
│   ├── excalidraw/     # @excalidraw/excalidraw — main React component
│   ├── element/        # @excalidraw/element — element data & operations
│   ├── common/         # @excalidraw/common — shared utilities
│   ├── math/           # @excalidraw/math — geometry primitives
│   └── utils/          # @excalidraw/utils — export/import helpers
├── excalidraw-app/     # Standalone web application
├── examples/           # Integration examples (Next.js, browser)
├── scripts/            # Build and automation scripts
├── public/             # Static assets
└── firebase-project/   # Firebase backend config
```

---

## 5. Build Commands

```bash
# Build all internal packages (required before building the app)
yarn build:packages

# Build the standalone web app
yarn build:app

# Build and preview production bundle
yarn build:preview

# Build individual packages
yarn build:common
yarn build:math
yarn build:element
yarn build:excalidraw
```

---

## 6. Running Tests

```bash
# Run all checks (TypeScript + ESLint + Prettier + Vitest)
yarn test:all

# Run individual checks
yarn test              # Vitest in watch mode
yarn test:typecheck    # TypeScript type checking
yarn test:code         # ESLint (max warnings = 0)
yarn test:other        # Prettier formatting check

# Coverage
yarn test:coverage     # Generate coverage report
yarn test:ui           # Vitest UI with coverage dashboard

# Update snapshots
yarn test:update
```

### Test Configuration

- **Runner:** Vitest 3.0.6 with jsdom environment
- **Setup file:** `setupTests.ts` (mocks for Canvas, fonts, matchMedia, IndexedDB)
- **Coverage thresholds:**
  - Lines: 60%
  - Branches: 70%
  - Functions: 63%
  - Statements: 60%

---

## 7. Code Quality

### Linting & Formatting

```bash
# Fix all formatting and linting issues
yarn fix

# Fix linting only
yarn fix:code

# Fix formatting only
yarn fix:other
```

### Pre-commit Hooks

[Husky](https://typicode.github.io/husky/) runs **lint-staged** on every commit:
- **JS/TS files:** `eslint --max-warnings=0 --fix`
- **CSS/SCSS/JSON/MD/HTML/YAML:** `prettier --write`

### Editor Config

The `.editorconfig` enforces:
- UTF-8 encoding
- 2-space indentation
- LF line endings
- Trim trailing whitespace

### Key ESLint Rules

- Import ordering: builtin → external → internal → parent → sibling
- `@excalidraw/*` imports treated as external
- Type-only imports enforced
- No direct `jotai` imports — use `editor-jotai` or `app-jotai` wrappers
- No barrel imports from `@excalidraw/excalidraw` within packages

---

## 8. Development Standards

- **TypeScript only** — no plain JavaScript files
- **React functional components** with hooks (no class components)
- **Immutable data patterns** — never mutate elements directly
- **Performance first** — avoid unnecessary re-renders
- **Small, focused components** — one responsibility per component
- **Always run tests** after modifications

---

## 9. CI/CD Pipeline

### On Pull Request

| Workflow | What It Checks |
| -------- | -------------- |
| `lint.yml` | Prettier + ESLint + TypeScript |
| `test-coverage-pr.yml` | Vitest with coverage report |
| `semantic-pr-title.yml` | PR title follows conventional commits |
| `size-limit.yml` | Bundle size regression check |

### On Push to Master

| Workflow | What It Does |
| -------- | ------------ |
| `test.yml` | Full test suite |
| `build-docker.yml` | Docker image build |
| `sentry-production.yml` | Error tracking setup |

---

## 10. Making Your First PR

### Step-by-step

1. **Fork and clone** the repository
2. **Create a feature branch:**
   ```bash
   git checkout -b feat/my-feature
   ```
3. **Make your changes** following the development standards above
4. **Run the full test suite locally:**
   ```bash
   yarn test:all
   ```
5. **Commit** — Husky will automatically lint and format staged files
6. **Push** to your fork:
   ```bash
   git push origin feat/my-feature
   ```
7. **Open a Pull Request** against `master`
8. **Wait for CI** — all checks must pass:
   - Lint (ESLint + Prettier)
   - Type check (TypeScript)
   - Tests (Vitest)
   - Bundle size check
   - PR title validation (semantic format)

### PR Title Format

Use [conventional commits](https://www.conventionalcommits.org/):
```
feat: add new drawing tool
fix: correct arrow binding on resize
refactor: extract element utils to shared package
docs: update API reference
```

---

## 11. Useful Commands Reference

| Command | Purpose |
| ------- | ------- |
| `yarn start` | Dev server (port 3001) |
| `yarn test` | Vitest watch mode |
| `yarn test:all` | All checks |
| `yarn fix` | Auto-fix lint + format |
| `yarn build:packages` | Build all packages |
| `yarn build:app` | Build standalone app |
| `yarn rm:build` | Clean build output |
| `yarn rm:node_modules` | Clean all node_modules |
| `yarn clean-install` | Fresh install |
| `yarn locales-coverage` | Translation coverage report |

---

## Related Documentation

- [Architecture](architecture.md) — system design and data flow
- [Tech Context](../memory/techContext.md) — full tech stack details
- [Domain Glossary](../product/domain-glossary.md) — project terminology
