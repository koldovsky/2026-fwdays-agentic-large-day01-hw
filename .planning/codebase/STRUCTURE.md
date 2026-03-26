# Codebase Structure

**Analysis Date:** 2026-03-26

## Directory Layout

```
2026-fwdays-agentic-large-day01-hw/
├── excalidraw-app/          # Vite host app: collab, Firebase, product UI
├── packages/
│   ├── common/              # Shared constants, utils, event bus
│   ├── element/             # Elements, scene store, mutations, geometry of shapes
│   ├── excalidraw/          # React editor, actions, data, renderer, locales
│   ├── math/                # Vectors, curves, geometric primitives
│   └── utils/               # Export/helpers used by tooling and tests
├── examples/
│   └── with-script-in-browser/   # Minimal embed example (Vite)
├── scripts/                 # buildBase, buildPackage, release, woff2 plugins, wasm
├── public/                  # Static assets (e.g. service worker path)
├── docs/                    # Documentation (not runtime)
├── firebase-project/        # Firebase project configuration/assets
├── package.json             # Yarn workspaces root
├── tsconfig.json            # Path aliases for @excalidraw/*
└── vercel.json              # Deployment config
```

## Directory Purposes

**`excalidraw-app/`:**

- Purpose: Runnable application that composes `@excalidraw/excalidraw` with backend sync, storage, and branded chrome.
- Contains: React entry (`index.tsx`, `App.tsx`), collab (`collab/`), persistence/sync (`data/`), share dialog (`share/`), app-only components (`components/`), Jotai store (`app-jotai.ts`), constants (`app_constants.ts`), language helpers (`app-language/`).
- Key files: `excalidraw-app/vite.config.mts`, `excalidraw-app/index.html`, `excalidraw-app/App.tsx`, `excalidraw-app/data/index.ts`, `excalidraw-app/collab/Collab.tsx`

**`packages/excalidraw/`:**

- Purpose: Main editor package: UI, canvas, actions, i18n, workers, subset fonts.
- Contains: `components/` (including `components/App.tsx`), `actions/`, `data/`, `renderer/`, `scene/`, `hooks/`, `locales/`, `fonts/`, `eraser/`, `lasso/`, `wysiwyg/`, `charts/`, `subset/`, `tests/`.
- Key files: `packages/excalidraw/index.tsx`, `packages/excalidraw/types.ts`, `packages/excalidraw/history.ts`, `packages/excalidraw/workers.ts`, `packages/excalidraw/editor-jotai.ts`, `packages/excalidraw/package.json`

**`packages/element/`:**

- Purpose: Element model and operations (no React).
- Contains: `packages/element/src/*.ts` modules re-exported from `packages/element/src/index.ts`.
- Key files: `packages/element/src/store.ts`, `packages/element/src/Scene.ts`, `packages/element/src/types.ts`

**`packages/common/`:**

- Purpose: Shared non-UI primitives and app-wide constants.
- Contains: `packages/common/src/*.ts` re-exported from `packages/common/src/index.ts`.

**`packages/math/`:**

- Purpose: Math types and functions for geometry used by element and editor.
- Contains: `packages/math/src/*.ts`, barrel `packages/math/src/index.ts`.

**`packages/utils/`:**

- Purpose: Utilities (e.g. export helpers, bounds) consumed by packages/tests.
- Contains: `packages/utils/src/`, tests under `packages/utils/tests/`.

**`examples/with-script-in-browser/`:**

- Purpose: Demonstrates embedding; has own `vite.config.mts` and `index.tsx`.

**`scripts/`:**

- Purpose: Monorepo automation: `scripts/buildBase.js`, `scripts/buildPackage.js`, `scripts/build-version.js`, `scripts/woff2/woff2-vite-plugins.js`, etc.

## Key File Locations

**Entry Points:**

- `excalidraw-app/index.tsx` — React DOM mount, PWA registration, loads `excalidraw-app/App.tsx`
- `packages/excalidraw/index.tsx` — Library default export `Excalidraw` and related exports

