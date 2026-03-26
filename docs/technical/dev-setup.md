# Developer Setup — Excalidraw Monorepo

Complete onboarding guide: from cloning the repo to opening your first PR.

---

## Prerequisites

| Tool | Required Version | Check |
|------|-----------------|-------|
| **Node.js** | >= 18.0.0 | `node -v` |
| **Yarn 1 (Classic)** | 1.22.22 | `yarn -v` |
| **Git** | any recent | `git -v` |

Yarn 1 is specified via `packageManager` in the root `package.json`. If you have
Corepack enabled (`corepack enable`), it will auto-select the correct version.
Otherwise, install globally:

```bash
npm install -g yarn@1.22.22
```

> **Do not use npm, pnpm, or Yarn Berry.** The lockfile and workspace config are
> Yarn 1-specific.

---

## 1. Clone & Install

```bash
git clone https://github.com/excalidraw/excalidraw.git
cd excalidraw
yarn install
```

`yarn install` hoists all workspace dependencies into a single root
`node_modules/`. No per-package install step is needed.

---

## 2. Start the Dev Server

```bash
yarn start
```

This runs the Vite dev server for `excalidraw-app/` on **port 3001** (set via
`VITE_APP_PORT` in `.env.development`). The browser opens automatically.

Features active in dev:
- React Fast Refresh (HMR)
- TypeScript type-checking overlay
- ESLint overlay (disable with `VITE_APP_ENABLE_ESLINT=false`)
- Path aliases resolve to package **source** (not built output)

### Dev Environment Variables

The dev server loads `.env.development` from the repo root. Key defaults:

| Variable | Dev Default |
|----------|------------|
| `VITE_APP_PORT` | `3001` |
| `VITE_APP_WS_SERVER_URL` | `http://localhost:3002` |
| `VITE_APP_FIREBASE_CONFIG` | Dev Firebase project |
| `VITE_APP_ENABLE_ESLINT` | `true` |
| `VITE_APP_ENABLE_PWA` | `false` |

To override locally, create `.env.development.local` (git-ignored) — Vite
merges it with `.env.development`.

### Collaboration Server (Optional)

