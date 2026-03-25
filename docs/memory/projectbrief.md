# Project Brief

## Project Name
Excalidraw

## One-Line Description
A free, open-source collaborative virtual whiteboard with a hand-drawn aesthetic.

## Mission
Enable anyone to quickly sketch diagrams, wireframes, and ideas in a visual medium that feels natural and non-intimidating — without the overhead of polished design tools.

## Core Goals

1. **Simplicity** — Zero-friction start: open a browser, start drawing.
2. **Collaboration** — Real-time multi-user editing with end-to-end encryption.
3. **Embeddability** — Ship a first-class React library so developers can integrate the canvas into their own products.
4. **Privacy** — No accounts required; share links use symmetric encryption so server never sees content.
5. **Extensibility** — Support AI-assisted diagram generation, plugin-like library system, and third-party integrations.

## Scope

### In Scope
- Web application (excalidraw.com) — fully-featured PWA
- `@excalidraw/excalidraw` NPM package — embeddable React component
- Supporting packages: `@excalidraw/element`, `@excalidraw/common`, `@excalidraw/math`, `@excalidraw/utils`
- Real-time collaboration via WebSocket server
- Firebase-backed storage for files and share links
- AI text-to-diagram feature
- Localization (50+ languages)

### Out of Scope
- Backend WebSocket server (separate repo: excalidraw-room)
- Excalidraw Plus (paid product, separate codebase)
- Mobile native apps

## Current Version
`0.18.0` (all packages)

## License
MIT