**Configuration:**

- Root `package.json` — workspaces: `excalidraw-app`, `packages/*`, `examples/*`
- `tsconfig.json` — `paths` for `@excalidraw/common`, `@excalidraw/element`, `@excalidraw/excalidraw`, `@excalidraw/math`, `@excalidraw/utils`
- `excalidraw-app/vite.config.mts` — mirrors TS path aliases to source files for dev/build
- `packages/*/tsconfig.json` — per-package compilation
- `packages/tsconfig.base.json` — shared TS settings for packages

**Core Logic:**

- `packages/excalidraw/components/App.tsx` — Central editor controller and canvas host
- `packages/excalidraw/actions/` — User commands
- `packages/excalidraw/data/` — Load/save, JSON, blob, library, restore, reconcile
- `packages/excalidraw/renderer/` — Drawing and export-related rendering
- `packages/element/src/` — Element and scene mutations

**Testing:**

- `packages/excalidraw/tests/` — Vitest tests for editor behavior
- `packages/*/tests/` — Package-level unit tests
- `excalidraw-app/tests/` — App-level tests if present
- Root `setupTests.ts` — Vitest setup

## Naming Conventions

**Files:**

- React components: `PascalCase.tsx` (e.g. `packages/excalidraw/components/App.tsx`, `excalidraw-app/App.tsx`)
- Actions: `action*.ts` under `packages/excalidraw/actions/`
- Hooks: `use*.ts` under `packages/excalidraw/hooks/` and similar
- Pure TS modules: `camelCase.ts` or descriptive names (`history.ts`, `workers.ts`)

**Directories:**

- Package scope folders: lowercase (`components/`, `data/`, `collab/`)
- Multi-word folders often **kebab-case** inside components (e.g. `live-collaboration/`, `welcome-screen/`, `main-menu/` under `packages/excalidraw/components/`)

**Imports:**

- Use workspace aliases `@excalidraw/<pkg>` and `@excalidraw/<pkg>/<subpath>` as configured in `tsconfig.json` and `excalidraw-app/vite.config.mts`.

## Where to Add New Code

**New Feature (editor behavior, tools, canvas):**

- Primary code: `packages/excalidraw/` — often `components/` for UI, `actions/` for commands, `data/` for persistence, `renderer/` for draw logic
- Element rules/geometry: `packages/element/src/` when logic is React-free and reusable
- Tests: `packages/excalidraw/tests/` mirroring feature area (see existing `*.test.tsx` patterns)

**New Feature (host-only: auth, billing, sync protocol):**

- Primary code: `excalidraw-app/` — `data/`, `collab/`, `components/`, or `share/`
- Wire into `excalidraw-app/App.tsx` or existing providers in `excalidraw-app/app-jotai.ts`

**New Component/Module (library):**

- Implementation: `packages/excalidraw/components/<FeatureName>/` or top-level folder if cross-cutting (like `charts/`)
- Export from `packages/excalidraw/index.tsx` only if part of the public API

**Utilities:**

- Shared non-element math: `packages/math/src/`
- Shared app constants/utils: `packages/common/src/`
- Broader helpers: `packages/utils/src/`

**Examples:**

- Small integration demos: `examples/` (add workspace in root `package.json` if new package is needed)

## Special Directories

**`packages/excalidraw/dist/` (and `packages/*/dist/`):**

- Purpose: ESM build output for publishing and some consumers
- Generated: Yes (via `yarn build:*` scripts)
- Committed: Typically no (verify `.gitignore`; treat as build artifact)

**`node_modules/`:**

- Purpose: Dependencies installed by Yarn at root and workspace levels
- Generated: Yes
- Committed: No

**`.planning/`:**

- Purpose: GSD / planning artifacts including this codebase map
- Generated: By workflow
- Committed: Per team convention

---

*Structure analysis: 2026-03-26*
