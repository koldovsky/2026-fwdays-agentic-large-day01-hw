# Developer Setup — From Clone to First PR

Complete onboarding guide for new contributors to the Excalidraw monorepo.

---

## Prerequisites

| Tool    | Required version    | Check            |
| ------- | ------------------- | ---------------- |
| Node.js | `>=18.0.0`          | `node --version` |
| Yarn    | `1.22.22` (classic) | `yarn --version` |
| Git     | any recent          | `git --version`  |

> **Why Yarn 1 (classic)?** The repo uses Yarn workspaces v1 and a committed
> `yarn.lock`. Do **not** use npm, pnpm, or Yarn Berry — they will generate an
> incompatible lock file and break workspace symlinking.

Install Yarn if missing:

```bash
npm install -g yarn@1.22.22
```

---

## 1 — Clone the Repository

```bash
git clone https://github.com/excalidraw/excalidraw.git
cd excalidraw
```

For a fork-based workflow (recommended for PRs):

```bash
# Fork on GitHub first, then:
git clone https://github.com/<your-username>/excalidraw.git
cd excalidraw
git remote add upstream https://github.com/excalidraw/excalidraw.git
```

---

## 2 — Install Dependencies

Run from the **repo root** — Yarn workspaces installs all packages in one pass:

```bash
yarn install
```

This links all workspace packages (`packages/common`, `packages/math`,
`packages/element`, `packages/excalidraw`, `packages/utils`, `excalidraw-app`)
into `node_modules` via symlinks and installs their combined dependency tree.

It also runs `husky install` via the `prepare` lifecycle script, which wires up
pre-commit hooks.

---

## 3 — Understand the Monorepo Structure

```
excalidraw/
├── packages/
│   ├── common/         # @excalidraw/common   — shared constants, utilities, color palette
│   ├── math/           # @excalidraw/math      — geometry: points, lines, curves, angles
│   ├── element/        # @excalidraw/element   — element model, Scene, Store, rendering primitives
│   ├── excalidraw/     # @excalidraw/excalidraw — React component, ActionManager, Renderer
│   └── utils/          # @excalidraw/utils     — export helpers, bbox utilities (leaf, no upward deps)
├── excalidraw-app/     # Full hosted app (excalidraw.com) — Firebase, Socket.io, Sentry, PWA
├── examples/           # Standalone usage examples
├── scripts/            # Build helpers (buildPackage.js, release.js, etc.)
├── docs/               # Architecture docs, memory bank, product docs
├── vitest.config.mts   # Test runner config (Vitest)
├── vite.config.mts     # App dev server / bundler config
└── package.json        # Root: workspace definitions + all shared scripts
```

### Package Dependency Order (strict, one-way)

```
@excalidraw/common
    └── @excalidraw/math
          └── @excalidraw/element
                └── @excalidraw/excalidraw
                      └── excalidraw-app
```

Never import a higher-level package from a lower-level one — ESLint enforces
this via the no-circular-deps rule in `packages/excalidraw/eslintrc.base.json`.

---

## 4 — Start the Development Server

```bash
yarn start
```

Opens the full `excalidraw-app` dev server at `http://localhost:3000` via Vite
with Hot Module Replacement. Type errors are surfaced in the terminal in real
time (via `vite-plugin-checker`).

> The dev server serves `excalidraw-app`, which imports `packages/excalidraw`
> directly from source — **no `dist/` build is needed** to iterate on library
> code during development.

### Working on a Specific Package

If you are changing code in `packages/excalidraw` or a sub-package, the dev
server picks up changes immediately through Vite's module graph. You only need
to build packages explicitly when publishing or testing against a `dist/`
consumer.

---

## 5 — Run Tests

All commands run from the repo root.

### Watch Mode (default for development)

```bash
yarn test
```

Runs Vitest in interactive watch mode. Tests re-run on file save.

### Full CI-Style Check

```bash
yarn test:all
```

Runs in order: TypeScript type check → ESLint → Prettier format check → Vitest
(no watch). This is what CI runs — pass this before opening a PR.

