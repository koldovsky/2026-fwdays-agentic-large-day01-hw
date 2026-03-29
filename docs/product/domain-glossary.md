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
| **Examples** | `"selectAll"`, `"deleteSelectedElements"`, `"alignTop"`, `"toggleGrid"` |
| **Related Terms** | [Action Source](#action-source), [AppState](#appstate), [Command Palette](#command-palette), [Scene](#scene) |

---

### Action Source

| | |
|---|---|
| **Definition** | A tag that identifies how an action was triggered: `"ui"` (button click), `"keyboard"` (shortcut), `"api"` (external caller), or `"commandPalette"`. |
| **Context** | Tracked on every action invocation for analytics and debugging. Allows distinguishing whether the same logical action was triggered by a user gesture or an embedding application. |
| **Examples** | A user pressing `Ctrl+A` triggers `"selectAll"` with `ActionSource = "keyboard"`. The same action called via `ExcalidrawImperativeAPI` has `ActionSource = "api"`. |
| **Related Terms** | [Action](#action), [ExcalidrawImperativeAPI](#excalidrawimperativeapi) |

---

### AppState

| | |
|---|---|
| **Definition** | The transient UI state that accompanies a drawing session: currently selected tool, zoom level, scroll position, open panels, active collaborator cursors, and similar ephemeral settings. AppState is **not** part of the diagram's persistent content. |
| **Context** | Managed as React class component state in the `App` class and selectively persisted to `localStorage` via `clearAppStateForLocalStorage()`. Serialised alongside scene elements when exporting to `.excalidraw` format, but a subset is stripped before local storage writes to avoid persisting session-only values. |
| **Examples** | `activeTool: "rectangle"`, `zoom: { value: 1.5 }`, `scrollX: -300`, `openDialog: "export"` |
| **Related Terms** | [Scene](#scene), [Element](#element), [Session](#session) |

---

### Arrowhead

| | |
|---|---|
| **Definition** | A decorative marker placed at one or both endpoints of a linear element (arrow or line) to indicate directionality. |
| **Context** | Defined in `packages/element/src/arrowheads.ts`. Arrowhead style is a property of the element, selectable through the style panel. |
| **Examples** | Triangle, bar, dot, none. An arrow connecting two boxes in a flowchart uses `arrowhead: "triangle"` at the target end. |
| **Related Terms** | [Element](#element), [Linear Element](#linear-element) |

---

### Binding

| | |
|---|---|
| **Definition** | A persistent connection between the endpoint of a linear element (arrow or line) and a shape element, so the arrow moves and resizes in sync with the shape it is attached to. |
| **Context** | Managed in `packages/element/src/binding.ts`. When a user drags an arrow endpoint onto a shape, a binding is created. Bindings are stored as references on both the linear element and the target element. |
| **Examples** | Drawing an arrow from a rectangle to an ellipse — if the rectangle is moved, the arrow stretches to follow. |
| **Related Terms** | [Element](#element), [Linear Element](#linear-element), [Scene](#scene) |

---

### Canvas

| | |
|---|---|
| **Definition** | The infinite, scrollable drawing surface that hosts all scene elements. Rendered using the HTML5 Canvas 2D API split across two overlaid layers: `StaticCanvas` (scene elements) and `InteractiveCanvas` (selection handles, collaborator cursors). |
| **Context** | The visible viewport is a window into the canvas, controlled by `scrollX`, `scrollY`, and `zoom` in `AppState`. The canvas has no fixed size limit. |
| **Examples** | When a user drags the background, they are panning the viewport over the canvas. |
| **Related Terms** | [AppState](#appstate), [Scene](#scene), [Viewport](#viewport), [Zoom](#zoom) |

---

### Collaboration Room

| | |
|---|---|
| **Definition** | A temporary, shared drawing session identified by a unique room ID. All participants connect via WebSocket, see each other's cursors in real time, and receive live updates to the shared scene. |
| **Context** | Room IDs are randomly generated when a user clicks "Live collaboration". The room is considered active as long as at least one participant remains connected. Room state is backed up to Firebase Firestore in encrypted form. There is no server-side authentication — possession of the room link is sufficient to join. |
| **Examples** | A team design review where four engineers open the same share URL and co-edit a system architecture diagram. |
| **Related Terms** | [End-to-End Encryption](#end-to-end-encryption-e2ee), [Portal](#portal), [Reconciliation](#reconciliation), [Room Link](#room-link), [Scene](#scene) |

---

### Command Palette

| | |
|---|---|
| **Definition** | A keyboard-searchable overlay that lists all registered actions by name, enabling power users to trigger any operation without navigating toolbars or menus. |
| **Context** | Powered by the same `ActionManager` registry that handles keyboard shortcuts and toolbar buttons, so every action is automatically available in the palette at no additional cost. |
| **Examples** | Pressing the palette shortcut and typing "group" surfaces the "Group selection" action. |
| **Related Terms** | [Action](#action), [Action Source](#action-source) |

---

### Durable Increment

| | |
|---|---|
| **Definition** | A versioned, named change to the scene that is stored in undo/redo history and broadcast to collaborators. Distinct from an ephemeral increment, which is transient and never stored. |
| **Context** | Produced by `Store.scheduleCapture()` in `packages/element/src/store.ts` when a user performs a significant edit (e.g., moving an element, changing text). Contains a `StoreDelta` describing the inserted and deleted element sets. |
| **Examples** | Moving a rectangle creates a durable increment; the undo stack grows by one entry. Moving a collaborator cursor creates an ephemeral increment. |
| **Related Terms** | [Ephemeral Increment](#ephemeral-increment), [Scene Store](#scene-store), [StoreDelta](#storedelta) |

---

### Element

| | |
|---|---|
| **Definition** | A single drawable object on the canvas. Every element has a stable `id`, a `type`, geometric properties (x, y, width, height, angle), visual style properties (stroke colour, fill, opacity), and a monotonically increasing `version`. |
| **Context** | Elements are the atomic unit of the scene. Defined and managed in `packages/element/`. Elements are never mutated in place; mutations create a new version via `mutateElement()`. |
| **Examples** | A blue rounded rectangle, a dashed arrow between two boxes, a text label reading "API Gateway", an embedded image. |
| **Related Terms** | [Arrowhead](#arrowhead), [Binding](#binding), [Frame](#frame), [Fractional Index](#fractional-index), [Linear Element](#linear-element), [Scene](#scene) |

---

### Embeddable

| | |
|---|---|
| **Definition** | An element type that renders an external web URL as an interactive iframe inside the canvas. |
| **Context** | Defined in `packages/element/src/embeddable.ts`. The list of allowed URL patterns is controlled by an allow-list to prevent embedding of arbitrary origins. The iframe is rendered only when the element is in "active" mode (double-clicked). |
| **Examples** | Embedding a YouTube video, a Figma frame, or a live webpage inside a diagram. |
| **Related Terms** | [Element](#element), [Scene](#scene) |

---

### End-to-End Encryption (E2EE)

| | |
|---|---|
| **Definition** | A security model in which all diagram data (scene JSON and binary files) is encrypted on the client before leaving the browser, using AES-GCM 128-bit keys. No server — including Firebase or the WebSocket relay — ever receives plaintext data. |
| **Context** | Defined in `packages/excalidraw/data/encryption.ts` using the Web Crypto API. The AES key is generated client-side with a 128-bit length (`ENCRYPTION_KEY_BITS = 128`), formatted as a JWK, and embedded in the **URL fragment** (the `#` portion), which browsers never send to servers. Key loss means permanent data loss — this is an accepted trade-off for zero-trust storage. |
| **Examples** | When sharing a diagram link, the URL fragment `#roomId,base64key` contains the decryption key. Anyone with the full URL can decrypt; anyone without the fragment cannot. |
| **Related Terms** | [Collaboration Room](#collaboration-room), [FileId](#fileid), [Room Link](#room-link), [Share Link](#share-link) |

---

### Ephemeral Increment

| | |
|---|---|
| **Definition** | A transient change to the scene — such as a cursor movement or idle status update — that is broadcast to collaborators but never stored in undo/redo history or persisted to any storage layer. |
| **Context** | Produced by `Store.capture()` alongside durable increments. Ephemeral increments are emitted over the WebSocket at ~30 fps for cursor positions. |
| **Examples** | Moving your mouse over the canvas while collaborating produces ephemeral increments that update your cursor position on peers' screens. |
| **Related Terms** | [Durable Increment](#durable-increment), [Portal](#portal), [Scene Store](#scene-store) |

---

### ExcalidrawImperativeAPI

| | |
|---|---|
| **Definition** | The programmatic handle exposed to consumers of the `@excalidraw/excalidraw` npm package. It is the single stable public contract for external applications to read and write scene state, execute actions, listen to events, and customise the UI. |
| **Context** | Obtained by passing an `excalidrawAPI` callback prop to the `<Excalidraw />` component. Internal classes (`App`, `ActionManager`, `Store`) are not part of the public API. |
| **Examples** | `api.updateScene({ elements })` replaces scene elements; `api.getSceneElements()` returns a snapshot; `api.scrollToContent(elements, { animate: true })` pans the viewport. |
| **Related Terms** | [Action Source](#action-source), [AppState](#appstate), [Scene](#scene) |

---

### Export

| | |
|---|---|
| **Definition** | The action of serialising the current scene or selected elements into a portable format for use outside Excalidraw. |
| **Context** | Supported formats: `.excalidraw` (JSON, full scene including AppState), `.excalidrawlib` (library subset), PNG (rasterised), SVG (vector). The export dialog allows choosing scope (whole scene vs. selected elements) and appearance options. |
| **Examples** | A designer exports a system diagram as an SVG to embed in a Confluence page. A developer exports as `.excalidraw` to commit to a repository. |
| **Related Terms** | [Frame](#frame), [Library](#library), [Scene](#scene) |

---

### FileId

| | |
|---|---|
| **Definition** | A content-addressable identifier (hash) for a binary file asset such as an image. Scene elements reference binary files by `FileId`; the actual file data is stored separately. |
| **Context** | When an image is pasted or dropped onto the canvas, its content is hashed to produce a `FileId`. The element stores only the `FileId`; the file data lives in IndexedDB (local) or Firebase Storage (cloud, encrypted). Peers in a collaboration room fetch and decrypt files on demand using the `FileId`. |
| **Examples** | An element of type `"image"` has `fileId: "sha256-abc123..."`. The matching binary is fetched from IndexedDB or Firebase Storage when the element is rendered. |
| **Related Terms** | [Element](#element), [End-to-End Encryption](#end-to-end-encryption-e2ee), [Scene](#scene) |

---

### Follow Mode

| | |
|---|---|
| **Definition** | A collaboration feature where one participant's viewport automatically tracks another participant's viewport and cursor position in real time. |
| **Context** | Activated from the collaborators panel. The follower's scroll and zoom mirror the leader's; any interaction by the follower exits follow mode. |
| **Examples** | During a remote design review, a presenter enables their screen as the "leader"; all attendees in follow mode see exactly what the presenter sees as they navigate the canvas. |
| **Related Terms** | [Collaboration Room](#collaboration-room), [Viewport](#viewport) |

---

### Fractional Index

| | |
|---|---|
| **Definition** | A sortable string key assigned to each element that determines its z-order (rendering stack position) on the canvas. Fractional indices support stable ordering during concurrent edits without requiring a full re-index. |
| **Context** | Managed in `packages/element/src/fractionalIndex.ts`. When collaborators concurrently move elements in the z-order stack, fractional indices are used to resolve the final order deterministically. Invalid indices are repaired by `syncInvalidIndices`. |
| **Examples** | An element at index `"a1"` renders below one at `"a2"`. If a user inserts an element between the two, it receives an index like `"a1V"`. |
| **Related Terms** | [Element](#element), [Reconciliation](#reconciliation), [Z-Index](#z-index) |

---

### Frame

| | |
|---|---|
| **Definition** | A named, rectangular container element that groups child elements. Frames serve as organisational units within a canvas and are also the export unit for the Diagram-to-Code feature. |
| **Context** | Defined in `packages/element/src/frame.ts`. A frame can be renamed, resized, and exported independently. Elements placed inside a frame are visually clipped to its bounds during export. |
| **Examples** | A diagram with three frames: "Frontend", "Backend", and "Database". Each frame is exported separately for documentation. |
| **Related Terms** | [Element](#element), [Export](#export), [Scene](#scene) |

---

### Freedraw

| | |
|---|---|
| **Definition** | A freehand stroke element created by dragging the pointer on the canvas without snapping to shapes or grids. Rendered using the `perfect-freehand` algorithm to produce smooth, pressure-sensitive strokes. |
| **Context** | The freedraw tool produces elements of type `"freedraw"`. Stroke points are stored as a series of x/y coordinates with pressure values. |
| **Examples** | Annotating a diagram with a hand-drawn circle to highlight a component. |
| **Related Terms** | [Element](#element), [Canvas](#canvas) |

---

### Group

| | |
|---|---|
| **Definition** | A logical association of multiple elements that can be selected, moved, resized, and styled together as a single unit without creating a container element. |
| **Context** | Groups are stored as a `groupIds` array on each element. There is no dedicated group element type — grouping is a property of membership. Elements can belong to multiple nested groups. |
| **Examples** | A UML class box composed of three rectangles and several text elements, grouped so they move together. |
| **Related Terms** | [Element](#element), [Frame](#frame), [Scene](#scene) |

---

### Library

| | |
|---|---|
| **Definition** | A named, persistent collection of reusable element groups ("library items") that a user can save and insert into any drawing. |
| **Context** | Stored in IndexedDB. Importable and exportable as `.excalidrawlib` JSON files. Users can also browse and import shapes from the community library portal (an external website). |
| **Examples** | A developer saves a set of AWS architecture icons as a library and reuses them across multiple infrastructure diagrams. |
| **Related Terms** | [Element](#element), [Export](#export), [Scene](#scene) |

---

### Linear Element

| | |
|---|---|
| **Definition** | An element type that is defined by a sequence of points rather than a bounding rectangle. Includes arrows and lines. Supports straight, curved (arc), and elbow (right-angle) routing styles. |
| **Context** | Managed by `LinearElementEditor` in `packages/element/src/linearElementEditor.ts`. Points can be added, moved, or deleted individually. Linear elements can be bound to shape elements at their endpoints. |
| **Examples** | A straight arrow between two boxes, a curved line tracing a data flow, an elbow-routed connector in an ERD. |
| **Related Terms** | [Arrowhead](#arrowhead), [Binding](#binding), [Element](#element) |

---

### Mermaid

| | |
|---|---|
| **Definition** | A text-based diagramming syntax used as an intermediate representation in the Text-to-Diagram (TTD) pipeline. Mermaid syntax is generated by the AI backend and then converted into native Excalidraw elements. |
| **Context** | The AI endpoint returns Mermaid-formatted text; `mermaidValidation.ts` checks it for syntax errors and `mermaidAutoFix.ts` attempts repairs. The `@excalidraw/mermaid-to-excalidraw` package performs the final conversion. Mermaid is an integration artefact, not a first-class storage format. |
| **Examples** | A TTD prompt describing a user authentication flow returns `graph TD; A[User] --> B[Login Page]; B --> C[Auth Service]` as Mermaid, which is then rendered as native elements. |
| **Related Terms** | [Text-to-Diagram (TTD)](#text-to-diagram-ttd) |

---

### Portal

| | |
|---|---|
| **Definition** | The Socket.IO client abstraction that manages the WebSocket connection lifecycle for a collaboration room, including connecting, reconnecting, broadcasting scene deltas, and syncing cursor positions. |
| **Context** | Implemented in `excalidraw-app/collab/Portal.tsx`. `Portal` tracks which element versions have already been broadcast (`broadcastedElementVersions`) so only changed elements are included in delta payloads, minimising bandwidth. |
| **Examples** | When a user joins a room, `Portal.open()` establishes the WebSocket connection. When an element is moved, `Portal.broadcastScene()` emits only the changed element. |
| **Related Terms** | [Collaboration Room](#collaboration-room), [Durable Increment](#durable-increment), [Scene](#scene) |

---

### Reconciliation

| | |
|---|---|
| **Definition** | The algorithm that merges divergent element states from multiple collaborators into a single consistent scene, resolving conflicts using a Last-Write-Wins (LWW) strategy with deterministic tiebreaking. |
| **Context** | Implemented in `packages/excalidraw/data/reconcile.ts`. Remote elements are discarded if the local version is newer, if the element is actively being edited, or if versions are equal but the local `versionNonce` is lower. The merged element list is re-sorted by fractional index. This is not full OT/CRDT but is sufficient for the eventual-consistency requirements of a shared whiteboard. |
| **Examples** | Two collaborators simultaneously move the same rectangle to different positions. Reconciliation picks the winner based on version numbers and nonces, ensuring both clients converge to the same state within the next sync cycle. |
| **Related Terms** | [Collaboration Room](#collaboration-room), [Durable Increment](#durable-increment), [Fractional Index](#fractional-index) |

---

### Room Link

| | |
|---|---|
| **Definition** | The URL shared with collaborators to join a specific collaboration room. The URL fragment (the `#` portion) contains both the room ID and the AES-GCM encryption key. |
| **Context** | Generated when a user starts a live collaboration session. Because the key is in the URL fragment, it is never sent to any server. Anyone with the complete URL can join the room and decrypt its content; the key cannot be recovered if the URL is lost. |
| **Examples** | `https://excalidraw.com/#room=abc123,base64EncodedKey` |
| **Related Terms** | [Collaboration Room](#collaboration-room), [End-to-End Encryption](#end-to-end-encryption-e2ee), [Share Link](#share-link) |

---

### Scene

| | |
|---|---|
| **Definition** | The complete, serialisable state of a drawing: the ordered list of all elements and the accompanying AppState. A scene is the canonical unit of work in Excalidraw — what is created, saved, shared, and exported. |
| **Context** | Serialised as `.excalidraw` JSON. Managed by the `Scene` class in `packages/element/src/Scene.ts` and the `Store` in `packages/element/src/store.ts`. A scene snapshot is taken on every significant mutation and used as the basis for undo/redo and collaboration sync. |
| **Examples** | Opening Excalidraw in a fresh tab starts with an empty scene. Importing a `.excalidraw` file replaces the current scene entirely. |
| **Related Terms** | [AppState](#appstate), [Element](#element), [Export](#export), [Scene Store](#scene-store) |

---

### Scene Store

| | |
|---|---|
| **Definition** | The in-memory store that manages the canonical, immutable snapshot of the scene and produces versioned increments (durable or ephemeral) on every mutation. |
| **Context** | Implemented in `packages/element/src/store.ts`. Follows an immutable snapshot + named increment model: each mutation produces a `StoreSnapshot` and a typed increment. Increments feed the undo/redo history and the collaboration broadcast layer. |
| **Examples** | Every time a user moves an element, `Store.scheduleCapture()` creates a new snapshot and emits a durable increment to the history stack. |
| **Related Terms** | [Durable Increment](#durable-increment), [Ephemeral Increment](#ephemeral-increment), [Scene](#scene), [StoreDelta](#storedelta) |

---

### Session

| | |
|---|---|
| **Definition** | A user's active interaction with Excalidraw within a single browser tab from the time the canvas loads until the tab is closed or the scene is reset. Sessions are not authenticated and have no server-side representation. |
| **Context** | Session state includes the current scene (persisted to `localStorage`) and transient `AppState`. In a collaboration context, a session is also associated with a collaboration room for its duration. |
| **Examples** | A user opens Excalidraw, draws a diagram for 30 minutes, and closes the tab. The session is over; the diagram remains in `localStorage` for the next visit. |
| **Related Terms** | [AppState](#appstate), [Collaboration Room](#collaboration-room), [Scene](#scene) |

---

### Share Link

| | |
|---|---|
| **Definition** | A read-only or view URL for a diagram that has been saved to Firebase Firestore and Firebase Storage. The encryption key is embedded in the URL fragment, enabling anyone with the link to view the diagram without a collaboration connection. |
| **Context** | Distinct from a room link — a share link points to a static snapshot persisted in Firebase, not an active collaboration session. The receiving client fetches and decrypts the scene and binary files from Firebase on load. |
| **Examples** | A designer posts a share link in a Slack message. Team members open it to view (but not edit) the latest version of the diagram. |
| **Related Terms** | [Collaboration Room](#collaboration-room), [End-to-End Encryption](#end-to-end-encryption-e2ee), [Room Link](#room-link) |

---

### Snap

| | |
|---|---|
| **Definition** | A drawing aid that causes elements to align automatically to a grid, to other elements' edges/centres, or to angular increments when being moved or resized. |
| **Context** | Snap behaviour is toggled via AppState flags. Grid snap uses a configurable grid size. Object snap (to edges and centres of other elements) is calculated dynamically as the element is dragged. |
| **Examples** | Enabling grid snap causes dragged elements to jump to the nearest grid intersection. Object snap shows blue guide lines when an edge aligns with a neighbouring element. |
| **Related Terms** | [AppState](#appstate), [Canvas](#canvas), [Element](#element) |

---

### StoreDelta

| | |
|---|---|
| **Definition** | The structural diff between two consecutive scene snapshots, recording which elements were inserted, updated, or deleted. |
| **Context** | Part of a `DurableIncrement`. Used by the undo/redo system to reverse or replay specific changes, and by the collaboration layer to broadcast only the changed elements rather than the full scene. |
| **Examples** | Moving three elements produces a `StoreDelta` with three entries in the "updated" set, each carrying the element's previous and new state. |
| **Related Terms** | [Durable Increment](#durable-increment), [Reconciliation](#reconciliation), [Scene Store](#scene-store) |

---

### Text-to-Diagram (TTD)

| | |
|---|---|
| **Definition** | The AI-assisted workflow in which a user describes a diagram in natural language (or provides Mermaid syntax directly), and the system generates native Excalidraw elements via an external AI API. |
| **Context** | Accessed through the TTD dialog (`packages/excalidraw/components/TTDDialog/`). The pipeline is: user prompt → streaming AI response (Mermaid) → syntax validation → auto-fix → conversion to elements → placement on canvas. Chat history is persisted in IndexedDB under `IDB_TTD_CHATS`. |
| **Examples** | Typing "A user logs in, the Auth Service validates credentials, and returns a JWT" generates a sequence diagram as native Excalidraw elements. |
| **Related Terms** | [Mermaid](#mermaid), [Scene](#scene) |

---

### Tool

| | |
|---|---|
| **Definition** | A user-selectable drawing mode that determines the type of element created on the next pointer interaction (e.g., rectangle tool, arrow tool, text tool, selection tool). |
| **Context** | Tools are registered in the toolbar and activated via clicks or keyboard shortcuts. The active tool is stored in `appState.activeTool`. Once an element is created, the tool may remain active (if `locked: true`) or revert to the selection tool. |
| **Examples** | Rectangle tool (`"rectangle"`), arrow tool (`"arrow"`), freedraw tool (`"freedraw"`), text tool (`"text"`), hand tool (`"hand"`), eraser tool (`"eraser"`) |
| **Related Terms** | [Action](#action), [AppState](#appstate), [Element](#element) |

---

### Viewport

| | |
|---|---|
| **Definition** | The visible portion of the canvas at any given moment, defined by the current scroll position (`scrollX`, `scrollY`) and zoom level. The canvas is infinite; the viewport is the window through which a user sees it. |
| **Context** | Viewport parameters are stored in `AppState`. Zoom and scroll are modified by pinch gestures, scroll wheel, pan gestures, and keyboard shortcuts. The viewport determines which elements are rendered and how large they appear. |
| **Examples** | A user zooms to 200% and scrolls right — the viewport has changed but the scene (and its elements) is unchanged. |
| **Related Terms** | [AppState](#appstate), [Canvas](#canvas), [Follow Mode](#follow-mode), [Zoom](#zoom) |

---

### Z-Index

| | |
|---|---|
| **Definition** | The relative rendering order of elements on the canvas, determining which element appears in front of or behind another when they overlap. Higher z-index = rendered on top. |
| **Context** | Z-index is controlled by fractional indices. Users can adjust z-order via "Bring to front", "Send to back", "Bring forward", and "Send backward" actions. In a collaborative session, fractional indices are reconciled to ensure consistent z-order across all clients. |
| **Examples** | Placing a text label on top of a filled rectangle requires the label to have a higher z-index. |
| **Related Terms** | [Element](#element), [Fractional Index](#fractional-index) |

---

### Zoom

| | |
|---|---|
| **Definition** | The scale factor applied to the canvas viewport, controlling how large or small elements appear on screen. Does not affect the actual size of elements in the scene. |
| **Context** | Stored as `zoom: { value: number }` in `AppState`. Zoom can be changed via scroll wheel, pinch gesture, `Ctrl+/−`, or the zoom controls in the UI. The canvas re-renders at the new scale without modifying any element geometry. |
| **Examples** | At zoom 1.0, a 100×100 px rectangle occupies 100×100 screen pixels. At zoom 2.0, it occupies 200×200 screen pixels. |
| **Related Terms** | [AppState](#appstate), [Canvas](#canvas), [Viewport](#viewport) |

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
