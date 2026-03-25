# Excalidraw Domain Glossary

A comprehensive glossary of domain-specific terms used in the Excalidraw codebase, organized by category.

---

## Core Element Types

### Element
**Definition**: Any drawable object on the canvas (shapes, text, images, arrows, etc.)
**Key Files**: `/packages/element/src/types.ts`
**Project Meaning**: In Excalidraw, elements are JSON-serializable objects with no computed data, designed to be shared between peers in collaborative scenarios
**Not to be confused with**: DOM Element (in general web development) or UI Component

### ExcalidrawElement
**Definition**: Type union encompassing all drawable object types in Excalidraw
**Key Files**: `/packages/element/src/types.ts`
**Related Types**: ExcalidrawRectangleElement, ExcalidrawTextElement, ExcalidrawArrowElement, ExcalidrawImageElement, ExcalidrawFrameElement
**Special Property**: `type` field distinguishes element kind (rectangle, text, arrow, etc.)
**Not to be confused with**: ExcalidrawLinearElement (arrows and lines only)

### NonDeletedExcalidrawElement
**Definition**: Type-safe wrapper ensuring an element has `isDeleted: false`
**Key Files**: `/packages/element/src/types.ts`
**Usage**: Rendering and UI contexts where deleted elements must be excluded
**Not to be confused with**: Regular ExcalidrawElement (which can be deleted)

### OrderedExcalidrawElement
**Definition**: Element with guaranteed non-null `index: FractionalIndex` property
**Key Files**: `/packages/element/src/types.ts`
**Purpose**: Maintains element ordering in multiplayer scenarios
**Related**: `Ordered<T>` is a generic type construct
**Not to be confused with**: Array ordering (elements maintain order via fractional index, not position)

### ExcalidrawLinearElement
**Definition**: Multi-point drawable elements (arrows and lines)
**Key Files**: `/packages/element/src/types.ts`
**Key Properties**: `points: LocalPoint[]` array, `startBinding`, `endBinding` for arrow connections
**Editing**: Supports point-by-point editing via LinearElementEditor
**Not to be confused with**: Regular elements which are single shapes

### Scene
**Definition**: Central data structure managing the collection of elements
**Key Files**: `/packages/element/src/Scene.ts`
**Responsibilities**: Element storage, indexing, caching, observer notifications
**Maintains**: Ordered elements, non-deleted elements, frame caches
**Not to be confused with**: Canvas scene (the DOM representation) or rendering scene

### FractionalIndex
**Definition**: Branded string type for element ordering using fractional indexing algorithm
**Key Files**: `/packages/element/src/types.ts`
**Algorithm Source**: https://github.com/rocicorp/fractional-indexing
**Purpose**: Allows insertion between elements without central authority in multiplayer
**Example Values**: "a0", "a1v", "a2z", "a0u"
**Not to be confused with**: Array index (positional ordering)

---

## Versioning & Collaboration

### version
**Definition**: Integer sequentially incremented on each element change
**Key Files**: `/packages/element/src/types.ts`
**Deprecation Status**: Marked as unsafe; `versionNonce` is preferred
**Not to be confused with**: `versionNonce` (random vs sequential)

### versionNonce
**Definition**: Random integer regenerated on each element change for deterministic reconciliation
**Key Files**: `/packages/element/src/types.ts`
**Purpose**: Reliably detects when two peers changed the same element
**Advantage over version**: Handles edge cases where sequential versioning fails
**Not to be confused with**: `version` (random vs sequential)

### Reconciliation
**Definition**: Process of merging local and remote changes in collaborative editing
**Key Files**: `/packages/element/src/store.ts`, `/packages/element/src/types.ts`
**Mechanism**: Uses `versionNonce` and `FractionalIndex` for deterministic merging
**Without Central Authority**: Multiple peers can safely reconcile without coordination
**Not to be confused with**: Conflict resolution (broader concept)

---

## Binding & Connections

### Binding
**Definition**: Connection point between an arrow and a bindable element (shape)
**Key Files**: `/packages/element/src/binding.ts`
**Components**: Fixed point, binding mode, focus point
**Controlled By**: `isBindingEnabled` flag in AppState (toggleable via modifiers)
**Not to be confused with**: Event binding (in general programming)

### BoundElement
**Definition**: Reference tracking which elements (arrows/text) are connected to another element
**Key Files**: `/packages/element/src/types.ts`
**Structure**: `{ id: string, type: "arrow" | "text" }`
**Stored In**: `boundElements: readonly BoundElement[]` property on bindable elements
**Not to be confused with**: The binding itself (BoundElement is metadata, Binding is the connection)

