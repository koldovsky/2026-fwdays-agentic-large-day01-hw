# Project Brief

## Project Overview

Excalidraw is an open-source virtual whiteboard for sketching hand-drawn-like diagrams in the browser. It renders on HTML Canvas using Rough.js to produce a distinctive "sketchy" visual style. The project is also published as a reusable React component (`@excalidraw/excalidraw`) on npm.

## Goals

- Provide a simple, fast, browser-based drawing tool with a hand-drawn aesthetic
- Support real-time collaboration via WebSocket (socket.io)
- Offer an embeddable React component for third-party integrations
- Maintain an open-source, community-driven ecosystem
- Support offline-first usage with local persistence and file-based save/load

## Target Users

- **Developers & engineers** — quick architecture diagrams, flowcharts, wireframes
- **Teams** — collaborative brainstorming sessions with real-time sync
- **Educators** — visual explanations and interactive whiteboards
- **Third-party apps** — embedding Excalidraw as a component (Notion, Obsidian, etc.)

## Key Features

- Hand-drawn style rendering (Rough.js) with multiple shape types (rectangle, ellipse, diamond, arrow, line, freedraw, text, image, frame, embeddable)
- Real-time collaboration with cursor tracking and follow-user
- Export to PNG, SVG, clipboard, and `.excalidraw` JSON format
- PNG files can embed the full scene as metadata (round-trip editing)
- Element library system — save, share, and reuse drawing components
- Infinite canvas with pan, zoom, and grid snapping
- Dark/light theme support
- Text-to-diagram via Mermaid syntax
- Image cropping, embeddable iframes (YouTube, Vimeo)
- Undo/redo with delta-based history
- End-to-end encryption for shared scenes

## Scope

**In scope:** Drawing, collaboration, import/export, embeddable component, library system, i18n (25+ languages)

**Out of scope:** Server-side rendering, native desktop/mobile apps, vector editing precision (Illustrator-level), version control for drawings

## Related Docs

### Technical
- [Architecture](../technical/architecture.md) — system design, data flow, rendering pipeline
- [Dev Setup](../technical/dev-setup.md) — onboarding guide, from git clone to first PR

### Product
- [PRD](../product/PRD.md) — reverse-engineered product requirements
- [Domain Glossary](../product/domain-glossary.md) — core domain terms
