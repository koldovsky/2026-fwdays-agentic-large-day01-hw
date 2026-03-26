# Technical architecture

This document describes how the **Excalidraw** monorepo is structured at runtime: workspaces, editor state, command flow, canvas rendering, and package boundaries. Facts below are taken from the source tree referenced in each section (not from external docs).

**Related context:** [`docs/memory/projectbrief.md`](../memory/projectbrief.md), [`docs/memory/systemPatterns.md`](../memory/systemPatterns.md), [`docs/memory/techContext.md`](../memory/techContext.md), [`docs/memory/productContext.md`](../memory/productContext.md) (UX), [`docs/product/PRD.md`](../product/PRD.md) (requirements), [`docs/product/domain-glossary.md`](../product/domain-glossary.md) (terms used below), [`docs/technical/dev-setup.md`](./dev-setup.md) (run and troubleshoot). Deeper package notes: [`docs/findings/`](../findings/).

---

## High-level architecture

The repository is a **Yarn workspaces** monorepo (`excalidraw-monorepo` in root `package.json`): workspaces include `excalidraw-app`, `packages/*`, and `examples/*`.

| Layer | Role | Primary locations |
|-------|------|-------------------|
| Host application | Vite dev/build, product shell (collab, storage, Sentry, etc.) | `excalidraw-app/` |
| Embed library | React component API, editor class, actions, renderers, data I/O | `packages/excalidraw/` |
| Element domain | `Scene`, `Store`, element types, mutations, `renderElement`, hit tests | `packages/element/` |
| Math | Branded 2D geometry (points, vectors, shapes), pure functions | `packages/math/` |
| Common | Constants, colors (`tinycolor2`), keys, `Emitter`, layout/env helpers | `packages/common/` |
| Utils | Export helpers (`exportToCanvas`, `exportToSvg`, etc.), separate version line | `packages/utils/` |

In development, `excalidraw-app` resolves `@excalidraw/*` packages to **source files** via Vite `resolve.alias` in `excalidraw-app/vite.config.mts` (e.g. `@excalidraw/excalidraw` → `packages/excalidraw/index.tsx`). The app’s `package.json` does not declare `@excalidraw/excalidraw` as a dependency; imports are satisfied by that alias and the monorepo layout.

```mermaid
flowchart TB
  subgraph workspaces [Yarn workspaces]
    APP[excalidraw-app Vite shell]
    EXS[examples]
  end

  subgraph lib [@excalidraw/excalidraw]
    Entry[Excalidraw index.tsx]
    AppC[App class component]
    AM[ActionManager]
    SAR[syncActionResult]
    Rnd[Renderer]
    SC[StaticCanvas InteractiveCanvas]
  end

  subgraph element [@excalidraw/element]
    Scene[Scene]
    Store[Store]
    RE[renderElement and domain logic]
  end

  subgraph support [Shared packages]
    CM[@excalidraw/common]
    MT[@excalidraw/math]
    UT[@excalidraw/utils]
  end

  APP --> Entry
  EXS --> Entry
  Entry --> AppC
  AppC --> Scene
  AppC --> Store
  AppC --> AM
  AppC --> SAR
  AppC --> Rnd
  AppC --> SC
  AM --> SAR
  SAR --> Store
  SAR --> Scene
  Rnd --> Scene
  RE --> MT
  RE --> CM
  Scene --> CM
  Store --> Scene
  element --> CM
  element --> MT
  lib --> CM
  lib --> element
  lib --> MT
  lib -.->|imports e.g. export helpers| UT
```

| Diagram element | What it is (source) |
|-----------------|---------------------|
| `excalidraw-app` | Host app: `excalidraw-app/App.tsx` imports from `@excalidraw/excalidraw` and deeper subpaths. |
| `Excalidraw` / `App` | `packages/excalidraw/index.tsx` composes `EditorJotaiProvider`, `InitializeApp`, and `App` from `components/App.tsx`. |
| `ActionManager` | `packages/excalidraw/actions/manager.tsx` — registers actions, routes keyboard/UI, calls `updater` with `ActionResult`. |
| `syncActionResult` | `App` method in `components/App.tsx` — applies store scheduling, scene elements, files, and React `setState`. |
| `Scene` / `Store` | `packages/element/src/Scene.ts`, `packages/element/src/store.ts` — element graph and change capture. |
| `Renderer` | `packages/excalidraw/scene/Renderer.ts` — viewport culling and memoized renderable element sets. |
| `StaticCanvas` / `InteractiveCanvas` | `packages/excalidraw/components/canvases/` — `useEffect` hooks that invoke `renderStaticScene` / `renderInteractiveScene`. |