### Individual Checks

```bash
yarn test:typecheck   # tsc — strict mode, no emit
yarn test:code        # eslint --max-warnings=0
yarn test:other       # prettier --list-different (format check only)
yarn test:coverage    # vitest with V8 coverage report
```

### Auto-Fix Formatting and Lint

```bash
yarn fix              # prettier --write + eslint --fix (staged and all files)
```

Run this before committing if `yarn test:all` reports format or lint errors.

---

## 6 — Pre-commit Hooks

The repo uses **husky** + **lint-staged**. On every `git commit`:

1. `prettier` runs on staged `*.{css,scss,json,md,html,yml}` files.
2. `eslint --fix` runs on staged `*.{js,ts,tsx}` files.

If hooks fail, the commit is aborted. Fix the reported issues and retry. Never
use `--no-verify` to skip hooks — CI will catch the same issues and fail the PR.

---

## 7 — Build the Library Packages

Only needed if you are testing a `dist/`-consuming setup or preparing a release.

```bash
# Build all packages in dependency order
yarn build:packages

# Build individual packages
yarn build:common
yarn build:math
yarn build:element
yarn build:excalidraw
```

Each package produces:

```
packages/<name>/dist/
├── dev/      # development build (unminified, source maps)
├── prod/     # production build (minified)
└── types/    # TypeScript declaration files (tsc output)
```

### Build the Full Web App

```bash
yarn build           # Vite build → excalidraw-app/build/
yarn build:app       # same, explicit alias
```

### Clean Builds

```bash
yarn rm:build        # remove all dist/ and build/ directories
yarn clean-install   # remove all node_modules, then reinstall
```

---

## 8 — Key Source Locations

| Area                         | Path                                               |
| ---------------------------- | -------------------------------------------------- |
| Main React component (`App`) | `packages/excalidraw/components/App.tsx`           |
| AppState defaults            | `packages/excalidraw/appState.ts`                  |
| Element model & Scene        | `packages/element/src/Scene.ts`                    |
| Store / undo-redo            | `packages/element/src/store.ts`                    |
| Element mutation             | `packages/element/src/mutateElement.ts`            |
| Actions registry             | `packages/excalidraw/actions/`                     |
| Static renderer              | `packages/excalidraw/renderer/staticScene.ts`      |
| Interactive renderer         | `packages/excalidraw/renderer/interactiveScene.ts` |
| Collaboration (app-only)     | `excalidraw-app/src/`                              |
| Firebase persistence         | `excalidraw-app/src/data/`                         |
| i18n locales                 | `packages/excalidraw/locales/`                     |

> **Do not hand-edit** `packages/excalidraw/locales/` — these files are
> auto-managed by Crowdin. Translation changes go through the Crowdin workflow,
> not PRs.

---

## 9 — Making Changes

### Adding a New Drawing Action

1. Create `packages/excalidraw/actions/actionMyFeature.ts`.
2. Define an action object matching the `Action` type from `actions/types.ts`:
   - `perform(elements, appState, formData, app) → ActionResult`
   - Optional `keyTest` for keyboard shortcut
   - Optional `PanelComponent` for toolbar rendering
   - Set `captureUpdate` to control undo delta policy
3. Call `register(action)` at the bottom of the file.
4. Import the file in `actions/index.ts` so it self-registers.

### Modifying Element Behavior

- Use `mutateElement()` (from `packages/element/src/mutateElement.ts`) for all
  element mutations.
- Never assign properties on an element object directly — version stamps will
  not be bumped and collaboration sync will break.
- For mutations inside React event handlers, `scene.mutateElement()` schedules a
  re-render automatically. For mutations in bare `setTimeout` or `Promise`
  callbacks, wrap in `withBatchedUpdates()` to avoid per-mutation renders.

### Modifying AppState

- `AppState` is defined in `packages/excalidraw/types.ts`.
- Add new fields to `getDefaultAppState()` in `packages/excalidraw/appState.ts`.
- Update `isEqualAppState()` if the field should be diffed for onChange
  callbacks.
