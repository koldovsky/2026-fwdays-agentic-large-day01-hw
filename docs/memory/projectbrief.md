# Project Brief

## Related Docs
- [PRD — full product requirements](../product/PRD.md)
- [Tech Context — stack & commands](techContext.md)
- [System Patterns — architecture](systemPatterns.md)
- [Dev Setup — onboarding guide](../technical/dev-setup.md)

---

## What Is This

**Excalidraw** — open-source virtual whiteboard for sketching hand-drawn style diagrams in the browser.

This repository is a **homework assignment** for the **fwdays 2026** conference (Day 1, agentic development workshop on large codebases). The goal is to practice AI-assisted development on a real-world production codebase.

## Dual Purpose

| Purpose | Entry Point | Description |
|---------|-------------|-------------|
| Web app | `excalidraw-app/` | Full-featured production app with collab, auth, cloud storage |
| npm library | `packages/excalidraw/` | `@excalidraw/excalidraw` — embeddable React component |

## Core Capabilities

- **Drawing** — shapes, arrows, freehand, text, images, frames, embeds (YouTube, Figma, iframes)
- **Collaboration** — real-time multi-user via WebSocket (Socket.io)
- **Persistence** — Firebase cloud storage + IndexedDB (local)
- **Export** — PNG, SVG, JSON, clipboard
- **Internationalization** — 59 locales
- **Library** — reusable element templates, shareable via token

## Repository Structure

```
.
├── excalidraw-app/        # Production web app (collab, auth, Firebase)
│   ├── collab/            # WebSocket real-time sync
│   ├── components/        # App-level React components
│   └── data/              # LocalData, Firebase persistence
│
├── packages/
│   ├── excalidraw/        # @excalidraw/excalidraw — core library
│   ├── element/           # @excalidraw/element — types & element utils
│   ├── common/            # @excalidraw/common — shared constants/utils
│   └── math/              # @excalidraw/math — geometry primitives
│
├── examples/              # Integration examples (Next.js, browser script)
├── scripts/               # Build & release automation
└── .github/
    ├── copilot-instructions.md   # AI coding standards
    └── workflows/                # 11 CI/CD pipelines
```

## AI Coding Standards (`.github/copilot-instructions.md`)

- TypeScript for all new code; prefer immutable data (`const`, `readonly`)
- Functional React components with hooks; CSS modules for styling
- Prefer performance over RAM; avoid allocations where possible
- Use `?.` and `??` operators
- PascalCase: components/interfaces; camelCase: variables/functions; ALL_CAPS: constants
- Always use `Point` type from `packages/math/src/types.ts` (not `{ x, y }`)
- After changes: offer to run `yarn test:app` and fix reported issues
