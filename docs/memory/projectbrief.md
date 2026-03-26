# Project Brief: Excalidraw

## What Is This Project

**Excalidraw** is a free, open-source, browser-based collaborative whiteboard for creating hand-drawn style diagrams. Hosted at excalidraw.com.

### Dual Nature
- `excalidraw-app/` — the hosted SaaS product at excalidraw.com
- `packages/excalidraw/` — publishable React component (`@excalidraw/excalidraw` on npm) used by many OSS projects

**Rule of thumb:** App-specific features go in `excalidraw-app/`; reusable logic goes in `packages/`.

---

## Main Goals

- Provide an intuitive, zero-setup whiteboard with a hand-drawn aesthetic
- Ship a reusable React component that third parties can embed in their apps
- Support real-time multi-user collaboration with conflict-free merging
- Offer rich export/import (PNG, SVG, JSON, clipboard)
- Support 40+ languages via i18next

---

## Monorepo Layout

```text
excalidraw-app/       # hosted web app
  index.tsx           # React root, Sentry init, PWA registration
  App.tsx             # app wrapper, Firebase init, theme
  collab/             # real-time collaboration handlers
  data/               # persistence layer (localStorage, IndexedDB, server)
  components/         # app-level UI components
  share/              # share/export functionality

packages/
  excalidraw/         # @excalidraw/excalidraw — main React component
    index.tsx         # library entry point
    components/App.tsx  # core editor (event handlers, state machine)
    appState.ts       # AppState type + defaults
    data/reconcile.ts # collab merge logic
    components/canvases/  # canvas rendering (Rough.js)
    actions/          # ~48 action handlers
    i18n/             # i18next config + 40+ locale JSON files
  element/            # @excalidraw/element — element types + constructors
    src/types.ts      # ExcalidrawElement definitions
  common/             # @excalidraw/common — shared utils, constants, branded types
  math/               # @excalidraw/math — 2D geometry / vectors
  utils/              # @excalidraw/utils — export/import, file handling, compression

examples/
  with-nextjs/        # Next.js integration example
  with-script-in-browser/  # browser <script> tag example

firebase-project/     # Firebase configuration
scripts/              # build, release, WASM, font tools
public/               # static assets
```

**Package dependency chain:**
```text
excalidraw-app → excalidraw → element → math + common
utils (standalone, no internal deps)
```

---

## Element Model

All drawables are `ExcalidrawElement` (defined in `packages/element/src/types.ts`).

### Base Properties
- `id`, `x/y`, `width/height`, `angle` — geometry
- `version` + `versionNonce` — collaboration conflict resolution
- `index` — fractional z-order (stable across peers)
- `groupIds`, `frameId`, `locked`, `isDeleted` — grouping/state

### Element Types
`rectangle`, `diamond`, `ellipse`, `line`, `arrow` (with binding/elbow routing),
`text`, `image`, `freedraw`, `frame`, `magicframe`, `iframe`/`embeddable`

### Immutability Rule
Elements are **immutable** — always update via `newElementWith()`.
Deleted elements stay in scene with `isDeleted: true`; use `getNonDeletedElements()` for visible ones.

---

## All Project Documents

### Memory Bank (`docs/memory/`)

| Document | Purpose |
|----------|---------|
| [projectbrief.md](../memory/projectbrief.md) | Foundation: requirements, goals, element model, monorepo layout — start here |
| [productContext.md](../memory/productContext.md) | Why it exists, problems solved, UX goals, product boundaries |
| [activeContext.md](../memory/activeContext.md) | Current branch state, unreleased changes, coding standards, next steps |
| [systemPatterns.md](../memory/systemPatterns.md) | Architecture patterns: immutability, collaboration, state, rendering, actions |
| [techContext.md](../memory/techContext.md) | Full stack versions, CLI commands, config files, tooling |
| [progress.md](../memory/progress.md) | What's shipped, what's in progress, known issues and constraints |
| [decisionLog.md](../memory/decisionLog.md) | Architectural and product decisions with rationale and consequences |

### Product (`docs/product/`)

| Document | Purpose |
|----------|---------|
| [PRD.md](../product/PRD.md) | Product Requirements Document: purpose, target audience, key features, technical limitations |
| [domain-glossary.md](../product/domain-glossary.md) | Project-specific term definitions to prevent confusion with common/generic usage |

### Technical (`docs/technical/`)

| Document | Purpose |
|----------|---------|
| [architecture.md](../technical/architecture.md) | High-level architecture: monorepo packages, dependency graph, rendering pipeline, data flow |
| [dev-setup.md](../technical/dev-setup.md) | Developer setup guide: from repo clone to first merged PR |

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `packages/excalidraw/index.tsx` | Library entry point (427 lines) |
| `packages/excalidraw/components/App.tsx` | Core editor: canvas, handlers, state machine |
| `packages/element/src/types.ts` | ExcalidrawElement type definitions |
| `packages/excalidraw/data/reconcile.ts` | Collaborative merge logic |
| `excalidraw-app/collab/Collab.tsx` | Real-time collab handler (WebSocket events, sync) |
| `excalidraw-app/App.tsx` | App wrapper, Firebase init, theme |
| `packages/excalidraw/appState.ts` | AppState defaults (zoom, scroll, selectedIds, activeTool) |
| `excalidraw-app/data/` | Persistence: localStorage, IndexedDB, server storage |
