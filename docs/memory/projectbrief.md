# Project Brief

## Project Name
Excalidraw — Open-source virtual whiteboard for sketching hand-drawn-like diagrams.

## What It Is
Excalidraw is a web-based, collaborative whiteboarding and diagramming tool that produces hand-drawn style visuals using Rough.js. It's built as a React component library (`@excalidraw/excalidraw`) and ships as both a standalone web application and an embeddable package for third-party integrations.

## Problem It Solves
- Provides a lightweight, browser-based alternative to heavy desktop drawing tools (Visio, draw.io, etc.).
- Enables quick, low-fidelity sketching and diagramming without a steep UI learning curve — the hand-drawn aesthetic intentionally keeps diagrams informal and approachable.
- Supports real-time collaboration so distributed teams can brainstorm, plan, and diagram together.
- Offers an embeddable React component so developers can add drawing capabilities to their own applications.

## Tech Stack
- **Frontend:** React 19, TypeScript 5.9, Vite 5, SCSS, Jotai (state management)
- **Canvas/Graphics:** Rough.js (hand-drawn rendering), Perfect Freehand, HTML Canvas API
- **Collaboration:** Socket.io (WebSocket), Firebase (auth)
- **Infrastructure:** Vercel (deployment), Docker (containerization), Sentry (error tracking), PWA support
- **Monorepo:** Yarn workspaces with packages for `math`, `element`, `common`, `utils`, and the core `excalidraw` engine
- **Testing:** Vitest
- **Linting/Formatting:** ESLint, Prettier, Husky pre-commit hooks

## Key Features
- Freehand drawing, shapes (rectangle, diamond, ellipse), arrows, text
- Element transformations: resize, rotate, snap, align, group
- Command palette, color picker, font controls, dark/light theme
- Export to SVG and PNG; shareable links
- Real-time live collaboration with presence/cursor tracking
- Embeddable React component with imperative API and TypeScript types

## Repository Structure (high-level)
```
/
├── packages/
│   ├── excalidraw/    — Core drawing engine and React components (~main codebase)
│   ├── element/       — Element data structures and transformations
│   ├── math/          — 2D geometry utilities (vectors, points, curves)
│   ├── common/        — Shared types, constants, utility functions
│   └── utils/         — Additional helpers
├── excalidraw-app/    — Standalone web application (deployed to Vercel)
├── examples/          — Integration examples (Next.js, vanilla JS)
└── scripts/           — Build and release automation
```

## Target Audience
1. **End users** — anyone who needs quick sketches, wireframes, or diagrams.
2. **Teams** — collaborative brainstorming and design sessions.
3. **Developers** — embedding drawing capabilities via the npm package.
4. **Educators** — digital classroom collaboration.
