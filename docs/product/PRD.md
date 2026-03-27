# Product Requirements Document (Reverse-Engineered)

## Problem Statement

Teams doing remote or async work need a quick, expressive way to sketch diagrams, system architectures, and ideas together. Existing tools are either too formal (Figma, Lucidchart), too heavy (Miro), or don't support real-time collaboration (pen-and-paper). There is no lightweight open-source whiteboard that feels like sketching on paper and works in the browser without sign-up.

## Target Users

| Persona | Need |
|---------|------|
| **Remote engineering teams** | Quick system design diagrams during meetings; async diagram sharing |
| **Individual developers** | Fast throwaway sketches; architecture notes committed to repos |
| **Product/UX designers** | Low-fidelity wireframes with informal aesthetic |
| **Developer-tool builders** | Embeddable whiteboard inside their own products (VS Code, Notion-like apps, docs tools) |

## Core Features

### Drawing Tools
- Shape tools: rectangle, diamond, ellipse, line, arrow, freehand pencil
- Text tool with font and alignment options
- Image embed with crop support
- Eraser, hand (pan), lasso and box selection
- Frame tool for grouping and labeling areas

### Element Styling
- Stroke color, background color, fill style (hachure, solid, etc.)
- Roughness level (architect → cartoonist)
- Stroke width and style (solid/dashed/dotted)
- Opacity, corner roundness, font family/size

### Canvas Interactions
- Infinite canvas with pan and zoom (10% → 3000%)
- Snap to grid, snap to elements
- Undo/redo (delta-based, unlimited)
- Copy/paste, duplicate, group/ungroup
- Lock elements, link elements to URLs

### Collaboration
- Real-time multi-user editing via shareable room link
- End-to-end encrypted (AES-GCM key in URL hash, never hits server)
- Live collaborator cursors with usernames
- No account required to join a room

### Persistence & Export
- Auto-save to browser IndexedDB (no backend needed)
- Export as PNG, SVG, or `.excalidraw` JSON
- Import `.excalidraw`, `.excalidrawlib`, image files
- Embeddable in other apps via React component or iframe

### Embeddability
- Published as `@excalidraw/excalidraw` on npm
- Full imperative API: programmatic scene control, element CRUD, export
- Customizable UI (hide toolbar, custom theme, readonly mode)

## Non-Goals

- **Not a full vector editor** — no bezier path editing, no SVG import editing (Figma/Inkscape territory)
- **Not a presentation tool** — no slides, animations, or speaker notes (Slides/Pitch territory)
- **Not a pixel/raster editor** — no brushes, layers, or pixel manipulation
- **Not an enterprise product** — no access control, audit logs, or org management in the OSS version

## Constraints

- Browser-first: must work without installation; no native app required
- No IE11 support; targets Chrome 70+, Firefox latest, Safari 12+, Edge 79+
- Open source (MIT license) — no paywalled core features
- Privacy by design: collaboration uses E2E encryption; server never sees content
- Offline capable: full functionality without internet (except real-time collab)

## Key Quality Attributes

| Attribute | Requirement |
|-----------|-------------|
| Performance | Canvas renders must not block at 60fps on typical diagrams (hundreds of elements) |
| Reliability | No data loss on refresh — auto-save to IndexedDB after every change |
| Accessibility | Keyboard-navigable tools; screen-reader labels on interactive elements |
| Portability | `.excalidraw` files are plain JSON; no vendor lock-in |
| Extensibility | Embedders can inject custom UI, handle storage, and intercept API calls |
