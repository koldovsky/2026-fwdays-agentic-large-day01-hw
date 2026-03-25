# System patterns

## Details

For detailed architecture → see [docs/technical/architecture.md](../technical/architecture.md)  
For domain glossary → see [docs/product/domain-glossary.md](../product/domain-glossary.md)

## Repo / module architecture

- **Yarn workspaces monorepo** (root `package.json`):
  - **App**: `excalidraw-app/`
  - **Packages**: `packages/*`
  - **Examples**: `examples/*`
- **TypeScript path-alias “workspace imports”** (root `tsconfig.json`):
  - `@excalidraw/common` → `packages/common/src/index.ts`
  - `@excalidraw/element` → `packages/element/src/index.ts`
  - `@excalidraw/math` → `packages/math/src/index.ts`
  - `@excalidraw/utils` → `packages/utils/src/index.ts`
  - `@excalidraw/excalidraw` → `packages/excalidraw/index.tsx`

## “Develop against source” pattern

- **App uses package source directly** while developing:
  - `excalidraw-app/vite.config.mts` defines `resolve.alias` rules mapping `@excalidraw/*` imports to `../packages/*/src` (and `../packages/excalidraw/index.tsx`).
  - This avoids publishing/packing to iterate locally and keeps a single source of truth.

## Packages as ESM with explicit exports maps

- `packages/excalidraw/package.json`:
  - `"type": "module"` and `exports` map for `.` + typed subpaths + CSS entry (`./index.css`).
  - **Deep subpaths are primarily typed entrypoints** (exports include `"types": ...`), while runtime entry stays at `.`.
- Pattern encourages **stable public API surface** and better bundler compatibility.

## App build: static assets + caching-aware chunking

- **Static SPA build**:
  - Vite outputs to `excalidraw-app/build` (`build.outDir`).
  - Docker image serves the built files via nginx (`Dockerfile` final stage).
- **Manual chunking for long-lived assets** (`excalidraw-app/vite.config.mts`):
  - Locales are chunked separately (except `en`/`percentages`) to support caching/offline behavior.
  - Dedicated chunks for heavy deps (e.g. CodeMirror / Lezer, Mermaid integration).
- **PWA pattern**:
  - `VitePWA` is configured with explicit Workbox runtime caching for fonts, locales, and chunk JS.

## Canvas rendering pipeline

- **Two-canvas model (static vs. interactive)**:
  - **Static layer (scene canvas)**: `packages/excalidraw/components/canvases/StaticCanvas.tsx` calls `renderStaticScene()` from `packages/excalidraw/renderer/staticScene.ts` to paint the *elements* (plus some non-interactive adornments like link icons).
  - **Scene/UI layer (interactive canvas)**: `packages/excalidraw/components/canvases/InteractiveCanvas.tsx` drives `renderInteractiveScene()` from `packages/excalidraw/renderer/interactiveScene.ts` to paint selections, transform handles, collaborators’ cursors, scrollbars, binding highlights, etc.
- **Invalidation and scheduling**:
  - React memoization uses `sceneNonce` / `selectionNonce` (and selective `AppState` slices) as the primary invalidation signals to avoid rerendering canvases on unrelated state changes.
  - Static rendering can be **throttled to animation frames** via `renderStaticSceneThrottled` (a `throttleRAF` wrapper) and can be globally influenced via `window.EXCALIDRAW_THROTTLE_RENDER`.
  - Interactive rendering runs under `AnimationController` (see `InteractiveCanvas.tsx`) and continually re-renders while there’s active animation state (e.g. binding highlight timers), otherwise it’s effectively idle.
- **DPI / scale handling**:
  - Canvases are sized in *CSS pixels* and backed by a larger *bitmap* (`canvas.width/height`) multiplied by a scale factor (typically `window.devicePixelRatio`), with `bootstrapCanvas()` normalizing the drawing context accordingly.
  - Both renderers apply zoom by scaling the context with `appState.zoom.value`, keeping logical scene coordinates stable across zoom levels.
- **Bitmap caching hotspots**:
  - The renderer uses targeted bitmap caches where it matters (for example link icon canvases cached by zoom in `staticScene.ts`), while other caching is handled by element/render utilities (e.g. shape caches in `@excalidraw/element`).

## Element lifecycle / model

- **Element model shape**:
  - The core persisted unit is `ExcalidrawElement` (`packages/element/src/types.ts`): a JSON-serializable, readonly object with stable identity (`id`) and geometry (`x`, `y`, `width`, `height`, `angle`), style props, and collaboration/ordering metadata (`version`, `versionNonce`, fractional `index`, `updated`, `isDeleted`, `groupIds`, `frameId`, `boundElements`, `customData`).
