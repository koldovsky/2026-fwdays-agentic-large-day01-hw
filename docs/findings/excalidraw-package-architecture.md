# `@excalidraw/excalidraw` — package architecture

This document summarizes how the `packages/excalidraw/` package is structured: modules, state, rendering, and how the main UI shell relates to the canvas engine. It is intended as a baseline for describing recurring architectural patterns in this repository.

---

## 1. Role and boundaries

| Aspect | Description |
|--------|-------------|
| **Purpose** | Embeddable React whiteboard: canvas editing, UI chrome, persistence hooks, export. |
| **Published name** | `@excalidraw/excalidraw` (see `package.json`). |
| **Peer deps** | React / React DOM. |
| **Workspace siblings** | `@excalidraw/common`, `@excalidraw/element`, `@excalidraw/math`, `@excalidraw/utils` — geometry, element model, scene, mutations, and helpers live there; this package orchestrates them in a React/class-component shell. |

The package is both a **library entry** (`index.tsx` exports `Excalidraw`, APIs, restore/export helpers) and a **large in-repo application core** (`components/App.tsx` is a monolithic class component).

---

## 2. Top-level module map

| Area | Path (under `packages/excalidraw/`) | Responsibility |
|------|-------------------------------------|----------------|
| **Public API & shell** | `index.tsx` | `Excalidraw` wrapper, `EditorJotaiProvider`, `InitializeApp`, default chrome (menu, footer, welcome), exports. |
| **Editor host** | `components/App.tsx` | Class component: owns `Scene`, `Store`, `History`, `ActionManager`, canvas, pointer/keyboard pipeline, imperative API. |
| **Commands** | `actions/` | Declarative actions (`Action` type), `register.ts` side-effect registration, `ActionManager` dispatches and keyboard routing. |
| **App & UI state types / defaults** | `types.ts`, `appState.ts` | `AppState`, `UIAppState`, canvas-specific state slices, defaults, storage export rules. |
| **Undo/redo** | `history.ts` | `History` + `HistoryDelta` bridging `@excalidraw/element` store deltas to `AppState`. |
| **Jotai (scoped)** | `editor-jotai.ts` | Isolated Jotai store for editor-local atoms; `updateEditorAtom` triggers render from `App`. |
| **Scene helpers (package-local)** | `scene/` | Scroll, zoom normalization, `Renderer` (viewport culling + throttled static render scheduling). |
| **Canvas draw** | `renderer/` | `staticScene.ts`, `interactiveScene.ts`, helpers — actual 2D drawing and overlays. |
| **Persistence & I/O** | `data/` | JSON, blob load/save, library, restore/reconcile, filesystem hooks. |
| **UI components** | `components/` | Menus, dialogs, sidebars, stats, TTD/Mermaid, command palette, etc. |
| **Cross-cutting** | `hooks/`, `context/`, `i18n/`, `locales/`, `css/`, `fonts/`, `analytics.ts` | Subscriptions to imperative API, `UIAppStateContext`, translations, styles, font loading, telemetry. |
| **Specialized tools** | `charts/`, `lasso/`, `eraser/`, `wysiwyg/`, `subset/` | Chart parsing, selection modes, text editing, font subsetting / WOFF2. |
| **Tests** | `tests/` | RTL and integration-style tests. |

---

## 3. State management — layers

### 3.1 `AppState` (React state on `App`)

- **Location**: `App` extends `React.Component<AppProps, AppState>`; defaults from `getDefaultAppState()` in `appState.ts`.
- **Contents**: Tooling, selection, dialogs, scroll/zoom, theme, collaboration maps, ephemeral editor flags (e.g. `newElement`, `editingTextElement`), export options, etc.
- **Updates**: `setState`, often batched via helpers; **`syncActionResult`** applies `ActionResult` (elements + partial `appState` + files) after actions.

### 3.2 `Scene` (element graph — `@excalidraw/element`)

- **Instance**: `this.scene = new Scene()` in `App`’s constructor.
- **Role**: Authoritative **ordered element list** and maps (including deleted), selection helpers, `mutateElement` / `replaceAllElements`, `triggerUpdate` for subscribers.
- **Note**: Scene types and implementation live in `packages/element`; the excalidraw package imports `Scene` from `@excalidraw/element`.

### 3.3 `Store` + snapshots and deltas (`@excalidraw/element`)

