# Developer Setup Guide

> Last updated: 2026-03-25 — **not yet verified end-to-end on all platforms; treat OS-specific steps as best-effort guidance**
> Estimated setup time: 15–25 minutes (excluding download time)

Excalidraw is a Yarn workspaces monorepo containing a Vite-based web app
(`excalidraw-app/`) and five TypeScript packages (`math`, `common`, `element`,
`excalidraw`, `utils`). This guide takes you from a fresh clone to a running
dev server and an open pull request.

---

## Prerequisites

### Required

**Node.js ≥ 18.0.0**

```bash
# macOS / Linux — recommended via nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
nvm install 18
nvm use 18
```

```bash
# Windows (WSL2) — same nvm command above inside WSL
# Windows (native) — use https://nodejs.org/en/download (LTS ≥ 18)
```

Verify:

```bash
node --version
```

Expected: `v18.x.x` or higher. Node 16 will fail — `engines` field in
`package.json` enforces `>=18.0.0`.

---

**Yarn 1.22.x (Classic)**

Do NOT install Yarn 2/3/4 (Berry). This repo uses Yarn Classic workspaces.

```bash
npm install -g yarn@1.22.22
```

Verify:

```bash
yarn --version
```

Expected: `1.22.22`. Any `1.22.x` is fine; any `2.x` or higher will break
workspace resolution.

---

**Git ≥ 2.x**

```bash
git --version
```

Expected: `git version 2.x.x` or higher.

---

### Recommended

**VS Code** with these extensions (install via the Extensions panel):
- `dbaeumer.vscode-eslint` — shows ESLint errors inline
- `esbenp.prettier-vscode` — format on save (covers CSS modules and SCSS)
- `ms-vscode.vscode-typescript-next` — latest TS language server

