# Architecture

## High-level Architecture

```mermaid
graph TB
    subgraph HostApp["Host App / excalidraw-app"]
        ExcalidrawComponent["&lt;Excalidraw&gt; component"]
        CollabModule["Collab Module<br/>(socket.io + Firebase)"]
    end

    subgraph ExcalidrawPackage["@excalidraw/excalidraw"]
        App["App.tsx<br/>(class component, orchestrator)"]
        ActionManager["ActionManager<br/>(45+ actions)"]
        SceneRenderer["Renderer<br/>(viewport filtering)"]
        DataLayer["Data Layer<br/>(json, blob, restore)"]
        UIComponents["UI Components<br/>(toolbar, menus, dialogs)"]
        Hooks["Hooks & Context<br/>(tunnels, state subscriptions)"]
    end

    subgraph ElementPackage["@excalidraw/element"]
        Scene["Scene<br/>(element storage)"]
        ElementTypes["Element Types & Mutations"]
        Binding["Binding System"]
        LinearEditor["LinearElementEditor"]
        Store["Store<br/>(change tracking, deltas)"]
    end

    subgraph MathPackage["@excalidraw/math"]
        Geometry["Geometry, Vectors, Curves"]
        PointType["Point / GlobalPoint types"]
    end

    subgraph CommonPackage["@excalidraw/common"]
        Constants["Constants, Utils, Types"]
        EventBus["Emitter, AppEventBus"]
    end

    subgraph Canvas["Browser Canvas"]
        StaticCanvas["Static Canvas<br/>(Rough.js elements)"]
        InteractiveCanvas["Interactive Canvas<br/>(selection, handles, cursors)"]
    end

    ExcalidrawComponent --> App
    CollabModule <--> App
    App --> ActionManager
    App --> SceneRenderer
    App --> DataLayer
    App --> UIComponents
    ActionManager --> Scene
    ActionManager --> Store
    SceneRenderer --> StaticCanvas
    SceneRenderer --> InteractiveCanvas
    Scene --> ElementTypes
    ElementTypes --> Binding
    ElementTypes --> LinearEditor
    ElementTypes --> Geometry
    App --> Hooks
    CommonPackage --> ExcalidrawPackage
    CommonPackage --> ElementPackage
    MathPackage --> ElementPackage
```

Excalidraw is a monorepo with a layered package architecture. The main orchestrator is `App.tsx`, a ~12,800-line React class component that manages state, events, and rendering coordination. It delegates element storage to `Scene`, user operations to `ActionManager`, and visual output to a two-layer canvas system.

## Data Flow

### User Interaction → Visual Update

```mermaid
sequenceDiagram
    participant User
    participant App as App.tsx
    participant AM as ActionManager
    participant Scene
    participant Store
    participant Renderer
    participant Canvas

    User->>App: Pointer/Keyboard event
    App->>AM: executeAction(action, source)
    AM->>AM: action.perform(elements, appState)
    AM-->>App: ActionResult {elements, appState, files}
    App->>App: syncActionResult()
    App->>Scene: replaceAllElements(elements)
    App->>App: setState(appState)
    App->>App: componentDidUpdate()
    App->>Store: commit(elementsMap, appState)
    Store-->>Store: Emit increments (durable → history, ephemeral → collab)
    App->>Renderer: getRenderableElements()
    Renderer-->>Canvas: Static + Interactive render
```

### Save / Load

```mermaid
flowchart LR
    subgraph Save
        A[Elements + AppState + Files] --> B[data/json.ts<br/>serializeAsJSON]
        A --> C[data/blob.ts<br/>PNG with metadata]
        B --> D[.excalidraw file]
        C --> E[.png with embedded scene]
    end

    subgraph Load
        F[File / URL / Clipboard] --> G[data/blob.ts or data/json.ts<br/>parse]
        G --> H[data/restore.ts<br/>schema migration]
        H --> I[scene.replaceAllElements + setState]
    end
```

### Collaboration

