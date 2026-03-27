# Project brief

## Related documentation

- **Product:** [PRD](../product/PRD.md), [Domain glossary](../product/domain-glossary.md)
- **Technical:** [Architecture](../technical/architecture.md), [Dev setup](../technical/dev-setup.md), [Code vs documentation](../technical/code-vs-documentation.md)

## What this is

- **Monorepo name** (root `package.json`): `excalidraw-monorepo` — a Yarn workspaces monorepo.
- **Core product**: The `@excalidraw/excalidraw` package is described in its `package.json` as **“Excalidraw as a React component”** (embeddable whiteboard UI).
- **Hosted app**: `excalidraw-app` is a **private** Vite + React application (`excalidraw-app/package.json`) that consumes the local packages.

## Primary goal (engineering)

- Ship and develop **Excalidraw** as modular TypeScript packages plus a **Vite-based web app**, with shared build, test, and lint tooling at the repository root (`package.json` scripts).

## Domain / user-facing purpose (from published package intent)

- **Diagram / virtual whiteboard editing** in the browser, consumable as a React component (see `packages/excalidraw/README.md` quick start: `Excalidraw` component, required CSS import, non-zero container height).

## Main modules / bounded areas

| Area | Role (from manifests / layout) |
|------|--------------------------------|
| `packages/common` | `@excalidraw/common` — description: “common functions, constants, etc.” (`packages/common/package.json`). |
| `packages/math` | `@excalidraw/math` — “math functions” (`packages/math/package.json`). Depends on `@excalidraw/common`. |
| `packages/element` | `@excalidraw/element` — “elements-related logic” (`packages/element/package.json`). Depends on `@excalidraw/common`, `@excalidraw/math`. |
| `packages/utils` | `@excalidraw/utils` — “utility functions” (`packages/utils/package.json`). Separate esbuild entry (`scripts/buildUtils.js` referenced by its `build:esm` script). |
| `packages/excalidraw` | `@excalidraw/excalidraw` — main React component library; depends on `@excalidraw/common`, `@excalidraw/element`, `@excalidraw/math`, and other npm deps (`packages/excalidraw/package.json`). |
| `excalidraw-app` | End-user web app: React 19, Vite, Firebase, Socket.IO client, Sentry, Jotai, etc. (`excalidraw-app/package.json`). |
| `examples/with-nextjs` | Next.js 14 example integrating built packages (`examples/with-nextjs/package.json`). |
| `examples/with-script-in-browser` | Vite example depending on `@excalidraw/excalidraw` workspace package (`examples/with-script-in-browser/package.json`). |
| `scripts/` | Root automation: package builds (`buildBase.js`, `buildPackage.js`, `buildUtils.js`, …), releases, locale coverage (`package.json` scripts). |
| `firebase-project/` | Firebase config for Firestore + Storage rules (`firebase-project/firebase.json`). |
| `public/` | Static assets at repo root (present alongside app; used in broader build/deploy context). |

## High-level repository structure

```
excalidraw-monorepo/
├── excalidraw-app/          # Vite React app
├── packages/
│   ├── common/ | element/ | math/ | utils/ | excalidraw/
├── examples/                # with-nextjs, with-script-in-browser
├── scripts/
├── firebase-project/
├── docker-compose.yml
├── Dockerfile
├── package.json             # workspaces + root scripts
├── tsconfig.json            # paths for @excalidraw/*
├── vitest.config.mts
└── yarn.lock
```

## Not verified

- **Course or assignment-specific purpose** for this workspace path: not stated in repository files (no root `README.md` present in this checkout).

## Upstream reference

- Several packages list `repository`: `https://github.com/excalidraw/excalidraw` (`packages/excalidraw/package.json`, `packages/common/package.json`, etc.).
