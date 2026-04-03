# Domain Glossary

Definitions for terms used in the Excalidraw codebase, documentation, and UI.

---

## A

**Action**
A discrete user operation (move element, change stroke color, undo, etc.) represented as a plain object with a `name`, `perform` function, optional keyboard shortcut (`keyTest`), and optional toolbar component (`PanelComponent`). Actions are dispatched through `actionManager`.

**AppState**
The immutable editor state object managed inside the core Excalidraw component. Contains rendering state (zoom, scroll), tool state (activeTool, selectedElementIds), UI state (openDialog), and collaboration state (collaborators map). Each key has storage flags controlling persistence to localStorage, export files, and the collab server.

---

## B

**Binding**
The mechanism by which arrows (LinearElements) attach to other elements at fixed points. When an arrow is bound to a shape, it tracks the shape's position and resizes dynamically. Binding points are defined per element edge.

**BoundElement**
A reference from a shape to an arrow or label that is attached to it. Stored in `element.boundElements[]`.

---

## C

**Canvas (static / interactive)**
Excalidraw uses two layered HTML5 canvases:
- **Static canvas**: renders all background elements; re-drawn only when the scene changes
- **Interactive canvas**: renders the active selection and handles pointer events; always live

**Collaborator**
A remote user in a shared session. Represented in `AppState.collaborators` as a map of `SocketId → Collaborator`. Contains pointer position, selected element IDs, username, idle state, and call status.

**customData**
An untyped extension field on every element (`Record<string, any>`). Used internally by Magic Frame to store AI generation status (`"pending" | "done" | "error"`). Available to embedders for custom metadata.

---

## E

**Embeddable / IframeElement**
An element type that renders an `<iframe>` inside the canvas, used for embedding external content (videos, Figma, etc.).

**ExcalidrawElement**
The base type for every drawable object on the canvas. Subtypes include: GenericElement (rectangle, diamond, ellipse), TextElement, LinearElement (line, arrow), FreeDrawElement, ImageElement, FrameElement, MagicFrameElement, EmbeddableElement.

---

## F

**FileId**
A content-addressable identifier for binary assets (images). Stored on `ExcalidrawImageElement`. The actual binary data is fetched lazily from Firebase Storage by FileId.

**FileManager**
The class responsible for compressing, uploading, and tracking binary assets (images). Manages upload status (`"pending" | "saved" | "error"`) per FileId.

**FractionalIndex**
A string-based index that preserves element Z-order during concurrent inserts without requiring full array reindexing. Implemented via the `fractional-indexing` library. Stored as `element.index`.

**Frame / MagicFrame**
A named container element that groups child elements visually. **MagicFrame** is a special frame variant that triggers AI-powered content generation.

**FreeDrawElement**
An element type for pressure-sensitive freehand strokes, rendered using `perfect-freehand`.

---

## G

**GroupId**
A string identifier for a logical group of elements. Elements in the same group are moved and selected together. Stored in `element.groupIds[]`.

---

## I

**IDB (IndexedDB)**
Used for larger persistent data:
- `excalidraw-library` — user's saved element library
- `excalidraw-ttd-chats` — AI TTD chat history

**isDeleted**
Soft-delete flag on elements. Deleted elements are kept in sync payloads for 24 hours (`DELETED_ELEMENT_TIMEOUT`) to ensure late-joining collaborators receive the deletion.

---

## J

**Jotai**
Atomic state management library used for cross-component global state. Each Excalidraw instance gets an isolated `editorJotaiStore` (via `jotai-scope`) to support multiple editors on one page.

---

## L

**Library**
A collection of saved element groups that users can drag onto the canvas. Stored in IndexedDB (`excalidraw-library`). Can be shared via URL (`?addLibrary=<url>` or `#addLibrary=<url>&token=<id>`).

**LinearElement**
An element type for lines and arrows. Supports multi-point paths, arrowheads, and binding to other elements.

**Laser Pointer**
A visual tool for presentations. Broadcasts cursor position as a colored laser beam to collaborators without leaving marks on the canvas. Rendered by `@excalidraw/laser-pointer`.

---

## M

**Magic Frame**
An AI-powered frame that generates diagram content inside it based on a text prompt. Generation status is stored in `element.customData`.

**Mermaid**
A text-based diagram syntax. Excalidraw can import Mermaid diagrams (via `@excalidraw/mermaid-to-excalidraw`) and TTD can generate Mermaid as an intermediate representation before converting to Excalidraw elements.

---

## R

**rough.js**
The library that renders all shapes with a hand-drawn sketchy aesthetic. Each element has a `seed` value for deterministic roughjs rendering (same seed = same squiggle every time).

**Room**
A shared collaboration session. Identified by a `roomId` (10 random bytes). The encryption key is embedded alongside the roomId in the URL fragment.

---

## S

**Scene**
The complete canvas state: an ordered array of `ExcalidrawElement[]` plus `AppState`. Persisted to localStorage and Firebase. Exported as `.excalidraw` JSON or embedded in PNG metadata.

**seed**
A number on each element used by rough.js for deterministic rendering. The same element with the same seed always renders with the same hand-drawn variations.

**SocketId**
A unique identifier for a connected WebSocket client. Used as the key in the `collaborators` map.

---

## T

**TTD (Text to Diagram)**
An AI feature that converts natural language descriptions to Excalidraw diagrams. Flow: user prompt → AI backend → Mermaid syntax → Excalidraw elements. Chat history persisted in IndexedDB (`excalidraw-ttd-chats`).

---

## V

**version**
A monotonically increasing integer on each element, incremented on every mutation. Used as the primary key in collaborative conflict resolution: higher version wins.

**versionNonce**
A random integer regenerated on every mutation. Used as a tiebreaker when two clients produce the same `version` concurrently (higher nonce wins). Ensures deterministic last-writer-wins without a central clock.

---

## W

**WS_EVENTS**
Named WebSocket event types used in the collaboration protocol:
- `SERVER_VOLATILE` — mouse/cursor positions (lossy broadcast)
- `SERVER` — scene updates (reliable broadcast)
- `USER_FOLLOW_CHANGE` — follow mode toggle
- `USER_FOLLOW_ROOM_CHANGE` — follow mode room sync

---

## Related Documentation

### Memory Bank
- [Product Context](../memory/productContext.md) - Product vision
- [System Patterns](../memory/systemPatterns.md) - Architecture patterns
- [Tech Context](../memory/techContext.md) - Technology stack
- [Decision Log](../memory/decisionLog.md) - Undocumented behaviors

### Technical Documentation
- [Architecture](../technical/architecture.md) - System architecture
- [Dev Setup](../technical/dev-setup.md) - Development guide

### Product Documentation
- [PRD](PRD.md) - Product requirements
