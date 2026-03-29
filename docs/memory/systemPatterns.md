# System Patterns

## Related Docs
- [Dev Setup — how to run & build the system](../technical/dev-setup.md)
- [Decision Log — undocumented behaviors & key decisions](decisionLog.md)
- [Tech Context — stack versions](techContext.md)
- [PRD — what features the system implements](../product/PRD.md)

---

## Monorepo Architecture

```
packages/excalidraw/   →  core library (React component + public API)
packages/element/      →  element types, mutations, rendering, geometry
packages/common/       →  shared constants, utils, event helpers
packages/math/         →  Point, Vector, Radians, geometry primitives
excalidraw-app/        →  full web app (collab + persistence + auth)
```

## State Management (3 layers)

### 1. React class state — `App.tsx` (`this.state: AppState`)
UI and interaction state only. Key fields:
- **Tool**: `activeTool`, `penMode`
- **Selection**: `selectedElementIds`, `selectedGroupIds`, `hoveredElementIds`
- **Editing**: `editingTextElement`, `newElement`, `resizingElement`, `selectedLinearElement`
- **Viewport**: `scrollX`, `scrollY`, `zoom`, `width`, `height`
- **Styles**: `currentItemStrokeColor`, `currentItemFontSize`, etc.
- **UI**: `openDialog`, `openSidebar`, `contextMenu`, `showHyperlinkPopup`
- **Collab**: `collaborators`, `userToFollow`

### 2. Instance fields — not in React state, no re-render on change
| Field | Type | Purpose |
|-------|------|---------|
| `scene` | `Scene` | Canonical elements array |
| `store` | `Store` | Incremental history deltas |
| `history` | `History` | Undo/redo stack |
| `renderer` | `Renderer` | Canvas rendering |
| `library` | `Library` | Reusable templates |
| `files` | `BinaryFiles` | Image/binary data |
| `imageCache` | `Map` | Render performance cache |
| `actionManager` | `ActionManager` | All commands |

### 3. Jotai atoms — app-layer features
- `editorJotaiStore` — isolated scope for the library (`editor-jotai.ts`)
- `appJotaiStore` — collaboration, persistence, language (`excalidraw-app/app-jotai.ts`)
- Written from class component via `updateEditorAtom()` + manual `triggerRender()`

## Component Tree

```
Excalidraw (index.tsx)
└── EditorJotaiProvider
    └── InitializeApp (language/theme init)
        └── App (class, ~12,800 lines)
            ├── StaticCanvas        — Rough.js background layer
            ├── InteractiveCanvas   — pointer interaction layer
            ├── MainMenu
            ├── Toolbar / Actions
            ├── Sidebar             — Library, properties
            ├── ColorPicker
            ├── ExportDialog
            └── CommandPalette
```

App-layer wraps the library:
```
ExcalidrawApp (excalidraw-app/)
├── Collab              — WebSocket sync
├── Excalidraw          — library component
├── ShareDialog
└── AI components
```

## Element Types (`packages/element/`)

```typescript
ExcalidrawElement =
  Rectangle | Diamond | Ellipse | Arrow | Line | FreeDraw |
  Text | Image | Frame | MagicFrame | Embeddable | Iframe
```

Common base fields: `id, x, y, width, height, angle, version, versionNonce,`
`index (FractionalIndex), groupIds, frameId, boundElements, isDeleted, link, locked`

## Data Flow

```
User interaction (pointer/keyboard)
  → Tool handler in App.tsx
    → newElement() / mutateElement()
      → ActionManager.executeAction()
        → ActionResult { elements, appState }
          → setState() + store.push()
            → componentDidUpdate → store.commit()
              → onChangeEmitter.trigger()
                ├→ props.onChange()         (consumer callback)
                ├→ LocalData.save()         (IndexedDB)
                ├→ Collab.syncElements()    (WebSocket)
                └→ Firebase.save()
```

## Key Architectural Patterns

| Pattern | Where | How |
|---------|-------|-----|
| **Command/Action** | `actions/` (48 files) | All user interactions go through `ActionManager.executeAction()` |
| **Observer/Emitter** | `App.tsx` | `onChangeEmitter`, `onPointerDownEmitter`, `onScrollChangeEmitter`, etc. |
| **Immutable updates** | `packages/element/` | `mutateElement()` returns new object, increments `version` |
| **Fractional Indexing** | element `.index` | Stable ordering of elements in multiplayer (no integer conflicts) |
| **Version + versionNonce** | element fields | Conflict resolution during collab sync |
| **Incremental deltas** | `Store` + `History` | Undo/redo stores diffs, not full snapshots |

## Public API (Imperative)

Exposed via `ExcalidrawImperativeAPI` through `props.onExcalidrawAPI`:

```typescript
api.updateScene(sceneData)
api.applyDeltas(deltas)
api.getSceneElements()
api.getAppState()
api.onChange((elements, appState, files) => {})
api.onStateChange(selector, callback)   // fine-grained subscription
api.onPointerDown(callback)
api.onScrollChange(callback)
api.scrollToContent()
api.resetScene()
api.setActiveTool(tool)
```

## App Lifecycle (`App.tsx`)

| Phase | Key actions |
|-------|-------------|
| `constructor` | Init Scene, Store, History, Renderer, ActionManager, register all actions, create API |
| `componentDidMount` | Wire store/scene subscriptions, attach DOM listeners, ResizeObserver, init scene |
| `componentDidUpdate` | Sync props→state, commit to store, fire onChange + all emitters |
| `componentWillUnmount` | Destroy all services, clear emitters, disconnect observer, clear caches |

## Side Effects Summary

- **DOM listeners**: 15+ (keyboard, pointer, wheel, resize, paste, copy, cut, focus, gestures)
- **Timers**: bind mode delay, double-tap detection, touch context menu, paste flag
- **RAF**: laser/eraser/lasso trails via `AnimationFrameHandler`
- **Debounced**: scroll offset recalc, cache invalidation
- **Throttled**: image refresh
- **ResizeObserver**: container size → editor interface recalc
