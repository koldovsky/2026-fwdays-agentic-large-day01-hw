# Excalidraw Domain Glossary

A comprehensive dictionary of terms used in the Excalidraw codebase, with definitions in the project context, locations in the code, and clarifications about their specific meaning.

---

## Core Data Model

### Element

**Definition**: The fundamental unit of a drawing - any visual object on the canvas such as a rectangle, circle, text, arrow, or image.

**In the code**: `ExcalidrawElement` is the discriminated union type that represents all possible element types. Elements are immutable objects stored in the Scene.

**Key properties**:
- `id`: Unique identifier (nanoid)
- `type`: Element type discriminator
- `x, y`: Canvas position
- `width, height`: Dimensions
- `angle`: Rotation in radians
- `strokeColor, backgroundColor`: Styling
- `strokeWidth, strokeStyle`: Stroke properties
- `opacity, roughness`: Appearance
- `isDeleted`: Soft-delete flag
- `version, versionNonce`: For reconciliation
- `index`: Fractional index for ordering
- `groupIds`: Parent groups
- `frameId`: Parent frame
- `boundElements`: Connected elements (arrows, text)

**Where used**: 
- `packages/element/src/types.ts` (line 206+)
- All action handlers
- Renderer and collision detection
- Scene storage

**DO NOT confuse with**:
- **DOM Element**: In Excalidraw, "Element" refers to drawing objects, not HTML elements
- **Visual Element**: An Element can be invisible (deleted, outside viewport, etc.)
- **Primitive**: Element is a discriminated union of 11+ types, not a single primitive

---

### ExcalidrawElement

**Definition**: The TypeScript discriminated union type representing all possible drawing elements in Excalidraw. Each variant corresponds to a specific type of drawable object.

**Element types**:
- `rectangle` - Rectangular shape
- `diamond` - Diamond/rhombus shape
- `ellipse` - Circular/elliptical shape
- `arrow` - Line with optional arrowheads and binding
- `line` - Multi-point line
- `freedraw` - Freehand drawn path
- `text` - Text element with font properties
- `frame` - Container for grouping elements
- `magicframe` - AI-generated frame container
- `image` - Embedded image
- `embeddable` - Embedded iframe/content
- `iframe` - Iframe container

**Where used**:
- `packages/element/src/types.ts` (types for each variant)
- Action handlers for element-specific operations
- Collision detection and rendering logic
- Export/import serialization

**Base properties inherited by all**:
- Styling: colors, stroke, opacity
- Transform: position, size, rotation
- Metadata: id, version, frameId, groupIds

**DO NOT confuse with**:
- **JavaScript Element API**: Not related to DOM
- **Generic element**: Each variant has type-specific properties
- **Deleted element**: An Element can have `isDeleted: true` and still exist in Scene

---

## State Management

### AppState

**Definition**: A monolithic object containing 100+ properties that represent the complete state of the Excalidraw editor at any point in time, excluding the elements themselves.

**Major property categories**:
1. **Viewport**: scrollX, scrollY, zoom, width, height, offset*
2. **Tool**: activeTool, penMode, penDetected, preferredSelectionTool
3. **Selection**: selectedElementIds, selectedGroupIds, hoveredElementIds
4. **Editing**: editingTextElement, editingGroupId, newElement, resizingElement
5. **Styling**: currentItemStrokeColor, currentItemOpacity, currentItemFontFamily, etc.
6. **UI**: theme, openMenu, openDialog, openSidebar, showWelcomeScreen
7. **Collaboration**: collaborators (Map), userToFollow
8. **Canvas**: gridModeEnabled, viewModeEnabled, zenModeEnabled, bindingEnabled
9. **Export**: exportWithDarkMode, exportBackground, exportScale

**Where used**:
- `packages/excalidraw/appState.ts` (default state initialization)
- `packages/excalidraw/types.ts` (AppState interface, ~400 lines)
- `packages/excalidraw/components/App.tsx` (this.state in class component)
- Passed through Context API to all components
- `this.setState()` updates in App component

**DO NOT confuse with**:
- **Scene elements**: AppState doesn't store elements (they're in Scene)
- **Component state**: AppState is global, not local component state
- **UI-only state**: Jotai atoms handle some UI state separately
- **Server state**: AppState is local to the editor instance
- **Immutable**: AppState updates create new objects via setState()

