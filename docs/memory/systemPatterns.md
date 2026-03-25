# System Patterns

> **See also**: [projectbrief](projectbrief.md) | [techContext](techContext.md) | [decisionLog](decisionLog.md) | [productContext](productContext.md) | [activeContext](activeContext.md) | [progress](progress.md)
> **Technical docs**: [Architecture](../technical/architecture.md) | [Dev Setup](../technical/dev-setup.md)
> **Product docs**: [PRD](../product/PRD.md) | [Domain Glossary](../product/domain-glossary.md)

## High-Level Architecture

```
┌─────────────────────────────────────────────────┐
│  excalidraw-app (application shell)             │
│  ┌────────────────────────────────────────────┐ │
│  │  @excalidraw/excalidraw (React component)  │ │
│  │  ┌──────────────┐  ┌───────────────────┐   │ │
│  │  │ @excalidraw/  │  │ @excalidraw/math  │   │ │
│  │  │ element       │  │ (2D geometry)     │   │ │
│  │  └──────┬───────┘  └────────┬──────────┘   │ │
│  │         └────────┬──────────┘               │ │
│  │          @excalidraw/common                 │ │
│  └────────────────────────────────────────────┘ │
│  Firebase · socket.io · Sentry                  │
└─────────────────────────────────────────────────┘
```

The app class (`packages/excalidraw/components/App.tsx`) is a React class
component that owns Scene, Store, History, ActionManager, Library, and the
canvas/RoughCanvas instances.

## Key Architectural Patterns

### 1. Branded / Nominal Types

Prevents mixing semantically distinct values that share the same primitive type.

```typescript
type FileId = string & { _brand: "FileId" };
type Radians = number & { _brand: "excalimath__radian" };
type FractionalIndex = string & { _brand: "franctionalIndex" };
type NormalizedZoomValue = number & { _brand: "normalizedZoom" };
```

**Where**: `packages/math/src/types.ts`, `packages/element/src/types.ts`,
`packages/excalidraw/types.ts`.

### 2. Immutable Elements

All `ExcalidrawElement` fields are `Readonly<{…}>`. Mutations go through:

- `mutateElement(el, elementsMap, updates)` — in-place update with version bump
- `newElementWith(el, updates)` — returns a new copy

Every mutation increments `version` and regenerates `versionNonce` — critical
for collaboration reconciliation.

**Where**: `packages/element/src/mutateElement.ts`.

### 3. Command Pattern (Actions)

All user operations are encapsulated as `Action` objects with a `perform()`
method. `ActionManager` acts as a command bus:

```
User event → ActionManager.executeAction(action, source)
           → action.perform(elements, appState, value, app)
           → ActionResult { elements?, appState?, captureUpdate }
           → syncActionResult() → Scene + setState + Store
```

~60 built-in actions registered via `packages/excalidraw/actions/register.ts`.

**Where**: `packages/excalidraw/actions/manager.tsx`,
`packages/excalidraw/actions/types.ts`.

### 4. Observer / Event Emitter

Generic `Emitter<T>` class with `on()`, `once()`, `off()`, `trigger()`.

Used for:
- `Store.onDurableIncrementEmitter` — History recording
- `Store.onStoreIncrementEmitter` — public API change events
- `appEventBus` — lifecycle events (`editor:mount`, etc.)
- `onPointerDownEmitter` — pointer event broadcasting

**Where**: `packages/common/src/emitter.ts`.

### 5. Dual-Canvas Rendering

Two separate rendering layers for performance:

| Layer | Trigger | Content |
|-------|---------|---------|
| **StaticCanvas** | React useEffect on prop change | Shapes, grid, background |
| **InteractiveCanvas** | requestAnimationFrame loop | Selection handles, cursors, guides |

Static rendering is throttled via `throttleRAF`. Interactive loop runs only
while animations are active (via `AnimationController`).

**Where**: `packages/excalidraw/components/canvases/StaticCanvas.tsx`,
`packages/excalidraw/components/canvases/InteractiveCanvas.tsx`,
`packages/excalidraw/renderer/animation.ts`.

### 6. WeakMap Caching

Performance-critical data is cached in WeakMaps keyed by element reference
(auto-GC when element is discarded):

