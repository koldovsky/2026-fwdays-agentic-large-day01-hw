# Product Context

## Purpose

Excalidraw is an open-source virtual whiteboard for sketching hand-drawn diagrams.
It is both a hosted web app (`excalidraw.com`) and a reusable React component (`@excalidraw/excalidraw`) that
third-party apps can embed.

---

## UX Goals

- **Zero friction start** — no login required; canvas is ready immediately on load.
- **Hand-drawn aesthetic** — roughjs strokes give every shape an informal, sketch-like look.
- **Infinite canvas** — pan/zoom freely; no page boundary or slide concept.
- **Real-time collaboration** — share a link to co-edit with end-to-end encryption.
- **Embeddability** — developers can drop `<Excalidraw />` into any React app with minimal setup.
- **Accessibility** — keyboard-navigable toolbar, ARIA labels, screen reader support.
- **Offline-first** — canvas autosaves to `localStorage`; files go to IndexedDB.
- **Internationalisation** — 40+ community-translated locales, auto-detected via browser language.

---

## Primary Use Cases

| Use Case | Key Features Used |
|----------|-------------------|
| Whiteboard brainstorming | Freehand draw, shapes, text, lasso selection |
| Architecture / flow diagrams | Frames, flowcharts, elbow arrows, element linking |
| Teaching / presentations | Laser pointer, follow-mode, zen mode |
| Technical diagrams | Mermaid-to-diagram (TTD), AI diagram generation |
| Async collaboration | Share link (E2E encrypted), export PNG/SVG/JSON |
| Embedding in apps | `<Excalidraw />` component with imperative API |

---

## Key UX Flows

### New session
1. User opens `excalidraw.com` → welcome screen (no auth).
2. Selects a tool from the toolbar or presses a keyboard shortcut.
3. Draws on the canvas; changes autosave to `localStorage` every 300 ms (debounced).

### Collaboration
1. User clicks **Live collaboration** → dialog generates an encrypted room URL.
2. Collab session creates a Socket.io room; scene sync via Firebase on reconnect.
3. Collaborator cursors and idle/active status broadcast via volatile WebSocket events.

### Embed (host app)
1. Host imports `<Excalidraw />` from `@excalidraw/excalidraw`.
2. Passes `onMount` / `onInitialize` callbacks to receive the imperative `ExcalidrawAPI`.
3. Optionally provides `onExport` for async post-processing of exported data.

---

## Non-Goals

- Not a vector graphics editor (no SVG path editing).
- Not a document editor (no pages, no rich text beyond simple text elements).
- Not a presentation tool (no slide transitions; follow-mode is the closest equivalent).
- Excalidraw+ (the SaaS product) is out of scope for this codebase — only promo links exist in `excalidraw-app`.

## Details
For detailed architecture → see `docs/technical/architecture.md`
For domain glossary → see `docs/product/domain-glossary.md`
