# Product Context

## Why Excalidraw Exists

Most diagramming tools (Lucidchart, draw.io, Miro) produce crisp, formal-looking diagrams. This is often counterproductive in early-stage discussions — polished visuals signal finality, discouraging iteration. Excalidraw deliberately mimics hand-drawn sketches to communicate "this is a draft, not a decision."

Additionally, mainstream tools require accounts, subscriptions, or installs. Excalidraw runs instantly in any browser and starts working without sign-in.

## User Problems Solved

| Problem | How Excalidraw Solves It |
|---------|-------------------------|
| Diagramming tools feel too formal for brainstorming | Hand-drawn aesthetic signals "draft" intentionally |
| Real-time whiteboard requires expensive SaaS | Free, self-hostable, open source |
| Sharing diagrams means exporting images | Shareable encrypted URL — recipient opens the live canvas |
| Embedding whiteboards in apps is complex | `@excalidraw/excalidraw` React component |
| Privacy concerns with cloud diagramming tools | E2E encryption; server stores only ciphertext |

## User Journey (Core Flow)

```
Open excalidraw.com
  → Start drawing immediately (no account needed)
  → Optionally: Share → Get encrypted link
  → Collaborators open link → Join same canvas in real time
  → Export as PNG / SVG / JSON when done
```

## Product Tiers

| Tier | Audience | Key Differentiator |
|------|----------|-------------------|
| excalidraw.com (free) | Individuals, casual teams | No auth, E2E encrypted collab |
| Excalidraw+ | Teams wanting persistence | Saved scenes, team workspaces, Google auth |
| Self-hosted | Privacy-conscious orgs | Full control, own Firebase + WS server |
| npm package | Developers | Embed in any React app |

## Key Product Principles

1. **Instant start** — No loading screens, no onboarding wizards. Canvas is ready on first paint.
2. **Privacy by default** — Encryption is not opt-in; it's the only mode.
3. **Offline capable** — Full functionality without network (drawing, export, persistence to localStorage).
4. **Composable** — The core is a React component with a clean API, not a closed SaaS product.

## AI Features (TTD & Magic Frame)

- **Text-to-Diagram (TTD)**: User describes a diagram in natural language → AI generates Mermaid syntax → auto-converted to Excalidraw elements
- **Magic Frame**: Select an area → AI generates diagram content inside it
- Both features require an external AI backend (`VITE_APP_AI_BACKEND`) and an API key stored in localStorage (`excalidraw-oai-api-key`)

## Competitive Landscape

| Tool | vs Excalidraw |
|------|--------------|
| Miro | Full-featured but paid, closed source, no hand-drawn style |
| draw.io | More diagram types but formal look, heavier UI |
| Figma FigJam | Great UX but closed, not embeddable as OSS |
| tldraw | Similar niche, also open source, different aesthetic |

## Related Docs

- Project brief: [`projectbrief.md`](projectbrief.md)
- Product requirements: [`docs/product/PRD.md`](../product/PRD.md)
- Domain glossary: [`docs/product/domain-glossary.md`](../product/domain-glossary.md)
