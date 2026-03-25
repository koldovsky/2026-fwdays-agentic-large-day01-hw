# Project Brief: Excalidraw

## Overview
Excalidraw is an open-source, web-based whiteboard and diagramming tool that produces hand-drawn style sketches. It is organized as a monorepo and serves both as a standalone web application and a reusable React component library (`@excalidraw/excalidraw`) that can be embedded into other projects.

## Goals
- Provide a free, intuitive, browser-based tool for creating sketches, diagrams, and visual collaborations
- Support real-time multi-user collaboration via WebSocket connections
- Offer a high-quality React component library for third-party integrations
- Maintain a hand-drawn aesthetic that makes diagrams feel approachable and informal
- Support offline use as a Progressive Web App (PWA)

## Scope
- **Drawing tools**: Freehand, shapes (rectangle, ellipse, diamond), arrows/connectors, text, eraser, lasso selection
- **Collaboration**: Live editing with presence indicators, cursor tracking, idle status
- **Data persistence**: Firebase (Firestore + Storage), local IndexedDB, JSON backend API
- **Export/Import**: PNG (with embedded metadata), SVG, `.excalidraw` JSON files
- **Library system**: Reusable element collections with cloud sync
- **AI features**: Diagram-to-code conversion via AI backend
- **Mermaid support**: Convert Mermaid diagram syntax into Excalidraw elements
- **Internationalization**: 60+ languages via i18next with Crowdin-managed translations
- **Examples**: Integration demos for browser scripts and Next.js

## Target Users
- Developers and designers creating quick sketches and architecture diagrams
- Teams collaborating in real-time on visual ideas
- Third-party applications embedding the Excalidraw component

## Repository Structure (High-Level)
```
excalidraw-app/        → Main web application (port 3001)
packages/
  excalidraw/          → Core React component library (~555 TS/TSX files)
  element/             → Element types and operations
  math/                → Geometry and math utilities
  common/              → Shared constants, types, utilities
  utils/               → Helper functions
examples/              → Integration examples (Next.js, browser)
firebase-project/      → Firebase configuration and rules
```

## Related Docs
- [Tech Context](./techContext.md) — dependencies and versions
- [Architecture](../docs/technical/architecture.md) — system design diagrams
- [PRD](../docs/product/PRD.md) — product requirements
- [Dev Setup](../docs/technical/dev-setup.md) — onboarding guide
