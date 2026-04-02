# Active context — current focus

This file reflects the **repository state and the immediate documentation task**; there is no separate in-repo sprint tracker. Verified against workspace layout, `package.json`, and `docs/memory/projectbrief.md`.

## Repository identity

- **Workspace name:** `excalidraw-monorepo` (root `package.json`).
- **Primary product surface for local development:** `excalidraw-app` — Vite SPA that imports `@excalidraw/excalidraw` with path aliases to `packages/*` source (`excalidraw-app/vite.config.mts`).
- **Embeddable library:** `@excalidraw/excalidraw` at **0.18.0** (`packages/excalidraw/package.json`).

## Current documentation focus

- **Memory Bank** under `docs/memory/` is being maintained for agent/human orientation: `projectbrief.md` (scope and layout) plus `productContext.md`, `activeContext.md`, `progress.md`, and `decisionLog.md`.
- **Course context:** Path and git metadata indicate this tree is used as **fwdays agentic course day-01 homework**; behavior matches upstream Excalidraw monorepo patterns rather than a separate product fork.

## Where to work for typical tasks

| Goal | Primary locations |
|------|-------------------|
| Run full app locally | Root: `yarn start` → `excalidraw-app` Vite dev server |
| Editor UI, shortcuts, i18n | `packages/excalidraw/` (e.g. `components/`, `actions/`, `locales/`) |
| Shared constants / default UI flags | `packages/common/src/constants.ts` (`DEFAULT_UI_OPTIONS`, zoom limits, etc.) |
| Element model / geometry | `packages/element/`, `packages/math/` |
| App-only features (collab, hosting) | `excalidraw-app/` (Firebase, Socket.IO, Sentry per `excalidraw-app/package.json`) |
| Embed integration samples | `examples/with-nextjs`, `examples/with-script-in-browser` |

## Environment expectations

- **Node:** `>=18` (root and `excalidraw-app` `engines`).
- **Package manager:** Yarn **1.22.22** (`packageManager` field at repo root).
- **Typecheck scope:** `tsconfig.json` includes `packages` and `excalidraw-app`; **excludes** `examples` (examples use their own flows).

## Open pointers (non-code)

- Upstream roadmap, release tagging, and issue triage live on the **Excalidraw GitHub** (`packages/excalidraw/package.json` `repository` / `bugs` URLs).
- Local `.env` for Vite lives relative to `envDir: "../"` from `excalidraw-app` (repo root); see `vite.config.mts` and `loadEnv`.

## When this file should be updated

- After meaningful scope changes (new package, replaced bundler, or dropped workspace).
- When the team’s **actual** current sprint or homework milestone differs from “maintain parity with upstream + course tasks” — this doc does not substitute for issue trackers.
