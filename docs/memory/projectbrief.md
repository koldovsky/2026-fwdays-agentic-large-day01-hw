# Project Overview

This is the **Excalidraw monorepo** — the open-source, hand-drawn-style virtual whiteboard for sketching diagrams and collaborating in real time. Your local clone appears to be a homework/course fork (based on the folder name `2026-fwdays-agentic-large-day01-hw`).

The repo ships two main artifacts:

1. **`@excalidraw/excalidraw`** — an embeddable **React component** (the whiteboard editor itself).
2. **`excalidraw-app`** — the full **web application** that wraps the library with product features like sharing, collaboration, and persistence.

---

## Core Technology Stack

| Area | Technologies |
|---|---|
| **Language** | TypeScript (strict), some JS in tooling |
| **UI** | React 19, Sass, Jotai (state management) |
| **Build / Dev** | Yarn 1 workspaces, Vite 5 (app & examples), esbuild (package builds) |
| **Testing** | Vitest, jsdom, @testing-library/react |
| **Quality** | ESLint, Prettier, Husky + lint-staged |
| **Drawing engine** | RoughJS, perfect-freehand, CodeMirror 6, Radix UI |
| **App backends** | Firebase, Socket.io (real-time collab), Sentry (error tracking) |
| **Node** | >= 18.0.0 |

---

## Repository Structure

### Top-level layout

- **`package.json`** — Yarn workspaces root; defines `start`, `build`, `test:all`, `release` scripts.
- **`tsconfig.json`** — Monorepo-wide TS config with path aliases mapping `@excalidraw/*` to `packages/*/src`.
- **`vitest.config.mts`** — Test config with matching path aliases.
- **`scripts/`** — Release, versioning, locale tools, WASM plugins, `buildPackage.js` for publishing ESM + types, and `buildUtils.js` for the `@excalidraw/utils` package.

### `packages/` — shared libraries (build order: common → math → element → excalidraw; `utils` built separately)

| Package | Purpose |
|---|---|
| **`common`** | Shared constants, colors, keys, utilities |
| **`math`** | Geometry and curve math for the canvas |
| **`element`** | Scene element model, transforms, collision detection |
| **`excalidraw`** | The main React whiteboard: UI, actions, renderer, i18n, tests |
| **`utils`** | Standalone publishable utilities (`@excalidraw/utils`): URL sanitisation, laser pointer, image encoding, compression; built via `buildUtils.js`, not part of `build:packages` |

### `excalidraw-app/` — the full web application

A **Vite-powered** React app that wraps `@excalidraw/excalidraw` with Firebase auth/storage, Socket.io real-time collaboration, Sentry error reporting, PWA support, and more.

### `examples/` — integration demos

| Example | Stack |
|---|---|
| **`with-nextjs`** | Next.js 14 — shows SSR integration |
| **`with-script-in-browser`** | Vite + React — minimal embed pattern |

### Other notable directories

- **`firebase-project/`** — Firebase rules/config for backend features.
- **`.github/`** — CI workflows and assets.

### Dependency graph

```text
common ──┬──→ element ──→ excalidraw (React UI)
         ├──→ math ────→ excalidraw
         └────────────→ excalidraw
                              ↑
                    excalidraw-app (Vite product app)
                    examples (Next.js / Vite demos)

utils  (standalone — no internal dependents; published as @excalidraw/utils)
```

In short: a well-structured TypeScript/React monorepo where shared geometry and element-model packages feed into the main embeddable editor, which is then consumed by the full web app and example integrations.

---

## Details

For detailed architecture → see `docs/technical/architecture.md`.

For domain glossary → see `docs/product/domain-glossary.md`.