# Developer setup — clone to first PR

Step-by-step onboarding for this Excalidraw monorepo.

---

## 1. Prerequisites

| Tool | Required version | Check |
|------|-----------------|-------|
| **Node.js** | `>=18.0.0` | `node -v` |
| **Yarn** | `1.22.22` (Classic) | `yarn -v` |
| **Git** | any recent | `git --version` |

The repo pins `"packageManager": "yarn@1.22.22"` (root `package.json`). Do **not** use npm or Yarn Berry — the lockfile is Yarn 1 format.

---

## 2. Clone and install

```bash
git clone <your-fork-or-origin-url>
cd 2026-fwdays-agentic-large-day01-hw

yarn install
```

`yarn install` resolves three workspace groups defined in root `package.json`:

- `excalidraw-app` — the Vite web application
- `packages/*` — `common`, `element`, `excalidraw`, `math`, `utils`
- `examples/*` — integration examples (Next.js, script-in-browser)

All `devDependencies` are hoisted to the root `node_modules/`.

### Husky (Git hooks)

`yarn install` triggers the `prepare` script which runs `husky install`. This sets up `.husky/pre-commit`. The hook is currently **commented out** (`# yarn lint-staged` in `.husky/pre-commit`), so no automatic pre-commit checks run by default. If you want to re-enable:

```bash
# .husky/pre-commit — uncomment the line:
yarn lint-staged
```

`lint-staged` is configured in `.lintstagedrc.js` to:

- Run `eslint --max-warnings=0 --fix` on staged `*.{js,ts,tsx}` files
- Run `prettier --write` on staged `*.{css,scss,json,md,html,yml}` files

---

## 3. Start the dev server

```bash
yarn start
```

This runs `vite` inside `excalidraw-app/`. Vite config: `excalidraw-app/vite.config.mts`.

| Setting | Value | Source |
|---------|-------|--------|
| **Port** | `3001` (from `VITE_APP_PORT`) | `.env.development` |
| **Auto-open browser** | yes (`open: true`) | `vite.config.mts` |
| **HMR** | enabled by default | disable via `VITE_APP_DEV_DISABLE_LIVE_RELOAD=true` in `.env.development.local` |
| **ESLint overlay** | enabled | `VITE_APP_ENABLE_ESLINT=true` in `.env.development` |
| **PWA in dev** | disabled | `VITE_APP_ENABLE_PWA=false` in `.env.development` |

### How it resolves workspace packages

During development, **no pre-build is needed**. Vite `resolve.alias` entries in `vite.config.mts` point `@excalidraw/*` imports directly to source files:

```text
@excalidraw/common   → packages/common/src/index.ts
@excalidraw/element  → packages/element/src/index.ts
@excalidraw/excalidraw → packages/excalidraw/index.tsx
@excalidraw/math     → packages/math/src/index.ts
@excalidraw/utils    → packages/utils/src/index.ts
```

TypeScript uses the same mapping via `paths` in root `tsconfig.json`.

### Environment files

| File | Purpose |
|------|---------|
| `.env.development` | Defaults for `yarn start` (dev backend URLs, Firebase dev project, port 3001) |
| `.env.production` | Defaults for `yarn build` (production backend URLs, Firebase prod project) |
| `.env.development.local` | **Your local overrides** (gitignored). Create if needed. |
| `.env.local` | Shared local overrides (gitignored) |

Key variables you might override locally:

```bash
# .env.development.local
VITE_APP_WS_SERVER_URL=http://localhost:3002   # local collab server
VITE_APP_DISABLE_PREVENT_UNLOAD=true           # skip "unsaved changes" dialog
VITE_APP_DEV_DISABLE_LIVE_RELOAD=true          # for Service Worker debugging
```

---

## 4. Run tests

### Quick test run

```bash
yarn test              # alias for yarn test:app → vitest (watch mode)
yarn test --watch=false  # single run
```

### Full CI-equivalent suite

```bash
yarn test:all
```

This chains four steps sequentially:

1. `yarn test:typecheck` — `tsc` (root `tsconfig.json`, `noEmit`)
2. `yarn test:code` — `eslint --max-warnings=0 --ext .js,.ts,.tsx .`
3. `yarn test:other` — `prettier --list-different` (checks formatting without writing)
4. `yarn test:app --watch=false` — Vitest single run

### Coverage

```bash
yarn test:coverage          # single run with coverage report
yarn test:coverage:watch    # watch mode with coverage
yarn test:ui                # Vitest UI with coverage
```

Coverage thresholds (from `vitest.config.mts`):

| Metric | Minimum |
|--------|---------|
| Lines | 60% |
| Branches | 70% |
| Functions | 63% |
| Statements | 60% |

### Vitest configuration highlights

- Config file: `vitest.config.mts`
- Setup file: `./setupTests.ts`
- Environment: `jsdom` (browser APIs mocked)
- Globals: `true` (no need to import `describe`, `it`, `expect`)
- Hook execution: `parallel` (overrides default serial in Vitest v2+)
- Same `@excalidraw/*` aliases as Vite, so tests resolve source directly

---

## 5. Linting and formatting

### ESLint

```bash
yarn test:code       # lint check (zero warnings tolerance)
yarn fix:code        # lint + auto-fix
```

Config: `.eslintrc.json` extends `@excalidraw/eslint-config` + `react-app`.

Notable rules:

- **`import/order`** — enforced ordering with `@excalidraw/**` grouped after external, newlines between groups
- **`@typescript-eslint/consistent-type-imports`** — must use `import type` for type-only imports
- **`no-restricted-imports`** — do **not** import `jotai` directly; use `editor-jotai` or `app-jotai`
- **barrel import ban** — inside `packages/excalidraw/`, do not import from `@excalidraw/excalidraw` barrel; use direct relative paths

