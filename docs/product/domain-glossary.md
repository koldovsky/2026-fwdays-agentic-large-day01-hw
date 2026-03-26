# Domain Glossary

A comprehensive glossary of domain-specific terms used throughout the Excalidraw codebase.

---

## Element Types

| Term | Definition |
|------|-----------|
| **Rectangle** | A basic rectangular shape element with configurable fill, stroke, and rounded corners. |
| **Diamond** | A four-pointed diamond (rhombus) shape element. |
| **Ellipse** | A circular or elliptical shape element. |
| **Arrow** | A directional line element with arrowheads at start and/or end points. Supports binding to other elements. |
| **Line** | A multi-point linear element without directional indicators. Can be closed as a polygon. |
| **Freedraw** | A freehand-drawn element created by continuous pointer movement, with pressure information for variable stroke width. |
| **Text** | A text element that can be standalone or bound to a container element (rectangle, diamond, ellipse, arrow). |
| **Image** | A rasterized image element with optional cropping and scaling support. |
| **Frame** | A rectangular container that groups and clips child elements within its bounds. |
| **Magicframe** | An AI-generated frame element with special generation data properties for text-to-diagram. |
| **Iframe** | An embedded frame element that can contain external web content or videos. |
| **Embeddable** | An element that embeds external content like diagrams or visualizations from allowed domains. |
| **Selection** | A special transient element type representing the drag-selection rectangle on the canvas. |

## Tool Types

| Term | Definition |
|------|-----------|
| **Selection Tool** (V, 1) | Default tool for selecting, moving, and transforming elements. |
| **Lasso Tool** | Freehand selection tool for selecting multiple elements by drawing an enclosing shape around them. |
| **Hand Tool** (H) | Pans the canvas view without selecting or modifying elements. |
| **Eraser Tool** (E, 0) | Removes elements from the canvas by clicking or dragging over them. |
| **Laser Tool** (K) | Displays a temporary laser pointer visible to all collaborators. Used for presentations. |
| **Frame Tool** (F) | Creates frame containers for organizing and grouping elements. |
| **Embeddable Tool** | Creates embeddable content containers for external URLs. |
| **Custom Tool** | An extension point allowing embedders to register additional tools via `props.tools`. |

## Visual Styling

| Term | Definition |
|------|-----------|
| **FillStyle** | How element interiors are rendered: `hachure` (diagonal lines), `cross-hatch` (crossed lines), `solid` (flat fill), or `zigzag` (zigzag lines). |
| **StrokeStyle** | Line rendering style: `solid`, `dashed`, or `dotted`. |
| **StrokeRoundness** | Corner style for strokes: `round` (smooth curves) or `sharp` (angular corners). |
| **Roughness** | Hand-drawn effect intensity. Values: `0` (architect — clean), `1` (artist — moderate wobble), `2` (cartoonist — maximum wobble). |
| **Opacity** | Transparency level of an element, from 0 (fully transparent) to 100 (fully opaque). |
| **Seed** | Random integer that seeds the Rough.js shape generator, ensuring consistent hand-drawn rendering across frames. |

## Font & Text Properties

| Term | Definition |
|------|-----------|
| **FontFamily** | Named font families: Virgil (hand-drawn), Helvetica, Cascadia (monospace), Excalifont, Nunito, Lilita One, Comic Shanns, Liberation Sans, Assistant. |
| **TextAlign** | Horizontal text alignment: `left`, `center`, or `right`. |
| **VerticalAlign** | Vertical text alignment within a container: `top`, `middle`, or `bottom`. |
| **LineHeight** | Unitless multiplier for spacing between text lines (aligned to W3C standards). |
| **AutoResize** | Boolean property — when true, text width expands to fit content; when false, text wraps to a fixed width. |

## Roundness

| Term | Definition |
|------|-----------|
| **RoundnessType** | Corner rounding algorithm: `LEGACY` (proportional, deprecated), `PROPORTIONAL_RADIUS` (percentage of element size), or `ADAPTIVE_RADIUS` (fixed pixel radius). |

## Binding & Arrow Properties

