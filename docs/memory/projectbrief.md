# Project Brief

## What Is This Project

**Excalidraw** is an open-source virtual whiteboard for drawing hand-styled diagrams.
The hosted application lives at [excalidraw.com](https://excalidraw.com).

This repository is a **monorepo** that ships two things simultaneously:

1. A **standalone web application** (`excalidraw-app/`) — the full-featured editor deployed to the web.
2. A **publishable React component library** (`packages/`) — embeddable in any React app via npm.

## Core Capabilities

- Infinite canvas with hand-drawn aesthetic (powered by rough.js)
- Real-time collaboration via WebSocket (`socket.io-client`)
- PWA support — works offline after first load
- Export to PNG, SVG, clipboard, and `.excalidraw` JSON files
- Embeddable as `<Excalidraw />` with a full imperative API (`ExcalidrawImperativeAPI`)
- AI-powered diagram generation (Mermaid-to-Excalidraw, magic frame / diagram-to-code)
- Library of reusable shapes, shareable via URL
- i18n — 59 languages, managed via Crowdin

## Repository Layout

```
/
├── excalidraw-app/          # Standalone app (excalidraw.com)
│   ├── App.tsx              # Root component
│   ├── collab/              # Real-time collaboration (Collab.tsx, Portal.tsx)
│   ├── components/          # App-specific UI
│   ├── data/                # Persistence, Firebase, sharing
│   └── tests/               # App-level tests
│
├── packages/                # Published npm packages (all at version 0.18.0)
│   ├── excalidraw/          # @excalidraw/excalidraw — main React component
│   ├── element/             # @excalidraw/element — element logic, Scene, Store
│   ├── common/              # @excalidraw/common — shared constants & utilities
│   ├── math/                # @excalidraw/math — 2D geometry primitives
│   └── utils/               # @excalidraw/utils v0.1.2 — export helpers
│
├── examples/
│   ├── with-nextjs/         # Next.js integration example
│   └── with-script-in-browser/ # Vanilla script embed
│
├── scripts/                 # Build, release, locale tooling
├── public/                  # Static assets served by excalidraw-app
└── firebase-project/        # Firebase hosting config
```

## Published Package Dependency Graph

```
@excalidraw/excalidraw  (0.18.0)
  ├── @excalidraw/element  (0.18.0)
  │     ├── @excalidraw/common  (0.18.0)
  │     └── @excalidraw/math   (0.18.0)
  ├── @excalidraw/common   (0.18.0)
  └── @excalidraw/math     (0.18.0)

@excalidraw/utils  (0.1.2)  — standalone, no cross-deps
```

## Key External Integrations

| Integration | Purpose |
|---|---|
| Firebase (v11) | Scene persistence and link-based sharing |
| Socket.io (v4) | Real-time collaboration |
| Sentry (v9) | Error tracking in production |
| Crowdin | Translation management (59 locales) |
| Vercel | Hosting and preview deployments |

## License

MIT

## Details

For detailed architecture → see [docs/technical/architecture.md](../technical/architecture.md)
For domain glossary → see [docs/product/domain-glossary.md](../product/domain-glossary.md)
