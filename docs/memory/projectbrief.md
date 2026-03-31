# Project Brief: Excalidraw

## Overview
**Excalidraw** is an open-source, web-based drawing application that enables users to create hand-drawn style diagrams, sketches, and visualizations. It's designed to feel like drawing on a whiteboard but with the power of a digital application.

## Main Goals
1. **Standalone Web Application** - Fully functional drawing tool accessible as a web app at `excalidraw.com`
2. **Embeddable React Component** - Published as `@excalidraw/excalidraw` npm package for integration into host applications
3. **Real-time Collaboration** - Support for live multiplayer drawing sessions via WebSocket (Socket.io)
4. **Cross-browser Compatibility** - Works on desktop and mobile devices with modern browsers

## Key Features
- **Drawing Tools**: Freehand drawing, shapes (rectangles, diamonds, ellipses), arrows with binding, lines, text
- **Styling**: Colors, stroke styles, fill patterns, opacity, font families, and text alignment
- **Element Management**: Selection, grouping, alignment, distribution, z-ordering, frame wrapping
- **Collaboration**: Real-time user presence, cursor tracking, element binding indicators
- **Persistence**: Local storage, cloud sync via Firebase, export/import (JSON, PNG with metadata)
- **AI Integration**: Text-to-Diagram (TTD) feature for diagram generation from descriptions
- **Accessibility**: 60+ language support, keyboard shortcuts, screen reader compatibility
- **Canvas Operations**: Zoom, pan, grid snapping, guides, minimap

## Architecture Type
**Monorepo** with:
- Standalone web app (`excalidraw-app/`)
- Core library packages (`packages/`)
- Integration examples (`examples/`)
- Shared utilities and types across packages

## Target Users
- **Individual Users**: Note-taking, sketching, brainstorming
- **Teams**: Collaborative whiteboarding, flowcharting
- **Developers**: Embedding drawing capabilities in their applications
- **Educators**: Creating visual content and diagrams

## Success Metrics
- Open-source adoption (GitHub stars, npm downloads)
- User engagement (daily active users, drawing creation)
- Performance (canvas rendering speed, app responsiveness)
- Code quality (test coverage, type safety)

---

## 🔗 Related Documentation

**Want more details?**
- **Product Requirements**: See [`docs/product/PRD.md`](../product/PRD.md) for complete feature list and business model
- **User Experience**: See [`productContext.md`](productContext.md) for UX goals and user journeys
- **Technical Stack**: See [`techContext.md`](techContext.md) for technology choices
- **Architecture**: See [`docs/technical/architecture.md`](../technical/architecture.md) for system design
- **Getting Started**: See [`docs/technical/dev-setup.md`](../technical/dev-setup.md) for developer setup guide
