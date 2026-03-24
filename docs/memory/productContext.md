# Product Context

## Why Excalidraw Exists

Excalidraw fills the gap between heavyweight diagramming tools (Visio, Lucidchart, draw.io) and simple sketching. Its hand-drawn aesthetic intentionally signals "this is a draft" — reducing the pressure of pixel-perfect layouts and encouraging quick visual communication.

## Problems It Solves

1. **Friction of traditional diagramming** — Most tools require precise placement and formatting. Excalidraw's sketchy style lets users focus on ideas, not alignment.
2. **Collaboration barriers** — Teams need a shared whiteboard that works instantly in the browser with no signup required for basic use.
3. **Embedding gap** — Third-party apps (Notion, Obsidian, VS Code) need a drawing component they can embed without building their own.
4. **Portability** — Drawings should be exportable (PNG, SVG, JSON) and round-trippable (PNG files embed the full scene as metadata).

## How It Should Work

- **Zero-friction start** — Open the URL, start drawing. No account required for local use.
- **Instant collaboration** — One click creates a shared room with E2E encryption and live cursors.
- **Tool simplicity** — A small, discoverable toolbar. Keyboard shortcuts for power users.
- **Offline-first** — Works without network. Saves to browser storage. File save/load via File System Access API.
- **Embeddable** — The `@excalidraw/excalidraw` React component exposes a full imperative API for host apps to control the editor.

## User Experience Goals

| Goal | How It's Achieved |
|------|-------------------|
| Fast startup | Vite dev server, lightweight bundle, no server-side rendering |
| Intuitive drawing | Tool auto-reverts to selection after use (unless locked) |
| Visual consistency | Rough.js enforces the hand-drawn style uniformly |
| Collaboration trust | E2E encryption — server never sees plaintext drawings |
| Accessibility | Keyboard shortcuts, screen reader labels, i18n (60+ locales) |
| Customizability | Themes (dark/light), grid, snap, zen mode, view mode |

## Competitive Positioning

- **vs. draw.io/Lucidchart** — Excalidraw is simpler, faster, open-source, and has a unique aesthetic
- **vs. Miro/FigJam** — Excalidraw is free, self-hostable, and focused on diagrams rather than full whiteboard workflows
- **vs. tldraw** — Similar space; Excalidraw has a larger community, library ecosystem, and established integrations

## Related Docs

### Technical
- [Architecture](../technical/architecture.md) — system design, data flow, rendering pipeline
- [Dev Setup](../technical/dev-setup.md) — onboarding guide, from git clone to first PR

### Product
- [PRD](../product/PRD.md) — reverse-engineered product requirements
- [Domain Glossary](../product/domain-glossary.md) — core domain terms
