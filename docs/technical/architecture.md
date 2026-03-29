# Architecture

> Verified from: `packages/*/src/index.ts`, `Scene.ts`, `store.ts`, `history.ts`, `actions/manager.ts`, `renderer/`, `excalidraw-app/collab/Collab.tsx`, `excalidraw-app/data/firebase.ts`

## Related Docs
- [Dev Setup — how to run the project](dev-setup.md)
- [System Patterns — patterns & data flow summary](../memory/systemPatterns.md)
- [Decision Log — undocumented behaviors](../memory/decisionLog.md)
- [Tech Context — stack versions](../memory/techContext.md)

---

## Layer Overview

```
excalidraw-app/               ← web app (collab, Firebase, auth, AI)
    ↓
packages/excalidraw/          ← core library (UI, canvas, actions, history)
    ↓
packages/element/             ← Scene, Store, element types & utilities
    ↓
packages/common/              ← constants, utils, emitter (no deps)
packages/math/                ← geometry primitives (no deps)
```

---

## Package Responsibilities

### `@excalidraw/common`
No external package dependencies. Provides:
- Constants: `KEYS`, `CODES`, `THEME`, `MIME_TYPES`, `TOOL_TYPE`, `ZOOM_STEP`, limits
- Utilities: `debounce`, `throttle`, `isShallowEqual`, `arrayToMap`, `randomInteger`
- Patterns: `Emitter<T>`, `AppEventBus`, `AppStateObserver`
- Types: `EditorInterface`, `StylesPanelMode`

### `@excalidraw/math`
No external package dependencies. Provides:
- Primitives: `Point`, `Vector`, `Radians`, `Segment`, `Curve`, `Polygon`
- Operations: `pointDistance`, `pointRotateRads`, `vectorDot`, `vectorNormalize`
- Shapes: `ellipse`, `rectangle`, `triangle`, `line` math

### `@excalidraw/element`
Depends on `common` + `math`. Core classes:

**`Scene`** — canonical element store
```typescript
class Scene {
  getNonDeletedElements(): readonly Ordered<NonDeletedExcalidrawElement>[]
  getNonDeletedElementsMap(): NonDeletedSceneElementsMap
  getElementsIncludingDeleted(): readonly OrderedExcalidrawElement[]
  getSelectedElements(opts): NonDeleted<ExcalidrawElement>[]
  replaceAllElements(nextElements): void
  insertElement(element): void
  mapElements(iteratee): boolean          // returns true if anything changed
  triggerUpdate(): void                   // notifies all onUpdate subscribers
  onUpdate(cb): SceneStateCallbackRemover
  destroy(): void
}
```

**`Store`** — state capture + delta emission
```typescript
class Store {
  onDurableIncrementEmitter: Emitter<[DurableIncrement]>
  onStoreIncrementEmitter: Emitter<[DurableIncrement | EphemeralIncrement]>

  scheduleAction(action: CaptureUpdateActionType): void
  commit(elements?: SceneElementsMap, appState?: AppState): void
  clear(): void
}

const CaptureUpdateAction = {
  IMMEDIATELY: "IMMEDIATELY",  // captured → undo/redo
  NEVER: "NEVER",              // not captured (remote sync, view-only)
  EVENTUALLY: "EVENTUALLY",    // captured later (async ops)
}
```

**`StoreDelta`** — what changed between two snapshots
```typescript
class StoreDelta {
  static calculate(prev: StoreSnapshot, next: StoreSnapshot): StoreDelta
  static inverse(delta: StoreDelta): StoreDelta        // for undo
  static squash(...deltas: StoreDelta[]): StoreDelta   // for batching
  static applyTo(delta, elements, appState): [SceneElementsMap, AppState, boolean]
  isEmpty(): boolean
}
```