Ignored paths (`.eslintignore`): `node_modules/`, `build/`, `dist/`, `firebase/`, `dev-dist/`, `coverage/`, `packages/excalidraw/types`.

### Prettier

```bash
yarn test:other      # check formatting (no write)
yarn fix:other       # auto-format
yarn fix             # fix:other + fix:code combined
```

Config: `"prettier": "@excalidraw/prettier-config"` in root `package.json` (`prettier 2.6.2`).

Targets: `**/*.{css,scss,json,md,html,yml}` (note: `.ts`/`.tsx` formatting is handled by ESLint's Prettier plugin).

---

## 6. Build packages (when needed)

For day-to-day dev-server work, you **do not** need to build packages — Vite resolves source directly. You only need package builds when:

- Testing the published NPM output
- Running examples that consume `dist/`
- Verifying the esbuild pipeline

```bash
yarn build:packages
```

This runs sequentially: `build:common` → `build:math` → `build:element` → `build:excalidraw`. Order matters — each package depends on the previous.

**`@excalidraw/utils` is not included** in `build:packages`. Build it separately if needed:

```bash
yarn --cwd packages/utils build:esm
```

### Production app build

```bash
yarn build           # Vite production build → excalidraw-app/build/
yarn build:preview   # build + vite preview on port 5000
yarn start:production  # build + http-server on port 5001
```

---

## 7. Project structure at a glance

```text
├── excalidraw-app/         # Vite app shell (React 19, Firebase, Socket.IO)
│   ├── App.tsx             # Main app component
│   ├── collab/             # Collaboration (WebSocket, reconciliation)
│   ├── index.tsx            # Entry point (Sentry, PWA, createRoot)
│   └── vite.config.mts     # Dev server + build config
├── packages/
│   ├── common/             # Shared constants, utils, colors (no UI)
│   ├── math/               # Geometry primitives (depends on common)
│   ├── element/            # Element types, Scene, Store, mutations
│   ├── excalidraw/         # React editor — App class, actions, renderers, UI
│   └── utils/              # Export helpers (bundled into excalidraw at build)
├── examples/               # Integration examples (Next.js, script tag)
├── .env.development        # Dev environment variables
├── .env.production         # Prod environment variables
├── tsconfig.json           # Root TS config with workspace path aliases
├── vitest.config.mts       # Test runner config
├── .eslintrc.json          # ESLint rules
└── package.json            # Monorepo root (workspaces, scripts, engines)
```

For deeper architecture details → see [`docs/technical/architecture.md`](./architecture.md).
For domain term definitions → see [`docs/product/domain-glossary.md`](../product/domain-glossary.md).

---

## 8. Making changes

### Branch strategy

```bash
git checkout -b feat/your-feature-name
```

### Typical workflow

1. **Start the dev server** — `yarn start`
2. **Edit source** — changes in `packages/*/src/` or `excalidraw-app/` hot-reload automatically
3. **Run relevant tests** — `yarn test` (Vitest watch mode filters by changed files)
4. **Check types** — `yarn test:typecheck`
5. **Lint** — `yarn test:code` (or rely on the Vite ESLint overlay)
6. **Format** — `yarn fix` (or let lint-staged handle it on commit if enabled)

### What to watch for

- **Import ordering** — ESLint enforces groups: builtins → external → `@excalidraw/*` → internal → relative. Use `import type` for type-only imports.
- **No barrel imports inside excalidraw package** — import from specific files, not from `@excalidraw/excalidraw`.
- **No direct jotai imports** — use `editor-jotai` or `app-jotai` wrappers.
- **Zero ESLint warnings** — `--max-warnings=0` is enforced.

---

## 9. Pre-commit verification

Before pushing, run the full check suite locally:

```bash
yarn test:all
```

This is the same check CI will run. If it passes locally, your PR is unlikely to fail on lint/type/test gates.

If the pre-commit hook is enabled (see step 2), staged files are auto-linted and formatted on `git commit`.

---

## 10. Creating a PR

```bash
git add .
git commit -m "feat: describe your change"
git push -u origin feat/your-feature-name
```

Then open a pull request against the target branch (typically `master`).

### PR checklist

- [ ] `yarn test:all` passes locally
- [ ] No new ESLint warnings (zero-tolerance policy)
- [ ] Types check (`yarn test:typecheck`)
- [ ] Formatting is clean (`yarn test:other`)
- [ ] New tests added for non-trivial logic
- [ ] Commit message describes the "why"

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `yarn install` fails with lockfile errors | Make sure you're on Yarn 1.x (`npm install -g yarn@1.22.22`), not Yarn Berry |
| Port 3001 already in use | Kill the process or override `VITE_APP_PORT` in `.env.development.local` |
| TypeScript errors on `@excalidraw/*` imports | Check that `tsconfig.json` `paths` are intact; run `yarn install` to ensure symlinks |
| Tests fail with "canvas" errors | The test setup uses `vitest-canvas-mock` — make sure `setupTests.ts` is present |
| `rm:node_modules` doesn't clean examples | By design: `rm:node_modules` only clears root, `excalidraw-app/`, and `packages/*/node_modules` — not `examples/*/node_modules` |
| Stale build artifacts | `yarn rm:build` removes all `build/`, `dist/`, `dev-dist/` across workspaces |
| Full clean reinstall | `yarn clean-install` (removes node_modules then reinstalls) |

---

*Source verification: all commands, paths, ports, and configurations cited above are from the repository's `package.json` files, `tsconfig.json`, `.eslintrc.json`, `vitest.config.mts`, `vite.config.mts`, `.env.development`, `.env.production`, `.husky/pre-commit`, and `.lintstagedrc.js`.*