| Term | Definition |
|------|-----------|
| **FixedPointBinding** | Defines where an arrow endpoint attaches to a target element, using a fixed point ratio (0–1 on each axis), a bind mode, and an element reference. |
| **BindMode** | Relationship between arrow endpoint and bound element: `inside` (endpoint snaps inside), `orbit` (endpoint stays outside), or `skip` (flexible binding). |
| **Arrowhead** | Visual style for arrow endpoints: `arrow`, `bar`, `circle`, `circle_outline`, `triangle`, `triangle_outline`, `diamond`, `diamond_outline`, or cardinality types for ER diagrams. |
| **CardinalityArrowhead** | ER-diagram-style arrowheads: `cardinality_one`, `cardinality_many`, `cardinality_one_or_many`, `cardinality_exactly_one`, `cardinality_zero_or_one`, `cardinality_zero_or_many`. |
| **BoundElement** | A reference stored on an element pointing to arrows or text elements that are bound to it. |
| **ExcalidrawBindableElement** | Union type of elements that arrows can bind to: rectangles, diamonds, ellipses, text, images, iframes, embeddables, and frames. |
| **ContainerId** | Reference from a text element to its parent container (rectangle, diamond, ellipse, or arrow). |
| **ElbowArrow** | An arrow that routes with orthogonal (right-angle) segments instead of straight lines. |
| **FixedSegment** | A segment of an elbowed arrow with defined start, end, and index positions. |
| **LinearElementEditor** | Editor state for multi-point line/arrow elements, tracking selected points, bindings, and in-progress edits. |
| **SuggestedBinding** | Visual hint showing where an arrow could bind to a nearby element during drag. |

## Element Versioning & Ordering

| Term | Definition |
|------|-----------|
| **Version** | Integer incremented on each element modification. Used for conflict resolution during collaboration. |
| **VersionNonce** | Random integer regenerated on each change. When two clients produce the same version, the nonce determines which wins. |
| **FractionalIndex** | String-based index (using fractional-indexing library) for element z-ordering. Allows O(1) reorder without shifting arrays — critical for collaborative editing. |
| **Index** | Alias for FractionalIndex — the property determining an element's z-order position. |
| **Ordered\<T\>** | Type wrapper indicating an element has a valid FractionalIndex assigned. |
| **GroupIds** | Array of group identifiers an element belongs to, ordered from innermost (deepest) to outermost (shallowest) nesting. |
| **isDeleted** | Boolean flag marking an element as soft-deleted. Deleted elements remain in the Scene for undo/collaboration purposes. |

## Selection & Interaction State

| Term | Definition |
|------|-----------|
| **SelectedElementIds** | Map tracking which elements are currently selected, keyed by element ID. |
| **HoveredElementIds** | Map tracking which elements the pointer is currently hovering over. |
| **SelectionElement** | The temporary rectangular selection box created when dragging to select multiple elements. |
| **MultiElement** | A multi-point linear element being created by sequential clicks (click-click-click mode) rather than continuous drag. |
| **NewElement** | The element currently being drawn during an active pointer interaction. Updated on every pointer move. |
| **EditingGroupId** | The ID of the group currently being "drilled into" for editing its constituent elements. |
| **MaybeTransformHandleType** | Identifies which resize/rotation handle the user is interacting with during element transformation. |

## Canvas & Rendering

| Term | Definition |
|------|-----------|
| **Static Canvas** | The bottom canvas layer that renders all committed elements using Rough.js. Only redraws when elements change. |
| **Interactive Canvas** | The top canvas layer that renders selection UI, resize handles, snap lines, and hover highlights. Redraws on every pointer move. |
| **NewElement Canvas** | The middle canvas layer that renders the element currently being drawn, providing immediate visual feedback. |
| **Zoom** | Normalized zoom value (range 0.1–30) controlling the canvas magnification level. |
| **ScrollX / ScrollY** | Canvas pan offset in scene coordinates. |
| **Viewport** | The visible area of the infinite canvas, determined by zoom + scroll position + window dimensions. |
| **SceneNonce** | An incrementing counter used to detect whether the static canvas needs to re-render. |
| **SnapLine** | Visual guide line showing alignment between elements during dragging. |

## State Management

| Term | Definition |
|------|-----------|
| **AppState** | The complete application UI state — selected tool, colors, zoom, scroll, theme, dialog visibility, and all interaction state. |
| **UIAppState** | A subset of AppState excluding transient cursor and scroll data. Used for clean serialization. |
| **Scene** | The central element registry that manages all elements via a Map (O(1) lookup) and ordered Array (rendering). |
| **Store** | Central state persistence layer that captures observed changes and emits StoreIncrement events. |
| **StoreSnapshot** | An immutable point-in-time capture of elements + appState. Uses hash-based comparison for change detection. |
| **StoreDelta** | The diff between two StoreSnapshots — encodes added, removed, and updated elements. Invertible for undo/redo. |
| **StoreIncrement** | An event emitted by the Store on state change. Two variants: DurableIncrement (recorded in history) and EphemeralIncrement (UI-only). |
| **DurableIncrement** | A StoreIncrement that gets recorded in the undo/redo history stack. |
| **EphemeralIncrement** | A StoreIncrement for transient UI changes not recorded in history. |
| **CaptureUpdateAction** | Determines how a state change is recorded: `IMMEDIATELY` (undoable), `EVENTUALLY` (batched undoable), `NEVER` (not recorded — used for remote sync). |

