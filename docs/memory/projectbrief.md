# Project Brief

## Project Name

**Excalidraw** — an open-source virtual whiteboard for sketching hand-drawn-like diagrams.

## Origin

This is a fork/clone of the upstream [Excalidraw](https://github.com/excalidraw/excalidraw) repository. The monorepo name is `excalidraw-monorepo` (see root `package.json`).

## Elevator Pitch

Excalidraw is a browser-based, collaborative whiteboard tool that produces hand-drawn-style diagrams. It runs entirely in the browser, supports real-time collaboration via WebSockets and Firebase, and can be embedded as a React component in third-party applications.

## Key Features

- **Freeform drawing canvas** with hand-drawn (Rough.js) aesthetic
- **Shape tools**: rectangle, diamond, ellipse, arrow, line, freedraw, text, image, frame, embeddable
- **Real-time collaboration** via WebSocket (socket.io) + Firebase Firestore for persistence
- **End-to-end encryption** of shared scenes
- **Export**: PNG, SVG, JSON, clipboard, Excalidraw+ integration
- **Import**: JSON, images, libraries, Mermaid-to-Excalidraw conversion
- **Undo/Redo** with delta-based history system
- **Library system** for reusable element collections (IndexedDB-backed)
- **PWA support** with service worker and offline capability
- **Dark/light theme** with system preference detection
- **Internationalization** via Crowdin (40+ locales)
- **Embedding** as a React component (`@excalidraw/excalidraw` package)
- **Text-to-diagram (TTD)** via Mermaid conversion and AI-assisted generation (see `packages/excalidraw/components/TTDDialog/`, `aiEnabled` prop, `VITE_APP_AI_BACKEND`)
- **Laser pointer** and **follow mode** for presentations
- **Command palette** for keyboard-driven workflows

## Target Audience

- Developers and designers who need quick, informal diagramming
- Teams collaborating remotely on architecture diagrams, wireframes, flowcharts
- Third-party app developers embedding a whiteboard component

## Upstream Repository

- <https://github.com/excalidraw/excalidraw>

## License

MIT License — Copyright (c) 2020 Excalidraw (see `LICENSE`).

## Cross-References

- For tech stack → see [`docs/memory/techContext.md`](techContext.md)
- For architecture → see [`docs/technical/architecture.md`](../technical/architecture.md)
- For domain glossary → see [`docs/product/domain-glossary.md`](../product/domain-glossary.md)
- For product context → see [`docs/memory/productContext.md`](productContext.md)
