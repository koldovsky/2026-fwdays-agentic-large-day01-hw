# System Architecture & Design Patterns

## High-Level Architecture

### Three-Layer System

```
┌─────────────────────────────────┐
│   UI Layer (React Components)   │  ← Excalidraw-app
│   Buttons, Menus, Dialogs       │
└────────────┬────────────────────┘
             │ Actions
┌────────────▼────────────────────┐
│   State Management (Jotai)      │  ← AppState + EditorState
│   Elements, UI, Zoom, Selection │
└────────────┬────────────────────┘
             │ Mutations
┌────────────▼────────────────────┐
│   Rendering Engine (Canvas)     │  ← Interactive/Static Scenes
│   Shape drawing, transformation │
└─────────────────────────────────┘
```

## Core Architectural Patterns

### 1. Immutable Data Model

**Purpose**: Enable deterministic updates and time-travel debugging

```typescript
// ❌ WRONG - Direct mutation
element.x = 100;

// ✓ CORRECT - Create new object
newElementWith(element, { x: 100 });
const updated = mutateElement(element, { x: 100 }, mutationList);
```

**Benefits**:
- Deterministic for collaborative scenarios
- Enables undo/redo without storing full history
- Safe concurrent updates without locks
- Renders only changed subtrees

### 2. Fractional Indexing for Ordering

**Purpose**: Handle concurrent insertions without server coordination

```typescript
// Elements ordered by fractional index, not array position
type ExcalidrawElement = {
  index: "a0" | "a1v" | "a2z" | null;  // Sortable string
};

// Inserting between "a0" and "a1v" generates "a0u"
// No coordination needed - insertions never conflict
```

**Why**: Resolves insertion order conflicts in multiplayer scenarios without requiring a central server to assign positions.

### 3. Version-Based Reconciliation

**Purpose**: Detect and resolve concurrent updates

```typescript
type ExcalidrawElement = {
  version: number;      // Sequential counter
  versionNonce: number; // Random per update
};

// During sync:
// - If versions match → same element, no sync needed
// - If local > remote → keep local (newer)
// - If remote > local → merge remote changes
// - If versions equal but nonces differ → conflict!
```

**Conflict Resolution**:
- Timestamp-based (last-write-wins)
- Bias towards local user for UX
- Store full history for undo

### 4. Jotai Atoms for Fine-Grained Reactivity

**Purpose**: Efficient state updates with minimal re-renders

```typescript
// Granular atoms instead of one big state tree
const selectedElementIdsAtom = atom<Record<string, true>>({});
const zoomAtom = atom({ value: 1 });
const scrollAtom = atom({ x: 0, y: 0 });

// Subscribe only to what you need
const [selectedIds] = useAtom(selectedElementIdsAtom);

// Updates only trigger re-renders for subscribed atoms
setAtom(zoomAtom, { value: 2 }); // Only zoom subscribers re-render
```

**Advantages**:
- No selector function overhead
- Can bypass React context if needed
- Works across component boundaries
- Tiny bundle size (~3KB)

### 5. Context Provider Pattern for Embedding

**Purpose**: Isolate component state when embedded in external apps

```typescript
<ExcalidrawAPIProvider>
  <EditorJotaiProvider>
    <Excalidraw onChange={...} onPointerUpdate={...} />
  </EditorJotaiProvider>
</ExcalidrawAPIProvider>
```

**Benefits**:
- Multiple editors don't interfere
- Can embed in existing app without conflicts
- Each instance has isolated Jotai store
- Exposes API via useExcalidrawAPI() hook

### 6. Three-Layer Canvas Rendering

**Purpose**: Optimize rendering performance

```
Static Scene (staticScene.ts)
└── Background shapes, grid, guidelines
    └── Rarely changes, cached

Interactive Scene (interactiveScene.ts)
└── User manipulation - selection boxes, transforms
    └── 60fps during interactions

SVG Export Scene (staticSvgScene.ts)
└── Vector export for PNG/SVG
    └── Different rendering rules than canvas
```

**Rendering Pipeline**:
1. Calculate scene bounds
2. Render static background
3. Render interactive elements
4. Apply selection/transform visualizations
5. Render UI overlays (grid, snap guides)

### 7. Adapter Pattern for Storage

**Purpose**: Abstract storage layer for flexibility

```typescript
// Different storage backends
interface StorageBackend {
  save(state: AppState): Promise<void>;
  load(): Promise<AppState>;
}

// Implementations
class LocalStorageAdapter implements StorageBackend { ... }
class IndexedDBAdapter implements StorageBackend { ... }
class FirebaseAdapter implements StorageBackend { ... }

// Swap at runtime based on config
```

**Adapter Types**:
- **AppState Storage**: localStorage, IndexedDB, Firebase
- **Library Storage**: Local, Cloud, Shared libraries
- **Collaboration**: Socket.io server, offline sync, incremental updates

### 8. Event Handler Architecture

**Purpose**: Unified handling of multiple input types

```typescript
// Single handler in App.tsx processes:
type PointerHandler = (
  pointerDownEvent: PointerEvent,
  pointerMoveEvent?: PointerEvent,
  pointerUpEvent?: PointerEvent,
  state: AppState
) => Partial<AppState>;

// Handlers for:
// - Rectangle creation
// - Arrow drawing
// - Text editing
// - Element selection
// - Pan/zoom
// - Bound element snapping
```