- **Instance**: `this.store = new Store(this)` — `Store` holds a reference to `App`.
- **Role**: Tracks **observed** changes between commits, emits **increments** (`onStoreIncrementEmitter`, `onDurableIncrementEmitter`), and coordinates **`CaptureUpdateAction`** semantics:
  - `IMMEDIATELY` — normal user edits → durable undo steps.
  - `NEVER` — remote init, etc. — not undoable.
  - `EVENTUALLY` — batched / async flows.
- **`syncActionResult`** calls `this.store.scheduleAction(actionResult.captureUpdate)` so each action declares how the change affects history.

### 3.4 `History`

- **Instance**: `this.history = new History(this.store)`.
- **Role**: Undo/redo stacks of **`HistoryDelta`** (element + `AppState` deltas). Registered undo/redo actions are added in `App` after bulk `registerAll(actions)`.

### 3.5 Jotai (`editor-jotai.ts`)

- **Scope**: `jotai-scope` **isolation** + dedicated `createStore()` so multiple editors do not clash.
- **Usage**: Small, editor-scoped UI/state atoms; `App.updateEditorAtom` writes through `editorJotaiStore` and calls `triggerRender()`.
- **Not** the primary source of truth for the scene — that remains **Scene + AppState**.

### 3.6 `UIAppState` context

- **`context/ui-appState.ts`**: `UIAppStateContext` / `useUIAppState`.
- **`UIAppState` type** (`types.ts`): `AppState` minus a few canvas-low-level fields (`scrollX`/`scrollY`, `cursorButton`, `startBoundElement`) so UI trees avoid over-subscribing to pointer-driven noise.

### 3.7 External / host integration

- **`ExcalidrawAPIContext`**: Imperative `ExcalidrawImperativeAPI` (get/update scene, `onStateChange` subscriptions, etc.).
- **`useAppStateValue` / `useOnAppStateChange`**: Subscribe to `api.onStateChange` with selectors — decouples React children from full `App` rerenders.

---

## 4. Command model: actions → `syncActionResult`

| Piece | Behavior |
|-------|----------|
| **Registration** | Modules call `register(action)` in `actions/register.ts`; `App` constructor runs `actionManager.registerAll(actions)` plus undo/redo. |
| **`Action` shape** | Pure(ish) function: `(elements, appState, formData, app) => ActionResult \| false`; `ActionResult` includes optional `elements`, `appState`, `files`, `captureUpdate`, etc. (`actions/types.ts`). |
| **`ActionManager`** | Resolves keyboard shortcuts, context menu, command palette; calls `action.perform` and forwards result to **`updater`** = `syncActionResult`. |
| **`syncActionResult`** | Schedules store capture, applies `scene.replaceAllElements` when needed, merges `appState`, handles files/image cache, then `setState`. |

This is a **unidirectional command pipeline**: UI and input produce **declared deltas**, not ad hoc scattered mutations (though low-level pointer handlers still call `scene.mutateElement` and related APIs directly inside `App`).

---

## 5. Main components and relationships

| Component / unit | Relationship |
|------------------|--------------|
| **`Excalidraw` (`index.tsx`)** | Memoized wrapper: normalizes `UIOptions`, wraps **`EditorJotaiProvider`** → **`InitializeApp`** → **`App`**; optional `ExcalidrawAPIProvider` for out-of-tree hooks. |
| **`App`** | Central **façade**: owns scene, store, history, action manager, rough.js canvas, `Renderer`, fonts, library; exposes **imperative API**; renders layout + canvas + portals. |
| **`Renderer` (`scene/Renderer.ts`)** | Uses **`Scene`** to compute **visible / renderable** element sets (memoized); drives **`renderStaticSceneThrottled`** from `renderer/staticScene.ts`. |
| **Static vs interactive canvas** | **`staticScene`** draws document content; **`interactiveScene`** draws handles, selection, alignment aids — fed different **`AppState` slices** (`StaticCanvasAppState` vs `InteractiveCanvasAppState` in `types.ts`). |
| **Chrome `components/`** | Menus, dialogs, sidebars consume **`useAppStateValue`**, **`useUIAppState`**, or **`useExcalidrawAPI`**; they invoke **`actionManager`** or API methods rather than touching `Scene` directly. |

---

## 6. End-to-end runtime architecture (single diagram)

The following diagram ties entry, state layers, commands, rendering, and host callbacks.