### Host shell (`excalidraw-app`)

The product app is a **functional React tree** that embeds the library’s **`Excalidraw`** component and wires host-only behavior (collab, storage, dialogs, analytics).

- **Root export** `ExcalidrawApp` (`excalidraw-app/App.tsx`) wraps the UI in `TopErrorBoundary`, then Jotai **`Provider`** with **`store={appJotaiStore}`** (`excalidraw-app/app-jotai.ts` — `createStore()` from `jotai`), then **`ExcalidrawAPIProvider`**, then **`ExcalidrawWrapper`** which renders **`<Excalidraw ... />`** with props such as `onChange`, `onExport`, `initialData`, `isCollaborating`, `UIOptions`, `renderTopRightUI`, `theme`, etc.
- **Imports** in `excalidraw-app/App.tsx` pull from **`@excalidraw/excalidraw`** (barrel and subpaths), **`@excalidraw/common`**, and **`@excalidraw/element`** — all resolved by Vite aliases to `packages/*` sources.
- **Jotai split:** **`appJotaiStore`** + `Provider` in the host are **separate** from **`EditorJotaiProvider`** / **`editorJotaiStore`** inside the library (`packages/excalidraw/editor-jotai.ts`). The host uses atoms defined under `excalidraw-app/` (e.g. collab-related atoms imported in `App.tsx`); the editor uses its own isolated store for in-editor UI atoms.

---

## Data flow

### Command and mutation path (actions)

1. **Input** (keyboard, context menu, command palette, UI panels, API) reaches `ActionManager` (`actions/manager.tsx`).
2. `ActionManager` calls `action.perform(elements, appState, formData, app)` and passes the result to its **`updater`**, which is wired to **`App.syncActionResult`** in `App`’s constructor (`this.actionManager = new ActionManager(this.syncActionResult, ...)` in `components/App.tsx`).
3. **`syncActionResult`** (`withBatchedUpdates` wrapper in `App.tsx`):
   - Calls `this.store.scheduleAction(actionResult.captureUpdate)` with the action’s `captureUpdate` field (typed as `CaptureUpdateActionType` from `@excalidraw/element`, see `actions/types.ts`).
   - If `actionResult.elements` is set, calls `this.scene.replaceAllElements(actionResult.elements)`.
   - Merges `actionResult.files` via `addMissingFiles` / image cache when present.
   - If `actionResult.appState` (or certain UI fields) requires updates, runs `this.setState` merging partial `appState` with derived fields (e.g. `viewModeEnabled`, `theme`, `editingTextElement`).
   - If nothing flagged an update, calls `this.scene.triggerUpdate()` so subscribers still refresh.

`ActionResult` is defined in `packages/excalidraw/actions/types.ts` as either `false` or an object with optional `elements`, `appState`, `files`, required `captureUpdate`, and optional `replaceFiles`.

### Observation and host callbacks

- **`Store`** (`packages/element/src/store.ts`) exposes `onDurableIncrementEmitter` and `onStoreIncrementEmitter`. In `App` lifecycle setup, `onDurableIncrementEmitter` feeds **`History.record`**, and if `props.onIncrement` is set, `onStoreIncrementEmitter` forwards increments to the host (`components/App.tsx`).
- **`Scene.onUpdate`** is subscribed with `this.triggerRender` so scene-internal updates schedule React re-renders (`components/App.tsx`).

### Serialization and I/O (library)

- JSON, restore, blob, library, and reconcile helpers live under `packages/excalidraw/data/` (consumed by the host app via `@excalidraw/excalidraw/data/*` imports). This document does not enumerate every API; the **editor’s** authoritative live state remains **`Scene` + `App` React state** until exported through those modules.

---

## State management

### `AppState` (React state on `App`)

