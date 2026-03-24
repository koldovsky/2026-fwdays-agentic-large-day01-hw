# System patterns and architecture

## Monorepo structure

- **Root** orchestrates workspaces (`package.json` `workspaces`): **`excalidraw-app`**, **`packages/*`**, **`examples/*`**.
- **Packages** are built as ESM (`build:esm` in each package; root `build:packages` chains **common → math → element → excalidraw**).
- **`@excalidraw/excalidraw`** aggregates UI, re-exports types for subpaths (`exports` in `packages/excalidraw/package.json`), and depends on **`@excalidraw/common`**, **`@excalidraw/element`**, **`@excalidraw/math`**.

## Editor application shell (`packages/excalidraw`)

### Entry and providers

- **`index.tsx`** exports the main React component: wraps with **`EditorJotaiProvider`** (`editor-jotai.ts` + `editorJotaiStore`), **`InitializeApp`** (language loading), then **`App`** (`components/App.tsx`).
- **`ExcalidrawAPIProvider`** (same file) uses React context so **`useExcalidrawAPI`** / **`useAppStateValue`** work outside the inner tree when needed.

### `App` class component — orchestrator

- **`App`** extends `React.Component<AppProps, AppState>` — central controller (`components/App.tsx`).
- Holds **`Scene`**, **`Store`**, **`History`**, **`ActionManager`**, **`Renderer`**, **`Library`**, **`Fonts`**, image cache, rough.js canvas refs, and builds **`ExcalidrawImperativeAPI`** (`updateScene`, `getAppState`, `onStateChange`, etc.).
- **`Store`** and **`Scene`** are imported from **`@excalidraw/element`** (see imports in `App.tsx`); **`Renderer`** lives under **`packages/excalidraw/scene/Renderer.ts`** and performs viewport-related renderable element selection using scene data.

### State management split

| Layer | Pattern | Purpose |
|-------|---------|---------|
| **UI / interaction** | React **`AppState`** on `App` (`setState` / `setAppState`); defaults in **`appState.ts`**. | Tool, selection, scroll/zoom, dialogs, theme, etc. |
| **Document elements** | **`Store`** + **`Scene`** (`@excalidraw/element`) + **`History`**. | Elements, undo/redo, incremental updates. |
| **Commands** | **`ActionManager`** + **`actions/*`**. | Keyboard shortcuts and menu actions; **`perform`** flows update store/scene and app state via **`syncActionResult`**. |
| **Scoped UI atoms** | **Jotai** + **`jotai-scope`** in **`editor-jotai.ts`**; small atoms in components (e.g. sidebar, library menu). | Local UI flags without bloating core `AppState`. |
| **Embedding hooks** | **`AppStateObserver`** + **`api.onStateChange`**; **`hooks/useAppStateValue.ts`**. | Selective subscriptions for host apps. |

### React context graph (inside `App` render)

- Providers include **`ExcalidrawAPIContext`**, **`AppContext`** (the `App` instance), **`ExcalidrawAppStateContext`**, **`ExcalidrawElementsContext`**, **`ExcalidrawActionManagerContext`**, **`ExcalidrawSetAppStateContext`**, container and editor-interface contexts — defined and nested in `components/App.tsx` render.

### UI composition

- **`LayerUI`** — toolbars, footers, sidebars, dialogs, stats; uses **tunnel-rat** via **`context/tunnels.ts`** for portal-style extension points (`MainMenuTunnel`, `FooterCenterTunnel`, etc.).
- **Canvas stack** — **`StaticCanvas`** (main draw), optional **`NewElementCanvas`** when creating an element, **`InteractiveCanvas`** (pointer routing, interactive overlay); **`SVGLayer`** for transient trails (laser, lasso, eraser).

### Rendering pipeline

- **`renderer/`** — `staticScene`, `interactiveScene`, snaps, SVG helpers — called from canvas components.
- **`Scene` (element)** holds elements; **`Renderer` (excalidraw package)** filters by viewport for canvas work.

### Cross-cutting subsystems (under `packages/excalidraw/`)

- **`data/`** — JSON/blob load/save, export pipeline (`data/index.ts` and siblings).
- **`wysiwyg/`** — in-canvas text editing.
- **`snapping/`**, **`lasso/`**, **`eraser/`**, **`laser-trails/`** — interaction-specific logic used from `App`.

## Full app (`excalidraw-app`)

- **Vite**-driven SPA: **`start`** runs `vite`; **`build`** runs `vite build` plus version script (`excalidraw-app/package.json`).
- Adds **collaboration / analytics / storage** concerns via its own dependencies (Firebase, Socket.IO, Sentry, etc.) — wired in app code, not in the core `packages/excalidraw` API surface alone.

## Testing pattern

- **Vitest** at repo root (`test:app`); canvas testing support via **`vitest-canvas-mock`** in root `devDependencies`.

## Details

- For detailed architecture → see [docs/technical/architecture.md](../technical/architecture.md)
- For domain glossary → see [docs/product/domain-glossary.md](../product/domain-glossary.md)
