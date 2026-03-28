# Product Context: Excalidraw

## Why Excalidraw Exists

Traditional diagramming tools (Visio, Draw.io, Lucidchart) produce rigid, formal-looking diagrams that feel "final." This creates psychological friction — people hesitate to create diagrams because they feel like they need to be perfect.

Excalidraw solves this with a **hand-drawn, sketch-like aesthetic** that communicates "this is a draft, it's ok to change it." This lowers the barrier to diagramming and encourages iterative thinking.

## Target Users

1. **Software developers** — architecture diagrams, system designs, API flows
2. **Product/UX teams** — wireframes, user flows, brainstorming
3. **Educators** — visual explanations, collaborative learning
4. **Anyone** needing quick visual communication (no signup required)

## How It Works (User Perspective)

1. Open excalidraw.com — instant blank canvas, no auth needed
2. Draw with familiar tools: shapes, arrows, text, freehand
3. Style elements: colors, fill, stroke, fonts (hand-drawn or code style)
4. Share via link — scene data embedded in URL
5. Collaborate in real-time — share a room link, see others' cursors
6. Export to PNG, SVG, or clipboard

## Key UX Decisions

- **No auth required** — reduces friction to zero for getting started
- **Hand-drawn aesthetic** — using RoughJS for sketch-like rendering
- **Infinite canvas** — pan/zoom freely, no page boundaries
- **URL-based sharing** — no backend needed for basic sharing (data in URL hash)
- **Dark mode** — full support for dark theme
- **Keyboard-first** — comprehensive shortcuts, command palette (Ctrl+K)
- **Progressive Web App** — installable, works offline

## Product Differentiators

- **Open source** (MIT) — can be self-hosted, embedded, customized
- **Embeddable component** — `@excalidraw/excalidraw` npm package for integration
- **Element libraries** — community-shared reusable component sets
- **End-to-end encryption** — for collaborative sessions
- **AI integration** — text-to-diagram generation

## Related Documentation

- [Product Requirements](../product/PRD.md)
- [Domain Glossary](../product/domain-glossary.md)
- [Architecture](../technical/architecture.md)
- [Development Setup](../technical/dev-setup.md)
- [Project Brief](projectbrief.md)