**Format on Save** — add to `.vscode/settings.json` (create if missing):

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode"
}
```

---

### OS-specific notes

**Windows (native — not WSL2)**
The repo runs on native Windows via Git Bash or PowerShell, but WSL2 is
strongly recommended — some Husky hook paths assume Unix shell syntax.
If using native Windows, ensure Git Bash is your default terminal in VS Code.

**macOS**
Xcode Command Line Tools must be installed for native build dependencies:

```bash
xcode-select --install
```

---

## Clone and initial setup

**Clone via HTTPS:**

```bash
# Replace WORKSHOP_REPO_URL with the URL from your workshop assignment materials.
# Do NOT clone github.com/excalidraw/excalidraw — that is the upstream project
# and does not contain the workshop docs, PR template, or Memory Bank.
git clone WORKSHOP_REPO_URL
# The directory name matches the repository name on GitHub.
# If your fork has a different name, adjust the cd command accordingly.
cd 2026-fwdays-agentic-large-day01-hw
```

**Clone via SSH** (requires SSH key configured in GitHub):

```bash
# Same note: use your workshop fork URL, not the upstream URL.
git clone WORKSHOP_REPO_SSH_URL
# Adjust the directory name if your fork is named differently.
cd 2026-fwdays-agentic-large-day01-hw
```

**Install all dependencies** (installs for all workspaces in one command):

```bash
yarn install
```

This installs packages for `excalidraw-app/`, all five `packages/*`, and
`examples/*`. Expect 60–90 seconds on first install. Success looks like:

```text
Done in 72.34s.
```

If you see `error An unexpected error occurred` with a network mention,
retry once — sporadic registry timeouts are the usual cause.

**Install Git hooks** (Husky — runs automatically via the `prepare` script,
but run manually if hooks aren't firing):

```bash
yarn prepare
```

Success: `husky - Git hooks installed`. Note: the pre-commit hook is currently
inactive — see the [Code quality tools](#code-quality-tools) section for how
to activate it before relying on automatic linting.

---

## Environment configuration

The `.env.development` file is **already committed to the repo** with
safe development defaults — you do not need to create it. It configures:

| Variable | Purpose | Default value |
|----------|---------|---------------|
| `VITE_APP_BACKEND_V2_GET_URL` | Scene data GET endpoint | `https://json-dev.excalidraw.com/api/v2/` |
| `VITE_APP_BACKEND_V2_POST_URL` | Scene data POST endpoint | `https://json-dev.excalidraw.com/api/v2/post/` |
| `VITE_APP_WS_SERVER_URL` | Collaboration WebSocket server | `http://localhost:3002` |
| `VITE_APP_FIREBASE_CONFIG` | Firebase project config (JSON string) | OSS dev project credentials |
| `VITE_APP_LIBRARY_URL` | Public element library URL | `https://libraries.excalidraw.com` |
| `VITE_APP_PORT` | Dev server port | `3001` |
| `VITE_APP_ENABLE_PWA` | Enable PWA service worker in dev | `false` |
| `VITE_APP_AI_BACKEND` | AI feature backend URL | `http://localhost:3016` |

**No secrets are required for basic local development.** The default Firebase
config points to the public OSS dev Firebase project — read/write access is
intentionally open for contributors.

**Local overrides** (values you should NOT commit):

Create `.env.development.local` (git-ignored) for personal overrides:

```bash
touch .env.development.local
```

Add any of these as needed:

```bash
# Disable the "unsaved changes" browser dialog during development
VITE_APP_DISABLE_PREVENT_UNLOAD=true

# Disable HMR when debugging Service Workers
VITE_APP_DEV_DISABLE_LIVE_RELOAD=true

# Show bounding boxes around text containers (debug aid)
VITE_APP_DEBUG_ENABLE_TEXT_CONTAINER_BOUNDING_BOX=true
```

**Real-time collaboration** requires a local WebSocket server
([excalidraw-room](https://github.com/excalidraw/excalidraw-room)) running
on `localhost:3002`. Without it, the app works fully — collaboration features
simply fail to connect. No error on startup; collaboration join attempts will
time out silently.

---

## Running the project locally

**Start the dev server:**

```bash
yarn start
```

Expected terminal output (Vite startup):

```text
  VITE v5.0.12  ready in 1234 ms

  ➜  Local:   http://localhost:3001/
  ➜  Network: http://192.168.x.x:3001/
```

Open `http://localhost:3001` in your browser.

**Expected first screen:** A blank white canvas with the Excalidraw toolbar
across the top — tool icons on the left, zoom controls bottom-right, menu
top-left. No login screen, no loading spinner (beyond a brief flash).

**Hot Module Replacement** is enabled by default. Saving any file in
`excalidraw-app/` or `packages/excalidraw/` triggers an instant in-browser
update without a full reload.

> **Note:** If you modify files in `packages/common`, `packages/math`,
> `packages/element`, or `packages/utils`, HMR does NOT pick them up
> automatically — those packages must be rebuilt:
>
> ```bash
> yarn build:packages
> ```
>
> Then the dev server will reload with the new package output.

---

## Verify the setup works

Work through this checklist top to bottom. Each item is a pass/fail check.

- [ ] Navigate to `http://localhost:3001` and see the blank canvas with the
  toolbar. No console errors in the browser DevTools.

- [ ] Select the Rectangle tool (keyboard: `R`) and draw a rectangle on the
  canvas by clicking and dragging. The shape appears with a hand-drawn style.
  Release the mouse — selection handles appear around the shape.

- [ ] Press `Ctrl+Z` (Cmd+Z on Mac). The rectangle disappears (undo works).
  Press `Ctrl+Shift+Z` (Cmd+Shift+Z). The rectangle reappears (redo works).

- [ ] Double-click on an empty area of the canvas. A text cursor appears.
  Type `hello`. Click elsewhere — the text element is created and visible.

- [ ] Press `Ctrl+A` (Cmd+A) to select all elements. Press `Delete`. All
  elements are removed. The canvas is blank.

- [ ] Modify `excalidraw-app/App.tsx` — add a console.log anywhere at the
  top level of the file. Save. The browser console shows the log message
  within 2 seconds (HMR working). Remove the log and save again.

- [ ] Run tests once:

  ```bash
  yarn test:app --watch=false
  ```

  Expected: all tests pass or only the known-flaky ones fail (see
  [Running tests](#running-tests) for which tests to ignore).

---

## Running tests

**All tests, once (CI mode):**

```bash
yarn test:app --watch=false
```

**Watch mode (re-runs on file save):**

```bash
yarn test
```

**Single test file:**

```bash
yarn test packages/excalidraw/tests/scene/export.test.tsx
```

**With coverage report:**

```bash
yarn test:coverage
```

Coverage output lands in `coverage/` at the repo root. Open
`coverage/index.html` in a browser for the full report.

**Full CI check** (typecheck + ESLint + Prettier + tests — same as CI):

```bash
yarn test:all
```

**Expected output when all tests pass:**

```text
 ✓  N tests passed
 Duration  X.XXs
```

Exit code `0`. Any non-zero exit code means a failure.

**Known flaky tests — safe to ignore if they fail in isolation:**

- `packages/excalidraw/tests/textWysiwyg.test.tsx` — line 335: arrow label
  version-bump test. Fails non-deterministically. Root cause unknown. Do not
  block a PR on this failure alone.
- `packages/excalidraw/tests/frame.test.tsx` — frame element detection.
  Passes in a real browser, fails in jsdom for unknown reasons. Run in watch
  mode a second time; if it passes on retry it is the known flake.

**Minimum requirement before opening a PR:**

`yarn test:all` must exit `0`. Coverage thresholds must not drop below:
lines 60%, branches 70%, functions 63%, statements 60%.

---

## Code quality tools

**Lint (ESLint — zero warnings tolerance):**

```bash
# Check only
yarn test:code

# Auto-fix
yarn fix:code
```

ESLint runs on all `.js`, `.ts`, `.tsx` files. `--max-warnings=0` means any
warning fails the check — there is no "warning that's okay" state.

**Format (Prettier):**

```bash
# Check only (lists files that would change)
yarn test:other

# Auto-fix (writes changes to disk)
yarn fix:other
```

Prettier covers `**/*.{css,scss,json,md,html,yml}`. TypeScript files are
formatted via the ESLint Prettier plugin (`yarn fix:code` handles both).

**Run both fixers at once:**

```bash
yarn fix
```

**Type check (TypeScript — no emit, checks all packages):**

```bash
yarn test:typecheck
```

This runs `tsc` from the root `tsconfig.json`. Errors print to stdout with
file paths and line numbers. Zero output = success.

**Pre-commit hooks (Husky + lint-staged):**

On every `git commit`, lint-staged automatically runs:
- JS/TS files: `eslint --max-warnings=0 --fix`
- CSS/SCSS/JSON/MD files: `prettier --write`

Only staged files are checked, not the entire repo.

> **Note:** The `.husky/pre-commit` file currently contains only a comment
> (`# yarn lint-staged`) and is not actively executing. If you find
> pre-commit hooks are not running, add the following to `.husky/pre-commit`:
>
> ```bash
> #!/bin/sh
> yarn lint-staged
> ```

