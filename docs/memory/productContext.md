# Product Context

## Why Excalidraw Exists

Most diagramming tools optimize for polish — grids snap to perfection, shapes are pixel-precise, everything looks "designed." This creates friction for exploratory thinking. Excalidraw deliberately uses a hand-drawn aesthetic to signal that diagrams are **drafts and thinking tools**, not final deliverables. The rough style lowers the psychological barrier to starting and sharing incomplete ideas.

## Core UX Goals

1. **Zero friction to start** — no account, no install, open URL and draw immediately
2. **Collaborative by default** — sharing a room link is one click; no invite flow
3. **Feels like a whiteboard** — infinite canvas, freehand drawing, hand-drawn shapes
4. **No lock-in** — `.excalidraw` is plain JSON; export to SVG/PNG anytime

## Key User Scenarios

### Scenario 1: Quick architecture sketch during a call

Engineer opens excalidraw.com, draws a system diagram in 3 minutes, shares the room link in Slack. Remote teammates join and annotate in real time. After the call, exports to PNG and pastes into the doc.

### Scenario 2: Async feedback on a design

Designer creates a diagram, exports the `.excalidraw` file, commits it to the repo. Reviewer opens it locally, adds comments as text elements, commits back.

### Scenario 3: Embedded whiteboard in a product

Developer embeds `@excalidraw/excalidraw` in their note-taking app. Uses `ExcalidrawImperativeAPI` to save/load diagrams from their own backend. Hides the toolbar and exposes only the tools relevant to their use case.

### Scenario 4: Personal diagramming without a backend

User works offline. Diagrams auto-save to IndexedDB. User exports `.excalidraw` files to their filesystem for long-term storage.

## UX Principles Observed in the Codebase

- **Progressive disclosure**: advanced options (arrowhead styles, roundness types, frame links) are hidden until relevant
- **Direct manipulation**: elements resize and rotate via on-canvas handles, not dialogs
- **Keyboard-first**: every tool has a shortcut; power users rarely touch the toolbar
- **Forgiving interactions**: undo is always available; soft-delete (isDeleted) means nothing is permanently lost until GC
- **Collaboration transparency**: collaborator cursors and usernames are always visible; no hidden editing

## Emotional Design Intent

The hand-drawn style (RoughJS roughness, Virgil font) communicates:
- "This is a sketch, not a spec" — reduces perfectionism paralysis
- "Anyone can draw like this" — lowers contribution barrier
- "This is meant to be changed" — encourages iteration over documents