- `App` is declared as `React.Component<AppProps, AppState>` in `components/App.tsx`; initial defaults come from `getDefaultAppState()` in `appState.ts`.
- `AppState` is a large interface in `types.ts` (tool, selection, dialogs, scroll/zoom, collaboration-related fields, export options, ephemeral editor flags such as `newElement` and `editingTextElement`, etc.).
- Updates happen through **`setState`** and through **`syncActionResult`**, which merges `Partial<AppState>` from actions into previous state (with special handling for controlled props like `viewModeEnabled` / `zenModeEnabled` / `theme` where applicable).

### `UIAppState` and context

- **`UIAppState`** (`types.ts`) is `AppState` **omitting** `startBoundElement`, `cursorButton`, `scrollX`, and `scrollY` — so UI subtrees can subscribe without re-rendering on every pointer/scroll change.
- `context/ui-appState.ts` supplies `UIAppStateContext` / `useUIAppState` for components that read this reduced surface.

### Elements: `Scene` (`@excalidraw/element`)

- **`Scene`** (`packages/element/src/Scene.ts`) holds the **ordered element list** and maps (including deleted entries), selection-related caches, and frame metadata; it imports **`AppState`** from `../../excalidraw/types` for selection APIs.
- Public-facing mutations from the editor include **`replaceAllElements`**, **`mutateElement`**, **`insertElement`**, **`triggerUpdate`**, and queries such as **`getNonDeletedElements`**, **`getSelectedElements`**, **`getSceneNonce`** (used as a render cache key).
- **Elements are not stored only in React state**; the canonical graph for the running editor is **`Scene`**, while **`AppState`** holds UI/editor flags and selection ids that reference those elements.

### `Store` and `CaptureUpdateAction` (`@excalidraw/element`)

- **`Store`** is constructed as `new Store(this)` where `this` is the `App` instance (`components/App.tsx`). Its constructor signature is `constructor(private readonly app: App)` in `packages/element/src/store.ts`.
- **`CaptureUpdateAction`** (`store.ts`) is a const object with three string values, documented inline:
  - **`IMMEDIATELY`** — normal captured edits; durable undo steps.
  - **`NEVER`** — never undoable (e.g. remote init).
  - **`EVENTUALLY`** — batched / async flows; merged into history with later **`IMMEDIATELY`** / internal commits per store logic.
- `Store.scheduleAction` records macro capture policy; `syncActionResult` always passes `actionResult.captureUpdate` into `scheduleAction`.
- The store compares snapshots and emits increments; durable increments drive **`History`** via `onDurableIncrementEmitter` in `App` setup.

### `ActionManager`

- **Construction** (`components/App.tsx`): `new ActionManager(this.syncActionResult, () => this.state, () => this.scene.getElementsIncludingDeleted(), this)`.
- **Role** (`actions/manager.tsx`):
  - **`registerAction` / `registerAll`** populate `actions` by `ActionName`.
  - **`handleKeyDown`** resolves at most one matching action (sorted by `keyPriority`), respects `viewModeEnabled` and `UIOptions.canvasActions`, then `perform`s and forwards to **`updater`**.
  - **`executeAction`** is the imperative entry for API/tooling with optional `ActionSource` and form value.
  - **`renderAction`** renders `PanelComponent` for toolbar/UI; panel callbacks call **`updater`** with `perform` results.
- **`updater`** unwraps promise-like results (`isPromiseLike` from `@excalidraw/common`) before calling the underlying `syncActionResult`.

### Jotai (`editor-jotai.ts`)

- Uses **`jotai-scope`** `createIsolation()` so hooks (`useAtom`, etc.) are scoped per provider; **`EditorJotaiProvider`** is exported from `editor-jotai.ts`.
- A dedicated **`editorJotaiStore`** is created with Jotai’s **`createStore()`** for imperative updates.
- `index.tsx` wraps the editor tree with **`EditorJotaiProvider`**. This layer holds **small, editor-local atoms** (e.g. UI popups read via `editorJotaiStore.get(...)` in `App.render`); it is **not** the source of truth for the element graph or full `AppState`.

### Imperative API and external React trees

