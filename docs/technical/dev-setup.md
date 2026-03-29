# Developer setup

Set up this monorepo from a fresh machine to a PR-ready workflow without guessing versions or commands.

## Prerequisites

- Node.js `20+` for local development to match CI (`20.x` in `.github/workflows/lint.yml`, `test.yml`, `test-coverage-pr.yml`, and other Node-based workflows under `.github/workflows/`). Repo-declared minimum is `>=18.0.0` in root `package.json` and `excalidraw-app/package.json` `engines`.
- Yarn Classic `1.22.22` (from root `package.json` `packageManager: "yarn@1.22.22"`).
- Git (required for clone/fork, branches, and PR workflow).
- Optional: Docker, only if you plan to use Docker-specific scripts such as `yarn build:app:docker` from root `package.json`.

## Clone and install

From your machine:

```bash
git clone ORIGIN_URL
cd <repository-directory>
yarn install
```

What `yarn install` does in this repo:

- Installs all workspace dependencies for `excalidraw-app`, `packages/*`, and `examples/*` (root `package.json` `workspaces`).
- Runs root `prepare` script (`husky install`) and sets up Git hooks in `.husky/` (root `package.json` `scripts.prepare`).

## Verify the install

Run a quick smoke sequence from repo root:

```bash
yarn test:typecheck
yarn test:code
```

If both pass, TypeScript + ESLint are wired correctly.

## Run the app locally

Primary dev path (repo root):

```bash
yarn start
```

This delegates to `excalidraw-app` (`yarn --cwd ./excalidraw-app start`). The app `start` script runs `yarn && vite` (`excalidraw-app/package.json`). Vite uses `loadEnv` with `envDir` at the repo root and sets `server.port` to `VITE_APP_PORT` or `3000` (`excalidraw-app/vite.config.mts`). Open `http://localhost:3000` unless you override the port (shell or repo-root `.env*`).

You should see the Excalidraw drawing app load in the browser.

## Common workflows

From repo root:

```bash
yarn build
yarn build:packages
yarn start:example
```

- `yarn build`: builds the app.
- `yarn build:packages`: builds `common`, `math`, `element`, and `excalidraw` workspace packages.
- `yarn start:example`: builds packages, then runs `examples/with-script-in-browser`.

Also documented in `docs/memory/techContext.md`:

```bash
yarn --cwd ./examples/with-nextjs dev
```

## Quality gate before a PR

CI is split across workflows (no single job runs everything below):

- **PR — `.github/workflows/lint.yml`:** `yarn test:other`, `yarn test:code`, `yarn test:typecheck` (no Vitest).
- **PR — `.github/workflows/test-coverage-pr.yml`:** `yarn test:coverage`.
- **Push to `master` — `.github/workflows/test.yml`:** `yarn test:app` only.

Suggested local checks before opening a PR (covers PR lint + PR coverage; skip separate `yarn test:app` if you already ran `test:coverage`):

```bash
yarn test:other
yarn test:code
yarn test:typecheck
yarn test:coverage
```

Convenience command:

```bash
yarn test:all
```

`yarn test:all` runs typecheck + ESLint + Prettier check + `yarn test:app --watch=false` (root `package.json`). It does **not** run coverage; add `yarn test:coverage` to align with the PR coverage workflow.

Local repair commands:

```bash
yarn fix
yarn fix:other
yarn fix:code
```

- `yarn fix`: runs formatting then ESLint autofix.
- `yarn fix:other`: runs Prettier write for `css/scss/json/md/html/yml`.
- `yarn fix:code`: runs ESLint autofix.

## Pre-commit

Configured behavior:

- `.lintstagedrc.js` defines staged-file actions:
  - `*.{js,ts,tsx}` -> `eslint --max-warnings=0 --fix`
  - `*.{css,scss,json,md,html,yml}` -> `prettier --write`
- `prepare` installs Husky hooks.

Current repo state:

- `.husky/pre-commit` contains only a commented line (`# yarn lint-staged`), so lint-staged is configured but not currently executed automatically on commit.

If a hook/check fails:

1. Run `yarn fix` (or targeted `yarn fix:other` / `yarn fix:code`).
2. Re-run `yarn test:all` (and `yarn test:coverage` for coverage parity).
3. Re-stage changed files and commit again.

## Opening your first PR

1. From an up-to-date default branch (e.g. `main` or `master`, depending on the fork), create a feature branch:

   ```bash
   git checkout -b <type>/<short-description>
   ```

2. Push your branch:

   ```bash
   git push -u origin HEAD
   ```

3. Open a PR and fill `.github/PULL_REQUEST_TEMPLATE.md` checklist items.
4. Use a semantic PR title format, because `.github/workflows/semantic-pr-title.yml` enforces semantic PR titles (via `amannn/action-semantic-pull-request`).

## Troubleshooting

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| `yarn install` fails with engine/version errors | Wrong Node/Yarn version | Use Node 20 and Yarn Classic `1.22.22`, then rerun `yarn install` |
| App starts on unexpected port or not on `3000` | `VITE_APP_PORT` in shell or repo-root `.env*` (Vite `envDir` is the monorepo root) | Unset/change `VITE_APP_PORT`, or open the printed Vite URL |
| Collaboration/Firebase features fail locally | Missing env configuration (e.g. `VITE_APP_FIREBASE_CONFIG`, backend/collab URLs referenced in `excalidraw-app/data/firebase.ts`, `excalidraw-app/data/index.ts`, `excalidraw-app/collab/Collab.tsx`) | Ask maintainers for required env values; do not commit secrets |
| Formatting/lint errors block checks | Prettier/ESLint violations | Run `yarn fix` and re-run the quality gate commands |
| Strange dependency/runtime issues after branch switching | Stale `node_modules` in workspace | Run `yarn clean-install` |

## Where to read next

- `docs/technical/architecture.md`
- `docs/memory/projectbrief.md`
- `docs/memory/techContext.md`
