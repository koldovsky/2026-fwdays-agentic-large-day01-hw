# Project brief

## What this repository is

This workspace is the **Excalidraw monorepo** (`excalidraw-monorepo` in root `package.json`): the open-source virtual whiteboard for sketching hand-drawn style diagrams, shipped both as a **hosted web application** and as an **embeddable React library** (`@excalidraw/excalidraw`).

The folder name (`2026-fwdays-agentic-large-day01-hw`) indicates a course/homework context; the codebase itself matches the upstream Excalidraw structure (packages, app, examples).

## Main goal

- **End users**: draw, edit, and share diagrams in the browser with a distinctive “rough” aesthetic, offline-capable PWA behavior, collaboration hooks, and rich export/import.
- **Integrators**: embed the same editor via the `@excalidraw/excalidraw` package (React component + CSS), with an imperative API for automation and host app integration.

## What ships where

| Surface | Role |
|--------|------|
| **`excalidraw-app/`** | Full product shell: hosting concerns (e.g. Firebase, collab wiring, Sentry, PWA registration), wraps the library `Excalidraw` component. |
| **`packages/excalidraw/`** | Core editor UI and logic: main `Excalidraw` export, large `App` implementation, actions, data layer, i18n, rendering pipeline. |
| **`packages/common`**, **`math`**, **`element`**, **`utils`** | Shared primitives: constants/utilities, 2D math, element model and geometry, additional utilities built for the ecosystem. |
| **`examples/*`** | Reference integrations (e.g. Vite + script tag, Next.js patterns in package README / local examples). |

## Scope boundaries (high level)

- **In scope**: canvas editing, element types, history, library, import/export flows, collaboration-related UI and data reconciliation (as implemented in app + packages), localization, embed API.
- **Out of scope for this brief**: detailed product roadmap; treat feature specifics as “whatever the code and UI implement.”

## Success criteria (for contributors / agents)

- Changes preserve the **workspace layout** (Yarn workspaces: `excalidraw-app`, `packages/*`, `examples/*`).
- The **library** remains consumable as documented in `packages/excalidraw/README.md` (CSS import + `Excalidraw` in a sized container).
- The **host app** continues to build with Vite from `excalidraw-app/` using the shared `@excalidraw/*` path aliases to `packages/`.

## References in repo

- Root `package.json` — workspace name and orchestration scripts.
- `packages/excalidraw/README.md` — embed quick start and SSR notes.
- `excalidraw-app/App.tsx` — product-level composition around `@excalidraw/excalidraw`.
