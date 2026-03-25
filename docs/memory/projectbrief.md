# Excalidraw Project Brief

## What Is Excalidraw?

Excalidraw is an open-source whiteboard application for creating hand-drawn style diagrams, sketches, and wireframes with a focus on simplicity and ease of use.

### Three Distribution Channels

1. **Standalone Web App** - Available at excalidraw.com
2. **React Component** - `@excalidraw/excalidraw` npm package for embedding in any React app
3. **Collaborative Platform** - Real-time multi-user editing with Firebase backend

## Primary Goals

### 1. Visual Collaboration
- Enable real-time collaborative drawing between multiple users
- Display user presence, cursors, and changes instantly
- Support for 50+ simultaneous collaborators
- Conflict-free operational transformation using version-based reconciliation

### 2. Ease of Use
- Intuitive sketchy aesthetic without rigid design tools
- No learning curve - works like pen on paper
- Touch-friendly interface for tablets and styluses
- Keyboard shortcuts and command palette for power users

### 3. Accessibility & Portability
- Works offline with IndexedDB storage
- Exportable to multiple formats (JSON, PNG, SVG, Blob)
- Embeddable into any React application
- No backend required for basic usage
- Multi-language support (50+ languages)

### 4. Extensibility
- Plugin system for custom features
- TTD (Teach the Diagram) contextual help system
- Diagram-to-code AI features
- Custom library management
- Firebase integration for cloud persistence

## Core Capabilities

### Drawing Tools
- **Shapes**: Rectangle, Diamond, Ellipse, Line, Arrow, Freedraw
- **Text**: Rich text with font selection and alignment
- **Frames**: Container elements for organizing content
- **Images**: Embed and crop images on canvas
- **Charts**: Bar, line, and radar charts with data spreadsheet

### Editing Features
- Group selection and hierarchy
- Undo/redo with full history
- Copy/paste with state preservation
- Smart snapping to grid and elements
- Bind arrows to shape endpoints
- Multi-point line editing
- Rotate and transform elements

### Styling
- Stroke and fill colors with transparency
- Fill styles: solid, hachure, cross-hatch, zigzag
- Stroke styles: solid, dashed, dotted
- Stroke width and roundness control
- Light/dark theme support

### Export & Sharing
- Shareable links for collaboration
- Export to PNG with transparent background
- Export to SVG (vector format)
- Export to JSON (full state preservation)
- Clipboard export for pasting into other apps
- End-to-end encryption for shared links

## Technical Positioning

### Monorepo Architecture
Organized as a Yarn workspace with 5 packages:

```
packages/excalidraw/   → Core React component (main library)
packages/element/      → Element types and utilities
packages/math/         → 2D geometry and transformation
packages/common/       → Shared constants and types
packages/utils/        → Export and serialization functions
excalidraw-app/        → Web application and UI layer
```

### What Makes It Special

- **Fractional Indexing**: Handles concurrent insertions without server coordination
- **Immutable Data Model**: Elements and state are readonly, enabling deterministic updates
- **Canvas Optimization**: Three-layer rendering (static background, interactive, export)
- **No Webpack**: Uses Vite for instant HMR and fast builds
- **Type-Safe**: Full TypeScript with strict mode
- **Jotai State**: Fine-grained atomic state management
- **Browser-Native**: Works fully offline, progressive enhancement

## Typical Use Cases

1. **Team Whiteboarding** - Remote or in-office brainstorming
2. **Wireframing** - Sketch app interfaces before coding
3. **Architecture Diagrams** - System design and infrastructure planning
4. **Mind Maps** - Organize ideas visually
5. **Flowcharts** - Process documentation
6. **Mockups** - Quick UI prototypes
7. **Annotations** - Mark up screenshots or designs
8. **Teaching** - Visual explanations and live demonstrations

## Target Audience

- **Developers** - Embed in apps, create architecture diagrams
- **Designers** - Quick wireframes and mockups
- **Teams** - Collaborative brainstorming
- **Educators** - Teaching and presentations
- **Non-Technical Users** - Simple, intuitive interface

## Key Differentiators

| Feature | Excalidraw | Miro | Figma | Draw.io |
|---------|-----------|------|-------|---------|
| Open Source | ✓ | ✗ | ✗ | ✓ |
| Embeddable | ✓ | ✗ | ✗ | ✗ |
| Sketchy Aesthetic | ✓ | ✓ | ✗ | ✗ |
| Free Unlimited | ✓ | ✗ | ✗ | ✓ |
| Hand-drawn Style | ✓ | ✓ | ✗ | ✗ |
| AI Features | ✓ | ✓ | ✓ | ✗ |

## Details
For detailed architecture → see docs/technical/architecture.md
For domain glossary → see docs/product/domain-glossary.md

## Project Health

- **Maintenance**: Actively maintained with regular releases
- **Community**: 80k+ GitHub stars, 7k+ forks
- **Contributors**: 100+ community contributors
- **Release Cadence**: Monthly releases with bug fixes and features
- **Browser Support**: Modern browsers (Chrome, Firefox, Safari, Edge)
- **Performance**: < 100ms render time for typical diagrams

## Success Metrics

- 50M+ monthly active users
- 50+ simultaneous collaborators support
- Diagram export support (PNG, SVG, JSON)
- 99.9% uptime for collaboration server
- < 1 second real-time sync for changes
