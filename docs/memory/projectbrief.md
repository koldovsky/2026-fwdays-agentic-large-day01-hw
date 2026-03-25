# Project Brief

## Overview

Excalidraw is an open-source virtual whiteboard for sketching hand-drawn-style diagrams. The repository is a **Yarn monorepo** containing the embeddable React component library (`@excalidraw/excalidraw`), the hosted web application, shared internal packages, and usage examples.

## Primary Goals

- Provide a best-in-class, self-contained **React diagramming component** that any developer can embed.
- Deliver a hosted **collaborative whiteboard app** at excalidraw.com with real-time multi-user editing.
- Expose a clean **public API** (imperative ref + props) so integrators can load/export scenes programmatically.
- Support **offline-first** usage (PWA, local IndexedDB persistence) with optional cloud sync.
- Maintain an **MIT-licensed** codebase that is easy to fork and extend.

## Repository Structure

```
excalidraw-monorepo/
├── excalidraw-app/          # Hosted web application (Vite SPA + PWA)
├── packages/
│   ├── excalidraw/          # @excalidraw/excalidraw — public npm package (v0.18.0)
│   ├── element/             # Element types, mutation, binding, layout
│   ├── math/                # Geometry primitives (Point, Vector, Segment, …)
│   ├── common/              # Shared utilities, constants, event bus, colors
│   └── utils/               # Additional utility helpers
├── examples/
│   ├── with-nextjs/         # Next.js integration example
│   └── with-script-in-browser/  # Plain browser/CDN integration
└── scripts/                 # Build, release, locale tooling
```

## Key Capabilities

- **Drawing tools**: shapes, arrows, freehand, text, images, frames, groups, flowcharts.
- **Collaboration**: Socket.io real-time sync, end-to-end encryption, Firebase persistence.
- **Export**: PNG, SVG, JSON, clipboard, Excalidraw+ cloud.
- **Embeddable**: published as `@excalidraw/excalidraw` on npm; Next.js and pure-browser examples included.
- **Localization**: i18n via `i18next` with 70+ locales (Crowdin managed).
- **PWA**: Service worker, offline support, installable.

## Target Users

- **End users** who want an intuitive, hand-drawn-style online whiteboard.
- **Developers** who embed the component in their own products.
- **Contributors** extending the open-source project.

## License

MIT

## Details
For detailed architecture → see `docs/technical/architecture.md`
For domain glossary → see `docs/product/domain-glossary.md`