Real-time collaboration requires the separate
[excalidraw-room](https://github.com/excalidraw/excalidraw-room) WebSocket
server running on `localhost:3002`. Without it, the app works fine for solo use.

---

## 3. Project Structure

```
excalidraw/
├── excalidraw-app/           # Product app (Vite SPA, not published)
├── packages/
│   ├── common/               # Shared utilities & types
│   ├── math/                 # 2D geometry primitives
│   ├── element/              # Element model & store
│   ├── excalidraw/           # Core editor React component (npm package)
│   └── utils/                # Export & bounding-box helpers
├── examples/
│   ├── with-nextjs/          # Next.js integration demo
│   └── with-script-in-browser/  # Vanilla browser demo
├── scripts/                  # Build, release, WASM, locale tools
├── public/                   # Static assets (shared across app)
├── .env.development          # Dev env vars
├── .env.production           # Prod env vars
├── vitest.config.mts         # Test runner config
└── tsconfig.json             # Root TypeScript config
```

### Package Dependency Graph

```
math ──► common
element ──► common, math
excalidraw ──► common, math, element
utils ──► (standalone)
excalidraw-app ──► excalidraw (+ Firebase, Sentry, Socket.IO)
```

Packages build sequentially in dependency order:
`common → math → element → excalidraw`.

---

## 4. Build Commands

### Build the Web App

```bash
yarn build           # production build → excalidraw-app/build/
yarn build:preview   # build + preview on port 5000
```

### Build Library Packages

```bash
yarn build:packages  # builds all packages (common → math → element → excalidraw)
```

Each package outputs to `dist/dev/`, `dist/prod/`, and `dist/types/` via
esbuild.

### Docker Build

```bash
yarn build:app:docker   # production build with Sentry disabled
docker build -t excalidraw .
docker run -p 80:80 excalidraw
```

The Dockerfile uses a multi-stage build: Node 18 for building, nginx:1.27-alpine
for serving.

### Run the Browser Example

```bash
yarn start:example   # builds packages, then serves examples/with-script-in-browser/
```

### Clean Up

```bash
yarn rm:build          # remove all build outputs
yarn rm:node_modules   # remove all node_modules
yarn clean-install     # rm node_modules + fresh install
```

---

## 5. Running Tests

### Quick Test Run

```bash
yarn test              # Vitest in watch mode
yarn test:app --watch=false   # single run
```

### Full CI Suite

```bash
yarn test:all
```

This runs four checks in sequence:

| Step | Command | What It Checks |
|------|---------|---------------|
| 1 | `yarn test:typecheck` | `tsc` — TypeScript compilation (no emit) |
| 2 | `yarn test:code` | ESLint with `--max-warnings=0` |
| 3 | `yarn test:other` | Prettier format check |
| 4 | `yarn test:app --watch=false` | Vitest unit/integration tests |

### Coverage

```bash
yarn test:coverage          # single run with V8 coverage report
yarn test:coverage:watch    # watch mode with coverage
yarn test:ui                # Vitest UI with coverage
```

Coverage thresholds (enforced in `vitest.config.mts`):

| Metric | Threshold |
|--------|-----------|
| Lines | 60% |
| Branches | 70% |
| Functions | 63% |
| Statements | 60% |

### Test Environment Details

Tests run in **jsdom** with these mocks pre-configured in `setupTests.ts`:
- Canvas API (`vitest-canvas-mock`)
- IndexedDB (`fake-indexeddb`)
- `matchMedia`, `FontFace`, `document.fonts`
- `throttleRAF` (synchronous for predictable tests)
- Font fetching (reads from local filesystem instead of network)

Test files follow two patterns:
- Co-located: `ComponentName.test.tsx` next to the source
- Dedicated dirs: `packages/*/tests/`

---

## 6. Code Quality

### Linting

```bash
yarn test:code       # ESLint check (zero warnings allowed)
yarn fix:code        # ESLint auto-fix
```

Key ESLint rules to know:

| Rule | Effect |
|------|--------|
| `import/order` | Enforced ordering: builtin → external → `@excalidraw/*` → internal → types |
| `consistent-type-imports` | Must use `import type { ... }` for type-only imports |
| `no-restricted-imports` (jotai) | Cannot import from `"jotai"` directly — use `editor-jotai` or `app-jotai` |
| Barrel restriction | Inside `packages/excalidraw/`, cannot import from `@excalidraw/excalidraw` barrel — use direct relative paths |

### Formatting

```bash
yarn test:other      # Prettier check
yarn fix:other       # Prettier auto-fix
yarn fix             # fix both Prettier + ESLint
```

Prettier config: `@excalidraw/prettier-config` (referenced in root
`package.json`).

### Pre-Commit Hooks

Husky + lint-staged run automatically on `git commit`:

- `*.{js,ts,tsx}` → ESLint `--fix` (respects `.eslintignore`)
- `*.{css,scss,json,md,html,yml}` → Prettier `--write`

> **Note**: The pre-commit hook is currently commented out in
> `.husky/pre-commit` (`# yarn lint-staged`). If enabled, it runs lint-staged
> automatically.

---

## 7. TypeScript Configuration

Root `tsconfig.json` highlights:

- `strict: true`, `isolatedModules: true`, `noEmit: true`
- `target: ESNext`, `module: ESNext`, `jsx: react-jsx`
- Path aliases for all `@excalidraw/*` packages (resolve to source)

**Important**: path aliases are duplicated in three places and must stay in sync:

| File | Purpose |
|------|---------|
| `tsconfig.json` | IDE + `tsc` type-checking |
| `vitest.config.mts` | Test runner module resolution |
| `excalidraw-app/vite.config.mts` | Dev server + app build |

---

## 8. Making Changes

### Which Package to Edit?

| If you're changing... | Edit in... |
|-----------------------|-----------|
| Drawing tools, UI components, renderer | `packages/excalidraw/` |
| Element types, mutations, store | `packages/element/` |
| Geometry math (vectors, intersections) | `packages/math/` |
| Shared types, constants, utilities | `packages/common/` |
| Export/bbox helpers | `packages/utils/` |
| Cloud storage, collaboration, PWA, shell UI | `excalidraw-app/` |

### State Management Rules

- **Never** import from `"jotai"` directly — ESLint will block it
- For editor internals: import from `editor-jotai`
  (`packages/excalidraw/editor-jotai.ts`)
- For app-level state: import from `app-jotai`
  (`excalidraw-app/app-jotai.ts`)

### Import Conventions

```typescript
// Correct: type-only import
import type { ExcalidrawElement } from "@excalidraw/element/types";

// Correct: value import with proper ordering
import { nanoid } from "nanoid";

import { KEYS } from "@excalidraw/common";

import { renderElement } from "../renderer/renderElement";
```

- Use `import type` for type-only imports (enforced)
- Inside `packages/excalidraw/`, use relative paths — not the
  `@excalidraw/excalidraw` barrel

---

## 9. Submitting a PR

### Step-by-Step

```bash
# 1. Create a feature branch
git checkout -b feat/your-feature-name

# 2. Make your changes
# ... edit files ...

# 3. Run the full check suite locally
yarn test:all

# 4. Stage and commit
git add .
git commit -m "feat: description of what and why"

# 5. Push and open a PR
git push -u origin feat/your-feature-name
```

Then open a pull request on GitHub against the `master` branch.

### Pre-Submit Checklist

- [ ] `yarn test:typecheck` passes (no TS errors)
- [ ] `yarn test:code` passes (zero ESLint warnings)
- [ ] `yarn test:other` passes (Prettier-formatted)
- [ ] `yarn test:app --watch=false` passes (all tests green)
- [ ] New code has tests (co-located `*.test.tsx` or in `tests/` dir)
- [ ] No direct `jotai` imports (use `editor-jotai` or `app-jotai`)
- [ ] Type-only imports use `import type { ... }` syntax
- [ ] Changes in `packages/excalidraw/` use relative imports, not the barrel

### Commit Message Convention

Use conventional commit prefixes:

| Prefix | Use For |
|--------|---------|
| `feat:` | New features |
| `fix:` | Bug fixes |
| `refactor:` | Code restructuring (no behavior change) |
| `docs:` | Documentation only |
| `test:` | Adding or updating tests |
| `chore:` | Build, tooling, dependency changes |

---

## 10. Troubleshooting

### Common Issues

**`yarn install` fails with peer dependency errors**
→ The repo uses `legacy-peer-deps=true` in `.npmrc`. Make sure you're using
Yarn 1, not npm or Yarn Berry.

**Path alias errors in IDE**
→ Restart the TypeScript server. Ensure your IDE reads `tsconfig.json` from
the repo root.

**Canvas/rendering tests fail locally**
→ Tests mock the Canvas API via `vitest-canvas-mock`. If you see canvas-related
errors, ensure `setupTests.ts` is being loaded (check `vitest.config.mts` →
`setupFiles`).

**Port 3001 already in use**
→ Override with `VITE_APP_PORT=3003` in `.env.development.local`.

**ESLint error: "Do not import from jotai directly"**
→ Change your import to use `editor-jotai` or `app-jotai` instead of `jotai`.

**Changes to shared packages not reflected in app**
→ In dev mode, path aliases resolve to source — changes should be immediate.
If not, restart the Vite dev server.
