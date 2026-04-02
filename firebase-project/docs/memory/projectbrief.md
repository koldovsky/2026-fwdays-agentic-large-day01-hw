# Project brief

## What this project is

- **Name (workspace):** `excalidraw-monorepo` — a **Yarn workspaces** monorepo containing the open-source **Excalidraw** codebase (see root `package.json` `name` field).
- **Product:** **Excalidraw** — a hand-drawn style virtual whiteboard. The core is shipped as a **React component** (`@excalidraw/excalidraw`) that embeds in other applications; this repo also builds the **full web application** used at excalidraw.com–style deployments (`excalidraw-app`).
- **Evidence:** `packages/excalidraw/package.json` describes the package as *“Excalidraw as a React component”*; `packages/excalidraw/README.md` documents embed usage, CSS import, and client-only / SSR constraints.

## Main goals

1. **Library:** Publish and maintain `@excalidraw/excalidraw` (and supporting scoped packages) so developers can embed drawing, diagramming, and collaboration-oriented UI in their apps.
2. **Application:** Run `excalidraw-app` as the product shell: menus, collaboration, storage integrations, analytics hooks, PWA behavior, etc., composed around the shared `@excalidraw/excalidraw` API (see `excalidraw-app/App.tsx` imports from `@excalidraw/excalidraw` and related paths).
3. **Modularity:** Split domain logic into focused packages (`@excalidraw/common`, `@excalidraw/math`, `@excalidraw/element`, `@excalidraw/utils`) with clear dependency direction (see each package’s `package.json` `description` and `dependencies`).

## Repository layout (high level)

| Area | Role |
|------|------|
| `packages/excalidraw/` | Main React library: `Excalidraw` component, editor UI, data layer, i18n, styles (`index.tsx` entry). |
| `packages/common/` | Shared constants, utilities, app-state helpers (*“common functions, constants”* per `package.json`). |
| `packages/math/` | 2D math (*“Excalidraw math functions”*). |
| `packages/element/` | Element model and operations (*“elements-related logic”*). |
| `packages/utils/` | Additional utilities built via `scripts/buildUtils.js` (separate from the three core libs in some build paths). |
| `excalidraw-app/` | Vite-based SPA that wires the library into a full product (collab, Firebase, Sentry, etc.). |
| `examples/*` | Integration samples (e.g. Next.js, script-in-browser) listed in root `workspaces`. |

## Out of scope for this brief

- Upstream roadmap and release policy live outside this repo’s `package.json`; this document reflects **structure and purpose as implemented here**, not external product marketing.

## Verification notes

- Workspace members: root `package.json` → `workspaces`: `excalidraw-app`, `packages/*`, `examples/*`.
- TypeScript project roots: `tsconfig.json` → `include`: `packages`, `excalidraw-app`; `exclude`: `examples`, build artifacts.

## Related references

- For detailed architecture, see `docs/technical/architecture.md`.
- For domain glossary, see `docs/product/domain-glossary.md`.
