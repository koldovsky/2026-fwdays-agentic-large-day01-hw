# Domain Glossary — Excalidraw

**Version:** 1.1
**Last Updated:** 2026-03-29
**Status:** Active

---

## 1. Introduction

This glossary defines the core domain concepts used across the Excalidraw product and codebase. It exists to ensure that product managers, engineers, designers, and support staff share a precise, common vocabulary — eliminating ambiguity in tickets, documentation, design reviews, and code comments.

When discussing a feature, filing a bug report, or writing code, prefer the terms defined here over informal or ad-hoc alternatives. If a term is missing or a definition needs updating, see [§5 Maintenance](#5-maintenance).

---

## 2. Glossary Entries

Entries are listed alphabetically.

---

### Action

| | |
|---|---|
| **Definition** | A named, registered operation that mutates scene elements or app state. Actions are pure functions: they receive current state and return a new state without side effects. |
| **Context** | Defined in `packages/excalidraw/actions/` using the `register()` helper. Every user-level operation — aligning elements, changing stroke colour, toggling grid — is implemented as an action. The `ActionManager` discovers and dispatches all registered actions at startup. |
| **Where used (key files)** | `packages/excalidraw/actions/` (individual action modules), `packages/excalidraw/actions/manager.tsx` (`ActionManager.register()`), `packages/excalidraw/actions/types.ts` |
| **Examples** | `"selectAll"`, `"deleteSelectedElements"`, `"alignTop"`, `"toggleGrid"` |
| **Related Terms** | [Action Source](#action-source), [AppState](#appstate), [Command Palette](#command-palette), [Scene](#scene) |
| **DO NOT CONFUSE WITH** | A browser DOM event (`"click"`, `"keydown"`) — those are raw input events, not Excalidraw Actions. Also not a Redux action or a toolbar button; an Action is a *named, registered operation* dispatched exclusively through `ActionManager`. |

---

### Action Source

| | |
|---|---|
| **Definition** | A tag that identifies how an action was triggered: `"ui"` (button click), `"keyboard"` (shortcut), `"api"` (external caller), or `"commandPalette"`. |
| **Context** | Tracked on every action invocation for analytics and debugging. Allows distinguishing whether the same logical action was triggered by a user gesture or an embedding application. |
| **Where used (key files)** | `packages/excalidraw/actions/types.ts` (ActionSource type), action invocation sites throughout `packages/excalidraw/actions/` |
| **Examples** | A user pressing `Ctrl+A` triggers `"selectAll"` with `ActionSource = "keyboard"`. The same action called via `ExcalidrawImperativeAPI` has `ActionSource = "api"`. |
| **Related Terms** | [Action](#action), [ExcalidrawImperativeAPI](#excalidrawimperativeapi) |
| **DO NOT CONFUSE WITH** | The code location or module that *defines* an action — Action Source describes the *trigger channel* (keyboard, UI, API, Command Palette), not where the action logic lives. |

---

### AppState

| | |
|---|---|
| **Definition** | The transient UI state that accompanies a drawing session: currently selected tool, zoom level, scroll position, open panels, active collaborator cursors, and similar ephemeral settings. AppState is **not** part of the diagram's persistent content. |
| **Context** | Managed as React class component state in the `App` class and selectively persisted to `localStorage` via `clearAppStateForLocalStorage()`. Serialised alongside scene elements when exporting to `.excalidraw` format, but a subset is stripped before local storage writes to avoid persisting session-only values. |
| **Where used (key files)** | `packages/excalidraw/appState.ts` (defaults and `clearAppStateForLocalStorage()`), `packages/excalidraw/types.ts` (AppState type), `packages/excalidraw/context/ui-appState.ts` |
| **Examples** | `activeTool: "rectangle"`, `zoom: { value: 1.5 }`, `scrollX: -300`, `openDialog: "export"` |
| **Related Terms** | [Scene](#scene), [Element](#element), [Session](#session) |
| **DO NOT CONFUSE WITH** | Scene elements — AppState is *ephemeral UI state* (active tool, zoom, scroll, open panels) and is not part of the drawing content. Also not the full `localStorage` entry; only a filtered subset of AppState is persisted there. |

---

### Arrowhead

| | |
|---|---|
| **Definition** | A decorative marker placed at one or both endpoints of a linear element (arrow or line) to indicate directionality. |
| **Context** | Defined in `packages/element/src/arrowheads.ts`. Arrowhead style is a property of the element, selectable through the style panel. |
| **Where used (key files)** | `packages/element/src/arrowheads.ts` (arrowhead rendering), `packages/element/src/types.ts` (Arrowhead type) |
| **Examples** | Triangle, bar, dot, none. An arrow connecting two boxes in a flowchart uses `arrowhead: "triangle"` at the target end. |
| **Related Terms** | [Element](#element), [Linear Element](#linear-element) |
| **DO NOT CONFUSE WITH** | An arrow element — an Arrowhead is a *decorative endpoint marker* that is a property of a linear element, not an element in its own right. An arrow element can have zero, one, or two arrowheads. |

---

### Binding

| | |
|---|---|
| **Definition** | A persistent connection between the endpoint of a linear element (arrow or line) and a shape element, so the arrow moves and resizes in sync with the shape it is attached to. |
| **Context** | Managed in `packages/element/src/binding.ts`. When a user drags an arrow endpoint onto a shape, a binding is created. Bindings are stored as references on both the linear element and the target element. |
| **Where used (key files)** | `packages/element/src/binding.ts` (`bindLinearElement()`, `updateBoundElements()`), `packages/element/src/types.ts` (binding types) |
| **Examples** | Drawing an arrow from a rectangle to an ellipse — if the rectangle is moved, the arrow stretches to follow. |
| **Related Terms** | [Element](#element), [Linear Element](#linear-element), [Scene](#scene) |
| **DO NOT CONFUSE WITH** | A Group or Frame — Binding specifically connects a *linear element's endpoint* to a shape. It does not group elements visually. Also not React prop/state binding or any other programming concept named "binding". |

---

### Canvas

| | |
|---|---|
| **Definition** | The infinite, scrollable drawing surface that hosts all scene elements. Rendered using the HTML5 Canvas 2D API split across two overlaid layers: `StaticCanvas` (scene elements) and `InteractiveCanvas` (selection handles, collaborator cursors). |
| **Context** | The visible viewport is a window into the canvas, controlled by `scrollX`, `scrollY`, and `zoom` in `AppState`. The canvas has no fixed size limit. |
| **Where used (key files)** | `packages/excalidraw/components/App.tsx` (canvas setup), `packages/excalidraw/renderer/` (StaticCanvas and InteractiveCanvas renderers), `packages/excalidraw/scene/` (scene geometry helpers) |
| **Examples** | When a user drags the background, they are panning the viewport over the canvas. |
| **Related Terms** | [AppState](#appstate), [Scene](#scene), [Viewport](#viewport), [Zoom](#zoom) |
| **DO NOT CONFUSE WITH** | The HTML `<canvas>` DOM element — Excalidraw's Canvas is the *infinite logical drawing surface*, rendered *using* one or more `<canvas>` tags but conceptually distinct from any single HTML element. |

---

### Collaboration Room

| | |
|---|---|
| **Definition** | A temporary, shared drawing session identified by a unique room ID. All participants connect via WebSocket, see each other's cursors in real time, and receive live updates to the shared scene. |
| **Context** | Room IDs are randomly generated when a user clicks "Live collaboration". The room is considered active as long as at least one participant remains connected. Room state is backed up to Firebase Firestore in encrypted form. There is no server-side authentication — possession of the room link is sufficient to join. |
| **Where used (key files)** | `excalidraw-app/collab/Collab.tsx` (room lifecycle), `excalidraw-app/collab/Portal.tsx` (WebSocket client), Firebase Firestore (encrypted scene backup) |
| **Examples** | A team design review where four engineers open the same share URL and co-edit a system architecture diagram. |
| **Related Terms** | [End-to-End Encryption](#end-to-end-encryption-e2ee), [Portal](#portal), [Reconciliation](#reconciliation), [Room Link](#room-link), [Scene](#scene) |
| **DO NOT CONFUSE WITH** | A user account or persistent workspace — Rooms are ephemeral, unauthenticated, and exist only while at least one participant is connected. Also not a Share Link, which points to a static, read-only snapshot rather than a live session. |

---

### Command Palette

| | |
|---|---|
| **Definition** | A keyboard-searchable overlay that lists all registered actions by name, enabling power users to trigger any operation without navigating toolbars or menus. |
| **Context** | Powered by the same `ActionManager` registry that handles keyboard shortcuts and toolbar buttons, so every action is automatically available in the palette at no additional cost. |
| **Where used (key files)** | `packages/excalidraw/components/CommandPalette/CommandPalette.tsx`, `packages/excalidraw/components/CommandPalette/defaultCommandPaletteItems.ts`, `packages/excalidraw/actions/manager.tsx` (action registry source) |
| **Examples** | Pressing the palette shortcut and typing "group" surfaces the "Group selection" action. |
| **Related Terms** | [Action](#action), [Action Source](#action-source) |
| **DO NOT CONFUSE WITH** | A toolbar or context menu — the Command Palette is a *keyboard-driven search overlay* that exposes all registered Actions. It does not define new actions; it surfaces existing ones from `ActionManager`. |

---

### Durable Increment

| | |
|---|---|
| **Definition** | A versioned, named change to the scene that is stored in undo/redo history and broadcast to collaborators. Distinct from an ephemeral increment, which is transient and never stored. |
| **Context** | Produced by `Store.scheduleCapture()` in `packages/element/src/store.ts` when a user performs a significant edit (e.g., moving an element, changing text). Contains a `StoreDelta` describing the inserted and deleted element sets. |
| **Where used (key files)** | `packages/element/src/store.ts` (`Store.scheduleCapture()`), `packages/element/src/delta.ts` (StoreDelta), undo/redo history stack |
| **Examples** | Moving a rectangle creates a durable increment; the undo stack grows by one entry. Moving a collaborator cursor creates an ephemeral increment. |
| **Related Terms** | [Ephemeral Increment](#ephemeral-increment), [Scene Store](#scene-store), [StoreDelta](#storedelta) |
| **DO NOT CONFUSE WITH** | An Ephemeral Increment — Durable Increments are *persisted in undo/redo history and broadcast to collaborators*. Ephemeral Increments (e.g., cursor movements) are transient and never stored. |

---

### Element

| | |
|---|---|
| **Definition** | A single drawable object on the canvas. Every element has a stable `id`, a `type`, geometric properties (x, y, width, height, angle), visual style properties (stroke colour, fill, opacity), and a monotonically increasing `version`. |
| **Context** | Elements are the atomic unit of the scene. Defined and managed in `packages/element/`. Elements are never mutated in place; mutations create a new version via `mutateElement()`. |
| **Where used (key files)** | `packages/element/src/types.ts` (ExcalidrawElement types), `packages/element/src/mutateElement.ts` (`mutateElement()`), `packages/element/src/newElement.ts` (constructors) |
| **Examples** | A blue rounded rectangle, a dashed arrow between two boxes, a text label reading "API Gateway", an embedded image. |
| **Related Terms** | [Arrowhead](#arrowhead), [Binding](#binding), [Frame](#frame), [Fractional Index](#fractional-index), [Linear Element](#linear-element), [Scene](#scene) |
| **DO NOT CONFUSE WITH** | An HTML DOM element or a React component — Excalidraw Elements are *scene objects* (rectangles, arrows, text, images) represented as plain data objects on the canvas, with no direct HTML counterpart. |

---

### Embeddable

| | |
|---|---|
| **Definition** | An element type that renders an external web URL as an interactive iframe inside the canvas. |
| **Context** | Defined in `packages/element/src/embeddable.ts`. The list of allowed URL patterns is controlled by an allow-list to prevent embedding of arbitrary origins. The iframe is rendered only when the element is in "active" mode (double-clicked). |
| **Where used (key files)** | `packages/element/src/embeddable.ts` (allow-list, validation), `packages/excalidraw/actions/actionEmbeddable.ts` |
| **Examples** | Embedding a YouTube video, a Figma frame, or a live webpage inside a diagram. |
| **Related Terms** | [Element](#element), [Scene](#scene) |
| **DO NOT CONFUSE WITH** | An image element — an Embeddable renders a *live, interactive `<iframe>`* from an external URL, whereas an image element displays static binary content. Also not a generic HTML `<embed>` tag. |

---

### End-to-End Encryption (E2EE)

| | |
|---|---|
| **Definition** | A security model in which all diagram data (scene JSON and binary files) is encrypted on the client before leaving the browser, using AES-GCM 128-bit keys. No server — including Firebase or the WebSocket relay — ever receives plaintext data. |
| **Context** | Defined in `packages/excalidraw/data/encryption.ts` using the Web Crypto API. The AES key is generated client-side with a 128-bit length (`ENCRYPTION_KEY_BITS = 128`), formatted as a JWK, and embedded in the **URL fragment** (the `#` portion), which browsers never send to servers. Key loss means permanent data loss — this is an accepted trade-off for zero-trust storage. |
| **Where used (key files)** | `packages/excalidraw/data/encryption.ts` (AES-GCM key generation and en/decryption, `ENCRYPTION_KEY_BITS = 128`), URL fragment (`#`) for key transport |
| **Examples** | When sharing a diagram link, the URL fragment `#roomId,base64key` contains the decryption key. Anyone with the full URL can decrypt; anyone without the fragment cannot. |
| **Related Terms** | [Collaboration Room](#collaboration-room), [FileId](#fileid), [Room Link](#room-link), [Share Link](#share-link) |
| **DO NOT CONFUSE WITH** | HTTPS or transport-layer security — E2EE in Excalidraw means *the server never receives plaintext data*, even over HTTPS. Encryption is performed in the browser before any data leaves the client. |

---

### Ephemeral Increment

| | |
|---|---|
| **Definition** | A transient change to the scene — such as a cursor movement or idle status update — that is broadcast to collaborators but never stored in undo/redo history or persisted to any storage layer. |
| **Context** | Produced by `Store.capture()` alongside durable increments. Ephemeral increments are emitted over the WebSocket at ~30 fps for cursor positions. |
| **Where used (key files)** | `packages/element/src/store.ts` (`Store.capture()`), WebSocket broadcast layer (~30 fps cursor events) |
| **Examples** | Moving your mouse over the canvas while collaborating produces ephemeral increments that update your cursor position on peers' screens. |
| **Related Terms** | [Durable Increment](#durable-increment), [Portal](#portal), [Scene Store](#scene-store) |
| **DO NOT CONFUSE WITH** | A Durable Increment — Ephemeral Increments are *never stored* in history or any persistence layer. They are real-time collaboration signals (cursor positions) that are discarded after broadcast. |

---

### ExcalidrawImperativeAPI

| | |
|---|---|
| **Definition** | The programmatic handle exposed to consumers of the `@excalidraw/excalidraw` npm package. It is the single stable public contract for external applications to read and write scene state, execute actions, listen to events, and customise the UI. |
| **Context** | Obtained by passing an `excalidrawAPI` callback prop to the `<Excalidraw />` component. Internal classes (`App`, `ActionManager`, `Store`) are not part of the public API. |
| **Where used (key files)** | `packages/excalidraw/types.ts` (ExcalidrawImperativeAPI interface), `<Excalidraw />` component prop `excalidrawAPI` (callback to receive the handle) |
| **Examples** | `api.updateScene({ elements })` replaces scene elements; `api.getSceneElements()` returns a snapshot; `api.scrollToContent(elements, { animate: true })` pans the viewport. |
| **Related Terms** | [Action Source](#action-source), [AppState](#appstate), [Scene](#scene) |
| **DO NOT CONFUSE WITH** | Internal classes such as `App` or `ActionManager` — those are implementation details not part of the public contract. `ExcalidrawImperativeAPI` is the *only stable, versioned public interface* for embedding applications. |

---

### Export

| | |
|---|---|
| **Definition** | The action of serialising the current scene or selected elements into a portable format for use outside Excalidraw. |
| **Context** | Supported formats: `.excalidraw` (JSON, full scene including AppState), `.excalidrawlib` (library subset), PNG (rasterised), SVG (vector). The export dialog allows choosing scope (whole scene vs. selected elements) and appearance options. |
| **Where used (key files)** | `packages/excalidraw/data/` (serialisation helpers), `packages/excalidraw/components/ImageExportDialog.tsx`, `packages/excalidraw/components/JSONExportDialog.tsx`, `packages/excalidraw/actions/actionExport.tsx` |
| **Examples** | A designer exports a system diagram as an SVG to embed in a Confluence page. A developer exports as `.excalidraw` to commit to a repository. |
| **Related Terms** | [Frame](#frame), [Library](#library), [Scene](#scene) |
| **DO NOT CONFUSE WITH** | Saving or persisting a scene — Export produces a *portable artefact* (SVG, PNG, `.excalidraw` JSON) for use outside Excalidraw. Auto-saving to `localStorage` or syncing to Firebase is not an export operation. |

---

### FileId

| | |
|---|---|
| **Definition** | A content-addressable identifier (hash) for a binary file asset such as an image. Scene elements reference binary files by `FileId`; the actual file data is stored separately. |
| **Context** | When an image is pasted or dropped onto the canvas, its content is hashed to produce a `FileId`. The element stores only the `FileId`; the file data lives in IndexedDB (local) or Firebase Storage (cloud, encrypted). Peers in a collaboration room fetch and decrypt files on demand using the `FileId`. |
| **Where used (key files)** | `packages/excalidraw/data/blob.ts` (hashing and file handling), `packages/excalidraw/types.ts` (FileId type), IndexedDB file store, Firebase Storage (encrypted file upload) |
| **Examples** | An element of type `"image"` has `fileId: "sha256-abc123..."`. The matching binary is fetched from IndexedDB or Firebase Storage when the element is rendered. |
| **Related Terms** | [Element](#element), [End-to-End Encryption](#end-to-end-encryption-e2ee), [Scene](#scene) |
| **DO NOT CONFUSE WITH** | An element `id` — a FileId identifies a *binary asset* (image data), not a scene element. An image element has both its own `id` and a separate `fileId` pointing to the binary payload. |

---

### Follow Mode

| | |
|---|---|
| **Definition** | A collaboration feature where one participant's viewport automatically tracks another participant's viewport and cursor position in real time. |
| **Context** | Activated from the collaborators panel. The follower's scroll and zoom mirror the leader's; any interaction by the follower exits follow mode. |
| **Where used (key files)** | `excalidraw-app/collab/Collab.tsx` (follow-mode state and updates), collaborators panel UI in `excalidraw-app/` |
| **Examples** | During a remote design review, a presenter enables their screen as the "leader"; all attendees in follow mode see exactly what the presenter sees as they navigate the canvas. |
| **Related Terms** | [Collaboration Room](#collaboration-room), [Viewport](#viewport) |
| **DO NOT CONFUSE WITH** | Screen sharing or a presentation tool — Follow Mode synchronises *viewport position within the Excalidraw canvas only*. The follower's canvas remains fully interactive and no part of the desktop is shared. |

---

### Fractional Index

| | |
|---|---|
| **Definition** | A sortable string key assigned to each element that determines its z-order (rendering stack position) on the canvas. Fractional indices support stable ordering during concurrent edits without requiring a full re-index. |
| **Context** | Managed in `packages/element/src/fractionalIndex.ts`. When collaborators concurrently move elements in the z-order stack, fractional indices are used to resolve the final order deterministically. Invalid indices are repaired by `syncInvalidIndices`. |
| **Where used (key files)** | `packages/element/src/fractionalIndex.ts` (`generateFractionalIndex()`, `syncInvalidIndices()`), `packages/element/src/types.ts` (element `index` property) |
| **Examples** | An element at index `"a1"` renders below one at `"a2"`. If a user inserts an element between the two, it receives an index like `"a1V"`. |
| **Related Terms** | [Element](#element), [Reconciliation](#reconciliation), [Z-Index](#z-index) |
| **DO NOT CONFUSE WITH** | A CSS `z-index` integer — Fractional Indices are *sortable string keys* used to determine render order. They allow inserting elements at arbitrary z-positions without renumbering the entire list, and have no relation to CSS properties. |

---

### Frame

| | |
|---|---|
| **Definition** | A named, rectangular container element that groups child elements. Frames serve as organisational units within a canvas and are also the export unit for the Diagram-to-Code feature. |
| **Context** | Defined in `packages/element/src/frame.ts`. A frame can be renamed, resized, and exported independently. Elements placed inside a frame are visually clipped to its bounds during export. |
| **Where used (key files)** | `packages/element/src/frame.ts` (frame helpers), `packages/excalidraw/actions/actionFrame.ts`, `packages/element/src/types.ts` (ExcalidrawFrameElement) |
| **Examples** | A diagram with three frames: "Frontend", "Backend", and "Database". Each frame is exported separately for documentation. |
| **Related Terms** | [Element](#element), [Export](#export), [Scene](#scene) |
| **DO NOT CONFUSE WITH** | A Group or a browser `<iframe>` — a Frame is a *named rectangular container element* in the scene with its own visual boundary and independent export identity. Groups have no bounding box and no separate export; `<iframe>` is the web embedding tag used by the Embeddable element type. |

---

### Freedraw

| | |
|---|---|
| **Definition** | A freehand stroke element created by dragging the pointer on the canvas without snapping to shapes or grids. Rendered using the `perfect-freehand` algorithm to produce smooth, pressure-sensitive strokes. |
| **Context** | The freedraw tool produces elements of type `"freedraw"`. Stroke points are stored as a series of x/y coordinates with pressure values. |
| **Where used (key files)** | `packages/element/src/types.ts` (ExcalidrawFreeDrawElement), `packages/element/src/renderElement.ts` (freedraw rendering via `perfect-freehand`) |
| **Examples** | Annotating a diagram with a hand-drawn circle to highlight a component. |
| **Related Terms** | [Element](#element), [Canvas](#canvas) |
| **DO NOT CONFUSE WITH** | A generic "sketch" mode in other apps, or the `freedraw` npm library directly — Freedraw in Excalidraw refers specifically to elements of type `"freedraw"` whose strokes are smoothed by the `perfect-freehand` algorithm. |

---

### Group

| | |
|---|---|
| **Definition** | A logical association of multiple elements that can be selected, moved, resized, and styled together as a single unit without creating a container element. |
| **Context** | Groups are stored as a `groupIds` array on each element. There is no dedicated group element type — grouping is a property of membership. Elements can belong to multiple nested groups. |
| **Where used (key files)** | `packages/element/src/groups.ts` (group selection and membership helpers), element property `groupIds` in `packages/element/src/types.ts` |
| **Examples** | A UML class box composed of three rectangles and several text elements, grouped so they move together. |
| **Related Terms** | [Element](#element), [Frame](#frame), [Scene](#scene) |
| **DO NOT CONFUSE WITH** | A Frame — Groups have *no visual container, no bounding rectangle, and no independent export*. Grouping is purely a logical membership array (`groupIds`) on individual elements. Frames have a visible boundary and can be exported separately. |

---

### Library

| | |
|---|---|
| **Definition** | A named, persistent collection of reusable element groups ("library items") that a user can save and insert into any drawing. |
| **Context** | Stored in IndexedDB. Importable and exportable as `.excalidrawlib` JSON files. Users can also browse and import shapes from the community library portal (an external website). |
| **Where used (key files)** | `packages/excalidraw/data/library.ts` (Library class, IndexedDB persistence), `packages/excalidraw/actions/actionAddToLibrary.ts`, `.excalidrawlib` file format |
| **Examples** | A developer saves a set of AWS architecture icons as a library and reuses them across multiple infrastructure diagrams. |
| **Related Terms** | [Element](#element), [Export](#export), [Scene](#scene) |
| **DO NOT CONFUSE WITH** | A JavaScript npm package or the community library portal website — within Excalidraw, a Library is a *user-owned, local collection of reusable element groups* stored in the browser's IndexedDB, not a code dependency. |

---

### Linear Element

| | |
|---|---|
| **Definition** | An element type that is defined by a sequence of points rather than a bounding rectangle. Includes arrows and lines. Supports straight, curved (arc), and elbow (right-angle) routing styles. |
| **Context** | Managed by `LinearElementEditor` in `packages/element/src/linearElementEditor.ts`. Points can be added, moved, or deleted individually. Linear elements can be bound to shape elements at their endpoints. |
| **Where used (key files)** | `packages/element/src/linearElementEditor.ts` (`LinearElementEditor`), `packages/element/src/types.ts` (ExcalidrawLinearElement), `packages/element/src/binding.ts` |
| **Examples** | A straight arrow between two boxes, a curved line tracing a data flow, an elbow-routed connector in an ERD. |
| **Related Terms** | [Arrowhead](#arrowhead), [Binding](#binding), [Element](#element) |
| **DO NOT CONFUSE WITH** | A straight line or a single-segment element — Linear Element is the *element type category* covering arrows, lines, and elbow connectors, all defined by a sequence of points. A linear element may be curved, elbow-routed, or multi-segment. |

---

### Mermaid

| | |
|---|---|
| **Definition** | A text-based diagramming syntax used as an intermediate representation in the Text-to-Diagram (TTD) pipeline. Mermaid syntax is generated by the AI backend and then converted into native Excalidraw elements. |
| **Context** | The AI endpoint returns Mermaid-formatted text; `mermaidValidation.ts` checks it for syntax errors and `mermaidAutoFix.ts` attempts repairs. The `@excalidraw/mermaid-to-excalidraw` package performs the final conversion. Mermaid is an integration artefact, not a first-class storage format. |
| **Where used (key files)** | `packages/excalidraw/components/TTDDialog/utils/mermaidValidation.ts`, `packages/excalidraw/components/TTDDialog/utils/mermaidAutoFix.ts`, `@excalidraw/mermaid-to-excalidraw` package |
| **Examples** | A TTD prompt describing a user authentication flow returns `graph TD; A[User] --> B[Login Page]; B --> C[Auth Service]` as Mermaid, which is then rendered as native elements. |
| **Related Terms** | [Text-to-Diagram (TTD)](#text-to-diagram-ttd) |
| **DO NOT CONFUSE WITH** | A native Excalidraw storage format or a user-facing feature — Mermaid is an *internal intermediate representation* used solely within the TTD pipeline. Users interact with natural language prompts; Mermaid syntax is generated and consumed automatically, never stored as the scene's source of truth. |

---

### Portal

| | |
|---|---|
| **Definition** | The Socket.IO client abstraction that manages the WebSocket connection lifecycle for a collaboration room, including connecting, reconnecting, broadcasting scene deltas, and syncing cursor positions. |
| **Context** | Implemented in `excalidraw-app/collab/Portal.tsx`. `Portal` tracks which element versions have already been broadcast (`broadcastedElementVersions`) so only changed elements are included in delta payloads, minimising bandwidth. |
| **Where used (key files)** | `excalidraw-app/collab/Portal.tsx` (`Portal.open()`, `Portal.broadcastScene()`, `broadcastedElementVersions`) |
| **Examples** | When a user joins a room, `Portal.open()` establishes the WebSocket connection. When an element is moved, `Portal.broadcastScene()` emits only the changed element. |
| **Related Terms** | [Collaboration Room](#collaboration-room), [Durable Increment](#durable-increment), [Scene](#scene) |
| **DO NOT CONFUSE WITH** | A React Portal (`ReactDOM.createPortal`) — Excalidraw's Portal is the *WebSocket client abstraction* for a collaboration room (Socket.IO lifecycle management), not a React mechanism for rendering UI outside the component tree. |

---

### Reconciliation

| | |
|---|---|
| **Definition** | The algorithm that merges divergent element states from multiple collaborators into a single consistent scene, resolving conflicts using a Last-Write-Wins (LWW) strategy with deterministic tiebreaking. |
| **Context** | Implemented in `packages/excalidraw/data/reconcile.ts`. Remote elements are discarded if the local version is newer, if the element is actively being edited, or if versions are equal but the local `versionNonce` is lower. The merged element list is re-sorted by fractional index. This is not full OT/CRDT but is sufficient for the eventual-consistency requirements of a shared whiteboard. |
| **Where used (key files)** | `packages/excalidraw/data/reconcile.ts` (`reconcileElements()`), called from `excalidraw-app/collab/Collab.tsx` on incoming remote updates |
| **Examples** | Two collaborators simultaneously move the same rectangle to different positions. Reconciliation picks the winner based on version numbers and nonces, ensuring both clients converge to the same state within the next sync cycle. |
| **Related Terms** | [Collaboration Room](#collaboration-room), [Durable Increment](#durable-increment), [Fractional Index](#fractional-index) |
| **DO NOT CONFUSE WITH** | React reconciliation (virtual DOM diffing) — Excalidraw Reconciliation is the *collaboration merge algorithm* that resolves concurrent element conflicts using Last-Write-Wins semantics. It operates on scene element data, not on React component trees. |

---

### Room Link

| | |
|---|---|
| **Definition** | The URL shared with collaborators to join a specific collaboration room. The URL fragment (the `#` portion) contains both the room ID and the AES-GCM encryption key. |
| **Context** | Generated when a user starts a live collaboration session. Because the key is in the URL fragment, it is never sent to any server. Anyone with the complete URL can join the room and decrypt its content; the key cannot be recovered if the URL is lost. |
| **Where used (key files)** | `excalidraw-app/collab/Collab.tsx` (link generation), URL fragment format `#room=<roomId>,<base64key>` |
| **Examples** | `https://excalidraw.com/#room=abc123,base64EncodedKey` |
| **Related Terms** | [Collaboration Room](#collaboration-room), [End-to-End Encryption](#end-to-end-encryption-e2ee), [Share Link](#share-link) |
| **DO NOT CONFUSE WITH** | A Share Link — a Room Link opens an *active, real-time collaborative session* via WebSocket. A Share Link points to a static, encrypted snapshot in Firebase that is viewable but not live-editable. |

---

### Scene

| | |
|---|---|
| **Definition** | The complete, serialisable state of a drawing: the ordered list of all elements and the accompanying AppState. A scene is the canonical unit of work in Excalidraw — what is created, saved, shared, and exported. |
| **Context** | Serialised as `.excalidraw` JSON. Managed by the `Scene` class in `packages/element/src/Scene.ts` and the `Store` in `packages/element/src/store.ts`. A scene snapshot is taken on every significant mutation and used as the basis for undo/redo and collaboration sync. |
| **Where used (key files)** | `packages/element/src/Scene.ts` (Scene class), `packages/element/src/store.ts` (Store wrapping the scene), `.excalidraw` JSON file format |
| **Examples** | Opening Excalidraw in a fresh tab starts with an empty scene. Importing a `.excalidraw` file replaces the current scene entirely. |
| **Related Terms** | [AppState](#appstate), [Element](#element), [Export](#export), [Scene Store](#scene-store) |
| **DO NOT CONFUSE WITH** | AppState — the Scene is the *persistent drawing content* (elements and their properties). AppState is ephemeral UI context (active tool, zoom, scroll) that travels alongside the scene but is not the drawing itself. |

---

### Scene Store

| | |
|---|---|
| **Definition** | The in-memory store that manages the canonical, immutable snapshot of the scene and produces versioned increments (durable or ephemeral) on every mutation. |
| **Context** | Implemented in `packages/element/src/store.ts`. Follows an immutable snapshot + named increment model: each mutation produces a `StoreSnapshot` and a typed increment. Increments feed the undo/redo history and the collaboration broadcast layer. |
| **Where used (key files)** | `packages/element/src/store.ts` (`Store`, `Store.scheduleCapture()`, `StoreSnapshot`), feeds undo/redo history and collaboration broadcast layer |
| **Examples** | Every time a user moves an element, `Store.scheduleCapture()` creates a new snapshot and emits a durable increment to the history stack. |
| **Related Terms** | [Durable Increment](#durable-increment), [Ephemeral Increment](#ephemeral-increment), [Scene](#scene), [StoreDelta](#storedelta) |
| **DO NOT CONFUSE WITH** | The `Scene` class — the Scene Store *manages immutable snapshots and produces versioned increments*. The `Scene` class is the element container. The Store wraps the Scene and provides the mutation-tracking and versioning layer on top of it. |

---

### Session

| | |
|---|---|
| **Definition** | A user's active interaction with Excalidraw within a single browser tab from the time the canvas loads until the tab is closed or the scene is reset. Sessions are not authenticated and have no server-side representation. |
| **Context** | Session state includes the current scene (persisted to `localStorage`) and transient `AppState`. In a collaboration context, a session is also associated with a collaboration room for its duration. |
| **Where used (key files)** | `packages/excalidraw/appState.ts` (`clearAppStateForLocalStorage()`), browser `localStorage` (scene persistence), `excalidraw-app/collab/Collab.tsx` (collaboration association) |
| **Examples** | A user opens Excalidraw, draws a diagram for 30 minutes, and closes the tab. The session is over; the diagram remains in `localStorage` for the next visit. |
| **Related Terms** | [AppState](#appstate), [Collaboration Room](#collaboration-room), [Scene](#scene) |
| **DO NOT CONFUSE WITH** | A server-side authenticated session or HTTP session cookie — Excalidraw Sessions are *entirely client-side, unauthenticated browser-tab lifetimes* with no server representation. There is no login, session token, or server-side session store. |

---

### Share Link

| | |
|---|---|
| **Definition** | A read-only or view URL for a diagram that has been saved to Firebase Firestore and Firebase Storage. The encryption key is embedded in the URL fragment, enabling anyone with the link to view the diagram without a collaboration connection. |
| **Context** | Distinct from a room link — a share link points to a static snapshot persisted in Firebase, not an active collaboration session. The receiving client fetches and decrypts the scene and binary files from Firebase on load. |
| **Where used (key files)** | Firebase Firestore and Firebase Storage (encrypted snapshot storage), URL fragment (`#`) for key transport, `excalidraw-app/` sharing utilities |
| **Examples** | A designer posts a share link in a Slack message. Team members open it to view (but not edit) the latest version of the diagram. |
| **Related Terms** | [Collaboration Room](#collaboration-room), [End-to-End Encryption](#end-to-end-encryption-e2ee), [Room Link](#room-link) |
| **DO NOT CONFUSE WITH** | A Room Link — a Share Link opens a *static, read-only snapshot* fetched from Firebase. A Room Link connects to a live collaborative session via WebSocket. Share Links do not support real-time co-editing. |

---

### Snap

| | |
|---|---|
| **Definition** | A drawing aid that causes elements to align automatically to a grid, to other elements' edges/centres, or to angular increments when being moved or resized. |
| **Context** | Snap behaviour is toggled via AppState flags. Grid snap uses a configurable grid size. Object snap (to edges and centres of other elements) is calculated dynamically as the element is dragged. |
| **Where used (key files)** | `packages/excalidraw/snapping.ts` (snap calculation helpers), AppState snap-toggle flags, drag/resize handlers in `packages/excalidraw/components/App.tsx` |
| **Examples** | Enabling grid snap causes dragged elements to jump to the nearest grid intersection. Object snap shows blue guide lines when an edge aligns with a neighbouring element. |
| **Related Terms** | [AppState](#appstate), [Canvas](#canvas), [Element](#element) |
| **DO NOT CONFUSE WITH** | CSS scroll snapping or any browser-level snap feature — Snap in Excalidraw is a *drawing aid* that aligns scene elements to grids or neighbouring elements' edges/centres during drag and resize operations, with no relation to CSS. |

---

### StoreDelta

| | |
|---|---|
| **Definition** | The structural diff between two consecutive scene snapshots, recording which elements were inserted, updated, or deleted. |
| **Context** | Part of a `DurableIncrement`. Used by the undo/redo system to reverse or replay specific changes, and by the collaboration layer to broadcast only the changed elements rather than the full scene. |
| **Where used (key files)** | `packages/element/src/store.ts` (StoreDelta construction), `packages/element/src/delta.ts` (delta diffing logic), part of `DurableIncrement` |
| **Examples** | Moving three elements produces a `StoreDelta` with three entries in the "updated" set, each carrying the element's previous and new state. |
| **Related Terms** | [Durable Increment](#durable-increment), [Reconciliation](#reconciliation), [Scene Store](#scene-store) |
| **DO NOT CONFUSE WITH** | A Durable Increment — a StoreDelta is the *structural diff payload* (inserted/updated/deleted element sets) *carried inside* a Durable Increment. An Increment wraps a Delta; they are distinct objects with different roles. |

---

### Text-to-Diagram (TTD)

| | |
|---|---|
| **Definition** | The AI-assisted workflow in which a user describes a diagram in natural language (or provides Mermaid syntax directly), and the system generates native Excalidraw elements via an external AI API. |
| **Context** | Accessed through the TTD dialog (`packages/excalidraw/components/TTDDialog/`). The pipeline is: user prompt → streaming AI response (Mermaid) → syntax validation → auto-fix → conversion to elements → placement on canvas. Chat history is persisted in IndexedDB under `IDB_TTD_CHATS`. |
| **Where used (key files)** | `packages/excalidraw/components/TTDDialog/TTDDialog.tsx` (entry point), `packages/excalidraw/components/TTDDialog/utils/mermaidValidation.ts`, `packages/excalidraw/components/TTDDialog/utils/mermaidAutoFix.ts`, IndexedDB key `IDB_TTD_CHATS` (chat history) |
| **Examples** | Typing "A user logs in, the Auth Service validates credentials, and returns a JWT" generates a sequence diagram as native Excalidraw elements. |
| **Related Terms** | [Mermaid](#mermaid), [Scene](#scene) |
| **DO NOT CONFUSE WITH** | Direct Mermaid import — TTD is an *AI-assisted, conversational pipeline*. Users interact with natural language; Mermaid is only the auto-generated intermediate representation. Also not a general AI chat feature; TTD is specifically for producing diagram elements. |

---

### Tool

| | |
|---|---|
| **Definition** | A user-selectable drawing mode that determines the type of element created on the next pointer interaction (e.g., rectangle tool, arrow tool, text tool, selection tool). |
| **Context** | Tools are registered in the toolbar and activated via clicks or keyboard shortcuts. The active tool is stored in `appState.activeTool`. Once an element is created, the tool may remain active (if `locked: true`) or revert to the selection tool. |
| **Where used (key files)** | `packages/excalidraw/types.ts` (ActiveTool type), AppState property `activeTool`, toolbar components in `packages/excalidraw/components/` |
| **Examples** | Rectangle tool (`"rectangle"`), arrow tool (`"arrow"`), freedraw tool (`"freedraw"`), text tool (`"text"`), hand tool (`"hand"`), eraser tool (`"eraser"`) |
| **Related Terms** | [Action](#action), [AppState](#appstate), [Element](#element) |
| **DO NOT CONFUSE WITH** | An Action — a Tool defines the *drawing mode* for the next pointer interaction and does not immediately produce a result. An Action is an operation executed immediately (e.g., "align top", "delete selected"). Switching to the rectangle Tool sets a mode; it does not create an element. |

---

### Viewport

| | |
|---|---|
| **Definition** | The visible portion of the canvas at any given moment, defined by the current scroll position (`scrollX`, `scrollY`) and zoom level. The canvas is infinite; the viewport is the window through which a user sees it. |
| **Context** | Viewport parameters are stored in `AppState`. Zoom and scroll are modified by pinch gestures, scroll wheel, pan gestures, and keyboard shortcuts. The viewport determines which elements are rendered and how large they appear. |
| **Where used (key files)** | `packages/excalidraw/types.ts` (AppState `scrollX`, `scrollY`, `zoom`), `packages/excalidraw/viewportGeometry.ts` (viewport intersection helpers), `packages/excalidraw/components/App.tsx` (zoom/scroll handlers) |
| **Examples** | A user zooms to 200% and scrolls right — the viewport has changed but the scene (and its elements) is unchanged. |
| **Related Terms** | [AppState](#appstate), [Canvas](#canvas), [Follow Mode](#follow-mode), [Zoom](#zoom) |
| **DO NOT CONFUSE WITH** | The Canvas — the Canvas is the *infinite logical drawing surface*; the Viewport is the *visible window into it*. Changing zoom or scrolling moves the Viewport but does not alter the Canvas or any element's geometry. |

---

### Z-Index

| | |
|---|---|
| **Definition** | The relative rendering order of elements on the canvas, determining which element appears in front of or behind another when they overlap. Higher z-index = rendered on top. |
| **Context** | Z-index is controlled by fractional indices. Users can adjust z-order via "Bring to front", "Send to back", "Bring forward", and "Send backward" actions. In a collaborative session, fractional indices are reconciled to ensure consistent z-order across all clients. |
| **Where used (key files)** | `packages/element/src/fractionalIndex.ts` (fractional index management), `packages/element/src/zindex.ts` (z-order action helpers), z-order actions in `packages/excalidraw/actions/` |
| **Examples** | Placing a text label on top of a filled rectangle requires the label to have a higher z-index. |
| **Related Terms** | [Element](#element), [Fractional Index](#fractional-index) |
| **DO NOT CONFUSE WITH** | CSS `z-index` — Excalidraw's Z-Index is *determined by fractional string indices* in the element list, not integer CSS properties. There is no CSS `z-index` involved in scene element stacking. |

---

### Zoom

| | |
|---|---|
| **Definition** | The scale factor applied to the canvas viewport, controlling how large or small elements appear on screen. Does not affect the actual size of elements in the scene. |
| **Context** | Stored as `zoom: { value: number }` in `AppState`. Zoom can be changed via scroll wheel, pinch gesture, `Ctrl+/−`, or the zoom controls in the UI. The canvas re-renders at the new scale without modifying any element geometry. |
| **Where used (key files)** | `packages/excalidraw/types.ts` (AppState `zoom: { value: number }`), scroll/pinch handlers in `packages/excalidraw/components/App.tsx`, `packages/excalidraw/components/ZoomButtons.tsx` |
| **Examples** | At zoom 1.0, a 100×100 px rectangle occupies 100×100 screen pixels. At zoom 2.0, it occupies 200×200 screen pixels. |
| **Related Terms** | [AppState](#appstate), [Canvas](#canvas), [Viewport](#viewport) |
| **DO NOT CONFUSE WITH** | Scaling or resizing an element — Zoom changes *viewport magnification only*; element geometry (width, height, scene coordinates) is unchanged. Resizing an element alters its actual dimensions in the scene data. |

---

## 3. Scope

### What This Glossary Covers

- Core domain concepts directly represented in the product's UI, data model, or collaboration protocol.
- Terms used across multiple teams or disciplines (product, engineering, design, support).
- Concepts specific to Excalidraw that may not have obvious meanings to newcomers.

### What This Glossary Excludes

- Generic software engineering terms (e.g., "API", "component", "hook", "prop") unless given a product-specific meaning.
- Technical implementation details that are internal to a single module (e.g., specific function signatures, React lifecycle methods).
- Infrastructure and DevOps terminology (e.g., Vercel edge network, Docker multi-stage builds) unless directly referenced in product communication.
- External product features managed outside this repository (e.g., Excalidraw Plus subscription tiers, Crowdin translation workflows).

---

## 4. Usage Guidelines

- **Use glossary terms consistently** in GitHub issues, pull request descriptions, design documents, user-facing copy, and code comments.
- **Avoid informal synonyms** — for example, prefer "collaboration room" over "shared whiteboard", "session", or "room" when referring to the specific concept defined here.
- **Link to this document** in onboarding materials, architecture docs, and READMEs where domain concepts are introduced.
- **Use the exact capitalisation** shown in the Term field (e.g., "AppState" not "app state", "FileId" not "file ID") in code and technical writing to maintain consistency with the codebase.
- **Support staff** can use this glossary to understand customer-reported issues and map them to the correct engineering concepts before escalating.

---

## 5. Maintenance

### How Updates Are Made

1. **Propose** a new or updated term by opening a pull request that edits this file (`docs/product/domain-glossary.md`).
2. **Review** the change with at least one representative from engineering and one from product or design to ensure the definition is both technically accurate and broadly understandable.
3. **Merge** once approved. The PR description should explain why the term was added or changed.

### Contributing New Terms

- If you encounter a term used inconsistently across the codebase, tickets, or documentation, that is a signal it belongs in this glossary.
- Include a Definition, Context, and Related Terms at minimum. Examples are strongly encouraged.
- If renaming or superseding an informal term, note the deprecated form in the definition so readers recognise it.

### Versioning

This document follows the same version scheme as the other memory documents in `docs/memory/`. The **Version** and **Last Updated** fields at the top are updated with each significant change.