---

### Scene

**Definition**: The manager class that stores and tracks all drawing elements (the "model" in model-view-controller). Elements are persisted in the Scene, not in AppState.

**Responsibilities**:
- Store all elements (including deleted ones for undo/redo)
- Provide element access methods (getSelectedElements, getNonDeletedElements)
- Maintain element map for O(1) lookup by ID
- Trigger updates when elements change
- Support element subscription via onUpdate()

**Key methods**:
- `getSelectedElements(appState)`: Return user-selected elements
- `getNonDeletedElements()`: Active (non-deleted) elements only
- `getElementsIncludingDeleted()`: All elements for undo/redo
- `getNonDeletedElementsMap()`: Map for efficient lookup
- `onUpdate(callback)`: Subscribe to changes
- `triggerUpdate()`: Signal that elements changed

**Where used**:
- `packages/element/src/Scene.ts` (class definition)
- Created in `App.tsx` constructor as `this.scene`
- All action handlers access via `this.scene.getNonDeletedElements()`
- Renderer queries for visible elements
- History system stores scene snapshots

**DO NOT confuse with**:
- **Viewport**: Scene contains all elements, not just visible ones
- **AppState**: Scene stores elements, AppState stores UI state
- **Canvas**: Scene is the data model, canvas is the render target
- **3D Scene**: Excalidraw's Scene is 2D, despite the term's 3D association

---

### Store

**Definition**: A change-tracking layer that records all mutations to Scene as incremental deltas, enabling undo/redo and real-time collaboration via change broadcasting.

**Core concepts**:
- Tracks every element mutation as a delta
- Distinguishes between DurableIncrement (persisted) and EphemeralIncrement (sync-only)
- Emits changes so consumers (History, Socket.io) can respond
- Supports snapshots for rollback

**Key types**:
- `StoreIncrement`: Base class for changes
- `DurableIncrement`: Changes that go to history
- `EphemeralIncrement`: Changes not in local history (from peers)
- `StoreDelta`: Container for element changes
- `AppStateDelta`: Container for AppState changes

**Key emitters**:
- `onDurableIncrementEmitter`: For history recording
- `onStoreIncrementEmitter`: For external listeners
- Listens to both and broadcasts to Socket.io

**Where used**:
- `packages/element/src/store.ts` (Store class and types)
- `packages/excalidraw/history.ts` (receives DurableIncrement)
- `packages/excalidraw/components/App.tsx` (lines 3098-3107, subscribes to increments)
- Collaboration system broadcasts increments

**DO NOT confuse with**:
- **Scene**: Store is the change log, Scene is the data model
- **History**: Store tracks all changes, History selects which to keep
- **Redux store**: Store doesn't manage all state, just element changes
- **Browser storage**: Store is in-memory, not persistent by itself

---

### History

**Definition**: An undo/redo stack that records user actions as serializable deltas so they can be replayed forward or backward.

**Mechanism**:
- Records each DurableIncrement from Store
- Maintains two stacks: undo (backward) and redo (forward)
- When undo is called, pops from undo stack and pushes to redo stack
- Applies delta to Scene to restore previous state
- Supports grouping multiple changes into single undo unit

**Key methods**:
- `record(delta)`: Add change to undo stack
- `undo()`: Pop undo stack, apply delta, push to redo stack
- `redo()`: Pop redo stack, apply delta, push to undo stack
- `clear()`: Clear both stacks

**Where used**:
- `packages/excalidraw/history.ts` (History class)
- Created in `App.tsx` constructor as `this.history`
- Receives DurableIncrement via `store.onDurableIncrementEmitter`
- Accessed via ActionManager for undo/redo actions
- Cleared on scene reset

**DO NOT confuse with**:
- **Browser history**: Not related to back/forward buttons
- **Git history**: Not version control, just local undo/redo
- **Time travel**: Limited to individual editor session
- **Collaboration history**: History is local-only, not shared

---

## Interactions & Actions

### Action

**Definition**: A discrete, reusable operation that can be triggered by user input (keyboard, mouse, menu) and produces a state or element change.

