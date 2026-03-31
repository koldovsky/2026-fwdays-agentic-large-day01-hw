# Product Context: Excalidraw UX Goals

## User Experience Philosophy
**Whiteboard-like Simplicity** - Excalidraw aims to replicate the natural, intuitive experience of drawing on a physical whiteboard while leveraging digital capabilities for persistence, collaboration, and enhancement.

## Core UX Goals

### 1. Instant Expressiveness
- **Goal**: Users should feel drawing is immediate and natural
- **Implementation**:
  - Freehand drawing with perfect curves via `perfect-freehand` library
  - Hand-drawn style via `RoughJS` for authentic sketch appearance
  - Minimal latency canvas rendering
  - No friction between idea and visualization

### 2. Intuitive Tool Discovery
- **Goal**: Users should find tools without extensive learning
- **Implementation**:
  - Clear visual toolbar with icon-based tool selection
  - Keyboard shortcuts for power users
  - Persistent tool selection memory (preferredSelectionTool)
  - Contextual menus for element operations
  - Welcome screen hints for first-time users

### 3. Effortless Collaboration
- **Goal**: Real-time sharing should feel natural
- **Implementation**:
  - Live cursors showing collaborator presence
  - Automatic synchronization via Socket.io
  - User presence indicators (avatars with colors)
  - Follow mode to track specific users
  - Conflict-free reconciliation of concurrent edits

### 4. Flexible Styling
- **Goal**: Users can customize appearance without complexity
- **Implementation**:
  - Color picker with palette suggestions
  - Stroke width and style options (solid, dashed, dotted)
  - Fill patterns (hachure, cross-hatch, solid)
  - Text formatting (font family, size, alignment)
  - Opacity control for layering effects

### 5. Powerful Organization
- **Goal**: Complex diagrams remain manageable
- **Implementation**:
  - Element grouping for bulk operations
  - Frames for organizing related elements
  - Z-ordering and layering
  - Alignment and distribution tools
  - Grid snapping and guides for precision

### 6. Reliable Persistence
- **Goal**: User work is never lost
- **Implementation**:
  - Auto-save to local storage (IndexedDB via idb-keyval)
  - Cloud sync via Firebase (for authenticated users)
  - Export options (JSON, PNG with metadata, SVG)
  - Import/restore previous drawings
  - Undo/redo with comprehensive history

### 7. Responsive Accessibility
- **Goal**: Everyone can create and share diagrams
- **Implementation**:
  - 60+ language support (i18n)
  - Keyboard navigation for all features
  - Screen reader compatibility
  - High contrast mode support
  - Mobile-friendly touch interface
  - Responsive UI for all device sizes

### 8. AI-Assisted Creation
- **Goal**: Reduce friction for non-visual users
- **Implementation**:
  - Text-to-Diagram (TTD) feature for AI-generated diagrams
  - Natural language input for quick prototyping
  - Diagram generation from descriptions
  - Mermaid diagram support and conversion

## User Journey Stages

### Discovery
- Landing page showcases drawing capabilities
- Demo environment for experimentation
- Example templates and starter diagrams

### Creation
- Intuitive toolbar with visual feedback
- Canvas-centric interface (tools on demand)
- Real-time styling feedback

### Collaboration
- Share dialog for generating share links
- Real-time presence indicators
- Permission levels (view/edit)

### Export
- Multiple format options (PNG, SVG, JSON)
- Cloud export to Plus platform
- Integration with other tools

## UX Constraints & Trade-offs

| Constraint | Decision | Rationale |
|-----------|----------|-----------|
| Mobile vs Desktop | Mobile-first responsive | 40%+ users on mobile |
| Learning curve | Minimal (like drawing) | Lower barrier to entry |
| Performance | Canvas optimization | Real-time responsiveness critical |
| Feature bloat | Progressive enhancement | Keep core simple, advanced optional |
| Collaboration lag | Eventual consistency | Better UX than blocking operations |

## Interaction Patterns

### Pointer Interactions
- **Drag**: Move, resize, draw, pan
- **Click**: Select, activate tools, open menus
- **Double-click**: Edit text, enter mode
- **Alt/Cmd+Drag**: Duplicate elements
- **Shift+Drag**: Constrain proportions

### Keyboard Shortcuts
- **Delete/Backspace**: Remove selected
- **Ctrl/Cmd+Z**: Undo
- **Ctrl/Cmd+Shift+Z**: Redo
- **Ctrl/Cmd+D**: Duplicate
- **Ctrl/Cmd+A**: Select all
- **Escape**: Deselect/close dialogs

### Touch Interactions
- **Pinch**: Zoom
- **Two-finger drag**: Pan
- **Long-press**: Context menu
- **Swipe**: Tool switching (on mobile)

## Success Metrics for UX

### Engagement
- Time-to-first-draw < 30 seconds
- Average session duration > 15 minutes
- Creation rate (drawings per user per week)

### Usability
- Tool discoverability > 80% within first session
- Error rate during common tasks < 5%
- Help/documentation hits < 10% of sessions

### Satisfaction
- User rating > 4.5/5 stars
- Net Promoter Score (NPS) > 40
- Return user rate > 60%

### Collaboration
- Multi-user session adoption > 30%
- Share link generation rate
- Real-time sync lag < 500ms (perceived instant)

## Visual Design Language

### Aesthetics
- Clean, minimal interface (maximize canvas space)
- Hand-drawn style for authenticity
- Flat design with subtle shadows
- Consistent iconography

### Colors
- Dark and light themes
- Accessible color contrast ratios
- User-assignable colors for collaboration
- High-contrast mode option

### Typography
- System fonts for performance
- Clear hierarchy (headers, labels, hints)
- Readable at all zoom levels
- Support for multiple language scripts

## Future UX Goals (Roadmap)

- **VR/AR Support**: Immersive collaboration spaces
- **Video Integration**: Drawing over video content
- **Plugin System**: Third-party extensions for specialized domains

---

## 🔗 Related Documentation

**Explore related aspects:**
- **Product Requirements**: See [`docs/product/PRD.md`](../product/PRD.md) for complete feature requirements
- **Domain Glossary**: See [`docs/product/domain-glossary.md`](../product/domain-glossary.md) for terminology definitions
- **System Implementation**: See [`systemPatterns.md`](systemPatterns.md) for how UX is implemented
- **Technical Architecture**: See [`docs/technical/architecture.md`](../technical/architecture.md) for rendering and performance details
- **Current Development**: See [`activeContext.md`](activeContext.md) for current UX focus areas
