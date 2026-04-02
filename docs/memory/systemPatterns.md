# System patterns

## Monorepo architecture

- **Workspaces** (root `package.json`): one **consumer app** (`excalidraw-app`), multiple **libraries** under `packages/`, and **examples**.
- **Dependency layering** (from `package.json` trees):
  - `@excalidraw/common` — minimal deps (e.g. `tinycolor2`).
  - `@excalidraw/math` → depends on `@excalidraw/common`.
  - `@excalidraw/element` → `@excalidraw/common`, `@excalidraw/math`.
  - `@excalidraw/excalidraw` → `@excalidraw/common`, `@excalidraw/element`, `@excalidraw/math` (plus many UI/drawing deps).
  - `@excalidraw/utils` — separate build (`buildUtils.js`); resolved via aliases in Vite/esbuild configs, not listed as a runtime dependency of `@excalidraw/excalidraw` in its `package.json`.

## Dual build model: app vs packages

- **excalidraw-app:** **Vite** bundles the app, resolves `@excalidraw/*` to **TypeScript sources** under `packages/` (`excalidraw-app/vite.config.mts` `resolve.alias`). Enables fast HMR and a single dev graph.
- **Publishable packages:** **esbuild** produces **ESM** `dist/dev` and `dist/prod` with **`packages: "external"`** for npm deps in the main package build (`scripts/buildPackage.js`), and scoped **externals** for sibling packages (`@excalidraw/common`, `element`, `math`) so consumers dedupe correctly. **Sass** is integrated via `esbuild-sass-plugin` with a custom `precompile` for `@use`/`@forward` resolution.
- **Types:** Each package runs `gen:types` (`tsc`) after build to populate `dist/types/...` matching `exports` in `package.json`.

## React composition: library vs shell

- **Public API surface:** `packages/excalidraw/index.tsx` exports the **`Excalidraw`** component, wraps internal **`App`**, applies **`polyfill()`** on load, imports global styles (`app.scss`, `styles.scss`, fonts).
- **Imperative API pattern:** **`ExcalidrawAPIProvider`**, **`ExcalidrawAPIContext`**, **`useExcalidrawAPI()`** — allows hooks that depend on the editor API to run **outside** the inner `<Excalidraw>` tree (documented in `index.tsx` comments).
- **Product shell:** `excalidraw-app/App.tsx` composes **`Excalidraw`**, collaboration UI, command palette, dialogs, file/backend helpers, and menu/footer components — importing deeply from `@excalidraw/excalidraw/*` for internals (data restore, analytics, UI pieces) where the app extends the stock editor.

## State management (Jotai)

- **Editor package:** `packages/excalidraw/editor-jotai.ts` uses **`jotai-scope`’s `createIsolation()`** → isolated **`EditorJotaiProvider`**, **`editorJotaiStore`**, and scoped hooks (`useAtom`, etc.). Supports multiple editor instances without atom collisions.
- **Application:** `excalidraw-app/app-jotai.ts` creates a dedicated **`createStore()`** (`appJotaiStore`) and re-exports **`Provider`**, **`useAtom`**, **`useAtomValue`**, plus **`useAtomWithInitialValue`** for one-shot initialization — used alongside collab atoms (e.g. `collabAPIAtom` imported in `App.tsx`).

## Data, collaboration, and persistence (app layer)

- **`excalidraw-app/data/`** modules (`firebase`, `LocalData`, `FileManager`, `Locker`, storage helpers) encapsulate persistence and sync concerns separate from the core drawing engine.
- **`excalidraw-app/collab/`** (`Collab.tsx`, `Portal.tsx`, errors UI) coordinates **Socket.IO**-style collaboration (dependency: `socket.io-client` in `excalidraw-app/package.json`).
- **Cross-tab / keys:** `app_constants.ts` (imported from `App.tsx`) centralizes storage prefixes and timeouts.

## Testing pattern

- **Vitest** mirrors **Vite’s** `@excalidraw/*` aliases (`vitest.config.mts`) so tests import the same module graph as dev.
- **Environment:** `jsdom` + shared setup in `setupTests.ts` (referenced in config) for React and DOM APIs.

## Progressive web app and assets

- **PWA:** `vite-plugin-pwa` in `excalidraw-app/vite.config.mts`.
- **Chunking:** `manualChunks` splits locale JSON (excluding `en.json` / `percentages.json`) for caching behavior documented in config comments.
- **Fonts:** Custom **woff2** handling via `scripts/woff2/woff2-vite-plugins` (`woff2BrowserPlugin`).

## Configuration and environment

- **Env files:** Vite loads from repo parent directory (`envDir: "../"`, `loadEnv` in `vite.config.mts`); esbuild library builds inject `import.meta.env` for `DEV`/`PROD` via `scripts/buildPackage.js` / `buildBase.js` patterns.
- **Strict TypeScript:** `strict`, `noFallthroughCasesInSwitch`, path-based monorepo layout (`tsconfig.json`).

## Verification pointers

- Alias parity: compare `tsconfig.json` `paths`, `excalidraw-app/vite.config.mts`, and `vitest.config.mts`.
- Editor vs app Jotai: `packages/excalidraw/editor-jotai.ts` vs `excalidraw-app/app-jotai.ts`.
- Build entry scripts: `scripts/buildBase.js`, `scripts/buildPackage.js`, `scripts/buildUtils.js`.