**Bypass hooks in an emergency** (only for WIP commits, never for PRs):

```bash
git commit --no-verify -m "wip: debugging"
```

Never push a `--no-verify` commit to a branch that will be reviewed.

---

## First contribution workflow

### 1. Create a branch

Branch naming:

```bash
# Feature
git checkout -b feat/add-lasso-selection

# Bug fix
git checkout -b fix/text-container-binding-crash

# Documentation / chores
git checkout -b chore/update-dev-setup-guide
```

Always branch from `master` (the main branch):

```bash
git checkout master
git pull origin master
git checkout -b feat/YOUR_FEATURE_NAME
```

### 2. Make your change

Write code. Follow the conventions in `.github/copilot-instructions.md`:
- TypeScript only — no plain `.js` files in packages
- Functional React components with hooks
- `Point` type from `packages/math/src/types.ts` for all 2D coordinates
- No direct `jotai` imports — use `editor-jotai` or `app-jotai` wrappers
- No barrel `index` imports inside `packages/excalidraw` — use direct file paths

### 3. Run checks locally

```bash
yarn fix          # format + lint auto-fix
yarn test:all     # typecheck + lint + prettier + tests
```

All must pass with exit code `0` before pushing.

### 4. Commit

No enforced Conventional Commits format — but use a clear imperative title:

```bash
git commit -m "fix: prevent text container crash on empty input"
git commit -m "feat: add keyboard shortcut for lasso tool"
git commit -m "chore: update dev-setup guide with WSL2 notes"
```

Keep commits focused — one logical change per commit. Squashing is acceptable
before merge.

### 5. Push

```bash
git push -u origin feat/YOUR_FEATURE_NAME
```

### 6. Open a PR

**Via GitHub CLI:**

```bash
gh pr create --title "fix: prevent text container crash on empty input" \
  --body "$(cat .github/PULL_REQUEST_TEMPLATE.md)"
```

