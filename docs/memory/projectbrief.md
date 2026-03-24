# Project Brief

## What This Repository Is

This repository is a **Yarn workspaces monorepo** for Excalidraw. It contains the standalone web app, the embeddable React library (`@excalidraw/excalidraw`), shared low-level packages, integration examples, and build/release tooling in one codebase.

The workspace root name and accompanying `docs/` material indicate use as a **course or homework sandbox** (e.g. agentic / fwdays context); runtime behavior matches the upstream Excalidraw-style architecture.

For a **full technical snapshot** of stack, layout, editor architecture, and file-level notes, use **`docs/memory/techContext.md`** (treated as canonical technical memory; see also `docs/memory/activeContext.md`).

## Main Goals

- Develop and ship the Excalidraw web app (`excalidraw-app`).
- Develop and publish `@excalidraw/excalidraw` and related packages (`packages/*`).
- Keep app, library, examples, and shared packages versioned and built together.
- Maintain examples that show how consumers embed the library (Next.js, script-in-browser).

## Technology Stack

| Area | Choices |
|------|--------|
| Runtime | Node.js **≥ 18** |
| Package manager | **Yarn 1.22** (workspaces) |
| UI | **React 19**, **TypeScript** |
| App build | **Vite 5** (PWA, SVGR, HTML/EJS helpers as configured in repo) |
| Styling | **SCSS/Sass** |
| Tests / quality | **Vitest**, **ESLint**, **Prettier**, `tsc` |
| Git hooks | **Husky**, **lint-staged** |
| App concerns | **Firebase**, **Socket.IO client** (collaboration), **Jotai**, **Sentry**, i18n |

Libraries are consumed by the app via workspace dependencies; public API is centred on `@excalidraw/excalidraw` and re-exports from sibling packages where applicable.

## Repository Structure

| Path | Role |
|------|------|
| `excalidraw-app/` | Main SPA: Vite entry, production build, Docker-oriented build script, local `start` / `serve`. |
| `packages/excalidraw/` | Primary editor package published as `@excalidraw/excalidraw` (components, UI, locales, etc.). |
| `packages/common/` | Shared primitives and helpers used across the editor stack. |
| `packages/element/` | Element model / geometry-adjacent logic (shapes, wrapping, collisions, etc.). |
| `packages/math/` | Vector, angles, curves, and other math utilities. |
| `packages/utils/` | General utilities shared by packages. |
| `examples/with-nextjs/` | Next.js integration example. |
| `examples/with-script-in-browser/` | Embed-via-script example (pairs with root `start:example` after package builds). |
| `scripts/` | Build, release, version, WASM, locale coverage, and other automation. |
| `firebase-project/` | Firebase configuration for app backend services (rules, hosting-related assets as present). |
| `public/` | Static assets for the app surface. |
| `.github/` | CI workflows and related assets. |
| `docs/` | See **Documentation layout** below. |

### Documentation layout (`docs/`)

| Path | Role |
|------|------|
| `docs/memory/` | Working memory: **`techContext.md`** (canonical technical snapshot), this brief, `activeContext`, progress, decision log, product/tech context. |
| `docs/technical/` | `architecture.md`, `dev-setup.md`, `infrastructure.md`, `api-reference.md`. |
| `docs/product/` | Domain glossary, UX patterns, feature catalog. |
| `docs/operations/` | Incident playbook, rollback guides. |
| `docs/decisions/` | ADRs and migration notes. |
| `docs/reference/` | OpenAPI/GraphQL files, dependency map, CodeGraphContext notes. |
| `docs/specs/` | Issue-level specs. |

### Optional: CodeGraphContext (CGC)

If you use CodeGraphContext in this repo, follow **`docs/technical/dev-setup.md`**: PowerShell wrapper **`scripts/cgc.ps1`** (state under `.cgc_home`) and **`docs/reference/codegraphcontext.md`** for status and usage.

## Key Commands (root `package.json`)

- **`yarn start`** — run the main app from `excalidraw-app` (Vite dev server).
- **`yarn build`** / **`yarn build:packages`** — build app and/or workspace packages for distribution.
- **`yarn test`** / **`yarn test:all`** — unit tests, lint, typecheck, formatting checks as defined in scripts.
- **`yarn start:example`** — build packages, then start the script-in-browser example.

Use these as the default entry points; see `package.json` `scripts` for aliases (`build:app`, `clean-install`, release tags, etc.).

## Scope Summary

- **App shell:** `excalidraw-app/`
- **Library and core packages:** `packages/*`
- **Integration examples:** `examples/*`
- **Tooling:** `scripts/`, root devDependencies (Vite, Vitest, shared ESLint/Prettier config)

## Maintaining documentation

Depth lives in **`docs/memory/techContext.md`**. When work produces new shared understanding (architecture, state, dependencies, lifecycle), **update the relevant `docs/` files in the same change**, not only the chat or PR description. See **`docs/memory/activeContext.md`** (“Documentation maintenance policy”) for where to put what and how CodeGraphContext fits in.

## Out of Scope (for this brief)

This file does not duplicate full API lists, env var matrices, or deployment runbooks; those live under `docs/technical/`, `docs/operations/`, and `docs/reference/`. Reference files such as `openapi.yaml` / `graphql-schema.graphql` may be partial or template-style until explicitly filled—see `docs/memory/activeContext.md` for maintenance expectations.
