# Decision log

## Details

For detailed architecture → see [docs/technical/architecture.md](../technical/architecture.md)  
For domain glossary → see [docs/product/domain-glossary.md](../product/domain-glossary.md)

## 2026-03-25 — Create “Memory Bank” under `docs/memory/`

- **Decision**: Keep project knowledge in a small set of structured markdown files:
  - `projectbrief.md`, `productContext.md`, `techContext.md`, `systemPatterns.md`, `activeContext.md`, plus ongoing `progress.md` and `decisionLog.md`.
- **Why**: Faster onboarding and consistent “single place” to answer: what is this repo, how to run it, and how it’s shaped.
- **Evidence**: Repo is a multi-package monorepo (`package.json` workspaces) with both an app and published packages; documenting that split avoids confusion.

## 2026-03-25 — Treat repo as Yarn v1 workspaces monorepo (not pnpm/npm)

- **Decision**: Reference Yarn as the primary package manager and use root scripts as canonical.
- **Why**: Tooling and scripts assume Yarn workspaces and `--cwd` usage.
- **Evidence**:
  - Root `package.json` has `packageManager: "yarn@1.22.22"` and `workspaces`.
  - `yarn.lock` exists at repo root.

## 2026-03-25 — Use “source-first” local development for packages

- **Decision**: Describe local development as “app consuming package source via aliases”, not via built artifacts.
- **Why**: This is the primary workflow for fast iteration in the repo.
- **Evidence**: `excalidraw-app/vite.config.mts` aliases `@excalidraw/*` imports to `../packages/*/src` and `../packages/excalidraw/index.tsx`.

## 2026-03-25 — Document app as static build served via nginx

- **Decision**: Treat deployment shape as static assets behind nginx.
- **Why**: Dockerfile builds the app and copies output into an nginx image.
- **Evidence**: Root `Dockerfile` uses `node:18` build stage and `nginx:1.27-alpine` runtime stage, copying `excalidraw-app/build`.

## 2026-03-25 — Document library integration via `<Excalidraw />` + CSS

- **Decision**: In product docs, highlight the minimal integration constraints (CSS import + non-zero height container).
- **Why**: These are explicitly called out as easy-to-miss requirements and drive integration success.
- **Evidence**: `packages/excalidraw/README.md` “Quick start” section.

## 2026-03-25 — Avoid undocumented claims; prefer “verified-by-file” statements

- **Decision**: Only include claims that can be verified from code/config in this repository.
- **Why**: Keeps Memory Bank trustworthy and reduces drift.
- **Evidence**: All current Memory Bank sections cite concrete repo files (e.g. `package.json`, Vite config, Dockerfile, package manifests).

## 2026-03-25 — Inventory: undocumented behavior & implicit dependencies (HACK/FIXME/TODO/WORKAROUND)

- **Decision**: Track “undocumented behavior” hotspots here (implicit state machines, non-obvious side effects, init-order dependencies) and treat them as risk items during refactors.
- **Why**: These patterns tend to break silently (timing/order-sensitive) and are hard to rediscover from symptoms.
- **Evidence**:
  - **Init-order DOM side-effect (theme flash prevention)**: `excalidraw-app/index.html` reads `localStorage("excalidraw-theme")` and toggles `document.documentElement.classList` _before_ app init to minimize white flash.
  - **Prod-only redirect logic in HTML**: `excalidraw-app/index.html` performs a client-side redirect based on cookie `excplus-autoredirect=true` only for bare root path (`/`), because server redirect can’t account for `location.hash` constraints.
  - **Global WebSocket monkey-patch (dev flag)**: `excalidraw-app/index.html` conditionally overrides `window.WebSocket` to suppress CRA live-reload when `VITE_APP_DEV_DISABLE_LIVE_RELOAD` is enabled (global side effect; order-dependent).
  - **Global tab reuse via `window.name`**: `excalidraw-app/index.html` sets `window.name = "_excalidraw"` so library installation reuses the tab (implicit cross-navigation behavior).
  - **Workaround for CRA Service Worker caching**: `excalidraw-app/index.html` includes `<!-- FIXME: remove this when we update CRA (fix SW caching) -->`, implying current behavior depends on legacy CRA/SW caching quirks.
  - **Implicit state machine via mount counters (multi-instance tunnels)**: `packages/excalidraw/components/hoc/withInternalFallback.tsx` uses a `renderAtom` counter + `preferHost` flag to ensure host & fallback don’t render simultaneously; relies on `useLayoutEffect` ordering and is sensitive to mount/unmount sequences.
  - **Input handling “hack” (pointer vs touch + double click)**: `packages/excalidraw/components/App.tsx` explicitly documents mixed native click + manual touch handling and keeps `lastPointerUpIsDoubleClick` state; this is an implicit state machine that can be timing-sensitive across event types.
  - **Library init race/merge dependency**: `packages/excalidraw/data/library.ts` loads/installs library items from URL and merges “initial” items with current ones because third‑party installation can occur before DB data loads; also manipulates URL state via `history.replaceState()` in `finally`, and intercepts hash changes by restoring `event.oldURL` to avoid breaking collab/other flows.
  - **Circular dependency constraint affecting utility placement**: `packages/common/src/colors.ts` keeps a local `pick()` helper with `// FIXME can't put to utils.ts rn because of circular dependency` (implies module graph constraints that can surface as init-order import issues).
  - **“Order matters” implementation detail**: `packages/common/src/colors.ts` notes “order of operations matters” for dark-mode filter pipeline and “ORDER matters” for quick-pick palette arrays (behavior depends on stable ordering).
  - **Potential leak on missing pointer-up**: `packages/excalidraw/tests/selection.test.tsx` flags `// TODO: There is a memory leak if pointer up is not triggered`, suggesting a real runtime risk guarded only by correct event completion.
  - **Test helper depends on initialization order**: `packages/excalidraw/tests/helpers/mocks.ts` documents that mock image dimensions are assigned “in the order of image initialization”, making tests sensitive to scheduling/order of `new Image()`.
