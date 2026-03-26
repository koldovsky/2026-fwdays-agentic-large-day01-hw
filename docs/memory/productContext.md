# Product Context — Excalidraw

## What Is Excalidraw?

Excalidraw is a browser-based virtual whiteboard for creating hand-drawn style diagrams, wireframes, and sketches. It emphasizes simplicity, real-time collaboration, and a distinctive sketchy aesthetic powered by rough.js.

## Target Audience

| Segment | Use Case |
| ------- | -------- |
| **Designers & UX professionals** | Wireframes, mockups, user flows |
| **Software engineers** | Architecture diagrams, system design, flowcharts |
| **Product managers** | Quick prototyping, process documentation |
| **Educators & students** | Teaching materials, visual explanations |
| **Remote teams** | Collaborative brainstorming and planning sessions |
| **Developers (SDK users)** | Embedding drawing capabilities into their own apps |

## Core Value Proposition

1. **Zero friction** — opens instantly in the browser, no sign-up required
2. **Hand-drawn aesthetic** — makes informal sketches feel natural and approachable
3. **Real-time collaboration** — multiple users edit the same canvas simultaneously
4. **Embeddable SDK** — `@excalidraw/excalidraw` React component for third-party integration
5. **Open source** — MIT license, self-hostable, community-driven

## Key User Workflows

### Drawing
Select tool → draw shape/line/text → style (color, fill, stroke) → arrange (align, layer, group) → export

### Collaboration
Create drawing → share link → collaborators join via WebSocket → see live cursors and changes → real-time reconciliation

### Exporting
Select elements (optional) → choose format (PNG / SVG / JSON) → configure scale and options → download or copy to clipboard

### Embedding (SDK)
`npm install @excalidraw/excalidraw` → render `<Excalidraw>` component → pass props (initialData, onChange, theme) → use imperative API for programmatic control

### AI Features
Open Text-to-Diagram → describe diagram in natural language → streaming generation → edit result on canvas

## Competitive Differentiators

- **Sketchy look-and-feel** vs. polished tools like Figma, Miro, or Lucidchart
- **Fully open source** vs. proprietary SaaS alternatives
- **Lightweight & fast** — no heavy runtime, works offline
- **Embeddable component** — few competitors offer a drop-in React SDK
- **60+ languages** — broad internationalization coverage

## Related Documentation

- [Project Brief](projectbrief.md) — project overview and goals
- [Tech Context](techContext.md) — technology stack details
- [System Patterns](systemPatterns.md) — architectural patterns
- [Architecture](../technical/architecture.md) — detailed architecture diagrams
- [Domain Glossary](../product/domain-glossary.md) — terminology reference
