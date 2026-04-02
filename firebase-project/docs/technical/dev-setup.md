# Developer setup

Onboarding guide for the **excalidraw-monorepo** workspace: the Excalidraw React library, shared packages, and the Vite-based web app.

---

## 1. Project overview

**Description:** Yarn workspaces monorepo for [Excalidraw](https://excalidraw.com)—a hand-drawn style whiteboard. It ships `@excalidraw/excalidraw` as an embeddable React component and builds the full product shell in `excalidraw-app` (collaboration, storage hooks, PWA, etc.).

**Tech stack (high level):**

| Layer | Technologies |
|-------|----------------|
| Runtime / UI | React 19, TypeScript |
| App build | Vite 5, `vite-plugin-pwa`, Jotai |
| Monorepo | Yarn 1 workspaces |
| Tests | Vitest, jsdom, ESLint, Prettier |
| Product integrations | Firebase, Socket.IO client, Sentry |

---

## 2. Prerequisites

| Tool | Requirement |
|------|-------------|
| **Node.js** | `>= 18.0.0` (see root and `excalidraw-app` `package.json` → `engines`) |
| **Yarn** | **1.x** — repo pins `packageManager`: `yarn@1.22.22` (Classic Yarn) |
| **Git** | For clone and hooks |

Optional: a running [excalidraw-room](https://github.com/excalidraw/excalidraw-room) (or compatible) WebSocket server on the URL you set in `VITE_APP_WS_SERVER_URL` if you exercise live collaboration locally.

---

## 3. Installation

```bash
git clone <repository-url>
cd 2026-fwdays-agentic-large-day01-hw
yarn install
```

`yarn install` at the repository root installs all workspace dependencies (`excalidraw-app`, `packages/*`, `examples/*`).

After install, Husky is set up via the root `prepare` script (`husky install`).

---

## 4. Environment setup

**Location:** Vite loads env from the **repository root** (`envDir: "../"` relative to `excalidraw-app/vite.config.mts`), not from `excalidraw-app/`.

**Committed templates:** The repo includes `.env.development` and `.env.production` at the root with default URLs and flags. **Do not commit secrets**; use overrides in gitignored files:

| File | Purpose |
|------|---------|
| `.env.development.local` | Local overrides for development (gitignored) |
| `.env.local` | Generic local overrides (gitignored) |
| `.env.production.local` | Local overrides for production-mode builds (gitignored) |

**Variables used by the app** (see `excalidraw-app/vite-env.d.ts` and root `.env.*`; library code may read additional `VITE_*` names such as `VITE_APP_LIBRARY_URL` / `VITE_APP_LIBRARY_BACKEND` from `packages/excalidraw`):

**Example `.env.development.local`** (placeholders only—adjust to your endpoints):

```dotenv
MODE=development

VITE_APP_PORT=3000

VITE_APP_BACKEND_V2_GET_URL=https://your-backend.example/api/v2/
VITE_APP_BACKEND_V2_POST_URL=https://your-backend.example/api/v2/post/

VITE_APP_WS_SERVER_URL=http://localhost:3002

VITE_APP_FIREBASE_CONFIG='{"apiKey":"...","authDomain":"...","projectId":"..."}'

VITE_APP_AI_BACKEND=http://localhost:3016
VITE_APP_PLUS_LP=https://plus.excalidraw.com
VITE_APP_PLUS_APP=http://localhost:3000

# Optional / flags (string values; many use "true" / "false")
VITE_APP_ENABLE_ESLINT=true
VITE_APP_ENABLE_PWA=false
VITE_APP_COLLAPSE_OVERLAY=true
VITE_APP_DISABLE_SENTRY=true
VITE_APP_DEV_DISABLE_LIVE_RELOAD=
VITE_APP_DISABLE_PREVENT_UNLOAD=
VITE_APP_ENABLE_TRACKING=false
VITE_APP_GIT_SHA=local
```

`VITE_APP_FIREBASE_CONFIG` must be a **single-line JSON string** (as in the committed `.env.development`).

---

## 5. Running the project

Run these from the **repository root** unless noted.

| Goal | Command |
|------|---------|
| **Dev server** (Vite, opens browser) | `yarn start` |
| **Production-like static server** (after build) | `yarn start:production` |
| **Build app** | `yarn build` |
| **Build then Vite preview** | `yarn build:preview` |
| **Build all workspace packages (ESM)** | `yarn build:packages` |
| **Example: script-in-browser** | `yarn start:example` |

Default dev port comes from `VITE_APP_PORT` (falls back to **3000** in Vite config if unset; root `.env.development` may set another port such as `3001`).

---

## 6. Code structure

```
.
├── excalidraw-app/          # Full web app (Vite entry, collab, Firebase, shell UI)
├── packages/
│   ├── common/              # Shared constants and helpers
│   ├── math/                # 2D math
│   ├── element/             # Element model and operations
│   ├── excalidraw/          # Main React library (@excalidraw/excalidraw)
│   └── utils/               # Additional utilities
├── examples/                  # Sample integrations (workspaces)
├── scripts/                 # Build, release, and tooling scripts
├── vitest.config.mts        # Vitest (root)
├── tsconfig.json            # TypeScript (packages + excalidraw-app)
└── package.json             # Workspace root scripts and devDependencies
```

TypeScript `include` covers `packages` and `excalidraw-app`; `examples` are excluded from the root TS project—open the relevant example workspace when working there.

---

## 7. Development workflow

**Branching:** This repository does not ship a dedicated `CONTRIBUTING.md`. Typical practice: branch from the default branch (`master`), use short-lived **feature branches**, and integrate via pull request. Align naming and review rules with your team.

**Commits:** No enforced commit message format in-repo. Many teams use [Conventional Commits](https://www.conventionalcommits.org/) for clarity; keep subjects imperative and scoped to one logical change.

**Quality before push:** Run `yarn test:all` (typecheck, ESLint, Prettier check, Vitest once) when preparing a change set.

**Git hooks:** `.husky/pre-commit` may be minimal or commented; `.lintstagedrc.js` defines ESLint + Prettier for staged files if you wire `lint-staged` into Husky locally.

---

## 8. Testing

| Command | What it runs |
|---------|----------------|
| `yarn test` | Vitest in watch mode (`vitest`) |
| `yarn test:app --watch=false` | Single Vitest run (CI-style) |
| `yarn test:all` | `test:typecheck` + `test:code` + `test:other` + `test:app --watch=false` |
| `yarn test:typecheck` | `tsc` |
| `yarn test:code` | ESLint on `.js`, `.ts`, `.tsx` |
| `yarn test:other` | Prettier `--list-different` |
| `yarn test:coverage` | Vitest with coverage |
| `yarn test:ui` | Vitest UI with coverage enabled |

Update snapshots: `yarn test:update`.

---

## 9. Troubleshooting

| Issue | What to try |
|-------|-------------|
| **Port already in use** | Set `VITE_APP_PORT` in `.env.development.local` or stop the process bound to that port. |
| **Node version errors** | Use Node 18 or newer (`node -v`). |
| **Stale or broken `node_modules`** | From root: `yarn clean-install` (removes workspace `node_modules` and reinstalls). |
| **Build errors after package changes** | Run `yarn build:packages` before scenarios that consume built ESM output; use `yarn rm:build` to clear artifacts if needed. |
| **Collaboration / WebSocket failures** | Ensure `VITE_APP_WS_SERVER_URL` matches a running room server; default `.env.development` points at `http://localhost:3002`. |
| **Firebase or backend errors** | Confirm `VITE_APP_FIREBASE_CONFIG` is valid JSON on one line and backend URLs match your environment. |
| **Husky not running** | Run `yarn install` so `prepare` executes; ensure hooks are executable and not disabled in your Git config. |

For deeper architecture notes, see `docs/technical/architecture.md`.
