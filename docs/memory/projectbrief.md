# Project brief — Excalidraw monorepo

## What this project is

- **Root package name:** `excalidraw-monorepo` — a Yarn workspaces monorepo around **Excalidraw**: a web app for hand-drawn-style diagrams and a React component library for embedding the editor.
- **Repository context:** the working copy folder name (`2026-fwdays-agentic-large-day01-hw`) suggests coursework or homework; the **source layout** matches the official Excalidraw structure (app + packages).

## Primary product goals

- Deliver a **full drawing editor** in the browser (canvas, shape library, export, locales, PWA).
- Ship the **`@excalidraw/excalidraw`** npm package (version in repo: `0.18.0`) as an embeddable React component with React peer dependencies.
- Support **collaboration and cloud flows** in `excalidraw-app` (implemented via `socket.io-client`, `firebase`, IndexedDB, etc. — see `excalidraw-app/package.json`).

## Main artifacts in the repository

| Area | Role |
|------|------|
| `excalidraw-app/` | Product SPA: Vite + React, entry `index.tsx` → `App.tsx` |
| `packages/common`, `math`, `element`, `utils` | Shared logic, geometry, scene elements, utilities |
| `packages/excalidraw` | Editor UI, public `Excalidraw` component API |
| `examples/*` | Integration examples (Next.js, in-browser script) |
| `firebase-project/` | Firebase configuration for related flows |

## Environment constraints

- **Node:** `>=18.0.0` (`package.json` → `engines`).
- **Package manager:** Yarn Classic, pinned `packageManager: yarn@1.22.22`.

## Sources in code

- Root `package.json` (`name`, `workspaces`, `scripts`, `engines`).
- `excalidraw-app/package.json` (app dependencies).
- `packages/excalidraw/package.json` (`name`, `version`, `description`, `peerDependencies`).
- `excalidraw-app/index.tsx` — React mount and PWA service worker.
