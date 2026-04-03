# Tech Context

## Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| UI Framework | React | 19 |
| Language | TypeScript | 5.9 |
| Build Tool | Vite | 5 |
| State Management | Jotai | 2.11 |
| Styling | SCSS + CSS Modules | — |
| Canvas Rendering | Custom engine + rough.js | 4.6.4 |
| Real-time Collab | Socket.io | 4.7 |
| Backend Storage | Firebase (Firestore + Storage) | — |
| Encryption | Web Crypto API (AES-GCM) | — |
| Testing | Vitest + Testing Library | 3.x |
| Package Manager | Yarn workspaces | — |

## Key Libraries

- **rough.js** — produces the hand-drawn sketch aesthetic on canvas
- **perfect-freehand** — smooth pressure-sensitive freehand drawing
- **fractional-indexing** — stable ordering of elements during concurrent edits
- **pako** — zlib compression for scene data before storage/network
- **@excalidraw/mermaid-to-excalidraw** — converts Mermaid syntax to Excalidraw elements
- **browser-fs-access** — modern File System Access API with fallback
- **pica** — high-quality image resizing in the browser
- **png-chunks-*** — read/write custom PNG metadata chunks (scene embedding)

## Environment Variables

All runtime config is injected via Vite env vars (`VITE_APP_*`):

| Variable | Purpose |
|----------|---------|
| `VITE_APP_BACKEND_V2_*` | JSON scene persistence backend URLs |
| `VITE_APP_WS_SERVER_URL` | WebSocket server for real-time collab |
| `VITE_APP_AI_BACKEND` | AI feature backend (TTD, Magic Frame) |
| `VITE_APP_FIREBASE_CONFIG` | Firebase project credentials (JSON) |
| `VITE_APP_LIBRARY_BACKEND` | Shared drawing library backend |
| `VITE_APP_PLUS_*` | Excalidraw+ URLs and feature flags |

## Build Commands

```bash
yarn start              # Dev server on :3001 (or $VITE_APP_PORT)
yarn build:app          # Production build of excalidraw-app
yarn build:packages     # Build all npm packages (ESM)
yarn build:excalidraw   # Build @excalidraw/excalidraw only
yarn test               # Run Vitest test suite
yarn test:all           # Typecheck + lint + format + tests
yarn fix                # Auto-fix eslint + prettier
```

## Storage Layout

| Storage | Key | Content |
|---------|-----|---------|
| localStorage | `excalidraw` | All canvas elements (JSON) |
| localStorage | `excalidraw-state` | AppState snapshot |
| localStorage | `excalidraw-collab` | Collab preferences |
| localStorage | `excalidraw-theme` | UI theme preference |
| IndexedDB | `excalidraw-library` | User's saved element library |
| IndexedDB | `excalidraw-ttd-chats` | AI TTD chat history |

## Network Topology

```
Browser ──HTTP──► Firebase Storage  (images, scene JSON)
        ──WSS───► Socket.io server   (real-time collab events)
        ──HTTP──► AI backend         (TTD/Magic Frame inference)
        ──HTTP──► Library backend    (shared libraries)
```

## Related Docs

- System patterns: [`systemPatterns.md`](systemPatterns.md)
- Full architecture: [`docs/technical/architecture.md`](../docs/technical/architecture.md)
- Dev setup: [`docs/technical/dev-setup.md`](../docs/technical/dev-setup.md)
