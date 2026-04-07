# Project Brief: Excalidraw

> **Related docs:** [Architecture](../technical/architecture.md) · [PRD](../product/PRD.md) · [Tech Context](./techContext.md) · [System Patterns](./systemPatterns.md) · [Decision Log](./decisionLog.md) · [Domain Glossary](../product/domain-glossary.md)

## Purpose

Excalidraw is an open-source, collaborative whiteboard and diagramming web application. It renders to HTML Canvas with a hand-drawn aesthetic, enabling users to create sketches, flowcharts, and diagrams in a natural, low-fidelity style.

### Core Capabilities
- Hand-drawn style diagrams on HTML Canvas (via `roughjs`)
- Real-time collaboration via WebSockets (Socket.io) + Firebase Firestore
- End-to-end encrypted shareable room links
- Local persistence via localStorage + IndexedDB
- Export to PNG and SVG
- Progressive Web App (installable offline)
- AI features: Text-to-Diagram and Diagram-to-Code
- Embeddable React component (`@excalidraw/excalidraw`) for third-party integration
- Mermaid diagram import via `@excalidraw/mermaid-to-excalidraw`

---

## Technology Stack

| Layer | Technology |
|---|---|
| Language | TypeScript (strict mode, ESNext) |
| UI Framework | React 19 (functional components + hooks) |
| Build Tool | Vite 5 |
| Canvas Rendering | `roughjs`, `perfect-freehand` |
| State Management | `jotai` 2.11 (atomic state) |
| Real-time Collaboration | `socket.io-client` 4.7, Firebase 11 |
| Geometry / Math | Internal `@excalidraw/math` package |
| Code Editor | CodeMirror 6 |
| Testing | Vitest 3 + jsdom + Testing Library |
| Error Monitoring | Sentry (`@sentry/browser` 9) |
| i18n | i18next + Crowdin |
| Package Manager | Yarn 1.22 (workspaces monorepo) |
| Linting | ESLint + Prettier + lint-staged + Husky |
| Containerization | Docker (Node 18 build → Nginx 1.27 serve) |

---

## Repository Structure

```
/
├── excalidraw-app/         # Deployed SPA (Vite)
│   ├── index.tsx           # Entry point — React root + PWA registerSW + Sentry
│   ├── App.tsx             # Main app component (Firebase, collab, AI, theme)
│   ├── app_constants.ts    # Timing, storage keys, WS event constants
│   ├── app-jotai.ts        # App-level Jotai atoms
│   ├── collab/
│   │   ├── Collab.tsx      # WebSocket + Firebase collab lifecycle
│   │   └── Portal.tsx      # WebSocket abstraction
│   ├── data/
│   │   ├── firebase.ts     # Firestore/Storage read-write
│   │   ├── LocalData.ts    # IndexedDB + localStorage persistence
│   │   └── FileManager.ts  # Binary file upload/download
│   └── components/
│       ├── AI.tsx          # AI features (Text-to-Diagram, Diagram-to-Code)
│       └── ...             # Menus, footer, welcome screen, sidebar
│
├── packages/               # Publishable npm packages
│   ├── excalidraw/         # @excalidraw/excalidraw v0.18.0
│   │   ├── index.tsx       # Public API (Excalidraw component + hooks)
│   │   ├── actions/        # ~40 discrete actions (undo, zoom, export, align…)
│   │   ├── components/     # ~60+ UI components
│   │   ├── renderer/       # Canvas rendering pipeline
│   │   ├── scene/          # Scroll, zoom, export logic
│   │   ├── data/           # Serialization, encryption, library
│   │   └── fonts/          # Font loading + subsetting
│   ├── element/            # @excalidraw/element — element types + operations
│   │   └── src/            # Binding, arrows, text, groups, frames, shapes
│   ├── common/             # @excalidraw/common — shared utilities + constants
│   ├── math/               # @excalidraw/math — geometry primitives
│   │   └── src/            # Point, Vector, Segment, Line, Curve, Polygon…
│   └── utils/              # @excalidraw/utils — general utilities
│
├── examples/
│   ├── with-nextjs/        # Next.js integration example
│   └── with-script-in-browser/  # Plain HTML / script-tag example
│
├── scripts/                # Release and build scripts
├── firebase-project/       # Firebase project config
├── public/                 # Static assets
├── Dockerfile              # Multi-stage build (Node 18 → Nginx 1.27)
├── docker-compose.yml      # Single service on port 3000
└── vercel.json             # Vercel deployment config
```

---

## Key Entry Points

| File | Role |
|---|---|
| `excalidraw-app/index.tsx` | App bootstrap (React root, PWA, Sentry) |
| `excalidraw-app/App.tsx` | Main app component; wires core library with Firebase, collab, AI, theme |
| `excalidraw-app/collab/Collab.tsx` | Full collab lifecycle (WebSocket + Firebase encryption) |
| `packages/excalidraw/index.tsx` | Public library API for third-party consumers |
| `packages/element/src/` | All element-type logic (arrows, text, shapes, binding) |
| `packages/math/src/` | Geometry primitives used throughout |

---

## Environment Variables (Dev)

| Variable | Purpose |
|---|---|
| `VITE_APP_BACKEND_V2_GET/POST_URL` | JSON sharing backend |
| `VITE_APP_WS_SERVER_URL` | Local collab WebSocket server (default: `localhost:3002`) |
| `VITE_APP_AI_BACKEND` | Local AI backend (default: `localhost:3016`) |
| `VITE_APP_FIREBASE_CONFIG` | Firebase project credentials (JSON) |
| `VITE_APP_PLUS_APP` | Excalidraw+ URL (default: `localhost:3000`) |

---

## Workshop Context

This repository is a fork used as homework for the **fwdays 2026 Agentic IDE** workshop (Day 1). Grading is automated via CodeRabbit (`.coderabbit.yaml`) and checks for:
- `docs/memory/*.md` — memory bank documents
- `docs/technical/architecture.md` — architecture documentation
- `docs/product/PRD.md` — product requirements document
- `.cursorignore` — Cursor IDE ignore config