## Actions System

| Term | Definition |
|------|-----------|
| **Action** | A registered command object with `name`, `perform()`, `keyTest()`, `predicate()`, and optional `PanelComponent`. Implements the Command Pattern. |
| **ActionName** | Unique string identifier for an action (e.g., `"actionDeleteSelected"`, `"actionGroup"`). 147+ registered names. |
| **ActionResult** | The return value of `action.perform()` — contains updated `elements`, `appState`, `files`, and a `captureUpdate` flag. |
| **ActionManager** | The dispatcher that routes actions from UI, keyboard, context menu, command palette, or API to their `perform()` functions. |
| **ActionSource** | Where an action was triggered from: `"ui"`, `"keyboard"`, `"contextMenu"`, `"api"`, or `"commandPalette"`. |

## Collaboration

| Term | Definition |
|------|-----------|
| **Room** | A shared collaboration session identified by a unique ID in the URL hash fragment. |
| **Collaborator** | A remote user's state: pointer position, selected elements, username, avatar, idle status, and speaking/muted indicators. |
| **CollaboratorPointer** | A remote user's cursor position and active tool state (pointer vs. laser). |
| **SocketId** | Branded string identifier for a collaborator's WebSocket connection. |
| **Follow Mode** | A feature where one client's viewport locks to follow another user's scroll and zoom. |
| **UserToFollow** | Identifier for the user being followed in follow mode. |
| **FollowedBy** | Set of SocketIds of users currently following the local user. |
| **Reconciliation** | The process of merging incoming remote element changes with local state using `CaptureUpdateAction.NEVER`. |

## Data & Files

| Term | Definition |
|------|-----------|
| **BinaryFiles** | A record mapping FileIds to BinaryFileData — stores images and other binary attachments. |
| **BinaryFileData** | Metadata for an embedded file: mimeType, id, dataURL, creation timestamp, and retrieval timestamp. |
| **FileId** | Branded string identifier for binary files referenced by image elements. |
| **DataURL** | Base64-encoded data URI representing a file's contents inline. |
| **ExportType** | Export format: `png`, `svg`, `clipboard`, `clipboard-svg`, or `backend`. |
| **.excalidraw** | The native JSON file format for saving and loading Excalidraw scenes. Contains elements, appState, and files. |

## Library

| Term | Definition |
|------|-----------|
| **LibraryItem** | A reusable component with id, status (`published`/`unpublished`), elements array, creation timestamp, and metadata (name). |
| **LibraryItems** | Array of LibraryItem objects that can be shared, imported, and used across sessions. |
| **Library** | The panel (sidebar) and data structure for managing reusable shape collections. |

## UI Components

| Term | Definition |
|------|-----------|
| **Command Palette** | A Cmd+K style fuzzy-search dialog for discovering and executing actions. Categorized by App, Export, Tools, Editor, Elements, Links, Library. |
| **LayerUI** | The main layout shell that arranges toolbar, sidebar, footer, and canvas layers. |
| **Zen Mode** | A minimalist UI mode that hides menus and panels, leaving only the canvas. |
| **View Mode** | A read-only mode that disables element creation and modification but allows navigation. |
| **Properties Panel** | The sidebar panel showing style controls (colors, stroke, fill, font) for the selected element(s). |
| **Sidebar** | The collapsible side panel used for libraries, settings, and custom content. |

## Geometry (packages/math)

| Term | Definition |
|------|-----------|
| **Point** | A 2D coordinate represented as a tuple `[x, y]` from `@excalidraw/math`. Replaces older `{x, y}` object pattern. |
| **Vector** | A 2D direction/magnitude tuple used for transformations and physics calculations. |
| **Segment** | A line segment defined by two Points. |
| **Curve** | A cubic Bezier curve defined by four control Points. |
| **Bounds** | A bounding box represented as `[minX, minY, maxX, maxY]` used for hit testing and visibility culling. |
| **Collision** | Hit-testing logic that determines whether a point or region intersects with an element. |

## Image Properties

| Term | Definition |
|------|-----------|
| **ImageCrop** | Crop region defined by x, y, width, height relative to the image's natural dimensions. |
| **Scale** | A `[x, y]` tuple with values `-1` or `1` controlling horizontal/vertical image flipping. |
