# Product Context

## What Excalidraw Solves
Excalidraw provides a lightweight, browser-based whiteboard for creating diagrams and sketches with a distinctive hand-drawn style. It removes the friction of traditional diagramming tools by being instantly accessible (no install, no account required) and visually informal.

## User-Facing Features

### Core Drawing
- Freehand drawing with pen/brush tools (smooth strokes via `perfect-freehand`)
- Shape tools: rectangle, ellipse, diamond, line, arrow
- Text tool with inline editing (WYSIWYG)
- Eraser tool with custom lasso implementation
- Color picker with palette presets and custom colors
- Dark mode support

### Collaboration
- Live collaboration via shareable room links
- Real-time cursor positions and user presence
- Idle status indicators
- Laser pointer tool for presentations
- QR code sharing for easy mobile access

### Data & Export
- Export to PNG (with embedded scene metadata for re-import), SVG, JSON
- Copy to clipboard
- Local auto-save via IndexedDB
- Cloud persistence via Firebase

### Libraries
- Reusable element collections
- Cloud-synced library management
- Community-shared libraries

### AI Features
- Diagram-to-code conversion
- AI-powered generation via dedicated backend (`/v1/ai/diagram-to-code/generate`)

### Mermaid Integration
- Convert Mermaid syntax to Excalidraw elements
- `@excalidraw/mermaid-to-excalidraw` package

### Command Palette
- Quick access to all actions via fuzzy search
- Keyboard-driven workflow

### PWA
- Installable on desktop and mobile
- Offline support with service worker caching

## Internationalization
- 60+ languages supported
- i18next with browser language auto-detection
- Translations managed via Crowdin (not edited directly in repo)
- Completion percentages tracked per language (`percentages.json`)
- Locale files split into separate chunks at build time for performance

## Integrations
- **Excalidraw+**: Premium hosted version (`app.excalidraw.com`)
- **Firebase**: Authentication and cloud storage
- **Sentry**: Error monitoring in production
- **SimpleAnalytics**: Privacy-friendly usage analytics
- **React component**: `@excalidraw/excalidraw` for embedding in other apps

## Integration Examples
- **Browser script**: Vanilla embedding with Vite (`examples/with-script-in-browser/`)
- **Next.js**: Server-side rendering compatible integration (`examples/with-nextjs/`)

## UX Principles
- Hand-drawn aesthetic — approachable, sketch-like feel (via RoughJS)
- Instant start — no login required for basic usage
- Keyboard-first — extensive shortcuts and command palette
- Collaboration-native — sharing is a first-class feature
- Privacy-aware — minimal tracking, offline-capable

## Related Docs
- [PRD](../docs/product/PRD.md) — full product requirements document
- [Domain Glossary](../docs/product/domain-glossary.md) — terminology reference
- [Project Brief](./projectbrief.md) — project overview and scope
- [Decision Log](./decisionLog.md) — why key product decisions were made
