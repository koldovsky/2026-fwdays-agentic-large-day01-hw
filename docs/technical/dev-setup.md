# Development setup (onboarding)

Actionable steps for working in this **Excalidraw** Yarn workspaces monorepo. High-level context lives in [`docs/memory/`](../memory/); product requirements in [`docs/product/PRD.md`](../product/PRD.md); runtime structure in [`architecture.md`](./architecture.md). This page is the operational path.

---

## 1. Install prerequisites

1. Install **Node.js** `>= 18` (see root `package.json` `engines` and [`docs/memory/techContext.md`](../memory/techContext.md)).
2. Install **Yarn 1** `1.22.22` to match root `packageManager` (e.g. enable Corepack and `corepack prepare yarn@1.22.22 --activate`, or use a globally installed Yarn 1).
3. Optional: install **Docker** if you plan to build or run the container image described in the root [`Dockerfile`](../../Dockerfile) ([`techContext.md`](../memory/techContext.md)).

---

## 2. Clone the repository

1. Clone your fork or the upstream remote into a local directory:

   ```bash
   git clone <repository-url>
   cd <repository-directory>
   ```

2. Note: the directory name may differ from upstream Excalidraw; this workspace is documented as a course-oriented fork in [`docs/memory/projectbrief.md`](../memory/projectbrief.md).

---

## 3. Install dependencies

1. From the **repository root**, run:

   ```bash
   yarn install
   ```

2. If installs or hoisting look corrupted, run a clean reinstall:

   ```bash
   yarn clean-install
   ```

3. After `yarn install`, the `prepare` script runs **Husky** (`husky install`). The default `.husky/pre-commit` does **not** run `lint-staged` (it is commented out). Rely on the commands in [§7 Local testing](#7-run-local-tests-and-checks) before you push.

---

## 4. Read documentation in order

Do these in sequence the first time (or skim and return when you touch that area):

| Step | Open | Why |
|------|------|-----|
| 4.1 | [`docs/memory/projectbrief.md`](../memory/projectbrief.md) | What the repo is: app vs library vs examples. |
| 4.2 | [`docs/memory/techContext.md`](../memory/techContext.md) | Node/Yarn versions, scripts, Docker, tooling table. |
| 4.3 | [`docs/memory/systemPatterns.md`](../memory/systemPatterns.md) | Workspace layout, package boundaries, editor patterns. |
| 4.4 | [`docs/technical/architecture.md`](./architecture.md) | Vite aliases, command flow, deeper structure. |
| 4.5 | [`docs/product/domain-glossary.md`](../product/domain-glossary.md) | Terms (Scene, Store, actions, etc.). |
| 4.6 | [`docs/product/PRD.md`](../product/PRD.md) | Product-level behavior and scope (when relevant). |
| 4.7 | [`docs/memory/productContext.md`](../memory/productContext.md) | UX goals and scenarios (optional; complements the PRD). |
| 4.8 | [`docs/memory/activeContext.md`](../memory/activeContext.md), [`docs/memory/progress.md`](../memory/progress.md), [`docs/memory/decisionLog.md`](../memory/decisionLog.md) | Agentic handoff, doc checklist status, structural decisions (optional). |
| 4.9 | [`docs/findings/project-overview.md`](../findings/project-overview.md) | Scale and stack; link into package-specific findings when you edit `packages/*`. |

---

## 5. Run the project locally

1. **Default dev server (full app):** from the repo root:

   ```bash
   yarn start
   ```

   This runs Vite in `excalidraw-app/`. Workspace packages resolve to **source** via Vite (see [`architecture.md`](./architecture.md)).

2. **Production build + local static serve:**

   ```bash
   yarn build
   yarn start:production
   ```

   Or build and use Vite preview:

   ```bash
   yarn build:preview
   ```

3. **Example (script-in-browser):** builds packages first, then starts the example:

   ```bash
   yarn start:example
   ```

4. **When you change library packages and something expects built output:** build in dependency order from the root:

   ```bash
   yarn build:packages
   ```

   Order is **common → math → element → excalidraw** ([`systemPatterns.md`](../memory/systemPatterns.md)). For `packages/utils` only, use `yarn --cwd ./packages/utils build:esm` when needed.

5. **Docker (optional):** build the image from the repo root per your team’s tag/naming conventions, using the root [`Dockerfile`](../../Dockerfile) ([`techContext.md`](../memory/techContext.md)).

---

## 6. Make changes according to project rules

1. **Place changes in the right workspace:** app shell in `excalidraw-app/`, embeddable editor and UI in `packages/excalidraw/`, domain model in `packages/element/`, math in `packages/math/`, shared constants/helpers in `packages/common/`, utilities in `packages/utils/`, samples in `examples/*` ([`projectbrief.md`](../memory/projectbrief.md), [`systemPatterns.md`](../memory/systemPatterns.md)).

2. **Respect package boundaries:** avoid new runtime cycles; prefer the patterns in [`systemPatterns.md`](../memory/systemPatterns.md) (e.g. command flow through actions and `syncActionResult`, type-only coupling where documented).

3. **Keep edits focused:** change only what the task requires; match existing style, imports, and abstractions in the files you touch.

4. **Format and lint before review:**

   ```bash
   yarn fix
   ```

   Or separately: `yarn fix:other` (Prettier) and `yarn fix:code` (ESLint `--fix`).

---

## 7. Run local tests and checks

1. **Fast test loop (Vitest, watch):**

   ```bash
   yarn test
   ```

2. **Full gate (matches what CI emphasizes on pull requests):** typecheck, ESLint (max warnings 0), Prettier check, then Vitest once:

   ```bash
   yarn test:all
   ```

3. **Update snapshots only when the change is intentional:**

   ```bash
   yarn test:update
   ```

4. **Optional:** coverage or UI runner:

   ```bash
   yarn test:coverage
   yarn test:ui
   ```

CI uses Node **20.x** (see `.github/workflows/lint.yml` and `test.yml`). Using Node 20 locally reduces “works on my machine” drift.

---

## 8. Open a pull request

1. Create a branch from the default branch (e.g. `master` per current workflows).

2. Push your branch and open a PR against that default branch.

3. Set the **PR title** to satisfy the **Semantic Pull Request** check (Conventional Commits style), e.g. `feat: …`, `fix: …`, `docs: …`, `chore: …`. The workflow is `.github/workflows/semantic-pr-title.yml`.

4. Ensure **lint** and **tests** pass: on PRs, CI runs `yarn test:other`, `yarn test:code`, and `yarn test:typecheck`; tests also run on pushes to `master` via `yarn test:app`.

5. Describe **what** you changed and **why** in the PR description in full sentences so reviewers can follow without reading every file.

---

## 9. Troubleshooting

1. **Strange module or version errors:** run `yarn clean-install` from the root.

2. **Library build errors after pulling:** run `yarn build:packages` (and `yarn --cwd ./packages/utils build:esm` if you touched `utils`).

3. **Imports resolve to the wrong place in the app:** check `excalidraw-app/vite.config.mts` and [`architecture.md`](./architecture.md) for workspace aliases.

4. **Font / WASM tooling issues:** see [`docs/findings/project-overview.md`](../findings/project-overview.md) and [`techContext.md`](../memory/techContext.md) for pointers to `packages/excalidraw/subset/` and `scripts/wasm/`.

---

## Quick reference

| Goal | Command (from repo root) |
|------|---------------------------|
| Install | `yarn install` |
| Dev app | `yarn start` |
| Build app | `yarn build` |
| Build all main packages | `yarn build:packages` |
| Lint + types + format check + tests once | `yarn test:all` |
| Autofix style | `yarn fix` |
