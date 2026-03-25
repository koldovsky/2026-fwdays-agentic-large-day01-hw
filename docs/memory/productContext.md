# Product Context: Excalidraw

## Why This Project Exists

Excalidraw solves the problem of **heavyweight, friction-heavy diagramming tools**. Traditional tools (Visio, Lucidchart, draw.io) require installation, accounts, or steep learning curves. Excalidraw offers:

- **Zero friction**: open a browser, start drawing immediately — no sign-up required
- **Hand-drawn aesthetic**: intentionally imprecise look reduces formalism anxiety, encouraging quick ideation
- **Real-time collaboration**: share a room link, co-edit instantly without file versioning hell
- **Open source + embeddable**: free to self-host, and ships as a React component for third-party integration

---

## Problems It Solves

| Problem | Solution |
|---------|----------|
| Complex diagramming tools too slow for quick sketches | Minimal UI, instant canvas |
| "Perfect" diagrams discourage early-stage ideation | Hand-drawn style signals "work in progress" |
| File-based collaboration causes merge conflicts | Live multiplayer with version-based reconciliation |
| Vendor lock-in with proprietary formats | Open `.excalidraw` JSON format, SVG/PNG export |
| Hard to embed whiteboards in other apps | `@excalidraw/excalidraw` npm package |
| Whiteboard tools don't work offline | PWA with local persistence (localStorage + IndexedDB) |

---

## Target Users

- **Developers & engineers** — architecture diagrams, system design sketches, ADRs
- **Designers** — low-fidelity wireframes, user flows
- **Teams in meetings** — real-time collaborative brainstorming
- **Educators** — explanatory drawings, class diagrams
- **Third-party developers** — embedding a whiteboard in their own products via the npm package

---

## UX Goals

### Core Principles
- **Immediate productivity** — no toolbar tutorial needed; shapes are drawn, not placed
- **Feel of pen on paper** — Rough.js rendering + perfect-freehand strokes
- **Collaboration without disruption** — join/leave rooms without losing work; changes merge automatically
- **Non-destructive** — undo/redo, element locking, view-only mode for consumers

### Key UX Behaviors
- Canvas fills 100% of parent container (host app controls size)
- Drawing tools discoverable from toolbar; shapes can also be created by typing shortcuts
- **View mode** (`viewModeEnabled`) disables all editing — useful when embedding for consumers
- **Zen mode** hides UI chrome for distraction-free drawing
- **Grid mode** snaps elements for precise alignment when needed
- Export to PNG, SVG, clipboard, or JSON at any time without interrupting the session
- Dark/light theme toggle

### Embedding UX (npm package)
- Minimal required setup: one import + CSS import + non-zero container height
- Host app communicates via `ExcalidrawAPI` (imperative) or `onMount`/`onInitialize`/`onUnmount` lifecycle props
- `ExcalidrawAPIProvider` + `useExcalidrawAPI()` hook enables sibling component access to editor state
- SSR-safe: must render client-side only (Next.js: `dynamic(..., { ssr: false })`)

---

## Product Boundaries

### What Goes in `excalidraw-app/` (hosted product)
- Firebase integration (auth, DB, storage)
- Collaboration rooms (Socket.io)
- Share links, room URLs
- App-specific UI (landing page, share dialog)
- Sentry error tracking
- PWA registration

### What Goes in `packages/excalidraw/` (library)
- Core editor component
- All drawing tools and element types
- Export/import logic
- i18n (40+ languages)
- Actions system
- Canvas rendering

### Constraints
- Library must have **no Firebase/Socket.io dependency** — only the app layer uses those
- Library must be **SSR-compatible** (no `window`/`document` at module load time)
- Library exports must remain **backwards-compatible** across minor versions
- UMD bundle is **deprecated** as of 0.18.0 — ESM only going forward

---

## Related Documents

| Document | Relevance |
|----------|-----------|
| [projectbrief.md](./projectbrief.md) | Foundation: element model, monorepo layout, all key files |
| [systemPatterns.md](./systemPatterns.md) | How UX goals are implemented: immutability, collab, rendering patterns |
| [activeContext.md](./activeContext.md) | Current development state, unreleased API changes, coding standards |
| [decisionLog.md](./decisionLog.md) | Rationale behind product boundaries (ESM-only, app vs package split) |
| [PRD.md](../product/PRD.md) | Full product requirements: all features, technical limitations, library vs app boundary |
| [domain-glossary.md](../product/domain-glossary.md) | Term definitions: Collaboration, Library, ViewMode, ExcalidrawAPI, etc. |
