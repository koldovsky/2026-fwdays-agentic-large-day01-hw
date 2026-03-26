# System patterns

## Related documentation

- **Architecture** (diagrams, data flow, `ActionManager` / `Store` / canvas pipeline, package graph): [`docs/technical/architecture.md`](../technical/architecture.md)
- **Dev setup** (local environment, workflows): [`docs/technical/dev-setup.md`](../technical/dev-setup.md)
- **Technical decision log** (fragile behavior, FIXME/HACK, implicit state machines): [`docs/technical/decisionLog.md`](../technical/decisionLog.md)
- **PRD** (product requirements): [`docs/product/PRD.md`](../product/PRD.md)
- **Domain glossary:** [`docs/product/domain-glossary.md`](../product/domain-glossary.md)

## High-level architecture

```mermaid
flowchart LR
  subgraph app [excalidraw-app]
    Vite[Vite dev/build]
    AppShell[App.tsx shell]
    JotaiApp[app-jotai store]
  end
  subgraph pkg [packages/excalidraw]
    ExcalidrawComp[Excalidraw component]
    AppCore[components/App]
    JotaiEditor[editor-jotai scope]
    Scene[scene / renderer]
    Actions[actions/*]
  end
  subgraph core [packages/*]
    Common[@excalidraw/common]
    Element[@excalidraw/element]
    Math[@excalidraw/math]
  end
  Vite --> AppShell
  AppShell --> ExcalidrawComp
  ExcalidrawComp --> AppCore
  AppCore --> Scene
  AppCore --> Actions
  Element --> Math
  Element --> Common
  ExcalidrawComp --> Element
  ExcalidrawComp --> Common
  AppShell --> JotaiApp
  AppCore --> JotaiEditor
```

- **Product shell** (`excalidraw-app`) composes **`Excalidraw`** plus dialogs, collaboration UI, and persistence; it uses a **dedicated Jotai store** (`app-jotai.ts` → `createStore()`).
- **Editor core** lives in `packages/excalidraw` (`App`, scene rendering, actions). It uses **`jotai-scope`** isolation (`editor-jotai.ts`) so editor atoms are scoped per embedded instance.
- **Domain split:** **`@excalidraw/element`** (geometry, element ops) and **`@excalidraw/math`** (vectors, curves) depend on **`@excalidraw/common`** (constants, utilities).

_Sources:_ `excalidraw-app/App.tsx`; `excalidraw-app/app-jotai.ts`; `packages/excalidraw/index.tsx`; `packages/excalidraw/editor-jotai.ts`; `packages/element/package.json` dependencies.

## Module resolution in development

- **Vite** and **Vitest** duplicate the same **alias table**: `@excalidraw/*` → **source files** under `packages/*/src` (Excalidraw → `packages/excalidraw/index.tsx`), not only `dist/`. This enables fast HMR and single-repo development.

_Sources:_ `excalidraw-app/vite.config.mts` `resolve.alias`; `vitest.config.mts`; `tsconfig.json` `paths`.

## Library build pattern

- Packages run **`build:esm`** via `scripts/buildBase.js` / `buildPackage.js` (esbuild-based pipeline per scripts folder), then **`gen:types`** (`tsc`) for declaration outputs under `dist/types/...`.
- **Conditional exports:** `"development"` / `"production"` entry points in `@excalidraw/excalidraw` `package.json` `exports`.

_Sources:_ `packages/common/package.json` scripts; `packages/excalidraw/package.json` `exports` and `scripts`.

## State and API patterns

- **Imperative API:** `ExcalidrawAPIProvider` + `useExcalidrawAPI()` allow hooks to run **outside** the inner `<Excalidraw>` tree by bridging API via React context (`packages/excalidraw/index.tsx`).
- **App-level atoms:** `excalidraw-app` defines collaboration-related atoms (`Collab`, `collabAPIAtom`, etc.) consumed from `App.tsx`.
- **Undo/redo:** `packages/excalidraw/history.ts` defines `History` with delta stacks (`HistoryDelta`, undo/redo), integrating with snapshot-style store updates.

_Sources:_ `packages/excalidraw/index.tsx`; `excalidraw-app/App.tsx` imports; `packages/excalidraw/history.ts`.

## UI composition patterns

- **Actions:** User operations are organized as **`actions/*`** modules registered with the editor (toolbar, keyboard shortcuts).
- **Scene rendering:** Dedicated renderer modules (`renderer/*`, `scene/*`) separate **layout/normalization** from **canvas/SVG** output.
- **Radix / CodeMirror:** Editor dependencies include **`radix-ui`** and **`@codemirror/*`** for accessible UI and code/text editing surfaces (`packages/excalidraw/package.json`).

## Data and collaboration (app layer)

- **`reconcileElements`**, **`restoreElements`**, **`loadFromBlob`** — used in `App.tsx` for merging remote/document state and file loads.
- **Socket.io + Firebase** — present at the app dependency level for live sync and cloud-backed flows (implementation under `excalidraw-app/data/*`, `collab` modules).

_Sources:_ `excalidraw-app/App.tsx` imports; `excalidraw-app/package.json`.

## Build output and PWA

- **Production build** writes to **`excalidraw-app/build`** with **manual chunks** for locales (exclude `en.json` / `percentages.json` from locale bundling strategy), **mermaid** chunk, and **CodeMirror** chunk for caching.
- **Service worker:** `virtual:pwa-register` in `excalidraw-app/index.tsx` with `VitePWA` in Vite config.

_Sources:_ `excalidraw-app/vite.config.mts` (`build.outDir`, `manualChunks`, plugins); `excalidraw-app/index.tsx`.

## Testing pattern

- **Vitest** with **jsdom**, **global** test APIs, shared **`setupTests.ts`**, path aliases matching Vite, and **`sequence.hooks: parallel`** for hook concurrency.

_Source:_ `vitest.config.mts`.
