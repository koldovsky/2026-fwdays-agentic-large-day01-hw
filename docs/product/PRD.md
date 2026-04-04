# Excalidraw — Reverse-Engineered Product Requirements Document

## 1. Product Overview

Excalidraw is an open-source, browser-based virtual whiteboard for creating hand-drawn style diagrams and sketches. It is available as a standalone web application (excalidraw.com) and as an embeddable React component (`@excalidraw/excalidraw`) for third-party integration.

### Mission

Provide the fastest way to visually communicate ideas through informal, sketch-like diagrams — removing the friction of "making things look perfect."

### Key Differentiator

Hand-drawn aesthetic by default. Unlike Figma, Miro, or draw.io, Excalidraw's visual output intentionally looks like a whiteboard sketch, reducing the barrier to creating and sharing diagrams.

## 2. Target Audience

### Primary: Software Developers

- Create architecture diagrams, system designs, API flows
- Embed diagrams in documentation (README, wikis, Notion, Obsidian)
- Quick whiteboarding during code reviews or pairing sessions

### Secondary: Product & Design Teams

- Wireframe sketching during ideation
- User flow and journey mapping
- Collaborative brainstorming sessions

### Tertiary: Educators & Presenters

- Visual explanations of concepts
- Interactive teaching sessions
- Live drawing during presentations (Zen Mode)

## 3. Core Feature Requirements

### FR-1: Drawing Tools

The application must provide a set of drawing primitives accessible via toolbar and keyboard shortcuts.

| Tool | Shortcut | Description |
|------|----------|-------------|
| Selection | V or 1 | Select, move, resize elements |
| Rectangle | R or 2 | Draw rectangular shapes |
| Diamond | D or 3 | Draw diamond/rhombus shapes |
| Ellipse | O or 4 | Draw circles and ellipses |
| Arrow | A or 5 | Draw arrows with optional arrowheads |
| Line | L or 6 | Draw straight or multi-point lines |
| Freedraw | P or 7 | Freehand drawing |
| Text | T or 8 | Create text labels |
| Image | 9 | Insert images from file |
| Eraser | E or 0 | Remove elements |
| Frame | F | Create artboard containers |
| Laser | K | Temporary laser pointer (presentation) |
| Hand | H | Pan the canvas |

### FR-2: Element Styling

Each element must support configurable visual properties:

- **Stroke color** — from palette or custom hex/RGB
- **Background color** — fill color from palette or custom
- **Fill style** — hachure, cross-hatch, solid, zigzag, zigzag-line
- **Stroke width** — thin (1px), bold (2px), extra-bold (4px)
- **Stroke style** — solid, dashed, dotted
- **Roughness** — architect (0), artist (1), cartoonist (2)
- **Opacity** — 0% to 100%
- **Corner roundness** — sharp or round
- **Font family** — Hand-drawn (Virgil), Normal (Helvetica), Code (Cascadia)
- **Font size** — small (16), medium (20), large (28), extra-large (36)
- **Text alignment** — left, center, right

### FR-3: Canvas Operations

- **Infinite canvas** — no boundary limits in any direction
- **Zoom** — 10% to 1600%, via Ctrl+scroll, pinch, or toolbar
- **Pan** — via Hand tool, Space+drag, or scroll
- **Grid** — optional alignment grid with configurable size
- **Snapping** — snap to grid, snap to elements, snap to midpoints
- **Dark mode** — full theme support for canvas background and UI

### FR-4: Element Operations

- **Select** — click, box-select, lasso-select, Ctrl+A for all
- **Multi-select** — Shift+click to add/remove from selection
- **Move** — drag selected elements or use arrow keys (1px, 10px with Shift)
- **Resize** — drag handles on selection corners/edges
- **Rotate** — drag rotation handle on selection
- **Duplicate** — Ctrl+D or Alt+drag
- **Delete** — Delete or Backspace key
- **Copy/Paste** — Ctrl+C / Ctrl+V, including across browser tabs
- **Group/Ungroup** — Ctrl+G / Ctrl+Shift+G
- **Lock** — prevent accidental modifications
- **Z-order** — bring to front, send to back, bring forward, send backward

