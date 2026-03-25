# Developer onboarding (dev setup + first PR)

## Prerequisites

- **Node.js**: required by `package.json` engines (`node >=18.0.0`).
- **Package manager**: **Yarn v1.22.22** (`packageManager` in root `package.json`).
- **CI uses Node 20.x** (see `.github/workflows/test.yml` and `.github/workflows/lint.yml`).
- **Docker (optional)**:
  - `Dockerfile` builds with `node:18` and serves with `nginx:1.27-alpine`.
  - `docker-compose.yml` defines a service mapping `3000:80`.

## Project Setup

### Clone

- Clone the repo with `git clone <repo-url>` (standard git workflow).

### Install dependencies

- From repo root:
  - `yarn install`

### Environment variables

The app reads Vite env vars via `import.meta.env` (see `excalidraw-app/vite-env.d.ts`).
The repo provides templates:

- `.env.development`
  - Includes example values for:
    - `VITE_APP_PORT` (dev server port)
    - `VITE_APP_WS_SERVER_URL` (collaboration WebSocket server URL; dev default uses `http://localhost:3002`)
    - `VITE_APP_AI_BACKEND` (AI backend; dev default uses `http://localhost:3016`)
    - `VITE_APP_FIREBASE_CONFIG` (Firebase config as a JSON string parsed in `excalidraw-app/data/firebase.ts`)
    - `VITE_APP_BACKEND_V2_GET_URL` / `VITE_APP_BACKEND_V2_POST_URL` (JSON backend endpoints)
- `.env.production`
  - Includes production defaults for the same set of keys.

Notes:
- `VITE_APP_FIREBASE_CONFIG` is parsed with `JSON.parse(import.meta.env.VITE_APP_FIREBASE_CONFIG)` in `excalidraw-app/data/firebase.ts`.
- `.env.development` comments instruct using `.env.local` for local debug flags (it explicitly mentions `.env.local` for toggles like `VITE_APP_DEV_DISABLE_LIVE_RELOAD`).

## Running the Project

### Dev mode

- Start the app:
  - `yarn start`
- The Vite entrypoint mounts `ExcalidrawApp` (see `excalidraw-app/index.tsx` with `createRoot` and `root.render(<ExcalidrawApp />)`).

### Production build / preview

- Build:
  - `yarn build`
- Preview:
  - `yarn build:preview` (delegates to `excalidraw-app`’s `build:preview`)
- Start production server:
  - `yarn start:production` (delegates to `excalidraw-app start:production`)

### Tests

- Unit/integration (app tests):
  - `yarn test:app` (also used in `.github/workflows/test.yml`)
- Typecheck:
  - `yarn test:typecheck`
- Lint/format checks:
  - `yarn test:code` (eslint)
  - `yarn test:other` (prettier `--list-different`)
- Full suite:
  - `yarn test:all`

### Lint/format convenience

- Fix formatting + lint:
  - `yarn fix` (`fix:other` + `fix:code`)

## Project Structure Overview

- **`excalidraw-app/`**: the runnable Vite app shell (`excalidraw-app/index.tsx` entrypoint and `excalidraw-app/App.tsx` UI wiring).
- **`packages/`**: workspace libraries, built in order by root scripts:
  - `packages/common/`, `packages/math/`, `packages/element/`, `packages/excalidraw/`.
- **`examples/`**: integration examples.
- **`scripts/`**: release/versioning and build helpers.
- **`docs/`**: documentation (including the onboarding and architecture docs in this repo).

## Development Workflow

### Branching

- Use a standard git workflow:
  - create a branch, implement changes, push, and open a PR.
- CI indicates PRs run checks on `pull_request` events and tests on `push` to `master` (`.github/workflows/test.yml` and `.github/workflows/lint.yml`).

### Checks before committing / PR

- Run the same checks as CI:
  - `yarn test:other`
  - `yarn test:code`
  - `yarn test:typecheck`
  - `yarn test:app` (or `yarn test:all`)

### Pre-commit hooks

- `prepare` runs `husky install` (root `package.json`).
- `.husky/pre-commit` currently contains only a comment (`# yarn lint-staged`), so it does not enforce additional checks by itself.

## Creating First PR

1. Create a branch:
   - `git checkout -b <feature-branch>`
2. Implement a change:
   - prefer using existing patterns in `packages/` / `excalidraw-app/`.
3. Commit:
   - `git commit -m "<message>"`
   - (No commit message linting config was found in the repo.)
4. Push and open PR:
   - `git push -u origin <feature-branch>`
   - Open a PR against `master`.

PR requirements in this repo:
- CI includes `semantic-pr-title.yml` which runs `amannn/action-semantic-pull-request` on `pull_request` events (so use a semantic/conventional PR title).
- The PR template is a “Day 1: Workshop Assignment” checklist (`.github/PULL_REQUEST_TEMPLATE.md`) which references this repo’s memory/technical/product docs.

## Troubleshooting

- If collab/data features fail at runtime, verify:
  - `VITE_APP_WS_SERVER_URL` and `VITE_APP_BACKEND_V2_*` values (see `.env.development`)
  - `VITE_APP_FIREBASE_CONFIG` JSON parsing (see `excalidraw-app/data/firebase.ts`)
- If the editor fails to load in dev:
  - confirm Vite env variables are set (missing/invalid values can break initialization paths).

## Notes & Assumptions

- This guide relies on repo-verified commands from root `package.json` and CI workflows.
- No `.env.*.example` was referenced; instead the repo includes `.env.development` and `.env.production` templates.

