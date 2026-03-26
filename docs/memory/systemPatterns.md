# System Patterns

## Architectural Boundaries

### Package Layering

```text
┌────────────────────────────────────────────────────────────────┐
│  excalidraw-app (private web app)                              │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  @excalidraw/excalidraw (React component library)       │   │
│  │  ┌──────────────────────────────────────────────────┐   │   │
│  │  │  @excalidraw/element (element model + rendering) │   │   │
│  │  │  ┌──────────────────┐  ┌──────────────────────┐  │   │   │
│  │  │  │ @excalidraw/math │  │ @excalidraw/common   │  │   │   │
│  │  │  └──────────────────┘  └──────────────────────┘  │   │   │
│  │  └──────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────┘   │
│  @excalidraw/utils (parallel utility package)                  │
└────────────────────────────────────────────────────────────────┘
```

**Strict rule**: upper layers may import from lower layers but not vice versa. `common` and `math` are leaves with no internal cross-dependencies.

### Collaboration as a Shell Concern

The library (`@excalidraw/excalidraw`) deliberately excludes WebSocket and Firebase. Collaboration is implemented entirely in `excalidraw-app/collab/`, injected back into the library via `ExcalidrawImperativeAPI.updateScene()`, `reconcileElements()`, and `applyDeltas()`. This keeps the npm package transport-agnostic. See the [collaboration data flow in the Technical Architecture](../technical/architecture.md) for the full encryption and Socket.IO message sequence.

---

## Rendering Model

### Two-Canvas Architecture

The editor uses two stacked `<canvas>` elements plus a third for in-progress elements:

| Canvas | Renderer | Contents | Update frequency |
| --- | --- | --- | --- |
| **Static** (background) | `renderer/staticScene.ts` → `renderStaticScene()` | Grid, committed elements via `rc.draw()`, link icons, frame clipping | Throttled with `throttleRAF`; rerenders on scene/state change |
| **Interactive** (overlay) | `renderer/interactiveScene.ts` → `renderInteractiveScene()` | Selection boxes, transform handles, binding highlights, collaborator cursors, snap lines | Every pointer event |
| **NewElement** | `renderer/renderNewElementScene.ts` | The single element currently being drawn | Every pointer move while drawing |

`packages/excalidraw/scene/Renderer.ts` orchestrates both canvases. It computes `getRenderableElements()` (viewport-culled, filtered subset of scene elements) keyed by `sceneNonce` — a counter bumped on every scene mutation.

### Per-Element Offscreen Canvas Cache

Each element is rendered once to an offscreen `<canvas>` and cached in `elementWithCanvasCache`. The cache entry is keyed by element `version`, current theme, and zoom level. On the main canvas, `drawElementFromCanvas()` copies the offscreen canvas via `context.drawImage()`. This avoids re-running `roughjs` generation on every frame.

### RoughJS + perfect-freehand Pipeline

1. `ShapeCache.generateElementShape(element, config)` → `RoughGenerator.rectangle/ellipse/polygon/curve/path(...)` returns a `Drawable` (cached in `WeakMap`).
2. `RoughCanvas.draw(drawable)` paints it onto the offscreen canvas.
3. Freedraw elements skip roughjs; `perfect-freehand.getStroke()` produces an SVG path string drawn as `Path2D`.
4. Images are rendered with `context.drawImage()` plus optional crop (`roundRect` clip) and dark-mode inversion filter.

---

## State and Editor Patterns

### Class Component as Editor Core

`packages/excalidraw/components/App.tsx` is a **React class component** (~12,800 lines). All editor state is in `this.state` (`AppState`), and mutations go through `this.setState()`. This enables:

- Access to previous state in lifecycle methods (`componentDidUpdate`).
- Stable references for long-lived instance variables (`this.scene`, `this.history`, `this.actionManager`, etc.).
- Fine-grained control over render batching.

React Hooks are used for isolated UI features (dialogs, popovers) via Jotai atoms, bridged into the class via `App.updateEditorAtom()`.

### Jotai — Two Isolated Stores

| Store | Created in | Scope |
| --- | --- | --- |
| `editorJotaiStore` | `packages/excalidraw/editor-jotai.ts` | Library-internal; isolated from host app store via `jotai-scope` |
| `appJotaiStore` | `excalidraw-app/app-jotai.ts` | App-level; holds collab atoms, share dialog state, offline flag |

`jotai-scope` prevents atom identity collision when multiple `<Excalidraw>` instances exist or when the host app also uses Jotai.

### Action Pattern (Command Pattern)

All editor operations (tool activation, style changes, undo/redo, clipboard, export, alignment) are `Action` objects registered in `ActionManager`. Each action has:

- `name: ActionName` (one of ~90 named strings)
- `perform(elements, appState, formData, app) → ActionResult`
- Optional `keyTest`, `predicate`, `PanelComponent`, `trackEvent`

`ActionManager.handleKeyDown()` dispatches to the first matching action. `executeAction()` is the programmatic path. Results flow through `App.syncActionResult()` → `this.setState()`.

### CRDT Delta System (History + Collaboration)

The `Store` class tracks snapshots. Every mutation emits either a `DurableIncrement` (undo-able) or `EphemeralIncrement` (transient, e.g., collaborator cursor). These feed `History`, which maintains undo/redo stacks of `HistoryDelta` objects (`ElementsDelta` + `AppStateDelta`). See the [State Management section of the Technical Architecture](../technical/architecture.md) for the full Store/History/ActionManager lifecycle diagrams.

For collaboration, `onIncrement` callback on `ExcalidrawProps` receives these increments for broadcasting. Remote increments are applied via `api.applyDeltas()`.