**Components**:
- `name`: Unique identifier (e.g., "delete", "duplicate")
- `label`: User-facing name (e.g., "Delete")
- `perform(elements, appState, value?, app?)`: Core logic returning partial state update
- `predicate(appState)`: Determines if action is enabled
- `keyTest(event)`: Keyboard shortcut binding
- `icon`: Visual representation
- `keywords`: For search/discovery

**Lifecycle**:
1. User triggers via keyboard, menu, or button
2. ActionManager checks `predicate()`
3. If enabled, calls `perform()`
4. Returns partial state update
5. App.setState() merges update
6. Scene mutates if needed

**48 registered actions** (examples):
- Canvas: zoom, pan, export, reset
- Selection: selectAll, invertSelection, deselect
- Element: delete, duplicate, lock, hide
- Styling: changeColor, changeStrokeWidth
- Groups: group, ungroup
- Frames: createFrame, bringToFrame
- Text: convertToCodeSandbox
- Alignment: alignLeft, distributeHorizontally

**Where used**:
- `packages/excalidraw/actions/` (48 action files)
- `packages/excalidraw/actions/manager.tsx` (ActionManager class)
- Created in `App.tsx` constructor, registered during init
- Triggered by event handlers in App component

**DO NOT confuse with**:
- **Redux actions**: Actions don't require dispatchers or reducers
- **Event handler**: Action is higher-level than raw events
- **User interaction**: Multiple interactions may trigger same action
- **Side effect**: Actions primarily update state, minimal side effects

---

### Tool

**Definition**: A drawing mode or tool type that determines how the editor interprets user pointer input and what gets created.

**Tool types** (11 total):
- `selection` - Default mode, select and manipulate elements
- `rectangle` - Draw rectangular shapes
- `diamond` - Draw diamond shapes
- `ellipse` - Draw circular/elliptical shapes
- `arrow` - Draw lines with arrowheads
- `line` - Draw multi-point lines
- `freedraw` - Freehand drawing
- `text` - Add text elements
- `eraser` - Delete elements by drawing over them
- `laser` - Temporary pointer trail (presentation mode)
- `hand` - Pan the canvas

**Active tool state** in AppState:
```typescript
activeTool: {
  type: ToolType           // Currently selected tool
  locked: boolean          // Tool stays active after use
  fromSelection: boolean   // Was activated from selection
  lastActiveTool: string   // Previous tool (for toggling)
}
```

**Tool properties**:
- Different styling applies based on tool (e.g., color for shape tools)
- Tool handlers intercept pointer events differently
- Selection tool: Click to select, drag to move
- Draw tools: Click-drag to create
- Eraser: Click-drag to delete

**Where used**:
- `packages/excalidraw/types.ts` (ToolType enum-like)
- `packages/excalidraw/components/App.tsx` (tool event handlers)
- `packages/excalidraw/appState.ts` (activeTool property)
- `packages/excalidraw/actions/` (action files for each tool)

**DO NOT confuse with**:
- **Action**: Tool is a mode, not a single operation
- **Cursor**: Tool affects behavior, cursor shows tool visually
- **Render mode**: Tool affects input handling, not rendering
- **Brush**: In Excalidraw, tools create elements, not pixels

---

### Collaborator

**Definition**: A remote user connected to a real-time editing session, represented by a socket ID, username, cursor position, and visual indicators.

**Collaborator properties**:
- `socketId`: Unique connection identifier
- `username`: Display name (or initials)
- `userState`: Idle state (active, away)
- `pointer`: Current cursor position (x, y)
- `button`: Mouse button state (up/down)
- `selectedElementIds`: Elements they have selected
- `color`: Avatar background and stroke colors
- `userId`: User identifier for persistence

**Collaborator data** stored in AppState:
- `collaborators: Map<SocketId, Collaborator>` - All active users
- `userToFollow: Collaborator | null` - User currently being followed
- Visual indicators on canvas show collaborator cursors and selections

**Presence updates** sent via Socket.io:
- Cursor position on each pointer move
- Selection changes
- Idle/active state changes

**Where used**:
- `packages/excalidraw/types.ts` (Collaborator type definition)
- `packages/excalidraw/components/App.tsx` (AppState.collaborators)
- Collaboration handlers in app data layer
- Rendered as cursors and selection highlights on canvas

