# projectbrief.md

## Details
For detailed architecture → see [docs/technical/architecture.md](../technical/architecture.md)
For domain glossary → see [docs/product/domain-glossary.md](../product/domain-glossary.md)

## What is Excalidraw?

Excalidraw is an open-source, browser-based collaborative **virtual whiteboard** that renders diagrams in a hand-drawn style. It is both a deployed web application (excalidraw.com) and a published embeddable React component library (`@excalidraw/excalidraw` on npm).

## Main Goals

- **Drawing tool**: Let users sketch diagrams, flowcharts, wireframes, and freeform drawings with a distinctive hand-drawn aesthetic powered by RoughJS.
- **Embeddable library**: Export the editor as a React component so third-party apps can embed Excalidraw in their own products.
- **Collaboration**: Real-time multi-user editing via WebSockets (Socket.io) with presence indicators, remote cursors, and follow mode.
- **Export**: Export scenes to PNG, SVG, clipboard, or embed scene data inside PNG metadata for round-trip fidelity.

## Repository Type

Yarn workspaces monorepo. Serves two audiences simultaneously:

| Audience | Entry point |
|----------|-------------|
| End users | `excalidraw-app/` — the deployed web app |
| Developers embedding Excalidraw | `packages/excalidraw/` — the npm library |

## Package Dependency Order (bottom → top)

```
packages/math         ← pure 2D geometry, no internal deps
packages/common       ← constants, utilities, event primitives
packages/element      ← element types, Scene, Store, mutation logic
packages/excalidraw   ← React component library (App, renderer, actions)
packages/utils        ← public export API (exportToCanvas, exportToBlob, etc.)
excalidraw-app        ← deployed web application, wraps packages/excalidraw
```

## Published Packages

| Package | npm name | Version |
|---------|----------|---------|
| `packages/excalidraw` | `@excalidraw/excalidraw` | 0.18.0 |
| `packages/common` | `@excalidraw/common` | 0.18.0 |
| `packages/element` | `@excalidraw/element` | 0.18.0 |
| `packages/math` | `@excalidraw/math` | 0.18.0 |
| `packages/utils` | `@excalidraw/utils` | 0.1.2 |

## Key User-Facing Features

- Hand-drawn shapes: rectangle, diamond, ellipse, arrow, line, freedraw, text, image
- Elbow (orthogonal) arrows with auto-routing
- Frames and magic frames (AI-powered)
- Element groups, z-ordering, alignment, distribution
- Library of reusable elements
- Mermaid diagram import
- PWA support (offline use)
- Dark/light theme
- Embeddable iframes and media
- Flowchart auto-layout
- Lasso selection tool
- Command palette
- Collaborative follow mode

## Source of Truth for Constraints

- `packages/excalidraw/appState.ts` — `APP_STATE_STORAGE_CONF` controls what persists to localStorage, file export, or server
- `packages/common/src/constants.ts` — all named limits, thresholds, tool types
- `vitest.config.mts` — coverage thresholds: lines 60%, branches 70%, functions 63%, statements 60%