### FixedPointBinding
**Definition**: Precise binding information for arrow connections to shapes
**Key Files**: `/packages/element/src/types.ts`
**Properties**: `elementId` (target), `fixedPoint` [0.0-1.0 percentages], `mode` (inside/orbit/skip)
**Ratio Interpretation**: Percentages multiplied by element dimensions to get local coordinates
**Not to be confused with**: Just storing an element ID

### BindMode
**Definition**: Determines arrow positioning relative to target shape
**Key Files**: `/packages/element/src/types.ts`
**Values**:
- `"inside"`: Arrow allowed to arrow through shape to exact fixed point
- `"orbit"`: Arrow remains outside shape boundary
- `"skip"`: No specific binding preference
**Visual Impact**: Controls gap between arrow line and shape boundary
**Not to be confused with**: Arrow type or arrowhead style

### startBinding / endBinding
**Definition**: Binding information at each arrow endpoint
**Key Files**: `/packages/element/src/types.ts`
**Type**: `FixedPointBinding | null` (null if not bound)
**Applies To**: ExcalidrawLinearElement (arrows and lines)
**Not to be confused with**: Starting and ending points of the arrow

---

## State Management

### AppState
**Definition**: Complete application state for the current user
**Key Files**: `/packages/excalidraw/types.ts` (interface at lines 272-472)
**Size**: 60+ distinct properties
**Sections**: Tool state, selection, UI state, zoom/scroll, collaboration, settings
**Storage**: Held in React App class component state
**Observability**: Observable via AppStateObserver patterns
**Not to be confused with**: Element state (managed separately in Scene)

### ActiveTool
**Definition**: Currently selected drawing or interaction tool
**Key Files**: `/packages/excalidraw/types.ts`
**Structure**:
- Built-in: `{ type: ToolType, customType: null }`
- Extensions: `{ type: "custom", customType: string }`
**Properties**: `lastActiveTool`, `locked`, `fromSelection` flags
**Not to be confused with**: Tool configuration (styling, size, etc.)

### ToolType
**Definition**: Enumeration of all available tools
**Key Files**: `/packages/excalidraw/types.ts`
**Categories**: Selection, Lasso, Drawing (rect, diamond, ellipse, arrow, line, freedraw), Text, Image, Eraser, Hand, Frames, Laser
**Not to be confused with**: Active tool (tool type vs current selection)

### selectedElementIds
**Definition**: Map of currently selected element IDs
**Key Files**: `/packages/excalidraw/types.ts`
**Type**: `{ [id: string]: true }` (set-like object)
**Structure**: Object keys are element IDs; always `true` value
**UI Reflection**: Selected elements highlighted with bounding box and handles
**Not to be confused with**: `hoveredElementIds` (under pointer cursor, not selected)

### selectionElement
**Definition**: Temporary visual representation of selection drag operation
**Key Files**: `/packages/excalidraw/types.ts`
**Type**: ExcalidrawSelectionElement (rectangle showing drag area)
**Lifecycle**: Created on pointer down, shown during drag, cleared on pointer up
**Not to be confused with**: `newElement` (creation vs selection drag)

### newElement
**Definition**: Element being created (before pointer up confirms it)
**Key Files**: `/packages/excalidraw/types.ts`
**Type**: `NonDeleted<ExcalidrawNonSelectionElement> | null`
**Lifecycle**: Set on pointer down, updated on move, finalized on up, added to scene
**Not to be confused with**: `selectionElement` or `multiElement`

### multiElement
**Definition**: Multi-point linear element being created click-by-click
**Key Files**: `/packages/excalidraw/types.ts`
**Type**: `NonDeleted<ExcalidrawLinearElement> | null`
**Creation Method**: Click mode (vs drag mode) for creating arrows/lines one point at a time
**Not to be confused with**: Regular arrow creation via dragging

### LinearElementEditor
**Definition**: Stateful editor for interactive arrow/line point manipulation
**Key Files**: `/packages/element/src/linearElementEditor.ts`
**Class Properties**: `elementId`, `selectedPointsIndices`, `isDragging`, binding info
**Capabilities**: Point selection, dragging, addition, deletion
**Not to be confused with**: The linear element itself

### editingTextElement
**Definition**: Text element currently being edited
**Key Files**: `/packages/excalidraw/types.ts`
**Type**: `ExcalidrawTextElement | null`
**Trigger**: When text is created or existing text is double-clicked
**Not to be confused with**: Text element in general