```mermaid
flowchart LR
    A[Local changes] --> B[Store.commit]
    B --> C[onStoreIncrementEmitter]
    C --> D[excalidraw-app/collab]
    D --> E[socket.io server]
    E --> F[Remote clients]
    F --> G[reconcileElements]
    G --> H[scene.replaceAllElements]
```

Collaboration is implemented in `excalidraw-app/collab/` (not in the library package). It uses socket.io for real-time sync, Firebase for persistence, and end-to-end encryption via the Web Crypto API. `reconcileElements()` in `data/reconcile.ts` merges remote and local element arrays using version numbers.

## State Management

Three independent state layers work together:

### AppState (React component state)
- Defined in `packages/excalidraw/types.ts` (~113 fields)
- Covers all UI/editor state: active tool, zoom, scroll, selection, theme, collaborators
- Defaults in `packages/excalidraw/appState.ts`
- `APP_STATE_STORAGE_CONF` maps each field to persistence targets (browser/export/server)

### Scene (element storage)
- `Scene` class in `packages/element/src/Scene.ts`
- Holds the ordered array of `ExcalidrawElement[]`
- Provides lookup maps, selection filtering, non-deleted element views
- Emits `onUpdate` when elements change → triggers re-render

### Store (change tracking)
- `Store` class in `packages/element/src/store.ts`
- Called on every `componentDidUpdate` via `store.commit()`
- Compares current vs previous state to generate deltas
- Emits `DurableIncrement` (→ history recording) and `EphemeralIncrement` (→ collab sync)
- Supports `CaptureUpdateAction` flags to control whether a change is recorded

### Jotai (isolated UI atoms)
- `editor-jotai.ts` creates an isolated Jotai store via `jotai-scope`
- Used for popup/panel state, tunnel contents
- Updated via `editorJotaiStore.set()` + manual `triggerRender()`

## Rendering Pipeline

```mermaid
flowchart TB
    A[App.render] --> B[Renderer.getRenderableElements]
    B -->|memoized viewport filter| C{Two canvases}
    C --> D[Static Canvas]
    C --> E[Interactive Canvas]

    D --> D1[Background + Grid]
    D --> D2[Elements via Rough.js]
    D --> D3[Frame clipping]
    D --> D4[Hover highlights]

    E --> E1[Selection rectangles]
    E --> E2[Transform handles]
    E --> E3[Collaborator cursors]
    E --> E4[Snap lines]
    E --> E5[Lasso / eraser trails]

    B --> F[SVG Renderer]
    F --> F1[staticSvgScene.ts]
    F1 --> F2[Export to SVG]
```

**Performance optimizations:**
- `ShapeCache` — caches Rough.js generated shapes per element, invalidated on element mutation
- `SnapCache` — caches snap calculation results
- `Renderer.getRenderableElements()` — memoized, only recomputes when scene nonce or viewport changes
- Rendering throttled via `requestAnimationFrame`
- `withBatchedUpdates` wrapper batches multiple `setState` calls into single React render

## Package Dependencies

```mermaid
graph BT
    Common["@excalidraw/common<br/>Utils, constants, types"]
    Math["@excalidraw/math<br/>Geometry, vectors"]
    Element["@excalidraw/element<br/>Scene, elements, Store"]
    Excalidraw["@excalidraw/excalidraw<br/>React component, UI, actions"]
    Utils["@excalidraw/utils<br/>Public helpers (standalone)"]
    App["excalidraw-app<br/>Hosted web app"]

    Math --> Common
    Element --> Common
    Element --> Math
    Excalidraw --> Common
    Excalidraw --> Math
    Excalidraw --> Element
    App -.->|workspace resolution| Excalidraw
```

**Build order:** `common → math → element → excalidraw` (each package depends on the previous ones)

`@excalidraw/utils` is a standalone package with its own dependencies (roughjs, pako, perfect-freehand) — it does NOT depend on `@excalidraw/excalidraw`.

The `excalidraw-app` uses `@excalidraw/excalidraw` via yarn workspace resolution (not an explicit package.json dependency) and adds hosting-specific features: Firebase storage, Sentry error tracking, socket.io collaboration, and PWA support.
