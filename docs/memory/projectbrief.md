# Project brief

## Details

For detailed architecture → see [docs/technical/architecture.md](../technical/architecture.md)  
For domain glossary → see [docs/product/domain-glossary.md](../product/domain-glossary.md)

## What this project is

- **Name (repo)**: `excalidraw-monorepo` (Yarn workspaces monorepo).
- **Product**: **Excalidraw** — a virtual collaborative whiteboard / diagramming tool with a hand‑drawn look & feel (see `excalidraw-app/index.html` meta description).
- **Deliverables in repo**:
  - **Web app**: `excalidraw-app/` (Vite-based app that builds to static assets).
  - **Embeddable React component/library**: `packages/excalidraw` published as `@excalidraw/excalidraw` (see `packages/excalidraw/package.json` description + exports).
  - **Shared internal packages**: `packages/common`, `packages/element`, `packages/math`, `packages/utils` (see TS path aliases in root `tsconfig.json` and `packages/*/src/index.ts` entrypoints).
  - **Examples**: `examples/*` (e.g. Next.js + browser script examples referenced in `packages/excalidraw/README.md`).

## Primary goal

- **Provide both**:
  - A **production-ready whiteboard web app** (the `excalidraw-app` build is served as static files; Docker image uses nginx).
  - A **reusable React component package** (`@excalidraw/excalidraw`) that other apps can embed (documented in `packages/excalidraw/README.md`).

## Who it’s for

- **End users**: people who use Excalidraw in the browser for sketching diagrams/ideas.
- **Integrators / developers**: teams embedding Excalidraw into their React apps via `@excalidraw/excalidraw`.

## Scope boundaries (as evidenced by repo layout)

- **Frontend-first**: core deliverables are a React/Vite app and ESM packages.
- **Monorepo orchestration**: app + packages + examples live in one repository and share TypeScript path aliases and workspace tooling.
- **Build targets**:
  - **App**: static build output (default `excalidraw-app/build`, see root scripts and `excalidraw-app/vite.config.mts`).
  - **Packages**: ESM builds under `dist/*` (see `packages/excalidraw/package.json` and build scripts in root `scripts/`).
