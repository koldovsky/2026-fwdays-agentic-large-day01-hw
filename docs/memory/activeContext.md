# Active Context — Excalidraw

## Current State

This document captures the active development context and working state of the Excalidraw project as observed on 2026-03-26.

## Recent Focus Areas

- **Monorepo package structure** — the codebase is organized into `@excalidraw/excalidraw`, `@excalidraw/element`, `@excalidraw/common`, `@excalidraw/math`, and `@excalidraw/utils`
- **React 19 + Jotai** — state management has moved to atomic Jotai atoms (away from earlier Redux patterns)
- **AI features** — Text-to-Diagram (TTD) and Diagram-to-Code capabilities backed by a separate AI service
- **Feature flags** — experimental features gated via `localStorage` flags (e.g., `COMPLEX_BINDINGS`)
- **Collaboration** — real-time multi-user editing via socket.io with Firebase backend

## Active Configuration

| Setting | Value |
| ------- | ----- |
| Dev server port | 3001 |
| WebSocket server | localhost:3002 |
| AI backend | localhost:3016 |
| Backend API (dev) | json-dev.excalidraw.com |
| Node version | >= 18 |
| Package manager | Yarn 1.22.22 |

## Known Technical Debt

- **App.tsx is 407KB+** — the main component file is extremely large and handles too many responsibilities
- **Silent error handling** — font loading, localStorage, and file hashing failures are swallowed with console-only logging
- **Undocumented globals** — `window.h` debug hook, `EXCALIDRAW_THROTTLE_RENDER`, `EXCALIDRAW_ASSET_PATH` are not publicly documented
- **Test/prod behavioral differences** — default element roundness differs between test and production environments

## Decisions in Flight

- Feature flag `COMPLEX_BINDINGS` suggests ongoing work on advanced arrow-to-element binding
- Magic Frame and TTD features indicate growing AI integration surface

## Related Documentation

- [Project Brief](projectbrief.md) — project overview
- [Tech Context](techContext.md) — stack and tooling
- [System Patterns](systemPatterns.md) — architecture patterns
- [Decision Log](decisionLog.md) — architectural decisions and undocumented behaviors
- [Progress](progress.md) — documentation progress tracking
