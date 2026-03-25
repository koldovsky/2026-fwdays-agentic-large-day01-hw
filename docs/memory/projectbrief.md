# Project brief

## Related documentation

**Product** (`docs/product/`)

- **PRD** (requirements, scope, reverse-engineered from behavior): [`PRD.md`](../product/PRD.md)
- **Domain glossary** (Scene, AppState, `ExcalidrawElement`, Action, Library, Collaboration, …): [`domain-glossary.md`](../product/domain-glossary.md)

**Technical** (`docs/technical/`)

- **Architecture** (layers, data flow, state, rendering, packages): [`architecture.md`](../technical/architecture.md)
- **Dev setup** (local environment, install, run, quality gates): [`dev-setup.md`](../technical/dev-setup.md)
- **Technical decision log** (fragile behavior, FIXME/HACK/TODO audit in code): [`decisionLog.md`](../technical/decisionLog.md)

## What this repository is

- **Name (monorepo):** `excalidraw-monorepo` — a Yarn workspaces repository centered on the open-source **Excalidraw** whiteboard.
- **Primary deliverable:** A full **web application** (`excalidraw-app`) that embeds the **`@excalidraw/excalidraw` React component** and adds product features (collaboration, sharing, storage, analytics hooks).
- **Secondary deliverable:** **Publishable libraries** under `packages/*` (`@excalidraw/common`, `@excalidraw/element`, `@excalidraw/math`, `@excalidraw/excalidraw`, etc.) built as ESM bundles for embedding Excalidraw in other apps.
- **Examples:** `examples/*` (e.g. Next.js, in-browser script) show integration patterns.

_Sources:_ root `package.json` (`name`, `workspaces`); `packages/excalidraw/package.json` / `README.md`; `excalidraw-app/App.tsx` imports from `@excalidraw/excalidraw`.

## Main goals

- **End-user drawing:** Hand-drawn style diagrams, shapes, text, images, export, and rich editor UX (command palette, themes, i18n) via the core package.
- **Embeddability:** Expose `Excalidraw` as a React component with CSS and imperative API (`onExcalidrawAPI`, callbacks) for host applications.
- **Hosted app experience:** Wire the component to **collaboration** (`LiveCollaborationTrigger`, `socket.io-client`), **Firebase**-related flows, **PWA** / offline-oriented build, **Sentry**, and file/library workflows in `excalidraw-app`.
- **Operational packaging:** **Docker** multi-stage build (Node build → static assets → **nginx**) and **docker-compose** for local dev-style mounts.

_Sources:_ `excalidraw-app/App.tsx`; `excalidraw-app/package.json` dependencies; `Dockerfile`; `docker-compose.yml`; `excalidraw-app/index.tsx` (`registerSW`); `packages/excalidraw/index.tsx` (`ExcalidrawAPIProvider`, `Excalidraw` props).

## Non-goals (inferred from layout)

- This repo is **not** a minimal tutorial stub: it is a **full upstream-style** Excalidraw codebase (large `packages/excalidraw` tree, Vitest suite, CI workflows).
- **Backend** for collaboration is not defined in-repo beyond client configuration (e.g. Firebase, sockets) — hosting is external.

_Sources:_ repository size and `.github/workflows`; `excalidraw-app/data/firebase.ts` (external service).

## Success criteria for contributors

- **Local dev:** App starts via workspace scripts; Vite serves from `excalidraw-app` with aliases to `packages/*` sources.
- **Quality gate:** `yarn test:all` runs typecheck, ESLint, Prettier check, and Vitest.
- **Build:** `yarn build` produces the static app under `excalidraw-app/build` (Vite `outDir`).

_Sources:_ root `package.json` `scripts`; `excalidraw-app/vite.config.mts` (`build.outDir`); `excalidraw-app/package.json` `build` / `start`.