- **`ExcalidrawAPIProvider`** (`index.tsx`) holds `ExcalidrawImperativeAPI` in context for hooks outside the main tree.
- Hooks in `hooks/useAppStateValue.ts` (re-exported from `index.tsx`) subscribe via **`api.onStateChange`** with selectors, reducing rerenders compared to full `App` state propagation.

---

## Rendering pipeline: React to canvas

### 1. React render phase (`App.render`)

- On each render, `App` computes **`selectedElements`** via `this.scene.getSelectedElements(this.state)` and **`sceneNonce`** via `this.scene.getSceneNonce()`.
- It calls **`this.renderer.getRenderableElements({...})`** (`scene/Renderer.ts`) with zoom, offsets, scroll, viewport size, `editingTextElement`, `newElementId`, and **`sceneNonce`**. The method returns **`elementsMap`** (renderable subset) and **`visibleElements`** (viewport-culled via `isElementInViewport` from `@excalidraw/element`).
- **`allElementsMap`** comes from `this.scene.getNonDeletedElementsMap()`.
- These values are passed as props to **`StaticCanvas`**, optional **`NewElementCanvas`**, and **`InteractiveCanvas`** (`components/App.tsx`).

### 2. In-progress element layer (`NewElementCanvas`)

- When **`this.state.newElement`** is set, `App.render` also mounts **`NewElementCanvas`** (`components/canvases/NewElementCanvas.tsx`).
- That component owns a **separate `<canvas>`** (ref) and, in `useEffect`, calls **`renderNewElementScene`** from `renderer/renderNewElementScene.ts`, passing `appState.newElement`, the same **`elementsMap`** / **`allElementsMap`**, Rough **`rc`**, **`StaticCanvasRenderConfig`**, and full **`appState`**. The second argument is **`isRenderThrottlingEnabled()`**, matching the static canvas pattern (throttled RAF path when enabled).
- **`renderNewElementScene`** uses **`renderElement`** and frame-clipping helpers from **`@excalidraw/element`** (see imports at top of `renderNewElementScene.ts`) so the stroke-in-progress is drawn without treating it as committed document content in the main static pass (the main **`Renderer.getRenderableElements`** skips the element whose id equals **`newElementId`**).

### 3. Static layer (`StaticCanvas`)

- **`StaticCanvas`** (`components/canvases/StaticCanvas.tsx`) in a `useEffect`:
  - Sizes the canvas element from `appState.width` / `height` and `scale` (`devicePixelRatio`).
  - Inserts the canvas into a wrapper div and calls **`renderStaticScene`** from `renderer/staticScene.ts`, passing `canvas`, Rough.js **`rc`**, `elementsMap`, `allElementsMap`, `visibleElements`, a **`StaticCanvasAppState`**-shaped slice, and **`StaticCanvasRenderConfig`** (image cache, grid, theme, embed validation, etc.).
  - The third argument is **`isRenderThrottlingEnabled()`** from `reactUtils` — when true, `renderStaticScene` delegates to **`renderStaticSceneThrottled`** (`throttleRAF` in `staticScene.ts`).

### 4. Interactive layer (`InteractiveCanvas`)

- **`InteractiveCanvas`** (`components/canvases/InteractiveCanvas.tsx`) calls **`renderInteractiveScene`** from `renderer/interactiveScene.ts` inside `useEffect`, with **`InteractiveCanvasAppState`**, selection handles, collaborators, snap lines, and other overlay data.
- **`interactiveScene.ts`** imports geometry from **`@excalidraw/math`** and element helpers from **`@excalidraw/element`** (e.g. transform handles, selection rendering).

### 5. Shared drawing primitive

- **`renderElement`** from **`@excalidraw/element`** is invoked from **`staticScene.ts`** (and related paths) to draw each element with Rough.js and theme-dependent options. Static scene comments in `staticScene.ts` describe it as the layer where **document content** is drawn (as opposed to UI overlays).

### 6. Type-level split: which `AppState` fields go where

- **`StaticCanvasAppState`** and **`InteractiveCanvasAppState`** (`types.ts`) extend a shared **`_CommonCanvasAppState`** (zoom, scroll, dimensions, offsets, theme, selection ids for static concerns, etc.) and then add **disjoint** fields: e.g. static side includes grid and `viewBackgroundColor`; interactive side includes `activeTool`, `selectionElement`, `snapLines`, `collaborators`, etc.