### AppState Subscription System

`AppStateObserver` allows fine-grained subscriptions to specific `AppState` fields without triggering full component re-renders. Used internally for the `onStateChange` imperative API and the `useExcalidrawStateValue()` / `useOnExcalidrawStateChange()` hooks.

---

## Collaboration Patterns

### End-to-End Encryption

All collaborative data is encrypted before leaving the client:

- Room key: 22-char base64 AES-GCM key embedded in URL fragment (`#room=<id>,<key>`) — never sent to the server.
- Firebase Firestore stores `{ sceneVersion, iv, ciphertext }` — decryption requires the key from the URL.
- Firebase Storage files: `encodeFilesForUpload()` compresses + AES-GCM encrypts before upload.
- Socket.IO messages: `Portal._broadcastSocketData()` encrypts with `TextEncoder → AES-GCM encrypt → ArrayBuffer`, emitted as binary.

### Element Reconciliation (CRDT-like Merge)

`reconcileElements(local, remote, appState)` in `packages/excalidraw/data/reconcile.ts`:

- Remote element wins if `remote.version > local.version`.
- Tie-breaking via `versionNonce` (random number), favoring the numerically lower nonce (local element is kept when `local.versionNonce <= remote.versionNonce`; source: `packages/excalidraw/data/reconcile.ts:37–39`).
- Deleted elements are retained for `DELETED_ELEMENT_TIMEOUT = 86400000ms` (1 day) to propagate deletions.

### Socket Message Types

| Subtype | Channel | Purpose |
| --- | --- | --- |
| `SCENE_INIT` | Reliable | Full scene from first peer in room |
| `SCENE_UPDATE` | Reliable | Incremental element updates |
| `MOUSE_LOCATION` | Volatile | Cursor position (~30fps) |
| `USER_VISIBLE_SCENE_BOUNDS` | Reliable (targeted) | Viewport for follow-mode |
| `IDLE_STATUS` | Volatile | Active/idle/away state |

### Save Strategy During Collaboration

While a collab session is active:

- `LocalData.pauseSave("collaboration")` prevents local saves from overwriting the session state.
- Firebase Firestore is used as the persistent store via `queueSaveToFirebase()` (full scene every 20s, throttled).
- Socket.IO carries delta broadcasts (filtered by `broadcastedElementVersions` map, only new/changed elements).
- `FirebaseSceneVersionCache` (WeakMap on Socket) tracks the last saved version to avoid redundant writes.

---

## Package Responsibilities and Dependency Direction

| Package | Responsibility | May Import |
| --- | --- | --- |
| `@excalidraw/common` | Colors, constants, event bus, utility types | External only (`tinycolor2`) |
| `@excalidraw/math` | 2D geometry: points, vectors, lines, segments, curves, ellipses, polygons, angles | `@excalidraw/common` |
| `@excalidraw/element` | Element types, factories (`newElement`), bounds, collision, shape generation (roughjs), rendering, binding, text layout, CRDT delta/store | `@excalidraw/common`, `@excalidraw/math` |
| `@excalidraw/excalidraw` | Editor UI (`App.tsx`), actions, renderer, history, fonts, library, export, all React components | `@excalidraw/element`, `@excalidraw/math`, `@excalidraw/common` |
| `@excalidraw/utils` | File I/O (`browser-fs-access`), compression, encoding, font subsetting | External only |
| `excalidraw-app` | Web app shell, collaboration transport, persistence, PWA, Sentry, routing | `@excalidraw/excalidraw` (and sub-packages via tsconfig paths) |

## Related Docs

- [Technical Architecture](../technical/architecture.md) — full data flow diagrams (solo update, collaboration sync, import/export), state container deep-dives, rendering call chains
- [Product Requirements (PRD)](../product/PRD.md) — product-level view of collaboration (§5.7), export (§5.8), and embedding API requirements (§4.4, §6 FR-21–FR-25)

## Source Evidence

- `packages/excalidraw/components/App.tsx` — class component declaration, `this.scene`, `this.store`, `this.history`, `this.actionManager`, `AppContext`, `editorJotaiStore`
- `packages/excalidraw/editor-jotai.ts` — isolated Jotai store
- `excalidraw-app/app-jotai.ts` — app-level Jotai store, `collabAPIAtom`, `isCollaboratingAtom`
- `packages/excalidraw/actions/manager.tsx` — `ActionManager` class
- `packages/excalidraw/actions/types.ts` — `Action`, `ActionResult`, `ActionSource` types
- `packages/excalidraw/renderer/staticScene.ts`, `interactiveScene.ts`, `renderNewElementScene.ts`
- `packages/excalidraw/scene/Renderer.ts` — `getRenderableElements()`, `sceneNonce`
- `packages/element/src/renderElement.ts` — `renderElement()`, `generateElementCanvas()`, `drawElementFromCanvas()`
- `packages/element/src/shape.ts` — `ShapeCache`, `generateElementShape()`
- `packages/excalidraw/data/reconcile.ts` — `reconcileElements()`
- `excalidraw-app/collab/Collab.tsx` — socket message types, `startCollaboration()`, pause/resume save
- `excalidraw-app/collab/Portal.tsx` — `_broadcastSocketData()`, encryption
- `excalidraw-app/data/firebase.ts` — Firestore transaction, `FirebaseSceneVersionCache`
- `packages/excalidraw/store.ts` — `Store`, `DurableIncrement`, `EphemeralIncrement`
- `packages/excalidraw/history.ts` — `History`, `HistoryDelta`