**Input Types Supported**:
- Mouse (pointerdown, pointermove, pointerup)
- Touch (multi-touch pan, pinch zoom)
- Stylus/Pen (pressure sensitivity)
- Keyboard (shortcuts, text input)

## State Management Design

### AppState Structure

```typescript
type AppState = {
  // View
  zoom: { value: number };
  scrollX: number; scrollY: number;
  viewModeEnabled: boolean;
  zenModeEnabled: boolean;

  // Selection & Editing
  selectedElementIds: Record<string, true>;  // Set-like
  editingGroupId: string | null;
  activeTool: ActiveTool;

  // UI
  openDialog: null | "discardChanges" | "library" | ...;
  showStats: boolean;

  // Collaboration
  collaborators: Record<SocketId, Collaborator>;
  userToFollow: UserToFollow | null;

  // Styling
  currentItemBackgroundColor: string;
  currentItemFillStyle: FillStyle;
  currentItemStrokeColor: string;

  // ... 50+ more properties
};
```

### Element Store

```typescript
// Separate from AppState for performance
type ElementStore = {
  elements: readonly ExcalidrawElement[];
  index: FractionalIndex | null;
  version: number;
};

// Updates via immutable operations
const addElement = (elem: ExcalidrawElement) => ({
  elements: [...elements, elem],
  version: version + 1
});
```

## Data Flow for User Actions

### Example: Rectangle Creation

```
1. Pointer Down
   → App.tsx handler
   → Create element with bounds from pointer
   → Set activeTool to RECTANGLE
   → Update selectedElementIds

2. Pointer Move (during drag)
   → Calculate new bounds from pointer
   → mutateElement() updates width/height
   → Canvas rerenders with new bounds

3. Pointer Up
   → Finalize element size
   → Element added to store
   → Trigger onChange callback
   → If collab enabled: send Increment to server

4. Render
   → interactiveScene.ts draws element
   → Selection box drawn if selected
   → Transform handles shown
```

### Example: Multi-User Sync

```
User A: Creates Rectangle
  ↓
Emit Increment { type: "createElement", element, ... }
  ↓
Socket.io → Server → All Clients
  ↓
User B Receives:
  1. Merge Increment into local elements
  2. Reconcile versions (version bump)
  3. Update AppState
  4. Canvas rerenders with new element
  ↓
User A's change appears on User B's screen (<1s)
```

## Key Design Files

### Core Logic (packages/excalidraw/)

| File | Purpose | Size |
|------|---------|------|
| `types.ts` | Public TypeScript API | 33KB |
| `components/App.tsx` | Main editor logic | 407KB |
| `renderer/interactiveScene.ts` | Interactive rendering | 57KB |
| `handlers/` | Event handlers (10+ files) | 150KB total |
| `actions/` | Editor actions (40+ files) | 200KB total |
| `data/restore.ts` | Schema migration | 31KB |
| `data/library.ts` | Library management | 31KB |

### Element Definitions (packages/element/)

| File | Purpose |
|------|---------|
| `src/types.ts` | Element type definitions (15 types) |
| `src/typeChecks.ts` | Type guards and assertions |
| `src/textElement.ts` | Text element calculations |
| `src/bounds.ts` | Bounds and overlap calculations |

## Plugin & Extension System

### Library System
```typescript
// Elements can be saved as reusable library
const library = {
  type: "excalidraw/library",
  version: 2,
  items: [
    { id: "...", element: ExcalidrawElement },
    // ... more items
  ]
};
```

### TTD (Teach The Diagram)
- Contextual help messages
- Suggestions based on user actions
- Customizable message system

### Diagram-to-Code Plugin
- AI-powered generation
- Converts sketch to code (HTML, React, etc.)
- Extensible via custom prompts

## Optimization Strategies

### 1. Selective Rendering
- Only redraw canvas when elements change
- Skip rendering off-screen elements
- Use canvas clipping for viewport optimization

### 2. Event Batching
- Throttle pointer move events (60fps)
- Debounce expensive operations
- Accumulate changes before sending to server

### 3. Memory Management
- Limit undo history size (100 entries)
- Lazy-load images
- Clean up event listeners on unmount
- Use WeakMaps for memoization where possible

### 4. Bundle Optimization
- Tree-shaking via ES modules
- Code splitting for dynamic imports
- Lazy load libraries and examples
- Minify and compress assets

## Error Handling & Resilience

### Collaborative Conflicts
- Version mismatch → re-fetch and reconcile
- Lost connection → queue changes, retry on reconnect
- Server error → show error dialog, offer offline mode

### Data Integrity
- Schema versioning → auto-migrate on load
- Validation on restore → skip invalid elements
- Checksums → detect corruption
- Backup to localStorage → recovery option

### UI Error Boundaries
- Wrapped in error boundary components
- Graceful degradation for failed features
- User notification of critical errors

## Testing Strategy

### Unit Tests (Vitest)
- Pure function testing
- Type checking with TypeScript
- Snapshot testing for complex outputs

### Integration Tests
- Canvas rendering with jsdom
- Event handler chains
- State updates and side effects

### Manual Testing
- Browser compatibility
- Touch and stylus input
- Collaboration scenarios
- Performance profiling

## Security Considerations

### Data Privacy
- Optional E2E encryption for shared links
- No mandatory cloud storage
- Local-first by default (localStorage/IndexedDB)

### Code Safety
- CSP headers in web app
- XSS prevention via sanitization
- Input validation for user content

### Dependency Management
- Regular security audits
- Minimal external dependencies
- Pinned transitive versions
