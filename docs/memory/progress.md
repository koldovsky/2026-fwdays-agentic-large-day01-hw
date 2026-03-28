# Progress: Excalidraw

## What Works (Stable Features)

### Drawing & Elements
- Rectangle, ellipse, diamond, line, arrow, freehand drawing
- Text elements with inline editing (WYSIWYG)
- Image embedding
- Frames (grouping containers)
- Embedded content (iframes)
- Element grouping and ungrouping
- Element locking

### Styling
- Color picker (stroke, fill, background)
- Multiple fill styles (hatch, cross-hatch, solid)
- Stroke width and style (solid, dashed, dotted)
- Font families (hand-drawn, normal, code)
- Opacity control
- Dark mode

### Canvas & Navigation
- Infinite canvas with pan/zoom
- Grid mode with snapping
- Object snapping (element-to-element alignment)
- Zoom controls and fit-to-content
- Minimap

### Selection & Editing
- Click, drag, and lasso selection
- Multi-select with Shift
- Resize, rotate, flip
- Undo/redo (full history)
- Copy/paste (including cross-tab)
- Duplicate elements
- Align and distribute tools

### Data & Export
- Auto-save to LocalStorage
- Export to PNG, SVG, clipboard
- Import from file (.excalidraw, .excalidraw.png)
- URL-based sharing (scene data in hash)
- Scene embedding in PNG metadata
- JSON export/import

### Collaboration
- Real-time multi-user editing via WebSocket
- Live cursor tracking
- User presence indicators
- Conflict resolution (version-based)

### Developer Features
- Embeddable React component (`@excalidraw/excalidraw`)
- Comprehensive API for programmatic control
- Element libraries (community shareable)
- Command palette (Ctrl+K)
- Keyboard shortcuts for all major actions

### Infrastructure
- PWA support (installable, offline capable)
- Multi-language localization
- Firebase integration for persistence
- Automated CI/CD via GitHub Actions

## What's In Progress

- AI-powered text-to-diagram generation
- Package API stabilization (v0.18.0)
- Excalidraw Plus (commercial features)
- Performance optimizations for large canvases

## Known Limitations

- Canvas-based rendering (no DOM elements for accessibility on drawn content)
- Collaboration requires separate WebSocket server (excalidraw-room)
- Large scenes can impact performance (hundreds of complex elements)
- Image storage relies on IndexedDB with 24h TTL auto-cleanup
- Deleted elements retained for 24h in collaboration sync

## Related Documentation

- [Active Context](activeContext.md)
- [Decision Log](decisionLog.md)
- [Architecture](../technical/architecture.md)
- [Development Setup](../technical/dev-setup.md)
- [Product Requirements](../product/PRD.md)
- [Domain Glossary](../product/domain-glossary.md)