### editingGroupId
**Definition**: Group being edited when drilled down into constituent elements
**Key Files**: `/packages/excalidraw/types.ts`
**Type**: `GroupId | null`
**Scenario**: Double-clicking a group element sets this to show individual members
**Not to be confused with**: `selectedGroupIds` (one is edited, one is selected)

### viewModeEnabled
**Definition**: Read-only presentation mode disabling all editing
**Key Files**: `/packages/excalidraw/types.ts`
**Effect**: Disables drawing, editing, selection, and interaction
**Use Cases**: Presentations, sharing, read-only viewing
**Not to be confused with**: Zen mode (focused editing view)

### gridModeEnabled
**Definition**: Snap-to-grid behavior enforced during element placement
**Key Files**: `/packages/excalidraw/types.ts`
**Related**: `gridSize: number` (cell size in pixels)
**Effect**: Element coordinates automatically aligned to grid cells
**Not to be confused with**: Grid visibility toggle

---

## Updating & Increments

### DurableIncrement
**Definition**: State change that gets recorded in undo/redo stacks
**Key Files**: `/packages/element/src/store.ts`
**Class**: Extends StoreIncrement with `change: StoreChange` and `delta: StoreDelta`
**Trigger**: `CaptureUpdateAction.IMMEDIATELY`
**Persistence**: Saved in history and available for undo
**Not to be confused with**: EphemeralIncrement (temporary changes)

### EphemeralIncrement
**Definition**: Transient state change NOT recorded in undo/redo
**Key Files**: `/packages/element/src/store.ts`
**Class**: Extends StoreIncrement with only `change: StoreChange`
**Triggers**: `CaptureUpdateAction.NEVER` or `CaptureUpdateAction.EVENTUALLY`
**Use Cases**: Intermediate states during dragging, resizing, multi-step operations
**Not to be confused with**: DurableIncrement

### CaptureUpdateActionType
**Definition**: Enum controlling how user actions are recorded in history
**Key Files**: `/packages/element/src/store.ts`
**Values**:
- `"IMMEDIATELY"`: Captured as undoable discrete operation
- `"NEVER"`: Never recorded (remote updates, initialization)
- `"EVENTUALLY"`: Eventually undoable; for multi-step processes
**Purpose**: Prevents intermediate UI states from cluttering undo stack
**Not to be confused with**: Action itself

### ActionResult
**Definition**: Outcome of executing an action
**Key Files**: `/packages/excalidraw/actions/types.ts`
**Structure**: `{ elements?, appState?, files?, captureUpdate, replaceFiles? } | false`
**Return False**: Prevents action execution
**captureUpdate**: Controls history recording (uses CaptureUpdateActionType)
**Not to be confused with**: The action function itself

### StoreSnapshot
**Definition**: Immutable capture of complete scene state at a point in time
**Key Files**: `/packages/element/src/store.ts`
**Contents**: All elements and observed app state
**Metadata**: Tracks whether elements or appState actually changed
**Purpose**: Basis for computing deltas and detecting changes
**Not to be confused with**: Element state alone

### StoreDelta
**Definition**: Captures minimum difference between two snapshots
**Key Files**: `/packages/element/src/store.ts`
**Structure**: Contains ElementsDelta and AppStateDelta
**Operations**: calculate, squash, inverse, applyTo, applyLatestChanges
**Purpose**: Efficient representation of change for sync/redo
**Not to be confused with**: Full snapshot

---

## Rendering

### StaticCanvasAppState
**Definition**: AppState subset needed for non-interactive background rendering
**Key Files**: `/packages/excalidraw/types.ts`
**Contents**: Zoom, scroll, grid settings, theme, background color
**Rendering**: Used by staticScene and staticSvgScene
**Not to be confused with**: InteractiveCanvasAppState

### InteractiveCanvasAppState
**Definition**: AppState subset needed for interactive layer (tools, selection)
**Key Files**: `/packages/excalidraw/types.ts`
**Contents**: Active tool, selection state, multi-element, collaborators, snap lines
**Rendering**: Used by interactiveScene for overlays
**Not to be confused with**: StaticCanvasAppState

### RenderableElementsMap
**Definition**: Non-deleted elements prepared and ready for rendering
**Key Files**: `/packages/excalidraw/scene/types.ts`
**Type**: `NonDeletedElementsMap & MakeBrand<"RenderableElementsMap">`
**Distinction**: Derived from NonDeletedElementsMap with render config applied
**Not to be confused with**: Raw element storage