**DO NOT confuse with**:
- **User account**: Collaborator is session-based, not persistent
- **Author**: Collaborator is an active connection, not document history
- **Cursor**: Collaborator includes much more than cursor position
- **Selection**: Collaborator has multiple properties beyond selection

---

## Persistence & Synchronization

### Binding

**Definition**: A connection between an arrow element and another element (rectangle, text, etc.), allowing the arrow endpoint to "stick" to the target and move with it.

**Binding types**:
- `startBinding`: Arrow start point connected to element
- `endBinding`: Arrow end point connected to element

**Binding properties** in FixedPointBinding:
- `elementId`: ID of bound target element
- `fixedPoint`: [0-1, 0-1] normalized coordinates on target
- `gap`: Distance offset from target edge

**Binding behavior**:
- When target moves, bound arrows move
- When target resizes, binding point stays proportionally positioned
- Multiple arrows can bind to same element
- Binding persists through undo/redo and collaboration

**Binding detection** via collision:
- On arrow drag, detect nearby bindable elements
- Calculate closest point on target
- Store normalized position for future updates

**Where used**:
- `packages/element/src/binding.ts` (binding logic, 100+ functions)
- Arrow element `startBinding` and `endBinding` properties
- Collision detection during element moves
- Reconciliation during collaboration
- Update propagation when target element changes

**DO NOT confuse with**:
- **Grouping**: Binding is directional (arrow to target), grouping is symmetric
- **Parent-child**: Binding is metadata, not hierarchy
- **Constraint**: Binding is visual connection, not mathematical constraint
- **Link**: Element `link` property is a URL, binding is spatial

---

### Reconciliation

**Definition**: The process of merging concurrent changes from multiple collaborators when two versions of the same element exist with different histories.

**Reconciliation strategy** (Last-Write-Wins):
1. Compare `version` number (incrementing counter)
2. If versions equal, compare `versionNonce` (random tie-breaker)
3. Higher wins, lower is discarded
4. Applied delta from winner overwrites loser
5. Reconciled element gets new version/nonce

**Reconciliation triggers**:
- Remote change arrives while local change pending
- Local element modified while peer modified same element
- Undo/redo applied with pending remote changes

**Reconciliation scope**:
- Element-level (full element comparison)
- AppState-level (property-by-property merge)

**Where used**:
- `packages/excalidraw/data/reconcile.ts` (reconciliation logic)
- Real-time collaboration flow
- Applied when Socket.io emits remote changes
- Handles concurrent editing of same element

**DO NOT confuse with**:
- **Merge conflict**: Reconciliation is automatic, conflicts hidden
- **Git merge**: Reconciliation is last-write-wins, not semantic merge
- **CRDT**: Excalidraw uses operational transformation + LWW, not CRDT
- **Conflict resolution**: Reconciliation is deterministic, no user choice

---

### Delta

**Definition**: An incremental, serializable representation of changes to elements or AppState that can be replayed to recreate the state change without storing full snapshots.

**Delta types**:
- `StoreDelta`: Container for element changes
- `AppStateDelta`: Container for AppState changes
- `ElementsDelta`: Specific changes to elements
- `HistoryDelta`: Delta stored in undo/redo stack

**Delta contents**:
- `before`: Previous state (for undo)
- `after`: New state (for redo)
- `type`: Change type (create, update, delete)

**Advantages**:
- Smaller than full snapshots
- Replayable (deterministic)
- Composable (deltas can be chained)
- Collaborative (can be broadcast to peers)

**Where used**:
- `packages/element/src/delta.ts` (Delta classes)
- Store emits deltas on every change
- History records deltas for undo/redo
- Collaboration broadcasts deltas to peers
- Serialized in save files as deltas

**DO NOT confuse with**:
- **Diff**: Delta is change description, diff is visual comparison
- **Patch**: Delta is structured data, patch is text format
- **Transaction**: Delta is atomic change, transaction is logical grouping
- **Snapshot**: Delta is incremental, snapshot is full state

---

### Increment

**Definition**: A discrete change event recorded by the Store, distinguished as either Durable (persisted to history) or Ephemeral (synchronization-only from remote peers).