- **Lifecycle states (editor-driven)**:
  - **Created**: elements are instantiated via constructors/utilities in `@excalidraw/element` (e.g. `newElement*`, `newElementWith`) and inserted into the scene; new elements may exist transiently as `appState.newElement` / `appState.multiElement` while the pointer interaction continues.
  - **Editing**: editing state is modeled primarily in `AppState` rather than on elements:
    - Text edits use `appState.editingTextElement`.
    - Linear editing uses `appState.selectedLinearElement.isEditing` (plus point/segment selection state).
  - **Committed**: when an interaction is finalized (commonly via the `finalize` action), the resulting element array + appState are applied and captured into history depending on `captureUpdate`.
- **Hit-testing and transforms**:
  - Hit-testing and selection logic lives in `@excalidraw/element` helpers such as `hitElementItself`, `hitElementBoundingBox(Only)`, and related geometry utilities, which are used throughout interactive rendering and pointer handling.
  - Transforms (resize/rotate/move) are applied via element/scene helpers (`transformElements`, `mutateElement`, `newElementWith`) and use transform handle geometry from `getTransformHandles*` utilities.
- **Persistence / serialization hooks**:
  - Scene export/import: `serializeAsJSON()` (`packages/excalidraw/data/json.ts`) + `loadFromBlob()` (`packages/excalidraw/data/blob.ts`), with `restoreElements()` / `restoreAppState()` (`packages/excalidraw/data/restore.ts`) normalizing incoming data.
  - Collaboration reconciliation uses `reconcileElements()` (`packages/excalidraw/data/reconcile.ts`) on top of versioning metadata.

## Action dispatch / perform flow

- **Action registry and dispatch**:
  - The editor owns an `ActionManager` (`packages/excalidraw/actions/manager.tsx`) which registers all actions plus undo/redo, and dispatches them from **UI**, **keyboard shortcuts**, **context menus**, **command palette**, or **host API** (via `executeAction()`).
  - Actions are pure-ish reducers in the sense that `action.perform(elements, appState, formData, app)` returns an `ActionResult` (or a `Promise<ActionResult>`) describing the next `{ elements, appState, files }` plus a required `captureUpdate` policy.
- **Optimistic vs. confirmed updates**:
  - **Synchronous actions** apply immediately via `App.syncActionResult()`, updating the scene and React state in a batched way and scheduling a history/store capture according to `captureUpdate`.
  - **Async actions** are supported by returning a promise from `perform()`: `ActionManager` awaits it and only then applies the resulting `ActionResult`, meaning the “confirmed” update lands when the promise resolves (any “optimistic” UI needs to be expressed as an earlier synchronous update/result).
- **Undo/redo integration**:
  - `captureUpdate` controls how (and whether) the `Store/History` captures the update (`App.syncActionResult()` calls `store.scheduleAction(captureUpdate)`), and undo/redo are implemented as registered actions bound to the `History` instance.
- **How actions flow between `ExcalidrawAPIProvider` and the app shell**:
  - `ExcalidrawAPIProvider` (in `packages/excalidraw/index.tsx`) exposes the imperative API instance via context so the *app shell* (e.g. `excalidraw-app/App.tsx`) can call editor operations even outside the `<Excalidraw />` subtree.
  - The app shell typically interacts via the **imperative API** (`updateScene()`, `addFiles()`, etc.) and editor hooks (`useExcalidrawAPI()`), while in-editor UI and shortcuts route through `ActionManager.executeAction()` to ensure consistent state + history capture semantics.

## UI composition: “library core + app shell”

- **Library**: `@excalidraw/excalidraw` provides the embeddable `<Excalidraw />` component and related API/provider utilities.
  - Example pattern: `ExcalidrawAPIProvider` enables hooks like `useExcalidrawAPI()` outside the component tree (see `packages/excalidraw/index.tsx`).
- **App shell**: `excalidraw-app/App.tsx` composes the library’s primitives + app-specific integrations:
  - Collaboration, persistence, dialogs/menus, analytics, and external services.
  - This keeps the reusable canvas/editor logic in the package and the “product” concerns in the app.

## Cross-cutting concerns via shared `common` package

- `packages/common/src/index.ts` re-exports shared utilities/constants (e.g. event bus, editor interface helpers).
- This supports a pattern of **single shared foundation** reused by both:
  - The published `@excalidraw/excalidraw` package
  - The `excalidraw-app` product shell

## Environment/config injection pattern

- Package build scripts (e.g. `scripts/buildPackage.js`) inject environment variables into `import.meta.env` for dev/prod builds.
- App config loads env from repo root via `loadEnv(mode, "../")` and uses `envDir: "../"` (`excalidraw-app/vite.config.mts`).
