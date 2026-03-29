# Dev Setup: From Clone to First PR

## Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| Node.js | >= 18.0.0 | Required (verified from `package.json` engines) |
| Yarn | 1.22.22 | `npm install -g yarn@1.22.22` |
| Git | any | — |
| Docker | optional | For containerized local run |

> No `.nvmrc` in repo — ensure Node 18+ manually. GitHub Actions use Node 20.x.

---

## 1. Clone & Install

```bash
git clone <repo-url>
cd 2026-fwdays-agentic-large-day01-hw

# Full clean install (recommended first time)
yarn clean-install

# Or standard install
yarn install

# Build internal monorepo packages (required before starting)
yarn build:packages
```

`.npmrc` has `save-exact=true` and `legacy-peer-deps=true` — Yarn respects these automatically.

---

## 2. Start Dev Server

```bash
yarn start
# → http://localhost:3001 (auto-opens browser)
```

Port is controlled by `VITE_APP_PORT` in `.env.development` (default `3001`).

---

## 3. Environment Variables

Two env files in repo root — **already committed with dev defaults**, no setup needed for basic local dev.

### `.env.development` — key vars

| Variable | Value | Purpose |
|----------|-------|---------|
| `VITE_APP_PORT` | 3001 | Dev server port |
| `VITE_APP_WS_SERVER_URL` | `http://localhost:3002` | Local collab WebSocket |
| `VITE_APP_AI_BACKEND` | `http://localhost:3016` | Local AI backend |
| `VITE_APP_BACKEND_V2_GET_URL` | `https://json-dev.excalidraw.com/...` | Remote dev data API |
| `VITE_APP_FIREBASE_CONFIG` | JSON string | Firebase dev project config |
| `VITE_APP_ENABLE_PWA` | false | PWA disabled in dev |
| `VITE_APP_ENABLE_ESLINT` | true | ESLint overlay in browser |
| `FAST_REFRESH` | false | HMR fast refresh disabled |

> Collaboration requires a local WebSocket server on `:3002`. For solo dev, ignore — drawing/editing works without it.

---

## 4. Project Structure (Quick Map)

```
excalidraw-app/        # Web app — collab, Firebase, auth, AI
packages/
  excalidraw/          # @excalidraw/excalidraw — core library
  element/             # Element types, mutations, rendering
  common/              # Shared constants, utils
  math/                # Point, Vector, Radians primitives
examples/              # Next.js + browser script integration examples
scripts/               # Build & release automation
```

---

## 5. Development Commands

```bash
# Dev
yarn start                 # dev server :3001
yarn start:production      # production build served locally

# Build
yarn build                 # full production build → excalidraw-app/build/
yarn build:packages        # build all monorepo packages
yarn build:excalidraw      # build library only
yarn build:app             # build web app only
yarn build:preview         # build + preview locally

# Test
yarn test                  # vitest (watch mode)
yarn test:app              # vitest for app (CI mode)
yarn test:all              # typecheck + lint + prettier + vitest
yarn test:typecheck        # tsc --noEmit
yarn test:code             # eslint
yarn test:other            # prettier --check
yarn test:coverage         # coverage report (html + lcov)
yarn test:ui               # vitest UI browser interface

# Fix
yarn fix                   # prettier + eslint auto-fix (run before commit)
yarn fix:code              # eslint --fix only
yarn fix:other             # prettier --write only

# Maintenance
yarn rm:build              # delete all dist/ dirs
yarn rm:node_modules       # delete all node_modules
yarn clean-install         # rm:build + rm:node_modules + install + build:packages
```

---

## 6. Testing

**Stack:** Vitest 3.0.6 + jsdom + `vitest-canvas-mock`

**Setup** (`setupTests.ts`):
- Canvas mocking
- `matchMedia`, `setPointerCapture`, `FontFace` polyfills
- IndexedDB fake implementation
- RAF throttle mocking

**Coverage thresholds** (enforced in CI):

| Metric | Threshold |
|--------|-----------|
| Lines | 60% |
| Branches | 70% |
| Functions | 63% |
| Statements | 60% |

```bash
yarn test:app              # run tests once
yarn test:update           # update snapshots after intentional changes
```

---

## 7. Git Hooks & Code Quality

**Pre-commit** (Husky + lint-staged, `.lintstagedrc.js`):

| Files | What runs |
|-------|-----------|
| `**/*.{js,ts,tsx}` | `eslint --max-warnings=0 --fix` |
| `**/*.{css,scss,json,md,html,yml}` | `prettier --write` |

Commit is blocked if ESLint reports any warnings or errors.

```bash
# Before committing — run manually to avoid hook failures
yarn fix
yarn test:all
```

---

## 8. Docker (optional)

```bash
# Build image
docker build -t excalidraw .

# Run via compose (port 3000:80)
docker-compose up
```

**Dockerfile:** Node 18 build → nginx:1.27-alpine serve. Output at `/usr/share/nginx/html`.

---

## 9. CI/CD Overview (`.github/workflows/`)

| Workflow | Trigger | Checks |
|----------|---------|--------|
| `test.yml` | push to master | `yarn test:app` |
| `lint.yml` | pull request | ESLint + Prettier + TypeScript |
| `test-coverage-pr.yml` | pull request | Coverage report comment on PR |
| `size-limit.yml` | PR to master | Bundle size check for `@excalidraw/excalidraw` |
| `semantic-pr-title.yml` | PR opened/edited | Validates conventional commit format in PR title |
| `build-docker.yml` | push to release branch | Builds Docker image |
| `publish-docker.yml` | push to release branch | Publishes to DockerHub (amd64, arm64, armv7) |

**PR title format** (enforced): `type(scope): description`
Examples: `feat(element): add new shape`, `fix(collab): sync conflict`, `docs: update readme`

---

## 10. First PR Workflow

```bash
# 1. Create feature branch
git checkout -b feat/your-feature

# 2. Make changes
# → packages/excalidraw/ for library changes
# → excalidraw-app/ for app-only changes

# 3. If you changed element types or math — build packages first
yarn build:packages

# 4. Run tests
yarn test:app

# 5. Fix any issues
yarn fix

# 6. Commit (hooks run automatically)
git add <files>
git commit -m "feat(scope): your change"

# 7. Push & open PR
git push origin feat/your-feature
```

**Key rules from `.github/copilot-instructions.md`:**
- TypeScript for all new code
- Functional React components + hooks (no class components)
- Use `Point` from `packages/math/src/types.ts` — never `{ x, y }`
- Use `mutateElement()` for element changes — never mutate directly
- Run `yarn test:app` after changes and fix reported issues

---

## 11. Common Issues

| Problem | Fix |
|---------|-----|
| Module not found errors | `yarn clean-install` |
| Port 3001 in use | Set `VITE_APP_PORT=3002` in `.env.development` |
| Pre-commit hook fails | `yarn fix` then re-stage |
| Type errors after pulling | `yarn build:packages` |
| Canvas-related test failures | Check `setupTests.ts` mocks are intact |
| Husky hooks not running | `yarn prepare` to reinstall hooks |