**`StoreSnapshot`** — immutable state capture
```typescript
class StoreSnapshot {
  elements: SceneElementsMap
  appState: ObservedAppState   // subset of AppState tracked for history
  metadata: { didElementsChange, didAppStateChange }

  static create(elements, appState): StoreSnapshot
  applyChange(change: StoreChange): StoreSnapshot
}
```

### `@excalidraw/excalidraw`
Depends on `element` + `common` + `math`. Provides:

**`App`** (class component, `components/App.tsx`) — editor orchestrator
- Owns: `scene`, `store`, `history`, `renderer`, `actionManager`, `library`, `fonts`
- Manages: `AppState` (React class state), all DOM events, canvas rendering loop

**`ActionManager`** (`actions/manager.ts`)
```typescript
type Action = {
  name: ActionName
  predicate?: (elements, appState, appProps, app) => boolean
  perform: (elements, appState, formData, app) => ActionResult
  keyTest?: (event, appState, elements) => boolean
  contextItemLabel?: string
}

type ActionResult = {
  elements?: readonly ExcalidrawElement[] | null
  appState?: Partial<AppState> | null
  files?: BinaryFiles | null
  captureUpdate: CaptureUpdateActionType
} | false
```

**`History`** (`history.ts`) — undo/redo on top of `StoreDelta`
```typescript
class History {
  record(delta: StoreDelta): void
  undo(elements, appState): [SceneElementsMap, AppState] | void
  redo(elements, appState): [SceneElementsMap, AppState] | void
  clear(): void
}
```

**Renderer** (`renderer/`)

| File | Purpose |
|------|---------|
| `staticScene.ts` | Background layer — shapes, grid, Rough.js |
| `interactiveScene.ts` | Interaction layer — selection handles, cursors, snap indicators |
| `renderNewElementScene.ts` | Preview of element being drawn |
| `staticSvgScene.ts` | SVG export pipeline |
| `renderSnaps.ts` | Snap alignment indicators |

---

## State Architecture

### AppState (React class state)
UI & interaction state. Triggers React re-renders. Key fields:

```
activeTool, selectedElementIds, selectedGroupIds
editingTextElement, newElement, resizingElement
scrollX, scrollY, zoom, width, height
currentItemStrokeColor, currentItemFontSize, ...
collaborators, userToFollow
openDialog, openSidebar, contextMenu
```

### ObservedAppState (tracked by Store for history)
Subset of AppState that participates in undo/redo:
```
name, selectedElementIds, selectedGroupIds
selectedLinearElement, viewBackgroundColor
editingGroupId, croppingElementId
activeLockedId, lockedMultiSelections
```

### Instance fields (no re-render)
```
scene: Scene          → elements[]
store: Store          → delta capture
history: History      → undo/redo stack
renderer: Renderer    → canvas
actionManager         → commands
library               → templates
files: BinaryFiles    → images
imageCache: Map       → render cache
```

### Jotai atoms
```
editorJotaiStore  → isolated scope for library
appJotaiStore     → collab, persistence, language (app layer)
```

---

## Data Flow

### Local edit
```
Canvas pointer event
  → Tool handler (App.tsx)
    → newElement() / mutateElement()
      → actionManager.executeAction(action)
        → ActionResult { elements, appState, captureUpdate }
          → setState() + store.commit()
            → store emits DurableIncrement
              → history.record(delta)        ← undo/redo
              → onChangeEmitter.trigger()    ← props.onChange + app layer
```

### Undo/Redo
```
actionUndo / actionRedo
  → history.undo(elements, appState)
    → StoreDelta.inverse(delta)
      → StoreDelta.applyTo(inverseDelta, elements, appState)
        → scene.replaceAllElements(newElements)
          → store.commit(CaptureUpdateAction.NEVER)
```

### Collaboration sync
```
Local change → store.onDurableIncrementEmitter
  → Collab listener
    → Portal WebSocket broadcast

Remote update received
  → reconcileElements(local, remote)
      // conflict resolution:
      // 1. actively editing locally → keep local
      // 2. local.version > remote.version → keep local
      // 3. equal version → lower versionNonce wins
  → store.commit(reconciled, CaptureUpdateAction.NEVER)
    → scene.replaceAllElements()
```