**Two increment types**:

1. **DurableIncrement**: Local user change
   - Gets recorded in History for undo/redo
   - Gets stored in local persistence
   - Broadcasted to peers
   - Persisted to database

2. **EphemeralIncrement**: Remote peer change
   - NOT recorded in local history
   - Applied to Scene immediately
   - NOT persisted locally
   - Doesn't trigger undo/redo

**Store emitters**:
- `onDurableIncrementEmitter`: For local changes → History
- `onStoreIncrementEmitter`: For all changes → external listeners

**Purpose**: 
- Prevents undo/redo from reverting peer changes
- Allows peers to maintain independent undo stacks
- Separates local user actions from collaboration sync

**Where used**:
- `packages/element/src/store.ts` (Increment types)
- `packages/excalidraw/components/App.tsx` (line 3098-3107, subscribes to both)
- `packages/excalidraw/history.ts` (only records Durable)
- Collaboration system forwards to Socket.io

**DO NOT confuse with**:
- **Action**: Increment is recorded change, action is user operation
- **Event**: Increment has structured delta, event is just notification
- **Version**: Increment is change record, version is identity number
- **Broadcast**: Increment is local tracking, broadcast is network

---

## Rendering & Visualization

### Renderer

**Definition**: The system that converts Scene elements and AppState (viewport, zoom) into HTML5 Canvas pixel output, handling viewport culling, styling, and layering.

**Rendering pipeline**:
1. **getRenderableElements()**: Query Scene for visible elements
   - Filter by viewport bounds
   - Include newly created elements
   - Filter out deleted elements
2. **Static scene**: Off-screen render of base elements
3. **Interactive scene**: On-screen render with UI overlays
4. **Snap guides**: Optional alignment and distribution guides
5. **Canvas output**: Pixel data to browser

**Renderer responsibilities**:
- Viewport culling (only render visible elements)
- Z-index sorting
- Transform calculations (position, rotation, scale)
- Styling application (colors, opacity, stroke)
- Text rendering with correct fonts
- Performance optimization (caching, batching)

**Render stages** (in renderer/):
- `interactiveScene.ts`: Interactive elements (selections, hovers)
- `staticScene.ts`: Base elements
- `renderSnaps.ts`: Alignment guides
- `animation.ts`: Frame interpolation

**Where used**:
- `packages/excalidraw/scene/Renderer.ts` (Renderer class)
- Called from App.render() → React renders → Canvas updated
- React requestAnimationFrame loop for 60 FPS

**DO NOT confuse with**:
- **React**: Renderer is canvas-based, not React components
- **SVG**: Renderer uses Canvas API, not SVG
- **Canvas**: Renderer is the abstraction, canvas is the target
- **Scene**: Renderer queries Scene, doesn't store elements

---

### RenderableElements

**Definition**: The subset of Scene elements that should be rendered in the current viewport, including visibility filtering and transform information.

**Calculation includes**:
- Viewport bounds check (scrollX/Y, zoom, width/height)
- Visible elements only (not deleted)
- Text container bounds
- Frame bounds and children

**RenderableElements output**:
- `elementsMap`: Map of ID → element for reference
- `visibleElements`: Array of elements in render order

**Usage in rendering**:
- Iterate visibleElements to draw each
- Use elementsMap for collision checks during interactions
- Cache RenderableElements if scene hasn't changed (scene nonce)

**Where used**:
- `packages/excalidraw/scene/export.ts` (getRenderableElements())
- `packages/excalidraw/components/App.tsx` render() method
- Renderer queries before rendering frame
- Collision detection uses visibleElements

**DO NOT confuse with**:
- **All elements**: RenderableElements is filtered subset
- **Selected elements**: RenderableElements includes unselected
- **Viewport**: RenderableElements are elements in viewport
- **Layer**: RenderableElements are visibility-filtered, not z-ordered

---

### Collision Detection

**Definition**: The process of determining if a pointer position or rectangle overlaps with an element on the canvas, used for selection and binding.

**Collision types**:
1. **Point collision**: Does point (x, y) hit element?
2. **Rectangle collision**: Does rectangle overlap element bounds?
3. **Binding collision**: Is there a nearby bindable element for arrow connection?