### 7. `Renderer` lifecycle

- **`Renderer.destroy`** (`scene/Renderer.ts`) cancels **`renderStaticSceneThrottled`** and clears the memo cache for `getRenderableElements`.

---

## Package dependencies and interconnections

### Declared `dependencies` in `package.json` (runtime npm graph)

| Package | Depends on |
|---------|------------|
| `@excalidraw/common` | `tinycolor2` |
| `@excalidraw/math` | `@excalidraw/common` |
| `@excalidraw/element` | `@excalidraw/common`, `@excalidraw/math` |
| `@excalidraw/excalidraw` | `@excalidraw/common`, `@excalidraw/element`, `@excalidraw/math`, plus UI/libs (e.g. `roughjs`, `jotai`, `jotai-scope`, CodeMirror, Radix, etc. per `packages/excalidraw/package.json`) |
| `@excalidraw/utils` | `roughjs`, `pako`, PNG helpers, `@braintree/sanitize-url`, etc. (`packages/utils/package.json`) |

Root **`package.json`** script **`build:packages`** runs **`build:common` → `build:math` → `build:element` → `build:excalidraw`** and does **not** include a `build:utils` step (utils is built via its own `build:esm` / `scripts/buildUtils.js` when needed; see [`docs/memory/techContext.md`](../memory/techContext.md)).

### Source-level coupling (not always repeated in `dependencies`)

- **`packages/element/src/Scene.ts`** imports **`AppState`** from **`../../excalidraw/types`** — the element package’s TypeScript sources reference the editor’s state type for selection and related APIs.
- **`packages/element/src/store.ts`** types the constructor with **`App`** from **`@excalidraw/excalidraw/components/App`** — the store is explicitly tied to the editor host class.
- **`packages/common`** uses **`import type`** from element/excalidraw in several modules (e.g. shared constants typed against `AppState` / elements); see [`docs/findings/common-package-architecture.md`](../findings/common-package-architecture.md).

### Embed package surface (`@excalidraw/excalidraw` exports)

- `packages/excalidraw/package.json` **`exports`** include subpaths **`./common/*`**, **`./element/*`**, **`./math/*`**, **`./utils/*`** (types and dev/prod JS), so consumers can import from the published package namespace without separate installs for those type surfaces.

### Application vs library state libraries

- **`jotai`** appears in both **`excalidraw-app/package.json`** (host) and **`packages/excalidraw/package.json`** (editor-scoped atoms). They serve **different scopes**: app-level concerns in the host vs `EditorJotaiProvider` / `editorJotaiStore` in the library.

---

## File index (primary references)

| Topic | Path |
|-------|------|
| Monorepo workspaces | `package.json` |
| Vite aliases (app → packages) | `excalidraw-app/vite.config.mts` |
| Host app root + `Excalidraw` props | `excalidraw-app/App.tsx` |
| Host Jotai store | `excalidraw-app/app-jotai.ts` |
| Public `Excalidraw` wrapper | `packages/excalidraw/index.tsx` |
| Editor core | `packages/excalidraw/components/App.tsx` |
| Actions and manager | `packages/excalidraw/actions/types.ts`, `packages/excalidraw/actions/manager.tsx` |
| Canvas components | `packages/excalidraw/components/canvases/StaticCanvas.tsx`, `NewElementCanvas.tsx`, `InteractiveCanvas.tsx` |
| Static / interactive / new-element renderers | `packages/excalidraw/renderer/staticScene.ts`, `interactiveScene.ts`, `renderNewElementScene.ts` |
| Viewport culling helper | `packages/excalidraw/scene/Renderer.ts` |
| App state types | `packages/excalidraw/types.ts`, `packages/excalidraw/appState.ts` |
| Scene | `packages/element/src/Scene.ts` |
| Store / capture policy | `packages/element/src/store.ts` |
| Jotai scope | `packages/excalidraw/editor-jotai.ts` |

---

*Document generated from the repository source at the time of writing; verify behavior against the cited paths when upgrading or refactoring.*
