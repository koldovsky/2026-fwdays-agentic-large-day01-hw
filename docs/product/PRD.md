# Product Requirements Document: Excalidraw

*Reverse-engineered from codebase analysis (v0.18.0)*

## 1. Product Vision

Excalidraw is a collaborative virtual whiteboard that makes diagramming feel as natural as sketching on paper. Its hand-drawn aesthetic removes the pressure of "perfect diagrams" and encourages iterative visual thinking.

## 2. Target Audience

| Segment | Use Case |
|---------|----------|
| Software Engineers | Architecture diagrams, system design, API flows, technical documentation |
| Product Managers | Wireframes, user flows, feature brainstorming |
| Designers | Quick mockups, concept visualization |
| Educators | Visual explanations, collaborative classroom exercises |
| General Users | Meeting notes, planning, mind maps |

## 3. Core Functional Requirements

### 3.1 Drawing & Shapes
- **FR-01**: Users can draw rectangles, ellipses, diamonds, lines, arrows, and freehand paths
- **FR-02**: All shapes render with a hand-drawn, sketch-like aesthetic (via RoughJS)
- **FR-03**: Users can add text labels (inline WYSIWYG editing on canvas)
- **FR-04**: Users can embed images from file or clipboard
- **FR-05**: Users can create frames to group and clip elements
- **FR-06**: Users can embed web content via iframes

### 3.2 Styling
- **FR-07**: Configurable stroke color, background color, and fill color
- **FR-08**: Multiple fill styles: solid, hatch, cross-hatch, none
- **FR-09**: Configurable stroke width (thin, bold, extra bold) and style (solid, dashed, dotted)
- **FR-10**: Font selection: hand-drawn (Virgil), normal (Helvetica), code (Cascadia)
- **FR-11**: Element opacity control
- **FR-12**: Dark mode theme support

### 3.3 Canvas & Navigation
- **FR-13**: Infinite canvas with pan (mouse drag, scroll) and zoom (pinch, Ctrl+scroll)
- **FR-14**: Grid overlay with configurable step size
- **FR-15**: Object snapping — automatic alignment to nearby elements
- **FR-16**: Zoom controls (zoom in/out, fit to content, reset to 100%)
- **FR-17**: Minimap for navigation on large canvases

### 3.4 Selection & Manipulation
- **FR-18**: Click, drag-to-select, and lasso selection tools
- **FR-19**: Multi-select via Shift+click
- **FR-20**: Resize, rotate, and flip selected elements
- **FR-21**: Align and distribute tools for multi-selection
- **FR-22**: Group and ungroup elements
- **FR-23**: Lock elements to prevent accidental editing
- **FR-24**: Full undo/redo history
- **FR-25**: Copy, paste, and duplicate elements

### 3.5 Data & Export
- **FR-26**: Auto-save to browser LocalStorage (debounced 300ms)
- **FR-27**: Export to PNG, SVG, and clipboard
- **FR-28**: Import from `.excalidraw` and `.excalidraw.png` files
- **FR-29**: URL-based sharing (scene data compressed in URL hash)
- **FR-30**: Scene data embedded in exported PNG metadata (lossless round-trip)

### 3.6 Collaboration
- **FR-31**: Real-time multi-user editing via WebSocket rooms
- **FR-32**: Live cursor position tracking for all participants
- **FR-33**: User presence indicator showing active collaborators
- **FR-34**: Deterministic conflict resolution (no data loss on simultaneous edits)
- **FR-35**: End-to-end encryption for collaborative sessions

### 3.7 Developer Integration
- **FR-36**: Embeddable React component (`@excalidraw/excalidraw` npm package)
- **FR-37**: Programmatic API for element manipulation and state control
- **FR-38**: Element libraries — shareable, community-curated template collections
- **FR-39**: Command palette (Ctrl+K) for power users

### 3.8 AI Features
- **FR-40**: Text-to-diagram generation via AI backend
- **FR-41**: AI-powered diagram suggestions and improvements

## 4. Non-Functional Requirements

### 4.1 Performance
- **NFR-01**: Smooth 60fps canvas rendering with up to 500 elements
- **NFR-02**: Collaboration sync latency < 100ms (on stable network)
- **NFR-03**: Initial page load < 3 seconds (production build)

### 4.2 Reliability
- **NFR-04**: Auto-save prevents data loss (300ms debounce to LocalStorage)
- **NFR-05**: Offline capability via PWA / Service Worker
- **NFR-06**: Graceful degradation when collaboration server is unavailable

### 4.3 Accessibility
- **NFR-07**: Full keyboard navigation and shortcuts
- **NFR-08**: Accessible UI components (Radix UI primitives)
- **NFR-09**: Multi-language localization support

### 4.4 Security
- **NFR-10**: End-to-end encryption for shared collaboration rooms
- **NFR-11**: No auth required for basic usage (privacy by design)
- **NFR-12**: Firebase security rules for cloud-stored scenes

### 4.5 Portability
- **NFR-13**: Works in all modern browsers (Chrome, Firefox, Safari, Edge)
- **NFR-14**: PWA — installable as desktop/mobile app
- **NFR-15**: Embeddable in any React application

## 5. Technical Constraints

- **Canvas-based rendering**: All drawing happens on HTML5 Canvas — no DOM elements for drawn content
- **WebSocket dependency**: Real-time collaboration requires a separate server ([excalidraw-room](https://github.com/excalidraw/excalidraw-room))
- **Firebase dependency**: Cloud persistence and auth require Firebase project configuration
- **Browser storage limits**: LocalStorage (~5MB) and IndexedDB for larger data (images)
- **24-hour data retention**: Deleted elements and unused images purged after 24 hours

## 6. Success Metrics

- Zero-friction start (no auth, instant canvas)
- Sub-second collaboration sync
- Embeddable component used in third-party applications
- Active open-source community contributions

## Related Documentation

- [Domain Glossary](./domain-glossary.md)
- [Product Context](../memory/productContext.md)
- [Architecture](../technical/architecture.md)