### FR-5: Arrow Binding

Arrows must automatically bind to shapes when drawn near them:
- Start and end points snap to shape edges
- Bound arrows follow their shapes when moved
- Support for straight, curved, and elbow (orthogonal) arrow types
- Arrowhead options: arrow, dot, bar, triangle, or none

### FR-6: Text in Containers

Text elements can be bound inside shapes (rectangles, ellipses, diamonds):
- Double-click a shape to add text
- Text auto-wraps within the container
- Container resizes to fit text (configurable)
- Text alignment within container: vertical (top, middle, bottom) and horizontal (left, center, right)

### FR-7: Undo/Redo

- Full undo/redo history within a session
- Ctrl+Z for undo, Ctrl+Shift+Z for redo
- Delta-based system (not snapshot-based) for memory efficiency
- History excludes collaboration metadata

### FR-8: Export & Import

| Format | Export | Import | Notes |
|--------|--------|--------|-------|
| .excalidraw (JSON) | Yes | Yes | Native format with full fidelity |
| PNG | Yes | No | Raster with optional embedded metadata |
| SVG | Yes | No | Vector format |
| Clipboard | Yes | Yes | Copy/paste elements between sessions |
| PNG to clipboard | Yes | No | Ctrl+Shift+C |

Export options: background transparency, dark mode, scale factor, padding.

### FR-9: Library System

- Save frequently used elements or groups as library items
- Import community-created libraries
- Drag library items onto canvas
- Manage library (rename, delete, export)

### FR-10: Real-Time Collaboration

- Create shareable live rooms with one click
- Live cursors showing collaborator positions and names
- Real-time element sync via delta broadcasting
- Conflict resolution for concurrent edits
- Idle detection and presence indicators

### FR-11: Frames

- Create named artboard regions on the canvas
- Elements inside a frame clip to its boundaries on export
- Moving a frame moves all contained elements
- Export individual frames as images

### FR-12: Embedding

The React component must support:
- Full drawing functionality as a drop-in component
- Props API for initial data, theme, UI customization
- Callback hooks: `onChange`, `onPointerUpdate`, `onCollabButtonClick`
- Render props for custom UI (main menu, welcome screen)
- Ref-based access to imperative API (updateScene, exportToSvg, etc.)

## 4. Non-Functional Requirements

### Performance

- Smooth 60fps interaction with 500+ elements on canvas
- Initial load under 3 seconds on broadband
- Export operations complete within 2 seconds for typical diagrams

### Accessibility

- Keyboard navigation for all toolbar functions
- High-contrast color palette options
- Screen reader support for UI controls (not canvas content)

### Browser Support

- Chrome, Firefox, Safari, Edge (latest 2 versions)
- Mobile Safari and Chrome (touch support)
- Progressive Web App installable on desktop and mobile

### Internationalization

- 61+ locale translations
- RTL layout support
- Unicode text rendering on canvas

### Security

- URL sanitization for hyperlinks (`@braintree/sanitize-url`)
- Content Security Policy compatible
- No server-side rendering of user content
- Embeddable iframe allowlist for external content

## 5. Technical Constraints

- **Canvas rendering** — all drawing happens on HTML Canvas; no DOM-based element rendering
- **Yarn workspaces** — monorepo requires Yarn v1 (Classic), not npm
- **TypeScript strict** — no implicit `any`; all code fully typed
- **Immutable elements** — state changes create new element objects, never mutate in place
- **i18n required** — all user-facing strings must use translation keys

## 6. Out of Scope

- Vector editing (Bezier curve handles, path editing)
- Pixel-level image editing
- Video or audio elements
- Version history / branching (Git-like)
- User accounts and project management (excalidraw.com has its own backend, but the library is stateless)
- Print layout and page sizes