- `ShapeCache` — rough.js Drawable per element + theme
- `ElementBounds.boundsCache` — bounding boxes with version check
- `elementWithCanvasCache` — pre-rendered element canvases

**Where**: `packages/element/src/shape.ts`, `packages/element/src/bounds.ts`,
`packages/element/src/renderElement.ts`.

### 7. Delta-Based Undo/Redo

```
Action → Store.scheduleAction(captureUpdate)
       → Store computes StoreDelta (snapshot diff)
       → emits DurableIncrement
       → History.record(delta)
       → push to undoStack

Ctrl+Z → History.undo() → pop undoStack → apply inverse → push redoStack
```

`CaptureUpdateAction` controls recording:
- `IMMEDIATELY` — local edits → undo stack
- `EVENTUALLY` — deferred (async ops)
- `NEVER` — remote updates, init (no undo)

**Where**: `packages/element/src/store.ts`, `packages/excalidraw/history.ts`.

### 8. Fractional Indexing (CRDT-like ordering)

Element z-order uses string-based fractional indices (`"a0"`, `"a0V"`, `"a1"`)
from the `fractional-indexing` library. Allows concurrent inserts without
re-indexing the entire array — essential for collaboration.

**Where**: `packages/element/src/fractionalIndex.ts`.

### 9. Reconciliation (Conflict Resolution)

When remote elements arrive via collaboration:

1. For each remote element, compare with local version
2. Local wins if: element is being edited, OR local `version` > remote
3. Tie-break on equal versions: lower `versionNonce` wins
4. Reorder merged result by fractional indices
5. Apply with `CaptureUpdateAction.NEVER` (skip undo)

**Where**: `packages/excalidraw/data/reconcile.ts`.

### 10. End-to-End Encryption

All collaboration payloads are AES-GCM encrypted using the Web Crypto API:

- Room key generated client-side, shared via URL fragment (never sent to server)
- `encryptData(key, data)` → `{ encryptedBuffer, iv }`
- `decryptData(iv, encrypted, key)` → plaintext

Firebase also stores encrypted scenes (`{ ciphertext, iv, sceneVersion }`).

**Where**: `packages/excalidraw/data/encryption.ts`,
`excalidraw-app/collab/Portal.tsx`, `excalidraw-app/data/firebase.ts`.

### 11. Scoped Jotai Stores

Two isolated Jotai stores prevent atom leakage between layers:

| Store | Scope | Examples |
|-------|-------|---------|
| `editorJotaiStore` | Per editor instance | sidebar docked, eye dropper, library menu |
| `appJotaiStore` | Application-wide | collab state, language, share dialog |

ESLint rule blocks direct `import from "jotai"` — must use app/editor wrappers.

**Where**: `packages/excalidraw/editor-jotai.ts`, `excalidraw-app/app-jotai.ts`.

### 12. React Context Providers

The `App` component exposes state via layered contexts:

- `ExcalidrawAppStateContext` → AppState
- `ExcalidrawSetAppStateContext` → setState callback
- `ExcalidrawElementsContext` → non-deleted elements array
- `ExcalidrawActionManagerContext` → ActionManager instance
- `ExcalidrawAPIContext` → imperative API (for external consumers)
- `EditorInterfaceContext` → device form factor, touch, sidebar

**Where**: `packages/excalidraw/components/App.tsx`.

### 13. Adapter Pattern (Library Persistence)

`LibraryPersistenceAdapter` interface allows pluggable storage backends for
library items:

```typescript
interface LibraryPersistenceAdapter {
  load(metadata): MaybePromise<{ libraryItems } | null>;
  save(libraryData): MaybePromise<void>;
}
```

Default: `LibraryIndexedDBAdapter` (excalidraw-app).
Host apps can provide custom adapters.

**Where**: `packages/excalidraw/data/library.ts`.

### 14. Throttle / Debounce Strategy

- `throttleRAF(fn)` — max once per animation frame (rendering)
- `debounce(fn, ms)` — wait for inactivity (persistence to localStorage)
- Portal uses version tracking (`broadcastedElementVersions`) to send only
  changed elements

**Where**: `packages/common/src/utils.ts`,
`excalidraw-app/data/LocalData.ts`, `excalidraw-app/collab/Portal.tsx`.
