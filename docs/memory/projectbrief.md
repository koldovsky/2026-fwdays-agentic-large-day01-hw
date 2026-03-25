# Project Brief

> **See also**: [techContext](techContext.md) | [systemPatterns](systemPatterns.md) | [decisionLog](decisionLog.md) | [productContext](productContext.md) | [activeContext](activeContext.md) | [progress](progress.md)
> **Technical docs**: [Architecture](../technical/architecture.md) | [Dev Setup](../technical/dev-setup.md)
> **Product docs**: [PRD](../product/PRD.md) | [Domain Glossary](../product/domain-glossary.md)

## What Is This

Excalidraw — open-source browser-based drawing tool for creating diagrams,
sketches, and wireframes with a hand-drawn aesthetic. The project is structured
as a monorepo that ships both a standalone web application and a reusable React
component for embedding into third-party apps.

- **Repository**: `excalidraw-monorepo` (Yarn Workspaces)
- **License**: MIT
- **Package name**: `@excalidraw/excalidraw` (npm)
- **Current version**: 0.18.0

## Primary Goals

- Provide a zero-friction canvas for visual thinking (no login required)
- Offer real-time collaboration with end-to-end encryption
- Publish a drop-in React component that third-party apps can embed
- Maintain a hand-drawn look via rough.js rendering

## Target Users

- **End users** — access via excalidraw.com or self-hosted Docker deployment
- **Developers** — embed `<Excalidraw />` React component in their apps
- **Teams** — real-time collaboration via shared rooms (socket.io + Firebase)

## Core Capabilities

- **Drawing**: rectangles, ellipses, diamonds, arrows, lines, freehand, text,
  images, embeddables, frames
- **Collaboration**: encrypted real-time sync via WebSocket; Firebase for
  persistent scene storage
- **Import / Export**: JSON (native), PNG (with embedded metadata), SVG,
  clipboard
- **Library**: reusable element templates (save, share, import)
- **Undo / Redo**: delta-based history with collaboration-aware conflict
  resolution
- **PWA**: installable progressive web app with service worker

## Repository Layout

```
excalidraw-app/          → Standalone web application (the product)
packages/
  common/                → Constants, utilities, event emitter (base layer)
  math/                  → 2D geometry: points, vectors, curves, polygons
  element/               → Element types, Scene, Store, shape generation
  excalidraw/            → React component, actions, renderer, public API
  utils/                 → Export helpers, bounding-box queries
examples/
  with-nextjs/           → Next.js integration example
  with-script-in-browser/→ Vite + vanilla integration example
firebase-project/        → Firestore rules and indexes
scripts/                 → Build, release, locale, WASM tooling
public/                  → Static assets (robots.txt, service worker)
docs/                    → Project documentation
```

## Package Dependency Chain

```
common (no deps)
  ↑
math → common
  ↑
element → common, math
  ↑
excalidraw → common, math, element   ← public npm package
  ↑
excalidraw-app → excalidraw, element (direct), common (direct)
```

Build order must follow this chain bottom-up:
`common → math → element → excalidraw`.

## Deployment

- **Vercel** — primary hosting for excalidraw.com (`vercel.json` config)
- **Docker** — self-hosting via `Dockerfile` (multi-stage: Node build → Nginx)
- **npm** — `@excalidraw/excalidraw` published to npm registry

## Key Integrations

| Service | Purpose | Config |
|---------|---------|--------|
| Firebase Firestore | Encrypted scene persistence for collab rooms | `firebase-project/` |
| Firebase Storage | Binary image file hosting | `firebase-project/storage.rules` |
| Socket.io | Real-time element & pointer sync | `excalidraw-app/collab/Portal.tsx` |
| Sentry | Error monitoring | `excalidraw-app/sentry.ts` |
| Crowdin | Translation management | `crowdin.yml` |

## Non-Goals (out of scope for the component)

- User authentication (handled by host app or excalidraw-app layer)
- Server-side rendering (component is client-only)
- Vector editing (this is a sketch tool, not Figma)
