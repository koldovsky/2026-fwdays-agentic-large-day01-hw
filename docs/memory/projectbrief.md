# Project brief

## What this repository is

- **Name (workspace):** `excalidraw-monorepo` — a **Yarn workspaces** monorepo for the **Excalidraw** open-source project (see `package.json` `name` field).
- **Upstream:** Excalidraw — virtual whiteboard / diagramming with a hand-drawn aesthetic; source hosted at `https://github.com/excalidraw/excalidraw` (referenced in `packages/excalidraw/package.json` `repository` / `homepage`).

## Main purpose

- **Ship Excalidraw as an embeddable React component** (`@excalidraw/excalidraw`, `description`: “Excalidraw as a React component” in `packages/excalidraw/package.json`).
- **Ship a full web application** (`excalidraw-app`) that bundles the editor for end users (Vite build, production hosting patterns).
- **Publish supporting libraries** as workspace packages: `@excalidraw/common`, `@excalidraw/element`, `@excalidraw/math` (at **0.18.0**); **`@excalidraw/utils`** at **0.1.2** (`packages/utils/package.json` `version`).
- **Provide integration examples** under `examples/` (e.g. Next.js, script-in-browser) for consumers embedding the component.

## What users / developers get

| Deliverable | Role |
|-------------|------|
| **`excalidraw-app`** | Standalone app: dev server, production build, optional Docker-oriented build script. |
| **`packages/excalidraw`** | Primary npm surface: React component, CSS export (`./index.css`), re-exports for deep types (`./common/*`, `./element/*`, etc. per `exports` in `package.json`). |
| **`packages/common`**, **`element`**, **`math`**, **`utils`** | Shared constants, element/scene/store logic, geometry, utilities — consumed by the component and app (see each `packages/*/package.json` for versions). |
| **`examples/*`** | Reference setups for embedding. |

## Repository layout (high level)

- **`excalidraw-app/`** — Vite-based application entry (`start` / `build` scripts delegate here from root).
- **`packages/*`** — Libraries built with `build:esm` per package (`buildPackage.js` via each package’s `build:esm` script).
- **`examples/*`** — Sample apps depending on built packages.
- **`scripts/`** — Release, locale coverage, versioning, and shared build helpers.
- **`firebase-project/`** — Firebase-related project material for app/backend integration (directory present at repo root).

## Scope note

- The workspace name in the filesystem may reflect **course or workshop homework** (e.g. fwdays); **behavior and structure match the upstream Excalidraw monorepo** as defined by `package.json`, workspaces, and packages above — not a separate product with a different runtime.

## Details

- For detailed architecture → see [docs/technical/architecture.md](../technical/architecture.md)
- For developer setup → see [docs/technical/dev-setup.md](../technical/dev-setup.md)
- For domain glossary → see [docs/product/domain-glossary.md](../product/domain-glossary.md)
- For product requirements (PRD) → see [docs/product/PRD.md](../product/PRD.md)
