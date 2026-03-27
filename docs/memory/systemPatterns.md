# System patterns

## Monorepo layering

Packages form a **directed dependency graph** (see each package’s `package.json` `dependencies`):

```text
@excalidraw/common     (tinycolor2; no internal @excalidraw deps)
        ↑
@excalidraw/math       (depends on @excalidraw/common)
        ↑
@excalidraw/element    (depends on @excalidraw/common, @excalidraw/math)
        ↑
@excalidraw/excalidraw (depends on @excalidraw/common|element|math in package.json + many UI libs)
```

- **`@excalidraw/utils`**: **not** listed in `packages/excalidraw/package.json` `dependencies`, but the editor **imports** it (e.g. `@excalidraw/utils/export`). `scripts/buildPackage.js` sets an **alias** `@excalidraw/utils` → `packages/utils/src` and does **not** mark it `external`, so utils source is **bundled** into the excalidraw `dist` output. The `utils` package is built separately via `buildUtils.js` when publishing `@excalidraw/utils` on its own.
- **Build order** for the main chain: `build:common` → `build:math` → `build:element` → `build:excalidraw` (`package.json`, `build:packages`). **`build:utils` is not part of that script** — run `yarn --cwd packages/utils build:esm` if you need `packages/utils/dist` explicitly.

## Build pipeline (esbuild)

| Script | Used by | Behavior (verified in source) |
|--------|---------|--------------------------------|
| `scripts/buildBase.js` | `common`, `math`, `element` | Single entry `src/index.ts`, ESM, dev/prod with `import.meta.env` flags; `external`: `@excalidraw/common`, `@excalidraw/element`, `@excalidraw/math`; alias `@excalidraw/utils` → source. |
| `scripts/buildPackage.js` | `excalidraw` | Entries `index.tsx` + `**/*.chunk.ts`; **splits** chunks; `packages: "external"`; same `external` for common/element/math; SASS via `esbuild-sass-plugin`; env from `.env.development` / `.env.production` via `packages/excalidraw/env.cjs`. |
| `scripts/buildUtils.js` | `utils` | Bundles with aliases pointing all `@excalidraw/*` packages to **source** trees (for resolution during utils build). |

- **Type declarations**: each of the five workspace packages with `build:esm` ends with `gen:types` (`rimraf types && tsc`) per their `package.json` `scripts` (`common`, `math`, `element`, `utils`, `excalidraw`).
- **Published surface**: packages expose **`development`** vs **`production`** (and `types`) in `exports` — consumers resolve different `dist/dev` vs `dist/prod` bundles (`packages/excalidraw/package.json` `exports`).

## Local development vs published bundles

- **TypeScript** resolves workspace packages through **`paths`** in root `tsconfig.json` (e.g. `@excalidraw/excalidraw` → `./packages/excalidraw/index.tsx`).
- **Vite** (`excalidraw-app/vite.config.mts`) repeats the same idea with **`resolve.alias`** regexes pointing `@excalidraw/common|element|excalidraw|math|utils` to `packages/*/src` (or `excalidraw` root). That lets `yarn start` run against **source** without pre-building `dist/` for every change.
- **`include` / `exclude`**: root `tsconfig.json` includes `packages` and `excalidraw-app`, excludes `examples`, `dist`, `types`, `tests` (path-based test folders).

## Application shell (`excalidraw-app`)

- **Entry**: `excalidraw-app/index.tsx` — `createRoot`, **PWA** `registerSW` from `virtual:pwa-register`, **Sentry** side-effect import (loads `excalidraw-app/sentry.ts`), then renders root `App` inside `StrictMode`.
- **Env**: `window.__EXCALIDRAW_SHA__` from `import.meta.env.VITE_APP_GIT_SHA` (same file).
- **Product UI**: `excalidraw-app/App.tsx` composes exports from `@excalidraw/excalidraw` (e.g. `Excalidraw`, collaboration triggers, command palette, dialogs) plus `@excalidraw/common` utilities — the app is a **host** around the embeddable library.

## React patterns in the library (`packages/excalidraw`)

- **Default export** `Excalidraw` in `packages/excalidraw/index.tsx` wires `App`, `InitializeApp`, menus, i18n, global SCSS/fonts, and runs `polyfill()`.
- **Imperative API outside the tree**: `ExcalidrawAPIProvider` + contexts (`ExcalidrawAPIContext`, `ExcalidrawAPISetContext`) so hooks like `useExcalidrawAPI()` work when the editor is not a direct parent (documented in comments in `index.tsx`).
- **State**: **Jotai** — `EditorJotaiProvider` and `editorJotaiStore` from `./editor-jotai` wrap the editor (`packages/excalidraw/index.tsx` imports).
- **Shared logic**: imports from `@excalidraw/common` (e.g. `DEFAULT_UI_OPTIONS`, `isShallowEqual`) at the top of `index.tsx` — keeps constants and pure helpers in the `common` package.

## Cross-cutting concerns

- **i18n**: locale data and coverage tooling live under `packages/excalidraw` (e.g. `locales/`, scripts in root `package.json` `locales-coverage*`).
- **PWA**: Vite PWA plugin in `excalidraw-app/vite.config.mts` (see imports at top of file).
- **Quality gate**: `yarn test:all` chains typecheck, ESLint, Prettier, and Vitest (`package.json` `scripts`).

## Details

For detailed architecture (Mermaid diagrams, data flow, state management, rendering pipeline) → see [`docs/technical/architecture.md`](../technical/architecture.md).
For domain term definitions (Element, Scene, AppState, Action, Store, …) → see [`docs/product/domain-glossary.md`](../product/domain-glossary.md).

## Source verification

| Pattern | Where to look |
|---------|----------------|
| Package dependency edges | `packages/common`, `math`, `element`, `excalidraw` `package.json` |
| esbuild externals / entries | `scripts/buildBase.js`, `scripts/buildPackage.js`, `scripts/buildUtils.js` |
| TS path aliases | `tsconfig.json` `paths` |
| Vite aliases | `excalidraw-app/vite.config.mts` `resolve.alias` |
| React providers & Jotai | `packages/excalidraw/index.tsx` |
| App bootstrap | `excalidraw-app/index.tsx` |