---

## Type Hierarchy

```
ExcalidrawElement (base)
├── ExcalidrawGenericElement    (rect, diamond, ellipse)
├── ExcalidrawTextElement
├── ExcalidrawLinearElement     (line, arrow, freedraw)
├── ExcalidrawImageElement
│   └── InitializedExcalidrawImageElement
├── ExcalidrawFrameLikeElement
│   ├── ExcalidrawFrameElement
│   └── ExcalidrawMagicFrameElement
├── ExcalidrawIframeLikeElement
│   ├── ExcalidrawIframeElement
│   └── ExcalidrawEmbeddableElement

Helpers:
  NonDeletedExcalidrawElement   = ExcalidrawElement & { isDeleted: false }
  OrderedExcalidrawElement      = ExcalidrawElement & { index: FractionalIndex }

Maps:
  SceneElementsMap              = Map<id, ExcalidrawElement>        (incl. deleted)
  NonDeletedSceneElementsMap    = Map<id, NonDeletedExcalidrawElement>
```

---

## App Layer (`excalidraw-app/`)

### Composition
```
<Provider store={appJotaiStore}>
  <ExcalidrawAPIProvider>
    <Collab ref={collabAPI} />
    <Excalidraw
      onChange={...}
      onIncrement={...}        ← store increments → Collab sync
      onExcalidrawAPI={...}
    >
      <AppMainMenu />
      <AppSidebar />
      <AppFooter />
      <LiveCollaborationTrigger />
    </Excalidraw>
    <ShareDialog />
    <AIComponents />
  </ExcalidrawAPIProvider>
</Provider>
```

### Persistence layers
| Layer | Scope | Implementation |
|-------|-------|----------------|
| localStorage | elements + appState | `excalidraw`, `excalidraw-state` keys |
| IndexedDB | library + AI chats | `idb-keyval` |
| Firebase Firestore | collab scene | `excalidraw-app/data/firebase.ts` |
| Firebase Storage | binary files (images) | `loadFilesFromFirebase` |

### Collaboration (`excalidraw-app/collab/Collab.tsx`)
- Jotai atoms: `collabAPIAtom`, `isCollaboratingAtom`, `isOfflineAtom`
- Socket.io 4.7.2 via `Portal` class
- Full scene sync every 20s as fallback
- E2EE: AES-128, key in URL fragment, never sent to server
- Deleted elements synced for 24h then garbage-collected (`DELETED_ELEMENT_TIMEOUT`)

---

## Public API Surface

### Component props (key subset)
```typescript
initialData: { elements, appState, files }
onChange: (elements, appState, files) => void
onIncrement: (increment: StoreIncrement) => void
onExcalidrawAPI: (api: ExcalidrawImperativeAPI) => void
viewModeEnabled: boolean
zenModeEnabled: boolean
theme: "light" | "dark" | "system"
UIOptions: { canvasActions, tools }
renderTopRightUI: () => ReactNode
validateEmbeddable: (url) => boolean
```

### Imperative API
```typescript
api.updateScene({ elements, appState, files })
api.applyDeltas(deltas)
api.getSceneElements()
api.getAppState()
api.resetScene()
api.scrollToContent(elements?)
api.setActiveTool({ type })
api.onChange((elements, appState, files) => void)
api.onStateChange(selector, callback)   // fine-grained subscription
api.onPointerDown(callback)
api.onScrollChange(callback)
api.onIncrement(callback)               // raw store increments
```

### Hooks (inside Excalidraw subtree)
```typescript
useExcalidrawAPI()
useExcalidrawStateValue(prop | props[] | selector)
useOnExcalidrawStateChange(callback)
useEditorInterface()
useStylesPanelMode()
```