```mermaid
flowchart TB
  subgraph entry [Public entry]
    Excalidraw[Excalidraw index.tsx]
    JotaiProv[EditorJotaiProvider]
    Init[InitializeApp]
  end

  subgraph core [Editor core — App class]
    AM[ActionManager]
    SAR[syncActionResult]
    RS[React AppState]
    Scene[Scene element graph]
    Store[Store snapshots and deltas]
    Hist[History undo or redo]
    Rnd[Renderer]
    CV[Canvas static plus interactive layers]
  end

  subgraph workspace [@excalidraw packages]
    ElPkg[element — Scene Store deltas mutations renderElement]
    Cm[common — math events constants]
    Mt[math]
  end

  subgraph host [Host app]
    Props[ExcalidrawProps onChange onIncrement]
    API[ExcalidrawImperativeAPI]
  end

  Excalidraw --> JotaiProv --> Init --> AppClass[App]
  AppClass --> RS
  AppClass --> Scene
  AppClass --> Store
  AppClass --> Hist
  AppClass --> AM
  AppClass --> Rnd
  Rnd --> CV
  AM --> SAR
  SAR --> Store
  SAR --> Scene
  SAR --> RS
  Store --> Hist
  Scene --- ElPkg
  Store --- ElPkg
  Rnd --- ElPkg
  AppClass --- Cm
  AppClass --- Mt
  AppClass --> Props
  AppClass --> API
  Store -.->|onStoreIncrementEmitter| Props
```

---

## 7. Data flow and persistence

| Concern | Location | Notes |
|---------|----------|-------|
| **Serialize / deserialize** | `data/json.ts`, `data/restore.ts` | Scene + `AppState` restoration; `appState.ts` storage config strips non-persistent keys. |
| **Blobs & files** | `data/blob.ts`, `data/filesystem.ts` | Load/save, images, library blobs. |
| **Library** | `data/library.ts`, `Library` used from `App` | Item storage and UI integration. |
| **Reconciliation** | `data/reconcile.ts` (exported from package) | Merge strategies for multi-source element lists (e.g. collaboration). |

Host apps typically listen to **`onChange(elements, appState, files)`** and/or **`onIncrement`** for efficient sync; the package does not mandate a specific transport.

---

## 8. Other aspects worth documenting (pattern baseline)

Use this as a checklist for future “common patterns” docs or ADRs:

1. **Class-component core + functional UI** — Why `App` remains a class (imperative surface, lifecycle, stable refs) vs functional subtree.
2. **Dual canvas rendering** — Static vs interactive state slices, cache invalidation, `shouldCacheIgnoreZoom`, frame clipping.
3. **Performance tactics** — Throttled static render, viewport culling, `withBatchedUpdates`, selective subscriptions via `onStateChange`.
4. **Action registration as side effects** — Global `actions` array in `register.ts`; ordering and tree-shaking implications.
5. **Type-driven storage** — `APP_STATE_STORAGE_CONF` mapping keys to browser/export/server retention.
6. **Testing strategy** — `tests/` layout, fixtures, mocking (`helpers/mocks.ts`, `helpers/ui.ts`).
7. **Build / exports map** — `package.json` `exports` for `./element/*`, `./common/*`, etc.; consumers importing subpaths vs barrel.
8. **Accessibility & i18n** — `locales/`, `Trans`, keyboard action priority in `ActionManager`.
9. **Third-party UI** — Radix, CodeMirror (TTD), `tunnel-rat` patterns where used.
10. **Security** — `@braintree/sanitize-url`, embed validation props (`validateEmbeddable`, `renderEmbeddable`).

---

## 9. Summary

- **`@excalidraw/excalidraw`** is a **React shell** around a **class-based editor** that owns **`Scene` (elements)**, **`AppState` (UI/editor)**, **`Store`/`History` (undo and change capture)**, and **canvas renderers**.
- **State is split on purpose**: elements in **`Scene`**, editor chrome in **`AppState`**, undo/collab signals in **`Store`**, small cross-cutting UI in **Jotai**.
- **Behavior is centralized** through **`ActionManager` + `syncActionResult`**, with **`CaptureUpdateAction`** linking user intent to history.
- **Sibling packages** hold the **element model and math**; this package **wires them to React, the DOM, and host callbacks**.

---

*Generated from source under `packages/excalidraw/` and `packages/element/` as of the current workspace revision.*