**Collision detection methods**:
- Bounding box check (fast, approximate)
- Element-specific hit test (slow, precise)
- Binding distance threshold (special for arrows)

**Where used**:
- `packages/element/src/collision.ts` (collision logic)
- `packages/element/src/binding.ts` (binding detection)
- Pointer event handlers to determine clicked element
- Selection box calculation
- Arrow binding during drag

**DO NOT confuse with**:
- **Intersection**: Collision is point/box vs element, intersection is element vs element
- **Overlap**: Collision detection checks hit, overlaps are element boundaries
- **Bounds**: Collision uses bounds for perf, tests actual shape
- **Physics**: Collision has no momentum or response, just detection

---

## Structures & Organization

### Frame

**Definition**: A container element that groups other elements together, providing visual organization and enabling frame-specific operations like fitting to content or scaling children.

**Frame properties**:
- Acts as a special rectangle
- Can contain child elements
- Visible border with name
- `frameId` in child elements points to parent frame

**Frame operations**:
- Create frame around selection
- Add elements to frame
- Remove elements from frame
- Fit frame to content
- Frame-aware grouping

**Frame constraints**:
- Elements inside frame inherit frameId
- Frames can be nested (frame inside frame)
- Frames affect selection and collision
- Frame boundaries define element containment

**Where used**:
- Element type: `frame` (in ExcalidrawElement types)
- Element property: `frameId` (which frame element belongs to)
- `packages/element/src/frame.ts` (frame operations)
- Actions: `createFrame`, `bringToFrame`
- Selection: frame-aware selection

**DO NOT confuse with**:
- **Group**: Frame is visual container, group is selection grouping
- **Layer**: Frame is hierarchy, layer is z-order
- **Viewport**: Frame is element, viewport is camera view
- **SVG `<g>`**: Frame is semantic Excalidraw concept, not DOM

---

### Group

**Definition**: A logical collection of elements that move and transform together when selected, maintaining group identity through `groupIds` array on elements.

**Group characteristics**:
- Multiple elements share same groupId
- `groupIds` array on element (deepest to shallowest)
- Selecting one grouped element selects all in group
- Moving one moves all in group
- Can have nested groups (hierarchy)

**Group operations**:
- Create group: Select elements → Ctrl+G
- Ungroup: Select group → Ctrl+Shift+G
- Add to group: Element.groupIds.push(newGroupId)
- Remove from group: Element.groupIds = Element.groupIds.filter(...)

**Group selection**:
- Clicking grouped element selects entire group
- Second click enters group (select individual)
- AppState tracks: selectedElementIds + selectedGroupIds

**Where used**:
- Element property: `groupIds: readonly GroupId[]`
- `packages/element/src/groups.ts` (group operations)
- Selection logic considers groupIds
- Action filtering checks groupIds
- Grouping actions in actions/

**DO NOT confuse with**:
- **Frame**: Group is selection/movement, frame is visual container
- **Layer**: Group is horizontal collection, layer is z-order
- **Class**: Group is runtime collection, not structural hierarchy
- **SVG group**: Group is Excalidraw model, not DOM element

---

### Library

**Definition**: A persistent, user-managed collection of reusable drawing elements that can be inserted into any drawing, supporting publishing and sharing.

**Library items** contain:
- `id`: Unique identifier
- `elements`: Array of ExcalidrawElements (shape, text, etc.)
- `created_at`: Creation timestamp
- `updated_at`: Update timestamp

**Library operations**:
- Add to library: Right-click element → "Add to library"
- Insert from library: Drag from library panel
- Delete from library: Right-click → "Delete"
- Publish library: Share library as JSON
- Import library: From file or URL

**Library storage**:
- Local: IndexedDB (via idb-keyval)
- Cloud: Firebase storage (with auth)
- Sync: Library updates sync across devices

**Where used**:
- `packages/excalidraw/data/library.ts` (Library class)
- `packages/excalidraw/components/LibraryMenu.tsx` (UI)
- Element type: `library` (in LibraryItem)
- AppState: `libraryItems` (in Jotai atom)

**DO NOT confuse with**:
- **Gallery**: Library is persistent, gallery is temporary
- **Template**: Library item is reusable element collection
- **Asset**: Library stores elements, assets are media files
- **Theme**: Library is content, theme is styling

