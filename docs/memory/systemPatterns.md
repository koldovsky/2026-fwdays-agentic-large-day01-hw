# System Patterns: Excalidraw Architecture

## Core Architecture Patterns

### 1. Class Component with Centralized State

**Pattern**: React Class Component as state container

```typescript
App (React.Component<AppProps, AppState>)
  └─ Manages 100+ AppState properties
  └─ Exposes setAppState() via Context
  └─ Triggers renders via setState()
```

**Why**: Lifecycle hooks, performance control via shouldComponentUpdate, centralized state

**Key Properties**: `scene` (elements), `renderer` (canvas), `actionManager` (actions), `history` (undo/redo), `api` (public API)

---

### 2. Hybrid State Management

**Pattern**: Jotai atoms + React state + AppStateObserver

```typescript
├─ React state (AppState) - Global UI state
├─ Jotai atoms - UI toggles (sidebar, dialogs)
└─ AppStateObserver - Reactive subscriptions
```

**Subscriptions**:
```typescript
api.onStateChange("selectedElementIds", (ids, appState) => {})
api.onStateChange(["zoom", "scrollX"], (appState) => {})
api.onStateChange((state) => state.zoom.value, (value) => {})
```

---

### 3. Lifecycle Stages

**Constructor**: Initialize AppState, create managers, register actions

**componentDidMount**: Setup listeners, ResizeObserver, subscriptions, emit mount event

**componentDidUpdate**: Flush subscriptions, sync props, emit events, handle transitions

**componentWillUnmount**: Invalidate API, destroy renderer/scene, clear caches

---

### 4. Event-Driven Architecture

**Multiple Emitters**:
```typescript
onChangeEmitter → (elements, appState, files)
onPointerDownEmitter → (tool, pointerState, event)
onPointerUpEmitter → (tool, pointerState, event)
onScrollChangeEmitter → (scrollX, scrollY, zoom)
editorLifecycleEvents → (mount, unmount, initialize)
```

---

### 5. Data Flow

**Rendering Pipeline**: setState → render → getRenderableElements → LayerUI → componentDidUpdate → Emitters

**Action Flow**: User interaction → ActionManager → mutate → Store emits → History records → triggerRender → re-render

---

### 6. Context Provider Hierarchy

```typescript
ExcalidrawAPIProvider
  └─ EditorJotaiProvider
    └─ InitializeApp
      └─ App
        └─ TunnelsProvider
          └─ Multiple Contexts (8+)
```

---

### 7. Scene Management

```typescript
scene.getNonDeletedElements()     // Active elements
scene.getSelectedElements(state)  // User selected
scene.triggerUpdate()             // Force render
scene.onUpdate(callback)          // Subscribe
```

---

### 8. Rendering & Collaboration

**Rendering Layers**:
- **staticScene** - Off-screen base element rendering
- **interactiveScene** - On-screen with interactions
- **animation** - Interpolation between states
- **renderSnaps** - Snap guides and alignment

**Collaboration Flow**: Local changes → Store increment → History records → Socket.io broadcasts → Remote receive + reconcile → Update

**Collaboration State**:
- `collaborators: Map<socketId, Collaborator>`
- `selectedElementIds: Record<elementId, true>`
- `userToFollow: Collaborator | null`

---

### 9. Portal Tunnel Pattern

**Pattern**: Cross-hierarchy component rendering without prop drilling

```typescript
// Define tunnel
MainMenuTunnel: tunnel()

// Render from anywhere
<MainMenuTunnel.Out />

// Inject content
<MainMenuTunnel.In>
  <MenuContent />
</MainMenuTunnel.In>
```

---

## Key Design Principles

| Principle | Implementation |
|-----------|----------------|
| **Separation of Concerns** | Actions, Scene, Renderer, UI Components |
| **Immutability** | Elements immutable, mutations via newElementWith() |
| **Performance** | Selective renders, caching, batched updates |
| **Extensibility** | ActionManager for custom actions |
| **Accessibility** | ARIA labels, keyboard nav, screen reader |
| **Testability** | Pure functions, dependency injection |

---

## Performance Optimizations

1. **Memoization** - React.memo() with shallow comparison
2. **Batched Updates** - flushSync() for critical changes
3. **Lazy Rendering** - Visible elements only
4. **Shape Caching** - Pre-computed element shapes
5. **RAF Throttling** - Animation frame throttling
6. **Debouncing** - Resize and scroll handlers

---

## Extension Points

- **Actions**: `api.registerAction()`
- **Components**: Override UI via render props
- **Callbacks**: onChange, onExport, onPointerUpdate
- **API Methods**: updateScene(), mutateElement()

---

## 🔗 Related Documentation

- **Architecture**: [`docs/technical/architecture.md`](../technical/architecture.md)
- **Current Focus**: [`activeContext.md`](activeContext.md)
- **Decisions**: [`decisionLog.md`](decisionLog.md)
- **Product**: [`docs/product/PRD.md`](../product/PRD.md)
- **Setup**: [`docs/technical/dev-setup.md`](../technical/dev-setup.md)
