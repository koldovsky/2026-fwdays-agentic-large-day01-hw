# System Patterns - Excalidraw Architecture

## Architecture Overview

### Design
- **Pattern**: Monolithic coordinator (App.tsx) + modular subsystems
- **Primary State**: React class component (472 properties)
- **Secondary State**: Jotai atoms (isolated UI state)

### Core Subsystems
- **App** - Central orchestrator (packages/excalidraw/components/App.tsx, 12,818 lines)
- **Scene** - Element collection management
- **Store** - Change tracking (history/collaboration)
- **History** - Undo/redo stack
- **Renderer** - Visibility culling + memoization
- **ActionManager** - Command pattern executor

## State Management

### React Component State (Primary)
**Location**: App.tsx class component, 472 properties

**Categories**: Canvas (width, height, scrollX, scrollY, zoom), Tools (activeTool, selectedElementIds), Editing (editingTextElement, resizingElement), UI (openDialog, openPopup, contextMenu, toast, theme), Selection (selectedGroupIds, editingGroupId), Modes (viewModeEnabled, zenModeEnabled, gridModeEnabled)

**Update Patterns**:
1. Direct: `this.setState({ isLoading: false })`
2. Functional: `this.setState(prev => ({ count: prev.count + 1 }))`
3. Batched: `withBatchedUpdates(() => { /* setState + scene update */ })`
4. Throttled: `withBatchedUpdatesThrottled(() => { /* 60fps limit */ })`
5. Synchronous: `flushSync(() => this.setState({ bindMode: 'skip' }))`

### Jotai (Secondary)
**Location**: `packages/excalidraw/editor-jotai.ts`, **Scope**: Component UI state only, **Setup**: `createIsolation()` prevents atom conflicts, **Atoms**: convertElementTypePopupAtom, activeConfirmDialogAtom, isSidebarDockedAtom

## Key Patterns

### 1. Command Pattern (Actions)
**Location**: packages/excalidraw/actions/

```typescript
interface Action {
  name: ActionName;
  perform: (elements, appState, formData, app) => ActionResult;
  keyTest?: (event) => boolean;
  PanelComponent?: React.FC;
}

type ActionResult = {
  elements?: readonly ExcalidrawElement[];
  appState?: Partial<AppState>;
  files?: BinaryFiles;
  captureUpdate: CaptureUpdateActionType;
} | false;
```

**Benefits**: Unified keyboard shortcuts, undo/redo, UI rendering, API access

### 2. Scene Graph
Manages element collections (elements, elementsMap, nonDeleted). Calls `triggerUpdate()` on changes.

### 3. Observer Pattern
- **AppStateObserver**: Fine-grained state subscriptions
- **Event Emitters**: onChange, onPointerDown, onScrollChange

### 4. Store Pattern
Tracks deltas for history/collaboration. Methods: `applyDeltas()`, `scheduleCapture()`

### 5. Renderer Memoization
Memoizes `getRenderableElements()` - only recalculates on viewport/element changes

### 6. Portal Pattern
Uses `tunnel-rat` for flexible component placement (MainMenuTunnel, WelcomeScreenTunnel)

### 7. Imperative API
Public API: `updateScene`, `resetScene`, `setActiveTool`, `onChange`, `onPointerDown`

## Communication

### 1. Props Drilling
Standard parent → child data flow

### 2. React Context (9 providers)
AppContext, ExcalidrawAPIContext, ExcalidrawAppStateContext, ExcalidrawSetAppStateContext, ExcalidrawElementsContext, ExcalidrawActionManagerContext, EditorInterfaceContext, ExcalidrawContainerContext, TunnelsContext

### 3. Event Emitters
onChange, onPointerDown/Up, onScrollChange, onUserFollow

### 4. Action Manager Flow
User Action → executeAction() → perform() → ActionResult → syncActionResult() → setState() + Scene update → Store capture → Render

## Component Hierarchy

```text
<ExcalidrawBase>
  └─ <EditorJotaiProvider>
      └─ <App> (12,818 lines)
          ├─ 9 Context Providers
          ├─ <LayerUI> (UI orchestrator)
          │   ├─ <MainMenu>, <Actions>, <Sidebar>
          │   └─ Dialogs
          ├─ Canvas Layers:
          │   ├─ <StaticCanvas>
          │   ├─ <InteractiveCanvas>
          │   └─ <NewElementCanvas>
          └─ Overlays
```

## Data Flow

```text
User Interaction
  ↓
ActionManager.executeAction()
  ↓
action.perform() → ActionResult
  ↓
withBatchedUpdates(() => {
  setState()
  scene.replaceAllElements()
  store.scheduleAction()
})
  ↓
Renderer.getRenderableElements() [memoized]
  ↓
Canvas render
  ↓
appStateObserver.flush()
  ↓
Event emitters fire
```

### Rendering Pipeline
```text
Scene.elements
  ↓
Renderer (visibility culling)
  ↓
Split: StaticCanvas | InteractiveCanvas | NewElementCanvas
  ↓
Canvas API + rough.js
```

## Lifecycle (App.tsx)

### componentDidMount
1. API setup, 2. Store + History integration, 3. Scene updates subscription, 4. Event listeners, 5. ResizeObserver, 6. Scene initialization

### componentDidUpdate
1. State observer flush, 2. Props synchronization, 3. Scroll notifications, 4. Eraser mode handling

### componentWillUnmount
1. API invalidation, 2. Resource cleanup (renderer, scene, fonts), 3. Event listeners removal, 4. Emitters clear, 5. Cache cleanup

## Performance

### Optimizations
- **Visibility Culling**: Only render viewport elements
- **Batched Updates**: Group setState → O(n) to O(1) renders
- **Throttling**: 60fps limit on high-frequency events
- **Memoization**: Renderer caches visibility calculations
- **Image Cache**: Decode once, reuse
- **Debounced Resets**: Avoid cache thrashing

### Design Principles
1. **Unidirectional Flow**: Actions → State → Render
2. **Immutability**: Readonly elements and state
3. **Performance First**: Memoization everywhere
4. **Collaboration Ready**: Delta tracking
5. **Type Safety**: TypeScript throughout

## Related Documentation

### Memory Bank
[Tech Context](techContext.md) • [Project Brief](projectbrief.md) • [Decision Log](decisionLog.md)

### Technical Documentation
[Architecture](../technical/architecture.md) • [Dev Setup](../technical/dev-setup.md)

### Product Documentation
[PRD](../product/PRD.md) • [Domain Glossary](../product/domain-glossary.md)