### sceneNonce
**Definition**: Random integer regenerated on each scene update
**Key Files**: `/packages/element/src/Scene.ts`
**Purpose**: Canvas render cache invalidation (NOT for element versioning)
**Not to be confused with**: Element `versionNonce` (scene-level vs element-level)

---

## Collaboration

### Collaborator
**Definition**: Remote user participating in collaborative session
**Key Files**: `/packages/excalidraw/types.ts`
**Contents**: Pointer position, selected elements, username, presence state
**Tracking**: Cursor, selection, voice state, avatar
**Not to be confused with**: Local app state (remote vs local)

### CollaboratorPointer
**Definition**: Real-time cursor/pointer position from remote user
**Key Files**: `/packages/excalidraw/types.ts`
**Structure**: `{ x, y, tool: "pointer" | "laser", renderCursor?, laserColor? }`
**Tool Support**: Shows cursor or laser trail
**Not to be confused with**: Local pointer/mouse events

### SocketId
**Definition**: Unique identifier for collaborative session participant
**Key Files**: `/packages/excalidraw/types.ts`
**Type**: `string & { _brand: "SocketId" }`
**Generated By**: Collaboration server
**Scope**: Per-session, unique per connection
**Not to be confused with**: User ID (session-based vs account-based)

### UserToFollow
**Definition**: User currently being followed for viewport auto-scrolling
**Key Files**: `/packages/excalidraw/types.ts`
**Structure**: `{ socketId: SocketId, username: string }`
**Purpose**: Auto-follow another user's viewport changes in real-time
**Not to be confused with**: Collaborator (specific active follow vs just present)

---

## Data Persistence

### ExportedDataState
**Definition**: Serialized format for saving and sharing diagrams
**Key Files**: `/packages/excalidraw/data/types.ts`
**Structure**: `{ type, version, source, elements, appState, files }`
**File Format**: `.excalidraw` files
**appState**: Cleaned/minimized subset via `cleanAppStateForExport`
**Not to be confused with**: AppState (serialized vs live state)

### BinaryFileData
**Definition**: Serialized image/file with metadata
**Key Files**: `/packages/excalidraw/types.ts`
**Structure**: `{ mimeType, id, dataURL, created, lastRetrieved?, version? }`
**dataURL**: Base64-encoded image or data
**lastRetrieved**: Timestamp for garbage collection
**Not to be confused with**: Raw file upload

### BinaryFiles
**Definition**: Map of element ID to embedded file data
**Key Files**: `/packages/excalidraw/types.ts`
**Type**: `Record<ExcalidrawElement["id"], BinaryFileData>`
**Contents**: All images and embedded media in scene
**Not to be confused with**: File system files

### LibraryItem
**Definition**: Reusable component template for quick re-insertion
**Key Files**: `/packages/excalidraw/data/library.ts`
**Contents**: Collection of elements with name, ID, SVG preview, timestamps
**Storage**: Persisted locally or synced via PersistenceAdapter
**Not to be confused with**: A single element

### LibraryItems
**Definition**: Array of all available library components
**Key Files**: `/packages/excalidraw/data/library.ts`
**Type**: `LibraryItem[]`
**Deduping**: Duplicate IDs or same versionNonce merged
**Not to be confused with**: Single library item

---

## Text & Images

### lineHeight
**Definition**: Unitless line spacing multiplier
**Key Files**: `/packages/element/src/types.ts`
**Type**: `number & { _brand: "unitlessLineHeight" }`
**W3C Standard**: Multiply by font size to get pixels
**Method**: Use `getLineHeightInPx()` for conversion
**Not to be confused with**: Pixel-based line height

### FontString
**Definition**: CSS font specification string
**Key Files**: `/packages/element/src/types.ts`
**Type**: `string & { _brand: "fontString" }`
**Generated By**: `getFontString(fontFamily, fontSize, fontStyle)`
**Purpose**: Caching and font measurement
**Not to be confused with**: Font family alone

### containerId
**Definition**: Parent shape element containing text
**Key Files**: `/packages/element/src/types.ts`
**Type**: `ExcalidrawGenericElement["id"] | null`
**Applies To**: ExcalidrawTextElement
**Container Types**: Rectangle, Diamond, Ellipse, Arrow
**Not to be confused with**: Frame ID (text binding vs containment)

