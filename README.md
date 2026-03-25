# Excalidraw

> A free, open-source collaborative virtual whiteboard with a hand-drawn aesthetic.

Excalidraw lets anyone sketch diagrams, wireframes, and ideas in a visual medium that feels natural and non-intimidating — no account required, no install needed. Just open a browser and start drawing.

**Live app:** [excalidraw.com](https://excalidraw.com) · **NPM:** [`@excalidraw/excalidraw`](https://www.npmjs.com/package/@excalidraw/excalidraw) · **License:** MIT

---

## Features

- **Hand-drawn aesthetic** — all shapes rendered with [Rough.js](https://roughjs.com/) for a sketchy, whiteboard feel
- **Real-time collaboration** — multi-user editing with end-to-end encryption (AES-GCM); server never sees your content
- **Rich toolset** — shapes, arrows, text, freehand, frames, images, embeds, laser pointer
- **AI-powered** — Text-to-Diagram via Mermaid syntax, Magic Frame generation
- **Export** — PNG (with hidden scene data), SVG, clipboard, `.excalidraw` JSON
- **Library system** — save and reuse element groups, import from URL
- **PWA / offline** — installable, works offline after first load
- **Embeddable** — `@excalidraw/excalidraw` React component with full TypeScript API
- **50+ languages** — auto-detected via browser locale

---

## Quick Start

```bash
# Requirements: Node.js ≥ 18, Yarn 1.22.x
git clone <repo-url>
cd 2026-fwdays-agentic-large-day01-hw
yarn install
yarn start
# → http://localhost:3001
```

Full setup guide: [docs/technical/dev-setup.md](docs/technical/dev-setup.md)

---

## Key Commands

```bash
yarn start              # Dev server at http://localhost:3001
yarn build:app          # Production build → excalidraw-app/build/
yarn build:packages     # Build all publishable packages
yarn test:app           # Run Vitest unit tests
yarn test:all           # ESLint + Prettier + Vitest
yarn fix:code           # Auto-fix ESLint issues
yarn fix:other          # Auto-format with Prettier
```

---

## Monorepo Structure

```
/
├── excalidraw-app/          # Deployed web application (PWA)
├── packages/
│   ├── excalidraw/          # @excalidraw/excalidraw — core React library
│   ├── element/             # Element types and canvas operations
│   ├── common/              # Shared constants, utilities, event bus
│   ├── math/                # 2D math and vector operations
│   └── utils/               # Miscellaneous utilities
├── examples/                # Integration examples (Next.js, browser script)
├── firebase-project/        # Firebase rules and config
└── docs/                    # Full documentation (see below)
```

---

## Embedding (Library Mode)

```tsx
import { Excalidraw } from "@excalidraw/excalidraw";

export default function App() {
  return (
    <div style={{ height: "100vh" }}>
      <Excalidraw />
    </div>
  );
}
```

> **Next.js:** requires `dynamic(() => import(...), { ssr: false })` — Canvas API is browser-only.

Full API reference: [docs/reference/api-schema.md](docs/reference/api-schema.md)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Language | TypeScript 5.9.3 (strict) |
| UI | React 19.0.0 |
| Build | Vite 5.0.12 |
| State | Jotai 2.11.0 |
| Rendering | Rough.js + HTML Canvas 2D |
| Collaboration | Socket.io-client 4.7.2 + Firebase 11.3.1 |
| Testing | Vitest 3.0.6 + @testing-library/react |

---

## Documentation

| Doc | Description |
|-----|-------------|
| [docs/index.md](docs/index.md) | Full documentation index |
| [docs/technical/architecture.md](docs/technical/architecture.md) | Package layers, data flows, rendering pipeline |
| [docs/technical/dev-setup.md](docs/technical/dev-setup.md) | Local development setup |
| [docs/technical/infrastructure.md](docs/technical/infrastructure.md) | Docker, CI/CD, Vercel, Firebase |
| [docs/product/PRD.md](docs/product/PRD.md) | Product Requirements Document |
| [docs/product/domain-glossary.md](docs/product/domain-glossary.md) | Domain terms (Element, Scene, AppState…) |
| [docs/reference/api-schema.md](docs/reference/api-schema.md) | ExcalidrawProps, ImperativeAPI, types |
| [docs/reference/dependency-map.md](docs/reference/dependency-map.md) | All external dependencies with roles |
| [docs/memory/](docs/memory/) | Memory Bank for AI assistants |

---

## Contributing

```bash
yarn fix:code && yarn fix:other   # format before committing
yarn test:all                     # all checks must pass
```

Pre-commit hooks (Husky + lint-staged) run automatically on staged files.

---

## Self-Hosting

```bash
docker build -t excalidraw .
docker run -p 3000:80 excalidraw
# → http://localhost:3000
```

For full self-hosting (collaboration, fonts, Firebase): [docs/technical/infrastructure.md](docs/technical/infrastructure.md)
