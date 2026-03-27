# Project Brief: Excalidraw

## What It Is

Excalidraw is an open-source, browser-based collaborative whiteboard tool that produces diagrams with a hand-drawn aesthetic. It is available as a web app at excalidraw.com and as an embeddable React component (`@excalidraw/excalidraw`) published to npm.

## Key Value Proposition

- **Hand-drawn style**: All shapes are rendered with a sketchy, informal look via RoughJS — intentionally different from polished vector tools.
- **Real-time collaboration**: Multiple users can draw on the same canvas simultaneously via WebSocket rooms with end-to-end encryption.
- **Embeddable**: The core editor ships as a React component that any app can drop in, with a full imperative API for programmatic control.
- **Zero backend required**: Works fully offline with local persistence (IndexedDB). Backend (Firebase) is optional and only needed for collaboration and image storage.

## Users

| User Type | How They Use It |
|-----------|----------------|
| End users | excalidraw.com for quick diagrams, system design sketches, async collaboration |
| Developers | Embed `@excalidraw/excalidraw` in their own apps (VS Code extensions, Notion-like tools, etc.) |
| Contributors | Add features, fix bugs, build integrations via the monorepo |

## Repository Structure

This is a monorepo containing:
- `excalidraw-app/` — the production web application
- `packages/excalidraw/` — the embeddable React component (published as `@excalidraw/excalidraw`)
- `packages/element/` — element manipulation logic
- `packages/math/` — 2D math primitives
- `packages/common/` — shared constants and utilities
- `packages/utils/` — export utilities (SVG, PNG, Blob)