- TypeScript strict mode is on — every new field needs an explicit type.

### Adding a New Package

Follow the existing pattern: `packages/<name>/package.json` with `build:esm`
script, conditional `exports` for `development`/`production` entry points, and
`types` entry pointing to `dist/types/index.d.ts`. Add the new package to the
`workspaces` array in the root `package.json` and to `build:packages` in the
correct dependency order.

---

## 10 — Things to Never Do

| Don't                                                          | Why                                                       |
| -------------------------------------------------------------- | --------------------------------------------------------- |
| Import from a lower package into a higher one in reverse order | Breaks tree-shaking and circular-dep lint                 |
| Remove a `flushSync` call in `App.tsx`                         | Silent state-staleness bugs in pointer handlers           |
| Call `scene.mutateElement()` from a bare async callback        | Each call triggers a separate React render                |
| Edit `packages/excalidraw/locales/*.json` by hand              | Crowdin overwrites on next sync                           |
| Modify `scripts/wasm/*.wasm` files                             | These are binary artifacts — edit the WASM source instead |
| Add `firebase` or `socket.io-client` to `packages/excalidraw`  | Collab is an app-level concern only                       |
| Use npm or pnpm instead of Yarn 1                              | Generates incompatible lock file, breaks workspaces       |

---

## 11 — Opening a Pull Request

### Before Pushing

```bash
# Ensure the full check suite passes
yarn test:all

# Auto-fix any fixable issues
yarn fix && yarn test:all
```

### Branch and Commit

```bash
# Create a feature branch from latest master
git checkout master
git pull upstream master          # if working from a fork
git checkout -b feat/my-feature

# Make changes, then commit
git add .
git commit -m "feat: add my feature"
```

Commit message conventions used by this project:

| Prefix      | When to use                                  |
| ----------- | -------------------------------------------- |
| `feat:`     | New capability visible to users or embedders |
| `fix:`      | Bug fix                                      |
| `refactor:` | Code restructure with no behavior change     |
| `test:`     | Adding or updating tests only                |
| `docs:`     | Documentation changes only                   |
| `chore:`    | Build, tooling, or dependency changes        |

### Push and Open PR

```bash
git push -u origin feat/my-feature
```

Then open a PR on GitHub against `master`. Fill in the PR template:

- Describe **what** changed and **why**.
- Link any related issues (`Closes #123`).
- Include screenshots or screen recordings for UI changes.
- Check that all CI checks pass (type check, lint, Prettier, Vitest).

---

## 12 — Common Issues

### `yarn install` fails with peer dependency errors

Yarn 1 does not auto-resolve peer deps. If you see warnings about unmet peers,
they are usually pre-existing in the repo and safe to ignore. Errors (not
warnings) indicate a Node.js version mismatch — verify `node --version` is
`>=18`.

### Dev server starts but the canvas is blank

The `<Excalidraw />` component requires a container with a non-zero height. If
you are embedding the component in a custom page, ensure the parent element has
an explicit `height` set.

### TypeScript errors after pulling upstream changes

New AppState fields or type changes may require updating dependent files. Run
`yarn test:typecheck` to see all errors in one pass, then fix from the bottom of
the dependency graph upward
(`common → math → element → excalidraw → excalidraw-app`).

### Tests fail with `canvas is not defined`

Vitest uses `jsdom` + `vitest-canvas-mock`. Ensure your test file includes the
correct Vitest environment comment if it needs a DOM:

```typescript
// @vitest-environment jsdom
```

Most test files in this repo inherit the environment from `vitest.config.mts` —
only add the comment if you are placing a test in an unusual location.

---

## Further Reading

- Architecture deep-dive → `docs/technical/architecture.md`
- Known gotchas and implicit contracts →
  `docs/technical/undocumented-behaviors.md`
- Domain terminology → `docs/product/domain-glossary.md`
- Tech stack versions → `docs/memory/techContext.md`
- Key architectural decisions → `docs/memory/decisionLog.md`