### autoResize
**Definition**: Whether text auto-fits to container width
**Key Files**: `/packages/element/src/types.ts`
**Type**: `boolean`
**Default**: `true` (fits width, doesn't wrap)
**False**: Text wraps to container width
**Not to be confused with**: Container resize

### ExcalidrawImageElement
**Definition**: Image file placed on canvas
**Key Files**: `/packages/element/src/types.ts`
**Properties**: `fileId`, `status` (pending/saved/error), `scale`, `crop`
**Status**: Tracks upload/save lifecycle
**Scale**: `[x, y]` factors for axis flipping
**Not to be confused with**: Binary file data

### FileId
**Definition**: Unique identifier for uploaded/stored file
**Key Files**: `/packages/element/src/types.ts`
**Type**: `string & { _brand: "FileId" }`
**Nullable**: Image elements can have `fileId: null` before upload
**Not to be confused with**: Element ID

---

## Frames & Organization

### ExcalidrawFrameElement
**Definition**: Container element for organizing and grouping other elements
**Key Files**: `/packages/element/src/types.ts`
**Property**: `name: string | null` for frame labels
**Content**: Holds other elements via spatial overlap
**Rendering**: Can clip or hide contained elements
**Not to be confused with**: Grouping (spatial vs logical)

### frameId
**Definition**: Reference to parent frame
**Key Files**: `/packages/element/src/types.ts`
**Type**: `string | null`
**Present On**: All elements
**Purpose**: Track frame containment hierarchy
**Not to be confused with**: Element ID or group ID

### GroupId
**Definition**: Identifier for grouped elements
**Key Files**: `/packages/element/src/types.ts`
**Type**: `string`
**Nesting**: Supports nested groups via `groupIds: readonly GroupId[]`
**Ordering**: Deepest to shallowest group
**Not to be confused with**: Frame ID (logical vs spatial)

### groupIds
**Definition**: Array of group memberships for an element
**Key Files**: `/packages/element/src/types.ts`
**Type**: `readonly GroupId[]`
**Order**: Deepest (innermost) to shallowest (outermost)
**Nesting**: Elements can belong to multiple nested groups
**Not to be confused with**: Single group ID

---

## Locking & Constraints

### locked
**Definition**: Element protection preventing editing
**Key Files**: `/packages/element/src/types.ts`
**Type**: `boolean`
**Effects**: Prevents dragging, resizing, deletion, styling changes
**UI Indicator**: Lock icon shown on element
**Not to be confused with**: Selected (related but different)

### activeLockedId
**Definition**: Currently selected locked element
**Key Files**: `/packages/excalidraw/types.ts`
**Type**: `string | null`
**UI**: Shows unlock popup when interacted
**Not to be confused with**: Simply being locked

---

## Actions & Events

### Action
**Definition**: User-triggered operation with undo/redo support
**Key Files**: `/packages/excalidraw/actions/types.ts`
**Purpose**: Drawing, editing, exporting, grouping operations
**Async Support**: Can perform async operations
**Count**: 60+ different action types
**Not to be confused with**: Event handler

### ActionName
**Definition**: Union of all valid action identifiers
**Key Files**: `/packages/excalidraw/actions/types.ts`
**Examples**: copy, paste, group, ungroup, deleteSelectedElements, zoomIn, zoomOut, exportToPng
**Source**: ui, keyboard, contextMenu, api, commandPalette
**Not to be confused with**: Function name

### ActionSource
**Definition**: Origin/trigger method of action invocation
**Key Files**: `/packages/excalidraw/actions/types.ts`
**Values**: ui, keyboard, contextMenu, api, commandPalette
**Purpose**: Track user interaction method
**Not to be confused with**: Action itself

---

## Snapping & Alignment

### SnapLine
**Definition**: Visual guide line for alignment feedback
**Key Files**: `/packages/excalidraw/snapping.ts`
**Types**: PointSnapLine, GapSnapLine, PointerSnapLine
**Rendering**: Displayed during element dragging
**Purpose**: Visual feedback showing snapping alignment
**Not to be confused with**: Snap offset (line vs amount)

### PointSnapLine
**Definition**: Alignment guide to other element points
**Key Files**: `/packages/excalidraw/snapping.ts`
**Structure**: `{ type: "points", points: GlobalPoint[] }`
**Visual**: Dots shown at snap points
**Not to be confused with**: Gap snap line

### GapSnapLine
**Definition**: Equal spacing/gap alignment guide
**Key Files**: `/packages/excalidraw/snapping.ts`
**Structure**: `{ type: "gap", direction, points }`
**Visual**: Horizontal or vertical line indicating equal gap
**Not to be confused with**: Point snap line

---

## Advanced Element Types

### Arrowhead
**Definition**: Style of arrow endpoint
**Key Files**: `/packages/element/src/types.ts`
**Types**: arrow, bar, circle, circle_outline, triangle, triangle_outline, diamond, diamond_outline
**Properties**: `startArrowhead`, `endArrowhead` on linear elements
**Not to be confused with**: Arrow element itself

### ExcalidrawElbowArrowElement
**Definition**: Arrow with 90-degree angle routing
**Key Files**: `/packages/element/src/types.ts`
**Properties**: `elbowed: true`, `fixedSegments`, `startIsSpecial`, `endIsSpecial`
**Purpose**: Flowchart-style orthogonal connections
**Not to be confused with**: Regular arrow with curves

---

## State Observation

### AppStateObserver
**Definition**: Pattern for subscribing to specific AppState changes
**Key Files**: `/packages/excalidraw/components/AppStateObserver.ts`
**Class**: Manages listeners and notifies on selected state changes
**Modes**: Single property, array of properties, custom selector, predicate
**Returns**: Unsubscribe callbacks
**Not to be confused with**: Observer pattern (design pattern vs implementation)

### OnStateChange
**Definition**: Flexible API for subscribing to AppState changes
**Key Files**: `/packages/excalidraw/components/AppStateObserver.ts`
**Overloads**: Property keys, arrays, selectors, predicates
**Returns**: Either callbacks or promises
**Example**: `onStateChange("activeTool", (tool, appState) => {})`
**Not to be confused with**: Change event (subscription vs single event)

---

## Miscellaneous

### seed
**Definition**: Random integer for roughjs rough-line consistency
**Key Files**: `/packages/element/src/types.ts`
**Purpose**: Deterministic rough-line generation across renders
**Consistency**: Same seed produces same visual pattern
**Not to be confused with**: Random generation (deterministic with seed)

### updated
**Definition**: Timestamp of last element modification
**Key Files**: `/packages/element/src/types.ts`
**Type**: `number` (epoch milliseconds)
**Purpose**: Track modification time for sync and merge
**Not to be confused with**: Created timestamp

### customData
**Definition**: Application-specific metadata attached to elements
**Key Files**: `/packages/element/src/types.ts`
**Type**: `Record<string, any> | undefined`
**Purpose**: Extensibility hook for plugins and integrations
**Not to be confused with**: Element properties

### link
**Definition**: Hyperlink associated with element
**Key Files**: `/packages/element/src/types.ts`
**Type**: `string | null`
**Purpose**: Click-to-navigate functionality
**Not to be confused with**: Binding (hyperlink vs arrow binding)

### isDeleted
**Definition**: Soft-delete flag for undo/redo history
**Key Files**: `/packages/element/src/types.ts`
**Type**: `boolean`
**Retention**: Never purged; keeps full history for undo
**Rendering**: Skipped when rendering if `false`
**Not to be confused with**: Actually removing data

---

## Related Standard Concepts

The following are standard programming concepts used in Excalidraw but not unique to this project:

- **LocalPoint**: `[x, y]` coordinates relative to element origin
- **GlobalPoint**: `[x, y]` in canvas/scene coordinate system
- **Radians**: Angle measurement unit (used for rotation)
- **Bounds**: AABB bounding box `{ x1, x2, y1, y2 }`
- **Zoom**: `{ value: NormalizedZoomValue }` for viewport scale
- **Theme**: "light" | "dark" appearance setting
- **DataURL**: Base64-encoded image string format

---

## Quick Reference: Key Files

**Type Definitions**:
- `/packages/element/src/types.ts` - Element types, bindings, versioning
- `/packages/excalidraw/types.ts` - AppState, Actions, Collaboration
- `/packages/excalidraw/scene/types.ts` - Render configurations
- `/packages/excalidraw/data/types.ts` - Import/Export formats

**Core Classes**:
- `/packages/element/src/Scene.ts` - Element collection management
- `/packages/element/src/linearElementEditor.ts` - Arrow/line editing
- `/packages/element/src/binding.ts` - Binding/connection logic
- `/packages/excalidraw/components/AppStateObserver.ts` - State observation
- `/packages/excalidraw/data/library.ts` - Library management

**Algorithms**:
- `/packages/excalidraw/snapping.ts` - Alignment guides
- `/packages/element/src/store.ts` - Store, increments, snapshots
- `/packages/element/src/delta.ts` - Delta calculations