---

## Technical Concepts

### NonDeletedExcalidrawElement

**Definition**: A type alias for ExcalidrawElement where `isDeleted` is always false, used for type safety when working with active elements.

**Purpose**: 
- Type system enforces deleted elements aren't accidentally rendered
- Functions that need active elements can require this type
- Runtime filter: `element.isDeleted === false`

**Where used**:
- Function signatures: `getNonDeletedElements(): NonDeletedExcalidrawElement[]`
- Scene queries: `scene.getNonDeletedElements()`
- Rendering: Only renders NonDeletedExcalidrawElement
- Collision: Only checks NonDeletedExcalidrawElement

**DO NOT confuse with**:
- **Active element**: NonDeleted is stricter than active (visible)
- **Soft delete**: isDeleted flag is still present, just filtered
- **Purged**: Soft-deleted elements can be undeleted via undo
- **Hard delete**: Never implemented in Excalidraw

---

### ViewportCoords vs SceneCoords

**Definition**: Two coordinate systems - viewport coords are screen/canvas pixels, scene coords are logical drawing space coordinates independent of zoom/pan.

**ViewportCoords**:
- Screen space (0,0 is canvas top-left)
- Relative to viewport size
- Affected by zoom
- Used for mouse events, canvas drawing

**SceneCoords**:
- Logical drawing space (0,0 is world origin)
- Independent of zoom/pan
- Element positions stored in scene coords
- Used for collision, element operations

**Conversion**:
```typescript
sceneCoords = viewportCoordsToSceneCoords(viewportCoords, appState)
viewportCoords = sceneCoordsToViewportCoords(sceneCoords, appState)
```

**Where used**:
- Pointer events arrive in viewport coords, converted to scene
- Element positions stored in scene coords
- Rendering converts scene → viewport for canvas drawing
- Collision detection in scene coords

**DO NOT confuse with**:
- **World coords**: Same as scene coords
- **Absolute coords**: Element coords are absolute in scene space
- **Relative coords**: No relative coordinate system in Excalidraw
- **Canvas coords**: Same as viewport coords

---

### Mutable vs Immutable

**Definition**: In Excalidraw, elements are treated as immutable - operations create new element objects rather than modifying existing ones.

**Immutable pattern**:
```typescript
// Wrong (mutation)
element.x = 100

// Right (immutable)
const newElement = mutateElement(element, { x: 100 })
// or
const newElement = { ...element, x: 100 }
```

**Benefits**:
- Enables undo/redo (keep old version)
- Simplifies collaboration (can track versions)
- React-friendly (clear change detection)
- Deterministic (no hidden side effects)

**Where used**:
- All action handlers create new elements
- `mutateElement()` function for updates
- Scene stores references to immutable objects
- History stores immutable snapshots

**DO NOT confuse with**:
- **Frozen**: Objects aren't Object.freeze(), just treated as immutable by convention
- **Shallow immutable**: Only top-level is immutable, nested objects might mutate
- **Unmodifiable**: Objects can be modified, we just don't
- **Copy-on-write**: We always copy, not lazy

---

## Integration Points

### Socket.io (Real-time Collaboration)

**Definition**: WebSocket library used to establish persistent connection with collaboration server for broadcasting element changes and presence updates to peer users.

**Integration**:
- Receives remote change increments
- Broadcasts local change increments
- Emits presence (cursor, selection, user state)
- Handles reconnection and sync

**Flow**:
1. Local change triggers DurableIncrement
2. Increment broadcasted via socket.emit()
3. Server relays to other clients
4. Remote receive creates EphemeralIncrement
5. Applied to Scene without undo/redo

**Where used**:
- `excalidraw-app/collab/` (collaboration logic)
- `excalidraw-app/data/firebase.ts` (server integration)
- Socket.io connection setup and event handlers

**DO NOT confuse with**:
- **WebRTC**: Socket.io uses server relay, not P2P
- **HTTP polling**: Socket.io uses WebSocket persistent connection
- **Synchronous**: Socket.io updates are eventual consistency

---

### Firebase (Cloud Persistence)

**Definition**: Google's backend platform used for cloud storage of drawings, real-time database of changes, and user authentication.

