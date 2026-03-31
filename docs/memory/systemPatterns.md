# System Patterns

## Architecture Overview

**Monorepo Structure** — 7 packages managed via Yarn workspaces:
- `excalidraw` — Core editor (npm package v0.18.0)
- `element` — Element types, store, reconciliation
- `common` — Shared constants, utilities, emitters
- `math` — Vector & geometry utilities
- `utils` — General helpers
- excalidraw-app — Web application
- examples — Integration examples

---

## Core Architectural Patterns

### 1. Class Component Orchestrator
**App.tsx** (12,818 lines) — Single class component extending `React.Component<AppProps, AppState>` managing:
- Constructor: Initializes state, scene, store, history, actions, API
- Lifecycle hooks: mount/update/unmount for subscriptions & cleanup
- Event handlers for pointer, keyboard, drag, scroll, resize interactions
- Exposes `ExcalidrawImperativeAPI` for external control

### 2. Multi-Layer State Management
```
React State (AppState)
    ↓ updates sync with ↓
Store (snapshots + increments via CaptureUpdateAction)
    ↓ emits ↓
History (undo/redo via durable increments)
    ↓ observed by ↓
Observer (selective subscriptions by key/selector/predicate)
```

**CaptureUpdateAction enum** (store.ts):
- `IMMEDIATELY` — Immediately undoable, local capture for most user actions
- `NEVER` — Never undoable, for remote updates or scene initialization
- `EVENTUALLY` — Eventually undoable, for updates deferred from immediate capture

### 3. Action Manager Pattern
ActionManager class with:
- `registerAction()` — Register single action
- `registerAll()` — Register multiple actions
- `executeAction()` — Execute action with current state snapshot
- Keyboard binding support, event tracking, async action support

### 4. Event Bus Architecture
**Emitter class** (common/src/emitter.ts) — Base pub/sub with:
- `on()` — Attach subscribers with unsubscribe callback
- `once()` — Single-fire handler
- `off()` — Remove handlers
- `trigger()` — Fire event to all subscribers

**AppEventBus** (common/src/appEventBus.ts) — Typed event system with:
- Behavior config: `cardinality` (once/many), `replay` (none/last)
- Cached payload for replay
- Promise-based subscriptions for async events

### 5. React Context API (12 Contexts)
Defined across context/ and App.tsx:
- `AppContext` — Core app class properties
- `AppPropsContext` — App props
- `AppStateContext` & `SetAppStateContext` — Read/write app state
- `EditorInterfaceContext` — Editor interface
- `ElementsContext` — Scene elements
- `ActionManagerContext` — Action dispatcher
- `APISetContext` — API setter
- `ContainerContext` — Editor container DOM element
- `UIAppStateContext` — UI-specific app state
- `TunnelsContext` — Portal tunnels for modal rendering
- `DropdownMenuContentPropsContext` — Dropdown menu props

### 6. Jotai Atoms for UI State
editor-jotai.ts and app-jotai.ts:
- Isolated reactive atoms scoped per editor instance via `EditorJotaiProvider`
- `jotai-scope` for multi-editor isolation
- Global app store via `appJotaiStore`

### 7. Collaboration Layer
Collab.tsx (PureComponent) orchestrates:
- WebSocket communication via Socket.IO
- Firebase sync (Firestore, Storage)
- Remote element reconciliation
- File upload/download management
- User presence tracking

### 8. Data Pipeline
- **Encryption** — AES encryption with IV (excalidraw/data/encryption)
- **Compression** — LZ compression for sync payloads
- **Serialization** — JSON with custom revivers
- **Reconciliation** — Merge remote + local with version tracking

### 9. Immutable Data Patterns
- `newElementWith()` — Create mutated element copies
- `deepCopyElement()` — Recursive cloning
- Read-only type signatures (`readonly ExcalidrawElement[]`)

### 10. Provider Composition
```tsx
ExcalidrawAPIProvider
  ├── EditorJotaiProvider (atom isolation)
  ├── InitializeApp (language, theme setup)
  ├── App (class component, line 617)
  └── LayerUI (React component tree)
```

---

## Key Design Decisions

| Pattern | Source | Benefit |
|---------|--------|---------|
| Class component | App.tsx | Centralized state & lifecycle |
| Multi-layer store | store.ts | Selective undo capture |
| Observer pattern | AppStateObserver.ts | Performance optimization |
| Action registry | manager.tsx | Keyboard binding, tracking |
| Emitter abstraction | emitter.ts | Decoupled event handlers |
| Jotai atoms | editor-jotai.ts | Isolated UI state per instance |
| Firebase + WebSocket | Collab.tsx | Real-time collaboration |
| Immutable updates | store.ts | Undo/redo friendly |

---

## Integration Points

- **ExcalidrawImperativeAPI** — `getAppState()`, `updateScene()`, `onChange`, `onIncrement`
- **Event emitters** — Pointer, scroll, resize events
- **Render layers** — StaticCanvas, InteractiveCanvas, LayerUI
- **Collaboration API** — Remote updates via Socket.IO + Firebase

## Details
For detailed architecture → see docs/technical/architecture.md
For domain glossary → see docs/product/domain-glossary.md