**Via browser:** GitHub will show a "Compare & pull request" banner after
pushing. Click it, or navigate to
`https://github.com/<your-username>/<your-fork-repo>/compare/feat/YOUR_FEATURE_NAME`.

### 7. Fill in the PR template

The PR template (`.github/PULL_REQUEST_TEMPLATE.md`) is a workshop checklist.
Fill in:
- **Учасник** — your name
- Check off each completed item in the checklist

### 8. CI checks

The following must be green before requesting review:
- TypeScript type check
- ESLint (zero warnings)
- Prettier
- Vitest tests (coverage thresholds must not regress)

---

## Common problems and fixes

---

**Symptom:** `error This project's package.json defines "packageManager": "yarn@1.22.22"` — install fails or uses wrong Yarn version

**Cause:** Corepack or a globally installed Yarn 2+ intercepts the command.

**Fix:**

```bash
npm install -g yarn@1.22.22
yarn --version   # must show 1.22.22
```

If Corepack is enabled and overriding: `corepack disable`

---

**Symptom:** `Error: Cannot find module '@excalidraw/common'` when running `yarn start`

**Cause:** Packages haven't been built — the dev server resolves packages from
`packages/*/dist/`, which doesn't exist yet on a fresh clone.

**Fix:**

```bash
yarn build:packages
yarn start
```

---

**Symptom:** `Error: listen EADDRINUSE: address already in use :::3001`

**Cause:** Another process is using port 3001.

**Fix:**

```bash
# Find the process
lsof -i :3001        # macOS / Linux
netstat -ano | findstr :3001   # Windows

# Kill it (replace PID with the actual process ID)
kill -9 PID          # macOS / Linux
taskkill /PID PID /F  # Windows
```

Or change the port in `.env.development.local`:

```bash
VITE_APP_PORT=3099
```

---

**Symptom:** `VITE_APP_FIREBASE_CONFIG` parse error at startup — `SyntaxError: Unexpected token`

**Cause:** The JSON value in `.env.development` has been corrupted (line break
introduced, quotes escaped incorrectly).

**Fix:** Restore the original single-line JSON value from the committed
`.env.development`. The value must be a valid JSON string on a single line,
wrapped in single quotes.

---

**Symptom:** Pre-commit hook does nothing — ESLint does not run on commit

**Cause:** `.husky/pre-commit` file contains only a comment; the `lint-staged`
command is not active.

**Fix:** Edit `.husky/pre-commit`:

```bash
#!/bin/sh
yarn lint-staged
```

Then make it executable:

```bash
chmod +x .husky/pre-commit
```

---

**Symptom:** `yarn test:all` fails with coverage below threshold

**Cause:** A new function or branch was added without corresponding tests,
dropping coverage below: lines 60%, branches 70%, functions 63%, statements 60%.

**Fix:** Add tests for the new code. Use `yarn test:coverage` to see exactly
which lines are uncovered (`coverage/index.html` shows a line-by-line view).

---

**Symptom:** TypeScript error `Type 'GlobalPoint' is not assignable to type 'LocalPoint'`

**Cause:** Mixing coordinate spaces — `GlobalPoint` and `LocalPoint` are
branded tuple types that TypeScript treats as incompatible.

**Fix:** Use the correct coordinate type. If converting between spaces, use
the transformation utilities in `packages/math/src/` (e.g., `pointFrom`,
coordinate transform functions). Never cast with `as`.

---

**Symptom:** HMR not picking up changes to a file in `packages/common` or `packages/element`

**Cause:** These packages are pre-built — the dev server reads from their
`dist/` directories, not their `src/`.

**Fix:**

```bash
# Rebuild just the package you changed
yarn build:common    # or build:math, build:element, build:excalidraw
# Then the dev server will pick up the new dist
```

---

**Symptom:** `yarn install` produces `warning "lint-staged > ...  has unmet peer dependency"`

**Cause:** Peer dependency warnings from transitive dependencies — cosmetic,
not a failure. Yarn Classic (1.x) surfaces these as warnings, not errors.

**Fix:** None required. These warnings are expected and safe to ignore.

---

## Getting help

- **Questions about this setup guide:** Open an issue in the repo with the
  label `documentation` and prefix the title with `[dev-setup]`.
- **Repo issues / bugs:** GitHub Issues on the Excalidraw repo.
- **Community:** The Excalidraw [Discord server](https://discord.gg/UexuTaE)
  has a `#contributing` channel for new contributors.