**Integration**:
- Firestore: Stores drawing documents and metadata
- Storage: Stores images and file attachments
- Auth: User authentication
- Realtime: Listeners for remote changes

**Data stored**:
- Drawings as serialized JSON with elements array
- User metadata and sharing permissions
- Presence/session data for collaboration

**Where used**:
- `excalidraw-app/data/firebase.ts` (Firebase setup)
- Cloud save button in UI
- User authentication flow
- Real-time collaboration via Firestore listeners

**DO NOT confuse with**:
- **IndexedDB**: Firebase is cloud, IndexedDB is local browser storage
- **localStorage**: Firebase persists server-side, localStorage is device-only
- **Real-time sync**: Firebase listeners vs Socket.io broadcasts (different approaches)

---

## UI & Interactions

### ActiveTool

**Definition**: The currently selected tool (drawing mode) tracked in AppState, determining how pointer events are interpreted and what elements get created.

**ActiveTool object**:
```typescript
{
  type: ToolType              // Current tool: selection, rectangle, etc.
  customType: null | string   // For custom tools
  locked: boolean             // Tool repeats after use
  fromSelection: boolean      // Was activated from selection tool
  lastActiveTool: null | string  // Previous tool (for toggling)
}
```

**Tool switching**:
- User clicks toolbar button
- Action handler updates activeTool via setState
- Pointer handlers check activeTool type
- Different handlers for different tools

**Where used**:
- AppState property: `activeTool`
- Tool action handlers in actions/
- Pointer event handlers in App component
- Rendered as toolbar highlight

**DO NOT confuse with**:
- **Cursor**: ActiveTool affects behavior, cursor shows visually
- **Mode**: ActiveTool is the specific tool, mode might group tools
- **State**: ActiveTool is one property in AppState

---

### Undo/Redo

**Definition**: Feature allowing users to reverse (undo) or restore (redo) changes, implemented via History stack consuming DurableIncrement events from Store.

**Undo/Redo actions**:
- Ctrl+Z: Pop undo stack, apply delta, push to redo stack
- Ctrl+Shift+Z (or Cmd+Shift+Z): Pop redo stack, apply delta, push to undo stack

**Mechanics**:
1. User makes change (e.g., delete element)
2. Store emits DurableIncrement with delta
3. History.record(delta) pushes to undo stack
4. User hits Ctrl+Z
5. History pops undo stack (got "delete" delta)
6. Applies inverse delta (recreates element)
7. Pushes to redo stack

**State after undo**:
- Scene restored to previous element state
- AppState partially restored
- Redo stack has the undone change

**Where used**:
- `packages/excalidraw/history.ts` (History class)
- Actions: `undo`, `redo` in actions/
- Keyboard shortcuts: Ctrl+Z, Ctrl+Shift+Z
- AppState tracks history state in UI

**DO NOT confuse with**:
- **Git undo**: No commits, just local state
- **Browser back**: No page navigation
- **Soft delete**: Undo is change reversal, not element recovery
- **Version history**: No temporal snapshots, just delta replaying

---

## Summary

This glossary covers the essential domain vocabulary used throughout the Excalidraw codebase. Understanding these terms is critical for:

1. **Reading code**: Terms appear consistently across files
2. **Contributing**: Must speak the same language as codebase
3. **Debugging**: Understanding error messages and logs
4. **Designing features**: Building on existing concepts

Each term is deeply rooted in the actual implementation and the specific way Excalidraw works, not just generic software engineering concepts.

---

## 🔗 Related Documentation

**Get more context:**
- **Memory Bank**: See [`docs/memory/`](../memory/) for foundational understanding:
  - [`systemPatterns.md`](../memory/systemPatterns.md) - How these concepts are implemented
  - [`techContext.md`](../memory/techContext.md) - Technology stack that uses these terms
  - [`decisionLog.md`](../memory/decisionLog.md) - Why these design choices were made
- **Product Requirements**: See [`PRD.md`](PRD.md) for business context
- **Architecture**: See [`docs/technical/architecture.md`](../technical/architecture.md) for how terms relate
- **Setup Guide**: See [`docs/technical/dev-setup.md`](../technical/dev-setup.md) for hands-on learning
