# Excalidraw - Product Requirements Document

**Reverse-engineered from codebase analysis**

---

## 1. Product Vision

**Problem**: Teams struggle to quickly create visual diagrams without friction—expensive tools, complex setup, design anxiety.

**Solution**: Free, open-source, lightweight web-based whiteboarding with hand-drawn aesthetic, real-time collaboration, and zero login requirements.

**Core Proposition**: Instantly create and collaborate on diagrams with complete offline capability and optional E2E encryption.

---

## 2. Target Audience

- **Non-Technical Users**: Quick sketches, flowcharts, no design skills
- **Product/Design Teams**: Fast wireframing, UI mockups, collaboration
- **Developers**: Architecture diagrams, technical documentation
- **Remote Teams**: Real-time co-editing, distributed collaboration
- **Embedded Developers**: React component integration (@excalidraw/excalidraw npm)

---

## 3. Core Features

### Must-Have
- **14 Drawing Tools**: Selection, shapes (rectangle, diamond, ellipse), arrows, lines, freedraw, text, image, eraser, hand, frames, laser pointer
- **Element Styling**: Stroke/fill colors, patterns (hachure, cross-hatch, solid), opacity, rotation, z-ordering, locking
- **View Control**: Zoom, pan, grid with snap-to-grid, light/dark theme
- **Document Ops**: Auto-save to IndexedDB/localStorage, export (JSON, SVG, PNG), import, no login required
- **Selection**: Rectangular and lasso selection, multi-select, grouping with nesting

### Should-Have
- **Real-Time Collaboration**: WebSocket sync via excalidraw-room, live cursors with usernames, presence indicators
- **Element Libraries**: Built-in shapes, custom library creation, cloud persistence
- **Advanced Drawing**: Arrow binding (three modes), alignment/distribution, undo/redo history
- **Keyboard Shortcuts**: 40+ actions (tool switching, copy/paste, zoom, group/ungroup)
- **Search**: Command palette for action discovery

---

## 4. Technical Constraints

### Browser Support
- Chrome 70+, Firefox 88+, Safari 12+, Edge 79+
- Requires: ES6, Canvas API, IndexedDB, Web Crypto API, PointerEvent API

### Performance Targets
- Render time: <100ms per frame
- Sync latency: <1s (WebSocket round-trip)
- Bundle size: ~500KB gzipped
- Memory: <200MB typical usage

### Offline & Storage
- **IndexedDB**: Primary storage (>100MB typical)
- **localStorage**: User preferences, theme, language
- **Sync**: Full local functionality offline; automatic reconciliation on reconnect
- **Conflict Resolution**: Version-based (versionNonce + fractional indexing)

### Collaboration Infrastructure
- **Server**: Node.js-based excalidraw-room
- **Protocol**: WebSocket custom binary format
- **User Capacity**: 50+ simultaneous users per room (architecture constraint)
- **Data**: Elements, appState, binary files (images)

### Security
- **E2E Encryption** (Optional): AES-GCM, 128-bit keys, Web Crypto API
- **Privacy**: Local data persists locally; cloud storage optional
- **No Tracking**: Disabled in production (VITE_APP_ENABLE_TRACKING=false)

---

## 5. Non-Functional Requirements

### Accessibility
- Full keyboard navigation (40+ shortcuts)
- ARIA labels, semantic HTML
- Dark/light/high-contrast themes
- Multi-language support (59 locales via i18next)

### Data Persistence
- **Formats**: Native JSON (full fidelity), SVG (vector), PNG (raster), clipboard support
- **Selective Persistence**: Config controls per-property storage (server/browser/export)
- **Storage Adapters**: Pluggable pattern (localStorage, IndexedDB, Firebase)

### Theme System
- Light/dark modes with system preference detection
- CSS variables for customization
- Export with optional dark background

---

## 6. Success Criteria (Inferred)

- **User Base**: Large active user population (GitHub: 80k+ stars, 7k+ forks indicates significant adoption)
- **Performance**: Render <100ms, sync <500ms, 99.9% uptime target
- **Engagement**: Multi-user collaborative sessions (real-time sync indicates active collaboration demand)
- **Community**: 100+ core contributors, active development cadence

---

## 7. Competitive Positioning

**vs. Miro**: Lighter weight, free, open-source, same collaboration capability
**vs. Figma**: Focused on diagramming (not design), faster startup, sketchy aesthetic
**vs. Draw.io**: Modern UI, better mobile/touch support, stronger collaboration

**Unique Advantages**:
- Hand-drawn aesthetic (reduces design anxiety)
- Open-source with no vendor lock-in
- Embeddable React component
- Zero friction (instant start, no login)
- Optional E2E encryption and self-hosting

---

## 8. Key Constraints

### Architectural
- Browser-only (no native apps)
- Bound by browser storage limits (50-500MB typical)
- Performance trade-off: Hand-drawn style (RoughJS) adds CPU overhead vs. polygonal rendering

### Feature Constraints
- No built-in video/audio (delegated to external services)
- No cross-device sync (cloud optional via Excalidraw+)
- Canvas rendering inherently limits screen reader accessibility

### Privacy Trade-offs
- Optional authentication (no forced login)
- Optional cloud storage and E2E encryption
- Community-driven development (no dedicated enterprise support)

---

## Reference Files

- `packages/excalidraw/components/App.tsx` (12,818 lines) - Core editor
- `packages/excalidraw/types.ts` - Public API types
- `packages/element/src/types.ts` - Element definitions
- `packages/excalidraw/actions/` - 45+ action handlers
- `packages/excalidraw/index.tsx` - Component export
- `packages/excalidraw/data/encryption.ts` - E2E encryption

---

**Version**: 1.0 | **Status**: Reverse-engineered from codebase v0.18.x | **Last Updated**: 2026-03-25
